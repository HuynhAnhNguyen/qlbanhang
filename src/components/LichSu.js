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
import Swal from "sweetalert2";
import { fetchLog, fetchLogByNhanVienId, fetchNhanVien } from "../services/apiService";


const LichSu = () => {
  const [logList, setLogList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("all");
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

  // Handle employee selection change
  const handleEmployeeChange = (e) => {
    const maNV = e.target.value;
    setSelectedEmployee(maNV);
    setCurrentPage(1);
    if (maNV === "all") {
      loadAllLogs();
    } else {
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
  const parseJsonValue = (value) => {
    if (!value) return "Không có";
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return value;
    }
  };

  return (
    <div className="container-fluid p-0 position-relative d-flex flex-column min-vh-100">
      <div className="p-4 flex-grow-1">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <h1 className="h3 mb-3 mb-md-0">Lịch sử thao tác</h1>
          <div className="d-flex gap-2 align-items-center">
            <Form.Group style={{ width: "100%", maxWidth: "450px" }}>
              <Form.Label>Chọn nhân viên</Form.Label>
              <Form.Select
                value={selectedEmployee}
                onChange={handleEmployeeChange}
              >
                <option value="all">Tất cả</option>
                {employeeList.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.hoten} ({employee.id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
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
                      <td>{parseJsonValue(item.giatriCu).substring(0, 50)}...</td>
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

      {/* Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết lịch sử thao tác</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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