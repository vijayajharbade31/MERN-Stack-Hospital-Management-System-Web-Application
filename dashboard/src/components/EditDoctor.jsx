import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../utils/api";
import { toast } from "react-toastify";

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dob: "",
  gender: "",
  doctorDepartment: "",
};

const EditDoctor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/user/doctor/${id}`);
        const d = data.doctor;
        setForm({
          firstName: d.firstName || "",
          lastName: d.lastName || "",
          email: d.email || "",
          phone: d.phone || "",
          dob: String(d.dob || "").substring(0, 10),
          gender: d.gender || "",
          doctorDepartment: d.doctorDepartment || "",
        });
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load doctor");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (avatar) formData.append("docAvatar", avatar);
      await axios.put(`/user/doctor/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Doctor updated successfully!");
      navigate(`/doctors`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update doctor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      <h1>Edit Doctor</h1>
      <form className="form" onSubmit={onSubmit} style={{ maxWidth: 640 }}>
        <div className="grid">
          <input name="firstName" value={form.firstName} onChange={onChange} placeholder="First Name" required />
          <input name="lastName" value={form.lastName} onChange={onChange} placeholder="Last Name" required />
          <input type="email" name="email" value={form.email} onChange={onChange} placeholder="Email" required />
          <input name="phone" value={form.phone} onChange={onChange} placeholder="Phone" required />
          <input type="date" name="dob" value={form.dob} onChange={onChange} required />
          <select name="gender" value={form.gender} onChange={onChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input name="doctorDepartment" value={form.doctorDepartment} onChange={onChange} placeholder="Department" required />
          <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files?.[0] || null)} />
        </div>
        <div className="card-actions" style={{ marginTop: 16 }}>
          <button className="action-btn edit-btn" type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</button>
          <button className="action-btn view-btn" type="button" onClick={() => navigate(-1)} disabled={loading}>Cancel</button>
        </div>
      </form>
    </section>
  );
};

export default EditDoctor;


