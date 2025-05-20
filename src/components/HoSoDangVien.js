import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Badge, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import {
  fetchDangVien,
  fetchHoSoByDangVienId,
  fetchHoSoApprovedByDangVienId,
  createHoSo,
  updateHoSo,
  deleteHoSo,
  uploadFile,
  downloadFile,
  fetchHoSoById,
} from "../services/apiService";

const HoSoDangVien = () => {
  const [dangVienList, setDangVienList] = useState([]);
  const [hoSoList, setHoSoList] = useState([]);
  const [selectedDangVien, setSelectedDangVien] = useState(null);
  const [searchType, setSearchType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [file, setFile] = useState(null);
  const itemsPerPage = 10;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedHoSo, setSelectedHoSo] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [hoSoDetail, setHoSoDetail] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    taphoso: "",
    loaihoso: "",
    fileUrl: "",
    ghichu: "",
  });

  // Add this new function to fetch detail
  const fetchHoSoDetail = async (hoSoId) => {
    try {
      setLoading(true);
      const data = await fetchHoSoById(token, hoSoId);
      // const data = await response.json();
      if (data.resultCode === 0 && data.data && data.data.length > 0) {
        setHoSoDetail(data.data[0]); // Assuming API returns array with one item
        setShowDetailModal(true);
      } else {
        throw new Error(data.message || "Không thể tải chi tiết hồ sơ");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Không thể tải chi tiết hồ sơ", "error");
      console.error("Error fetching hoSo detail:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Fetch danh sách Đảng viên
  const loadDangVien = async () => {
    try {
      const response = await fetchDangVien(token);
      const data = await response.json();
      if (data.resultCode === 0) {
        setDangVienList(Array.isArray(data.data) ? data.data : []);
      } else {
        throw new Error(data.message || "Không thể tải danh sách Đảng viên");
      }
    } catch (err) {
      setError("Không thể tải danh sách Đảng viên");
      console.error("Error loading dangVien:", err);
      // Swal.fire("Lỗi!", "Không thể tải danh sách Đảng viên", "error");
    }
  };

  // Fetch hồ sơ theo Đảng viên
  const loadHoSo = async () => {
    if (!selectedDangVien) return;

    setLoading(true);
    try {
      let data;
      if (searchType === "all") {
        data = await fetchHoSoByDangVienId(token, selectedDangVien.id);
      } else {
        data = await fetchHoSoApprovedByDangVienId(
          token,
          selectedDangVien.id
        );
      }
      // const data = await response.json();
      if (data.resultCode === 0) {
        setHoSoList(Array.isArray(data.data) ? data.data : []);
        setError(null);
      } else {
        throw new Error(data.message || "Không thể tải danh sách hồ sơ");
      }
    } catch (err) {
      setError("Không thể tải danh sách hồ sơ");
      console.error("Error loading hoSo:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleUploadFile = async () => {
    if (!file) return null;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const data = await uploadFile(token, formData);
      // console.log("Data: "+ data.data);

      if (data.resultCode === 0) {
        return data.data; // Assuming API returns the file URL in data.data
      } else {
        throw new Error(data.message || "Tải lên file thất bại");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      Swal.fire("Lỗi", "Tải lên file thất bại", "error");
      return null;
    }
  };

  const handleDownloadFile = async (filename) => {
    try {
      setLoading(true);

      // Get the file blob from API
      const response = await downloadFile(token, filename);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Try to get the original filename from headers
      const contentDisposition = response.headers["content-disposition"];
      let downloadFilename = filename;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          downloadFilename = filenameMatch[1];
        }
      }

      link.setAttribute("download", downloadFilename);
      document.body.appendChild(link);
      link.click();
      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Tải file thành công!",
        confirmButtonText: "Đóng",
      });
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
    } catch (error) {
      console.error("Download failed:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: error.response?.data?.message || "Tải file thất bại",
        confirmButtonText: "Đóng",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new hồ sơ
  const handleAddHoSo = async () => {
    if (!formData.taphoso || !formData.loaihoso) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ các trường bắt buộc!", "error");
      return;
    }

    try {
      setLoading(true);

      // Upload file first if exists
      let fileUrl = formData.fileUrl;
      if (file) {
        const uploadedFileUrl = await handleUploadFile();
        if (!uploadedFileUrl) return;
        fileUrl = uploadedFileUrl;
      }

      const hoSoData = {
        ...formData,
        fileUrl: fileUrl || "",
      };

      const data = await createHoSo(token, selectedDangVien.id, hoSoData);

      if (data.resultCode === 0) {
        setHoSoList([data.data, ...hoSoList]);
        setShowAddModal(false);
        setFile(null);
        Swal.fire("Thành công!", "Thêm hồ sơ thành công", "success");
      } else {
        throw new Error(data.message || "Thêm hồ sơ thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Thêm hồ sơ thất bại", "error");
      console.error("Error adding hoSo:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update hồ sơ
  const handleUpdateHoSo = async () => {
    if (!formData.taphoso || !formData.loaihoso) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ các trường bắt buộc!", "error");
      return;
    }

    try {
      setLoading(true);

      // Upload new file if selected
      let fileUrl = formData.fileUrl;
      if (file) {
        const uploadedFileUrl = await handleUploadFile();
        if (!uploadedFileUrl) return;
        fileUrl = uploadedFileUrl;
      }

      const hoSoData = {
        ...formData,
        fileUrl: fileUrl || formData.fileUrl,
      };

      const data = await updateHoSo(token, selectedHoSo.id, hoSoData);
      // const data = await response.json();

      if (data.resultCode === 0) {
        setHoSoList(
          hoSoList.map((item) =>
            item.id === selectedHoSo.id ? data.data : item
          )
        );
        setShowEditModal(false);
        setFile(null);
        Swal.fire("Thành công!", "Cập nhật hồ sơ thành công", "success");
      } else {
        throw new Error(data.message || "Cập nhật hồ sơ thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Cập nhật hồ sơ thất bại", "error");
      console.error("Error updating hoSo:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete hồ sơ
  const handleDeleteHoSo = async (hoSoId) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn có chắc chắn muốn xóa hồ sơ này?",
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
        const response = await deleteHoSo(token, hoSoId);
        const data = await response.json();
        if (data.resultCode === 0) {
          setHoSoList(hoSoList.filter((item) => item.id !== hoSoId));
          Swal.fire("Đã xóa!", "Hồ sơ đã được xóa.", "success");
        } else {
          throw new Error(data.message || "Xóa hồ sơ thất bại");
        }
      } catch (err) {
        Swal.fire("Lỗi!", "Xóa hồ sơ thất bại", "error");
        console.error("Error deleting hoSo:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Open add modal
  const openAddModal = () => {
    setFormData({
      taphoso: "",
      loaihoso: "",
      fileUrl: "",
      ghichu: "",
    });
    setFile(null);
    setShowAddModal(true);
  };

  // Open edit modal with selected hoSo data
  const openEditModal = (hoSoItem) => {
    setSelectedHoSo(hoSoItem);
    setFormData({
      taphoso: hoSoItem.taphoso,
      loaihoso: hoSoItem.loaihoso,
      fileUrl: hoSoItem.fileUrl,
      ghichu: hoSoItem.ghichu || "",
    });
    setFile(null);
    setShowEditModal(true);
  };

  // Handle DangVien selection
  const handleDangVienSelect = (dangVien) => {
    setSelectedDangVien(dangVien);
    setCurrentPage(1);
    setSearchTerm("");
  };

  // Filter hồ sơ based on search term
  const filteredHoSo = hoSoList.filter(
    (item) =>
      item.taphoso?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      item.loaihoso?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredHoSo.length / itemsPerPage);
  const currentItems = filteredHoSo.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Thêm hàm xử lý thay đổi search term
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  };

  // Load data on component mount and when selectedDangVien or searchType changes
  useEffect(() => {
    loadDangVien();
  }, []);

  useEffect(() => {
    loadHoSo();
  }, [selectedDangVien, searchType]);

  // Thêm useEffect để reset trang khi thay đổi loại tìm kiếm (all/approved)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchType]);

  return (
    <div className="container-fluid p-0 position-relative d-flex flex-column min-vh-100">
      {/* Main content */}
      <div className="p-4 flex-grow-1">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <h1 className="h3 mb-3 mb-md-0">Quản lý Hồ Sơ Đảng Viên</h1>
          <div className="d-flex gap-2 align-items-center">
            <Form.Select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              style={{ width: "200px" }}
            >
              <option value="all">Tất cả hồ sơ</option>
              <option value="approved">Hồ sơ đã duyệt</option>
            </Form.Select>
            <Form.Select
              value={selectedDangVien?.id || ""}
              onChange={(e) => {
                const selectedId = e.target.value;
                const dv = dangVienList.find((item) => item.id == selectedId);
                handleDangVienSelect(dv || null);
              }}
              style={{ width: "250px" }}
            >
              <option value="">Chọn Đảng viên</option>
              {dangVienList.map((dangVien) => (
                <option key={dangVien.id} value={dangVien.id}>
                  {dangVien.hoten}
                </option>
              ))}
            </Form.Select>
            <div
              className="d-flex"
              style={{ width: "100%", maxWidth: "400px" }}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm hồ sơ..."
                value={searchTerm}
                // onChange={(e) => setSearchTerm(e.target.value)}
                onChange={handleSearchChange}
                disabled={!selectedDangVien}
              />
            </div>
            <button
              className="btn btn-success custom-sm-btn-hoso"
              onClick={openAddModal}
              disabled={!selectedDangVien}
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

        {/* HoSo table */}
        {!selectedDangVien ? (
          <div className="text-center py-4 text-muted">
            Vui lòng chọn Đảng viên để xem danh sách hồ sơ
          </div>
        ) : filteredHoSo.length === 0 ? (
          <div className="text-center py-4 text-muted">
            Không có hồ sơ {searchType === "approved" ? "đã duyệt" : ""} của
            Đảng viên <strong>{selectedDangVien.hoten}</strong>
          </div>
        ) : (
          <>
            <div className="table-responsive mb-4">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "5%" }}>STT</th>
                    <th style={{ width: "15%" }}>Tập hồ sơ</th>
                    <th style={{ width: "20%" }}>Loại hồ sơ</th>
                    <th style={{ width: "15%" }}>Trạng thái</th>
                    <th style={{ width: "15%" }}>Thời gian tạo</th>
                    <th style={{ width: "15%" }}>Người phê duyệt</th>
                    <th style={{ width: "15%" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, index) => (
                    <tr key={index}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>
                        {item.taphoso === "tap1"
                          ? "Tập 1"
                          : item.taphoso === "tap2"
                          ? "Tập 2"
                          : "Tập 3"}
                      </td>
                      <td>{item.loaihoso}</td>
                      <td>
                        <Badge
                          bg={
                            item.trangthai === "approved"
                              ? "success"
                              : item.trangthai === "rejected"
                              ? "danger"
                              : "warning"
                          }
                        >
                          {item.trangthai === "approved"
                            ? "Đã duyệt"
                            : item.trangthai === "rejected"
                            ? "Từ chối"
                            : "Chờ duyệt"}
                        </Badge>
                      </td>
                      <td>{item.thoigiantao}</td>
                      <td>{item.nguoipheduyet || "Chưa phê duyệt"}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => fetchHoSoDetail(item.id)}
                            title="Xem chi tiết"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-primary btn-outline-primary-detail"
                            onClick={() => openEditModal(item)}
                            title="Chỉnh sửa"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteHoSo(item.id)}
                            title="Xóa"
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

{/* Detail HoSo Modal */}
<Modal
    show={showDetailModal}
    onHide={() => setShowDetailModal(false)}
    size="lg"
  >
    <Modal.Header closeButton>
      <Modal.Title>Chi tiết Hồ Sơ</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {hoSoDetail ? (
        <div>
          <Row className="mb-3">
            <Col md={6}>
              <h6>Tập hồ sơ:</h6>
              <p>{hoSoDetail.taphoso === "tap1"
                  ? "Tập 1"
                  : hoSoDetail.taphoso === "tap2"
                  ? "Tập 2"
                  : "Tập 3"}</p>
            </Col>
            <Col md={6}>
              <h6>Loại hồ sơ:</h6>
              <p>{hoSoDetail.loaihoso}</p>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={12}>
              <h6>File hồ sơ:</h6>
              {hoSoDetail.fileUrl && (
                <p>
                  <a
                    onClick={() => handleDownloadFile(hoSoDetail.fileUrl)}
                    style={{ cursor: 'pointer', color: 'blue' }}
                  >
                    {hoSoDetail.fileUrl}
                  </a>
                </p>
              )}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={12}>
              <h6>Ghi chú:</h6>
              <p>{hoSoDetail.ghichu || "Không có ghi chú"}</p>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <h6>Trạng thái:</h6>
              <Badge
                bg={
                  hoSoDetail.trangthai === "approved"
                    ? "success"
                    : hoSoDetail.trangthai === "rejected"
                    ? "danger"
                    : "warning"
                }
              >
                {hoSoDetail.trangthai === "approved"
                  ? "Đã duyệt"
                  : hoSoDetail.trangthai === "rejected"
                  ? "Từ chối"
                  : "Chờ duyệt"}
              </Badge>
            </Col>
            <Col md={6}>
              <h6>Thời gian tạo:</h6>
              <p>{hoSoDetail.thoigiantao}</p>
            </Col>
          </Row>
          {hoSoDetail.trangthai === "approved" && (
            <Row className="mb-3">
              <Col md={6}>
                <h6>Người phê duyệt:</h6>
                <p>{hoSoDetail.nguoipheduyet}</p>
              </Col>
              <Col md={6}>
                <h6>Thời gian phê duyệt:</h6>
                <p>{hoSoDetail.thoigianpheduyet}</p>
              </Col>
            </Row>
          )}
          <div className="mt-3">
            <h6>Đảng viên: {selectedDangVien?.hoten}</h6>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
        </div>
      )}
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
        Đóng
      </Button>
    </Modal.Footer>
  </Modal>

      {/* Add HoSo Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm Hồ Sơ Mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Tập hồ sơ <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="taphoso"
                    value={formData.taphoso}
                    onChange={handleInputChange}
                  >
                    <option value="">Chọn tập hồ sơ</option>
                    <option value="tap1">Tập 1</option>
                    <option value="tap2">Tập 2</option>
                    <option value="tap3">Tập 3</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Loại hồ sơ <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="loaihoso"
                    value={formData.loaihoso}
                    onChange={handleInputChange}
                    placeholder="Nhập loại hồ sơ"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>
                    File hồ sơ <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                  {formData.fileUrl && (
                    <div className="mt-2">
                      <a
                        onClick={() => handleDownloadFile(formData.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary"
                      >
                        File hiện tại: {formData.fileUrl}
                      </a>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Ghi chú</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="ghichu"
                    value={formData.ghichu}
                    onChange={handleInputChange}
                    placeholder="Nhập ghi chú"
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="mt-3">
              <h6>Đảng viên: {selectedDangVien?.hoten}</h6>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddModal(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleAddHoSo}
            disabled={
              !formData.taphoso ||
              !formData.loaihoso ||
              (!formData.fileUrl && !file) ||
              loading
            }
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <span className="ms-2">Đang xử lý...</span>
              </>
            ) : (
              "Thêm mới"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit HoSo Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật Hồ Sơ Đảng Viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Tập hồ sơ <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="taphoso"
                    value={formData.taphoso}
                    onChange={handleInputChange}
                  >
                    <option value="">Chọn tập hồ sơ</option>
                    <option value="tap1">Tập 1</option>
                    <option value="tap2">Tập 2</option>
                    <option value="tap3">Tập 3</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Loại hồ sơ <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="loaihoso"
                    value={formData.loaihoso}
                    onChange={handleInputChange}
                    placeholder="Nhập loại hồ sơ"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>File hồ sơ</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                  {formData.fileUrl && (
                    <div className="mt-2">
                      <a
                        onClick={() => handleDownloadFile(formData.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary"
                      >
                        File hiện tại: {formData.fileUrl}
                      </a>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Ghi chú</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="ghichu"
                    value={formData.ghichu}
                    onChange={handleInputChange}
                    placeholder="Nhập ghi chú"
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="mt-3">
              <h6>Đảng viên: {selectedDangVien?.hoten}</h6>
              <p>
                Trạng thái:{" "}
                <Badge
                  bg={
                    selectedHoSo?.trangthai === "approved"
                      ? "success"
                      : selectedHoSo?.trangthai === "rejected"
                      ? "danger"
                      : "warning"
                  }
                >
                  {selectedHoSo?.trangthai === "approved"
                    ? "Đã duyệt"
                    : selectedHoSo?.trangthai === "rejected"
                    ? "Từ chối"
                    : "Chờ duyệt"}
                </Badge>
              </p>
              {selectedHoSo?.thoigianpheduyet && (
                <p>Thời gian phê duyệt: {selectedHoSo.thoigianpheduyet}</p>
              )}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateHoSo}
            disabled={!formData.taphoso || !formData.loaihoso || loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <span className="ms-2">Đang xử lý...</span>
              </>
            ) : (
              "Cập nhật"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HoSoDangVien;
