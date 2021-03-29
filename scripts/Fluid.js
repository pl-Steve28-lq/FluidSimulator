import { floor, IX, array } from './utils/Utils.js'

export class Fluid {
  constructor(dt=0.01, diff=0, visc=0) {
    Object.assign(this, {
      dt, diff, visc,
      s: array(N*N),
      density: array(N*N),
      Vx: array(N*N),
      Vy: array(N*N),
      Vx0: array(N*N),
      Vy0: array(N*N),
    })
  }

  next() {
    let { Vx, Vy, Vx0, Vy0, dt, density, diff, s, visc } = this

    diffuse(1, Vx0, Vx, visc, dt, 4)
    diffuse(2, Vy0, Vy, visc, dt, 4)
    
    project(Vx0, Vy0, Vx, Vy, 4)
    
    advect(1, Vx, Vx0, Vx0, Vy0, dt)
    advect(2, Vy, Vy0, Vx0, Vy0, dt)
    
    project(Vx, Vy, Vx0, Vy0, 4)
    
    diffuse(0, s, density, diff, dt, 4)
    advect(0, density, s, Vx, Vy, dt)
  }
}

function set_bnd(b, x) {
  for (let k=1; k < N-1; k++) {
    for (let i=1; i < N-1; i++) {
      x[IX(i, 0)] = b == 2 ? -x[IX(i, 1)] : x[IX(i, 1)];
      x[IX(i, N-1)] = b == 2 ? -x[IX(i, N-2)] : x[IX(i, N-2)];
    }
  }
  for (let k=1; k < N-1; k++) {
    for (let j=1; j < N-1; j++) {
      x[IX(0, j)] = b == 1 ? -x[IX(1, j)] : x[IX(1, j)];
      x[IX(N-1, j)] = b == 1 ? -x[IX(N-2, j)] : x[IX(N-2, j)];
    }
  }
  
  x[IX(0, 0)] =
    (x[IX(1, 0)] + x[IX(0, 1)])/2
  x[IX(0, N-1)] =
    (x[IX(1, N-1)] + x[IX(0, N-2)])/2
  x[IX(N-1, 0)] =
    (x[IX(N-2, 0)] + x[IX(N-1, 1)])/2
  x[IX(N-1, N-1)] =
    (x[IX(N-2, N-1)] + x[IX(N-1, N-2)])/2
}

function lin_solve(b, x, x0, a, c, iter){
  for (let k=0; k < iter; k++) {
    for (let j=1; j < N-1; j++) {
      for (let i=1; i < N-1; i++) {
        let sx =
          x[IX(i+1, j)] + x[IX(i-1, j)] +
          x[IX(i, j+1)] + x[IX(i, j-1)]
        x[IX(i, j)] = (x0[IX(i, j)] + a*sx) /c;
      }
    }

    set_bnd(b, x);
  }
}

function diffuse(b, x, x0, diff, dt, iter){
  let a = dt * diff * (N-2) * (N-2);
  lin_solve(b, x, x0, a, 1+6*a, iter);
}

function project(velocX, velocY, p, div, iter) {
  for (let j=1; j < N-1; j++) {
    for (let i=1; i < N-1; i++) {
      let sv = 
        velocX[IX(i+1, j)] - velocX[IX(i-1, j)] +
        velocY[IX(i, j+1)] - velocY[IX(i, j-1)]
      div[IX(i, j)] = -sv/(2*N);
      p[IX(i, j)] = 0
    }
  }
  
  set_bnd(0, div)
  set_bnd(0, p)
  lin_solve(0, p, div, 1, 6, iter)
  
  for (let j = 1; j < N - 1; j++) {
    for (let i = 1; i < N - 1; i++) {
      velocX[IX(i, j)] -=
        (p[IX(i+1, j)] - p[IX(i-1, j)]) * N/2
      velocY[IX(i, j)] -= 
        (p[IX(i, j+1)] - p[IX(i, j-1)]) * N/2
    }
  }

  set_bnd(1, velocX)
  set_bnd(2, velocY)
}

function advect(b, d, d0,  velocX, velocY, dt) {
  let i0, i1, j0, j1
  
  let dtx = dt * (N - 2),
      dty = dt * (N - 2)
  
  let s0, s1, t0, t1
  let tmpX, tmpY, x, y
  
  for(let j=1; j < N-1; j++) { 
    for(let i=1; i < N-1; i++) {
        tmpX = dtx*velocX[IX(i, j)]
        tmpY = dty*velocY[IX(i, j)]
        x = i - tmpX
        y = j - tmpY
        
        if (x < 0.5) x = 0.5 
        if (x > N - 1.5) x = N - 1.5
        i0 = floor(x)
        i1 = i0 + 1

        if (y < 0.5) y = 0.5; 
        if (y > N - 1.5) y = N - 1.5; 
        j0 = floor(y)
        j1 = j0 + 1
        
        s1 = x - i0
        s0 = 1 - s1
        t1 = y - j0
        t0 = 1 - t1
        
        d[IX(i, j)] = 
          s0 * (t0 * d0[IX(i0, j0)] +
          t1 * d0[IX(i0, j1)]) +
          s1 * (t0 * d0[IX(i1, j0)] +
          t1 * d0[IX(i1, j1)])
    }
  }
  
  set_bnd(b, d);
}