export class AnchorScroll {
  items: NodeList

  constructor (selector: string) {
    this.items = document.querySelectorAll<HTMLElement>(selector)
  }

  init (): void {
    this.onClick = this.onClick.bind(this)

    Array.from(this.items).forEach(elm => {
      elm.addEventListener('click', this.onClick, false)
    })
  }

  onClick (e: Event & { currentTarget: HTMLInputElement }): void {
    const selector = e.currentTarget.getAttribute('href') || e.currentTarget.getAttribute('xlink:href')
    const hash = selector.substring(selector.indexOf('#'))
    const target = document.querySelector(hash) as HTMLElement | null

    if (target) {
      const pos = target.getBoundingClientRect().top + window.pageYOffset
      const threshold = target.getBoundingClientRect().top < 0
        ? document.getElementById('header')
          ? document.getElementById('header').clientHeight + 20
          : 0
        : 0

      this.pageScroll('window', pos - threshold)
      // 履歴を残さない
      location.replace(hash)
    } else {
      console.log('No target')
    }
  }

  pageScroll (target: string | HTMLElement, y: number) {
    let firstPos: number = 0
    if (typeof target === 'string') {
      firstPos = window.pageYOffset
    } else {
      firstPos = target.scrollTop
    }
    const pos = y < 0 ? 0 : y
    const diff = Number(pos) - Number(firstPos)
    const isUp = diff <= 0
    const easeOut = function (p: number) {
      return p * (2 - p)
    }
    let position = 0
    let progress = 0

    return new Promise(function (resolve: (value?: string) => void, reject: (reason?: any) => void) {
      const move = function () {
        progress++
        position = Number(firstPos) + (diff * easeOut(progress / 30))
        if (typeof target === 'string') {
          window.scrollTo(0, position)
        } else {
          target.scrollTop = position
        }
        if ((isUp && pos < position) ||
          (!isUp && position < pos)) {
          window.requestAnimationFrame(move)
          return
        }
        resolve()
      }
      window.requestAnimationFrame(move)
    })
  }
}
