export default function CostOptimisation() {
  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '32px'}}>
      <div style={{maxWidth: '900px', margin: '0 auto'}}>

        <h1 style={{fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '4px'}}>Cost Optimisation</h1>
        <p style={{fontSize: '14px', color: '#64748b', marginBottom: '32px'}}>Infrastructure choices, hosting costs and efficiency strategies</p>

        {/* Monthly Cost Breakdown */}
        <div style={{backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e2e8f0'}}>
          <h2 style={{fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px'}}>Monthly Infrastructure Cost</h2>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
            <thead>
              <tr style={{backgroundColor: '#f8fafc'}}>
                <th style={{padding: '10px 16px', textAlign: 'left', color: '#475569', fontWeight: '600', borderBottom: '1px solid #e2e8f0'}}>Service</th>
                <th style={{padding: '10px 16px', textAlign: 'left', color: '#475569', fontWeight: '600', borderBottom: '1px solid #e2e8f0'}}>Usage</th>
                <th style={{padding: '10px 16px', textAlign: 'left', color: '#475569', fontWeight: '600', borderBottom: '1px solid #e2e8f0'}}>Plan</th>
                <th style={{padding: '10px 16px', textAlign: 'right', color: '#475569', fontWeight: '600', borderBottom: '1px solid #e2e8f0'}}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Vercel', 'Frontend hosting + CI/CD', 'Hobby (Free)', '$0'],
                ['Supabase', 'Database + Auth + API', 'Free Tier', '$0'],
                ['Supabase DB', '500MB storage included', 'Free Tier', '$0'],
                ['Supabase Auth', 'Up to 50,000 MAU', 'Free Tier', '$0'],
                ['GitHub', 'Source control + Actions', 'Free Tier', '$0'],
              ].map(([service, usage, plan, cost], i) => (
                <tr key={i} style={{borderBottom: '1px solid #f1f5f9'}}>
                  <td style={{padding: '12px 16px', fontWeight: '600', color: '#1e293b'}}>{service}</td>
                  <td style={{padding: '12px 16px', color: '#64748b'}}>{usage}</td>
                  <td style={{padding: '12px 16px'}}>
                    <span style={{backgroundColor: '#f0fdf4', color: '#16a34a', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'}}>{plan}</span>
                  </td>
                  <td style={{padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: '#16a34a'}}>{cost}</td>
                </tr>
              ))}
              <tr style={{backgroundColor: '#f0fdf4'}}>
                <td colSpan={3} style={{padding: '12px 16px', fontWeight: '700', color: '#1e293b'}}>Total Monthly Cost</td>
                <td style={{padding: '12px 16px', textAlign: 'right', fontWeight: '800', color: '#16a34a', fontSize: '18px'}}>$0 / month</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* API Efficiency */}
        <div style={{backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e2e8f0'}}>
          <h2 style={{fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px'}}>API Call Efficiency</h2>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
            {[
              ['Selective Columns', 'Every query uses .select() with only needed columns — no SELECT * in production flows', '#eff6ff', '#2563eb'],
              ['DB Indexes', '5 indexes added on high-frequency query columns: email, employee_id, status, goal_id', '#f0fdf4', '#16a34a'],
              ['Single Fetches', 'Role detection uses .single() to fetch exactly one row instead of arrays', '#fefce8', '#ca8a04'],
              ['No Polling', 'Zero interval-based polling — all data fetched on user action only', '#fdf4ff', '#9333ea'],
              ['RLS Security', 'Row Level Security enforced at DB level — no extra API calls for permission checks', '#fff7ed', '#ea580c'],
              ['Free Tier Limits', 'Supabase free: 500MB DB, 2GB bandwidth, 50k auth users — well within hackathon scope', '#f0fdf4', '#16a34a'],
            ].map(([title, desc, bg, color], i) => (
              <div key={i} style={{backgroundColor: bg, borderRadius: '8px', padding: '16px', border: `1px solid ${color}22`}}>
                <h3 style={{fontSize: '14px', fontWeight: '600', color, marginBottom: '6px'}}>{title}</h3>
                <p style={{fontSize: '13px', color: '#475569', margin: 0, lineHeight: '1.5'}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scalability */}
        <div style={{backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0'}}>
          <h2 style={{fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px'}}>Scalability Path</h2>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px'}}>
            {[
              ['Current (Free)', '$0/mo', '50k users, 500MB DB', '#f0fdf4', '#16a34a'],
              ['Growth (Pro)', '$25/mo', '100k users, 8GB DB', '#eff6ff', '#2563eb'],
              ['Enterprise', 'Custom', 'Unlimited + SLA', '#fdf4ff', '#9333ea'],
            ].map(([tier, price, features, bg, color], i) => (
              <div key={i} style={{backgroundColor: bg, borderRadius: '8px', padding: '16px', textAlign: 'center', border: `1px solid ${color}33`}}>
                <div style={{fontSize: '13px', fontWeight: '600', color, marginBottom: '4px'}}>{tier}</div>
                <div style={{fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '4px'}}>{price}</div>
                <div style={{fontSize: '12px', color: '#64748b'}}>{features}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}