export class StickyHeader {
  header: HTMLElement
  ticking: boolean
  showFlag: boolean
  posFlag: string
  timer: ReturnType<typeof setTimeout>
  initFlag: boolean
  startPos: number

  constructor (header: string) {
    this.header = document.querySelector(header)
    this.ticking = false
    this.posFlag = 'absolute'
    this.showFlag = true
    this.timer = null
    this.initFlag = false
    this.startPos = window.pageYOffset
  }

  init (): void {
    this.scrollHandler = this.scrollHandler.bind(this)
    this.checkScroll = this.checkScroll.bind(this)

    this.checkInit()
    this.scrollHandler()
    this.addListener()
  }

  checkInit () {
    const hash = location.hash
    this.initFlag = hash !== ''
    setTimeout(() => {
      this.initFlag = false
    }, 2000)
  }

  checkScroll (): void {
    const currentPos = window.pageYOffset
    const headerTop = this.header.getBoundingClientRect().top
    const headerH = this.header.clientHeight
    const dirUp = this.startPos - currentPos

    if (headerTop < -headerH) {
      if (this.initFlag) {
        this.header.classList.add('hide')
        this.showFlag = false
        this.initFlag = false
      } else {
        if (dirUp > 5) {
          if (!this.showFlag) {
            this.header.classList.remove('hide')
            this.showFlag = true
          }
        } else if (dirUp < -5) {
          if (this.showFlag) {
            this.header.classList.add('hide')
            this.showFlag = false
          }
        }
      }
    } else {
      if (!this.showFlag) {
        this.header.classList.remove('hide')
        this.showFlag = true
      }
    }

    if (headerTop < -200) {
      if (this.posFlag === 'absolute') {
        this.header.classList.add('sticky')
        this.posFlag = 'sticky'
      }
    } else {
      if (this.posFlag !== 'absolute' && !this.showFlag) {
        this.header.classList.remove('sticky')
        this.posFlag = 'absolute'
      }
    }

    if (headerTop >= -1) {
      this.header.classList.remove('sticky')
      this.posFlag = 'absolute'
      this.showFlag = true
    }

    this.startPos = currentPos
  }

  scrollHandler () {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.ticking = false
        this.checkScroll()
      })
    }
    this.ticking = true
  }

  addListener () {
    window.addEventListener('scroll', this.scrollHandler, { passive: true })
  }
}
