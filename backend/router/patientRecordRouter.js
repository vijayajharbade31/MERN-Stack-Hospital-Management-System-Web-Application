import express from "express";
import { createOrUpdateRecord, addVisit, getRecord } from "../controller/patientRecordController.js";
const router = express.Router();

router.route("/").post(createOrUpdateRecord);
router.route("/:patientId").get(getRecord).post(addVisit);

export default router;
