/**
 * Application bootstrapper initializing store, quality governor, router,
 * keyboard shortcuts (Ctrl/Cmd+K), dock, header, and shell views.
 */
(function (root) {
  'use strict';

  var PL = (root.PL = root.PL || {});

  function bindGlobalKeys() {
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        PL.modals.openQuickSearch();
      }
    });
  }

  function renderAll(route) {
    var dockEl = document.getElementById('pl-dock');
    var headerEl = document.getElementById('pl-header');
    var mainEl = document.getElementById('pl-main');

    PL.i18n.applyStaticText(document);
    PL.header.render(headerEl);
    PL.dock.render(dockEl);
    PL.dock.syncActive(dockEl, route || PL.router.getCurrent());
    PL.shell.renderView(mainEl, route || PL.router.getCurrent());
  }

  function boot() {
    PL.quality.init();
    PL.fx.registerPlugins();
    PL.router.init();
    PL.shell.setupIntro();
    bindGlobalKeys();

    var dockEl = document.getElementById('pl-dock');
    renderAll(PL.router.getCurrent());

    PL.router.subscribe(function (nextRoute) {
      PL.dock.syncActive(dockEl, nextRoute);
      PL.shell.renderView(document.getElementById('pl-main'), nextRoute);
    });

    PL.store.subscribe(function () {
      renderAll(PL.router.getCurrent());
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
