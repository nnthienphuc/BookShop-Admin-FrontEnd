import React, { useState } from 'react';
import axios from 'axios';
import {
  MDBBtn, MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody,
  MDBCardImage, MDBInput, MDBIcon, MDBRadio
} from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';

export default function RegisterForm() {
  // const navigate = useNavigate(); // no longer needed
  const [formData, setFormData] = useState({
    email: '',
    fullname: '',
    phone: '',
    password: '',
    gender: true,
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'radio' ? value === 'true' : value,
    });
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5157/api/auth/register', formData);
      setMessage(res.data.message || 'Đăng ký thành công!');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MDBContainer fluid className="my-5">
      <MDBCard className="text-black" style={{ borderRadius: '25px' }}>
        <MDBCardBody>
          <MDBRow>
            {/* FORM */}
            <MDBCol md="10" lg="6" className="order-2 order-lg-1 d-flex flex-column align-items-center">
              <p className="text-center h1 fw-bold mb-3 mt-4">STAFF REGISTER</p>
              <form onSubmit={handleSubmit} className="w-100 px-4">

                <div className="d-flex align-items-center mb-4">
                  <MDBIcon fas icon="user me-3" size="lg" />
                  <MDBInput
                    label="Full Name"
                    id="fullname"
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    required
                    className="w-100 text-black"
                  />
                </div>

                <div className="d-flex align-items-center mb-4">
                  <MDBIcon fas icon="envelope me-3" size="lg" />
                  <MDBInput
                    label="Email"
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="text-black"
                  />
                </div>

                <div className="d-flex align-items-center mb-4">
                  <MDBIcon fas icon="phone-alt me-3" size="lg" />
                  <MDBInput
                    label="Phone Number"
                    id="phone"
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="text-black"
                  />
                </div>

                <div className="d-flex align-items-center mb-4">
                  <MDBIcon fas icon="lock me-3" size="lg" />
                  <MDBInput
                    label="Password"
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="text-black"
                  />
                </div>

                <div className="mb-4 text-start">
                  <label className="me-4">Gender:</label>
                  <MDBRadio
                    name="gender"
                    label="Male"
                    value="true"
                    checked={formData.gender === true}
                    onChange={handleChange}
                    inline
                  />
                  <MDBRadio
                    name="gender"
                    label="Female"
                    value="false"
                    checked={formData.gender === false}
                    onChange={handleChange}
                    inline
                  />
                </div>

                <MDBBtn type="submit" className="mb-3" size="lg" disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </MDBBtn>
                {error && <p className="text-danger text-center">{error}</p>}
                {message && <p className="text-success text-center">{message}</p>}
              </form>
            </MDBCol>

            {/* IMAGE */}
            <MDBCol md="10" lg="6" className="order-1 order-lg-2 d-flex align-items-center">
              <MDBCardImage
                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-registration/draw1.webp"
                fluid
              />
            </MDBCol>
          </MDBRow>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
}
