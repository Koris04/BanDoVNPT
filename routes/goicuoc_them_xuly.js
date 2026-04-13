const express = require('express');
const router = express.Router();
const sql = require('mssql');
const hienThiLoiHeThong = require('./xuly_loi');

const sqlConfig = {
    user: 'sa', password: 'sql2019', database: 'VNPT_BanDo_Admin', server: 'localhost', port: 1433,
    options: { encrypt: false, trustServerCertificate: true }
};

// Route: Xử lý Thêm gói cước mới
router.post('/them', async (req, res) => {
    try {
        if (req.session.user.vai_tro_id !== 1) {
            return res.redirect('/quanly/goicuoc');
        }

        const { ten_goi_cuoc, loai_hinh_thue_bao } = req.body;
        
        let pool = await sql.connect(sqlConfig);
        await pool.request()
            .input('ten', sql.NVarChar, ten_goi_cuoc)
            .input('loai', sql.NVarChar, loai_hinh_thue_bao)
            .query(`INSERT INTO GoiCuoc (ten_goi_cuoc, loai_hinh_thue_bao) VALUES (@ten, @loai)`);
            
        res.redirect('/quanly/goicuoc');
    } catch (err) {
        console.error("Lỗi thêm gói cước:", err);
        hienThiLoiHeThong(req, res, "Đã xảy ra lỗi khi lưu dữ liệu gói cước.");
    }
});

module.exports = router;