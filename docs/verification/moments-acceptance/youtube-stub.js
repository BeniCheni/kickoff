// Derived from PR #128's real-adapter.mjs. Deliberately simplified, locally fulfilled API.
// Method absence until ready is a stress case, not a claim about the real provider.
// loadVideoById uses object form, synthetic -1/3/1, and exact startSeconds (not keyframes).
(() => {
  const players = []
  class Player {
    constructor(element, options) {
      this.element = element; this.options = options; this.calls = []; this.time = 0
      this.url = 'https://www.youtube.com/watch?v=' + new URL(element.src).pathname.split('/').pop()
      players.push(this)
      if (window.__stubVariant === 'construction') this.__attach()
    }
    getIframe() { return this.element }
    destroy() { this.calls.push(['destroy']); this.element.remove() }
    __attach() {
      this.playVideo = () => { this.calls.push(['playVideo']); this.__state(3); this.__state(1) }
      this.pauseVideo = () => { this.calls.push(['pauseVideo']); this.__state(2) }
      this.getCurrentTime = () => this.time
      this.getVideoUrl = () => this.url
      this.seekTo = seconds => { this.calls.push(['seekTo', seconds]); this.time = seconds }
      this.loadVideoById = request => {
        if (typeof request !== 'object') throw new Error('Expected object loadVideoById')
        this.calls.push(['loadVideoById', request])
        this.url = 'https://www.youtube.com/watch?v=' + request.videoId
        this.time = 0; this.__state(-1); this.__state(3)
        this.time = this.zeroAfterLoad ? 0 : request.startSeconds
        this.__state(1)
      }
    }
    __ready() { this.__attach(); this.options.events.onReady({ target: this, data: null }) }
    __state(data) { this.options.events.onStateChange({ target: this, data }) }
    __error(data) { this.options.events.onError({ target: this, data }) }
  }
  window.__players = players
  window.YT = { Player }
  window.onYouTubeIframeAPIReady?.()
})()
