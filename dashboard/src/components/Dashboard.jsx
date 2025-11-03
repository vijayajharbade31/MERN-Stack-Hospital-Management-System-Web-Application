import { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "../utils/api";
import { toast } from "react-toastify";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctorCount, setDoctorCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get(`/appointment/getall`);
        setAppointments(data.appointments || []);
      } catch (error) {
        const msg =
          error?.response?.data?.message || error?.message || "Failed to fetch appointments";
        toast.error(msg);
        setAppointments([]);
      }
    };
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(`/user/doctors`);
        setDoctorCount(data.doctors ? data.doctors.length : 0);
      } catch (error) {
        toast.error(error?.response?.data?.message || error?.message || "Failed to fetch doctors");
        setDoctorCount(0);
      }
    };
    fetchAppointments();
    fetchDoctors();
  }, []);

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const { data } = await axios.put(`/appointment/update/${appointmentId}`, { status });
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status }
            : appointment
        )
      );
      toast.success(data.message);
    } catch (error) {
      const msg =
        error?.response?.data?.message || error?.message || "Failed to update status";
      toast.error(msg);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      await axios.delete(`/appointment/delete/${appointmentId}`);
      setAppointments((prevAppointments) =>
        prevAppointments.filter((appointment) => appointment._id !== appointmentId)
      );
      toast.success("Appointment deleted successfully!");
      setDeleteConfirm(null);
    } catch (error) {
      const msg =
        error?.response?.data?.message || error?.message || "Failed to delete appointment";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteAppointment = (appointment) => {
    setDeleteConfirm({
      id: appointment._id,
      patientName: appointment.patientName || 'Unknown Patient',
      doctorName: appointment.doctorName || 'Unknown Doctor',
      date: appointment.appointment_date
    });
  };

  const { isAuthenticated, admin } = useContext(Context);
  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <>
      <section className="dashboard page">
        <div className="banner">
          <div className="firstBox">
            <img src="/doc.png" alt="docImg" />
            <div className="content">
              <div>
                <p>Hello ,</p>
                <h5>
                  {admin &&
                    `${admin.firstName} ${admin.lastName}`}{" "}
                </h5>
              </div>
              <p>
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                Facilis, nam molestias. Eaque molestiae ipsam commodi neque.
                Assumenda repellendus necessitatibus itaque.
              </p>
            </div>
          </div>
          <div className="secondBox">
            <p>Total Appointments</p>
            <h3>{appointments.length}</h3>
          </div>
          <div className="thirdBox">
            <p>Registered Doctors</p>
            <h3>{doctorCount}</h3>
          </div>
        </div>
        <div className="banner">
          <h5>Appointments</h5>
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Time</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Status</th>
                <th>Visited</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments && appointments.length > 0
                ? appointments
                    .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
                    .map((appointment) => (
                    <tr key={appointment._id}>
                      <td>{appointment.patientName || 'Unknown Patient'}</td>
                      <td>
                        {appointment.appointment_date
                          ? new Date(appointment.appointment_date).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : "-"}
                      </td>
                      <td>
                        {appointment.appointment_date
                          ? new Date(appointment.appointment_date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : "-"}
                      </td>
                      <td>{appointment.doctorName || 'Unknown Doctor'}</td>
                      <td>{appointment.department || 'Unknown Department'}</td>
                      <td>
                        <select
                          className={
                            appointment.status === "Pending"
                              ? "value-pending"
                              : appointment.status === "Accepted"
                              ? "value-accepted"
                              : "value-rejected"
                          }
                          value={appointment.status}
                          onChange={(e) =>
                            handleUpdateStatus(appointment._id, e.target.value)
                          }
                        >
                          <option value="Pending" className="value-pending">
                            Pending
                          </option>
                          <option value="Accepted" className="value-accepted">
                            Accepted
                          </option>
                          <option value="Rejected" className="value-rejected">
                            Rejected
                          </option>
                        </select>
                      </td>
                      <td>{appointment.hasVisited === true ? <GoCheckCircleFill className="green"/> : <AiFillCloseCircle className="red"/>}</td>
                      <td>
                        <button 
                          className="delete-appointment-btn"
                          onClick={() => confirmDeleteAppointment(appointment)}
                          title="Delete Appointment"
                          disabled={loading}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '1rem' }}>
                        No Appointments Found!
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>

          {}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete this appointment?</p>
              <div className="appointment-details">
                <p><strong>Patient:</strong> {deleteConfirm.patientName}</p>
                <p><strong>Doctor:</strong> {deleteConfirm.doctorName}</p>
                <p><strong>Date:</strong> {new Date(deleteConfirm.date).toLocaleString()}</p>
              </div>
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
                  onClick={() => handleDeleteAppointment(deleteConfirm.id)}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default Dashboard;
