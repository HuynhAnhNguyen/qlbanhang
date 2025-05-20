import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchApprovedNews, getImageLink } from "../services/apiService";

const Index = () => {
  const [approvedNews, setApprovedNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // Số tin mỗi trang
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchApprovedNews();
        if (data.resultCode === 0) {
          setApprovedNews(data.data);
          setFilteredNews(data.data);
          setLoading(false);
        } else {
          throw new Error(data.message || "Không thể tải tin tức");
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Lọc tin tức khi searchTerm thay đổi
    if (searchTerm) {
      const filtered = approvedNews.filter(
        (news) =>
          news.tieude.toLowerCase().includes(searchTerm.toLowerCase()) ||
          news.noidungtin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          new Date(news.thoigianpheduyet)
            .toLocaleDateString()
            .includes(searchTerm)
      );
      setFilteredNews(filtered);
      setCurrentPage(1); // Reset về trang đầu khi tìm kiếm
    } else {
      setFilteredNews(approvedNews);
    }
  }, [searchTerm, approvedNews]);

  const handleViewDetail = (tintucId) => {
    navigate(`/chi-tiet-tin-tuc/${tintucId}`);
  };

  // Loại bỏ HTML tags từ nội dung
  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  if (loading) {
    return (
      <div className="container-fluid p-0 position-relative">
        <div className="p-4 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          {currentItems.length > 0 ? (
            currentItems.map((newsItem) => (
              <div className="col-12 col-md-6 col-lg-3 mb-4" key={newsItem.id}>
                <div className="card h-100 border-0 shadow-sm hover-card d-flex flex-column">
                  <div className="card-img-container position-relative overflow-hidden" style={{ height: "200px" }}>
                    <img
                      src={getImageLink(newsItem.url) || "/assets/images/logo/tolam.jpg"}
                      className="card-img-top-news img-hover-effect h-100 w-100"
                      alt="Tin tức"
                      style={{
                        borderRadius: "30px",
                        objectFit: "cover",
                        padding: "10px",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onClick={() => handleViewDetail(newsItem.id)}
                    />
                    <div className="img-overlay"></div>
                  </div>

                  <div className="card-body d-flex flex-column">
                    <h5
                      className="card-title"
                      style={{
                        fontSize: "1.1rem",
                        lineHeight: "1.4",
                        cursor: "pointer",
                        minHeight: "60px",
                      }}
                      onClick={() => handleViewDetail(newsItem.id)}
                    >
                      {newsItem.tieude.substring(0, 100) + (newsItem.tieude.length > 150 ? "..." : "")}
                    </h5>
                    <p
                      className="card-text text-muted mt-3 flex-grow-1"
                      style={{ fontSize: "0.9rem", cursor: "pointer" }}
                      onClick={() => handleViewDetail(newsItem.id)}
                    >
                      {stripHtml(newsItem.noidungtin).substring(0, 150) + 
                        (stripHtml(newsItem.noidungtin).length > 150 ? "..." : "")}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                      <button
                        className="btn btn-outline-primary py-2 px-3"
                        style={{
                          fontSize: "15px",
                          borderRadius: "6px",
                        }}
                        onClick={() => handleViewDetail(newsItem.id)}
                      >
                        Xem chi tiết
                      </button>
                      <small className="text-muted" style={{ fontSize: "11px" }}>
                        Đăng ngày: {new Date(newsItem.thoigianpheduyet).toLocaleString()}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5">
              <p>Không có tin tức nào được duyệt để hiển thị</p>
            </div>
          )}
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="mt-5">
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
      </div>
    </div>
  );
};

export default Index;