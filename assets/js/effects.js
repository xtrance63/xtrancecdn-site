(function(){
  const cfg = Object.assign({
    enableBackground: true,
    enableParallax: true,
    ignoreReducedMotion: false, // NEW: allow forcing effects on
    parallaxStrength: 1.5, // NEW: configurable parallax strength (default tuned for better visibility)
    particleCount: Math.min(80, Math.floor((window.innerWidth*window.innerHeight)/16000)),
    particleColor: 'rgba(148, 163, 184, 0.6)', // slightly brighter for dark bg
    lineColor: 'rgba(148, 163, 184, 0.35)',
    maxSpeed: 0.3,
    linkDistance: 110,
  }, window.EFFECTS_CONFIG || {});

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const allowMotion = cfg.ignoreReducedMotion || !reduced;

  // Create or reuse effects root container
  let effectsRoot = document.getElementById('effects-root');
  if (!effectsRoot) {
    effectsRoot = document.createElement('div');
    effectsRoot.id = 'effects-root';
    document.body.appendChild(effectsRoot);
  }

  // Insert parallax layers
  if (cfg.enableParallax && allowMotion) {
    const layers = [1,2,3].map(n=>{
      const el = document.createElement('div');
      el.className = `parallax-layer layer-${n}`;
      effectsRoot.appendChild(el); // Append to effects root instead of body
      return el;
    });

    const damp = [0.02 * cfg.parallaxStrength, 0.04 * cfg.parallaxStrength, 0.06 * cfg.parallaxStrength];
    let cx = window.innerWidth/2, cy = window.innerHeight/2;
    function onMove(e){
      const x = (e.touches? e.touches[0].clientX : (e.clientX ?? cx)) - cx;
      const y = (e.touches? e.touches[0].clientY : (e.clientY ?? cy)) - cy;
      layers.forEach((el,i)=>{
        el.style.transform = `translate3d(${(-x*damp[i])}px, ${(-y*damp[i])}px, 0)`;
      });
    }
    window.addEventListener('mousemove', onMove, {passive:true});
    window.addEventListener('touchmove', onMove, {passive:true});
    window.addEventListener('resize', ()=>{ cx = window.innerWidth/2; cy = window.innerHeight/2; });
  }

  // Insert animated background canvas (particle network)
  if (cfg.enableBackground && allowMotion) {
    const c = document.createElement('canvas');
    c.id = 'bg-canvas';
    effectsRoot.appendChild(c); // Append to effects root instead of body
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const ctx = c.getContext('2d');

    function resize(){
      c.width = Math.floor(innerWidth * dpr);
      c.height = Math.floor(innerHeight * dpr);
      c.style.width = innerWidth + 'px';
      c.style.height = innerHeight + 'px';
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const N = cfg.particleCount;
    for (let i=0;i<N;i++) particles.push({
      x: Math.random()*c.width,
      y: Math.random()*c.height,
      vx: (Math.random()*2-1)*cfg.maxSpeed*dpr,
      vy: (Math.random()*2-1)*cfg.maxSpeed*dpr,
      r: Math.random()*1.5+0.5
    });

    let mouse = {x: -1e9, y: -1e9};
    c.addEventListener('mousemove', e=>{
      const rect = c.getBoundingClientRect();
      mouse.x = (e.clientX-rect.left)*dpr;
      mouse.y = (e.clientY-rect.top)*dpr;
    });
    c.addEventListener('mouseleave', ()=>{ mouse.x = mouse.y = -1e9; });

    function step(){
      ctx.clearRect(0,0,c.width,c.height);
      // move & draw points
      for (const p of particles){
        p.x += p.vx; p.y += p.vy;
        if (p.x<0||p.x>c.width) p.vx*=-1;
        if (p.y<0||p.y>c.height) p.vy*=-1;
        ctx.fillStyle = cfg.particleColor;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r*dpr,0,6.283); ctx.fill();
      }
      // links
      for (let i=0;i<N;i++){
        for (let j=i+1;j<N;j++){
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx,dy);
          if (dist < cfg.linkDistance*dpr){
            ctx.strokeStyle = cfg.lineColor;
            ctx.lineWidth = (1 - dist/(cfg.linkDistance*dpr)) * 0.8 * dpr;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      // gentle pull to mouse
      for (const p of particles){
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist2 = dx*dx + dy*dy;
        if (dist2 < (160*dpr)*(160*dpr)){
          p.vx += (dx>0? 0.005:-0.005);
          p.vy += (dy>0? 0.005:-0.005);
        }
      }
      raf = requestAnimationFrame(step);
    }
    let raf = requestAnimationFrame(step);

    // pause when tab hidden
    document.addEventListener('visibilitychange', ()=>{
      if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(step);
    });
  }
})();