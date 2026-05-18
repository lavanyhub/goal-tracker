'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function AuditTrail() {
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false })
      setLogs(data || [])
    }
    fetchLogs()
  }, [])

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '32px'}}>
      <div style={{maxWidth: '1000px', margin: '0 auto'}}>
        <h1 style={{fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '4px'}}>Audit Trail</h1>
        <p style={{fontSize: '14px', color: '#64748b', marginBottom: '32px'}}>Complete log of all goal changes</p>
        <div style={{backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden'}}>
          <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '12px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0'}}>
            <span style={{fontSize: '13px', fontWeight: '600', color: '#475569'}}>When</span>
            <span style={{fontSize: '13px', fontWeight: '600', color: '#475569'}}>Field Changed</span>
            <span style={{fontSize: '13px', fontWeight: '600', color: '#475569'}}>Old Value</span>
            <span style={{fontSize: '13px', fontWeight: '600', color: '#475569'}}>New Value</span>
          </div>
          {logs.length === 0 ? (
            <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}>No audit logs yet</div>
          ) : (
            logs.map((log, i) => (
              <div key={log.id} style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', backgroundColor: i % 2 === 0 ? 'white' : '#fafafa'}}>
                <span style={{fontSize: '13px', color: '#64748b'}}>{new Date(log.created_at).toLocaleString()}</span>
                <span style={{fontSize: '13px', fontWeight: '500', color: '#1e293b'}}>{log.field}</span>
                <span style={{fontSize: '13px', color: '#ef4444', backgroundColor: '#fef2f2', padding: '2px 8px', borderRadius: '4px', display: 'inline-block'}}>{log.old_value}</span>
                <span style={{fontSize: '13px', color: '#16a34a', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '4px', display: 'inline-block'}}>{log.new_value}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}