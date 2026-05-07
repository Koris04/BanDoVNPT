const express = require('express');
const router = express.Router();
const sql = require('mssql');
const hienThiLoiHeThong = require('./xuly_loi');

const { sqlConfig } = require('../database');
const kiemTraDangNhap = (req, res, next) => {
    if (req.session.user) next(); else res.redirect('/dangnhap');
};

//Kiểm tra xem có phải Admin hoặc Quản lý không
const kiemTraQuyenQuanTri = (req, res, next) => {
    const vaiTro = req.session.user.vai_tro_id;
    //Nếu là Admin hoặc Quản lý thì tiếp tục
    if (vaiTro === 1 || vaiTro === 2) {
        next();
    } else {
        hienThiLoiHeThong(req, res, "TRUY CẬP BỊ TỪ CHỐI!");
    }
};

//Hiển thị danh sách người dùng
router.get('/', kiemTraDangNhap, kiemTraQuyenQuanTri, async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);

        let result = await pool.request().query(`
            SELECT 
                tk.id, tk.ten_dang_nhap, tk.ho_ten, tk.so_dien_thoai, 
                tk.email_lien_he, tk.trang_thai, tk.ly_do_khoa, tk.vai_tro_id, 
                vt.ten_vai_tro 
            FROM TaiKhoan tk 
            LEFT JOIN VaiTro vt ON tk.vai_tro_id = vt.id
            ORDER BY tk.vai_tro_id ASC, tk.ho_ten ASC
        `);

        res.render('pages/quanly_nguoidung', {
            title: 'Quản lý người dùng',
            user: req.session.user,
            danhSachTaiKhoan: result.recordset
        });
    } catch (error) {
        console.error("Lỗi tải danh sách tài khoản:", error);
        hienThiLoiHeThong(req, res);
    }
});

//Xử lý xóa người dùng
router.post('/xoa_xuly', kiemTraDangNhap, kiemTraQuyenQuanTri, async (req, res) => {
    try {
        const { ten_dang_nhap_xoa, mat_khau_xac_nhan } = req.body;
        const userSession = req.session.user;

        if (userSession.vai_tro_id !== 1) {
            return hienThiLoiHeThong(req, res, "TRUY CẬP BỊ TỪ CHỐI! Chỉ Quản trị viên mới có quyền thực hiện xóa tài khoản.");
        }

        if (ten_dang_nhap_xoa === userSession.ten_dang_nhap) {
            return hienThiLoiHeThong(req, res, "LỖI BẢO MẬT! Hệ thống không cho phép bạn tự xóa tài khoản của chính mình.");
        }

        let pool = await sql.connect(sqlConfig);

        let checkAdmin = await pool.request()
            .input('user', sql.VarChar, userSession.ten_dang_nhap)
            .input('pass', sql.VarChar, mat_khau_xac_nhan)
            .query('SELECT id FROM TaiKhoan WHERE ten_dang_nhap = @user AND mat_khau = @pass');

        if (checkAdmin.recordset.length === 0) {
            return hienThiLoiHeThong(req, res, "LỖI XÁC THỰC! Mật khẩu Quản trị viên không chính xác.");
        }

        await pool.request()
            .input('user_xoa', sql.VarChar, ten_dang_nhap_xoa)
            .query('DELETE FROM TaiKhoan WHERE ten_dang_nhap = @user_xoa');

        res.redirect('/quanly/taikhoan');
    } catch (error) {
        console.error("Lỗi khi xóa tài khoản:", error);
        hienThiLoiHeThong(req, res, "Đã xảy ra lỗi khi xóa tài khoản khỏi cơ sở dữ liệu.");
    }
});

module.exports = router;