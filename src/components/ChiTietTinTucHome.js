import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTinTucById } from "../services/apiService";

const ChiTietTinTucHome = () => {
  const { tintucId } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        const response = await fetchTinTucById(tintucId);
        if (response.data.trangthai !== "approved") {
          navigate("/", { state: { error: "Tin tức chưa được phê duyệt" } });
          return;
        }
        setNews(response.data);
      } catch (err) {
        navigate("/", { state: { error: "Không tìm thấy tin tức" } });
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [tintucId, navigate]);

  if (loading) {
    return (
      <div className="container-fluid p-0">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!news) {
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
                      <div
                        className="news-content text-danger text-center">Không tìm thấy tin tức</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

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
                  <div className="card-header">
                    <h1 className="h3 d-inline align-middle">{news.tieude}</h1>
                  </div>

                  <div className="card-body">
                    <div
                      className="news-content"
                      dangerouslySetInnerHTML={{ __html: news.noidungtin }}
                    />

                    <div className="mt-4 text-end text-muted">
                      <small>
                        Ngày đăng:{" "}
                        {news.thoigianpheduyet
                          ? new Date(news.thoigianpheduyet).toLocaleString()
                          : "Chưa xác nhận"}{" "}
                        | Người đăng: {news.nguoitao || "Không xác định"}
                      </small>
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

export default ChiTietTinTucHome;
