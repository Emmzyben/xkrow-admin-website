import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MessageSquare, FileImage, Award, ExternalLink, Briefcase } from 'lucide-react';
import { BASE_URL } from '../constants';

const PartyCard = ({ label, data, onAward, awarding }) => {
  if (!data) return null;
  const { firstName, lastName, email, mobileNumber, businessAccounts } = data;
  return (
    <div className="card" style={{ flex: 1 }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>{label}</p>
      <p style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>{firstName} {lastName}</p>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{email}</p>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>{mobileNumber}</p>

      {businessAccounts && businessAccounts.length > 0 && (
        <div style={{ background: '#f8f9fa', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '10px', marginBottom: '14px' }}>
          {businessAccounts.map((biz, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <Briefcase size={14} color="var(--primary-color)" />
              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{biz.accountType}</span>
              {biz.businessName && <span>— {biz.businessName}</span>}
              {biz.plan && <span className="badge badge-success" style={{ marginLeft: '4px' }}>{biz.plan}</span>}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onAward}
        disabled={awarding}
        className="btn-primary"
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}
      >
        <Award size={16} />
        {awarding ? 'Processing...' : `Award Funds to ${label}`}
      </button>
    </div>
  );
};

const DisputeDetails = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [escrow, setEscrow] = useState(null);
  const [parties, setParties] = useState(null);
  const [chat, setChat] = useState([]);
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    const fetchAll = async () => {
      const headers = { 'Authorization': `Bearer ${token}` };
      try {
        const [disputesRes, partiesRes, chatRes, proofsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/admin/disputes`, { headers }),
          fetch(`${BASE_URL}/api/admin/disputes/${id}/parties`, { headers }),
          fetch(`${BASE_URL}/api/admin/disputes/${id}/chat`, { headers }),
          fetch(`${BASE_URL}/api/admin/disputes/${id}/proofs`, { headers }),
        ]);

        if (disputesRes.ok) {
          const disputes = await disputesRes.json();
          setEscrow(disputes.find(d => d.id === id) || null);
        }
        if (partiesRes.ok) setParties(await partiesRes.json());
        if (chatRes.ok) setChat(await chatRes.json());
        if (proofsRes.ok) setProofs(await proofsRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, token]);

  const handleSettle = async (winnerId) => {
    const label = winnerId === escrow.sellerId ? 'Seller' : 'Buyer';
    if (!window.confirm(`Award funds to the ${label}? This action is irreversible.`)) return;

    setSettling(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/disputes/${id}/settle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ Dispute settled. ₦${data.amount?.toLocaleString()} released to ${label}.`);
        navigate('/disputes');
      } else {
        alert(data.message || 'Error settling dispute');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setSettling(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Loading dispute details...</div>;
  if (!escrow) return (
    <div>
      <Link to="/disputes" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '24px', width: 'fit-content' }}>
        <ArrowLeft size={20} /> Back to Disputes
      </Link>
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>Dispute not found or already resolved.</div>
    </div>
  );

  const buyerId = escrow.buyerId;
  const sellerId = escrow.sellerId;

  return (
    <div>
      <Link to="/disputes" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '24px', width: 'fit-content' }}>
        <ArrowLeft size={20} /> Back to Disputes
      </Link>

      <h1 className="page-title">Dispute Settlement</h1>

      {/* Escrow Summary */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Escrow Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Escrow ID</p>
            <p style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{escrow.id}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Amount</p>
            <p style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary-color)' }}>₦{parseFloat(escrow.totalCost || 0).toLocaleString()}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</p>
            <span className="badge badge-warning">{escrow.status}</span>
          </div>
          {escrow.description && (
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Description</p>
              <p style={{ fontSize: '0.9rem' }}>{escrow.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Buyer & Seller Cards */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <PartyCard
          label="Buyer"
          data={parties?.buyer}
          onAward={() => handleSettle(buyerId)}
          awarding={settling}
        />
        <PartyCard
          label="Seller"
          data={parties?.seller}
          onAward={() => handleSettle(sellerId)}
          awarding={settling}
        />
      </div>

      {/* Tabs: Chat & Proofs */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
          {[
            { key: 'chat', label: 'Chat', Icon: MessageSquare, count: chat.length },
            { key: 'proofs', label: 'Proofs', Icon: FileImage, count: proofs.length },
          ].map(({ key, label, Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                padding: '14px 24px',
                fontWeight: 600,
                fontSize: '0.9rem',
                borderBottom: activeTab === key ? '2px solid var(--primary-color)' : '2px solid transparent',
                color: activeTab === key ? 'var(--primary-color)' : 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'none', cursor: 'pointer',
              }}
            >
              <Icon size={16} /> {label} ({count})
            </button>
          ))}
        </div>

        <div style={{ padding: '20px' }}>
          {/* ── Chat ── */}
          {activeTab === 'chat' && (
            chat.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
                No chat messages found between these two parties.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto', padding: '4px' }}>
                {chat.map(msg => {
                  const isSeller = msg.senderId === sellerId;
                  const senderName = isSeller
                    ? `${parties?.seller?.firstName || 'Seller'}`
                    : `${parties?.buyer?.firstName || 'Buyer'}`;
                  return (
                    <div key={msg.id || msg.messageId} style={{ display: 'flex', flexDirection: isSeller ? 'row-reverse' : 'row', gap: '10px', alignItems: 'flex-end' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isSeller ? '#f0fdf4' : '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <User size={16} color={isSeller ? '#15803d' : '#0369a1'} />
                      </div>
                      <div style={{ maxWidth: '65%' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', textAlign: isSeller ? 'right' : 'left' }}>
                          {senderName} ({isSeller ? 'Seller' : 'Buyer'}) · {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}
                        </p>
                        <div style={{ background: isSeller ? '#f0fdf4' : '#f1f5f9', border: `1px solid ${isSeller ? '#bbf7d0' : '#e2e8f0'}`, padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', lineHeight: 1.5 }}>
                          {msg.message || msg.text || msg.content}
                          {msg.image && (
                            <a href={msg.image} target="_blank" rel="noreferrer">
                              <img src={msg.image} alt="shared" style={{ display: 'block', marginTop: '8px', maxWidth: '200px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* ── Proofs ── */}
          {activeTab === 'proofs' && (
            proofs.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>No proofs have been submitted for this escrow.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {proofs.map(proof => (
                  <div key={proof.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: '16px' }}>
                    <p style={{ fontWeight: 600, marginBottom: '4px' }}>
                      Installment: <span style={{ fontFamily: 'monospace', fontWeight: 400, fontSize: '0.85rem' }}>{proof.installmentId}</span>
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      Submitted: {new Date(proof.createdAt).toLocaleString()}
                    </p>
                    <div style={{ background: '#f8f9fa', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '10px 12px', marginBottom: '12px', fontSize: '0.9rem' }}>
                      <strong>Note:</strong> {proof.note}
                    </div>
                    {proof.proofUrls && proof.proofUrls.length > 0 && (
                      <div>
                        <p style={{ fontWeight: 600, marginBottom: '8px', fontSize: '0.85rem' }}>Attachments ({proof.proofUrls.length})</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                          {proof.proofUrls.map((url, idx) => {
                            const isImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
                            return isImage ? (
                              <a key={idx} href={url} target="_blank" rel="noreferrer">
                                <img src={url} alt={`Proof ${idx + 1}`} style={{ width: '140px', height: '100px', objectFit: 'cover', border: '1px solid var(--border-color)', borderRadius: '4px' }} onError={e => { e.target.style.display = 'none'; }} />
                              </a>
                            ) : (
                              <a key={idx} href={url} target="_blank" rel="noreferrer" className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                <ExternalLink size={14} /> File {idx + 1}
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default DisputeDetails;
