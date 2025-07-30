import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import SelectPopup from "./SelectPopup";

const API_BASE = 'http://localhost:5286/api/admin/books';

export default function BookPage() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    id: '', isbn: '', title: '', categoryId: '', authorId: '', publisherId: '',
    yearOfPublication: '', price: '', quantity: '', isDeleted: false, image: null
  });
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

  const [popupType, setPopupType] = useState('');
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
          if (typeof aVal === 'string') aVal = aVal.toLowerCase();
          if (typeof bVal === 'string') bVal = bVal.toLowerCase();
          if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }

      setBooks(data);
    } catch (err) {
      alert('Không thể tải sách!');
    }
  };

  const fetchPopupData = async (type) => {
    const urlMap = {
      author: "http://localhost:5286/api/admin/authors",
      category: "http://localhost:5286/api/admin/categories",
      publisher: "http://localhost:5286/api/admin/publishers",
    };
    const res = await axiosInstance.get(urlMap[type]);
    setPopupData(res.data);
  };

  const openPopup = (type) => {
    setPopupType(type);
    fetchPopupData(type);
  };

  const handleSelect = (item) => {
    const fieldMap = {
      author: "authorId",
      category: "categoryId",
      publisher: "publisherId",
    };
    setForm({ ...form, [fieldMap[popupType]]: item.id });
    setPopupType("");
  };

  useEffect(() => { fetchBooks(); }, [search, sortConfig]);

  const openAdd = () => {
    setForm({ id: '', isbn: '', title: '', categoryId: '', authorId: '', publisherId: '', yearOfPublication: '', price: '', quantity: '', isDeleted: false, image: null });
    setPreview(null);
    setIsEdit(false);
    setModalVisible(true);
  };

  const openEdit = (book) => {
    setForm(book);
    setPreview(book.image ? `http://localhost:5286/${book.image}` : null);
    setIsEdit(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'image') formData.append(key, value);
      });
      if (form.image instanceof File) {
        formData.append('imageFile', form.image);
      }

      if (isEdit) {
        await axiosInstance.put(`${API_BASE}/${form.id}`, formData);
      } else {
        await axiosInstance.post(API_BASE, formData);
      }

      alert('Lưu thành công!');
      setModalVisible(false);
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi lưu sách!');
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`${API_BASE}/${deleteId}`);
      alert('Xoá thành công!');
    } catch (err) {
      alert('Xoá thất bại!');
    } finally {
      setDeleteId(null);
      fetchBooks();
    }
  };

  const toggleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  return (
    <div className="container mt-4">
      <h2>Danh sách sách</h2>
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-success" onClick={openAdd}>Thêm</button>
        <input className="form-control w-25" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm..." />
      </div>

      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th onClick={() => toggleSort('isbn')} style={{ cursor: 'pointer' }}>ISBN {getSortIcon('isbn')}</th>
            <th onClick={() => toggleSort('title')} style={{ cursor: 'pointer' }}>Tên {getSortIcon('title')}</th>
            <th>Tác giả</th>
            <th>Thể loại</th>
            <th>NXB</th>
            <th>Năm</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Ảnh</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {books.length === 0 ? <tr><td colSpan={11} className="text-center">Không có dữ liệu</td></tr> :
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
                <td>{b.image && <img src={`http://localhost:5286/${b.image}`} alt="book" width={40} />}</td>
                <td>
                  <button className="btn btn-info btn-sm me-2" onClick={() => openEdit(b)}>Sửa</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(b.id)}>Xoá</button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {modalVisible && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEdit ? 'Sửa' : 'Thêm'} sách</h5>
                <button type="button" className="btn-close" onClick={() => setModalVisible(false)}></button>
              </div>
              <div className="modal-body row g-3">
                {['isbn', 'title'].map(field => (
                  <div key={field} className="col-md-6">
                    <input className="form-control" placeholder={field} value={form[field] || ''} onChange={e => setForm({ ...form, [field]: e.target.value })} />
                  </div>
                ))}

                {['category', 'author', 'publisher'].map(type => (
                  <div key={type} className="col-md-6 d-flex gap-2 align-items-center">
                    <input className="form-control" placeholder={`${type}Id`} value={form[`${type}Id`] || ''} readOnly />
                    <button className="btn btn-outline-primary" onClick={() => openPopup(type)}>Chọn</button>
                  </div>
                ))}

                {['yearOfPublication', 'price', 'quantity'].map(field => (
                  <div key={field} className="col-md-6">
                    <input className="form-control" placeholder={field} value={form[field] || ''} onChange={e => setForm({ ...form, [field]: e.target.value })} />
                  </div>
                ))}

                <div className="col-md-6">
                  <label>Ảnh:</label>
                  <input type="file" className="form-control" onChange={e => {
                    const file = e.target.files[0];
                    setForm({ ...form, image: file });
                    setPreview(URL.createObjectURL(file));
                  }} />
                  {preview && <img src={preview} alt="preview" className="mt-2" width={100} />}
                </div>

                <div className="col-md-6 d-flex align-items-center">
                  <label className="form-check-label me-2">Đã xoá:</label>
                  <input type="checkbox" checked={form.isDeleted} onChange={e => setForm({ ...form, isDeleted: e.target.checked })} />
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

      {deleteId && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận xoá</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteId(null)}></button>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc chắn muốn xoá sách này?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Huỷ</button>
                <button className="btn btn-danger" onClick={handleDelete}>Xoá</button>
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
