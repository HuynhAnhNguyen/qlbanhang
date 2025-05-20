import React from "react";
import ChatBot from "../components/LayoutComponent/ChatBot";

const News = () => {

  return (
    <div className="container-fluid p-0 position-relative">
      {/* Phần tin tức */}
      <div className="p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <h1 className="h3 mb-3 mb-md-0">Tin tức hoạt động</h1>
          <div className="d-flex" style={{ width: "100%", maxWidth: "400px" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm tin tức..."
              style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            />
            <button
              className="btn btn-primary"
              style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>

        {/* Danh sách tin tức */}
        <div className="row">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div className="col-12 col-md-6 col-lg-4 mb-4" key={item}>
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-img-container position-relative overflow-hidden">
                  <img
                    src="/assets/images/logo/tolam.jpg"
                    className="card-img-top-news img-hover-effect"
                    alt="Tin tức"
                    style={{
                      borderRadius: "30px",
                      objectFit: "contain",
                      padding: "20px",
                      width: "100%",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                  />
                  <div className="img-overlay"></div>
                </div>

                <div className="card-body">
                  <h5
                    className="card-title"
                    style={{
                      fontSize: "1.1rem",
                      lineHeight: "1.4",
                      cursor: "pointer",
                    }}
                  >
                    Nâng cao hiệu lực, hiệu quả công tác kiểm tra, giám sát, thi
                    hành kỷ luật của Đảng trong giai đoạn hiện nay
                  </h5>
                  <p
                    className="card-text text-muted mt-3"
                    style={{ fontSize: "0.9rem", cursor: "pointer" }}
                  >
                    TCCS - Từ khi ra đời đến nay, trong suốt quá trình lãnh đạo cách
                    mạng, Đảng ta không ngừng quan...
                  </p>
                  <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                    <a
                      href="#"
                      className="btn btn-outline-primary py-2 px-3"
                      style={{
                        fontSize: "15px",
                        borderRadius: "6px",
                      }}
                    >
                      Xem chi tiết
                    </a>
                    <small className="text-muted" style={{ fontSize: "11px" }}>
                      Đăng ngày: 2025-04-09 11:49:06
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Phân trang - Phiên bản cải tiến */}
        <nav aria-label="Page navigation" className="mt-5">
          <ul className="pagination justify-content-center">
            <li className="page-item">
              <a
                className="page-link text-decoration-none"
                href="#"
                style={{ cursor: "pointer" }}
              >
                &laquo; Trước
              </a>
            </li>
            {[1, 2, 3].map((page) => (
              <li className={`page-item ${page === 1 ? "active" : ""}`} key={page}>
                <a
                  className="page-link text-decoration-none"
                  href="#"
                  style={{ cursor: "pointer" }}
                >
                  {page}
                </a>
              </li>
            ))}
            <li className="page-item">
              <a
                className="page-link text-decoration-none"
                href="#"
                style={{ cursor: "pointer" }}
              >
                Tiếp &raquo;
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Chatbot Widget */}
      <ChatBot />
      
    </div>
  );
};

export default News;