import React, { useState, useRef, useEffect } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { 
  Menu, 
  Search, 
  ChevronDown, 
  LogOut, 
  User, 
  X, 
  UtensilsCrossed, 
  Users, 
  ShoppingBag, 
  Layers, 
  Mail, 
  Tag, 
  Truck, 
  CreditCard,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  API_URL,
  sampleProducts, 
  sampleUsers, 
  sampleOrders, 
  sampleCategories, 
  sampleContacts, 
  sampleOffers, 
  samplePayments 
} from '../../config/api';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const Navbar = ({ toggleSidebar, pageTitle }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const { logout, adminUser } = useAdminAuth();
  const displayName  = adminUser?.name  || 'Admin Manager';
  const displayEmail = adminUser?.email || 'admin@fooddel.com';
  
  // Real database records fetched from backend API
  const [dbProducts, setDbProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [dbContacts, setDbContacts] = useState([]);
  const [dbOrders, setDbOrders] = useState([]);
  const [dbUsers, setDbUsers] = useState([]);
  const [dbOffers, setDbOffers] = useState([]);
  const [dbPayments, setDbPayments] = useState([]);

  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully. See you soon! 👋', { autoClose: 2500 });
    navigate('/login', { replace: true });
  };

  // Fetch live database records from backend API
  useEffect(() => {
    fetchLiveDatabaseRecords();
  }, []);

  const fetchLiveDatabaseRecords = async () => {
    setIsLoadingData(true);
    try {
      const [foodRes, catRes, contactRes, orderRes, userRes, offerRes] = await Promise.allSettled([
        axios.get(`${API_URL}/api/food/list`),
        axios.get(`${API_URL}/api/category/list`),
        axios.get(`${API_URL}/api/contacts`),
        axios.get(`${API_URL}/api/order/list`),
        axios.get(`${API_URL}/api/user/list`),
        axios.get(`${API_URL}/api/offer/list`)
      ]);

      if (foodRes.status === 'fulfilled' && foodRes.value.data?.success && Array.isArray(foodRes.value.data.data)) {
        setDbProducts(foodRes.value.data.data);
      }
      if (catRes.status === 'fulfilled' && catRes.value.data?.success && Array.isArray(catRes.value.data.data)) {
        setDbCategories(catRes.value.data.data);
      }
      if (contactRes.status === 'fulfilled' && contactRes.value.data?.success && Array.isArray(contactRes.value.data.data)) {
        setDbContacts(contactRes.value.data.data);
      }
      if (orderRes.status === 'fulfilled' && orderRes.value.data?.success && Array.isArray(orderRes.value.data.data)) {
        setDbOrders(orderRes.value.data.data);
      }
      if (userRes.status === 'fulfilled' && userRes.value.data?.success && Array.isArray(userRes.value.data.data)) {
        setDbUsers(userRes.value.data.data);
      }
      if (offerRes.status === 'fulfilled' && offerRes.value.data?.success && Array.isArray(offerRes.value.data.data)) {
        setDbOffers(offerRes.value.data.data);
      }
      if (delRes.status === 'fulfilled' && delRes.value.data?.success && Array.isArray(delRes.value.data.data)) {
        setDbDeliveries(delRes.value.data.data);
      }
    } catch (err) {
      console.log("Error fetching live backend records for search, using fallbacks");
    } finally {
      setIsLoadingData(false);
    }
  };

  // Close search results when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Helper function to safely render text with bold highlighted search matching substrings
  const renderHighlightedText = (text, query) => {
    if (text === null || text === undefined || !query) return text || '';
    const textStr = text.toString();
    if (!textStr) return '';
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = textStr.split(new RegExp(`(${escapedQuery})`, 'gi'));
    
    return parts.map((part, idx) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <strong key={idx} className="search-highlight-bold">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  // Combine Live Database Records + Sample Fallbacks (deduplicating by _id)
  const combineRecords = (liveList, sampleList) => {
    const combined = [...liveList];
    const liveIds = new Set(liveList.map(item => item._id));
    sampleList.forEach(sampleItem => {
      if (!liveIds.has(sampleItem._id)) {
        combined.push(sampleItem);
      }
    });
    return combined;
  };

  const allProducts = combineRecords(dbProducts, sampleProducts);
  const allCategories = combineRecords(dbCategories, sampleCategories);
  const allContacts = combineRecords(dbContacts, sampleContacts);
  const allOrders = dbOrders;
  const allUsers = combineRecords(dbUsers, sampleUsers);
  const allOffers = combineRecords(dbOffers, sampleOffers);
  const allPayments = combineRecords(dbPayments, samplePayments);

  // Search Logic across all fields
  const q = searchQuery.trim().toLowerCase();

  const matchedProducts = q ? allProducts.filter(p => 
    p.name?.toLowerCase().includes(q) || 
    p.category?.toLowerCase().includes(q) || 
    p.description?.toLowerCase().includes(q) ||
    p.price?.toString().includes(q)
  ) : [];

  const matchedUsers = q ? allUsers.filter(u => 
    u.name?.toLowerCase().includes(q) || 
    u.email?.toLowerCase().includes(q) || 
    u.phone?.toLowerCase().includes(q)
  ) : [];

  const matchedOrders = q ? allOrders.filter(o => {
    const customerName = o.customer || `${o.address?.firstName || ''} ${o.address?.lastName || ''}`.trim();
    return (
      o._id?.toLowerCase().includes(q) || 
      customerName.toLowerCase().includes(q) || 
      o.address?.city?.toLowerCase().includes(q) ||
      o.address?.street?.toLowerCase().includes(q) ||
      o.amount?.toString().includes(q) ||
      o.status?.toLowerCase().includes(q)
    );
  }) : [];

  const matchedCategories = q ? allCategories.filter(c => 
    c.name?.toLowerCase().includes(q) ||
    c.status?.toLowerCase().includes(q)
  ) : [];

  const matchedContacts = q ? allContacts.filter(c => 
    c.name?.toLowerCase().includes(q) || 
    c.email?.toLowerCase().includes(q) || 
    c.phone?.toLowerCase().includes(q) || 
    c.subject?.toLowerCase().includes(q) || 
    c.message?.toLowerCase().includes(q) ||
    c.status?.toLowerCase().includes(q)
  ) : [];

  const matchedOffers = q ? allOffers.filter(o => 
    o.code?.toLowerCase().includes(q) ||
    o.discount?.toString().includes(q) ||
    o.status?.toLowerCase().includes(q)
  ) : [];

  const matchedPayments = q ? allPayments.filter(p => 
    p._id?.toLowerCase().includes(q) || 
    p.customer?.toLowerCase().includes(q) || 
    p.orderId?.toLowerCase().includes(q) || 
    p.method?.toLowerCase().includes(q) ||
    p.status?.toLowerCase().includes(q)
  ) : [];

  const totalResultsCount = 
    matchedProducts.length + 
    matchedUsers.length + 
    matchedOrders.length + 
    matchedCategories.length + 
    matchedContacts.length + 
    matchedOffers.length + 
    matchedPayments.length;

  const handleResultSelect = (path) => {
    navigate(path);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="admin-navbar">
      <div className="nav-left">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar} title="Toggle Sidebar">
          <Menu size={22} color="#49557e" />
        </button>
        <h2 className="page-title">{pageTitle || "Dashboard"}</h2>
      </div>

      {/* Global Search Bar & Results Dropdown */}
      <div className="nav-center" ref={searchContainerRef}>
        <div className={`nav-search-bar ${isSearchOpen && q ? 'active-search' : ''}`}>
          <Search size={18} color="#676767" />
          <input 
            type="text" 
            placeholder="Search products, users, orders, contacts..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => {
              setIsSearchOpen(true);
              fetchLiveDatabaseRecords(); // refresh records when focused
            }}
          />
          {isLoadingData ? (
            <Loader2 size={16} color="#ff4c24" className="animate-spin" />
          ) : searchQuery ? (
            <button 
              className="clear-search-btn" 
              onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
              title="Clear search"
            >
              <X size={16} color="#64748b" />
            </button>
          ) : null}
        </div>

        {/* Search Results Dropdown Overlay */}
        {isSearchOpen && q.length > 0 && (
          <div className="global-search-results-dropdown fade-in">
            <div className="search-results-header">
              <span>Matching Records ({totalResultsCount})</span>
              <span className="search-hint">Press Esc to close</span>
            </div>

            <div className="search-results-body">
              {totalResultsCount === 0 ? (
                <div className="search-no-results">
                  <p>No matching documents found for "<strong>{searchQuery}</strong>"</p>
                </div>
              ) : (
                <>
                  {/* Food Products */}
                  {matchedProducts.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-title">
                        <UtensilsCrossed size={14} /> Products ({matchedProducts.length})
                      </div>
                      {matchedProducts.map((p) => (
                        <div key={p._id} className="search-item" onClick={() => handleResultSelect('/products')}>
                          <div className="item-title">{renderHighlightedText(p.name, searchQuery)}</div>
                          <div className="item-subtitle">
                            Category: {renderHighlightedText(p.category, searchQuery)} • ₹{renderHighlightedText(p.price, searchQuery)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Registered Users */}
                  {matchedUsers.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-title">
                        <Users size={14} /> Users ({matchedUsers.length})
                      </div>
                      {matchedUsers.map((u) => (
                        <div key={u._id} className="search-item" onClick={() => handleResultSelect('/users')}>
                          <div className="item-title">{renderHighlightedText(u.name, searchQuery)}</div>
                          <div className="item-subtitle">
                            Email: {renderHighlightedText(u.email, searchQuery)} • Phone: {renderHighlightedText(u.phone, searchQuery)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Customer Orders */}
                  {matchedOrders.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-title">
                        <ShoppingBag size={14} /> Orders ({matchedOrders.length})
                      </div>
                      {matchedOrders.map((o) => {
                        const custName = o.customer || `${o.address?.firstName || ''} ${o.address?.lastName || ''}`.trim() || 'Customer';
                        return (
                          <div key={o._id} className="search-item" onClick={() => handleResultSelect('/orders')}>
                            <div className="item-title">
                              Order #{renderHighlightedText(o._id, searchQuery)} - {renderHighlightedText(custName, searchQuery)}
                            </div>
                            <div className="item-subtitle">
                              City: {renderHighlightedText(o.address?.city || 'N/A', searchQuery)} • Amount: ₹{renderHighlightedText(o.amount, searchQuery)} • Status: {renderHighlightedText(o.status, searchQuery)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Contact Messages */}
                  {matchedContacts.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-title">
                        <Mail size={14} /> Contact Messages ({matchedContacts.length})
                      </div>
                      {matchedContacts.map((cnt) => (
                        <div key={cnt._id} className="search-item" onClick={() => handleResultSelect('/contacts')}>
                          <div className="item-title">
                            {renderHighlightedText(cnt.name, searchQuery)} - {renderHighlightedText(cnt.subject, searchQuery)}
                          </div>
                          <div className="item-subtitle">
                            Email: {renderHighlightedText(cnt.email, searchQuery)} • Phone: {renderHighlightedText(cnt.phone, searchQuery)} • Status: {renderHighlightedText(cnt.status, searchQuery)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Categories */}
                  {matchedCategories.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-title">
                        <Layers size={14} /> Categories ({matchedCategories.length})
                      </div>
                      {matchedCategories.map((c) => (
                        <div key={c._id} className="search-item" onClick={() => handleResultSelect('/categories')}>
                          <div className="item-title">{renderHighlightedText(c.name, searchQuery)}</div>
                          <div className="item-subtitle">Status: {renderHighlightedText(c.status || 'Active', searchQuery)}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Offers */}
                  {matchedOffers.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-title">
                        <Tag size={14} /> Offers ({matchedOffers.length})
                      </div>
                      {matchedOffers.map((off) => (
                        <div key={off._id} className="search-item" onClick={() => handleResultSelect('/offers')}>
                          <div className="item-title">Code: {renderHighlightedText(off.code, searchQuery)}</div>
                          <div className="item-subtitle">Discount: {renderHighlightedText(off.discount, searchQuery)}% OFF • Status: {renderHighlightedText(off.status, searchQuery)}</div>
                        </div>
                      ))}
                    </div>
                  )}



                  {/* Payments */}
                  {matchedPayments.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-title">
                        <CreditCard size={14} /> Payments ({matchedPayments.length})
                      </div>
                      {matchedPayments.map((pay) => (
                        <div key={pay._id} className="search-item" onClick={() => handleResultSelect('/payments')}>
                          <div className="item-title">
                            Payment #{renderHighlightedText(pay._id, searchQuery)} - {renderHighlightedText(pay.customer, searchQuery)}
                          </div>
                          <div className="item-subtitle">
                            Method: {renderHighlightedText(pay.method, searchQuery)} • Amount: ₹{renderHighlightedText(pay.amount, searchQuery)} • Status: {renderHighlightedText(pay.status, searchQuery)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="nav-right">
        {/* Profile Avatar Dropdown */}
        <div className="admin-profile-wrapper">
          <div 
            className="profile-trigger" 
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
            }}
          >
            <img src={assets.profile_image} alt="Admin Profile" className="profile-img" />
            <div className="profile-info">
              <span className="admin-name">{displayName}</span>
              <span className="admin-role">Super Admin</span>
            </div>
            <ChevronDown size={16} color="#49557e" />
          </div>

          {showProfileMenu && (
            <div className="nav-dropdown profile-dropdown fade-in">
              <div className="user-dropdown-header">
                <p className="header-name">{displayName}</p>
                <p className="header-email">{displayEmail}</p>
              </div>
              <div className="dropdown-divider"></div>
              <ul>
                <li onClick={() => { navigate('/dashboard'); setShowProfileMenu(false); }}>
                  <User size={16} /> Admin Dashboard
                </li>
                <div className="dropdown-divider"></div>
                <li className="logout-item" onClick={handleLogout}>
                  <LogOut size={16} color="#ef4444" /> <span style={{ color: '#ef4444' }}>Logout</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;