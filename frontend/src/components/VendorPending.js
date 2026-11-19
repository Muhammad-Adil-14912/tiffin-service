import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';

function VendorPending() {
  const { user, logout } = useContext(AuthContext);
  const status = user?.vendorStatus || 'pending';
  const rejected = status === 'rejected';

  return (
    <div className="auth-wrapper">
      <div className="glass-card" style={{ maxWidth: '560px', textAlign: 'center' }}>
        <h2>{rejected ? 'Vendor application not approved' : 'Vendor application under review'}</h2>
        <p style={{ color: '#94a3b8', lineHeight: 1.7, margin: '1rem 0' }}>
          {rejected
            ? 'Your vendor application was not approved. Please contact the platform administrator if you need more information.'
            : 'Your vendor account has been created. You can browse the platform, but vendor tools remain locked until an administrator approves your application.'}
        </p>
        <p style={{ marginBottom: '1.5rem' }}>Application status: <strong>{rejected ? 'Rejected' : 'Pending approval'}</strong></p>
        <Link className="btn btn-primary" to="/">Browse meal plans</Link>
        <button className="btn btn-secondary" style={{ marginLeft: '0.75rem' }} onClick={logout}>Log out</button>
      </div>
    </div>
  );
}

export default VendorPending;
