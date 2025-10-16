'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

export default function RevenuePage() {
  const [revenue, setRevenue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRevenue()
  }, [])

  const loadRevenue = async () => {
    setLoading(true)
    try {
      const apiBase = getApiUrl()
      const res = await axios.get(`${apiBase}/revenue/`, { timeout: 30000 })
      setRevenue(res.data)
    } catch (err) {
      console.error('Revenue loading failed:', err)
      setRevenue([])
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
      <h1 style={{ marginBottom: 20 }}>Revenue Management</h1>
      
      {revenue.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p>No revenue records</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {revenue.map(item => (
            <div key={item.id} style={{ 
              padding: 20, 
              border: '1px solid #ddd', 
              borderRadius: 8 
            }}>
              <p>Amount: {Number(item.amount).toLocaleString()} KRW</p>
              <p>Date: {item.date}</p>
              {item.description && <p>{item.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
