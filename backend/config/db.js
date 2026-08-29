import mongoose from "mongoose";

export const connectDB = async () => {
    // await mongoose.connect(process.env.MONOG_URL).then(() => console.log("DB Connected"));
    await mongoose.connect("mongodb+srv://patelharsh2953_db_user:9h5H2Rsbpoul5xPN@cluster0.mektegj.mongodb.net/food_del?appName=Cluster0").then(() => console.log("DB Connected"));
}


