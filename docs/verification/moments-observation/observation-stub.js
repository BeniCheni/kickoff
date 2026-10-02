// Independent of the immutable S2/S3 stub. Everything here is synthetic.
(() => {
  const players = []
  class Player {
    constructor(element, options) {
      this.element = element; this.options = options; this.time = 0; this.calls = []
      this.url = 'https://www.youtube.com/watch?v=' + new URL(element.src).pathname.split('/').pop()
      players.push(this)
      setTimeout(() => {
        this.playVideo = () => { this.calls.push(['playVideo']); this.time = 12; this.state(1) }
        this.pauseVideo = () => { this.calls.push(['pauseVideo']); this.state(2) }
        this.getCurrentTime = () => this.time
        this.getVideoUrl = () => this.url
        this.seekTo = seconds => { this.calls.push(['seekTo', seconds]); this.time = seconds }
        this.loadVideoById = request => {
          this.calls.push(['loadVideoById', request])
          this.url = 'https://www.youtube.com/watch?v=' + request.videoId
          this.time = request.startSeconds
          this.state(-1); this.state(3)
          if (window.__observationVariant === 'owner-blocked' && request.videoId === 'S4Stub00002') this.error(150)
          else if (window.__observationVariant === 'warm-autoplay-blocked') this.options.events.onAutoplayBlocked({ target: this })
          else this.state(1)
        }
        options.events.onReady({ target: this })
        if (window.__observationVariant === 'error-153') this.error(153)
        if (window.__observationVariant === 'cold-blocked') options.events.onAutoplayBlocked({ target: this })
      }, 30)
    }
    getIframe() { return this.element }
    state(data) { this.options.events.onStateChange({ target: this, data }) }
    error(data) { this.options.events.onError({ target: this, data }) }
    destroy() { this.element.remove() }
  }
  window.__observationPlayers = players
  window.YT = { Player }
  window.onYouTubeIframeAPIReady?.()
})()
