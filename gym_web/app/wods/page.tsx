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
    const title = prompt('WOD ?úÎ™©???ÖÎ†•?òÏÑ∏??(?? AMRAP 20Î∂?')
    if (!title) return

    const date = prompt('?†ÏßúÎ•??ÖÎ†•?òÏÑ∏??(YYYY-MM-DD)') || new Date().toISOString().split('T')[0]

    try {
      await axios.post(`${getApiUrl()}/wods/`, {
        date,
        title,
        items: [],
        equipment: '',
        level: 'Ï§?,
        class_name: '',
        capacity: 20
      })
      alert('WODÍ∞Ä ?±Î°ù?òÏóà?µÎãà??)
      loadData()
    } catch (err) {
      alert('WOD ?±Î°ù ?§Ìå®')
      console.error(err)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>WOD Í¥ÄÎ¶?/h2>
        <button onClick={createWOD}>+ WOD Ï∂îÍ?</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>?†Ïßú</th>
              <th>?úÎ™©</th>
              <th>?•ÎπÑ</th>
              <th>?úÏù¥??/th>
              <th>Î∞??ïÏõê</th>
              <th>ÏΩîÏπò</th>
            </tr>
          </thead>
          <tbody>
            {wods.length === 0 ? (
              <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 40 }}>?±Î°ù??WODÍ∞Ä ?ÜÏäµ?àÎã§</td></tr>
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
                    <td className="muted">{w.class_name || '-'} / {w.capacity}Î™?/td>
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


