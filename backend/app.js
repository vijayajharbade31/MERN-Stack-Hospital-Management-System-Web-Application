import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import { errorMiddleware } from "./middlewares/error.js";
import messageRouter from "./router/messageRouter.js";
import userRouter from "./router/userRouter.js";
import appointmentRouter from "./router/appointmentRouter.js";
import patientRecordRouter from "./router/patientRecordRouter.js";
import medicineRouter from "./router/medicineRouter.js";
import invoiceRouter from "./router/invoiceRouter.js";
import reportRouter from "./router/reportRouter.js";
import aiRouter from "./router/aiRouter.js";

const app = express();

config({ path: "./config.env" });

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL_ONE,
      process.env.FRONTEND_URL_TWO,
      process.env.DASHBOARD_URL,
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175"
    ],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/appointment", appointmentRouter);
app.use("/api/v1/patient-record", patientRecordRouter);
app.use("/api/v1/medicine", medicineRouter);
app.use("/api/v1/invoice", invoiceRouter);
app.use('/api/v1/reports', reportRouter);
app.use('/api/v1/ai', aiRouter);

app.get("/", (req, res) => {
  res.send(" Hospital Management System backend is running successfully on Render!");
});

app.use(errorMiddleware);
export default app;
