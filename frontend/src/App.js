import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import TiffinList from './components/TiffinList';
import TiffinDetail from './components/TiffinDetail';
import Dashboard from './components/Dashboard';
import VendorDashboard from './components/VendorDashboard';
import VendorPending from './components/VendorPending';

// Create Authentication Context
export const AuthContext = createContext();

// Set base API URL dynamically for development vs production
axios.defaults.baseURL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load auth credentials from localStorage
    const savedToken = localStorage.getItem('tiffin_token');
    const savedUser = localStorage.getItem('tiffin_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      // Set axios default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('tiffin_token', userToken);
    localStorage.setItem('tiffin_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('tiffin_token');
    localStorage.removeItem('tiffin_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#0b0f19',
        color: '#f8fafc',
        fontFamily: 'sans-serif'
      }}>
        <h2>Loading Homely Bites...</h2>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <Router>
        <div className="app-container">
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<TiffinList />} />
              <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'vendor' ? (user.vendorStatus === 'approved' ? '/vendor-dashboard' : '/vendor-pending') : '/dashboard'} />} />
              <Route path="/signup" element={!user ? <Signup /> : <Navigate to={user.role === 'vendor' ? (user.vendorStatus === 'approved' ? '/vendor-dashboard' : '/vendor-pending') : '/dashboard'} />} />
              
              {/* Customer Dashboard */}
              <Route 
                path="/dashboard" 
                element={user ? (user.role === 'customer' ? <Dashboard /> : <Navigate to="/vendor-dashboard" />) : <Navigate to="/login" />} 
              />
              
              {/* Vendor Dashboard */}
              <Route 
                path="/vendor-dashboard" 
                element={user ? (user.role === 'vendor' && user.vendorStatus === 'approved' ? <VendorDashboard /> : <Navigate to={user.role === 'vendor' ? '/vendor-pending' : '/dashboard'} />) : <Navigate to="/login" />} 
              />
              
              <Route path="/vendor-pending" element={user?.role === 'vendor' ? <VendorPending /> : <Navigate to="/login" />} />
              
              {/* Tiffin Detail Screen */}
              <Route path="/tiffin/:id" element={<TiffinDetail />} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
