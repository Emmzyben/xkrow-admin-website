import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Ban, CheckCircle } from 'lucide-react';
import { BASE_URL } from '../constants';

const UserDetails = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [userRes, txRes, vendorRes] = await Promise.all([
          fetch(`${BASE_URL}/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${BASE_URL}/api/admin/users/${id}/transactions`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${BASE_URL}/api/admin/users/${id}/vendor-profile`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (userRes.ok) {
          const allUsers = await userRes.json();
          setUser(allUsers.find(u => u.id === id));
        }
        if (txRes.ok) setTransactions(await txRes.json());
        if (vendorRes.ok) setVendorProfile(await vendorRes.json());

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id, token]);

  const toggleDisable = async () => {
    const newStatus = !user.disabled;
    if (!window.confirm(`Are you sure you want to ${newStatus ? 'disable' : 'enable'} this account?`)) return;

    try {
      const res = await fetch(`${BASE_URL}/api/admin/users/${id}/disable`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ disabled: newStatus })
      });
      if (res.ok) {
        setUser({ ...user, disabled: newStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link to="/users" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={20} style={{ marginRight: '8px' }} /> Back to Users
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ margin: '0 0 8px 0' }}>{user.firstName} {user.lastName}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{user.email} • {user.mobileNumber}</p>
        </div>
        <button 
          className={user.disabled ? "btn-outline" : "btn-danger"} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={toggleDisable}
        >
          {user.disabled ? <CheckCircle size={18} /> : <Ban size={18} />}
          {user.disabled ? 'Enable Account' : 'Disable Account'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Info Card */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Profile Information</h3>
          <p><strong>Balance:</strong> ₦{parseFloat(user.balance || 0).toLocaleString()}</p>
          <p><strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}</p>
          <p><strong>Status:</strong> {user.disabled ? 'Disabled' : 'Active'}</p>
          <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>

        {/* Vendor Profile Card */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Business Profiles</h3>
          {vendorProfile ? (
            Object.entries(vendorProfile).map(([key, acc]) => (
              <div key={key} style={{ marginBottom: '16px' }}>
                <p><strong>Type:</strong> <span style={{ textTransform: 'capitalize' }}>{acc.accountType}</span></p>
                <p><strong>Business Name:</strong> {acc.businessDetails?.businessName || acc.businessDetails?.brandName}</p>
                <p><strong>Plan:</strong> {acc.businessDetails?.plan}</p>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No business or professional profiles found.</p>
          )}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Recent Transactions</h3>
        {transactions.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 10).map(tx => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.date || tx.createdAt).toLocaleString()}</td>
                    <td><span className={tx.transaction_type === 'credit' ? 'badge badge-success' : 'badge badge-warning'}>{tx.transaction_type}</span></td>
                    <td>{tx.category || tx.type}</td>
                    <td>{tx.description}</td>
                    <td>₦{parseFloat(tx.amount || 0).toLocaleString()}</td>
                    <td>{tx.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>No transactions found.</p>
        )}
      </div>

    </div>
  );
};

export default UserDetails;
