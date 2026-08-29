import orderModel from "../models/orderModel.js";
import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";

// Helper: Convert array of objects to CSV string
const convertToCSV = (headers, rows) => {
    const headerLine = headers.map(h => `"${h.label}"`).join(',');
    const dataLines = rows.map(row => {
        return headers.map(h => {
            let val = row[h.key];
            if (val === null || val === undefined) val = '';
            // Escape double quotes
            val = val.toString().replace(/"/g, '""');
            return `"${val}"`;
        }).join(',');
    });
    return [headerLine, ...dataLines].join('\r\n');
};

// ─────────────────────────────────────────
// GET /api/reports/sales
// ─────────────────────────────────────────
export const getSalesReport = async (req, res) => {
    try {
        const { startDate, endDate, status, paymentMethod } = req.query;
        const query = { isDeleted: { $ne: true } };

        if (status && status !== 'All') {
            query.status = status;
        }

        if (paymentMethod && paymentMethod !== 'All') {
            query.paymentMethod = paymentMethod;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                query.date.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.date.$lte = end;
            }
        }

        const orders = await orderModel.find(query).sort({ date: -1 });

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
        const paidOrdersCount = orders.filter(o => o.payment === true || o.paymentStatus === 'Paid').length;
        const deliveredOrdersCount = orders.filter(o => o.status === 'Delivered').length;
        const cancelledOrdersCount = orders.filter(o => o.status === 'Cancelled').length;
        const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

        // Payment Method breakdown
        const paymentMethods = {};
        // Status breakdown
        const statusBreakdown = {};
        // Top selling products count
        const productSalesMap = {};

        orders.forEach(order => {
            const method = order.paymentMethod || 'UPI';
            paymentMethods[method] = (paymentMethods[method] || 0) + (order.amount || 0);

            const st = order.status || 'Confirmed';
            statusBreakdown[st] = (statusBreakdown[st] || 0) + 1;

            if (Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const itemName = item.name || 'Food Item';
                    const qty = item.quantity || 1;
                    const revenue = (item.price || 0) * qty;
                    if (!productSalesMap[itemName]) {
                        productSalesMap[itemName] = { name: itemName, quantity: 0, revenue: 0 };
                    }
                    productSalesMap[itemName].quantity += qty;
                    productSalesMap[itemName].revenue += revenue;
                });
            }
        });

        const topProducts = Object.values(productSalesMap)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 8);

        res.json({
            success: true,
            data: {
                totalOrders,
                totalRevenue,
                paidOrdersCount,
                deliveredOrdersCount,
                cancelledOrdersCount,
                avgOrderValue,
                paymentMethods,
                statusBreakdown,
                topProducts,
                ordersCount: totalOrders
            }
        });
    } catch (error) {
        console.error("getSalesReport error:", error);
        res.status(500).json({ success: false, message: "Error generating sales report." });
    }
};

// ─────────────────────────────────────────
// GET /api/reports/orders/export
// ─────────────────────────────────────────
export const exportOrdersCSV = async (req, res) => {
    try {
        const { startDate, endDate, status, paymentMethod } = req.query;
        const query = { isDeleted: { $ne: true } };

        if (status && status !== 'All') {
            query.status = status;
        }

        if (paymentMethod && paymentMethod !== 'All') {
            query.paymentMethod = paymentMethod;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                query.date.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.date.$lte = end;
            }
        }

        const orders = await orderModel.find(query).sort({ date: -1 });

        const headers = [
            { key: 'orderId', label: 'Order ID' },
            { key: 'date', label: 'Date & Time' },
            { key: 'customerName', label: 'Customer Name' },
            { key: 'email', label: 'Customer Email' },
            { key: 'phone', label: 'Customer Phone' },
            { key: 'address', label: 'Delivery Address' },
            { key: 'items', label: 'Items Ordered' },
            { key: 'amount', label: 'Total Amount (₹)' },
            { key: 'paymentMethod', label: 'Payment Method' },
            { key: 'paymentStatus', label: 'Payment Status' },
            { key: 'status', label: 'Order Status' }
        ];

        const rows = orders.map(o => {
            const customerName = o.address ? `${o.address.firstName || ''} ${o.address.lastName || ''}`.trim() : 'Customer';
            const itemsSummary = (o.items || []).map(i => `${i.name} (x${i.quantity || 1})`).join('; ');
            const fullAddress = o.address ? `${o.address.street || ''}, ${o.address.city || ''}, ${o.address.state || ''} ${o.address.pinCode || o.address.zipcode || ''}` : '';

            return {
                orderId: o._id.toString(),
                date: o.date ? new Date(o.date).toLocaleString() : 'N/A',
                customerName: customerName || 'N/A',
                email: o.address?.email || 'N/A',
                phone: o.address?.phone || 'N/A',
                address: fullAddress,
                items: itemsSummary,
                amount: o.amount || 0,
                paymentMethod: o.paymentMethod || 'UPI',
                paymentStatus: o.paymentStatus || (o.payment ? 'Paid' : 'Pending'),
                status: o.status || 'Confirmed'
            };
        });

        const csvData = convertToCSV(headers, rows);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=FoodDel_Orders_Report_${Date.now()}.csv`);
        res.status(200).send(csvData);
    } catch (error) {
        console.error("exportOrdersCSV error:", error);
        res.status(500).json({ success: false, message: "Error exporting orders CSV." });
    }
};

// ─────────────────────────────────────────
// GET /api/reports/products/export
// ─────────────────────────────────────────
export const exportProductsCSV = async (req, res) => {
    try {
        const query = { isDeleted: { $ne: true } };
        if (req.query.category && req.query.category !== 'All') {
            query.category = req.query.category;
        }

        const foods = await foodModel.find(query).sort({ category: 1, name: 1 });

        const headers = [
            { key: 'id', label: 'Product ID' },
            { key: 'name', label: 'Product Name' },
            { key: 'category', label: 'Category' },
            { key: 'price', label: 'Price (₹)' },
            { key: 'discount', label: 'Discount (%)' },
            { key: 'availability', label: 'In Stock' },
            { key: 'status', label: 'Status' },
            { key: 'description', label: 'Description' }
        ];

        const rows = foods.map(f => ({
            id: f._id.toString(),
            name: f.name,
            category: f.category,
            price: f.price,
            discount: f.discount || 0,
            availability: f.availability ? 'Yes' : 'No',
            status: f.status || 'Active',
            description: f.description
        }));

        const csvData = convertToCSV(headers, rows);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=FoodDel_Products_Inventory_${Date.now()}.csv`);
        res.status(200).send(csvData);
    } catch (error) {
        console.error("exportProductsCSV error:", error);
        res.status(500).json({ success: false, message: "Error exporting products CSV." });
    }
};

// ─────────────────────────────────────────
// GET /api/reports/users/export
// ─────────────────────────────────────────
export const exportUsersCSV = async (req, res) => {
    try {
        const query = { isDeleted: { $ne: true } };
        const users = await userModel.find(query).select("-password").sort({ createdAt: -1 });

        const headers = [
            { key: 'id', label: 'User ID' },
            { key: 'name', label: 'Full Name' },
            { key: 'email', label: 'Email Address' },
            { key: 'phone', label: 'Phone Number' },
            { key: 'status', label: 'Account Status' },
            { key: 'role', label: 'Role' },
            { key: 'createdAt', label: 'Registered Date' }
        ];

        const rows = users.map(u => ({
            id: u._id.toString(),
            name: u.name,
            email: u.email,
            phone: u.phone || 'N/A',
            status: u.status || 'Active',
            role: u.role || 'user',
            createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'
        }));

        const csvData = convertToCSV(headers, rows);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=FoodDel_Customer_Accounts_${Date.now()}.csv`);
        res.status(200).send(csvData);
    } catch (error) {
        console.error("exportUsersCSV error:", error);
        res.status(500).json({ success: false, message: "Error exporting users CSV." });
    }
};
