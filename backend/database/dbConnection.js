import mongoose from "mongoose";

export const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "hospital",
    });
    console.log("Connected to database!");
  } catch (err) {
    console.log("Some error occured while connecting to database:", err);
    throw err;
  }
};
