import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Badge,
  ListGroup,
} from "react-bootstrap";
import { FaHistory, FaUser, FaClock, FaTasks } from "react-icons/fa";
import {
  fetchLog,
  fetchLogByNhanVienId,
  fetchNhanVien,
} from "../services/apiService";

const LichSu = () => {
  const [logList, setLogList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [searchType, setSearchType] = useState("all");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch all logs
  const loadAllLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchLog(token);
      if (data.resultCode === 0) {
        setLogList(data.data);
        setError(null);
      } else {
        throw new Error(data.message || "Không thể tải danh sách lịch sử");
      }
    } catch (err) {
      setError("Không thể tải danh sách lịch sử");
      console.error("Error loading logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs by employee ID
  const loadLogsByMaNV = async (maNV) => {
    setLoading(true);
    try {
      const data = await fetchLogByNhanVienId(token, maNV);
      if (data.resultCode === 0) {
        setLogList(data.data);
        setError(null);
      } else {
        throw new Error(data.message || "Không thể tải lịch sử của nhân viên");
      }
    } catch (err) {
      setError("Không thể tải lịch sử của nhân viên");
      console.error("Error loading logs by MaNV:", err);
    } finally {
      setLoading(false);
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

  // Handle search type change
  const handleSearchTypeChange = (e) => {
    const type = e.target.value;
    setSearchType(type);
    setSelectedEmployeeId("");
    setCurrentPage(1);

    if (type === "all") {
      loadAllLogs();
    }
  };

  // Handle employee selection change
  const handleEmployeeChange = (e) => {
    const maNV = e.target.value;
    setSelectedEmployeeId(maNV);
    setCurrentPage(1);

    if (maNV) {
      loadLogsByMaNV(maNV);
    }
  };

  // Open detail modal
  const openDetailModal = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  // Load initial data on mount
  useEffect(() => {
    loadAllLogs();
    loadEmployees();
  }, []);

  // Pagination
  const totalPages = Math.ceil(logList.length / itemsPerPage);
  const currentItems = logList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format datetime for display
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    return dateTimeString;
  };

  // Parse JSON values safely
  // Parse JSON values safely and display in a user-friendly format
  const parseJsonValue = (value, doituong, hanhdong) => {
    if (!value) return <span className="text-muted">Không có</span>;

    try {
      const parsed = JSON.parse(value);
      switch (doituong) {
        case "SANPHAM":
          return (
            <div>
              <p>
                <strong>Mã sản phẩm:</strong> {parsed.id}
              </p>
              <p>
                <strong>Tên sản phẩm:</strong> {parsed.tensp}
              </p>
              <p>
                <strong>Đơn vị tính:</strong> {parsed.dvt}
              </p>
              <p>
                <strong>Nước sản xuất:</strong> {parsed.nuocsx}
              </p>
              <p>
                <strong>Giá:</strong>{" "}
                {Number(parsed.gia).toLocaleString("vi-VN")} VND
              </p>
              {parsed.makm ? (
                <div>
                  <p>
                    <strong>Khuyến mãi:</strong> {parsed.makm.noidung} (Giảm{" "}
                    {parsed.makm.phantram}%)
                  </p>
                  <p>
                    <strong>Thời gian khuyến mãi:</strong> {parsed.makm.ngaybd}{" "}
                    - {parsed.makm.ngaykt}
                  </p>
                </div>
              ) : (
                <p>
                  <strong>Khuyến mãi:</strong> Không có
                </p>
              )}
              <p>
                <strong>Trạng thái:</strong>{" "}
                {parsed.status === "available" ? "Có sẵn" : "Hết hàng"}
              </p>
              <p>
                <strong>Hình ảnh:</strong> {parsed.imageurl ? "Có" : "Không có"}
              </p>
            </div>
          );
        case "KHUYENMAI":
          return (
            <div>
              <p>
                <strong>Mã khuyến mãi:</strong> {parsed.id}
              </p>
              <p>
                <strong>Nội dung:</strong> {parsed.noidung}
              </p>
              <p>
                <strong>Phần trăm giảm:</strong> {parsed.phantram}%
              </p>
              <p>
                <strong>Thời gian:</strong> {parsed.ngaybd} - {parsed.ngaykt}
              </p>
              <p>
                <strong>Trạng thái:</strong> {parsed.status}
              </p>
            </div>
          );
        case "NHANVIEN":
          return (
            <div>
              <p>
                <strong>Mã nhân viên:</strong> {parsed.id}
              </p>
              <p>
                <strong>Họ tên:</strong> {parsed.hoten}
              </p>
              <p>
                <strong>Số điện thoại:</strong> {parsed.sodt}
              </p>
              <p>
                <strong>Ngày vào làm:</strong> {parsed.ngvl}
              </p>
              <p>
                <strong>Vai trò:</strong> {parsed.roleid.rolename}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                {parsed.status === "active" ? "Hoạt động" : "Không hoạt động"}
              </p>
            </div>
          );
        default:
          return <pre>{JSON.stringify(parsed, null, 2)}</pre>;
      }
    } catch {
      return <span>{value}</span>;
    }
  };

  return (
    <div className="container-fluid p-0 position-relative d-flex flex-column min-vh-100">
      <div className="p-4 flex-grow-1">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <h1 className="h3 mb-3 mb-md-0">Lịch sử thao tác</h1>
          <div className="d-flex gap-2 align-items-center">
            <Form.Select
              value={searchType}
              onChange={handleSearchTypeChange}
              style={{ width: "200px" }}
            >
              <option value="all">Tất cả</option>
              <option value="employee">Theo nhân viên</option>
            </Form.Select>

            {searchType === "employee" && (
              <Form.Select
                value={selectedEmployeeId}
                onChange={handleEmployeeChange}
                style={{ width: "200px" }}
              >
                <option value="">Chọn nhân viên</option>
                {employeeList.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.hoten} ({employee.id})
                  </option>
                ))}
              </Form.Select>
            )}
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

        {searchType === "employee" && !selectedEmployeeId ? (
          <div className="text-center py-4 color-black">
            Vui lòng chọn nhân viên để xem lịch sử
          </div>
        ) : searchType === "employee" && currentItems.length === 0 ? (
          <div className="text-center py-4 color-black">
            Nhân viên này không có lịch sử thao tác
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-4 color-black">
            Không tìm thấy lịch sử thao tác nào!
          </div>
        ) : (
          <>
            <div className="table-responsive mb-4">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "5%" }}>STT</th>
                    <th style={{ width: "15%" }}>Ngày giờ</th>
                    <th style={{ width: "15%" }}>Người thực hiện</th>
                    <th style={{ width: "15%" }}>Hành động</th>
                    <th style={{ width: "15%" }}>Đối tượng</th>
                    <th style={{ width: "25%" }}>Giá trị cũ</th>
                    <th style={{ width: "10%" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, index) => (
                    <tr key={item.id}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{formatDateTime(item.ngaygio)}</td>
                      <td>{item.nguoithuchien}</td>
                      <td>
                        <Badge
                          bg={
                            item.hanhdong === "LOGIN"
                              ? "success"
                              : item.hanhdong === "DELETE"
                              ? "danger"
                              : "primary"
                          }
                        >
                          {item.hanhdong}
                        </Badge>
                      </td>
                      <td>{item.doituong}</td>
                      <td>
                        {parseJsonValue(item.giatriCu).substring(0, 50)}...
                      </td>
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

      {/* Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết lịch sử thao tác</Modal.Title>
        </Modal.Header>
        {/* <Modal.Body>
          {selectedLog && (
            <ListGroup variant="flush">
              <ListGroup.Item>
                <FaHistory className="me-2" />
                <strong>ID:</strong> {selectedLog.id}
              </ListGroup.Item>
              <ListGroup.Item>
                <FaClock className="me-2" />
                <strong>Ngày giờ:</strong> {formatDateTime(selectedLog.ngaygio)}
              </ListGroup.Item>
              <ListGroup.Item>
                <FaUser className="me-2" />
                <strong>Người thực hiện:</strong> {selectedLog.nguoithuchien}
              </ListGroup.Item>
              <ListGroup.Item>
                <FaTasks className="me-2" />
                <strong>Hành động:</strong>{" "}
                <Badge
                  bg={
                    selectedLog.hanhdong === "LOGIN"
                      ? "success"
                      : selectedLog.hanhdong === "DELETE"
                      ? "danger"
                      : "primary"
                  }
                >
                  {selectedLog.hanhdong}
                </Badge>
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Đối tượng:</strong> {selectedLog.doituong}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Giá trị cũ:</strong>
                <pre>{parseJsonValue(selectedLog.giatriCu)}</pre>
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Giá trị mới:</strong>{" "}
                {parseJsonValue(selectedLog.giatriMoi)}
              </ListGroup.Item>
            </ListGroup>
          )}
        </Modal.Body> */}
        <Modal.Body>
          {selectedLog && (
            <div>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <FaHistory className="me-2" />
                  <strong>ID:</strong> {selectedLog.id}
                </ListGroup.Item>
                <ListGroup.Item>
                  <FaClock className="me-2" />
                  <strong>Ngày giờ:</strong>{" "}
                  {formatDateTime(selectedLog.ngaygio)}
                </ListGroup.Item>
                <ListGroup.Item>
                  <FaUser className="me-2" />
                  <strong>Người thực hiện:</strong> {selectedLog.nguoithuchien}
                </ListGroup.Item>
                <ListGroup.Item>
                  <FaTasks className="me-2" />
                  <strong>Hành động:</strong>{" "}
                  <Badge
                    bg={
                      selectedLog.hanhdong === "LOGIN"
                        ? "success"
                        : selectedLog.hanhdong === "DELETE"
                        ? "danger"
                        : selectedLog.hanhdong === "UPDATE"
                        ? "warning"
                        : selectedLog.hanhdong.includes("KHUYENMAI")
                        ? "info"
                        : "primary"
                    }
                  >
                    {selectedLog.hanhdong === "LOGIN"
                      ? "Đăng nhập"
                      : selectedLog.hanhdong === "UPDATE"
                      ? "Cập nhật"
                      : selectedLog.hanhdong === "ADD_KHUYENMAI"
                      ? "Thêm khuyến mãi"
                      : selectedLog.hanhdong === "REMOVE_KHUYENMAI"
                      ? "Xóa khuyến mãi"
                      : selectedLog.hanhdong}
                  </Badge>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Đối tượng:</strong>{" "}
                  {selectedLog.doituong === "SANPHAM"
                    ? "Sản phẩm"
                    : selectedLog.doituong === "KHUYENMAI"
                    ? "Khuyến mãi"
                    : selectedLog.doituong === "NHANVIEN"
                    ? "Nhân viên"
                    : selectedLog.doituong}
                </ListGroup.Item>
              </ListGroup>
              {selectedLog.hanhdong !== "LOGIN" && (
                <Row className="mt-3">
                  <Col md={6}>
                    <h6>
                      <strong>Giá trị cũ</strong>
                    </h6>
                    {parseJsonValue(
                      selectedLog.giatriCu,
                      selectedLog.doituong,
                      selectedLog.hanhdong
                    )}
                  </Col>
                  <Col md={6}>
                    <h6>
                      <strong>Giá trị mới</strong>
                    </h6>
                    {parseJsonValue(
                      selectedLog.giatriMoi,
                      selectedLog.doituong,
                      selectedLog.hanhdong
                    )}
                  </Col>
                </Row>
              )}
            </div>
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

export default LichSu;
