import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import {
  MDBBtn, MDBTable, MDBTableHead, MDBTableBody, MDBInput, MDBIcon, MDBModal, MDBModalDialog,
  MDBModalContent, MDBModalHeader, MDBModalTitle, MDBModalBody, MDBModalFooter, MDBSpinner
} from 'mdb-react-ui-kit';

const API_BASE = 'http://localhost:5286/api/admin/categories';

const SORTS = {
  id: 'id',
  name: 'name',
  isDeleted: 'isDeleted'
};

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentCategory, setCurrentCategory] = useState({ id: '', name: '', isDeleted: false });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // SORT state
  const [sortBy, setSortBy] = useState(SORTS.id);
  const [sortOrder, setSortOrder] = useState('asc');

  // Lấy danh sách category
  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      let url = search
        ? `${API_BASE}/search?keyword=${encodeURIComponent(search)}`
        : API_BASE;
      const res = await axiosInstance.get(url);
      setCategories(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, [search]);

  // SORT logic
  const sortedCategories = React.useMemo(() => {
    let sorted = [...categories];
    if (sortBy === SORTS.id) {
      sorted.sort((a, b) =>
        sortOrder === 'asc'
          ? a.id.localeCompare(b.id)
          : b.id.localeCompare(a.id)
      );
    } else if (sortBy === SORTS.name) {
      sorted.sort((a, b) =>
        sortOrder === 'asc'
          ? a.name.localeCompare(b.name, 'vi')
          : b.name.localeCompare(a.name, 'vi')
      );
    } else if (sortBy === SORTS.isDeleted) {
      sorted.sort((a, b) =>
        sortOrder === 'asc'
          ? Number(a.isDeleted) - Number(b.isDeleted)
          : Number(b.isDeleted) - Number(a.isDeleted)
      );
    }
    return sorted;
  }, [categories, sortBy, sortOrder]);

  // Xử lý khi click tiêu đề cột để sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Render icon mũi tên sort cạnh cột
  const renderSortIcon = (field) => {
  // Mũi tên xám khi không sort
  if (sortBy !== field)
    return (
      <svg style={{ marginLeft: 6, opacity: 0.25, verticalAlign: 'middle' }} width="20" height="20">
        <path d="M5 13h10l-5 5z" fill="currentColor" />
        <path d="M5 7h10l-5-5z" fill="currentColor" opacity="0.5" />
      </svg>
    );
  // Mũi tên xanh khi đang sort
  return sortOrder === 'asc'
    ? (
      <svg style={{ marginLeft: 6, verticalAlign: 'middle' }} width="20" height="20">
        <path d="M5 13h10l-5 5z" fill="#16a34a" />
        <path d="M5 7h10l-5-5z" fill="#d1d5db" opacity="0.2" />
      </svg>
    )
    : (
      <svg style={{ marginLeft: 6, verticalAlign: 'middle' }} width="20" height="20">
        <path d="M5 7h10l-5-5z" fill="#16a34a" />
        <path d="M5 13h10l-5 5z" fill="#d1d5db" opacity="0.2" />
      </svg>
    );
};


  // Mở modal thêm mới
  const openAddModal = () => {
    setModalMode('add');
    setCurrentCategory({ id: '', name: '', isDeleted: false });
    setShowModal(true);
    setError('');
  };

  // Mở modal sửa
  const openEditModal = (cat) => {
    setModalMode('edit');
    setCurrentCategory({ id: cat.id, name: cat.name, isDeleted: cat.isDeleted });
    setShowModal(true);
    setError('');
  };

  // Thêm/Sửa
  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      if (modalMode === 'add') {
        await axiosInstance.post(API_BASE, {
          name: currentCategory.name,
          isDeleted: currentCategory.isDeleted
        });
      } else {
        await axiosInstance.put(`${API_BASE}/${currentCategory.id}`, {
          name: currentCategory.name,
          isDeleted: currentCategory.isDeleted
        });
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi thao tác!');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Xác nhận xoá
  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  // Thực hiện xoá
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`${API_BASE}/${deleteId}`);
      setDeleteId('');
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xoá!');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Hiển thị từng dòng trong bảng
  const renderRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={6} className="text-center">
            <MDBSpinner color="primary" />
          </td>
        </tr>
      );
    }
    if (sortedCategories.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="text-center">Không có dữ liệu</td>
        </tr>
      );
    }
    return sortedCategories.map((cat, idx) => (
      <tr key={cat.id}>
        <td>{idx + 1}</td>
        <td>{cat.id}</td>
        <td>{cat.name}</td>
        <td>
          <span
            style={{
              display: 'inline-block',
              width: 24,
              height: 24,
              border: '2px solid #16a34a',
              borderRadius: 4,
              background: '#fff',
              position: 'relative'
            }}
          >
            {cat.isDeleted && (
              <span
                style={{
                  display: 'block',
                  width: 14,
                  height: 14,
                  background: 'transparent',
                  position: 'absolute',
                  left: 3,
                  top: 1
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" style={{ display: 'block' }}>
                  <polyline
                    points="3.5 8.5 7 12 12.5 5.5"
                    style={{
                      fill: 'none',
                      stroke: '#16a34a',
                      strokeWidth: 2,
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round'
                    }}
                  />
                </svg>
              </span>
            )}
          </span>
        </td>
        <td>
          <MDBBtn size="sm" color="info" onClick={() => openEditModal(cat)}>
            <MDBIcon icon="edit" className="me-1" /> Sửa
          </MDBBtn>{' '}
          <MDBBtn size="sm" color="danger" onClick={() => confirmDelete(cat.id)}>
            <MDBIcon icon="trash" className="me-1" /> Xoá
          </MDBBtn>
        </td>
      </tr>
    ));
  };

  return (
    <div>
      <h2 className="mb-4" style={{ fontWeight: 700 }}>Danh mục sách</h2>
      <div className="d-flex mb-3 align-items-center" style={{ gap: 8 }}>
        <MDBBtn
          color="success"
          size="sm"
          onClick={openAddModal}
          style={{ fontWeight: 600, height: 36, padding: '0 18px', fontSize: 15, whiteSpace: 'nowrap' }}
        >
          <MDBIcon icon="plus" /> Thêm mới
        </MDBBtn>
        <MDBInput
          label="Tìm kiếm..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 250 }}
          className="me-2"
        />
        {loading && <MDBSpinner size="sm" color="primary" />}
      </div>
      <MDBTable hover>
        <MDBTableHead>
          <tr>
            <th>#</th>
            <th
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => handleSort(SORTS.id)}
            >
              Id {renderSortIcon(SORTS.id)}
            </th>
            <th
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => handleSort(SORTS.name)}
            >
              Tên danh mục {renderSortIcon(SORTS.name)}
            </th>
            <th
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => handleSort(SORTS.isDeleted)}
            >
              Đã xóa {renderSortIcon(SORTS.isDeleted)}
            </th>
            <th>Thao tác</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {renderRows()}
        </MDBTableBody>
      </MDBTable>
      {error && <p className="text-danger text-center mt-3">{error}</p>}

      {/* Modal Thêm/Sửa */}
      <MDBModal show={showModal} setShow={setShowModal} tabIndex='-1'>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>{modalMode === 'add' ? 'Thêm danh mục' : 'Sửa danh mục'}</MDBModalTitle>
              <MDBBtn className='btn-close' color='none' onClick={() => setShowModal(false)}></MDBBtn>
            </MDBModalHeader>
            <form onSubmit={handleSave}>
              <MDBModalBody>
                <MDBInput
                  label="Tên danh mục"
                  value={currentCategory.name}
                  required
                  onChange={e => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                  className="mb-3"
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label>Đã xóa: </label>
                  <input
                    type="checkbox"
                    checked={currentCategory.isDeleted}
                    onChange={e => setCurrentCategory({ ...currentCategory, isDeleted: e.target.checked })}
                    style={{ width: 20, height: 20, accentColor: '#16a34a', border: '2px solid #16a34a' }}
                  />
                </div>
                {error && <div className="text-danger">{error}</div>}
              </MDBModalBody>
              <MDBModalFooter>
                <MDBBtn color="secondary" onClick={() => setShowModal(false)}>Huỷ</MDBBtn>
                <MDBBtn type="submit" color="primary" disabled={submitLoading}>
                  {submitLoading ? <MDBSpinner size="sm" color="light" /> : 'Lưu'}
                </MDBBtn>
              </MDBModalFooter>
            </form>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* Confirm Xoá */}
      <MDBModal show={!!deleteId} setShow={() => setDeleteId('')} tabIndex='-1'>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Xác nhận xoá</MDBModalTitle>
              <MDBBtn className='btn-close' color='none' onClick={() => setDeleteId('')}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              Bạn có chắc chắn muốn xoá danh mục này?
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn color="secondary" onClick={() => setDeleteId('')}>Huỷ</MDBBtn>
              <MDBBtn color="danger" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? <MDBSpinner size="sm" color="light" /> : 'Xoá'}
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </div>
  );
}
