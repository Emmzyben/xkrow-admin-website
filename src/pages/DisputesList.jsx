import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { BASE_URL } from '../constants';

const formatDate = (d) => {
  const val = d.disputedAt || d.updatedAt || d.createdAt || d.timestamp;
  return val ? new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
};

const formatAmount = (d) => `₦${parseFloat(d.totalCost || 0).toLocaleString()}`;

// ─── Reusable table ──────────────────────────────────────────────────────────
const DisputeTable = ({ rows, isPast }) => (
  <div className="card table-container" style={{ marginTop: 0 }}>
    <table>
      <thead>
        <tr>
          <th>Escrow ID</th>
          <th>Buyer</th>
          <th>Seller</th>
          <th>Amount</th>
          <th>{isPast ? 'Resolved' : 'Disputed'}</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(d => (
          <tr key={d.id}>
            <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {d.id.slice(0, 14)}…
            </td>
            <td>{d.buyerName || d.buyerId}</td>
            <td>{d.sellerName || d.sellerId}</td>
            <td style={{ fontWeight: 600 }}>{formatAmount(d)}</td>
            <td>{formatDate(d)}</td>
            <td>
              <Link
                to={`/disputes/${d.id}`}
                className="btn-primary"
                style={{
                  padding: '5px 12px',
                  fontSize: '0.82rem',
                  background: isPast ? 'transparent' : undefined,
                  color: isPast ? 'var(--text-secondary)' : undefined,
                  border: isPast ? '1px solid var(--border-color)' : undefined,
                }}
              >
                {isPast ? 'View Details' : 'Settle Dispute'}
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Empty state ─────────────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, title, subtitle, color = 'var(--text-secondary)' }) => (
  <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color }}>
    <Icon size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }} />
    <p style={{ fontWeight: 500, marginBottom: 6 }}>{title}</p>
    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{subtitle}</p>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const DisputesList = () => {
  const { token } = useContext(AuthContext);

  const [active, setActive] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pastOpen, setPastOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [activeRes, pastRes] = await Promise.all([
          fetch(`${BASE_URL}/api/admin/disputes`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/api/admin/disputes/resolved`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (activeRes.ok) setActive(await activeRes.json());
        if (pastRes.ok) setPast(await pastRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [token]);

  const filterRows = (rows) => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(d =>
      d.id?.toLowerCase().includes(q) ||
      d.buyerName?.toLowerCase().includes(q) ||
      d.sellerName?.toLowerCase().includes(q)
    );
  };

  const filteredActive = filterRows(active);
  const filteredPast = filterRows(past);

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>Disputes</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {active.length} active &nbsp;·&nbsp; {past.length} resolved
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, buyer or seller…"
            style={{
              paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
              border: '1px solid var(--border-color)', borderRadius: 8,
              background: 'var(--card-bg)', color: 'var(--text-primary)',
              fontSize: '0.875rem', width: 260,
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)', padding: 32, textAlign: 'center' }}>Loading disputes…</div>
      ) : (
        <>
          {/* ── Active disputes ── */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={styles.sectionDot('#ef4444')} />
              <h2 style={styles.sectionTitle}>Active Disputes</h2>
              <span style={styles.countBadge('#ef4444')}>{filteredActive.length}</span>
            </div>

            {filteredActive.length === 0 ? (
              <EmptyState
                icon={AlertCircle}
                title="No active disputes"
                subtitle={search ? 'No results match your search.' : 'All disputes have been resolved.'}
              />
            ) : (
              <DisputeTable rows={filteredActive} isPast={false} />
            )}
          </div>

          {/* ── Past disputes (collapsible) ── */}
          <div>
            <button
              onClick={() => setPastOpen(o => !o)}
              style={styles.collapseBtn}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={styles.sectionDot('#22c55e')} />
                <h2 style={{ ...styles.sectionTitle, margin: 0 }}>Past Disputes</h2>
                <span style={styles.countBadge('#22c55e')}>{filteredPast.length}</span>
              </div>
              {pastOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {pastOpen && (
              <div style={{ marginTop: 12, animation: 'fadeIn 0.2s ease' }}>
                {filteredPast.length === 0 ? (
                  <EmptyState
                    icon={CheckCircle}
                    title="No resolved disputes yet"
                    subtitle={search ? 'No results match your search.' : 'Resolved disputes will appear here.'}
                    color="#22c55e"
                  />
                ) : (
                  <>
                    <DisputeTable rows={filteredPast} isPast={true} />
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 10, textAlign: 'right' }}>
                      Showing {filteredPast.length} resolved dispute{filteredPast.length !== 1 ? 's' : ''}, newest first
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Inline styles ────────────────────────────────────────────────────────────
const styles = {
  sectionDot: (color) => ({
    width: 10, height: 10, borderRadius: '50%',
    background: color, flexShrink: 0,
    boxShadow: `0 0 6px ${color}88`,
  }),
  sectionTitle: {
    fontSize: '1rem', fontWeight: 700, margin: 0,
  },
  countBadge: (color) => ({
    background: `${color}20`,
    color,
    fontSize: '0.75rem', fontWeight: 700,
    borderRadius: 20, padding: '2px 10px',
  }),
  collapseBtn: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', background: 'var(--card-bg)',
    border: '1px solid var(--border-color)', borderRadius: 10,
    padding: '12px 16px', cursor: 'pointer',
    color: 'var(--text-primary)',
  },
};

export default DisputesList;
