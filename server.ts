import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Permissive CORS middleware to ensure mobile devices and in-app browsers do not experience network blocks
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Path to file-based persistent DB
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Helper to get past dates relative to today (copied from src/data.ts for server initial seeding)
const getPastDateString = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
};

// Initial Database Seeding
const INITIAL_DB = {
  employees: [] as any[],
  attendance: [] as any[],
  notifications: [] as any[],
  shifts: [] as any[],
  customLogo: null as string | null,
  hrUsername: "admin",
  hrPassword: "123456",
  deletedAttendanceIds: [] as string[],
  deletedEmployeeIds: [] as string[],
  enableAutoNotifications: true,
  enableQrCodeSystem: true,
  checkInStart: "07:30",
  checkInDeadline: "08:30",
  checkOutStart: "15:40",
  checkOutDeadline: "18:00",
  enableGpsRestriction: false,
  enableNetworkRestriction: false,
  officeLat: 17.9638,
  officeLng: 102.6132,
  officeRadius: 200,
  sentAutomatedNotifs: [] as string[]
};

// Ensure database file and directory exist
function initDatabase() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), "utf8");
  }
}

initDatabase();

// Load / Save database helpers
function readDB() {
  try {
    initDatabase();
    const content = fs.readFileSync(DB_FILE, "utf8");
    const data = JSON.parse(content);
    
    // If database is empty or has no employees, initialize with empty arrays
    let modified = false;
    if (!data.employees) {
      data.employees = [];
      modified = true;
    }

    // Dynamically filter out any preloaded mock/example employees (emp-1 to emp-5, emp-101 to emp-105) and related data
    const mockEmployeeIds = [
      "emp-1", "emp-2", "emp-3", "emp-4", "emp-5", 
      "emp-101", "emp-102", "emp-103", "emp-104", "emp-105",
      "emp-1782874228225", "emp-1782874372513", "emp-1782874302793", 
      "emp-1782873883552", "emp-1782872758632", "emp-1782874270257"
    ];
    
    if (data.employees && Array.isArray(data.employees)) {
      const originalCount = data.employees.length;
      data.employees = data.employees.filter((e: any) => !mockEmployeeIds.includes(e.id));
      if (data.employees.length !== originalCount) modified = true;
    }
    if (data.attendance && Array.isArray(data.attendance)) {
      const originalCount = data.attendance.length;
      data.attendance = data.attendance.filter((a: any) => {
        if (mockEmployeeIds.includes(a.employeeId)) return false;
        return true;
      });
      if (data.attendance.length !== originalCount) modified = true;
    }
    if (data.notifications && Array.isArray(data.notifications)) {
      const originalCount = data.notifications.length;
      data.notifications = data.notifications.filter((n: any) => !mockEmployeeIds.includes(n.employeeId));
      if (data.notifications.length !== originalCount) modified = true;
    }
    if (data.shifts && Array.isArray(data.shifts)) {
      const originalCount = data.shifts.length;
      data.shifts = data.shifts.filter((s: any) => !mockEmployeeIds.includes(s.employeeId));
      if (data.shifts.length !== originalCount) modified = true;
    }

    // Ensure hrUsername and hrPassword are set in the file if missing, so they never get lost or reset
    if (data.hrUsername === undefined) {
      data.hrUsername = "admin";
      modified = true;
    }
    if (data.hrPassword === undefined) {
      data.hrPassword = "123456";
      modified = true;
    }

    // Ensure deleted tracking arrays exist
    if (data.deletedAttendanceIds === undefined) {
      data.deletedAttendanceIds = [];
      modified = true;
    }
    if (data.deletedEmployeeIds === undefined) {
      data.deletedEmployeeIds = [];
      modified = true;
    }

    // Ensure notification and schedule limits exist
    if (data.enableAutoNotifications === undefined) {
      data.enableAutoNotifications = true;
      modified = true;
    }
    if (data.enableQrTimeRestriction === undefined) {
      data.enableQrTimeRestriction = true;
      modified = true;
    }
    if (data.enableQrCodeSystem === undefined) {
      data.enableQrCodeSystem = true;
      modified = true;
    }
    if (data.checkInStart === undefined) {
      data.checkInStart = "07:30";
      modified = true;
    }
    if (data.checkInDeadline === undefined) {
      data.checkInDeadline = "08:30";
      modified = true;
    }
    if (data.checkOutStart === undefined) {
      data.checkOutStart = "15:40";
      modified = true;
    }
    if (data.checkOutDeadline === undefined) {
      data.checkOutDeadline = "18:00";
      modified = true;
    }
    if (data.sentAutomatedNotifs === undefined) {
      data.sentAutomatedNotifs = [];
      modified = true;
    }
    if (data.shifts === undefined) {
      data.shifts = [];
      modified = true;
    }

    if (modified) {
      writeDB(data);
    }
    
    return data;
  } catch (error) {
    console.error("Error reading db.json", error);
    return INITIAL_DB;
  }
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to db.json", error);
  }
}

// ---------------- API ENDPOINTS ----------------

// Get status check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", version: "1.0.0" });
});

// Check client network details server-side (bypass CORS and mobile browser blocks)
app.get("/api/check-network", async (req, res) => {
  const clientIp = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "").split(",")[0].trim();
  const clientTimezone = (req.query.timezone as string || "").trim();
  const clientLang = (req.query.language as string || "").trim();

  // 1. If it's a local or private IP, auto-approve as Lao Telecom simulation
  const isPrivateIp = 
    clientIp === "127.0.0.1" || 
    clientIp === "::1" || 
    clientIp.startsWith("10.") || 
    clientIp.startsWith("192.168.") || 
    clientIp.startsWith("172.16.") || 
    clientIp.startsWith("172.31.") ||
    !clientIp;

  if (isPrivateIp) {
    return res.json({
      isLaoNetwork: true,
      ispName: "Lao Telecom (Simulated Local/Dev IP)",
      countryCode: "LA",
      clientIp
    });
  }

  // Helper to check if ISP string matches LTC, Unitel, TPlus, Planet or Sky Telecom in Laos
  const isLaoISP = (isp: string, country: string): boolean => {
    const lowerIsp = isp.toLowerCase();
    const isLtc = lowerIsp.includes("lao telecom") || lowerIsp.includes("laotel") || lowerIsp.includes("lao telecommunication") || lowerIsp.includes("ltc");
    const isUnitel = lowerIsp.includes("star telecom") || lowerIsp.includes("unitel") || lowerIsp.includes("viettel") || lowerIsp.includes("vietel") || lowerIsp.includes("startelecom");
    const isTplus = lowerIsp.includes("tplus") || lowerIsp.includes("t-plus") || lowerIsp.includes("beeline") || lowerIsp.includes("vimpelcom") || lowerIsp.includes("tplus digital");
    const isPlanet = lowerIsp.includes("planet") || lowerIsp.includes("sky telecom") || lowerIsp.includes("sky-telecom");
    
    return country === "LA" || isLtc || isUnitel || isTplus || isPlanet;
  };

  // We will race or fall back sequentially on high-performance GeoIP APIs
  // Using short AbortController timeouts to ensure the API responds within 1.5 seconds
  const fetchWithTimeout = async (url: string, timeoutMs = 1500) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  };

  // 1. Try ipwho.is (Server-side, highly reliable and rich details)
  try {
    const response = await fetchWithTimeout(`https://ipwho.is/${clientIp}`);
    const data = await response.json();
    if (data && data.success) {
      const country = (data.country_code || "").toUpperCase();
      const isp = (data.connection?.isp || data.connection?.org || "Lao Network");
      const isLao = isLaoISP(isp, country);
      return res.json({
        isLaoNetwork: isLao,
        ispName: isp,
        countryCode: country,
        clientIp
      });
    }
  } catch (err) {
    console.warn("Server check-network ipwho.is failed, trying freeipapi...", err);
  }

  // 2. Try freeipapi.com (Uncapped, highly reliable, supports IP lookup)
  try {
    const response = await fetchWithTimeout(`https://freeipapi.com/api/json/${clientIp}`);
    const data = await response.json();
    if (data && data.countryCode) {
      const country = (data.countryCode || "").toUpperCase();
      const isp = (data.ispName || data.orgName || "Lao Network");
      const isLao = isLaoISP(isp, country);
      return res.json({
        isLaoNetwork: isLao,
        ispName: isp,
        countryCode: country,
        clientIp
      });
    }
  } catch (err) {
    console.warn("Server check-network freeipapi failed, trying ip-api.com...", err);
  }

  // 3. Try ip-api.com (Free, extremely reliable but HTTP-only, which is fine server-to-server)
  try {
    const response = await fetchWithTimeout(`http://ip-api.com/json/${clientIp}`);
    const data = await response.json();
    if (data && data.status === "success") {
      const country = (data.countryCode || "").toUpperCase();
      const isp = (data.isp || data.org || "Lao Network");
      const isLao = isLaoISP(isp, country);
      return res.json({
        isLaoNetwork: isLao,
        ispName: isp,
        countryCode: country,
        clientIp
      });
    }
  } catch (err) {
    console.warn("Server check-network ip-api.com failed", err);
  }

  // 4. Fallback checking: timezone or browser parameters to avoid false blocks on API outage
  const isLaoTimezone = clientTimezone.includes("Vientiane") || clientTimezone.includes("Bangkok");
  const isLaoLang = clientLang.toLowerCase().includes("lo") || clientLang.toLowerCase().includes("la");

  if (isLaoTimezone || isLaoLang) {
    return res.json({
      isLaoNetwork: true,
      ispName: "Lao Network (Verified via Device Timezone/Language)",
      countryCode: "LA",
      clientIp
    });
  }

  // If everything fails and we can't determine, default to true so we never block genuine users during an API outage
  return res.json({
    isLaoNetwork: true,
    ispName: "Lao Internet (Automated Bypass)",
    countryCode: "LA",
    clientIp
  });
});

// Employees CRUD
app.get("/api/employees", (req, res) => {
  const db = readDB();
  res.json(db.employees);
});

app.post("/api/employees", (req, res) => {
  const db = readDB();
  const newEmployee = req.body;
  
  if (newEmployee.id && db.deletedEmployeeIds && db.deletedEmployeeIds.includes(newEmployee.id)) {
    res.json({ ignored: true, message: "ພະນັກງານນີ້ຖືກລົບໂດຍ HR ແລ້ວ" });
    return;
  }

  if (!newEmployee.id) {
    newEmployee.id = `emp-${Date.now()}`;
  }
  
  // Prevent duplicate code
  if (db.employees.some((e: any) => e.employeeCode.toUpperCase() === newEmployee.employeeCode.toUpperCase())) {
    res.status(400).json({ error: "ລະຫັດພະນັກງານນີ້ມີໃນລະບົບແລ້ວ" });
    return;
  }

  db.employees.push(newEmployee);
  writeDB(db);
  res.status(201).json(newEmployee);
});

app.put("/api/employees/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const updatedData = req.body;

  const idx = db.employees.findIndex((e: any) => e.id === id);
  if (idx === -1) {
    res.status(404).json({ error: "ບໍ່ພົບພະນັກງານ" });
    return;
  }

  // Prevent duplicate code if changed
  if (updatedData.employeeCode && updatedData.employeeCode.toUpperCase() !== db.employees[idx].employeeCode.toUpperCase()) {
    if (db.employees.some((e: any) => e.employeeCode.toUpperCase() === updatedData.employeeCode.toUpperCase() && e.id !== id)) {
      res.status(400).json({ error: "ລະຫັດພະນັກງານນີ້ມີໃນລະບົບແລ້ວ" });
      return;
    }
  }

  db.employees[idx] = { ...db.employees[idx], ...updatedData };
  writeDB(db);
  res.json(db.employees[idx]);
});

app.delete("/api/employees/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;

  db.employees = db.employees.filter((e: any) => e.id !== id);
  db.attendance = db.attendance.filter((a: any) => a.employeeId !== id);
  db.notifications = db.notifications.filter((n: any) => n.employeeId !== id);

  if (!db.deletedEmployeeIds) {
    db.deletedEmployeeIds = [];
  }
  if (!db.deletedEmployeeIds.includes(id)) {
    db.deletedEmployeeIds.push(id);
  }

  writeDB(db);
  res.json({ success: true, message: "ລົບພະນັກງານສຳເລັດ" });
});

app.post("/api/employees/bulk-delete", (req, res) => {
  const db = readDB();
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: "ກະລຸນາເລືອກລາຍການທີ່ຈະລົບ" });
    return;
  }

  db.employees = db.employees.filter((e: any) => !ids.includes(e.id));
  db.attendance = db.attendance.filter((a: any) => !ids.includes(a.employeeId));
  db.notifications = db.notifications.filter((n: any) => !ids.includes(n.employeeId));

  if (!db.deletedEmployeeIds) {
    db.deletedEmployeeIds = [];
  }
  ids.forEach((id: string) => {
    if (!db.deletedEmployeeIds.includes(id)) {
      db.deletedEmployeeIds.push(id);
    }
  });

  writeDB(db);
  res.json({ success: true, message: "ລົບພະນັກງານທີ່ເລືອກທັງໝົດສຳເລັດ" });
});

// Attendance Logs
app.get("/api/attendance", (req, res) => {
  const db = readDB();
  res.json(db.attendance);
});

app.post("/api/attendance", (req, res) => {
  const db = readDB();
  const record = req.body;

  if (record.id && db.deletedAttendanceIds && db.deletedAttendanceIds.includes(record.id)) {
    res.json({ ignored: true, message: "ບັນທຶກນີ້ຖືກລົບໂດຍ HR ແລ້ວ" });
    return;
  }

  if (!record.id) {
    record.id = `att-${record.employeeId}-${Date.now()}`;
  }

  // Remove existing record for same employee and date to prevent duplicates
  db.attendance = db.attendance.filter(
    (r: any) => !(r.employeeId === record.employeeId && r.date === record.date && r.id !== record.id)
  );

  // Check if updating existing record by ID
  const index = db.attendance.findIndex((r: any) => r.id === record.id);
  if (index !== -1) {
    db.attendance[index] = record;
  } else {
    db.attendance.unshift(record);
  }

  writeDB(db);
  res.json(record);
});

app.delete("/api/attendance/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  db.attendance = db.attendance.filter((r: any) => r.id !== id);

  if (!db.deletedAttendanceIds) {
    db.deletedAttendanceIds = [];
  }
  if (!db.deletedAttendanceIds.includes(id)) {
    db.deletedAttendanceIds.push(id);
  }

  writeDB(db);
  res.json({ success: true, message: "ລົບຂໍ້ມູນການລາຍງານສຳເລັດ" });
});

app.post("/api/attendance/bulk-delete", (req, res) => {
  const db = readDB();
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: "ກະລຸນາເລືອກລາຍການທີ່ຈະລົບ" });
    return;
  }

  db.attendance = db.attendance.filter((r: any) => !ids.includes(r.id));

  if (!db.deletedAttendanceIds) {
    db.deletedAttendanceIds = [];
  }
  ids.forEach((id: string) => {
    if (!db.deletedAttendanceIds.includes(id)) {
      db.deletedAttendanceIds.push(id);
    }
  });

  writeDB(db);
  res.json({ success: true, message: "ລົບຂໍ້ມູນການລາຍງານທີ່ເລືອກທັງໝົດສຳເລັດ" });
});

app.post("/api/attendance/clear", (req, res) => {
  const db = readDB();
  db.attendance = [];
  db.deletedAttendanceIds = [];
  writeDB(db);
  res.json({ success: true, message: "ລຶບລ້າງຂໍ້ມູນການລົງເວລາທັງໝົດສຳເລັດ" });
});

// System Notifications
app.get("/api/notifications", (req, res) => {
  const db = readDB();
  res.json(db.notifications);
});

app.post("/api/notifications", (req, res) => {
  const db = readDB();
  const notification = req.body;

  if (!notification.id) {
    notification.id = `notif-${Date.now()}`;
    notification.timestamp = new Date().toLocaleTimeString("lo-LA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    notification.read = false;
  }

  db.notifications.unshift(notification);
  writeDB(db);
  res.status(201).json(notification);
});

app.post("/api/notifications/dismiss", (req, res) => {
  const db = readDB();
  const { id } = req.body;

  db.notifications = db.notifications.map((n: any) =>
    n.id === id ? { ...n, read: true } : n
  );

  writeDB(db);
  res.json({ success: true });
});

// Shift Management
app.get("/api/shifts", (req, res) => {
  const db = readDB();
  res.json(db.shifts || []);
});

app.post("/api/shifts", (req, res) => {
  const db = readDB();
  const shift = req.body;

  if (!shift.id) {
    shift.id = `shift-${Date.now()}`;
  }

  if (!db.shifts) {
    db.shifts = [];
  }

  // Filter out any existing shift for same employee and date to prevent duplication
  db.shifts = db.shifts.filter(
    (s: any) => !(s.employeeId === shift.employeeId && s.date === shift.date && s.id !== shift.id)
  );

  const idx = db.shifts.findIndex((s: any) => s.id === shift.id);
  if (idx !== -1) {
    db.shifts[idx] = shift;
  } else {
    db.shifts.unshift(shift);
  }

  writeDB(db);
  res.status(201).json(shift);
});

app.delete("/api/shifts/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  
  if (db.shifts) {
    db.shifts = db.shifts.filter((s: any) => s.id !== id);
  }
  
  writeDB(db);
  res.json({ success: true, message: "ລົບຂໍ້ມູນກະການເຮັດວຽກສຳເລັດ" });
});

// Helper to get current Lao Time parameters reliably
function getLaoDateTime() {
  const options = { timeZone: "Asia/Vientiane" };
  const d = new Date();
  
  // Format to YYYY-MM-DD
  const dateStr = d.toLocaleDateString("en-CA", options); // always YYYY-MM-DD in en-CA
  
  // Format to HH:MM
  const timeStr = d.toLocaleTimeString("en-GB", { ...options, hour12: false }).substring(0, 5); // HH:MM
  
  const fullTime = d.toLocaleString("lo-LA", {
    timeZone: "Asia/Vientiane",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return { date: dateStr, time: timeStr, fullTime };
}

// core automated checks logic
function runAutomatedChecks(force = false) {
  try {
    const db = readDB();
    if (!db.enableAutoNotifications && !force) {
      return { success: false, reason: "Automatic notifications are disabled in settings." };
    }

    const { date, time, fullTime } = getLaoDateTime();
    
    // Day of the week in Lao Time (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const laoDay = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Vientiane" })).getDay();
    const isWeekend = laoDay === 0 || laoDay === 6;
    if (isWeekend && !force) {
      return { success: false, reason: "Skipped: Weekend check-ins are not subject to auto-notifications." };
    }

    const checkInDeadline = db.checkInDeadline || "08:30";
    const checkOutDeadline = db.checkOutDeadline || "18:00";

    if (!db.sentAutomatedNotifs) {
      db.sentAutomatedNotifs = [];
    }

    let dbModified = false;
    let sentCount = 0;
    const sentTo: string[] = [];

    // 1. Check-In Forgetfulness Alert
    const isInCheckInWindow = time >= "08:00" && time <= "08:30";
    if (force || isInCheckInWindow) {
      db.employees.forEach((emp: any) => {
        const notifKey = `${date}:${emp.id}:check_in`;
        // Avoid sending duplicate alerts for the same day
        if (db.sentAutomatedNotifs.includes(notifKey)) return;

        // Check if there is already an attendance record for today
        const record = db.attendance.find((r: any) => r.employeeId === emp.id && r.date === date);
        
        // If they are on approved leave or registered out of office, do not flag them
        if (record && (record.status.startsWith("ລາພັກ") || record.status.startsWith("ໄປວຽກນອກ"))) {
          if (record.status.startsWith("ລາພັກ") && record.leaveDetails?.status === "rejected") {
            // Leave is rejected, so do not bypass the check-in deadline
          } else {
            return;
          }
        }

        // If they haven't checked in yet
        if (!record || !record.checkIn) {
          const notifId = `notif-auto-in-${emp.id}-${Date.now()}`;
          const newNotif = {
            id: notifId,
            employeeId: emp.id,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            type: "check_in",
            message: `⚠️ ລະບົບກວດພົບ: ທ່ານລືມ Check-In ເຂົ້າວຽກປະຈຳວັນທີ ${date} (ໃນຊ່ວງເວລາ 08:00 - 08:30 ໂມງ)`,
            timestamp: fullTime,
            read: false
          };

          db.notifications.unshift(newNotif);
          db.sentAutomatedNotifs.push(notifKey);

          // Create/update attendance record with "ລືມ Check In" remark
          if (record) {
            record.remarks = "ລືມ Check In";
          } else {
            const newRecord = {
              id: `att-${emp.id}-${Date.now()}`,
              employeeId: emp.id,
              date: date,
              checkIn: null,
              checkOut: null,
              status: "ເຂົ້າວຽກປົກກະຕິ",
              hoursWorked: null,
              remarks: "ລືມ Check In"
            };
            db.attendance.unshift(newRecord);
          }

          dbModified = true;
          sentCount++;
          sentTo.push(`${emp.firstName} ${emp.lastName} (ລືມ Check In)`);
        }
      });
    }

    // 2. Check-Out Forgetfulness Alert
    const isInCheckOutWindow = time >= "16:00" && time <= "17:00";
    if (force || isInCheckOutWindow) {
      db.employees.forEach((emp: any) => {
        const notifKey = `${date}:${emp.id}:check_out`;
        // Avoid sending duplicate alerts for the same day
        if (db.sentAutomatedNotifs.includes(notifKey)) return;

        // Must have checked in, but have not checked out
        const record = db.attendance.find((r: any) => r.employeeId === emp.id && r.date === date);
        
        if (record && record.checkIn && !record.checkOut && !record.status.startsWith("ລາພັກ") && !record.status.startsWith("ໄປວຽກນອກ")) {
          const notifId = `notif-auto-out-${emp.id}-${Date.now()}`;
          const newNotif = {
            id: notifId,
            employeeId: emp.id,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            type: "check_out",
            message: `⚠️ ລະບົບກວດພົບ: ທ່ານລືມ Check-Out ອອກວຽກປະຈຳວັນທີ ${date} (ໃນຊ່ວງເວລາ 16:00 - 17:00 ໂມງ)`,
            timestamp: fullTime,
            read: false
          };

          db.notifications.unshift(newNotif);
          db.sentAutomatedNotifs.push(notifKey);

          // Update attendance record remarks
          record.remarks = "ລືມ Check Out";

          dbModified = true;
          sentCount++;
          sentTo.push(`${emp.firstName} ${emp.lastName} (ລືມ Check Out)`);
        }
      });
    }

    if (dbModified) {
      writeDB(db);
    }

    return {
      success: true,
      sentCount,
      sentTo,
      date,
      time
    };
  } catch (err) {
    console.error("Error running automated checks", err);
    return { success: false, error: String(err) };
  }
}

// Background Scheduler (run checks every 30 seconds)
setInterval(() => {
  runAutomatedChecks();
}, 30000);

// Custom Logo & Credentials Settings
app.get("/api/settings", (req, res) => {
  const db = readDB();
  res.json({ 
    customLogo: db.customLogo,
    hrUsername: db.hrUsername || "admin",
    hrPassword: db.hrPassword || "123456",
    enableAutoNotifications: db.enableAutoNotifications !== undefined ? db.enableAutoNotifications : true,
    enableQrTimeRestriction: db.enableQrTimeRestriction !== undefined ? db.enableQrTimeRestriction : true,
    enableQrCodeSystem: db.enableQrCodeSystem !== undefined ? db.enableQrCodeSystem : true,
    checkInStart: db.checkInStart || "07:30",
    checkInDeadline: db.checkInDeadline || "08:30",
    checkOutStart: db.checkOutStart || "15:40",
    checkOutDeadline: db.checkOutDeadline || "18:00",
    enableGpsRestriction: db.enableGpsRestriction !== undefined ? db.enableGpsRestriction : false,
    enableNetworkRestriction: db.enableNetworkRestriction !== undefined ? db.enableNetworkRestriction : false,
    officeLat: db.officeLat !== undefined ? db.officeLat : 17.9638,
    officeLng: db.officeLng !== undefined ? db.officeLng : 102.6132,
    officeRadius: db.officeRadius !== undefined ? db.officeRadius : 200,
    deletedEmployeeIds: db.deletedEmployeeIds || [],
    deletedAttendanceIds: db.deletedAttendanceIds || []
  });
});

app.post("/api/settings", (req, res) => {
  const db = readDB();
  const { 
    customLogo, hrUsername, hrPassword, enableAutoNotifications, 
    checkInStart, checkInDeadline, checkOutStart, checkOutDeadline, 
    enableQrTimeRestriction, enableQrCodeSystem,
    enableGpsRestriction, enableNetworkRestriction, officeLat, officeLng, officeRadius 
  } = req.body;

  if (customLogo !== undefined) db.customLogo = customLogo;
  if (hrUsername !== undefined) db.hrUsername = hrUsername;
  if (hrPassword !== undefined) db.hrPassword = hrPassword;
  if (enableAutoNotifications !== undefined) db.enableAutoNotifications = enableAutoNotifications;
  if (checkInStart !== undefined) db.checkInStart = checkInStart;
  if (checkInDeadline !== undefined) db.checkInDeadline = checkInDeadline;
  if (checkOutStart !== undefined) db.checkOutStart = checkOutStart;
  if (checkOutDeadline !== undefined) db.checkOutDeadline = checkOutDeadline;
  if (enableQrTimeRestriction !== undefined) db.enableQrTimeRestriction = enableQrTimeRestriction;
  if (enableQrCodeSystem !== undefined) db.enableQrCodeSystem = enableQrCodeSystem;
  if (enableGpsRestriction !== undefined) db.enableGpsRestriction = enableGpsRestriction;
  if (enableNetworkRestriction !== undefined) db.enableNetworkRestriction = enableNetworkRestriction;
  if (officeLat !== undefined) db.officeLat = Number(officeLat);
  if (officeLng !== undefined) db.officeLng = Number(officeLng);
  if (officeRadius !== undefined) db.officeRadius = Number(officeRadius);

  writeDB(db);
  res.json({ 
    success: true, 
    customLogo: db.customLogo,
    hrUsername: db.hrUsername || "admin",
    hrPassword: db.hrPassword || "123456",
    enableAutoNotifications: db.enableAutoNotifications,
    enableQrTimeRestriction: db.enableQrTimeRestriction !== undefined ? db.enableQrTimeRestriction : true,
    enableQrCodeSystem: db.enableQrCodeSystem !== undefined ? db.enableQrCodeSystem : true,
    checkInStart: db.checkInStart,
    checkInDeadline: db.checkInDeadline,
    checkOutStart: db.checkOutStart,
    checkOutDeadline: db.checkOutDeadline,
    enableGpsRestriction: db.enableGpsRestriction !== undefined ? db.enableGpsRestriction : false,
    enableNetworkRestriction: db.enableNetworkRestriction !== undefined ? db.enableNetworkRestriction : false,
    officeLat: db.officeLat !== undefined ? db.officeLat : 17.9638,
    officeLng: db.officeLng !== undefined ? db.officeLng : 102.6132,
    officeRadius: db.officeRadius !== undefined ? db.officeRadius : 200,
    deletedEmployeeIds: db.deletedEmployeeIds || [],
    deletedAttendanceIds: db.deletedAttendanceIds || []
  });
});

app.post("/api/settings/trigger-checks", (req, res) => {
  const result = runAutomatedChecks(true);
  res.json(result);
});

app.post("/api/settings/recover", (req, res) => {
  const db = readDB();
  const { employees = [], attendance = [], notifications = [] } = req.body;

  let recoveredEmployeesCount = 0;
  let recoveredAttendanceCount = 0;
  let recoveredNotificationsCount = 0;

  // Ensure arrays exist in db
  if (!db.employees) db.employees = [];
  if (!db.attendance) db.attendance = [];
  if (!db.notifications) db.notifications = [];
  if (!db.deletedEmployeeIds) db.deletedEmployeeIds = [];
  if (!db.deletedAttendanceIds) db.deletedAttendanceIds = [];

  // 1. Recover Employees
  if (Array.isArray(employees)) {
    const excludedMockIds = [
      "emp-1", "emp-2", "emp-3", "emp-4", "emp-5", 
      "emp-101", "emp-102", "emp-103", "emp-104", "emp-105",
      "emp-1782874228225", "emp-1782874372513", "emp-1782874302793", 
      "emp-1782873883552", "emp-1782872758632", "emp-1782874270257"
    ];
    for (const emp of employees) {
      if (!emp.id || excludedMockIds.includes(emp.id)) continue;
      
      // If the employee is in deleted list, remove it from the deleted list to allow recovery
      if (db.deletedEmployeeIds.includes(emp.id)) {
        db.deletedEmployeeIds = db.deletedEmployeeIds.filter((id: string) => id !== emp.id);
      }

      // Check if employee already exists on server
      const exists = db.employees.some((e: any) => e.id === emp.id || e.employeeCode.toUpperCase() === emp.employeeCode.toUpperCase());
      if (!exists) {
        db.employees.push(emp);
        recoveredEmployeesCount++;
      }
    }
  }

  // 2. Recover Attendance
  if (Array.isArray(attendance)) {
    for (const att of attendance) {
      if (!att.id || !att.employeeId) continue;

      // If the attendance record is in deleted list, remove it from the deleted list
      if (db.deletedAttendanceIds.includes(att.id)) {
        db.deletedAttendanceIds = db.deletedAttendanceIds.filter((id: string) => id !== att.id);
      }

      // If the employee of this attendance is being recovered, ensure they are allowed
      if (db.deletedEmployeeIds.includes(att.employeeId)) {
        db.deletedEmployeeIds = db.deletedEmployeeIds.filter((id: string) => id !== att.employeeId);
      }

      const exists = db.attendance.some((a: any) => a.id === att.id);
      if (!exists) {
        db.attendance.push(att);
        recoveredAttendanceCount++;
      }
    }
  }

  // 3. Recover Notifications
  if (Array.isArray(notifications)) {
    for (const notif of notifications) {
      if (!notif.id) continue;
      const exists = db.notifications.some((n: any) => n.id === notif.id);
      if (!exists) {
        db.notifications.push(notif);
        recoveredNotificationsCount++;
      }
    }
  }

  writeDB(db);

  res.json({
    success: true,
    recoveredEmployeesCount,
    recoveredAttendanceCount,
    recoveredNotificationsCount,
    employees: db.employees,
    attendance: db.attendance,
    notifications: db.notifications,
    deletedEmployeeIds: db.deletedEmployeeIds,
    deletedAttendanceIds: db.deletedAttendanceIds
  });
});

// ---------------- VITE MIDDLEWARE SETUP ----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
