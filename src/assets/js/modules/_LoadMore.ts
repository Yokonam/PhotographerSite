type obj = {
  element: string,
  btn: string
  current: number
  showNumber: number
}

export class LoadMore {
  element: HTMLElement
  btn: HTMLButtonElement
  current: number
  showNumber: number
  items: Array<HTMLElement>

  constructor (atts: obj) {
    this.element = document.querySelector(atts.element)
    this.btn = document.querySelector(atts.btn)
    this.current = atts.current
    this.items = null
    this.showNumber = atts.showNumber
    this.clickHandler = this.clickHandler.bind(this)
  }

  run () {
    if (!this.element) return
    this.init()
    this.btn.addEventListener('click', this.clickHandler, false)
  }

  init () {
    this.items = Array.from(this.element.querySelectorAll('.item'))
    for (const [i, elm] of this.items.entries()) {
      if (i >= this.showNumber * this.current) {
        elm.style.opacity = '0'
        elm.style.display = 'none'
      } else {
        LoadMore.loadImg(elm.querySelector('.img img'))
      }
    }
    if (this.items.length <= this.showNumber * this.current) {
      this.btn.style.display = 'none'
    }
  }

  clickHandler () {
    const min = this.showNumber * this.current
    const max = min + this.showNumber
    const expanded = this.btn.dataset.expanded
    for (let i = min; i < max; i++) {
      if (this.items[i]) {
        this.items[i].style.display = ''
        LoadMore.loadImg(this.items[i].querySelector('.img img'))
        requestAnimationFrame(() => {
          this.items[i].style.opacity = '1'
        })
      }
    }
    if (this.items.length <= max) {
      if (expanded === 'true') {
        this.current = 1
        this.btn.dataset.expanded = 'false'
        this.init()
      } else {
        this.btn.dataset.expanded = 'true'
      }
    } else {
      this.current++
    }
  }

  static loadImg (elm: HTMLImageElement) {
    if (elm.dataset.src) {
      elm.src = elm.dataset.src
      elm.dataset.src = ''
    }
  }
}
