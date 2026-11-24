/**
 * Automatic FPS quality governor, reduced-motion listener,
 * document visibility guard, and IntersectionObserver loop pausing.
 */
(function (root) {
  'use strict';

  var PL = (root.PL = root.PL || {});
  var tier = 'full';
  var lowFrames = 0;
  var lastTime = 0;
  var rafId = 0;
  var listeners = [];
  var visibilityCallbacks = new WeakMap();

  var reducedQuery =
    root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)');

  function isReduced() {
    return Boolean(reducedQuery && reducedQuery.matches);
  }

  function applyTierClass(nextTier) {
    var html = document.documentElement;
    html.classList.remove('pl-quality-full', 'pl-quality-lite', 'pl-quality-minimal');
    html.classList.add('pl-quality-' + nextTier);
  }

  function setTier(nextTier) {
    if (tier === nextTier) return;
    tier = nextTier;
    applyTierClass(tier);
    for (var i = 0; i < listeners.length; i += 1) {
      listeners[i](tier, isReduced());
    }
  }

  function sampleFrame(now) {
    if (document.hidden || isReduced()) {
      lastTime = now;
      rafId = requestAnimationFrame(sampleFrame);
      return;
    }
    if (lastTime > 0) {
      var dt = now - lastTime;
      if (dt > 29) {
        lowFrames += 1;
      } else {
        lowFrames = Math.max(0, lowFrames - 1);
      }
      if (lowFrames > 42 && tier === 'full') setTier('lite');
      if (lowFrames > 78 && dt > 30) setTier('minimal');
    }
    lastTime = now;
    rafId = requestAnimationFrame(sampleFrame);
  }

  var observer =
    typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(
          function (entries) {
            for (var i = 0; i < entries.length; i += 1) {
              var cb = visibilityCallbacks.get(entries[i].target);
              if (cb) cb(entries[i].isIntersecting && !document.hidden);
            }
          },
          { threshold: 0.05 }
        )
      : null;

  function observeVisible(el, onToggle) {
    if (!el || typeof onToggle !== 'function') return function () {};
    if (!observer) {
      onToggle(true);
      return function () {};
    }
    visibilityCallbacks.set(el, onToggle);
    observer.observe(el);
    return function unobserve() {
      observer.unobserve(el);
      visibilityCallbacks.delete(el);
    };
  }

  function init() {
    applyTierClass(isReduced() ? 'minimal' : 'full');
    if (isReduced()) tier = 'minimal';
    if (reducedQuery && reducedQuery.addEventListener) {
      reducedQuery.addEventListener('change', function () {
        setTier(isReduced() ? 'minimal' : 'full');
      });
    }
    document.addEventListener('visibilitychange', function () {
      for (var i = 0; i < listeners.length; i += 1) {
        listeners[i](tier, isReduced(), document.hidden);
      }
    });
    if (!rafId) rafId = requestAnimationFrame(sampleFrame);
  }

  PL.quality = {
    init: init,
    getTier: function () {
      return tier;
    },
    isReduced: isReduced,
    observeVisible: observeVisible,
    subscribe: function (fn) {
      if (typeof fn === 'function') listeners.push(fn);
    },
  };
})(window);
