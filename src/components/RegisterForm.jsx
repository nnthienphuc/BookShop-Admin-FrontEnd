import React, { useState } from 'react';
import axios from 'axios';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    fullname: '',
    phone: '',
    password: '',
    gender: true, // true = Nam, false = Nữ
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Chuyển đổi gender thành boolean
    if (name === 'gender') {
      setFormData({ ...formData, gender: value === 'true' });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
  
    console.log("Submitting:", formData); // 👈 log kiểm tra
  
    try {
      const res = await axios.post('http://localhost:5157/api/auth/register', formData);
      console.log("API Response:", res); // 👈 log kiểm tra
      setMessage(res.data.message || 'Đăng ký thành công!');
    } catch (err) {
      console.log("API Error:", err); // 👈 log kiểm tra
      setError(err.response?.data?.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-xl px-8 py-10 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Đăng ký tài khoản</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Họ và tên</label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="abc@example.com"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0123456789"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Giới tính</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="true">Nam</option>
              <option value="false">Nữ</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        {message && <p className="mt-4 text-green-600 text-center text-sm">{message}</p>}
        {error && <p className="mt-4 text-red-600 text-center text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default RegisterForm;
