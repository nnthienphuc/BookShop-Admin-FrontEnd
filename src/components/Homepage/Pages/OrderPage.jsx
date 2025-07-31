import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import CustomerPopup from "./CustomerPopup";
import PromotionPopup from "./PromotionPopup";
import BookPopup from "./BookPopup";

const API_BASE = "http://localhost:5286/api/admin/orders";

export default function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({});
  const [deleteId, setDeleteId] = useState(null);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addForm, setAddForm] = useState({
    customerId: "", customerName: "",
    promotionId: "", promotionName: "", discountPercent: 0,
    paymentMethod: "Tiền mặt",
    items: [{ bookId: "", bookTitle: "", unitPrice: 0, quantity: 1 }],
  });

  const [customerPopup, setCustomerPopup] = useState(false);
  const [promotionPopup, setPromotionPopup] = useState(false);
  const [bookPopupIndex, setBookPopupIndex] = useState(null);

  useEffect(() => { fetchOrders(); }, [search]);

  const fetchOrders = async () => {
    try {
      const url = search ? `${API_BASE}/search?keyword=${search}` : API_BASE;
      const res = await axiosInstance.get(url);
      setOrders(res.data);
    } catch {
      alert("Không thể tải danh sách đơn hàng.");
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const renderSortIcon = (key) =>
    sortConfig.key !== key ? null : sortConfig.direction === "asc" ? " ▲" : " ▼";

  const sortedOrders = React.useMemo(() => {
    const arr = [...orders];
    if (sortConfig.key) {
      arr.sort((a, b) => {
        let av = a[sortConfig.key], bv = b[sortConfig.key];
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

  const openAdd = () => {
    setAddForm({
      customerId: "", customerName: "",
      promotionId: "", promotionName: "", discountPercent: 0,
      paymentMethod: "Tiền mặt",
      items: [{ bookId: "", bookTitle: "", unitPrice: 0, quantity: 1 }],
    });
    setAddModalVisible(true);
  };

  const handlePopupSelect = (type, item) => {
    if (type === "customer") {
      setAddForm((f) => ({
        ...f,
        customerId: item.id,
        customerName: `${item.familyName} ${item.givenName}`,
      }));
      setCustomerPopup(false);
    }
    if (type === "promotion") {
      setAddForm((f) => ({
        ...f,
        promotionId: item.id,
        promotionName: item.name,
        discountPercent: item.discountPercent || 0,
      }));
      setPromotionPopup(false);
    }
    if (type === "book" && bookPopupIndex !== null) {
      setAddForm((f) => {
        const items = [...f.items];
        items[bookPopupIndex] = {
          bookId: item.id,
          bookTitle: item.title,
          unitPrice: item.price,
          quantity: 1,
        };
        return { ...f, items };
      });
      setBookPopupIndex(null);
    }
  };

  const handleCreateOrder = async () => {
    try {
      const payload = {
        customerId: addForm.customerId,
        promotionId: addForm.promotionId || null,
        paymentMethod: addForm.paymentMethod,
        items: addForm.items.map(x => ({ bookId: x.bookId, quantity: x.quantity })),
      };
      const res = await axiosInstance.post(API_BASE, payload);
      alert(res.data?.message || "Tạo đơn hàng thành công");
      fetchOrders();
      setAddModalVisible(false);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.response?.data ||
        "Lỗi tạo đơn hàng.";
      alert(message);
    }
  };

  const handleUpdateOrder = async () => {
    try {
      const payload = {
        status: form.status,
        note: form.note || "",
        isDeleted: form.isDeleted || false,
      };
      const res = await axiosInstance.put(`${API_BASE}/${form.id}`, payload);
      alert(res.data?.message || "Cập nhật thành công");
      fetchOrders();
      setModalVisible(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi cập nhật đơn hàng";
      alert(msg);
    }
  };

  const handleDeleteOrder = async () => {
    try {
      const res = await axiosInstance.delete(`${API_BASE}/${deleteId}`);
      alert(res.data?.message || "Xoá thành công");
      fetchOrders();
      setDeleteId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Xoá thất bại");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Danh sách Đơn hàng</h2>
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-success" onClick={openAdd}>Tạo đơn hàng</button>
        <input placeholder="Tìm kiếm..." className="form-control w-25"
          value={search} onChange={(e) => setSearch(e.target.value)}
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
              ["isDeleted", "Đã xoá"],
            ].map(([key,label]) => (
              <th key={key} onClick={() => handleSort(key)} style={{cursor:"pointer"}}>
                {label}{renderSortIcon(key)}
              </th>
            ))}
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {sortedOrders.length === 0 ? (
            <tr><td colSpan={10} className="text-center">Không có dữ liệu</td></tr>
          ) : sortedOrders.map((o,i) => (
            <tr key={o.id}>
              <td>{i+1}</td>
              <td>{o.staffName}</td>
              <td>{o.customerName}</td>
              <td>{o.customerPhone}</td>
              <td>{new Date(o.createdTime).toLocaleString()}</td>
              <td>{o.status}</td>
              <td>{o.shippingFee}</td>
              <td>{o.totalAmount}</td>
              <td><input type="checkbox" checked={o.isDeleted} readOnly /></td>
              <td>
                <button onClick={() => { setForm(o); setModalVisible(true); }} className="btn btn-info btn-sm me-2">Sửa</button>
                <button onClick={() => setDeleteId(o.id)} className="btn btn-danger btn-sm">Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal tạo đơn hàng */}
      {addModalVisible && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg"><div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Tạo đơn hàng mới</h5>
              <button className="btn-close" onClick={() => setAddModalVisible(false)}></button>
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label>Khách hàng:</label>
                  <div className="input-group">
                    <input className="form-control" value={addForm.customerName} readOnly />
                    <button className="btn btn-outline-primary" onClick={() => setCustomerPopup(true)}>Chọn</button>
                  </div>
                </div>
                <div className="col-md-6">
                  <label>Khuyến mãi:</label>
                  <div className="input-group">
                    <input className="form-control" value={addForm.promotionName} readOnly />
                    <button className="btn btn-outline-primary" onClick={() => setPromotionPopup(true)}>Chọn</button>
                  </div>
                </div>
                <div className="col-md-6">
                  <label>Phương thức thanh toán:</label>
                  <select className="form-control"
                    value={addForm.paymentMethod}
                    onChange={(e) => setAddForm({ ...addForm, paymentMethod: e.target.value })}
                  >
                    <option>Tiền mặt</option>
                    <option>Chuyển khoản</option>
                    <option>Ví điện tử</option>
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <label>Sản phẩm:</label>
                {addForm.items.map((item,index) => (
                  <div key={index} className="row align-items-center mb-2">
                    <div className="col-md-4">
                      <input className="form-control" value={item.bookTitle} readOnly placeholder="Sách" />
                    </div>
                    <div className="col-md-2">
                      <button className="btn btn-outline-primary w-100" onClick={() => setBookPopupIndex(index)}>Chọn</button>
                    </div>
                    <div className="col-md-2">
                      <input type="number" min={1} className="form-control"
                        value={item.quantity}
                        onChange={(e) => {
                          const qty = parseInt(e.target.value) || 1;
                          const items = [...addForm.items];
                          items[index].quantity = qty;
                          setAddForm({ ...addForm, items });
                        }}
                      />
                    </div>
                    <div className="col-md-2">
                      <input className="form-control" value={item.unitPrice.toLocaleString()} readOnly />
                    </div>
                    <div className="col-md-2">
                      <button className="btn btn-danger w-100"
                        onClick={() => {
                          const items = addForm.items.filter((_, i) => i !== index);
                          setAddForm({ ...addForm, items });
                        }}
                      >X</button>
                    </div>
                  </div>
                ))}
                <button className="btn btn-secondary mt-2" onClick={() =>
                  setAddForm({ ...addForm, items: [...addForm.items, { bookId: "", bookTitle: "", unitPrice: 0, quantity: 1 }] })
                }>+ Thêm sản phẩm</button>
              </div>

              <div className="text-end mt-3">
                <h5>
                  Tổng tiền: {
                    (() => {
                      const subtotal = addForm.items.reduce((sum, x) => sum + x.unitPrice * x.quantity, 0);
                      const total = subtotal * (1 - (addForm.discountPercent || 0) / 100);
                      return total.toLocaleString() + " ₫";
                    })()
                  }
                </h5>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setAddModalVisible(false)}>Huỷ</button>
              <button className="btn btn-primary" onClick={handleCreateOrder}>Tạo đơn</button>
            </div>
          </div></div>
        </div>
      )}

      {/* Modal sửa đơn hàng */}
      {modalVisible && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog"><div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Sửa đơn hàng</h5>
              <button className="btn-close" onClick={() => setModalVisible(false)}></button>
            </div>
            <div className="modal-body">
              <p><strong>Khách hàng:</strong> {form.customerName}</p>
              <p><strong>Nhân viên:</strong> {form.staffName}</p>
              <p><strong>Tổng tiền:</strong> {form.totalAmount?.toLocaleString()} ₫</p>
              <div className="mb-2">
                <label>Trạng thái</label>
                <input className="form-control" value={form.status || ""} onChange={(e) => setForm({ ...form, status: e.target.value })} />
              </div>
              <div className="mb-2">
                <label>Ghi chú</label>
                <textarea className="form-control" value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </div>
              <div className="form-check">
                <input type="checkbox" className="form-check-input" checked={form.isDeleted || false}
                  onChange={(e) => setForm({ ...form, isDeleted: e.target.checked })} />
                <label className="form-check-label">Đã xoá</label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalVisible(false)}>Huỷ</button>
              <button className="btn btn-primary" onClick={handleUpdateOrder}>Lưu</button>
            </div>
          </div></div>
        </div>
      )}

      {/* Modal xoá */}
      {deleteId && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog"><div className="modal-content">
            <div className="modal-header"><h5>Xác nhận xoá</h5>
              <button className="btn-close" onClick={() => setDeleteId(null)}></button>
            </div>
            <div className="modal-body"><p>Bạn có chắc muốn xoá đơn hàng này?</p></div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Huỷ</button>
              <button className="btn btn-danger" onClick={handleDeleteOrder}>Xoá</button>
            </div>
          </div></div>
        </div>
      )}

      {/* Popups */}
      <CustomerPopup open={customerPopup} onSelect={(c) => handlePopupSelect("customer", c)} onClose={() => setCustomerPopup(false)} />
      <PromotionPopup open={promotionPopup} onSelect={(p) => handlePopupSelect("promotion", p)} onClose={() => setPromotionPopup(false)} />
      {bookPopupIndex !== null && (
        <BookPopup open onSelect={(b) => handlePopupSelect("book", b)} onClose={() => setBookPopupIndex(null)} />
      )}
    </div>
  );
}
