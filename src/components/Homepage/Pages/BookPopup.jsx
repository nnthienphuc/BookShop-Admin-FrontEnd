import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";

export default function BookPopup({ open, onSelect, onClose }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (open) {
      axiosInstance.get("http://localhost:5286/api/admin/books")
        .then(res => setRows(res.data.filter(x => !x.isDeleted)))
        .catch(() => alert("Không thể tải sách"));
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal show fade d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg"><div className="modal-content">
        <div className="modal-header">
          <h5>Chọn sách</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>
        <div className="modal-body">
          <table className="table">
            <thead>
              <tr><th>ISBN</th><th>Tiêu đề</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map(b => (
                <tr key={b.id}>
                  <td>{b.isbn}</td>
                  <td>{b.title}</td>
                  <td><button className="btn btn-sm btn-primary" onClick={() => { onSelect(b); onClose(); }}>Chọn</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div></div>
    </div>
  );
}
