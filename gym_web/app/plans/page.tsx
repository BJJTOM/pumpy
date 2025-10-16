'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    setLoading(true)
    try {
      const apiBase = getApiUrl()
      const res = await axios.get(`${apiBase}/plans/`, { timeout: 30000 })
      setPlans(res.data)
    } catch (err) {
      console.error('Plans loading failed:', err)
      setPlans([])
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
      <h1 style={{ marginBottom: 20 }}>Membership Plans</h1>
      
      {plans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p>No plans available</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {plans.map(plan => (
            <div key={plan.id} style={{ 
              padding: 20, 
              border: '1px solid #ddd', 
              borderRadius: 8 
            }}>
              <h3>{plan.name}</h3>
              <p>Price: {Number(plan.price).toLocaleString()} KRW</p>
              {plan.duration_months && <p>Duration: {plan.duration_months} months</p>}
              {plan.description && <p>{plan.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
