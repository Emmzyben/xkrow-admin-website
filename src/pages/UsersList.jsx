import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../constants';

const UsersList = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const filteredUsers = users.filter(u => 
    (u.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (u.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Users</h1>
        <input 
          type="text" 
          placeholder="Search name or email..." 
          className="input-field"
          style={{ width: '300px', margin: 0 }}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="card table-container">
        {loading ? (
          <div>Loading users...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Profile</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    {u.profilePicture ? (
                      <img src={u.profilePicture} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 'bold', fontSize: '1rem' }}>
                        {u.firstName ? u.firstName.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>{u.mobileNumber}</td>
                  <td>
                    {u.disabled ? 
                      <span className="badge badge-danger">Disabled</span> : 
                      <span className="badge badge-success">Active</span>
                    }
                  </td>
                  <td>
                    {u.isVerified ? 'Yes' : 'No'}
                  </td>
                  <td>
                    <Link to={`/users/${u.id}`} className="btn-outline" style={{ padding: '4px 12px', fontSize: '0.85rem' }}>
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UsersList;
