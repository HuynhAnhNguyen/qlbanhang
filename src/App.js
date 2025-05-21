import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import QuanLySanPham from "./pages/QuanLySanPham";
import QuanLyKhuyenMai from "./pages/QuanLyKhuyenMai";
import QuanLyKhachHang from "./pages/QuanLyKhachHang";
import QuanLyNhanVien from "./pages/QuanLyNhanVien";
import QuanLyLichSu from "./pages/QuanLyLichSu";
import QuanLyHoaDon from "./pages/QuanLyHoaDon";
import Swal from "sweetalert2";

// ProtectedRoute component to handle role-based access
const ProtectedRoute = ({ element, allowedRoles }) => {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/dang-nhap" replace />;
  }

  // If role is not allowed, redirect to home
  if (allowedRoles && !allowedRoles.includes(role)) {
    Swal.fire("Lỗi!", "Bạn không có quyền truy cập!", "error");
    return <Navigate to="/" replace />;
  }

  return element;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dang-nhap" element={<Login />} />
        <Route path="/trang-chu" element={<Home />} />
        <Route path="/quan-ly-san-pham" element={<ProtectedRoute element={<QuanLySanPham />} allowedRoles={["ROLE_ADMIN", "ROLE_SALE"]} />} />
        <Route path="/quan-ly-khuyen-mai" element={<ProtectedRoute element={<QuanLyKhuyenMai />} allowedRoles={["ROLE_ADMIN", "ROLE_SALE"]} />} />
        <Route path="/quan-ly-khach-hang" element={<ProtectedRoute element={<QuanLyKhachHang />} allowedRoles={["ROLE_ADMIN", "ROLE_SALE"]} />} />
        <Route path="/quan-ly-nhan-vien" element={<ProtectedRoute element={<QuanLyNhanVien />} allowedRoles={["ROLE_ADMIN"]} />} />
        <Route path="/quan-ly-hoa-don" element={<ProtectedRoute element={<QuanLyHoaDon />} allowedRoles={["ROLE_ADMIN", "ROLE_SALE"]} />} />
        <Route path="/quan-ly-lich-su" element={<ProtectedRoute element={<QuanLyLichSu />} allowedRoles={["ROLE_ADMIN", "ROLE_SALE"]} />} />
        <Route path="*" element={<NotFound />} /> {/* Replace /222 with wildcard */}
        {/* <Route path="/quan-ly-san-pham" element={<QuanLySanPham />} /> */}
        {/* <Route path="/quan-ly-khuyen-mai" element={<QuanLyKhuyenMai />} />
        <Route path="/quan-ly-khach-hang" element={<QuanLyKhachHang />} />
        <Route path="/quan-ly-nhan-vien" element={<QuanLyNhanVien />} />
        <Route path="/quan-ly-hoa-don" element={<QuanLyHoaDon />} />
        <Route path="/quan-ly-lich-su" element={<QuanLyLichSu />} />
        <Route path="/222" element={<NotFound />} /> */}
        
      </Routes>
    </Router>
  );
};

export default App;
