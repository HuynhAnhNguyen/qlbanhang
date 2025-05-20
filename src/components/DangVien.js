import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Tabs,
  Tab,
  Accordion,
} from "react-bootstrap";
import Swal from "sweetalert2";
import {
  createDangVien,
  fetchChiBoDangHoatDong,
  fetchDangVien,
  updateDangVien,
  fetchTheDang,
  createTheDang,
  updateTheDang,
  deleteTheDang,
} from "../services/apiService";

const DangVien = () => {
  const [dangVien, setDangVien] = useState([]);
  const [chiBoList, setChiBoList] = useState([]); // Danh sách chi bộ
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("all"); // Loại tìm kiếm: all, approved, chibo
  const [selectedChiBoId, setSelectedChiBoId] = useState(""); // Chi bộ để tìm kiếm
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const itemsPerPage = 10;

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDangVien, setSelectedDangVien] = useState(null);

  // Thêm state
  const [showTheDangModal, setShowTheDangModal] = useState(false);
  const [theDangData, setTheDangData] = useState(null);
  const [showAddTheDangForm, setShowAddTheDangForm] = useState(false);
  const [theDangFormData, setTheDangFormData] = useState({
    mathe: "",
    ngaycap: new Date().toISOString().split("T")[0],
    noicapthe: "",
  });

  // Hàm mở modal thẻ Đảng
  const openTheDangModal = async (dangVienItem) => {
    setSelectedDangVien(dangVienItem);
    // setLoading(true);
    try {
      const response = await fetchTheDang(token, dangVienItem.id);
      if (response.resultCode === 0) {
        setTheDangData(response.data || null);
        setShowAddTheDangForm(response.data === null); // Hiển thị form nếu không có thẻ
        setTheDangFormData({
          mathe: response.data?.mathe || "",
          ngaycap:
            response.data?.ngaycap || new Date().toISOString().split("T")[0],
          noicapthe: response.data?.noicapthe || "",
        });
      } else {
        throw new Error(response.message || "Không thể tải thông tin thẻ Đảng");
      }
      setShowTheDangModal(true);
    } catch (error) {
      console.error("Error fetching theDang:", error);
      Swal.fire("Lỗi", "Không thể tải thông tin thẻ Đảng", "error");
      setTheDangData(null);
      setShowAddTheDangForm(true); // Hiển thị form nếu lỗi
      setTheDangFormData({
        mathe: "",
        ngaycap: new Date().toISOString().split("T")[0],
        noicapthe: "",
      });
      setShowTheDangModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Hàm tạo thẻ Đảng
  const handleCreateTheDang = async () => {
    if (!theDangFormData.mathe || !theDangFormData.noicapthe) {
      Swal.fire("Lỗi", "Vui lòng điền đầy đủ thông tin thẻ Đảng", "error");
      return;
    }
    try {
      // setLoading(true);
      const response = await createTheDang(
        token,
        selectedDangVien.id,
        theDangFormData
      );
      if (response.resultCode === 0) {
        setTheDangData(response.data);
        setShowAddTheDangForm(false);
        Swal.fire("Thành công", "Thêm thẻ Đảng thành công", "success");
      } else {
        Swal.fire("Thất bại", response.message, "error");
      }
      // else {
      //   throw new Error(response.message || "Thêm thẻ Đảng thất bại");
      // }
    } catch (error) {
      Swal.fire(
        "Lỗi",
        error.message || "Đã xảy ra lỗi khi thêm thẻ Đảng",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Hàm xóa thẻ Đảng
  const handleDeleteTheDang = async () => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn có chắc chắn muốn xóa thẻ Đảng này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await deleteTheDang(token, theDangData.thedangId);
        if (response.resultCode === 0) {
          setTheDangData(null);
          setShowAddTheDangForm(true); // Hiển thị form sau khi xóa
          Swal.fire("Đã xóa", "Thẻ Đảng đã được xóa", "success");
        } else {
          throw new Error(response.message || "Xóa thẻ Đảng thất bại");
        }
      } catch (error) {
        Swal.fire("Lỗi", "Xóa thẻ Đảng thất bại", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // Hàm cập nhật thẻ Đảng
  const handleUpdateTheDang = async () => {
    if (!theDangFormData.mathe || !theDangFormData.noicapthe) {
      Swal.fire("Lỗi", "Vui lòng điền đầy đủ thông tin thẻ Đảng", "error");
      return;
    }
    try {
      // setLoading(true);
      const response = await updateTheDang(
        token,
        theDangData.thedangId,
        theDangFormData
      );
      if (response.resultCode === 0) {
        setTheDangData({
          id: response.data.thedangId || response.data.id,
          mathe: response.data.mathe,
          ngaycap: response.data.ngaycap,
          noicapthe: response.data.noicapthe,
        });
        setShowAddTheDangForm(false);
        Swal.fire("Thành công", "Cập nhật thẻ Đảng thành công", "success");
      } else {
        throw new Error(response.message || "Cập nhật thẻ Đảng thất bại");
      }
    } catch (error) {
      Swal.fire("Lỗi", "Cập nhật thẻ Đảng thất bại", "error");
    } finally {
      setLoading(false);
    }
  };

  // Form data
  const [formData, setFormData] = useState({
    hoten: "",
    ngaysinh: "",
    gioitinh: "",
    quequan: "",
    dantoc: "",
    trinhdovanhoa: "",
    noihiennay: "",
    chuyennmon: "",
    ngayvaodang: "",
    ngaychinhthuc: "",
    nguoigioithieu1: "",
    nguoigioithieu2: "",
    chucvuchinhquyen: "",
    chucvuchibo: "",
    chucvudanguy: "",
    chucvudoanthe: "",
    noisinhhoatdang: "",
    chucdanh: "",
    trinhdongoaingu: "",
    trinhdochinhtri: "",
    trangthaidangvien: "",
    chiboId: "", // Thêm trường chiboId
  });

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Validate form data
  const validateForm = () => {
    const errors = {};

    // hoten
    if (!formData.hoten.trim()) {
      errors.hoten = "Họ và tên là bắt buộc";
    } else if (formData.hoten.length < 2) {
      errors.hoten = "Họ và tên phải có ít nhất 2 ký tự";
    } else if (formData.hoten.length > 50) {
      errors.hoten = "Họ và tên không được vượt quá 50 ký tự";
    }

    // ngaysinh
    if (!formData.ngaysinh) {
      errors.ngaysinh = "Ngày sinh là bắt buộc";
    } else {
      const today = new Date();
      const selectedDate = new Date(formData.ngaysinh);
      if (selectedDate > today) {
        errors.ngaysinh = "Ngày sinh không được là ngày trong tương lai";
      }
    }

    // gioitinh
    if (!formData.gioitinh) {
      errors.gioitinh = "Giới tính là bắt buộc";
    }

    // quequan
    if (formData.quequan && formData.quequan.length > 200) {
      errors.quequan = "Quê quán không được vượt quá 200 ký tự";
    }

    // dantoc
    if (formData.dantoc && formData.dantoc.length > 50) {
      errors.dantoc = "Dân tộc không được vượt quá 50 ký tự";
    }

    // trinhdovanhoa
    if (formData.trinhdovanhoa && formData.trinhdovanhoa.length > 100) {
      errors.trinhdovanhoa = "Trình độ văn hóa không được vượt quá 100 ký tự";
    }

    // noihiennay
    if (formData.noihiennay && formData.noihiennay.length > 200) {
      errors.noihiennay = "Nơi ở hiện nay không được vượt quá 200 ký tự";
    }

    // chuyennmon
    if (formData.chuyennmon && formData.chuyennmon.length > 100) {
      errors.chuyennmon = "Chuyên môn không được vượt quá 100 ký tự";
    }

    // ngayvaodang
    if (!formData.ngayvaodang) {
      errors.ngayvaodang = "Ngày vào Đảng là bắt buộc";
    } else {
      const today = new Date();
      const selectedDate = new Date(formData.ngayvaodang);
      if (selectedDate > today) {
        errors.ngayvaodang = "Ngày vào Đảng không được là ngày trong tương lai";
      }
    }

    // ngaychinhthuc
    if (formData.ngaychinhthuc) {
      const selectedDate = new Date(formData.ngaychinhthuc);
      const ngayVaoDang = new Date(formData.ngayvaodang);
      if (selectedDate < ngayVaoDang) {
        errors.ngaychinhthuc = "Ngày chính thức phải sau ngày vào Đảng";
      }
    }

    // trangthaidangvien
    if (!formData.trangthaidangvien) {
      errors.trangthaidangvien = "Trạng thái Đảng viên là bắt buộc";
    } else if (
      !["chinhthuc", "dubi", "khaitru"].includes(formData.trangthaidangvien)
    ) {
      errors.trangthaidangvien = "Trạng thái Đảng viên không hợp lệ";
    }

    // chiboId
    if (!formData.chiboId) {
      errors.chiboId = "Chi bộ là bắt buộc";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch danh sách chi bộ đang hoạt động
  const loadChiBo = async () => {
    try {
      const response = await fetchChiBoDangHoatDong(token);
      const data = await response.json();
      if (data.resultCode === 0) {
        setChiBoList(Array.isArray(data.data) ? data.data : []);
      } else {
        throw new Error(data.message || "Không thể tải danh sách chi bộ");
      }
    } catch (err) {
      console.error("Error loading chiBo:", err);
      Swal.fire("Lỗi!", "Không thể tải danh sách chi bộ", "error");
    }
  };

  // Fetch danh sách Đảng viên
  const loadDangVien = async () => {
    setLoading(true);
    try {
      const response = await fetchDangVien(token, searchType, selectedChiBoId);
      const data = await response.json();
      //   console.log(data);
      if (data.resultCode === 0) {
        setDangVien(Array.isArray(data.data) ? data.data : []);
        setError(null);
        setCurrentPage(1);
      } else {
        throw new Error(data.message || "Không thể tải danh sách Đảng viên");
      }
    } catch (err) {
      setError("Không thể tải danh sách Đảng viên");
      console.error("Error loading dangVien:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create new Đảng viên
  const handleAddDangVien = async () => {
    if (!validateForm()) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ các trường bắt buộc!", "error");
      return;
    }

    try {
      setLoading(true);
      const { chiboId, ...dangVienData } = formData; // Loại bỏ chiboId khỏi dữ liệu gửi đi
      const data = await createDangVien(token, chiboId, dangVienData);
      if (data.resultCode === 0) {
        setDangVien([...dangVien, data.data]);
        setShowAddModal(false);
        setValidationErrors({});
        Swal.fire("Thành công!", "Thêm Đảng viên thành công", "success");
      } else {
        throw new Error(data.message || "Thêm Đảng viên thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Thêm Đảng viên thất bại", "error");
      console.error("Error adding dangVien:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update Đảng viên
  const handleUpdateDangVien = async () => {
    if (!validateForm()) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ các trường bắt buộc!", "error");
      return;
    }

    try {
      setLoading(true);
      const { chiboId, ...dangVienData } = formData; // Loại bỏ chiboId khỏi dữ liệu gửi đi
      const data = await updateDangVien(
        token,
        selectedDangVien.id,
        dangVienData
      );
      if (data.resultCode === 0) {
        setDangVien(
          dangVien.map((item) =>
            item.id === selectedDangVien.id ? data.data : item
          )
        );
        setShowEditModal(false);
        setValidationErrors({});
        Swal.fire("Thành công!", "Cập nhật Đảng viên thành công", "success");
      } else {
        throw new Error(data.message || "Cập nhật Đảng viên thất bại");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Cập nhật Đảng viên thất bại", "error");
      console.error("Error updating dangVien:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChiBo(); // Tải danh sách chi bộ khi component mount
    loadDangVien(); // Tải danh sách Đảng viên
  }, [searchType, selectedChiBoId]); // Cập nhật khi searchType hoặc selectedChiBoId thay đổi

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle search type change
  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
    setSelectedChiBoId(""); // Reset chi bộ khi đổi loại tìm kiếm
    setSearchTerm(""); // Reset từ khóa tìm kiếm
  };

  // Pagination and search
  const filteredDangVien =
    searchType === "all"
      ? dangVien.filter(
          (item) =>
            item.hoten?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
            item.ngaysinh?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
            item.noisinhhoatdang
              ?.toLowerCase()
              ?.includes(searchTerm.toLowerCase())
        )
      : dangVien;

  const totalPages = Math.ceil(filteredDangVien.length / itemsPerPage);
  const currentItems = filteredDangVien.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset form when opening add modal
  const openAddModal = () => {
    setFormData({
      hoten: "",
      ngaysinh: "",
      gioitinh: "",
      quequan: "",
      dantoc: "",
      trinhdovanhoa: "",
      noihiennay: "",
      chuyennmon: "",
      ngayvaodang: "",
      ngaychinhthuc: "",
      nguoigioithieu1: "",
      nguoigioithieu2: "",
      chucvuchinhquyen: "",
      chucvuchibo: "",
      chucvudanguy: "",
      chucvudoanthe: "",
      noisinhhoatdang: "",
      chucdanh: "",
      trinhdongoaingu: "",
      trinhdochinhtri: "",
      trangthaidangvien: "",
      chiboId: "",
    });
    setValidationErrors({});
    setShowAddModal(true);
  };

  // Open edit modal with selected dangVien data
  const openEditModal = (dangVienItem) => {
    setSelectedDangVien(dangVienItem);
    setFormData({
      hoten: dangVienItem.hoten,
      ngaysinh: dangVienItem.ngaysinh,
      gioitinh: dangVienItem.gioitinh,
      quequan: dangVienItem.quequan,
      dantoc: dangVienItem.dantoc,
      trinhdovanhoa: dangVienItem.trinhdovanhoa,
      noihiennay: dangVienItem.noihiennay,
      chuyennmon: dangVienItem.chuyennmon,
      ngayvaodang: dangVienItem.ngayvaodang,
      ngaychinhthuc: dangVienItem.ngaychinhthuc,
      nguoigioithieu1: dangVienItem.nguoigioithieu1,
      nguoigioithieu2: dangVienItem.nguoigioithieu2,
      chucvuchinhquyen: dangVienItem.chucvuchinhquyen,
      chucvuchibo: dangVienItem.chucvuchibo,
      chucvudanguy: dangVienItem.chucvudanguy,
      chucvudoanthe: dangVienItem.chucvudoanthe,
      noisinhhoatdang: dangVienItem.noisinhhoatdang,
      chucdanh: dangVienItem.chucdanh,
      trinhdongoaingu: dangVienItem.trinhdongoaingu,
      trinhdochinhtri: dangVienItem.trinhdochinhtri,
      trangthaidangvien: dangVienItem.trangthaidangvien,
      chiboId: dangVienItem.chibo?.id || dangVienItem.chiboId || "", // Nếu có chiboId từ dữ liệu
    });
    setValidationErrors({});
    setShowEditModal(true);
  };

  // Open detail modal
  const openDetailModal = (dangVienItem) => {
    setSelectedDangVien(dangVienItem);
    setShowDetailModal(true);
  };

  // Render form for Add/Edit modal
  const renderForm = () => (
    <Form>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Họ và tên</Form.Label>
            <Form.Control
              type="text"
              name="hoten"
              value={formData.hoten}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.hoten}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.hoten}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Chi bộ</Form.Label>
            <Form.Select
              name="chiboId"
              value={formData.chiboId}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.chiboId}
            >
              <option value="">Chọn chi bộ</option>
              {chiBoList.map((chiBo) => (
                <option key={chiBo.id} value={chiBo.id}>
                  {chiBo.tenchibo}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {validationErrors.chiboId}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Ngày sinh</Form.Label>
            <Form.Control
              type="date"
              name="ngaysinh"
              value={formData.ngaysinh}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.ngaysinh}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.ngaysinh}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Giới tính</Form.Label>
            <Form.Select
              name="gioitinh"
              value={formData.gioitinh}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.gioitinh}
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {validationErrors.gioitinh}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Quê quán</Form.Label>
            <Form.Control
              type="text"
              name="quequan"
              value={formData.quequan}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.quequan}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.quequan}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Dân tộc</Form.Label>
            <Form.Control
              type="text"
              name="dantoc"
              value={formData.dantoc}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.dantoc}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.dantoc}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Trình độ văn hóa</Form.Label>
            <Form.Control
              type="text"
              name="trinhdovanhoa"
              value={formData.trinhdovanhoa}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.trinhdovanhoa}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.trinhdovanhoa}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Nơi ở hiện nay</Form.Label>
            <Form.Control
              type="text"
              name="noihiennay"
              value={formData.noihiennay}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.noihiennay}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.noihiennay}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Chuyên môn</Form.Label>
            <Form.Control
              type="text"
              name="chuyennmon"
              value={formData.chuyennmon}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.chuyennmon}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.chuyennmon}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Ngày vào Đảng</Form.Label>
            <Form.Control
              type="date"
              name="ngayvaodang"
              value={formData.ngayvaodang}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.ngayvaodang}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.ngayvaodang}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Ngày chính thức</Form.Label>
            <Form.Control
              type="date"
              name="ngaychinhthuc"
              value={formData.ngaychinhthuc}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.ngaychinhthuc}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.ngaychinhthuc}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Người giới thiệu 1</Form.Label>
            <Form.Control
              type="text"
              name="nguoigioithieu1"
              value={formData.nguoigioithieu1}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Người giới thiệu 2</Form.Label>
            <Form.Control
              type="text"
              name="nguoigioithieu2"
              value={formData.nguoigioithieu2}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Chức vụ chính quyền</Form.Label>
            <Form.Control
              type="text"
              name="chucvuchinhquyen"
              value={formData.chucvuchinhquyen}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Chức vụ chi bộ</Form.Label>
            <Form.Control
              type="text"
              name="chucvuchibo"
              value={formData.chucvuchibo}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Chức vụ Đảng ủy</Form.Label>
            <Form.Control
              type="text"
              name="chucvudanguy"
              value={formData.chucvudanguy}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Chức vụ đoàn thể</Form.Label>
            <Form.Control
              type="text"
              name="chucvudoanthe"
              value={formData.chucvudoanthe}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Nơi sinh hoạt Đảng</Form.Label>
            <Form.Control
              type="text"
              name="noisinhhoatdang"
              value={formData.noisinhhoatdang}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Chức danh</Form.Label>
            <Form.Control
              type="text"
              name="chucdanh"
              value={formData.chucdanh}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Trình độ ngoại ngữ</Form.Label>
            <Form.Control
              type="text"
              name="trinhdongoaingu"
              value={formData.trinhdongoaingu}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Trình độ chính trị</Form.Label>
            <Form.Control
              type="text"
              name="trinhdochinhtri"
              value={formData.trinhdochinhtri}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Trạng thái Đảng viên</Form.Label>
            <Form.Select
              name="trangthaidangvien"
              value={formData.trangthaidangvien}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.trangthaidangvien}
            >
              <option value="">Chọn trạng thái</option>
              <option value="chinhthuc">Chính thức</option>
              <option value="dubi">Dự bị</option>
              <option value="khaitru">Khai trừ</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {validationErrors.trangthaidangvien}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );

  return (
    <div className="container-fluid p-0 position-relative d-flex flex-column min-vh-100">
      {/* Main content */}
      <div className="p-4 flex-grow-1">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <h1 className="h3 mb-3 mb-md-0">Danh sách Đảng viên</h1>
          <div className="d-flex gap-2 align-items-center">
            <Form.Select
              value={searchType}
              onChange={handleSearchTypeChange}
              style={{ width: "200px" }}
            >
              <option value="all">Tất cả</option>
              <option value="approved">Đã phê duyệt</option>
              <option value="chibo">Theo chi bộ</option>
            </Form.Select>
            {searchType === "chibo" && (
              <Form.Select
                value={selectedChiBoId}
                onChange={(e) => setSelectedChiBoId(e.target.value)}
                style={{ width: "200px" }}
              >
                <option value="">Chọn chi bộ</option>
                {chiBoList.map((chiBo) => (
                  <option key={chiBo.id} value={chiBo.id}>
                    {chiBo.tenchibo}
                  </option>
                ))}
              </Form.Select>
            )}
            <div
              className="d-flex"
              style={{ width: "100%", maxWidth: "450px" }}
            >
              <input
                type="text"
                className="form-control custom-sm-input"
                placeholder="Tìm kiếm Đảng viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={searchType !== "all"}
                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
              />
              <button
                className="btn btn-primary custom-sm-btn"
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              >
                <i className="fas fa-search"></i>
              </button>
            </div>
            <button
              className="btn btn-success custom-sm-btn-dangvien"
              onClick={openAddModal}
            >
              <i className="fas fa-plus me-2"></i>Thêm mới
            </button>
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

        {/* DangVien table */}
        {searchType === "chibo" &&
        selectedChiBoId &&
        currentItems.length === 0 ? (
          <div className="text-center py-4 color-black">
            Không có Đảng viên thuộc chi bộ này!
          </div>
        ) : searchType === "approved" && currentItems.length === 0 ? (
          <div className="text-center py-4 color-black">
            Không có Đảng viên nào được phê duyệt!
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-4 color-black">
            Không tìm thấy Đảng viên nào phù hợp!
          </div>
        ) : (
          <>
            <div className="table-responsive mb-4">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "5%" }}>STT</th>
                    <th style={{ width: "20%" }}>Họ và tên</th>
                    <th style={{ width: "20%" }}>Ngày sinh</th>
                    <th style={{ width: "20%" }}>Nơi sinh hoạt Đảng</th>
                    <th style={{ width: "15%" }}>Trạng thái</th>
                    <th style={{ width: "20%" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 &&
                    currentItems.map((item, index) => (
                      <tr key={index}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>{item.hoten}</td>
                        <td>{new Date(item.ngaysinh).toLocaleDateString()}</td>
                        <td>{item.noisinhhoatdang}</td>
                        <td className={`status-cell ${item.trangthaidangvien}`}>
                          {item.trangthaidangvien === "chinhthuc"
                            ? "Chính thức"
                            : item.trangthaidangvien === "dubi"
                            ? "Dự bị"
                            : item.trangthaidangvien === "khaitru"
                            ? "Khai trừ"
                            : "Không xác định"}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-sm btn-outline-primary btn-outline-primary-detail"
                              onClick={() => openDetailModal(item)}
                              title="Xem chi tiết"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => openEditModal(item)}
                              title="Chỉnh sửa"
                            >
                              <i className="fas fa-edit"></i>
                            </button>

                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => openTheDangModal(item)}
                              title="Xem thẻ Đảng"
                            >
                              <i className="fas fa-id-card"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-auto p-3 bg-light border-top">
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
          <Modal.Title>Chi tiết Đảng viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDangVien && (
            <Tabs defaultActiveKey="personal" className="mb-3">
              <Tab eventKey="personal" title="Thông tin cá nhân 3">
                <div className="p-3">
                  <dl className="row">
                    <dt className="col-sm-4">Họ và tên:</dt>
                    <dd className="col-sm-8">{selectedDangVien.hoten}</dd>
                    <dt className="col-sm-4">Ngày sinh:</dt>
                    <dd className="col-sm-8">
                      {new Date(selectedDangVien.ngaysinh).toLocaleDateString()}
                    </dd>
                    <dt className="col-sm-4">Giới tính:</dt>
                    <dd className="col-sm-8">{selectedDangVien.gioitinh}</dd>
                    <dt className="col-sm-4">Quê quán:</dt>
                    <dd className="col-sm-8">{selectedDangVien.quequan}</dd>
                    <dt className="col-sm-4">Dân tộc:</dt>
                    <dd className="col-sm-8">{selectedDangVien.dantoc}</dd>
                    <dt className="col-sm-4">Trình độ văn hóa:</dt>
                    <dd className="col-sm-8">
                      {selectedDangVien.trinhdovanhoa}
                    </dd>
                    <dt className="col-sm-4">Nơi ở hiện nay:</dt>
                    <dd className="col-sm-8">{selectedDangVien.noihiennay}</dd>
                    <dt className="col-sm-4">Chuyên môn:</dt>
                    <dd className="col-sm-8">{selectedDangVien.chuyennmon}</dd>
                    <dt className="col-sm-4">Trình độ ngoại ngữ:</dt>
                    <dd className="col-sm-8">
                      {selectedDangVien.trinhdongoaingu}
                    </dd>
                    <dt className="col-sm-4">Trình độ chính trị:</dt>
                    <dd className="col-sm-8">
                      {selectedDangVien.trinhdochinhtri}
                    </dd>
                  </dl>
                </div>
              </Tab>
              <Tab eventKey="party" title="Thông tin Đảng">
                <div className="p-3">
                  <dl className="row">
                    <dt className="col-sm-4">Chi bộ:</dt>
                    <dd className="col-sm-8">
                      {selectedDangVien.chibo?.tenchibo || "Không xác định"}
                    </dd>
                    <dt className="col-sm-4">Ngày vào Đảng:</dt>
                    <dd className="col-sm-8">
                      {new Date(
                        selectedDangVien.ngayvaodang
                      ).toLocaleDateString()}
                    </dd>
                    <dt className="col-sm-4">Ngày chính thức:</dt>
                    <dd className="col-sm-8">
                      {selectedDangVien.ngaychinhthuc
                        ? new Date(
                            selectedDangVien.ngaychinhthuc
                          ).toLocaleDateString()
                        : "Chưa chính thức"}
                    </dd>
                    <dt className="col-sm-4">Người giới thiệu 1:</dt>
                    <dd className="col-sm-8">
                      {selectedDangVien.nguoigioithieu1}
                    </dd>
                    <dt className="col-sm-4">Người giới thiệu 2:</dt>
                    <dd className="col-sm-8">
                      {selectedDangVien.nguoigioithieu2}
                    </dd>
                    <dt className="col-sm-4">Nơi sinh hoạt Đảng:</dt>
                    <dd className="col-sm-8">
                      {selectedDangVien.noisinhhoatdang}
                    </dd>
                    <dt className="col-sm-4">Trạng thái:</dt>
                    <dd className="col-sm-8">
                      {selectedDangVien.trangthaidangvien === "chinhthuc"
                        ? "Chính thức"
                        : selectedDangVien.trangthaidangvien === "dubi"
                        ? "Dự bị"
                        : selectedDangVien.trangthaidangvien === "khaitru"
                        ? "Khai trừ"
                        : "Không xác định"}
                    </dd>
                  </dl>
                </div>
              </Tab>
              <Tab eventKey="position" title="Chức vụ">
                <div className="p-3">
                  <dl className="row">
                    <dt className="col-sm-4">Chức vụ chính quyền:</dt>
                    <dd className="col-sm-8">
                      {selectedDangVien.chucvuchinhquyen}
                    </dd>
                    <dt className="col-sm-4">Chức vụ chi bộ:</dt>
                    <dd className="col-sm-8">{selectedDangVien.chucvuchibo}</dd>
                    <dt className="col-sm-4">Chức vụ Đảng ủy:</dt>
                    <dd className="col-sm-8">
                      {selectedDangVien.chucvudanguy}
                    </dd>
                    <dt className="col-sm-4">Chức vụ đoàn thể:</dt>
                    <dd className="col-sm-8">
                      {selectedDangVien.chucvudoanthe}
                    </dd>
                    <dt className="col-sm-4">Chức danh:</dt>
                    <dd className="col-sm-8">{selectedDangVien.chucdanh}</dd>
                  </dl>
                </div>
              </Tab>
              <Tab eventKey="card" title="Thẻ Đảng">
                {/* Content here */}
              </Tab>
            </Tabs>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Add Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm Đảng viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderForm()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleAddDangVien}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Thêm mới"}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật Đảng viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Họ và tên</Form.Label>
                  <Form.Control
                    type="text"
                    name="hoten"
                    value={formData.hoten}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.hoten}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.hoten}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ngày sinh</Form.Label>
                  <Form.Control
                    type="date"
                    name="ngaysinh"
                    value={formData.ngaysinh}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.ngaysinh}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.ngaysinh}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Giới tính</Form.Label>
                  <Form.Select
                    name="gioitinh"
                    value={formData.gioitinh}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.gioitinh}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.gioitinh}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Quê quán</Form.Label>
                  <Form.Control
                    type="text"
                    name="quequan"
                    value={formData.quequan}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.quequan}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.quequan}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Dân tộc</Form.Label>
                  <Form.Control
                    type="text"
                    name="dantoc"
                    value={formData.dantoc}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.dantoc}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.dantoc}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Trình độ văn hóa</Form.Label>
                  <Form.Control
                    type="text"
                    name="trinhdovanhoa"
                    value={formData.trinhdovanhoa}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.trinhdovanhoa}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.trinhdovanhoa}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Nơi ở hiện nay</Form.Label>
                  <Form.Control
                    type="text"
                    name="noihiennay"
                    value={formData.noihiennay}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.noihiennay}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.noihiennay}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Chuyên môn</Form.Label>
                  <Form.Control
                    type="text"
                    name="chuyennmon"
                    value={formData.chuyennmon}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.chuyennmon}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.chuyennmon}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ngày vào Đảng</Form.Label>
                  <Form.Control
                    type="date"
                    name="ngayvaodang"
                    value={formData.ngayvaodang}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.ngayvaodang}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.ngayvaodang}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ngày chính thức</Form.Label>
                  <Form.Control
                    type="date"
                    name="ngaychinhthuc"
                    value={formData.ngaychinhthuc}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.ngaychinhthuc}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.ngaychinhthuc}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Người giới thiệu 1</Form.Label>
                  <Form.Control
                    type="text"
                    name="nguoigioithieu1"
                    value={formData.nguoigioithieu1}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Người giới thiệu 2</Form.Label>
                  <Form.Control
                    type="text"
                    name="nguoigioithieu2"
                    value={formData.nguoigioithieu2}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Chức vụ chính quyền</Form.Label>
                  <Form.Control
                    type="text"
                    name="chucvuchinhquyen"
                    value={formData.chucvuchinhquyen}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Chức vụ chi bộ</Form.Label>
                  <Form.Control
                    type="text"
                    name="chucvuchibo"
                    value={formData.chucvuchibo}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Chức vụ Đảng ủy</Form.Label>
                  <Form.Control
                    type="text"
                    name="chucvudanguy"
                    value={formData.chucvudanguy}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Chức vụ đoàn thể</Form.Label>
                  <Form.Control
                    type="text"
                    name="chucvudoanthe"
                    value={formData.chucvudoanthe}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Nơi sinh hoạt Đảng</Form.Label>
                  <Form.Control
                    type="text"
                    name="noisinhhoatdang"
                    value={formData.noisinhhoatdang}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Chức danh</Form.Label>
                  <Form.Control
                    type="text"
                    name="chucdanh"
                    value={formData.chucdanh}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Trình độ ngoại ngữ</Form.Label>
                  <Form.Control
                    type="text"
                    name="trinhdongoaingu"
                    value={formData.trinhdongoaingu}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Trình độ chính trị</Form.Label>
                  <Form.Control
                    type="text"
                    name="trinhdochinhtri"
                    value={formData.trinhdochinhtri}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group>
              <Form.Label>Trạng thái Đảng viên</Form.Label>
              <Form.Select
                name="trangthaidangvien"
                value={formData.trangthaidangvien}
                onChange={handleInputChange}
                isInvalid={!!validationErrors.trangthaidangvien}
              >
                <option value="">Chọn trạng thái</option>
                <option value="chinhthuc">Chính thức</option>
                <option value="dubi">Dự bị</option>
                <option value="khaitru">Khai trừ</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validationErrors.trangthaidangvien}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateDangVien}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Lưu thay đổi"}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* // Modal thẻ Đảng */}
      <Modal
        show={showTheDangModal}
        onHide={() => setShowTheDangModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {showAddTheDangForm ? "Thêm/Cập nhật thẻ Đảng" : "Thẻ Đảng viên"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showAddTheDangForm ? (
            // Form thêm/cập nhật thẻ Đảng
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Số thẻ *</Form.Label>
                <Form.Control
                  type="text"
                  name="mathe"
                  value={theDangFormData.mathe}
                  onChange={(e) =>
                    setTheDangFormData({
                      ...theDangFormData,
                      mathe: e.target.value,
                    })
                  }
                  placeholder="Nhập số thẻ"
                  required
                  isInvalid={!!validationErrors.mathe}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.mathe}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Ngày cấp *</Form.Label>
                <Form.Control
                  type="date"
                  name="ngaycap"
                  value={theDangFormData.ngaycap}
                  onChange={(e) =>
                    setTheDangFormData({
                      ...theDangFormData,
                      ngaycap: e.target.value,
                    })
                  }
                  required
                  isInvalid={!!validationErrors.ngaycap}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.ngaycap}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nơi cấp *</Form.Label>
                <Form.Control
                  type="text"
                  name="noicapthe"
                  value={theDangFormData.noicapthe}
                  onChange={(e) =>
                    setTheDangFormData({
                      ...theDangFormData,
                      noicapthe: e.target.value,
                    })
                  }
                  placeholder="Nhập nơi cấp"
                  required
                  isInvalid={!!validationErrors.noicapthe}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.noicapthe}
                </Form.Control.Feedback>
              </Form.Group>
            </Form>
          ) : theDangData ? (
            // Hiển thị thẻ Đảng nếu có
            <div className="creative-full-bg-card">
              <div className="title">Thẻ Đảng Viên</div>
              <div className="subtitle">Đảng Cộng sản Việt Nam</div>
              <div className="name-section">
                {selectedDangVien?.hoten?.toUpperCase() || "N/A"}
              </div>
              <div className="number-section">
                Số: {theDangData.mathe || "N/A"}
              </div>
              <div className="info-container">
                <div className="info-left">
                  <div>
                    Ngày cấp:{" "}
                    {theDangData.ngaycap
                      ? new Date(theDangData.ngaycap).toLocaleDateString(
                          "vi-VN"
                        )
                      : "N/A"}
                  </div>
                  {selectedDangVien?.ngayvaodang && (
                    <div>
                      Ngày vào Đảng:{" "}
                      {new Date(
                        selectedDangVien.ngayvaodang
                      ).toLocaleDateString("vi-VN")}
                    </div>
                  )}
                </div>
                <div className="info-right">
                  <div>Nơi cấp: {theDangData.noicapthe || "N/A"}</div>
                  {selectedDangVien?.ngaychinhthuc && (
                    <div>
                      Ngày chính thức:{" "}
                      {new Date(
                        selectedDangVien.ngaychinhthuc
                      ).toLocaleDateString("vi-VN")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Không hiển thị thông báo, vì showAddTheDangForm đã được đặt true
            <div />
          )}
        </Modal.Body>
        <Modal.Footer>
          {showAddTheDangForm ? (
            // Nút khi đang ở form thêm/cập nhật
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddTheDangForm(false);
                  if (!theDangData) setShowTheDangModal(false); // Đóng modal nếu không có thẻ
                }}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={
                  theDangData ? handleUpdateTheDang : handleCreateTheDang
                }
                disabled={
                  loading ||
                  !theDangFormData.mathe ||
                  !theDangFormData.noicapthe
                }
              >
                {loading
                  ? "Đang xử lý..."
                  : theDangData
                  ? "Cập nhật"
                  : "Thêm thẻ"}
              </Button>
            </>
          ) : (
            // Nút khi có thẻ Đảng
            <>
              <Button
                variant="danger"
                onClick={handleDeleteTheDang}
                disabled={loading}
              >
                <i className="fas fa-trash me-1"></i> Xóa thẻ
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setTheDangFormData({
                    mathe: theDangData.mathe,
                    ngaycap: theDangData.ngaycap,
                    noicapthe: theDangData.noicapthe,
                  });
                  setShowAddTheDangForm(true);
                }}
                disabled={loading}
              >
                <i className="fas fa-edit me-1"></i> Cập nhật
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowTheDangModal(false)}
                disabled={loading}
              >
                Đóng
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DangVien;
