'use client'

import { useEffect, useState } from 'react'
import '@/styles/collaboratePage.css'

export default function CollaborateContent() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="collaborate-container fade-in">
      <h1 className="collaborate-heading">Coming Soon</h1>
    </div>
  )
}