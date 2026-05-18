'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'

export default function Analytics() {
  const [goalsByThrust, setGoalsByThrust] = useState<any[]>([])
  const [goalsByStatus, setGoalsByStatus] = useState<any[]>([])
  const [completionData, setCompletionData] = useState<any[]>([])

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    const { data: goals } = await supabase.from('goals').select('*')
    if (!goals) return

    // Goals by thrust area
    const thrustMap: any = {}
    goals.forEach(g => {
      const area = g.thrust_area || 'General'
      thrustMap[area] = (thrustMap[area] || 0) + 1
    })
    setGoalsByThrust(Object.entries(thrustMap).map(([name, count]) => ({ name, count })))

    // Goals by status
    const statusMap: any = {}
    goals.forEach(g => {
      statusMap[g.status] = (statusMap[g.status] || 0) + 1
    })
    setGoalsByStatus(Object.entries(statusMap).map(([name, value]) => ({ name, value })))

    // Completion by employee
    const { data: users } = await supabase.from('users').select('*').eq('role', 'employee')
    if (users) {
      const completion = await Promise.all(users.map(async (user) => {
        const { count: total } = await supabase
          .from('goals').select('*', { count: 'exact' })
          .eq('employee_id', user.id)
        const { count: approved } = await supabase
          .from('goals').select('*', { count: 'exact' })
          .eq('employee_id', user.id)
          .eq('status', 'approved')
        return {
          name: user.name,
          total: total || 0,
          approved: approved || 0
        }
      }))
      setCompletionData(completion)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow p-4">
        <h1 className="text-xl font-bold text-blue-600">Analytics Dashboard</h1>
      </div>

      <div className="p-8 grid gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Goals by Thrust Area</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={goalsByThrust}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Goals by Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={goalsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {goalsByStatus.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Employee Completion</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#3B82F6" name="Total Goals" />
                <Bar dataKey="approved" fill="#10B981" name="Approved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}