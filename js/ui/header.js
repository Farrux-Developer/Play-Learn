/**
 * Sticky glass top header: brand logo with 3s long-press progress reset ring,
 * 40px header mini-orb slot, Ctrl/Cmd+K quick search, Oz/Uz script toggle,
 * XP & streak counter, and audio mute toggle (default OFF).
 */
(function (root) {
  'use strict';

  var PL = (root.PL = root.PL || {});
  var holdTimer = 0;
  var holdFrame = 0;

  function render(headerEl) {
    if (!headerEl) return;
    var st = PL.store.get();
    var t = PL.i18n.t;
    var isCyrl = st.script === 'uz-Cyrl';

    headerEl.innerHTML =
      '<div class="pl-header-left">' +
      '<button type="button" class="pl-brand-btn" id="pl-logo-btn" title="' + t('holdHint') + '">' +
      '<span class="pl-mini-orb-slot" id="pl-header-orb">' +
      '<svg class="pl-reset-ring" viewBox="0 0 48 48" aria-hidden="true">' +
      '<circle id="pl-reset-circle" cx="24" cy="24" r="22"></circle></svg></span>' +
      '<span class="pl-brand-title">' + t('brandName') + '</span>' +
      '</button>' +
      '<button type="button" class="pl-search-pill" id="pl-cmd-trigger">' +
      '<i data-lucide="search" style="width:16px;height:16px"></i>' +
      '<span class="pl-search-label">' + t('searchPlaceholder') + '</span>' +
      '<span class="pl-kbd">Ctrl+K</span>' +
      '</button></div>' +
      '<div class="pl-header-right">' +
      '<div class="pl-script-pill" role="group" aria-label="Yozuv">' +
      '<button type="button" class="pl-script-btn" data-script="uz-Latn" aria-pressed="' + (!isCyrl) + '">Oʻz</button>' +
      '<button type="button" class="pl-script-btn" data-script="uz-Cyrl" aria-pressed="' + isCyrl + '">Ўз</button>' +
      '</div>' +
      '<div class="pl-stat-pill pl-num">' +
      '<i data-lucide="flame" style="width:16px;height:16px;color:var(--amber)"></i>' +
      '<span>' + st.streak + ' ' + t('streakLabel') + '</span>' +
      '<span style="opacity:0.35">·</span>' +
      '<span style="color:var(--cyan-bright)">' + st.xp + ' ' + t('xpLabel') + '</span>' +
      '</div>' +
      '<button type="button" class="pl-icon-btn" id="pl-sound-btn" aria-pressed="' + st.soundEnabled +
      '" aria-label="' + (st.soundEnabled ? t('soundOn') : t('soundOff')) + '">' +
      '<i data-lucide="' + (st.soundEnabled ? 'volume-2' : 'volume-x') + '" style="width:18px;height:18px"></i>' +
      '</button></div>';

    wireEvents(headerEl);
    if (root.lucide && root.lucide.createIcons) {
      root.lucide.createIcons({ nodes: [headerEl] });
    }
  }

  function wireEvents(headerEl) {
    var logoBtn = headerEl.querySelector('#pl-logo-btn');
    var circle = headerEl.querySelector('#pl-reset-circle');
    wireLongPressReset(logoBtn, circle);

    var cmdBtn = headerEl.querySelector('#pl-cmd-trigger');
    if (cmdBtn) cmdBtn.addEventListener('click', PL.modals.openQuickSearch);

    var scriptBtns = headerEl.querySelectorAll('[data-script]');
    for (var i = 0; i < scriptBtns.length; i += 1) {
      scriptBtns[i].addEventListener('click', function () {
        PL.store.update({ script: this.getAttribute('data-script') });
      });
    }

    var soundBtn = headerEl.querySelector('#pl-sound-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', function () {
        var cur = PL.store.get().soundEnabled;
        PL.store.update({ soundEnabled: !cur });
      });
    }
  }

  function wireLongPressReset(btn, circle) {
    if (!btn) return;
    var startAt = 0;

    function cancelHold() {
      clearTimeout(holdTimer);
      cancelAnimationFrame(holdFrame);
      if (circle) circle.style.strokeDashoffset = '138';
    }

    function tickRing() {
      var elapsed = Math.min(3000, performance.now() - startAt);
      if (circle) circle.style.strokeDashoffset = String(138 * (1 - elapsed / 3000));
      if (elapsed < 3000) holdFrame = requestAnimationFrame(tickRing);
    }

    btn.addEventListener('pointerdown', function () {
      startAt = performance.now();
      holdFrame = requestAnimationFrame(tickRing);
      holdTimer = setTimeout(function () {
        cancelHold();
        PL.modals.openConfirmReset();
      }, 3000);
    });
    btn.addEventListener('pointerup', cancelHold);
    btn.addEventListener('pointerleave', cancelHold);
    btn.addEventListener('pointercancel', cancelHold);
    btn.addEventListener('click', function () {
      PL.router.go('home');
    });
  }

  PL.header = {
    render: render,
  };
})(window);
