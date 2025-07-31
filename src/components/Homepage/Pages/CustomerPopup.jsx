import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";

export default function CustomerPopup({ open, onSelect, onClose }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (open) {
      axiosInstance.get("http://localhost:5286/api/admin/customers")
        .then(res => setRows(res.data.filter(x => !x.isDeleted)))
        .catch(() => alert("Không thể tải danh sách khách hàng"));
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal show fade d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg"><div className="modal-content">
        <div className="modal-header">
          <h5>Chọn khách hàng</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>
        <div className="modal-body">
          <table className="table">
            <thead>
              <tr><th>Họ</th><th>Tên</th><th>Điện thoại</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map(c => (
                <tr key={c.id}>
                  <td>{c.familyName}</td>
                  <td>{c.givenName}</td>
                  <td>{c.phone}</td>
                  <td><button className="btn btn-sm btn-primary" onClick={() => { onSelect(c); onClose(); }}>Chọn</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div></div>
    </div>
  );
}
