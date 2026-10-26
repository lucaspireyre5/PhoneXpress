/* V17 — a slow, peripheral electric trace; no flashes or random frame jitter. */
(() => {
  'use strict';

  function init() {
    if (document.querySelector('.px-lightning')) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'px-lightning';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('role', 'presentation');
    canvas.style.pointerEvents = 'none';
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;
    document.body.appendChild(canvas);

    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const travelMs = 8000;
    const cycleMs = travelMs + 5000;
    const tailLength = .29;
    let width = 1, height = 1, mobile = false, frameDelay = 1000 / 24;
    let raf = 0, timer = 0, resizeRaf = 0, running = false;
    let epoch = 0, elapsedAtPause = 0, routeCycle = -1, route = null;

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    function smoothstep(min, max, value) {
      const x = clamp((value - min) / (max - min), 0, 1);
      return x * x * (3 - 2 * x);
    }
    function randomFor(seed) {
      let state = seed >>> 0;
      return () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 4294967296;
      };
    }
    function buildRoute(cycle) {
      const random = randomFor(7309 + cycle * 127);
      const left = cycle % 2 === 0;
      const edgeLimit = Math.min(width * .19, 220);
      const margin = mobile ? 13 : 24;
      const amplitude = Math.min(width * .055, 58);
      const points = [];
      for (let i = 0; i <= 23; i++) {
        const t = i / 23;
        const organic = Math.sin(t * Math.PI * 2.6 + cycle * .9) * amplitude;
        const jagged = (random() - .5) * (mobile ? 24 : 43);
        const edgeX = clamp(margin + amplitude + organic + jagged, margin, edgeLimit);
        points.push({ x: left ? edgeX : width - edgeX, y: -25 + t * (height + 50) });
      }
      let length = 0;
      points[0].t = 0;
      for (let i = 1; i < points.length; i++) {
        length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
        points[i].t = length;
      }
      points.forEach(point => { point.t /= length; });
      const branches = [4, 8, 13, 18].map(index => {
        const root = points[index];
        const direction = left ? 1 : -1;
        const reach = Math.min(width * .075, 83) * (.5 + random() * .5);
        return {
          t: root.t,
          points: [
            root,
            { x: root.x + direction * reach * .52, y: root.y + 13 + random() * 12 },
            { x: root.x + direction * reach * .41, y: root.y + 27 + random() * 15 },
            { x: root.x + direction * reach, y: root.y + 44 + random() * 15 }
          ]
        };
      });
      routeCycle = cycle;
      return { points, branches };
    }

    function resize() {
      width = Math.max(1, document.documentElement.clientWidth);
      height = Math.max(1, innerHeight);
      mobile = width <= 650;
      frameDelay = 1000 / (mobile ? 16 : 24);
      const dpr = mobile ? 1 : Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.ceil(width * dpr);
      canvas.height = Math.ceil(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      routeCycle = -1;
    }
    function segment(a, b, alpha, branch) {
      if (alpha < .005) return;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(40, 163, 255, .6)';
      ctx.shadowBlur = branch ? 7 : 13;
      ctx.lineWidth = branch ? 2 : 4;
      ctx.strokeStyle = `rgba(42, 161, 255, ${alpha * .23})`;
      ctx.stroke();
      ctx.shadowBlur = 3;
      ctx.lineWidth = branch ? .6 : 1.05;
      ctx.strokeStyle = `rgba(126, 225, 255, ${alpha * .66})`;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    const interpolate = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

    function paint(cycle, phase) {
      ctx.clearRect(0, 0, width, height);
      if (phase >= travelMs) return;
      if (!route || cycle !== routeCycle) route = buildRoute(cycle);
      const progress = phase / travelMs;
      const head = -.06 + progress * 1.4;
      const envelope = smoothstep(0, .12, progress) * (1 - smoothstep(.82, 1, progress));
      const strengthAt = t => {
        const distance = head - t;
        if (distance < 0 || distance > tailLength) return 0;
        return smoothstep(0, .022, distance) * (1 - smoothstep(.045, tailLength, distance)) * envelope;
      };
      const points = route.points;
      route.branches.forEach(branch => {
        const alpha = strengthAt(branch.t) * .5;
        for (let i = 1; i < branch.points.length; i++) {
          segment(branch.points[i - 1], branch.points[i], alpha * (1 - i * .17), true);
        }
      });
      let headPoint = null;
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1], b = points[i];
        if (head >= a.t && head <= b.t) headPoint = interpolate(a, b, (head - a.t) / (b.t - a.t));
        const start = Math.max(a.t, head - tailLength);
        const end = Math.min(b.t, head);
        if (end <= start) continue;
        const from = interpolate(a, b, (start - a.t) / (b.t - a.t));
        const to = interpolate(a, b, (end - a.t) / (b.t - a.t));
        segment(from, to, strengthAt((start + end) / 2), false);
      }
      if (headPoint && envelope > 0) {
        const glow = ctx.createRadialGradient(headPoint.x, headPoint.y, 0, headPoint.x, headPoint.y, 8);
        glow.addColorStop(0, `rgba(126, 224, 255, ${envelope * .3})`);
        glow.addColorStop(.2, `rgba(51, 182, 255, ${envelope * .13})`);
        glow.addColorStop(1, 'rgba(30, 130, 240, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(headPoint.x - 8, headPoint.y - 8, 16, 16);
      }
    }

    function schedule(delay) {
      timer = setTimeout(() => {
        timer = 0;
        if (running) raf = requestAnimationFrame(tick);
      }, delay);
    }
    function tick(now) {
      raf = 0;
      if (!running) return;
      const elapsed = Math.max(0, now - epoch);
      const cycle = Math.floor(elapsed / cycleMs);
      const phase = elapsed % cycleMs;
      paint(cycle, phase);
      schedule(phase < travelMs ? frameDelay : cycleMs - phase);
    }
    function stop() {
      if (running) elapsedAtPause = Math.max(0, performance.now() - epoch);
      running = false;
      if (raf) cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
      raf = timer = 0;
    }
    function updatePlayback() {
      const reduced = preference.matches;
      canvas.hidden = reduced;
      canvas.style.display = reduced ? 'none' : '';
      if (reduced || document.hidden) {
        stop();
        ctx.clearRect(0, 0, width, height);
        return;
      }
      if (running) return;
      resize();
      epoch = performance.now() - elapsedAtPause;
      running = true;
      raf = requestAnimationFrame(tick);
    }
    addEventListener('resize', () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        resize();
      });
    }, { passive: true });
    document.addEventListener('visibilitychange', updatePlayback);
    if (preference.addEventListener) preference.addEventListener('change', updatePlayback);
    else preference.addListener(updatePlayback);
    updatePlayback();
  }

  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init, { once: true });
})();
