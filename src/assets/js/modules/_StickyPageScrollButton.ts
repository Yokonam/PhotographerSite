export class StickyPageScrollButton {
  btn: string
  main: string
  threshold: number
  mainPos: number
  scroll: number
  ticking: boolean
  btnEl: HTMLElement
  mainEl: HTMLElement

  constructor (btn: string, main: string, threshold: number) {
    this.btn = btn
    this.main = main
    this.threshold = threshold // px単位で指定
    this.mainPos = 0
    this.scroll = 0
    this.ticking = false

    this.scrollHandler = this.scrollHandler.bind(this)
    this.checkScroll = this.checkScroll.bind(this)
  }

  init (): void {
    this.btnEl = document.querySelector(this.btn)
    this.mainEl = document.querySelector(this.main)
    this.scrollHandler()
    this.addListener()
  }

  checkScroll (): void {
    this.scroll = window.pageYOffset
    this.mainPos = this.mainEl.getBoundingClientRect().bottom - window.innerHeight
    // const mainBottomPosition = this.mainEl.getBoundingClientRect().bottom

    if (this.scroll > 200 && this.btnEl.dataset.hide === 'true') {
      this.btnEl.dataset.hide = 'false'
    } else if (this.scroll < 200 && (this.btnEl.dataset.hide === 'false' || !this.btnEl.dataset.hide)) {
      this.btnEl.dataset.hide = 'true'
    }
    if (this.mainPos < this.threshold && this.btnEl.dataset.sticky === 'true') {
      this.btnEl.dataset.sticky = 'false'
    } else if (this.mainPos > this.threshold && this.btnEl.dataset.sticky !== 'true') {
      this.btnEl.dataset.sticky = 'true'
    }
  }

  scrollHandler (): void {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.ticking = false
        this.checkScroll()
      })
    }
    this.ticking = true
  }

  addListener (): void {
    window.addEventListener('scroll', this.scrollHandler, { passive: true })
  }

  // convertRemToPx (rem: number): number {
  //   const style = document.defaultView.getComputedStyle(document.documentElement, '')
  //   const fontSize = style['font-size' as any]
  //   console.log(rem * parseFloat(fontSize))
  //   return rem * parseFloat(fontSize)
  // }
}
