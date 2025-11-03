import { useState } from "react";
import axios from "../utils/api";
import { toast } from "react-toastify";

const DoctorForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [doctorDepartment, setDoctorDepartment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/user/doctor/addnew", {
        firstName,
        lastName,
        email,
        phone,
        dob,
        gender,
        password,
        doctorDepartment,
      });
      toast.success(res.data.message);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setDob("");
      setGender("");
      setPassword("");
      setDoctorDepartment("");
    } catch (err) {
      toast.error(err?.message || "Failed to register doctor");
    }
  };

  return (
    <div className="page container">
      <h3>Register a New Doctor</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
        <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="text" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
        <input type="date" placeholder="DOB" value={dob} onChange={e => setDob(e.target.value)} />
        <select value={gender} onChange={e => setGender(e.target.value)}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <input type="text" placeholder="Department" value={doctorDepartment} onChange={e => setDoctorDepartment(e.target.value)} />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default DoctorForm;
