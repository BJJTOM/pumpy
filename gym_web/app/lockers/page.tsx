'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'

import { getApiUrl } from '@/lib/api'

export default function LockersPage() {
  const [lockers, setLockers] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])

  useEffect(() => {
    loadData()
    axios.get(`${getApiUrl()}/members/`).then(res => setMembers(res.data))
  }, [])

  const loadData = () => {
    axios.get(`${getApiUrl()}/lockers/`)
      .then(res => setLockers(res.data))
      .catch(err => console.error(err))
  }

  const createLocker = async () => {
    const no = prompt('?�커 번호�??�력?�세??)
    if (!no) return

    try {
      await axios.post(`${getApiUrl()}/lockers/`, {
        no,
        size: 'M',
        status: '비어?�음'
      })
      alert('?�커가 ?�성?�었?�니??)
      loadData()
    } catch (err) {
      alert('?�커 ?�성 ?�패')
      console.error(err)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>?�커 관�?/h2>
        <button onClick={createLocker}>+ ?�커 추�?</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>번호</th>
              <th>?�기</th>
              <th>?�태</th>
              <th>?�용??/th>
              <th>기간</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            {lockers.length === 0 ? (
              <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 40 }}>?�록???�커가 ?�습?�다</td></tr>
            ) : (
              lockers.map(l => {
                const member = members.find(m => m.id === l.assigned_member)
                return (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600 }}>{l.no}</td>
                    <td><span className="pill">{l.size}</span></td>
                    <td>
                      <span className="pill" style={{
                        backgroundColor: l.status === '비어?�음' ? 'var(--ok)' : 'var(--warn)',
                        color: 'white',
                        border: 'none'
                      }}>
                        {l.status}
                      </span>
                    </td>
                    <td>{member ? `${member.first_name} ${member.last_name}` : '-'}</td>
                    <td className="muted">
                      {l.start_date && l.end_date ? `${l.start_date} ~ ${l.end_date}` : '-'}
                    </td>
                    <td className="muted">{l.notes || '-'}</td>
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


