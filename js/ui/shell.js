/**
 * Main UI shell: skippable <=1.6s intro overlay, cursor spotlight on glass cards,
 * and Stage-1 route rendering across Home, Galaxy, Achievements, Why, and Game views.
 */
(function (root) {
  'use strict';

  var PL = (root.PL = root.PL || {});
  var introDone = false;

  function setupIntro() {
    var introEl = document.getElementById('pl-intro');
    if (!introEl) return;
    var st = PL.store.get();
    if (st.introSeen || PL.quality.isReduced()) {
      introEl.hidden = true;
      introDone = true;
      return;
    }

    introEl.hidden = false;
    var titleEl = introEl.querySelector('[data-intro-title]');
    var subEl = introEl.querySelector('[data-intro-sub]');
    if (titleEl) titleEl.textContent = PL.i18n.t('introTitle');
    if (subEl) subEl.textContent = PL.i18n.t('introSub');

    var closeIntro = function () {
      if (introDone) return;
      introDone = true;
      PL.store.update({ introSeen: true });
      if (root.gsap && !PL.quality.isReduced()) {
        root.gsap.to(introEl, {
          opacity: 0,
          duration: 0.3,
          onComplete: function () {
            introEl.hidden = true;
          },
        });
      } else {
        introEl.hidden = true;
      }
    };

    var skipBtn = introEl.querySelector('#pl-intro-skip');
    if (skipBtn) skipBtn.addEventListener('click', closeIntro);
    introEl.addEventListener('click', closeIntro);
    setTimeout(closeIntro, 1500);
  }

  function renderView(mainEl, route) {
    if (!mainEl) return;
    if (route.name === 'galaxy') {
      mainEl.innerHTML = buildGalaxyView();
    } else if (route.name === 'achievements') {
      mainEl.innerHTML = buildAchievementsView();
    } else if (route.name === 'why') {
      mainEl.innerHTML = buildWhyView();
    } else if (route.name === 'game') {
      mainEl.innerHTML = buildGamePreviewView(route.param);
    } else {
      mainEl.innerHTML = buildHomeView();
    }
    hydrateMain(mainEl, route);
  }

  function buildHomeView() {
    var t = PL.i18n.t;
    var st = PL.store.get();
    var games = (root.PL_DATA && root.PL_DATA.games) || [];
    var ctaText = st.xp > 0 ? t('heroContinue') : t('heroPrimary');

    var cardsHtml = games
      .map(function (g) {
        return (
          '<article class="pl-glass pl-card" data-game-card="' + g.id + '">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem">' +
          '<span class="pl-badge-pill"><i data-lucide="' + g.icon + '" style="width:15px;height:15px"></i>' +
          '<span>' + PL.i18n.pick(g.concept) + '</span></span>' +
          '<span class="pl-num" style="font-size:0.85rem;color:var(--text-muted)">5 ta bosqich</span>' +
          '</div>' +
          '<h3 style="font-size:1.3rem;margin-bottom:0.4rem">' + PL.i18n.pick(g.title) + '</h3>' +
          '<p style="color:var(--text-secondary);font-size:0.98rem;margin:0 0 1rem">' +
          PL.i18n.pick(g.tagline) + '</p>' +
          '<pre class="pl-code-block" style="margin:0 0 1rem">' + g.samplePy + '</pre>' +
          '<button type="button" class="pl-btn pl-btn--glass" data-open-game="' + g.id + '">' +
          '<span>' + t('playNow') + '</span><i data-lucide="arrow-right" style="width:16px;height:16px"></i>' +
          '</button></article>'
        );
      })
      .join('');

    return (
      '<section class="pl-hero">' +
      '<div>' +
      '<span class="pl-eyebrow"><i data-lucide="sparkles" style="width:15px;height:15px"></i><span>' +
      t('heroEyebrow') + '</span></span>' +
      '<h1 class="pl-hero-title pl-title-gradient" id="pl-hero-title">' + t('heroTitle') + '</h1>' +
      '<p class="pl-hero-sub">' + t('heroSub') + '</p>' +
      '<div class="pl-hero-actions">' +
      '<button type="button" class="pl-btn pl-btn--primary" id="pl-start-first">' +
      '<i data-lucide="play" style="width:17px;height:17px"></i><span>' + ctaText + '</span></button>' +
      '<button type="button" class="pl-btn pl-btn--glass" id="pl-open-galaxy">' +
      '<i data-lucide="orbit" style="width:17px;height:17px"></i><span>' + t('heroGalaxyBtn') + '</span></button>' +
      '</div></div>' +
      '<div class="pl-glass pl-orb-stage">' +
      '<div class="pl-core-orb-preview" id="pl-hero-orb"></div>' +
      '<div class="pl-badge-pill">' + t('coreReady') + '</div>' +
      '<p style="color:var(--text-secondary);font-size:0.95rem;margin:0.65rem 0 0">' + t('coreCaption') + '</p>' +
      '</div></section>' +
      '<section id="pl-games-section">' +
      '<div class="pl-section-head"><div>' +
      '<h2 class="pl-section-title pl-title-neon">' + t('gamesHeading') + '</h2>' +
      '<p style="color:var(--text-secondary);margin:0.35rem 0 0">' + t('gamesLead') + '</p>' +
      '</div></div>' +
      '<div class="pl-grid-cards">' + cardsHtml + '</div></section>'
    );
  }

  function buildGalaxyView() {
    var t = PL.i18n.t;
    var items = ((root.PL_DATA && root.PL_DATA.constellations) || [])
      .map(function (c) {
        return (
          '<div class="pl-glass pl-card">' +
          '<h3 style="margin-bottom:0.5rem">' + PL.i18n.pick(c.title) + '</h3>' +
          '<p style="color:var(--text-secondary);margin:0">' + PL.i18n.pick(c.desc) + '</p></div>'
        );
      })
      .join('');
    return (
      '<h1 class="pl-section-title pl-title-gradient">' + t('galaxyHeading') + '</h1>' +
      '<p style="color:var(--text-secondary);margin:0.5rem 0 1.5rem">' + t('galaxyLead') + '</p>' +
      '<div class="pl-grid-cards">' + items + '</div>'
    );
  }

  function buildAchievementsView() {
    var t = PL.i18n.t;
    var st = PL.store.get();
    return (
      '<h1 class="pl-section-title pl-title-gradient">' + t('rewardsHeading') + '</h1>' +
      '<p style="color:var(--text-secondary);margin:0.5rem 0 1.5rem">' + t('rewardsLead') + '</p>' +
      '<div class="pl-glass pl-card"><p class="pl-num" style="margin:0">' +
      st.xp + ' XP · ' + st.streak + ' ' + t('streakLabel') + '</p></div>'
    );
  }

  function buildWhyView() {
    var t = PL.i18n.t;
    var cards = ((root.PL_DATA && root.PL_DATA.principles) || [])
      .map(function (p) {
        return (
          '<article class="pl-glass pl-card">' +
          '<span class="pl-badge-pill" style="margin-bottom:0.75rem"><i data-lucide="' +
          p.icon + '" style="width:15px;height:15px"></i></span>' +
          '<h3 style="margin-bottom:0.4rem">' + PL.i18n.pick(p.title) + '</h3>' +
          '<p style="color:var(--text-secondary);margin:0">' + PL.i18n.pick(p.body) + '</p></article>'
        );
      })
      .join('');
    return (
      '<h1 class="pl-section-title pl-title-gradient">' + t('whyHeading') + '</h1>' +
      '<p style="color:var(--text-secondary);margin:0.5rem 0 1.5rem">' + t('whyLead') + '</p>' +
      '<div class="pl-grid-cards">' + cards + '</div>'
    );
  }

  function buildGamePreviewView(gameId) {
    var games = (root.PL_DATA && root.PL_DATA.games) || [];
    var game = games.find(function (g) {
      return g.id === gameId;
    }) || games[0];
    return (
      '<div class="pl-glass pl-card">' +
      '<span class="pl-badge-pill" style="margin-bottom:0.75rem">' + PL.i18n.pick(game.concept) + '</span>' +
      '<h1 class="pl-section-title pl-title-gradient" style="margin-bottom:0.5rem">' +
      PL.i18n.pick(game.title) + '</h1>' +
      '<p style="color:var(--text-secondary)">' + PL.i18n.pick(game.tagline) + '</p>' +
      '<pre class="pl-code-block" style="margin:1rem 0">' + game.samplePy + '</pre>' +
      '<button type="button" class="pl-btn pl-btn--glass" id="pl-back-home">' +
      PL.i18n.t('backHome') + '</button></div>'
    );
  }

  function hydrateMain(mainEl, route) {
    if (root.lucide && root.lucide.createIcons) {
      root.lucide.createIcons({ nodes: [mainEl] });
    }
    var cards = mainEl.querySelectorAll('.pl-card');
    wireSpotlight(cards);
    PL.fx.cardEntrance(cards);

    var heroTitle = mainEl.querySelector('#pl-hero-title');
    if (heroTitle) PL.fx.textReveal(heroTitle);

    var orbEl = mainEl.querySelector('#pl-hero-orb');
    if (orbEl) PL.fx.orbPulse(orbEl);

    wireRouteButtons(mainEl, route);
  }

  function wireSpotlight(cards) {
    for (var i = 0; i < cards.length; i += 1) {
      PL.fx.cardHoverTilt(cards[i]);
      cards[i].addEventListener('pointermove', function (e) {
        var r = this.getBoundingClientRect();
        this.style.setProperty('--mx', e.clientX - r.left + 'px');
        this.style.setProperty('--my', e.clientY - r.top + 'px');
      });
    }
  }

  function wireRouteButtons(mainEl, route) {
    var startBtn = mainEl.querySelector('#pl-start-first');
    if (startBtn) {
      startBtn.addEventListener('click', function () {
        PL.router.go('game/maze');
      });
    }
    var galaxyBtn = mainEl.querySelector('#pl-open-galaxy');
    if (galaxyBtn) {
      galaxyBtn.addEventListener('click', function () {
        PL.router.go('galaxy');
      });
    }
    var backBtn = mainEl.querySelector('#pl-back-home');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        PL.router.go('home');
      });
    }
    var gameBtns = mainEl.querySelectorAll('[data-open-game]');
    for (var i = 0; i < gameBtns.length; i += 1) {
      gameBtns[i].addEventListener('click', function () {
        PL.router.go('game/' + this.getAttribute('data-open-game'));
      });
    }
    if (route.name === 'home' && route.param === 'games') {
      var target = mainEl.querySelector('#pl-games-section');
      if (target) target.scrollIntoView({ behavior: 'auto' });
    }
  }

  PL.shell = {
    setupIntro: setupIntro,
    renderView: renderView,
  };
})(window);
