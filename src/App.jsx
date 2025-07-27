import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/Homepage/AdminLayout';
import CategoryPage from './components/Homepage/Pages/CategoryPage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ForgotPasswordForm from './components/ForgotPassword';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/forgot-password" element={<ForgotPasswordForm />} />
      {/* Admin layout - chứa các trang con */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="category" element={<CategoryPage />} />
        {/* Thêm các route con ở đây nếu cần */}
      </Route>
      {/* Redirect tất cả đường dẫn không hợp lệ về /admin/category */}
      <Route path="*" element={<Navigate to="/admin/category" />} />
    </Routes>
  );
}

export default App;
