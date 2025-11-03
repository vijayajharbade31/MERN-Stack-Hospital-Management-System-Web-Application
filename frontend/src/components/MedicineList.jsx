import { useEffect, useState } from "react";
import axios from "../utils/api";
import { toast } from "react-toastify";

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get("/medicine");
        setMedicines(data.medicines || []);
      } catch (err) {
        toast.error(err?.message || "Failed to load medicines");
      }
    };
    fetch();
  }, []);

  return (
    <div className="page container">
      <h3>Medicines</h3>
      {medicines.length === 0 ? (
        <p>No medicines</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Stock</th>
              <th>Expiry</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((m) => (
              <tr key={m._id}>
                <td>{m.name}</td>
                <td>{m.stock}</td>
                <td>{m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MedicineList;
