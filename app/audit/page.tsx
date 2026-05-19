'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function AuditTrail() {
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('audit_logs_with_users')
        .select('*')
        .order('created_at', { ascending: false })
      setLogs(data || [])
    }
    fetchLogs()
  }, [])

  const exportCSV = () => {
    const rows = [['When', 'Changed By', 'Goal', 'Field', 'Old Value', 'New Value']]
    logs.forEach(log => {
      rows.push([
        new Date(log.created_at).toLocaleString(),
        `${log.changed_by_name} (${log.changed_by_email})`,
        log.goal_title || log.goal_id,
        log.field,
        log.old_value,
        log.new_value
      ])
    })
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'audit_trail.csv'
    a.click()
  }

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '32px'}}>
      <div style={{maxWidth: '1100px', margin: '0 auto'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px'}}>
          <div>
            <h1 style={{fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '4px'}}>Audit Trail</h1>
            <p style={{fontSize: '14px', color: '#64748b', margin: 0}}>Complete log of all goal changes with user attribution</p>
          </div>
          <button
            onClick={exportCSV}
            style={{backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'}}>
            📥 Export CSV
          </button>
        </div>

        <div style={{backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden'}}>
          <div style={{display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr 1fr 1fr', padding: '12px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0'}}>
            <span style={{fontSize: '13px', fontWeight: '600', color: '#475569'}}>When</span>
            <span style={{fontSize: '13px', fontWeight: '600', color: '#475569'}}>Changed By</span>
            <span style={{fontSize: '13px', fontWeight: '600', color: '#475569'}}>Goal</span>
            <span style={{fontSize: '13px', fontWeight: '600', color: '#475569'}}>Field</span>
            <span style={{fontSize: '13px', fontWeight: '600', color: '#475569'}}>Old Value</span>
            <span style={{fontSize: '13px', fontWeight: '600', color: '#475569'}}>New Value</span>
          </div>
          {logs.length === 0 ? (
            <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}>No audit logs yet</div>
          ) : (
            logs.map((log, i) => (
              <div key={log.id} style={{display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', backgroundColor: i % 2 === 0 ? 'white' : '#fafafa', alignItems: 'center'}}>
                <span style={{fontSize: '13px', color: '#64748b'}}>{new Date(log.created_at).toLocaleString()}</span>
                <div>
                  <p style={{fontSize: '13px', fontWeight: '500', color: '#1e293b', margin: 0}}>{log.changed_by_name || 'System'}</p>
                  <p style={{fontSize: '12px', color: '#64748b', margin: 0}}>{log.changed_by_email}</p>
                </div>
                <span style={{fontSize: '13px', color: '#1e293b'}}>{log.goal_title || '—'}</span>
                <span style={{fontSize: '13px', fontWeight: '500', color: '#1e293b'}}>{log.field}</span>
                <span style={{fontSize: '12px', color: '#ef4444', backgroundColor: '#fef2f2', padding: '2px 8px', borderRadius: '4px'}}>{log.old_value}</span>
                <span style={{fontSize: '12px', color: '#16a34a', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '4px'}}>{log.new_value}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}