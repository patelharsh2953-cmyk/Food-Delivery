import React, { useEffect, useState } from 'react';
import './Reports.css';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { generateSalesPDF } from '../../utils/pdfGenerator';
import StatCard from '../../components/StatCard/StatCard';
import { 
    FileText, 
    Download, 
    Calendar, 
    IndianRupee, 
    ShoppingBag, 
    TrendingUp, 
    CheckCircle2, 
    UtensilsCrossed,
    Users, 
    Layers, 
    Filter, 
    RefreshCw,
    CreditCard,
    Award,
    FileSpreadsheet,
    RotateCcw,
    SlidersHorizontal
} from 'lucide-react';
import { toast } from 'react-toastify';

const Reports = () => {
    const [salesData, setSalesData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    
    // Filter States
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [filterPreset, setFilterPreset] = useState('all');
    const [statusFilter, setStatusFilter] = useState('All');
    const [paymentFilter, setPaymentFilter] = useState('All');

    // Helper: Local date to YYYY-MM-DD
    const getLocalDateString = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handlePresetChange = (preset) => {
        setFilterPreset(preset);
        const today = new Date();
        let start = '';
        let end = getLocalDateString(today);

        if (preset === 'today') {
            start = end;
        } else if (preset === '7days') {
            const d = new Date();
            d.setDate(d.getDate() - 7);
            start = getLocalDateString(d);
        } else if (preset === '30days') {
            const d = new Date();
            d.setDate(d.getDate() - 30);
            start = getLocalDateString(d);
        } else if (preset === 'all') {
            start = '';
            end = '';
        }

        setDateRange({ startDate: start, endDate: end });
    };

    const handleCustomDateChange = (field, val) => {
        setFilterPreset('custom');
        setDateRange(prev => ({
            ...prev,
            [field]: val
        }));
    };

    const handleResetFilters = () => {
        setFilterPreset('all');
        setDateRange({ startDate: '', endDate: '' });
        setStatusFilter('All');
        setPaymentFilter('All');
    };

    const fetchSalesReport = async () => {
        setLoading(true);
        try {
            let queryParams = [];
            if (dateRange.startDate) queryParams.push(`startDate=${dateRange.startDate}`);
            if (dateRange.endDate) queryParams.push(`endDate=${dateRange.endDate}`);
            if (statusFilter && statusFilter !== 'All') queryParams.push(`status=${encodeURIComponent(statusFilter)}`);
            if (paymentFilter && paymentFilter !== 'All') queryParams.push(`paymentMethod=${encodeURIComponent(paymentFilter)}`);
            const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

            const res = await axios.get(`${API_URL}/api/reports/sales${queryString}`);
            if (res.data && res.data.success) {
                setSalesData(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching sales report:", err);
            toast.error("Failed to load sales report data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesReport();
    }, [dateRange, statusFilter, paymentFilter]);

    const handleExportCSV = (type) => {
        let endpoint = `${API_URL}/api/reports/${type}/export`;
        let queryParams = [];
        if (dateRange.startDate) queryParams.push(`startDate=${dateRange.startDate}`);
        if (dateRange.endDate) queryParams.push(`endDate=${dateRange.endDate}`);
        if (statusFilter && statusFilter !== 'All') queryParams.push(`status=${encodeURIComponent(statusFilter)}`);
        if (paymentFilter && paymentFilter !== 'All') queryParams.push(`paymentMethod=${encodeURIComponent(paymentFilter)}`);
        if (queryParams.length > 0) endpoint += `?${queryParams.join('&')}`;

        window.open(endpoint, '_blank');
        toast.success(`Exporting ${type} CSV report...`);
    };

    const handleExportPDF = () => {
        if (!salesData) {
            toast.warn("Report data is still loading...");
            return;
        }
        setIsGeneratingPDF(true);
        try {
            const filename = generateSalesPDF(salesData, filterPreset, dateRange);
            toast.success(`Generated and downloaded ${filename} 📄`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Failed to generate PDF document");
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // Helper for status progress bar colors
    const getStatusColor = (status) => {
        const s = status.toLowerCase();
        if (s.includes('delivered')) return '#10b981';
        if (s.includes('cancel')) return '#ef4444';
        if (s.includes('out for delivery')) return '#3b82f6';
        if (s.includes('process') || s.includes('prepar')) return '#f59e0b';
        return '#ff4c24';
    };

    const isFiltered = filterPreset !== 'all' || dateRange.startDate || dateRange.endDate || statusFilter !== 'All' || paymentFilter !== 'All';

    return (
        <div className="reports-page fade-in">
            {/* Page Header */}
            <div className="page-header-row reports-header-row no-print">
                <div>
                    <h2 className="page-main-title">Business Reports &amp; Analytics</h2>
                    <p className="page-sub-title">Audit financial performance, revenue breakdown, and export PDF &amp; CSV documents</p>
                </div>
                <div className="reports-header-actions">
                    <button 
                        className="btn-primary flex-btn pdf-download-btn" 
                        onClick={handleExportPDF}
                        disabled={isGeneratingPDF || loading}
                    >
                        <FileText size={18} /> 
                        {isGeneratingPDF ? "Generating PDF..." : "Download PDF Report"}
                    </button>
                    <button 
                        className="btn-secondary flex-btn csv-download-btn" 
                        onClick={() => handleExportCSV('orders')}
                    >
                        <Download size={18} /> Export Orders CSV
                    </button>
                </div>
            </div>

            {/* Enhanced Time & Multi-Criteria Filter Card */}
            <div className="reports-filter-card no-print">
                <div className="filter-top-row">
                    {/* Presets */}
                    <div className="filter-presets">
                        <span className="preset-label">
                            <Filter size={15} /> Time Preset:
                        </span>
                        <button 
                            className={`preset-btn ${filterPreset === 'all' ? 'active' : ''}`}
                            onClick={() => handlePresetChange('all')}
                        >
                            All Time
                        </button>
                        <button 
                            className={`preset-btn ${filterPreset === 'today' ? 'active' : ''}`}
                            onClick={() => handlePresetChange('today')}
                        >
                            Today
                        </button>
                        <button 
                            className={`preset-btn ${filterPreset === '7days' ? 'active' : ''}`}
                            onClick={() => handlePresetChange('7days')}
                        >
                            Last 7 Days
                        </button>
                        <button 
                            className={`preset-btn ${filterPreset === '30days' ? 'active' : ''}`}
                            onClick={() => handlePresetChange('30days')}
                        >
                            Last 30 Days
                        </button>
                    </div>

                    {/* Reset Button */}
                    {isFiltered && (
                        <button className="reset-filter-btn" onClick={handleResetFilters} title="Reset all filters">
                            <RotateCcw size={14} /> Clear Filters
                        </button>
                    )}
                </div>

                <div className="filter-controls-row">
                    {/* Custom Date Inputs */}
                    <div className="custom-date-inputs">
                        <div className="date-field">
                            <Calendar size={15} className="date-icon" />
                            <label>From:</label>
                            <input 
                                type="date" 
                                value={dateRange.startDate} 
                                onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                            />
                        </div>
                        <div className="date-field">
                            <Calendar size={15} className="date-icon" />
                            <label>To:</label>
                            <input 
                                type="date" 
                                value={dateRange.endDate} 
                                onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Status & Payment Method Dropdown Filters */}
                    <div className="dropdown-filters-group">
                        <div className="filter-select-wrapper">
                            <label>Status:</label>
                            <select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Food Processing">Food Processing</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="filter-select-wrapper">
                            <label>Payment:</label>
                            <select 
                                value={paymentFilter} 
                                onChange={(e) => setPaymentFilter(e.target.value)}
                            >
                                <option value="All">All Methods</option>
                                <option value="UPI">UPI</option>
                                <option value="COD">Cash on Delivery (COD)</option>
                                <option value="Card">Card</option>
                                <option value="Online Payment">Online Payment</option>
                            </select>
                        </div>

                        <button className="refresh-report-btn" onClick={fetchSalesReport} title="Refresh report metrics">
                            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <StatCard 
                    title="Gross Revenue" 
                    value={loading ? "..." : `₹${(salesData?.totalRevenue || 0).toLocaleString()}`} 
                    icon={IndianRupee} 
                    color="success" 
                    change="+24%" 
                    isIncrease={true}
                    subtitle={`From ${salesData?.totalOrders || 0} customer orders`} 
                />
                <StatCard 
                    title="Total Orders" 
                    value={loading ? "..." : (salesData?.totalOrders || 0)} 
                    icon={ShoppingBag} 
                    color="warning" 
                    change="+18%" 
                    isIncrease={true}
                    subtitle={`${salesData?.paidOrdersCount || 0} successfully paid`} 
                />
                <StatCard 
                    title="Average Order Value" 
                    value={loading ? "..." : `₹${(salesData?.avgOrderValue || 0).toLocaleString()}`} 
                    icon={TrendingUp} 
                    color="info" 
                    subtitle="Per completed transaction" 
                />
                <StatCard 
                    title="Delivered Orders" 
                    value={loading ? "..." : (salesData?.deliveredOrdersCount || 0)} 
                    icon={CheckCircle2} 
                    color="purple" 
                    subtitle={`${salesData?.cancelledOrdersCount || 0} cancelled orders`} 
                />
            </div>

            {/* Export Cards Banner */}
            <div className="reports-export-banner no-print">
                <div className="export-col">
                    <div className="export-icon order-icon">
                        <FileSpreadsheet size={20} />
                    </div>
                    <div className="export-text">
                        <h4>Order History &amp; Transactions</h4>
                        <p>Complete customer addresses, item lists &amp; payment status</p>
                    </div>
                    <button className="export-download-btn" onClick={() => handleExportCSV('orders')}>
                        <Download size={14} /> Download CSV
                    </button>
                </div>

                <div className="export-col">
                    <div className="export-icon food-icon">
                        <UtensilsCrossed size={20} />
                    </div>
                    <div className="export-text">
                        <h4>Menu &amp; Food Catalog</h4>
                        <p>Food products pricing, active discounts &amp; stock status</p>
                    </div>
                    <button className="export-download-btn" onClick={() => handleExportCSV('products')}>
                        <Download size={14} /> Download CSV
                    </button>
                </div>

                <div className="export-col">
                    <div className="export-icon user-icon">
                        <Users size={20} />
                    </div>
                    <div className="export-text">
                        <h4>Customer Accounts</h4>
                        <p>Customer registration records, account status, and contacts</p>
                    </div>
                    <button className="export-download-btn" onClick={() => handleExportCSV('users')}>
                        <Download size={14} /> Download CSV
                    </button>
                </div>
            </div>

            {/* Detailed Analytics Breakdown Grid */}
            <div className="reports-breakdown-grid">
                {/* Top Selling Food Items Card */}
                <div className="report-card top-products-card">
                    <div className="card-header">
                        <h3>
                            <UtensilsCrossed size={18} color="#ff4c24" /> Top Selling Menu Items
                        </h3>
                        <span className="badge-pill">By Sales Volume</span>
                    </div>
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '60px' }}>Rank</th>
                                    <th>Food Item</th>
                                    <th>Quantity Sold</th>
                                    <th style={{ textAlign: 'right' }}>Total Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesData?.topProducts && salesData.topProducts.length > 0 ? (
                                    salesData.topProducts.map((p, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <span className={`rank-badge ${idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : 'default'}`}>
                                                    {idx === 0 ? <Award size={12} /> : null}
                                                    #{idx + 1}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="product-name-text">{p.name}</span>
                                            </td>
                                            <td>
                                                <span className="qty-pill">
                                                    {p.quantity} portions
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <span className="revenue-amount-text">
                                                    ₹{p.revenue.toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="empty-state-cell">
                                            {loading ? "Loading top selling food items..." : "No sales recorded for the selected filter criteria"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Status & Payment Gateway Breakdown Card */}
                <div className="report-card distribution-card">
                    <div className="card-header">
                        <h3>
                            <Layers size={18} color="#2563eb" /> Fulfillment &amp; Payment Methods
                        </h3>
                        <span className="badge-pill blue">Realtime Breakdown</span>
                    </div>
                    
                    <div className="breakdown-details-list">
                        {/* Order Status Section */}
                        <div className="breakdown-section">
                            <h4 className="sec-title">Order Status Breakdown</h4>
                            <div className="status-bars-group">
                                {salesData?.statusBreakdown && Object.entries(salesData.statusBreakdown).length > 0 ? (
                                    Object.entries(salesData.statusBreakdown).map(([status, count], i) => {
                                        const percent = salesData.totalOrders > 0 ? Math.round((count / salesData.totalOrders) * 100) : 0;
                                        const barColor = getStatusColor(status);
                                        return (
                                            <div key={i} className="status-bar-row">
                                                <div className="status-bar-header">
                                                    <span className="status-name">
                                                        <span className="status-indicator-dot" style={{ backgroundColor: barColor }} />
                                                        {status}
                                                    </span>
                                                    <span className="status-count">
                                                        <b>{count}</b> orders ({percent}%)
                                                    </span>
                                                </div>
                                                <div className="progress-track">
                                                    <div 
                                                        className="progress-fill" 
                                                        style={{ 
                                                            width: `${percent}%`,
                                                            backgroundColor: barColor 
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="no-data-text">No order status data available</p>
                                )}
                            </div>
                        </div>

                        {/* Payment Methods Volume Section */}
                        <div className="breakdown-section mt-3">
                            <h4 className="sec-title">Payment Gateways &amp; Volume</h4>
                            <div className="payment-methods-list">
                                {salesData?.paymentMethods && Object.entries(salesData.paymentMethods).length > 0 ? (
                                    Object.entries(salesData.paymentMethods).map(([method, amount], i) => {
                                        const share = salesData.totalRevenue > 0 ? Math.round((amount / salesData.totalRevenue) * 100) : 0;
                                        return (
                                            <div key={i} className="payment-method-row">
                                                <div className="method-left">
                                                    <div className="method-icon-box">
                                                        <CreditCard size={15} color="#2563eb" />
                                                    </div>
                                                    <div className="method-info">
                                                        <span className="method-label">{method}</span>
                                                        <span className="method-share">{share}% of total volume</span>
                                                    </div>
                                                </div>
                                                <span className="method-amount">₹{amount.toLocaleString()}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="no-data-text">No payment method records available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
