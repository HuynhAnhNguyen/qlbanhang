// import React, { useState, useEffect } from "react";
// import { Modal, Button, Form } from "react-bootstrap";
// import {
//   fetchMembers,
//   createMember,
//   updateMember,
//   deleteMember,
//   uploadMemberImage,
// } from "../services/apiService";
// import Swal from "sweetalert2";

// const MemberManagement = () => {
//   const [members, setMembers] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const itemsPerPage = 10; // Hiển thị 10 đảng viên mỗi trang

//   // Modal states
//   const [showDetailModal, setShowDetailModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedMember, setSelectedMember] = useState(null);
//   const [selectedFile, setSelectedFile] = useState(null);

//   // Form data với tất cả các trường mới
//   const [formData, setFormData] = useState({
//     hoten: "",
//     ngaysinh: "",
//     gioitinh: "",
//     quequan: "",
//     dantoc: "",
//     trinhdovanhoa: "",
//     noihiennay: "",
//     chuyennmon: "",
//     ngayvaodang: "",
//     ngaychinhthuc: "",
//     nguoigioithieu1: "",
//     nguoigioithieu2: "",
//     chucvuchinhquyen: "",
//     chucvuchibo: "",
//     chucvudanguy: "",
//     chucvudoanthe: "",
//     noisinhhoatdang: "",
//     chucdanh: "",
//     trinhdongoaingu: "",
//     trinhdochinhtri: "",
//     trangthaidangvien: "",
//     imageUrl: "",
//   });

//   // Get token from localStorage
//   const token = localStorage.getItem("token");

//   // Fetch members from API
//   const loadMembers = async () => {
//     setLoading(true);
//     try {
//       const response = await fetchMembers(token);
//       setMembers(Array.isArray(response.data) ? response.data : []);
//       setError(null);
//     } catch (err) {
//       setError("Không thể tải danh sách đảng viên");
//       console.error("Error loading members:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadMembers();
//   }, []);

//   // Handle file selection
//   const handleFileChange = (e) => {
//     setSelectedFile(e.target.files[0]);
//   };

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // Handle add member
//   const handleAddMember = async () => {
//     try {
//       setLoading(true);
//       // Kiểm tra các trường bắt buộc
//       const requiredFields = [
//         "hoten",
//         "ngaysinh",
//         "gioitinh",
//         "quequan",
//         "dantoc",
//         "trinhdovanhoa",
//         "noihiennay",
//         "chuyennmon",
//         "ngayvaodang",
//         "ngaychinhthuc",
//         "nguoigioithieu1",
//         "nguoigioithieu2",
//         "chucvuchinhquyen",
//         "chucvuchibo",
//         "chucvudanguy",
//         "chucvudoanthe",
//         "noisinhhoatdang",
//         "chucdanh",
//         "trinhdongoaingu",
//         "trinhdochinhtri",
//         "trangthaidangvien",
//       ];
//       const missingFields = requiredFields.filter((field) => !formData[field]);
//       if (missingFields.length > 0) {
//         throw new Error(`Vui lòng điền đầy đủ các trường: ${missingFields.join(", ")}`);
//       }

//       let imageUrl = formData.imageUrl;
//       if (selectedFile) {
//         const uploadedFile = await uploadMemberImage(token, selectedFile);
//         imageUrl = uploadedFile.data; // Giả sử API trả về { data: "image-url" }
//       }

//       const newMember = await createMember(token, {
//         hoten: formData.hoten,
//         ngaysinh: formData.ngaysinh,
//         gioitinh: formData.gioitinh,
//         quequan: formData.quequan,
//         dantoc: formData.dantoc,
//         trinhdovanhoa: formData.trinhdovanhoa,
//         noihiennay: formData.noihiennay,
//         chuyennmon: formData.chuyennmon,
//         ngayvaodang: formData.ngayvaodang,
//         ngaychinhthuc: formData.ngaychinhthuc,
//         nguoigioithieu1: formData.nguoigioithieu1,
//         nguoigioithieu2: formData.nguoigioithieu2,
//         chucvuchinhquyen: formData.chucvuchinhquyen,
//         chucvuchibo: formData.chucvuchibo,
//         chucvudanguy: formData.chucvudanguy,
//         chucvudoanthe: formData.chucvudoanthe,
//         noisinhhoatdang: formData.noisinhhoatdang,
//         chucdanh: formData.chucdanh,
//         trinhdongoaingu: formData.trinhdongoaingu,
//         trinhdochinhtri: formData.trinhdochinhtri,
//         trangthaidangvien: formData.trangthaidangvien,
//         imageUrl,
//       });

//       setMembers([...members, newMember.data]); // Giả sử API trả về { data: {...} }
//       setShowAddModal(false);
//       Swal.fire("Thành công!", "Thêm đảng viên thành công", "success");
//     } catch (err) {
//       Swal.fire("Lỗi!", err.message || "Thêm đảng viên thất bại", "error");
//       console.error("Error adding member:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle update member
//   const handleUpdateMember = async () => {
//     try {
//       setLoading(true);
//       const requiredFields = [
//         "hoten",
//         "ngaysinh",
//         "gioitinh",
//         "quequan",
//         "dantoc",
//         "trinhdovanhoa",
//         "noihiennay",
//         "chuyennmon",
//         "ngayvaodang",
//         "ngaychinhthuc",
//         "nguoigioithieu1",
//         "nguoigioithieu2",
//         "chucvuchinhquyen",
//         "chucvuchibo",
//         "chucvudanguy",
//         "chucvudoanthe",
//         "noisinhhoatdang",
//         "chucdanh",
//         "trinhdongoaingu",
//         "trinhdochinhtri",
//         "trangthaidangvien",
//       ];
//       const missingFields = requiredFields.filter((field) => !formData[field]);
//       if (missingFields.length > 0) {
//         throw new Error(`Vui lòng điền đầy đủ các trường: ${missingFields.join(", ")}`);
//       }

//       let imageUrl = formData.imageUrl;
//       if (selectedFile) {
//         const uploadedFile = await uploadMemberImage(token, selectedFile);
//         imageUrl = uploadedFile.data;
//       }

//       const updatedMember = await updateMember(token, selectedMember.id, {
//         hoten: formData.hoten,
//         ngaysinh: formData.ngaysinh,
//         gioitinh: formData.gioitinh,
//         quequan: formData.quequan,
//         dantoc: formData.dantoc,
//         trinhdovanhoa: formData.trinhdovanhoa,
//         noihiennay: formData.noihiennay,
//         chuyennmon: formData.chuyennmon,
//         ngayvaodang: formData.ngayvaodang,
//         ngaychinhthuc: formData.ngaychinhthuc,
//         nguoigioithieu1: formData.nguoigioithieu1,
//         nguoigioithieu2: formData.nguoigioithieu2,
//         chucvuchinhquyen: formData.chucvuchinhquyen,
//         chucvuchibo: formData.chucvuchibo,
//         chucvudanguy: formData.chucvudanguy,
//         chucvudoanthe: formData.chucvudoanthe,
//         noisinhhoatdang: formData.noisinhhoatdang,
//         chucdanh: formData.chucdanh,
//         trinhdongoaingu: formData.trinhdongoaingu,
//         trinhdochinhtri: formData.trinhdochinhtri,
//         trangthaidangvien: formData.trangthaidangvien,
//         imageUrl,
//       });

//       setMembers(
//         members.map((item) =>
//           item.id === selectedMember.id ? updatedMember.data : item
//         )
//       );
//       setShowEditModal(false);
//       Swal.fire("Thành công!", "Cập nhật đảng viên thành công", "success");
//     } catch (err) {
//       Swal.fire("Lỗi!", "Cập nhật đảng viên thất bại", "error");
//       console.error("Error updating member:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle delete member
//   const handleDeleteMember = async () => {
//     try {
//       setLoading(true);
//       await deleteMember(token, selectedMember.id);
//       setMembers(members.filter((item) => item.id !== selectedMember.id));
//       setShowDeleteModal(false);
//       Swal.fire("Thành công!", "Xóa đảng viên thành công", "success");
//     } catch (err) {
//       Swal.fire("Lỗi!", "Xóa đảng viên thất bại", "error");
//       console.error("Error deleting member:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Pagination and search
//   const filteredMembers = Array.isArray(members)
//     ? members.filter(
//         (item) =>
//           (typeof item.hoten === "string" &&
//             item.hoten.toLowerCase().includes(searchTerm.toLowerCase())) ||
//           (typeof item.chucvuchibo === "string" &&
//             item.chucvuchibo.toLowerCase().includes(searchTerm.toLowerCase())) ||
//           (typeof item.noisinhhoatdang === "string" &&
//             item.noisinhhoatdang.toLowerCase().includes(searchTerm.toLowerCase()))
//       )
//     : [];

//   const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
//   const currentItems = filteredMembers.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   // Reset form when opening add modal
//   const openAddModal = () => {
//     setFormData({
//       hoten: "",
//       ngaysinh: "",
//       gioitinh: "",
//       quequan: "",
//       dantoc: "",
//       trinhdovanhoa: "",
//       noihiennay: "",
//       chuyennmon: "",
//       ngayvaodang: "",
//       ngaychinhthuc: "",
//       nguoigioithieu1: "",
//       nguoigioithieu2: "",
//       chucvuchinhquyen: "",
//       chucvuchibo: "",
//       chucvudanguy: "",
//       chucvudoanthe: "",
//       noisinhhoatdang: "",
//       chucdanh: "",
//       trinhdongoaingu: "",
//       trinhdochinhtri: "",
//       trangthaidangvien: "",
//       imageUrl: "",
//     });
//     setSelectedFile(null);
//     setShowAddModal(true);
//   };

//   // Open edit modal with selected member data
//   const openEditModal = (member) => {
//     setSelectedMember(member);
//     setFormData({
//       hoten: member.hoten || "",
//       ngaysinh: member.ngaysinh || "",
//       gioitinh: member.gioitinh || "",
//       quequan: member.quequan || "",
//       dantoc: member.dantoc || "",
//       trinhdovanhoa: member.trinhdovanhoa || "",
//       noihiennay: member.noihiennay || "",
//       chuyennmon: member.chuyennmon || "",
//       ngayvaodang: member.ngayvaodang || "",
//       ngaychinhthuc: member.ngaychinhthuc || "",
//       nguoigioithieu1: member.nguoigioithieu1 || "",
//       nguoigioithieu2: member.nguoigioithieu2 || "",
//       chucvuchinhquyen: member.chucvuchinhquyen || "",
//       chucvuchibo: member.chucvuchibo || "",
//       chucvudanguy: member.chucvudanguy || "",
//       chucvudoanthe: member.chucvudoanthe || "",
//       noisinhhoatdang: member.noisinhhoatdang || "",
//       chucdanh: member.chucdanh || "",
//       trinhdongoaingu: member.trinhdongoaingu || "",
//       trinhdochinhtri: member.trinhdochinhtri || "",
//       trangthaidangvien: member.trangthaidangvien || "",
//       imageUrl: member.imageUrl || "",
//     });
//     setSelectedFile(null);
//     setShowEditModal(true);
//   };

//   return (
//     <div className="container-fluid p-0 position-relative d-flex flex-column min-vh-100">
//       {/* Main content */}
//       <div className="p-4 flex-grow-1">
//         <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
//           <h1 className="h3 mb-3 mb-md-0">Quản lý Đảng viên</h1>
//           <div className="d-flex gap-2">
//             <div className="d-flex" style={{ width: "100%", maxWidth: "400px" }}>
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Tìm kiếm đảng viên..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
//               />
//               <button
//                 className="btn btn-primary"
//                 style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
//               >
//                 <i className="fas fa-search"></i>
//               </button>
//             </div>
//             <button className="btn btn-success" onClick={openAddModal}>
//               <i className="fas fa-plus me-2"></i>Thêm mới
//             </button>
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

//         {/* Members table or no data message */}
//         {filteredMembers.length === 0 && !loading ? (
//           <div className="alert alert-info text-center">
//             Không có đảng viên
//           </div>
//         ) : (
//           <div className="table-responsive mb-4">
//             <table className="table table-hover">
//               <thead className="table-light">
//                 <tr>
//                   <th style={{ width: "5%" }}>STT</th>
//                   <th style={{ width: "15%" }}>Ảnh</th>
//                   <th style={{ width: "25%" }}>Họ tên</th>
//                   <th style={{ width: "25%" }}>Chức vụ</th>
//                   <th style={{ width: "20%" }}>Chi bộ</th>
//                   <th style={{ width: "10%" }}>Thao tác</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentItems.map((item, index) => (
//                   <tr key={item.id}>
//                     <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
//                     <td>
//                       <img
//                         src={`http://3.104.77.30:8080/api/v1/project/file/getImage/${item.imageUrl}`}
//                         alt="Đảng viên"
//                         className="img-thumbnail"
//                         style={{
//                           width: "80px",
//                           height: "60px",
//                           objectFit: "cover",
//                         }}
//                       />
//                     </td>
//                     <td>{item.hoten}</td>
//                     <td>{item.chucvuchibo}</td>
//                     <td>{item.noisinhhoatdang}</td>
//                     <td>
//                       <div className="d-flex gap-1">
//                         <Button
//                           variant="outline-primary"
//                           size="sm"
//                           onClick={() => {
//                             setSelectedMember(item);
//                             setShowDetailModal(true);
//                           }}
//                           title="Xem chi tiết"
//                         >
//                           <i className="fas fa-eye"></i>
//                         </Button>
//                         <Button
//                           variant="outline-warning"
//                           size="sm"
//                           onClick={() => openEditModal(item)}
//                           title="Chỉnh sửa"
//                         >
//                           <i className="fas fa-edit"></i>
//                         </Button>
//                         <Button
//                           variant="outline-danger"
//                           size="sm"
//                           onClick={() => {
//                             setSelectedMember(item);
//                             setShowDeleteModal(true);
//                           }}
//                           title="Xóa"
//                         >
//                           <i className="fas fa-trash"></i>
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Pagination - Fixed near footer */}
//       {filteredMembers.length > 0 && (
//         <div className="mt-auto p-3 bg-light border-top">
//           <nav aria-label="Page navigation">
//             <ul className="pagination justify-content-center mb-0">
//               <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                   disabled={currentPage === 1}
//                 >
//                   « Trước
//                 </button>
//               </li>
//               {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                 <li
//                   key={page}
//                   className={`page-item ${page === currentPage ? "active" : ""}`}
//                 >
//                   <button
//                     className="page-link"
//                     onClick={() => setCurrentPage(page)}
//                   >
//                     {page}
//                   </button>
//                 </li>
//               ))}
//               <li
//                 className={`page-item ${
//                   currentPage === totalPages ? "disabled" : ""
//                 }`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() =>
//                     setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//                   }
//                   disabled={currentPage === totalPages}
//                 >
//                   Tiếp »
//                 </button>
//               </li>
//             </ul>
//           </nav>
//         </div>
//       )}

//       {/* Detail Modal */}
//       <Modal
//         show={showDetailModal}
//         onHide={() => setShowDetailModal(false)}
//         size="lg"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Thông tin đảng viên</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedMember && (
//             <div className="row">
//               <div className="col-md-4 text-center">
//                 <img
//                   src={`http://3.104.77.30:8080/api/v1/project/file/getImage/${selectedMember.imageUrl}`}
//                   alt="Đảng viên"
//                   className="img-fluid rounded mb-3"
//                   style={{ maxHeight: "300px" }}
//                 />
//               </div>
//               <div className="col-md-8">
//                 <h4>{selectedMember.hoten}</h4>
//                 <p className="text-muted">
//                   <strong>Ngày sinh:</strong> {selectedMember.ngaysinh}
//                 </p>
//                 <p className="text-muted">
//                   <strong>Giới tính:</strong> {selectedMember.gioitinh}
//                 </p>
//                 <p className="text-muted">
//                   <strong>Quê quán:</strong> {selectedMember.quequan}
//                 </p>
//                 <p className="text-muted">
//                   <strong>Dân tộc:</strong> {selectedMember.dantoc}
//                 </p>
//                 <p className="text-muted">
//                   <strong>Trình độ văn hóa:</strong> {selectedMember.trinhdovanhoa}
//                 </p>
//                 <p className="text-muted">
//                   <strong>Nơi ở hiện nay:</strong> {selectedMember.noihiennay}
//                 </p>
//                 <p className="text-muted">
//                   <strong>Chuyên môn:</strong> {selectedMember.chuyennmon}
//                 </p>
//                 <p className="text-muted">
//                   <strong>Ngày vào Đảng:</strong> {selectedMember.ngayvaodang}
//                 </p>
//                 <p className="text-muted">
//                   <strong>Ngày chính thức:</strong> {selectedMember.ngaychinhthuc}
//                 </p>
//                 <p className="text-muted">
//                   <strong>Người giới thiệu 1:</strong> {selectedMember.nguoigioithieu1}
//                 </p>
//                 <p className="text-muted">
//                   <strong>Người giới thiệu 2:</strong> {selectedMember.nguoigioithieu2}
//                 </p>
//                 <p className="text-muted">
//                   <strong>Chức vụ chính quyền:</strong> {selectedMember.chucvuchinhquyen}
//                 </p>
//                 <p className="text-muted">
//                   <strong>Chức vụ chi bộ:</strong> {selectedMember.chucvuchibo}
//                 </p>
//                 <p className="text-muted">
//                   <strong>Chức vụ đảng ủy:</strong> {selectedMember.chucvudanguy}
//                 </p>
//                 <p className="text-muted">
//                   <strong>Chức vụ đoàn thể:</strong> {selectedMember.chucvudoanthe}
//                 </p>
//                 <p className="text-muted">
//                   <strong>Nơi sinh hoạt Đảng:</strong> {selectedMember.noisinhhoatdang}
//                 </p>
//                 <p className="text-muted">
//                   <strong>Chức danh:</strong> {selectedMember.chucdanh}
//                 </p>
//                 <p className="text-muted">
//                   <strong>Trình độ ngoại ngữ:</strong> {selectedMember.trinhdongoaingu}
//                 </p>
//                 <p className="text-muted">
//                   <strong>Trình độ chính trị:</strong> {selectedMember.trinhdochinhtri}
//                 </p>
//                 <p className="text-muted">
//                   <strong>Trạng thái đảng viên:</strong> {selectedMember.trangthaidangvien}
//                 </p>
//               </div>
//             </div>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
//             Đóng
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Add Modal */}
//       <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>Thêm đảng viên mới</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-3">
//               <Form.Label>Họ và tên</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="hoten"
//                 value={formData.hoten}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Ngày sinh</Form.Label>
//               <Form.Control
//                 type="date"
//                 name="ngaysinh"
//                 value={formData.ngaysinh}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Giới tính</Form.Label>
//               <Form.Control
//                 as="select"
//                 name="gioitinh"
//                 value={formData.gioitinh}
//                 onChange={handleInputChange}
//                 required
//               >
//                 <option value="">Chọn giới tính</option>
//                 <option value="Nam">Nam</option>
//                 <option value="Nữ">Nữ</option>
//               </Form.Control>
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Quê quán</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="quequan"
//                 value={formData.quequan}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Dân tộc</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="dantoc"
//                 value={formData.dantoc}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Trình độ văn hóa</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="trinhdovanhoa"
//                 value={formData.trinhdovanhoa}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Nơi ở hiện nay</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="noihiennay"
//                 value={formData.noihiennay}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Chuyên môn</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="chuyennmon"
//                 value={formData.chuyennmon}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Ngày vào Đảng</Form.Label>
//               <Form.Control
//                 type="date"
//                 name="ngayvaodang"
//                 value={formData.ngayvaodang}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Ngày chính thức</Form.Label>
//               <Form.Control
//                 type="date"
//                 name="ngaychinhthuc"
//                 value={formData.ngaychinhthuc}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Người giới thiệu 1</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="nguoigioithieu1"
//                 value={formData.nguoigioithieu1}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Người giới thiệu 2</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="nguoigioithieu2"
//                 value={formData.nguoigioithieu2}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Chức vụ chính quyền</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="chucvuchinhquyen"
//                 value={formData.chucvuchinhquyen}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Chức vụ chi bộ</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="chucvuchibo"
//                 value={formData.chucvuchibo}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Chức vụ đảng ủy</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="chucvudanguy"
//                 value={formData.chucvudanguy}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Chức vụ đoàn thể</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="chucvudoanthe"
//                 value={formData.chucvudoanthe}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Nơi sinh hoạt Đảng</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="noisinhhoatdang"
//                 value={formData.noisinhhoatdang}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Chức danh</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="chucdanh"
//                 value={formData.chucdanh}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Trình độ ngoại ngữ</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="trinhdongoaingu"
//                 value={formData.trinhdongoaingu}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Trình độ chính trị</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="trinhdochinhtri"
//                 value={formData.trinhdochinhtri}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Trạng thái đảng viên</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="trangthaidangvien"
//                 value={formData.trangthaidangvien}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Ảnh đại diện</Form.Label>
//               <Form.Control type="file" onChange={handleFileChange} />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowAddModal(false)}>
//             Hủy
//           </Button>
//           <Button variant="primary" onClick={handleAddMember} disabled={loading}>
//             {loading ? "Đang xử lý..." : "Thêm mới"}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Edit Modal */}
//       <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>Chỉnh sửa thông tin đảng viên</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-3">
//               <Form.Label>Họ và tên</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="hoten"
//                 value={formData.hoten}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Ngày sinh</Form.Label>
//               <Form.Control
//                 type="date"
//                 name="ngaysinh"
//                 value={formData.ngaysinh}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Giới tính</Form.Label>
//               <Form.Control
//                 as="select"
//                 name="gioitinh"
//                 value={formData.gioitinh}
//                 onChange={handleInputChange}
//                 required
//               >
//                 <option value="">Chọn giới tính</option>
//                 <option value="Nam">Nam</option>
//                 <option value="Nữ">Nữ</option>
//               </Form.Control>
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Quê quán</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="quequan"
//                 value={formData.quequan}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Dân tộc</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="dantoc"
//                 value={formData.dantoc}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Trình độ văn hóa</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="trinhdovanhoa"
//                 value={formData.trinhdovanhoa}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Nơi ở hiện nay</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="noihiennay"
//                 value={formData.noihiennay}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Chuyên môn</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="chuyennmon"
//                 value={formData.chuyennmon}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Ngày vào Đảng</Form.Label>
//               <Form.Control
//                 type="date"
//                 name="ngayvaodang"
//                 value={formData.ngayvaodang}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Ngày chính thức</Form.Label>
//               <Form.Control
//                 type="date"
//                 name="ngaychinhthuc"
//                 value={formData.ngaychinhthuc}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Người giới thiệu 1</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="nguoigioithieu1"
//                 value={formData.nguoigioithieu1}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Người giới thiệu 2</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="nguoigioithieu2"
//                 value={formData.nguoigioithieu2}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Chức vụ chính quyền</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="chucvuchinhquyen"
//                 value={formData.chucvuchinhquyen}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Chức vụ chi bộ</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="chucvuchibo"
//                 value={formData.chucvuchibo}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Chức vụ đảng ủy</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="chucvudanguy"
//                 value={formData.chucvudanguy}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Chức vụ đoàn thể</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="chucvudoanthe"
//                 value={formData.chucvudoanthe}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Nơi sinh hoạt Đảng</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="noisinhhoatdang"
//                 value={formData.noisinhhoatdang}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Chức danh</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="chucdanh"
//                 value={formData.chucdanh}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Trình độ ngoại ngữ</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="trinhdongoaingu"
//                 value={formData.trinhdongoaingu}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Trình độ chính trị</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="trinhdochinhtri"
//                 value={formData.trinhdochinhtri}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Trạng thái đảng viên</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="trangthaidangvien"
//                 value={formData.trangthaidangvien}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Ảnh đại diện</Form.Label>
//               <Form.Control type="file" onChange={handleFileChange} />
//               {formData.imageUrl && !selectedFile && (
//                 <div className="mt-2">
//                   <img
//                     src={`http://3.104.77.30:8080/api/v1/project/file/getImage/${formData.imageUrl}`}
//                     alt="Preview"
//                     className="img-thumbnail"
//                     style={{ maxHeight: "100px" }}
//                   />
//                 </div>
//               )}
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowEditModal(false)}>
//             Hủy
//           </Button>
//           <Button
//             variant="primary"
//             onClick={handleUpdateMember}
//             disabled={loading}
//           >
//             {loading ? "Đang xử lý..." : "Lưu thay đổi"}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Delete Modal */}
//       <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Xác nhận xóa</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedMember && (
//             <p>
//               Bạn có chắc chắn muốn xóa đảng viên{" "}
//               <strong>{selectedMember.hoten}</strong>?
//             </p>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
//             Hủy
//           </Button>
//           <Button
//             variant="danger"
//             onClick={handleDeleteMember}
//             disabled={loading}
//           >
//             {loading ? "Đang xử lý..." : "Xóa"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default MemberManagement;