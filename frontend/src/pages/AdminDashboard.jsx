import React from 'react'
import { fetchUsers } from '../services/api'

export default function AdminDashboard(){
  const [users, setUsers] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const token = localStorage.getItem('token')

  React.useEffect(()=>{
    if(!token) return
    setLoading(true)
    fetchUsers().then(u=>setUsers(u)).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  if(!token) return <div className="text-center text-slate-600">Admin only — please login.</div>

  // Build dynamic model columns from user usage keys
  const modelKeys = React.useMemo(() => {
    const keys = new Set();
    users.forEach(u => {
      if (u.usage) Object.keys(u.usage).forEach(k => keys.add(k));
    });
    return Array.from(keys).sort();
  }, [users]);

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Admin — Users</h2>
      {loading ? <p>Loading...</p> : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="pb-2">Email</th>
              {modelKeys.map(m => (
                <th key={m} className="pb-2">{m}</th>
              ))}
              <th className="pb-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u=> (
              <tr key={u.email} className="border-t">
                <td className="py-2">{u.email}</td>
                {modelKeys.map(m => (
                  <td key={m} className="py-2">{u.usage?.[m] || 0}</td>
                ))}
                <td className="py-2">{new Date(u.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
