import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/Homepage/AdminLayout';
import CategoryPage from './components/Homepage/Pages/CategoryPage';
import AuthorPage from './components/Homepage/Pages/AuthorPage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ForgotPasswordForm from './components/ForgotPassword';
import PublisherPage from './components/Homepage/Pages/PublisherPage';


function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/forgot-password" element={<ForgotPasswordForm />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route path="category" element={<CategoryPage />} />
        <Route path="author" element={<AuthorPage />} />
        <Route path="publisher" element={<PublisherPage />} />

      </Route>

      <Route path="*" element={<Navigate to="/admin/category" />} />
    </Routes>
  );
}

export default App;
