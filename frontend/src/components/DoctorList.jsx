import { useEffect, useState } from "react";
import axios from "../utils/api";
import { toast } from "react-toastify";

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get("/user/doctors");
        setDoctors(data.doctors || []);
      } catch (err) {
        toast.error(err?.message || "Failed to load doctors");
      }
    };
    fetchDoctors();
  }, []);

  return (
    <div className="page container">
      <h3>Doctors</h3>
      {doctors.length === 0 ? (
        <p>No doctors found</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((d) => (
              <tr key={d._id}>
                <td>{`${d.firstName} ${d.lastName}`}</td>
                <td>{d.doctorDepartment || "-"}</td>
                <td>{d.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DoctorList;
