import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../constants';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

const BusinessAccountDetails = () => {
  const { userId, accountId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDetails();
  }, [userId, accountId, token]);

  const fetchDetails = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/business-accounts/${userId}/${accountId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAccount(data);
      } else {
        setError(data.message || 'Failed to load details');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async () => {
    if (!account) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    const newStatus = !account.isVerified;
    
    try {
      const res = await fetch(`${BASE_URL}/api/admin/business-accounts/${userId}/${accountId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isVerified: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Business ${newStatus ? 'verified' : 'unverified'} successfully.`);
        setAccount(prev => ({ ...prev, isVerified: newStatus }));
      } else {
        setError(data.message || 'Failed to update');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (!account) return <div style={{ padding: '20px', color: 'red' }}>{error || 'Not found'}</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <button className="btn-secondary" onClick={() => navigate('/business-accounts')} style={{ padding: '8px', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>Business Details: {account.businessName}</h1>
      </div>

      {error && <div style={{ color: '#ef4444', marginBottom: '16px', background: '#fee2e2', padding: '10px', borderRadius: '4px' }}>{error}</div>}
      {success && <div style={{ color: '#10b981', marginBottom: '16px', background: '#d1fae5', padding: '10px', borderRadius: '4px' }}>{success}</div>}

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>General Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px' }}>
          <div>
            <p style={{ margin: '8px 0' }}><strong>Name:</strong> {account.businessName}</p>
            <p style={{ margin: '8px 0' }}><strong>Type:</strong> <span style={{ textTransform: 'capitalize' }}>{account.accountType || account.businessType}</span></p>
            <p style={{ margin: '8px 0' }}><strong>Category:</strong> {account.businessCategory || 'N/A'}</p>
            <p style={{ margin: '8px 0' }}><strong>Reg Number:</strong> {account.registrationNumber || 'N/A'}</p>
            <p style={{ margin: '8px 0' }}><strong>Address:</strong> {account.address || 'N/A'}</p>
          </div>
          <div>
            <p style={{ margin: '8px 0' }}>
              <strong>Status:</strong> 
              <span className={`badge ${account.status === 'Active' ? 'badge-success' : 'badge-danger'}`} style={{ marginLeft: '8px' }}>
                {account.status}
              </span>
            </p>
            <p style={{ margin: '8px 0' }}>
              <strong>Verified:</strong> 
              <span style={{ color: account.isVerified ? '#10b981' : '#ef4444', marginLeft: '8px', fontWeight: 'bold' }}>
                {account.isVerified ? 'Yes' : 'No'}
              </span>
            </p>
            <p style={{ margin: '8px 0' }}><strong>Plan:</strong> {account.plan}</p>
            <p style={{ margin: '8px 0' }}><strong>Sub Starts:</strong> {account.subscriptionStartDate ? new Date(account.subscriptionStartDate).toLocaleDateString() : 'N/A'}</p>
            <p style={{ margin: '8px 0' }}><strong>Sub Ends:</strong> {account.subscriptionEndDate ? new Date(account.subscriptionEndDate).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
        <div style={{ marginTop: '20px' }}>
          <strong>Description:</strong>
          <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>{account.businessDescription || account.description || 'No description provided.'}</p>
        </div>
      </div>

      <div className="card">
        <h3>Actions</h3>
        <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
          <button 
            className={account.isVerified ? 'btn-danger' : 'btn-primary'} 
            onClick={toggleVerification}
            disabled={submitting}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '0.95rem' }}
          >
            {account.isVerified ? <XCircle size={18} /> : <CheckCircle size={18} />}
            {submitting ? 'Updating...' : account.isVerified ? 'Unverify Business' : 'Verify Business'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessAccountDetails;
