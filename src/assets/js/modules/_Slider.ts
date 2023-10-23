type Atts = {
  element: string,
  duration?: number,
  autoSlider?: number,
  arrow?: boolean,
  navigation?: boolean,
  loop?: boolean
}

export class Slider {
  slider: HTMLElement
  duration: number // スライダーのスピード
  autoSlider: number
  sliderCnt: HTMLElement
  sliderList: HTMLElement
  sliderItems: NodeList
  sliderImgs: NodeList
  sliderLinks: NodeList
  prevbtn: HTMLButtonElement
  nextbtn: HTMLButtonElement
  navbar: HTMLElement
  current: number // 現在のスライドのnumber
  currentPosition: number // 現在の__listのY座標
  total: number // スライダーの枚数
  itemSize: number // スライダーのサイズ
  animation: ReturnType<typeof setInterval>
  autoPlay: ReturnType<typeof setTimeout>

  touchEvent: boolean
  dragFlag: boolean
  initPosX: number
  initPosY: number
  scrollLeft: number
  velX: number

  loop: boolean
  arrow: boolean
  navigation: boolean

  constructor (
    atts: Atts = {
      element: '.slider',
      duration: 2000,
      autoSlider: 0,
      arrow: false,
      navigation: false,
      loop: false
    }) {
    this.slider = document.querySelector<HTMLElement>(atts.element)
    this.duration = atts.duration
    this.autoSlider = atts.autoSlider

    this.sliderCnt = this.slider.querySelector(atts.element + '__cnt')
    this.sliderList = this.slider.querySelector(atts.element + '__list')
    this.sliderItems = this.slider.querySelectorAll<HTMLElement>(atts.element + '__item')
    this.sliderImgs = this.slider.querySelectorAll<HTMLElement>(atts.element + '__item img')
    this.sliderLinks = this.slider.querySelectorAll<HTMLElement>(atts.element + '__item a')

    this.prevbtn = this.slider.querySelector('.prev')
    this.nextbtn = this.slider.querySelector('.next')
    this.navbar = this.slider.querySelector(atts.element + '__navigation')

    this.current = 0
    this.currentPosition = 0
    this.total = this.sliderItems.length
    this.itemSize = 0
    this.animation = null
    this.autoPlay = null

    this.touchEvent = false
    this.dragFlag = false
    this.initPosX = 0
    this.initPosY = 0
    this.scrollLeft = 0
    this.velX = 0

    this.loop = atts.loop
    this.arrow = atts.arrow
    this.navigation = atts.navigation

    this.goto = this.goto.bind(this)
    this.move = this.move.bind(this)

    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
  }

  run (): void {
    this.init()
    this.addListener()
    if (this.autoSlider > 0) {
      this.auto()
    }
  }

  init () {
    ;[...this.sliderImgs].forEach(el => {
      (el as HTMLElement).setAttribute('draggable', 'false')
    })
    ;[...this.sliderLinks].forEach(el => {
      (el as HTMLElement).setAttribute('draggable', 'false')
    })

    if (this.loop) {
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < this.total; j++) {
          this.sliderList.appendChild(this.sliderItems[j].cloneNode(true))
        }
      }
      this.itemSize = (this.sliderItems[0] as HTMLElement).clientWidth
      this.currentPosition = -this.itemSize * this.total
      this.sliderList.style.transform = `translateX(${this.currentPosition}px)`
    } else {
      if (this.arrow) {
        if (this.current === 0) {
          this.prevbtn.disabled = true
        }
      }
    }

    if (this.navigation) {
      for (let i = 0; i < this.sliderItems.length; i++) {
        const span = document.createElement('span')
        this.navbar.appendChild(span)
      }
      this.currentNavigation(this.current)
    }
  }

  goto (num: number, nav: boolean) {
    const i = num > this.total - 1
      ? 0
      : num < 0
        ? this.total - 1
        : num

    if (!this.loop && this.arrow) {
      if (num >= this.total - 1) {
        this.nextbtn.disabled = true
      } else {
        this.nextbtn.disabled = false
      }
      if (num <= 0) {
        this.prevbtn.disabled = true
      } else {
        this.prevbtn.disabled = false
      }
    }

    if (!this.loop && this.arrow) {
      if (num > this.total - 1 || num < 0) return
    }
    if (this.loop) {
      if (num > this.total - 1) {
        this.currentPosition = -this.itemSize * (this.total - 1)
      } else if (num < 0) {
        this.currentPosition = -this.itemSize * this.total * 2
      }
    }

    this.itemSize = (this.sliderItems[0] as HTMLElement).clientWidth

    const threshold = this.loop ? -this.itemSize * this.total : 0
    const range = -this.itemSize * i + threshold
    this.current = i
    this.move(this.currentPosition, range, nav)
    this.currentNavigation(this.current)

    // console.log(i)
    if (this.autoPlay && nav) {
      clearTimeout(this.autoPlay)
    }
  }

  move (position: number, range: number, nav: boolean): void {
    clearInterval(this.animation)
    const fps = 100
    const end = this.duration * fps / 1000
    const c = range - position // 変化量
    let progress = 0
    this.currentPosition = position

    this.animation = setInterval(() => {
      progress++
      this.currentPosition = this.easing(progress, position, c, end)

      if (Math.abs(progress - end) < 1) {
        clearInterval(this.animation)
        this.currentPosition = range
        if (this.autoSlider > 0 && nav) {
          this.auto()
        }
      }

      this.sliderList.style.transform = `translateX(${this.currentPosition}px)`
    }, 1000 / fps)
  }

  auto (): void {
    this.autoPlay = setTimeout(() => {
      this.goto(this.current + 1, false)
      this.auto()
    }, this.autoSlider)
  }

  onMouseDown (e: MouseEvent) {
    this.touchEvent = e.type === 'touchstart'
    this.dragFlag = true
    this.initPosX = e.pageX
    this.initPosY = e.pageY
    this.scrollLeft = this.currentPosition
    this.velX = 0
    this.itemSize = (this.sliderItems[0] as HTMLElement).clientWidth

    // キャンセル
    clearInterval(this.animation)
    if (this.autoPlay) {
      clearTimeout(this.autoPlay)
    }
  }

  onMouseMove (e: MouseEvent) {
    if (!this.dragFlag) return false

    const walkX = this.initPosX - e.pageX
    const walkY = this.initPosY - e.pageY
    const prevScrollLeft = this.currentPosition

    if (this.touchEvent && Math.abs(walkX / walkY) > 2) {
      e.preventDefault()
    }

    this.currentPosition = this.scrollLeft - walkX

    if (!this.loop) {
      if (this.currentPosition > 600 && this.currentPosition > 0) {
        this.currentPosition = 600
      } else if (this.currentPosition < -this.itemSize * (this.total - 1) - 600) {
        this.currentPosition = -this.itemSize * (this.total - 1) - 600
      }
    } else {
      if (this.currentPosition > -this.itemSize * this.total) {
        this.currentPosition = this.scrollLeft - walkX - this.itemSize * this.total
      } else if (this.currentPosition < -this.itemSize * (this.total + this.total - 1)) {
        this.currentPosition = this.scrollLeft - walkX + this.itemSize * this.total
      }
    }
    this.velX = this.currentPosition - prevScrollLeft
    this.sliderList.style.transform = `translateX(${this.currentPosition}px)`
  }

  onMouseUp (e: MouseEvent) {
    if (this.dragFlag) {
      this.dragFlag = false
      this.snap()
    }
  }

  snap () {
    const dist = this.currentPosition + this.velX * 10
    let num = 0
    if (!this.loop) {
      ;[...this.sliderItems].forEach((el, i) => {
        const max = -this.itemSize * (0.5 + i - 1)
        const min = max - this.itemSize
        if (max > dist && dist > min) {
          num = i
        }
        if (dist < -this.itemSize * (0.5 + this.total - 1)) {
          num = this.total - 1
        }
      })
    } else {
      for (let i = 0; i < this.total * 3; i++) {
        const max = -this.itemSize * (0.5 + i - 1)
        const min = max - this.itemSize
        if (max > dist && dist > min) {
          num = i - this.total
        }
      }
    }

    // console.log(num)
    this.goto(num, true)
  }

  currentNavigation (n: number) {
    if (!this.navigation) return false
    const navItems = this.navbar.querySelectorAll('span')
    ;[...navItems].forEach((el, i) => {
      if (n === i) {
        el.dataset.current = 'true'
      } else {
        el.dataset.current = 'false'
      }
    })
  }

  addListener (): void {
    if (this.arrow) {
      this.nextbtn.addEventListener('click', () => {
        this.goto(this.current + 1, true)
      }, false)

      this.prevbtn.addEventListener('click', () => {
        this.goto(this.current - 1, true)
      }, false)
    }

    if (this.navigation) {
      const navItems = this.navbar.querySelectorAll('span')
      ;[...navItems].forEach((el, i) => {
        el.onclick = () => {
          this.goto(i, true)
        }
      })
    }

    this.sliderCnt.addEventListener('mousedown', this.onMouseDown, false)
    this.sliderCnt.addEventListener('mousemove', this.onMouseMove, false)
    this.sliderCnt.addEventListener('mouseup', this.onMouseUp, false)
    this.sliderCnt.addEventListener('mouseleave', this.onMouseUp, false)

    this.sliderCnt.addEventListener('touchstart', this.onMouseDown, false)
    this.sliderCnt.addEventListener('touchmove', this.onMouseMove, false)
    this.sliderCnt.addEventListener('touchend', this.onMouseUp, false)
  }

  /**
   * easeOutExpo
   * @param t アニメーションの経過時間
   * @param b 始点
   * @param c 変化量
   * @param d 変化にかける時間
   * @returns 到達距離
   */
  easing (t: number, b: number, c: number, d: number): number {
    return t === d
      ? b + c
      : c * (-Math.pow(2, (-10 * t) / d) + 1) + b
  }
}
