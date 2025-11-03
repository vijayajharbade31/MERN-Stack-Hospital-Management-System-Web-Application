import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../utils/api";
import { toast } from "react-toastify";

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/user/doctor/${id}`);
        setDoctor(data.doctor);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load doctor");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <section className="page">
        <p>Loading...</p>
      </section>
    );
  }

  if (!doctor) {
    return (
      <section className="page">
        <p>Doctor not found</p>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <img src={doctor.docAvatar?.url} alt="doctor avatar" />
        <h4>{`${doctor.firstName} ${doctor.lastName}`}</h4>
        <div className="details">
          <p> Email: <span>{doctor.email}</span></p>
          <p> Phone: <span>{doctor.phone}</span></p>
          <p> DOB: <span>{String(doctor.dob).substring(0,10)}</span></p>
          <p> Department: <span>{doctor.doctorDepartment}</span></p>
          <p> Gender: <span>{doctor.gender}</span></p>
        </div>
        <div className="card-actions">
          <button className="action-btn edit-btn" onClick={() => navigate(`/doctor/${doctor._id}/edit`)}>Edit</button>
          <button className="action-btn view-btn" onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    </section>
  );
};

export default DoctorDetails;


