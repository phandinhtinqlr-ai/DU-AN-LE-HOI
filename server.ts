import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const PORT = 3000;

// Database Setup
const db = new Database("construction_logs.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module TEXT DEFAULT 'Lễ hội',
    reportDate TEXT,
    reporter TEXT,
    workType TEXT,
    festival TEXT,
    area TEXT,
    stage TEXT,
    productType TEXT,
    quantity INTEGER,
    status TEXT,
    progress INTEGER,
    notes TEXT,
    photos TEXT,
    beforePhotos TEXT,
    afterPhotos TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeCode TEXT UNIQUE,
    citizenId TEXT UNIQUE,
    fullName TEXT,
    employeeType TEXT,
    gender TEXT,
    dateOfBirth TEXT,
    joinDate TEXT,
    workStatus TEXT,
    staffLevel TEXT,
    teamGroup TEXT,
    address TEXT,
    profileImageUrl TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Migration: Add missing columns if they don't exist
const columnsToEnsure = [
  { name: 'module', type: "TEXT DEFAULT 'Lễ hội'" },
  { name: 'constructionTeam', type: 'TEXT' },
  { name: 'shift', type: 'TEXT' },
  { name: 'location', type: 'TEXT' },
  { name: 'landZone', type: 'TEXT' },
  { name: 'treeType', type: 'TEXT' },
  { name: 'treeSource', type: 'TEXT' },
  { name: 'treeClassification', type: 'TEXT' },
  { name: 'treeQuantity', type: 'INTEGER' },
  { name: 'constructionHours', type: 'REAL' },
  { name: 'workerCount', type: 'INTEGER' },
  { name: 'manDays', type: 'REAL' },
  { name: 'beforePhotos', type: 'TEXT' },
  { name: 'afterPhotos', type: 'TEXT' },
  { name: 'maintenanceType', type: 'TEXT' },
  { name: 'customMaintenanceType', type: 'TEXT' },
  { name: 'plantCategory', type: 'TEXT' },
  { name: 'unitType', type: 'TEXT' },
  { name: 'customUnitType', type: 'TEXT' },
  { name: 'plantStatus', type: 'TEXT' }
];

columnsToEnsure.forEach(col => {
  try {
    db.exec(`ALTER TABLE reports ADD COLUMN ${col.name} ${col.type}`);
    console.log(`Added column ${col.name} to reports table`);
  } catch (error: any) {
    if (!error.message.includes('duplicate column name')) {
      console.error(`Error adding column ${col.name}:`, error.message);
    }
  }
});

// Initialize default settings if not exists
const defaultSettings = [
  { key: 'festivals', value: JSON.stringify(['Mùa Xuân', 'Ẩm Thực và Bia', 'Mùa Thu', 'Mùa Đông']) },
  { key: 'areas', value: JSON.stringify(['Mặt Trời', 'Mặt Trăng', 'Diệu Kỳ', 'Nguồn Cội']) },
  { key: 'stages', value: JSON.stringify(['Khảo sát', 'Lên ý tưởng thiết kế', 'Gia công sản phẩm', 'Thi công cảnh quan', 'Bàn giao']) },
  { key: 'products', value: JSON.stringify(['Cây xi măng', 'Khung khối tròn', 'Tượng chú tiểu', 'Chậu', 'Chuồng chim gỗ', 'Chuồng chim sắt', 'Mô hình sóc', 'Mô hình chim']) },
  { key: 'productStatuses', value: JSON.stringify(['Đang gia công', 'Hoàn thành', 'Đã bàn giao']) },
  { key: 'workStatuses', value: JSON.stringify(['Đang thực hiện', 'Chậm tiến độ', 'Hoàn thành']) },
  
  // Landscape specific settings
  { key: 'landZones', value: JSON.stringify(['Vùng đất 1', 'Vùng đất 2', 'Vùng đất 3', 'Vùng đất 4']) },
  { key: 'treeSources', value: JSON.stringify(['Cây mua ngoài', 'Sản xuất', 'Hasfarm']) },
  { key: 'treeClassifications', value: JSON.stringify(['Cây lớn', 'Cây bụi', 'Cây hoa thảm']) },
  { key: 'shifts', value: JSON.stringify(['Sáng', 'Chiều', 'Cả ngày']) },
  
  // Maintenance specific settings
  { key: 'maintenanceTypes', value: JSON.stringify(['Tưới nước', 'Cắt tỉa', 'Bón phân', 'Phun thuốc BVTV', 'Nhổ cỏ', 'Dọn vệ sinh cảnh quan', 'Thay cây chết', 'Kiểm tra hệ thống tưới', 'Khác']) },
  { key: 'plantCategories', value: JSON.stringify(['Cây lớn', 'Cây bụi', 'Cây hoa thảm', 'Thảm cỏ']) },
  { key: 'unitTypes', value: JSON.stringify(['Cây', 'm²', 'Bồn', 'Khu vực', 'Khác']) },
  { key: 'plantStatuses', value: JSON.stringify(['Tốt', 'Cần theo dõi', 'Cây yếu', 'Cây chết', 'Sâu bệnh']) },
  
  // HR specific settings
  { key: 'staffLevels', value: JSON.stringify(['Nhân viên', 'Tổ phó', 'Tổ trưởng', 'Giám sát', 'Chuyên viên', 'Khác']) },
  { key: 'teamGroups', value: JSON.stringify(['Văn phòng', 'Sản xuất', 'Thi công', 'Chăm sóc bảo dưỡng', 'Chuyên môn']) }
];

const insertSetting = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
defaultSettings.forEach(s => insertSetting.run(s.key, s.value));

app.use(express.json({ limit: '50mb' }));

// API Routes for Settings
app.get("/api/settings", (req, res) => {
  const settings = db.prepare("SELECT * FROM settings").all();
  const result = settings.reduce((acc: any, s: any) => {
    acc[s.key] = JSON.parse(s.value);
    return acc;
  }, {});
  res.json(result);
});

app.post("/api/settings", (req, res) => {
  const { key, value } = req.body;
  if (!key || !Array.isArray(value)) {
    return res.status(400).json({ error: "Dữ liệu cấu hình không hợp lệ" });
  }
  
  try {
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, JSON.stringify(value));
    broadcast({ type: 'SETTINGS_UPDATE', key, value });
    res.json({ success: true });
  } catch (error) {
    console.error("Database error in settings update:", error);
    res.status(500).json({ error: "Lỗi cơ sở dữ liệu khi lưu cấu hình" });
  }
});

// WebSocket Broadcast
function broadcast(data: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// API Routes for Employees
app.get("/api/employees", (req, res) => {
  const employees = db.prepare("SELECT * FROM employees ORDER BY createdAt DESC").all();
  res.json(employees);
});

app.post("/api/employees", (req, res) => {
  const { 
    employeeCode, citizenId, fullName, employeeType, gender, dateOfBirth, 
    joinDate, workStatus, staffLevel, teamGroup, address, profileImageUrl 
  } = req.body;
  
  try {
    // Check for duplicates
    const existingCode = db.prepare("SELECT id FROM employees WHERE employeeCode = ?").get(employeeCode);
    if (existingCode) return res.status(400).json({ error: "Mã nhân sự đã tồn tại" });
    
    const existingCCCD = db.prepare("SELECT id FROM employees WHERE citizenId = ?").get(citizenId);
    if (existingCCCD) return res.status(400).json({ error: "CCCD đã tồn tại" });

    const info = db.prepare(`
      INSERT INTO employees (
        employeeCode, citizenId, fullName, employeeType, gender, dateOfBirth, 
        joinDate, workStatus, staffLevel, teamGroup, address, profileImageUrl
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      employeeCode, citizenId, fullName, employeeType, gender, dateOfBirth, 
      joinDate, workStatus, staffLevel, teamGroup, address, profileImageUrl
    );
    
    const newEmployee = { id: info.lastInsertRowid, ...req.body };
    broadcast({ type: 'NEW_EMPLOYEE', payload: newEmployee });
    broadcast({ type: 'STATS_UPDATE' });
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Lỗi khi lưu hồ sơ nhân sự" });
  }
});

app.put("/api/employees/:id", (req, res) => {
  const { id } = req.params;
  const { 
    employeeCode, citizenId, fullName, employeeType, gender, dateOfBirth, 
    joinDate, workStatus, staffLevel, teamGroup, address, profileImageUrl 
  } = req.body;

  try {
    // Check for duplicates excluding current ID
    const existingCode = db.prepare("SELECT id FROM employees WHERE employeeCode = ? AND id != ?").get(employeeCode, id);
    if (existingCode) return res.status(400).json({ error: "Mã nhân sự đã tồn tại" });
    
    const existingCCCD = db.prepare("SELECT id FROM employees WHERE citizenId = ? AND id != ?").get(citizenId, id);
    if (existingCCCD) return res.status(400).json({ error: "CCCD đã tồn tại" });

    db.prepare(`
      UPDATE employees SET 
        employeeCode = ?, citizenId = ?, fullName = ?, employeeType = ?, 
        gender = ?, dateOfBirth = ?, joinDate = ?, workStatus = ?, 
        staffLevel = ?, teamGroup = ?, address = ?, profileImageUrl = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      employeeCode, citizenId, fullName, employeeType, gender, dateOfBirth, 
      joinDate, workStatus, staffLevel, teamGroup, address, profileImageUrl,
      id
    );
    
    const updatedEmployee = { id, ...req.body };
    broadcast({ type: 'UPDATE_EMPLOYEE', payload: updatedEmployee });
    broadcast({ type: 'STATS_UPDATE' });
    res.json(updatedEmployee);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật hồ sơ nhân sự" });
  }
});

app.delete("/api/employees/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM employees WHERE id = ?").run(req.params.id);
    broadcast({ type: 'STATS_UPDATE' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa hồ sơ nhân sự" });
  }
});

// API Routes
app.get("/api/reports", (req, res) => {
  const reports = db.prepare("SELECT * FROM reports ORDER BY reportDate DESC").all();
  res.json(reports.map((r: any) => ({ 
    ...r, 
    photos: JSON.parse(r.photos || '[]'),
    beforePhotos: JSON.parse(r.beforePhotos || '[]'),
    afterPhotos: JSON.parse(r.afterPhotos || '[]')
  })));
});

app.post("/api/reports", (req, res) => {
  const { 
    module = 'Lễ hội', reportDate, reporter, workType = null, festival = null, area, stage = null, 
    productType = null, quantity = 0, status = 'Đang thực hiện', 
    progress = 0, notes = '', photos = [], beforePhotos = [], afterPhotos = [],
    constructionTeam = null, shift = null, location = null, landZone = null,
    treeType = null, treeSource = null, treeClassification = null,
    treeQuantity = 0, constructionHours = 0, workerCount = 0, manDays = 0,
    maintenanceType = null, customMaintenanceType = null, plantCategory = null,
    unitType = null, customUnitType = null, plantStatus = null
  } = req.body;
  
  try {
    const info = db.prepare(`
      INSERT INTO reports (
        module, reportDate, reporter, workType, festival, area, stage, productType, quantity, status, progress, notes, photos, beforePhotos, afterPhotos,
        constructionTeam, shift, location, landZone, treeType, treeSource, treeClassification, treeQuantity, constructionHours, workerCount, manDays,
        maintenanceType, customMaintenanceType, plantCategory, unitType, customUnitType, plantStatus
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      module, reportDate, reporter, workType, festival, area, stage, productType, quantity, status, progress, notes, 
      JSON.stringify(photos), JSON.stringify(beforePhotos), JSON.stringify(afterPhotos),
      constructionTeam, shift, location, landZone, treeType, treeSource, treeClassification, treeQuantity, constructionHours, workerCount, manDays,
      maintenanceType, customMaintenanceType, plantCategory, unitType, customUnitType, plantStatus
    );
    
    const newReport = { id: info.lastInsertRowid, ...req.body };
    broadcast({ type: 'NEW_REPORT', payload: newReport });
    broadcast({ type: 'STATS_UPDATE' });
    res.status(201).json(newReport);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to save report" });
  }
});

app.put("/api/reports/:id", (req, res) => {
  const { id } = req.params;
  const { 
    module, reportDate, reporter, workType = null, festival = null, area, stage = null, 
    productType = null, quantity = 0, status = 'Đang thực hiện', 
    progress = 0, notes = '', photos = [], beforePhotos = [], afterPhotos = [],
    constructionTeam = null, shift = null, location = null, landZone = null,
    treeType = null, treeSource = null, treeClassification = null,
    treeQuantity = 0, constructionHours = 0, workerCount = 0, manDays = 0,
    maintenanceType = null, customMaintenanceType = null, plantCategory = null,
    unitType = null, customUnitType = null, plantStatus = null
  } = req.body;

  try {
    db.prepare(`
      UPDATE reports SET 
        module = ?, reportDate = ?, reporter = ?, workType = ?, festival = ?, area = ?, 
        stage = ?, productType = ?, quantity = ?, status = ?, progress = ?, 
        notes = ?, photos = ?, beforePhotos = ?, afterPhotos = ?,
        constructionTeam = ?, shift = ?, location = ?, landZone = ?, 
        treeType = ?, treeSource = ?, treeClassification = ?, 
        treeQuantity = ?, constructionHours = ?, workerCount = ?, manDays = ?,
        maintenanceType = ?, customMaintenanceType = ?, plantCategory = ?, 
        unitType = ?, customUnitType = ?, plantStatus = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      module, reportDate, reporter, workType, festival, area, stage, productType, quantity, status, progress, notes, 
      JSON.stringify(photos), JSON.stringify(beforePhotos), JSON.stringify(afterPhotos),
      constructionTeam, shift, location, landZone, treeType, treeSource, treeClassification, treeQuantity, constructionHours, workerCount, manDays,
      maintenanceType, customMaintenanceType, plantCategory, unitType, customUnitType, plantStatus,
      id
    );
    
    const updatedReport = { id, ...req.body };
    broadcast({ type: 'UPDATE_REPORT', payload: updatedReport });
    broadcast({ type: 'STATS_UPDATE' });
    res.json(updatedReport);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to update report" });
  }
});

app.delete("/api/reports/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM reports WHERE id = ?").run(req.params.id);
    broadcast({ type: 'STATS_UPDATE' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

// Stats API
app.get("/api/stats", (req, res) => {
  const totalTasks = db.prepare("SELECT COUNT(*) as count FROM reports WHERE module = 'Lễ hội'").get() as any;
  const avgProgress = db.prepare("SELECT AVG(progress) as avg FROM reports WHERE module = 'Lễ hội' AND stage != 'Gia công sản phẩm'").get() as any;
  
  // Sum quantity for all products that are NOT 'Đang gia công'
  const productsCompleted = db.prepare(`
    SELECT SUM(quantity) as sum 
    FROM reports 
    WHERE module = 'Lễ hội' AND stage = 'Gia công sản phẩm' 
    AND status != 'Đang gia công'
  `).get() as any;
  
  const reportsToday = db.prepare("SELECT COUNT(*) as count FROM reports WHERE module = 'Lễ hội' AND date(reportDate) = date('now')").get() as any;

  // Landscape Stats
  const landscapeStats = db.prepare(`
    SELECT 
      SUM(treeQuantity) as totalTrees,
      SUM(manDays) as totalManDays,
      SUM(constructionHours) as totalHours,
      SUM(workerCount) as totalWorkers
    FROM reports
    WHERE module = 'Cảnh quan'
  `).get() as any;

  // Maintenance Stats
  const maintenanceStats = db.prepare(`
    SELECT 
      COUNT(*) as totalReports,
      SUM(manDays) as totalManDays,
      COUNT(DISTINCT area) as totalAreas,
      SUM(quantity) as totalQuantity
    FROM reports
    WHERE module = 'Bảo dưỡng'
  `).get() as any;

  // Count photos for maintenance
  const maintenanceReports = db.prepare("SELECT photos FROM reports WHERE module = 'Bảo dưỡng'").all() as any[];
  const totalPhotos = maintenanceReports.reduce((acc, r) => acc + JSON.parse(r.photos || '[]').length, 0);

  const maintenanceToday = db.prepare("SELECT COUNT(*) as count FROM reports WHERE module = 'Bảo dưỡng' AND date(reportDate) = date('now')").get() as any;

  // HR Stats
  const hrStats = db.prepare(`
    SELECT 
      COUNT(*) as totalPersonnel,
      SUM(CASE WHEN employeeType = 'Nhân viên' THEN 1 ELSE 0 END) as totalEmployees,
      SUM(CASE WHEN employeeType = 'Công nhật' THEN 1 ELSE 0 END) as totalDailyWorkers,
      SUM(CASE WHEN workStatus = 'Đang làm việc' THEN 1 ELSE 0 END) as working,
      SUM(CASE WHEN workStatus = 'Tạm nghỉ' THEN 1 ELSE 0 END) as onLeave,
      SUM(CASE WHEN workStatus = 'Nghỉ việc' THEN 1 ELSE 0 END) as resigned
    FROM employees
  `).get() as any;

  res.json({
    totalTasks: totalTasks.count || 0,
    avgProgress: Math.round(avgProgress.avg || 0),
    productsCompleted: productsCompleted.sum || 0,
    reportsToday: reportsToday.count || 0,
    landscape: {
      totalTrees: landscapeStats.totalTrees || 0,
      totalManDays: Math.round((landscapeStats.totalManDays || 0) * 10) / 10,
      totalHours: landscapeStats.totalHours || 0,
      totalWorkers: landscapeStats.totalWorkers || 0
    },
    maintenance: {
      totalReports: maintenanceToday.count || 0,
      totalManDays: Math.round((maintenanceStats.totalManDays || 0) * 10) / 10,
      totalAreas: maintenanceStats.totalAreas || 0,
      totalQuantity: maintenanceStats.totalQuantity || 0,
      totalPhotos: totalPhotos
    },
    hr: {
      totalPersonnel: hrStats.totalPersonnel || 0,
      totalEmployees: hrStats.totalEmployees || 0,
      totalDailyWorkers: hrStats.totalDailyWorkers || 0,
      working: hrStats.working || 0,
      onLeave: hrStats.onLeave || 0,
      resigned: hrStats.resigned || 0
    }
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
