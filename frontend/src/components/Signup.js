import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { UserPlus, User, Mail, Lock, Phone, MapPin, AlertCircle } from 'lucide-react';

function Signup() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer', // 'customer' or 'vendor'
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { name, email, password, role, phone, address } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleRoleChange = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/signup', formData);
      if (res.data.success) {
        login(res.data, res.data.token);
        if (res.data.role === 'vendor') {
          navigate('/vendor-dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Registration failed. User may already exist.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Get started with fresh, healthy meals</p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role selector toggle */}
          <div className="form-group">
            <label>Select User Type</label>
            <div className="role-selector">
              <div 
                className={`role-btn ${role === 'customer' ? 'active' : ''}`}
                onClick={() => handleRoleChange('customer')}
              >
                Customer
              </div>
              <div 
                className={`role-btn ${role === 'vendor' ? 'active' : ''}`}
                onClick={() => handleRoleChange('vendor')}
              >
                Meal Vendor
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }} />
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={handleChange}
                className="form-control"
                placeholder="John Doe"
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }} />
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                className="form-control"
                placeholder="john@example.com"
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }} />
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                className="form-control"
                placeholder="Min 6 characters"
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }} />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={phone}
                onChange={handleChange}
                className="form-control"
                placeholder="+1 (555) 000-0000"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Delivery Address</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '12px',
                color: '#64748b'
              }} />
              <textarea
                id="address"
                name="address"
                value={address}
                onChange={handleChange}
                className="form-control"
                placeholder="Provide your default delivery location"
                style={{ paddingLeft: '40px', minHeight: '80px', resize: 'vertical' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            <UserPlus size={18} />
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '0.9rem',
          marginTop: '1.5rem'
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
