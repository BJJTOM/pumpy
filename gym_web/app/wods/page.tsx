'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'

import { getApiUrl } from '@/lib/api'

export default function WODsPage() {
  const [wods, setWods] = useState<any[]>([])
  const [coaches, setCoaches] = useState<any[]>([])

  useEffect(() => {
    loadData()
    axios.get(`${getApiUrl()}/coaches/`).then(res => setCoaches(res.data))
  }, [])

  const loadData = () => {
    axios.get(`${getApiUrl()}/wods/`)
      .then(res => setWods(res.data))
      .catch(err => console.error(err))
  }

  const createWOD = async () => {
    const title = prompt('WOD ?�목???�력?�세??(?? AMRAP 20�?')
    if (!title) return

    const date = prompt('?�짜�??�력?�세??(YYYY-MM-DD)') || new Date().toISOString().split('T')[0]

    try {
      await axios.post(`${getApiUrl()}/wods/`, {
        date,
        title,
        items: [],
        equipment: '',
        level: '�?,
        class_name: '',
        capacity: 20
      })
      alert('WOD가 ?�록?�었?�니??)
      loadData()
    } catch (err) {
      alert('WOD ?�록 ?�패')
      console.error(err)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>WOD 관�?/h2>
        <button onClick={createWOD}>+ WOD 추�?</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>?�짜</th>
              <th>?�목</th>
              <th>?�비</th>
              <th>?�이??/th>
              <th>�??�원</th>
              <th>코치</th>
            </tr>
          </thead>
          <tbody>
            {wods.length === 0 ? (
              <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 40 }}>?�록??WOD가 ?�습?�다</td></tr>
            ) : (
              wods.map(w => {
                const coach = coaches.find(c => c.id === w.coach)
                return (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 600 }}>{w.date}</td>
                    <td>{w.title}</td>
                    <td className="muted">{w.equipment || '-'}</td>
                    <td>
                      <span className="pill" style={{
                        backgroundColor: w.level === '?? ? 'var(--ok)' : w.level === '?? ? 'var(--danger)' : 'var(--warn)',
                        color: 'white',
                        border: 'none'
                      }}>
                        {w.level}
                      </span>
                    </td>
                    <td className="muted">{w.class_name || '-'} / {w.capacity}�?/td>
                    <td>{coach?.name || '-'}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


