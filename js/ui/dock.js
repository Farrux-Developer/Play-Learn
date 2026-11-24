/**
 * Left 56px desktop icon dock (bottom bar on mobile),
 * synced with PL.router and localized tooltips.
 */
(function (root) {
  'use strict';

  var PL = (root.PL = root.PL || {});

  var ITEMS = [
    { id: 'home', route: 'home', icon: 'home', labelKey: 'dockHome' },
    { id: 'galaxy', route: 'galaxy', icon: 'sparkles', labelKey: 'dockGalaxy' },
    { id: 'games', route: 'games', icon: 'gamepad-2', labelKey: 'dockGames' },
    { id: 'achievements', route: 'achievements', icon: 'award', labelKey: 'dockRewards' },
    { id: 'why', route: 'why', icon: 'lightbulb', labelKey: 'dockWhy' },
  ];

  function render(dockEl) {
    if (!dockEl) return;
    var navHtml = ITEMS.map(function (item) {
      var label = PL.i18n.t(item.labelKey);
      return (
        '<button type="button" class="pl-dock-btn" data-dock-route="' +
        item.route + '" aria-label="' + label + '">' +
        '<i data-lucide="' + item.icon + '"></i>' +
        '<span class="pl-dock-tooltip">' + label + '</span>' +
        '</button>'
      );
    }).join('');

    dockEl.innerHTML = '<nav class="pl-dock-nav" aria-label="Asosiy menyu">' + navHtml + '</nav>';
    var btns = dockEl.querySelectorAll('[data-dock-route]');
    for (var i = 0; i < btns.length; i += 1) {
      btns[i].addEventListener('click', function () {
        var r = this.getAttribute('data-dock-route');
        PL.router.go(r);
      });
    }
    if (root.lucide && root.lucide.createIcons) {
      root.lucide.createIcons({ nodes: [dockEl] });
    }
    syncActive(dockEl, PL.router.getCurrent());
  }

  function syncActive(dockEl, route) {
    if (!dockEl) return;
    var activeKey = route.name === 'game' ? 'games' : route.name;
    if (route.name === 'home' && route.param === 'games') activeKey = 'games';
    var btns = dockEl.querySelectorAll('[data-dock-route]');
    for (var i = 0; i < btns.length; i += 1) {
      var isCurrent = btns[i].getAttribute('data-dock-route') === activeKey;
      btns[i].setAttribute('aria-current', isCurrent ? 'page' : 'false');
      if (isCurrent) PL.fx.dockActive(btns[i]);
    }
  }

  PL.dock = {
    render: render,
    syncActive: syncActive,
  };
})(window);
