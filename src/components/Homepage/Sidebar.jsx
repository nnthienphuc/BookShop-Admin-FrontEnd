import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { label: 'Sách', path: '/admin/book' },
  { label: 'Đơn hàng', path: '/admin/order' },
  { label: 'Thể loại sách', path: '/admin/category' },
  { label: 'Khách hàng', path: '/admin/customer' },
  { label: 'Giảm giá', path: '/admin/promotion' },
  { label: 'Tác giả', path: '/admin/author' },
  { label: 'Nhà xuất bản', path: '/admin/publisher' },
  { label: 'Đăng xuất', path: '/login' },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  return (
    <div style={{
      width: 220, background: '#176264', color: '#fff', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', padding: 24
    }}>
      <h2 style={{ fontWeight: 'bold', marginBottom: 36 }}>BOOK STORE 🟩</h2>
      {menuItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          style={{
            color: pathname.startsWith(item.path) ? '#ffd700' : '#fff',
            padding: '12px 0',
            textDecoration: 'none',
            fontWeight: pathname.startsWith(item.path) ? 'bold' : 400,
            display: 'block'
          }}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
