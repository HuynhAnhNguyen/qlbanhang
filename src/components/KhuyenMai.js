import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Badge,
  ListGroup,
  Card,
} from "react-bootstrap";
import Swal from "sweetalert2";
import {
  createKhuyenMai,
  fetchKhuyenMai,
  fetchKhuyenMaiById,
  updateKhuyenMai,
} from "../services/apiService";

const KhuyenMai = () => {
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
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [promoDetail, setPromoDetail] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    noidung: "",
    ngaybd: "",
    ngaykt: "",
    phantram: 0,
    status: "available",
  });

  const token = localStorage.getItem("token");

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.noidung.trim()) {
      errors.noidung = "Nội dung khuyến mãi là bắt buộc";
    } else if (formData.noidung.length <= 2) {
      errors.noidung = "Nội dung phải có ít nhất 2 ký tự";
    }
    if (!formData.ngaybd) {
      errors.ngaybd = "Ngày bắt đầu là bắt buộc";
    }
    if (!formData.ngaykt) {
      errors.ngaykt = "Ngày kết thúc là bắt buộc";
    } else if (new Date(formData.ngaykt) < new Date(formData.ngaybd)) {
      errors.ngaykt = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    if (formData.phantram < 0 || formData.phantram > 100) {
      errors.phantram = "Phần trăm giảm giá phải từ 0 đến 100";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch all promotions
  const loadPromotions = async () => {
    setLoading(true);
    try {
      const data = await fetchKhuyenMai(token);
      if (data.resultCode === 0) {
        setPromoList(data.data);
        setError(null);
      } else {
        throw new Error(data.message || "Không thể tải danh sách khuyến mãi");
      }
    } catch (err) {
      setError("Không thể tải danh sách khuyến mãi");
      console.error("Error loading promotions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add promotion
  const handleAddPromotion = async () => {
    if (!validateForm()) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ các trường bắt buộc!", "error");
      return;
    }

    try {
      setLoading(true);
      const data = await createKhuyenMai(token, formData);
      if (data.resultCode === 0) {
        setPromoList([...promoList, data.data]);
        setShowAddModal(false);
        setValidationErrors({});
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

  // Edit promotion
  const handleUpdatePromotion = async () => {
    if (!validateForm()) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ các trường bắt buộc!", "error");
      return;
    }

    if (!selectedPromo) return;

    try {
      setLoading(true);
      const data = await updateKhuyenMai(token, selectedPromo.id, formData);

      if (data.resultCode === 0) {
        setPromoList(
          promoList.map((item) =>
            item.id === selectedPromo.id ? data.data : item
          )
        );
        setShowEditModal(false);
        setValidationErrors({});
        Swal.fire("Thành công!", "Cập nhật khuyến mãi thành công", "success");
      } else {
        throw new Error(data.message || "Cập nhật khuyến mãi thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Cập nhật khuyến mãi thất bại", "error");
      console.error("Error updating promotion:", err);
    } finally {
      setLoading(false);
    }
  };

  // Open add modal
  const openAddModal = () => {
    setFormData({
      noidung: "",
      ngaybd: "",
      ngaykt: "",
      phantram: 0,
      status: "available",
    });
    setValidationErrors({});
    setShowAddModal(true);
  };

  // Open edit modal
  const openEditModal = async (promo) => {
    setSelectedPromo(promo);
    setFormData({
      noidung: promo.noidung,
      ngaybd: promo.ngaybd.split("/").reverse().join("-"),
      ngaykt: promo.ngaykt.split("/").reverse().join("-"),
      phantram: promo.phantram,
      status: promo.status,
    });
    setValidationErrors({});
    setShowEditModal(true);
  };

  // Open detail modal
  const openDetailModal = async (promoId) => {
    try {
      setLoading(true);
      const data = await fetchKhuyenMaiById(token, promoId);
      if (data.resultCode === 0) {
        setPromoDetail(data.data);
        setShowDetailModal(true);
      } else {
        throw new Error(data.message || "Không thể tải chi tiết khuyến mãi");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Không thể tải chi tiết khuyến mãi", "error");
      console.error("Error loading promotion detail:", err);
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

  // Handle number input changes
  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Load promotions on mount
  useEffect(() => {
    loadPromotions();
  }, []);

  // Pagination and search
  const filteredPromos = promoList.filter(
    (item) =>
      item.id?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      item.noidung?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPromos.length / itemsPerPage);
  const currentItems = filteredPromos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString;
  };

  // Render form
  const renderPromoForm = (isEdit = false) => (
    <Form>
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>
              Nội dung khuyến mãi <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="noidung"
              value={formData.noidung}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.noidung}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.noidung}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Ngày bắt đầu <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="date"
              name="ngaybd"
              value={formData.ngaybd}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.ngaybd}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.ngaybd}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Ngày kết thúc <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="date"
              name="ngaykt"
              value={formData.ngaykt}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.ngaykt}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.ngaykt}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Phần trăm giảm giá <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              name="phantram"
              value={formData.phantram}
              onChange={handleNumberInputChange}
              isInvalid={!!validationErrors.phantram}
              min="0"
              max="100"
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.phantram}
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
              <option value="available">Có hiệu lực</option>
              <option value="unavailable">Hết hiệu lực</option>
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
          <h1 className="h3 mb-3 mb-md-0">Danh sách khuyến mãi</h1>
          <div className="d-flex gap-2 align-items-center">
            <div
              className="d-flex"
              style={{ width: "100%", maxWidth: "450px" }}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm khuyến mãi..."
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
            Không tìm thấy khuyến mãi nào phù hợp!
          </div>
        ) : (
          <>
            <div className="table-responsive mb-4">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "5%" }}>STT</th>
                    <th style={{ width: "15%" }}>Mã khuyến mãi</th>
                    <th style={{ width: "20%" }}>Nội dung</th>
                    <th style={{ width: "15%" }}>Phần trăm giảm</th>
                    <th style={{ width: "25%" }}>Thời gian</th>
                    <th style={{ width: "10%" }}>Trạng thái</th>
                    <th style={{ width: "10%" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, index) => (
                    <tr key={index}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{item.id}</td>
                      <td>{item.noidung}</td>
                      <td>
                        <Badge bg="danger">{item.phantram}%</Badge>
                      </td>
                      <td>
                        {formatDate(item.ngaybd)} - {formatDate(item.ngaykt)}
                      </td>
                      <td>
                        <Badge
                          bg={
                            item.status === "available" ? "success" : "danger"
                          }
                        >
                          {item.status === "available"
                            ? "Có hiệu lực"
                            : "Hết hiệu lực"}
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
                            title="Sửa khuyến mãi"
                          >
                            <i className="fas fa-edit"></i>
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
          <Modal.Title>Thêm khuyến mãi</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderPromoForm()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleAddPromotion}
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
          <Modal.Title>Sửa khuyến mãi</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderPromoForm(true)}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdatePromotion}
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
          <Modal.Title>Chi tiết khuyến mãi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {promoDetail && (
            <Card className="promo-card">
              <Card.Body>
                <Row className="promo-row">
                  <Col md={4} className="promo-label">
                    Mã khuyến mãi
                  </Col>
                  <Col md={8} className="promo-value">
                    {promoDetail.id}
                  </Col>
                </Row>
                <Row className="promo-row">
                  <Col md={4} className="promo-label">
                    Nội dung
                  </Col>
                  <Col md={8} className="promo-value">
                    {promoDetail.noidung}
                  </Col>
                </Row>
                <Row className="promo-row">
                  <Col md={4} className="promo-label">
                    Phần trăm giảm giá
                  </Col>
                  <Col md={8} className="promo-value">
                    <Badge bg="danger">-{promoDetail.phantram}%</Badge>
                  </Col>
                </Row>
                <Row className="promo-row">
                  <Col md={4} className="promo-label">
                    Thời gian
                  </Col>
                  <Col md={8} className="promo-value">
                    {formatDate(promoDetail.ngaybd)} -{" "}
                    {formatDate(promoDetail.ngaykt)}
                  </Col>
                </Row>
                <Row className="promo-row">
                  <Col md={4} className="promo-label">
                    Trạng thái
                  </Col>
                  <Col md={8} className="promo-value">
                    <Badge
                      bg={
                        promoDetail.status === "available"
                          ? "success"
                          : "danger"
                      }
                    >
                      {promoDetail.status === "available"
                        ? "Có hiệu lực"
                        : "Hết hiệu lực"}
                    </Badge>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
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

export default KhuyenMai;
