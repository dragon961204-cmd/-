import { createGame } from "./engine.mjs";

const SAVE_KEY = "lotm-tingen-early-v1";
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
  let state = game.newGame();

  const locations = Object.entries(data.locations).map(([id, name]) => [
    id, makeButton(name, () => act({ type: "visit", place: id }))
  ]);
  byId("locations").replaceChildren(...locations.map(([, button]) => button));

  function act(command) {
    const next = game.apply(state, command);
    if (!next) return;
    state = next;
    byId("save-status").textContent = "";
    render(true);
  }

  function render(focus = false) {
    const { day, nextDay, events, result, notes } = game.view(state);
    byId("phase").textContent = `第五紀 ${day.date} · ${day.period} · AP ${state.ap} / ${data.dailyAP}`;
    byId("scene-title").textContent = state.done ? "一週交接" : day.title;
    const lines = [state.done ? "這次廷根行程已結束。" : day.intro, result];
    if (!state.done && state.arrived) {
      lines.push(events[0]?.scene ?? (events.length === 0 ? "這次走訪沒有新事件。" : ""));
    }
    if (state.assignment && !state.done) lines.push("今日差事已結算。");
    byId("body").textContent = lines.filter(Boolean).join("\n\n");
    byId("location").textContent = "目前位置 · " + data.locations[state.place];

    for (const [id, button] of locations) {
      button.disabled = state.done || state.ap === 0;
      button.classList.toggle("here", id === state.place);
      if (id === state.place) button.setAttribute("aria-current", "location");
      else button.removeAttribute("aria-current");
    }

    byId("clues").hidden = notes.length === 0;
    byId("clues").replaceChildren(...notes.map(({ text }) => {
      const li = document.createElement("li");
      li.textContent = text;
      return li;
    }));
    byId("actions").replaceChildren(...events.map(event =>
      makeButton(event.choice, () => act({ type: "choose", id: event.id }))
    ));

    byId("advance").hidden = state.done;
    byId("advance").textContent = nextDay ? `前往${nextDay.period}（${nextDay.date}）` : "結束本次試玩";
    if (focus) byId("scene-title").focus();
  }

  byId("advance").onclick = () => act({ type: "advance" });
  byId("reset").onclick = () => {
    state = game.newGame();
    byId("save-status").textContent = "已重新開始，仍可讀取上次手動存檔。";
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
  byId("load").onclick = () => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved === null) {
        byId("save-status").textContent = "目前沒有存檔。";
        return;
      }
      state = game.load(saved);
      render(true);
      byId("save-status").textContent = "已讀檔。";
    } catch {
      byId("save-status").textContent = "無法讀取存檔，請確認瀏覽器設定與存檔版本。";
    }
  };
  for (const id of ["save", "load", "reset"]) byId(id).disabled = false;
  render();
}

try {
  const response = await fetch("../../events/data/tingen-early.json");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  start(await response.json());
} catch (error) {
  console.error(error);
  byId("scene-title").textContent = "廷根事件載入失敗";
  byId("body").textContent = "請從專案根目錄啟動本機伺服器，並確認事件資料檔存在。";
}
