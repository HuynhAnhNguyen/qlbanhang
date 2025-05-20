import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Badge, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

const SinhHoatDang = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className="container-fluid p-0 position-relative d-flex flex-column min-vh-100">
      {/* Main content */}
      <div className="p-4 flex-grow-1">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <h1 className="h3 mb-3 mb-md-0">Quản lý Sinh Hoạt Đảng</h1>
          <div className="d-flex gap-2 align-items-center">
            <Form.Select
              //   value={searchType}
              //   onChange={(e) => setSearchType(e.target.value)}
              style={{ width: "200px" }}
            >
              <option value="all">Tất cả hồ sơ</option>
              <option value="approved">Hồ sơ đã duyệt</option>
            </Form.Select>
            <Form.Select
              //   value={selectedDangVien?.id || ""}
              //   onChange={(e) => {
              //     const selectedId = e.target.value;
              //     const dv = dangVienList.find((item) => item.id == selectedId);
              //     handleDangVienSelect(dv || null);
              //   }}
              style={{ width: "250px" }}
            >
              <option value="">Chọn Đảng viên</option>
              {/* {dangVienList.map((dangVien) => (
                <option key={dangVien.id} value={dangVien.id}>
                  {dangVien.hoten}
                </option>
              ))} */}
            </Form.Select>
            <div
              className="d-flex"
              style={{ width: "100%", maxWidth: "400px" }}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm hồ sơ..."
                // value={searchTerm}
                // onChange={handleSearchChange}
                // disabled={!selectedDangVien}
              />
            </div>
            <button
              className="btn btn-success custom-sm-btn-hoso"
              //   onClick={openAddModal}
              //   disabled={!selectedDangVien}
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

        <div className="text-center py-4 text-danger">
          Trang chưa hoạt động!!!
        </div>

        {/* HoSo table */}
        {/* {!selectedDangVien ? (
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
                      <td>{item.taphoso === "tap1"
                            ? "Tập 1"
                            : item.taphoso === "tap2"
                            ? "Tập 2"
                            : "Tập 3"}</td>
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
        )} */}
      </div>

      {/* Add HoSo Modal */}
      {/* <Modal
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
      </Modal> */}

      {/* Edit HoSo Modal */}
      {/* <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Cập nhật Hồ Sơ Đảng Viên
          </Modal.Title>
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
      </Modal> */}
    </div>
  );
};

export default SinhHoatDang;
