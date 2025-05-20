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
import { FaFileInvoice, FaUser, FaClock, FaDollarSign, FaShoppingCart } from "react-icons/fa";
import Swal from "sweetalert2";
import { createHoaDon, fetchHoaDon, fetchHoaDonByKhachHangId, fetchKhachHang, fetchNhanVien, fetchSanPham } from "../services/apiService";


const HoaDon = () => {
  const [invoiceList, setInvoiceList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("all");
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
    sanpham: [],
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
    if (formData.sanpham.length === 0) {
      errors.sanpham = "Phải chọn ít nhất một sản phẩm";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
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
      const data = await fetchKhachHang(token);
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
    const maKH = e.target.value;
    setSelectedCustomer(maKH);
    setCurrentPage(1);
    if (maKH === "all") {
      loadAllInvoices();
    } else {
      loadInvoicesByMaKH(maKH);
    }
  };

  // Add product to invoice
  const addProduct = (maSP) => {
    const existingProduct = formData.sanpham.find((item) => item.maSP === maSP);
    if (existingProduct) {
      setFormData((prev) => ({
        ...prev,
        sanpham: prev.sanpham.map((item) =>
          item.maSP === maSP ? { ...item, soluong: item.soluong + 1 } : item
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        sanpham: [...prev.sanpham, { maSP, soluong: 1 }],
      }));
    }
  };

  // Update product quantity
  const updateProductQuantity = (maSP, soluong) => {
    if (soluong <= 0) {
      setFormData((prev) => ({
        ...prev,
        sanpham: prev.sanpham.filter((item) => item.maSP !== maSP),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        sanpham: prev.sanpham.map((item) =>
          item.maSP === maSP ? { ...item, soluong } : item
        ),
      }));
    }
  };

  // Remove product from invoice
  const removeProduct = (maSP) => {
    setFormData((prev) => ({
      ...prev,
      sanpham: prev.sanpham.filter((item) => item.maSP !== maSP),
    }));
  };

  // Create invoice
  const handleCreateInvoice = async () => {
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
        setFormData({ maKH: "", maNV: "", sanpham: [] });
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
    setFormData({ maKH: "", maNV: "", sanpham: [] });
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

  // Render add invoice form
  const renderAddInvoiceForm = () => (
    <Form>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Khách hàng <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              name="maKH"
              value={formData.maKH}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, maKH: e.target.value }))
              }
              isInvalid={!!validationErrors.maKH}
            >
              <option value="">-- Chọn khách hàng --</option>
              {customerList.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.hoten} ({customer.id})
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {validationErrors.maKH}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Nhân viên <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              name="maNV"
              value={formData.maNV}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, maNV: e.target.value }))
              }
              isInvalid={!!validationErrors.maNV}
            >
              <option value="">-- Chọn nhân viên --</option>
              {employeeList.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.hoten} ({employee.id})
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {validationErrors.maNV}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>
              Sản phẩm <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              onChange={(e) => addProduct(e.target.value)}
              isInvalid={!!validationErrors.sanpham}
            >
              <option value="">-- Chọn sản phẩm --</option>
              {productList.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.tensp} ({product.id})
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {validationErrors.sanpham}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      {formData.sanpham.length > 0 && (
        <Table striped bordered hover size="sm" className="mt-3">
          <thead>
            <tr>
              <th>Tên sản phẩm</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {formData.sanpham.map((item) => {
              const product = productList.find((p) => p.id === item.maSP);
              const price = product?.makm
                ? product.gia * (1 - product.makm.phantram / 100)
                : product?.gia || 0;
              return (
                <tr key={item.maSP}>
                  <td>{product?.tensp}</td>
                  <td>
                    <Form.Control
                      type="number"
                      min="0"
                      value={item.soluong}
                      onChange={(e) =>
                        updateProductQuantity(
                          item.maSP,
                          parseInt(e.target.value) || 0
                        )
                      }
                      style={{ width: "100px" }}
                    />
                  </td>
                  <td>{formatCurrency(price)}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeProduct(item.maSP)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Form>
  );

  return (
    <div className="container-fluid p-0 position-relative d-flex flex-column min-vh-100">
      <div className="p-4 flex-grow-1">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <h1 className="h3 mb-3 mb-md-0">Danh sách hóa đơn</h1>
          <div className="d-flex gap-2 align-items-center">
            <Form.Group style={{ width: "100%", maxWidth: "450px" }}>
              <Form.Label>Chọn khách hàng</Form.Label>
              <Form.Select
                value={selectedCustomer}
                onChange={handleCustomerChange}
              >
                <option value="all">Tất cả</option>
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
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm hóa đơn</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderAddInvoiceForm()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateInvoice}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Tạo hóa đơn"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết hóa đơn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInvoice && (
            <>
              <ListGroup variant="flush" className="mb-3">
                <ListGroup.Item>
                  <FaFileInvoice className="me-2" />
                  <strong>Mã hóa đơn:</strong> {selectedInvoice.id}
                </ListGroup.Item>
                <ListGroup.Item>
                  <FaUser className="me-2" />
                  <strong>Khách hàng:</strong> {selectedInvoice.makh.hoten} ({selectedInvoice.makh.id})
                </ListGroup.Item>
                <ListGroup.Item>
                  <FaUser className="me-2" />
                  <strong>Nhân viên:</strong> {selectedInvoice.manv.hoten} ({selectedInvoice.manv.id})
                </ListGroup.Item>
                <ListGroup.Item>
                  <FaClock className="me-2" />
                  <strong>Ngày hóa đơn:</strong> {formatDateTime(selectedInvoice.nghd)}
                </ListGroup.Item>
                <ListGroup.Item>
                  <FaDollarSign className="me-2" />
                  <strong>Trị giá:</strong> {formatCurrency(selectedInvoice.trigia)}
                </ListGroup.Item>
              </ListGroup>
              <h5>Chi tiết sản phẩm</h5>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Tên sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Khuyến mãi</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.cthds.map((item, index) => (
                    <tr key={index}>
                      <td>{item.masp.tensp} ({item.masp.id})</td>
                      <td>{item.sl}</td>
                      <td>{formatCurrency(item.gia)}</td>
                      <td>
                        {item.masp.makm ? (
                          <Badge bg="success">
                            {item.masp.makm.noidung} ({item.masp.makm.phantram}%)
                          </Badge>
                        ) : (
                          "Không có"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
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

export default HoaDon;