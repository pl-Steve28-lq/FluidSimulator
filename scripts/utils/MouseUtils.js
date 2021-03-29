export class MouseManager {
  constructor() {
    this.pos = {
      x: 0,
      y: 0
    }

    this.onMoveBehavior = pos => {}
    this.onClickBehavior = pos => {}
    this.onUnclickBehavior = pos => {}
    this.onRightClickBehavior = pos => {}
    this.onLeftSwipeBehavior = () => {}
    this.onRightSwipeBehavior = () => {}
    this.onUpSwipeBehavior = () => {}
    this.onDownSwipeBehavior = () => {}
    this.onScrollBehavior = d => {}

    this.refreshable = true

    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    this.moveEvent = this.isMobile ? "touchmove" : "pointermove"
    this.clickEvent = this.isMobile ? "touchstart" : "pointerdown"
    this.unclickEvent = this.isMobile ? "touchend" : "pointerup"

    document.addEventListener(
      this.moveEvent,
      this.onMove.bind(this), false
    )

    document.addEventListener(
      this.clickEvent,
      this.onDown.bind(this), false
    )

    document.addEventListener(
      this.unclickEvent,
      this.onUp.bind(this), false
    )

    document.addEventListener(
      'contextmenu',
      e => e.preventDefault(), false
    )

    document.onwheel = this.onScroll.bind(this)

    this.scrollEventListener()
  }

  setOnMoveListener = f => { this.onMoveBehavior = f }
  setOnClickListener = f => { this.onClickBehavior = f }
  setOnUnclickListener = f => { this.onUnclickBehavior = f }
  setOnRightClickListener = f => { this.onRightClickBehavior = f }
  setOnScrollListener = f => { this.onScrollBehavior = f }
  setOnLeftSwipeListener = f => { this.onLeftSwipeBehavior = f }
  setOnRightSwipeListener = f => { this.onRightSwipeBehavior = f }
  setOnUpSwipeListener = f => { this.onUpSwipeBehavior = f }
  setOnDownSwipeListener = f => { this.onDownSwipeBehavior = f }

  onMove(e) {
    this.pos = this.getEventPos(e)
    this.onMoveBehavior(this.pos)
  }

  onDown(e) {
    if ((e.button == 0) || !e.button) {
      this.isClicked = true
      this.pos = this.getEventPos(e)
      this.onClickBehavior(this.pos)
    }
    if (e.button == 2) {
      this.isRightClicked = true
      this.pos = this.getEventPos(e)
      this.onRightClickBehavior(this.pos)
    }
  }

  onUp(e) { 
    this.isClicked = false
    this.isRightClicked = false
    this.onUnclickBehavior(this.pos)
  }

  onScroll(e) {
    this.onScrollBehavior((-1)*Math.sign(e.deltaY))
  }

  setRefreshable(refreshable) {
    this.refreshable = refreshable
  }

  getEventPos = e => {
    return {
      x: this.isMobile ? e.targetTouches[0].pageX : e.clientX,
      y: this.isMobile ? e.targetTouches[0].pageY : e.clientY
    }
  }

  scrollEventListener() {
    let touchPoint = { x: 0, y: 0 }

    let touchStartHandler = e => {
      touchPoint = this.getEventPos(e)
    }

    let touchMoveHandler = e => {
      let newPoint

      if (this.isClicked) {
        newPoint = this.getEventPos(e)

        let newX = newPoint.x,
            newY = newPoint.y,
            oldX = touchPoint.x,
            oldY = touchPoint.y
        
        let slope = (newY-oldY)/((newX-oldX) == 0 ? 0.1 : (newX-oldX))
        let range = 0.5
        let xslope = Math.abs(slope) < range
        let yslope = Math.abs(slope) > 1/range

        if ((newX < oldX) && xslope) this.onLeftSwipeBehavior()
        if ((newX > oldX) && xslope) this.onRightSwipeBehavior()
        if ((newY < oldY) && yslope) this.onUpSwipeBehavior()
        if ((newY > oldY) && yslope) this.onDownSwipeBehavior()
        if ((newY > oldY) && !this.refreshable) e.preventDefault()
      }

      touchPoint = newPoint
    }

    document.addEventListener(
      this.clickEvent,
      touchStartHandler,
      { passive: false }
    )
    
    document.addEventListener(
      this.moveEvent,
      touchMoveHandler,
      { passive: false }
    )
  }
}