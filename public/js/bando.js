document.addEventListener('DOMContentLoaded', function () {
    //KHỞI TẠO BẢN ĐỒ
    document.getElementById('map-container').innerHTML = '';
    
    //Tọa độ trung tâm và mức zoom
    let toaDoTrungTam = [10.368422344066985, 105.43320325646403]; 
    let mucZoom = 14; 
    var map = L.map('map-container').setView(toaDoTrungTam, mucZoom);

    //Sử dụng bản đồ nền
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    //LẤY DỮ LIỆU TỪ API VÀ VẼ LÊN BẢN ĐỒ
    let danhSachGoc = [];
    let markerLayer = L.layerGroup().addTo(map);

    fetch('/api/diem-ket-noi')
        .then(response => response.json())
        .then(data => {
            danhSachGoc = data;
            veCacDiemLenBanDo(danhSachGoc);
            
            //Cập nhật nhãn đếm số lượng điểm
            let labelSoLuong = document.getElementById('so-luong-diem-bando');
            if(labelSoLuong) labelSoLuong.innerText = danhSachGoc.length;
        })
        .catch(err => console.error("Lỗi khi tải dữ liệu API:", err));

    function veCacDiemLenBanDo(danhSachDiem) {
        markerLayer.clearLayers();

        danhSachDiem.forEach(diem => {
            //Bỏ qua nếu dữ liệu lỗi không có tọa độ
            if(!diem.vi_tri || !diem.vi_tri.coordinates) return;

            let kinh_do = diem.vi_tri.coordinates[0];
            let vi_do = diem.vi_tri.coordinates[1];
            let mau_trang_thai = diem.trang_thai_ket_noi.mau_sac;

            let ma_mau = "#6c757d";
            if (mau_trang_thai === "Xanh") ma_mau = "#198754";
            else if (mau_trang_thai === "Đỏ") ma_mau = "#dc3545";
            else if (mau_trang_thai === "Vàng") ma_mau = "#ffc107";

            let marker = L.circleMarker([vi_do, kinh_do], {
                radius: 8, fillColor: ma_mau, color: "#ffffff",
                weight: 2, opacity: 1, fillOpacity: 0.9
            });

            let noi_dung_popup = `
                <div style="font-family: Arial; min-width: 150px;">
                    <h6 style="color: #0072BC; margin-bottom: 5px;"><b>${diem.ten_khach_hang}</b></h6>
                    <hr style="margin: 5px 0;">
                    <b>Loại:</b> ${diem.loai_khach_hang}<br>
                    <b>Địa chỉ:</b> ${diem.dia_chi}<br>
                    <b>Tín hiệu:</b> ${diem.trang_thai_ket_noi.cuong_do_tin_hieu} %<br>
                    <b>Ping:</b> ${diem.trang_thai_ket_noi.do_tre_ping_ms ? diem.trang_thai_ket_noi.do_tre_ping_ms + ' ms' : 'N/A'}<br>
                </div>
            `;
            marker.bindPopup(noi_dung_popup);
            markerLayer.addLayer(marker);
        });
    }

    //CÁC HÀM XỬ LÝ LỌC DỮ LIỆU
    window.xoaBoLoc = function () {
        document.getElementById('input-tukhoa').value = '';
        document.getElementById('loai_tatca').checked = true;
        
        document.querySelectorAll('.filter-khuvuc').forEach(cb => cb.checked = false);
        locDuLieu();
    }

    window.locDuLieu = function () {
        let tuKhoa = document.getElementById('input-tukhoa').value.toLowerCase();
        let radioLoaiDuocChon = document.querySelector('.filter-loai:checked');
        let loaiDuocChon = radioLoaiDuocChon ? radioLoaiDuocChon.value : "";
        let khuVucDuocChon = Array.from(document.querySelectorAll('.filter-khuvuc:checked')).map(cb => cb.value);

        let duLieuDaLoc = danhSachGoc.filter(diem => {
            let khopTuKhoa = diem.ten_khach_hang.toLowerCase().includes(tuKhoa) ||
                             (diem.dia_chi && diem.dia_chi.toLowerCase().includes(tuKhoa));
            let khopLoai = (loaiDuocChon === "") || (diem.loai_khach_hang === loaiDuocChon);
            let khopKhuVuc = khuVucDuocChon.length === 0 || khuVucDuocChon.some(kv => diem.dia_chi && diem.dia_chi.includes(kv));

            return khopTuKhoa && khopLoai && khopKhuVuc;
        });

        veCacDiemLenBanDo(duLieuDaLoc);

        //Cập nhật nhãn đếm số lượng trên giao diện
        let labelSoLuong = document.getElementById('so-luong-diem-bando');
        if(labelSoLuong) labelSoLuong.innerText = duLieuDaLoc.length;
    }
});