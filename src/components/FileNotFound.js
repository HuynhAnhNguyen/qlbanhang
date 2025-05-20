import React from "react";
import { useNavigate } from "react-router-dom";

const FileNotFound = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="container-fluid p-0 position-relative d-flex flex-column min-vh-100">
        <div className="p-4 flex-grow-1">
          <div className="container-fluid p-0">
            <div className="mb-3">
              <button
                onClick={() => navigate(-1)}
                className="btn btn-outline-secondary"
              >
                Quay lại
              </button>
            </div>

            <div className="row">
              <div className="col-md-12 col-xl-12">
                <div className="card">
                  <div className="card-body">
                    <div className="news-content text-danger text-center">
                      Trang bạn truy cập không tồn tại hoặc đã bị xóa!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FileNotFound;
