export class Accordion {
  acc: string
  items: NodeList

  constructor (acc: string) {
    this.acc = acc
    this.items = document.querySelectorAll(acc)
  }

  init (): void {
    Array.from(this.items).forEach((elm: HTMLElement) => {
      const btn = elm.querySelector(this.acc + '__btn')
      const cnt = elm.querySelector(this.acc + '__cnt')

      const rand = Math.random().toString(36).substring(2, 6)
      const btnId = btn.getAttribute('id') ? btn.getAttribute('id') : 'btn-' + rand
      const cntId = 'cnt-' + rand
      const expanded = btn.getAttribute('aria-expanded') === 'true'

      // 初期設定
      btn.setAttribute('id', btnId)
      btn.setAttribute('role', 'button')
      btn.setAttribute('aria-controls', cntId)
      btn.setAttribute('aria-expanded', expanded.toString())
      btn.setAttribute('tabindex', '0')
      cnt.setAttribute('id', cntId)
      cnt.setAttribute('role', 'region')
      cnt.setAttribute('aria-labelledby', btnId)
      cnt.setAttribute('aria-hidden', (!expanded).toString())
      if (!expanded) {
        cnt.classList.add('-closing')
      }

      btn.addEventListener('click', this.onClick, false)
      btn.addEventListener('keypress', this.onClick, false)
      cnt.addEventListener('transitionend', this.transitionEnd, false)
    })
  }

  onClick (e: Event | KeyboardEvent): void {
    if (e instanceof KeyboardEvent && e.code !== 'Enter') return

    e.preventDefault()

    const btn = e.currentTarget as HTMLInputElement
    const cnt = document.getElementById(btn.getAttribute('aria-controls'))
    const expanded = btn.getAttribute('aria-expanded') === 'true'

    if (!expanded) {
      cnt.classList.remove('-closing')
    }

    requestAnimationFrame(() => {
      btn.setAttribute('aria-expanded', (!expanded).toString())
      cnt.setAttribute('aria-hidden', expanded.toString())
    })
  }

  transitionEnd (e: Event) {
    const cnt = e.currentTarget as HTMLInputElement
    const isOpen = cnt.getAttribute('aria-hidden') === 'true'
    if (isOpen) {
      cnt.classList.add('-closing')
    }
  }
}

export class AccordionMobile extends Accordion {
  breakpoint: MediaQueryList

  constructor (acc: string, breakpoint: Number) {
    super(acc)
    this.breakpoint = window.matchMedia(`screen and (max-width: ${breakpoint}px)`)
  }

  mobile (): void {
    this.checkBreakPoint = this.checkBreakPoint.bind(this)
    this.checkBreakPoint()

    // IE非対応の場合
    this.breakpoint.addEventListener('change', this.checkBreakPoint, { once: true })

    // IE11 対応の場合
    // this.breakpoint.addListener(this.checkBreakPoint)
  }

  checkBreakPoint () {
    const isMobile = this.breakpoint.matches
    if (isMobile) {
      this.init()
    }
  }
}
