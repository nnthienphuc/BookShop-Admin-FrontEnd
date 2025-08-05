import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";

export default function PromotionPopup({ open, onSelect, onClose }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (open) {
      axiosInstance.get("http://localhost:5286/api/admin/promotions")
        .then(res => setRows(res.data.filter(x => !x.isDeleted)))
        .catch(() => alert("Không thể tải khuyến mãi"));
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal show fade d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg"><div className="modal-content">
        <div className="modal-header">
          <h5>Chọn khuyến mãi</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>
        <div className="modal-body">
          <table className="table">
            <thead>
              <tr><th>Tên</th><th>Ngày bắt đầu</th><th>Kết thúc</th><th>Điều kiện</th><th>Giảm</th><th>Số lượng</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{new Date(p.startDate).toLocaleDateString()}</td>
                  <td>{new Date(p.endDate).toLocaleDateString()}</td>
                  <td>{p.condition}</td>
                  <td>{p.discountPercent}</td>
                  <td>{p.quantity}</td>
                  <td><button className="btn btn-sm btn-primary" onClick={() => { onSelect(p); onClose(); }}>Chọn</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div></div>
    </div>
  );
}
