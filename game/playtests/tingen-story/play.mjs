import { createGame } from "../tingen/engine.mjs";

const SAVE_KEY = "lotm-tingen-story-v1";
const byId = id => document.getElementById(id);

function makeButton(label, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", action);
  return button;
}

function start(data) {
  const game = createGame(data);
  let state = null;

  function act(command) {
    const next = game.apply(state, command);
    if (!next) return;
    state = next;
    byId("save-status").textContent = "";
    render(true);
  }

  function render(focus = false) {
    byId("creation").hidden = Boolean(state);
    byId("game").hidden = !state;
    if (!state) {
      if (focus) byId("character-name").focus();
      return;
    }

    const { day, nextDay, events, result, notes } = game.view(state);
    byId("phase").textContent = `${state.character.name} · ${day.period} · ${day.date} · AP ${state.ap} / ${data.dailyAP}`;
    byId("scene-title").textContent = state.done ? "廷根篇交接" : day.title;
    const localScenes = [...new Set(events.map(event => event.scene).filter(Boolean))];
    const body = [state.done ? "這一段廷根行程已結束。" : day.intro, ...localScenes];
    if (!state.done && state.arrived && events.length === 0) {
      body.push("這次走訪沒有新事件。");
    }
    byId("body").textContent = body.join("\n\n");
    byId("result").textContent = result ?? "";
    byId("result").hidden = !result;
    byId("location").textContent = "目前位置 · " + data.locations[state.place];

    const stops = new Set(["home", state.place]);
    for (const event of data.events) {
      if (event.day === day.id) stops.add(event.place);
    }
    byId("locations").replaceChildren(...[...stops].map(id => {
      const button = makeButton(data.locations[id], () => act({ type: "visit", place: id }));
      button.disabled = state.done || state.ap === 0;
      if (id === state.place) {
        button.classList.add("here");
        button.setAttribute("aria-current", "location");
      }
      return button;
    }));

    byId("clues").hidden = notes.length === 0;
    byId("clues").replaceChildren(...notes.map(({ text }) => {
      const li = document.createElement("li");
      li.textContent = text;
      return li;
    }));
    byId("actions").replaceChildren(...events.map(event => {
      const label = event.extraAP ? `${event.choice}（再花 ${event.extraAP} AP）` : event.choice;
      return makeButton(label, () => act({ type: "choose", id: event.id }));
    }));

    byId("advance").hidden = state.done;
    byId("advance").textContent = nextDay
      ? `推進到 ${nextDay.date} · ${nextDay.title}`
      : "結束廷根篇試玩";
    if (focus) byId("scene-title").focus();
  }

  byId("character-form").onsubmit = event => {
    event.preventDefault();
    const name = byId("character-name").value.trim();
    const age = byId("character-age").valueAsNumber;
    if (!name || !Number.isSafeInteger(age) || age < 1) {
      byId("creation-status").textContent = "請輸入姓名和正整數年齡。";
      return;
    }
    state = game.newGame({ name, age });
    byId("save-status").textContent = "";
    render(true);
  };
  byId("advance").onclick = () => act({ type: "advance" });
  byId("reset").onclick = () => {
    state = null;
    byId("creation-status").textContent = "已回到創角。你也可以讀取上次手動存檔。";
    render(true);
  };
  byId("save").onclick = () => {
    try {
      localStorage.setItem(SAVE_KEY, game.save(state));
      byId("save-status").textContent = "已存檔。";
    } catch {
      byId("save-status").textContent = "瀏覽器目前無法儲存存檔。";
    }
  };
  function load() {
    const status = byId(state ? "save-status" : "creation-status");
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved === null) {
        status.textContent = "目前沒有存檔。";
        return;
      }
      const restored = game.load(saved);
      if (typeof restored.character?.name !== "string" || !Number.isSafeInteger(restored.character.age)) {
        throw new Error("存檔缺少角色資料。");
      }
      state = restored;
      render(true);
      byId("save-status").textContent = "已讀檔。";
    } catch {
      status.textContent = "無法讀取存檔。";
    }
  }
  byId("continue").onclick = load;
  byId("load").onclick = load;
  for (const id of ["save", "load", "reset", "create-character", "continue"]) byId(id).disabled = false;
  render();
}

try {
  const response = await fetch("../../events/data/tingen-story.json");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  start(await response.json());
} catch (error) {
  console.error(error);
  byId("creation-status").textContent = "廷根劇情載入失敗。請重新整理後再試。";
}
