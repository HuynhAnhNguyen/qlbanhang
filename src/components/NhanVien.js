import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Badge,
  ListGroup,
} from "react-bootstrap";
import {
  FaUser,
  FaPhone,
  FaCalendar,
  FaUserShield,
  FaIdCard,
} from "react-icons/fa";
import Swal from "sweetalert2";
import {
  createNhanVien,
  deleteNhanVien,
  fetchNhanVien,
  fetchNhanVienById,
  fetchRole,
  updateNhanVien,
} from "../services/apiService";

const NhanVien = () => {
  const [employeeList, setEmployeeList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const itemsPerPage = 10;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetail, setEmployeeDetail] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    password: "",
    rolename: "",
  });

  const token = localStorage.getItem("token");

  // Validate form data
  const validateForm = (isEdit = false) => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Họ tên là bắt buộc";
    } else if (formData.fullName.length <= 2) {
      errors.fullName = "Họ tên phải có ít nhất 2 ký tự";
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Số điện thoại là bắt buộc";
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Số điện thoại phải có 10 chữ số";
    }
    if (!isEdit && !formData.password.trim()) {
      errors.password = "Mật khẩu là bắt buộc";
    } else if (!isEdit && formData.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!isEdit && !formData.rolename) {
      errors.rolename = "Vai trò là bắt buộc";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch all employees
  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await fetchNhanVien(token);
      if (data.resultCode === 0) {
        setEmployeeList(data.data);
        setError(null);
      } else {
        throw new Error(data.message || "Không thể tải danh sách nhân viên");
      }
    } catch (err) {
      setError("Không thể tải danh sách nhân viên");
      console.error("Error loading employees:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all roles
  const loadRoles = async () => {
    try {
      const data = await fetchRole(token);
      if (data.resultCode === 0) {
        setRoleList(data.data);
      } else {
        throw new Error(data.message || "Không thể tải danh sách vai trò");
      }
    } catch (err) {
      console.error("Error loading roles:", err);
    }
  };

  // Add employee
  const handleAddEmployee = async () => {
    if (!validateForm()) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ các trường bắt buộc!", "error");
      return;
    }

    try {
      setLoading(true);
      const data = await createNhanVien(token, formData);
      if (data.resultCode === 0) {
        setEmployeeList([...employeeList, data.data]);
        setShowAddModal(false);
        setValidationErrors({});
        Swal.fire("Thành công!", "Thêm nhân viên thành công", "success");
      } else {
        throw new Error(data.message || "Thêm nhân viên thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Thêm nhân viên thất bại", "error");
      console.error("Error adding employee:", err);
    } finally {
      setLoading(false);
    }
  };

  // Edit employee
  const handleUpdateEmployee = async () => {
    if (!validateForm(true)) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ các trường bắt buộc!", "error");
      return;
    }

    if (!selectedEmployee) return;

    try {
      setLoading(true);
      const data = await updateNhanVien(token, selectedEmployee.id, {
        phoneNumber: formData.phoneNumber,
        fullName: formData.fullName,
      });

      if (data.resultCode === 0) {
        setEmployeeList(
          employeeList.map((item) =>
            item.id === selectedEmployee.id ? data.data : item
          )
        );
        setShowEditModal(false);
        setValidationErrors({});
        Swal.fire("Thành công!", "Cập nhật nhân viên thành công", "success");
      } else {
        throw new Error(data.message || "Cập nhật nhân viên thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Cập nhật nhân viên thất bại", "error");
      console.error("Error updating employee:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete employee
  const handleDeleteEmployee = async (employeeId) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn có chắc chắn muốn xóa nhân viên này?",
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
        const data = await deleteNhanVien(token, employeeId);

        if (data.resultCode === 0) {
          setEmployeeList(
            employeeList.filter((item) => item.id !== employeeId)
          );
          Swal.fire("Thành công!", "Xóa nhân viên thành công", "success");
        } else {
          throw new Error(data.message || "Xóa nhân viên thất bại");
        }
      } catch (err) {
        Swal.fire("Lỗi!", "Xóa nhân viên thất bại", "error");
        console.error("Error deleting employee:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Open add modal
  const openAddModal = () => {
    setFormData({
      fullName: "",
      phoneNumber: "",
      password: "",
      rolename: "",
    });
    setValidationErrors({});
    setShowAddModal(true);
  };

  // Open edit modal
  const openEditModal = async (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      fullName: employee.hoten,
      phoneNumber: employee.sodt,
      password: "",
      rolename: employee.roleid.rolename,
    });
    setValidationErrors({});
    setShowEditModal(true);
  };

  // Open detail modal
  const openDetailModal = async (employeeId) => {
    try {
      setLoading(true);
      const data = await fetchNhanVienById(token, employeeId);
      if (data.resultCode === 0) {
        setEmployeeDetail(data.data);
        setShowDetailModal(true);
      } else {
        throw new Error(data.message || "Không thể tải chi tiết nhân viên");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Không thể tải chi tiết nhân viên", "error");
      console.error("Error loading employee detail:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Load employees and roles on mount
  useEffect(() => {
    loadEmployees();
    loadRoles();
  }, []);

  // Pagination and search
  const filteredEmployees = employeeList.filter(
    (item) =>
      item.id?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      item.hoten?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      item.sodt?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const currentItems = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format datetime for display
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    return dateTimeString;
  };

  const translateRoleName = (roleName) => {
    switch (roleName) {
      case "ROLE_ADMIN":
        return "Quản trị viên";
      case "ROLE_SALE":
        return "Nhân viên bán hàng";
      default:
        return roleName;
    }
  };

  // Render form
  const renderEmployeeForm = () => (
    <Form>
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>
              Họ và tên nhân viên <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.fullName}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.fullName}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Số điện thoại <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.phoneNumber}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.phoneNumber}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Mật khẩu <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.password}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.password}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>
              Vai trò <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              name="rolename"
              value={formData.rolename}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.rolename}
              disabled={false}
            >
              <option value="">-- Chọn vai trò --</option>
              {roleList.map((role) => (
                <option key={role.id} value={role.rolename}>
                  {translateRoleName(role.rolename)}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {validationErrors.rolename}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );

  const renderEmployeeEditForm = () => (
    <Form>
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>
              Họ và tên nhân viên <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.fullName}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.fullName}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Số điện thoại <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.phoneNumber}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.phoneNumber}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Vai trò <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              name="rolename"
              value={formData.rolename}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.rolename}
              disabled={true}
            >
              <option value="">-- Chọn vai trò --</option>
              {roleList.map((role) => (
                <option key={role.id} value={role.rolename}>
                  {translateRoleName(role.rolename)}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {validationErrors.rolename}
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
          <h1 className="h3 mb-3 mb-md-0">Danh sách nhân viên</h1>
          <div className="d-flex gap-2 align-items-center">
            <div
              className="d-flex"
              style={{ width: "100%", maxWidth: "450px" }}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm nhân viên..."
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
          <div className="text-center py-4 text-muted">
            Không tìm thấy nhân viên nào phù hợp!
          </div>
        ) : (
          <>
            <div className="table-responsive mb-4">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "5%" }}>STT</th>
                    <th style={{ width: "10%" }}>Mã NV</th>
                    <th style={{ width: "20%" }}>Họ tên</th>
                    <th style={{ width: "15%" }}>Số điện thoại</th>
                    <th style={{ width: "15%" }}>Vai trò</th>
                    <th style={{ width: "15%" }}>Ngày vào làm</th>
                    <th style={{ width: "10%" }}>Trạng thái</th>
                    <th style={{ width: "10%" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, index) => (
                    <tr key={index}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{item.id}</td>
                      <td>{item.hoten}</td>
                      <td>{item.sodt}</td>
                      <td>{translateRoleName(item.roleid.rolename)}</td>
                      <td>{formatDateTime(item.ngvl)}</td>

                      <td>
                        <Badge
                          bg={item.status === "active" ? "success" : "danger"}
                        >
                          {item.status === "active" ? "Hoạt động" : "Đã xóa"}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-outline-primary btn-outline-primary-detail"
                            onClick={() => openDetailModal(item.id)}
                            title="Xem chi tiết"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => openEditModal(item)}
                            title="Sửa nhân viên"
                            disabled={item.status !== "active"}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteEmployee(item.id)}
                            title="Xóa nhân viên"
                            disabled={item.status !== "active"}
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
              <div className="d-flex justify-content-center">
                <nav aria-label="Page navigation">
                  <ul className="pagination">
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
                        «
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
                        »
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
          <Modal.Title>Thêm nhân viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderEmployeeForm()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleAddEmployee}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Thêm mới"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Sửa nhân viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderEmployeeEditForm()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateEmployee}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Cập nhật"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết nhân viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {employeeDetail && (
            <div className="employee-profile">
              <div className="text-center mb-4">
                <div className="profile-avatar">
                  <FaUser size={60} className="text-primary" />
                </div>
                <h4 className="mt-3">{employeeDetail.hoten}</h4>
                <Badge
                  bg={employeeDetail.status === "active" ? "success" : "danger"}
                >
                  {employeeDetail.status === "active" ? "Hoạt động" : "Đã xóa"}
                </Badge>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="info-item">
                    <FaIdCard className="icon" />
                    <div>
                      <label>Mã nhân viên</label>
                      <p>{employeeDetail.id}</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="info-item">
                    <FaPhone className="icon" />
                    <div>
                      <label>Số điện thoại</label>
                      <p>{employeeDetail.sodt}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-item">
                <FaUserShield className="icon" />
                <div>
                  <label>Vai trò</label>
                  <p className="fw-bold">
                    {translateRoleName(employeeDetail.roleid.rolename)}
                  </p>
                </div>
              </div>

              <div className="info-item">
                <FaCalendar className="icon" />
                <div>
                  <label>Ngày vào làm</label>
                  <p>{formatDateTime(employeeDetail.ngvl)}</p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NhanVien;
