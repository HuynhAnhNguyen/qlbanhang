import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import { Editor } from "@tinymce/tinymce-react";
import { useNavigate } from "react-router-dom";
import {
  uploadImage,
  createTinTuc,
  updateTinTuc,
  fetchTinTuc,
  deleteTinTuc,
  fetchTinTucById,
  getImageLink,
} from "../services/apiService";

const DanhSachTinTuc = () => {
  const [tinTuc, setTinTuc] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const itemsPerPage = 10;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTinTuc, setSelectedTinTuc] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    tieude: "",
    noidungtin: "",
    url: "",
  });

  const token = localStorage.getItem("token");

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.tieude.trim()) {
      errors.tieude = "Tiêu đề là bắt buộc";
    }
    if (!formData.noidungtin.trim()) {
      errors.noidungtin = "Nội dung tin là bắt buộc";
    }
    if (!formData.url) {
      errors.url = "Ảnh bìa là bắt buộc";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch all news
  const loadTinTuc = async () => {
    setLoading(true);
    try {
      const response = await fetchTinTuc(token, searchType);
      const data = await response.json();
      if (data.resultCode === 0) {
        // setNewsList(data.data);
        setTinTuc(Array.isArray(data.data) ? data.data : []);
        setError(null);
        setCurrentPage(1);
      } else {
        throw new Error(data.message || "Không thể tải danh sách tin tức");
      }
    } catch (err) {
      setError("Không thể tải danh sách tin tức");
      console.error("Error loading news:", err);
    } finally {
      setLoading(false);
    }
  };

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
          url: uploadResponse.data,
        }));
        setValidationErrors((prev) => ({ ...prev, url: "" }));
      }
    } catch (err) {
      setValidationErrors((prev) => ({
        ...prev,
        url: "Không thể tải lên ảnh",
      }));
      console.error("Error uploading image:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add news
  const handleAddTinTuc = async () => {
    if (!validateForm()) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ các trường bắt buộc!", "error");
      return;
    }

    try {
      setLoading(true);
      const data = await createTinTuc(token, {
        tieude: formData.tieude,
        noidungtin: formData.noidungtin,
        url: formData.url,
      });

      if (data.resultCode === 0) {
        setTinTuc([...tinTuc, data.data]);
        setShowAddModal(false);
        setValidationErrors({});
        Swal.fire("Thành công!", "Thêm tin tức thành công", "success");
        await loadTinTuc();
      } else {
        throw new Error(data.message || "Thêm tin tức thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Thêm tin tức thất bại", "error");
      console.error("Error adding news:", err);
    } finally {
      setLoading(false);
    }
  };

  // Edit news
  const handleUpdateTinTuc = async () => {
    if (!validateForm()) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ các trường bắt buộc!", "error");
      return;
    }

    try {
      setLoading(true);
      const data = await updateTinTuc(token, selectedTinTuc.id, {
        tieude: formData.tieude,
        noidungtin: formData.noidungtin,
        url: formData.url,
      });

      if (data.resultCode === 0) {
        setTinTuc(
          tinTuc.map((item) =>
            item.id === selectedTinTuc.id ? data.data : item
          )
        );
        setShowEditModal(false);
        setValidationErrors({});
        Swal.fire("Thành công!", "Cập nhật tin tức thành công", "success");
        await loadTinTuc();
      } else {
        throw new Error(data.message || "Cập nhật tin tức thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Cập nhật tin tức thất bại", "error");
      console.error("Error updating news:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete news
  const handleDeleteTinTuc = async (newsId) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn có chắc chắn muốn xóa tin tức này?",
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
        const data = await deleteTinTuc(token, newsId);
        if (data.resultCode === 0) {
          setTinTuc(tinTuc.filter((item) => item.tintucId !== newsId));
          Swal.fire("Thành công!", "Xóa tin tức thành công", "success");
          await loadTinTuc();
        } else {
          throw new Error(data.message || "Xóa tin tức thất bại");
        }
      } catch (err) {
        Swal.fire("Lỗi!", "Xóa tin tức thất bại", "error");
        console.error("Error deleting news:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Open edit modal
  const openEditModal = async (news) => {
    setSelectedTinTuc(news);
    try {
      setLoading(true);
      const data = await fetchTinTucById(news.id);
      if (data.resultCode === 0) {
        setFormData({
          tieude: data.data.tieude,
          noidungtin: data.data.noidungtin,
          url: data.data.url,
        });
        setShowEditModal(true);
      } else {
        throw new Error(data.message || "Không thể tải tin tức");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Không thể tải tin tức", "error");
      console.error("Error loading news:", err);
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

  // Handle TinyMCE content change
  const handleEditorChange = async (content) => {
    setFormData((prev) => ({
      ...prev,
      noidungtin: content,
    }));
    setValidationErrors((prev) => ({ ...prev, noidungtin: "" }));
  };

  // Load news on mount
  useEffect(() => {
    loadTinTuc();
  }, [searchType]);

  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
    setSearchTerm("");
  };

  const filteredTinTuc = tinTuc.filter(
    (item) =>
      item.tieude?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      item.nguoitao?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      item.thoigiantao?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredTinTuc.length / itemsPerPage);
  const currentItems = filteredTinTuc.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const navigate = useNavigate();

  const handleViewDetail = (newsId) => {
    navigate(`/chi-tiet-tin-tuc/${newsId}`);
  };

  const openAddModal = () => {
    setFormData({
      tieude: "",
      noidungtin: "",
      url: "",
    });
    setValidationErrors({});
    setShowAddModal(true);
  };

  // Render form
  const renderNewsForm = (isEdit = false) => (
    <Form>
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>
              Tiêu đề <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="tieude"
              value={formData.tieude}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.tieude}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.tieude}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>
              Ảnh đại diện <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              isInvalid={!!validationErrors.url}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.url}
            </Form.Control.Feedback>
            {formData.url && (
              <div className="mt-2">
                <img
                  src={getImageLink(formData.url)}
                  alt="Preview"
                  className="img-thumbnail"
                  style={{ maxWidth: "200px", maxHeight: "200px" }}
                />
              </div>
            )}
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>
              Nội dung <span className="text-danger">*</span>
            </Form.Label>
            <Editor
              apiKey="do7vpq16o5mqvc4ydixhfvs9wa9igibrs84ibhu1mmt1108t"
              value={formData.noidungtin}
              onEditorChange={handleEditorChange}
              init={{
                height: 500,
                plugins: [
                  "a11ychecker",
                  "accordion",
                  "advlist",
                  "anchor",
                  "autolink",
                  "autosave",
                  "charmap",
                  "code",
                  "codesample",
                  "directionality",
                  "emoticons",
                  "exportpdf",
                  "exportword",
                  "fullscreen",
                  "help",
                  "image",
                  "importcss",
                  "importword",
                  "insertdatetime",
                  "link",
                  "lists",
                  "markdown",
                  "math",
                  "media",
                  "nonbreaking",
                  "pagebreak",
                  "preview",
                  "quickbars",
                  "save",
                  "searchreplace",
                  "table",
                  "visualblocks",
                  "visualchars",
                  "wordcount",
                ],
                toolbar:
                  "undo redo | accordion accordionremove | " +
                  "importword exportword exportpdf | math | " +
                  "blocks fontfamily fontsize | bold italic underline strikethrough | " +
                  "align numlist bullist | link image | table media | " +
                  "lineheight outdent indent | forecolor backcolor removeformat | " +
                  "charmap emoticons | code fullscreen preview | save print | " +
                  "pagebreak anchor codesample | ltr rtl",
                menubar: "file edit view insert format tools table help",
              }}
            />
            {validationErrors.noidungtin && (
              <div className="text-danger mt-1">
                {validationErrors.noidungtin}
              </div>
            )}
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );

  return (
    <div className="container-fluid p-0 position-relative d-flex flex-column min-vh-100">
      <div className="p-4 flex-grow-1">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <h1 className="h3 mb-3 mb-md-0">Danh sách tin tức</h1>
          <div className="d-flex gap-2 align-items-center">
            <Form.Select
              value={searchType}
              onChange={handleSearchTypeChange}
              style={{ width: "200px" }}
            >
              <option value="all">Tất cả</option>
              <option value="approved">Đã phê duyệt</option>
            </Form.Select>
            <div
              className="d-flex"
              style={{ width: "100%", maxWidth: "450px" }}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm tin tức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary">
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

        {filteredTinTuc.length === 0 ? (
          <div className="text-center py-4 text-muted">
            {searchType === "approved"
              ? "Không có tin tức nào được phê duyệt"
              : "Không có tin tức nào"}
          </div>
        ) : (
          <>
            <div className="table-responsive mb-4">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "5%" }}>STT</th>
                    <th style={{ width: "15%" }}>Ảnh đại diện</th>
                    <th style={{ width: "25%" }}>Tiêu đề</th>
                    <th style={{ width: "10%" }}>Người tạo</th>
                    <th style={{ width: "10%" }}>Thời gian tạo</th>
                    <th style={{ width: "10%" }}>Trạng thái</th>
                    <th style={{ width: "15%" }}>Người phê duyệt</th>
                    <th style={{ width: "10%" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 &&
                    currentItems.map((item, index) => (
                      <tr key={index}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>
                          {item.url && (
                            <img
                              src={getImageLink(item.url)}
                              alt={item.tieude}
                              className="img-thumbnail"
                              style={{ maxWidth: "100px", maxHeight: "100px" }}
                            />
                          )}
                        </td>
                        <td>{item.tieude}</td>
                        <td>{item.nguoitao}</td>
                        <td>
                          {item.thoigiantao
                            ? new Date(item.thoigiantao).toLocaleString()
                            : "Chưa xác nhận"}
                        </td>
                        <td>
                          {item.trangthai === "approved" ? (
                            <span className="badge bg-success">
                              Đã được duyệt
                            </span>
                          ) : item.trangthai === "pending" ? (
                            <span className="badge bg-warning text-dark">
                              Chờ phê duyệt
                            </span>
                          ) : item.trangthai === "saved" ? (
                            <span className="badge bg-primary">Đã lưu</span>
                          ) : (
                            <span className="badge bg-danger">Từ chối</span>
                          )}
                        </td>
                        <td>{item.nguoipheduyet || "Chưa phê duyệt"}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => handleViewDetail(item.id)}
                              title="Xem chi tiết"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => openEditModal(item)}
                              title="Sửa tin tức"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteTinTuc(item.id)}
                              title="Xóa tin tức"
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
            {/* Pagination */}
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
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm tin tức</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderNewsForm()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleAddTinTuc}
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
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Sửa tin tức</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderNewsForm(true)}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateTinTuc}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Cập nhật"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default DanhSachTinTuc;
