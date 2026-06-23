import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../constants';
import { Wallet, Activity, CreditCard } from 'lucide-react';

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [metrics, setMetrics] = useState({
    totalPlatformFees: 0,
    totalBillsVolume: 0,
    totalActiveEscrows: 0
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
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: '#e0e7ff', borderRadius: '50%' }}>
            <Wallet size={32} color="#4338ca" />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>TOTAL PLATFORM FEES</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ₦{metrics.totalPlatformFees.toLocaleString()}
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

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: '#ffedd5', borderRadius: '50%' }}>
            <CreditCard size={32} color="#c2410c" />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>TOTAL BILLS VOLUME</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ₦{metrics.totalBillsVolume.toLocaleString()}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
