'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Completion() {
  const [employeeStatus, setEmployeeStatus] = useState<any[]>([])

  useEffect(() => {
    fetchCompletionStatus()
  }, [])

  const fetchCompletionStatus = async () => {
    const { data: employees } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'employee')

    if (!employees) return

    const status = await Promise.all(employees.map(async (emp) => {
      const { count: totalGoals } = await supabase
        .from('goals')
        .select('*', { count: 'exact' })
        .eq('employee_id', emp.id)

      const { count: submittedGoals } = await supabase
        .from('goals')
        .select('*', { count: 'exact' })
        .eq('employee_id', emp.id)
        .in('status', ['pending', 'approved'])

      const { count: approvedGoals } = await supabase
        .from('goals')
        .select('*', { count: 'exact' })
        .eq('employee_id', emp.id)
        .eq('status', 'approved')

      const { count: checkins } = await supabase
        .from('checkins')
        .select('*', { count: 'exact' })
        .eq('employee_id', emp.id)

      const { count: achievements } = await supabase
        .from('achievements')
        .select('*', { count: 'exact' })
        .eq('goal_id', emp.id)

      return {
        name: emp.name,
        email: emp.email,
        totalGoals: totalGoals || 0,
        submittedGoals: submittedGoals || 0,
        approvedGoals: approvedGoals || 0,
        checkins: checkins || 0,
        goalStatus: totalGoals === 0 ? 'NOT STARTED' : submittedGoals === 0 ? 'DRAFT' : approvedGoals > 0 ? 'APPROVED' : 'PENDING',
        checkinStatus: (checkins || 0) > 0 ? 'DONE' : 'PENDING'
      }
    }))

    setEmployeeStatus(status)
  }

  const getStatusColor = (status: string) => {
    if (status === 'APPROVED' || status === 'DONE') return 'bg-green-100 text-green-700'
    if (status === 'PENDING') return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow p-4">
        <h1 className="text-xl font-bold text-blue-600">Completion Dashboard</h1>
      </div>

      <div className="p-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-gray-600">Employee</th>
                <th className="p-4 text-left text-gray-600">Total Goals</th>
                <th className="p-4 text-left text-gray-600">Submitted</th>
                <th className="p-4 text-left text-gray-600">Approved</th>
                <th className="p-4 text-left text-gray-600">Goal Status</th>
                <th className="p-4 text-left text-gray-600">Check-in Status</th>
              </tr>
            </thead>
            <tbody>
              {employeeStatus.map((emp, index) => (
                <tr key={index} className="border-t">
                  <td className="p-4">
                    <p className="font-medium text-gray-800">{emp.name}</p>
                    <p className="text-sm text-gray-500">{emp.email}</p>
                  </td>
                  <td className="p-4 text-gray-700">{emp.totalGoals}</td>
                  <td className="p-4 text-gray-700">{emp.submittedGoals}</td>
                  <td className="p-4 text-gray-700">{emp.approvedGoals}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(emp.goalStatus)}`}>
                      {emp.goalStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(emp.checkinStatus)}`}>
                      {emp.checkinStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}