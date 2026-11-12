import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createGame } from "../tingen/engine.mjs";

const data = JSON.parse(readFileSync(new URL("../../events/data/tingen-story.json", import.meta.url)));
const game = createGame(data);
const character = { name: "河岸工人", age: 22 };

function apply(state, command) {
  const next = game.apply(state, command);
  assert.ok(next, JSON.stringify(command));
  return next;
}

const options = state => game.view(state).events.map(event => event.id);
const visit = (state, place) => apply(state, { type: "visit", place });
const choose = (state, id) => apply(state, { type: "choose", id });
const doAt = (state, place, id) => choose(visit(state, place), id);

function reach(state, day) {
  while (game.view(state).day.id !== day) {
    assert.ok(game.view(state).nextDay, day);
    state = apply(state, { type: "advance" });
  }
  return state;
}

test("從創角開場到倉庫，煤市選擇改變欠條入口，兩條線共用運單", () => {
  const start = game.newGame(character);
  assert.equal(start.place, "home");
  assert.equal(game.view(start).day.title, "半袋煤");
  const invited = reach(doAt(start, "market", "weigh"), "debt");
  const work = reach(doAt(start, "market", "take"), "debt");
  assert.deepEqual(options(visit(invited, "works")), []);
  assert.deepEqual(options(visit(work, "home")), []);
  let state = doAt(invited, "home", "copy-debt");
  state = reach(state, "ed");
  state = doAt(state, "shed", "river-rescue");
  assert.equal(state.ap, 3);
  assert.equal(state.facts.ed, "safe");
  state = reach(state, "return");
  state = doAt(state, "club", "postmarks");
  state = doAt(state, "paper", "carry-letter");
  state = reach(state, "cargo");
  state = doAt(state, "river", "copy-waybill");
  state = doAt(state, "office", "alert-warehouse");
  state = doAt(state, "paper", "alert-society");
  state = reach(state, "warehouse");
  assert.equal(game.view(state).notes.length, 2);
  state = doAt(state, "warehouse", "take-driver");
  state = reach(state, "hospital");
  assert.equal(state.facts.notebookCaseResolved, true);
  assert.deepEqual(options(visit(state, "asylum")), ["driver-record"]);
});

test("從第一天存讀檔，只有實際核對的證詞可以打開側門分歧", () => {
  let state = game.newGame(character);
  state = doAt(state, "market", "weigh");
  state = reach(state, "hospital");
  state = doAt(state, "asylum", "compare-shifts");
  state = reach(state, "fund");
  state = doAt(state, "club", "compare-fundraiser");
  state = reach(state, "before");
  state = doAt(state, "office", "report");
  state = reach(state, "crisis");
  const save = game.save(visit(state, "office"));
  assert.deepEqual(game.load(save).character, character);
  for (const [choice, holder, followups] of [
    ["guard", "night-watch", ["custody"]],
    ["testify", "ince", ["theft", "case"]]
  ]) {
    const after = reach(choose(game.load(save), choice), "after");
    assert.equal(after.facts.ashesHolder, holder);
    assert.deepEqual(options(visit(after, "office")), followups);
  }
});

test("零介入仍按主線推進，案情與回訪依玩家知情呈現", () => {
  let state = reach(game.newGame(character), "before");
  assert.deepEqual(options(visit(state, "office")), []);
  state = reach(state, "after");
  for (const flag of ["notebookCaseResolved", "hoodCaseResolved", "neilCaseResolved", "sharonCaseResolved"]) {
    assert.equal(state.facts[flag], true);
  }
  assert.equal(state.facts.ashesHolder, "ince");
  assert.equal(state.facts.ed, "moved");
  assert.deepEqual(game.view(state).notes, []);
  assert.deepEqual(options(visit(state, "office")), []);
  assert.deepEqual(options(visit(state, "street")), ["public"]);
});
