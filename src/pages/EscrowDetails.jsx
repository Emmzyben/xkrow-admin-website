import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, User, Briefcase, PackageOpen, CheckCircle2,
  Clock, AlertCircle, XCircle, DollarSign
} from 'lucide-react';
import { BASE_URL } from '../constants';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

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

const StatusIcon = ({ status }) => {
  const s = (status || '').toLowerCase();
  const props = { size: 16, style: { flexShrink: 0 } };
  if (s === 'completed') return <CheckCircle2 {...props} color="#10b981" />;
  if (s === 'dispute')   return <AlertCircle  {...props} color="#ef4444" />;
  if (s === 'cancelled') return <XCircle      {...props} color="#ef4444" />;
  return <Clock {...props} color="#92400e" />;
};

const isImageUrl = (str) =>
  typeof str === 'string' &&
  str.startsWith('http') &&
  (str.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) ||
    str.includes('firebasestorage') ||
    str.includes('cloudinary') ||
    str.includes('image') ||
    str.includes('ipfs') ||
    str.includes('pinata'));

const RenderValue = ({ k, v }) => {
  if (isImageUrl(v)) {
    return (
      <a href={v} target="_blank" rel="noreferrer">
        <img src={v} alt={k} style={{ maxWidth: 100, maxHeight: 100, borderRadius: 4, objectFit: 'cover' }} />
      </a>
    );
  }
  if (Array.isArray(v) && v.every(isImageUrl)) {
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {v.map((img, i) => (
          <a key={i} href={img} target="_blank" rel="noreferrer">
            <img src={img} alt={`${k}-${i}`} style={{ maxWidth: 100, maxHeight: 100, borderRadius: 4, objectFit: 'cover' }} />
          </a>
        ))}
      </div>
    );
  }
  if (typeof v === 'object' && v !== null) {
    const vals = Object.values(v);
    if (vals.length > 0 && vals.every(isImageUrl)) {
      return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {vals.map((img, i) => (
            <a key={i} href={img} target="_blank" rel="noreferrer">
              <img src={img} alt={`${k}-${i}`} style={{ maxWidth: 100, maxHeight: 100, borderRadius: 4, objectFit: 'cover' }} />
            </a>
          ))}
        </div>
      );
    }
    return (
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.8rem', background: '#f8f9fa', padding: 8, borderRadius: 4 }}>
        {JSON.stringify(v, null, 2)}
      </pre>
    );
  }
  if (typeof v === 'string' && v.startsWith('http')) {
    return <a href={v} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'underline', wordBreak: 'break-all' }}>{v}</a>;
  }
  if ((k.toLowerCase().endsWith('at') || k.toLowerCase().includes('date')) && (typeof v === 'number' || !isNaN(Date.parse(v)))) {
    return <span>{new Date(v).toLocaleString()}</span>;
  }
  return <span style={{ wordBreak: 'break-all' }}>{String(v)}</span>;
};

const HIDDEN_KEYS = ['id', 'totalCost', 'status', 'description', 'buyerId', 'sellerId', 'buyerName', 'sellerName', 'buyerEmail', 'sellerEmail'];

/* ─── Party Card ──────────────────────────────────────────────────────────── */
const PartyCard = ({ label, data }) => {
  if (!data) return (
    <div className="card" style={{ flex: 1, minWidth: 220 }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>{label}</p>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No data available</p>
    </div>
  );

  const { firstName, lastName, email, mobileNumber, balance, businessAccounts } = data;
  return (
    <div className="card" style={{ flex: 1, minWidth: 220 }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: label === 'Buyer' ? '#e0f2fe' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={20} color={label === 'Buyer' ? '#0369a1' : '#15803d'} />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: '1rem' }}>{firstName} {lastName}</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{email}</p>
        </div>
      </div>
      {mobileNumber && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>📱 {mobileNumber}</p>}
      {balance !== undefined && (
        <p style={{ fontSize: '0.85rem', marginBottom: 12 }}>
          <DollarSign size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          Balance: <strong>₦{parseFloat(balance || 0).toLocaleString()}</strong>
        </p>
      )}
      {businessAccounts && businessAccounts.length > 0 && (
        <div style={{ background: '#f8f9fa', border: '1px solid var(--border-color)', borderRadius: 4, padding: '10px', marginTop: 8 }}>
          {businessAccounts.map((biz, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', marginBottom: i < businessAccounts.length - 1 ? 6 : 0 }}>
              <Briefcase size={14} color="var(--primary-color)" />
              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{biz.accountType}</span>
              {biz.businessName && <span>— {biz.businessName}</span>}
              {biz.plan && <span className="badge badge-success" style={{ marginLeft: 4 }}>{biz.plan}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Installments ────────────────────────────────────────────────────────── */
const InstallmentRow = ({ inst }) => {
  const status = (inst.status || '').toLowerCase();
  const badge = status === 'completed' || status === 'paid' ? 'badge-success'
    : status === 'disputed' ? 'badge-danger' : 'badge-warning';
  return (
    <tr>
      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{inst.id}</td>
      <td style={{ fontWeight: 600 }}>₦{parseFloat(inst.amount || 0).toLocaleString()}</td>
      <td><span className={`badge ${badge}`} style={{ textTransform: 'capitalize' }}>{inst.status || 'pending'}</span></td>
      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString() : '—'}
      </td>
    </tr>
  );
};

/* ─── Main Component ──────────────────────────────────────────────────────── */
const EscrowDetails = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/escrows/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const d = await res.json();
          setError(d.message || 'Failed to load escrow');
          return;
        }
        const d = await res.json();
        setData(d);
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]);

  if (loading) return <div style={{ padding: 40, color: 'var(--text-secondary)' }}>Loading escrow details...</div>;

  if (error || !data) return (
    <div>
      <Link to="/escrows" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', marginBottom: 24, width: 'fit-content' }}>
        <ArrowLeft size={20} /> Back to Escrows
      </Link>
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <PackageOpen size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
        <p style={{ color: 'var(--text-secondary)' }}>{error || 'Escrow not found.'}</p>
      </div>
    </div>
  );

  const { escrow, buyer, seller, installments } = data;
  const status = (escrow.status || '').toLowerCase();
  const badgeClass = STATUS_BADGE[status] || 'badge-warning';

  const extraFields = Object.entries(escrow).filter(([k, v]) => !HIDDEN_KEYS.includes(k) && v !== null && v !== undefined && v !== '');

  return (
    <div>
      <Link to="/escrows" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', marginBottom: 24, width: 'fit-content' }}>
        <ArrowLeft size={20} /> Back to Escrows
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Escrow Details</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StatusIcon status={status} />
          <span className={`badge ${badgeClass}`} style={{ textTransform: 'capitalize', fontSize: '0.85rem', padding: '5px 12px' }}>
            {escrow.status || 'unknown'}
          </span>
        </div>
      </div>

      {/* Summary Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
          <PackageOpen size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, color: 'var(--primary-color)' }} />
          Summary
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Escrow ID</p>
            <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>{escrow.id}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Total Amount</p>
            <p style={{ fontWeight: 700, fontSize: '1.3rem', color: 'var(--primary-color)' }}>₦{parseFloat(escrow.totalCost || 0).toLocaleString()}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Status</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <StatusIcon status={status} />
              <span className={`badge ${badgeClass}`} style={{ textTransform: 'capitalize' }}>{escrow.status || 'unknown'}</span>
            </div>
          </div>
          {escrow.description && (
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Description</p>
              <p style={{ fontSize: '0.9rem' }}>{escrow.description}</p>
            </div>
          )}
        </div>

        {/* Extra dynamic fields */}
        {extraFields.length > 0 && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {extraFields.map(([k, v]) => (
              <div key={k}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', marginBottom: 4 }}>
                  {k.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <div style={{ fontSize: '0.9rem' }}>
                  <RenderValue k={k} v={v} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Parties */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
        <PartyCard label="Buyer" data={buyer} />
        <PartyCard label="Seller" data={seller} />
      </div>

      {/* Installments */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
          Installments ({installments.length})
        </h3>
        {installments.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No installments found for this escrow.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Installment ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {installments.map(inst => <InstallmentRow key={inst.id} inst={inst} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dispute link if applicable */}
      {status === 'dispute' && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 'var(--radius)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={20} color="#dc2626" />
            <span style={{ fontWeight: 600, color: '#991b1b' }}>This escrow is under dispute</span>
          </div>
          <Link to={`/disputes/${id}`} className="btn-danger" style={{ padding: '8px 18px', display: 'inline-block' }}>
            Settle Dispute
          </Link>
        </div>
      )}
    </div>
  );
};

export default EscrowDetails;
