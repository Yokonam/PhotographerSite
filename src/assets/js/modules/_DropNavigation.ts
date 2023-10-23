type atts = {
  selector: string
  mouseHover?: boolean
  inr?: Array<string>
  breakpoint?: number
  onlyMobile?: boolean
}

export class DropNavigation {
  selector: string
  items: Array<HTMLElement>
  mouseHover: boolean
  inr: Array<string>
  matchMedia: MediaQueryList
  currentItem: HTMLElement
  time: any
  onlyMobile: boolean

  constructor (atts: atts) {
    this.selector = atts.selector
    this.items = Array.from(document.querySelectorAll(this.selector))
    this.mouseHover = atts.mouseHover === true
    this.inr = atts.inr
    this.matchMedia = atts.breakpoint ? window.matchMedia(`screen and (max-width: ${atts.breakpoint}px)`) : null
    this.onlyMobile = atts.onlyMobile

    this.currentItem = null
    this.time = null
  }

  init () {
    this.prepare()
    this.addListeners()
  }

  prepare () {
    this.addListeners = this.addListeners.bind(this)
    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this.clickHandler = this.clickHandler.bind(this)
    this.onDocumentClick = this.onDocumentClick.bind(this)
    this.handleEscape = this.handleEscape.bind(this)
  }

  addListeners () {
    const TRANSITION_END = ((window as any).WebKitTransitionEvent)
      ? 'webkitTransitionEnd'
      : 'transitionend'

    this.items.forEach((elm: HTMLElement) => {
      const btn: HTMLElement = elm.querySelector(this.selector + '__btn')
      const cnt: HTMLElement = elm.querySelector(this.selector + '__cnt')

      cnt.addEventListener(TRANSITION_END, (e) => {
        if (e.target === elm.querySelector(this.selector + '__cnt')) {
          cnt.setAttribute('aria-busy', 'false')
          if (cnt.getAttribute('aria-hidden') === 'true') {
            cnt.classList.add('-closing')
          }
        }
      })

      this.checkBreakPoint(elm, btn, cnt)

      this.matchMedia.addListener(() => {
        this.checkBreakPoint(elm, btn, cnt)
      })
    })
  }

  checkBreakPoint (elm: HTMLElement, btn: HTMLElement, cnt: HTMLElement) {
    const isMobile = this.matchMedia.matches
    const rand = Math.random().toString(36).substring(2, 6)
    const btnId = btn.getAttribute('id') ? btn.getAttribute('id') : 'dp-btn-' + rand
    const cntId = 'dp-cnt-' + rand

    // 初期設定
    if (!this.onlyMobile || (this.onlyMobile && isMobile)) {
      btn.setAttribute('id', btnId)
      btn.setAttribute('role', 'button')
      btn.setAttribute('aria-controls', cntId)
      btn.setAttribute('aria-expanded', 'false')
      cnt.setAttribute('id', cntId)
      cnt.setAttribute('role', 'region')
      cnt.setAttribute('aria-labelledby', btnId)
      cnt.setAttribute('aria-hidden', 'true')
    } else {
      btn.removeAttribute('aria-controls')
      btn.removeAttribute('aria-expanded')
      cnt.removeAttribute('role')
      cnt.removeAttribute('aria-labelledby')
      cnt.removeAttribute('aria-hidden')
    }

    // イベント登録・削除
    if (this.onlyMobile) {
      if (isMobile) {
        btn.addEventListener('click', this.clickHandler, false)
        btn.setAttribute('tabindex', '0')
      } else {
        btn.removeEventListener('click', this.clickHandler, false)
        btn.removeAttribute('tabindex')
      }
    } else {
      if (!isMobile && this.mouseHover) {
        elm.addEventListener('mouseenter', this.open, false)
        elm.addEventListener('mouseleave', this.close, false)
        elm.addEventListener('focus', this.open, false)
        elm.setAttribute('tabindex', '0')
        btn.removeEventListener('click', this.clickHandler, false)
        btn.setAttribute('tabindex', '-1')
      } else {
        elm.removeEventListener('mouseenter', this.open, false)
        elm.removeEventListener('mouseleave', this.close, false)
        elm.removeEventListener('focus', this.open, false)
        elm.removeAttribute('tabindex')
        btn.addEventListener('click', this.clickHandler, false)
        btn.setAttribute('tabindex', '0')
      }
    }
  }

  open (e: Event) {
    if (!(e.target instanceof HTMLElement)) {
      return
    }

    if (e.target.classList.contains(this.selector.replace(/\./, ''))) {
      clearTimeout(this.time)
      this.currentItem = e.target
      const btn = e.target.querySelector(this.selector + '__btn')
      const cnt = e.target.querySelector(this.selector + '__cnt')

      btn.setAttribute('aria-expanded', 'true')
      cnt.classList.remove('-closing')
      cnt.setAttribute('aria-busy', 'true')
      requestAnimationFrame(() => cnt.setAttribute('aria-hidden', 'false'))

      this.items.forEach((el: HTMLElement) => {
        if (this.currentItem !== el) {
          const otherBtn = el.querySelector(this.selector + '__btn')
          const otherCont = el.querySelector(this.selector + '__cnt')
          otherBtn.setAttribute('aria-expanded', 'false')
          otherCont.setAttribute('aria-hidden', 'true')
        }
      })

      document.addEventListener('keydown', this.handleEscape, false)
    }
  }

  close (e: Event) {
    if (!(e.target instanceof HTMLElement)) {
      return
    }
    if (this.currentItem) {
      const btn: HTMLElement = this.currentItem.querySelector(this.selector + '__btn')
      const cnt: HTMLElement = this.currentItem.querySelector(this.selector + '__cnt')

      cnt.style.maxHeight = ''

      btn.setAttribute('aria-expanded', 'false')
      cnt.setAttribute('aria-hidden', 'true')
      cnt.setAttribute('aria-busy', 'true')

      this.currentItem = null
      document.removeEventListener('keydown', this.handleEscape, false)
    }
  }

  clickHandler (e: Event) {
    if (!(e.target instanceof HTMLElement)) {
      return
    }
    e.preventDefault()
    this.currentItem = this.closest(<HTMLElement>e.currentTarget, this.selector)
    const btn = <HTMLElement>e.currentTarget
    const cnt = document.getElementById(btn.getAttribute('aria-controls'))
    const isClosing = btn.getAttribute('aria-expanded') === 'true'

    if (!isClosing) {
      cnt.classList.remove('-closing')
      cnt.style.maxHeight = cnt.children[0].clientHeight + 'px'
    } else {
      cnt.style.maxHeight = ''
    }

    btn.setAttribute('aria-expanded', (!isClosing).toString())
    cnt.setAttribute('aria-busy', 'true')

    requestAnimationFrame(() => cnt.setAttribute('aria-hidden', (isClosing).toString()))

    this.items.forEach((el: HTMLElement) => {
      if (btn !== el.querySelector(this.selector + '__btn')) {
        const otherBtn: HTMLElement = el.querySelector(this.selector + '__btn')
        const otherCont: HTMLElement = el.querySelector(this.selector + '__cnt')
        otherBtn.setAttribute('aria-expanded', 'false')
        otherCont.setAttribute('aria-hidden', 'true')
        otherCont.style.maxHeight = ''
      }
    })

    if (this.inr.length > 0) {
      if (!isClosing) {
        document.addEventListener('click', this.onDocumentClick, false)
        document.addEventListener('keydown', this.handleEscape, false)
      } else {
        document.removeEventListener('click', this.onDocumentClick, false)
        document.removeEventListener('keydown', this.handleEscape, false)
      }
    }
  }

  onDocumentClick (e: Event) {
    // const target = this.closest(e.target, this.inr) || e.target === document.getElementById(this.nav)
    if (!(e.target instanceof HTMLElement)) {
      return
    }
    const target = this.closest(e.target, this.inr)
    if (!target) {
      this.close(e)
    }
  }

  handleEscape (e: any) {
    if (e.key === 'Escape' && this.currentItem) {
      e.stopPropagation()
      this.close(e)
    }
  }

  closest (node: HTMLElement, selector: any) {
    return (node.closest || function (_selector: any) {
      do {
        if ((node.matches || (node as any).msMatchesSelector).call(node, _selector)) {
          return node
        }
        (node as any) = node.parentElement || node.parentNode
      } while (node !== null && node.nodeType === 1)
      return null
    }).call(node, selector)
  }
}
