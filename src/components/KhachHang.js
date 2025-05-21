import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Badge,
  ListGroup,
  Tabs,
  Tab,
} from "react-bootstrap";
import {
  FaUser,
  FaHome,
  FaPhone,
  FaBirthdayCake,
  FaDollarSign,
  FaCalendar,
} from "react-icons/fa";
import { FaIdCard } from "react-icons/fa";

import Swal from "sweetalert2";
import {
  createKhachHang,
  deleteKhachHang,
  fetchKhachHang,
  fetchKhachHangById,
  updateKhachHang,
} from "../services/apiService";

const KhachHang = () => {
  const [customerList, setCustomerList] = useState([]);
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
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    hoten: "",
    dchi: "",
    sodt: "",
    ngsinh: "",
  });

  const token = localStorage.getItem("token");

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.hoten.trim()) {
      errors.hoten = "Họ tên là bắt buộc";
    } else if (formData.hoten.length <= 2) {
      errors.hoten = "Họ tên phải có ít nhất 2 ký tự";
    }
    if (!formData.dchi.trim()) {
      errors.dchi = "Địa chỉ là bắt buộc";
    }
    if (!formData.sodt.trim()) {
      errors.sodt = "Số điện thoại là bắt buộc";
    } else if (!/^\d{10}$/.test(formData.sodt)) {
      errors.sodt = "Số điện thoại phải có 10 chữ số";
    }
    if (!formData.ngsinh) {
      errors.ngsinh = "Ngày sinh là bắt buộc";
    } else if (new Date(formData.ngsinh) > new Date()) {
      errors.ngsinh = "Ngày sinh không được ở tương lai";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch all customers
  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await fetchKhachHang(token);
      if (data.resultCode === 0) {
        setCustomerList(data.data);
        setError(null);
      } else {
        throw new Error(data.message || "Không thể tải danh sách khách hàng");
      }
    } catch (err) {
      setError("Không thể tải danh sách khách hàng");
      console.error("Error loading customers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add customer
  const handleAddCustomer = async () => {
    if (!validateForm()) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ các trường bắt buộc!", "error");
      return;
    }

    try {
      setLoading(true);
      const data = await createKhachHang(token, formData);
      if (data.resultCode === 0) {
        setCustomerList([...customerList, data.data]);
        setShowAddModal(false);
        setValidationErrors({});
        Swal.fire("Thành công!", "Thêm khách hàng thành công", "success");
      } else {
        throw new Error(data.message || "Thêm khách hàng thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Thêm khách hàng thất bại", "error");
      console.error("Error adding customer:", err);
    } finally {
      setLoading(false);
    }
  };

  // Edit customer
  const handleUpdateCustomer = async () => {
    if (!validateForm()) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ các trường bắt buộc!", "error");
      return;
    }

    if (!selectedCustomer) return;

    try {
      setLoading(true);
      const data = await updateKhachHang(token, selectedCustomer.id, formData);

      if (data.resultCode === 0) {
        setCustomerList(
          customerList.map((item) =>
            item.id === selectedCustomer.id ? data.data : item
          )
        );
        setShowEditModal(false);
        setValidationErrors({});
        Swal.fire("Thành công!", "Cập nhật khách hàng thành công", "success");
      } else {
        throw new Error(data.message || "Cập nhật khách hàng thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Cập nhật khách hàng thất bại", "error");
      console.error("Error updating customer:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete customer
  const handleDeleteCustomer = async (customerId) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn có chắc chắn muốn xóa khách hàng này?",
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
        const data = await deleteKhachHang(token, customerId);

        if (data.resultCode === 0) {
          setCustomerList(
            customerList.filter((item) => item.id !== customerId)
          );
          Swal.fire("Thành công!", "Xóa khách hàng thành công", "success");
        } else {
          throw new Error(data.message || "Xóa khách hàng thất bại");
        }
      } catch (err) {
        Swal.fire("Lỗi!", "Xóa khách hàng thất bại", "error");
        console.error("Error deleting customer:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Open add modal
  const openAddModal = () => {
    setFormData({
      hoten: "",
      dchi: "",
      sodt: "",
      ngsinh: "",
    });
    setValidationErrors({});
    setShowAddModal(true);
  };

  // Open edit modal
  const openEditModal = async (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      hoten: customer.hoten,
      dchi: customer.dchi,
      sodt: customer.sodt,
      ngsinh: customer.ngsinh.split("-").reverse().join("-"),
    });
    setValidationErrors({});
    setShowEditModal(true);
  };

  // Open detail modal
  const openDetailModal = async (customerId) => {
    try {
      setLoading(true);
      const data = await fetchKhachHangById(token, customerId);
      if (data.resultCode === 0) {
        setCustomerDetail(data.data);
        setShowDetailModal(true);
      } else {
        throw new Error(data.message || "Không thể tải chi tiết khách hàng");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Không thể tải chi tiết khách hàng", "error");
      console.error("Error loading customer detail:", err);
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

  // Load customers on mount
  useEffect(() => {
    loadCustomers();
  }, []);

  // Pagination and search
  const filteredCustomers = customerList.filter(
    (item) =>
      item.id?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      item.hoten?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      item.sodt?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const currentItems = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === "Không có") return dateString;
    return dateString;
  };

  // Format datetime for display
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString || dateTimeString === "Không có") return dateTimeString;
    const [date, time] = dateTimeString.split(" ");
    return `${date} ${time}`;
  };

  // Render form
  const renderCustomerForm = (isEdit = false) => (
    <Form>
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>
              Họ và tên <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="hoten"
              value={formData.hoten}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.hoten}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.hoten}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Ngày sinh <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="date"
              name="ngsinh"
              value={formData.ngsinh}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.ngsinh}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.ngsinh}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Số điện thoại <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="sodt"
              value={formData.sodt}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.sodt}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.sodt}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Form.Group>
          <Form.Label>
            Địa chỉ <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            name="dchi"
            value={formData.dchi}
            onChange={handleInputChange}
            isInvalid={!!validationErrors.dchi}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.dchi}
          </Form.Control.Feedback>
        </Form.Group>
      </Row>
    </Form>
  );

  return (
    <div className="container-fluid p-0 position-relative d-flex flex-column min-vh-100">
      <div className="p-4 flex-grow-1">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <h1 className="h3 mb-3 mb-md-0">Danh sách khách hàng</h1>
          <div className="d-flex gap-2 align-items-center">
            <div
              className="d-flex"
              style={{ width: "100%", maxWidth: "450px" }}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm khách hàng..."
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
            Không tìm thấy khách hàng nào phù hợp!
          </div>
        ) : (
          <>
            <div className="table-responsive mb-4">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "5%" }}>STT</th>
                    <th style={{ width: "15%" }}>Mã khách hàng</th>
                    <th style={{ width: "15%" }}>Họ và tên</th>
                    <th style={{ width: "10%" }}>Số điện thoại</th>
                    <th style={{ width: "15%" }}>Ngày sinh</th>
                    <th style={{ width: "15%" }}>Doanh số</th>
                    <th style={{ width: "15%" }}>Ngày đăng ký</th>
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
                      <td>{formatDate(item.ngsinh)}</td>
                      <td>
                        {Number(item.doanhso).toLocaleString("vi-VN")} VND
                      </td>
                      <td>{formatDateTime(item.ngdk)}</td>
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
                            title="Sửa khách hàng"
                            disabled={item.status === "deleted"}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteCustomer(item.id)}
                            title="Xóa khách hàng"
                            disabled={item.status === "deleted"}
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
          <Modal.Title>Thêm khách hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderCustomerForm()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleAddCustomer}
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
          <Modal.Title>Sửa khách hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderCustomerForm(true)}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateCustomer}
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
          <Modal.Title>Chi tiết khách hàng</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {customerDetail && (
            <div className="customer-profile">
              <div className="text-center mb-4">
                <div className="profile-avatar">
                  <FaUser size={60} className="text-primary" />
                </div>
                <h4 className="mt-3">{customerDetail.hoten}</h4>
                <Badge
                  bg={customerDetail.status === "active" ? "success" : "danger"}
                >
                  {customerDetail.status === "active" ? "Hoạt động" : "Đã xóa"}
                </Badge>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="info-item">
                    <FaIdCard className="icon" />
                    <div>
                      <label>Mã khách hàng</label>
                      <p>{customerDetail.id}</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="info-item">
                    <FaPhone className="icon" />
                    <div>
                      <label>Số điện thoại</label>
                      <p>{customerDetail.sodt}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-item">
                <FaHome className="icon" />
                <div>
                  <label>Địa chỉ</label>
                  <p>{customerDetail.dchi}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="info-item">
                    <FaBirthdayCake className="icon" />
                    <div>
                      <label>Ngày sinh</label>
                      <p>{formatDate(customerDetail.ngsinh)}</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="info-item">
                    <FaCalendar className="icon" />
                    <div>
                      <label>Ngày đăng ký</label>
                      <p>{formatDateTime(customerDetail.ngdk)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-item">
                <FaDollarSign className="icon" />
                <div>
                  <label>Doanh số</label>
                  <p className="text-success fw-bold">
                    {Number(customerDetail.doanhso).toLocaleString("vi-VN")} VND
                  </p>
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

export default KhachHang;
