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
  Accordion,
  Card,
} from "react-bootstrap";
import { FaBox, FaRuler, FaGlobe, FaTag, FaCalendar } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  addKhuyenMai,
  createSanPham,
  fetchSanPham,
  getSanPhamById,
  removeKhuyenMai,
  updateSanPham,
  fetchKhuyenMaiAvailable,
} from "../services/apiService";

const SanPham = () => {
  const [productList, setProductList] = useState([]);
  const [promoList, setPromoList] = useState([]);
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
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPromo, setSelectedPromo] = useState("");
  const [productDetail, setProductDetail] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    tensp: "",
    dvt: "",
    nuocsx: "",
    gia: 0,
    status: "available",
  });

  const token = localStorage.getItem("token");

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.tensp.trim()) {
      errors.tensp = "Tên sản phẩm là bắt buộc";
    } else if (formData.tensp.length <= 2) {
      errors.tensp = "Tên sản phẩm phải có ít nhất 2 ký tự";
    }
    if (!formData.dvt.trim()) {
      errors.dvt = "Đơn vị tính là bắt buộc";
    }
    if (!formData.nuocsx.trim()) {
      errors.nuocsx = "Nước sản xuất là bắt buộc";
    }
    if (formData.gia <= 0) {
      errors.gia = "Giá phải lớn hơn 0";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch all products
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchSanPham(token);
      if (data.resultCode === 0) {
        setProductList(data.data);
        setError(null);
      } else {
        throw new Error(data.message || "Không thể tải danh sách sản phẩm");
      }
    } catch (err) {
      setError("Không thể tải danh sách sản phẩm");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all promotions
  const loadPromotions = async () => {
    try {
      const data = await fetchKhuyenMaiAvailable(token);
      if (data.resultCode === 0) {
        setPromoList(data.data);
      }
    } catch (err) {
      console.error("Error loading promotions:", err);
    }
  };

  // Add product
  const handleAddProduct = async () => {
    if (!validateForm()) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ các trường bắt buộc!", "error");
      return;
    }

    try {
      setLoading(true);
      const data = await createSanPham(token, formData);
      if (data.resultCode === 0) {
        setProductList([...productList, data.data]);
        setShowAddModal(false);
        setValidationErrors({});
        Swal.fire("Thành công!", "Thêm sản phẩm thành công", "success");
      } else {
        throw new Error(data.message || "Thêm sản phẩm thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Thêm sản phẩm thất bại", "error");
      console.error("Error adding product:", err);
    } finally {
      setLoading(false);
    }
  };

  // Edit product
  const handleUpdateProduct = async () => {
    if (!validateForm()) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ các trường bắt buộc!", "error");
      return;
    }

    if (!selectedProduct) return;

    try {
      setLoading(true);
      const data = await updateSanPham(token, selectedProduct.id, formData);

      if (data.resultCode === 0) {
        setProductList(
          productList.map((item) =>
            item.id === selectedProduct.id ? data.data : item
          )
        );
        setShowEditModal(false);
        setValidationErrors({});
        Swal.fire("Thành công!", "Cập nhật sản phẩm thành công", "success");
      } else {
        throw new Error(data.message || "Cập nhật sản phẩm thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Cập nhật sản phẩm thất bại", "error");
      console.error("Error updating product:", err);
    } finally {
      setLoading(false);
    }
  };

  // Open add modal
  const openAddModal = () => {
    // setFormData({
    //   userName: "",
    //   passWord: "",
    //   email: "",
    //   phoneNumber: "",
    //   fullname: "",
    //   roleName: "",
    // });
    // setValidationErrors({});
    // setShowAddModal(true);

    setFormData({
      tensp: "",
      dvt: "",
      nuocsx: "",
      gia: 0,
      status: "available",
    });
    setValidationErrors({});
    setShowAddModal(true);
  };

  // Open edit modal
  const openEditModal = async (product) => {
    setSelectedProduct(product);
    setFormData({
      tensp: product.tensp,
      dvt: product.dvt,
      nuocsx: product.nuocsx,
      gia: product.gia,
      status: product.status,
    });
    setValidationErrors({});
    setShowEditModal(true);
  };

  // Open detail modal
  const openDetailModal = async (productId) => {
    try {
      setLoading(true);
      const data = await getSanPhamById(token, productId);
      if (data.resultCode === 0) {
        setProductDetail(data.data);
        setShowDetailModal(true);
      } else {
        throw new Error(data.message || "Không thể tải chi tiết sản phẩm");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Không thể tải chi tiết sản phẩm", "error");
      console.error("Error loading product detail:", err);
    } finally {
      setLoading(false);
    }
  };

  // Open promo modal
  const openPromoModal = async (product) => {
    setSelectedProduct(product);
    setSelectedPromo("");
    await loadPromotions();
    setShowPromoModal(true);
  };

  // Add promotion to product
  const handleAddPromotion = async () => {
    if (!selectedPromo) {
      Swal.fire("Lỗi!", "Vui lòng chọn khuyến mãi", "error");
      return;
    }

    try {
      setLoading(true);
      const data = await addKhuyenMai(token, selectedProduct.id, selectedPromo);

      if (data.resultCode === 0) {
        await loadProducts();
        setShowPromoModal(false);
        Swal.fire("Thành công!", "Thêm khuyến mãi thành công", "success");
      } else {
        throw new Error(data.message || "Thêm khuyến mãi thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Thêm khuyến mãi thất bại", "error");
      console.error("Error adding promotion:", err);
    } finally {
      setLoading(false);
    }
  };

  // Remove promotion from product
  const handleRemovePromotion = async (productId) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn có chắc chắn muốn xóa khuyến mãi này?",
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
        const data = await removeKhuyenMai(token, productId);

        if (data.resultCode === 0) {
          await loadProducts();
          Swal.fire("Thành công!", "Xóa khuyến mãi thành công", "success");
        } else {
          throw new Error(data.message || "Xóa khuyến mãi thất bại");
        }
      } catch (err) {
        Swal.fire("Lỗi!", "Xóa khuyến mãi thất bại", "error");
        console.error("Error removing promotion:", err);
      } finally {
        setLoading(false);
      }
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

  // Handle number input changes
  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Pagination and search
  const filteredProducts = productList.filter(
    (item) =>
      item.id?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      item.tensp?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      item.dvt?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("/");
    return `${day}/${month}/${year}`;
  };

  // Render form
  const renderProductForm = (isEdit = false) => (
    <Form>
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>
              Tên sản phẩm <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="tensp"
              value={formData.tensp}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.tensp}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.tensp}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Đơn vị tính <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="dvt"
              value={formData.dvt}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.dvt}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.dvt}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Nước sản xuất <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="nuocsx"
              value={formData.nuocsx}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.nuocsx}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.nuocsx}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Giá <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              name="gia"
              value={formData.gia}
              onChange={handleNumberInputChange}
              isInvalid={!!validationErrors.gia}
              min="0"
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.gia}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Trạng thái <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="available">Có sẵn</option>
              <option value="unavailable">Hết hàng</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );

  return (
    <div className="container-fluid p-0 position-relative d-flex flex-column min-vh-100">
      <div className="p-4 flex-grow-1">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <h1 className="h3 mb-3 mb-md-0">Danh sách sản phẩm</h1>
          <div className="d-flex gap-2 align-items-center">
            <div
              className="d-flex"
              style={{ width: "100%", maxWidth: "450px" }}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm sản phẩm..."
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
            Không tìm thấy sản phẩm nào phù hợp!
          </div>
        ) : (
          <>
            <div className="table-responsive mb-4">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "5%" }}>STT</th>
                    <th style={{ width: "10%" }}>Mã SP</th>
                    <th style={{ width: "25%" }}>Tên sản phẩm</th>
                    <th style={{ width: "10%" }}>Đơn vị tính</th>
                    <th style={{ width: "15%" }}>Giá bán</th>
                    <th style={{ width: "10%" }}>Khuyến mãi</th>
                    <th style={{ width: "10%" }}>Trạng thái</th>
                    <th style={{ width: "15%" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, index) => (
                    <tr key={index}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{item.id}</td>
                      <td>{item.tensp}</td>
                      <td>{item.dvt}</td>
                      <td>{Number(item.gia).toLocaleString("vi-VN")} VND</td>
                      <td>
                        {item.makm ? (
                          <div>
                            <Badge bg="danger">-{item.makm.phantram}%</Badge>
                            <small className="d-block">
                              {item.makm.noidung}
                            </small>
                            <small className="text-muted">
                              {formatDate(item.makm.ngaybd)} -{" "}
                              {formatDate(item.makm.ngaykt)}
                            </small>
                          </div>
                        ) : (
                          <span className="text-muted">Không có</span>
                        )}
                      </td>
                      <td>
                        <Badge
                          bg={
                            item.status === "available" ? "success" : "danger"
                          }
                        >
                          {item.status === "available" ? "Có sẵn" : "Hết hàng"}
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
                            title="Sửa sản phẩm"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          {item.makm ? (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemovePromotion(item.id)}
                              title="Xóa khuyến mãi"
                            >
                              <i className="fas fa-tag"></i>
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => openPromoModal(item)}
                              title="Thêm khuyến mãi"
                            >
                              <i className="fas fa-tag"></i>
                            </button>
                          )}
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
                        &laquo;
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
                        &raquo;
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
          <Modal.Title>Thêm sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderProductForm()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleAddProduct}
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
          <Modal.Title>Sửa sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderProductForm(true)}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateProduct}
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
          <Modal.Title>Chi tiết sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {productDetail && (
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>Mã sản phẩm:</strong> {productDetail.id}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Tên sản phẩm:</strong> {productDetail.tensp}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Đơn vị tính:</strong> {productDetail.dvt}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Nước sản xuất:</strong> {productDetail.nuocsx}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Giá bán:</strong>{" "}
                {Number(productDetail.gia).toLocaleString("vi-VN")} VND
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Trạng thái:</strong>{" "}
                <Badge
                  bg={
                    productDetail.status === "available"
                      ? "success"
                      : "secondary"
                  }
                >
                  {productDetail.status === "available" ? "Có sẵn" : "Hết hàng"}
                </Badge>
              </ListGroup.Item>
              {productDetail.makm && (
                <>
                  <ListGroup.Item className="mt-3">
                    <strong>Thông tin khuyến mãi:</strong>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Mã KM:</strong> {productDetail.makm.id}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Nội dung:</strong> {productDetail.makm.noidung}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Giảm giá:</strong>{" "}
                    <Badge bg="success">{productDetail.makm.phantram}%</Badge>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Thời gian:</strong>{" "}
                    {formatDate(productDetail.makm.ngaybd)} -{" "}
                    {formatDate(productDetail.makm.ngaykt)}
                  </ListGroup.Item>
                </>
              )}
            </ListGroup>
          )}
        </Modal.Body>

        <Modal.Body className="p-4">
          {productDetail && (
            <Tabs
              defaultActiveKey="product"
              id="product-detail-tabs"
              className="mb-4"
              variant="pills"
              justify
            >
              <Tab eventKey="product" title="Thông Tin Sản Phẩm">
                <Row>
                  <Col md={8} className="mx-auto">
                    <dl className="row mt-3">
                      <dt className="col-sm-4">Mã sản phẩm</dt>
                      <dd className="col-sm-8">{productDetail.id}</dd>
                      <dt className="col-sm-4">Tên sản phẩm</dt>
                      <dd className="col-sm-8">{productDetail.tensp}</dd>
                      <dt className="col-sm-4">Đơn vị tính</dt>
                      <dd className="col-sm-8">{productDetail.dvt}</dd>
                      <dt className="col-sm-4">Nước sản xuất</dt>
                      <dd className="col-sm-8">{productDetail.nuocsx}</dd>
                      <dt className="col-sm-4">Giá bán</dt>
                      <dd className="col-sm-8">
                        <span className="text-success fw-bold">
                          {Number(productDetail.gia).toLocaleString("vi-VN")}{" "}
                          VND
                        </span>
                      </dd>
                      <dt className="col-sm-4">Trạng thái</dt>
                      <dd className="col-sm-8">
                        <Badge
                          bg={
                            productDetail.status === "available"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {productDetail.status === "available"
                            ? "Có sẵn"
                            : "Hết hàng"}
                        </Badge>
                      </dd>
                    </dl>
                  </Col>
                </Row>
              </Tab>
              {productDetail.makm && (
                <Tab eventKey="promotion" title="Khuyến Mãi">
                  <Row>
                    <Col md={8} className="mx-auto">
                      <dl className="row mt-3">
                        <dt className="col-sm-4">Mã KM</dt>
                        <dd className="col-sm-8">{productDetail.makm.id}</dd>
                        <dt className="col-sm-4">Nội dung</dt>
                        <dd className="col-sm-8">
                          {productDetail.makm.noidung}
                        </dd>
                        <dt className="col-sm-4">Giảm giá</dt>
                        <dd className="col-sm-8">
                          <Badge bg="success">
                            {productDetail.makm.phantram}%
                          </Badge>
                        </dd>
                        <dt className="col-sm-4">Thời gian</dt>
                        <dd className="col-sm-8">
                          {formatDate(productDetail.makm.ngaybd)} -{" "}
                          {formatDate(productDetail.makm.ngaykt)}
                        </dd>
                      </dl>
                    </Col>
                  </Row>
                </Tab>
              )}
            </Tabs>
          )}
        </Modal.Body>

        <Modal.Body className="p-4">
          {productDetail && (
            <Accordion defaultActiveKey="0" flush>
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <h5 className="mb-0 text-primary">Thông Tin Sản Phẩm</h5>
                </Accordion.Header>
                <Accordion.Body>
                  <ul className="list-unstyled">
                    <li className="mb-3 d-flex align-items-center">
                      <FaBox className="me-2 text-primary" />
                      <strong className="me-2">Mã sản phẩm:</strong>{" "}
                      {productDetail.id}
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <FaBox className="me-2 text-primary" />
                      <strong className="me-2">Tên sản phẩm:</strong>{" "}
                      {productDetail.tensp}
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <FaRuler className="me-2 text-primary" />
                      <strong className="me-2">Đơn vị tính:</strong>{" "}
                      {productDetail.dvt}
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <FaGlobe className="me-2 text-primary" />
                      <strong className="me-2">Nước sản xuất:</strong>{" "}
                      {productDetail.nuocsx}
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <FaTag className="me-2 text-primary" />
                      <strong className="me-2">Giá bán:</strong>
                      <span className="text-success fs-5">
                        {Number(productDetail.gia).toLocaleString("vi-VN")} VND
                      </span>
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <FaTag className="me-2 text-primary" />
                      <strong className="me-2">Trạng thái:</strong>
                      <Badge
                        bg={
                          productDetail.status === "available"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {productDetail.status === "available"
                          ? "Có sẵn"
                          : "Hết hàng"}
                      </Badge>
                    </li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>
              {productDetail.makm && (
                <Accordion.Item eventKey="1">
                  <Accordion.Header>
                    <h5 className="mb-0 text-success">Thông Tin Khuyến Mãi</h5>
                  </Accordion.Header>
                  <Accordion.Body>
                    <ul className="list-unstyled">
                      <li className="mb-3 d-flex align-items-center">
                        <FaTag className="me-2 text-success" />
                        <strong className="me-2">Mã KM:</strong>{" "}
                        {productDetail.makm.id}
                      </li>
                      <li className="mb-3 d-flex align-items-center">
                        <FaTag className="me-2 text-success" />
                        <strong className="me-2">Nội dung:</strong>{" "}
                        {productDetail.makm.noidung}
                      </li>
                      <li className="mb-3 d-flex align-items-center">
                        <FaTag className="me-2 text-success" />
                        <strong className="me-2">Giảm giá:</strong>
                        <Badge bg="success">
                          {productDetail.makm.phantram}%
                        </Badge>
                      </li>
                      <li className="mb-3 d-flex align-items-center">
                        <FaCalendar className="me-2 text-success" />
                        <strong className="me-2">Thời gian:</strong>
                        {formatDate(productDetail.makm.ngaybd)} -{" "}
                        {formatDate(productDetail.makm.ngaykt)}
                      </li>
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
              )}
            </Accordion>
          )}
        </Modal.Body>

        <Modal.Body className="p-4">
          {productDetail && (
            <>
              <Card className="shadow-sm mb-4">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="d-flex align-items-center mb-3">
                        <FaBox className="me-2 text-primary" />
                        <div>
                          <strong>Mã sản phẩm:</strong> {productDetail.id}
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <FaBox className="me-2 text-primary" />
                        <div>
                          <strong>Tên sản phẩm:</strong> {productDetail.tensp}
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <FaRuler className="me-2 text-primary" />
                        <div>
                          <strong>Đơn vị tính:</strong> {productDetail.dvt}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex align-items-center mb-3">
                        <FaGlobe className="me-2 text-primary" />
                        <div>
                          <strong>Nước sản xuất:</strong> {productDetail.nuocsx}
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <FaTag className="me-2 text-primary" />
                        <div>
                          <strong>Giá bán:</strong>{" "}
                          <span className="text-success fs-5">
                            {Number(productDetail.gia).toLocaleString("vi-VN")}{" "}
                            VND
                          </span>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <FaTag className="me-2 text-primary" />
                        <div>
                          <strong>Trạng thái:</strong>{" "}
                          <Badge
                            bg={
                              productDetail.status === "available"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {productDetail.status === "available"
                              ? "Có sẵn"
                              : "Hết hàng"}
                          </Badge>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              {productDetail.makm && (
                <Card className="shadow-sm">
                  <Card.Header className="bg-successKelly text-white">
                    <h5 className="mb-0">Thông Tin Khuyến Mãi</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <div className="d-flex align-items-center mb-3">
                          <FaTag className="me-2 text-success" />
                          <div>
                            <strong>Mã KM:</strong> {productDetail.makm.id}
                          </div>
                        </div>
                        <div className="d-flex align-items-center mb-3">
                          <FaTag className="me-2 text-success" />
                          <div>
                            <strong>Nội dung:</strong>{" "}
                            {productDetail.makm.noidung}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="d-flex align-items-center mb-3">
                          <FaTag className="me-2 text-success" />
                          <div>
                            <strong>Giảm giá:</strong>{" "}
                            <Badge bg="success">
                              {productDetail.makm.phantram}%
                            </Badge>
                          </div>
                        </div>
                        <div className="d-flex align-items-center mb-3">
                          <FaCalendar className="me-2 text-success" />
                          <div>
                            <strong>Thời gian:</strong>{" "}
                            {formatDate(productDetail.makm.ngaybd)} -{" "}
                            {formatDate(productDetail.makm.ngaykt)}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Body>
          {productDetail && (
            <div className="row">
              <div className="col-md-6">
                <div className="product-image-container bg-light rounded-3 p-4 mb-3">
                  <div className="ratio ratio-1x1">
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="fas fa-box-open fa-5x text-muted"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <h3 className="fw-bold mb-3">{productDetail.tensp}</h3>

                <div className="d-flex align-items-center mb-3">
                  <span className="badge bg-primary me-2">
                    {productDetail.id}
                  </span>
                  <span
                    className={`badge ${
                      productDetail.status === "available"
                        ? "bg-success"
                        : "bg-secondary"
                    }`}
                  >
                    {productDetail.status === "available"
                      ? "Có sẵn"
                      : "Hết hàng"}
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="text-danger fw-bold">{productDetail.gia}</h4>
                  {productDetail.makm && (
                    <div className="text-muted">
                      <del>{productDetail.gia}</del>
                      <span className="ms-2 badge bg-success">
                        Tiết kiệm {productDetail.makm.phantram}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="product-details mb-4">
                  <div className="d-flex mb-2">
                    <span
                      className="text-muted me-2"
                      style={{ width: "120px" }}
                    >
                      Đơn vị tính:
                    </span>
                    <span>{productDetail.dvt}</span>
                  </div>
                  <div className="d-flex mb-2">
                    <span
                      className="text-muted me-2"
                      style={{ width: "120px" }}
                    >
                      Xuất xứ:
                    </span>
                    <span>{productDetail.nuocsx}</span>
                  </div>
                </div>

                {productDetail.makm && (
                  <div className="promo-section p-3 bg-light rounded-3 mb-4">
                    <h5 className="fw-bold mb-3">Khuyến mãi</h5>
                    <div className="d-flex align-items-center mb-2">
                      <i className="fas fa-tag me-2 text-success"></i>
                      <span>{productDetail.makm.noidung}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <i className="far fa-calendar-alt me-2 text-success"></i>
                      <span>
                        {formatDate(productDetail.makm.ngaybd)} -{" "}
                        {formatDate(productDetail.makm.ngaykt)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Body>
          {productDetail && (
            <>
              <div className="d-flex align-items-start mb-4">
                <div className="flex-shrink-0 me-4">
                  <div
                    className="bg-light rounded-3 p-4"
                    style={{ width: "120px", height: "120px" }}
                  >
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <i className="fas fa-box text-muted fa-3x"></i>
                    </div>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h4 className="fw-bold mb-2">{productDetail.tensp}</h4>
                  <div className="d-flex align-items-center mb-2">
                    <span className="badge bg-primary me-2">
                      {productDetail.id}
                    </span>
                    <span
                      className={`badge ${
                        productDetail.status === "available"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                    >
                      {productDetail.status === "available"
                        ? "Có sẵn"
                        : "Hết hàng"}
                    </span>
                  </div>
                  <h5 className="text-danger fw-bold mb-3">
                    {productDetail.gia}
                    {productDetail.makm && (
                      <span className="ms-2 badge bg-success">
                        -{productDetail.makm.phantram}%
                      </span>
                    )}
                  </h5>
                </div>
              </div>

              <nav>
                <div className="nav nav-tabs" id="nav-tab" role="tablist">
                  <button
                    className="nav-link active"
                    id="nav-info-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#nav-info"
                    type="button"
                    role="tab"
                    aria-controls="nav-info"
                    aria-selected="true"
                  >
                    Thông tin
                  </button>
                  {productDetail.makm && (
                    <button
                      className="nav-link"
                      id="nav-promo-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-promo"
                      type="button"
                      role="tab"
                      aria-controls="nav-promo"
                      aria-selected="false"
                    >
                      Khuyến mãi
                    </button>
                  )}
                </div>
              </nav>
              <div
                className="tab-content p-3 border border-top-0 rounded-bottom"
                id="nav-tabContent"
              >
                <div
                  className="tab-pane fade show active"
                  id="nav-info"
                  role="tabpanel"
                  aria-labelledby="nav-info-tab"
                >
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="text-muted small">Đơn vị tính</label>
                        <p>{productDetail.dvt}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="text-muted small">Xuất xứ</label>
                        <p>{productDetail.nuocsx}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {productDetail.makm && (
                  <div
                    className="tab-pane fade"
                    id="nav-promo"
                    role="tabpanel"
                    aria-labelledby="nav-promo-tab"
                  >
                    <div className="promo-details">
                      <div className="d-flex align-items-center mb-3">
                        <i className="fas fa-tag me-3 text-success fa-lg"></i>
                        <div>
                          <h6 className="fw-bold mb-1">
                            {productDetail.makm.noidung}
                          </h6>
                          <p className="mb-1">
                            Giảm {productDetail.makm.phantram}%
                          </p>
                          <small className="text-muted">
                            {formatDate(productDetail.makm.ngaybd)} -{" "}
                            {formatDate(productDetail.makm.ngaykt)}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Body className="p-4">
          {productDetail && (
            <div className="text-center">
              <div className="mb-4">
                <div className="bg-light rounded-circle p-4 d-inline-block">
                  <i className="fas fa-box-open fa-3x text-primary"></i>
                </div>
              </div>

              <h4 className="fw-bold mb-2">{productDetail.tensp}</h4>
              <p className="text-muted mb-3">{productDetail.id}</p>

              <div className="d-flex justify-content-center align-items-center mb-4">
                <h5 className="fw-bold text-danger mb-0 me-2">
                  {productDetail.gia}
                </h5>
                {productDetail.makm && (
                  <span className="badge bg-success">
                    -{productDetail.makm.phantram}%
                  </span>
                )}
              </div>

              <div className="text-start mb-4">
                <div className="d-flex mb-2">
                  <span className="text-muted" style={{ width: "100px" }}>
                    Đơn vị:
                  </span>
                  <span>{productDetail.dvt}</span>
                </div>
                <div className="d-flex mb-2">
                  <span className="text-muted" style={{ width: "100px" }}>
                    Xuất xứ:
                  </span>
                  <span>{productDetail.nuocsx}</span>
                </div>
                <div className="d-flex">
                  <span className="text-muted" style={{ width: "100px" }}>
                    Trạng thái:
                  </span>
                  <span
                    className={`badge ${
                      productDetail.status === "available"
                        ? "bg-success"
                        : "bg-secondary"
                    }`}
                  >
                    {productDetail.status === "available"
                      ? "Có sẵn"
                      : "Hết hàng"}
                  </span>
                </div>
              </div>

              {productDetail.makm && (
                <div className="alert alert-success text-start">
                  <h6 className="fw-bold mb-2">
                    <i className="fas fa-tag me-2"></i>
                    {productDetail.makm.noidung}
                  </h6>
                  <p className="small mb-1">
                    Giảm {productDetail.makm.phantram}% giá sản phẩm
                  </p>
                  <p className="small text-muted mb-0">
                    Áp dụng từ {formatDate(productDetail.makm.ngaybd)} đến{" "}
                    {formatDate(productDetail.makm.ngaykt)}
                  </p>
                </div>
              )}

              <button
                className="btn btn-outline-primary w-100 mt-3"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
            </div>
          )}
        </Modal.Body>

        <Modal.Body className="p-0">
          {productDetail && (
            <div className="row g-0">
              <div className="col-md-6 bg-light">
                <div className="h-100 d-flex align-items-center justify-content-center p-4">
                  {/* Thay thế bằng hình ảnh thực tế nếu có */}
                  <div className="text-center">
                    <i className="fas fa-box-open fa-6x text-muted mb-3"></i>
                    <p className="text-muted">Hình ảnh sản phẩm</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-4 h-100">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h3 className="fw-bold mb-1">{productDetail.tensp}</h3>
                      <p className="text-muted small">{productDetail.id}</p>
                    </div>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowDetailModal(false)}
                    ></button>
                  </div>

                  <div className="d-flex align-items-center mb-4">
                    <h4 className="text-danger fw-bold mb-0 me-3">
                      {productDetail.gia}
                    </h4>
                    {productDetail.makm && (
                      <span className="badge bg-success py-2">
                        Tiết kiệm {productDetail.makm.phantram}%
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="row">
                      <div className="col-6 mb-3">
                        <label className="d-block text-muted small">
                          Đơn vị tính
                        </label>
                        <span className="fw-medium">{productDetail.dvt}</span>
                      </div>
                      <div className="col-6 mb-3">
                        <label className="d-block text-muted small">
                          Xuất xứ
                        </label>
                        <span className="fw-medium">
                          {productDetail.nuocsx}
                        </span>
                      </div>
                      <div className="col-6">
                        <label className="d-block text-muted small">
                          Trạng thái
                        </label>
                        <span
                          className={`badge ${
                            productDetail.status === "available"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {productDetail.status === "available"
                            ? "Có sẵn"
                            : "Hết hàng"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {productDetail.makm && (
                    <div className="border-top pt-3 mb-4">
                      <h6 className="fw-bold mb-3">
                        <i className="fas fa-percentage text-success me-2"></i>
                        Khuyến mãi áp dụng
                      </h6>
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 bg-success bg-opacity-10 p-2 rounded me-3">
                          <i className="fas fa-tag text-success"></i>
                        </div>
                        <div className="flex-grow-1">
                          <p className="fw-medium mb-1">
                            {productDetail.makm.noidung}
                          </p>
                          <p className="small text-muted mb-1">
                            Giảm {productDetail.makm.phantram}% giá sản phẩm
                          </p>
                          <p className="small text-muted mb-0">
                            <i className="far fa-calendar-alt me-1"></i>
                            {formatDate(productDetail.makm.ngaybd)} -{" "}
                            {formatDate(productDetail.makm.ngaykt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Body>
          {productDetail && (
            <div className="row">
              <div className="col-md-5">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body d-flex flex-column">
                    <div className="text-center mb-4 flex-grow-1 d-flex align-items-center justify-content-center">
                      <div>
                        <div className="bg-primary bg-opacity-10 rounded-circle p-4 d-inline-block mb-3">
                          <i className="fas fa-box fa-3x text-primary"></i>
                        </div>
                        <h5 className="fw-bold">{productDetail.tensp}</h5>
                        <p className="text-muted">{productDetail.id}</p>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center border-top pt-3">
                      <div>
                        <h4 className="fw-bold text-danger mb-0">
                          {productDetail.gia}
                        </h4>
                        {productDetail.makm && (
                          <small className="text-success">
                            Đang giảm {productDetail.makm.phantram}%
                          </small>
                        )}
                      </div>
                      <span
                        className={`badge ${
                          productDetail.status === "available"
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >
                        {productDetail.status === "available"
                          ? "Có sẵn"
                          : "Hết hàng"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-7">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Thông tin cơ bản</h6>

                    <div className="row mb-3">
                      <div className="col-6">
                        <label className="text-muted small d-block">
                          Đơn vị tính
                        </label>
                        <p className="fw-medium">{productDetail.dvt}</p>
                      </div>
                      <div className="col-6">
                        <label className="text-muted small d-block">
                          Xuất xứ
                        </label>
                        <p className="fw-medium">{productDetail.nuocsx}</p>
                      </div>
                    </div>

                    {productDetail.makm && (
                      <>
                        <h6 className="fw-bold mb-3">Thông tin khuyến mãi</h6>
                        <div className="alert alert-success bg-opacity-10 border-0">
                          <div className="d-flex align-items-start">
                            <div className="flex-shrink-0 text-success">
                              <i className="fas fa-tag"></i>
                            </div>
                            <div className="flex-grow-1 ms-3">
                              <h6 className="alert-heading fw-bold">
                                {productDetail.makm.noidung}
                              </h6>
                              <div className="d-flex align-items-center mb-1">
                                <span className="badge bg-success me-2">
                                  -{productDetail.makm.phantram}%
                                </span>
                                <small className="text-muted">
                                  {formatDate(productDetail.makm.ngaybd)} -{" "}
                                  {formatDate(productDetail.makm.ngaykt)}
                                </small>
                              </div>
                              <small className="text-muted">
                                Áp dụng cho sản phẩm này
                              </small>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
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

      {/* Promotion Modal */}
      <Modal show={showPromoModal} onHide={() => setShowPromoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm khuyến mãi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Chọn khuyến mãi</Form.Label>
              <Form.Select
                value={selectedPromo}
                onChange={(e) => setSelectedPromo(e.target.value)}
              >
                <option value="">-- Chọn khuyến mãi --</option>
                {promoList.map((promo) => (
                  <option key={promo.id} value={promo.id}>
                    {promo.id} - {promo.noidung} ({promo.phantram}%)
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            {selectedPromo && (
              <div className="alert alert-info">
                <strong>Thông tin khuyến mãi:</strong>
                <div>
                  {promoList.find((p) => p.id === selectedPromo)?.noidung} -
                  Giảm {promoList.find((p) => p.id === selectedPromo)?.phantram}
                  %
                </div>
                <div>
                  Thời gian:{" "}
                  {formatDate(
                    promoList.find((p) => p.id === selectedPromo)?.ngaybd
                  )}{" "}
                  -{" "}
                  {formatDate(
                    promoList.find((p) => p.id === selectedPromo)?.ngaykt
                  )}
                </div>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPromoModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleAddPromotion}
            disabled={!selectedPromo || loading}
          >
            {loading ? "Đang xử lý..." : "Thêm khuyến mãi"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SanPham;
