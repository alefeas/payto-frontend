"use client"

import { useEffect, useState } from "react"

export function useDynamicHeight() {
  const [height, setHeight] = useState("100vh")

  useEffect(() => {
    const updateHeight = () => {
      // Obtener la altura total del documento
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      )
      
      // Usar la altura de la ventana o del documento, lo que sea mayor
      const viewportHeight = window.innerHeight
      const finalHeight = Math.max(documentHeight, viewportHeight)
      
      setHeight(`${finalHeight}px`)
    }

    // Actualizar altura inicial
    updateHeight()

    // Actualizar cuando cambie el tamaño de la ventana
    window.addEventListener('resize', updateHeight)
    
    // Actualizar cuando cambie el contenido (usando MutationObserver)
    const observer = new MutationObserver(updateHeight)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    })

    // Actualizar periódicamente para cambios dinámicos
    const interval = setInterval(updateHeight, 1000)

    return () => {
      window.removeEventListener('resize', updateHeight)
      observer.disconnect()
      clearInterval(interval)
    }
  }, [])

  return height
}