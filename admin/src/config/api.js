import axios from 'axios';

export const API_URL = "http://localhost:4000";

export const sampleDashboardData = {
  totalUsers: 1240,
  totalProducts: 32,
  totalCategories: 8,
  totalOrders: 485,
  totalRevenue: 28450,
  statusBreakdown: {
    Delivered: 320,
    Preparing: 65,
    "Out for Delivery": 45,
    Cancelled: 15,
    Pending: 40
  },
  recentOrders: [
    { _id: 'ORD-9821', customer: 'John Doe', items: [{ name: 'Salad' }, { name: 'Rolls' }], amount: 45, payment: true, status: 'Food Processing', date: new Date().toISOString() },
    { _id: 'ORD-9822', customer: 'Emma Watson', items: [{ name: 'Pizza' }], amount: 32, payment: true, status: 'Out for Delivery', date: new Date().toISOString() },
    { _id: 'ORD-9823', customer: 'Michael Brown', items: [{ name: 'Burger' }], amount: 28, payment: false, status: 'Delivered', date: new Date().toISOString() },
    { _id: 'ORD-9824', customer: 'Sophia Davis', items: [{ name: 'Pasta' }, { name: 'Garlic Bread' }], amount: 54, payment: true, status: 'Delivered', date: new Date().toISOString() },
    { _id: 'ORD-9825', customer: 'Alex Johnson', items: [{ name: 'Noodles' }], amount: 22, payment: false, status: 'Cancelled', date: new Date().toISOString() }
  ]
};

export const sampleUsers = [
  { _id: 'u1', name: 'Alex Johnson', email: 'alex@example.com', phone: '+91 98765 43210', createdAt: '2026-08-10', status: 'Active' },
  { _id: 'u2', name: 'Emma Watson', email: 'emma@example.com', phone: '+91 98765 43211', createdAt: '2026-08-12', status: 'Active' },
  { _id: 'u3', name: 'Michael Brown', email: 'michael@example.com', phone: '+91 98765 43212', createdAt: '2026-08-15', status: 'Inactive' },
  { _id: 'u4', name: 'Sophia Davis', email: 'sophia@example.com', phone: '+91 98765 43213', createdAt: '2026-08-18', status: 'Active' },
  { _id: 'u5', name: 'David Miller', email: 'david@example.com', phone: '+91 98765 43214', createdAt: '2026-08-20', status: 'Active' }
];

export const sampleProducts = [
  { _id: 'p1', name: 'Greek Salad', category: 'Salad', price: 120, discount: 10, availability: true, status: 'Active', description: 'Fresh crisp vegetables with feta cheese', image: 'food_1.png' },
  { _id: 'p2', name: 'Veg Salad', category: 'Salad', price: 180, discount: 0, availability: true, status: 'Active', description: 'Healthy garden vegetable salad', image: 'food_2.png' },
  { _id: 'p3', name: 'Clover Salad', category: 'Salad', price: 160, discount: 5, availability: true, status: 'Active', description: 'Fresh green leaf clover salad', image: 'food_3.png' },
  { _id: 'p4', name: 'Chicken Salad', category: 'Salad', price: 240, discount: 15, availability: false, status: 'Inactive', description: 'Grilled chicken breast salad', image: 'food_4.png' },
  { _id: 'p5', name: 'Lasagna Rolls', category: 'Rolls', price: 140, discount: 0, availability: true, status: 'Active', description: 'Baked pasta rolls with rich mozzarella', image: 'food_5.png' }
];

export const sampleCategories = [
  { _id: 'c1', name: 'Salad', productCount: 4, status: 'Active', image: 'menu_1.png' },
  { _id: 'c2', name: 'Rolls', productCount: 4, status: 'Active', image: 'menu_2.png' },
  { _id: 'c3', name: 'Deserts', productCount: 4, status: 'Active', image: 'menu_3.png' },
  { _id: 'c4', name: 'Sandwich', productCount: 4, status: 'Active', image: 'menu_4.png' },
  { _id: 'c5', name: 'Cake', productCount: 4, status: 'Active', image: 'menu_5.png' },
  { _id: 'c6', name: 'Pure Veg', productCount: 4, status: 'Active', image: 'menu_6.png' },
  { _id: 'c7', name: 'Pasta', productCount: 4, status: 'Active', image: 'menu_7.png' },
  { _id: 'c8', name: 'Noodles', productCount: 4, status: 'Active', image: 'menu_8.png' }
];

export const sampleOrders = [
  { _id: '64d2a1b9', userId: 'u1', address: { firstName: 'Alex', lastName: 'Johnson', street: '123 Main St', city: 'Mumbai' }, items: [{ name: 'Greek Salad', quantity: 2, price: 120 }, { name: 'Lasagna Rolls', quantity: 1, price: 140 }], amount: 380, payment: true, status: 'Food Processing', date: new Date().toISOString() },
  { _id: '64d2a1c0', userId: 'u2', address: { firstName: 'Emma', lastName: 'Watson', street: '456 Park Ave', city: 'Delhi' }, items: [{ name: 'Veg Salad', quantity: 1, price: 180 }], amount: 180, payment: true, status: 'Out for Delivery', date: new Date().toISOString() },
  { _id: '64d2a1c1', userId: 'u3', address: { firstName: 'Michael', lastName: 'Brown', street: '789 Elm St', city: 'Bangalore' }, items: [{ name: 'Clover Salad', quantity: 2, price: 160 }], amount: 320, payment: false, status: 'Delivered', date: new Date().toISOString() }
];

export const samplePayments = [
  { _id: 'PAY-1001', orderId: '64d2a1b9', customer: 'Alex Johnson', amount: 380, method: 'UPI', status: 'Paid', date: '2026-08-25' },
  { _id: 'PAY-1002', orderId: '64d2a1c0', customer: 'Emma Watson', amount: 180, method: 'Card', status: 'Paid', date: '2026-08-25' },
  { _id: 'PAY-1003', orderId: '64d2a1c1', customer: 'Michael Brown', amount: 320, method: 'UPI', status: 'Paid', date: '2026-08-24' },
  { _id: 'PAY-1004', orderId: '64d2a1c2', customer: 'Sophia Davis', amount: 540, method: 'Online Payment', status: 'Refunded', date: '2026-08-23' }
];

export const sampleOffers = [
  { _id: 'off1', code: 'FOOD20', discount: 20, minAmount: 300, expiryDate: '2026-12-31', status: 'Active' },
  { _id: 'off2', code: 'FREESHIP', discount: 15, minAmount: 500, expiryDate: '2026-09-30', status: 'Active' },
  { _id: 'off3', code: 'WELCOME50', discount: 50, minAmount: 1000, expiryDate: '2026-08-31', status: 'Expired' }
];

export const sampleNotifications = [
  { _id: 'n1', title: 'New Order Received', message: 'Order #ORD-9821 placed by John Doe for ₹450', type: 'order', read: false, createdAt: new Date().toISOString() },
  { _id: 'n2', title: 'Payment Confirmed', message: 'Payment of ₹320 received via UPI for #ORD-9822', type: 'payment', read: false, createdAt: new Date().toISOString() },
  { _id: 'n3', title: 'New User Registered', message: 'Sophia Davis registered an account', type: 'user', read: true, createdAt: new Date().toISOString() }
];

export const sampleContacts = [
  { _id: 'cnt-101', name: 'John Doe', email: 'john@example.com', phone: '9876543210', subject: 'Order Issue', message: 'I have a problem with my recent order. It took longer than expected to arrive.', status: 'New', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: 'cnt-102', name: 'Emma Watson', email: 'emma@example.com', phone: '9823456789', subject: 'Catering Request', message: 'Hi, I would like to inquire about corporate lunch orders for 50 people next week.', status: 'Read', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: 'cnt-103', name: 'Michael Brown', email: 'michael@example.com', phone: '9123456789', subject: 'Payment Confirmation', message: 'My payment went through twice for order #ORD-9823. Please verify.', status: 'Resolved', createdAt: new Date(Date.now() - 172800000).toISOString() }
];
