const express = require('express');
const router = express.Router();

//Route: Hiện trang đăng nhập
router.get('/dangnhap', (req, res) => {
    //Đã đăng nhập
    if (req.session.user) {
        return res.redirect('/');
    }
    
    //Chưa đăng nhập
    res.render('pages/dangnhap', { 
        layout: false,
        error: req.flash('error')
    });
});

module.exports = router;