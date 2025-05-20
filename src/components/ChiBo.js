import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import {
  fetchChiBo,
  createChiBo,
  updateChiBo,
  createXepLoai,
  updateXepLoai,
  fetchXepLoaiByChiBoId,
} from "../services/apiService";
import Swal from "sweetalert2";

const ChiBo = () => {
  const [chiBo, setChiBo] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const itemsPerPage = 10;

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showXepLoaiModal, setShowXepLoaiModal] = useState(false);
  const [selectedChiBo, setSelectedChiBo] = useState(null);
  const [xepLoaiList, setXepLoaiList] = useState([]);
  const [xepLoaiForm, setXepLoaiForm] = useState({
    nam: "",
    xeploai: "",
  });
  const [editXepLoaiId, setEditXepLoaiId] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    tenchibo: "",
    danguycaptren: "",
    diachi: "",
    bithu: "",
    phobithu: "",
    ngaythanhlap: "",
    ghichu: "",
    trangthai: "",
  });

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Validate form data
  const validateForm = () => {
    const errors = {};

    // tenchibo
    if (!formData.tenchibo.trim()) {
      errors.tenchibo = "Tên chi bộ là bắt buộc";
    } else if (formData.tenchibo.length < 3) {
      errors.tenchibo = "Tên chi bộ phải có ít nhất 3 ký tự";
    } else if (formData.tenchibo.length > 100) {
      errors.tenchibo = "Tên chi bộ không được vượt quá 100 ký tự";
    }

    // danguycaptren
    if (!formData.danguycaptren.trim()) {
      errors.danguycaptren = "Đảng ủy cấp trên là bắt buộc";
    } else if (formData.danguycaptren.length < 3) {
      errors.danguycaptren = "Đảng ủy cấp trên phải có ít nhất 3 ký tự";
    } else if (formData.danguycaptren.length > 100) {
      errors.danguycaptren = "Đảng ủy cấp trên không được vượt quá 100 ký tự";
    }

    // diachi
    if (formData.diachi && formData.diachi.length > 200) {
      errors.diachi = "Địa chỉ không được vượt quá 200 ký tự";
    }

    // bithu
    if (!formData.bithu.trim()) {
      errors.bithu = "Họ và tên bí thư là bắt buộc";
    } else if (formData.bithu.length < 2) {
      errors.bithu = "Họ và tên bí thư phải có ít nhất 2 ký tự";
    } else if (formData.bithu.length > 50) {
      errors.bithu = "Họ và tên bí thư không được vượt quá 50 ký tự";
    }

    // phobithu
    if (formData.phobithu && formData.phobithu.length > 50) {
      errors.phobithu = "Họ và tên phó bí thư không được vượt quá 50 ký tự";
    }

    // ngaythanhlap
    if (!formData.ngaythanhlap) {
      errors.ngaythanhlap = "Ngày thành lập là bắt buộc";
    } else {
      const today = new Date();
      const selectedDate = new Date(formData.ngaythanhlap);
      if (selectedDate > today) {
        errors.ngaythanhlap =
          "Ngày thành lập không được là ngày trong tương lai";
      }
    }

    // trangthai
    if (!formData.trangthai) {
      errors.trangthai = "Trạng thái là bắt buộc";
    } else if (
      !["hoatdong", "giaithe", "tamdung"].includes(formData.trangthai)
    ) {
      errors.trangthai = "Trạng thái không hợp lệ";
    }

    // ghichu
    if (formData.ghichu && formData.ghichu.length > 500) {
      errors.ghichu = "Ghi chú không được vượt quá 500 ký tự";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate XepLoai form
  const validateXepLoaiForm = () => {
    const errors = {};

    if (!xepLoaiForm.nam) {
      errors.nam = "Năm là bắt buộc";
    } else if (!/^\d{4}$/.test(xepLoaiForm.nam)) {
      errors.nam = "Năm phải là số có 4 chữ số";
    }

    if (!xepLoaiForm.xeploai) {
      errors.xeploai = "Hình thức xếp loại là bắt buộc";
    } else if (
      !["xuatsac", "tot", "hoanthanh", "khonghoanthanh"].includes(
        xepLoaiForm.xeploai
      )
    ) {
      errors.xeploai = "Hình thức xếp loại không hợp lệ";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch chiBo from API
  const loadChiBo = async () => {
    setLoading(true);
    try {
      const response = await fetchChiBo(token);
      //   console.log("Phản hồi API:", response);
      //     console.log("Phản hồi API:", response.data);
      //   // setChiBo(data);
      //   setChiBo(Array.isArray(response.data) ? response.data : []);
      //   setError(null);
      if (response.resultCode === 0) {
        const chiBoData = Array.isArray(response.data) ? response.data : [];
        setChiBo(chiBoData);
        setError(null);
      } else {
        throw new Error(response.message || "Không thể tải danh sách chi bộ");
      }
    } catch (err) {
      setError("Không thể tải danh sách chi bộ");
      console.error("Error loading chiBo:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch XepLoai by ChiBoId
  const loadXepLoai = async (chiboId) => {
    setLoading(true);
    try {
      const response = await fetchXepLoaiByChiBoId(token, chiboId);
      if (response.resultCode === 0) {
        setXepLoaiList(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } else {
        throw new Error(response.message || "Không thể tải danh sách xếp loại");
      }
    } catch (err) {
      setError("Không thể tải danh sách xếp loại");
      console.error("Error loading xepLoai:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create new XepLoai
  const handleCreateXepLoai = async () => {
    if (!validateXepLoaiForm()) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ các trường bắt buộc!", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await createXepLoai(
        token,
        selectedChiBo.id,
        xepLoaiForm.nam,
        xepLoaiForm.xeploai
      );
      if (response.resultCode === 0) {
        setXepLoaiList([...xepLoaiList, response.data]);
        setXepLoaiForm({ nam: "", xeploai: "" });
        setValidationErrors({});
        Swal.fire("Thành công!", "Xếp loại chi bộ thành công", "success");
      } else {
        throw new Error(response.message || "Xếp loại chi bộ thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Xếp loại chi bộ thất bại", "error");
      console.error("Error creating xepLoai:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update XepLoai
  const handleUpdateXepLoai = async () => {
    if (!validateXepLoaiForm()) {
      Swal.fire("Lỗi!", "Vui lòng chọn hình thức xếp loại!", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await updateXepLoai(
        token,
        editXepLoaiId,
        xepLoaiForm.xeploai
      );
      if (response.resultCode === 0) {
        setXepLoaiList(
          xepLoaiList.map((item) =>
            item.id === editXepLoaiId ? response.data : item
          )
        );

        setEditXepLoaiId(null);
        setXepLoaiForm({ nam: "", xeploai: "" });
        setValidationErrors({});
        Swal.fire("Thành công!", "Cập nhật xếp loại thành công", "success");
      } else {
        throw new Error(response.message || "Cập nhật xếp loại thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Cập nhật xếp loại thất bại", "error");
      console.error("Error updating xepLoai:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChiBo();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle XepLoai form input changes
  const handleXepLoaiInputChange = (e) => {
    const { name, value } = e.target;
    setXepLoaiForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle add chiBo
  const handleAddChiBo = async () => {
    if (!validateForm()) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ các trường bắt buộc!", "error");
      return;
    }

    try {
      setLoading(true);
      const newChiBo = await createChiBo(token, formData);
      if (newChiBo.resultCode === 0) {
        setChiBo([...chiBo, newChiBo.data]);
        setShowAddModal(false);
        setValidationErrors({});
        Swal.fire("Thành công!", "Thêm chi bộ thành công", "success");
      } else {
        throw new Error(newChiBo.message || "Thêm chi bộ thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Thêm chi bộ thất bại", "error");
      console.error("Error adding chiBo:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle update chiBo
  const handleUpdateChiBo = async () => {
    if (!validateForm()) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ các trường bắt buộc!", "error");
      return;
    }
    try {
      setLoading(true);
      const updatedChiBo = await updateChiBo(token, selectedChiBo.id, formData);
      if (updatedChiBo.resultCode === 0) {
        setChiBo(
          chiBo.map((item) =>
            item.id === selectedChiBo.id ? updatedChiBo.data : item
          )
        );
        setShowEditModal(false);
        setValidationErrors({});
        Swal.fire("Thành công!", "Cập nhật chi bộ thành công", "success");
      } else {
        throw new Error(updatedChiBo.message || "Cập nhật chi bộ thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Cập nhật chi bộ thất bại", "error");
      console.error("Error updating chiBo:", err);
    } finally {
      setLoading(false);
    }
  };

  // Pagination and search
  const filteredChiBo = chiBo.filter(
    (item) =>
      item.tenchibo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.danguycaptren.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bithu.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredChiBo.length / itemsPerPage);
  const currentItems = filteredChiBo.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset form when opening add modal
  const openAddModal = () => {
    setFormData({
      tenchibo: "",
      danguycaptren: "",
      diachi: "",
      bithu: "",
      phobithu: "",
      ngaythanhlap: "",
      ghichu: "",
      trangthai: "",
    });
    setValidationErrors({});
    setShowAddModal(true);
  };

  // Open edit modal with selected chiBo data
  const openEditModal = (chiBoItem) => {
    setSelectedChiBo(chiBoItem);
    setFormData({
      tenchibo: chiBoItem.tenchibo,
      danguycaptren: chiBoItem.danguycaptren,
      diachi: chiBoItem.diachi,
      bithu: chiBoItem.bithu,
      phobithu: chiBoItem.phobithu,
      ngaythanhlap: chiBoItem.ngaythanhlap,
      ghichu: chiBoItem.ghichu,
      trangthai: chiBoItem.trangthai,
    });
    setValidationErrors({});
    setShowEditModal(true);
  };

  // Open XepLoai modal
  const openXepLoaiModal = (chiBoItem) => {
    setSelectedChiBo(chiBoItem);
    setXepLoaiForm({ nam: "", xeploai: "" });
    setEditXepLoaiId(null);
    loadXepLoai(chiBoItem.id);
    setShowXepLoaiModal(true);
  };

  // Open detail modal and load XepLoai
  const openDetailModal = (chiBoItem) => {
    setSelectedChiBo(chiBoItem);
    setXepLoaiList([]); // Reset xepLoaiList để tránh hiển thị dữ liệu cũ
    loadXepLoai(chiBoItem.id); // Tải danh sách xếp loại cho chi bộ được chọn
    setShowDetailModal(true);
  };

  const renderForm = () => (
    <Form>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Tên chi bộ</Form.Label>
            <Form.Control
              type="text"
              name="tenchibo"
              value={formData.tenchibo}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.tenchibo}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.tenchibo}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Tên Đảng ủy cấp trên</Form.Label>
            <Form.Control
              type="text"
              name="danguycaptren"
              value={formData.danguycaptren}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.danguycaptren}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.danguycaptren}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Họ và tên bí thư</Form.Label>
            <Form.Control
              type="text"
              name="bithu"
              value={formData.bithu}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.bithu}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.bithu}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Họ và tên phó bí thư</Form.Label>
            <Form.Control
              type="text"
              name="phobithu"
              value={formData.phobithu}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.phobithu}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.phobithu}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Địa chỉ</Form.Label>
            <Form.Control
              type="text"
              name="diachi"
              value={formData.diachi}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.diachi}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.diachi}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Ngày thành lập chi bộ</Form.Label>
            <Form.Control
              type="date"
              name="ngaythanhlap"
              value={formData.ngaythanhlap}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.ngaythanhlap}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.ngaythanhlap}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Form.Group className="mb-3">
        <Form.Label>Trạng thái hoạt động của chi bộ</Form.Label>
        <Form.Select
          name="trangthai"
          value={formData.trangthai}
          onChange={handleInputChange}
          isInvalid={!!validationErrors.trangthai}
        >
          <option value="">Chọn trạng thái</option>
          <option value="hoatdong">Hoạt động</option>
          <option value="giaithe">Giải thể</option>
          <option value="tamdung">Tạm dừng</option>
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {validationErrors.trangthai}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Ghi chú</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          name="ghichu"
          value={formData.ghichu}
          onChange={handleInputChange}
          isInvalid={!!validationErrors.ghichu}
        />
        <Form.Control.Feedback type="invalid">
          {validationErrors.ghichu}
        </Form.Control.Feedback>
      </Form.Group>
    </Form>
  );

  return (
    <div className="container-fluid p-0 position-relative d-flex flex-column min-vh-100">
      {/* Main content */}
      <div className="p-4 flex-grow-1">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <h1 className="h3 mb-3 mb-md-0">Danh sách chi bộ</h1>
          <div className="d-flex gap-2">
            <div
              className="d-flex"
              style={{ width: "100%", maxWidth: "450px" }}
            >
              <input
                type="text"
                className="form-control custom-sm-input"
                placeholder="Tìm kiếm chi bộ..."
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
              className="btn btn-success custom-sm-btn"
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

        {/* ChiBo table */}
        <div className="table-responsive mb-4">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th style={{ width: "5%" }}>STT</th>
                <th style={{ width: "20%" }}>Tên chi bộ</th>
                <th style={{ width: "20%" }}>Đảng ủy cấp trên</th>
                <th style={{ width: "15%" }}>Bí thư</th>
                <th style={{ width: "15%" }}>Ngày thành lập</th>
                <th style={{ width: "15%" }}>Trạng thái chi bộ</th>
                <th style={{ width: "10%" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={index}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{item.tenchibo}</td>
                  <td>{item.danguycaptren}</td>
                  <td>{item.bithu}</td>
                  <td>{new Date(item.ngaythanhlap).toLocaleDateString()}</td>
                  <td className={`status-cell ${item.trangthai}`}>
                    {item.trangthai === "hoatdong"
                      ? "Hoạt động"
                      : item.trangthai === "giaithe"
                      ? "Giải thể"
                      : item.trangthai === "tamdung"
                      ? "Tạm dừng"
                      : "Không xác định"}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-outline-primary btn-outline-primary-detail"
                        onClick={() => {
                          openDetailModal(item);
                        }}
                        title="Xem chi tiết"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => openEditModal(item)}
                        title="Chỉnh sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => openXepLoaiModal(item)}
                        title="Xếp loại chi bộ"
                      >
                        <i class="fa-solid fa-code-branch"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination - Fixed at bottom */}
      <div className="mt-auto p-3 bg-light border-top">
        <nav aria-label="Page navigation">
          <ul className="pagination justify-content-center mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                &laquo; Trước
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li
                key={page}
                className={`page-item ${page === currentPage ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Tiếp &raquo;
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết chi bộ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedChiBo && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Tên chi bộ</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedChiBo.tenchibo}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Tên Đảng ủy cấp trên</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedChiBo.danguycaptren}
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Họ và tên bí thư</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedChiBo.bithu}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Họ và tên phó bí thư</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedChiBo.phobithu}
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Địa chỉ</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedChiBo.diachi}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Ngày thành lập chi bộ</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedChiBo.ngaythanhlap}
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Trạng thái hoạt động của chi bộ</Form.Label>
                <Form.Control
                  type="text"
                  value={
                    selectedChiBo.trangthai === "hoatdong"
                      ? "Hoạt động"
                      : selectedChiBo.trangthai === "giaithe"
                      ? "Giải thể"
                      : selectedChiBo.trangthai === "tamdung"
                      ? "Tạm dừng"
                      : ""
                  }
                  readOnly
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Ghi chú</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={selectedChiBo.ghichu}
                  readOnly
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Danh sách xếp loại chi bộ</Form.Label>
                {xepLoaiList.length === 0 ? (
                  <div className="text-muted">Chi bộ chưa được xếp loại</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Năm</th>
                          <th>Xếp loại</th>
                        </tr>
                      </thead>
                      <tbody>
                        {xepLoaiList.map((item) => (
                          <tr key={item.id}>
                            <td>{item.nam}</td>
                            <td>
                              {item.xeploai === "xuatsac"
                                ? "Hoàn thành xuất sắc nhiệm vụ"
                                : item.xeploai === "tot"
                                ? "Hoàn thành tốt nhiệm vụ"
                                : item.xeploai === "hoanthanh"
                                ? "Hoàn thành nhiệm vụ"
                                : "Không hoàn thành nhiệm vụ"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm chi bộ</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderForm()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddChiBo} disabled={loading}>
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
          <Modal.Title>Cập nhật chi bộ</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderForm()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateChiBo}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Lưu thay đổi"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* XepLoai Modal */}
      <Modal
        show={showXepLoaiModal}
        onHide={() => setShowXepLoaiModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Xếp loại chi bộ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Năm</Form.Label>
                  <Form.Control
                    type="text"
                    name="nam"
                    value={xepLoaiForm.nam}
                    onChange={handleXepLoaiInputChange}
                    isInvalid={!!validationErrors.nam}
                    disabled={editXepLoaiId !== null}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.nam}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Hình thức xếp loại</Form.Label>
                  <Form.Select
                    name="xeploai"
                    value={xepLoaiForm.xeploai}
                    onChange={handleXepLoaiInputChange}
                    isInvalid={!!validationErrors.xeploai}
                  >
                    <option value="">Chọn xếp loại</option>
                    <option value="xuatsac">
                      Hoàn thành xuất sắc nhiệm vụ
                    </option>
                    <option value="tot">Hoàn thành tốt nhiệm vụ</option>
                    <option value="hoanthanh">Hoàn thành nhiệm vụ</option>
                    <option value="khonghoanthanh">
                      Không hoàn thành nhiệm vụ
                    </option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.xeploai}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Form>
          <Button
            variant="primary"
            onClick={editXepLoaiId ? handleUpdateXepLoai : handleCreateXepLoai}
            disabled={loading}
            className="mb-3"
          >
            {loading
              ? "Đang xử lý..."
              : editXepLoaiId
              ? "Cập nhật xếp loại"
              : "Xếp loại chi bộ"}
          </Button>
          {xepLoaiList.length === 0 ? (
            <div className="text-muted">Chi bộ chưa được xếp loại</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Năm</th>
                    <th>Xếp loại</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {xepLoaiList.map((item) => (
                    <tr key={item.id}>
                      <td>{item.nam}</td>
                      <td>
                        {item.xeploai === "xuatsac"
                          ? "Hoàn thành xuất sắc nhiệm vụ"
                          : item.xeploai === "tot"
                          ? "Hoàn thành tốt nhiệm vụ"
                          : item.xeploai === "hoanthanh"
                          ? "Hoàn thành nhiệm vụ"
                          : "Không hoàn thành nhiệm vụ"}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => {
                            setEditXepLoaiId(item.id);
                            setXepLoaiForm({
                              nam: item.nam,
                              xeploai: item.xeploai,
                            });
                          }}
                          title="Chỉnh sửa xếp loại"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowXepLoaiModal(false)}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ChiBo;
