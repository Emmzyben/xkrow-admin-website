import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../constants';
import { Briefcase, Eye } from 'lucide-react';

const BusinessAccountsList = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/business-accounts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setAccounts(data);
        }
      } catch (err) {
        console.error('Error fetching business accounts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, [token]);

  return (
    <div>
      <h1 className="page-title">Business Accounts</h1>

      <div className="card">
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={20} color="var(--primary-color)" />
          All Business Accounts
        </h3>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading business accounts...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Business Name</th>
                  <th>Type</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.accountId}>
                    <td style={{ fontWeight: 500 }}>{a.businessName || 'N/A'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{a.accountType || a.businessType || 'N/A'}</td>
                    <td>{a.plan || 'Free'}</td>
                    <td>
                      <span className={`badge ${a.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: a.isVerified ? '#10b981' : '#ef4444', fontWeight: 500 }}>
                        {a.isVerified ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <button
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.85rem' }}
                        onClick={() => navigate(`/business-accounts/${a.userId}/${a.accountId}`)}
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {accounts.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No business accounts found.</td>
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

export default BusinessAccountsList;
