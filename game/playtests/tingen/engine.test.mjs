import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createGame } from "./engine.mjs";

const data = JSON.parse(readFileSync(new URL("../../events/data/tingen-early.json", import.meta.url)));
const game = createGame(data);

function apply(state, command) {
  const result = game.apply(state, command);
  assert.ok(result, JSON.stringify(command));
  return result;
}

const visit = (state, place) => apply(state, { type: "visit", place });
const choose = (state, id) => apply(state, { type: "choose", id });
const advance = state => apply(state, { type: "advance" });
const options = state => game.view(state).events.map(event => event.id);
const doAt = (state, place, id) => choose(visit(state, place), id);

test("讀取同一份存檔，留庫和失竊各只開啟正確回訪", () => {
  const warned = doAt(game.newGame(), "office", "report");
  const gate = visit(advance(warned), "office");
  const save = game.save(gate);
  assert.deepEqual(game.load(save), gate);

  const retained = advance(choose(game.load(save), "guard"));
  assert.equal(retained.facts.ashesHolder, "night-watch");
  assert.equal(retained.facts.fakeOrder, "filed");
  const custody = visit(retained, "office");
  assert.deepEqual(options(custody), ["custody"]);
  assert.equal(game.apply(custody, { type: "choose", id: "theft" }), null);
  assert.equal(choose(custody, "custody").facts.custodyLead, true);

  const stolen = advance(choose(game.load(save), "testify"));
  assert.equal(stolen.facts.ashesHolder, "ince");
  assert.equal(stolen.facts.fakeOrder, "none");
  const theft = visit(stolen, "office");
  assert.deepEqual(options(theft), ["theft", "case"]);
  assert.equal(game.apply(theft, { type: "choose", id: "custody" }), null);
  const investigated = choose(theft, "theft");
  assert.equal(investigated.facts.theftLead, true);
  assert.deepEqual(game.load(game.save(investigated)), investigated);
});

test("橋下證人和倉庫接頭依實際到場開放", () => {
  const shelter = advance(doAt(game.newGame(), "bridge", "shelter"));
  const escorted = advance(doAt(shelter, "bridge", "escort"));
  assert.equal(escorted.facts.ashesHolder, "ince");
  assert.deepEqual(options(visit(advance(shelter), "bridge")), []);
  const witness = visit(escorted, "bridge");
  assert.deepEqual(options(witness), ["visit"]);
  assert.equal(choose(witness, "visit").facts.permittedTestimony, true);

  const trade = advance(doAt(game.newGame(), "warehouse", "trade"));
  const oldDoor = visit(advance(trade), "warehouse");
  assert.deepEqual(options(oldDoor), ["check"]);
  const newDoor = visit(advance(doAt(trade, "warehouse", "follow")), "warehouse");
  assert.equal(newDoor.facts.ashesHolder, "ince");
  assert.deepEqual(options(newDoor), ["meeting"]);
  assert.equal(choose(newDoor, "meeting").facts.tradeContact, true);
});

test("零介入及錯過側門只開公開善後，外街疏散另有目擊回訪", () => {
  const before = doAt(game.newGame(), "street", "ignore");
  const crisis = advance(before);
  const uninvolved = advance(doAt(crisis, "street", "leave"));
  const warned = advance(doAt(game.newGame(), "office", "report"));
  const late = advance(visit(warned, "office"));
  for (const after of [uninvolved, late]) {
    assert.equal(after.facts.ashesHolder, "ince");
    assert.equal(after.facts.fakeOrder, "none");
    assert.deepEqual(game.view(after).notes, []);
    for (const place of Object.keys(data.locations)) {
      assert.deepEqual(options(visit(after, place)), place === "street" ? ["public"] : []);
    }
  }
  const sightings = visit(advance(doAt(crisis, "street", "guide")), "street");
  assert.deepEqual(options(sightings), ["sightings", "public"]);
  assert.equal(choose(sightings, "sightings").facts.streetWitness, "confirmed");
});

test("撲空照扣 AP，最後一次走訪仍可接事件，次日恢復 AP", () => {
  let state = advance(game.newGame());
  assert.equal(game.view(state).day.date, "1349-09-09");
  for (let remaining = 4; remaining > 0; remaining--) {
    state = visit(state, "office");
    assert.equal(state.ap, remaining);
    assert.deepEqual(options(state), []);
  }
  assert.equal(game.apply(state, { type: "choose", id: "guard" }), null);
  state = visit(state, "street");
  assert.equal(state.ap, 0);
  assert.equal(game.apply(state, { type: "visit", place: "street" }), null);
  state = choose(state, "guide");
  assert.deepEqual(options(state), []);
  state = advance(state);
  assert.equal(state.ap, 5);
  assert.equal(game.view(state).day.date, "1349-09-16");
  const done = advance(state);
  assert.equal(done.done, true);
  assert.equal(game.apply(done, { type: "advance" }), null);
});

test("讀檔拒絕不符合當期條件的行動", () => {
  const impossible = { version: 1, history: [{ type: "choose", id: "guard" }] };
  assert.throws(() => game.load(JSON.stringify(impossible)), /不符合當時條件/);
});
