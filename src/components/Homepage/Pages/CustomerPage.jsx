import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance";

const API_BASE = "http://localhost:5286/api/admin/customers";

export default function CustomerPage() {
  const [customers, setCustomers] = useState([]);
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
    gender: false,
    isDeleted: false,
  });

  const fetchCustomers = async () => {
    try {
      const url = search ? `${API_BASE}/search?keyword=${search}` : API_BASE;
      const res = await axiosInstance.get(url);
      setCustomers(res.data);
    } catch (err) {
      alert("Không thể tải danh sách khách hàng.");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const openAdd = () => {
    setForm({
      id: "",
      familyName: "",
      givenName: "",
      dateOfBirth: "",
      address: "",
      phone: "",
      gender: false,
      isDeleted: false,
    });
    setIsEdit(false);
    setModalVisible(true);
  };

  const openEdit = (cust) => {
    setForm({
      id: cust.id,
      familyName: cust.familyName,
      givenName: cust.givenName,
      dateOfBirth: cust.dateOfBirth,
      address: cust.address,
      phone: cust.phone,
      gender: cust.gender,
      isDeleted: cust.isDeleted,
    });
    setIsEdit(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        familyName: form.familyName,
        givenName: form.givenName,
        dateOfBirth: form.dateOfBirth,
        address: form.address,
        phone: form.phone,
        gender: form.gender,
        isDeleted: form.isDeleted,
      };

      let res;
      if (isEdit) {
        res = await axiosInstance.put(`${API_BASE}/${form.id}`, payload);
      } else {
        res = await axiosInstance.post(API_BASE, payload);
      }

      alert(res.data?.message || "Lưu thành công.");
      setModalVisible(false);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi lưu khách hàng.");
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
      fetchCustomers();
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

  const sortedCustomers = React.useMemo(() => {
    const sortable = [...customers];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "gender") {
          aValue = aValue ? 1 : 0;
          bValue = bValue ? 1 : 0;
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [customers, sortConfig]);

  return (
    <div className="container mt-4">
      <h2>Khách hàng</h2>
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-success" onClick={openAdd}>Thêm</button>
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
    <th onClick={() => handleSort("familyName")} style={{ cursor: "pointer" }}>
      Họ {renderSortIcon("familyName")}
    </th>
    <th onClick={() => handleSort("givenName")} style={{ cursor: "pointer" }}>
      Tên {renderSortIcon("givenName")}
    </th>
    <th onClick={() => handleSort("dateOfBirth")} style={{ cursor: "pointer" }}>
      Ngày sinh {renderSortIcon("dateOfBirth")}
    </th>
    <th onClick={() => handleSort("gender")} style={{ cursor: "pointer" }}>
      Giới tính {renderSortIcon("gender")}
    </th>
    <th onClick={() => handleSort("phone")} style={{ cursor: "pointer" }}>
      Điện thoại {renderSortIcon("phone")}
    </th>
    <th onClick={() => handleSort("email")} style={{ cursor: "pointer" }}>
      Email {renderSortIcon("email")}
    </th>
    <th onClick={() => handleSort("address")} style={{ cursor: "pointer" }}>
      Địa chỉ {renderSortIcon("address")}
    </th>
    <th onClick={() => handleSort("isDeleted")} style={{ cursor: "pointer" }}>
      Đã xoá {renderSortIcon("isDeleted")}
    </th>
    <th>Thao tác</th>
  </tr>
</thead>

        <tbody>
          {sortedCustomers.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center">Không có dữ liệu</td>
            </tr>
          ) : (
            sortedCustomers.map((c, i) => (
              <tr key={c.id}>
                <td>{i + 1}</td>
                <td>{c.familyName}</td>
                <td>{c.givenName}</td>
                <td>{c.dateOfBirth}</td>
                <td>{c.gender ? "Nữ" : "Nam"}</td>
                <td>{c.phone}</td>
                <td>{c.email || "-"}</td>
                <td>{c.address}</td>
                <td><input type="checkbox" checked={c.isDeleted} readOnly /></td>
                <td>
                  <button className="btn btn-info btn-sm me-2" onClick={() => openEdit(c)}>Sửa</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(c.id)}>Xoá</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal Thêm/Sửa */}
      {modalVisible && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEdit ? "Sửa" : "Thêm"} khách hàng</h5>
                <button className="btn-close" onClick={() => setModalVisible(false)}></button>
              </div>
              <div className="modal-body row g-3">
                {[
                  { label: "Họ", name: "familyName" },
                  { label: "Tên", name: "givenName" },
                  { label: "Ngày sinh", name: "dateOfBirth", type: "date" },
                  { label: "Địa chỉ", name: "address" },
                  { label: "SĐT", name: "phone" },
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

                <div className="col-md-6 d-flex align-items-center">
                  <label className="form-check-label me-2">Giới tính:</label>
                  <select
                    className="form-select"
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value === "true" })}
                  >
                    <option value="false">Nam</option>
                    <option value="true">Nữ</option>
                  </select>
                </div>

                <div className="col-md-6 d-flex align-items-center">
                  <label className="form-check-label me-2">Đã xoá:</label>
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
                <p>Bạn có chắc chắn muốn xoá khách hàng này?</p>
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
