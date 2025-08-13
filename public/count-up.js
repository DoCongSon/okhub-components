/**
 * Count Up Animation Component
 * Tạo hiệu ứng đếm số với animation từ dưới lên
 * Yêu cầu: GSAP và ScrollTrigger
 */

class CountUp {
  constructor(options = {}) {
    this.duration = options.duration || 2
    this.ease = options.ease || 'power2.out'
    this.stagger = options.stagger || 0.1
    this.triggerStart = options.triggerStart || 'top 80%'
    this.once = options.once !== false
    this.selector = options.selector || '.count-up'

    this.init()
  }

  init() {
    this.setupCounters()
    this.createScrollTriggers()
  }

  setupCounters() {
    const countElements = document.querySelectorAll(this.selector)

    countElements.forEach((element) => {
      if (element.hasAttribute('data-processed')) return

      const target = parseInt(element.getAttribute('data-target')) || 0
      const targetStr = target.toString()

      // Store original content
      element.setAttribute('data-original', element.textContent)

      // Clear element and create digit structure
      element.innerHTML = ''
      element.setAttribute('data-processed', 'true')

      // Add CSS classes if not present
      if (!element.classList.contains('count-up')) {
        element.classList.add('count-up')
      }

      // Create digits
      for (let i = 0; i < targetStr.length; i++) {
        const digitContainer = document.createElement('div')
        digitContainer.className = 'count-digit'

        const digitColumn = document.createElement('div')
        digitColumn.className = 'digit-column'

        // Create numbers 0-9 for each digit position
        const targetDigit = parseInt(targetStr[i])
        const extraRotations = 10 // Number of extra rotations for effect
        const totalDigits = targetDigit + extraRotations

        for (let j = 0; j <= totalDigits; j++) {
          const digitItem = document.createElement('div')
          digitItem.className = 'digit-item'
          digitItem.textContent = j % 10
          digitColumn.appendChild(digitItem)
        }

        digitContainer.appendChild(digitColumn)
        element.appendChild(digitContainer)

        // Set initial position (numbers hidden below)
        gsap.set(digitColumn, {
          y: 0,
        })
      }
    })
  }

  animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target')) || 0
    const targetStr = target.toString()
    const digits = element.querySelectorAll('.digit-column')

    digits.forEach((digit, index) => {
      const targetDigit = parseInt(targetStr[index])
      const digitHeight = digit.querySelector('.digit-item').offsetHeight
      const extraRotations = 10
      const targetDigits = targetDigit + extraRotations
      const finalPosition = -targetDigits * digitHeight

      // Animate from bottom to target position
      gsap.fromTo(
        digit,
        {
          y: 0,
        },
        {
          y: finalPosition,
          duration: this.duration,
          ease: this.ease,
          delay: index * this.stagger,
        }
      )
    })
  }

  createScrollTriggers() {
    const countElements = document.querySelectorAll(this.selector)

    countElements.forEach((element) => {
      ScrollTrigger.create({
        trigger: element.closest('.stat-card, .counter-card, .count-container') || element,
        start: this.triggerStart,
        once: this.once,
        onEnter: () => {
          this.animateCounter(element)
        },
      })
    })
  }

  reset() {
    // Kill all ScrollTriggers
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill())

    // Reset all counters
    const countElements = document.querySelectorAll(this.selector)
    countElements.forEach((element) => {
      element.removeAttribute('data-processed')
      const digits = element.querySelectorAll('.digit-column')
      digits.forEach((digit) => {
        gsap.set(digit, { y: 0 })
      })
    })

    // Reinitialize
    this.init()
  }

  start() {
    const countElements = document.querySelectorAll(this.selector)
    countElements.forEach((element) => {
      this.animateCounter(element)
    })
  }

  // Destroy component
  destroy() {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill())

    const countElements = document.querySelectorAll(this.selector)
    countElements.forEach((element) => {
      const original = element.getAttribute('data-original')
      if (original) {
        element.textContent = original
      }
      element.removeAttribute('data-processed')
      element.removeAttribute('data-original')
    })
  }
}

// CSS Styles - Insert này vào CSS file hoặc <style> tag
const countUpCSS = `
.count-up {
    overflow: hidden;
    display: inline-flex;
    line-height: 1.2;
    height: 1.2em;
    align-items: center;
    position: relative;
    mask: linear-gradient(to bottom, 
        transparent 0%, 
        rgba(0,0,0,0.3) 3%, 
        rgba(0,0,0,1) 10%, 
        rgba(0,0,0,1) 90%, 
        rgba(0,0,0,0.3) 97%, 
        transparent 100%);
}

.count-digit {
    position: relative;
    overflow: hidden;
    display: inline-block;
    width: 0.7em;
    height: 1.2em;
    text-align: center;
}

.digit-column {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: auto;
}

.digit-item {
    height: 1.2em;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    line-height: 1.2;
    flex-shrink: 0;
}

.count-symbol {
    display: inline-block;
    line-height: 1.2;
    height: 1.2em;
    display: flex;
    align-items: center;
}
`

// Auto-inject CSS if not exists
if (typeof document !== 'undefined' && !document.querySelector('#count-up-styles')) {
  const style = document.createElement('style')
  style.id = 'count-up-styles'
  style.textContent = countUpCSS
  document.head.appendChild(style)
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CountUp
}

// Global variable for browser use
if (typeof window !== 'undefined') {
  window.CountUp = CountUp
}
