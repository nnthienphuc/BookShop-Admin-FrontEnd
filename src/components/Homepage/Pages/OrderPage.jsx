import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance";

const API_BASE = "http://localhost:5286/api/admin/orders";

export default function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({});
  const [deleteId, setDeleteId] = useState(null);

  const fetchOrders = async () => {
    try {
      const url = search ? `${API_BASE}/search?keyword=${search}` : API_BASE;
      const res = await axiosInstance.get(url);
      setOrders(res.data);
    } catch (err) {
      alert("Không thể tải danh sách đơn hàng.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search]);

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

  const sortedOrders = React.useMemo(() => {
    const arr = [...orders];
    if (sortConfig.key) {
      arr.sort((a, b) => {
        let av = a[sortConfig.key];
        let bv = b[sortConfig.key];
        if (sortConfig.key === "createdTime") {
          av = new Date(av); bv = new Date(bv);
        } else if (["shippingFee", "totalAmount"].includes(sortConfig.key)) {
          av = Number(av); bv = Number(bv);
        } else {
          av = av?.toString().toLowerCase();
          bv = bv?.toString().toLowerCase();
        }
        if (av < bv) return sortConfig.direction === "asc" ? -1 : 1;
        if (av > bv) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return arr;
  }, [orders, sortConfig]);

  const openEdit = (order) => {
    setForm({ ...order });
    setIsEdit(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const { id, status, note, isDeleted } = form;
      const payload = { status, note, isDeleted };

      await axiosInstance.put(`${API_BASE}/${id}`, payload);
      alert("Lưu thành công");
      setModalVisible(false);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi cập nhật đơn hàng.");
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`${API_BASE}/${deleteId}`);
      alert("Xoá thành công");
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Xoá thất bại");
    } finally {
      setDeleteId(null);
    }
  };

  // ----------------------- Tạo đơn hàng -----------------------
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addForm, setAddForm] = useState({
    customerId: "",
    promotionId: "",
    paymentMethod: "Tiền mặt",
    items: [{ bookId: "", quantity: 1 }],
  });

  const openAdd = () => {
    setAddForm({
      customerId: "",
      promotionId: "",
      paymentMethod: "Tiền mặt",
      items: [{ bookId: "", quantity: 1 }],
    });
    setAddModalVisible(true);
  };

  return (
    <div className="container mt-4">
      <h2>Danh sách Đơn hàng</h2>

      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-success" onClick={openAdd}>Tạo đơn hàng</button>
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
              ["staffName", "Nhân viên"],
              ["customerName", "Khách hàng"],
              ["customerPhone", "SĐT Khách"],
              ["createdTime", "Ngày"],
              ["status", "Trạng thái"],
              ["shippingFee", "Phí ship"],
              ["totalAmount", "Tổng tiền"],
              ["isDeleted", "Đã xoá"]
            ].map(([key, label]) => (
              <th key={key} onClick={() => handleSort(key)} style={{ cursor: "pointer" }}>
                {label}{renderSortIcon(key)}
              </th>
            ))}
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {sortedOrders.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center">Không có dữ liệu</td>
            </tr>
          ) : (
            sortedOrders.map((o, i) => (
              <tr key={o.id}>
                <td>{i + 1}</td>
                <td>{o.staffName}</td>
                <td>{o.customerName}</td>
                <td>{o.customerPhone}</td>
                <td>{new Date(o.createdTime).toLocaleString()}</td>
                <td>{o.status}</td>
                <td>{o.shippingFee}</td>
                <td>{o.totalAmount}</td>
                <td><input type="checkbox" checked={o.isDeleted} readOnly /></td>
                <td>
                  <button className="btn btn-info btn-sm me-2" onClick={() => openEdit(o)}>Sửa</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(o.id)}>Xoá</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal sửa */}
      {modalVisible && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog"><div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Sửa đơn hàng</h5>
              <button className="btn-close" onClick={() => setModalVisible(false)}></button>
            </div>
            <div className="modal-body">
              <p><strong>Nhân viên:</strong> {form.staffName}</p>
              <p><strong>Khách hàng:</strong> {form.customerName}</p>
              <p><strong>Tổng tiền:</strong> {form.totalAmount}</p>

              <div className="mb-2">
                <label>Trạng thái</label>
                <input className="form-control"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                />
              </div>
              <div className="mb-2">
                <label>Ghi chú</label>
                <textarea className="form-control"
                  value={form.note || ""}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>
              <div className="form-check">
                <input type="checkbox" className="form-check-input"
                  checked={form.isDeleted}
                  onChange={(e) => setForm({ ...form, isDeleted: e.target.checked })}
                />
                <label className="form-check-label">Đã xoá</label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalVisible(false)}>Huỷ</button>
              <button className="btn btn-primary" onClick={handleSave}>Lưu</button>
            </div>
          </div></div>
        </div>
      )}

      {/* Modal xoá */}
      {deleteId && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog"><div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Xác nhận xoá</h5>
              <button className="btn-close" onClick={() => setDeleteId(null)}></button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xoá đơn hàng này?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Huỷ</button>
              <button className="btn btn-danger" onClick={handleDelete}>Xoá</button>
            </div>
          </div></div>
        </div>
      )}

      {/* Modal thêm */}
      {addModalVisible && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tạo đơn hàng mới</h5>
                <button className="btn-close" onClick={() => setAddModalVisible(false)}></button>
              </div>
              <div className="modal-body row g-3">
                <div className="col-md-6">
                  <label>Khách hàng ID:</label>
                  <input
                    className="form-control"
                    value={addForm.customerId}
                    onChange={e => setAddForm({ ...addForm, customerId: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label>Khuyến mãi ID (tuỳ chọn):</label>
                  <input
                    className="form-control"
                    value={addForm.promotionId}
                    onChange={e => setAddForm({ ...addForm, promotionId: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label>Phương thức thanh toán:</label>
                  <select
                    className="form-control"
                    value={addForm.paymentMethod}
                    onChange={e => setAddForm({ ...addForm, paymentMethod: e.target.value })}
                  >
                    <option value="Tiền mặt">Tiền mặt</option>
                    <option value="Chuyển khoản">Chuyển khoản</option>
                    <option value="Ví điện tử">Ví điện tử</option>
                  </select>
                </div>

                <div className="col-12">
                  <label>Sản phẩm:</label>
                  {addForm.items.map((item, index) => (
                    <div key={index} className="d-flex gap-2 mb-2">
                      <input
                        className="form-control"
                        placeholder="BookId"
                        value={item.bookId}
                        onChange={(e) => {
                          const newItems = [...addForm.items];
                          newItems[index].bookId = e.target.value;
                          setAddForm({ ...addForm, items: newItems });
                        }}
                      />
                      <input
                        type="number"
                        min={1}
                        className="form-control"
                        placeholder="Số lượng"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...addForm.items];
                          newItems[index].quantity = parseInt(e.target.value);
                          setAddForm({ ...addForm, items: newItems });
                        }}
                      />
                      <button
                        className="btn btn-danger"
                        onClick={() => {
                          const newItems = addForm.items.filter((_, i) => i !== index);
                          setAddForm({ ...addForm, items: newItems });
                        }}
                      >X</button>
                    </div>
                  ))}
                  <button
                    className="btn btn-secondary"
                    onClick={() => setAddForm({
                      ...addForm,
                      items: [...addForm.items, { bookId: "", quantity: 1 }]
                    })}
                  >+ Thêm sản phẩm</button>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setAddModalVisible(false)}>Huỷ</button>
                <button className="btn btn-primary" onClick={async () => {
                  try {
                    const payload = {
                      customerId: addForm.customerId,
                      promotionId: addForm.promotionId || null,
                      paymentMethod: addForm.paymentMethod,
                      items: addForm.items
                    };
                    await axiosInstance.post(`${API_BASE}`, payload);
                    alert("Tạo đơn hàng thành công");
                    fetchOrders();
                    setAddModalVisible(false);
                  } catch (err) {
                    alert(err.response?.data?.message || "Lỗi khi tạo đơn hàng.");
                  }
                }}>Tạo đơn</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
