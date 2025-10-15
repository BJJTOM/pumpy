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
    const no = prompt('?½ì»¤ ë²ˆí˜¸ë¥??…ë ¥?˜ì„¸??)
    if (!no) return

    try {
      await axios.post(`${getApiUrl()}/lockers/`, {
        no,
        size: 'M',
        status: 'ë¹„ì–´?ˆìŒ'
      })
      alert('?½ì»¤ê°€ ?ì„±?˜ì—ˆ?µë‹ˆ??)
      loadData()
    } catch (err) {
      alert('?½ì»¤ ?ì„± ?¤íŒ¨')
      console.error(err)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>?½ì»¤ ê´€ë¦?/h2>
        <button onClick={createLocker}>+ ?½ì»¤ ì¶”ê?</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ë²ˆí˜¸</th>
              <th>?¬ê¸°</th>
              <th>?íƒœ</th>
              <th>?¬ìš©??/th>
              <th>ê¸°ê°„</th>
              <th>ë¹„ê³ </th>
            </tr>
          </thead>
          <tbody>
            {lockers.length === 0 ? (
              <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 40 }}>?±ë¡???½ì»¤ê°€ ?†ìŠµ?ˆë‹¤</td></tr>
            ) : (
              lockers.map(l => {
                const member = members.find(m => m.id === l.assigned_member)
                return (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600 }}>{l.no}</td>
                    <td><span className="pill">{l.size}</span></td>
                    <td>
                      <span className="pill" style={{
                        backgroundColor: l.status === 'ë¹„ì–´?ˆìŒ' ? 'var(--ok)' : 'var(--warn)',
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


