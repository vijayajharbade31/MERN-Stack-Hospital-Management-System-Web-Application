import { useEffect, useState } from "react";
import axios from "../utils/api";
import { toast } from "react-toastify";

const PatientList = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await axios.get("/patient-record/all");
        setPatients(data.patients || []);
      } catch (err) {
        toast.error(err?.message || "Failed to load patients");
      }
    };
    fetchPatients();
  }, []);

  return (
    <div className="page container">
      <h3>Patients</h3>
      {patients.length === 0 ? (
        <p>No patients found</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>DOB</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p._id}>
                <td>{`${p.firstName} ${p.lastName}`}</td>
                <td>{p.email}</td>
                <td>{p.phone}</td>
                <td>{p.dob ? new Date(p.dob).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PatientList;
