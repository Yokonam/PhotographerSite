type obj = {
  selector?: string
}

export class YoutubeApi {
  selector?: string
  players: Array<HTMLElement>
  playerContainer: any
  ytPlaying: number
  isStop: number
  isPlay: number

  constructor (atts?: obj) {
    this.selector = atts?.selector
    this.playerContainer = []
  }

  init () {
    this.players = Array.from(document.querySelectorAll('[data-embed]'))
    this.changePath()
    this.addAPI()
  }

  changePath () {
    this.onPlayerReady = this.onPlayerReady.bind(this)
    this.onPlayerStateChange = this.onPlayerStateChange.bind(this)
    this.onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady.bind(this)
  }

  addAPI () {
    const tag = document.createElement('script')
    const firstScriptTag = document.getElementsByTagName('script')[0]
    tag.src = 'https://www.youtube.com/iframe_api'
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

    ;(window as any).onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady
  }

  onYouTubeIframeAPIReady () {
    return new Promise(resolve => {
      for (let i = 0; i < this.players.length; i++) {
        const id = this.players[i].getAttribute('data-embed')
        this.playerContainer[i] = new (window as any).YT.Player(this.players[i], {
          videoId: id,
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            playsinline: 1,
            modestbranding: 1,
            origin: location.protocol + '//' + location.hostname + '/'
          },
          events: {
            onReady: this.onPlayerReady,
            onStateChange: this.onPlayerStateChange
          }
        })
      }
      // console.log('ok2')
      resolve('ok2')
    })
  }

  onPlayerReady (e: Event) {
  }

  onPlayerStateChange (e: Event) {
    for (let i = 0; i < this.playerContainer.length; i++) {
      const thisState = this.playerContainer[i].getPlayerState()
      if (thisState === 1 && this.ytPlaying === undefined) {
        this.ytPlaying = i
      } else if (thisState === 1 && this.ytPlaying !== i) {
        this.isStop = this.ytPlaying
        this.isPlay = i
      }
    }
    if (this.isStop !== undefined) {
      this.playerContainer[this.isStop].pauseVideo()
      this.isStop = undefined
    }
    if (this.isPlay !== undefined) {
      this.ytPlaying = this.isPlay
      this.isPlay = undefined
    }
  }
}
