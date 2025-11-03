import { useEffect, useState } from "react";
import axios from "../utils/api";
import { toast } from "react-toastify";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get("/invoice");
        setInvoices(data.invoices || []);
      } catch (err) {
        toast.error(err?.message || "Failed to load invoices");
      }
    };
    fetch();
  }, []);

  return (
    <div className="page container">
      <h3>Invoices</h3>
      {invoices.length === 0 ? (
        <p>No invoices</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Patient</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id}>
                <td>{inv._id}</td>
                <td>{inv.patientName || '-'}</td>
                <td>{inv.total}</td>
                <td>{inv.paid ? 'Paid' : 'Pending'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InvoiceList;
