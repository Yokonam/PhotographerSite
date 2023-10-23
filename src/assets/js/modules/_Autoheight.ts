type bp = {
  SM?: number
  MD?: number
  LG?: number
  XL?: number
  XXL?: number
}

export class AutoHeight {
  parents: string
  children: string
  grandChildren: Array<string>
  column: number
  breakpoints: bp
  bpSM: number
  bpMD: number
  bpLG: number
  bpXL: number
  bpXXL: number
  ticking: boolean

  constructor (parents: string, children: string, grandChildren: Array<string>, column: number, breakpoints: bp) {
    this.parents = parents
    this.children = children
    this.grandChildren = grandChildren
    this.column = column
    this.breakpoints = breakpoints
    this.ticking = false

    this.bpSM = (window as any).BREAK_POINT_SM || 576
    this.bpMD = (window as any).BREAK_POINT_MD || 890
    this.bpLG = (window as any).BREAK_POINT_LG || 1112
    this.bpXL = (window as any).BREAK_POINT_XL || 1366
    this.bpXXL = (window as any).BREAK_POINT_XXL || 1920
  }

  aryMax (a: number, b: number) {
    return Math.max(a, b)
  }

  transpose (a: any) {
    return a[0].map((_: any, c: number) => a.map((r: any) => r[c]))
  }

  resize () {
    const target = document.querySelectorAll(this.parents)
    let column = this.column

    column = this.breakpoints.SM && window.innerWidth >= this.bpSM ? this.breakpoints.SM : column
    column = this.breakpoints.MD && window.innerWidth >= this.bpMD ? this.breakpoints.MD : column
    column = this.breakpoints.LG && window.innerWidth >= this.bpLG ? this.breakpoints.LG : column
    column = this.breakpoints.XL && window.innerWidth >= this.bpXL ? this.breakpoints.XL : column
    column = this.breakpoints.XXL && window.innerWidth >= this.bpXXL ? this.breakpoints.XXL : column

    for (let i = 0; i < target.length; i++) {
      if (target[i].querySelector(this.children)) {
        const children = target[i].querySelectorAll(this.children)
        const _temp = []
        for (let j = 0; j < children.length; j++) {
          const ar = []
          for (let k = 0; k < this.grandChildren.length; k++) {
            const grandChild = <HTMLElement>children[j].querySelector(this.grandChildren[k])
            if (grandChild !== null) {
              grandChild.style.height = ''
              ar.push(grandChild.clientHeight)
            }
          }
          _temp.push(ar)
        }

        const grandChildHeightArray = this.transpose(_temp)

        let a = 0
        for (let j = 0; j < children.length; j++) {
          a = j / column < a ? a : a + 1
          const min = a * column - column
          const max = a * column

          for (let k = 0; k < this.grandChildren.length; k++) {
            const grandChild = <HTMLElement>children[j].querySelector(this.grandChildren[k])
            if (grandChild !== null) {
              const lineHeight = grandChildHeightArray[k].slice(min, max)
              const maxHeight = Math.max(lineHeight.reduce(this.aryMax))

              if (column !== 1) {
                grandChild.style.height = maxHeight + 'px'
              } else {
                grandChild.style.height = ''
              }
            }
          }
        }

        (target[i] as HTMLElement).style.visibility = 'visible'
      }
    }
  }

  resizeHandler () {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.ticking = false
        this.resize()
      })
    }
    this.ticking = true
  }

  init () {
    if (!document.querySelector(this.parents)) return
    window.addEventListener('load', () => {
      this.resize()
    })
    window.addEventListener('resize', () => {
      this.resizeHandler()
    }, { passive: false })
  }
}
