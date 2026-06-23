import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Ban, CheckCircle, X } from 'lucide-react';
import { BASE_URL } from '../constants';

const UserDetails = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);

  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedImage, setExpandedImage] = useState(null);

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

          <p><strong>Phone:</strong> {user.mobileNumber || 'N/A'}</p>
          <p><strong>DOB:</strong> {user.dob || 'N/A'}</p>
          <p><strong>Address:</strong> {user.address || 'N/A'}</p>
          <p><strong>State:</strong> {user.state || 'N/A'}</p>
          <p><strong>NIN:</strong> {user.nin || 'N/A'}</p>

          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            {user.profilePicture && (
              <div style={{ cursor: 'pointer' }} onClick={() => setExpandedImage(user.profilePicture)}>
                <p style={{ marginBottom: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}>Profile Picture:</p>
                <img src={user.profilePicture} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
              </div>
            )}
            {user.IDcard && (
              <div style={{ cursor: 'pointer' }} onClick={() => setExpandedImage(user.IDcard)}>
                <p style={{ marginBottom: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}>ID Card:</p>
                <img src={user.IDcard} alt="ID Card" style={{ width: '120px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
              </div>
            )}
          </div>
        </div>

        {/* Vendor Profile Card */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Business Profiles</h3>
          {vendorProfile ? (
            Object.entries(vendorProfile).map(([key, acc]) => {
              const details = acc.businessDetails || {};
              const logo = details.BusinessLogo || details.brandLogo || details.profilePicture;

              return (
                <div key={key} style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px dashed var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{details.businessName || details.brandName || 'Unnamed Business'}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'capitalize' }}>{acc.accountType} Account • {details.status || 'Active'}</p>
                    </div>
                    {logo && (
                      <div style={{ cursor: 'pointer' }} onClick={() => setExpandedImage(logo)}>
                        <img src={logo} alt="Business Logo" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.9rem' }}>
                    {details.businessType && <p><strong>Type:</strong> {details.businessType}</p>}
                    {details.businessCategory && <p><strong>Category:</strong> {details.businessCategory}</p>}
                    {details.registrationNumber && <p><strong>Reg Number:</strong> {details.registrationNumber}</p>}
                    <p><strong>Verified:</strong> {details.isVerified ? 'Yes' : 'No'}</p>
                    {details.address && <p style={{ gridColumn: '1 / -1' }}><strong>Address:</strong> {details.address}</p>}
                    {details.businessDescription && <p style={{ gridColumn: '1 / -1' }}><strong>Description:</strong> {details.businessDescription}</p>}
                  </div>

                  <div style={{ marginTop: '16px', background: '#f8f9fa', padding: '12px', borderRadius: '4px' }}>
                    <h5 style={{ margin: '0 0 8px 0' }}>Subscription Details</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                      <p><strong>Plan:</strong> <span style={{ textTransform: 'capitalize' }}>{details.plan || 'Free'}</span></p>
                      {details.paymentAmount !== undefined && <p><strong>Amount:</strong> ₦{parseFloat(details.paymentAmount).toLocaleString()}</p>}
                      {details.subscriptionStartDate && <p><strong>Start Date:</strong> {new Date(details.subscriptionStartDate).toLocaleDateString()}</p>}
                      {details.subscriptionEndDate && <p><strong>End Date:</strong> {new Date(details.subscriptionEndDate).toLocaleDateString()}</p>}
                      {details.paymentDate && <p><strong>Payment Date:</strong> {new Date(details.paymentDate).toLocaleDateString()}</p>}
                      {details.createdAt && <p><strong>Created:</strong> {new Date(details.createdAt).toLocaleDateString()}</p>}
                    </div>
                  </div>
                </div>
              );
            })
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

      {expandedImage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000
        }} onClick={() => setExpandedImage(null)}>
          <button style={{ position: 'absolute', top: '20px', right: '30px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={32} />
          </button>
          <img src={expandedImage} alt="Expanded view" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px', objectFit: 'contain' }} />
        </div>
      )}

    </div>
  );
};

export default UserDetails;
