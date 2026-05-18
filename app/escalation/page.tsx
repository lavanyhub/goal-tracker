'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Escalation() {
  const [escalations, setEscalations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEscalations()
  }, [])

  const fetchEscalations = async () => {
    setLoading(true)
    const { data: employees } = await supabase.from('users').select('*').eq('role', 'employee')
    if (!employees) return

    const results: any[] = []
    const now = new Date()

    for (const emp of employees) {
      const { count: totalGoals } = await supabase
        .from('goals').select('*', { count: 'exact' })
        .eq('employee_id', emp.id)

      const { count: submittedGoals } = await supabase
        .from('goals').select('*', { count: 'exact' })
        .eq('employee_id', emp.id)
        .in('status', ['pending', 'approved'])

      const { count: checkins } = await supabase
        .from('checkins').select('*', { count: 'exact' })
        .eq('employee_id', emp.id)

      const { data: pendingGoals } = await supabase
        .from('goals').select('*')
        .eq('employee_id', emp.id)
        .eq('status', 'pending')

      // Check escalation conditions
      if ((totalGoals || 0) === 0) {
        results.push({
          employee: emp.name,
          email: emp.email,
          type: 'GOAL_NOT_SUBMITTED',
          severity: 'HIGH',
          message: 'Employee has not created any goals for this cycle',
          daysPending: 15,
          status: 'OPEN'
        })
      } else if ((submittedGoals || 0) === 0) {
        results.push({
          employee: emp.name,
          email: emp.email,
          type: 'GOAL_NOT_SUBMITTED',
          severity: 'HIGH',
          message: 'Employee has goals in draft but not submitted for approval',
          daysPending: 10,
          status: 'OPEN'
        })
      }

      if (pendingGoals && pendingGoals.length > 0) {
        const oldest = pendingGoals[0]
        const created = new Date(oldest.created_at)
        const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
        if (days >= 1) {
          results.push({
            employee: emp.name,
            email: emp.email,
            type: 'APPROVAL_PENDING',
            severity: days >= 3 ? 'HIGH' : 'MEDIUM',
            message: `Manager has not approved goals submitted ${days} day(s) ago`,
            daysPending: days,
            status: 'OPEN'
          })
        }
      }

      if ((checkins || 0) === 0 && (submittedGoals || 0) > 0) {
        results.push({
          employee: emp.name,
          email: emp.email,
          type: 'CHECKIN_MISSING',
          severity: 'MEDIUM',
          message: 'No quarterly check-in completed for this employee',
          daysPending: 7,
          status: 'OPEN'
        })
      }
    }

    setEscalations(results)
    setLoading(false)
  }

  const getSeverityColor = (severity: string) => {
    if (severity === 'HIGH') return 'bg-red-100 text-red-700'
    if (severity === 'MEDIUM') return 'bg-yellow-100 text-yellow-700'
    return 'bg-blue-100 text-blue-700'
  }

  const getTypeLabel = (type: string) => {
    if (type === 'GOAL_NOT_SUBMITTED') return '🚨 Goal Not Submitted'
    if (type === 'APPROVAL_PENDING') return '⏳ Approval Overdue'
    if (type === 'CHECKIN_MISSING') return '💬 Check-in Missing'
    return type
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-lg">Checking escalations...</p>
      </div>
    </div>
  )

  const high = escalations.filter(e => e.severity === 'HIGH').length
  const medium = escalations.filter(e => e.severity === 'MEDIUM').length

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow p-4 flex items-center gap-3">
        <a href="/dashboard" className="text-gray-400 hover:text-blue-600 text-sm">← Dashboard</a>
        <h1 className="text-xl font-bold text-blue-600">Escalation Module</h1>
      </div>

      <div className="p-8">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border-2 border-red-200 bg-red-50">
            <div className="text-3xl mb-2">🚨</div>
            <div className="text-3xl font-bold text-red-700">{high}</div>
            <div className="text-sm font-medium text-red-600 mt-1">High Severity</div>
          </div>
          <div className="bg-white p-6 rounded-xl border-2 border-yellow-200 bg-yellow-50">
            <div className="text-3xl mb-2">⚠️</div>
            <div className="text-3xl font-bold text-yellow-700">{medium}</div>
            <div className="text-sm font-medium text-yellow-600 mt-1">Medium Severity</div>
          </div>
          <div className="bg-white p-6 rounded-xl border-2 border-blue-200 bg-blue-50">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-3xl font-bold text-blue-700">{escalations.length}</div>
            <div className="text-sm font-medium text-blue-600 mt-1">Total Open</div>
          </div>
        </div>

        {escalations.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Escalations!</h3>
            <p className="text-gray-400">All employees are on track. Nothing to escalate.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left text-gray-600">Employee</th>
                  <th className="p-4 text-left text-gray-600">Issue</th>
                  <th className="p-4 text-left text-gray-600">Details</th>
                  <th className="p-4 text-left text-gray-600">Days Pending</th>
                  <th className="p-4 text-left text-gray-600">Severity</th>
                  <th className="p-4 text-left text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {escalations.map((esc, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-medium text-gray-800">{esc.employee}</p>
                      <p className="text-xs text-gray-400">{esc.email}</p>
                    </td>
                    <td className="p-4 font-medium text-gray-700">{getTypeLabel(esc.type)}</td>
                    <td className="p-4 text-sm text-gray-500 max-w-xs">{esc.message}</td>
                    <td className="p-4 text-gray-700 font-medium">{esc.daysPending}d</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(esc.severity)}`}>
                        {esc.severity}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        {esc.status}
                      </span>
                    </td>
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