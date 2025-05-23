import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Form,
  Badge,
  Spinner,
  Pagination,
  Row,
  Col,
  Modal,
  Card,
  Alert,
  InputGroup,
} from "react-bootstrap";
import {
  FiClock,
  FiUser,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiDownload,
  FiEye,
} from "react-icons/fi";
import { format, isWithinInterval } from "date-fns";
import { vi } from "date-fns/locale";
import {
  fetchLog,
  fetchLogByNhanVienId,
  fetchNhanVien,
} from "../services/apiService";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";

const LichSu2 = () => {
  // State management
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(15);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [objectTypeFilter, setObjectTypeFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("token");

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, employeesRes] = await Promise.all([
          fetchLog(token),
          fetchNhanVien(token),
        ]);

        if (logsRes.resultCode === 0 && employeesRes.resultCode === 0) {
          setLogs(logsRes.data);
          setFilteredLogs(logsRes.data);
          setEmployees(employeesRes.data);
        } else {
          throw new Error(
            logsRes.message || employeesRes.message || "Lỗi khi tải dữ liệu"
          );
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [
    logs,
    startDate,
    endDate,
    actionFilter,
    objectTypeFilter,
    employeeFilter,
    searchQuery,
  ]);

  const applyFilters = () => {
    let result = [...logs];

    // Date range filter
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      result = result.filter((log) => {
        // Convert log date from "dd/MM/yyyy HH:mm:ss" to Date object
        const [datePart, timePart] = log.ngaygio.split(" ");
        const [day, month, year] = datePart.split("/");
        const logDate = new Date(`${year}-${month}-${day}T${timePart}`);

        if (start && end) {
          return isWithinInterval(logDate, { start, end });
        } else if (start) {
          return logDate >= start;
        } else if (end) {
          return logDate <= end;
        }
        return true;
      });
    }

    // Action type filter
    if (actionFilter !== "all") {
      result = result.filter((log) => log.hanhdong === actionFilter);
    }

    // Object type filter
    if (objectTypeFilter !== "all") {
      result = result.filter((log) => log.doituong === objectTypeFilter);
    }

    // Employee filter
    if (employeeFilter !== "all") {
      result = result.filter(
        (log) => log.nguoithuchien.trim() === employeeFilter
      );
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (log) =>
          log.hanhdong.toLowerCase().includes(query) ||
          log.doituong.toLowerCase().includes(query) ||
          log.nguoithuchien.toLowerCase().includes(query) ||
          (log.chitiet && log.chitiet.toLowerCase().includes(query))
      );
    }

    setFilteredLogs(result);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setActionFilter("all");
    setObjectTypeFilter("all");
    setEmployeeFilter("all");
    setSearchQuery("");
  };

  // Pagination logic
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  // Action and object type options for filters
  const actionTypes = useMemo(() => {
    const types = new Set();
    logs.forEach((log) => types.add(log.hanhdong));
    return Array.from(types);
  }, [logs]);

  const objectTypes = useMemo(() => {
    const types = new Set();
    logs.forEach((log) => types.add(log.doituong));
    return Array.from(types);
  }, [logs]);

  // Translation functions
  const translateAction = (action) => {
    const actions = {
      LOGIN: "Đăng nhập",
      LOGOUT: "Đăng xuất",
      UPDATE: "Cập nhật",
      CREATE: "Tạo mới",
      DELETE: "Xóa",
      ADD_KHUYENMAI: "Thêm khuyến mãi",
      REMOVE_KHUYENMAI: "Gỡ khuyến mãi",
      ORDER: "Đơn hàng",
      PAYMENT: "Thanh toán",
      CANCEL: "Hủy bỏ",
    };
    return actions[action] || action;
  };

  const translateObjectType = (type) => {
    const types = {
      SANPHAM: "Sản phẩm",
      KHUYENMAI: "Khuyến mãi",
      NHANVIEN: "Nhân viên",
      KHACHHANG: "Khách hàng",
      DONHANG: "Đơn hàng",
      HOADON: "Hóa đơn",
    };
    return types[type] || type;
  };

  const getActionColor = (action) => {
    const colors = {
      LOGIN: "success",
      LOGOUT: "secondary",
      UPDATE: "info",
      CREATE: "primary",
      DELETE: "danger",
      ADD_KHUYENMAI: "warning",
      REMOVE_KHUYENMAI: "dark",
      ORDER: "primary",
      PAYMENT: "success",
      CANCEL: "danger",
    };
    return colors[action] || "light";
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    return dateTimeString;
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      Swal.fire({
        title: "Lỗi!",
        text: `Không thể xuất file!`,
        icon: "Error",
        confirmButtonText: "OK",
      });
      return;
    }

    // Chuẩn bị dữ liệu chi tiết hơn
    const dataForExport = filteredLogs.map((log) => {
      const baseData = {
        "Thời gian": log.ngaygio,
        "Hành động": translateAction(log.hanhdong),
        "Đối tượng": translateObjectType(log.doituong),
        "Nhân viên thực hiện": log.nguoithuchien.trim(),
        "Chi tiết": log.chitiet || "",
      };

      // Thêm thông tin từ dữ liệu cũ/mới nếu có
      try {
        if (log.giatriCu) {
          const oldData = JSON.parse(log.giatriCu);
          baseData["Dữ liệu cũ"] = JSON.stringify(oldData, null, 2);
        }
        if (log.giatriMoi) {
          const newData = JSON.parse(log.giatriMoi);
          baseData["Dữ liệu mới"] = JSON.stringify(newData, null, 2);
        }
      } catch (e) {
        console.error("Lỗi phân tích dữ liệu JSON", e);
      }

      return baseData;
    });

    // Tạo worksheet
    const ws = XLSX.utils.json_to_sheet(dataForExport);

    // Định dạng cột
    ws["!cols"] = [
      { width: 20 }, // Thời gian
      { width: 15 }, // Hành động
      { width: 15 }, // Đối tượng
      { width: 20 }, // Nhân viên
      { width: 50 }, // Chi tiết
      { width: 50 }, // Dữ liệu cũ
      { width: 50 }, // Dữ liệu mới
    ];

    // Tạo workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lịch sử hoạt động");

    // Xuất file với tên chứa ngày giờ hiện tại
    const fileName = `LichSuHoatDong_${format(
      new Date(),
      "ddMMyyyy_HHmm"
    )}.xlsx`;
    XLSX.writeFile(wb, fileName);

    // Hiển thị thông báo (tuỳ chọn)
    Swal.fire({
      title: "Thành công!",
      text: `Đã xuất file Excel thành công: ${fileName}`,
      icon: "success",
      confirmButtonText: "OK",
    });
  };

  // Thêm các component mới bên dưới cùng của file
  const LoginDetails = ({ log }) => {
    const data = log.giatriCu ? JSON.parse(log.giatriCu) : null;

    return (
      <div>
        <h6>Thông tin đăng nhập</h6>
        <ul className="mb-0">
          <li>
            Họ tên: <strong>{data?.hoten}</strong>
          </li>
          <li>
            Vai trò:{" "}
            <strong>
              {data?.roleid?.rolename === "ROLE_ADMIN"
                ? "Quản trị viên"
                : "Nhân viên bán hàng"}
            </strong>
          </li>
          <li>
            Số điện thoại: <strong>{data?.sodt}</strong>
          </li>
          <li>
            Trạng thái:{" "}
            <strong>
              {data?.status === "active" ? "Hoạt động" : "Không hoạt động"}
            </strong>
          </li>
        </ul>
      </div>
    );
  };

  const CreateNhanVienDetails = ({ log }) => {
    const data = log.giatriMoi ? JSON.parse(log.giatriMoi) : null;

    return (
      <div>
        <h6>Thông tin nhân viên mới</h6>
        <ul className="mb-0">
          <li>
            Mã NV: <strong>{data?.id?.trim()}</strong>
          </li>
          <li>
            Họ tên: <strong>{data?.hoten}</strong>
          </li>
          <li>
            Số điện thoại: <strong>{data?.sodt}</strong>
          </li>
          <li>
            Ngày vào làm: <strong>{data?.ngvl}</strong>
          </li>
          <li>
            Vai trò:{" "}
            <strong>
              {data?.roleid?.rolename === "ROLE_ADMIN"
                ? "Quản trị viên"
                : "Nhân viên bán hàng"}
            </strong>
          </li>
          <li>
            Trạng thái:{" "}
            <strong>
              {data?.status === "active" ? "Hoạt động" : "Không hoạt động"}
            </strong>
          </li>
        </ul>
      </div>
    );
  };

  const CreateHoaDonDetails = ({ log }) => {
    const data = log.giatriMoi ? JSON.parse(log.giatriMoi) : null;

    if (!data) return <p>Không có thông tin chi tiết</p>;

    return (
      <div>
        <h6>Thông tin hóa đơn</h6>
        <Row>
          <Col md={6}>
            <h6 className="text-muted">Khách hàng</h6>
            <ul className="mb-3">
              <li>
                Mã KH: <strong>{data.makh?.id?.trim()}</strong>
              </li>
              <li>
                Họ tên: <strong>{data.makh?.hoten}</strong>
              </li>
              <li>
                SĐT: <strong>{data.makh?.sodt}</strong>
              </li>
            </ul>
          </Col>
          <Col md={6}>
            <h6 className="text-muted">Nhân viên</h6>
            <ul className="mb-3">
              <li>
                Mã NV: <strong>{data.manv?.id?.trim()}</strong>
              </li>
              <li>
                Họ tên: <strong>{data.manv?.hoten}</strong>
              </li>
              <li>
                SĐT: <strong>{data.manv?.sodt}</strong>
              </li>
            </ul>
          </Col>
        </Row>

        <h6 className="text-muted">Chi tiết hóa đơn</h6>
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Đơn vị</th>
                <th>Giá gốc</th>
                <th>KM</th>
                <th>Giá KM</th>
                <th>SL</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {data.cthds?.map((item, index) => (
                <tr key={index}>
                  <td>{item.masp?.tensp}</td>
                  <td>{item.masp?.dvt}</td>
                  <td>{item.masp?.gia?.toLocaleString()}đ</td>
                  <td>
                    {item.masp?.makm
                      ? `${item.masp?.makm?.phantram}%`
                      : "Không"}
                  </td>
                  <td>{item.gia?.toLocaleString()}đ</td>
                  <td>{item.sl}</td>
                  <td>{(item.gia * item.sl)?.toLocaleString()}đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-end mt-2">
          <h5>
            Tổng cộng: <strong>{data.trigia?.toLocaleString()}đ</strong>
          </h5>
        </div>
      </div>
    );
  };

  const KhuyenMaiDetails = ({ log }) => {
    const oldData = log.giatriCu ? JSON.parse(log.giatriCu) : null;
    const newData = log.giatriMoi ? JSON.parse(log.giatriMoi) : null;

    return (
      <div>
        <h6>Thông tin sản phẩm</h6>
        <ul className="mb-3">
          <li>
            Mã SP: <strong>{newData?.id || oldData?.id}</strong>
          </li>
          <li>
            Tên SP: <strong>{newData?.tensp || oldData?.tensp}</strong>
          </li>
          <li>
            Đơn vị: <strong>{newData?.dvt || oldData?.dvt}</strong>
          </li>
          <li>
            Giá bán:{" "}
            <strong>{(newData?.gia || oldData?.gia)?.toLocaleString()}đ</strong>
          </li>
        </ul>

        <h6 className="text-muted">
          {log.hanhdong === "ADD_KHUYENMAI"
            ? "Khuyến mãi được áp dụng"
            : "Khuyến mãi bị gỡ bỏ"}
        </h6>

        {log.hanhdong === "ADD_KHUYENMAI" ? (
          <ul className="mb-0">
            <li>
              Mã KM: <strong>{newData?.makm?.id}</strong>
            </li>
            <li>
              Nội dung: <strong>{newData?.makm?.noidung}</strong>
            </li>
            <li>
              Giảm giá: <strong>{newData?.makm?.phantram}%</strong>
            </li>
            <li>
              Thời gian: {newData?.makm?.ngaybd} đến {newData?.makm?.ngaykt}
            </li>
          </ul>
        ) : (
          <ul className="mb-0">
            <li>
              Mã KM: <strong>{oldData?.makm?.id}</strong>
            </li>
            <li>
              Nội dung: <strong>{oldData?.makm?.noidung}</strong>
            </li>
            <li>
              Giảm giá: <strong>{oldData?.makm?.phantram}%</strong>
            </li>
            <li>
              Thời gian: {oldData?.makm?.ngaybd} đến {oldData?.makm?.ngaykt}
            </li>
          </ul>
        )}
      </div>
    );
  };

  const UpdateSanPhamDetails = ({ log }) => {
    const oldData = log.giatriCu ? JSON.parse(log.giatriCu) : null;
    const newData = log.giatriMoi ? JSON.parse(log.giatriMoi) : null;

    if (!oldData || !newData) return <p>Không có thông tin chi tiết</p>;

    const changes = [];

    // So sánh các trường thay đổi
    if (oldData.tensp !== newData.tensp) {
      changes.push({
        field: "Tên sản phẩm",
        old: oldData.tensp,
        new: newData.tensp,
      });
    }

    if (oldData.dvt !== newData.dvt) {
      changes.push({
        field: "Đơn vị tính",
        old: oldData.dvt,
        new: newData.dvt,
      });
    }

    if (oldData.gia !== newData.gia) {
      changes.push({
        field: "Giá bán",
        old: `${oldData.gia?.toLocaleString()} VND`,
        new: `${newData.gia?.toLocaleString()} VND`,
      });
    }

    if (oldData.imageurl !== newData.imageurl) {
      changes.push({
        field: "Hình ảnh",
        old: oldData.imageurl ? "Có" : "Không",
        new: newData.imageurl ? "Có" : "Không",
      });
    }

    if (oldData.status !== newData.status) {
      changes.push({
        field: "Trạng thái",
        old: oldData.status ? "Có sẵn" : "Hết hàng",
        new: newData.status ? "Có sẵn" : "Hết hàng",
      });
    }

    return (
      <div>
        <h6>Thông tin sản phẩm được cập nhật</h6>
        <p>
          Mã SP: <strong>{newData.id}</strong>
        </p>

        {changes.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Nội dung</th>
                  <th>Giá trị cũ</th>
                  <th>Giá trị mới</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((change, index) => (
                  <tr key={index}>
                    <td>{change.field}</td>
                    <td>{change.old}</td>
                    <td>{change.new}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Không có thay đổi nào được phát hiện</p>
        )}
      </div>
    );
  };

  const UpdateNhanVienDetails = ({ log }) => {
    const oldData = log.giatriCu ? JSON.parse(log.giatriCu) : null;
    const newData = log.giatriMoi ? JSON.parse(log.giatriMoi) : null;

    if (!oldData || !newData) return <p>Không có thông tin chi tiết</p>;

    const changes = [];

    // So sánh các trường thay đổi
    if (oldData.hoten !== newData.hoten) {
      changes.push({
        field: "Họ và tên",
        old: oldData.hoten,
        new: newData.hoten,
      });
    }

    if (oldData.sodt !== newData.sodt) {
      changes.push({
        field: "Số điện thoại",
        old: oldData.sodt,
        new: newData.sodt,
      });
    }

    if (oldData.status !== newData.status) {
      changes.push({
        field: "Trạng thái",
        old: oldData.status === "active" ? "Hoạt động" : "Không hoạt động",
        new: newData.status === "active" ? "Hoạt động" : "Không hoạt động",
      });
    }

    return (
      <div>
        <h6>Thông tin nhân viên được cập nhật</h6>
        <p>
          Mã NV: <strong>{newData.id?.trim()}</strong>
        </p>

        {changes.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Nội dung</th>
                  <th>Giá trị cũ</th>
                  <th>Giá trị mới</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((change, index) => (
                  <tr key={index}>
                    <td>{change.field}</td>
                    <td>{change.old}</td>
                    <td>{change.new}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Không có thay đổi nào được phát hiện</p>
        )}
      </div>
    );
  };

  const UpdateKhuyenMaiDetails = ({ log }) => {
    const oldData = log.giatriCu ? JSON.parse(log.giatriCu) : null;
    const newData = log.giatriMoi ? JSON.parse(log.giatriMoi) : null;

    if (!oldData || !newData) return <p>Không có thông tin chi tiết</p>;

    const changes = [];

    // So sánh các trường thay đổi
    if (oldData.noidung !== newData.noidung) {
      changes.push({
        field: "Nội dung",
        old: oldData.noidung,
        new: newData.noidung,
      });
    }

    if (oldData.phantram !== newData.phantram) {
      changes.push({
        field: "Phần trăm giảm",
        old: `${oldData.phantram}%`,
        new: `${newData.phantram}%`,
      });
    }

    if (
      oldData.ngaybd !== newData.ngaybd ||
      oldData.ngaykt !== newData.ngaykt
    ) {
      changes.push({
        field: "Thời gian áp dụng",
        old: `Từ ngày ${oldData.ngaybd} đến ngày ${oldData.ngaykt}`,
        new: `Từ ngày ${newData.ngaybd} đến ngày ${newData.ngaykt}`,
      });
    }

    return (
      <div>
        <h6>Thông tin khuyến mãi được cập nhật</h6>
        <p>
          Mã KM: <strong>{newData.id}</strong>
        </p>

        {changes.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Nội dung</th>
                  <th>Giá trị cũ</th>
                  <th>Giá trị mới</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((change, index) => (
                  <tr key={index}>
                    <td>{change.field}</td>
                    <td>{change.old}</td>
                    <td>{change.new}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Không có thay đổi nào được phát hiện</p>
        )}
      </div>
    );
  };

  const UpdateKhachHangDetails = ({ log }) => {
    const oldData = log.giatriCu ? JSON.parse(log.giatriCu) : null;
    const newData = log.giatriMoi ? JSON.parse(log.giatriMoi) : null;

    if (!oldData || !newData) return <p>Không có thông tin chi tiết</p>;

    const changes = [];

    // So sánh các trường thay đổi
    if (oldData.hoten !== newData.hoten) {
      changes.push({
        field: "Họ và tên",
        old: oldData.hoten,
        new: newData.hoten,
      });
    }

    if (oldData.dchi !== newData.dchi) {
      changes.push({
        field: "Địa chỉ",
        old: oldData.dchi,
        new: newData.dchi,
      });
    }

    if (oldData.sodt !== newData.sodt) {
      changes.push({
        field: "Số điện thoại",
        old: oldData.sodt,
        new: newData.sodt,
      });
    }

    if (oldData.ngsinh !== newData.ngsinh) {
      changes.push({
        field: "Ngày sinh",
        old: oldData.ngsinh,
        new: newData.ngsinh,
      });
    }

    if (oldData.status !== newData.status) {
      changes.push({
        field: "Trạng thái",
        old: oldData.status === "active" ? "Hoạt động" : "Không hoạt động",
        new: newData.status === "active" ? "Hoạt động" : "Không hoạt động",
      });
    }

    return (
      <div>
        <h6>Thông tin khách hàng được cập nhật</h6>
        <p>
          Mã KH: <strong>{newData.id?.trim()}</strong>
        </p>

        {changes.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Nội dung</th>
                  <th>Giá trị cũ</th>
                  <th>Giá trị mới</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((change, index) => (
                  <tr key={index}>
                    <td>{change.field}</td>
                    <td>{change.old}</td>
                    <td>{change.new}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Không có thay đổi nào được phát hiện</p>
        )}
      </div>
    );
  };

  const DeleteNhanVienDetails = ({ log }) => {
    const oldData = log.giatriCu;

    return (
      <div>
        <Alert variant="danger">
          <h6>Nhân viên đã bị xóa</h6>
          <p className="mb-0">
            Mã nhân viên: <strong>{oldData?.trim()}</strong>
          </p>
        </Alert>
        <p>Không có thông tin chi tiết về nhân viên này.</p>
      </div>
    );
  };

  const DeleteKhachHangDetails = ({ log }) => {
    const oldData = log.giatriCu;

    return (
      <div>
        <Alert variant="danger">
          <h6>Khách hàng đã bị xóa</h6>
          <p className="mb-0">
            Mã khách hàng: <strong>{oldData?.trim()}</strong>
          </p>
        </Alert>
        <p>Không có thông tin chi tiết về khách hàng này.</p>
      </div>
    );
  };

  const GenericDetails = ({ log }) => {
    return <div>{log.chitiet && <p>{log.chitiet}</p>}</div>;
  };

  return (
    <div className="container-fluid p-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FiClock className="me-2" />
            Lịch sử hoạt động hệ thống
          </h5>
          <div>
            <Button
              variant="outline-primary"
              size="sm"
              className="me-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter className="me-1" />
              {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
            </Button>
            <Button
              variant="outline-success"
              size="sm"
              onClick={handleExport}
              disabled={filteredLogs.length === 0}
            >
              <FiDownload className="me-1" />
              Xuất Excel
            </Button>
          </div>
        </Card.Header>

        <Card.Body>
          {/* Filter Section */}
          {showFilters && (
            <div className="mb-4 p-3 border rounded bg-light">
              <Row className="g-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Từ ngày</Form.Label>
                    <Form.Control
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Đến ngày</Form.Label>
                    <Form.Control
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                    />
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Hành động</Form.Label>
                    <Form.Select
                      value={actionFilter}
                      onChange={(e) => setActionFilter(e.target.value)}
                    >
                      <option value="all">Tất cả</option>
                      {actionTypes.map((action) => (
                        <option key={action} value={action}>
                          {translateAction(action)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Đối tượng</Form.Label>
                    <Form.Select
                      value={objectTypeFilter}
                      onChange={(e) => setObjectTypeFilter(e.target.value)}
                    >
                      <option value="all">Tất cả</option>
                      {objectTypes.map((type) => (
                        <option key={type} value={type}>
                          {translateObjectType(type)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Nhân viên</Form.Label>
                    <Form.Select
                      value={employeeFilter}
                      onChange={(e) => setEmployeeFilter(e.target.value)}
                    >
                      <option value="all">Tất cả nhân viên</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id.trim()}>
                          {emp.hoten} ({emp.id.trim()})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mt-3">
                <Col md={8}>
                  <InputGroup>
                    <InputGroup.Text>
                      <FiSearch />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Tìm kiếm theo từ khóa..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <Button
                    variant="outline-secondary"
                    onClick={resetFilters}
                    className="w-100"
                  >
                    <FiRefreshCw className="me-1" />
                    Đặt lại bộ lọc
                  </Button>
                </Col>
              </Row>
            </div>
          )}

          {/* Status Bar */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="text-muted">
              Hiển thị <strong>{filteredLogs.length}</strong> kết quả
              {(startDate || endDate) && (
                <span className="ms-2">
                  {startDate &&
                    `từ ${format(new Date(startDate), "dd/MM/yyyy", {
                      locale: vi,
                    })}`}
                  {startDate && endDate && " đến "}
                  {endDate && !startDate && "trước "}
                  {endDate &&
                    `${format(new Date(endDate), "dd/MM/yyyy", {
                      locale: vi,
                    })}`}
                </span>
              )}
            </div>
            <div>
              {loading && (
                <Spinner animation="border" size="sm" className="me-2" />
              )}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          {/* Logs Table */}
          <div className="table-responsive">
            <Table striped bordered hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th width="50px">STT</th>
                  <th width="150px">Thời gian</th>
                  <th width="120px">Hành động</th>
                  <th width="120px">Đối tượng</th>
                  <th>Nhân viên</th>
                  <th width="100px">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2">Đang tải dữ liệu...</p>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      Không tìm thấy bản ghi nào phù hợp
                    </td>
                  </tr>
                ) : (
                  currentLogs.map((log, index) => (
                    <tr key={log.id}>
                      <td>{indexOfFirstLog + index + 1}</td>
                      <td>
                        <small className="text-muted">
                          <FiClock className="me-1" />
                          {formatDateTime(log.ngaygio)}
                        </small>
                      </td>
                      <td>
                        <Badge
                          bg={getActionColor(log.hanhdong)}
                          className="w-100"
                        >
                          {translateAction(log.hanhdong)}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="info" text="dark" className="w-100">
                          {translateObjectType(log.doituong)}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FiUser className="me-2 text-muted" />
                          <span>{log.nguoithuchien.trim()}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewDetails(log)}
                          title="Xem chi tiết"
                        >
                          <FiEye />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredLogs.length > logsPerPage && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="text-muted">
                Trang {currentPage}/{totalPages} • Bản ghi {indexOfFirstLog + 1}
                -{Math.min(indexOfLastLog, filteredLogs.length)}/
                {filteredLogs.length}
              </div>
              <Pagination>
                <Pagination.First
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                />

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
                    <Pagination.Item
                      key={pageNum}
                      active={pageNum === currentPage}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}

                <Pagination.Next
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết hoạt động</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLog && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <h6 className="text-muted">Thời gian</h6>
                  <p>{formatDateTime(selectedLog.ngaygio)}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted">Nhân viên thực hiện</h6>
                  <p>{selectedLog.nguoithuchien.trim()}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <h6 className="text-muted">Hành động</h6>
                  <p>
                    <Badge bg={getActionColor(selectedLog.hanhdong)}>
                      {translateAction(selectedLog.hanhdong)}
                    </Badge>
                  </p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted">Đối tượng</h6>
                  <p>
                    <Badge bg="light" text="dark">
                      {translateObjectType(selectedLog.doituong)}
                    </Badge>
                    {selectedLog.id_doituong && (
                      <span className="ms-2">
                        (ID: <code>{selectedLog.id_doituong.trim()}</code>)
                      </span>
                    )}
                  </p>
                </Col>
              </Row>

              <h6 className="text-muted">Chi tiết</h6>
              <div className="p-3 bg-light rounded mb-3 rounded-border04">
                {selectedLog.hanhdong === "LOGIN" &&
                  selectedLog.doituong === "NHANVIEN" && (
                    <LoginDetails log={selectedLog} />
                  )}

                {selectedLog.hanhdong === "CREATE" &&
                  selectedLog.doituong === "NHANVIEN" && (
                    <CreateNhanVienDetails log={selectedLog} />
                  )}

                {selectedLog.hanhdong === "CREATE" &&
                  selectedLog.doituong === "HOADON" && (
                    <CreateHoaDonDetails log={selectedLog} />
                  )}

                {(selectedLog.hanhdong === "ADD_KHUYENMAI" ||
                  selectedLog.hanhdong === "REMOVE_KHUYENMAI") && (
                  <KhuyenMaiDetails log={selectedLog} />
                )}

                {selectedLog.hanhdong === "UPDATE" &&
                  selectedLog.doituong === "SANPHAM" && (
                    <UpdateSanPhamDetails log={selectedLog} />
                  )}

                {selectedLog.hanhdong === "UPDATE" &&
                  selectedLog.doituong === "NHANVIEN" && (
                    <UpdateNhanVienDetails log={selectedLog} />
                  )}

                {selectedLog.hanhdong === "UPDATE" &&
                  selectedLog.doituong === "KHUYENMAI" && (
                    <UpdateKhuyenMaiDetails log={selectedLog} />
                  )}

                {selectedLog.hanhdong === "UPDATE" &&
                  selectedLog.doituong === "KHACHANG" && (
                    <UpdateKhachHangDetails log={selectedLog} />
                  )}

                {selectedLog.hanhdong === "DELETE" &&
                  selectedLog.doituong === "NHANVIEN" && (
                    <DeleteNhanVienDetails log={selectedLog} />
                  )}

                {selectedLog.hanhdong === "DELETE" &&
                  selectedLog.doituong === "KHACHANG" && (
                    <DeleteKhachHangDetails log={selectedLog} />
                  )}

                {/* Fallback for other cases */}
                {![
                  "LOGIN_NHANVIEN",
                  "CREATE_NHANVIEN",
                  "CREATE_HOADON",
                  "ADD_KHUYENMAI",
                  "REMOVE_KHUYENMAI",
                ].includes(
                  `${selectedLog.hanhdong}_${selectedLog.doituong}`
                ) && <GenericDetails log={selectedLog} />}
              </div>
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

export default LichSu2;
