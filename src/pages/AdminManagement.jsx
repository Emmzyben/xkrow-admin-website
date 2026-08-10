import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../constants';
import { UserPlus, Trash2, ShieldCheck, Edit, X } from 'lucide-react';

const AdminManagement = () => {
  const { token } = useContext(AuthContext);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editFullname, setEditFullname] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAdmins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch(`${BASE_URL}/api/admin/admins`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, fullname, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(`Admin "${data.email}" added successfully.`);
        setEmail('');
        setFullname('');
        setPassword('');
        fetchAdmins();
      } else {
        setError(data.message || 'Failed to add admin.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, adminEmail) => {
    if (!window.confirm(`Remove admin "${adminEmail}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`${BASE_URL}/api/admin/admins/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message);
        setAdmins((prev) => prev.filter((a) => a.id !== id));
      } else {
        setError(data.message || 'Failed to remove admin.');
      }
    } catch {
      setError('Network error. Please try again.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setEditSubmitting(true);

    try {
      const res = await fetch(`${BASE_URL}/api/admin/admins/${editingAdmin.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullname: editFullname, password: editPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess('Admin updated successfully.');
        setEditingAdmin(null);
        setEditFullname('');
        setEditPassword('');
        fetchAdmins();
      } else {
        setError(data.message || 'Failed to update admin.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Admin Management</h1>

      {/* Form Area */}
      {editingAdmin ? (
        <div className="card" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Edit size={20} color="var(--primary-color)" />
              Edit Admin: {editingAdmin.email}
            </h3>
            <button
              onClick={() => setEditingAdmin(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 14px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.9rem' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleEditSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="input-field"
                value={editFullname}
                onChange={(e) => setEditFullname(e.target.value)}
                placeholder="Admin Full Name"
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label">New Password (leave blank to keep current)</label>
              <input
                type="password"
                className="input-field"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Min. 8 characters"
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-primary" disabled={editSubmitting}>
                {editSubmitting ? 'Updating...' : 'Update Admin'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setEditingAdmin(null)}
                style={{ padding: '12px 24px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={20} color="var(--primary-color)" />
            Add New Admin
          </h3>

          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 14px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.9rem' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Email</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="input-field"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Admin Full Name"
                required
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Admin'}
            </button>
          </form>
        </div>
      )}

      {/* Admins Table */}
      <div className="card">
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="var(--primary-color)" />
          Current Admins
        </h3>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Full Name</th>
                  <th>Created</th>
                  <th>ID</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 500 }}>{a.email}</td>
                    <td>{a.fullname || '-'}</td>
                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.id}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn-primary"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.85rem', background: '#3b82f6' }}
                          onClick={() => {
                            setEditingAdmin(a);
                            setEditFullname(a.fullname || '');
                            setEditPassword('');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          className="btn-danger"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.85rem' }}
                          onClick={() => handleDelete(a.id, a.email)}
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No admins found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagement;
