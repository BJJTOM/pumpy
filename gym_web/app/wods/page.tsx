'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'

import { getApiUrl } from '@/lib/api'

export default function WODsPage() {
  const [wods, setWods] = useState<any[]>([])
  const [coaches, setCoaches] = useState<any[]>([])

  useEffect(() => {
    loadData()
    axios.get(`${API_BASE}/coaches/`).then(res => setCoaches(res.data))
  }, [])

  const loadData = () => {
    axios.get(`${API_BASE}/wods/`)
      .then(res => setWods(res.data))
      .catch(err => console.error(err))
  }

  const createWOD = async () => {
    const title = prompt('WOD 제목을 입력하세요 (예: AMRAP 20분)')
    if (!title) return

    const date = prompt('날짜를 입력하세요 (YYYY-MM-DD)') || new Date().toISOString().split('T')[0]

    try {
      await axios.post(`${API_BASE}/wods/`, {
        date,
        title,
        items: [],
        equipment: '',
        level: '중',
        class_name: '',
        capacity: 20
      })
      alert('WOD가 등록되었습니다')
      loadData()
    } catch (err) {
      alert('WOD 등록 실패')
      console.error(err)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>WOD 관리</h2>
        <button onClick={createWOD}>+ WOD 추가</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>날짜</th>
              <th>제목</th>
              <th>장비</th>
              <th>난이도</th>
              <th>반/정원</th>
              <th>코치</th>
            </tr>
          </thead>
          <tbody>
            {wods.length === 0 ? (
              <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 40 }}>등록된 WOD가 없습니다</td></tr>
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
                        backgroundColor: w.level === '하' ? 'var(--ok)' : w.level === '상' ? 'var(--danger)' : 'var(--warn)',
                        color: 'white',
                        border: 'none'
                      }}>
                        {w.level}
                      </span>
                    </td>
                    <td className="muted">{w.class_name || '-'} / {w.capacity}명</td>
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


