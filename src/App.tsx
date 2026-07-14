import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Shield, Bell, CheckCircle2, ChevronRight, Menu, X, Smartphone, Home } from 'lucide-react';
import { Employee, AttendanceRecord, SystemNotification, ShiftAssignment } from './types';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_ATTENDANCE, 
  INITIAL_NOTIFICATIONS, 
  DEFAULT_LOGO_SVG 
} from './data';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { HRDashboard } from './components/HRDashboard';
import { NotificationBanner } from './components/NotificationBanner';
import { BrowserPermissionsGuide } from './components/BrowserPermissionsGuide';
import { HomeLanding } from './components/HomeLanding';

function safeJsonParse<T>(str: string | null, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch (e) {
    console.error("Failed to parse JSON:", e, "for value:", str);
    return fallback;
  }
}

export default function App() {
  // Load from localStorage if present to prevent any UI flickering or data-loss on start
  const getInitialEmployees = (): Employee[] => {
    const parsed = safeJsonParse<any[]>(localStorage.getItem('hr_employees'), INITIAL_EMPLOYEES);
    const mockEmployeeIds = ["emp-1", "emp-2", "emp-3", "emp-4", "emp-5", "emp-101", "emp-102", "emp-103", "emp-104", "emp-105"];
    return parsed.filter((e: any) => !mockEmployeeIds.includes(e.id));
  };

  const getInitialAttendance = (): AttendanceRecord[] => {
    const parsed = safeJsonParse<any[]>(localStorage.getItem('hr_attendance'), INITIAL_ATTENDANCE);
    const mockEmployeeIds = ["emp-1", "emp-2", "emp-3", "emp-4", "emp-5", "emp-101", "emp-102", "emp-103", "emp-104", "emp-105"];
    return parsed.filter((a: any) => {
      if (mockEmployeeIds.includes(a.employeeId)) return false;
      // Exclude specific records requested by the user for deletion
      if (a.employeeId === "emp-1782874228225" && a.date === "2026-07-02") return false;
      if (a.employeeId === "emp-1782874372513" && a.date === "2026-07-02") return false;
      if (a.employeeId === "emp-1782874302793" && a.date === "2026-07-02") return false;
      if (a.employeeId === "emp-1782873883552" && (a.date === "2026-07-02" || a.date === "2026-07-01")) return false;
      if (a.employeeId === "emp-1782872758632" && a.date === "2026-07-01") return false;
      if (a.employeeId === "emp-1782874270257" && a.date === "2026-07-06") return false;
      return true;
    });
  };

  const getInitialNotifications = (): SystemNotification[] => {
    return safeJsonParse<SystemNotification[]>(localStorage.getItem('hr_notifications'), INITIAL_NOTIFICATIONS);
  };

  const getInitialShifts = (): ShiftAssignment[] => {
    return safeJsonParse<ShiftAssignment[]>(localStorage.getItem('hr_shifts'), []);
  };

  // DB State (Employees)
  const [employees, setEmployees] = useState<Employee[]>(getInitialEmployees);

  // DB State (Attendance Log)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(getInitialAttendance);

  // Active Notifications list
  const [notifications, setNotifications] = useState<SystemNotification[]>(getInitialNotifications);

  // Shift assignments list
  const [shifts, setShifts] = useState<ShiftAssignment[]>(getInitialShifts);

  // Logo selection State (Allows HTML SVG or Image URL)
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    return localStorage.getItem('hr_custom_logo') || null;
  });

  const [enableQrTimeRestriction, setEnableQrTimeRestriction] = useState<boolean>(true);
  const [enableQrCodeSystem, setEnableQrCodeSystem] = useState<boolean>(true);
  const [checkInStart, setCheckInStart] = useState<string>("07:30");
  const [checkInDeadline, setCheckInDeadline] = useState<string>("08:30");
  const [checkOutStart, setCheckOutStart] = useState<string>("15:40");
  const [checkOutDeadline, setCheckOutDeadline] = useState<string>("18:00");
  const [enableGpsRestriction, setEnableGpsRestriction] = useState<boolean>(false);
  const [officeLat, setOfficeLat] = useState<number>(17.9638);
  const [officeLng, setOfficeLng] = useState<number>(102.6132);
  const [officeRadius, setOfficeRadius] = useState<number>(200);

  // Selected View: 'home' (default), 'employee' or 'hr'
  const [activeView, setActiveView] = useState<'home' | 'employee' | 'hr'>(() => {
    const cached = sessionStorage.getItem('active_view');
    if (cached === 'employee' || cached === 'hr' || cached === 'home') {
      return cached;
    }
    return 'home';
  });

  // Sync activeView to sessionStorage and log out of HR immediately when switching views
  useEffect(() => {
    sessionStorage.setItem('active_view', activeView);
    if (activeView === 'employee' || activeView === 'home') {
      sessionStorage.setItem('hr_authenticated', 'false');
    }
  }, [activeView]);

  const [loading, setLoading] = useState(true);

  // Keep track of client-side mutations to temporarily ignore server sync poll to prevent overwriting edits with stale data
  const lastMutationTimeRef = React.useRef<number>(0);
  const triggerMutation = () => {
    lastMutationTimeRef.current = Date.now();
  };

  // Fetch initial database state on mount and keep synced
  useEffect(() => {
    let active = true;
    let isSyncing = false;

    const safeParseJson = async (res: Response, fallback: any = null) => {
      try {
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          return await res.json();
        }
      } catch (err) {
        console.warn("Could not parse response as JSON", err);
      }
      return fallback;
    };

    const fetchWithRetry = async (url: string, options?: RequestInit, retries = 3, delay = 500): Promise<Response> => {
      try {
        const res = await fetch(url, options);
        if (!res.ok && retries > 0) {
          throw new Error(`HTTP error ${res.status}`);
        }
        return res;
      } catch (err) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(url, options, retries - 1, delay * 1.5);
        }
        throw err;
      }
    };

    async function fetchDB() {
      if (isSyncing) return;
      // If we recently mutated data on the client (e.g., edited, added or deleted records),
      // temporarily skip polling/overwriting local state with stale server data
      if (Date.now() - lastMutationTimeRef.current < 6000) {
        return;
      }
      try {
        const [empRes, attRes, notifRes, setRes, shiftRes] = await Promise.all([
          fetchWithRetry('/api/employees'),
          fetchWithRetry('/api/attendance'),
          fetchWithRetry('/api/notifications'),
          fetchWithRetry('/api/settings'),
          fetchWithRetry('/api/shifts')
        ]);
        
        if (!active) return;

        let serverEmployees: Employee[] = [];
        let serverAttendance: AttendanceRecord[] = [];
        let serverNotifications: SystemNotification[] = [];
        let serverShifts: ShiftAssignment[] = [];

        serverEmployees = await safeParseJson(empRes, []);
        serverAttendance = await safeParseJson(attRes, []);
        serverNotifications = await safeParseJson(notifRes, []);
        serverShifts = await safeParseJson(shiftRes, []);

        const settings = await safeParseJson(setRes, null);
        const serverDeletedEmployees: string[] = (settings && settings.deletedEmployeeIds) || [];
        const serverDeletedAttendance: string[] = (settings && settings.deletedAttendanceIds) || [];

        // Restore missing added employees/records from localStorage, but ONLY if they haven't been deleted on the server
        const localEmployees = safeJsonParse<Employee[]>(localStorage.getItem('hr_employees'), []);
        const localAttendance = safeJsonParse<AttendanceRecord[]>(localStorage.getItem('hr_attendance'), []);
        const localNotifications = safeJsonParse<SystemNotification[]>(localStorage.getItem('hr_notifications'), []);

        // Exclude default seed IDs from local sync, and also exclude anything explicitly deleted
        const clientDeletedEmployees = safeJsonParse<string[]>(localStorage.getItem('hr_deleted_employee_ids'), []);
        const clientDeletedAttendance = safeJsonParse<string[]>(localStorage.getItem('hr_deleted_attendance_ids'), []);

        const allDeletedEmployees = Array.from(new Set([...serverDeletedEmployees, ...clientDeletedEmployees]));
        const allDeletedAttendance = Array.from(new Set([...serverDeletedAttendance, ...clientDeletedAttendance]));

        const safeLocalEmployees = localEmployees.filter(
          e => !["emp-1", "emp-2", "emp-3", "emp-4", "emp-5"].includes(e.id) && !allDeletedEmployees.includes(e.id)
        );
        const safeLocalAttendance = localAttendance.filter(
          a => !["emp-1", "emp-2", "emp-3", "emp-4", "emp-5"].includes(a.employeeId) && 
               !allDeletedAttendance.includes(a.id) &&
               !allDeletedEmployees.includes(a.employeeId) &&
               !(a.employeeId === "emp-1782874228225" && a.date === "2026-07-02") &&
               !(a.employeeId === "emp-1782874372513" && a.date === "2026-07-02") &&
               !(a.employeeId === "emp-1782874302793" && a.date === "2026-07-02") &&
               !(a.employeeId === "emp-1782873883552" && (a.date === "2026-07-02" || a.date === "2026-07-01")) &&
               !(a.employeeId === "emp-1782872758632" && a.date === "2026-07-01") &&
               !(a.employeeId === "emp-1782874270257" && a.date === "2026-07-06")
        );
        const safeLocalNotifications = localNotifications.filter(
          n => !["emp-1", "emp-2", "emp-3", "emp-4", "emp-5"].includes(n.employeeId || "") && 
               !allDeletedEmployees.includes(n.employeeId || "")
        );

        let needsResync = false;
        isSyncing = true;

        // Restore missing employees
        const missingEmployees = safeLocalEmployees.filter(le => !serverEmployees.some(se => se.id === le.id));
        if (missingEmployees.length > 0) {
          needsResync = true;
          for (const emp of missingEmployees) {
            try {
              await fetch('/api/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emp)
              });
            } catch (err) {
              console.error("Restore missing employee failed", err);
            }
          }
        }

        // Restore missing attendance
        const missingAttendance = safeLocalAttendance.filter(la => !serverAttendance.some(sa => sa.id === la.id));
        if (missingAttendance.length > 0) {
          needsResync = true;
          for (const att of missingAttendance) {
            try {
              await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(att)
              });
            } catch (err) {
              console.error("Restore missing attendance failed", err);
            }
          }
        }

        // Restore missing notifications
        const missingNotifications = safeLocalNotifications.filter(ln => !serverNotifications.some(sn => sn.id === ln.id));
        if (missingNotifications.length > 0) {
          needsResync = true;
          for (const notif of missingNotifications) {
            try {
              await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notif)
              });
            } catch (err) {
              console.error("Restore missing notification failed", err);
            }
          }
        }

        // Re-fetch to get official restored dataset if we restored anything
        if (needsResync) {
          const [newEmpRes, newAttRes, newNotifRes] = await Promise.all([
            fetch('/api/employees'),
            fetch('/api/attendance'),
            fetch('/api/notifications')
          ]);
          serverEmployees = await safeParseJson(newEmpRes, serverEmployees);
          serverAttendance = await safeParseJson(newAttRes, serverAttendance);
          serverNotifications = await safeParseJson(newNotifRes, serverNotifications);
        }

        isSyncing = false;

        setEmployees(serverEmployees);
        setAttendance(serverAttendance);
        setNotifications(serverNotifications);
        setShifts(serverShifts);

        if (settings) {
          if (settings.enableQrTimeRestriction !== undefined) {
            setEnableQrTimeRestriction(settings.enableQrTimeRestriction);
          }
          if (settings.enableQrCodeSystem !== undefined) {
            setEnableQrCodeSystem(settings.enableQrCodeSystem);
          }
          if (settings.checkInStart !== undefined) {
            setCheckInStart(settings.checkInStart);
          }
          if (settings.checkInDeadline !== undefined) {
            setCheckInDeadline(settings.checkInDeadline);
          }
          if (settings.checkOutStart !== undefined) {
            setCheckOutStart(settings.checkOutStart);
          }
          if (settings.checkOutDeadline !== undefined) {
            setCheckOutDeadline(settings.checkOutDeadline);
          }
          if (settings.enableGpsRestriction !== undefined) {
            setEnableGpsRestriction(settings.enableGpsRestriction);
          }
          if (settings.officeLat !== undefined) {
            setOfficeLat(settings.officeLat);
          }
          if (settings.officeLng !== undefined) {
            setOfficeLng(settings.officeLng);
          }
          if (settings.officeRadius !== undefined) {
            setOfficeRadius(settings.officeRadius);
          }
        }
        const localLogo = localStorage.getItem('hr_custom_logo');
        if (settings) {
          if ((!settings.customLogo || settings.customLogo === 'DEFAULT_SVG') && localLogo && localLogo !== 'DEFAULT_SVG') {
            try {
              await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customLogo: localLogo }),
              });
            } catch (err) {
              console.error("Failed to restore custom logo to server", err);
            }
            setCustomLogo(localLogo);
          } else {
            setCustomLogo(settings.customLogo);
            if (settings.customLogo) {
              localStorage.setItem('hr_custom_logo', settings.customLogo);
            }
          }
        } else if (localLogo) {
          setCustomLogo(localLogo);
        }
      } catch (e) {
        console.warn("API offline or slow, using local backup simulation:", e);
        // Fallback to cache on complete connection loss
        setEmployees(safeJsonParse<Employee[]>(localStorage.getItem('hr_employees'), INITIAL_EMPLOYEES));
        setAttendance(safeJsonParse<AttendanceRecord[]>(localStorage.getItem('hr_attendance'), INITIAL_ATTENDANCE));
        setNotifications(safeJsonParse<SystemNotification[]>(localStorage.getItem('hr_notifications'), INITIAL_NOTIFICATIONS));
        setShifts(safeJsonParse<ShiftAssignment[]>(localStorage.getItem('hr_shifts'), []));
      } finally {
        isSyncing = false;
        setLoading(false);
      }
    }

    fetchDB();
    
    // Poll for updates every 10 seconds to keep client screens in sync
    const interval = setInterval(fetchDB, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Save states to localStorage whenever they change to maintain instant local backups
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('hr_employees', JSON.stringify(employees));
    }
  }, [employees, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('hr_attendance', JSON.stringify(attendance));
    }
  }, [attendance, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('hr_notifications', JSON.stringify(notifications));
    }
  }, [notifications, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('hr_shifts', JSON.stringify(shifts));
    }
  }, [shifts, loading]);

  // Handlers for Shifts
  const handleAddShift = async (shift: ShiftAssignment) => {
    triggerMutation();
    setShifts((prev) => {
      const filtered = prev.filter(
        (s) => !(s.employeeId === shift.employeeId && s.date === shift.date)
      );
      return [shift, ...filtered];
    });

    try {
      await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shift),
      });
    } catch (e) {
      console.error("Failed to save shift to backend", e);
    }
  };

  const handleDeleteShift = async (id: string) => {
    triggerMutation();
    setShifts((prev) => prev.filter((s) => s.id !== id));

    try {
      await fetch(`/api/shifts/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error("Failed to delete shift from backend", e);
    }
  };

  // Handler to add new attendance entry
  const handleAddAttendance = async (record: AttendanceRecord) => {
    triggerMutation();
    // Optimistic UI update
    setAttendance((prev) => {
      const filtered = prev.filter(
        (r) => !(r.employeeId === record.employeeId && r.date === record.date)
      );
      return [record, ...filtered];
    });

    try {
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
    } catch (e) {
      console.error("Failed to sync attendance to backend", e);
    }
  };

  // Handler to update existing attendance entry
  const handleUpdateAttendance = async (record: AttendanceRecord) => {
    triggerMutation();
    setAttendance((prev) =>
      prev.map((r) => (r.id === record.id ? record : r))
    );

    try {
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
    } catch (e) {
      console.error("Failed to sync attendance update to backend", e);
    }
  };

  // Handler to delete an attendance entry
  const handleDeleteAttendance = async (id: string) => {
    triggerMutation();
    const updated = attendance.filter((r) => r.id !== id);
    setAttendance(updated);
    localStorage.setItem('hr_attendance', JSON.stringify(updated));

    // Keep local record of deleted ID to prevent restore
    const localDeleted = safeJsonParse<string[]>(localStorage.getItem('hr_deleted_attendance_ids'), []);
    if (!localDeleted.includes(id)) {
      localStorage.setItem('hr_deleted_attendance_ids', JSON.stringify([...localDeleted, id]));
    }

    try {
      await fetch(`/api/attendance/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error("Failed to delete attendance from backend", e);
    }
  };

  // Handler to bulk delete attendance entries
  const handleBulkDeleteAttendance = async (ids: string[]) => {
    triggerMutation();
    const updated = attendance.filter((r) => !ids.includes(r.id));
    setAttendance(updated);
    localStorage.setItem('hr_attendance', JSON.stringify(updated));

    // Keep local record of deleted IDs to prevent restore
    const localDeleted = safeJsonParse<string[]>(localStorage.getItem('hr_deleted_attendance_ids'), []);
    const newDeleted = Array.from(new Set([...localDeleted, ...ids]));
    localStorage.setItem('hr_deleted_attendance_ids', JSON.stringify(newDeleted));

    try {
      await fetch('/api/attendance/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
    } catch (e) {
      console.error("Failed to bulk delete attendance from backend", e);
    }
  };

  // Handler to clear all attendance entries
  const handleClearAllAttendance = async () => {
    triggerMutation();
    setAttendance([]);
    localStorage.removeItem('hr_attendance');

    try {
      await fetch('/api/attendance/clear', {
        method: 'POST',
      });
    } catch (e) {
      console.error("Failed to clear attendance on backend", e);
    }
  };

  const handleUpdateSettings = (
    newCheckIn: string,
    newCheckOut: string,
    newRestriction: boolean,
    newQrCodeSystem?: boolean,
    newCheckInStart?: string,
    newCheckOutStart?: string,
    newEnableGpsRestriction?: boolean,
    newOfficeLat?: number,
    newOfficeLng?: number,
    newOfficeRadius?: number
  ) => {
    triggerMutation();
    setCheckInDeadline(newCheckIn);
    setCheckOutDeadline(newCheckOut);
    setEnableQrTimeRestriction(newRestriction);
    if (newQrCodeSystem !== undefined) {
      setEnableQrCodeSystem(newQrCodeSystem);
    }
    if (newCheckInStart !== undefined) {
      setCheckInStart(newCheckInStart);
    }
    if (newCheckOutStart !== undefined) {
      setCheckOutStart(newCheckOutStart);
    }
    if (newEnableGpsRestriction !== undefined) {
      setEnableGpsRestriction(newEnableGpsRestriction);
    }
    if (newOfficeLat !== undefined) {
      setOfficeLat(newOfficeLat);
    }
    if (newOfficeLng !== undefined) {
      setOfficeLng(newOfficeLng);
    }
    if (newOfficeRadius !== undefined) {
      setOfficeRadius(newOfficeRadius);
    }
  };

  // Handler to recover employees and attendance history safely
  const handleRecoverData = async () => {
    triggerMutation();
    try {
      const localEmployees = safeJsonParse<Employee[]>(localStorage.getItem('hr_employees'), []);
      const localAttendance = safeJsonParse<AttendanceRecord[]>(localStorage.getItem('hr_attendance'), []);
      const localNotifications = safeJsonParse<SystemNotification[]>(localStorage.getItem('hr_notifications'), []);

      const res = await fetch('/api/settings/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          employees: localEmployees, 
          attendance: localAttendance, 
          notifications: localNotifications 
        })
      });

      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees);
        setAttendance(data.attendance);
        setNotifications(data.notifications);

        // Update local storage to be in perfect sync
        localStorage.setItem('hr_employees', JSON.stringify(data.employees));
        localStorage.setItem('hr_attendance', JSON.stringify(data.attendance));
        localStorage.setItem('hr_notifications', JSON.stringify(data.notifications));

        return {
          success: true,
          recoveredEmployeesCount: data.recoveredEmployeesCount,
          recoveredAttendanceCount: data.recoveredAttendanceCount,
          recoveredNotificationsCount: data.recoveredNotificationsCount
        };
      } else {
        const errText = await res.text();
        throw new Error(errText || 'Server responded with error');
      }
    } catch (err: any) {
      console.error('Failed to recover data', err);
      return { success: false, error: err.message || String(err) };
    }
  };

  // Handler to add a new employee
  const handleAddEmployee = async (emp: Employee) => {
    triggerMutation();
    setEmployees((prev) => [...prev, emp]);

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emp),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${res.status}`);
      }
    } catch (e: any) {
      console.error("Failed to save employee to backend", e);
      // Rollback optimistic state
      setEmployees((prev) => prev.filter((item) => item.id !== emp.id));
      alert(`ບໍ່ສາມາດບັນທຶກຂໍ້ມູນພະນັກງານໄດ້: ${e.message || 'ເກີດຂໍ້ຜິດພາດທາງເຊີເວີ'}`);
    }
  };

  // Handler to update an existing employee
  const handleUpdateEmployee = async (emp: Employee) => {
    triggerMutation();
    const originalEmployees = [...employees];
    setEmployees((prev) =>
      prev.map((e) => (e.id === emp.id ? emp : e))
    );

    try {
      const res = await fetch(`/api/employees/${emp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emp),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${res.status}`);
      }
    } catch (e: any) {
      console.error("Failed to update employee in backend", e);
      // Rollback
      setEmployees(originalEmployees);
      alert(`ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນພະນັກງານໄດ້: ${e.message || 'ເກີດຂໍ້ຜິດພາດທາງເຊີເວີ'}`);
    }
  };

  // Handler to delete an employee & clean up records
  const handleDeleteEmployee = async (id: string) => {
    triggerMutation();
    const originalEmployees = [...employees];
    const originalAttendance = [...attendance];
    const originalNotifications = [...notifications];

    const updatedEmployees = employees.filter((e) => e.id !== id);
    const updatedAttendance = attendance.filter((r) => r.employeeId !== id);
    const updatedNotifications = notifications.filter((n) => n.employeeId !== id);

    setEmployees(updatedEmployees);
    setAttendance(updatedAttendance);
    setNotifications(updatedNotifications);

    localStorage.setItem('hr_employees', JSON.stringify(updatedEmployees));
    localStorage.setItem('hr_attendance', JSON.stringify(updatedAttendance));
    localStorage.setItem('hr_notifications', JSON.stringify(updatedNotifications));

    // Keep local record of deleted ID to prevent restore
    const localDeleted = safeJsonParse<string[]>(localStorage.getItem('hr_deleted_employee_ids'), []);
    if (!localDeleted.includes(id)) {
      localStorage.setItem('hr_deleted_employee_ids', JSON.stringify([...localDeleted, id]));
    }

    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${res.status}`);
      }
    } catch (e: any) {
      console.error("Failed to delete employee from backend", e);
      // Rollback
      setEmployees(originalEmployees);
      setAttendance(originalAttendance);
      setNotifications(originalNotifications);
      localStorage.setItem('hr_employees', JSON.stringify(originalEmployees));
      localStorage.setItem('hr_attendance', JSON.stringify(originalAttendance));
      localStorage.setItem('hr_notifications', JSON.stringify(originalNotifications));
      alert(`ບໍ່ສາມາດລົບຂໍ້ມູນພະນັກງານໄດ້: ${e.message || 'ເກີດຂໍ້ຜິດພາດທາງເຊີເວີ'}`);
    }
  };

  // Handler to bulk delete employees
  const handleBulkDeleteEmployees = async (ids: string[]) => {
    triggerMutation();
    const originalEmployees = [...employees];
    const originalAttendance = [...attendance];
    const originalNotifications = [...notifications];

    const updatedEmployees = employees.filter((e) => !ids.includes(e.id));
    const updatedAttendance = attendance.filter((r) => !ids.includes(r.employeeId));
    const updatedNotifications = notifications.filter((n) => !ids.includes(n.employeeId || ""));

    setEmployees(updatedEmployees);
    setAttendance(updatedAttendance);
    setNotifications(updatedNotifications);

    localStorage.setItem('hr_employees', JSON.stringify(updatedEmployees));
    localStorage.setItem('hr_attendance', JSON.stringify(updatedAttendance));
    localStorage.setItem('hr_notifications', JSON.stringify(updatedNotifications));

    // Keep local record of deleted IDs to prevent restore
    const localDeleted = safeJsonParse<string[]>(localStorage.getItem('hr_deleted_employee_ids'), []);
    const newDeleted = Array.from(new Set([...localDeleted, ...ids]));
    localStorage.setItem('hr_deleted_employee_ids', JSON.stringify(newDeleted));

    try {
      const res = await fetch('/api/employees/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${res.status}`);
      }
    } catch (e: any) {
      console.error("Failed to bulk delete employees from backend", e);
      // Rollback
      setEmployees(originalEmployees);
      setAttendance(originalAttendance);
      setNotifications(originalNotifications);
      localStorage.setItem('hr_employees', JSON.stringify(originalEmployees));
      localStorage.setItem('hr_attendance', JSON.stringify(originalAttendance));
      localStorage.setItem('hr_notifications', JSON.stringify(originalNotifications));
      alert(`ບໍ່ສາມາດລົບຂໍ້ມູນພະນັກງານໄດ້: ${e.message || 'ເກີດຂໍ້ຜິດພາດທາງເຊີເວີ'}`);
    }
  };

  // Trigger Notification
  const handleTriggerNotification = async (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => {
    const timeStr = new Date().toLocaleTimeString('lo-LA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const newNotification: SystemNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: timeStr,
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);

    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotification),
      });
    } catch (e) {
      console.error("Failed to sync notification to backend", e);
    }
  };

  // Dismiss notification banner
  const handleDismissNotification = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await fetch('/api/notifications/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      console.error("Failed to dismiss notification in backend", e);
    }
  };

  // Save Logo Settings
  const handleLogoChange = async (newLogo: string) => {
    setCustomLogo(newLogo);
    localStorage.setItem('hr_custom_logo', newLogo);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customLogo: newLogo }),
      });
    } catch (e) {
      console.error("Failed to save settings to backend", e);
    }
  };

  // Render logo helper
  const renderLogo = () => {
    if (!customLogo || customLogo === 'DEFAULT_SVG') {
      return (
        <div 
          className="w-10 h-10 flex items-center justify-center flex-shrink-0" 
          dangerouslySetInnerHTML={{ __html: DEFAULT_LOGO_SVG }} 
        />
      );
    }
    
    return (
      <img 
        src={customLogo} 
        alt="Company Logo" 
        className="w-10 h-10 object-contain rounded-xl flex-shrink-0 border border-slate-100" 
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      
      {/* Instant simulated mobile-notification banners */}
      <NotificationBanner 
        notifications={notifications} 
        onDismiss={handleDismissNotification} 
      />

      {/* Main Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            {renderLogo()}
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight leading-none">
                ລະບົບໝາຍວັນງານ
              </h1>
              <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold font-sans mt-1">
                ATTENDANCE & LEAVE SYSTEM
              </p>
            </div>
          </div>

          {/* Quick Info & Portal Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl relative">
              <motion.button
                id="view-home-btn"
                onClick={() => setActiveView('home')}
                whileTap={{ scale: 0.96 }}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold font-sans transition-colors duration-200 cursor-pointer z-10 ${
                  activeView === 'home'
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {activeView === 'home' && (
                  <motion.div
                    layoutId="active-portal-tab"
                    className="absolute inset-0 bg-emerald-600 rounded-xl -z-10 shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ໜ້າຫຼັກ (Home)</span>
                <span className="inline sm:hidden">Home</span>
              </motion.button>

              <motion.button
                id="view-employee-btn"
                onClick={() => setActiveView('employee')}
                whileTap={{ scale: 0.96 }}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold font-sans transition-colors duration-200 cursor-pointer z-10 ${
                  activeView === 'employee'
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {activeView === 'employee' && (
                  <motion.div
                    layoutId="active-portal-tab"
                    className="absolute inset-0 bg-teal-600 rounded-xl -z-10 shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ພະນັກງານ (Portal)</span>
                <span className="inline sm:hidden">ພະນັກງານ</span>
              </motion.button>
              
              <motion.button
                id="view-hr-btn"
                onClick={() => setActiveView('hr')}
                whileTap={{ scale: 0.96 }}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold font-sans transition-colors duration-200 cursor-pointer z-10 ${
                  activeView === 'hr'
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {activeView === 'hr' && (
                  <motion.div
                    layoutId="active-portal-tab"
                    className="absolute inset-0 bg-slate-800 dark:bg-slate-700 rounded-xl -z-10 shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ຝ່າຍບຸກຄົນ (HR)</span>
                <span className="inline sm:hidden">HR</span>
              </motion.button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Instant Mobile Notification System notice */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-teal-600">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans">
                ລະບົບແຈ້ງເຕືອນຜ່ານມື້ຖື ແລະ ບຣາວເຊີທັນທີ (Instant Notifications)
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed mt-0.5">
                ເມື່ອມີການ Check In/Out, ລົງທະບຽນໄປວຽກນອກ, ຫຼື ສົ່ງໃບລາພັກ, ລະບົບຈະສົ່ງແຈ້ງເຕືອນພ້ອມສຽງຊິມທັນທີ.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if ('Notification' in window) {
                Notification.requestPermission().then((perm) => {
                  if (perm === 'granted') {
                    alert('ອະນຸຍາດແຈ້ງເຕືອນຜ່ານບຣາວເຊີສຳເລັດ!');
                  } else {
                    alert('ກະລຸນາເປີດການອະນຸຍາດໃນການຕັ້ງຄ່າບຣາວເຊີຂອງທ່ານ.');
                  }
                });
              } else {
                alert('ບຣາວເຊີນີ້ບໍ່ຮອງຮັບ Native Notifications ແຕ່ລະບົບຈຳລອງໃນແອັບຍັງໃຊ້ງານໄດ້!');
              }
            }}
            className="text-[11px] font-bold text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-slate-800 hover:bg-teal-50/50 dark:hover:bg-slate-800/50 px-3.5 py-1.5 rounded-xl font-sans transition-all cursor-pointer whitespace-nowrap"
          >
            🔔 ທົດສອບການແຈ້ງເຕືອນ
          </button>
        </div>

        {/* View Routing Render */}
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeView === 'home' ? (
            <HomeLanding
              onNavigate={(view) => setActiveView(view)}
              onOpenMobileGuide={() => {
                document.getElementById('btn-floating-mobile-guide')?.click();
              }}
              employeeCount={employees.length}
              todayCheckInCount={(() => {
                const todayStr = new Date().toLocaleDateString('en-CA'); // "YYYY-MM-DD"
                return attendance.filter(r => r.date === todayStr).length;
              })()}
            />
          ) : activeView === 'employee' ? (
            <EmployeeDashboard
              employees={employees}
              attendance={attendance}
              shifts={shifts}
              onAddAttendance={handleAddAttendance}
              onUpdateAttendance={handleUpdateAttendance}
              onTriggerNotification={handleTriggerNotification}
              enableQrTimeRestriction={enableQrTimeRestriction}
              enableQrCodeSystem={enableQrCodeSystem}
              checkInDeadline={checkInDeadline}
              checkOutDeadline={checkOutDeadline}
              checkInStart={checkInStart}
              checkOutStart={checkOutStart}
              enableGpsRestriction={enableGpsRestriction}
              officeLat={officeLat}
              officeLng={officeLng}
              officeRadius={officeRadius}
            />
          ) : (
            <HRDashboard
              employees={employees}
              attendance={attendance}
              shifts={shifts}
              onAddShift={handleAddShift}
              onDeleteShift={handleDeleteShift}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onBulkDeleteEmployees={handleBulkDeleteEmployees}
              onUpdateAttendance={handleUpdateAttendance}
              onAddAttendance={handleAddAttendance}
              onDeleteAttendance={handleDeleteAttendance}
              onBulkDeleteAttendance={handleBulkDeleteAttendance}
              onClearAllAttendance={handleClearAllAttendance}
              onLogoChange={handleLogoChange}
              customLogo={customLogo}
              onRecoverData={handleRecoverData}
              checkInStart={checkInStart}
              checkInDeadline={checkInDeadline}
              checkOutStart={checkOutStart}
              checkOutDeadline={checkOutDeadline}
              enableQrTimeRestriction={enableQrTimeRestriction}
              enableQrCodeSystem={enableQrCodeSystem}
              enableGpsRestriction={enableGpsRestriction}
              officeLat={officeLat}
              officeLng={officeLng}
              officeRadius={officeRadius}
              onUpdateSettings={handleUpdateSettings}
            />
          )}
        </motion.div>
      </main>

      {/* Modern Footer */}
      <footer className="mt-12 py-8 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-xs text-slate-400 font-sans">
            ລະບົບໝາຍວັນງານ ແລະ ລາຍງານການເຂົ້າ-ອອກວຽກຂອງພະນັກງານ ຮອງຮັບທັງ Desktop, Android, ແລະ iOS.
          </p>
          <p className="text-[10px] text-slate-300 dark:text-slate-800 font-sans">
            &copy; 2026 HR-TIME Tracker Systems. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
