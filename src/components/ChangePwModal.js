import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ChangePwModal = ({
  show,
  onHide,
  changePwData,
  setChangePwData,
  validationErrors,
  handleChangePassword,
  loading,
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Đổi mật khẩu</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>
              Mật khẩu hiện tại <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="password"
              value={changePwData.currentPassword}
              onChange={(e) =>
                setChangePwData({
                  ...changePwData,
                  currentPassword: e.target.value,
                })
              }
              isInvalid={!!validationErrors.currentPassword}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.currentPassword}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              Mật khẩu mới <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="password"
              value={changePwData.newPassword}
              onChange={(e) =>
                setChangePwData({
                  ...changePwData,
                  newPassword: e.target.value,
                })
              }
              isInvalid={!!validationErrors.newPassword}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.newPassword}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              Xác nhận mật khẩu mới <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="password"
              value={changePwData.confirmNewPassword}
              onChange={(e) =>
                setChangePwData({
                  ...changePwData,
                  confirmNewPassword: e.target.value,
                })
              }
              isInvalid={!!validationErrors.confirmNewPassword}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.confirmNewPassword}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Hủy
        </Button>
        <Button
          variant="primary"
          onClick={handleChangePassword}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChangePwModal;