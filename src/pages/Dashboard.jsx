import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../constants';
import { Link } from 'react-router-dom';
import { Wallet, Activity, CreditCard, DollarSign, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [metrics, setMetrics] = useState({
    totalPlatformFees: 0,
    totalBillsVolume: 0,
    totalActiveEscrows: 0,
    totalFundsInSystem: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/finances/overview`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setMetrics(data);
      } catch (err) {
        console.error('Error fetching metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [token]);

  if (loading) return <div>Loading metrics...</div>;

  return (
    <div>
      <h1 className="page-title">Finance Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#e0f2fe', borderRadius: '50%' }}>
            <DollarSign size={24} color="#0284c7" />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>TOTAL FUNDS IN SYSTEM</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ₦{(metrics.totalFundsInSystem || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#dcfce7', borderRadius: '50%' }}>
            <Activity size={24} color="#15803d" />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>TOTAL FUNDS IN ESCROW</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ₦{(metrics.totalActiveEscrows || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#e0e7ff', borderRadius: '50%' }}>
            <Wallet size={24} color="#4338ca" />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>TOTAL FEES EARNED</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ₦{(metrics.totalPlatformFees || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: '#dcfce7', borderRadius: '50%' }}>
            <Activity size={32} color="#15803d" />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>ACTIVE ESCROWS VALUE</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ₦{metrics.totalActiveEscrows.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#ffedd5', borderRadius: '50%' }}>
            <CreditCard size={24} color="#c2410c" />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>TOTAL BILLS VOLUME</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ₦{(metrics.totalBillsVolume || 0).toLocaleString()}
            </div>
          </div>
        </div>

      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Recent Transactions</h2>
          <Link to="/transactions" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-color)', fontWeight: 600 }}>
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {(metrics.recentTransactions || []).length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(metrics.recentTransactions || []).map(tx => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.date || tx.createdAt).toLocaleString()}</td>
                    <td>
                      {tx.user ? (
                        <Link to={`/users/${tx.userId}`} style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                          {tx.user.firstName} {tx.user.lastName}
                        </Link>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}>{tx.userId}</span>
                      )}
                    </td>
                    <td>
                      <span className={tx.transaction_type === 'credit' ? 'badge badge-success' : 'badge badge-warning'}>
                        {tx.transaction_type}
                      </span>
                    </td>
                    <td>{tx.categoryDecrypted || tx.type}</td>
                    <td style={{ fontWeight: 600 }}>₦{parseFloat(tx.amountDecrypted || 0).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${tx.status === 'successful' ? 'badge-success' : tx.status === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                        {tx.status}
                      </span>
                    </td>
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

export default Dashboard;
