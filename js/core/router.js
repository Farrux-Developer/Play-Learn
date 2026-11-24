/**
 * Hash-based client SPA router working seamlessly on file:// and http://.
 * Routes: home, galaxy, game/:id, achievements, why.
 */
(function (root) {
  'use strict';

  var PL = (root.PL = root.PL || {});
  var current = { name: 'home', param: null };
  var listeners = [];

  function parseHash(rawHash) {
    var clean = String(rawHash || '#/home').replace(/^#\/?/, '');
    var parts = clean.split('/').filter(Boolean);
    if (!parts.length) return { name: 'home', param: null };
    if (parts[0] === 'game' && parts[1]) {
      return { name: 'game', param: parts[1] };
    }
    if (parts[0] === 'games') return { name: 'home', param: 'games' };
    var allowed = ['home', 'galaxy', 'achievements', 'why'];
    if (allowed.indexOf(parts[0]) !== -1) {
      return { name: parts[0], param: parts[1] || null };
    }
    return { name: 'home', param: null };
  }

  function notify() {
    for (var i = 0; i < listeners.length; i += 1) {
      listeners[i](current);
    }
  }

  function go(path) {
    var nextHash = path.charAt(0) === '#' ? path : '#/' + path.replace(/^\//, '');
    if (root.location.hash === nextHash) {
      current = parseHash(nextHash);
      notify();
      return;
    }
    root.location.hash = nextHash;
  }

  function init() {
    current = parseHash(root.location.hash);
    root.addEventListener('hashchange', function () {
      current = parseHash(root.location.hash);
      notify();
      root.scrollTo({ top: 0, behavior: 'auto' });
    });
  }

  PL.router = {
    init: init,
    go: go,
    getCurrent: function () {
      return current;
    },
    subscribe: function (fn) {
      if (typeof fn === 'function') listeners.push(fn);
    },
  };
})(window);
