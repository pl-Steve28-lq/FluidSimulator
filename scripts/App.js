import { BaseCanvasApp } from './BaseApp.js'

import { Fluid } from './Fluid.js'
import { floor, RGB } from './utils/Utils.js'
import { MouseManager } from './utils/MouseUtils.js'

class App extends BaseCanvasApp {
  constructor() { super() }
  init() { 
    this.f = new Fluid()

    this.m = new MouseManager()
    this.m.setRefreshable(false)
    this.m.setOnMoveListener(this.mouseEvent.bind(this))

    this.pxm = 0
    this.pym = 0
  }

  animate() {
    super.animate()
    this.drawGrid()
    this.fade()
    this.f.next()
    if (this.f.includes) console.log("NaN")
  }

  fade() {
    let i = 0
    for (let d of this.f.density) {
      this.f.density[i] = d > 0 ? d-0.1 : d
      i += 1
    }
  }

  drawGrid() {
    let gridSize = Math.min(this.Width, this.Height),
        elseSize = this.Width + this.Height - gridSize
    let isHorizontal = gridSize == this.Height,
        margin = (elseSize - gridSize)/2
    let X = isHorizontal ? margin : 0,
        Y = isHorizontal ? 0 : margin
    let pixelSize = floor(gridSize/N)
    let i = 0
    
    for (let y=Y; y < this.Height-Y-pixelSize; y += pixelSize) {
      for (let x=X; x < this.Width-X-pixelSize; x += pixelSize) {
        this.ctx.beginPath()
        this.ctx.rect(x, y, pixelSize, pixelSize)
        let clr = 255*Math.min(1, this.f.density[i]/100)
        let color = RGB(clr, clr, clr)
        this.ctx.fillStyle = color
        this.ctx.strokeStyle = color
        this.ctx.fill()
        this.ctx.stroke()
        i += 1
      }
    }
  }

  mouseEvent() {
    let gridSize = Math.min(this.Width, this.Height),
        elseSize = this.Width + this.Height - gridSize
    let isHorizontal = gridSize == this.Height,
        margin = (elseSize - gridSize)/2
    let X = isHorizontal ? margin : 0,
        Y = isHorizontal ? 0 : margin
    let pixelSize = floor(gridSize/N)
    let i = 0

    let xm = this.m.pos.x,
        ym = this.m.pos.y
    
    for (let y=Y; y < this.Height-Y-pixelSize; y += pixelSize) {
      for (let x=X; x < this.Width-X-pixelSize; x += pixelSize) {
        if (
          (0 < xm-x && xm-x < pixelSize) &&
          (0 < ym-y && ym-y < pixelSize) &&
          this.m.isClicked
        ) {
          this.f.density[i] += 100
          let amtX = xm - this.pxm
          let amtY = ym - this.pym

          this.f.Vx[i] += 1.2*amtX
          this.f.Vy[i] += 1.2*amtY

          break
        }
        i += 1
      }
    }

    this.pxm = xm
    this.pym = ym
  }
}

window.onload = () => { new App() }
