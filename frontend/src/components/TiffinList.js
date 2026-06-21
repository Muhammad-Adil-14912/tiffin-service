import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Sparkles, Plus, AlertCircle, ShoppingBag } from 'lucide-react';

function TiffinList() {
  const [tiffins, setTiffins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTiffins = async () => {
      try {
        const res = await axios.get('/api/tiffins');
        if (res.data.success) {
          setTiffins(res.data.data);
        }
      } catch (err) {
        console.error(err);
        setError('Could not retrieve meal plans. Make sure the server is online.');
      } finally {
        setLoading(false);
      }
    };

    fetchTiffins();
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
  };

  const filteredTiffins = tiffins.filter((tiffin) => {
    const matchesSearch = tiffin.title.toLowerCase().includes(search.toLowerCase()) || 
                          tiffin.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || tiffin.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Hero Section */}
      <header className="home-hero">
        <h1>Delicious Home-Style Meals</h1>
        <p>Fresh, nutritious, and authentic tiffins prepared with organic ingredients, delivered warm to your doorstep daily.</p>
      </header>

      {/* Filters & Search bar */}
      <div className="filters-bar glass-card" style={{ padding: '1rem 1.5rem' }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b'
          }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search thalis, diet plans..."
            value={search}
            onChange={handleSearchChange}
            style={{ paddingLeft: '40px', paddingRight: '12px', paddingTop: '0.6rem', paddingBottom: '0.6rem' }}
          />
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          {['All', 'Veg', 'Non-Veg', 'Diet'].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`tab-btn ${category === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '1.2rem',
          borderRadius: '12px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          marginBottom: '2rem'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Catalog Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '3px solid rgba(249, 115, 22, 0.2)',
            borderTopColor: '#f97316',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ color: '#94a3b8' }}>Loading delicious plans...</p>
        </div>
      ) : filteredTiffins.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <ShoppingBag size={48} style={{ color: '#64748b', marginBottom: '1rem' }} />
          <h3>No Meal Plans Available</h3>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
            {search || category !== 'All' 
              ? 'No meals match your criteria. Try adjusting your filters!'
              : 'Our vendors are currently preparing new menus. Please check back shortly.'}
          </p>
        </div>
      ) : (
        <div className="tiffin-grid">
          {filteredTiffins.map((tiffin) => {
            const badgeClass = tiffin.category === 'Veg' 
              ? 'badge-veg' 
              : tiffin.category === 'Non-Veg' 
                ? 'badge-nonveg' 
                : 'badge-diet';

            return (
              <div key={tiffin._id} className="glass-card tiffin-card">
                {/* Image Placeholder with category theme gradient */}
                <div className="tiffin-img-placeholder" style={{
                  background: tiffin.category === 'Veg' 
                    ? 'linear-gradient(135deg, #064e3b 0%, #1e293b 100%)' 
                    : tiffin.category === 'Non-Veg' 
                      ? 'linear-gradient(135deg, #7f1d1d 0%, #1e293b 100%)' 
                      : 'linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%)'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    zIndex: 2
                  }}>
                    <span className={`badge ${badgeClass}`}>{tiffin.category}</span>
                  </div>
                  <Sparkles size={36} style={{ color: 'rgba(255,255,255,0.15)' }} />
                </div>

                <h3>{tiffin.title}</h3>
                <p className="tiffin-desc">{tiffin.description}</p>

                <div className="tiffin-price-tag">
                  <div>
                    <div className="price-label">Starts from</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Daily Plan</div>
                  </div>
                  <span className="price-amount">${tiffin.price?.daily}/day</span>
                </div>

                <Link to={`/tiffin/${tiffin._id}`} className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }}>
                  <span>View Details & Subscribe</span>
                  <Plus size={16} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TiffinList;
