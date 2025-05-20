import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { createKyDangPhi, fetchKyDangPhi, updateKyDangPhi } from "../services/apiService";

const KyDangPhi = () => {
  // State management
  const [kyDangPhiList, setKyDangPhiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Pagination and search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedKyDangPhi, setSelectedKyDangPhi] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    ten: "",
    sotien: "",
  });

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Fetch all KyDangPhi
  const fetchKyDangPhiList = async () => {
    setLoading(true);
    try {
      const data = await fetchKyDangPhi(token);
      if (data.resultCode === 0) {
        setKyDangPhiList(Array.isArray(data.data) ? data.data : []);
        setError(null);
      } else {
        throw new Error(data.message || "Failed to fetch KyDangPhi list");
      }
    } catch (err) {
      setError("Failed to load KyDangPhi data");
      console.error("Error fetching KyDangPhi:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create new KyDangPhi
  // const createKyDangPhi = async (ten, sotien) => {
  //   try {
  //     setLoading(true);
  //     const response = await fetch(
  //       `http://3.104.77.30:8080/api/v1/project/kydangphi/create?sotien=${sotien}&tenKydangphi=${encodeURIComponent(
  //         ten
  //       )}`,
  //       {
  //         method: "POST",
  //         headers: {
  //           Authorization: `${token}`,
  //         },
  //       }
  //     );
  //     const data = await response.json();
  //     return data;
  //   } catch (error) {
  //     console.error("Error creating KyDangPhi:", error);
  //     throw error;
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Update KyDangPhi
  // const updateKyDangPhi = async (id, ten, sotien) => {
  //   try {
  //     setLoading(true);
  //     const response = await fetch(
  //       `http://3.104.77.30:8080/api/v1/project/kydangphi/update?kydangphiId=${id}&tenKydangphi=${encodeURIComponent(
  //         ten
  //       )}&sotien=${sotien}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           Authorization: `${token}`,
  //         },
  //       }
  //     );
  //     const data = await response.json();
  //     return data;
  //   } catch (error) {
  //     console.error("Error updating KyDangPhi:", error);
  //     throw error;
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.ten.trim()) {
      errors.ten = "Tên kỳ đảng phí là bắt buộc";
    }

    if (!formData.sotien) {
      errors.sotien = "Số tiền là bắt buộc";
    } else if (isNaN(formData.sotien) || Number(formData.sotien) <= 0) {
      errors.sotien = "Số tiền phải là số dương";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi search
  };

  // Handle create
  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      const response = await createKyDangPhi(token, formData.ten, formData.sotien);
      // console.log(response);
      if (response.resultCode === 0) {
        Swal.fire("Thành công", "Thêm kỳ đảng phí thành công", "success");
        setShowAddModal(false);
        setFormData({ ten: "", sotien: "" });
        fetchKyDangPhiList();
      } else {
        throw new Error(response.message || "Failed to create KyDangPhi");
      }
    } catch (error) {
      Swal.fire("Lỗi", error.message || "Thêm kỳ đảng phí thất bại", "error");
    }
  };

  // Handle update
  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      const response = await updateKyDangPhi(token, 
        selectedKyDangPhi.id,
        formData.ten,
        formData.sotien
      );
      if (response.resultCode === 0) {
        Swal.fire("Thành công", "Cập nhật kỳ đảng phí thành công", "success");
        setShowEditModal(false);
        fetchKyDangPhiList();
      } else {
        throw new Error(response.message || "Failed to update KyDangPhi");
      }
    } catch (error) {
      Swal.fire(
        "Lỗi",
        error.message || "Cập nhật kỳ đảng phí thất bại",
        "error"
      );
    }
  };

  // Open edit modal
  const openEditModal = (kyDangPhi) => {
    setSelectedKyDangPhi(kyDangPhi);
    setFormData({
      ten: kyDangPhi.ten,
      sotien: kyDangPhi.sotien,
    });
    setShowEditModal(true);
  };

  // Open add modal
  const openAddModal = () => {
    setFormData({
      ten: "",
      sotien: "",
    });
    setValidationErrors({});
    setShowAddModal(true);
  };

  // Initialize data
  useEffect(() => {
    fetchKyDangPhiList();
  }, []);

  // Filter data based on search term
  const filteredData = kyDangPhiList.filter((item) =>
    item.ten.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container-fluid p-0 position-relative d-flex flex-column min-vh-100">
      <div className="p-4 flex-grow-1">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <h1 className="h3 mb-3 mb-md-0">Quản lý Kỳ Đảng phí</h1>
          <div className="d-flex gap-2 align-items-center">
            <div
              className="d-flex"
              style={{ width: "100%", maxWidth: "450px" }}
            >
              <input
                type="text"
                className="form-control custom-sm-input"
                placeholder="Tìm kiếm kỳ đảng phí..."
                value={searchTerm}
                onChange={handleSearch}
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
        {/* Loading indicator */}
        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Data table */}
        {currentItems.length === 0 ? (
          <div className="text-center py-4 color-black">
            Không có Kỳ Đảng phí nào!
          </div>
        ) : (
          <>
            <div className="table-responsive mb-4">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "5%" }}>STT</th>
                    <th style={{ width: "30%" }}>Tên kỳ đảng phí</th>
                    <th style={{ width: "15%" }}>Số tiền</th>
                    <th style={{ width: "15%" }}>Người tạo</th>
                    <th style={{ width: "25%" }}>Thời gian tạo</th>
                    <th style={{ width: "10%" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, index) => (
                    <tr key={item.id}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{item.ten}</td>

                      <td>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "decimal", // Sử dụng 'decimal' thay vì 'currency'
                        }).format(item.sotien)}{" "}
                        VND
                      </td>
                      <td>{item.nguoitao}</td>
                      <td>{item.thoigiantao}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => openEditModal(item)}
                            title="Chỉnh sửa"
                            disabled={loading}
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
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm Kỳ Đảng Phí</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Tên kỳ đảng phí <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="ten"
                placeholder="Tên kỳ Đảng phí"
                value={formData.ten}
                onChange={(e) =>
                  setFormData({ ...formData, ten: e.target.value })
                }
                isInvalid={!!validationErrors.ten}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.ten}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Số tiền <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                name="sotien"
                placeholder="Số tiền"
                value={formData.sotien}
                onChange={(e) =>
                  setFormData({ ...formData, sotien: e.target.value })
                }
                isInvalid={!!validationErrors.sotien}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.sotien}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleCreate} disabled={loading}>
            {loading ? "Đang xử lý..." : "Thêm mới"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật Kỳ Đảng Phí</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Tên kỳ đảng phí <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="ten"
                value={formData.ten}
                onChange={(e) =>
                  setFormData({ ...formData, ten: e.target.value })
                }
                isInvalid={!!validationErrors.ten}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.ten}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Số tiền <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                name="sotien"
                value={formData.sotien}
                onChange={(e) =>
                  setFormData({ ...formData, sotien: e.target.value })
                }
                isInvalid={!!validationErrors.sotien}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.sotien}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleUpdate} disabled={loading}>
            {loading ? "Đang xử lý..." : "Lưu thay đổi"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default KyDangPhi;
