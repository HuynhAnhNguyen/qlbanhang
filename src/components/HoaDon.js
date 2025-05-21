import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Badge,
  ListGroup,
  Table,
} from "react-bootstrap";
import {
  FaFileInvoice,
  FaUser,
  FaClock,
  FaDollarSign,
  FaShoppingCart,
} from "react-icons/fa";
import Swal from "sweetalert2";
import {
  createHoaDon,
  fetchHoaDon,
  fetchHoaDonByKhachHangId,
  fetchKhachHang,
  fetchKhachHangActive,
  fetchNhanVien,
  fetchSanPham,
} from "../services/apiService";

const HoaDon = () => {
  const [invoiceList, setInvoiceList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchType, setSearchType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const itemsPerPage = 10;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Form data for creating invoice
  const [formData, setFormData] = useState({
    maKH: "",
    maNV: "",
    sanpham: [{ maSP: "", soluong: 1 }],
  });

  const token = localStorage.getItem("token");

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.maKH) {
      errors.maKH = "Khách hàng là bắt buộc";
    }
    if (!formData.maNV) {
      errors.maNV = "Nhân viên là bắt buộc";
    }
    if (
      formData.sanpham.length === 0 ||
      formData.sanpham.some((item) => !item.maSP)
    ) {
      errors.sanpham = "Phải chọn ít nhất một sản phẩm";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Tính tổng giá trị đơn hàng
  const calculateTotal = () => {
    return formData.sanpham.reduce((total, item) => {
      const product = productList.find((p) => p.id === item.maSP);
      if (!product) return total;

      const price = product.makm
        ? product.gia * (1 - product.makm.phantram / 100)
        : product.gia;

      return total + price * item.soluong;
    }, 0);
  };

  // Fetch all invoices
  const loadAllInvoices = async () => {
    setLoading(true);
    try {
      const data = await fetchHoaDon(token);
      if (data.resultCode === 0) {
        setInvoiceList(data.data);
        setError(null);
      } else {
        throw new Error(data.message || "Không thể tải danh sách hóa đơn");
      }
    } catch (err) {
      setError("Không thể tải danh sách hóa đơn");
      console.error("Error loading invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch invoices by customer ID
  const loadInvoicesByMaKH = async (maKH) => {
    setLoading(true);
    try {
      const data = await fetchHoaDonByKhachHangId(token, maKH);
      if (data.resultCode === 0) {
        setInvoiceList(data.data);
        setError(null);
      } else {
        throw new Error(data.message || "Không thể tải hóa đơn của khách hàng");
      }
    } catch (err) {
      setError("Không thể tải hóa đơn của khách hàng");
      console.error("Error loading invoices by MaKH:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all customers
  const loadCustomers = async () => {
    try {
      const data = await fetchKhachHangActive(token);
      if (data.resultCode === 0) {
        setCustomerList(data.data);
      } else {
        throw new Error(data.message || "Không thể tải danh sách khách hàng");
      }
    } catch (err) {
      console.error("Error loading customers:", err);
    }
  };

  // Fetch all employees
  const loadEmployees = async () => {
    try {
      const data = await fetchNhanVien(token);
      if (data.resultCode === 0) {
        setEmployeeList(data.data);
      } else {
        throw new Error(data.message || "Không thể tải danh sách nhân viên");
      }
    } catch (err) {
      console.error("Error loading employees:", err);
    }
  };

  // Fetch all products
  const loadProducts = async () => {
    try {
      const data = await fetchSanPham(token);
      if (data.resultCode === 0) {
        setProductList(data.data);
      } else {
        throw new Error(data.message || "Không thể tải danh sách sản phẩm");
      }
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  // Handle customer selection change
  const handleCustomerChange = (e) => {
    const selectedId = e.target.value;
    const customer = customerList.find((item) => item.id == selectedId);
    setSelectedCustomer(customer || null);
    setCurrentPage(1);
    if (!selectedId) {
      loadAllInvoices();
    } else {
      loadInvoicesByMaKH(selectedId);
    }
  };

  // Hàm thêm sản phẩm mới
  const addProduct = (maSP = "") => {
    if (!maSP) {
      // Nếu không có mã SP (click nút thêm mới)
      setFormData((prev) => ({
        ...prev,
        sanpham: [...prev.sanpham, { maSP: "", soluong: 1 }],
      }));
      return;
    }

    // Tìm xem sản phẩm đã có trong danh sách chưa
    const existingIndex = formData.sanpham.findIndex(
      (item) => item.maSP === maSP
    );

    if (existingIndex >= 0) {
      // Nếu đã có thì tăng số lượng lên 1
      updateProductQuantity(
        existingIndex,
        "soluong",
        formData.sanpham[existingIndex].soluong + 1
      );

      // Reset dòng mới thêm (nếu có)
      const lastIndex = formData.sanpham.length - 1;
      if (formData.sanpham[lastIndex].maSP === "") {
        removeProduct(lastIndex);
      }
    } else {
      // Nếu chưa có thì thêm mới và reset dòng trống (nếu có)
      const newSanpham = formData.sanpham.filter((item) => item.maSP !== "");
      setFormData((prev) => ({
        ...prev,
        sanpham: [...newSanpham, { maSP, soluong: 1 }],
      }));
    }
  };

  // Hàm cập nhật thông tin sản phẩm
  const updateProductQuantity = (index, field, value) => {
    setFormData((prev) => {
      const newSanpham = [...prev.sanpham];
      if (field === "soluong") {
        newSanpham[index] = {
          ...newSanpham[index],
          soluong: Math.max(1, parseInt(value) || 1), // Đảm bảo số lượng ít nhất là 1
        };
      } else {
        // Khi thay đổi sản phẩm
        const existingIndex = newSanpham.findIndex(
          (item, idx) => item.maSP === value && idx !== index
        );

        if (existingIndex >= 0) {
          // Nếu sản phẩm đã có trong danh sách
          newSanpham[existingIndex] = {
            ...newSanpham[existingIndex],
            soluong:
              newSanpham[existingIndex].soluong +
              (newSanpham[index].soluong || 1),
          };
          // Xóa dòng hiện tại
          // newSanpham.splice(index, 1);
        } else {
          // Nếu sản phẩm chưa có
          newSanpham[index] = {
            maSP: value,
            soluong: newSanpham[index].soluong || 1,
          };
        }
      }
      return { ...prev, sanpham: newSanpham };
    });
  };

  // Remove product from invoice
  const removeProduct = (index) => {
    setFormData((prev) => ({
      ...prev,
      sanpham: prev.sanpham.filter((_, i) => i !== index),
    }));
  };

  // Create invoice
  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ các trường bắt buộc!", "error");
      return;
    }

    try {
      setLoading(true);
      const data = await createHoaDon(token, formData);
      if (data.resultCode === 0) {
        setInvoiceList([...invoiceList, data.data]);
        setShowAddModal(false);
        setFormData({
          maKH: "",
          maNV: "",
          sanpham: [{ maSP: "", soluong: 1 }],
        });
        setValidationErrors({});
        Swal.fire("Thành công!", "Tạo hóa đơn thành công", "success");
      } else {
        throw new Error(data.message || "Tạo hóa đơn thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Tạo hóa đơn thất bại", "error");
      console.error("Error creating invoice:", err);
    } finally {
      setLoading(false);
    }
  };

  // Open add modal
  const openAddModal = () => {
    setFormData({ maKH: "", maNV: "", sanpham: [{ maSP: "", soluong: 1 }] });
    setValidationErrors({});
    setShowAddModal(true);
  };

  // Open detail modal
  const openDetailModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  // Load initial data on mount
  useEffect(() => {
    loadAllInvoices();
    loadCustomers();
    loadEmployees();
    loadProducts();
  }, []);

  const handlePrintInvoice = () => {
    const printContents =
      document.getElementById("printable-invoice").innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;

    // Reattach event listeners if needed
    window.location.reload();
  };

  // Pagination
  const totalPages = Math.ceil(invoiceList.length / itemsPerPage);
  const currentItems = invoiceList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format datetime for display
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    return dateTimeString;
  };

  // Format currency
  const formatCurrency = (value) => {
    return Number(value).toLocaleString("vi-VN") + " VND";
  };

  return (
    <div className="container-fluid p-0 position-relative d-flex flex-column min-vh-100">
      <div className="p-4 flex-grow-1">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <h1 className="h3 mb-3 mb-md-0">Danh sách hóa đơn</h1>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <Form.Group style={{ width: "200px" }}>
              <Form.Select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value="all">Tất cả hóa đơn</option>
                <option value="today">Hôm nay</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
              </Form.Select>
            </Form.Group>

            <Form.Group style={{ width: "250px" }}>
              <Form.Select
                value={selectedCustomer?.id || ""}
                onChange={handleCustomerChange}
              >
                <option value="">Chọn khách hàng</option>
                {customerList.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.hoten} ({customer.id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

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
            Không tìm thấy hóa đơn nào!
          </div>
        ) : (
          <>
            <div className="table-responsive mb-4">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "5%" }}>STT</th>
                    <th style={{ width: "10%" }}>Mã HD</th>
                    <th style={{ width: "20%" }}>Khách hàng</th>
                    <th style={{ width: "20%" }}>Nhân viên</th>
                    <th style={{ width: "15%" }}>Ngày hóa đơn</th>
                    <th style={{ width: "15%" }}>Trị giá</th>
                    <th style={{ width: "15%" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, index) => (
                    <tr key={item.id}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{item.id}</td>
                      <td>{item.makh.hoten}</td>
                      <td>{item.manv.hoten}</td>
                      <td>{formatDateTime(item.nghd)}</td>
                      <td>{formatCurrency(item.trigia)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary btn-outline-primary-detail"
                          onClick={() => openDetailModal(item)}
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
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
        dialogClassName="modal-xl"
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm hóa đơn mới</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateInvoice}>
          <Modal.Body>
            <h5>Thông tin hóa đơn</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Khách hàng <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="maKH"
                    value={formData.maKH}
                    onChange={(e) =>
                      setFormData({ ...formData, maKH: e.target.value })
                    }
                    isInvalid={!!validationErrors.maKH}
                  >
                    <option value="">Chọn khách hàng</option>
                    {customerList.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.id} - {customer.hoten}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.maKH}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Nhân viên <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="maNV"
                    value={formData.maNV}
                    onChange={(e) =>
                      setFormData({ ...formData, maNV: e.target.value })
                    }
                    isInvalid={!!validationErrors.maNV}
                  >
                    <option value="">Chọn nhân viên</option>
                    {employeeList.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.id} - {employee.hoten}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.maNV}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <h5 className="mt-4">Chi tiết hóa đơn</h5>
            {formData.sanpham.map((item, index) => {
              const product = productList.find((p) => p.id === item.maSP);
              const originalPrice = product?.gia || 0;
              const discountPercent = product?.makm?.phantram || 0;
              const discountPrice =
                discountPercent > 0
                  ? originalPrice * (1 - discountPercent / 100)
                  : originalPrice;

              return (
                <Row key={index} className="mb-3 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Tên sản phẩm</Form.Label>
                      <Form.Select
                        value={item.maSP || ""}
                        onChange={(e) =>
                          updateProductQuantity(index, "maSP", e.target.value)
                        }
                      >
                        <option value="">Chọn sản phẩm</option>
                        {productList.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.id} - {product.tensp}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={1}>
                    <Form.Group>
                      <Form.Label>Số lượng</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        value={item.soluong}
                        onChange={(e) =>
                          updateProductQuantity(
                            index,
                            "soluong",
                            e.target.value
                          )
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Giá gốc</Form.Label>
                      <Form.Control
                        type="text"
                        value={formatCurrency(originalPrice)}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Khuyến mãi</Form.Label>
                      <Form.Control
                        type="text"
                        value={
                          discountPercent > 0
                            ? `${discountPercent}%`
                            : "Không có"
                        }
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Giá bán</Form.Label>
                      <Form.Control
                        type="text"
                        value={formatCurrency(discountPrice)}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1}>
                    <Button
                      variant="danger"
                      onClick={() => removeProduct(index)}
                      disabled={formData.sanpham.length === 1}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </Col>
                </Row>
              );
            })}

            <Button variant="outline-primary" onClick={() => addProduct("")}>
              <i className="fas fa-plus me-2"></i>Thêm sản phẩm
            </Button>

            {/* Hiển thị tổng giá trị đơn hàng */}
            <div className="mt-4 p-3 bg-light rounded">
              <h5 className="text-end">
                Tổng giá trị đơn hàng:{" "}
                <strong>{formatCurrency(calculateTotal())}</strong>
              </h5>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Lưu hóa đơn"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        dialogClassName="modal-xl"
        size="xl"
        centered
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold text-primary">
            <i className="fas fa-file-invoice me-2"></i>
            Thông tin chi tiết hóa đơn
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          {selectedInvoice && (
            <>
              {/* Invoice Header Section */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h4 className="fw-bold text-uppercase">
                    Hóa đơn #{selectedInvoice.id}
                  </h4>
                  <div className="text-muted">
                    Ngày lập: {formatDateTime(selectedInvoice.nghd)}
                  </div>
                </div>
                <div className="bg-primary text-white p-3 rounded text-center">
                  <div className="fs-5 fw-bold">
                    {formatCurrency(selectedInvoice.trigia)}
                  </div>
                  <small>Tổng trị giá</small>
                </div>
              </div>

              {/* Customer and Staff Info */}
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-header bg-light">
                      <h6 className="mb-0 fw-bold">
                        <i className="fas fa-user me-2"></i>Thông tin khách hàng
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                          <i className="fas fa-id-card text-primary"></i>
                        </div>
                        <div>
                          <div className="text-muted small">Mã khách hàng</div>
                          <div className="fw-bold">
                            {selectedInvoice.makh.id}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                          <i className="fas fa-signature text-primary"></i>
                        </div>
                        <div>
                          <div className="text-muted small">Họ và tên</div>
                          <div className="fw-bold">
                            {selectedInvoice.makh.hoten}
                          </div>
                        </div>
                      </div>
                      {selectedInvoice.makh.diachi && (
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                            <i className="fas fa-map-marker-alt text-primary"></i>
                          </div>
                          <div>
                            <div className="text-muted small">Địa chỉ</div>
                            <div className="fw-bold">
                              {selectedInvoice.makh.diachi}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-header bg-light">
                      <h6 className="mb-0 fw-bold">
                        <i className="fas fa-user-tie me-2"></i>Thông tin nhân
                        viên
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-success bg-opacity-10 p-2 rounded me-3">
                          <i className="fas fa-id-badge text-success"></i>
                        </div>
                        <div>
                          <div className="text-muted small">Mã nhân viên</div>
                          <div className="fw-bold">
                            {selectedInvoice.manv.id}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-success bg-opacity-10 p-2 rounded me-3">
                          <i className="fas fa-signature text-success"></i>
                        </div>
                        <div>
                          <div className="text-muted small">Họ và tên</div>
                          <div className="fw-bold">
                            {selectedInvoice.manv.hoten}
                          </div>
                        </div>
                      </div>
                      {selectedInvoice.manv.sdt && (
                        <div className="d-flex align-items-center">
                          <div className="bg-success bg-opacity-10 p-2 rounded me-3">
                            <i className="fas fa-phone-alt text-success"></i>
                          </div>
                          <div>
                            <div className="text-muted small">
                              Số điện thoại
                            </div>
                            <div className="fw-bold">
                              {selectedInvoice.manv.sdt}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Products Table */}
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-light">
                  <h6 className="mb-0 fw-bold">
                    <i className="fas fa-shopping-cart me-2"></i>Chi tiết sản
                    phẩm
                  </h6>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th width="50">#</th>
                          <th>Mã SP</th>
                          <th>Tên sản phẩm</th>
                          <th width="100">Số lượng</th>
                          <th width="150">Đơn giá</th>
                          <th width="150">Khuyến mãi</th>
                          <th width="150">Giá sau KM</th>
                          <th width="150">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.cthds.map((item, index) => {
                          const originalPrice = item.masp?.gia || 0;
                          const discountPercent =
                            item.masp?.makm?.phantram || 0;
                          const discountPrice =
                            discountPercent > 0
                              ? originalPrice * (1 - discountPercent / 100)
                              : originalPrice;

                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>
                                <span className="badge bg-secondary bg-opacity-10 text-secondary">
                                  {item.masp.id}
                                </span>
                              </td>
                              <td>{item.masp.tensp}</td>
                              <td>{item.sl}</td>
                              <td>{formatCurrency(originalPrice)}</td>
                              <td>
                                {item.masp.makm ? (
                                  <span className="badge bg-success bg-opacity-10 text-success">
                                    {item.masp.makm.phantram}%
                                  </span>
                                ) : (
                                  <span className="badge bg-secondary bg-opacity-10 text-secondary">
                                    Không có
                                  </span>
                                )}
                              </td>
                              <td>{formatCurrency(discountPrice)}</td>
                              <td>{formatCurrency(item.sl * discountPrice)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          <td
                            colSpan="7"
                            className="text-end fw-bold text-muted"
                          >
                            Tổng cộng:
                          </td>
                          <td className="text-end fw-bold text-primary">
                            {formatCurrency(selectedInvoice.trigia)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              {/* Hidden div for printing */}
              <div id="printable-invoice" className="d-none">
                <div className="text-center mb-4">
                  <h3 className="fw-bold">HÓA ĐƠN BÁN HÀNG</h3>
                  <div>Số: {selectedInvoice.id}</div>
                  <div>Ngày: {formatDateTime(selectedInvoice.nghd)}</div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <h5>Khách hàng</h5>
                    <div>
                      <strong>Mã KH:</strong> {selectedInvoice.makh.id}
                    </div>
                    <div>
                      <strong>Tên:</strong> {selectedInvoice.makh.hoten}
                    </div>
                    {selectedInvoice.makh.diachi && (
                      <div>
                        <strong>Địa chỉ:</strong> {selectedInvoice.makh.diachi}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <h5>Nhân viên</h5>
                    <div>
                      <strong>Mã NV:</strong> {selectedInvoice.manv.id}
                    </div>
                    <div>
                      <strong>Tên:</strong> {selectedInvoice.manv.hoten}
                    </div>
                    {selectedInvoice.manv.sdt && (
                      <div>
                        <strong>Điện thoại:</strong> {selectedInvoice.manv.sdt}
                      </div>
                    )}
                  </div>
                </div>

                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>KM</th>
                      <th>Giá sau KM</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.cthds.map((item, index) => {
                      const originalPrice = item.masp?.gia || 0;
                      const discountPercent = item.masp?.makm?.phantram || 0;
                      const discountPrice =
                        discountPercent > 0
                          ? originalPrice * (1 - discountPercent / 100)
                          : originalPrice;

                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            {item.masp.tensp} (Mã: {item.masp.id})
                          </td>
                          <td>{item.sl}</td>
                          <td>{formatCurrency(originalPrice)}</td>
                          <td>
                            {item.masp.makm ? (
                              <span className="badge bg-success bg-opacity-10 text-success">
                                -{item.masp.makm.phantram}%
                              </span>
                            ) : (
                              <span className="badge bg-secondary bg-opacity-10 text-secondary">
                                Không có
                              </span>
                            )}
                          </td>
                          <td>{formatCurrency(discountPrice)}</td>
                          <td>{formatCurrency(item.sl * discountPrice)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan="6" className="text-end">
                        Tổng cộng:
                      </th>
                      <th className="text-end">
                        {formatCurrency(selectedInvoice.trigia)}
                      </th>
                    </tr>
                  </tfoot>
                </table>

                <div className="mt-4 text-end">
                  <div>
                    Ngày {new Date().getDate()} tháng{" "}
                    {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                  </div>
                  <div className="mt-4">
                    <strong>Người lập hóa đơn</strong>
                  </div>
                  <div className="mt-4 fst-italic">(Ký, ghi rõ họ tên)</div>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="primary" onClick={() => handlePrintInvoice()}>
            <i className="fas fa-print me-2"></i>In hóa đơn
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => setShowDetailModal(false)}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HoaDon;
