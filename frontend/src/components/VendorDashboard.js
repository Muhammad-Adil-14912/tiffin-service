import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChefHat, ShoppingBag, DollarSign, Plus, Eye, Trash2, X, Check, Save } from 'lucide-react';

function VendorDashboard() {
  // State for vendor's tiffins and orders
  const [tiffins, setTiffins] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingTiffins, setLoadingTiffins] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // UI state
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Tiffin plan form state
  const [newTiffin, setNewTiffin] = useState({
    title: '',
    description: '',
    price: { daily: '', weekly: '', monthly: '' },
    category: 'Veg',
    menu: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    }
  });

  useEffect(() => {
    fetchTiffins();
    fetchOrders();
  }, []);

  const fetchTiffins = async () => {
    try {
      const res = await axios.get('/api/tiffins/vendor');
      if (res.data.success) {
        setTiffins(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTiffins(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders/vendor');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTiffin({ ...newTiffin, [name]: value });
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setNewTiffin({
      ...newTiffin,
      price: { ...newTiffin.price, [name]: Number(value) }
    });
  };

  const handleMenuChange = (e) => {
    const { name, value } = e.target;
    setNewTiffin({
      ...newTiffin,
      menu: { ...newTiffin.menu, [name]: value }
    });
  };

  const handleCreateTiffin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await axios.post('/api/tiffins', newTiffin);
      if (res.data.success) {
        setSuccessMsg('Meal plan created successfully!');
        setNewTiffin({
          title: '',
          description: '',
          price: { daily: '', weekly: '', monthly: '' },
          category: 'Veg',
          menu: { monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: '' }
        });
        setShowAddForm(false);
        fetchTiffins();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating meal plan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTiffin = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tiffin plan?')) return;

    try {
      const res = await axios.delete(`/api/tiffins/${id}`);
      if (res.data.success) {
        fetchTiffins();
      }
    } catch (err) {
      alert('Error deleting tiffin plan.');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        fetchOrders();
      }
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const calculateTotalEarnings = () => {
    return orders.reduce((sum, order) => sum + (order.status === 'Delivered' ? order.price : 0), 0);
  };

  const calculatePendingEarnings = () => {
    return orders.reduce((sum, order) => sum + (order.status !== 'Delivered' && order.status !== 'Cancelled' ? order.price : 0), 0);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem' }}>Vendor Admin Dashboard</h1>
          <p style={{ color: '#94a3b8' }}>Manage meal plans, track subscriber orders, and manage kitchen earnings.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn btn-primary"
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          <span>{showAddForm ? 'Cancel Form' : 'Add New Tiffin'}</span>
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="dashboard-grid">
        <div className="glass-card analytic-card">
          <div className="analytic-icon" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
            <ChefHat size={24} />
          </div>
          <div className="analytic-info">
            <h3>{tiffins.length}</h3>
            <p>Active Menu Items</p>
          </div>
        </div>

        <div className="glass-card analytic-card">
          <div className="analytic-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <ShoppingBag size={24} />
          </div>
          <div className="analytic-info">
            <h3>{orders.length}</h3>
            <p>Total Subscriptions</p>
          </div>
        </div>

        <div className="glass-card analytic-card">
          <div className="analytic-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <DollarSign size={24} />
          </div>
          <div className="analytic-info">
            <h3>${calculateTotalEarnings().toFixed(2)}</h3>
            <p>Total Revenue (Delivered)</p>
          </div>
        </div>

        <div className="glass-card analytic-card">
          <div className="analytic-icon" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }}>
            <DollarSign size={24} />
          </div>
          <div className="analytic-info">
            <h3>${calculatePendingEarnings().toFixed(2)}</h3>
            <p>Pipeline Value</p>
          </div>
        </div>
      </div>

      {/* Add New Tiffin Form */}
      {showAddForm && (
        <div className="glass-card meal-form-card">
          <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            Add Premium Tiffin Package
          </h3>

          {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
          {successMsg && <p style={{ color: '#10b981', marginBottom: '1rem' }}>{successMsg}</p>}

          <form onSubmit={handleCreateTiffin}>
            <div className="menu-form-grid">
              {/* Basic Details */}
              <div>
                <div className="form-group">
                  <label htmlFor="title">Tiffin Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newTiffin.title}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="e.g. Deluxe Veg Punjabi Thali"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={newTiffin.category}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                    <option value="Diet">Diet</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Meal Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={newTiffin.description}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Describe menu style, spice levels, and portions."
                    style={{ minHeight: '80px' }}
                    required
                  />
                </div>

                {/* Pricing Tiers */}
                <h4 style={{ margin: '1.5rem 0 0.5rem 0', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  Pricing Strategy (USD)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem' }}>Daily ($) *</label>
                    <input
                      type="number"
                      name="daily"
                      value={newTiffin.price.daily}
                      onChange={handlePriceChange}
                      className="form-control"
                      placeholder="12"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem' }}>Weekly ($) *</label>
                    <input
                      type="number"
                      name="weekly"
                      value={newTiffin.price.weekly}
                      onChange={handlePriceChange}
                      className="form-control"
                      placeholder="75"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem' }}>Monthly ($) *</label>
                    <input
                      type="number"
                      name="monthly"
                      value={newTiffin.price.monthly}
                      onChange={handlePriceChange}
                      className="form-control"
                      placeholder="280"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Weekly Menu Schedule Inputs */}
              <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.08)', paddingLeft: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  Weekly Menu Schedule
                </h4>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <div key={day} className="form-group" style={{ marginBottom: '0.8rem' }}>
                    <label htmlFor={day} style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{day}</label>
                    <input
                      type="text"
                      id={day}
                      name={day}
                      value={newTiffin.menu[day]}
                      onChange={handleMenuChange}
                      className="form-control"
                      placeholder={`Dishes for ${day}`}
                      style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting}
              >
                <Save size={16} />
                <span>{submitting ? 'Saving...' : 'Save Tiffin Plan'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Orders Manager */}
      <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          Customer Subscriptions Manager
        </h3>

        {loadingOrders ? (
          <p style={{ color: '#94a3b8' }}>Loading subscriptions...</p>
        ) : orders.length === 0 ? (
          <p style={{ color: '#94a3b8', padding: '2rem 0', textAlign: 'center' }}>No client orders received yet.</p>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Subscriber</th>
                  <th>Meal Ordered</th>
                  <th>Tier</th>
                  <th>Scheduled Details</th>
                  <th>Contact Info</th>
                  <th>Update Delivery Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const statusClass = 
                    order.status === 'Pending' ? 'status-pending' :
                    order.status === 'Cooking' ? 'status-cooking' :
                    order.status === 'Dispatched' ? 'status-dispatched' :
                    order.status === 'Delivered' ? 'status-delivered' : 'status-cancelled';

                  const formattedDate = new Date(order.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <tr key={order._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.user?.name || 'Customer'}</div>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>ID: {order._id.substring(18)}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{order.tiffin?.title || 'Tiffin Package'}</div>
                        <span className="badge" style={{
                          padding: '0.1rem 0.4rem',
                          fontSize: '0.6rem',
                          backgroundColor: order.tiffin?.category === 'Veg' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: order.tiffin?.category === 'Veg' ? '#10b981' : '#ef4444',
                        }}>
                          {order.tiffin?.category || 'Veg'}
                        </span>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {order.planType} (${order.price})
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>Start: {formattedDate}</div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Slot: {order.deliveryTime}</div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#64748b',
                          maxWidth: '180px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }} title={order.deliveryAddress}>
                          Addr: {order.deliveryAddress}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{order.user?.email}</div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Phone: {order.user?.phone || 'N/A'}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className={`status-indicator ${statusClass}`} style={{ minWidth: '85px', textAlign: 'center' }}>
                            {order.status}
                          </span>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            style={{
                              background: '#1e293b',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '4px',
                              padding: '0.2rem 0.5rem',
                              color: '#fff',
                              outline: 'none',
                              fontSize: '0.85rem'
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Cooking">Cooking</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tiffin plans list */}
      <div className="glass-card">
        <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          Your Tiffin Packages
        </h3>

        {loadingTiffins ? (
          <p style={{ color: '#94a3b8' }}>Loading plans...</p>
        ) : tiffins.length === 0 ? (
          <p style={{ color: '#94a3b8', padding: '2rem 0', textAlign: 'center' }}>You haven't added any meals yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            {tiffins.map((t) => (
              <div key={t._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1.15rem' }}>{t.title}</h4>
                  <span className="badge badge-veg" style={{
                    backgroundColor: t.category === 'Veg' ? 'rgba(16, 185, 129, 0.15)' : t.category === 'Non-Veg' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    color: t.category === 'Veg' ? '#10b981' : t.category === 'Non-Veg' ? '#ef4444' : '#3b82f6',
                  }}>
                    {t.category}
                  </span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', flex: 1, marginBottom: '1rem' }}>{t.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem', marginBottom: '1rem' }}>
                  <span>Daily: <strong>${t.price?.daily}</strong></span>
                  <span>Weekly: <strong>${t.price?.weekly}</strong></span>
                  <span>Monthly: <strong>${t.price?.monthly}</strong></span>
                </div>
                <button
                  onClick={() => handleDeleteTiffin(t._id)}
                  className="btn btn-danger"
                  style={{ padding: '0.4rem', width: '100%', fontSize: '0.8rem' }}
                >
                  <Trash2 size={14} />
                  <span>Delete Package</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorDashboard;
