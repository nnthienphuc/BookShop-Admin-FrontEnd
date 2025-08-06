import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance";

const API_BASE = "http://localhost:5286/api/admin/staffs";

export default function StaffPage() {
  const [staffs, setStaffs] = useState([]);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [form, setForm] = useState({
    id: "",
    familyName: "",
    givenName: "",
    dateOfBirth: "",
    address: "",
    phone: "",
    email: "",
    citizenIdentification: "",
    role: false,
    gender: false,
    isActived: false,
    isDeleted: false,
  });

  const fetchStaffs = async () => {
    try {
      const url = search ? `${API_BASE}/search?keyword=${search}` : API_BASE;
      const res = await axiosInstance.get(url);
      setStaffs(res.data);
    } catch (err) {
      alert("Không thể tải danh sách nhân viên.");
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, [search]);

  const openAdd = () => {
    setForm({
      id: "",
      familyName: "",
      givenName: "",
      dateOfBirth: "",
      address: "",
      phone: "",
      email: "",
      citizenIdentification: "",
      role: false,
      gender: false,
      isActived: false,
      isDeleted: false,
    });
    setIsEdit(false);
    setModalVisible(true);
  };

  const openEdit = (staff) => {
    setForm({ ...staff });
    setIsEdit(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form };

      let res;
      if (isEdit) {
        res = await axiosInstance.put(`${API_BASE}/${form.id}`, payload);
      } else {
        res = await axiosInstance.post(API_BASE, payload);
      }

      alert(res.data?.message || "Lưu thành công.");
      setModalVisible(false);
      fetchStaffs();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi lưu nhân viên.");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axiosInstance.delete(`${API_BASE}/${deleteId}`);
      alert(res.data?.message || "Xóa thành công.");
    } catch (err) {
      alert(err.response?.data?.message || "Xóa thất bại.");
    } finally {
      setDeleteId(null);
      fetchStaffs();
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  const sortedStaffs = React.useMemo(() => {
    const sortable = [...staffs];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (["gender", "role", "isActived", "isDeleted"].includes(sortConfig.key)) {
          aValue = aValue ? 1 : 0;
          bValue = bValue ? 1 : 0;
        } else if (sortConfig.key === "dateOfBirth") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [staffs, sortConfig]);

  return (
    <div className="container mt-4">
      <h2>Danh sách Nhân viên</h2>
      <div className="d-flex gap-2 mb-3">
        {/* <button className="btn btn-success" onClick={openAdd}>Thêm</button> */}
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
            {[
              ["familyName", "Họ"],
              ["givenName", "Tên"],
              ["dateOfBirth", "Ngày sinh"],
              ["gender", "Giới tính"],
              ["phone", "SĐT"],
              ["email", "Email"],
              ["address", "Địa chỉ"],
              ["citizenIdentification", "CCCD"],
              ["role", "Vai trò"],
              ["isActived", "Đang hoạt động"],
              ["isDeleted", "Đã xoá"],
            ].map(([key, label]) => (
              <th key={key} onClick={() => handleSort(key)} style={{ cursor: "pointer" }}>
                {label} {renderSortIcon(key)}
              </th>
            ))}
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {sortedStaffs.length === 0 ? (
            <tr>
              <td colSpan={13} className="text-center">Không có dữ liệu</td>
            </tr>
          ) : (
            sortedStaffs.map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td>
                <td>{s.familyName}</td>
                <td>{s.givenName}</td>
                <td>{s.dateOfBirth}</td>
                <td>{s.gender ? "Nữ" : "Nam"}</td>
                <td>{s.phone}</td>
                <td>{s.email}</td>
                <td>{s.address}</td>
                <td>{s.citizenIdentification}</td>
                <td>{s.role ? "Admin" : "Staff"}</td>
                <td><input type="checkbox" checked={s.isActived} readOnly /></td>
                <td><input type="checkbox" checked={s.isDeleted} readOnly /></td>
                <td>
                  <button className="btn btn-info btn-sm me-2" onClick={() => openEdit(s)}>Sửa</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(s.id)}>Xoá</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal thêm/sửa */}
      {modalVisible && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEdit ? "Sửa" : "Thêm"} nhân viên</h5>
                <button className="btn-close" onClick={() => setModalVisible(false)}></button>
              </div>
              <div className="modal-body row g-3">
                {[
                  { label: "Họ", name: "familyName" },
                  { label: "Tên", name: "givenName" },
                  { label: "Ngày sinh", name: "dateOfBirth", type: "date" },
                  { label: "Địa chỉ", name: "address" },
                  { label: "SĐT", name: "phone" },
                  { label: "Email", name: "email" },
                  { label: "CCCD", name: "citizenIdentification" },
                ].map(({ label, name, type }) => (
                  <div key={name} className="col-md-6">
                    <label>{label}</label>
                    <input
                      type={type || "text"}
                      className="form-control"
                      value={form[name] || ""}
                      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    />
                  </div>
                ))}

                <div className="col-md-6 d-flex align-items-center gap-2">
                  <label>Giới tính:</label>
                  <select
                    className="form-select"
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value === "true" })}
                  >
                    <option value="false">Nam</option>
                    <option value="true">Nữ</option>
                  </select>
                </div>

                <div className="col-md-6 d-flex align-items-center gap-2">
                  <label>Vai trò:</label>
                  <select
                    className="form-select"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value === "true" })}
                  >
                    <option value="false">Staff</option>
                    <option value="true">Admin</option>
                  </select>
                </div>

                <div className="col-md-6 d-flex align-items-center">
                  <label>Actived:</label>
                  <input
                    type="checkbox"
                    checked={form.isActived}
                    onChange={(e) => setForm({ ...form, isActived: e.target.checked })}
                  />
                </div>

                <div className="col-md-6 d-flex align-items-center">
                  <label>Đã xoá:</label>
                  <input
                    type="checkbox"
                    checked={form.isDeleted}
                    onChange={(e) => setForm({ ...form, isDeleted: e.target.checked })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalVisible(false)}>Huỷ</button>
                <button className="btn btn-primary" onClick={handleSave}>Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xoá */}
      {deleteId && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận xoá</h5>
                <button className="btn-close" onClick={() => setDeleteId(null)}></button>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc chắn muốn xoá nhân viên này?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Huỷ</button>
                <button className="btn btn-danger" onClick={handleDelete}>Xoá</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
