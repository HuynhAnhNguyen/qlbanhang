import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import QuanLySanPham from "./pages/QuanLySanPham";
import QuanLyKhuyenMai from "./pages/QuanLyKhuyenMai";
import QuanLyKhachHang from "./pages/QuanLyKhachHang";
import QuanLyNhanVien from "./pages/QuanLyNhanVien";
import QuanLyLichSu from "./pages/QuanLyLichSu";
import QuanLyHoaDon from "./pages/QuanLyHoaDon";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/dang-nhap" element={<Login />} />
        <Route path="/trang-chu" element={<Home />} />
        <Route path="/quan-ly-san-pham" element={<QuanLySanPham />} />
        <Route path="/quan-ly-khuyen-mai" element={<QuanLyKhuyenMai />} />
        <Route path="/quan-ly-khach-hang" element={<QuanLyKhachHang />} />
        <Route path="/quan-ly-nhan-vien" element={<QuanLyNhanVien />} />
        <Route path="/quan-ly-hoa-don" element={<QuanLyHoaDon />} />
        <Route path="/quan-ly-lich-su" element={<QuanLyLichSu />} />

        {/* Protected routes */}
        {/* <Route element={<ProtectedRoute roles={["ROLE_ADMIN", "ROLE_USER"]} />}>
          <Route path="/trang-chu" element={<AdminHome />} />
          <Route path="/quan-ly-tin-tuc" element={<QuanLyTinTuc />} />
          <Route path="/quan-ly-dang-vien" element={<QuanLyDangVien />} />
          <Route path="/quan-ly-chi-bo" element={<QuanLyChiBo />} />
          <Route path="/quan-ly-ho-so" element={<QuanLyHoSo />} />
          <Route path="/quan-ly-ky-dang-phi" element={<QuanLyKyDangPhi />} />
          <Route path="/quan-ly-dang-phi" element={<QuanLyDangPhi />} />
          <Route path="/quan-ly-phe-duyet" element={<QuanLyPheDuyet />} />
          <Route path="/bao-cao-thong-ke" element={<BaoCaoThongKe />} />
        </Route> */}

        {/* Admin only routes */}
        {/* <Route element={<ProtectedRoute roles={["ROLE_ADMIN"]} />}>
          <Route path="/sao-luu-khoi-phuc" element={<SaoLuuKhoiPhuc />} />
          <Route path="/quan-ly-tai-khoan" element={<QuanLyTaiKhoan />} />
        </Route> */}

        {/* 404 page */}
        {/* Xử lý route không tồn tại khi đã đăng nhập */}
        {/* <Route 
          path="*" 
          element={
            localStorage.getItem("token") ? <AuthenticatedNotFound /> : <NotFound /> 
          } 
        /> */}
      </Routes>
    </Router>
  );
};

export default App;
