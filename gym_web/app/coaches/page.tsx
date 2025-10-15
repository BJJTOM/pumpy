'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'

import { getApiUrl } from '@/lib/api'

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const apiBase = getApiUrl()
      const res = await axios.get(`${apiBase}/coaches/`, { timeout: 30000 })
      setCoaches(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const createCoach = async () => {
    const name = prompt('코치 이름을 입력하세요')
    if (!name) return

    const phone = prompt('연락처를 입력하세요') || ''
    const amount = prompt('급여 금액을 입력하세요 (원)') || '0'

    try {
      const apiBase = getApiUrl()
      await axios.post(`${apiBase}/coaches/`, {
        name,
        phone,
        role: '코치',
        salary_type: 'monthly',
        amount: parseFloat(amount),
        payday: 25
      })
      alert('코치가 등록되었습니다')
      loadData()
    } catch (err) {
      alert('코치 등록 실패')
      console.error(err)
    }
  }

  const totalSalary = coaches.reduce((sum, c) => sum + parseFloat(c.amount), 0)

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>코치 관리</h2>
        <button onClick={createCoach}>+ 코치 추가</button>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div className="muted" style={{ fontSize: 14, marginBottom: 8 }}>총 급여 (월)</div>
        <div style={{ fontSize: 32, fontWeight: 800 }}>
          ₩ {totalSalary.toLocaleString('ko-KR')}
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>이름</th>
              <th>연락처</th>
              <th>역할</th>
              <th>급여 형태</th>
              <th>금액</th>
              <th>지급일</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            {coaches.length === 0 ? (
              <tr><td colSpan={7} className="muted" style={{ textAlign: 'center', padding: 40 }}>등록된 코치가 없습니다</td></tr>
            ) : (
              coaches.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.phone || '-'}</td>
                  <td><span className="pill">{c.role}</span></td>
                  <td><span className="pill">{c.salary_type}</span></td>
                  <td style={{ fontWeight: 600 }}>₩ {parseFloat(c.amount).toLocaleString('ko-KR')}</td>
                  <td className="muted">{c.payday}일</td>
                  <td className="muted">{c.notes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


