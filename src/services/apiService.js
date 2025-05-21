import axios from "axios";

// Định nghĩa URL API (có thể thay đổi dễ dàng)
const REACT_APP_API_URL =
  process.env.REACT_APP_API_URL || "http://3.25.84.77:8081/api/v1/project";

// Cập nhật hàm login cho phù hợp với API yêu cầu
export const login = async (userName, passWord) => {
  try {
    const response = await axios.post(`${REACT_APP_API_URL}/auth/signin`, {
      userName,
      passWord,
    });
    // console.log(response);
    return response.data; // trả về dữ liệu từ API
  } catch (err) {
    throw new Error(err.response?.data?.message || "Đăng nhập thất bại!");
  }
};

// Lấy danh sách sản phẩm
export const fetchSanPham = async (token) => {
  const response = await axios.get(`${REACT_APP_API_URL}/sanpham/findAll`, {
    headers: {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

// Thêm sản phẩm
export const createSanPham = async (token, sanphamData) => {
  const response = await axios.post(
    `${REACT_APP_API_URL}/sanpham/create`,
    sanphamData,
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Cập nhật sản phẩm
export const updateSanPham = async (token, maSP, sanphamData) => {
  const response = await axios.put(
    `${REACT_APP_API_URL}/sanpham/update?maSP=${maSP}`,
    sanphamData,
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Thêm khuyến mãi
export const addKhuyenMai = async (token, maSP, maKM) => {
  const response = await axios.get(
    `${REACT_APP_API_URL}/sanpham/addKhuyenmai?maSP=${maSP}&maKM=${maKM}`,
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Xóa khuyến mãi
export const removeKhuyenMai = async (token, maSP) => {
  const response = await axios.get(
    `${REACT_APP_API_URL}/sanpham/removeKhuyenmai?maSP=${maSP}`,
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Get sanpham by id
export const getSanPhamById = async (token, maSP) => {
  const response = await axios.get(
    `${REACT_APP_API_URL}/sanpham/findByMaSP?maSP=${maSP}`,
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Lấy danh sách khuyến mãi Available
export const fetchKhuyenMaiAvailable = async (token) => {
  const response = await axios.get(
    `${REACT_APP_API_URL}/khuyenmai/findAvailable`,
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Lấy danh sách khuyến mãi
export const fetchKhuyenMai = async (token) => {
  const response = await axios.get(`${REACT_APP_API_URL}/khuyenmai/findAll`, {
    headers: {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

// Fetch Khuyen Mai by Id
export const fetchKhuyenMaiById = async (token, maKM) => {
  const response = await axios.get(
    `${REACT_APP_API_URL}/khuyenmai/findByMaKM?maKM=${maKM}`,
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Thêm khuyen mai
export const createKhuyenMai = async (token, khuyenmaiData) => {
  const response = await axios.post(
    `${REACT_APP_API_URL}/khuyenmai/create`,
    khuyenmaiData,
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Cập nhật khuyen mai
export const updateKhuyenMai = async (token, maKM, khuyenmaiData) => {
  const response = await axios.put(
    `${REACT_APP_API_URL}/khuyenmai/update?maKM=${maKM}`,
    khuyenmaiData,
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Lấy danh sách khách hàng
export const fetchKhachHang = async (token) => {
  const response = await axios.get(`${REACT_APP_API_URL}/khachhang/findAll`, {
    headers: {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

// Lấy danh sách khách hàng Active
export const fetchKhachHangActive = async (token) => {
  const response = await axios.get(`${REACT_APP_API_URL}/khachhang/findKhachHangActive`, {
    headers: {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

// Thêm khách hàng
export const createKhachHang = async (token, khachhangData) => {
  const response = await axios.post(
    `${REACT_APP_API_URL}/khachhang/create`,
    khachhangData,
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Cập nhật khách hàng
export const updateKhachHang = async (token, maKH, khachhangData) => {
  const response = await axios.put(
    `${REACT_APP_API_URL}/sanpham/update?maSP=${maKH}`,
    khachhangData,
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Fetch khach hang by id
export const fetchKhachHangById = async (token, maKH) => {
  const response = await axios.get(
    `${REACT_APP_API_URL}/khachhang/findByMaKH?maKH=${maKH}`,
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// delete Khach hang
export const deleteKhachHang = async (token, maKH) => {
  const response = await axios.delete(
    `${REACT_APP_API_URL}/khachhang/delete?maKH=${maKH}`,
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return await response.data;
};

// Lấy danh sách nhân viên
export const fetchNhanVien = async (token) => {
  const response = await axios.get(`${REACT_APP_API_URL}/nhanvien/findAll`, {
    headers: {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

// Thêm nhan vien
export const createNhanVien = async (token, nhanvienData) => {
  const response = await axios.post(
    `${REACT_APP_API_URL}/nhanvien/create?rolename=${nhanvienData.rolename}`,
    nhanvienData,
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Cập nhật nhan vien
export const updateNhanVien = async (token, maNV, nhanvienData) => {
  const response = await axios.put(
    `${REACT_APP_API_URL}/nhanvien/update?maSP=${maNV}`,
    nhanvienData,
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Fetch nhan vien by id
export const fetchNhanVienById = async (token, maNV) => {
  const response = await axios.get(
    `${REACT_APP_API_URL}/nhanvien/findByMaNV?maNV=${maNV}`,
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// delete nhan vien
export const deleteNhanVien = async (token, maNV) => {
  const response = await axios.delete(
    `${REACT_APP_API_URL}/nhanvien/deleteByMaNV?maNV=${maNV}`,
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return await response.data;
};

// Lấy danh sách nhân viên Active
export const fetchNhanVienActive = async (token) => {
  const response = await axios.get(`${REACT_APP_API_URL}/nhanvien/findNhanvienActive`, {
    headers: {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    },
  });
  console.log(response.data);
  return response.data;
};

// Fetch all roles
export const fetchRole = async (token) => {
  const response = await axios.get(
    `${REACT_APP_API_URL}/nhanvien/findAllRole`,
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Fetch nhan vien by id
export const fetchLogByNhanVienId = async (token, maNV) => {
  const response = await axios.get(
    `${REACT_APP_API_URL}/log/findByMaNV?maNV=${maNV}`,
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Fetch all roles
export const fetchLog = async (token) => {
  const response = await axios.get(`${REACT_APP_API_URL}/log/findAll`, {
    headers: {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

// Fetch all hoa don
export const fetchHoaDon = async (token) => {
  const response = await axios.get(`${REACT_APP_API_URL}/hoadon/findAll`, {
    headers: {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

// Fetch hoa don by khach hang id
export const fetchHoaDonByKhachHangId = async (token, maKH) => {
  const response = await axios.get(
    `${REACT_APP_API_URL}/hoadon/findByMaKH?maKH=${maKH}`,
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Create a new invoice
export const createHoaDon = async (token, invoiceData) => {
  const response = await axios.post(
    `${REACT_APP_API_URL}/hoadon/create`,
    {
      maKH: invoiceData.maKH,
      maNV: invoiceData.maNV,
      sanpham: invoiceData.sanpham.map((item) => ({
        maSP: item.maSP,
        soluong: item.soluong,
      })),
    },
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Upload hình ảnh
export const uploadImage = async (token, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    `${REACT_APP_API_URL}/file/uploadImage`,
    formData,
    {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  console.log(response.data);
  return response.data;
};

// Fetch Thống kê
export const fetchThongKe = async (token) => {
  const response = await axios.get(`${REACT_APP_API_URL}/thongke`, {
    headers: {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const getImageLink = (imageName) =>
  `${REACT_APP_API_URL}/auth/file/getImage/${imageName}`;


// Lấy danh sách nhân viên Deleted
export const fetchNhanVienDeleted = async (token) => {
  const response = await axios.get(`${REACT_APP_API_URL}/nhanvien/findNhanvienDeleted`, {
    headers: {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    },
  });
  console.log(response.data);
  return response.data;
};

// Lấy danh sách khách hàng Deleted
export const fetchKhachHangDeleted = async (token) => {
  const response = await axios.get(`${REACT_APP_API_URL}/khachhang/findKhachHangDeleted`, {
    headers: {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};