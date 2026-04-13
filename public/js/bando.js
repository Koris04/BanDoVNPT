document.addEventListener('DOMContentLoaded', function () {
    //1. Khởi tạo bản đồ
    document.getElementById('map-container').innerHTML = '';

    let toaDoTrungTam = [10.368422344066985, 105.43320325646403];
    let mucZoom = 14;
    var map = L.map('map-container').setView(toaDoTrungTam, mucZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let danhSachGoc = [];

    //2. Khai báo Layer
    let khachHangLayer = L.layerGroup().addTo(map);
    let splitter1_4Layer = L.layerGroup().addTo(map);
    let splitter1_16Layer = L.layerGroup().addTo(map);
    let capQuangLayer = L.layerGroup().addTo(map);
    let vnptServerLayer = L.layerGroup().addTo(map);

    //3. Định nghĩa các biểu tượng tùy chỉnh
    const iconVNPTServer = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #dc3545; color: white; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.4);">
                 <i class="bi bi-hdd-network-fill" style="font-size: 1.1rem;"></i>
               </div>`,
        iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -17]
    });

    const iconSplitter1_4 = L.divIcon({
        className: 'custom-div-icon',
        html: `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <polygon points="12,2 22,20 2,20" fill="#000000" stroke="#ffffff" stroke-width="1.5"/>
               </svg>`,
        iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -12]
    });

    const iconSplitter1_16 = L.divIcon({
        className: 'custom-div-icon',
        html: `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <polygon points="12,2 17,20 7,20" fill="#000000" stroke="#ffffff" stroke-width="1.5"/>
               </svg>`,
        iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -12]
    });

    //4. Gọi API và xử lý dữ liệu
    fetch('/api/diem-ket-noi')
        .then(response => {
            if (!response.ok) throw new Error('Lỗi máy chủ hoặc mất kết nối Database');
            return response.json();
        })
        .then(data => {
            danhSachGoc = data;
            veCacDiemLenBanDo(danhSachGoc);

            let labelSoLuong = document.getElementById('so-luong-diem-bando');
            if (labelSoLuong) labelSoLuong.innerText = danhSachGoc.length;
        })
        .catch(err => {
            console.error("Lỗi khi tải dữ liệu API:", err);
            let modalLoi = new bootstrap.Modal(document.getElementById('modalLoiMongoDB'));
            modalLoi.show();
        });

    //5. Hàm vẽ các điểm lên bản đồ
    function veCacDiemLenBanDo(danhSachDiem) {
        // Xóa dữ liệu cũ của các lớp
        khachHangLayer.clearLayers();
        splitter1_4Layer.clearLayers();
        splitter1_16Layer.clearLayers();
        capQuangLayer.clearLayers();
        vnptServerLayer.clearLayers();

        const drawnSplitters = new Set();
        const drawnLinks = new Set();

        //Vẽ tổng đài VNPT (Lớp riêng, luôn hiển thị)
        const vnptServerLat = 10.392082023345424;
        const vnptServerLng = 105.43494757572051;

        let serverMarker = L.marker([vnptServerLat, vnptServerLng], { icon: iconVNPTServer })
            .bindPopup(`
                <div style="text-align: center;">
                    <h6 class="text-danger fw-bold mb-0"><i class="bi bi-server"></i> TỔNG ĐÀI VNPT</h6>
                    <small class="text-muted">Trung tâm điều hành mạng</small>
                </div>
            `);
        vnptServerLayer.addLayer(serverMarker);

        //Vẽ các điểm khách hàng và hạ tầng liên quan
        danhSachDiem.forEach(diem => {
            if (!diem.vi_tri || !diem.vi_tri.coordinates) return;

            let kinh_do = diem.vi_tri.coordinates[0];
            let vi_do = diem.vi_tri.coordinates[1];
            let mau_trang_thai = diem.trang_thai_ket_noi.mau_sac;

            let ma_mau = "#6c757d";
            if (mau_trang_thai === "Xanh") ma_mau = "#198754";
            else if (mau_trang_thai === "Đỏ") ma_mau = "#dc3545";

            //1. Vẽ điểm Khách hàng
            let marker = L.circleMarker([vi_do, kinh_do], {
                radius: 8, fillColor: ma_mau, color: "#ffffff",
                weight: 2, opacity: 1, fillOpacity: 0.9
            });

            let noi_dung_popup = `
                <div style="font-family: Arial; min-width: 150px;">
                    <h6 style="color: #0072BC; margin-bottom: 5px;"><b>${diem.ten_khach_hang}</b></h6>
                    <hr style="margin: 5px 0;">
                    <b>Địa chỉ:</b> ${diem.dia_chi}<br>
                    <b>Trạng thái:</b> <span style="color: ${ma_mau}; font-weight: bold;">${diem.trang_thai_ket_noi.mau_sac}</span><br>
                </div>
            `;
            marker.bindPopup(noi_dung_popup);
            khachHangLayer.addLayer(marker);

            //2. Vẽ Hạ tầng
            if (diem.splitter_id && diem.splitter_id.vi_tri) {
                let sp16KinhDo = diem.splitter_id.vi_tri.coordinates[0];
                let sp16ViDo = diem.splitter_id.vi_tri.coordinates[1];
                let sp16Id = diem.splitter_id._id;

                //Tủ 1:16
                if (!drawnSplitters.has(sp16Id)) {
                    let sp16Marker = L.marker([sp16ViDo, sp16KinhDo], { icon: iconSplitter1_16 });
                    sp16Marker.bindPopup(`<h6 class="text-primary fw-bold mb-0">${diem.splitter_id.ten_splitter}</h6>`);
                    splitter1_16Layer.addLayer(sp16Marker);
                    drawnSplitters.add(sp16Id);
                }

                //Cáp khách hàng
                let capKhachHang = L.polyline([[vi_do, kinh_do], [sp16ViDo, sp16KinhDo]], {
                    color: ma_mau, weight: 2, opacity: 0.7, dashArray: '4, 4'
                });
                capQuangLayer.addLayer(capKhachHang);

                //Tủ 1:4
                if (diem.splitter_id.splitter_cha_id && diem.splitter_id.splitter_cha_id.vi_tri) {
                    let sp4 = diem.splitter_id.splitter_cha_id;
                    let sp4KinhDo = sp4.vi_tri.coordinates[0];
                    let sp4ViDo = sp4.vi_tri.coordinates[1];
                    let sp4Id = sp4._id;

                    if (!drawnSplitters.has(sp4Id)) {
                        let sp4Marker = L.marker([sp4ViDo, sp4KinhDo], { icon: iconSplitter1_4 });
                        sp4Marker.bindPopup(`<h6 class="text-danger fw-bold mb-0">${sp4.ten_splitter}</h6>`);
                        splitter1_4Layer.addLayer(sp4Marker);
                        drawnSplitters.add(sp4Id);

                        let capTruc = L.polyline([[vnptServerLat, vnptServerLng], [sp4ViDo, sp4KinhDo]], {
                            color: '#0072BC', weight: 4, opacity: 0.8
                        });
                        capQuangLayer.addLayer(capTruc);
                    }

                    let linkTuId = sp4Id + '-' + sp16Id;
                    if (!drawnLinks.has(linkTuId)) {
                        let capNhanh = L.polyline([[sp4ViDo, sp4KinhDo], [sp16ViDo, sp16KinhDo]], {
                            color: '#198754', weight: 3, opacity: 0.7
                        });
                        capQuangLayer.addLayer(capNhanh);
                        drawnLinks.add(linkTuId);
                    }
                }
            }
        });
    }

    //6. Xử lý chuyển lớp hiển thị
    window.chuyenLayer = function (loai) {
        document.querySelectorAll('.btn-layer').forEach(btn => btn.classList.remove('active'));
        document.getElementById('btn-layer-' + loai).classList.add('active');

        //Bỏ toàn bộ các lớp, trừ lớp VNPT Server
        map.removeLayer(khachHangLayer);
        map.removeLayer(splitter1_4Layer);
        map.removeLayer(splitter1_16Layer);
        map.removeLayer(capQuangLayer);
        //Gắn lại lớp tùy theo nút được chọn
        if (loai === 'tatca') {
            map.addLayer(khachHangLayer);
            map.addLayer(splitter1_4Layer);
            map.addLayer(splitter1_16Layer);
            map.addLayer(capQuangLayer); //Hiện lại đường cáp liên kết
        }
        else if (loai === 'khachhang') {
            map.addLayer(khachHangLayer);
        }
        else if (loai === 'sp4') {
            map.addLayer(splitter1_4Layer);
        }
        else if (loai === 'sp16') {
            map.addLayer(splitter1_16Layer);
        }
    };
    window.xoaBoLoc = function () { /*...*/ }
    window.locDuLieu = function () { /*...*/ }
});