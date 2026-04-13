const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const sql = require('mssql');
const hienThiLoiHeThong = require('./xuly_loi');

const DiemKetNoi = require('../models/DiemKetNoi');

//Cấu hình SQL Server
const sqlConfig = {
    user: 'sa', password: 'sql2019', database: 'VNPT_BanDo_Admin', server: 'localhost', port: 1433,
    options: { encrypt: false, trustServerCertificate: true }
};

const kiemTraDangNhap = (req, res, next) => {
    if (req.session.user) next(); else res.redirect('/dangnhap');
};

router.get('/suco', kiemTraDangNhap, async (req, res) => {
    try {
        //Lấy danh sách điểm Đỏ/Xám từ MongoDB
        const danhSachSuCo = await DiemKetNoi.find({
            'trang_thai_ket_noi.mau_sac': { $in: ['Đỏ', 'Xám'] }
        }).populate('splitter_id').sort({ 'trang_thai_ket_noi.lan_kiem_tra_cuoi': -1 });

        const diemSuaChua = danhSachSuCo.filter(d => d.trang_thai_ket_noi.mau_sac === 'Đỏ');
        const diemThuHoi = danhSachSuCo.filter(d => d.trang_thai_ket_noi.mau_sac === 'Xám');

        //Kiểm tra SQL Server xem điểm nào đang được xử lý
        let pool = await sql.connect(sqlConfig);
        let resultSQL = await pool.request().query(`
            SELECT id AS bao_cao_id, diem_ket_noi_id 
            FROM BaoCaoSuCo 
            WHERE trang_thai_xu_ly IN (0, 1)
        `);
        
        //Tạo một mảng chứa ID của các điểm đã báo cáo
        const mapDangXuLy = {};
        resultSQL.recordset.forEach(r => {
            mapDangXuLy[r.diem_ket_noi_id] = r.bao_cao_id;
        });

        res.render('baocao_suco', {
            title: 'Báo cáo sự cố mạng lưới',
            user: req.session.user,
            danhSachSuCo: danhSachSuCo,
            soLuongDo: diemSuaChua.length,
            soLuongXam: diemThuHoi.length,
            mapDangXuLy: mapDangXuLy //Gửi danh sách này sang giao diện
        });

    } catch (error) {
        console.error("Lỗi khi lấy danh sách sự cố:", error);
        hienThiLoiHeThong(req, res, "Không thể tải danh sách báo cáo sự cố.");
    }
});

module.exports = router;