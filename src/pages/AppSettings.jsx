import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Save } from 'lucide-react';
import axios from 'axios';

// Ensure the API url points to the backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const AppSettings = () => {
  const { token } = useContext(AuthContext);
  const [settings, setSettings] = useState({
    forceUpdate: false,
    androidVersion: '1.0.0',
    iosVersion: '1.0.0',
    playStoreLink: '',
    appStoreLink: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/app-settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setSettings({
          forceUpdate: res.data.forceUpdate || false,
          androidVersion: res.data.androidVersion || '1.0.0',
          iosVersion: res.data.iosVersion || '1.0.0',
          playStoreLink: res.data.playStoreLink || '',
          appStoreLink: res.data.appStoreLink || ''
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load app settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      await axios.put(`${API_URL}/admin/app-settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'App settings saved successfully.' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save app settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Settings...</div>;
  }

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        Mobile App Settings
      </h2>

      {message.text && (
        <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px', backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7', color: message.type === 'error' ? '#991b1b' : '#166534' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
            <input 
              type="checkbox" 
              name="forceUpdate" 
              checked={settings.forceUpdate} 
              onChange={handleChange} 
              style={{ width: '20px', height: '20px' }}
            />
            Require users to update the app
          </label>
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
            If checked, users with an app version lower than the required versions below will be forced to update.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Required Android Version</label>
            <input
              type="text"
              name="androidVersion"
              value={settings.androidVersion}
              onChange={handleChange}
              placeholder="e.g. 1.0.0"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Required iOS Version</label>
            <input
              type="text"
              name="iosVersion"
              value={settings.iosVersion}
              onChange={handleChange}
              placeholder="e.g. 1.0.0"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Play Store URL (Android)</label>
          <input
            type="url"
            name="playStoreLink"
            value={settings.playStoreLink}
            onChange={handleChange}
            placeholder="https://play.google.com/store/apps/details?id=..."
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>App Store URL (iOS)</label>
          <input
            type="url"
            name="appStoreLink"
            value={settings.appStoreLink}
            onChange={handleChange}
            placeholder="https://apps.apple.com/app/id..."
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="btn btn-primary"
          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px' }}
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default AppSettings;
