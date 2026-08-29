import React, { useContext, useState, useEffect, useRef } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'
import {
  Search, ShoppingBag, User, Package, LogOut,
  X, Plus, Minus, UtensilsCrossed, Menu
} from 'lucide-react'

const Navbar = ({ setShowLogin }) => {
  const { getTotalCartAmount, token, setToken, food_list, cartItems, addToCart, removeFromCart, url } =
    useContext(StoreContext)
  const navigate  = useNavigate()
  const location  = useLocation()

  /* ── Active nav tab ──────────────────── */
  const getMenuFromPath = (p) => {
    if (p === '/about')   return 'about'
    if (p === '/contact') return 'contact us'
    if (p === '/')        return 'home'
    return ''
  }
  const [menu, setMenu] = useState(getMenuFromPath(location.pathname))
  useEffect(() => setMenu(getMenuFromPath(location.pathname)), [location.pathname])

  /* ── Search state ────────────────────── */
  const [searchQuery,    setSearchQuery]    = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const searchContainerRef = useRef(null)
  const searchInputRef     = useRef(null)
  const mobileInputRef     = useRef(null)

  /* ── Close dropdown on outside click / Esc ── */
  useEffect(() => {
    const onOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false)
        setMobileSearchOpen(false)
        setSearchQuery('')
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onOutside)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  /* ── Mobile search auto-focus ── */
  useEffect(() => {
    if (mobileSearchOpen) setTimeout(() => mobileInputRef.current?.focus(), 60)
    else { setSearchQuery(''); setIsDropdownOpen(false) }
  }, [mobileSearchOpen])

  /* ── Lock scroll when mobile menu open ── */
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  const handleMenuClick = () => {
    setMenu('menu')
    setMobileMenuOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => document.getElementById('explore-menu')?.scrollIntoView({ behavior: 'smooth' }), 100)
    } else {
      document.getElementById('explore-menu')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken('')
    navigate('/')
  }

  /* ── Live search filter ── */
  const q = searchQuery.trim().toLowerCase()
  const matchedItems = q
    ? (food_list || []).filter(item =>
        item.name?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      )
    : []

  const handleQueryChange = (val) => {
    setSearchQuery(val)
    setIsDropdownOpen(true)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setIsDropdownOpen(false)
    searchInputRef.current?.focus()
  }

  const handleItemClick = () => {
    setIsDropdownOpen(false)
    setMobileSearchOpen(false)
    setSearchQuery('')
    setMobileMenuOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => document.getElementById('food-display')?.scrollIntoView({ behavior: 'smooth' }), 150)
    } else {
      document.getElementById('food-display')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  /* ── Highlight matching text ── */
  const highlight = (text, query) => {
    if (!text || !query) return text || ''
    const str     = text.toString()
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const parts   = str.split(new RegExp(`(${escaped})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} className="srch-highlight">{part}</mark>
        : part
    )
  }

  /* ── Cart total items count ── */
  const cartCount = Object.values(cartItems).reduce((sum, qty) => sum + (qty > 0 ? qty : 0), 0)

  /* ── Search dropdown (shared desktop + mobile) ── */
  const renderDropdown = () => (
    <div className="srch-dropdown fade-in">
      <div className="srch-dropdown-header">
        <span className="srch-dropdown-count">
          {q ? `Matching Records (${matchedItems.length})` : 'Start typing to search…'}
        </span>
        <span className="srch-dropdown-hint">Press Esc to close</span>
      </div>

      <div className="srch-dropdown-body">
        {!q ? (
          <div className="srch-popular">
            <p className="srch-popular-label">Popular</p>
            <div className="srch-popular-tags">
              {['Salad', 'Rolls', 'Desserts', 'Sandwich', 'Cake', 'Pasta', 'Noodles'].map(tag => (
                <button key={tag} className="srch-tag" onClick={() => handleQueryChange(tag)}>{tag}</button>
              ))}
            </div>
          </div>
        ) : matchedItems.length === 0 ? (
          <div className="srch-no-results">
            <UtensilsCrossed size={36} color="#cbd5e1" />
            <p>No matching food items found for <strong>"{searchQuery}"</strong></p>
          </div>
        ) : (
          <div className="srch-results">
            {matchedItems.map(item => (
              <div key={item._id} className="srch-item" onClick={handleItemClick}>
                <img
                  src={item.image?.startsWith('http') ? item.image : `${url}/images/${item.image}`}
                  alt={item.name}
                  className="srch-item-thumb"
                  onError={e => { e.target.src = assets.header_img }}
                />
                <div className="srch-item-info">
                  <div className="srch-item-top">
                    <span className="srch-item-name">{highlight(item.name, searchQuery)}</span>
                    <span className="srch-item-badge">{item.category}</span>
                  </div>
                  {item.description && (
                    <p className="srch-item-desc">{highlight(item.description, searchQuery)}</p>
                  )}
                  <span className="srch-item-price">₹{item.price}</span>
                </div>
                <div className="srch-item-action" onClick={e => e.stopPropagation()}>
                  {!cartItems[item._id] ? (
                    <button className="srch-add-btn" onClick={() => addToCart(item._id)}>
                      <Plus size={13} /> Add
                    </button>
                  ) : (
                    <div className="srch-counter">
                      <button onClick={() => removeFromCart(item._id)}><Minus size={13} /></button>
                      <span>{cartItems[item._id]}</span>
                      <button onClick={() => addToCart(item._id)}><Plus size={13} /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* ══════════════════════════════════
           MAIN NAVBAR
      ══════════════════════════════════ */}
      <header className="navbar">
        <div className="navbar-inner">

          {/* ── Logo ── */}
          <Link to="/" onClick={() => setMenu('home')} className="navbar-logo-link">
            <img src={assets.logo} alt="Tomato" className="navbar-logo" />
          </Link>

          {/* ── Desktop Nav Links ── */}
          <nav className="navbar-links">
            <Link   to="/"        onClick={() => setMenu('home')}       className={`nav-link ${menu === 'home'       ? 'nav-link-active' : ''}`}>home</Link>
            <a      href="#explore-menu" onClick={handleMenuClick}       className={`nav-link ${menu === 'menu'       ? 'nav-link-active' : ''}`}>menu</a>
            <Link   to="/about"   onClick={() => setMenu('about')}      className={`nav-link ${menu === 'about'      ? 'nav-link-active' : ''}`}>about us</Link>
            <Link   to="/contact" onClick={() => setMenu('contact us')} className={`nav-link ${menu === 'contact us' ? 'nav-link-active' : ''}`}>contact us</Link>
          </nav>

          {/* ── Desktop Inline Search ── */}
          <div className="navbar-search-wrap" ref={searchContainerRef}>
            <div className={`navbar-search-bar ${isDropdownOpen ? 'search-bar-active' : ''}`}>
              <Search size={15} className="srch-bar-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="navbar-search-input"
                placeholder="Search food, categories…"
                value={searchQuery}
                onChange={e => handleQueryChange(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                autoComplete="off"
              />
              {searchQuery && (
                <button className="srch-clear-btn" onClick={clearSearch} title="Clear"><X size={13} /></button>
              )}
            </div>
            {isDropdownOpen && renderDropdown()}
          </div>

          {/* ── Right Actions ── */}
          <div className="navbar-actions">

            {/* Mobile search toggle */}
            <button
              className="icon-btn mobile-srch-toggle"
              onClick={() => setMobileSearchOpen(v => !v)}
              title="Search"
            >
              <Search size={20} />
            </button>

            {/* Cart */}
            <Link to="/cart" className="icon-btn cart-icon-wrap" title="Cart">
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount > 9 ? '9+' : cartCount}</span>
              )}
            </Link>

            {/* Sign in / Profile */}
            {!token ? (
              <button className="signin-btn" onClick={() => setShowLogin(true)}>Sign In</button>
            ) : (
              <div className="navbar-profile">
                <button className="icon-btn profile-trigger" title="Account">
                  <User size={22} />
                </button>
                <div className="profile-dropdown">
                  <div className="profile-dropdown-inner">
                    <button className="dropdown-item" onClick={() => navigate('/myorders')}>
                      <Package size={16} /> My Orders
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item dropdown-item-danger" onClick={logout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="icon-btn hamburger-btn"
              onClick={() => setMobileMenuOpen(v => !v)}
              title="Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════
           MOBILE SEARCH BAR (below navbar)
      ══════════════════════════════════ */}
      {mobileSearchOpen && (
        <div className="mobile-search-bar-wrap">
          <div className="mobile-search-inner">
            <Search size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
            <input
              ref={mobileInputRef}
              type="text"
              className="mobile-search-input"
              placeholder="Search food items, categories…"
              value={searchQuery}
              onChange={e => handleQueryChange(e.target.value)}
              autoComplete="off"
            />
            {searchQuery && (
              <button className="srch-clear-btn" onClick={() => { setSearchQuery(''); setIsDropdownOpen(false) }}>
                <X size={13} />
              </button>
            )}
          </div>
          {isDropdownOpen && renderDropdown()}
        </div>
      )}

      {/* ══════════════════════════════════
           MOBILE DRAWER MENU
      ══════════════════════════════════ */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
          <nav className="mobile-drawer fade-in">
            <Link   to="/"        onClick={() => { setMenu('home');       setMobileMenuOpen(false) }} className={`mobile-nav-link ${menu === 'home'       ? 'mobile-nav-active' : ''}`}>home</Link>
            <a      href="#explore-menu" onClick={handleMenuClick}                                     className={`mobile-nav-link ${menu === 'menu'       ? 'mobile-nav-active' : ''}`}>menu</a>
            <Link   to="/about"   onClick={() => { setMenu('about');      setMobileMenuOpen(false) }} className={`mobile-nav-link ${menu === 'about'      ? 'mobile-nav-active' : ''}`}>about us</Link>
            <Link   to="/contact" onClick={() => { setMenu('contact us'); setMobileMenuOpen(false) }} className={`mobile-nav-link ${menu === 'contact us' ? 'mobile-nav-active' : ''}`}>contact us</Link>
          </nav>
        </>
      )}
    </>
  )
}

export default Navbar