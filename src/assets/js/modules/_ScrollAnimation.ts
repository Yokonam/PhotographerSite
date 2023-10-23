interface ItemStatus {
  top: number,
  bottom: number,
  finished: boolean
}

export class ScrollAnimation {
  items: NodeList
  threshold: number
  itemStatus: Array<ItemStatus>
  winW: number
  winH: number
  ticking: boolean
  finished: number
  timer: any

  constructor (attr: {
    selector: string,
    threshold?: number
  }) {
    this.items = document.querySelectorAll(attr.selector)
    this.threshold = attr.threshold || 0.9
    this.itemStatus = []
    this.winW = 0
    this.winH = 0
    this.ticking = false
    this.finished = 0
    this.timer = null
  }

  init () {
    this.winH = window.innerHeight
    this.resizeHandler = this.resizeHandler.bind(this)
    this.scrollHandler = this.scrollHandler.bind(this)
    this.addListeners()
  }

  setItemStatus () {
    Array.from(this.items).forEach((elm: HTMLElement, i: number) => {
      const t = elm.getBoundingClientRect().top + window.pageYOffset
      const b = t + elm.offsetHeight
      const finished = typeof this.itemStatus[i] !== 'undefined'
        ? this.itemStatus[i].finished
        : false
      this.itemStatus[i] = {
        top: t,
        bottom: b,
        finished: finished
      }
    })
  }

  checkCurrentPosition () {
    for (let i = 0; i < this.itemStatus.length; i++) {
      if (this.itemStatus[i].top <= window.pageYOffset + this.winH * this.threshold &&
        this.itemStatus[i].bottom >= window.pageYOffset + this.winH * (1 - this.threshold) &&
        this.itemStatus[i].finished === false) {
        // console.log(this.items[i])
        this.animation(i)
        this.removeListeners()
      }
    }
  }

  animation (i: number) {
    this.itemStatus[i].finished = true;
    (<HTMLElement>this.items[i]).setAttribute('data-finished', 'true')
  }

  scrollHandler () {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.ticking = false
        this.setItemStatus()
        this.checkCurrentPosition()
      })
    }
    this.ticking = true
  }

  removeListeners () {
    this.finished++
    if (this.finished === this.itemStatus.length) {
      window.removeEventListener('scroll', this.scrollHandler)
      window.removeEventListener('resize', this.resizeHandler)
    }
  }

  resizeHandler () {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      if (this.winW !== window.innerWidth) {
        this.setItemStatus()
        this.winW = window.innerWidth
        this.winH = window.innerHeight
      }
    }, 300)
  }

  addListeners () {
    window.addEventListener('scroll', this.scrollHandler, { passive: true })
    window.addEventListener('resize', this.resizeHandler, { passive: true })
  }
}