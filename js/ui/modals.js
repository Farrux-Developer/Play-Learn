/**
 * Accessible modal dialog manager, toast notifications,
 * and 3-second logo long-press reset confirmation.
 */
(function (root) {
  'use strict';

  var PL = (root.PL = root.PL || {});
  var releaseTrap = null;
  var backdropEl = null;

  function ensureBackdrop() {
    if (backdropEl) return backdropEl;
    backdropEl = document.getElementById('pl-modal-backdrop');
    if (!backdropEl) {
      backdropEl = document.createElement('div');
      backdropEl.id = 'pl-modal-backdrop';
      backdropEl.className = 'pl-modal-backdrop';
      backdropEl.hidden = true;
      backdropEl.innerHTML = '<div class="pl-modal" role="dialog" aria-modal="true"></div>';
      document.body.appendChild(backdropEl);
    }
    backdropEl.addEventListener('click', function (e) {
      if (e.target === backdropEl) close();
    });
    return backdropEl;
  }

  function close() {
    if (!backdropEl) return;
    backdropEl.hidden = true;
    if (releaseTrap) {
      releaseTrap();
      releaseTrap = null;
    }
  }

  function openConfirmReset() {
    var bd = ensureBackdrop();
    var box = bd.querySelector('.pl-modal');
    var t = PL.i18n.t;
    box.innerHTML =
      '<h2 style="font-size:1.35rem;margin-bottom:0.5rem">' + t('resetTitle') + '</h2>' +
      '<p style="color:var(--text-secondary);margin:0">' + t('resetBody') + '</p>' +
      '<div class="pl-modal-actions">' +
      '<button type="button" class="pl-btn pl-btn--glass" data-action="cancel">' +
      t('resetCancel') + '</button>' +
      '<button type="button" class="pl-btn pl-btn--danger" data-action="confirm">' +
      t('resetConfirm') + '</button>' +
      '</div>';
    bd.hidden = false;
    box.querySelector('[data-action="cancel"]').onclick = close;
    box.querySelector('[data-action="confirm"]').onclick = function () {
      PL.store.resetAll();
      close();
      toast(t('resetDone'));
    };
    releaseTrap = PL.a11y.trapFocus(box, close);
  }

  function openQuickSearch() {
    var bd = ensureBackdrop();
    var box = bd.querySelector('.pl-modal');
    var t = PL.i18n.t;
    var games = (root.PL_DATA && root.PL_DATA.games) || [];
    var itemsHtml = games
      .map(function (g) {
        return (
          '<button type="button" class="pl-btn pl-btn--glass" style="width:100%;justify-content:space-between;margin-top:0.5rem" data-go-game="' +
          g.id + '">' +
          '<span>' + PL.i18n.pick(g.title) + '</span>' +
          '<span style="color:var(--text-muted);font-size:0.85rem">' +
          PL.i18n.pick(g.concept) + '</span></button>'
        );
      })
      .join('');
    box.innerHTML =
      '<input id="pl-quick-input" type="search" placeholder="' + t('searchPlaceholder') +
      '" style="width:100%;padding:0.75rem 1rem;border-radius:0.75rem;border:1px solid var(--border-glass-strong);background:var(--bg-code);color:var(--text-primary)" />' +
      '<div id="pl-quick-list" style="margin-top:0.75rem">' + itemsHtml + '</div>';
    bd.hidden = false;
    wireQuickSearchFilter(box);
    releaseTrap = PL.a11y.trapFocus(box, close);
    var inp = document.getElementById('pl-quick-input');
    if (inp) inp.focus();
  }

  function wireQuickSearchFilter(box) {
    var inp = box.querySelector('#pl-quick-input');
    var btns = box.querySelectorAll('[data-go-game]');
    for (var i = 0; i < btns.length; i += 1) {
      btns[i].addEventListener('click', function () {
        var id = this.getAttribute('data-go-game');
        close();
        PL.router.go('game/' + id);
      });
    }
    if (!inp) return;
    inp.addEventListener('input', function () {
      var q = PL.i18n.normalizeSearch(inp.value);
      for (var j = 0; j < btns.length; j += 1) {
        var txt = PL.i18n.normalizeSearch(btns[j].textContent);
        btns[j].style.display = !q || txt.indexOf(q) !== -1 ? 'flex' : 'none';
      }
    });
  }

  function toast(msg) {
    var stack = document.getElementById('pl-toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.id = 'pl-toast-stack';
      stack.className = 'pl-toast-stack';
      document.body.appendChild(stack);
    }
    var item = document.createElement('div');
    item.className = 'pl-toast';
    item.textContent = msg;
    stack.appendChild(item);
    PL.a11y.announce(msg);
    setTimeout(function () {
      item.remove();
    }, 2800);
  }

  PL.modals = {
    openConfirmReset: openConfirmReset,
    openQuickSearch: openQuickSearch,
    close: close,
    toast: toast,
  };
})(window);
