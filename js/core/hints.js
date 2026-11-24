/**
 * Three-step Spark hint ladder core engine (nudge -> pinpoint -> rule),
 * shared across all programming games starting in Stage 3.
 */
(function (root) {
  'use strict';

  var PL = (root.PL = root.PL || {});

  function createSession(levelHints) {
    var step = 0;
    var list = Array.isArray(levelHints) ? levelHints : [];
    return {
      total: list.length,
      used: function () {
        return step;
      },
      next: function () {
        if (step >= list.length) return null;
        var item = list[step];
        step += 1;
        return { step: step, text: PL.i18n ? PL.i18n.pick(item) : item };
      },
      reset: function () {
        step = 0;
      },
    };
  }

  PL.hints = {
    createSession: createSession,
  };
})(window);
