import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, background: '#f6f6f6', padding: 24 }}>
        <Outlet />
      </div>
    </div>
  );
}
