import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import {
  activateAccount,
  changePassword,
  changeRole,
  createAccount,
  deactivateAccount,
  deleteAccount,
  fetchAllAccounts,
  fetchAllRoles,
} from "../services/apiService";

const TaiKhoan = () => {
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const itemsPerPage = 10;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChangePwModal, setShowChangePwModal] = useState(false);
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    userName: "",
    passWord: "",
    confirmPassword: "",
    email: "",
    phoneNumber: "",
    fullname: "",
    roleName: "",
  });

  const [changePwData, setChangePwData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [changeRoleData, setChangeRoleData] = useState({
    roleName: "",
  });

  const token = localStorage.getItem("token");

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.userName.trim()) {
      errors.userName = "Tên đăng nhập là bắt buộc";
    }
    if (!formData.passWord.trim()) {
      errors.passWord = "Mật khẩu là bắt buộc";
    } else if (formData.passWord.length < 6) {
      errors.passWord = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.passWord !== formData.confirmPassword) {
      errors.confirmPassword = "Mật khẩu không khớp";
    }
    if (!formData.email.trim()) {
      errors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email không hợp lệ";
    }
    if (!formData.fullname.trim()) {
      errors.fullname = "Họ và tên là bắt buộc";
    }
    if (!formData.roleName) {
      errors.roleName = "Vai trò là bắt buộc";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Thêm hàm validateChangePassword
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

  // Fetch accounts
  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAccounts(token);
      if (data.resultCode === 0) {
        setAccounts(Array.isArray(data.data) ? data.data : []);
        setError(null);
        setCurrentPage(1);
      } else {
        throw new Error(data.message || "Không thể tải danh sách tài khoản");
      }
    } catch (err) {
      setError("Không thể tải danh sách tài khoản");
      console.error("Error loading accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles
  const loadRoles = async () => {
    try {
      const data = await fetchAllRoles(token);
      if (data.resultCode === 0) {
        setRoles(Array.isArray(data.data) ? data.data : []);
      } else {
        throw new Error(data.message || "Không thể tải danh sách vai trò");
      }
    } catch (err) {
      console.error("Error loading roles:", err);
      Swal.fire("Lỗi!", "Không thể tải danh sách vai trò", "error");
    }
  };

  // Activate account
  const handleActivate = async (username) => {
    const result = await Swal.fire({
      title: "Xác nhận kích hoạt?",
      text: "Bạn có chắc chắn muốn kích hoạt tài khoản này?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Kích hoạt",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const data = await activateAccount(token, username);
        if (data.resultCode === 0) {
          setAccounts(
            accounts.map((item) =>
              item.username === username ? data.data : item
            )
          );
          Swal.fire("Thành công!", "Kích hoạt tài khoản thành công", "success");
        } else {
          throw new Error(data.message || "Kích hoạt tài khoản thất bại");
        }
      } catch (err) {
        Swal.fire("Lỗi!", "Kích hoạt tài khoản thất bại", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // Deactivate account
  const handleDeactivate = async (username) => {
    const result = await Swal.fire({
      title: "Xác nhận vô hiệu hóa?",
      text: "Bạn có chắc chắn muốn vô hiệu hóa tài khoản này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Vô hiệu hóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const data = await deactivateAccount(token, username);
        if (data.resultCode === 0) {
          setAccounts(
            accounts.map((item) =>
              item.username === username ? data.data : item
            )
          );
          Swal.fire(
            "Thành công!",
            "Vô hiệu hóa tài khoản thành công",
            "success"
          );
        } else {
          throw new Error(data.message || "Vô hiệu hóa tài khoản thất bại");
        }
      } catch (err) {
        Swal.fire("Lỗi!", "Vô hiệu hóa tài khoản thất bại", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // Add account
  const handleAddAccount = async () => {
    if (!validateForm()) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ các trường bắt buộc!", "error");
      return;
    }

    try {
      setLoading(true);
      const data = await createAccount(token, formData);
      if (data.resultCode === 0) {
        setAccounts([...accounts, data.data]);
        setShowAddModal(false);
        setValidationErrors({});
        Swal.fire("Thành công!", "Thêm tài khoản thành công", "success");
      } else {
        throw new Error(data.message || "Thêm tài khoản thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Thêm tài khoản thất bại", "error");
      console.error("Error adding account:", err);
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!validateChangePassword()) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ thông tin mật khẩu", "error");
      return;
    }

    try {
      setLoading(true);
      const data = await changePassword(
        token,
        selectedAccount.username,
        changePwData
      );
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

  // Change role
  const handleChangeRole = async () => {
    if (!changeRoleData.roleName) {
      Swal.fire("Lỗi!", "Vui lòng chọn vai trò", "error");
      return;
    }

    try {
      setLoading(true);
      const data = await changeRole(
        token,
        selectedAccount.username,
        changeRoleData.roleName
      );
      if (data.resultCode === 0) {
        // Cập nhật lại danh sách accounts với role mới
        setAccounts(
          accounts.map((item) =>
            item.username === selectedAccount.username
              ? { ...item, roleName: changeRoleData.roleName }
              : item
          )
        );

        await loadAccounts();
        setShowChangeRoleModal(false);
        Swal.fire("Thành công!", "Thay đổi vai trò thành công", "success");
      } else {
        throw new Error(data.message || "Thay đổi vai trò thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Thay đổi vai trò thất bại", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async (username) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: `Bạn có chắc chắn muốn xóa tài khoản ${username}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const data = await deleteAccount(token, username);
        if (data.resultCode === 0) {
          setAccounts(accounts.filter((item) => item.username !== username));
          Swal.fire("Thành công!", "Xóa tài khoản thành công", "success");
        } else {
          throw new Error(data.message || "Xóa tài khoản thất bại");
        }
      } catch (err) {
        Swal.fire("Lỗi!", "Xóa tài khoản thất bại", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadAccounts();
    loadRoles();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error khi người dùng nhập
  if (name === "passWord" || name === "confirmPassword") {
    setValidationErrors((prev) => ({
      ...prev,
      passWord: "",
      confirmPassword: "",
    }));
  } else {
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  }
  };

  // Pagination and search
  const filteredAccounts = accounts.filter(
    (item) =>
      item.username?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      item.fullname?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      item.phoneNumber?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const currentItems = filteredAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Open add modal
  const openAddModal = () => {
    setFormData({
      userName: "",
      passWord: "",
      email: "",
      phoneNumber: "",
      fullname: "",
      roleName: "",
    });
    setValidationErrors({});
    setShowAddModal(true);
  };

  // Open change password modal
  const openChangePwModal = (account) => {
    setSelectedAccount(account);
    setChangePwData({ currentPassword: "", newPassword: "" });
    setShowChangePwModal(true);
  };

  // Open change role modal
  const openChangeRoleModal = (account) => {
    setSelectedAccount(account);
    setChangeRoleData({ roleName: account.roleName || "" });
    setShowChangeRoleModal(true);
  };

  // Render add form
  const renderAddForm = () => (
    <Form>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Họ và tên <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.fullname}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.fullname}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Username <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.userName}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.userName}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>
              Email <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.email}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.email}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>
              Mật khẩu <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="password"
              name="passWord"
              value={formData.passWord}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.passWord}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.passWord}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>
              Xác nhận mật khẩu <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.confirmPassword}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.confirmPassword}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Số điện thoại</Form.Label>
            <Form.Control
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Vai trò <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              name="roleName"
              value={formData.roleName}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.roleName}
            >
              <option value="">Chọn vai trò</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.id} - {role.name}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {validationErrors.roleName}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );

  return (
    <div className="container-fluid p-0 position-relative d-flex flex-column min-vh-100">
      <div className="p-4 flex-grow-1">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <h1 className="h3 mb-3 mb-md-0">Danh sách tài khoản</h1>
          <div className="d-flex gap-2 align-items-center">
            <div
              className="d-flex"
              style={{ width: "100%", maxWidth: "450px" }}
            >
              <input
                type="text"
                className="form-control custom-sm-input"
                placeholder="Tìm kiếm tài khoản..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
              />
              <button
                className="btn btn-primary custom-sm-btn"
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              >
                <i className="fas fa-search"></i>
              </button>
            </div>
            <button
              className="btn btn-success custom-sm-btn-dangvien"
              onClick={openAddModal}
            >
              <i className="fas fa-plus me-2"></i>Thêm mới
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        {currentItems.length === 0 ? (
          <div className="text-center py-4 color-black">
            Không tìm thấy tài khoản nào phù hợp!
          </div>
        ) : (
          <>
            <div className="table-responsive mb-4">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "5%" }}>STT</th>
                    <th style={{ width: "20%" }}>Họ và tên</th>
                    <th style={{ width: "15%" }}>Tên đăng nhập</th>
                    <th style={{ width: "20%" }}>Email</th>
                    <th style={{ width: "10%" }}>Số điện thoại</th>
                    <th style={{ width: "15%" }}>Trạng thái</th>
                    <th style={{ width: "15%" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, index) => (
                    <tr key={index}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{item.fullname}</td>
                      <td>{item.username}</td>
                      <td>{item.email}</td>
                      <td>{item.phoneNumber}</td>
                      <td>
                        {item.status === 1 ? (
                          <span className="badge bg-success">Kích hoạt</span>
                        ) : (
                          <span className="badge bg-danger">Vô hiệu</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          {item.status === 1 ? (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeactivate(item.username)}
                              title="Vô hiệu hóa"
                            >
                              <i className="fas fa-ban"></i>
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleActivate(item.username)}
                              title="Kích hoạt"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => openChangePwModal(item)}
                            title="Đổi mật khẩu"
                          >
                            <i className="fas fa-key"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => openChangeRoleModal(item)}
                            title="Thay đổi vai trò"
                          >
                            <i className="fas fa-user-tag"></i>
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteAccount(item.username)}
                            title="Xóa tài khoản"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="mt-auto p-3 bg-light border-top">
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-center mb-0">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        « Trước
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <li
                          key={page}
                          className={`page-item ${
                            page === currentPage ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        </li>
                      )
                    )}
                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Tiếp »
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm tài khoản</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderAddForm()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleAddAccount}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Thêm mới"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        show={showChangePwModal}
        onHide={() => setShowChangePwModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Đổi mật khẩu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Mật khẩu hiện tại <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="password"
                value={changePwData.currentPassword}
                onChange={(e) =>
                  setChangePwData({
                    ...changePwData,
                    currentPassword: e.target.value,
                  })
                }
                isInvalid={!!validationErrors.currentPassword}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.currentPassword}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Mật khẩu mới <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="password"
                value={changePwData.newPassword}
                onChange={(e) =>
                  setChangePwData({
                    ...changePwData,
                    newPassword: e.target.value,
                  })
                }
                isInvalid={!!validationErrors.newPassword}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.newPassword}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Xác nhận mật khẩu mới <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="password"
                value={changePwData.confirmNewPassword}
                onChange={(e) =>
                  setChangePwData({
                    ...changePwData,
                    confirmNewPassword: e.target.value,
                  })
                }
                isInvalid={!!validationErrors.confirmNewPassword}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.confirmNewPassword}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowChangePwModal(false)}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleChangePassword}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Change Role Modal */}
      <Modal
        show={showChangeRoleModal}
        onHide={() => setShowChangeRoleModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Thay đổi vai trò cho {selectedAccount?.username}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Vai trò hiện tại</Form.Label>
              <Form.Control
                type="text"
                value={selectedAccount?.roleName || "Chưa có"}
                disabled
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>
                Vai trò mới<span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={changeRoleData.roleName}
                onChange={(e) =>
                  setChangeRoleData({ roleName: e.target.value })
                }
              >
                <option value="">Chọn vai trò</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.roleName}>
                    {role.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowChangeRoleModal(false)}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleChangeRole}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Thay đổi"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TaiKhoan;
