const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const hienThiLoiHeThong = require('./xuly_loi');
const Splitter = require('../models/Splitter');
const kiemTraDangNhap = (req, res, next) => {
    if (req.session.user) next(); else res.redirect('/dangnhap');
};

//Trang quản lý danh sách tủ cáp
router.get('/', kiemTraDangNhap, async (req, res) => {
    try {
        const limit = 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const totalSplitters = await Splitter.countDocuments({});
        const totalPages = Math.ceil(totalSplitters / limit);

        const danhSachSplitter = await Splitter.find({})
            .populate('splitter_cha_id')
            .sort({ sys_id: 1, loai_splitter: 1 })
            .skip(skip)
            .limit(limit);

        const danhSachSplitterCap1 = await Splitter.find({ loai_splitter: '1:4' });

        res.render('pages/splitter', {
            title: 'Quản lý tủ cáp',
            user: req.session.user,
            danhSachSplitter: danhSachSplitter,
            danhSachSplitterCap1: danhSachSplitterCap1,
            currentPage: page,   
            totalPages: totalPages 
        });
    }  catch (error) {
        console.error("Lỗi Server:", error);
       hienThiLoiHeThong(req, res);
    }
});
//Xử lý sửa thông tin Splitter
router.post('/sua/:id', kiemTraDangNhap, async (req, res) => {
    try {
        const { ten_splitter, sys_id, vi_do, kinh_do, loai_splitter, splitter_cha_id,trang_thai } = req.body;
        const page = req.query.page || 1;

        await Splitter.findByIdAndUpdate(req.params.id, {
            ten_splitter: ten_splitter,
            sys_id: sys_id,
            loai_splitter: loai_splitter,
            vi_tri: { type: 'Point', coordinates: [parseFloat(kinh_do), parseFloat(vi_do)] },
            splitter_cha_id: (loai_splitter === '1:16' && splitter_cha_id) ? splitter_cha_id : null,
            trang_thai: trang_thai
        });
        
        res.redirect('/quanly/splitter?page=' + page);
    } catch (error) {
        console.error("Lỗi khi sửa Splitter:", error);
        hienThiLoiHeThong(req, res, "Đã xảy ra lỗi khi cập nhật thông tin Tủ PON.");
    }
});

//Xử lý xóa Splitter
router.post('/xoa/:id', kiemTraDangNhap, async (req, res) => {
    try {
        const kiemTraCon = await Splitter.findOne({ splitter_cha_id: req.params.id });
        const page = req.query.page || 1;

        if (kiemTraCon) {
            return hienThiLoiHeThong(req, res, "LỖI! Không thể xóa Tủ Cấp 1 này vì hiện đang có Tủ Cấp 2 nối vào. Vui lòng đổi nguồn cáp của tủ cấp 2 trước!");
        }
        
        await Splitter.findByIdAndDelete(req.params.id);
        res.redirect('/quanly/splitter?page=' + page);
    } catch (error) {
        console.error("Lỗi khi xóa Splitter:", error);
        hienThiLoiHeThong(req, res, "Đã xảy ra lỗi khi xóa Tủ PON.");
    }
});

module.exports = router;