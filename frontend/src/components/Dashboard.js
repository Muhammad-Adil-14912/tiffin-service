import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { ShoppingBag, DollarSign, Calendar, MapPin, Phone, MessageSquare, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/api/orders/user');
        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch your subscriptions.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const calculateTotalSpent = () => {
    return orders.reduce((sum, order) => sum + (order.status !== 'Cancelled' ? order.price : 0), 0);
  };

  const activeOrdersCount = orders.filter(
    (order) => order.status !== 'Delivered' && order.status !== 'Cancelled'
  ).length;

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Welcome, {user?.name}!</h1>
        <p style={{ color: '#94a3b8' }}>Monitor your active meal subscriptions and order status.</p>
      </div>

      {/* Analytics Summary */}
      <div className="dashboard-grid">
        <div className="glass-card analytic-card">
          <div className="analytic-icon" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
            <ShoppingBag size={24} />
          </div>
          <div className="analytic-info">
            <h3>{orders.length}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="glass-card analytic-card">
          <div className="analytic-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <ShoppingBag size={24} />
          </div>
          <div className="analytic-info">
            <h3>{activeOrdersCount}</h3>
            <p>Active Meals</p>
          </div>
        </div>

        <div className="glass-card analytic-card">
          <div className="analytic-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <DollarSign size={24} />
          </div>
          <div className="analytic-info">
            <h3>${calculateTotalSpent().toFixed(2)}</h3>
            <p>Total Spendings</p>
          </div>
        </div>
      </div>

      {/* Subscription List */}
      <div className="glass-card">
        <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          Your Meal Subscriptions
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{
              display: 'inline-block',
              width: '30px',
              height: '30px',
              border: '3px solid rgba(249, 115, 22, 0.2)',
              borderTopColor: '#f97316',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Fetching orders...</p>
          </div>
        ) : error ? (
          <p style={{ color: '#ef4444' }}>{error}</p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Compass size={40} style={{ color: '#64748b', marginBottom: '1rem' }} />
            <h4>No Active Subscriptions</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              Subscribe to a plan to start receiving delicious homemade food.
            </p>
            <Link to="/" className="btn btn-primary">
              Browse Tiffin Plans
            </Link>
          </div>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Meal Plan</th>
                  <th>Tier</th>
                  <th>Cost</th>
                  <th>Delivery Details</th>
                  <th>Kitchen Contact</th>
                  <th>Status</th>
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
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <tr key={order._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.tiffin?.title || 'Unknown Plan'}</div>
                        <span className="badge" style={{
                          padding: '0.1rem 0.4rem',
                          fontSize: '0.65rem',
                          backgroundColor: order.tiffin?.category === 'Veg' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: order.tiffin?.category === 'Veg' ? '#10b981' : '#ef4444',
                          marginTop: '0.25rem'
                        }}>
                          {order.tiffin?.category || 'Veg'}
                        </span>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {order.planType}
                      </td>
                      <td style={{ fontWeight: 700, color: '#f97316' }}>
                        ${order.price}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                          <Calendar size={14} style={{ color: '#94a3b8' }} />
                          <span>Starts: {formattedDate}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                          <Calendar size={14} style={{ color: '#94a3b8' }} />
                          <span>Slot: {order.deliveryTime}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                          <MapPin size={14} />
                          <span style={{
                            maxWidth: '180px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }} title={order.deliveryAddress}>
                            {order.deliveryAddress}
                          </span>
                        </div>
                      </td>
                      <td>
                        {order.tiffin?.vendor ? (
                          <>
                            <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{order.tiffin.vendor.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                              <Phone size={12} />
                              <span>{order.tiffin.vendor.phone || 'N/A'}</span>
                            </div>
                          </>
                        ) : (
                          <span style={{ color: '#64748b' }}>N/A</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-indicator ${statusClass}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
