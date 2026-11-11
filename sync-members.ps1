# Đồng bộ danh sách thành viên từ file .xlsx sang data\members.js (không cần cài Python/Excel)
# Cách chạy: chuột phải file này -> "Run with PowerShell"  (hoặc: powershell -ExecutionPolicy Bypass -File sync-members.ps1)
# File .xlsx phải nằm cùng thư mục với script này.
param([string]$Xlsx)
$ErrorActionPreference = 'Stop'
trap { Write-Host "LỖI: $($_.Exception.Message)" -ForegroundColor Red; Read-Host 'Nhấn Enter để đóng'; exit 1 }
Set-Location $PSScriptRoot
if (-not $Xlsx) { $Xlsx = (Get-ChildItem -Filter *.xlsx | Where-Object { $_.Name -notlike '~$*' } | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName }
Write-Host "Đọc file : $Xlsx"
Write-Host "Ghi vào  : $(Join-Path $PSScriptRoot 'data\members.js')"
if (-not $Xlsx) { throw 'Không tìm thấy file .xlsx trong thư mục này' }
$outPath = Join-Path $PSScriptRoot 'data\members.js'

# Giữ lại phân ban cũ theo họ tên
$oldDept = @{}
if (Test-Path $outPath) {
    foreach ($line in (Get-Content $outPath -Encoding UTF8)) {
        if ($line -match 'name:\s*"([^"]+)".*dept:\s*"([^"]+)"') { $oldDept[$Matches[1]] = $Matches[2] }
    }
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::OpenRead($Xlsx)
function Read-Entry($name) {
    $e = $zip.GetEntry($name)
    $sr = New-Object IO.StreamReader($e.Open(), [Text.Encoding]::UTF8)
    $d = New-Object Xml.XmlDocument
    $d.LoadXml($sr.ReadToEnd()); $sr.Close()
    return $d
}
$ssDoc = Read-Entry 'xl/sharedStrings.xml'
$shDoc = Read-Entry 'xl/worksheets/sheet1.xml'
$zip.Dispose()

$main = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
$n1 = New-Object Xml.XmlNamespaceManager($ssDoc.NameTable); $n1.AddNamespace('m', $main)
$n2 = New-Object Xml.XmlNamespaceManager($shDoc.NameTable); $n2.AddNamespace('m', $main)

$strings = @()
foreach ($si in $ssDoc.SelectNodes('//m:si', $n1)) {
    $strings += (($si.SelectNodes('.//m:t', $n1) | ForEach-Object { $_.InnerText }) -join '')
}

# Cột trong file: B=THÁNG, C=STT, D=HỌ VÀ TÊN, E=NGÀY SINH, F=MSSV
$rows = @(); $month = ''
foreach ($row in $shDoc.SelectNodes('//m:row', $n2)) {
    $cells = @{}
    foreach ($c in $row.SelectNodes('m:c', $n2)) {
        $col = ($c.GetAttribute('r') -replace '\d', '')
        $v = $c.SelectSingleNode('m:v', $n2)
        if ($v) {
            if ($c.GetAttribute('t') -eq 's') { $cells[$col] = $strings[[int]$v.InnerText] } else { $cells[$col] = $v.InnerText }
        }
    }
    $stt = [string]$cells['C']; $name = ([string]$cells['D']).Trim()
    if ($stt -notmatch '^\d+$' -or -not $name) { continue }
    if ($cells['B']) { $month = ([string]$cells['B']).Trim() }
    $dept = if ($oldDept.ContainsKey($name)) { $oldDept[$name] } else { 'Sự kiện' }
    $rows += [pscustomobject]@{
        stt = [int]$stt; name = $name; birthday = ([string]$cells['E']).Trim()
        month = $month; mssv = (([string]$cells['F']) -replace '\D', ''); dept = $dept
    }
}

$bad = $rows | Where-Object { $_.mssv -notmatch '^\d{8}$' }
if ($bad) { throw ('MSSV sai định dạng: ' + (($bad | ForEach-Object { $_.name }) -join ', ')) }
$dup = $rows | Group-Object mssv | Where-Object { $_.Count -gt 1 }
if ($dup) { throw ('MSSV bị trùng: ' + (($dup | ForEach-Object { $_.Name }) -join ', ')) }

$lines = $rows | ForEach-Object {
    '    {{ stt: {0}, name: "{1}", birthday: "{2}", month: "{3}", mssv: "{4}", dept: "{5}" }}' -f $_.stt, $_.name, $_.birthday, $_.month, $_.mssv, $_.dept
}
$head = "// DANH SÁCH $($rows.Count) THÀNH VIÊN - ĐỘI EVENT UIT (NHIỆM KỲ 2026 - 2027)`n// TỰ SINH TỪ FILE XLSX bằng sync-members.ps1 - MSSV lấy theo file xlsx, đừng sửa tay.`nconst DEFAULT_MEMBERS = [`n"
$tail = @'

];

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
'@
$ver = Get-Date -Format 'yyyyMMddHHmmss'
$text = $head + ($lines -join ",`n") + $tail.Replace('@@VER@@', $ver)
New-Item -ItemType Directory -Force -Path (Split-Path $outPath) | Out-Null
[IO.File]::WriteAllText($outPath, $text, (New-Object Text.UTF8Encoding $false))
Write-Host "OK: $($rows.Count) thành viên -> $outPath" -ForegroundColor Green
Write-Host "Cập nhật lúc: $((Get-Item $outPath).LastWriteTime)"
Read-Host 'Nhấn Enter để đóng'
