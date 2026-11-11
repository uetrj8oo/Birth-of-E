# -*- coding: utf-8 -*-
"""Đồng bộ danh sách thành viên từ file .xlsx sang data/members.js.
Cách dùng:  python sync-members.py "[EVENT] SINH NHẬT THÀNH VIÊN ĐỘI 2026 - 2027.xlsx"
(cần: pip install openpyxl). Cột PHÂN BAN (nếu có thêm vào xlsx) sẽ được ưu tiên;
nếu không có, giữ phân ban cũ trong data/members.js theo họ tên."""
import re, sys, json, os, hashlib
import openpyxl

xlsx = sys.argv[1] if len(sys.argv) > 1 else next(f for f in os.listdir('.') if f.lower().endswith('.xlsx'))
out = os.path.join('data', 'members.js')

old_dept = {}
if os.path.exists(out):
    for m in re.finditer(r'name:\s*"([^"]+)".*?dept:\s*"([^"]+)"', open(out, encoding='utf-8').read()):
        old_dept[m.group(1)] = m.group(2)

ws = openpyxl.load_workbook(xlsx, data_only=True).worksheets[0]
rows, month, hdr = [], '', {}
for r in ws.iter_rows(values_only=True):
    cells = [str(c).strip() if c is not None else '' for c in r]
    if 'MSSV' in cells and 'HỌ VÀ TÊN' in cells:
        hdr = {v: i for i, v in enumerate(cells) if v}
        continue
    if not hdr or not isinstance(r[hdr['STT']], (int, float)):
        continue
    if cells[hdr['THÁNG']]:
        month = cells[hdr['THÁNG']]
    name = cells[hdr['HỌ VÀ TÊN']]
    mssv = re.sub(r'\D', '', cells[hdr['MSSV']])
    dept = cells[hdr['PHÂN BAN']] if 'PHÂN BAN' in hdr and cells[hdr['PHÂN BAN']] else old_dept.get(name, 'Sự kiện')
    rows.append(dict(stt=int(r[hdr['STT']]), name=name, birthday=cells[hdr['NGÀY SINH']], month=month, mssv=mssv, dept=dept))

if not rows:
    sys.exit('LỖI: không đọc được thành viên nào. File xlsx cần có cột "MSSV" và "HỌ VÀ TÊN" ở dòng tiêu đề. Không ghi đè data/members.js.')
bad = [x for x in rows if not re.fullmatch(r'\d{8}', x['mssv'])]
dup = {m for m in (x['mssv'] for x in rows) if [y['mssv'] for y in rows].count(m) > 1}
if bad or dup:
    sys.exit(f'LỖI dữ liệu MSSV: sai định dạng={[b["name"] for b in bad]} trùng={dup}')

def js(x):
    q = lambda v: json.dumps(v, ensure_ascii=False)
    return ('    { stt: %d, name: %s, birthday: %s, month: %s, mssv: %s, dept: %s }'
            % (x['stt'], q(x['name']), q(x['birthday']), q(x['month']), q(x['mssv']), q(x['dept'])))
lines = ',\n'.join(js(x) for x in rows)
tail = '''

// Khóa cache trình duyệt tự đổi mỗi khi danh sách xlsx đổi -> không bao giờ dùng nhầm bản cũ
const MEMBERS_STORAGE_KEY = 'EVENT_UIT_MEMBERS_@@VER@@';

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
'''
head = f'// DANH SÁCH {len(rows)} THÀNH VIÊN - ĐỘI EVENT UIT (NHIỆM KỲ 2026 - 2027)\n// TỰ SINH TỪ FILE XLSX bằng sync-members.py - MSSV lấy theo file xlsx, đừng sửa tay.\nconst DEFAULT_MEMBERS = [\n'
ver = hashlib.md5(lines.encode('utf-8')).hexdigest()[:8]
os.makedirs('data', exist_ok=True)
open(out, 'w', encoding='utf-8').write(head + lines + '\n];' + tail.replace('@@VER@@', ver))
print(f'OK: {len(rows)} thành viên -> {out}')
