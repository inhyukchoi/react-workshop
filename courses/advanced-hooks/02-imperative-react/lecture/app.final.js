import React, { useState, useLayoutEffect, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { position } from './utils'
import './styles.scss'

function Portal({ children }) {
  const portalNode = useRef(null)
  const [_, forceUpdate] = useState()

  useLayoutEffect(() => {
    portalNode.current = document.createElement('portal')
    document.body.appendChild(portalNode.current)
    forceUpdate({})
    return () => {
      if (portalNode.current) {
        document.body.removeChild(portalNode.current)
      }
    }
  }, [])

  return portalNode.current ? createPortal(children, portalNode.current) : null
}

function Popover({ children, targetRef }) {
  const popoverRef = useRef()
  const [styles, setStyles] = useState({})

  // Doing this work in a ref callback helps overcome a race-condition where
  // we need to ensure the popoverRef has been established. It's established
  // later than we might expect because the div it's applied to is the children
  // of Portal which returns null initially (which it must do)
  function initPopoverRef(el) {
    // initPopoverRef will be called numerous times, lets do this work once.
    if (!popoverRef.current) {
      popoverRef.current = el
      const targetRect = targetRef.current.getBoundingClientRect()
      const popoverRect = popoverRef.current.getBoundingClientRect()
      setStyles(position(targetRect, popoverRect))
    }
  }

  return (
    <Portal>
      <div
        ref={initPopoverRef}
        data-popover=""
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          ...styles
        }}
      >
        {children}
      </div>
    </Portal>
  )
}

function Define({ children }) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef()

  useLayoutEffect(() => {
    window.addEventListener('click', event => {
      if (event.target !== buttonRef.current) {
        setOpen(false)
      }
    })
  }, [])

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        // onBlur={() => setOpen(false)}
        className="as-link"
      >
        {children}
      </button>
      {open && (
        <Popover targetRef={buttonRef}>
          Hooks are a way to compose behavior into components
        </Popover>
      )}
    </>
  )
}

export default function App() {
  return (
    <p>
      Modern React is filled with <Define>Hooks</Define>. You can still use classes if you
      wish, but composability isn't as nice. Hooks were designed to give us better
      composability with "custom hooks".
    </p>
  )
}
