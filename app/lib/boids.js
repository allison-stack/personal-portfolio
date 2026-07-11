// Pure boids simulation — no DOM. Spatial hash keeps neighbor search O(n)
// per frame (grid cell = perception radius, so neighbors live in 9 cells).
export const DEFAULTS = {
  perception: 50,
  separationDist: 16,
  cohesionForce: 0.005,
  alignForce: 0.07,
  separationForce: 1.8,
  fleeForce: 3.4,
  feedForce: 1.1,
  fleeRadius: 150,
  wander: 0.12,
  maxSpeed: 2.6,
  minSpeed: 0.8,
  margin: 12,
};

export function createFish(count, w, h, rand = Math.random) {
  const fish = [];
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    fish.push({
      x: rand() * w,
      y: rand() * h,
      vx: Math.cos(a) * 1.5,
      vy: Math.sin(a) * 1.5,
    });
  }
  return fish;
}

export function stepSchool(fish, { w, h, predator, mode = "flee", params, rand = Math.random }) {
  const p = { ...DEFAULTS, ...params };
  const cell = p.perception;

  const grid = new Map();
  for (let i = 0; i < fish.length; i++) {
    const k = Math.floor(fish[i].x / cell) + "," + Math.floor(fish[i].y / cell);
    const bucket = grid.get(k);
    if (bucket) bucket.push(i);
    else grid.set(k, [i]);
  }

  for (let i = 0; i < fish.length; i++) {
    const f = fish[i];
    let ax = 0, ay = 0;
    let cx = 0, cy = 0, avx = 0, avy = 0, n = 0;

    const gx = Math.floor(f.x / cell);
    const gy = Math.floor(f.y / cell);
    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        const bucket = grid.get(gx + ox + "," + (gy + oy));
        if (!bucket) continue;
        for (const j of bucket) {
          if (j === i) continue;
          const o = fish[j];
          const dx = o.x - f.x;
          const dy = o.y - f.y;
          const d2 = dx * dx + dy * dy;
          if (d2 >= p.perception * p.perception) continue;
          n++;
          cx += o.x; cy += o.y; avx += o.vx; avy += o.vy;
          if (d2 < p.separationDist * p.separationDist && d2 > 0.0001) {
            const d = Math.sqrt(d2);
            const push = p.separationForce * (1 - d / p.separationDist);
            ax -= (dx / d) * push;
            ay -= (dy / d) * push;
          }
        }
      }
    }

    if (n > 0) {
      ax += (cx / n - f.x) * p.cohesionForce;
      ay += (cy / n - f.y) * p.cohesionForce;
      ax += (avx / n - f.vx) * p.alignForce;
      ay += (avy / n - f.vy) * p.alignForce;
    }

    if (predator?.active) {
      const px = f.x - predator.x;
      const py = f.y - predator.y;
      const pd2 = px * px + py * py;
      if (pd2 < p.fleeRadius * p.fleeRadius && pd2 > 0.0001) {
        const pd = Math.sqrt(pd2);
        if (mode === "feed") {
          const pull = p.feedForce * (1 - pd / p.fleeRadius);
          ax -= (px / pd) * pull;
          ay -= (py / pd) * pull;
        } else {
          const push = p.fleeForce * (1 - pd / p.fleeRadius);
          ax += (px / pd) * push;
          ay += (py / pd) * push;
        }
      }
    }

    ax += (rand() - 0.5) * p.wander;
    ay += (rand() - 0.5) * p.wander;

    f.vx += ax;
    f.vy += ay;
    const sp = Math.hypot(f.vx, f.vy) || 0.001;
    if (sp > p.maxSpeed) {
      f.vx = (f.vx / sp) * p.maxSpeed;
      f.vy = (f.vy / sp) * p.maxSpeed;
    } else if (sp < p.minSpeed) {
      f.vx = (f.vx / sp) * p.minSpeed;
      f.vy = (f.vy / sp) * p.minSpeed;
    }
  }

  for (const f of fish) {
    f.x += f.vx;
    f.y += f.vy;
    const m = p.margin;
    if (f.x < -m) f.x = w + m;
    else if (f.x > w + m) f.x = -m;
    if (f.y < -m) f.y = h + m;
    else if (f.y > h + m) f.y = -m;
  }
}
