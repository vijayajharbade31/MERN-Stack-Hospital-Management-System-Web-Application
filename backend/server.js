import app from "./app.js";
import cloudinary from "cloudinary";
import { dbConnection } from "./database/dbConnection.js";
import { logExpiring } from "./utils/expiryChecker.js";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT || 5000;
if (!process.env.MONGO_URI) {
  console.warn("Warning: MONGO_URI not set. Check backend/config.env or environment variables.");
}

// Connect to DB, run checks, then start server
(async () => {
  try {
    await dbConnection();
    await logExpiring();
    app.listen(PORT, () => console.log(`Server listening at port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();
