/**
 * Motion and GSAP preset library (PL.fx.*).
 * Safely registers GSAP 3.13+ plugins, honors prefers-reduced-motion via gsap.matchMedia(),
 * and keeps GSAP timelines separate from Motion spring gestures.
 */
(function (root) {
  'use strict';

  var PL = (root.PL = root.PL || {});
  var pluginsReady = false;

  function registerPlugins() {
    if (pluginsReady || !root.gsap) return;
    var list = [
      root.ScrollTrigger,
      root.SplitText,
      root.Flip,
      root.Draggable,
      root.MotionPathPlugin,
      root.DrawSVGPlugin,
    ].filter(Boolean);
    if (list.length) {
      try {
        root.gsap.registerPlugin.apply(root.gsap, list);
      } catch (_err) {
        // Fallback silently if a plugin is unavailable offline.
      }
    }
    pluginsReady = true;
  }

  function reduced() {
    return PL.quality ? PL.quality.isReduced() : false;
  }

  function withMotionSafe(fn) {
    if (reduced() || !root.gsap) return null;
    registerPlugins();
    var mm = root.gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', fn);
    return mm;
  }

  function textReveal(el, opts) {
    if (!el || reduced() || !root.gsap) return;
    registerPlugins();
    var delay = (opts && opts.delay) || 0;
    var run = function () {
      if (root.SplitText) {
        var split = new root.SplitText(el, { type: 'words' });
        root.gsap.from(split.words, {
          y: 18,
          opacity: 0,
          duration: 0.55,
          stagger: 0.045,
          delay: delay,
          ease: 'power3.out',
        });
        return;
      }
      root.gsap.fromTo(
        el,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, delay: delay, ease: 'power3.out' }
      );
    };
    if (document.fonts && document.fonts.ready && document.fonts.status !== 'loaded') {
      document.fonts.ready.then(run);
    } else {
      run();
    }
  }

  function wordPop(el) {
    if (!el || reduced() || !root.gsap) return;
    root.gsap.fromTo(
      el,
      { scale: 0.92, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.36, ease: 'back.out(1.6)' }
    );
  }

  function typewriter(el, fullText, speedMs) {
    if (!el) return;
    var text = String(fullText || '');
    if (reduced()) {
      el.textContent = text;
      return;
    }
    el.textContent = '';
    var idx = 0;
    var timer = setInterval(function () {
      idx += 1;
      el.textContent = text.slice(0, idx);
      if (idx >= text.length) clearInterval(timer);
    }, speedMs || 22);
    return function cancel() {
      clearInterval(timer);
      el.textContent = text;
    };
  }

  function orbPulse(el) {
    if (!el || reduced() || !root.gsap) return;
    return root.gsap.to(el, {
      scale: 1.045,
      opacity: 0.96,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }

  function cardEntrance(nodes) {
    if (!nodes || !nodes.length || reduced() || !root.gsap) return;
    root.gsap.fromTo(
      nodes,
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.48, stagger: 0.06, ease: 'power2.out' }
    );
  }

  function cardHoverTilt(el) {
    if (!el || reduced()) return;
    if (root.Motion && root.Motion.press) {
      root.Motion.press(el, function () {
        root.Motion.animate(el, { scale: 0.985 }, { duration: 0.14 });
        return function () {
          root.Motion.animate(el, { scale: 1 }, { duration: 0.22 });
        };
      });
    }
  }

  function neonGlow(el) {
    if (!el || reduced() || !root.gsap) return;
    root.gsap.fromTo(
      el,
      { opacity: 0.72 },
      { opacity: 1, duration: 0.45, repeat: 1, yoyo: true, ease: 'sine.inOut' }
    );
  }

  function sparkBurst(anchorEl) {
    if (!anchorEl || reduced()) return;
    var rect = anchorEl.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    for (var i = 0; i < 10; i += 1) {
      spawnSpark(cx, cy, (Math.PI * 2 * i) / 10);
    }
  }

  function spawnSpark(x, y, angle) {
    var dot = document.createElement('span');
    dot.style.cssText =
      'position:fixed;left:' + x + 'px;top:' + y +
      'px;width:6px;height:6px;border-radius:50%;background:#38BDF8;pointer-events:none;z-index:80;';
    document.body.appendChild(dot);
    var dist = 34 + Math.random() * 24;
    if (root.gsap) {
      root.gsap.to(dot, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        scale: 0.2,
        duration: 0.55,
        ease: 'power2.out',
        onComplete: function () {
          dot.remove();
        },
      });
    } else {
      setTimeout(function () {
        dot.remove();
      }, 400);
    }
  }

  function progressDraw(svgPath) {
    if (!svgPath || reduced() || !root.gsap) return;
    registerPlugins();
    if (root.DrawSVGPlugin) {
      root.gsap.fromTo(
        svgPath,
        { drawSVG: '0%' },
        { drawSVG: '100%', duration: 0.9, ease: 'power2.out' }
      );
    }
  }

  function dockActive(el) {
    if (!el || reduced() || !root.gsap) return;
    root.gsap.fromTo(
      el,
      { scale: 0.9 },
      { scale: 1, duration: 0.26, ease: 'back.out(2)' }
    );
  }

  function levelWin(stageEl) {
    if (!stageEl || reduced()) return;
    sparkBurst(stageEl);
    wordPop(stageEl);
  }

  function shakeError(el) {
    if (!el || reduced() || !root.gsap) return;
    root.gsap.fromTo(
      el,
      { x: -6 },
      { x: 0, duration: 0.28, ease: 'elastic.out(1, 0.35)' }
    );
  }

  PL.fx = {
    registerPlugins: registerPlugins,
    withMotionSafe: withMotionSafe,
    textReveal: textReveal,
    wordPop: wordPop,
    typewriter: typewriter,
    orbPulse: orbPulse,
    cardEntrance: cardEntrance,
    cardHoverTilt: cardHoverTilt,
    neonGlow: neonGlow,
    sparkBurst: sparkBurst,
    progressDraw: progressDraw,
    dockActive: dockActive,
    levelWin: levelWin,
    shakeError: shakeError,
  };
})(window);
