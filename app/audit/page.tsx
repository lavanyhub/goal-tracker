'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function AuditTrail() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
    setLogs(data || [])
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow p-4">
        <h1 className="text-xl font-bold text-blue-600">Audit Trail</h1>
      </div>
      <div className="p-8">
        {logs.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-400">
            No audit logs yet!
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-gray-600">When</th>
                  <th className="p-3 text-left text-gray-600">Field Changed</th>
                  <th className="p-3 text-left text-gray-600">Old Value</th>
                  <th className="p-3 text-left text-gray-600">New Value</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-t">
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 text-sm font-medium text-gray-800">
                      {log.field}
                    </td>
                    <td className="p-3 text-sm text-red-600">{log.old_value}</td>
                    <td className="p-3 text-sm text-green-600">{log.new_value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}