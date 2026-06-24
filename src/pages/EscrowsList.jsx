import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, PackageOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { BASE_URL } from '../constants';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'funded', label: 'Funded' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
  { value: 'dispute', label: 'Dispute' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_BADGE = {
  pending:    'badge-warning',
  funded:     'badge-warning',
  accepted:   'badge-warning',
  dispatched: 'badge-warning',
  delivered:  'badge-warning',
  completed:  'badge-success',
  dispute:    'badge-danger',
  cancelled:  'badge-danger',
};

const EscrowsList = () => {
  const { token } = useContext(AuthContext);
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Sorting
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    const fetchEscrows = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/escrows`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setEscrows(data);
      } catch (err) {
        console.error('Error fetching escrows:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEscrows();
  }, [token]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filtered = escrows
    .filter(e => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        e.id.toLowerCase().includes(q) ||
        (e.buyerName || '').toLowerCase().includes(q) ||
        (e.sellerName || '').toLowerCase().includes(q) ||
        (e.buyerEmail || '').toLowerCase().includes(q) ||
        (e.sellerEmail || '').toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q);
      const matchStatus = !statusFilter || (e.status || '').toLowerCase() === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      if (sortKey === 'totalCost') {
        aVal = parseFloat(aVal || 0);
        bVal = parseFloat(bVal || 0);
      } else if (sortKey === 'createdAt') {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      } else {
        aVal = (aVal || '').toString().toLowerCase();
        bVal = (bVal || '').toString().toLowerCase();
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? <ChevronUp size={13} style={{ marginLeft: 4, display: 'inline' }} /> : <ChevronDown size={13} style={{ marginLeft: 4, display: 'inline' }} />;
  };

  const thStyle = (col) => ({
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    color: sortKey === col ? 'var(--primary-color)' : undefined,
  });

  return (
    <div>
      <h1 className="page-title">Escrows</h1>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
            <input
              id="escrow-search"
              type="text"
              placeholder="Search ID, buyer, seller, description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem' }}
            />
          </div>

          <select
            id="escrow-status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#fff', fontFamily: 'inherit', fontSize: '0.9rem' }}
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <PackageOpen size={16} />
            <span>{filtered.length} escrow{filtered.length !== 1 ? 's' : ''} found</span>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ color: 'var(--text-secondary)', padding: '40px 0' }}>Loading escrows...</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <PackageOpen size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3, color: 'var(--text-secondary)' }} />
          <p style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>No escrows found</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="card table-container" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th style={thStyle('id')} onClick={() => handleSort('id')}>Escrow ID <SortIcon col="id" /></th>
                <th style={thStyle('buyerName')} onClick={() => handleSort('buyerName')}>Buyer <SortIcon col="buyerName" /></th>
                <th style={thStyle('sellerName')} onClick={() => handleSort('sellerName')}>Seller <SortIcon col="sellerName" /></th>
                <th style={thStyle('totalCost')} onClick={() => handleSort('totalCost')}>Amount <SortIcon col="totalCost" /></th>
                <th style={thStyle('status')} onClick={() => handleSort('status')}>Status <SortIcon col="status" /></th>
                <th style={thStyle('createdAt')} onClick={() => handleSort('createdAt')}>Created <SortIcon col="createdAt" /></th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const status = (e.status || 'unknown').toLowerCase();
                const badgeClass = STATUS_BADGE[status] || 'badge-warning';
                const dateVal = e.createdAt || e.timestamp;
                return (
                  <tr key={e.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {e.id.length > 16 ? `${e.id.slice(0, 16)}…` : e.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{e.buyerName}</div>
                      {e.buyerEmail && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{e.buyerEmail}</div>}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{e.sellerName}</div>
                      {e.sellerEmail && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{e.sellerEmail}</div>}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                      ₦{parseFloat(e.totalCost || 0).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${badgeClass}`} style={{ textTransform: 'capitalize' }}>
                        {e.status || 'unknown'}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {dateVal ? new Date(dateVal).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <Link
                        to={`/escrows/${e.id}`}
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.85rem', display: 'inline-block' }}
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EscrowsList;
