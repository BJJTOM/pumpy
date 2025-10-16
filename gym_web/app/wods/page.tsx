'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

export default function WODsPage() {
  const [wods, setWods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWods()
  }, [])

  const loadWods = async () => {
    setLoading(true)
    try {
      const apiBase = getApiUrl()
      const res = await axios.get(`${apiBase}/wods/`, { timeout: 30000 })
      setWods(res.data)
    } catch (err) {
      console.error('WODs loading failed:', err)
      setWods([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 20 }}>Workout of the Day (WOD)</h1>
      
      {wods.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p>No WODs available</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {wods.map(wod => (
            <div key={wod.id} style={{ 
              padding: 20, 
              border: '1px solid #ddd', 
              borderRadius: 8 
            }}>
              <h3>{wod.title}</h3>
              <p>Date: {wod.date}</p>
              {wod.description && <p>{wod.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
