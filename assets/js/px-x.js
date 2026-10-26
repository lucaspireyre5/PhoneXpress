/* V13 — tiny ambient particles; single canvas, bounded work, battery aware. */
(() => {
  'use strict';
  const host = document.querySelector('.cyber-backdrop');
  if (!host || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = document.createElement('canvas');
  cv.className = 'px-x-canvas';
  cv.setAttribute('aria-hidden', 'true');
  const ctx = cv.getContext('2d', { alpha: true, desynchronized: true });
  if (!ctx) return;
  host.appendChild(cv);
  const mobile = matchMedia('(max-width: 650px)').matches;
  const count = mobile ? 11 : 39;
  const frameDelay = mobile ? 66 : 41; // 15 FPS mobile / 24 FPS desktop
  let w = 0, h = 0, particles = [], mouseX = -500, mouseY = -500;
  let last = 0, frame = 0, active = false;
  const random = (min, max) => min + Math.random() * (max - min);
  const seed = () => ({x:random(0,w), y:random(0,h), vx:random(-.16,.20),vy:random(-.28,-.06),life:random(.24,.82),size:random(.7,2.7),t:random(0,6.28)});
  function resize() {
    w = Math.max(1, window.innerWidth);
    h = Math.max(1, window.innerHeight);
    // No high DPR: fragments should stay tiny instead of taxing GPU memory.
    cv.width = w;
    cv.height = h;
    particles = Array.from({ length: count }, seed);
  }
  function paint(now) {
    frame = 0;
    if (!active) return;
    if (now - last >= frameDelay) {
      last = now;
      ctx.clearRect(0,0,w,h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -8 || p.x < -8 || p.x > w+8) {
          Object.assign(p,seed(),{y:h+random(0,50)});
        }
        const dx = p.x-mouseX, dy = p.y-mouseY;
        const distance = dx*dx+dy*dy;
        if (distance < 8500 && distance > 3) {
          p.x += dx * .003;
          p.y += dy * .003;
        }
        const opacity = (p.life * (.7 + .3 * Math.sin(now*.0009+p.t))).toFixed(3);
        ctx.fillStyle = `rgba(82,204,255,${opacity})`;
        if (p.size > 2) {
          ctx.beginPath();
          ctx.moveTo(p.x,p.y-1.5*p.size);
          ctx.lineTo(p.x+.7*p.size,p.y+.4*p.size);
          ctx.lineTo(p.x-1.1*p.size,p.y+.8*p.size);
          ctx.closePath();
          ctx.fill();
        } else ctx.fillRect(p.x,p.y,p.size,p.size);
      }
    }
    frame = requestAnimationFrame(paint);
  }
  function start() { if (!active) { active=true;last=0;frame=requestAnimationFrame(paint); } }
  function stop() { active=false;if (frame) cancelAnimationFrame(frame);frame=0; }
  let resizeQueued=false;
  addEventListener('resize',()=>{
    if (resizeQueued) return;
    resizeQueued=true;
    requestAnimationFrame(()=>{resizeQueued=false;resize();});
  },{passive:true});
  addEventListener('pointermove',(e)=>{mouseX=e.clientX;mouseY=e.clientY;},{passive:true});
  addEventListener('pointerleave',()=>{mouseX=-500;mouseY=-500;});
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  resize();start();
})();
