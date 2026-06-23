import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { BASE_URL } from '../constants';

const DisputesList = () => {
  const { token } = useContext(AuthContext);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/disputes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setDisputes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDisputes();
  }, [token]);

  return (
    <div>
      <h1 className="page-title">Active Disputes</h1>

      {loading ? (
        <div>Loading disputes...</div>
      ) : disputes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.4 }} />
          <p style={{ fontWeight: 500 }}>No active disputes</p>
          <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>All escrow disputes have been resolved.</p>
        </div>
      ) : (
        <div className="card table-container">
          <table>
            <thead>
              <tr>
                <th>Escrow ID</th>
                <th>Buyer</th>
                <th>Seller</th>
                <th>Amount</th>
                <th>Disputed At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map(d => (
                <tr key={d.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{d.id}</td>
                  <td>{d.buyerName || d.buyerId}</td>
                  <td>{d.sellerName || d.sellerId}</td>
                  <td>₦{parseFloat(d.totalCost || 0).toLocaleString()}</td>
                  <td>
                    {(() => {
                      const dateVal = d.disputedAt || d.updatedAt || d.createdAt || d.timestamp;
                      return dateVal ? new Date(dateVal).toLocaleDateString() : '—';
                    })()}
                  </td>
                  <td>
                    <Link to={`/disputes/${d.id}`} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                      Settle Dispute
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DisputesList;
