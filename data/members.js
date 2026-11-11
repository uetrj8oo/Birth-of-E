// DANH SÁCH 60 THÀNH VIÊN - ĐỘI EVENT UIT (NHIỆM KỲ 2026 - 2027)
// TỰ SINH TỪ FILE XLSX bằng sync-members.py - MSSV lấy theo file xlsx, đừng sửa tay.
const DEFAULT_MEMBERS = [
    { stt: 1, name: "Trần Ngọc Bảo Huy", birthday: "02/01/2006", month: "THÁNG 1", mssv: "24520702", dept: "Sự kiện" },
    { stt: 2, name: "Hồ Triển Minh", birthday: "03/01/2008", month: "THÁNG 1", mssv: "26521214", dept: "Truyền thông" },
    { stt: 3, name: "Hồ Minh Hiển", birthday: "05/01/2008", month: "THÁNG 1", mssv: "26520518", dept: "Truyền thông" },
    { stt: 4, name: "Trang Triệu Hồng Phúc", birthday: "07/01/2007", month: "THÁNG 1", mssv: "25521447", dept: "Sự kiện" },
    { stt: 5, name: "Hoàng Xuân Minh Trí", birthday: "09/01/2006", month: "THÁNG 1", mssv: "24521829", dept: "Sự kiện" },
    { stt: 6, name: "Tôn Ngọc Bảo Khôi", birthday: "18/01/2008", month: "THÁNG 1", mssv: "26520996", dept: "Truyền thông" },
    { stt: 7, name: "Đặng Nguyễn Lan Anh", birthday: "22/01/2007", month: "THÁNG 1", mssv: "25520040", dept: "Truyền thông" },
    { stt: 8, name: "Lê Thị Tuyết Anh", birthday: "28/01/2007", month: "THÁNG 1", mssv: "25520062", dept: "Sự kiện" },
    { stt: 9, name: "Trần Thị Thanh Thảo", birthday: "31/01/2006", month: "THÁNG 1", mssv: "24521651", dept: "Sự kiện" },
    { stt: 10, name: "Phạm Phương Ái Linh", birthday: "04/02/2006", month: "THÁNG 2", mssv: "24520967", dept: "Sự kiện" },
    { stt: 11, name: "Nguyễn Thị Thuỳ", birthday: "10/02/2006", month: "THÁNG 2", mssv: "24521754", dept: "Truyền thông" },
    { stt: 12, name: "Bùi Phan Giáng Trân", birthday: "20/02/2006", month: "THÁNG 2", mssv: "24521808", dept: "Sự kiện" },
    { stt: 13, name: "Trần Hữu Diệu", birthday: "25/02/2007", month: "THÁNG 2", mssv: "25520307", dept: "Sự kiện" },
    { stt: 14, name: "Trần Đình Thi", birthday: "12/03/2006", month: "THÁNG 3", mssv: "24521656", dept: "Sự kiện" },
    { stt: 15, name: "Nguyễn Phạm Phúc Kiệt", birthday: "15/03/2007", month: "THÁNG 3", mssv: "25520955", dept: "Sự kiện" },
    { stt: 16, name: "Đặng Thạch Thảo Vy", birthday: "18/03/2007", month: "THÁNG 3", mssv: "25522100", dept: "Truyền thông" },
    { stt: 17, name: "Nguyễn Anh Hoàng Dang", birthday: "19/03/2007", month: "THÁNG 3", mssv: "25520235", dept: "Sự kiện" },
    { stt: 18, name: "Hồ Thị Phương Thùy", birthday: "01/04/2006", month: "THÁNG 4", mssv: "24521751", dept: "Sự kiện" },
    { stt: 19, name: "Nguyễn Phạm Tuấn Hưng", birthday: "08/04/2007", month: "THÁNG 4", mssv: "25520642", dept: "Truyền thông" },
    { stt: 20, name: "Nguyễn Phúc An Khang", birthday: "09/04/2008", month: "THÁNG 4", mssv: "26520830", dept: "Sự kiện" },
    { stt: 21, name: "Nguyễn Xuân Tùng", birthday: "19/04/2008", month: "THÁNG 4", mssv: "26522209", dept: "Sự kiện" },
    { stt: 22, name: "Trần Văn Duy", birthday: "24/04/2007", month: "THÁNG 4", mssv: "25520450", dept: "Sự kiện" },
    { stt: 23, name: "La Hồ Bảo Trâm", birthday: "29/04/2007", month: "THÁNG 4", mssv: "25521878", dept: "Sự kiện" },
    { stt: 24, name: "Phạm Thị Anh Thư", birthday: "01/05/2006", month: "THÁNG 5", mssv: "24521729", dept: "Sự kiện" },
    { stt: 25, name: "Ngô Lê Ánh Dương", birthday: "04/05/2007", month: "THÁNG 5", mssv: "25520395", dept: "Sự kiện" },
    { stt: 26, name: "Nguyễn Văn Quốc Thịnh", birthday: "07/05/2006", month: "THÁNG 5", mssv: "24521699", dept: "Truyền thông" },
    { stt: 27, name: "Nguyễn Võ Anh Thư", birthday: "15/05/2007", month: "THÁNG 5", mssv: "25521811", dept: "Truyền thông" },
    { stt: 28, name: "Trần Đoàn Nguyên Ân", birthday: "17/05/2008", month: "THÁNG 5", mssv: "26520027", dept: "Truyền thông" },
    { stt: 29, name: "Nguyễn Thành Nam", birthday: "20/05/2007", month: "THÁNG 5", mssv: "25521167", dept: "Sự kiện" },
    { stt: 30, name: "Đỗ Hoàng Huy", birthday: "24/05/2007", month: "THÁNG 5", mssv: "25520682", dept: "Sự kiện" },
    { stt: 31, name: "Nguyễn Hữu Minh Tâm", birthday: "28/05/2008", month: "THÁNG 5", mssv: "26521811", dept: "Truyền thông" },
    { stt: 32, name: "Nguyễn Gia Huy", birthday: "01/06/2007", month: "THÁNG 6", mssv: "25520708", dept: "Sự kiện" },
    { stt: 33, name: "Lê Hoàng Bảo Trân", birthday: "04/06/2007", month: "THÁNG 6", mssv: "25521888", dept: "Sự kiện" },
    { stt: 34, name: "Trương Nguyễn Phú Nam", birthday: "07/06/2005", month: "THÁNG 6", mssv: "23520989", dept: "Sự kiện" },
    { stt: 35, name: "Thân Nhật Minh", birthday: "15/06/2006", month: "THÁNG 6", mssv: "24521085", dept: "Sự kiện" },
    { stt: 36, name: "Trần Lê Duy Tân", birthday: "16/06/2005", month: "THÁNG 6", mssv: "23521406", dept: "Sự kiện" },
    { stt: 37, name: "Lương Nhật Anh", birthday: "25/06/2007", month: "THÁNG 6", mssv: "25520063", dept: "Sự kiện" },
    { stt: 38, name: "Thái Phương Vinh", birthday: "25/06/2007", month: "THÁNG 6", mssv: "25522073", dept: "Sự kiện" },
    { stt: 39, name: "Nguyễn Minh Hiếu", birthday: "11/07/2008", month: "THÁNG 7", mssv: "26520549", dept: "Sự kiện" },
    { stt: 40, name: "Ngô Thanh Nhân", birthday: "12/07/2007", month: "THÁNG 7", mssv: "25521281", dept: "Truyền thông" },
    { stt: 41, name: "Huỳnh Ngọc Phước Thịnh", birthday: "11/08/2007", month: "THÁNG 8", mssv: "25521761", dept: "Sự kiện" },
    { stt: 42, name: "Huỳnh Phương Vy", birthday: "17/08/2007", month: "THÁNG 8", mssv: "25522103", dept: "Sự kiện" },
    { stt: 43, name: "Võ Duy Hoàng", birthday: "22/08/2007", month: "THÁNG 8", mssv: "25520610", dept: "Sự kiện" },
    { stt: 44, name: "Lê Nguyễn", birthday: "22/08/2007", month: "THÁNG 8", mssv: "25521234", dept: "Sự kiện" },
    { stt: 45, name: "Vũ Thành Nhân", birthday: "27/08/2008", month: "THÁNG 8", mssv: "26521460", dept: "Sự kiện" },
    { stt: 46, name: "Nguyễn Hữu Nghĩa", birthday: "07/09/2006", month: "THÁNG 9", mssv: "24521144", dept: "Sự kiện" },
    { stt: 47, name: "Cao Nguyễn Bảo Chương", birthday: "12/09/2007", month: "THÁNG 9", mssv: "25520209", dept: "Sự kiện" },
    { stt: 48, name: "Nguyễn Thị Lệ Quyên", birthday: "04/10/2006", month: "THÁNG 10", mssv: "24521500", dept: "Sự kiện" },
    { stt: 49, name: "Lê Ngọc Quỳnh Anh", birthday: "08/10/2008", month: "THÁNG 10", mssv: "26520057", dept: "Sự kiện" },
    { stt: 50, name: "Nguyễn Trung Nhân", birthday: "15/10/2007", month: "THÁNG 10", mssv: "25521293", dept: "Sự kiện" },
    { stt: 51, name: "Trần Hữu Trí", birthday: "20/10/2008", month: "THÁNG 10", mssv: "26522114", dept: "Sự kiện" },
    { stt: 52, name: "Trần Thạch Mỹ Tiên", birthday: "12/11/2008", month: "THÁNG 11", mssv: "26522027", dept: "Sự kiện" },
    { stt: 53, name: "Nguyễn Trần Thanh Hạ", birthday: "21/11/2008", month: "THÁNG 11", mssv: "26520457", dept: "Sự kiện" },
    { stt: 54, name: "Đặng Hồng Nhung", birthday: "25/11/2006", month: "THÁNG 11", mssv: "24521280", dept: "Sự kiện" },
    { stt: 55, name: "Nguyễn Thuỵ Vân Trang", birthday: "27/11/2006", month: "THÁNG 11", mssv: "24521818", dept: "Sự kiện" },
    { stt: 56, name: "Trà Ngô Vĩnh Khiêm", birthday: "02/12/2007", month: "THÁNG 12", mssv: "25520843", dept: "Sự kiện" },
    { stt: 57, name: "Nguyễn Khánh Quốc Cường", birthday: "07/12/2008", month: "THÁNG 12", mssv: "26520221", dept: "Sự kiện" },
    { stt: 58, name: "Nguyễn Tuấn Kiệt", birthday: "24/12/2007", month: "THÁNG 12", mssv: "25520958", dept: "Truyền thông" },
    { stt: 59, name: "Bùi Trí Nguyên", birthday: "25/12/2007", month: "THÁNG 12", mssv: "25521226", dept: "Sự kiện" },
    { stt: 60, name: "Trần Hoàng Ngọc Lan", birthday: "30/12/2006", month: "THÁNG 12", mssv: "24520944", dept: "Sự kiện" }
];

// Khóa cache trình duyệt tự đổi mỗi khi danh sách xlsx đổi -> không bao giờ dùng nhầm bản cũ
const MEMBERS_STORAGE_KEY = 'EVENT_UIT_MEMBERS_4c034432';

function getMemberList() {
    try {
        const stored = localStorage.getItem(MEMBERS_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {
        console.warn('Lỗi đọc danh sách thành viên:', e);
    }
    return DEFAULT_MEMBERS;
}

function saveMemberList(members) {
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
}
