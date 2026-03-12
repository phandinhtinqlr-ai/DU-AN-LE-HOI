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
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Initialize default settings if not exists
const defaultSettings = [
  { key: 'festivals', value: JSON.stringify(['Mùa Xuân', 'Ẩm Thực và Bia', 'Mùa Thu', 'Mùa Đông']) },
  { key: 'areas', value: JSON.stringify(['Mặt Trời', 'Mặt Trăng', 'Diệu Kỳ', 'Nguồn Cội']) },
  { key: 'stages', value: JSON.stringify(['Khảo sát', 'Lên ý tưởng thiết kế', 'Gia công sản phẩm', 'Thi công cảnh quan', 'Bàn giao']) },
  { key: 'products', value: JSON.stringify(['Cây xi măng', 'Khung khối tròn', 'Tượng chú tiểu', 'Chậu', 'Chuồng chim gỗ', 'Chuồng chim sắt', 'Mô hình sóc', 'Mô hình chim']) },
  { key: 'productStatuses', value: JSON.stringify(['Đang gia công', 'Hoàn thành', 'Đã bàn giao']) },
  { key: 'workStatuses', value: JSON.stringify(['Đang thực hiện', 'Chậm tiến độ', 'Hoàn thành']) }
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
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, JSON.stringify(value));
  broadcast({ type: 'SETTINGS_UPDATE', key, value });
  res.json({ success: true });
});

// WebSocket Broadcast
function broadcast(data: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// API Routes
app.get("/api/reports", (req, res) => {
  const reports = db.prepare("SELECT * FROM reports ORDER BY reportDate DESC").all();
  res.json(reports.map((r: any) => ({ ...r, photos: JSON.parse(r.photos || '[]') })));
});

app.post("/api/reports", (req, res) => {
  const { 
    reportDate, reporter, workType, festival = null, area, stage, 
    productType = null, quantity = 0, status = 'Đang thực hiện', 
    progress = 0, notes = '', photos = [] 
  } = req.body;
  
  try {
    const info = db.prepare(`
      INSERT INTO reports (reportDate, reporter, workType, festival, area, stage, productType, quantity, status, progress, notes, photos)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(reportDate, reporter, workType, festival, area, stage, productType, quantity, status, progress, notes, JSON.stringify(photos));
    
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
    reportDate, reporter, workType, festival = null, area, stage, 
    productType = null, quantity = 0, status = 'Đang thực hiện', 
    progress = 0, notes = '', photos = [] 
  } = req.body;

  try {
    db.prepare(`
      UPDATE reports SET 
        reportDate = ?, reporter = ?, workType = ?, festival = ?, area = ?, 
        stage = ?, productType = ?, quantity = ?, status = ?, progress = ?, 
        notes = ?, photos = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(reportDate, reporter, workType, festival, area, stage, productType, quantity, status, progress, notes, JSON.stringify(photos), id);
    
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
  const totalTasks = db.prepare("SELECT COUNT(*) as count FROM reports").get() as any;
  const avgProgress = db.prepare("SELECT AVG(progress) as avg FROM reports WHERE stage != 'Gia công sản phẩm'").get() as any;
  const productsCompleted = db.prepare("SELECT SUM(quantity) as sum FROM reports WHERE stage = 'Gia công sản phẩm' AND status = 'Hoàn thành'").get() as any;
  const reportsToday = db.prepare("SELECT COUNT(*) as count FROM reports WHERE date(reportDate) = date('now')").get() as any;

  res.json({
    totalTasks: totalTasks.count || 0,
    avgProgress: Math.round(avgProgress.avg || 0),
    productsCompleted: productsCompleted.sum || 0,
    reportsToday: reportsToday.count || 0
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
