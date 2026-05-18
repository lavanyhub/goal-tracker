'use client'
import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Please enter both email and password!')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage('Wrong email or password!')
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-blue-900 text-white flex-col justify-center items-center p-12">
        <div className="text-center">
          <div className="text-7xl mb-6">🎯</div>
          <h1 className="text-4xl font-bold mb-4">Goal Tracker Portal</h1>
          <p className="text-blue-200 text-lg mb-8">
            Align. Track. Achieve.
          </p>
          <div className="grid gap-4 text-left">
            <div className="flex items-center gap-3 bg-blue-700 bg-opacity-50 p-4 rounded-lg">
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-semibold">Set Goals</p>
                <p className="text-blue-200 text-sm">Create and align goals with org objectives</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-blue-700 bg-opacity-50 p-4 rounded-lg">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold">Track Progress</p>
                <p className="text-blue-200 text-sm">Monitor achievements with real-time dashboards</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-blue-700 bg-opacity-50 p-4 rounded-lg">
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-semibold">Analytics</p>
                <p className="text-blue-200 text-sm">Gain insights with powerful reporting tools</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🎯</div>
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Sign in to your Goal Tracker account</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {message && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                ⚠️ {message}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-semibold transition-all disabled:opacity-50"
            >
              {loading ? '⏳ Signing in...' : 'Sign In →'}
            </button>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-3">Demo Accounts</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => { setEmail('lavanysharma2023@gmail.com'); setPassword('Admin@123') }}
                  className="text-xs bg-purple-50 text-purple-700 p-2 rounded-lg hover:bg-purple-100"
                >
                  👑 Admin
                </button>
                <button
                  onClick={() => { setEmail('manager@test.com'); setPassword('Manager@123') }}
                  className="text-xs bg-blue-50 text-blue-700 p-2 rounded-lg hover:bg-blue-100"
                >
                  👔 Manager
                </button>
                <button
                  onClick={() => { setEmail('employee@test.com'); setPassword('Employee@123') }}
                  className="text-xs bg-green-50 text-green-700 p-2 rounded-lg hover:bg-green-100"
                >
                  👤 Employee
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">Click to auto-fill credentials</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}