const Footer = () => {
  return (
    <footer className="footer">
      <div className="container-fluid">
        <div className="row text-muted">
          <div className="col-4 text-start">
            <i className="fa-solid fa-location-dot me-1"></i> Địa chỉ: 125 Trần
            Phú, Văn Quán, Hà Đông, Hà Nội
          </div>
          <div className="col-4 text-center">
            <i className="fa-solid fa-phone me-1"></i> Hotline: 0123456789
          </div>
          <div className="col-4 text-end">
            <i className="fa-solid fa-envelope me-1"></i> Email: hvannd@edu.vn
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
