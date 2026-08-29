import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL || process.env.MONOG_URL;
        const dbName = process.env.DB_NAME || "food_del";

        await mongoose.connect(mongoUrl, {
            dbName: dbName,
        });

        console.log(`DB Connected Successfully (${dbName})`);
    } catch (error) {
        console.error("DB Connection Failed:", error.message);
        process.exit(1);
    }
};


