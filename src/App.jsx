import React, { useState, useRef, useEffect, useCallback } from 'react'
import './App.css'

function App() {
  const [ribbonPulled, setRibbonPulled] = useState(false)
  const [giftOpened, setGiftOpened] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [ribbonEndPosition, setRibbonEndPosition] = useState({ x: 0, y: 0 })
  const ribbonRef = useRef(null)
  const giftBoxRef = useRef(null)
  const containerRef = useRef(null)
  const grabPointRef = useRef({ x: 0, y: 0 })

  const getClientPos = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    if (e.changedTouches && e.changedTouches.length > 0) {
      return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
    }
    return { x: e.clientX, y: e.clientY }
  }

  const handlePointerDown = (e) => {
    if (ribbonPulled || giftOpened) return
    
    const ribbon = ribbonRef.current
    if (!ribbon) return

    const pos = getClientPos(e)
    const rect = ribbon.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    grabPointRef.current = {
      x: pos.x - centerX,
      y: pos.y - centerY
    }
    
    setIsDragging(true)
    e.preventDefault()
    e.stopPropagation()
  }

  const handlePointerMove = useCallback((e) => {
    if (!isDragging || ribbonPulled || giftOpened) return

    const container = containerRef.current
    if (!container) return

    const pos = getClientPos(e)
    const rect = container.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const mouseX = pos.x - centerX
    const mouseY = pos.y - centerY

    // Update mouse position for ribbon following
    setMousePosition({ x: mouseX, y: mouseY })
    
    // Calculate ribbon end position - follow cursor directly
    // Subtract the grab offset so the bow follows where you click
    const ribbonEndX = mouseX - grabPointRef.current.x
    const ribbonEndY = mouseY - grabPointRef.current.y
    
    // Apply with requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      setRibbonEndPosition({ x: ribbonEndX, y: ribbonEndY })
    })

    // Calculate distance from center
    const distance = Math.sqrt(ribbonEndX * ribbonEndX + ribbonEndY * ribbonEndY)

    // If pulled far enough, open the gift
    if (distance > 200) {
      setRibbonPulled(true)
      setIsDragging(false)
      setTimeout(() => {
        setGiftOpened(true)
      }, 300)
    }
  }, [isDragging, ribbonPulled, giftOpened])

  const handleMouseUp = useCallback(() => {
    if (isDragging && !ribbonPulled) {
      // Spring back if not pulled far enough
      setRibbonEndPosition({ x: 0, y: 0 })
      setMousePosition({ x: 0, y: 0 })
    }
    setIsDragging(false)
  }, [isDragging, ribbonPulled])

  useEffect(() => {
    if (isDragging) {
      const handleMove = (e) => {
        e.preventDefault()
        handlePointerMove(e)
      }
      window.addEventListener('mousemove', handlePointerMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleMove, { passive: false })
      window.addEventListener('touchend', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handlePointerMove)
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('touchmove', handleMove)
        window.removeEventListener('touchend', handleMouseUp)
      }
    }
  }, [isDragging, handlePointerMove, handleMouseUp])

  return (
    <div className="app" ref={containerRef}>
      <div className="background-decoration">
        <div className="floating-heart heart1">💕</div>
        <div className="floating-heart heart2">💖</div>
        <div className="floating-heart heart3">💗</div>
        <div className="floating-heart heart4">💝</div>
      </div>

      <div className="content">
        <h1 className="title">For You, My Love</h1>
        
        <div className="gift-container">
          {/* Gift Box */}
          <div 
            className={`gift-box ${giftOpened ? 'opened' : ''}`}
            ref={giftBoxRef}
          >
            {/* Box Bottom */}
            <div className="box-bottom">
              <div className="box-face box-front"></div>
              <div className="box-face box-back"></div>
              <div className="box-face box-left"></div>
              <div className="box-face box-right"></div>
              <div className="box-face box-bottom-face"></div>
            </div>

            {/* Box Top/Lid */}
            <div className="box-top">
              <div className="box-face box-front"></div>
              <div className="box-face box-back"></div>
              <div className="box-face box-left"></div>
              <div className="box-face box-right"></div>
              <div className="box-face box-top-face"></div>
            </div>
          </div>

          {/* Ribbon across the top - outside 3D context */}
          {!ribbonPulled && (
            <div className="ribbon-across">
              <div className="ribbon-strip ribbon-strip-horizontal"></div>
              <div className="ribbon-strip ribbon-strip-vertical"></div>
              {/* Connection lines when pulling */}
              {isDragging && (
                <>
                  <div 
                    className="ribbon-connection ribbon-connection-horizontal"
                    style={{
                      '--bow-x': `${ribbonEndPosition.x}px`,
                      '--bow-y': `${ribbonEndPosition.y}px`
                    }}
                  ></div>
                  <div 
                    className="ribbon-connection ribbon-connection-vertical"
                    style={{
                      '--bow-x': `${ribbonEndPosition.x}px`,
                      '--bow-y': `${ribbonEndPosition.y}px`
                    }}
                  ></div>
                </>
              )}
            </div>
          )}

          {/* Ribbon Bow - pullable */}
          {!ribbonPulled && (
            <div 
              className={`ribbon-bow-pullable ${isDragging ? 'dragging' : ''}`}
              ref={ribbonRef}
              onMouseDown={handlePointerDown}
              onTouchStart={handlePointerDown}
              style={{
                '--mouse-x': `${ribbonEndPosition.x}px`,
                '--mouse-y': `${ribbonEndPosition.y}px`
              }}
            >
              <div className="bow">
                <div className="bow-center"></div>
                <div className="bow-loop bow-left"></div>
                <div className="bow-loop bow-right"></div>
              </div>
            </div>
          )}

          {/* Bouquet inside the box */}
          <div className={`bouquet-inside ${giftOpened ? 'visible' : ''}`}>
            <div className="bouquet">
              <div className="rose rose1">🌹</div>
              <div className="rose rose2">🌹</div>
              <div className="rose rose3">🌹</div>
              <div className="rose rose4">🌹</div>
              <div className="rose rose5">🌹</div>
              <div className="rose rose6">🌹</div>
              <div className="rose rose7">🌹</div>
              <div className="rose rose8">🌹</div>
              <div className="rose rose9">🌹</div>
            </div>

            {/* Letter on top of bouquet */}
            <div className={`letter-on-bouquet ${giftOpened ? 'visible' : ''}`}>
              <div className="letter-content">
                <div className="letter-header">💌</div>
                <div className="letter-text">
                  <p>Dear Adya,</p>
                  <p>We are soon to reach 3 years of being together, and honestly its been a crazy ride, we have had our ups and our downs, but somehow, against all odds, we still choose each other. If I'm being honest, I dont feel like i'm the best boyfriend I could be, and at many times I feel as though you deserve better. I realise I haven't always been the most emotionally, physically and everything available guy, and I'm working on it.</p>
                  <p>What never ceases to amaze me is how you can make me laugh and feel so free whenever we meet; its almost as if my stresses always melt away. In my life, you bring the sunshine, your adventurous spirit and zeal for life always uplifts my mood and makes me feel alive. Without it, I become a shell of a person always absorbed in my work.</p>
                  <p>You and I are very different, but I believe we complement each other, completing each other in subtle ways through our differences. In 2026 I want to spend more time with you, feeling how we did back during our year 12 days, being adventurous whilst looking at the future with hope as we stare into the ephermeral beauty of the twinkling stars from the upper levels of the carpark.</p>
                  <p className="letter-signature">You and I, lets make it together. Happy valentines - Mannan</p>
                </div>
              </div>
            </div>
          </div>

          {!giftOpened && (
            <div className="instruction">
              <p>💝 Tap and drag the ribbon to open your gift 💝</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
