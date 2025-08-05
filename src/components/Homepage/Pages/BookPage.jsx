import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import SelectPopup from "./SelectPopup";

const API_BASE = "http://localhost:5286/api/admin/books";

export default function BookPage() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    id: "",
    isbn: "",
    title: "",
    categoryId: "",
    categoryName: "",
    authorId: "",
    authorName: "",
    publisherId: "",
    publisherName: "",
    yearOfPublication: "",
    price: "",
    quantity: "",
    isDeleted: false,
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  const [popupType, setPopupType] = useState("");
  const [popupData, setPopupData] = useState([]);

  const fetchBooks = async () => {
    try {
      const url = search ? `${API_BASE}/search?keyword=${search}` : API_BASE;
      const res = await axiosInstance.get(url);
      let data = res.data || [];

      if (sortConfig.key) {
        data.sort((a, b) => {
          let aVal = a[sortConfig.key];
          let bVal = b[sortConfig.key];
          if (typeof aVal === "string") aVal = aVal.toLowerCase();
          if (typeof bVal === "string") bVal = bVal.toLowerCase();
          if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        });
      }

      setBooks(data);
    } catch (err) {
      alert("Không thể tải sách!");
    }
  };

  const fetchPopupData = async (type) => {
    const urlMap = {
      author: "http://localhost:5286/api/admin/authors",
      category: "http://localhost:5286/api/admin/categories",
      publisher: "http://localhost:5286/api/admin/publishers",
    };
    const res = await axiosInstance.get(urlMap[type]);
    setPopupData(res.data.filter((item) => !item.isDeleted));
  };

  const openPopup = (type) => {
    setPopupType(type);
    fetchPopupData(type);
  };

  const handleSelect = (item) => {
  const fieldMap = {
    author: { idField: "authorId", nameField: "authorName" },
    category: { idField: "categoryId", nameField: "categoryName" },
    publisher: { idField: "publisherId", nameField: "publisherName" },
  };

  const { idField, nameField } = fieldMap[popupType];

  setForm({
    ...form,
    [idField]: item.id,
    [nameField]: item.name, // 👈 cập nhật tên để hiển thị
  });

  setPopupType(""); // đóng popup
};


  useEffect(() => {
    fetchBooks();
  }, [search, sortConfig]);

  const openAdd = () => {
    setForm({
      id: "",
      isbn: "",
      title: "",
      categoryId: "",
      categoryName: "",
      authorId: "",
      authorName: "",
      publisherId: "",
      publisherName: "",
      yearOfPublication: "",
      price: "",
      quantity: "",
      isDeleted: false,
      image: null,
    });
    setPreview(null);
    setIsEdit(false);
    setModalVisible(true);
  };

  const openEdit = (book) => {
    setForm({
      id: book.id,
      isbn: book.isbn,
      title: book.title,
      categoryId: book.categoryId || "",
      categoryName: book.categoryName || "",
      authorId: book.authorId || "",
      authorName: book.authorName || "",
      publisherId: book.publisherId || "",
      publisherName: book.publisherName || "",
      yearOfPublication: book.yearOfPublication,
      price: book.price,
      quantity: book.quantity,
      isDeleted: book.isDeleted,
      image: null,
    });
    setPreview(book.image ? `http://localhost:5286/${book.image}` : null);
    setIsEdit(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    console.log("Form values before submit:", form);

    try {
      if (!form.authorId || !form.categoryId || !form.publisherId) {
        alert("Vui lòng chọn tác giả, thể loại và nhà xuất bản.");
        return;
      }

      const formData = new FormData();

      // Chỉ append những trường cần thiết (id)
      formData.append("isbn", form.isbn);
      formData.append("title", form.title);
      formData.append("categoryId", form.categoryId);
      formData.append("authorId", form.authorId);
      formData.append("publisherId", form.publisherId);
      formData.append("yearOfPublication", form.yearOfPublication);
      formData.append("price", form.price);
      formData.append("quantity", form.quantity);
      formData.append("isDeleted", form.isDeleted);

      if (form.image instanceof File) {
        formData.append("imageFile", form.image);
      }

      let res;
      if (isEdit) {
        res = await axiosInstance.put(`${API_BASE}/${form.id}`, formData);
      } else {
        res = await axiosInstance.post(API_BASE, formData);
      }

      alert(res.data?.message || "Lưu thành công!");
      setModalVisible(false);
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi lưu sách!");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axiosInstance.delete(`${API_BASE}/${deleteId}`);
      alert(res.data?.message || "Xoá thành công!");
    } catch (err) {
      alert(err.response?.data?.message || "Xoá thất bại!");
    } finally {
      setDeleteId(null);
      fetchBooks();
    }
  };

  const toggleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  return (
    <div className="container mt-4">
      <h2>Danh sách sách</h2>
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-success" onClick={openAdd}>
          Thêm
        </button>
        <input
          className="form-control w-25"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm..."
        />
      </div>

      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th
              onClick={() => toggleSort("isbn")}
              style={{ cursor: "pointer" }}
            >
              ISBN {getSortIcon("isbn")}
            </th>
            <th
              onClick={() => toggleSort("title")}
              style={{ cursor: "pointer" }}
            >
              Tên {getSortIcon("title")}
            </th>
            <th
              onClick={() => toggleSort("authorName")}
              style={{ cursor: "pointer" }}
            >
              Tác giả {getSortIcon("authorName")}
            </th>
            <th
              onClick={() => toggleSort("categoryName")}
              style={{ cursor: "pointer" }}
            >
              Thể loại {getSortIcon("categoryName")}
            </th>
            <th
              onClick={() => toggleSort("publisherName")}
              style={{ cursor: "pointer" }}
            >
              NXB {getSortIcon("publisherName")}
            </th>
            <th
              onClick={() => toggleSort("yearOfPublication")}
              style={{ cursor: "pointer" }}
            >
              Năm {getSortIcon("yearOfPublication")}
            </th>
            <th
              onClick={() => toggleSort("price")}
              style={{ cursor: "pointer" }}
            >
              Giá {getSortIcon("price")}
            </th>
            <th
              onClick={() => toggleSort("quantity")}
              style={{ cursor: "pointer" }}
            >
              Số lượng {getSortIcon("quantity")}
            </th>
            <th
              onClick={() => toggleSort("isDeleted")}
              style={{ cursor: "pointer" }}
            >
              Đã xoá {getSortIcon("isDeleted")}
            </th>
            <th>Ảnh</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {books.length === 0 ? (
            <tr>
              <td colSpan={12} className="text-center">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            books.map((b, i) => (
              <tr key={b.id}>
                <td>{i + 1}</td>
                <td>{b.isbn}</td>
                <td>{b.title}</td>
                <td>{b.authorName}</td>
                <td>{b.categoryName}</td>
                <td>{b.publisherName}</td>
                <td>{b.yearOfPublication}</td>
                <td>{b.price}</td>
                <td>{b.quantity}</td>
                <td>
                  <input type="checkbox" checked={b.isDeleted} readOnly />
                </td>
                <td>
                  {b.image && (
                    <img
                      src={`http://localhost:5286/${b.image}`}
                      alt="book"
                      width={40}
                    />
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-info btn-sm me-2"
                    onClick={() => openEdit(b)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeleteId(b.id)}
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/** Modal thêm/sửa */}
      {modalVisible && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEdit ? "Sửa" : "Thêm"} sách</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalVisible(false)}
                ></button>
              </div>
              <div className="modal-body row g-3">
                {["isbn", "title"].map((field) => (
                  <div key={field} className="col-md-6">
                    <label className="form-label text-capitalize">
                      {field === "isbn" ? "ISBN" : "Tiêu đề"}
                    </label>
                    <input
                      className="form-control"
                      value={form[field] || ""}
                      onChange={(e) =>
                        setForm({ ...form, [field]: e.target.value })
                      }
                    />
                  </div>
                ))}

                {["category", "author", "publisher"].map((type) => (
                  <div key={type} className="col-md-6">
                    <label className="form-label text-capitalize">
                      {type === "author"
                        ? "Tác giả"
                        : type === "category"
                        ? "Thể loại"
                        : "Nhà xuất bản"}
                    </label>
                    <div className="d-flex gap-2">
                      <input
                        className="form-control"
                        value={form[`${type}Name`] || ""}
                        readOnly
                      />
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => openPopup(type)}
                      >
                        Chọn
                      </button>
                    </div>
                  </div>
                ))}

                {[
                  { field: "yearOfPublication", label: "Năm xuất bản" },
                  { field: "price", label: "Giá" },
                  { field: "quantity", label: "Số lượng" },
                ].map(({ field, label }) => (
                  <div key={field} className="col-md-6">
                    <label className="form-label">{label}</label>
                    <input
                      className="form-control"
                      value={form[field] || ""}
                      onChange={(e) =>
                        setForm({ ...form, [field]: e.target.value })
                      }
                    />
                  </div>
                ))}

                <div className="col-md-6">
                  <label className="form-label">Ảnh bìa</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setForm({ ...form, image: file });
                      setPreview(URL.createObjectURL(file));
                    }}
                  />
                  {preview && (
                    <img
                      src={preview}
                      alt="preview"
                      className="mt-2"
                      width={100}
                    />
                  )}
                </div>

                <div className="col-md-6 d-flex align-items-center">
                  <label className="form-label me-2">Đã xoá:</label>
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

      {/** Modal xác nhận xoá */}
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
                <p>Bạn có chắc chắn muốn xoá sách này?</p>
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

      <SelectPopup
        open={!!popupType}
        title={
          popupType === "author"
            ? "Chọn tác giả"
            : popupType === "category"
            ? "Chọn thể loại"
            : "Chọn nhà xuất bản"
        }
        rows={popupData}
        onSelect={handleSelect}
        onClose={() => setPopupType("")}
      />
    </div>
  );
}
