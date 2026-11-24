/**
 * Accessibility utilities: live announcements, focus trap for modals,
 * and keyboard escape / roving focus helpers.
 */
(function (root) {
  'use strict';

  var PL = (root.PL = root.PL || {});
  var liveEl = null;

  function ensureLiveRegion() {
    if (liveEl) return liveEl;
    liveEl = document.getElementById('pl-live-region');
    if (!liveEl) {
      liveEl = document.createElement('div');
      liveEl.id = 'pl-live-region';
      liveEl.className = 'pl-sr-only';
      liveEl.setAttribute('aria-live', 'polite');
      liveEl.setAttribute('aria-atomic', 'true');
      document.body.appendChild(liveEl);
    }
    return liveEl;
  }

  function announce(msg) {
    var node = ensureLiveRegion();
    node.textContent = '';
    setTimeout(function () {
      node.textContent = String(msg || '');
    }, 24);
  }

  function getFocusable(container) {
    if (!container) return [];
    return Array.prototype.slice.call(
      container.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  function trapFocus(container, onEscape) {
    var prevFocus = document.activeElement;
    var items = getFocusable(container);
    if (items[0]) items[0].focus();

    function onKeyDown(e) {
      if (e.key === 'Escape' && typeof onEscape === 'function') {
        e.preventDefault();
        onEscape();
        return;
      }
      if (e.key !== 'Tab') return;
      var list = getFocusable(container);
      if (!list.length) return;
      var first = list[0];
      var last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return function release() {
      document.removeEventListener('keydown', onKeyDown);
      if (prevFocus && typeof prevFocus.focus === 'function') {
        prevFocus.focus();
      }
    };
  }

  PL.a11y = {
    announce: announce,
    trapFocus: trapFocus,
  };
})(window);
