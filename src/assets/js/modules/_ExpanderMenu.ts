export class ExpanderMenu {
  btn: HTMLElement
  nav: HTMLElement
  breakpoint: MediaQueryList
  firstTabbable: HTMLElement
  lastTabbable: HTMLElement

  constructor (btn: string, nav: string, breakpoint: Number | null) {
    this.btn = document.querySelector(btn)
    this.nav = document.querySelector(nav)
    this.breakpoint = breakpoint
      ? window.matchMedia(`screen and (max-width: ${breakpoint}px)`)
      : null
  }

  init () {
    this.onClick = this.onClick.bind(this)
    this.transitionEnd = this.transitionEnd.bind(this)
    this.onDocumentClick = this.onDocumentClick.bind(this)
    this.onKeydownTabKeyCloseBtn = this.onKeydownTabKeyCloseBtn.bind(this)
    this.onKeydownTabKeyFirstTabbable = this.onKeydownTabKeyFirstTabbable.bind(this)
    this.onKeydownTabKeyLastTabbable = this.onKeydownTabKeyLastTabbable.bind(this)
    this.onKeydownEsc = this.onKeydownEsc.bind(this)

    const tabbableElements = this.nav.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not([disabled])')
    this.firstTabbable = tabbableElements[0]
    this.lastTabbable = tabbableElements[tabbableElements.length - 1]

    const hidden = this.breakpoint
      ? this.breakpoint.matches
      : true
    const checkBreakPoint = () => {
      this.btn.setAttribute('data-expanded', 'false')
      this.btn.setAttribute('aria-expanded', 'false')
      this.nav.setAttribute('aria-hidden', this.breakpoint.matches.toString())
      this.nav.setAttribute('data-hidden', this.breakpoint.matches.toString())
    }

    this.btn.setAttribute('aria-expanded', 'false')
    this.btn.setAttribute('aria-haspopup', 'true')
    this.btn.setAttribute('aria-controls', this.nav.id)
    this.nav.setAttribute('aria-hidden', hidden.toString())
    this.nav.setAttribute('data-hidden', hidden.toString())

    this.listeners()

    if (this.breakpoint) {
      this.breakpoint.addEventListener('change', checkBreakPoint)
    }
  }

  onClick () {
    const toOpen = this.btn.getAttribute('aria-expanded') !== 'true'

    this.addScrollbarWidth(toOpen)
    this.autoInrHeight(toOpen)

    if (toOpen) {
      document.body.setAttribute('data-menu', 'ture')
      this.nav.setAttribute('data-hidden', 'false')
      this.firstTabbable.focus()
      document.addEventListener('click', this.onDocumentClick, false)
      this.btn.addEventListener('keydown', this.onKeydownTabKeyCloseBtn, false)
      this.firstTabbable.addEventListener('keydown', this.onKeydownTabKeyFirstTabbable, false)
      this.lastTabbable.addEventListener('keydown', this.onKeydownTabKeyLastTabbable, false)
      window.addEventListener('keydown', this.onKeydownEsc, false)
    } else {
      document.body.removeAttribute('data-menu')
      document.removeEventListener('click', this.onDocumentClick, false)
      this.btn.removeEventListener('keydown', this.onKeydownTabKeyCloseBtn, false)
      this.firstTabbable.removeEventListener('keydown', this.onKeydownTabKeyFirstTabbable, false)
      this.lastTabbable.removeEventListener('keydown', this.onKeydownTabKeyLastTabbable, false)
      window.removeEventListener('keydown', this.onKeydownEsc, false)
    }

    requestAnimationFrame(() => {
      this.btn.setAttribute('aria-expanded', (toOpen.toString()))
      this.nav.setAttribute('aria-hidden', (!toOpen).toString())
      this.nav.setAttribute('aria-busy', 'true')
    })
  }

  listeners () {
    this.btn.addEventListener('click', this.onClick)
    this.nav.addEventListener('transitionend', this.transitionEnd)
  }

  onDocumentClick (e: MouseEvent) {
    const elRect = this.nav.getBoundingClientRect()
    const isInNav =
      elRect.top <= e.clientY && e.clientY <= elRect.bottom &&
      elRect.left <= e.clientX && e.clientX <= elRect.right
    if (!isInNav) {
      this.onClick()
    }
  }

  private transitionEnd () {
    const isOpen = this.btn.getAttribute('aria-expanded') !== 'false'
    if (!isOpen) {
      this.nav.setAttribute('data-hidden', 'true')
    }
    this.nav.setAttribute('aria-busy', 'false')
  }

  private addScrollbarWidth (toOpen: boolean) {
    if (toOpen) {
      const scrollbarWidth = window.innerWidth - document.body.clientWidth
      document.body.style.marginRight = scrollbarWidth + 'px'
      if (document.querySelector('#menuBtn')) {
        document.querySelector<HTMLElement>('#menuBtn').style.marginRight = scrollbarWidth + 'px'
      }
    } else {
      document.body.style.marginRight = ''
      document.querySelector<HTMLElement>('#menuBtn').style.marginRight = ''
    }
  }

  private autoInrHeight = (toOpen: boolean) => {
    document.documentElement.style.setProperty('--vh', (window.innerHeight) + 'px')
  }

  private onKeydownTabKeyCloseBtn (e: KeyboardEvent) {
    if (e.key !== 'Tab') {
      return
    }
    e.preventDefault()
    if (e.shiftKey) {
      this.lastTabbable.focus()
    } else {
      this.firstTabbable.focus()
    }
  }

  private onKeydownTabKeyFirstTabbable (e: KeyboardEvent) {
    if (e.key !== 'Tab' || !e.shiftKey) {
      return
    }
    e.preventDefault()
    this.lastTabbable.focus()
  }

  private onKeydownTabKeyLastTabbable (e: KeyboardEvent) {
    if (e.key !== 'Tab' || e.shiftKey) {
      return
    }
    e.preventDefault()
    this.firstTabbable.focus()
  }

  private onKeydownEsc (e: KeyboardEvent) {
    if (e.key !== 'Escape') {
      return
    }
    e.preventDefault()
    this.btn.click()
    this.btn.focus()
  }
}
