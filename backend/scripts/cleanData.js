import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import Models
import orderModel from '../models/orderModel.js';
import contactModel from '../models/contactModel.js';
import notificationModel from '../models/notificationModel.js';
import foodModel from '../models/foodModel.js';
import categoryModel from '../models/categoryModel.js';
import userModel from '../models/userModel.js';
import adminModel from '../models/adminModel.js';
import offerModel from '../models/offerModel.js';

const MONGODB_URI = process.env.MONGO_URL || process.env.MONOG_URL || "mongodb+srv://patelharsh2953_db_user:9h5H2Rsbpoul5xPN@cluster0.mektegj.mongodb.net/?appName=Cluster0";
const DB_NAME = process.env.DB_NAME || "food_del";

const cleanDatabase = async () => {
    try {
        console.log('\n======================================================');
        console.log('   🧹 FOODDEL DATABASE DATA CLEANING SEEDER 🧹');
        console.log('======================================================\n');
        
        console.log(`Connecting to MongoDB (Database: ${DB_NAME})...`);
        await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
        console.log('Connected to Database successfully!\n');

        // 1. Check current counts before deletion
        const orderCountBefore = await orderModel.countDocuments();
        const contactCountBefore = await contactModel.countDocuments();
        const notifCountBefore = await notificationModel.countDocuments();

        const foodCount = await foodModel.countDocuments();
        const catCount = await categoryModel.countDocuments();
        const userCount = await userModel.countDocuments();
        const adminCount = await adminModel.countDocuments();
        const offerCount = await offerModel.countDocuments();

        console.log('📊 CURRENT DATABASE SNAPSHOT:');
        console.log('------------------------------------------------------');
        console.log(`  🗑️  Orders & Transactions : ${orderCountBefore}`);
        console.log(`  🗑️  Contact Messages      : ${contactCountBefore}`);
        console.log(`  🗑️  Notifications         : ${notifCountBefore}`);
        console.log('------------------------------------------------------');
        console.log('  🔒 PRESERVED MASTER DATA (WILL NOT BE DELETED):');
        console.log(`  ✅ Food Products          : ${foodCount}`);
        console.log(`  ✅ Food Categories        : ${catCount}`);
        console.log(`  ✅ Registered Users       : ${userCount}`);
        console.log(`  ✅ Admin Accounts         : ${adminCount}`);
        console.log(`  ✅ Promo Offers & Coupons : ${offerCount}`);
        console.log('------------------------------------------------------\n');

        console.log('Cleaning transactional and inquiry records...');

        // 2. Perform Deletions (Orders, Contacts, Notifications)
        const orderResult = await orderModel.deleteMany({});
        const contactResult = await contactModel.deleteMany({});
        const notifResult = await notificationModel.deleteMany({});

        // 3. Reset user carts so no orphaned deleted items linger
        await userModel.updateMany({}, { $set: { cartData: {} } });

        console.log('\n✨ DATA CLEANING SUMMARY:');
        console.log('======================================================');
        console.log(`  ✅ Deleted Orders & Payments : ${orderResult.deletedCount || 0} removed`);
        console.log(`  ✅ Deleted Contacts Messages : ${contactResult.deletedCount || 0} removed`);
        console.log(`  ✅ Deleted Notifications     : ${notifResult.deletedCount || 0} removed`);
        console.log(`  ✅ User Active Carts Cleaned : Reset to empty`);
        console.log('------------------------------------------------------');
        console.log('  🔒 VERIFYING UNTOUCHED MASTER DATA:');
        console.log(`  ✅ Foods / Products Catalog  : ${await foodModel.countDocuments()} (Safe)`);
        console.log(`  ✅ Categories                : ${await categoryModel.countDocuments()} (Safe)`);
        console.log(`  ✅ Users                     : ${await userModel.countDocuments()} (Safe)`);
        console.log(`  ✅ Admins                    : ${await adminModel.countDocuments()} (Safe)`);
        console.log(`  ✅ Offers & Coupons          : ${await offerModel.countDocuments()} (Safe)`);
        console.log('======================================================\n');
        console.log('🎉 Data cleaning completed successfully! All other data is safe.\n');

    } catch (error) {
        console.error('\n❌ Error executing data cleaning seeder:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB connection closed.\n');
        process.exit(0);
    }
};

// Execute cleaner
cleanDatabase();
