const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const hienThiLoiHeThong = require('./xuly_loi');

const DiemKetNoi = require('../models/DiemKetNoi');

const kiemTraDangNhap = (req, res, next) => {
    if (req.session.user) next(); else res.redirect('/dangnhap');
};

//Gia hạn hợp đồng
router.post('/gia-han', kiemTraDangNhap, async (req, res) => {
    try {
        const { diem_ket_noi_id, so_thang_gia_han } = req.body;
        const soThang = parseInt(so_thang_gia_han);

        //Tìm điểm kết nối
        const diem = await DiemKetNoi.findById(diem_ket_noi_id);
        if (!diem) return res.status(404).send("Không tìm thấy điểm kết nối.");

        //Tính toán ngày hết hạn mới
        let ngayHetHanHienTai = new Date(diem.thong_tin_hop_dong.ngay_het_han);
        ngayHetHanHienTai.setMonth(ngayHetHanHienTai.getMonth() + soThang);

        //Cập nhật dữ liệu
        diem.thong_tin_hop_dong.ngay_het_han = ngayHetHanHienTai;
        diem.thong_tin_hop_dong.thoi_gian_su_dung_thang += soThang;
        
        diem.trang_thai_ket_noi.mau_sac = 'Xanh';
        diem.trang_thai_ket_noi.ly_do_su_co = null;
        diem.trang_thai_ket_noi.lan_kiem_tra_cuoi = new Date();

        await diem.save();
        res.redirect('/baocao/suco');

    } catch (error) {
        console.error("Lỗi khi gia hạn hợp đồng:", error);
        hienThiLoiHeThong(req, res, "Đã xảy ra lỗi khi cố gắng gia hạn hợp đồng.");
    }
});

//Thu hồi và Hủy
router.post('/thu-hoi', kiemTraDangNhap, async (req, res) => {
    try {
        const { diem_ket_noi_id } = req.body;

        //Xóa khỏi MongoDB
        await DiemKetNoi.findByIdAndDelete(diem_ket_noi_id);
        
        res.redirect('/baocao/suco');

    } catch (error) {
        console.error("Lỗi khi thu hồi thiết bị:", error);
        hienThiLoiHeThong(req, res, "Đã xảy ra lỗi khi cố gắng thu hồi điểm kết nối.");
    }
});

module.exports = router;