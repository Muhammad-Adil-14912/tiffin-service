import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { Calendar, MapPin, Clock, ArrowLeft, ShieldCheck, ChefHat, Sparkles } from 'lucide-react';

function TiffinDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [tiffin, setTiffin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Subscription form states
  const [planType, setPlanType] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [startDate, setStartDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('Lunch');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchTiffin = async () => {
      try {
        const res = await axios.get(`/api/tiffins/${id}`);
        if (res.data.success) {
          setTiffin(res.data.data);
          // Set user default address if available
          if (user && user.address) {
            setDeliveryAddress(user.address);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching meal details. The item might not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchTiffin();

    // Set default tomorrow date for subscription start
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setStartDate(tomorrow.toISOString().split('T')[0]);
  }, [id, user]);

  const handlePlanChange = (type) => {
    setPlanType(type);
  };

  const getPrice = () => {
    if (!tiffin || !tiffin.price) return 0;
    return tiffin.price[planType];
  };

  const getDaysCount = () => {
    if (planType === 'daily') return 1;
    if (planType === 'weekly') return 7;
    return 30;
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!deliveryAddress) {
      setError('Please provide a delivery address');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const orderPayload = {
        tiffinId: tiffin._id,
        planType,
        price: getPrice(),
        startDate,
        deliveryAddress,
        deliveryTime
      };

      const res = await axios.post('/api/orders', orderPayload);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Could not process subscription. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '3px solid rgba(249, 115, 22, 0.2)',
          borderTopColor: '#f97316',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Loading meal plan details...</p>
      </div>
    );
  }

  if (error && !tiffin) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <p style={{ color: '#ef4444', marginBottom: '1.5rem' }}>{error}</p>
        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  const badgeClass = tiffin.category === 'Veg' 
    ? 'badge-veg' 
    : tiffin.category === 'Non-Veg' 
      ? 'badge-nonveg' 
      : 'badge-diet';

  return (
    <div>
      <Link to="/" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        color: '#94a3b8',
        textDecoration: 'none',
        marginBottom: '2rem',
        fontWeight: 500,
        fontSize: '0.95rem'
      }}>
        <ArrowLeft size={16} />
        <span>Back to Home</span>
      </Link>

      <div className="detail-grid">
        {/* Left column: Info & Weekly Menu */}
        <div>
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <span className={`badge ${badgeClass}`} style={{ marginBottom: '1rem' }}>
              {tiffin.category}
            </span>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{tiffin.title}</h1>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              {tiffin.description}
            </p>

            <div style={{
              display: 'flex',
              gap: '1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                <ChefHat size={18} style={{ color: '#f97316' }} />
                <span>Prepared by: <strong>{tiffin.vendor?.name}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                <ShieldCheck size={18} style={{ color: '#10b981' }} />
                <span>FSSAI Certified Kitchen</span>
              </div>
            </div>
          </div>

          {/* Weekly Menu Card */}
          <div className="glass-card weekly-menu-card">
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
              Weekly Menu Schedule
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                <div key={day} className="menu-day-row">
                  <span className="day-name" style={{ textTransform: 'capitalize' }}>{day}</span>
                  <span className="day-meal">
                    {tiffin.menu?.[day] || 'Chef\'s Special (Surprise Menu)'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Subscription Card */}
        <div>
          <div className="glass-card" style={{ position: 'sticky', top: '100px' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Subscribe to Meal Plan</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Select your tier and configure delivery details</p>

            {success ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                color: '#10b981'
              }}>
                <Sparkles size={48} style={{ margin: '0 auto 1rem auto', display: 'block' }} />
                <h4 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Subscription Successful!</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Preparing your meals. Redirecting to your dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ marginTop: '1.5rem' }}>
                {/* Plan Tier Selectors */}
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Select Duration Tier
                </label>
                <div className="pricing-selector">
                  <div 
                    className={`price-select-btn ${planType === 'daily' ? 'active' : ''}`}
                    onClick={() => handlePlanChange('daily')}
                  >
                    <h4>Daily</h4>
                    <span>${tiffin.price?.daily}</span>
                  </div>
                  <div 
                    className={`price-select-btn ${planType === 'weekly' ? 'active' : ''}`}
                    onClick={() => handlePlanChange('weekly')}
                  >
                    <h4>Weekly</h4>
                    <span>${tiffin.price?.weekly}</span>
                  </div>
                  <div 
                    className={`price-select-btn ${planType === 'monthly' ? 'active' : ''}`}
                    onClick={() => handlePlanChange('monthly')}
                  >
                    <h4>Monthly</h4>
                    <span>${tiffin.price?.monthly}</span>
                  </div>
                </div>

                {/* Delivery Date */}
                <div className="form-group">
                  <label htmlFor="startDate">Start Date</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={18} style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#64748b'
                    }} />
                    <input
                      type="date"
                      id="startDate"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{ paddingLeft: '40px' }}
                      required
                    />
                  </div>
                </div>

                {/* Delivery Time Slot */}
                <div className="form-group">
                  <label htmlFor="deliveryTime">Preferred Time Slot</label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={18} style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#64748b'
                    }} />
                    <select
                      id="deliveryTime"
                      className="form-control"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      style={{ paddingLeft: '40px' }}
                    >
                      <option value="Lunch">Lunch Delivery (12:00 PM - 2:00 PM)</option>
                      <option value="Dinner">Dinner Delivery (7:00 PM - 9:00 PM)</option>
                    </select>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="form-group">
                  <label htmlFor="deliveryAddress">Delivery Address</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} style={{
                      position: 'absolute',
                      left: '12px',
                      top: '12px',
                      color: '#64748b'
                    }} />
                    <textarea
                      id="deliveryAddress"
                      className="form-control"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter specific delivery instructions or address"
                      style={{ paddingLeft: '40px', minHeight: '80px' }}
                      required
                    />
                  </div>
                </div>

                {/* Total Summary */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Total Price ({getDaysCount()} days)</span>
                  </div>
                  <div>
                    <strong style={{ fontSize: '1.6rem', color: '#f97316', fontFamily: "'Outfit', sans-serif" }}>
                      ${getPrice()}
                    </strong>
                  </div>
                </div>

                {error && (
                  <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>
                )}

                {/* Submit Action */}
                {!user ? (
                  <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                    <span>Login to Subscribe</span>
                  </Link>
                ) : user.role === 'vendor' ? (
                  <button type="button" className="btn btn-secondary" style={{ width: '100%', cursor: 'not-allowed' }} disabled>
                    <span>Vendor Mode (Ordering Disabled)</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    disabled={submitting}
                  >
                    <span>{submitting ? 'Processing...' : 'Subscribe Now'}</span>
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TiffinDetail;
