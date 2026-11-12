export function createGame(data) {
  const { dailyAP, locations, days, events, initialFacts } = data;
  const day = state => days[state.dayIndex];
  const matches = (facts, requires = {}) =>
    Object.entries(requires).every(([key, value]) => facts[key] === value);

  function newGame(character = null) {
    return {
      character,
      dayIndex: 0,
      ap: dailyAP,
      place: data.startPlace ?? "street",
      facts: { ...initialFacts },
      arrived: false,
      assignment: null,
      completed: [],
      done: false,
      history: []
    };
  }

  function localEvents(state) {
    if (state.done || !state.arrived || (state.assignment && !day(state).multiple)) return [];
    return events.filter(event =>
      event.day === day(state).id && event.place === state.place &&
      !state.completed.includes(event.group ?? event.id) &&
      state.ap >= (event.extraAP ?? 0) && matches(state.facts, event.requires)
    );
  }

  function apply(state, command) {
    if (state.done || !command || typeof command !== "object") return null;
    const history = [...state.history, command];
    switch (command.type) {
      case "visit":
        if (state.ap === 0 || !Object.hasOwn(locations, command.place)) return null;
        return { ...state, place: command.place, ap: state.ap - 1, arrived: true, history };
      case "choose": {
        const event = localEvents(state).find(candidate => candidate.id === command.id);
        if (!event) return null;
        return {
          ...state,
          facts: { ...state.facts, ...event.effects },
          arrived: false,
          ap: state.ap - (event.extraAP ?? 0),
          assignment: event.id,
          completed: [...state.completed, event.group ?? event.id],
          history
        };
      }
      case "advance": {
        const settlement = day(state).settlements?.find(rule => matches(state.facts, rule.requires));
        const facts = { ...state.facts, ...settlement?.effects };
        if (state.dayIndex === days.length - 1) {
          return { ...state, facts, arrived: false, done: true, history };
        }
        return {
          ...state,
          dayIndex: state.dayIndex + 1,
          ap: dailyAP,
          facts,
          arrived: false,
          assignment: null,
          history
        };
      }
      default:
        return null;
    }
  }

  function save(state) {
    return JSON.stringify({ version: 1, character: state.character, history: state.history });
  }

  function load(serialized) {
    const record = JSON.parse(serialized);
    const maxCommands = days.length * (dailyAP * 2 + 1);
    if (record?.version !== 1 || !Array.isArray(record.history) || record.history.length > maxCommands) {
      throw new Error("無法讀取這個版本的存檔。");
    }

    let state = newGame(record.character ?? null);
    for (const command of record.history) {
      state = apply(state, command);
      if (!state) throw new Error("存檔含有不符合當時條件的行動。");
    }
    return state;
  }

  function view(state) {
    const currentDay = day(state);
    return {
      day: currentDay,
      nextDay: days[state.dayIndex + 1],
      events: localEvents(state),
      result: events.find(event => event.id === state.assignment)?.result,
      notes: (currentDay.notes ?? []).filter(note => matches(state.facts, note.requires))
    };
  }

  return { newGame, apply, save, load, view };
}
