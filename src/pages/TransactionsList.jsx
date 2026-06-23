import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../constants';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const TransactionsList = () => {
  const { token } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/transactions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setTransactions(data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [token]);

  const filteredTransactions = transactions.filter(tx => {
    // Check search term against User ID, Name, Email, or Transaction ID
    const searchLower = searchTerm.toLowerCase();
    const user = tx.user || {};
    const matchesSearch = 
      (tx.id && tx.id.toLowerCase().includes(searchLower)) ||
      (tx.userId && tx.userId.toLowerCase().includes(searchLower)) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower));

    // Check type filter (transaction_type or category or type)
    const txType = tx.transaction_type || tx.type || '';
    const matchesType = typeFilter === '' || txType.toLowerCase() === typeFilter.toLowerCase();

    // Check status filter
    const txStatus = tx.status || '';
    const matchesStatus = statusFilter === '' || txStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) return <div>Loading transactions...</div>;

  return (
    <div>
      <h1 className="page-title">All Transactions</h1>
      
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search user, email, tx ID..." 
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#fff' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
            <option value="bill_payment">Bill Payment</option>
            <option value="escrow">Escrow</option>
          </select>

          <select 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#fff' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="successful">Successful / Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          
        </div>
      </div>

      <div className="card">
        {filteredTransactions.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transaction ID</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(tx.date || tx.createdAt).toLocaleString()}</td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{tx.id}</span></td>
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
                        {tx.transaction_type || tx.type}
                      </span>
                    </td>
                    <td>{tx.categoryDecrypted || tx.category || '-'}</td>
                    <td style={{ fontWeight: 600 }}>₦{parseFloat(tx.amountDecrypted || tx.amount || 0).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${['successful', 'completed'].includes(tx.status?.toLowerCase()) ? 'badge-success' : tx.status?.toLowerCase() === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>No transactions found matching your filters.</p>
        )}
      </div>

    </div>
  );
};

export default TransactionsList;
