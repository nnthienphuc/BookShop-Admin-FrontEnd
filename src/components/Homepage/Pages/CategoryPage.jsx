import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';

const API_BASE = 'http://localhost:5286/api/admin/categories';

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ id: '', name: '', isDeleted: false });
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

  const fetchCategories = async () => {
    try {
      const url = search
        ? `${API_BASE}/search?keyword=${encodeURIComponent(search)}`
        : API_BASE;
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

      setCategories(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể tải dữ liệu!');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search, sortConfig]);

  const openAdd = () => {
    setForm({ id: '', name: '', isDeleted: false });
    setIsEdit(false);
    setModalVisible(true);
  };

  const openEdit = (cat) => {
    setForm(cat);
    setIsEdit(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        Name: form.name,
        IsDeleted: form.isDeleted
      };

      if (isEdit) {
        await axiosInstance.put(`${API_BASE}/${form.id}`, payload);
      } else {
        await axiosInstance.post(API_BASE, payload);
      }

      alert('Lưu thành công!');
      setModalVisible(false);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`${API_BASE}/${deleteId}`);
      alert('Xoá thành công!');
    } catch (err) {
      alert(err.response?.data?.message || 'Xoá thất bại!');
    } finally {
      setDeleteId(null);
      fetchCategories();
    }
  };

  const toggleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  return (
    <div className="container mt-4">
      <h2>Danh sách Danh mục sách</h2>
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-success" onClick={openAdd}>Thêm</button>
        <input
          type="text"
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
            <th onClick={() => toggleSort('id')} style={{ cursor: 'pointer' }}>
              ID {getSortIcon('id')}
            </th>
            <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer' }}>
              Tên {getSortIcon('name')}
            </th>
            <th onClick={() => toggleSort('isDeleted')} style={{ cursor: 'pointer' }}>
              Đã xoá {getSortIcon('isDeleted')}
            </th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr><td colSpan={5} className="text-center">Không có dữ liệu</td></tr>
          ) : (
            categories.map((cat, i) => (
              <tr key={cat.id}>
                <td>{i + 1}</td>
                <td>{cat.id}</td>
                <td>{cat.name}</td>
                <td><input type="checkbox" checked={cat.isDeleted} readOnly /></td>
                <td>
                  <button className="btn btn-info btn-sm me-2" onClick={() => openEdit(cat)}>Sửa</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(cat.id)}>Xoá</button>
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
                <h5 className="modal-title">{isEdit ? 'Sửa' : 'Thêm'} danh mục</h5>
                <button type="button" className="btn-close" onClick={() => setModalVisible(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Tên danh mục"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={form.isDeleted}
                    onChange={(e) => setForm({ ...form, isDeleted: e.target.checked })}
                    id="isDeletedCheck"
                  />
                  <label className="form-check-label" htmlFor="isDeletedCheck">
                    Đã xoá
                  </label>
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

      {/* Modal Xoá */}
      {deleteId && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận xoá</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteId(null)}></button>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc chắn muốn xoá danh mục này?</p>
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
