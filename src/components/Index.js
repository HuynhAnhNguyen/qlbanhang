import React, { useState, useEffect } from "react";
import { Card, Col, Row, Spinner, Table } from "react-bootstrap";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { fetchThongKe } from "../services/apiService";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const Index = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await fetchThongKe(token);
      if (data.resultCode === 0) {
        setStats(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError("Không thể tải dữ liệu thống kê");
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!stats) {
    return <div className="text-center py-4 text-muted">Không có dữ liệu</div>;
  }

  // Chart data
  const topProductsData = {
    labels: stats.top5Sanpham.map((product) => product.tensp),
    datasets: [
      {
        label: "Số lượng bán",
        data: stats.top5Sanpham.map((product) => product.tongSoLuongBan),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const productStatusData = {
    labels: ["Có sẵn", "Hết hàng"],
    datasets: [
      {
        data: [
          stats.sanpham.soSanphamAvailable,
          stats.sanpham.soSanpham - stats.sanpham.soSanphamAvailable,
        ],
        backgroundColor: ["#4BC0C0", "#FF6384"],
        hoverBackgroundColor: ["#4BC0C0", "#FF6384"],
      },
    ],
  };

  const employeeStatusData = {
    labels: ["Đang hoạt động", "Không hoạt động"],
    datasets: [
      {
        data: [
          stats.nhanvien.soNhanvienActive,
          stats.nhanvien.soNhanvien - stats.nhanvien.soNhanvienActive,
        ],
        backgroundColor: ["#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#36A2EB", "#FFCE56"],
      },
    ],
  };

  const revenueData = {
    labels: ["Hôm nay", "Tháng này", "Quý này"],
    datasets: [
      {
        label: "Doanh thu (VND)",
        data: [
          stats.doanhthu.homNay,
          stats.doanhthu.thangNay,
          stats.doanhthu.quyNay,
        ],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const formatCurrency = (value) => {
    return Number(value).toLocaleString("vi-VN") + " VND";
  };

  return (
    <div className="container-fluid p-0 position-relative d-flex flex-column min-vh-100">
      <div className="p-4 flex-grow-1">

        {/* Tổng hợp số liệu */}
        <div className="stats-grid mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Tổng sản phẩm</Card.Title>
              <Card.Text className="h4">{stats.sanpham.soSanpham}</Card.Text>
              <Card.Text className="text-success">
                {stats.sanpham.soSanphamAvailable} đang có sẵn
              </Card.Text>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <Card.Title>Tổng hóa đơn</Card.Title>
              <Card.Text className="h4">{stats.soHoadon}</Card.Text>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <Card.Title>Nhân viên</Card.Title>
              <Card.Text className="h4">{stats.nhanvien.soNhanvien}</Card.Text>
              <Card.Text className="text-success">
                {stats.nhanvien.soNhanvienActive} đang hoạt động
              </Card.Text>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <Card.Title>Khách hàng</Card.Title>
              <Card.Text className="h4">{stats.khachang.soKhachhang}</Card.Text>
              <Card.Text className="text-success">
                {stats.khachang.soKhachangActive} đang hoạt động
              </Card.Text>
            </Card.Body>
          </Card>
        </div>

        {/* Biểu đồ */}
        <Row className="mb-4">
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>Top 5 sản phẩm bán chạy</Card.Title>
                <Bar
                  data={topProductsData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card>
              <Card.Body>
                <Card.Title>Tình trạng sản phẩm</Card.Title>
                <Pie
                  data={productStatusData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                    },
                  }}
                />
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card>
              <Card.Body>
                <Card.Title>Trạng thái nhân viên</Card.Title>
                <Pie
                  data={employeeStatusData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                    },
                  }}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Doanh thu */}
        <Row className="mb-4">
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>Doanh thu</Card.Title>
                <Bar
                  data={revenueData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return formatCurrency(context.raw);
                          },
                        },
                      },
                    },
                  }}
                />
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>Chi tiết doanh thu</Card.Title>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Kỳ</th>
                      <th>Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Hôm nay</td>
                      <td className="text-end text-black">
                        {formatCurrency(stats.doanhthu.homNay)}
                      </td>
                    </tr>
                    <tr>
                      <td>Tháng này</td>
                      <td className="text-end text-black">
                        {formatCurrency(stats.doanhthu.thangNay)}
                      </td>
                    </tr>
                    <tr>
                      <td>Quý này</td>
                      <td className="text-end text-black">
                        {formatCurrency(stats.doanhthu.quyNay)}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Top sản phẩm bán chạy */}
        <Row>
          <Col md={12}>
            <Card>
              <Card.Body>
                <Card.Title>Top 5 sản phẩm bán chạy</Card.Title>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Mã SP</th>
                      <th>Tên sản phẩm</th>
                      <th>Đơn vị tính</th>
                      <th>Giá bán</th>
                      <th>Số lượng đã bán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.top5Sanpham.map((product, index) => (
                      <tr key={index}>
                        <td>{product.masp}</td>
                        <td>{product.tensp}</td>
                        <td>{product.dvt}</td>
                        <td className="text-end text-black">
                          {formatCurrency(product.gia)}
                        </td>
                        <td className="text-end text-black">
                          {product.tongSoLuongBan}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Index;
