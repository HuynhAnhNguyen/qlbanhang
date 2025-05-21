// import React, { useState, useEffect } from "react";
// import {
//   Modal,
//   Button,
//   Form,
//   Row,
//   Col,
//   Badge,
//   ListGroup,
// } from "react-bootstrap";
// import { FaHistory, FaUser, FaClock, FaTasks } from "react-icons/fa";
// import {
//   fetchLog,
//   fetchLogByNhanVienId,
//   fetchNhanVien,
// } from "../services/apiService";

// const LichSu = () => {
//   const [logList, setLogList] = useState([]);
//   const [employeeList, setEmployeeList] = useState([]);
//   const [searchType, setSearchType] = useState("all");
//   const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const itemsPerPage = 10;

//   // Modal states
//   const [showDetailModal, setShowDetailModal] = useState(false);
//   const [selectedLog, setSelectedLog] = useState(null);

//   const token = localStorage.getItem("token");

//   // Fetch all logs
//   const loadAllLogs = async () => {
//     setLoading(true);
//     try {
//       const data = await fetchLog(token);
//       if (data.resultCode === 0) {
//         setLogList(data.data);
//         setError(null);
//       } else {
//         throw new Error(data.message || "Không thể tải danh sách lịch sử");
//       }
//     } catch (err) {
//       setError("Không thể tải danh sách lịch sử");
//       console.error("Error loading logs:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch logs by employee ID
//   const loadLogsByMaNV = async (maNV) => {
//     setLoading(true);
//     try {
//       const data = await fetchLogByNhanVienId(token, maNV);
//       if (data.resultCode === 0) {
//         setLogList(data.data);
//         setError(null);
//       } else {
//         throw new Error(data.message || "Không thể tải lịch sử của nhân viên");
//       }
//     } catch (err) {
//       setError("Không thể tải lịch sử của nhân viên");
//       console.error("Error loading logs by MaNV:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch all employees
//   const loadEmployees = async () => {
//     try {
//       const data = await fetchNhanVien(token);
//       if (data.resultCode === 0) {
//         setEmployeeList(data.data);
//       } else {
//         throw new Error(data.message || "Không thể tải danh sách nhân viên");
//       }
//     } catch (err) {
//       console.error("Error loading employees:", err);
//     }
//   };

//   // Handle search type change
//   const handleSearchTypeChange = (e) => {
//     const type = e.target.value;
//     setSearchType(type);
//     setSelectedEmployeeId("");
//     setCurrentPage(1);

//     if (type === "all") {
//       loadAllLogs();
//     }
//   };

//   // Handle employee selection change
//   const handleEmployeeChange = (e) => {
//     const maNV = e.target.value;
//     setSelectedEmployeeId(maNV);
//     setCurrentPage(1);

//     if (maNV) {
//       loadLogsByMaNV(maNV);
//     }
//   };

//   // Open detail modal
//   const openDetailModal = (log) => {
//     setSelectedLog(log);
//     setShowDetailModal(true);
//   };

//   // Load initial data on mount
//   useEffect(() => {
//     loadAllLogs();
//     loadEmployees();
//   }, []);

//   // Pagination
//   const totalPages = Math.ceil(logList.length / itemsPerPage);
//   const currentItems = logList.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   // Format datetime for display
//   const formatDateTime = (dateTimeString) => {
//     if (!dateTimeString) return "";
//     return dateTimeString;
//   };

//   // Parse JSON values safely
//   // Parse JSON values safely and display in a user-friendly format
//   const parseJsonValue = (value, doituong, hanhdong) => {
//     if (!value) return <span className="text-muted">Không có</span>;

//     try {
//       const parsed = JSON.parse(value);
//       switch (doituong) {
//         case "SANPHAM":
//           return (
//             <div>
//               <p>
//                 <strong>Mã sản phẩm:</strong> {parsed.id}
//               </p>
//               <p>
//                 <strong>Tên sản phẩm:</strong> {parsed.tensp}
//               </p>
//               <p>
//                 <strong>Đơn vị tính:</strong> {parsed.dvt}
//               </p>
//               <p>
//                 <strong>Nước sản xuất:</strong> {parsed.nuocsx}
//               </p>
//               <p>
//                 <strong>Giá:</strong>{" "}
//                 {Number(parsed.gia).toLocaleString("vi-VN")} VND
//               </p>
//               {parsed.makm ? (
//                 <div>
//                   <p>
//                     <strong>Khuyến mãi:</strong> {parsed.makm.noidung} (Giảm{" "}
//                     {parsed.makm.phantram}%)
//                   </p>
//                   <p>
//                     <strong>Thời gian khuyến mãi:</strong> {parsed.makm.ngaybd}{" "}
//                     - {parsed.makm.ngaykt}
//                   </p>
//                 </div>
//               ) : (
//                 <p>
//                   <strong>Khuyến mãi:</strong> Không có
//                 </p>
//               )}
//               <p>
//                 <strong>Trạng thái:</strong>{" "}
//                 {parsed.status === "available" ? "Có sẵn" : "Hết hàng"}
//               </p>
//               <p>
//                 <strong>Hình ảnh:</strong> {parsed.imageurl ? "Có" : "Không có"}
//               </p>
//             </div>
//           );
//         case "KHUYENMAI":
//           return (
//             <div>
//               <p>
//                 <strong>Mã khuyến mãi:</strong> {parsed.id}
//               </p>
//               <p>
//                 <strong>Nội dung:</strong> {parsed.noidung}
//               </p>
//               <p>
//                 <strong>Phần trăm giảm:</strong> {parsed.phantram}%
//               </p>
//               <p>
//                 <strong>Thời gian:</strong> {parsed.ngaybd} - {parsed.ngaykt}
//               </p>
//               <p>
//                 <strong>Trạng thái:</strong> {parsed.status}
//               </p>
//             </div>
//           );
//         case "NHANVIEN":
//           return (
//             <div>
//               <p>
//                 <strong>Mã nhân viên:</strong> {parsed.id}
//               </p>
//               <p>
//                 <strong>Họ tên:</strong> {parsed.hoten}
//               </p>
//               <p>
//                 <strong>Số điện thoại:</strong> {parsed.sodt}
//               </p>
//               <p>
//                 <strong>Ngày vào làm:</strong> {parsed.ngvl}
//               </p>
//               <p>
//                 <strong>Vai trò:</strong> {parsed.roleid.rolename}
//               </p>
//               <p>
//                 <strong>Trạng thái:</strong>{" "}
//                 {parsed.status === "active" ? "Hoạt động" : "Không hoạt động"}
//               </p>
//             </div>
//           );
//         default:
//           return <pre>{JSON.stringify(parsed, null, 2)}</pre>;
//       }
//     } catch {
//       return <span>{value}</span>;
//     }
//   };

//   return (
//     <div className="container-fluid p-0 position-relative d-flex flex-column min-vh-100">
//       <div className="p-4 flex-grow-1">
//         <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
//           <h1 className="h3 mb-3 mb-md-0">Lịch sử thao tác</h1>
//           <div className="d-flex gap-2 align-items-center">
//             <Form.Select
//               value={searchType}
//               onChange={handleSearchTypeChange}
//               style={{ width: "200px" }}
//             >
//               <option value="all">Tất cả</option>
//               <option value="employee">Theo nhân viên</option>
//             </Form.Select>

//             {searchType === "employee" && (
//               <Form.Select
//                 value={selectedEmployeeId}
//                 onChange={handleEmployeeChange}
//                 style={{ width: "200px" }}
//               >
//                 <option value="">Chọn nhân viên</option>
//                 {employeeList.map((employee) => (
//                   <option key={employee.id} value={employee.id}>
//                     {employee.hoten} ({employee.id})
//                   </option>
//                 ))}
//               </Form.Select>
//             )}
//           </div>
//         </div>

//         {loading && (
//           <div className="text-center py-4">
//             <div className="spinner-border text-primary" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </div>
//           </div>
//         )}

//         {error && <div className="alert alert-danger">{error}</div>}

//         {searchType === "employee" && !selectedEmployeeId ? (
//           <div className="text-center py-4 color-black">
//             Vui lòng chọn nhân viên để xem lịch sử
//           </div>
//         ) : searchType === "employee" && currentItems.length === 0 ? (
//           <div className="text-center py-4 color-black">
//             Nhân viên này không có lịch sử thao tác
//           </div>
//         ) : currentItems.length === 0 ? (
//           <div className="text-center py-4 color-black">
//             Không tìm thấy lịch sử thao tác nào!
//           </div>
//         ) : (
//           <>
//             <div className="table-responsive mb-4">
//               <table className="table table-hover">
//                 <thead className="table-light">
//                   <tr>
//                     <th style={{ width: "5%" }}>STT</th>
//                     <th style={{ width: "15%" }}>Ngày giờ</th>
//                     <th style={{ width: "15%" }}>Người thực hiện</th>
//                     <th style={{ width: "15%" }}>Hành động</th>
//                     <th style={{ width: "15%" }}>Đối tượng</th>
//                     <th style={{ width: "25%" }}>Giá trị cũ</th>
//                     <th style={{ width: "10%" }}>Thao tác</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {currentItems.map((item, index) => (
//                     <tr key={item.id}>
//                       <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
//                       <td>{formatDateTime(item.ngaygio)}</td>
//                       <td>{item.nguoithuchien}</td>
//                       <td>
//                         <Badge
//                           bg={
//                             item.hanhdong === "LOGIN"
//                               ? "success"
//                               : item.hanhdong === "DELETE"
//                               ? "danger"
//                               : "primary"
//                           }
//                         >
//                           {item.hanhdong}
//                         </Badge>
//                       </td>
//                       <td>{item.doituong}</td>
//                       <td>
//                         {parseJsonValue(item.giatriCu).substring(0, 50)}...
//                       </td>
//                       <td>
//                         <button
//                           className="btn btn-sm btn-outline-primary btn-outline-primary-detail"
//                           onClick={() => openDetailModal(item)}
//                           title="Xem chi tiết"
//                         >
//                           <i className="fas fa-eye"></i>
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {totalPages > 1 && (
//               <div className="mt-auto p-3 bg-light border-top">
//                 <nav aria-label="Page navigation">
//                   <ul className="pagination justify-content-center mb-0">
//                     <li
//                       className={`page-item ${
//                         currentPage === 1 ? "disabled" : ""
//                       }`}
//                     >
//                       <button
//                         className="page-link"
//                         onClick={() =>
//                           setCurrentPage((prev) => Math.max(prev - 1, 1))
//                         }
//                         disabled={currentPage === 1}
//                       >
//                         « Trước
//                       </button>
//                     </li>
//                     {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//                       (page) => (
//                         <li
//                           key={page}
//                           className={`page-item ${
//                             page === currentPage ? "active" : ""
//                           }`}
//                         >
//                           <button
//                             className="page-link"
//                             onClick={() => setCurrentPage(page)}
//                           >
//                             {page}
//                           </button>
//                         </li>
//                       )
//                     )}
//                     <li
//                       className={`page-item ${
//                         currentPage === totalPages ? "disabled" : ""
//                       }`}
//                     >
//                       <button
//                         className="page-link"
//                         onClick={() =>
//                           setCurrentPage((prev) =>
//                             Math.min(prev + 1, totalPages)
//                           )
//                         }
//                         disabled={currentPage === totalPages}
//                       >
//                         Tiếp »
//                       </button>
//                     </li>
//                   </ul>
//                 </nav>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Detail Modal */}
//       <Modal
//         show={showDetailModal}
//         onHide={() => setShowDetailModal(false)}
//         size="lg"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Chi tiết lịch sử thao tác</Modal.Title>
//         </Modal.Header>
//         {/* <Modal.Body>
//           {selectedLog && (
//             <ListGroup variant="flush">
//               <ListGroup.Item>
//                 <FaHistory className="me-2" />
//                 <strong>ID:</strong> {selectedLog.id}
//               </ListGroup.Item>
//               <ListGroup.Item>
//                 <FaClock className="me-2" />
//                 <strong>Ngày giờ:</strong> {formatDateTime(selectedLog.ngaygio)}
//               </ListGroup.Item>
//               <ListGroup.Item>
//                 <FaUser className="me-2" />
//                 <strong>Người thực hiện:</strong> {selectedLog.nguoithuchien}
//               </ListGroup.Item>
//               <ListGroup.Item>
//                 <FaTasks className="me-2" />
//                 <strong>Hành động:</strong>{" "}
//                 <Badge
//                   bg={
//                     selectedLog.hanhdong === "LOGIN"
//                       ? "success"
//                       : selectedLog.hanhdong === "DELETE"
//                       ? "danger"
//                       : "primary"
//                   }
//                 >
//                   {selectedLog.hanhdong}
//                 </Badge>
//               </ListGroup.Item>
//               <ListGroup.Item>
//                 <strong>Đối tượng:</strong> {selectedLog.doituong}
//               </ListGroup.Item>
//               <ListGroup.Item>
//                 <strong>Giá trị cũ:</strong>
//                 <pre>{parseJsonValue(selectedLog.giatriCu)}</pre>
//               </ListGroup.Item>
//               <ListGroup.Item>
//                 <strong>Giá trị mới:</strong>{" "}
//                 {parseJsonValue(selectedLog.giatriMoi)}
//               </ListGroup.Item>
//             </ListGroup>
//           )}
//         </Modal.Body> */}
//         <Modal.Body>
//           {selectedLog && (
//             <div>
//               <ListGroup variant="flush">
//                 <ListGroup.Item>
//                   <FaHistory className="me-2" />
//                   <strong>ID:</strong> {selectedLog.id}
//                 </ListGroup.Item>
//                 <ListGroup.Item>
//                   <FaClock className="me-2" />
//                   <strong>Ngày giờ:</strong>{" "}
//                   {formatDateTime(selectedLog.ngaygio)}
//                 </ListGroup.Item>
//                 <ListGroup.Item>
//                   <FaUser className="me-2" />
//                   <strong>Người thực hiện:</strong> {selectedLog.nguoithuchien}
//                 </ListGroup.Item>
//                 <ListGroup.Item>
//                   <FaTasks className="me-2" />
//                   <strong>Hành động:</strong>{" "}
//                   <Badge
//                     bg={
//                       selectedLog.hanhdong === "LOGIN"
//                         ? "success"
//                         : selectedLog.hanhdong === "DELETE"
//                         ? "danger"
//                         : selectedLog.hanhdong === "UPDATE"
//                         ? "warning"
//                         : selectedLog.hanhdong.includes("KHUYENMAI")
//                         ? "info"
//                         : "primary"
//                     }
//                   >
//                     {selectedLog.hanhdong === "LOGIN"
//                       ? "Đăng nhập"
//                       : selectedLog.hanhdong === "UPDATE"
//                       ? "Cập nhật"
//                       : selectedLog.hanhdong === "ADD_KHUYENMAI"
//                       ? "Thêm khuyến mãi"
//                       : selectedLog.hanhdong === "REMOVE_KHUYENMAI"
//                       ? "Xóa khuyến mãi"
//                       : selectedLog.hanhdong}
//                   </Badge>
//                 </ListGroup.Item>
//                 <ListGroup.Item>
//                   <strong>Đối tượng:</strong>{" "}
//                   {selectedLog.doituong === "SANPHAM"
//                     ? "Sản phẩm"
//                     : selectedLog.doituong === "KHUYENMAI"
//                     ? "Khuyến mãi"
//                     : selectedLog.doituong === "NHANVIEN"
//                     ? "Nhân viên"
//                     : selectedLog.doituong}
//                 </ListGroup.Item>
//               </ListGroup>
//               {selectedLog.hanhdong !== "LOGIN" && (
//                 <Row className="mt-3">
//                   <Col md={6}>
//                     <h6>
//                       <strong>Giá trị cũ</strong>
//                     </h6>
//                     {parseJsonValue(
//                       selectedLog.giatriCu,
//                       selectedLog.doituong,
//                       selectedLog.hanhdong
//                     )}
//                   </Col>
//                   <Col md={6}>
//                     <h6>
//                       <strong>Giá trị mới</strong>
//                     </h6>
//                     {parseJsonValue(
//                       selectedLog.giatriMoi,
//                       selectedLog.doituong,
//                       selectedLog.hanhdong
//                     )}
//                   </Col>
//                 </Row>
//               )}
//             </div>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
//             Đóng
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default LichSu;


// import React, { useState, useEffect } from "react";
// import {
//   Modal,
//   Button,
//   Form,
//   Row,
//   Col,
//   Badge,
//   ListGroup,
//   Card,
// } from "react-bootstrap";
// import { FaHistory, FaUser, FaClock, FaTasks, FaSearch } from "react-icons/fa";
// import { FaThLarge, FaTh, FaTable, FaCalendarAlt } from 'react-icons/fa';

// import {
//   fetchLog,
//   fetchLogByNhanVienId,
//   fetchNhanVien,
// } from "../services/apiService";

// const LichSu = () => {
//   const [logList, setLogList] = useState([]);
//   const [employeeList, setEmployeeList] = useState([]);
//   const [searchType, setSearchType] = useState("all");
//   const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const itemsPerPage = 10;

//   // Modal states
//   const [showDetailModal, setShowDetailModal] = useState(false);
//   const [selectedLog, setSelectedLog] = useState(null);

//   const [viewMode, setViewMode] = useState('cards'); 

//   const token = localStorage.getItem("token");

//    const renderView = () => {
//     switch(viewMode) {
//       case 'table':
//         return <TableView logs={currentItems} />;
//       case 'timeline':
//         return <TimelineView logs={currentItems} />;
//       case 'calendar':
//         return <CalendarView logs={currentItems} />;
//       case 'compact':
//         return <CompactCardView logs={currentItems} />;
//       default:
//         return <CardView logs={currentItems} />;
//     }
//   };

//   // Fetch all logs
//   const loadAllLogs = async () => {
//     setLoading(true);
//     try {
//       const data = await fetchLog(token);
//       if (data.resultCode === 0) {
//         setLogList(data.data);
//         setError(null);
//       } else {
//         throw new Error(data.message || "Không thể tải danh sách lịch sử");
//       }
//     } catch (err) {
//       setError("Không thể tải danh sách lịch sử");
//       console.error("Error loading logs:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch logs by employee ID
//   const loadLogsByMaNV = async (maNV) => {
//     setLoading(true);
//     try {
//       const data = await fetchLogByNhanVienId(token, maNV);
//       if (data.resultCode === 0) {
//         setLogList(data.data);
//         setError(null);
//       } else {
//         throw new Error(data.message || "Không thể tải lịch sử của nhân viên");
//       }
//     } catch (err) {
//       setError("Không thể tải lịch sử của nhân viên");
//       console.error("Error loading logs by MaNV:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch all employees
//   const loadEmployees = async () => {
//     try {
//       const data = await fetchNhanVien(token);
//       if (data.resultCode === 0) {
//         setEmployeeList(data.data);
//       } else {
//         throw new Error(data.message || "Không thể tải danh sách nhân viên");
//       }
//     } catch (err) {
//       console.error("Error loading employees:", err);
//     }
//   };

//   // Handle search type change
//   const handleSearchTypeChange = (e) => {
//     const type = e.target.value;
//     setSearchType(type);
//     setSelectedEmployeeId("");
//     setCurrentPage(1);

//     if (type === "all") {
//       loadAllLogs();
//     }
//   };

//   // Handle employee selection change
//   const handleEmployeeChange = (e) => {
//     const maNV = e.target.value;
//     setSelectedEmployeeId(maNV);
//     setCurrentPage(1);

//     if (maNV) {
//       loadLogsByMaNV(maNV);
//     }
//   };

//   // Open detail modal
//   const openDetailModal = (log) => {
//     setSelectedLog(log);
//     setShowDetailModal(true);
//   };

//   // Load initial data on mount
//   useEffect(() => {
//     loadAllLogs();
//     loadEmployees();
//   }, []);

//   // Pagination
//   const totalPages = Math.ceil(logList.length / itemsPerPage);
//   const currentItems = logList.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   // Format datetime for display
//   const formatDateTime = (dateTimeString) => {
//     if (!dateTimeString) return "";
//     const [date, time] = dateTimeString.split(" ");
//     return `${time} ${date}`;
//   };

//   // Translate action to Vietnamese
//   const translateAction = (action) => {
//     switch (action) {
//       case "LOGIN":
//         return "Đăng nhập hệ thống";
//       case "UPDATE":
//         return "Cập nhật thông tin";
//       case "ADD_KHUYENMAI":
//         return "Áp dụng khuyến mãi";
//       case "REMOVE_KHUYENMAI":
//         return "Gỡ khuyến mãi";
//       default:
//         return action;
//     }
//   };

//   // Translate object type to Vietnamese
//   const translateObjectType = (type) => {
//     switch (type) {
//       case "SANPHAM":
//         return "Sản phẩm";
//       case "KHUYENMAI":
//         return "Chương trình khuyến mãi";
//       case "NHANVIEN":
//         return "Nhân viên";
//       default:
//         return type;
//     }
//   };

//   // Parse JSON values safely and format for display
//   const parseLogDetails = (log) => {
//     try {
//       const oldValue = log.giatriCu ? JSON.parse(log.giatriCu) : null;
//       const newValue = log.giatriMoi ? JSON.parse(log.giatriMoi) : null;

//       switch (log.doituong) {
//         case "SANPHAM":
//           return (
//             <div>
//               <p>
//                 <strong>Sản phẩm:</strong> {oldValue?.tensp || newValue?.tensp} (
//                 {oldValue?.id || newValue?.id})
//               </p>
              
//               {log.hanhdong === "UPDATE" && (
//                 <>
//                   {oldValue?.imageurl !== newValue?.imageurl && (
//                     <p>- {newValue?.imageurl ? "Thêm ảnh sản phẩm" : "Xóa ảnh sản phẩm"}</p>
//                   )}
//                   {oldValue?.tensp !== newValue?.tensp && (
//                     <p>- Đổi tên sản phẩm: {oldValue?.tensp} → {newValue?.tensp}</p>
//                   )}
//                   {oldValue?.gia !== newValue?.gia && (
//                     <p>- Đổi giá: {oldValue?.gia} → {newValue?.gia}</p>
//                   )}
//                 </>
//               )}
              
//               {log.hanhdong === "ADD_KHUYENMAI" && (
//                 <p>
//                   - Áp dụng khuyến mãi: {newValue?.makm?.noidung} (Giảm{" "}
//                   {newValue?.makm?.phantram}%)
//                 </p>
//               )}
              
//               {log.hanhdong === "REMOVE_KHUYENMAI" && (
//                 <p>
//                   - Gỡ khuyến mãi: {oldValue?.makm?.noidung} (Giảm{" "}
//                   {oldValue?.makm?.phantram}%)
//                 </p>
//               )}
//             </div>
//           );
          
//         case "KHUYENMAI":
//           return (
//             <div>
//               <p>
//                 <strong>Chương trình:</strong> {oldValue?.noidung || newValue?.noidung} (
//                 {oldValue?.id || newValue?.id})
//               </p>
              
//               {oldValue?.phantram !== newValue?.phantram && (
//                 <p>- Thay đổi phần trăm giảm giá: {oldValue?.phantram}% → {newValue?.phantram}%</p>
//               )}
              
//               {(oldValue?.ngaybd !== newValue?.ngaybd || oldValue?.ngaykt !== newValue?.ngaykt) && (
//                 <p>- Thay đổi thời gian áp dụng: {oldValue?.ngaybd} - {oldValue?.ngaykt} → {newValue?.ngaybd} - {newValue?.ngaykt}</p>
//               )}
//             </div>
//           );
          
//         case "NHANVIEN":
//           return (
//             <div>
//               <p>
//                 <strong>Nhân viên:</strong> {oldValue?.hoten || newValue?.hoten} (
//                 {oldValue?.id || newValue?.id})
//               </p>
//             </div>
//           );
          
//         default:
//           return null;
//       }
//     } catch (e) {
//       return null;
//     }
//   };

//   // Group logs by time and action for better display
//   const groupLogs = (logs) => {
//     const grouped = {};
    
//     logs.forEach(log => {
//       const date = log.ngaygio.split(" ")[0];
//       if (!grouped[date]) {
//         grouped[date] = [];
//       }
//       grouped[date].push(log);
//     });
    
//     return grouped;
//   };

//   const groupedLogs = groupLogs(currentItems);

//   const CalendarView = ({ logs }) => {
//   const groupedByDate = groupLogs(logs);

//   return (
//     <div className="calendar-view">
//       {Object.entries(groupedByDate).map(([date, dateLogs]) => (
//         <div key={date} className="calendar-day">
//           <div className="calendar-date-header">
//             <h5>{date}</h5>
//           </div>
//           <div className="calendar-events">
//             {dateLogs.map(log => (
//               <div key={log.id} className="calendar-event">
//                 <div className="event-time">
//                   {log.ngaygio.split(' ')[1]}
//                 </div>
//                 <div className="event-content">
//                   <div className="event-title">
//                     {translateAction(log.hanhdong)}
//                   </div>
//                   <div className="event-details">
//                     {parseLogDetails(log)}
//                   </div>
//                   <div className="event-meta">
//                     <span className="badge bg-secondary me-2">
//                       {translateObjectType(log.doituong)}
//                     </span>
//                     <span>{log.nguoithuchien.trim()}</span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// const TableView = ({ logs }) => {
//   return (
//     <div className="table-responsive">
//       <table className="table table-hover">
//         <thead>
//           <tr>
//             <th>Thời gian</th>
//             <th>Hành động</th>
//             <th>Đối tượng</th>
//             <th>Người thực hiện</th>
//             <th>Chi tiết</th>
//           </tr>
//         </thead>
//         <tbody>
//           {logs.map(log => (
//             <tr key={log.id}>
//               <td>{formatDateTime(log.ngaygio)}</td>
//               <td>{translateAction(log.hanhdong)}</td>
//               <td>{translateObjectType(log.doituong)}</td>
//               <td>{log.nguoithuchien.trim()}</td>
//               <td>
//                 <Button 
//                   variant="link" 
//                   size="sm"
//                   onClick={() => openDetailModal(log)}
//                 >
//                   Xem
//                 </Button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// const TimelineView = ({ logs }) => {
//   return (
//     <div className="timeline">
//       {logs.map((log, index) => (
//         <div key={log.id} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
//           <div className="timeline-dot"></div>
//           <div className="timeline-content">
//             <div className="timeline-header">
//               <span className="timeline-time">{formatDateTime(log.ngaygio)}</span>
//               <span className="timeline-action">{translateAction(log.hanhdong)}</span>
//             </div>
//             <div className="timeline-body">
//               {parseLogDetails(log)}
//             </div>
//             <div className="timeline-footer">
//               <span className="badge bg-secondary">{translateObjectType(log.doituong)}</span>
//               <span className="ms-2">{log.nguoithuchien.trim()}</span>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

//   return (
//     <div className="container-fluid p-0 position-relative d-flex flex-column min-vh-100">
//       <div className="p-4 flex-grow-1">
//         <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
//           <h1 className="h3 mb-3 mb-md-0">Lịch sử thao tác</h1>
//           <div className="d-flex gap-2 align-items-center">
            
//             {/* View mode selector */}
//             <div className="btn-group" role="group">
//               <Button 
//                 variant={viewMode === 'cards' ? 'primary' : 'outline-secondary'} 
//                 size="sm"
//                 onClick={() => setViewMode('cards')}
//                 title="Thẻ"
//               >
//                 <FaThLarge />
//               </Button>
//               {/* <Button 
//                 variant={viewMode === 'compact' ? 'primary' : 'outline-secondary'} 
//                 size="sm"
//                 onClick={() => setViewMode('compact')}
//                 title="Thẻ nhỏ"
//               >
//                 <FaTh />
//               </Button> */}
//               <Button 
//                 variant={viewMode === 'table' ? 'primary' : 'outline-secondary'} 
//                 size="sm"
//                 onClick={() => setViewMode('table')}
//                 title="Bảng"
//               >
//                 <FaTable />
//               </Button>
//               <Button 
//                 variant={viewMode === 'timeline' ? 'primary' : 'outline-secondary'} 
//                 size="sm"
//                 onClick={() => setViewMode('timeline')}
//                 title="Dòng thời gian"
//               >
//                 <FaHistory />
//               </Button>
//               <Button 
//                 variant={viewMode === 'calendar' ? 'primary' : 'outline-secondary'} 
//                 size="sm"
//                 onClick={() => setViewMode('calendar')}
//                 title="Lịch"
//               >
//                 <FaCalendarAlt />
//               </Button>
//             </div>
            
//             <Form.Select
//               value={searchType}
//               onChange={handleSearchTypeChange}
//               style={{ width: "200px" }}
//             >
//               <option value="all">Tất cả</option>
//               <option value="employee">Theo nhân viên</option>
//             </Form.Select>

//             {searchType === "employee" && (
//               <Form.Select
//                 value={selectedEmployeeId}
//                 onChange={handleEmployeeChange}
//                 style={{ width: "250px" }}
//               >
//                 <option value="">Chọn nhân viên...</option>
//                 {employeeList.map((employee) => (
//                   <option key={employee.id} value={employee.id}>
//                     {employee.hoten} ({employee.id.trim()})
//                   </option>
//                 ))}
//               </Form.Select>
//             )}
//           </div>
//         </div>

//         {loading && (
//           <div className="text-center py-4">
//             <div className="spinner-border text-primary" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </div>
//           </div>
//         )}

//         {error && <div className="alert alert-danger">{error}</div>}

//         {searchType === "employee" && !selectedEmployeeId ? (
//           <div className="text-center py-4 text-muted">
//             <FaSearch className="me-2" />
//             Vui lòng chọn nhân viên để xem lịch sử
//           </div>
//         ) : searchType === "employee" && currentItems.length === 0 ? (
//           <div className="text-center py-4 text-muted">
//             Nhân viên này không có lịch sử thao tác
//           </div>
//         ) : currentItems.length === 0 ? (
//           <div className="text-center py-4 text-muted">
//             Không tìm thấy lịch sử thao tác nào
//           </div>
//         ) : (
//           <>
//             {Object.entries(groupedLogs).map(([date, logs]) => (
//               <div key={date} className="mb-4">
//                 <h5 className="mb-3 text-primary">{date}</h5>
                
//                 {logs.map((log) => (
//                   <Card key={log.id} className="mb-3 shadow-sm">
//                     <Card.Body>
//                       <div className="d-flex justify-content-between align-items-start">
//                         <div>
//                           <h6 className="mb-2">
//                             {translateAction(log.hanhdong)}
//                           </h6>
//                           <p className="mb-1 text-muted small">
//                             <FaClock className="me-1" />
//                             {formatDateTime(log.ngaygio)}
//                           </p>
//                           <p className="mb-1 text-muted small">
//                             <FaUser className="me-1" />
//                             {log.nguoithuchien.trim()}
//                           </p>
//                         </div>
//                         <Badge 
//                           bg={
//                             log.hanhdong === "LOGIN" ? "success" :
//                             log.hanhdong === "UPDATE" ? "info" :
//                             log.hanhdong.includes("KHUYENMAI") ? "warning" :
//                             "primary"
//                           }
//                           className="align-self-start"
//                         >
//                           {translateObjectType(log.doituong)}
//                         </Badge>
//                       </div>
                      
//                       <div className="mt-2">
//                         {parseLogDetails(log)}
//                       </div>
                      
//                       <Button 
//                         variant="outline-primary" 
//                         size="sm" 
//                         className="mt-2"
//                         onClick={() => openDetailModal(log)}
//                       >
//                         Xem chi tiết
//                       </Button>
//                     </Card.Body>
//                   </Card>
//                 ))}
//               </div>
//             ))}

//             {totalPages > 1 && (
//               <div className="mt-4 d-flex justify-content-center">
//                 <nav aria-label="Page navigation">
//                   <ul className="pagination">
//                     <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
//                       <button 
//                         className="page-link" 
//                         onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
//                       >
//                         &laquo;
//                       </button>
//                     </li>
                    
//                     {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                       let pageNum;
//                       if (totalPages <= 5) {
//                         pageNum = i + 1;
//                       } else if (currentPage <= 3) {
//                         pageNum = i + 1;
//                       } else if (currentPage >= totalPages - 2) {
//                         pageNum = totalPages - 4 + i;
//                       } else {
//                         pageNum = currentPage - 2 + i;
//                       }
//                       return (
//                         <li 
//                           key={pageNum} 
//                           className={`page-item ${currentPage === pageNum ? "active" : ""}`}
//                         >
//                           <button 
//                             className="page-link" 
//                             onClick={() => setCurrentPage(pageNum)}
//                           >
//                             {pageNum}
//                           </button>
//                         </li>
//                       );
//                     })}
                    
//                     <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
//                       <button 
//                         className="page-link" 
//                         onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
//                       >
//                         &raquo;
//                       </button>
//                     </li>
//                   </ul>
//                 </nav>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Detail Modal */}
//       <Modal
//         show={showDetailModal}
//         onHide={() => setShowDetailModal(false)}
//         size="lg"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Chi tiết lịch sử thao tác</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedLog && (
//             <div>
//               <ListGroup variant="flush">
//                 <ListGroup.Item>
//                   <FaClock className="me-2" />
//                   <strong>Thời gian:</strong> {formatDateTime(selectedLog.ngaygio)}
//                 </ListGroup.Item>
//                 <ListGroup.Item>
//                   <FaUser className="me-2" />
//                   <strong>Người thực hiện:</strong> {selectedLog.nguoithuchien.trim()}
//                 </ListGroup.Item>
//                 <ListGroup.Item>
//                   <FaTasks className="me-2" />
//                   <strong>Hành động:</strong> {translateAction(selectedLog.hanhdong)}
//                 </ListGroup.Item>
//                 <ListGroup.Item>
//                   <strong>Đối tượng:</strong> {translateObjectType(selectedLog.doituong)}
//                 </ListGroup.Item>
//               </ListGroup>
              
//               {selectedLog.hanhdong !== "LOGIN" && (
//                 <Row className="mt-3">
//                   <Col md={6}>
//                     <Card className="h-100">
//                       <Card.Header className="bg-light">
//                         <strong>Giá trị cũ</strong>
//                       </Card.Header>
//                       <Card.Body>
//                         <pre className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
//                           {selectedLog.giatriCu ? JSON.stringify(JSON.parse(selectedLog.giatriCu), null, 2) : "Không có"}
//                         </pre>
//                       </Card.Body>
//                     </Card>
//                   </Col>
//                   <Col md={6}>
//                     <Card className="h-100">
//                       <Card.Header className="bg-light">
//                         <strong>Giá trị mới</strong>
//                       </Card.Header>
//                       <Card.Body>
//                         <pre className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
//                           {selectedLog.giatriMoi ? JSON.stringify(JSON.parse(selectedLog.giatriMoi), null, 2) : "Không có"}
//                         </pre>
//                       </Card.Body>
//                     </Card>
//                   </Col>
//                 </Row>
//               )}
//             </div>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
//             Đóng
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default LichSu;


//3
// import React, { useState, useEffect } from "react";
// import {
//   Modal,
//   Button,
//   Form,
//   Row,
//   Col,
//   Badge,
//   ListGroup,
//   Card,
//   Table,
// } from "react-bootstrap";
// import { 
//   FaHistory, 
//   FaUser, 
//   FaClock, 
//   FaTasks, 
//   FaSearch,
//   FaThLarge, 
//   FaTh, 
//   FaTable, 
//   FaCalendarAlt 
// } from "react-icons/fa";
// import {
//   fetchLog,
//   fetchLogByNhanVienId,
//   fetchNhanVien,
// } from "../services/apiService";

// const LichSu = () => {
//   const [logList, setLogList] = useState([]);
//   const [employeeList, setEmployeeList] = useState([]);
//   const [searchType, setSearchType] = useState("all");
//   const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const itemsPerPage = 10;

//   // Modal states
//   const [showDetailModal, setShowDetailModal] = useState(false);
//   const [selectedLog, setSelectedLog] = useState(null);

//   const [viewMode, setViewMode] = useState('cards'); // 'cards', 'table', 'timeline', 'calendar'

//   const token = localStorage.getItem("token");

//   // Fetch all logs
//   const loadAllLogs = async () => {
//     setLoading(true);
//     try {
//       const data = await fetchLog(token);
//       if (data.resultCode === 0) {
//         setLogList(data.data);
//         setError(null);
//       } else {
//         throw new Error(data.message || "Không thể tải danh sách lịch sử");
//       }
//     } catch (err) {
//       setError("Không thể tải danh sách lịch sử");
//       console.error("Error loading logs:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch logs by employee ID
//   const loadLogsByMaNV = async (maNV) => {
//     setLoading(true);
//     try {
//       const data = await fetchLogByNhanVienId(token, maNV);
//       if (data.resultCode === 0) {
//         setLogList(data.data);
//         setError(null);
//       } else {
//         throw new Error(data.message || "Không thể tải lịch sử của nhân viên");
//       }
//     } catch (err) {
//       setError("Không thể tải lịch sử của nhân viên");
//       console.error("Error loading logs by MaNV:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch all employees
//   const loadEmployees = async () => {
//     try {
//       const data = await fetchNhanVien(token);
//       if (data.resultCode === 0) {
//         setEmployeeList(data.data);
//       } else {
//         throw new Error(data.message || "Không thể tải danh sách nhân viên");
//       }
//     } catch (err) {
//       console.error("Error loading employees:", err);
//     }
//   };

//   // Handle search type change
//   const handleSearchTypeChange = (e) => {
//     const type = e.target.value;
//     setSearchType(type);
//     setSelectedEmployeeId("");
//     setCurrentPage(1);

//     if (type === "all") {
//       loadAllLogs();
//     }
//   };

//   // Handle employee selection change
//   const handleEmployeeChange = (e) => {
//     const maNV = e.target.value;
//     setSelectedEmployeeId(maNV);
//     setCurrentPage(1);

//     if (maNV) {
//       loadLogsByMaNV(maNV);
//     }
//   };

//   // Open detail modal
//   const openDetailModal = (log) => {
//     setSelectedLog(log);
//     setShowDetailModal(true);
//   };

//   // Load initial data on mount
//   useEffect(() => {
//     loadAllLogs();
//     loadEmployees();
//   }, []);

//   // Pagination
//   const totalPages = Math.ceil(logList.length / itemsPerPage);
//   const currentItems = logList.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   // Format datetime for display
//   const formatDateTime = (dateTimeString) => {
//     if (!dateTimeString) return "";
//     const [date, time] = dateTimeString.split(" ");
//     return `${time} ${date}`;
//   };

//   // Translate action to Vietnamese
//   const translateAction = (action) => {
//     switch (action) {
//       case "LOGIN":
//         return "Đăng nhập hệ thống";
//       case "UPDATE":
//         return "Cập nhật thông tin";
//       case "ADD_KHUYENMAI":
//         return "Áp dụng khuyến mãi";
//       case "REMOVE_KHUYENMAI":
//         return "Gỡ khuyến mãi";
//       default:
//         return action;
//     }
//   };

//   // Translate object type to Vietnamese
//   const translateObjectType = (type) => {
//     switch (type) {
//       case "SANPHAM":
//         return "Sản phẩm";
//       case "KHUYENMAI":
//         return "Chương trình khuyến mãi";
//       case "NHANVIEN":
//         return "Nhân viên";
//       default:
//         return type;
//     }
//   };

//   // Parse JSON values safely and format for display
//   const parseLogDetails = (log) => {
//     try {
//       const oldValue = log.giatriCu ? JSON.parse(log.giatriCu) : null;
//       const newValue = log.giatriMoi ? JSON.parse(log.giatriMoi) : null;

//       switch (log.doituong) {
//         case "SANPHAM":
//           return (
//             <div>
//               <p>
//                 <strong>Sản phẩm:</strong> {oldValue?.tensp || newValue?.tensp} (
//                 {oldValue?.id || newValue?.id})
//               </p>
              
//               {log.hanhdong === "UPDATE" && (
//                 <>
//                   {oldValue?.imageurl !== newValue?.imageurl && (
//                     <p>- {newValue?.imageurl ? "Thêm ảnh sản phẩm" : "Xóa ảnh sản phẩm"}</p>
//                   )}
//                   {oldValue?.tensp !== newValue?.tensp && (
//                     <p>- Đổi tên sản phẩm: {oldValue?.tensp} → {newValue?.tensp}</p>
//                   )}
//                   {oldValue?.gia !== newValue?.gia && (
//                     <p>- Đổi giá: {oldValue?.gia} → {newValue?.gia}</p>
//                   )}
//                 </>
//               )}
              
//               {log.hanhdong === "ADD_KHUYENMAI" && (
//                 <p>
//                   - Áp dụng khuyến mãi: {newValue?.makm?.noidung} (Giảm{" "}
//                   {newValue?.makm?.phantram}%)
//                 </p>
//               )}
              
//               {log.hanhdong === "REMOVE_KHUYENMAI" && (
//                 <p>
//                   - Gỡ khuyến mãi: {oldValue?.makm?.noidung} (Giảm{" "}
//                   {oldValue?.makm?.phantram}%)
//                 </p>
//               )}
//             </div>
//           );
          
//         case "KHUYENMAI":
//           return (
//             <div>
//               <p>
//                 <strong>Chương trình:</strong> {oldValue?.noidung || newValue?.noidung} (
//                 {oldValue?.id || newValue?.id})
//               </p>
              
//               {oldValue?.phantram !== newValue?.phantram && (
//                 <p>- Thay đổi phần trăm giảm giá: {oldValue?.phantram}% → {newValue?.phantram}%</p>
//               )}
              
//               {(oldValue?.ngaybd !== newValue?.ngaybd || oldValue?.ngaykt !== newValue?.ngaykt) && (
//                 <p>- Thay đổi thời gian áp dụng: {oldValue?.ngaybd} - {oldValue?.ngaykt} → {newValue?.ngaybd} - {newValue?.ngaykt}</p>
//               )}
//             </div>
//           );
          
//         case "NHANVIEN":
//           return (
//             <div>
//               <p>
//                 <strong>Nhân viên:</strong> {oldValue?.hoten || newValue?.hoten} (
//                 {oldValue?.id || newValue?.id})
//               </p>
//             </div>
//           );
          
//         default:
//           return null;
//       }
//     } catch (e) {
//       return null;
//     }
//   };

//   // Group logs by time and action for better display
//   const groupLogs = (logs) => {
//     const grouped = {};
    
//     logs.forEach(log => {
//       const date = log.ngaygio.split(" ")[0];
//       if (!grouped[date]) {
//         grouped[date] = [];
//       }
//       grouped[date].push(log);
//     });
    
//     return grouped;
//   };

//   // Card View Component
//   const CardView = ({ logs }) => {
//     const groupedLogs = groupLogs(logs);
    
//     return (
//       <>
//         {Object.entries(groupedLogs).map(([date, logs]) => (
//           <div key={date} className="mb-4">
//             <h5 className="mb-3 text-primary">{date}</h5>
            
//             {logs.map((log) => (
//               <Card key={log.id} className="mb-3 shadow-sm">
//                 <Card.Body>
//                   <div className="d-flex justify-content-between align-items-start">
//                     <div>
//                       <h6 className="mb-2">
//                         {translateAction(log.hanhdong)}
//                       </h6>
//                       <p className="mb-1 text-muted small">
//                         <FaClock className="me-1" />
//                         {formatDateTime(log.ngaygio)}
//                       </p>
//                       <p className="mb-1 text-muted small">
//                         <FaUser className="me-1" />
//                         {log.nguoithuchien.trim()}
//                       </p>
//                     </div>
//                     <Badge 
//                       bg={
//                         log.hanhdong === "LOGIN" ? "success" :
//                         log.hanhdong === "UPDATE" ? "info" :
//                         log.hanhdong.includes("KHUYENMAI") ? "warning" :
//                         "primary"
//                       }
//                       className="align-self-start"
//                     >
//                       {translateObjectType(log.doituong)}
//                     </Badge>
//                   </div>
                  
//                   <div className="mt-2">
//                     {parseLogDetails(log)}
//                   </div>
                  
//                   <Button 
//                     variant="outline-primary" 
//                     size="sm" 
//                     className="mt-2"
//                     onClick={() => openDetailModal(log)}
//                   >
//                     Xem chi tiết
//                   </Button>
//                 </Card.Body>
//               </Card>
//             ))}
//           </div>
//         ))}
//       </>
//     );
//   };

//   // Table View Component
//   const TableView = ({ logs }) => {
//     return (
//       <div className="table-responsive">
//         <Table hover>
//           <thead>
//             <tr>
//               <th>Thời gian</th>
//               <th>Hành động</th>
//               <th>Đối tượng</th>
//               <th>Người thực hiện</th>
//               <th>Chi tiết</th>
//             </tr>
//           </thead>
//           <tbody>
//             {logs.map(log => (
//               <tr key={log.id}>
//                 <td>{formatDateTime(log.ngaygio)}</td>
//                 <td>{translateAction(log.hanhdong)}</td>
//                 <td>{translateObjectType(log.doituong)}</td>
//                 <td>{log.nguoithuchien.trim()}</td>
//                 <td>
//                   <Button 
//                     variant="link" 
//                     size="sm"
//                     onClick={() => openDetailModal(log)}
//                   >
//                     Xem
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </Table>
//       </div>
//     );
//   };

//   // Timeline View Component
//   const TimelineView = ({ logs }) => {
//     return (
//       <div className="timeline">
//         {logs.map((log, index) => (
//           <div key={log.id} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
//             <div className="timeline-dot"></div>
//             <div className="timeline-content">
//               <div className="timeline-header">
//                 <span className="timeline-time">{formatDateTime(log.ngaygio)}</span>
//                 <span className="timeline-action">{translateAction(log.hanhdong)}</span>
//               </div>
//               <div className="timeline-body">
//                 {parseLogDetails(log)}
//               </div>
//               <div className="timeline-footer">
//                 <span className="badge bg-secondary">{translateObjectType(log.doituong)}</span>
//                 <span className="ms-2">{log.nguoithuchien.trim()}</span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   // Calendar View Component
//   const CalendarView = ({ logs }) => {
//     const groupedByDate = groupLogs(logs);

//     return (
//       <div className="calendar-view">
//         {Object.entries(groupedByDate).map(([date, dateLogs]) => (
//           <div key={date} className="calendar-day">
//             <div className="calendar-date-header">
//               <h5>{date}</h5>
//             </div>
//             <div className="calendar-events">
//               {dateLogs.map(log => (
//                 <div key={log.id} className="calendar-event">
//                   <div className="event-time">
//                     {log.ngaygio.split(' ')[1]}
//                   </div>
//                   <div className="event-content">
//                     <div className="event-title">
//                       {translateAction(log.hanhdong)}
//                     </div>
//                     <div className="event-details">
//                       {parseLogDetails(log)}
//                     </div>
//                     <div className="event-meta">
//                       <span className="badge bg-secondary me-2">
//                         {translateObjectType(log.doituong)}
//                       </span>
//                       <span>{log.nguoithuchien.trim()}</span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   // Render the appropriate view based on viewMode
//   const renderView = () => {
//     switch(viewMode) {
//       case 'table':
//         return <TableView logs={currentItems} />;
//       case 'timeline':
//         return <TimelineView logs={currentItems} />;
//       case 'calendar':
//         return <CalendarView logs={currentItems} />;
//       default:
//         return <CardView logs={currentItems} />;
//     }
//   };

//   return (
//     <div className="container-fluid p-0 position-relative d-flex flex-column min-vh-100">
//       <div className="p-4 flex-grow-1">
//         <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
//           <h1 className="h3 mb-3 mb-md-0">Lịch sử thao tác</h1>
//           <div className="d-flex gap-2 align-items-center">
            
//             {/* View mode selector */}
//             <div className="btn-group" role="group">
//               <Button 
//                 variant={viewMode === 'cards' ? 'primary' : 'outline-secondary'} 
//                 size="sm"
//                 onClick={() => setViewMode('cards')}
//                 title="Thẻ"
//               >
//                 <FaThLarge />
//               </Button>
//               <Button 
//                 variant={viewMode === 'table' ? 'primary' : 'outline-secondary'} 
//                 size="sm"
//                 onClick={() => setViewMode('table')}
//                 title="Bảng"
//               >
//                 <FaTable />
//               </Button>
//               <Button 
//                 variant={viewMode === 'timeline' ? 'primary' : 'outline-secondary'} 
//                 size="sm"
//                 onClick={() => setViewMode('timeline')}
//                 title="Dòng thời gian"
//               >
//                 <FaHistory />
//               </Button>
//               <Button 
//                 variant={viewMode === 'calendar' ? 'primary' : 'outline-secondary'} 
//                 size="sm"
//                 onClick={() => setViewMode('calendar')}
//                 title="Lịch"
//               >
//                 <FaCalendarAlt />
//               </Button>
//             </div>
            
//             <Form.Select
//               value={searchType}
//               onChange={handleSearchTypeChange}
//               style={{ width: "200px" }}
//             >
//               <option value="all">Tất cả</option>
//               <option value="employee">Theo nhân viên</option>
//             </Form.Select>

//             {searchType === "employee" && (
//               <Form.Select
//                 value={selectedEmployeeId}
//                 onChange={handleEmployeeChange}
//                 style={{ width: "250px" }}
//               >
//                 <option value="">Chọn nhân viên...</option>
//                 {employeeList.map((employee) => (
//                   <option key={employee.id} value={employee.id}>
//                     {employee.hoten} ({employee.id.trim()})
//                   </option>
//                 ))}
//               </Form.Select>
//             )}
//           </div>
//         </div>

//         {loading && (
//           <div className="text-center py-4">
//             <div className="spinner-border text-primary" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </div>
//           </div>
//         )}

//         {error && <div className="alert alert-danger">{error}</div>}

//         {searchType === "employee" && !selectedEmployeeId ? (
//           <div className="text-center py-4 text-muted">
//             <FaSearch className="me-2" />
//             Vui lòng chọn nhân viên để xem lịch sử
//           </div>
//         ) : searchType === "employee" && currentItems.length === 0 ? (
//           <div className="text-center py-4 text-muted">
//             Nhân viên này không có lịch sử thao tác
//           </div>
//         ) : currentItems.length === 0 ? (
//           <div className="text-center py-4 text-muted">
//             Không tìm thấy lịch sử thao tác nào
//           </div>
//         ) : (
//           <>
//             {renderView()}

//             {totalPages > 1 && (
//               <div className="mt-4 d-flex justify-content-center">
//                 <nav aria-label="Page navigation">
//                   <ul className="pagination">
//                     <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
//                       <button 
//                         className="page-link" 
//                         onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
//                       >
//                         &laquo;
//                       </button>
//                     </li>
                    
//                     {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                       let pageNum;
//                       if (totalPages <= 5) {
//                         pageNum = i + 1;
//                       } else if (currentPage <= 3) {
//                         pageNum = i + 1;
//                       } else if (currentPage >= totalPages - 2) {
//                         pageNum = totalPages - 4 + i;
//                       } else {
//                         pageNum = currentPage - 2 + i;
//                       }
//                       return (
//                         <li 
//                           key={pageNum} 
//                           className={`page-item ${currentPage === pageNum ? "active" : ""}`}
//                         >
//                           <button 
//                             className="page-link" 
//                             onClick={() => setCurrentPage(pageNum)}
//                           >
//                             {pageNum}
//                           </button>
//                         </li>
//                       );
//                     })}
                    
//                     <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
//                       <button 
//                         className="page-link" 
//                         onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
//                       >
//                         &raquo;
//                       </button>
//                     </li>
//                   </ul>
//                 </nav>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Detail Modal */}
//       <Modal
//         show={showDetailModal}
//         onHide={() => setShowDetailModal(false)}
//         size="lg"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Chi tiết lịch sử thao tác</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedLog && (
//             <div>
//               <ListGroup variant="flush">
//                 <ListGroup.Item>
//                   <FaClock className="me-2" />
//                   <strong>Thời gian:</strong> {formatDateTime(selectedLog.ngaygio)}
//                 </ListGroup.Item>
//                 <ListGroup.Item>
//                   <FaUser className="me-2" />
//                   <strong>Người thực hiện:</strong> {selectedLog.nguoithuchien.trim()}
//                 </ListGroup.Item>
//                 <ListGroup.Item>
//                   <FaTasks className="me-2" />
//                   <strong>Hành động:</strong> {translateAction(selectedLog.hanhdong)}
//                 </ListGroup.Item>
//                 <ListGroup.Item>
//                   <strong>Đối tượng:</strong> {translateObjectType(selectedLog.doituong)}
//                 </ListGroup.Item>
//               </ListGroup>
              
//               {selectedLog.hanhdong !== "LOGIN" && (
//                 <Row className="mt-3">
//                   <Col md={6}>
//                     <Card className="h-100">
//                       <Card.Header className="bg-light">
//                         <strong>Giá trị cũ</strong>
//                       </Card.Header>
//                       <Card.Body>
//                         <pre className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
//                           {selectedLog.giatriCu ? JSON.stringify(JSON.parse(selectedLog.giatriCu), null, 2) : "Không có"}
//                         </pre>
//                       </Card.Body>
//                     </Card>
//                   </Col>
//                   <Col md={6}>
//                     <Card className="h-100">
//                       <Card.Header className="bg-light">
//                         <strong>Giá trị mới</strong>
//                       </Card.Header>
//                       <Card.Body>
//                         <pre className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
//                           {selectedLog.giatriMoi ? JSON.stringify(JSON.parse(selectedLog.giatriMoi), null, 2) : "Không có"}
//                         </pre>
//                       </Card.Body>
//                     </Card>
//                   </Col>
//                 </Row>
//               )}
//             </div>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
//             Đóng
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default LichSu;


import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Badge,
  ListGroup,
  Card,
  Table,
} from "react-bootstrap";
import {
  FaHistory,
  FaUser,
  FaClock,
  FaTasks,
  FaSearch,
  FaThLarge,
  FaTh,
  FaTable,
  FaCalendarAlt,
  FaList,
} from "react-icons/fa";
import { fetchLog, fetchLogByNhanVienId, fetchNhanVien } from "../services/apiService";

const styles = `
  .lichsu-container {
    font-family: 'Roboto', sans-serif;
  }
  .view-mode-btn {
    transition: all 0.2s ease;
  }
  .view-mode-btn.active {
    background-color: #007bff !important;
    color: white !important;
  }
  .card-log {
    border-radius: 8px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .card-log:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }
  .card-log .card-body {
    padding: 1.5rem;
  }
  .table-log th, .table-log td {
    vertical-align: middle;
    padding: 1rem;
  }
  .table-log tr:hover {
    background-color: #f8f9fa;
  }
  .timeline {
    position: relative;
    padding: 20px 0;
  }
  .timeline-item {
    position: relative;
    margin-bottom: 2rem;
  }
  .timeline-item.left .timeline-content {
    margin-left: 30px;
  }
  .timeline-item.right .timeline-content {
    margin-right: 30px;
  }
  .timeline-dot {
    width: 12px;
    height: 12px;
    background-color: #007bff;
    border-radius: 50%;
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
  }
  .timeline-content {
    background: #fff;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    width: 45%;
  }
  .timeline-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  .timeline-action {
    font-weight: bold;
    color: #007bff;
  }
  .calendar-day {
    margin-bottom: 2rem;
  }
  .calendar-date-header {
    background: #007bff;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  .calendar-event {
    display: flex;
    margin-bottom: 1rem;
    background: #f8f9fa;
    border-radius: 4px;
    padding: 1rem;
  }
  .event-time {
    width: 80px;
    font-weight: bold;
    color: #495057;
  }
  .event-content {
    flex: 1;
  }
  .event-title {
    font-weight: bold;
    color: #007bff;
  }
  .grid-view {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  .grid-item {
    background: #fff;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    transition: transform 0.2s ease;
  }
  .grid-item:hover {
    transform: translateY(-4px);
  }
  .list-view {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .list-item {
    background: #fff;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .list-icon {
    font-size: 1.5rem;
    color: #007bff;
  }
  .detail-modal pre {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  .detail-modal .card {
    border: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  @media (max-width: 768px) {
    .timeline-content {
      width: 100%;
      margin: 0 !important;
    }
    .timeline-dot {
      left: 20px;
    }
    .grid-view {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  }
`;

const LichSu = () => {
  const [logList, setLogList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [searchType, setSearchType] = useState("all");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // 'cards', 'table', 'timeline', 'calendar', 'grid', 'list'

  const token = localStorage.getItem("token");

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

  const handleSearchTypeChange = (e) => {
    const type = e.target.value;
    setSearchType(type);
    setSelectedEmployeeId("");
    setCurrentPage(1);
    if (type === "all") {
      loadAllLogs();
    }
  };

  const handleEmployeeChange = (e) => {
    const maNV = e.target.value;
    setSelectedEmployeeId(maNV);
    setCurrentPage(1);
    if (maNV) {
      loadLogsByMaNV(maNV);
    }
  };

  const openDetailModal = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  useEffect(() => {
    loadAllLogs();
    loadEmployees();
  }, []);

  const totalPages = Math.ceil(logList.length / itemsPerPage);
  const currentItems = logList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    const [date, time] = dateTimeString.split(" ");
    return `${time} ${date}`;
  };

  const translateAction = (action) => {
    switch (action) {
      case "LOGIN": return "Đăng nhập hệ thống";
      case "UPDATE": return "Cập nhật thông tin";
      case "ADD_KHUYENMAI": return "Áp dụng khuyến mãi";
      case "REMOVE_KHUYENMAI": return "Gỡ khuyến mãi";
      default: return action;
    }
  };

  const translateObjectType = (type) => {
    switch (type) {
      case "SANPHAM": return "Sản phẩm";
      case "KHUYENMAI": return "Chương trình khuyến mãi";
      case "NHANVIEN": return "Nhân viên";
      default: return type;
    }
  };

  const parseLogDetails = (log) => {
    try {
      const oldValue = log.giatriCu ? JSON.parse(log.giatriCu) : null;
      const newValue = log.giatriMoi ? JSON.parse(log.giatriMoi) : null;
      switch (log.doituong) {
        case "SANPHAM":
          return (
            <div>
              <p><strong>Sản phẩm:</strong> {oldValue?.tensp || newValue?.tensp} ({oldValue?.id || newValue?.id})</p>
              {log.hanhdong === "UPDATE" && (
                <>
                  {oldValue?.imageurl !== newValue?.imageurl && (
                    <p>- {newValue?.imageurl ? "Thêm ảnh sản phẩm" : "Xóa ảnh sản phẩm"}</p>
                  )}
                  {oldValue?.tensp !== newValue?.tensp && (
                    <p>- Đổi tên sản phẩm: {oldValue?.tensp} → {newValue?.tensp}</p>
                  )}
                  {oldValue?.gia !== newValue?.gia && (
                    <p>- Đổi giá: {oldValue?.gia} → {newValue?.gia}</p>
                  )}
                </>
              )}
              {log.hanhdong === "ADD_KHUYENMAI" && (
                <p>- Áp dụng khuyến mãi: {newValue?.makm?.noidung} (Giảm {newValue?.makm?.phantram}%)</p>
              )}
              {log.hanhdong === "REMOVE_KHUYENMAI" && (
                <p>- Gỡ khuyến mãi: {oldValue?.makm?.noidung} (Giảm {oldValue?.makm?.phantram}%)</p>
              )}
            </div>
          );
        case "KHUYENMAI":
          return (
            <div>
              <p><strong>Chương trình:</strong> {oldValue?.noidung || newValue?.noidung} ({oldValue?.id || newValue?.id})</p>
              {oldValue?.phantram !== newValue?.phantram && (
                <p>- Thay đổi phần trăm giảm giá: {oldValue?.phantram}% → {newValue?.phantram}%</p>
              )}
              {(oldValue?.ngaybd !== newValue?.ngaybd || oldValue?.ngaykt !== newValue?.ngaykt) && (
                <p>- Thay đổi thời gian áp dụng: {oldValue?.ngaybd} - {oldValue?.ngaykt} → {newValue?.ngaybd} - {newValue?.ngaykt}</p>
              )}
            </div>
          );
        case "NHANVIEN":
          return (
            <div>
              <p><strong>Nhân viên:</strong> {oldValue?.hoten || newValue?.hoten} ({oldValue?.id || newValue?.id})</p>
            </div>
          );
        default:
          return null;
      }
    } catch (e) {
      return null;
    }
  };

  const groupLogs = (logs) => {
    const grouped = {};
    logs.forEach((log) => {
      const date = log.ngaygio.split(" ")[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(log);
    });
    return grouped;
  };

  const CardView = ({ logs }) => {
    const groupedLogs = groupLogs(logs);
    return (
      <>
        {Object.entries(groupedLogs).map(([date, logs]) => (
          <div key={date} className="mb-4">
            <h5 className="mb-3 text-primary">{date}</h5>
            {logs.map((log) => (
              <Card key={log.id} className="mb-3 shadow-sm card-log">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-2">{translateAction(log.hanhdong)}</h6>
                      <p className="mb-1 text-muted small">
                        <FaClock className="me-1" />
                        {formatDateTime(log.ngaygio)}
                      </p>
                      <p className="mb-1 text-muted small">
                        <FaUser className="me-1" />
                        {log.nguoithuchien.trim()}
                      </p>
                    </div>
                    <Badge
                      bg={
                        log.hanhdong === "LOGIN"
                          ? "success"
                          : log.hanhdong === "UPDATE"
                          ? "info"
                          : log.hanhdong.includes("KHUYENMAI")
                          ? "warning"
                          : "primary"
                      }
                      className="align-self-start"
                    >
                      {translateObjectType(log.doituong)}
                    </Badge>
                  </div>
                  <div className="mt-2">{parseLogDetails(log)}</div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="mt-2"
                    onClick={() => openDetailModal(log)}
                  >
                    Xem chi tiết
                  </Button>
                </Card.Body>
              </Card>
            ))}
          </div>
        ))}
      </>
    );
  };

  const TableView = ({ logs }) => {
    return (
      <div className="table-responsive">
        <Table hover className="table-log">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Hành động</th>
              <th>Đối tượng</th>
              <th>Người thực hiện</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{formatDateTime(log.ngaygio)}</td>
                <td>{translateAction(log.hanhdong)}</td>
                <td>{translateObjectType(log.doituong)}</td>
                <td>{log.nguoithuchien.trim()}</td>
                <td>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => openDetailModal(log)}
                  >
                    Xem
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  };

  const TimelineView = ({ logs }) => {
    return (
      <div className="timeline">
        {logs.map((log, index) => (
          <div
            key={log.id}
            className={`timeline-item ${index % 2 === 0 ? "left" : "right"}`}
          >
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <div className="timeline-header">
                <span className="timeline-time">{formatDateTime(log.ngaygio)}</span>
                <span className="timeline-action">{translateAction(log.hanhdong)}</span>
              </div>
              <div className="timeline-body">{parseLogDetails(log)}</div>
              <div className="timeline-footer">
                <Badge
                  bg={
                    log.hanhdong === "LOGIN"
                      ? "success"
                      : log.hanhdong === "UPDATE"
                      ? "info"
                      : log.hanhdong.includes("KHUYENMAI")
                      ? "warning"
                      : "primary"
                  }
                >
                  {translateObjectType(log.doituong)}
                </Badge>
                <span className="ms-2">{log.nguoithuchien.trim()}</span>
                <Button
                  variant="link"
                  size="sm"
                  className="ms-2"
                  onClick={() => openDetailModal(log)}
                >
                  Xem chi tiết
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const CalendarView = ({ logs }) => {
    const groupedByDate = groupLogs(logs);
    return (
      <div className="calendar-view">
        {Object.entries(groupedByDate).map(([date, dateLogs]) => (
          <div key={date} className="calendar-day">
            <div className="calendar-date-header">
              <h5>{date}</h5>
            </div>
            <div className="calendar-events">
              {dateLogs.map((log) => (
                <div key={log.id} className="calendar-event">
                  <div className="event-time">{log.ngaygio.split(" ")[1]}</div>
                  <div className="event-content">
                    <div className="event-title">{translateAction(log.hanhdong)}</div>
                    <div className="event-details">{parseLogDetails(log)}</div>
                    <div className="event-meta">
                      <Badge
                        bg={
                          log.hanhdong === "LOGIN"
                            ? "success"
                            : log.hanhdong === "UPDATE"
                            ? "info"
                            : log.hanhdong.includes("KHUYENMAI")
                            ? "warning"
                            : "primary"
                        }
                        className="me-2"
                      >
                        {translateObjectType(log.doituong)}
                      </Badge>
                      <span>{log.nguoithuchien.trim()}</span>
                      <Button
                        variant="link"
                        size="sm"
                        className="ms-2"
                        onClick={() => openDetailModal(log)}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const GridView = ({ logs }) => {
    return (
      <div className="grid-view">
        {logs.map((log) => (
          <div key={log.id} className="grid-item">
            <h6 className="mb-2">{translateAction(log.hanhdong)}</h6>
            <p className="mb-1 text-muted small">
              <FaClock className="me-1" />
              {formatDateTime(log.ngaygio)}
            </p>
            <p className="mb-1 text-muted small">
              <FaUser className="me-1" />
              {log.nguoithuchien.trim()}
            </p>
            <Badge
              bg={
                log.hanhdong === "LOGIN"
                  ? "success"
                  : log.hanhdong === "UPDATE"
                  ? "info"
                  : log.hanhdong.includes("KHUYENMAI")
                  ? "warning"
                  : "primary"
              }
              className="mb-2"
            >
              {translateObjectType(log.doituong)}
            </Badge>
            <div>{parseLogDetails(log)}</div>
            <Button
              variant="outline-primary"
              size="sm"
              className="mt-2"
              onClick={() => openDetailModal(log)}
            >
              Xem chi tiết
            </Button>
          </div>
        ))}
      </div>
    );
  };

  const ListView = ({ logs }) => {
    return (
      <div className="list-view">
        {logs.map((log) => (
          <div key={log.id} className="list-item">
            <FaTasks className="list-icon" />
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between">
                <strong>{translateAction(log.hanhdong)}</strong>
                <span className="text-muted small">{formatDateTime(log.ngaygio)}</span>
              </div>
              <p className="mb-1 text-muted small">
                <FaUser className="me-1" />
                {log.nguoithuchien.trim()}
              </p>
              <Badge
                bg={
                  log.hanhdong === "LOGIN"
                    ? "success"
                    : log.hanhdong === "UPDATE"
                    ? "info"
                    : log.hanhdong.includes("KHUYENMAI")
                    ? "warning"
                    : "primary"
                }
              >
                {translateObjectType(log.doituong)}
              </Badge>
              <div>{parseLogDetails(log)}</div>
            </div>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => openDetailModal(log)}
            >
              Xem
            </Button>
          </div>
        ))}
      </div>
    );
  };

  const renderView = () => {
    switch (viewMode) {
      case "table":
        return <TableView logs={currentItems} />;
      case "timeline":
        return <TimelineView logs={currentItems} />;
      case "calendar":
        return <CalendarView logs={currentItems} />;
      case "grid":
        return <GridView logs={currentItems} />;
      case "list":
        return <ListView logs={currentItems} />;
      default:
        return <CardView logs={currentItems} />;
    }
  };

  return (
    <div className="container-fluid p-0 position-relative d-flex flex-column min-vh-100 lichsu-container">
      <style>{styles}</style>
      <div className="p-4 flex-grow-1">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <h1 className="h3 mb-3 mb-md-0">Lịch sử thao tác</h1>
          <div className="d-flex gap-2 align-items-center">
            <div className="btn-group" role="group">
              <Button
                variant={viewMode === "cards" ? "primary" : "outline-secondary"}
                size="sm"
                onClick={() => setViewMode("cards")}
                title="Thẻ"
                className="view-mode-btn"
              >
                <FaThLarge />
              </Button>
              <Button
                variant={viewMode === "table" ? "primary" : "outline-secondary"}
                size="sm"
                onClick={() => setViewMode("table")}
                title="Bảng"
                className="view-mode-btn"
              >
                <FaTable />
              </Button>
              <Button
                variant={viewMode === "timeline" ? "primary" : "outline-secondary"}
                size="sm"
                onClick={() => setViewMode("timeline")}
                title="Dòng thời gian"
                className="view-mode-btn"
              >
                <FaHistory />
              </Button>
              <Button
                variant={viewMode === "calendar" ? "primary" : "outline-secondary"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                title="Lịch"
                className="view-mode-btn"
              >
                <FaCalendarAlt />
              </Button>
              <Button
                variant={viewMode === "grid" ? "primary" : "outline-secondary"}
                size="sm"
                onClick={() => setViewMode("grid")}
                title="Lưới"
                className="view-mode-btn"
              >
                <FaTh />
              </Button>
              <Button
                variant={viewMode === "list" ? "primary" : "outline-secondary"}
                size="sm"
                onClick={() => setViewMode("list")}
                title="Danh sách"
                className="view-mode-btn"
              >
                <FaList />
              </Button>
            </div>
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
                style={{ width: "250px" }}
              >
                <option value="">Chọn nhân viên...</option>
                {employeeList.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.hoten} ({employee.id.trim()})
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
          <div className="text-center py-4 text-muted">
            <FaSearch className="me-2" />
            Vui lòng chọn nhân viên để xem lịch sử
          </div>
        ) : searchType === "employee" && currentItems.length === 0 ? (
          <div className="text-center py-4 text-muted">
            Nhân viên này không có lịch sử thao tác
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-4 text-muted">
            Không tìm thấy lịch sử thao tác nào
          </div>
        ) : (
          <>
            {renderView()}
            {totalPages > 1 && (
              <div className="mt-4 d-flex justify-content-center">
                <nav aria-label="Page navigation">
                  <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      >
                        «
                      </button>
                    </li>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <li
                          key={pageNum}
                          className={`page-item ${currentPage === pageNum ? "active" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        </li>
                      );
                    })}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
        className="detail-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết lịch sử thao tác</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLog && (
            <div>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <FaClock className="me-2" />
                  <strong>Thời gian:</strong> {formatDateTime(selectedLog.ngaygio)}
                </ListGroup.Item>
                <ListGroup.Item>
                  <FaUser className="me-2" />
                  <strong>Người thực hiện:</strong> {selectedLog.nguoithuchien.trim()}
                </ListGroup.Item>
                <ListGroup.Item>
                  <FaTasks className="me-2" />
                  <strong>Hành động:</strong> {translateAction(selectedLog.hanhdong)}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Đối tượng:</strong> {translateObjectType(selectedLog.doituong)}
                </ListGroup.Item>
              </ListGroup>
              {selectedLog.hanhdong !== "LOGIN" && (
                <Row className="mt-3">
                  <Col md={6}>
                    <Card className="h-100">
                      <Card.Header className="bg-light">
                        <strong>Giá trị cũ</strong>
                      </Card.Header>
                      <Card.Body>
                        {parseLogDetails(selectedLog) || (
                          <pre style={{ whiteSpace: "pre-wrap" }}>
                            {selectedLog.giatriCu
                              ? JSON.stringify(JSON.parse(selectedLog.giatriCu), null, 2)
                              : "Không có"}
                          </pre>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="h-100">
                      <Card.Header className="bg-light">
                        <strong>Giá trị mới</strong>
                      </Card.Header>
                      <Card.Body>
                        {parseLogDetails(selectedLog) || (
                          <pre style={{ whiteSpace: "pre-wrap" }}>
                            {selectedLog.giatriMoi
                              ? JSON.stringify(JSON.parse(selectedLog.giatriMoi), null, 2)
                              : "Không có"}
                          </pre>
                        )}
                      </Card.Body>
                    </Card>
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