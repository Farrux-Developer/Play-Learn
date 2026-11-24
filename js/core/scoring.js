/**
 * Par-based 1-3 star scoring and XP reward calculator.
 */
(function (root) {
  'use strict';

  var PL = (root.PL = root.PL || {});

  function calculateStars(stepsUsed, parSteps, hintsUsed) {
    var cleanPar = Math.max(1, Number(parSteps) || 1);
    var used = Math.max(1, Number(stepsUsed) || 1);
    var hints = Number(hintsUsed) || 0;
    if (used <= cleanPar && hints === 0) return 3;
    if (used <= cleanPar + 2 && hints <= 1) return 2;
    return 1;
  }

  function calculateXp(stars, isFirstClear) {
    var base = stars === 3 ? 45 : stars === 2 ? 30 : 20;
    return isFirstClear ? base + 15 : Math.round(base * 0.4);
  }

  PL.scoring = {
    calculateStars: calculateStars,
    calculateXp: calculateXp,
  };
})(window);
