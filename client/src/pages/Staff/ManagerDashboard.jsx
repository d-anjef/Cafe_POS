import React, { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import API from "../../api/axios";
import "../../styles/Dashboard.css";

export default function ManagerDashboard({ branchId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#d4af37', '#ffffff', '#b5932d', '#888'];

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!branchId) return;
      try {
        setLoading(true);
        const res = await API.get(`/orders/analytics/${branchId}`);
        setData(res.data);
      } catch (err) {
        console.error("Analytics Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [branchId]);

  if (loading) return <div className="luxury-loader">Gathering Business Intelligence...</div>;
  
  // Guard: If data is null or empty, show a friendly message instead of crashing
  if (!data || Object.keys(data).length === 0) {
    return <div className="error-text">No analytics data found for this branch.</div>;
  }

  // Use default values to prevent destructuring undefined properties
  const summary = data.summary || { subtotal: 0, totalOrders: 0, grandTotal: 0, serviceCharge: 0, vat: 0 };
  const paymentStats = data.paymentStats || [];
  const hourlySales = data.hourlySales || [];
  const popularItems = data.popularItems || [];

  return (
    <div className="dashboard-container luxury-bg">
      <h1 className="gold-text">Branch Insights & Financials</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Daily Subtotal</h3>
          <p className="stat-value">Rs. {Number(summary.subtotal || 0).toFixed(2)}</p>
          <span className="stat-label">Excluding Taxes</span>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-value">{summary.totalOrders || 0}</p>
          <span className="stat-label">Completed Today</span>
        </div>
        <div className="stat-card highlighted-card" style={{ border: '2px solid #d4af37' }}>
          <h3>Grand Revenue</h3>
          <p className="stat-value gold-text">Rs. {Number(summary.grandTotal || 0).toFixed(2)}</p>
          <span className="stat-label">Incl. VAT (13%) & SC (10%)</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="stat-card">
          <h3 className="gold-text mb-3">Tax & Service Collection</h3>
          <div className="tax-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Service Charge (10%)</span>
            <span>Rs. {Number(summary.serviceCharge || 0).toFixed(2)}</span>
          </div>
          <div className="tax-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Government VAT (13%)</span>
            <span>Rs. {Number(summary.vat || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="charts-section-grid mt-4">
        {/* PEAK HOURS */}
        <div className="chart-container stat-card" style={{ minHeight: '400px' }}>
          <h3 className="gold-text">Peak Hours</h3>
          <div style={{ width: '100%', height: 300 }}>
            {hourlySales.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="hour" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #d4af37' }} />
                  <Bar dataKey="orders" fill="#d4af37" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-muted">No hourly data available</p>}
          </div>
        </div>

        {/* PAYMENT SPLIT */}
        <div className="chart-container stat-card" style={{ minHeight: '400px' }}>
          <h3 className="gold-text">Payment Method Split</h3>
          <div style={{ width: '100%', height: 300 }}>
            {paymentStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStats}
                    dataKey="revenue"
                    nameKey="_id"
                    cx="50%" cy="50%"
                    outerRadius={80}
                    innerRadius={60}
                    label
                  >
                    {paymentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted">No payment data available</p>}
          </div>
        </div>
      </div>

      {/* POPULAR ITEMS */}
      <div className="popular-section mt-4 stat-card">
        <h2 className="gold-text mb-4">Top 5 Best Selling Items</h2>
        <div className="popular-list">
          {popularItems.length > 0 ? (
            popularItems.map((item, index) => (
              <div key={index} className="popular-item-row" style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span className="item-name">{index + 1}. {item.name}</span>
                  <span className="gold-text">{item.count} units</span>
                </div>
                <div className="progress-bar-bg" style={{ height: '8px', background: '#333', borderRadius: '4px' }}>
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #d4af37, #f1c40f)', 
                      borderRadius: '4px',
                      // Safely calculate percentage based on the top item
                      width: `${popularItems[0]?.count ? (item.count / popularItems[0].count) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">No items sold yet today.</p>
          )}
        </div>
      </div>
    </div>
  );
}