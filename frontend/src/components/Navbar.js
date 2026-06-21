import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Utensils, User, LogOut, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      background: 'rgba(11, 15, 25, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '1rem 5%'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          textDecoration: 'none',
          color: '#fff',
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 800,
          fontSize: '1.4rem',
          letterSpacing: '-0.02em'
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #f97316 0%, #d97706 100%)',
            padding: '0.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Utensils size={20} />
          </span>
          <span>Homely<span style={{ color: '#f97316' }}>Bites</span></span>
        </Link>

        {/* Action Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          {user ? (
            <>
              {/* Dashboard Link based on Role */}
              <Link 
                to={user.role === 'vendor' ? '/vendor-dashboard' : '/dashboard'} 
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>

              {/* User Greeting */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.9rem'
              }}>
                <User size={14} style={{ color: '#f97316' }} />
                <span>{user.name}</span>
                <span className="badge" style={{
                  padding: '0.1rem 0.4rem',
                  fontSize: '0.65rem',
                  backgroundColor: user.role === 'vendor' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: user.role === 'vendor' ? '#fbbf24' : '#10b981'
                }}>
                  {user.role}
                </span>
              </div>

              {/* Logout Button */}
              <button 
                onClick={handleLogout} 
                className="btn btn-danger"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                <LogIn size={16} />
                <span>Login</span>
              </Link>
              <Link 
                to="/signup" 
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                <UserPlus size={16} />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
