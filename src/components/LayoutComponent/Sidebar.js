import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { changePassword } from "../../services/apiService";
import ChangePwModal from "../ChangePwModal";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [fullname, setFullname] = useState("");
  const [role, setRole] = useState("");
  const [activePath, setActivePath] = useState("");

  const [showChangePwModal, setShowChangePwModal] = useState(false);
  const [changePwData, setChangePwData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const storedRole = localStorage.getItem("role");
  const storedFullname = localStorage.getItem("fullname");

  let displayRole;
  switch (storedRole) {
    case "ROLE_ADMIN":
      displayRole = "Quản trị viên";
      break;
    case "ROLE_SALE":
      displayRole = "Nhân viên bán hàng";
      break;
    default:
      displayRole = "Chưa xác định";
  }

  const handleShowChangePwModal = async () => {
    const result = await Swal.fire({
      title: "Xác nhận đổi mật khẩu",
      text: "Bạn có chắc chắn muốn đổi mật khẩu?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Đổi mật khẩu",
      cancelButtonText: "Hủy",
    });
    if (result.isConfirmed) {
      setShowChangePwModal(true);
      // Reset form khi mở modal
      setChangePwData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setValidationErrors({});
    }
  };

  // Validate change password form
  const validateChangePassword = () => {
    const errors = {};

    if (!changePwData.currentPassword) {
      errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }
    if (!changePwData.newPassword) {
      errors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (changePwData.newPassword.length < 6) {
      errors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!changePwData.confirmNewPassword) {
      errors.confirmNewPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (changePwData.newPassword !== changePwData.confirmNewPassword) {
      errors.confirmNewPassword = "Mật khẩu không khớp";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Change password
  const handleChangePassword = async () => {
    if (!validateChangePassword()) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ thông tin mật khẩu", "error");
      return;
    }

    try {
      setLoading(true);
      const data = await changePassword(token, username, changePwData);
      if (data.resultCode === 0) {
        setShowChangePwModal(false);
        Swal.fire("Thành công!", "Đổi mật khẩu thành công", "success");
      } else {
        throw new Error(data.message || "Đổi mật khẩu thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Đổi mật khẩu thất bại", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cập nhật active path khi location thay đổi
    setActivePath(location.pathname);

    // Kiểm tra token, nếu không có thì chuyển hướng về trang login
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/dang-nhap");
    } else {
      // Lấy fullname và role từ localStorage
      setFullname(storedFullname);
      setRole(displayRole);
      // setFullname(localStorage.getItem("fullname") || "Người dùng");
      // setRole(localStorage.getItem("role") || "Chưa xác định");
    }
  }, [navigate, location]);

  const handleLogout = () => {
    Swal.fire({
      title: "Xác nhận đăng xuất",
      text: "Bạn có chắc chắn muốn đăng xuất?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        // Xóa tất cả dữ liệu trong localStorage
        localStorage.clear();
        // Hiển thị thông báo đăng xuất thành công
        Swal.fire({
          title: "Đã đăng xuất",
          text: "Bạn đã đăng xuất thành công",
          icon: "success",
          timer: 1500, // Tự động đóng sau 1.5 giây
          showConfirmButton: false,
        }).then(() => {
          // Chuyển hướng về trang đăng nhập sau khi hiển thị thông báo
          navigate("/");
        });
      }
    });
  };

  // Hàm kiểm tra active menu
  const isActive = (path) => {
    return activePath === path ? "active" : "";
  };

  return (
    <nav id="sidebar" className="sidebar js-sidebar">
      <div className="sidebar-content js-simplebar p-2">
        <a
          className="sidebar-brand d-block text-center"
          onClick={() => navigate("/")}
        >
          <img
            className="logo-sidebar"
            src="/assets/images/logo/logo.svg"
            alt="Logo"
          />
        </a>

        <ul className="sidebar-nav">
          <li className="sidebar-item">
            <a className="sidebar-link sidebar-link-static d-flex align-items-center">
              <i className="fa-solid fa-user"></i>
              <div className="d-flex flex-column ms-2">
                <span className="read-only-text">Xin chào</span>
                <span className="read-only-text">{fullname}</span>
              </div>
            </a>
          </li>

          <li className="sidebar-item">
            <a className="sidebar-link sidebar-link-static">
              <i className="fa-solid fa-user-gear"></i>
              <span className="align-middle read-only-text">{role}</span>
            </a>
          </li>

          <hr style={{ color: "#fff" }} />
          <li className={`sidebar-item ${isActive("/")}`}>
            <a className="sidebar-link" onClick={() => navigate("/")}>
              <i className="fa-solid fa-home"></i>
              <span className="align-middle">Trang chủ</span>
            </a>
          </li>

          <li className={`sidebar-item ${isActive("/quan-ly-san-pham")}`}>
            <a
              className="sidebar-link"
              onClick={() => navigate("/quan-ly-san-pham")}
            >
              <i className="fa-solid fa-box"></i>
              <span className="align-middle">Quản lý sản phẩm</span>
            </a>
          </li>

          <li className={`sidebar-item ${isActive("/quan-ly-khuyen-mai")}`}>
            <a
              className="sidebar-link"
              onClick={() => navigate("/quan-ly-khuyen-mai")}
            >
              <i className="fa-solid fa-tags"></i>
              <span className="align-middle">Quản lý khuyến mãi</span>
            </a>
          </li>

          <li className={`sidebar-item ${isActive("/quan-ly-khach-hang")}`}>
            <a
              className="sidebar-link"
              onClick={() => navigate("/quan-ly-khach-hang")}
            >
              <i className="fa-solid fa-users"></i>
              <span className="align-middle">Quản lý khách hàng</span>
            </a>
          </li>

          {/* <li className={`sidebar-item ${isActive("/quan-ly-nhan-vien")}`}>
            <a
              className="sidebar-link"
              onClick={() => navigate("/quan-ly-nhan-vien")}
            >
              <i className="fa-solid fa-user-tie"></i>
              <span className="align-middle">Quản lý nhân viên</span>
            </a>
          </li> */}

          <li className={`sidebar-item ${isActive("/quan-ly-nhan-vien")}`}>
            {storedRole === "ROLE_SALE" ? (
              <span
                className="sidebar-link disabled"
                style={{ cursor: "not-allowed", opacity: 0.5 }}
              >
                <i className="fa-solid fa-user-tie"></i>
                <span className="align-middle">Quản lý nhân viên</span>
              </span>
            ) : (
              <a
                className="sidebar-link"
                onClick={() => navigate("/quan-ly-nhan-vien")}
              >
                <i className="fa-solid fa-user-tie"></i>
                <span className="align-middle">Quản lý nhân viên</span>
              </a>
            )}
          </li>

          <li className={`sidebar-item ${isActive("/quan-ly-hoa-don")}`}>
            <a
              className="sidebar-link"
              onClick={() => navigate("/quan-ly-hoa-don")}
            >
              <i className="fa-solid fa-file-invoice"></i>
              <span className="align-middle">Quản lý hóa đơn</span>
            </a>
          </li>

          <li className={`sidebar-item ${isActive("/quan-ly-lich-su")}`}>
            <a
              className="sidebar-link"
              onClick={() => navigate("/quan-ly-lich-su")}
            >
              <i className="fa-solid fa-clock-rotate-left"></i>
              <span className="align-middle">Quản lý lịch sử thao tác</span>
            </a>
          </li>

          <li className="sidebar-item">
            <a className="sidebar-link" onClick={handleShowChangePwModal}>
              <i className="fa-solid fa-key"></i>
              <span className="align-middle">Đổi mật khẩu</span>
            </a>
          </li>

          <li className="sidebar-item">
            <a className="sidebar-link" onClick={handleLogout}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
              <span className="align-middle">Đăng xuất</span>
            </a>
          </li>
        </ul>
      </div>
      <ChangePwModal
        show={showChangePwModal}
        onHide={() => setShowChangePwModal(false)}
        changePwData={changePwData}
        setChangePwData={setChangePwData}
        validationErrors={validationErrors}
        handleChangePassword={handleChangePassword}
        loading={loading}
      />
    </nav>
  );
};

export default Sidebar;
