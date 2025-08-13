'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// GSAP types
interface GSAPInstance {
  set: (targets: Element | Element[], vars: Record<string, number | string>) => void
  fromTo: (
    targets: Element | Element[],
    fromVars: Record<string, number | string>,
    toVars: Record<string, number | string>
  ) => void
}

interface ScrollTriggerInstance {
  create: (options: { trigger: Element; start: string; once: boolean; onEnter: () => void }) => ScrollTriggerObject
  getAll: () => ScrollTriggerObject[]
}

interface ScrollTriggerObject {
  kill: () => void
}

// Extend Window interface
declare global {
  interface Window {
    gsap?: GSAPInstance
    ScrollTrigger?: ScrollTriggerInstance
  }
}

export interface CountUpOptions {
  duration?: number
  ease?: string
  stagger?: number
  triggerStart?: string
  once?: boolean
  autoStart?: boolean
}

export interface CountUpControls {
  start: () => void
  reset: () => void
  destroy: () => void
}

export const useCountUp = (
  target: number,
  options: CountUpOptions = {}
): [React.RefObject<HTMLDivElement>, CountUpControls] => {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const {
    duration = 2,
    ease = 'power2.out',
    stagger = 0.1,
    triggerStart = 'top 80%',
    once = true,
    autoStart = true,
  } = options

  // Inject CSS styles
  const injectStyles = useCallback(() => {
    if (typeof document === 'undefined') return
    if (document.querySelector('#count-up-styles')) return

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

    const style = document.createElement('style')
    style.id = 'count-up-styles'
    style.textContent = countUpCSS
    document.head.appendChild(style)
  }, [])

  // Setup counter structure
  const setupCounter = useCallback((element: HTMLElement, targetValue: number) => {
    if (element.hasAttribute('data-processed')) return

    const targetStr = targetValue.toString()

    // Store original content
    element.setAttribute('data-original', element.textContent || '')
    element.setAttribute('data-target', targetValue.toString())

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
        digitItem.textContent = (j % 10).toString()
        digitColumn.appendChild(digitItem)
      }

      digitContainer.appendChild(digitColumn)
      element.appendChild(digitContainer)

      // Set initial position (numbers hidden below)
      if (typeof window !== 'undefined' && gsap) {
        gsap.set(digitColumn, { y: 0 })
      }
    }
  }, [])

  // Animate counter
  const animateCounter = useCallback(
    (element: HTMLElement) => {
      if (typeof window === 'undefined' || !gsap) {
        console.warn('GSAP is required for count-up animation')
        return
      }
      const targetValue = parseInt(element.getAttribute('data-target') || '0')
      const targetStr = targetValue.toString()
      const digits = element.querySelectorAll('.digit-column')

      digits.forEach((digit: Element, index: number) => {
        const targetDigit = parseInt(targetStr[index])
        const digitHeight = (digit.querySelector('.digit-item') as HTMLElement)?.offsetHeight || 0
        const extraRotations = 10
        const targetDigits = targetDigit + extraRotations
        const finalPosition = -targetDigits * digitHeight

        // Animate from bottom to target position
        gsap.fromTo(
          digit,
          { y: 0 },
          {
            y: finalPosition,
            duration: duration,
            ease: ease,
            delay: index * stagger,
          }
        )
      })
    },
    [duration, ease, stagger]
  )

  // Create ScrollTrigger
  const createScrollTrigger = useCallback(
    (element: HTMLElement) => {
      if (typeof window === 'undefined' || !window.ScrollTrigger) {
        if (autoStart) {
          animateCounter(element)
        }
        return
      }

      const ScrollTrigger = window.ScrollTrigger

      ScrollTrigger.create({
        trigger: element.closest('.stat-card, .counter-card, .count-container') || element,
        start: triggerStart,
        once: once,
        onEnter: () => {
          animateCounter(element)
        },
      })
    },
    [animateCounter, triggerStart, once, autoStart]
  )

  // Initialize
  const initialize = useCallback(() => {
    if (!elementRef.current || isInitialized) return

    injectStyles()
    setupCounter(elementRef.current, target)

    if (autoStart) {
      createScrollTrigger(elementRef.current)
    }

    setIsInitialized(true)
  }, [target, injectStyles, setupCounter, createScrollTrigger, autoStart, isInitialized])

  // Controls
  const start = useCallback(() => {
    if (elementRef.current) {
      animateCounter(elementRef.current)
    }
  }, [animateCounter])

  const reset = useCallback(() => {
    if (!elementRef.current) return

    // Kill ScrollTriggers if available
    if (typeof window !== 'undefined' && window.ScrollTrigger) {
      const ScrollTrigger = window.ScrollTrigger
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }

    // Reset counter
    elementRef.current.removeAttribute('data-processed')
    const digits = elementRef.current.querySelectorAll('.digit-column')

    if (typeof window !== 'undefined' && gsap) {
      digits.forEach((digit) => {
        gsap.set(digit, { y: 0 })
      })
    }

    setIsInitialized(false)

    // Re-initialize
    setTimeout(() => {
      initialize()
    }, 100)
  }, [initialize])

  const destroy = useCallback(() => {
    if (!elementRef.current) return

    // Kill ScrollTriggers if available
    if (typeof window !== 'undefined' && window.ScrollTrigger) {
      const ScrollTrigger = window.ScrollTrigger
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }

    // Restore original content
    const original = elementRef.current.getAttribute('data-original')
    if (original) {
      elementRef.current.textContent = original
    }

    elementRef.current.removeAttribute('data-processed')
    elementRef.current.removeAttribute('data-original')
    elementRef.current.removeAttribute('data-target')

    setIsInitialized(false)
  }, [])

  // Effect to initialize when component mounts
  useEffect(() => {
    if (elementRef.current && !isInitialized) {
      // Delay initialization to ensure DOM is ready
      const timer = setTimeout(() => {
        initialize()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [initialize, isInitialized])

  // Effect to reinitialize when target changes
  useEffect(() => {
    if (isInitialized && elementRef.current) {
      destroy()
      setTimeout(() => {
        initialize()
      }, 100)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroy()
    }
  }, [destroy])

  return [elementRef, { start, reset, destroy }]
}

export default useCountUp
