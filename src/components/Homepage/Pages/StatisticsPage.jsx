import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";

export default function StatisticsPage() {
  const [data, setData] = useState({
    totalOrders: 0,
    totalBooksSold: 0,
    totalRevenue: 0,
    revenueByDate: {}
  });
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchStatistics = async () => {
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await axiosInstance.get("http://localhost:5286/api/admin/statistics/revenue", { params });
      setData({
        totalOrders: res.data?.totalOrders ?? 0,
        totalBooksSold: res.data?.totalBooksSold ?? 0,
        totalRevenue: res.data?.totalRevenue ?? 0,
        revenueByDate: res.data?.revenueByDate ?? {}
      });
    } catch (err) {
      alert("Lỗi tải dữ liệu thống kê.");
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  return (
    <div className="container mt-4">
      <h3>Thống kê Doanh thu</h3>
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <label>Từ ngày:</label>
          <input type="date" className="form-control" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div className="col-md-3">
          <label>Đến ngày:</label>
          <input type="date" className="form-control" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <div className="col-md-3 d-flex align-items-end">
          <button className="btn btn-primary" onClick={fetchStatistics}>Lọc</button>
        </div>
      </div>

      <div className="row text-center mb-3">
        <div className="col">
          <h5>Tổng đơn hàng</h5>
          <p>{data.totalOrders}</p>
        </div>
        <div className="col">
          <h5>Tổng sách đã bán</h5>
          <p>{data.totalBooksSold}</p>
        </div>
        <div className="col">
          <h5>Tổng doanh thu</h5>
          <p>{data.totalRevenue.toLocaleString()} ₫</p>
        </div>
      </div>

      <h5>Doanh thu theo ngày:</h5>
      <table className="table table-bordered">
        <thead>
          <tr><th>Ngày</th><th>Doanh thu</th></tr>
        </thead>
        <tbody>
          {data.revenueByDate && Object.keys(data.revenueByDate).length > 0 ? (
            Object.entries(data.revenueByDate).map(([date, amount]) => (
              <tr key={date}>
                <td>{new Date(date).toLocaleDateString('vi-VN')}</td>
                <td>{amount.toLocaleString('vi-VN')} ₫</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2">Không có dữ liệu</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
