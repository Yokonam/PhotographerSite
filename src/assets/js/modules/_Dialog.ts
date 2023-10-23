interface HTMLElementEvent<T extends EventTarget> extends Event {
  currentTarget: T
}

export class Dialog {
  dialogOpenClass: string
  media: string
  selector: string
  dialogClass: string
  triggers: NodeList
  closeBtn: NodeList
  dialog: NodeList

  currentDialog: HTMLElement
  ignoreUtilFocusChanges: boolean
  firstFocus: Element
  lastFocus: Element
  afterClosingFocus: HTMLInputElement
  currentType: string
  isAnimating: boolean
  documentFocusable: Element
  observer: ResizeObserver

  constructor (attr: {
    selector: string
    dialogClass: string
  }) {
    this.dialogOpenClass = 'has-dialog'
    this.media = '(max-width: 575px)'
    this.selector = attr.selector
    this.dialogClass = attr.dialogClass
    this.triggers = document.querySelectorAll(`[${attr.selector}`)
    this.closeBtn = document.querySelectorAll(`[${attr.selector}-close]`)

    this.ignoreUtilFocusChanges = false
    this.firstFocus = null
    this.lastFocus = null
    this.afterClosingFocus = null
    this.isAnimating = false
    this.observer = null
  }

  init (): void {
    this.openDialog = this.openDialog.bind(this)
    this.closeDialog = this.closeDialog.bind(this)
    this.onDocumentClick = this.onDocumentClick.bind(this)
    this.handleEscape = this.handleEscape.bind(this)
    this.trapFocus = this.trapFocus.bind(this)
    this.setIframeHeight = this.setIframeHeight.bind(this)

    this.listeners()
  }

  listeners (): void {
    Array.from(this.triggers).forEach(el => {
      el.addEventListener('click', (e: HTMLElementEvent<HTMLInputElement>) => {
        this.openDialog(e)
      }, false)
    })
    Array.from(this.closeBtn).forEach(el => {
      el.addEventListener('click', this.closeDialog, false)
    })
  }

  openDialog (e: HTMLElementEvent<HTMLInputElement> | string, t?: string, ratio?: string, s?: string, c?: string) {
    this.isAnimating = true
    let dialogId = ''
    let wrapper = ''
    let x2 = ''
    let sp = ''
    let cap = ''

    if (typeof e !== 'string') {
      e.preventDefault()
      if (e.currentTarget.getAttribute('href')) {
        dialogId = e.currentTarget.getAttribute('href').replace(/#/, '')
      } else {
        dialogId = e.currentTarget.getAttribute(`${this.selector}`)
      }
      if (e.currentTarget.dataset.caption) {
        cap = e.currentTarget.dataset.caption
      }
      this.currentType = e.currentTarget.getAttribute(`${this.selector}-type`) || 'inline'
      this.afterClosingFocus = e.currentTarget
    } else {
      this.currentType = t || 'inline'
      dialogId = e
      x2 = ratio
      sp = s
      cap = c
    }

    if (this.currentType === 'inline') {
      this.currentDialog = document.getElementById(dialogId)
    } else {
      if (this.currentType === 'iframe') {
        wrapper = `<div class="${this.dialogClass}__wrap">
            <div class="${this.dialogClass}__cnt">
              <div class="${this.dialogClass}__main" data-main tabindex="0">
                <div class="${this.dialogClass}__inr">
                  <iframe src="${dialogId}" scrolling="no"></iframe>
                  <div class="${this.dialogClass}__close-bottom">
                    <button type="button" class="c-btn close"><span>閉じる</span></button>
                  </div>
                </div>
                <button type="button" class="${this.dialogClass}__close close" aria-label="モーダルを閉じる"></button>
              </div>
            </div>
          </div>`
      } else if (this.currentType === 'img') {
        x2 = typeof e === 'string'
          ? x2
          : e.currentTarget.getAttribute('data-ratio')
        sp = typeof e === 'string'
          ? sp
          : e.currentTarget.getAttribute('data-sp')

        wrapper = `<div class="${this.dialogClass}__wrap">
          <div class="${this.dialogClass}__cnt img">
            <div class="${this.dialogClass}__main " data-main tabindex="0">
            ${sp
              ? `<picture>
                  <source media="${this.media}" srcset="${sp}">`
              : ''
            }
              <img src="${dialogId}" ${x2 ? `srcset="${x2} 2x"` : ''} alt="">
              ${sp
                ? '</picture>'
                : ''
              }
              ${cap
                ? `<p>${cap}</p>`
                : ''
              }
              <button type="button" class="${this.dialogClass}__close close" aria-label="モーダルを閉じる"></button>
            </div>
          </div>
        </div>`
      } else if (this.currentType === 'youtube') {
        wrapper = `<div class="${this.dialogClass}__wrap">
            <div class="${this.dialogClass}__cnt">
              <div class="${this.dialogClass}__main" data-main tabindex="0">
                <div class="${this.dialogClass}__video">
                  <iframe width="560" height="315" src="https://www.youtube.com/embed/${dialogId}?rel=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
                <button type="button" class="${this.dialogClass}__close close" aria-label="モーダルを閉じる"></button>
              </div>
            </div>
          </div>`
      }

      const dialog = document.createElement('div')

      dialog.classList.add('c-dialog')
      dialog.classList.add('-closing')
      dialog.setAttribute('aria-hidden', 'true')
      dialog.setAttribute('aria-modal', 'true')
      dialog.setAttribute('role', 'dialog')
      dialog.innerHTML = wrapper

      document.body.appendChild(dialog)

      const closeBtn = dialog.querySelectorAll('.close')

      ;[...closeBtn].forEach((elm: HTMLElement) => {
        elm.onclick = (e: Event) => {
          this.closeDialog(e)
        }
      })

      this.currentDialog = dialog
    }

    const _currentDialog = this.currentDialog

    if (!_currentDialog) {
      console.log('No target dialog')
      return false
    }

    requestAnimationFrame(() => _currentDialog.setAttribute('aria-hidden', 'false'))

    this.addScrollbarWidth(true)
    _currentDialog.classList.remove('-closing')
    document.body.classList.add(this.dialogOpenClass)

    document.addEventListener('click', this.onDocumentClick, false)
    document.addEventListener('keydown', this.handleEscape, false)
    document.addEventListener('focus', this.trapFocus, true)

    if (this.currentType === 'img') {
      this.setImgSize()
    }

    if (this.currentType === 'iframe') {
      const iframe = _currentDialog.querySelector('iframe')
      iframe.contentWindow.addEventListener('DOMContentLoaded', this.setIframeHeight, false)
    }

    const documentFocusable = document.createElement('div')
    documentFocusable.setAttribute('tabindex', '0')
    document.body.appendChild(documentFocusable)
    this.documentFocusable = documentFocusable

    this.lastFocus = document.activeElement
    this.focusFirstDescendant(_currentDialog)

    _currentDialog.addEventListener('transitionend', (() => {
      return function f () {
        this.isAnimating = false
        _currentDialog.removeEventListener('transitionend', f)
      }
    })().bind(this), { once: true })
  }

  closeDialog (e: Event): void {
    if (this.isAnimating) return

    e.stopPropagation()
    const _currentDialog = this.currentDialog
    const _documentFocusable = this.documentFocusable

    _currentDialog.setAttribute('aria-hidden', 'true')

    _currentDialog.addEventListener('transitionend', () => {
      this.addScrollbarWidth(false)
      _currentDialog.classList.add('-closing')

      document.body.classList.remove(this.dialogOpenClass)

      if (this.currentType === 'iframe' && this.observer !== null) {
        const iframe = _currentDialog.querySelector('iframe')
        iframe.contentWindow.removeEventListener('DOMContentLoaded', this.setIframeHeight, false)
        this.observer.disconnect()
      }

      if (this.currentType !== 'inline') {
        document.body.removeChild(_currentDialog)
      }

      if (this.afterClosingFocus) {
        this.afterClosingFocus.focus()
      }
      document.body.removeChild(_documentFocusable)
    }, { once: true })

    document.removeEventListener('click', this.onDocumentClick, false)
    document.removeEventListener('keydown', this.handleEscape, false)
    document.removeEventListener('focus', this.trapFocus, true)
  }

  onDocumentClick (e: MouseEvent): void {
    const elRect = this.currentDialog.querySelector('[data-main]').getBoundingClientRect()

    const isInDialog =
      elRect.top <= e.clientY && e.clientY <= elRect.bottom &&
      elRect.left <= e.clientX && e.clientX <= elRect.right

    if (!isInDialog) {
      this.closeDialog(e)
    }
  }

  addScrollbarWidth (toOpen: boolean): void {
    if (toOpen) {
      const scrollbarWidth = window.innerWidth - document.body.clientWidth
      document.body.style.marginRight = scrollbarWidth + 'px'
    } else {
      document.body.style.marginRight = ''
    }
  }

  setIframeHeight () {
    if (this.currentType === 'iframe') {
      const iframe = this.currentDialog.querySelector('iframe')
      const iframeBody = iframe.contentDocument.body

      this.observer = new ResizeObserver((entries) => {
        iframe.style.height = entries[0].contentRect.height + 'px'
      })

      this.observer.observe(iframeBody)
    }
  }

  setImgSize () {
    const img = this.currentDialog.querySelector('img')
    img.onload = () => {
      const cnt = this.currentDialog.querySelector<HTMLElement>(`.${this.dialogClass}__cnt`)
      cnt.style.maxWidth = img.width + 'px'
    }
  }

  handleEscape (e: KeyboardEvent) {
    if (e.key === 'Escape' && this.currentDialog) {
      e.stopPropagation()
      this.closeDialog(e)
    }
  }

  trapFocus (e: Event) {
    if (this.ignoreUtilFocusChanges) {
      return
    }

    if (this.currentDialog.contains(e.target as HTMLInputElement)) {
      this.lastFocus = e.target as HTMLInputElement
    } else {
      this.focusFirstDescendant(this.currentDialog)
      if (this.lastFocus === document.activeElement) {
        this.focusLastDescendant(this.currentDialog)
      }
      this.lastFocus = document.activeElement as HTMLInputElement
    }
  }

  focusFirstDescendant (el: HTMLElement) {
    for (let i = 0; i < el.childNodes.length; i++) {
      const child = el.childNodes[i]
      if (this.attemptFocus(child as HTMLInputElement) || this.focusFirstDescendant(child as HTMLInputElement)) {
        return true
      }
    }
    return false
  }

  focusLastDescendant (el: Node) {
    for (let i = el.childNodes.length - 1; i >= 0; i--) {
      const child = el.childNodes[i]
      if (this.attemptFocus(child as HTMLInputElement) ||
        this.focusLastDescendant(child)) {
        return true
      }
    }
    return false
  }

  attemptFocus (el: HTMLInputElement) {
    if (!this.isFocusable(el)) {
      return false
    }
    this.ignoreUtilFocusChanges = true
    try {
      el.focus()
    } catch (e) {}

    this.ignoreUtilFocusChanges = false

    return (document.activeElement === el)
  }

  isFocusable (el: HTMLInputElement | HTMLAnchorElement) {
    if (el.tabIndex > 0 || (el.tabIndex === 0 && el.getAttribute('tabIndex') !== null)) {
      return true
    }

    if ((el as HTMLInputElement).disabled) {
      return false
    }

    switch (el.nodeName) {
      case 'A':
        return !!(el as HTMLAnchorElement).href && (el as HTMLAnchorElement).rel !== 'ignore'
      case 'INPUT':
        return el.type !== 'hidden' && el.type !== 'file'
      case 'BUTTON':
      case 'SELECT':
      case 'TEXTAREA':
        return true
      default:
        return false
    }
  }
}
