'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { getApiUrl } from '@/lib/api'

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [filteredPlans, setFilteredPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('?„ì²´')
  const [formData, setFormData] = useState({
    name: '',
    category: '?¼ë°˜',
    price: '',
    original_price: '',
    duration_months: '',
    duration_days: '',
    visits: '',
    weekly_limit: '',
    discount_rate: '',
    includes_uniform: false,
    includes_rashguard: false,
    includes_locker: false,
    includes_towel: false,
    includes_gear: false,
    is_popular: false,
    description: '',
    notes: ''
  })

  const categories = ['?„ì²´', '?¼ë°˜', '?¤ì´?´íŠ¸', '?¤ì „ë°?, '?˜ë“œ?¸ë ˆ?´ë‹', '?¤ì¦ˆ', 'PT', 'ê·¸ë£¹']

  useEffect(() => {
    loadPlans()
  }, [])

  useEffect(() => {
    if (selectedCategory === '?„ì²´') {
      setFilteredPlans(plans)
    } else {
      setFilteredPlans(plans.filter(p => p.category === selectedCategory))
    }
  }, [selectedCategory, plans])

  const loadPlans = async () => {
    setLoading(true)
    try {
      const apiBase = getApiUrl()
      const res = await axios.get(`${apiBase}/plans/`, { timeout: 30000 })
      setPlans(res.data)
      setFilteredPlans(res.data)
      console.log('???í’ˆ ?°ì´??ë¡œë“œ ?±ê³µ')
    } catch (err) {
      console.error('???í’ˆ ?°ì´??ë¡œë“œ ?¤íŒ¨:', err)
      setPlans([])
      setFilteredPlans([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const data = {
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      original_price: formData.original_price ? Number(formData.original_price) : null,
      duration_months: formData.duration_months ? Number(formData.duration_months) : null,
      duration_days: formData.duration_days ? Number(formData.duration_days) : null,
      visits: formData.visits ? Number(formData.visits) : null,
      weekly_limit: formData.weekly_limit ? Number(formData.weekly_limit) : null,
      discount_rate: formData.discount_rate ? Number(formData.discount_rate) : 0,
      includes_uniform: formData.includes_uniform,
      includes_rashguard: formData.includes_rashguard,
      includes_locker: formData.includes_locker,
      includes_towel: formData.includes_towel,
      includes_gear: formData.includes_gear,
      is_popular: formData.is_popular,
      description: formData.description,
      notes: formData.notes
    }

    const request = editingPlan
      ? axios.put(`${getApiUrl()}/plans/${editingPlan.id}/`, data)
      : axios.post(`${getApiUrl()}/plans/`, data)

    request
      .then(() => {
        alert(editingPlan ? '???˜ì •?˜ì—ˆ?µë‹ˆ?? : '???±ë¡?˜ì—ˆ?µë‹ˆ??)
        setShowModal(false)
        setEditingPlan(null)
        resetForm()
        loadPlans()
      })
      .catch(err => alert('???¤íŒ¨: ' + (err.response?.data?.detail || '?¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤')))
  }

  const handleDelete = (id: number) => {
    if (!confirm('?•ë§ ?? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?')) return

    axios.delete(`${getApiUrl()}/plans/${id}/`)
      .then(() => {
        alert('?? œ?˜ì—ˆ?µë‹ˆ??)
        loadPlans()
      })
      .catch(err => alert('?? œ ?¤íŒ¨'))
  }

  const handleEdit = (plan: any) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      category: plan.category || '?¼ë°˜',
      price: plan.price,
      original_price: plan.original_price || '',
      duration_months: plan.duration_months || '',
      duration_days: plan.duration_days || '',
      visits: plan.visits || '',
      weekly_limit: plan.weekly_limit || '',
      discount_rate: plan.discount_rate || '',
      includes_uniform: plan.includes_uniform || false,
      includes_rashguard: plan.includes_rashguard || false,
      includes_locker: plan.includes_locker || false,
      includes_towel: plan.includes_towel || false,
      includes_gear: plan.includes_gear || false,
      is_popular: plan.is_popular || false,
      description: plan.description || '',
      notes: plan.notes || ''
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '?¼ë°˜',
      price: '',
      original_price: '',
      duration_months: '',
      duration_days: '',
      visits: '',
      weekly_limit: '',
      discount_rate: '',
      includes_uniform: false,
      includes_rashguard: false,
      includes_locker: false,
      includes_towel: false,
      includes_gear: false,
      is_popular: false,
      description: '',
      notes: ''
    })
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>
        <div style={{ fontSize: '48px', marginBottom: 16 }}>??/div>
        <p>ë¡œë”© ì¤?..</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2xl)', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'var(--text)' }}>
            ?« ?í’ˆ ê´€ë¦?          </h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-sub)' }}>
            ì´?{plans.length}ê°??í’ˆ ??{filteredPlans.length}ê°??œì‹œ
          </p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary">
          + ?í’ˆ ì¶”ê?
        </button>
      </div>

      {/* ì¹´í…Œê³ ë¦¬ ?„í„° */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="btn btn-sm"
              style={{
                backgroundColor: selectedCategory === cat ? 'var(--pri)' : 'var(--pill)',
                color: selectedCategory === cat ? 'white' : 'var(--text)',
                border: 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ?í’ˆ ê·¸ë¦¬??*/}
      {filteredPlans.length === 0 ? (
        <div className="card" style={{ padding: 'var(--spacing-4xl)', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: 16 }}>?“¦</div>
          <p style={{ color: 'var(--text-sub)' }}>?±ë¡???í’ˆ???†ìŠµ?ˆë‹¤</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: 16 }}>
            ì²??í’ˆ ì¶”ê??˜ê¸°
          </button>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: 'var(--spacing-lg)' 
        }}>
          {filteredPlans.map(plan => (
            <div key={plan.id} className="card" style={{ padding: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>
                    {plan.name}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                  {plan.is_popular && <span className="badge danger">?¸ê¸°</span>}
                  {plan.category && <span className="badge success">{plan.category}</span>}
                </div>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--pri)' }}>
                  ??Number(plan.price).toLocaleString()}
                </div>
                {plan.original_price && Number(plan.original_price) > Number(plan.price) && (
                  <div style={{ fontSize: '14px', color: 'var(--text-disabled)', textDecoration: 'line-through' }}>
                    ??Number(plan.original_price).toLocaleString()}
                  </div>
                )}
                {plan.discount_rate > 0 && (
                  <span className="badge danger" style={{ marginTop: 4 }}>
                    {plan.discount_rate}% ? ì¸
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gap: 'var(--spacing-sm)', fontSize: '14px', marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', backgroundColor: 'var(--pill)', borderRadius: 'var(--radius-lg)' }}>
                {plan.duration_months && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-sub)' }}>ê¸°ê°„</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{plan.duration_months}ê°œì›”</span>
                  </div>
                )}
                {plan.duration_days && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-sub)' }}>?¼ìˆ˜</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{plan.duration_days}??/span>
                  </div>
                )}
                {plan.visits && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-sub)' }}>?Ÿìˆ˜</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{plan.visits}??/span>
                  </div>
                )}
                {plan.weekly_limit && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-sub)' }}>ì£¼ë‹¹</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{plan.weekly_limit}??/span>
                  </div>
                )}
              </div>

              {(plan.includes_uniform || plan.includes_rashguard || plan.includes_locker || plan.includes_towel || plan.includes_gear) && (
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', marginBottom: 'var(--spacing-xs)' }}>
                    ?¬í•¨ ?¬í•­
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                    {plan.includes_uniform && <span className="pill" style={{ fontSize: '12px' }}>?„ë³µ</span>}
                    {plan.includes_rashguard && <span className="pill" style={{ fontSize: '12px' }}>?˜ì‰¬ê°€??/span>}
                    {plan.includes_locker && <span className="pill" style={{ fontSize: '12px' }}>?½ì»¤</span>}
                    {plan.includes_towel && <span className="pill" style={{ fontSize: '12px' }}>?˜ê±´</span>}
                    {plan.includes_gear && <span className="pill" style={{ fontSize: '12px' }}>?¥ë¹„</span>}
                  </div>
                </div>
              )}

              {plan.description && (
                <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginBottom: 'var(--spacing-lg)', lineHeight: 1.5 }}>
                  {plan.description}
                </p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)', marginTop: 'auto' }}>
                <button onClick={() => handleEdit(plan)} className="btn btn-secondary btn-sm">
                  ?˜ì •
                </button>
                <button onClick={() => handleDelete(plan.id)} className="btn btn-sm" style={{ 
                  backgroundColor: 'transparent',
                  border: '1px solid var(--line)',
                  color: 'var(--danger)'
                }}>
                  ?? œ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ëª¨ë‹¬ */}
      {showModal && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1000,
            }}
            onClick={() => { setShowModal(false); setEditingPlan(null); }}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'var(--card-bg)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 1001,
              width: '90%',
              maxWidth: 600,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ padding: 'var(--spacing-3xl)' }}>
              <h2 style={{ margin: '0 0 var(--spacing-xl) 0', fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>
                {editingPlan ? '?ï¸ ?í’ˆ ?˜ì •' : '???í’ˆ ì¶”ê?'}
              </h2>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
                <div>
                  <label>?í’ˆëª?*</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="?? ì£¼ì§“??ë¬´ì œ??1ê°œì›”"
                  />
                </div>

                <div>
                  <label>ì¹´í…Œê³ ë¦¬</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.filter(c => c !== '?„ì²´').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div>
                    <label>?ë§¤ê°€ê²?(?? *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      placeholder="150000"
                    />
                  </div>
                  <div>
                    <label>?•ê? (??</label>
                    <input
                      type="number"
                      value={formData.original_price}
                      onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                      placeholder="200000"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div>
                    <label>ê¸°ê°„ (ê°œì›”)</label>
                    <input
                      type="number"
                      value={formData.duration_months}
                      onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label>ê¸°ê°„ (??</label>
                    <input
                      type="number"
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div>
                    <label>?Ÿìˆ˜</label>
                    <input
                      type="number"
                      value={formData.visits}
                      onChange={(e) => setFormData({ ...formData, visits: e.target.value })}
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label>ì£¼ë‹¹ ?Ÿìˆ˜</label>
                    <input
                      type="number"
                      value={formData.weekly_limit}
                      onChange={(e) => setFormData({ ...formData, weekly_limit: e.target.value })}
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <label>? ì¸??(%)</label>
                    <input
                      type="number"
                      value={formData.discount_rate}
                      onChange={(e) => setFormData({ ...formData, discount_rate: e.target.value })}
                      placeholder="10"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ marginBottom: 'var(--spacing-sm)' }}>?¬í•¨ ?¬í•­</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 'var(--spacing-sm)' }}>
                    {[
                      { key: 'includes_uniform', label: '?„ë³µ' },
                      { key: 'includes_rashguard', label: '?˜ì‰¬ê°€?? },
                      { key: 'includes_locker', label: '?½ì»¤' },
                      { key: 'includes_towel', label: '?˜ê±´' },
                      { key: 'includes_gear', label: '?¥ë¹„' }
                    ].map(item => (
                      <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData[item.key as keyof typeof formData] as boolean}
                          onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
                        />
                        <span style={{ fontSize: '14px', color: 'var(--text)' }}>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer', padding: 'var(--spacing-md)', backgroundColor: 'var(--pill)', borderRadius: 'var(--radius-lg)' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_popular}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                  />
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>â­??¸ê¸° ?í’ˆ?¼ë¡œ ?œì‹œ</span>
                </label>

                <div>
                  <label>?í’ˆ ?¤ëª…</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="?í’ˆ???€???¤ëª…???…ë ¥?˜ì„¸??
                    rows={3}
                  />
                </div>

                <div>
                  <label>?´ë? ë©”ëª¨</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="ê´€ë¦¬ì??ë©”ëª¨"
                    rows={2}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                  <button 
                    type="button" 
                    onClick={() => { setShowModal(false); setEditingPlan(null); }}
                    className="btn btn-secondary"
                  >
                    ì·¨ì†Œ
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingPlan ? '?˜ì •' : 'ì¶”ê?'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
