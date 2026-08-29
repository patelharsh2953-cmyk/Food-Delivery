import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Users from './pages/Users/Users';
import Products from './pages/Products/Products';
import Categories from './pages/Categories/Categories';
import Orders from './pages/Orders/Orders';
import Payments from './pages/Payments/Payments';
import Offers from './pages/Offers/Offers';
import Contacts from './pages/Contacts/Contacts';
import Reports from './pages/Reports/Reports';
import AdminLogin from './pages/AdminLogin/AdminLogin';
import AdminProtectedRoute from './components/AdminProtectedRoute/AdminProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />

      <Routes>
        {/* ── Public route: Admin Login / Register ── */}
        <Route path="/login" element={<AdminLogin />} />

        {/* ── Protected Admin Panel routes ── */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"    element={<Dashboard />} />
            <Route path="users"        element={<Users />} />
            <Route path="products"     element={<Products />} />
            <Route path="categories"   element={<Categories />} />
            <Route path="orders"       element={<Orders />} />
            <Route path="payments"     element={<Payments />} />
            <Route path="offers"       element={<Offers />} />
            <Route path="contacts"     element={<Contacts />} />
            <Route path="reports"      element={<Reports />} />
            {/* Legacy redirects */}
            <Route path="add"          element={<Navigate to="/products" replace />} />
            <Route path="list"         element={<Navigate to="/products" replace />} />
            <Route path="delivery"     element={<Navigate to="/dashboard" replace />} />
            <Route path="notifications" element={<Navigate to="/dashboard" replace />} />
            <Route path="*"            element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* Catch-all: redirect to login if nothing matches */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

export default App;