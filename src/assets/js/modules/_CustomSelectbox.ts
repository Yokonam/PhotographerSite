const SelectActions = {
  Close: 0,
  CloseSelect: 1,
  First: 2,
  Last: 3,
  Next: 4,
  Open: 5,
  PageDown: 6,
  PageUp: 7,
  Previous: 8,
  Select: 9,
  Type: 10
}

export class CustomSelectbox {
  selectElm: HTMLSelectElement
  selector: string
  el: HTMLElement
  comboEl: HTMLElement
  listboxEl: HTMLElement
  optionsNum: number
  open: boolean
  activeIndex: number
  options: Array<HTMLOptionElement>
  searchTimeout: number
  searchString: string
  ignoreBlur: boolean
  idBase: string

  constructor (el: HTMLElement) {
    this.selector = '.c-form-select'
    this.el = el
    this.comboEl = null
    this.listboxEl = null
    this.optionsNum = 0
    this.open = false
    this.activeIndex = 0
    this.options = []
    this.searchTimeout = null
    this.searchString = ''
    this.ignoreBlur = false
    this.idBase = Math.random().toString(36).substring(2, 6)
  }

  init () {
    this.selectElm = this.el.querySelector('select')
    this.options = Array.from(this.el.querySelectorAll('option'))
    this.comboEl = document.createElement('div')
    this.listboxEl = document.createElement('div')

    this.optionsNum = this.options.length

    this.comboEl.classList.add(this.selector.replace(/./, '') + '__trigger')
    this.listboxEl.classList.add(this.selector.replace(/./, '') + '__cnt')

    const fragment = document.createDocumentFragment()
    let selectedTxt = ''
    let selectedTxtFirst = ''

    const triggerId = 'trigger-' + this.idBase
    const cntId = 'cnt-' + this.idBase

    this.options.forEach((option, i) => {
      const op: HTMLElement = document.createElement('div')
      // const div = document.createElement('div')
      op.innerHTML = option.text
      op.dataset.val = option.value
      op.setAttribute('role', 'option')
      op.id = `op-${this.idBase}-${i}`
      if (option.selected) {
        selectedTxt = option.text
        op.setAttribute('aria-selected', 'true')
      }
      if (!selectedTxtFirst) {
        selectedTxtFirst = option.text
      }
      if (option.disabled) {
        op.dataset.disabled = 'true'
      }
      op.setAttribute('aria-selected', option.selected ? 'true' : 'false')
      fragment.appendChild(op)

      op.addEventListener('click', (event) => {
        event.stopPropagation()
        this.onOptionClick(i)
      })
      op.addEventListener('mousedown', this.onOptionMouseDown.bind(this))
    })

    this.listboxEl.appendChild(fragment)
    this.el.appendChild(this.comboEl)
    this.el.appendChild(this.listboxEl)
    this.comboEl.innerHTML = selectedTxt || selectedTxtFirst
    this.selectElm.setAttribute('tabindex', '-1')

    if (this.el.dataset.labelledby) {
      this.comboEl.setAttribute('aria-labelledby', this.el.dataset.labelledby)
      this.listboxEl.setAttribute('aria-labelledby', this.el.dataset.labelledby)
    } else if (this.el.dataset.label) {
      this.comboEl.setAttribute('aria-label', this.el.dataset.label)
      this.listboxEl.setAttribute('aria-labelledby', this.el.dataset.label)
    }
    this.comboEl.setAttribute('id', triggerId)
    this.comboEl.setAttribute('role', 'combobox')
    this.comboEl.setAttribute('aria-controls', cntId)
    this.comboEl.setAttribute('aria-expanded', 'false')
    this.comboEl.setAttribute('aria-haspopup', 'listbox')
    this.comboEl.setAttribute('tabindex', '0')
    this.listboxEl.setAttribute('id', cntId)
    this.listboxEl.setAttribute('role', 'listbox')
    this.listboxEl.setAttribute('aria-hidden', 'true')
    this.listboxEl.classList.add('-closing')

    this.comboEl.addEventListener('blur', this.onComboBlur.bind(this))
    this.comboEl.addEventListener('click', this.onComboClick.bind(this))
    this.comboEl.addEventListener('keydown', this.onComboKeyDown.bind(this))
  }

  onComboKeyDown (event: any) {
    const { key } = event
    const max = this.optionsNum - 1
    const action = CustomSelectbox.getActionFromKey(event, this.open)

    switch (action) {
      case SelectActions.Last:
      case SelectActions.First:
        this.updateMenuState(true)
      // intentional fallthrough
      case SelectActions.Next:
      case SelectActions.Previous:
      case SelectActions.PageUp:
      case SelectActions.PageDown:
        event.preventDefault()
        return this.onOptionChange(
          CustomSelectbox.getUpdatedIndex(this.activeIndex, max, action)
        )
      case SelectActions.CloseSelect:
        event.preventDefault()
        this.selectOption(this.activeIndex)
      // intentional fallthrough
      case SelectActions.Close:
        event.preventDefault()
        return this.updateMenuState(false)
      case SelectActions.Type:
        return this.onComboType(key)
      case SelectActions.Open:
        event.preventDefault()
        return this.updateMenuState(true)
    }
  }

  onComboType (letter: string) {
    // open the listbox if it is closed
    this.updateMenuState(true)

    // find the index of the first matching option
    const searchString = this.getSearchString(letter)
    const searchIndex = CustomSelectbox.getIndexByLetter(
      this.options,
      searchString,
      this.activeIndex + 1
    )

    // if a match was found, go to it
    if (searchIndex >= 0) {
      this.onOptionChange(searchIndex)
    } else {
      window.clearTimeout(this.searchTimeout)
      this.searchString = ''
    }
  }

  getSearchString (char: string) {
    // reset typing timeout and start new timeout
    // this allows us to make multiple-letter matches, like a native select
    if (typeof this.searchTimeout === 'number') {
      window.clearTimeout(this.searchTimeout)
    }

    this.searchTimeout = window.setTimeout(() => {
      this.searchString = ''
    }, 500)

    // add most recent letter to saved search string
    this.searchString += char
    return this.searchString
  }

  onOptionClick (index: number) {
    this.onOptionChange(index)
    this.selectOption(index)
    this.updateMenuState(false)
  }

  onOptionMouseDown () {
    this.ignoreBlur = true
  }

  updateMenuState (open: boolean, callFocus = true) {
    if (this.open === open) {
      return
    }
    // update state
    this.open = open

    // update aria-expanded and styles
    this.comboEl.setAttribute('aria-expanded', `${open}`)
    open ? this.listboxEl.classList.remove('-closing') : this.listboxEl.classList.add('-closing')

    requestAnimationFrame(() => {
      this.comboEl.setAttribute('aria-expanded', open.toString())
      this.listboxEl.setAttribute('aria-hidden', (!open).toString())
    })

    // update activedescendant
    const activeID = open ? `op-${this.idBase}-${this.activeIndex}` : ''
    this.comboEl.setAttribute('aria-activedescendant', activeID)
    if (activeID === '' && !CustomSelectbox.isElementInView(this.comboEl)) {
      this.comboEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
    // move focus back to the combobox, if needed
    callFocus && this.comboEl.focus()
  }

  onOptionChange (index: number) {
    // update state
    this.activeIndex = index
    this.comboEl.setAttribute('aria-activedescendant', `op-${this.idBase}-${index}`)
    const options = Array.from(this.listboxEl.querySelectorAll('[role=option]'))
    options.forEach((optionEl) => {
      optionEl.setAttribute('aria-selected', 'false')
    })
    options[index].setAttribute('aria-selected', 'true')
    this.selectElm.selectedIndex = index
    // ensure the new option is in view
    if (CustomSelectbox.isScrollable(this.listboxEl)) {
      CustomSelectbox.maintainScrollVisibility(options[index], this.listboxEl)
    }
    if (!CustomSelectbox.isElementInView(options[index])) {
      options[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }

    this.selectElm.dispatchEvent(new Event('change', { bubbles: true, composed: false }))
  }

  selectOption (index: number) {
    // update state
    this.activeIndex = index

    const options = Array.from(this.listboxEl.querySelectorAll('[role=option]'))
    options.forEach((optionEl) => {
      optionEl.setAttribute('aria-selected', 'false')
    })
    options[index].setAttribute('aria-selected', 'true')
    this.comboEl.innerHTML = options[index].innerHTML
  }

  onComboBlur () {
    // do not do blur action if ignoreBlur flag has been set
    if (this.ignoreBlur) {
      this.ignoreBlur = false
      return
    }

    // select current option and close
    if (this.open) {
      this.selectOption(this.activeIndex)
      this.updateMenuState(false, false)
    }
  }

  onComboClick () {
    this.updateMenuState(!this.open, false)
  }

  // static transitionEnd (e: Event) {
  //   const cnt = e.currentTarget as HTMLInputElement
  //   const isOpen = cnt.getAttribute('aria-hidden') === 'true'
  //   if (isOpen) {
  //     cnt.classList.add('-closing')
  //   }
  // }

  static getActionFromKey (event: any, menuOpen: any) {
    const { key, altKey, ctrlKey, metaKey } = event
    const openKeys = ['ArrowDown', 'ArrowUp', 'Enter', ' ']
    // handle opening when closed
    if (!menuOpen && openKeys.includes(key)) {
      return SelectActions.Open
    }

    // home and end move the selected option when open or closed
    if (key === 'Home') {
      return SelectActions.First
    }
    if (key === 'End') {
      return SelectActions.Last
    }

    // handle typing characters when open or closed
    if (
      key === 'Backspace' ||
      key === 'Clear' ||
      (key.length === 1 && key !== ' ' && !altKey && !ctrlKey && !metaKey)
    ) {
      return SelectActions.Type
    }

    // handle keys when open
    if (menuOpen) {
      if (key === 'ArrowUp' && altKey) {
        return SelectActions.CloseSelect
      } else if (key === 'ArrowDown' && !altKey) {
        return SelectActions.Next
      } else if (key === 'ArrowUp') {
        return SelectActions.Previous
      } else if (key === 'PageUp') {
        return SelectActions.PageUp
      } else if (key === 'PageDown') {
        return SelectActions.PageDown
      } else if (key === 'Escape') {
        return SelectActions.Close
      } else if (key === 'Enter' || key === ' ') {
        return SelectActions.CloseSelect
      }
    }
  }

  static getUpdatedIndex (currentIndex: number, maxIndex: number, action: any) {
    const pageSize = 10
    switch (action) {
      case SelectActions.First:
        return 0
      case SelectActions.Last:
        return maxIndex
      case SelectActions.Previous:
        return Math.max(0, currentIndex - 1)
      case SelectActions.Next:
        return Math.min(maxIndex, currentIndex + 1)
      case SelectActions.PageUp:
        return Math.max(0, currentIndex - pageSize)
      case SelectActions.PageDown:
        return Math.min(maxIndex, currentIndex + pageSize)
      default:
        return currentIndex
    }
  }

  static getIndexByLetter (options: Array<HTMLElement>, filter: string, startIndex = 0) {
    const orderedOptions = [
      ...options.slice(startIndex),
      ...options.slice(0, startIndex)
    ]
    const firstMatch = CustomSelectbox.filterOptions(orderedOptions, filter)[0]
    const allSameLetter = (array: any) => array.every((letter: string) => letter === array[0])

    // first check if there is an exact match for the typed string
    if (firstMatch) {
      return options.indexOf(firstMatch)
    } else if (allSameLetter(filter.split(''))) {
      const matches = CustomSelectbox.filterOptions(orderedOptions, filter[0])
      return options.indexOf(matches[0])
    } else {
      return -1
    }
  }

  static filterOptions (options: Array<HTMLElement> = [], filter: string, exclude: any = []) {
    return options.filter((option: any) => {
      const matches = option.toLowerCase().indexOf(filter.toLowerCase()) === 0
      return matches && exclude.indexOf(option) < 0
    })
  }

  static isScrollable (element: any) {
    return element && element.clientHeight < element.scrollHeight
  }

  static maintainScrollVisibility (activeElement: any, scrollParent: any) {
    const { offsetHeight, offsetTop } = activeElement
    const { offsetHeight: parentOffsetHeight, scrollTop } = scrollParent

    const isAbove = offsetTop < scrollTop
    const isBelow = offsetTop + offsetHeight > scrollTop + parentOffsetHeight

    if (isAbove) {
      scrollParent.scrollTo(0, offsetTop)
    } else if (isBelow) {
      scrollParent.scrollTo(0, offsetTop - parentOffsetHeight + offsetHeight)
    }
  }

  static isElementInView (element: any) {
    const bounding = element.getBoundingClientRect()

    return (
      bounding.top >= 0 &&
      bounding.left >= 0 &&
      bounding.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      bounding.right <=
        (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  static closest (node: HTMLElement, selector: any) {
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
