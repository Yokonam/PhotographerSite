import 'what-input'
// import Splide from '@splidejs/splide'
import { createClient } from 'microcms-js-sdk'
import { Accordion } from './modules/_Accordion'
import { StickyHeader } from './modules/_StickyHeader'
import { ExpanderMenu } from './modules/_ExpanderMenu'
import { StickyPageScrollButton } from './modules/_StickyPageScrollButton'
import { AnchorScroll } from './modules/_AnchorScroll'
const BREAK_POINT_SM = (window as any).BREAK_POINT_SM = 576
const BREAK_POINT_MD = (window as any).BREAK_POINT_MD = 889
const BREAK_POINT_LG = (window as any).BREAK_POINT_LG = 1199
const BREAK_POINT_XL = (window as any).BREAK_POINT_XL = 1399

const init = {
  run: function () {
    this.accordion()
    this.stickyHeader()
    this.expanderMenu()
    // this.stickyPageScrollButton()
    this.anchorScroll()
    this.photo()
    this.moveBackground()
    this.topChangeBackground()

  },
  accordion: function () {
    if (document.getElementById('header')) {
      const accordion = new Accordion('.c-acc')
      accordion.init()
    }
  },

  stickyHeader: function () {
    if (document.getElementById('header')) {
      const stickyHeader = new StickyHeader('.l-header')
      stickyHeader.init()
    }
  },

  expanderMenu: function () {
    if (document.getElementById('header')) {
      const expanderMenu = new ExpanderMenu('#menuBtn', '#navigation', null)
      expanderMenu.init()
    }
  },

  stickyPageScrollButton: function () {
    const stickyPageScrollButton = new StickyPageScrollButton('.c-link-pagetop', '.l-contents', 0)
    stickyPageScrollButton.init()
  },

  anchorScroll: function () {
    const anchorScroll = new AnchorScroll('.scroll')
    anchorScroll.init()
  },

  photo: function () {
    const client = createClient({
      serviceDomain: 'photographersite',
      apiKey: 'oRKrkVpVH3l3NqvTXkzE8jHGwIexfV1p7Z9b'
    })
    client
      .get({
        endpoint: 'photo'
      })
      .then((res: any) => {
        const array: Array<any> = res.contents
        console.log(array)
        const list: HTMLInputElement = document.querySelector<HTMLInputElement>('.c-gallery-index__list')
        let html = ''

        array.forEach((element: any) => {
          html += renderListTemplate(element)
        })

        list.innerHTML = html
      })
      .catch((err) => console.error(err))

    const renderListTemplate = (elm: any): string => {
      let html = ''
      const listTemplate: string = `
        <div class="c-gallery-index__item">
          <a href=""><img src="%%mainImg%%" alt=""loading="lazy" decoding="async">
          <div class="c-gallery-index__title">%%title%%</div>
          </a>
        </div>`

      html += listTemplate
        .replace(/%%mainImg%%/g, elm.mainImg.url)
        .replace(/%%title%%/g, elm.title)

      return html
    }
  },

  moveBackground: function () {
    let timeoutId: number // Variable to store the timeout ID

    document.addEventListener('mousemove', function (e: MouseEvent) {
      const windowWidth: number = window.innerWidth
      const windowHeight: number = window.innerHeight

      const maxDistance: number = 50 // Upper limit in pixels for the distance the background can move

      let newBackgroundPositionX: number = (e.pageX - windowWidth / 2) / 10
      let newBackgroundPositionY: number = (e.pageY - windowHeight / 2) / 10

      // Apply upper limit to the distance
      newBackgroundPositionX = Math.min(Math.max(newBackgroundPositionX, -maxDistance), maxDistance)
      newBackgroundPositionY = Math.min(Math.max(newBackgroundPositionY, -maxDistance), maxDistance)

      document.querySelector<HTMLInputElement>('.l-contents__background').style.setProperty('--background-position-x', `${newBackgroundPositionX}`)
      document.querySelector<HTMLInputElement>('.l-contents__background').style.setProperty('--background-position-y', `${newBackgroundPositionY}`)

    })
  },

  // topChangeBackground: function () {
  //   const observer = new IntersectionObserver((entries) => {
  //     entries.forEach((entry) => {
  //       if (entry.isIntersecting) {
  //         const sectionId = entry.target.id
  //         document.querySelector<HTMLInputElement>('.l-contents__background').setAttribute('data-image', '')
  //         document.querySelector<HTMLInputElement>('.l-contents__background').setAttribute('data-image', `${sectionId}`)
  //       }
  //     })
  //   }, {
  //     threshold: 0.5
  //   })

  //   document.querySelectorAll('.p-top-index__item').forEach((section) => {
  //     observer.observe(section)
  //   })
  // }
}

document.addEventListener('DOMContentLoaded', () => {
  init.run()
}, false)
