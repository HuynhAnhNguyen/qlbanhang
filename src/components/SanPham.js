import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import {
  addKhuyenMai,
  createSanPham,
  fetchSanPham,
  getSanPhamById,
  removeKhuyenMai,
  updateSanPham,
  fetchKhuyenMaiAvailable,
  uploadImage,
  getImageLink,
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
    imageurl: "",
  });

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const uploadResponse = await uploadImage(token, file);
      if (uploadResponse.resultCode === 0) {
        setFormData((prev) => ({
          ...prev,
          imageurl: uploadResponse.data,
        }));
        setValidationErrors((prev) => ({ ...prev, imageurl: "" }));
      }
    } catch (err) {
      setValidationErrors((prev) => ({
        ...prev,
        imageurl: "Không thể tải lên ảnh",
      }));
      console.error("Error uploading image:", err);
    } finally {
      setLoading(false);
    }
  };

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
    if (!formData.imageurl) {
      errors.imageurl = "Hình ảnh sản phẩm là bắt buộc";
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
    if (userRole === "ROLE_SALE") {
      Swal.fire("Lỗi!", "Bạn không có quyền thêm sản phẩm!", "error");
      return;
    }

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
     if (userRole === "ROLE_SALE") {
      Swal.fire("Lỗi!", "Bạn không có quyền cập nhật sản phẩm!", "error");
      return;
    }

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
    if (userRole === "ROLE_SALE") {
      Swal.fire("Lỗi!", "Bạn không có quyền thêm sản phẩm!", "error");
      return;
    }

    setFormData({
      tensp: "",
      dvt: "",
      nuocsx: "",
      gia: 0,
      status: "available",
      imageurl: "",
    });
    setValidationErrors({});
    setShowAddModal(true);
  };

  // Open edit modal
  const openEditModal = async (product) => {
    if (userRole === "ROLE_SALE") {
      Swal.fire("Lỗi!", "Bạn không có quyền sửa sản phẩm!", "error");
      return;
    }

    setSelectedProduct(product);
    try {
      setLoading(true);
      const data = await getSanPhamById(token, product.id);
      if (data.resultCode === 0) {
        setFormData({
          tensp: data.data.tensp,
          dvt: data.data.dvt,
          nuocsx: data.data.nuocsx,
          gia: data.data.gia,
          status: data.data.status,
          imageurl: data.data.imageurl,
        });
        setShowEditModal(true);
      } else {
        throw new Error(data.message || "Không thể tải sản phẩm");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Không thể tải sản phẩm", "error");
      console.error("Error loading news:", err);
    } finally {
      setLoading(false);
    }
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
    if (userRole === "ROLE_SALE") {
      Swal.fire("Lỗi!", "Bạn không có quyền thêm khuyến mãi!", "error");
      return;
    }

    setSelectedProduct(product);
    setSelectedPromo("");
    await loadPromotions();
    setShowPromoModal(true);
  };

  // Add promotion to product
  const handleAddPromotion = async () => {
    if (userRole === "ROLE_SALE") {
      Swal.fire("Lỗi!", "Bạn không có quyền thêm khuyến mãi!", "error");
      return;
    }

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
    if (userRole === "ROLE_SALE") {
      Swal.fire("Lỗi!", "Bạn không có quyền xóa khuyến mãi!", "error");
      return;
    }

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
        <Col md={8}>
          <Form.Group>
            <Form.Label>
              Hình ảnh sản phẩm <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              isInvalid={!!validationErrors.imageurl}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.imageurl}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Xem trước hình ảnh</Form.Label>
            <div className="mt-2">
              {formData.imageurl ? (
                <img
                  src={getImageLink(formData.imageurl)}
                  alt="Preview"
                  className="img-thumbnail"
                  style={{ maxWidth: "200px", maxHeight: "200px" }}
                />
              ) : (
                <div className="text-center">
                  <i className="fas fa-box-open fa-6x text-muted mb-3"></i>
                  <p className="text-muted">Sản phẩm không có hình ảnh</p>
                </div>
              )}
            </div>
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
              disabled={userRole === "ROLE_SALE"}
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
                    <th style={{ width: "10%" }}>Hình ảnh</th>
                    <th style={{ width: "15%" }}>Tên sản phẩm</th>
                    <th style={{ width: "10%" }}>Đơn vị tính</th>
                    <th style={{ width: "10%" }}>Giá bán</th>
                    <th style={{ width: "15%" }}>Khuyến mãi</th>
                    <th style={{ width: "10%" }}>Trạng thái</th>
                    <th style={{ width: "15%" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, index) => (
                    <tr key={index}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{item.id}</td>
                      <td>
                        {item.imageurl && (
                          <img
                            src={getImageLink(item.imageurl)}
                            alt={item.tensp}
                            className="img-thumbnail"
                            style={{ maxWidth: "100px", maxHeight: "100px" }}
                          />
                        )}
                      </td>
                      <td>{item.tensp}</td>
                      <td>{item.dvt}</td>
                      <td>
                        {item.makm ? (
                          <div>
                            <div className="fw-bold">
                              {Number(
                                item.gia * (1 - item.makm.phantram / 100)
                              ).toLocaleString("vi-VN")}{" "}
                              VND
                            </div>
                            <del className="text-muted">
                              {Number(item.gia).toLocaleString("vi-VN")} VND
                            </del>
                          </div>
                        ) : (
                          <div className="fw-bold">
                            {Number(item.gia).toLocaleString("vi-VN")} VND
                          </div>
                        )}
                      </td>
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
                            disabled={userRole === "ROLE_SALE"}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          {item.makm ? (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemovePromotion(item.id)}
                              title="Xóa khuyến mãi"
                              disabled={item.status === "unavailable" || userRole === "ROLE_SALE"}
                            >
                              <i className="fas fa-tag"></i>
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => openPromoModal(item)}
                              title="Thêm khuyến mãi"
                              disabled={item.status === "unavailable" || userRole === "ROLE_SALE"}
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
        <Modal.Body className="p-0">
          {productDetail && (
            <div className="row g-0">
              <div className="col-md-6 bg-light p-3">
                <div className="h-100 d-flex align-items-center justify-content-center">
                  <div
                    className="card border-0 w-100 h-100"
                    style={{ borderRadius: "30px" }}
                  >
                    <div
                      className="card-img-container position-relative overflow-hidden h-100"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "30px",
                        backgroundColor: "#f8f9fa", // Màu nền khi không có ảnh
                      }}
                    >
                      {productDetail.imageurl ? (
                        <img
                          src={getImageLink(productDetail.imageurl)}
                          className="img-fluid"
                          alt={productDetail.tensp}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                            borderRadius: "30px",
                            padding: "10px",
                            transition: "transform 0.3s ease",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.transform = "scale(1.03)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = "scale(1)")
                          }
                        />
                      ) : (
                        <div
                          className="d-flex flex-column align-items-center justify-content-center h-100 w-100"
                          style={{ borderRadius: "30px" }}
                        >
                          <i className="fas fa-box-open fa-6x text-muted mb-3"></i>
                          <p className="text-muted">Không có hình ảnh</p>
                        </div>
                      )}
                    </div>
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
                  </div>

                  <div className="d-flex align-items-center mb-4">
                    {productDetail.makm ? (
                      <>
                        <h4 className="text-danger fw-bold mb-0 me-3">
                          {Number(
                            productDetail.gia *
                              (1 - productDetail.makm.phantram / 100)
                          ).toLocaleString("vi-VN")}{" "}
                          VND
                        </h4>
                        <del className="text-muted me-2">
                          {Number(productDetail.gia).toLocaleString("vi-VN")}{" "}
                          VND
                        </del>
                        <span className="badge bg-success py-2">
                          Tiết kiệm {productDetail.makm.phantram}%
                        </span>
                      </>
                    ) : (
                      <h4 className="text-danger fw-bold mb-0">
                        {Number(productDetail.gia).toLocaleString("vi-VN")} VND
                      </h4>
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
                              : "bg-danger"
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
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowDetailModal(false)}
          >
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
