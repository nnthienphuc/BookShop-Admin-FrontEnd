import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";

const API_BASE = "http://localhost:5286/api/admin/promotions";

export default function PromotionPage() {
  const [promotions, setPromotions] = useState([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    startDate: "",
    endDate: "",
    condition: "",
    discountPercent: "",
    quantity: "",
    isDeleted: false,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");

  const fetchPromotions = async () => {
    const url = search ? `${API_BASE}/search?keyword=${search}` : API_BASE;
    const res = await axiosInstance.get(url);
    setPromotions(res.data);
  };

  useEffect(() => {
    fetchPromotions();
  }, [search]);

  const openAdd = () => {
    setForm({
      id: "",
      name: "",
      startDate: "",
      endDate: "",
      condition: "",
      discountPercent: "",
      quantity: "",
      isDeleted: false,
    });
    setIsEdit(false);
    setModalVisible(true);
  };

  const openEdit = (promo) => {
    setForm({ ...promo });
    setIsEdit(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form };
      if (!form.name || !form.startDate || !form.endDate) {
        alert("Vui lòng nhập đầy đủ thông tin.");
        return;
      }

      if (isEdit) {
        await axiosInstance.put(`${API_BASE}/${form.id}`, payload);
      } else {
        await axiosInstance.post(API_BASE, payload);
      }

      alert("Lưu thành công");
      setModalVisible(false);
      fetchPromotions();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi lưu khuyến mãi");
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`${API_BASE}/${deleteId}`);
      alert("Xoá thành công");
      fetchPromotions();
    } catch (err) {
      alert(err.response?.data?.message || "Xoá thất bại");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Khuyến mãi</h2>
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-success" onClick={openAdd}>
          Thêm
        </button>
        <input
          className="form-control w-25"
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Tên</th>
            <th>Ngày bắt đầu</th>
            <th>Ngày kết thúc</th>
            <th>Điều kiện</th>
            <th>Giảm (%)</th>
            <th>Số lượng</th>
            <th>Đã xoá</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {promotions.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            promotions.map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td>{p.name}</td>
                <td>{new Date(p.startDate).toLocaleDateString()}</td>
                <td>{new Date(p.endDate).toLocaleDateString()}</td>
                <td>{p.condition}</td>
                <td>{p.discountPercent}</td>
                <td>{p.quantity}</td>
                <td>
                  <input type="checkbox" checked={p.isDeleted} readOnly />
                </td>
                <td>
                  <button
                    className="btn btn-info btn-sm me-2"
                    onClick={() => openEdit(p)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeleteId(p.id)}
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {modalVisible && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEdit ? "Sửa" : "Thêm"} khuyến mãi
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalVisible(false)}
                ></button>
              </div>
              <div className="modal-body row g-3">
                {[
                  { label: "Tên", field: "name" },
                  { label: "Ngày bắt đầu", field: "startDate", type: "date" },
                  { label: "Ngày kết thúc", field: "endDate", type: "date" },
                  { label: "Điều kiện", field: "condition" },
                  { label: "Giảm giá (%)", field: "discountPercent" },
                  { label: "Số lượng", field: "quantity" },
                ].map(({ label, field, type }) => (
                  <div key={field} className="col-12">
                    <label>{label}</label>
                    <input
                      type={type || "text"}
                      className="form-control"
                      value={form[field] || ""}
                      onChange={(e) =>
                        setForm({ ...form, [field]: e.target.value })
                      }
                    />
                  </div>
                ))}

                <div className="col-12 d-flex align-items-center">
                  <label className="me-2">Đã xoá:</label>
                  <input
                    type="checkbox"
                    checked={form.isDeleted}
                    onChange={(e) =>
                      setForm({ ...form, isDeleted: e.target.checked })
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setModalVisible(false)}
                >
                  Huỷ
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận xoá</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteId(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc muốn xoá khuyến mãi này?</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteId(null)}
                >
                  Huỷ
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Xoá
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
