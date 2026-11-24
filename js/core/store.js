/**
 * Persistent browser progress store wrapped in try/catch localStorage,
 * falling back cleanly to memory when storage is restricted.
 */
(function (root) {
  'use strict';

  var PL = (root.PL = root.PL || {});
  var STORAGE_KEY = 'pl_oyna_organ_v2';
  var listeners = [];

  function defaultState() {
    return {
      script: 'uz-Latn',
      xp: 0,
      streak: 1,
      lastDay: todayStamp(),
      soundEnabled: false,
      introSeen: false,
      stars: {},
      completed: {},
      pythonUnlocked: {},
      badges: {},
    };
  }

  function todayStamp() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function readStorage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      var parsed = JSON.parse(raw);
      return Object.assign(defaultState(), parsed || {});
    } catch (_err) {
      return defaultState();
    }
  }

  function writeStorage(next) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (_err) {
      // Storage disabled or full; memory state keeps running.
    }
  }

  var state = readStorage();

  function notify() {
    for (var i = 0; i < listeners.length; i += 1) {
      try {
        listeners[i](state);
      } catch (_err) {
        // Isolate subscriber errors.
      }
    }
  }

  function update(patchOrFn) {
    var patch = typeof patchOrFn === 'function' ? patchOrFn(state) : patchOrFn;
    state = Object.assign({}, state, patch);
    writeStorage(state);
    notify();
    return state;
  }

  function resetAll() {
    var keepScript = state.script;
    state = Object.assign(defaultState(), { script: keepScript, introSeen: true });
    writeStorage(state);
    notify();
    return state;
  }

  function subscribe(fn) {
    if (typeof fn === 'function') listeners.push(fn);
    return function unsubscribe() {
      listeners = listeners.filter(function (item) {
        return item !== fn;
      });
    };
  }

  PL.store = {
    get: function () {
      return state;
    },
    update: update,
    resetAll: resetAll,
    subscribe: subscribe,
  };
})(window);
