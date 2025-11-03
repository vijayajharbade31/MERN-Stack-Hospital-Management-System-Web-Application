import axios from "../utils/api";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate, useNavigate } from "react-router-dom";
import { FaTrash, FaEdit, FaEye } from "react-icons/fa";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { isAuthenticated } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/user/doctors");
      setDoctors(data.doctors || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    try {
      setLoading(true);
      await axios.delete(`/user/doctor/${doctorId}`);
      toast.success("Doctor deleted successfully!");
      fetchDoctors(); // Refresh the list
      setDeleteConfirm(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete doctor");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (doctor) => {
    setDeleteConfirm({
      id: doctor._id,
      name: `${doctor.firstName} ${doctor.lastName}`
    });
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }
  return (
    <section className="page doctors">
      <h1>DOCTORS</h1>
      <div className="banner">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading doctors...</p>
          </div>
        ) : doctors && doctors.length > 0 ? (
          doctors.map((element) => {
              return (
              <div className="card" key={element._id}>
                <img
                  src={element.docAvatar && element.docAvatar.url}
                  alt="doctor avatar"
                />
                <h4>{`${element.firstName} ${element.lastName}`}</h4>
                <div className="details">
                  <p>
                    Email: <span>{element.email}</span>
                  </p>
                  <p>
                    Phone: <span>{element.phone}</span>
                  </p>
                  <p>
                    DOB: <span>{element.dob.substring(0, 10)}</span>
                  </p>
                  <p>
                    Department: <span>{element.doctorDepartment}</span>
                  </p>
                  <p>
                    Gender: <span>{element.gender}</span>
                  </p>
                </div>
                <div className="card-actions">
                  <button 
                    className="action-btn view-btn"
                    title="View Details"
                    onClick={() => navigate(`/doctor/${element._id}`)}
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="action-btn edit-btn"
                    title="Edit Doctor"
                    onClick={() => navigate(`/doctor/${element._id}/edit`)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => confirmDelete(element)}
                    title="Delete Doctor"
                    disabled={loading}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <h1>No Registered Doctors Found!</h1>
            <p>Add some doctors to get started.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?</p>
            <p className="warning">This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => setDeleteConfirm(null)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="btn-delete"
                onClick={() => handleDeleteDoctor(deleteConfirm.id)}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Doctors;
