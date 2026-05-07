const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const sql = require('mssql');

const DiemKetNoi = require('../models/DiemKetNoi');
const Splitter = mongoose.model('Splitter');
const hienThiLoiHeThong = require('./xuly_loi');

const { sqlConfig } = require('../database');

const kiemTraDangNhap = (req, res, next) => {
    if (req.session.user) next(); else res.redirect('/dangnhap');
};

// Route: Trang quản lý điểm kết nối
router.get('/', kiemTraDangNhap, async (req, res) => {
    try {
        const limit = 15;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        // Đếm tổng số điểm kết nối
        const totalDiem = await DiemKetNoi.countDocuments({});
        const totalPages = Math.ceil(totalDiem / limit);

        // Lấy danh sách Điểm kết nối từ MongoDB, có populate thông tin Tủ cấp 2 và sắp xếp theo lần kiểm tra cuối
        const danhSachDiem = await DiemKetNoi.find({})
            .populate('splitter_id')
            .sort({ 'trang_thai_ket_noi.lan_kiem_tra_cuoi': -1 })
            .skip(skip)
            .limit(limit);

        // Lấy danh sách tủ 1:16 để đổ vào Form thêm mới
        const danhSachSplitter16 = await Splitter.find({ loai_splitter: '1:16' });

        // Lấy danh sách gói cước từ SQL Server
        let pool = await sql.connect(sqlConfig);
        let resultGoiCuoc = await pool.request().query('SELECT id, ten_goi_cuoc, loai_hinh_thue_bao FROM GoiCuoc');

        res.render('pages/diemketnoi', {
            title: 'Điểm kết nối',
            user: req.session.user,
            danhSachDiem: danhSachDiem,
            danhSachSplitter: danhSachSplitter16,
            danhSachGoiCuoc: resultGoiCuoc.recordset,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (error) {
        console.error("Lỗi Server:", error);
        hienThiLoiHeThong(req, res);
    }
});
//Xử lý sửa các điểm kết nối
router.post('/sua/:id', kiemTraDangNhap, async (req, res) => {
    try {
        const {
            ten_khach_hang, dia_chi, kinh_do, vi_do,
            goi_cuoc_id, ngay_dang_ky, thoi_gian_su_dung_thang,
            splitter_id, username, password, sys_id, rack, slot, port
        } = req.body;

        //Xử lý tự động lấy loại khách hàng từ SQL Server
        let pool = await sql.connect(sqlConfig);
        let goiCuocInfo = await pool.request()
            .input('id', sql.Int, goi_cuoc_id)
            .query('SELECT loai_hinh_thue_bao FROM GoiCuoc WHERE id = @id');
        let loai_khach_hang = goiCuocInfo.recordset.length > 0 ? goiCuocInfo.recordset[0].loai_hinh_thue_bao : 'Chưa xác định';

        //Xử lý tính toán lại ngày hết hạn
        const ngayDangKyDate = new Date(ngay_dang_ky);
        const ngayHetHanDate = new Date(ngayDangKyDate);
        ngayHetHanDate.setMonth(ngayHetHanDate.getMonth() + parseInt(thoi_gian_su_dung_thang));

        // Cập nhật lên MongoDB
        await DiemKetNoi.findByIdAndUpdate(req.params.id, {
            ten_khach_hang,
            loai_khach_hang,
            dia_chi,
            vi_tri: { type: 'Point', coordinates: [parseFloat(kinh_do), parseFloat(vi_do)] },
            thong_tin_hop_dong: {
                goi_cuoc_id: parseInt(goi_cuoc_id),
                ngay_dang_ky: ngayDangKyDate,
                thoi_gian_su_dung_thang: parseInt(thoi_gian_su_dung_thang),
                ngay_het_han: ngayHetHanDate
            },
            splitter_id: splitter_id || null,
            'thong_tin_pppoe.username': username,
            'thong_tin_pppoe.password': password,
            'thong_tin_pppoe.circuit_id.sys_id': sys_id,
            'thong_tin_pppoe.circuit_id.rack': rack,
            'thong_tin_pppoe.circuit_id.slot': slot,
            'thong_tin_pppoe.circuit_id.port': port
        });

        res.redirect('/quanly/diemketnoi');
    } catch (error) {
        console.error("Lỗi khi sửa Điểm kết nối:", error);
        hienThiLoiHeThong(req, res, "Đã xảy ra lỗi khi cập nhật Điểm kết nối.");
    }
});

//Xử lý xóa điểm kết nối
router.post('/xoa/:id', kiemTraDangNhap, async (req, res) => {
    try {
        await DiemKetNoi.findByIdAndDelete(req.params.id);
        res.redirect('/quanly/diemketnoi');
    } catch (error) {
        console.error("Lỗi khi xóa Điểm kết nối:", error);
        hienThiLoiHeThong(req, res, "Đã xảy ra lỗi khi xóa Khách hàng.");
    }
});

module.exports = router;