import React, { useState } from "react";
import { Modal, Button, Form, Col, Row } from "react-bootstrap";
import Swal from "sweetalert2";
import { backupDatabase, restoreDatabase } from "../services/apiService";

const BackupRestore = () => {
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

// Get token from localStorage
const token = localStorage.getItem("token");

  // Hàm xử lý sao lưu dữ liệu
  const handleBackup = async () => {
    const result = await Swal.fire({
      title: "Xác nhận sao lưu?",
      text: "Bạn có muốn sao lưu dữ liệu không?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sao lưu",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response= await backupDatabase(token);
        // Tạo URL để tải file
        const contentDisposition = response.headers["content-disposition"];
        const fileName = contentDisposition
          ? contentDisposition.split("filename=")[1]?.replace(/"/g, "") || "backup.sql"
          : "backup.sql";
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        Swal.fire("Thành công!", "Dữ liệu đã được sao lưu!", "success");
      } catch (error) {
        Swal.fire(
          "Lỗi!",
          error.response?.data?.message || "Không thể sao lưu dữ liệu",
          "error"
        );
        console.error("Error during backup:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Hàm mở modal khôi phục
  const openRestoreModal = async () => {
    const result = await Swal.fire({
      title: "Xác nhận khôi phục?",
      text: "Bạn có muốn khôi phục dữ liệu không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Khôi phục",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      setShowRestoreModal(true);
      setSelectedFile(null);
      setValidationError("");
    }
  };

  // Hàm xử lý chọn file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra định dạng file (giả định là .sql hoặc tương tự)
      if (!file.name.endsWith(".sql")) {
        setValidationError("Vui lòng chọn file có định dạng .sql");
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
        setValidationError("");
      }
    } else {
      setSelectedFile(null);
      setValidationError("Vui lòng chọn một file");
    }
  };

  // Hàm xử lý khôi phục dữ liệu
  const handleRestore = async () => {
    if (!selectedFile) {
      setValidationError("Vui lòng chọn một file để khôi phục");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response= await restoreDatabase(token, formData);
      Swal.fire("Thành công!", response.data.message, "success");

      // if (response.data.status === 200) {
      //   setShowRestoreModal(false);
      //   setSelectedFile(null);
      //   Swal.fire("Thành công!", "Khôi phục dữ liệu thành công!", "success");
      // } else {
      //   throw new Error(response.data.message || "Khôi phục dữ liệu thất bại");
      // }
    } catch (error) {
      Swal.fire(
        "Lỗi!",
        error.response?.data?.message || "Không thể khôi phục dữ liệu",
        "error"
      );
      console.error("Error during restore:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0 position-relative d-flex flex-column min-vh-100">
      <div className="p-4 flex-grow-1">
        <h1 className="h3 mb-4">Sao lưu và khôi phục dữ liệu</h1>

        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        <Row className="justify-content-center">
          <Col md={6} className="mb-3">
            <Button
              variant="success"
              size="lg"
              onClick={handleBackup}
              disabled={loading}
              className="w-100"
            >
              <i className="fas fa-download me-2"></i> Sao lưu dữ liệu
            </Button>
          </Col>
          <Col md={6} className="mb-3">
            <Button
              variant="primary"
              size="lg"
              onClick={openRestoreModal}
              disabled={loading}
              className="w-100"
            >
              <i className="fas fa-upload me-2"></i> Khôi phục dữ liệu
            </Button>
          </Col>
        </Row>
      </div>

      {/* Restore Modal */}
      <Modal
        show={showRestoreModal}
        onHide={() => setShowRestoreModal(false)}
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>Khôi phục dữ liệu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Chọn file sao lưu *</Form.Label>
              <Form.Control
                type="file"
                accept=".sql"
                onChange={handleFileChange}
                isInvalid={!!validationError}
              />
              <Form.Control.Feedback type="invalid">
                {validationError}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Vui lòng chọn file .sql để khôi phục dữ liệu.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowRestoreModal(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleRestore}
            disabled={loading || !selectedFile}
          >
            {loading ? "Đang xử lý..." : "Khôi phục"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BackupRestore;