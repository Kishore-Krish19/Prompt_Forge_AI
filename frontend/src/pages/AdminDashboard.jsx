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

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Admin — Users</h2>
      {loading ? <p>Loading...</p> : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="pb-2">Email</th>
              <th className="pb-2">GPT</th>
              <th className="pb-2">Claude</th>
              <th className="pb-2">Gemini</th>
              <th className="pb-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u=> (
              <tr key={u.email} className="border-t">
                <td className="py-2">{u.email}</td>
                <td className="py-2">{u.usage?.gpt || 0}</td>
                <td className="py-2">{u.usage?.claude || 0}</td>
                <td className="py-2">{u.usage?.gemini || 0}</td>
                <td className="py-2">{new Date(u.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
