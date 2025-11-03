import { useEffect, useState } from "react";
import axios from "../utils/api";
import { toast } from "react-toastify";

const Reports = () => {
  const [patientsDaily, setPatientsDaily] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const p = await axios.get("/reports/patients/daily");
        setPatientsDaily(p.data);
        const r = await axios.get("/reports/revenue/trend");
        setRevenueTrend(r.data);
      } catch (err) {
        toast.error(err?.message || "Failed to load reports");
      }
    };
    fetch();
  }, []);

  return (
    <div className="page container">
      <h3>Reports</h3>
      <div>
        <h4>Patients (daily)</h4>
        <pre>{JSON.stringify(patientsDaily, null, 2)}</pre>
      </div>
      <div>
        <h4>Revenue Trend</h4>
        <pre>{JSON.stringify(revenueTrend, null, 2)}</pre>
      </div>
    </div>
  );
};

export default Reports;
