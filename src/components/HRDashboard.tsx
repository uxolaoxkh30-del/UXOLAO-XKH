import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrowserPermissionsGuide } from "./BrowserPermissionsGuide";
import {
  Users,
  Calendar,
  AlertOctagon,
  Settings,
  Edit,
  Plus,
  Trash2,
  Search,
  Check,
  X,
  ShieldCheck,
  Lock,
  LogIn,
  Upload,
  Image,
  HelpCircle,
  UserPlus,
  Sliders,
  ChevronRight,
  FileSpreadsheet,
  Eye,
  QrCode,
  Printer,
  Download,
  TrendingUp,
  BarChart3,
  PieChart,
  Info,
  CalendarDays,
  Bell,
  RefreshCw,
  Clock,
  Save,
  LayoutGrid,
  Table2,
  MapPin,
  BookOpen,
  ClipboardList,
  FileText,
  Wifi,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  CartesianGrid,
  Legend,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
} from "recharts";
import {
  Employee,
  AttendanceRecord,
  WorkStatus,
  LeaveType,
  SystemNotification,
  ShiftAssignment,
  ShiftType,
} from "../types";
import { calculateHours, formatHours, formatLaoDate, formatLaoDateFriendly } from "../data";

const getCurrentLocalDateTimeString = (): string => {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  return `${timeStr} ${dateStr}`;
};

const LAO_MONTHS = [
  "ມັງກອນ (January)",
  "ກຸມພາ (February)",
  "ມີນາ (March)",
  "ເມສາ (April)",
  "ພຶດສະພາ (May)",
  "ມິຖຸນາ (June)",
  "ກໍລະກົດ (July)",
  "ສິງຫາ (August)",
  "ກັນຍາ (September)",
  "ຕຸລາ (October)",
  "ພະຈິກ (November)",
  "ທັນວາ (December)"
];

const formatEnteredTime = (val: string): string | null => {
  const clean = val.trim();
  if (!clean) return null;

  // If already matches HH:MM:SS or HH:MM
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(clean)) {
    const parts = clean.split(":");
    const h = parts[0].padStart(2, "0");
    const m = parts[1].padStart(2, "0");
    const s = parts[2] ? parts[2].padStart(2, "0") : "00";
    return `${h}:${m}:${s}`;
  }

  // If entered as HH.MM or HH,MM
  if (/^\d{1,2}[.,]\d{2}$/.test(clean)) {
    const parts = clean.split(/[.,]/);
    const h = parts[0].padStart(2, "0");
    const m = parts[1].padStart(2, "0");
    return `${h}:${m}:00`;
  }

  // If entered as just HH (e.g., 8 or 17)
  if (/^\d{1,2}$/.test(clean)) {
    const h = clean.padStart(2, "0");
    return `${h}:00:00`;
  }

  // If entered as HHMM (4 digits, e.g., 0830)
  if (/^\d{4}$/.test(clean)) {
    const h = clean.substring(0, 2);
    const m = clean.substring(2, 4);
    return `${h}:${m}:00`;
  }

  return clean;
};

interface HRDashboardProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  shifts?: ShiftAssignment[];
  onAddShift?: (shift: ShiftAssignment) => void;
  onDeleteShift?: (id: string) => void;
  onAddEmployee: (employee: Employee) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onBulkDeleteEmployees: (ids: string[]) => void;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onAddAttendance: (record: AttendanceRecord) => void;
  onDeleteAttendance: (id: string) => void;
  onBulkDeleteAttendance: (ids: string[]) => void;
  onClearAllAttendance?: () => void;
  onLogoChange: (logoUrlOrSvg: string) => void;
  customLogo: string | null;
  checkInStart?: string;
  checkInDeadline?: string;
  checkOutStart?: string;
  checkOutDeadline?: string;
  enableQrTimeRestriction?: boolean;
  enableQrCodeSystem?: boolean;
  enableGpsRestriction?: boolean;
  enableNetworkRestriction?: boolean;
  officeLat?: number;
  officeLng?: number;
  officeRadius?: number;
  onUpdateSettings?: (
    newCheckIn: string,
    newCheckOut: string,
    newRestriction: boolean,
    newQrCodeSystem?: boolean,
    newCheckInStart?: string,
    newCheckOutStart?: string,
    newEnableGpsRestriction?: boolean,
    newOfficeLat?: number,
    newOfficeLng?: number,
    newOfficeRadius?: number,
    newEnableNetworkRestriction?: boolean
  ) => void;
  onRecoverData?: () => Promise<{
    success: boolean;
    recoveredEmployeesCount?: number;
    recoveredAttendanceCount?: number;
    recoveredNotificationsCount?: number;
    error?: string;
  }>;
}

export const HRDashboard: React.FC<HRDashboardProps> = ({
  employees,
  attendance,
  shifts = [],
  onAddShift,
  onDeleteShift,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onBulkDeleteEmployees,
  onUpdateAttendance,
  onAddAttendance,
  onDeleteAttendance,
  onBulkDeleteAttendance,
  onClearAllAttendance,
  onLogoChange,
  customLogo,
  onRecoverData,
  checkInStart: initialCheckInStart = "07:30",
  checkInDeadline: initialCheckInDeadline = "08:30",
  checkOutStart: initialCheckOutStart = "15:40",
  checkOutDeadline: initialCheckOutDeadline = "18:00",
  enableQrTimeRestriction: initialEnableQrTimeRestriction = true,
  enableQrCodeSystem: initialEnableQrCodeSystem = true,
  enableGpsRestriction: initialEnableGpsRestriction = false,
  enableNetworkRestriction: initialEnableNetworkRestriction = false,
  officeLat: initialOfficeLat = 17.9638,
  officeLng: initialOfficeLng = 102.6132,
  officeRadius: initialOfficeRadius = 200,
  onUpdateSettings,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("hr_authenticated") === "true";
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Dynamic credentials from backend settings
  const [dbUsername, setDbUsername] = useState(() => {
    return localStorage.getItem("hr_username") || "admin";
  });
  const [dbPassword, setDbPassword] = useState(() => {
    return localStorage.getItem("hr_password") || "123456";
  });
  const [newUsernameInput, setNewUsernameInput] = useState(() => {
    return localStorage.getItem("hr_username") || "admin";
  });
  const [newPasswordInput, setNewPasswordInput] = useState(() => {
    return localStorage.getItem("hr_password") || "123456";
  });
  const [credentialsSuccessMsg, setCredentialsSuccessMsg] = useState("");

  // Automated Notifications States
  const [enableAutoNotifications, setEnableAutoNotifications] = useState(true);
  const [enableQrTimeRestriction, setEnableQrTimeRestriction] = useState(initialEnableQrTimeRestriction);
  const [enableQrCodeSystem, setEnableQrCodeSystem] = useState(initialEnableQrCodeSystem);
  const [checkInStart, setCheckInStart] = useState(initialCheckInStart);
  const [checkInDeadline, setCheckInDeadline] = useState(initialCheckInDeadline);
  const [checkOutStart, setCheckOutStart] = useState(initialCheckOutStart);
  const [checkOutDeadline, setCheckOutDeadline] = useState(initialCheckOutDeadline);
  const [enableGpsRestriction, setEnableGpsRestriction] = useState(initialEnableGpsRestriction);
  const [enableNetworkRestriction, setEnableNetworkRestriction] = useState(initialEnableNetworkRestriction);
  const [officeLat, setOfficeLat] = useState(initialOfficeLat);
  const [officeLng, setOfficeLng] = useState(initialOfficeLng);
  const [officeRadius, setOfficeRadius] = useState(initialOfficeRadius);
  const [notifSettingsSuccessMsg, setNotifSettingsSuccessMsg] = useState("");
  const [manualCheckResult, setManualCheckResult] = useState<any>(null);
  const [isTriggeringChecks, setIsTriggeringChecks] = useState(false);

  React.useEffect(() => {
    setEnableQrTimeRestriction(initialEnableQrTimeRestriction);
  }, [initialEnableQrTimeRestriction]);

  React.useEffect(() => {
    setEnableQrCodeSystem(initialEnableQrCodeSystem);
  }, [initialEnableQrCodeSystem]);

  React.useEffect(() => {
    setCheckInDeadline(initialCheckInDeadline);
  }, [initialCheckInDeadline]);

  React.useEffect(() => {
    setCheckOutDeadline(initialCheckOutDeadline);
  }, [initialCheckOutDeadline]);

  React.useEffect(() => {
    setCheckInStart(initialCheckInStart);
  }, [initialCheckInStart]);

  React.useEffect(() => {
    setCheckOutStart(initialCheckOutStart);
  }, [initialCheckOutStart]);

  React.useEffect(() => {
    setEnableGpsRestriction(initialEnableGpsRestriction);
  }, [initialEnableGpsRestriction]);

  React.useEffect(() => {
    setEnableNetworkRestriction(initialEnableNetworkRestriction);
  }, [initialEnableNetworkRestriction]);

  React.useEffect(() => {
    setOfficeLat(initialOfficeLat);
  }, [initialOfficeLat]);

  React.useEffect(() => {
    setOfficeLng(initialOfficeLng);
  }, [initialOfficeLng]);

  React.useEffect(() => {
    setOfficeRadius(initialOfficeRadius);
  }, [initialOfficeRadius]);

  // Recovery States
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryResultMsg, setRecoveryResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRecoverAllData = async () => {
    if (!onRecoverData) return;
    setIsRecovering(true);
    setRecoveryResultMsg(null);
    try {
      const result = await onRecoverData();
      if (result.success) {
        setRecoveryResultMsg({
          type: 'success',
          text: `ກູ້ຄືນຂໍ້ມູນພະນັກງານ ແລະ ປະຫວັດທັງໝົດສຳເລັດ! ພະນັກງານທີ່ກູ້ຄືນ: ${result.recoveredEmployeesCount || 0} ຄົນ, ປະຫວັດການເຂົ້າ-ອອກວຽກ: ${result.recoveredAttendanceCount || 0} ລາຍການ.`
        });
      } else {
        setRecoveryResultMsg({
          type: 'error',
          text: `ບໍ່ສາມາດກູ້ຄືນຂໍ້ມູນໄດ້: ${result.error || 'Unknown Error'}`
        });
      }
    } catch (err) {
      setRecoveryResultMsg({
        type: 'error',
        text: `ເກີດຂໍ້ຜິດພາດ: ${err instanceof Error ? err.message : String(err)}`
      });
    } finally {
      setIsRecovering(false);
    }
  };

  // Fetch settings credentials from backend on load
  React.useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          const data = await res.json();
          const localUser = localStorage.getItem("hr_username");
          const localPass = localStorage.getItem("hr_password");

          setEnableAutoNotifications(data.enableAutoNotifications !== undefined ? data.enableAutoNotifications : true);
          setEnableQrTimeRestriction(data.enableQrTimeRestriction !== undefined ? data.enableQrTimeRestriction : true);
          setEnableQrCodeSystem(data.enableQrCodeSystem !== undefined ? data.enableQrCodeSystem : true);
          setCheckInDeadline(data.checkInDeadline || "08:30");
          setCheckOutDeadline(data.checkOutDeadline || "18:00");
          setEnableGpsRestriction(data.enableGpsRestriction !== undefined ? data.enableGpsRestriction : false);
          setEnableNetworkRestriction(data.enableNetworkRestriction !== undefined ? data.enableNetworkRestriction : false);
          setOfficeLat(data.officeLat !== undefined ? data.officeLat : 17.9638);
          setOfficeLng(data.officeLng !== undefined ? data.officeLng : 102.6132);
          setOfficeRadius(data.officeRadius !== undefined ? data.officeRadius : 200);

          // If server settings are default, but we have custom settings in localStorage,
          // sync localStorage settings to server.
          if (
            data.hrUsername === "admin" &&
            data.hrPassword === "123456" &&
            localUser &&
            localPass &&
            (localUser !== "admin" || localPass !== "123456")
          ) {
            try {
              await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  hrUsername: localUser,
                  hrPassword: localPass,
                }),
              });
            } catch (err) {
              console.error(
                "Failed to restore custom credentials to server",
                err,
              );
            }
            setDbUsername(localUser);
            setDbPassword(localPass);
            setNewUsernameInput(localUser);
            setNewPasswordInput(localPass);
          } else {
            setDbUsername(data.hrUsername || "admin");
            setDbPassword(data.hrPassword || "123456");
            setNewUsernameInput(data.hrUsername || "admin");
            setNewPasswordInput(data.hrPassword || "123456");

            // Save to local storage just in case
            if (data.hrUsername)
              localStorage.setItem("hr_username", data.hrUsername);
            if (data.hrPassword)
              localStorage.setItem("hr_password", data.hrPassword);
          }
        }
      } catch (e) {
        console.error("Failed to load HR settings from backend", e);
      }
    }
    loadSettings();
  }, []);



  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "attendance" | "forgot_report" | "employees" | "settings" | "shifts" | "weekend_duty" | "guides" | "leave_management"
  >("attendance");

  // Shifts Assignment Form State
  const [shiftEmployeeId, setShiftEmployeeId] = useState("");
  const [shiftDate, setShiftDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [shiftType, setShiftType] = useState<ShiftType>("morning");
  const [shiftStartTime, setShiftStartTime] = useState("08:30");
  const [shiftEndTime, setShiftEndTime] = useState("12:00");
  const [shiftNotes, setShiftNotes] = useState("");
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);

  // Employee CRUD State
  const [newEmployee, setNewEmployee] = useState({
    employeeCode: "",
    firstName: "",
    lastName: "",
    position: "",
    phone: "",
    avatar: "",
  });

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDateFilter, setSelectedDateFilter] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");

  // Editing Attendance Record State
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(
    null,
  );
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");
  const [editStatus, setEditStatus] = useState<WorkStatus | "ລາພັກ">(
    "ເຂົ້າວຽກປົກກະຕິ",
  );
  const [editRemarks, setEditRemarks] = useState("");
  const [editDutyMonth, setEditDutyMonth] = useState("");
  const [editDutyContent, setEditDutyContent] = useState("");
  const [editLeaveType, setEditLeaveType] = useState<LeaveType>("ລາພັກປະຈຳປີ");
  const [editLeaveDetails, setEditLeaveDetails] = useState("");
  const [editTripDetails, setEditTripDetails] = useState("");
  const [editTripStartDate, setEditTripStartDate] = useState("");
  const [editTripEndDate, setEditTripEndDate] = useState("");
  const [editTripStartTime, setEditTripStartTime] = useState("");
  const [editTripEndTime, setEditTripEndTime] = useState("");

  // Manual Attendance Form State (Add missing log)
  const [selectedEmployeeForQr, setSelectedEmployeeForQr] =
    useState<Employee | null>(null);
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [manualLog, setManualLog] = useState({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    checkIn: "",
    checkOut: "",
    status: "ເຂົ້າວຽກປົກກະຕິ" as WorkStatus | "ລາພັກ",
    remarks: "",
    dutyMonth: "",
    dutyContent: "",
    leaveType: "ລາພັກປະຈຳປີ" as LeaveType,
    leaveDetails: "",
    tripDetails: "",
    tripStartDate: new Date().toISOString().split("T")[0],
    tripEndDate: new Date().toISOString().split("T")[0],
    tripStartTime: "",
    tripEndTime: "",
  });

  // Report Time-frame filter for forgetfulness reports
  const [forgetReportTimeframe, setForgetReportTimeframe] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");

  // Leave Management States
  const [editingQuotaEmpId, setEditingQuotaEmpId] = useState<string | null>(null);
  const [quotaValue, setQuotaValue] = useState<number>(15);
  const [quotaValueSick, setQuotaValueSick] = useState<number>(30);
  const [quotaValueMaternity, setQuotaValueMaternity] = useState<number>(90);
  const [quotaValuePersonal, setQuotaValuePersonal] = useState<number>(7);

  const [addingLeaveEmpId, setAddingLeaveEmpId] = useState<string | null>(null);
  const [manualLeaveType, setManualLeaveType] = useState<LeaveType>("ລາພັກປະຈຳປີ");
  const [manualLeaveStart, setManualLeaveStart] = useState<string>(new Date().toISOString().split("T")[0]);
  const [manualLeaveEnd, setManualLeaveEnd] = useState<string>(new Date().toISOString().split("T")[0]);
  const [manualLeaveReason, setManualLeaveReason] = useState<string>("");
  const [expandedEmpLeavesId, setExpandedEmpLeavesId] = useState<string | null>(null);

  const calculateLeaveDuration = (startStr: string, endStr: string): number => {
    if (!startStr || !endStr) return 1;
    try {
      const start = new Date(startStr);
      const end = new Date(endStr);
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return isNaN(diffDays) || diffDays <= 0 ? 1 : diffDays;
    } catch (e) {
      return 1;
    }
  };

  const getEmployeeLeaveDaysTaken = (employeeId: string) => {
    let count = 0;
    attendance.forEach((rec) => {
      if (rec.employeeId === employeeId && rec.status === "ລາພັກ") {
        const isApprovedOrManual = !rec.leaveDetails?.status || rec.leaveDetails?.status === "approved";
        if (isApprovedOrManual) {
          if (rec.leaveDetails?.startDate && rec.leaveDetails?.endDate) {
            count += calculateLeaveDuration(rec.leaveDetails.startDate, rec.leaveDetails.endDate);
          } else {
            count += 1;
          }
        }
      }
    });
    return count;
  };

  // Get employee compensatory leaves earned based on weekend duties
  const getEmployeeCompensatoryQuota = (employeeId: string): number => {
    let earned = 0;
    attendance.forEach((rec) => {
      if (rec.employeeId === employeeId) {
        if (rec.status === 'ປະຈຳການ (ວັນເສົາ ຫາ ວັນອາທິດ)') {
          earned += 2;
        } else if (rec.status === 'ປະຈຳການ ວັນເສົາ' || rec.status === 'ປະຈຳການ ວັນອາທິດ') {
          earned += 1;
        }
      }
    });
    return earned;
  };

  // Get leaves taken by type
  const getEmployeeLeaveDaysTakenByType = (employeeId: string, type: LeaveType) => {
    let count = 0;
    attendance.forEach((rec) => {
      if (rec.employeeId === employeeId && rec.status === "ລາພັກ" && rec.leaveDetails?.type === type) {
        const isApprovedOrManual = !rec.leaveDetails?.status || rec.leaveDetails?.status === "approved";
        if (isApprovedOrManual) {
          if (rec.leaveDetails?.startDate && rec.leaveDetails?.endDate) {
            count += calculateLeaveDuration(rec.leaveDetails.startDate, rec.leaveDetails.endDate);
          } else {
            count += 1;
          }
        }
      }
    });
    return count;
  };

  const handleSaveManualLeave = () => {
    if (!addingLeaveEmpId) return;
    const emp = employees.find(e => e.id === addingLeaveEmpId);
    if (!emp) return;

    const newLeaveRec: AttendanceRecord = {
      id: `leave-${addingLeaveEmpId}-${Date.now()}`,
      employeeId: addingLeaveEmpId,
      date: manualLeaveStart,
      checkIn: null,
      checkOut: null,
      status: 'ລາພັກ',
      leaveDetails: {
        type: manualLeaveType,
        details: manualLeaveReason.trim() || 'ບັນທຶກໂດຍ HR Admin',
        startDate: manualLeaveStart,
        endDate: manualLeaveEnd,
        status: 'approved',
      },
      hoursWorked: null,
      remarks: null,
    };

    onAddAttendance(newLeaveRec);
    setAddingLeaveEmpId(null);
    setManualLeaveReason("");
    alert("ບັນທຶກຂໍ້ມູນການລາພັກສຳເລັດແລ້ວ!");
  };

  const handleSaveQuota = (
    empId: string,
    annual: number,
    sick: number,
    maternity: number,
    personal: number
  ) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;
    onUpdateEmployee({
      ...emp,
      totalLeaveQuota: annual,
      sickLeaveQuota: sick,
      maternityLeaveQuota: maternity,
      personalLeaveQuota: personal
    });
    setEditingQuotaEmpId(null);
    alert("ແກ້ໄຂໂກຕາວັນພັກຂອງພະນັກງານສຳເລັດແລ້ວ!");
  };

  // Selection and View States for Bulk Operations
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [selectedAttIds, setSelectedAttIds] = useState<string[]>([]);
  const [selectedForgetIds, setSelectedForgetIds] = useState<string[]>([]);
  const [forgetViewMode, setForgetViewMode] = useState<"cards" | "table">("cards");
  const [deletedForgotKeys, setDeletedForgotKeys] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("deleted_forgot_keys");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const handleDeleteForgotKeys = (keysToDelete: string[]) => {
    const updated = [...deletedForgotKeys, ...keysToDelete];
    setDeletedForgotKeys(updated);
    localStorage.setItem("deleted_forgot_keys", JSON.stringify(updated));
    setSelectedForgetIds([]);
  };

  const handleRestoreForgotKeys = () => {
    if (confirm("ທ່ານຕ້ອງການກູ້ຄືນລາຍການລືມທີ່ຖືກລົບທັງໝົດ ຫຼື ບໍ່?")) {
      setDeletedForgotKeys([]);
      localStorage.removeItem("deleted_forgot_keys");
      setSelectedForgetIds([]);
      alert("ກູ້ຄືນລາຍການລືມທັງໝົດສຳເລັດ!");
    }
  };

  const handleToggleForgetSelect = (key: string) => {
    setSelectedForgetIds((prev) =>
      prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]
    );
  };

  const [selectedReportDate, setSelectedReportDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [heatmapMonth, setHeatmapMonth] = useState(() => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  });

  // Logo Input
  const [logoInputType, setLogoInputType] = useState<"url" | "preset">(
    "preset",
  );
  const [logoUrl, setLogoUrl] = useState("");

  // Handle Authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === dbUsername && password === dbPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("hr_authenticated", "true");
      setAuthError("");
    } else {
      setAuthError("ລະຫັດຜ່ານ ຫຼື ຊື່ຜູ້ໃຊ້ ບໍ່ຖືກຕ້ອງ! ກະລຸນາກວດສອບຄືນໃໝ່.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.setItem("hr_authenticated", "false");
  };

  // Start editing employee
  const handleStartEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setNewEmployee({
      employeeCode: emp.employeeCode,
      firstName: emp.firstName,
      lastName: emp.lastName,
      position: emp.position,
      phone: emp.phone || "",
      avatar: emp.avatar || "",
    });
    // Scroll form into view
    const formEl = document.getElementById("employee-form-title");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Cancel editing employee
  const handleCancelEditEmployee = () => {
    setEditingEmployee(null);
    setNewEmployee({
      employeeCode: "",
      firstName: "",
      lastName: "",
      position: "",
      phone: "",
      avatar: "",
    });
  };

  const handleDeleteEmployee = (id: string, name: string) => {
    if (confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບພະນັກງານ "${name}" ອອກຈາກລະບົບ?`)) {
      onDeleteEmployee(id);
    }
  };

  // Handle avatar local file upload
  const handleEmployeeAvatarFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // limit 2MB
        alert("ຮູບພາບໃຫຍ່ເກີນໄປ! ກະລຸນາເລືອກຮູບທີ່ມີຂະໜາດບໍ່ເກີນ 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEmployee((prev) => ({
          ...prev,
          avatar: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Add or Edit Employee
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newEmployee.employeeCode ||
      !newEmployee.firstName ||
      !newEmployee.lastName ||
      !newEmployee.position
    ) {
      alert("ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ");
      return;
    }

    if (editingEmployee) {
      // Check code duplication for other employees
      if (
        employees.some(
          (emp) =>
            emp.id !== editingEmployee.id &&
            emp.employeeCode.toUpperCase() ===
              newEmployee.employeeCode.toUpperCase(),
        )
      ) {
        alert("ລະຫັດພະນັກງານນີ້ມີໃນລະບົບແລ້ວ!");
        return;
      }

      const updated: Employee = {
        ...editingEmployee,
        employeeCode: newEmployee.employeeCode.toUpperCase(),
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        position: newEmployee.position,
        phone: newEmployee.phone,
        avatar:
          newEmployee.avatar ||
          `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`,
      };

      onUpdateEmployee(updated);
      setEditingEmployee(null);
      setNewEmployee({
        employeeCode: "",
        firstName: "",
        lastName: "",
        position: "",
        phone: "",
        avatar: "",
      });
      alert("ແກ້ໄຂຂໍ້ມູນພະນັກງານສຳເລັດ!");
    } else {
      // Check code duplication
      if (
        employees.some(
          (emp) =>
            emp.employeeCode.toUpperCase() ===
            newEmployee.employeeCode.toUpperCase(),
        )
      ) {
        alert("ລະຫັດພະນັກງານນີ້ມີໃນລະບົບແລ້ວ!");
        return;
      }

      const created: Employee = {
        id: `emp-${Date.now()}`,
        employeeCode: newEmployee.employeeCode.toUpperCase(),
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        position: newEmployee.position,
        phone: newEmployee.phone,
        avatar:
          newEmployee.avatar ||
          `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`,
      };

      onAddEmployee(created);
      setNewEmployee({
        employeeCode: "",
        firstName: "",
        lastName: "",
        position: "",
        phone: "",
        avatar: "",
      });
      setSelectedEmployeeForQr(created);
      alert(
        "ເພີ່ມພະນັກງານເຂົ້າໃນຖານຂໍ້ມູນສຳເລັດ! ລະບົບໄດ້ສ້າງ QR Code ໃຫ້ອັດຕະໂນມັດ.",
      );
    }
  };

  const handleShiftTypeChange = (type: ShiftType) => {
    setShiftType(type);
    if (!editingShiftId) {
      if (type === "morning") {
        setShiftStartTime("08:30");
        setShiftEndTime("12:00");
      } else if (type === "afternoon") {
        setShiftStartTime("13:00");
        setShiftEndTime("17:00");
      } else {
        setShiftStartTime("08:30");
        setShiftEndTime("17:00");
      }
    }
  };

  const handleStartEditShift = (sh: ShiftAssignment) => {
    setEditingShiftId(sh.id);
    setShiftEmployeeId(sh.employeeId);
    setShiftDate(sh.date);
    setShiftType(sh.shiftType);
    setShiftStartTime(sh.startTime || (sh.shiftType === 'morning' ? '08:30' : sh.shiftType === 'afternoon' ? '13:00' : '08:30'));
    setShiftEndTime(sh.endTime || (sh.shiftType === 'morning' ? '12:00' : sh.shiftType === 'afternoon' ? '17:00' : '17:00'));
    setShiftNotes(sh.notes || "");
  };

  const handleCancelEditShift = () => {
    setEditingShiftId(null);
    setShiftEmployeeId("");
    setShiftNotes("");
    setShiftStartTime("08:30");
    setShiftEndTime("12:00");
  };

  const handleAssignShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftEmployeeId) {
      alert("ກະລຸນາເລືອກພະນັກງານ!");
      return;
    }
    if (!shiftDate) {
      alert("ກະລຸນາເລືອກວັນທີ!");
      return;
    }

    const emp = employees.find(e => e.id === shiftEmployeeId);
    if (!emp) return;

    const newAssignment: ShiftAssignment = {
      id: editingShiftId || `shift-${Date.now()}`,
      employeeId: shiftEmployeeId,
      date: shiftDate,
      shiftType,
      startTime: shiftStartTime,
      endTime: shiftEndTime,
      notes: shiftNotes.trim() || undefined,
    };

    if (onAddShift) {
      onAddShift(newAssignment);
      alert(editingShiftId ? `ແກ້ໄຂກະການເຮັດວຽກໃຫ້ ${emp.firstName} ${emp.lastName} ສຳເລັດ!` : `ມອບໝາຍກະການເຮັດວຽກໃຫ້ ${emp.firstName} ${emp.lastName} ສຳເລັດ!`);
      // Reset
      setEditingShiftId(null);
      setShiftEmployeeId("");
      setShiftNotes("");
      setShiftStartTime("08:30");
      setShiftEndTime("12:00");
    }
  };

  const handleStartEditAttendance = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setEditCheckIn(rec.checkIn || '');
    setEditCheckOut(rec.checkOut || '');
    setEditStatus(rec.status);
    setEditRemarks(rec.remarks || '');
    setEditDutyMonth(rec.dutyMonth || LAO_MONTHS[new Date().getMonth()]);
    setEditDutyContent(rec.dutyContent || '');
    setEditLeaveType(rec.leaveDetails?.type || 'ລາພັກປະຈຳປີ');
    setEditLeaveDetails(rec.leaveDetails?.details || '');
    setEditTripDetails(rec.tripDetails?.details || '');
    setEditTripStartDate(rec.tripDetails?.startDate || rec.date);
    setEditTripEndDate(rec.tripDetails?.endDate || rec.date);
    setEditTripStartTime(rec.tripDetails?.startTime || '');
    setEditTripEndTime(rec.tripDetails?.endTime || '');
  };

  const handleUpdateLeaveStatus = (rec: AttendanceRecord, newStatus: 'pending' | 'approved' | 'rejected') => {
    const updated: AttendanceRecord = {
      ...rec,
      leaveDetails: rec.leaveDetails ? {
        ...rec.leaveDetails,
        status: newStatus
      } : {
        type: 'ລາພັກປະຈຳປີ',
        details: 'ສະເໜີລາພັກ',
        startDate: rec.date,
        endDate: rec.date,
        status: newStatus
      },
      editedAt: getCurrentLocalDateTimeString()
    };
    onUpdateAttendance(updated);
  };

  const handleSaveAttendanceEdit = () => {
    if (!editingRecord) return;

    // Standardize empty inputs to null and use formatEnteredTime for flexible inputs
    const checkInTime = formatEnteredTime(editCheckIn) || null;
    const checkOutTime = formatEnteredTime(editCheckOut) || null;

    // Auto calculate working hours if both times exist
    const hours = calculateHours(checkInTime, checkOutTime);

    // Auto flag remarks for forgot check in/out if necessary
    let remark = editRemarks.trim() || null;
    let status = editStatus;

    if (status && (status.includes("ໄປວຽກນອກ") || status.startsWith("ລາພັກ"))) {
      if (remark === "ລືມ Check In" || remark === "ລືມ Check Out") {
        remark = null;
      }
    } else {
      if (!checkInTime && checkOutTime) {
        remark = "ລືມ Check In";
      } else if (
        checkInTime &&
        !checkOutTime &&
        editingRecord.date < new Date().toISOString().split("T")[0]
      ) {
        remark = "ລືມ Check Out";
      } else if (checkInTime && checkOutTime) {
        // If both check-in and check-out times are successfully entered by HR,
        // automatically clear the "Forgot Check In / Out" remarks
        if (remark === "ລືມ Check In" || remark === "ລືມ Check Out") {
          remark = null;
        }
        // If status is not already an explicit leave or field trip or duty, default to normal work
        if (status !== "ລາພັກ" && !status.includes("ໄປວຽກນອກ") && !status.startsWith("ປະຈຳການ")) {
          status = "ເຂົ້າວຽກປົກກະຕິ";
        }
      }
    }

    if (status.startsWith("ປະຈຳການ") && !editDutyContent.trim()) {
      alert("ກະລຸນາປ້ອນເນື້ອໃນການປະຈຳການ!");
      return;
    }

    const updated: AttendanceRecord = {
      ...editingRecord,
      checkIn: checkInTime,
      checkOut: checkOutTime,
      status: status,
      hoursWorked: hours,
      remarks: remark,
      dutyMonth: status.startsWith("ປະຈຳການ") ? editDutyMonth : null,
      dutyContent: status.startsWith("ປະຈຳການ") ? editDutyContent.trim() : null,
      leaveDetails: status === "ລາພັກ" ? {
        type: editLeaveType,
        details: editLeaveDetails.trim() || "ສະເໜີລາພັກຕາມລະບຽບ",
        startDate: editingRecord.leaveDetails?.startDate || editingRecord.date,
        endDate: editingRecord.leaveDetails?.endDate || editingRecord.date,
        status: editingRecord.leaveDetails?.status || "approved"
      } : undefined,
      tripDetails: status.includes("ໄປວຽກນອກ") ? {
        details: editTripDetails.trim() || "ໄປວຽກນອກຕາມລະບຽບ",
        startDate: editTripStartDate || editingRecord.date,
        endDate: editTripEndDate || editingRecord.date,
        startTime: editTripStartTime.trim() || undefined,
        endTime: editTripEndTime.trim() || undefined,
      } : undefined,
      editedAt: getCurrentLocalDateTimeString(),
    };

    onUpdateAttendance(updated);
    setEditingRecord(null);
    alert("ອັບເດດຂໍ້ມູນການລົງເວລາສຳເລັດ!");
  };

  // Add Manual Record (Retroactive check-in by HR)
  const handleAddManualAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLog.employeeId) {
      alert("ກະລຸນາເລືອກພະນັກງານ");
      return;
    }

    const checkInTime = formatEnteredTime(manualLog.checkIn) || null;
    const checkOutTime = formatEnteredTime(manualLog.checkOut) || null;
    const hours = calculateHours(checkInTime, checkOutTime);

    let remark = manualLog.remarks.trim() || null;
    let status = manualLog.status;

    if (status && (status.includes("ໄປວຽກນອກ") || status.startsWith("ລາພັກ"))) {
      if (remark === "ລືມ Check In" || remark === "ລືມ Check Out") {
        remark = null;
      }
    } else {
      if (!checkInTime && checkOutTime) {
        remark = "ລືມ Check In";
      } else if (
        checkInTime &&
        !checkOutTime &&
        manualLog.date < new Date().toISOString().split("T")[0]
      ) {
        remark = "ລືມ Check Out";
      } else if (checkInTime && checkOutTime) {
        if (remark === "ລືມ Check In" || remark === "ລືມ Check Out") {
          remark = null;
        }
        if (status !== "ລາພັກ" && !status.includes("ໄປວຽກນອກ") && !status.startsWith("ປະຈຳການ")) {
          status = "ເຂົ້າວຽກປົກກະຕິ";
        }
      }
    }

    if (status.startsWith("ປະຈຳການ") && !manualLog.dutyContent.trim()) {
      alert("ກະລຸນາປ້ອນເນື້ອໃນການປະຈຳການ!");
      return;
    }

    const newRec: AttendanceRecord = {
      id: `manual-${manualLog.employeeId}-${Date.now()}`,
      employeeId: manualLog.employeeId,
      date: manualLog.date,
      checkIn: checkInTime,
      checkOut: checkOutTime,
      status: status,
      hoursWorked: hours,
      remarks: remark,
      dutyMonth: status.startsWith("ປະຈຳການ") ? (manualLog.dutyMonth || LAO_MONTHS[new Date().getMonth()]) : null,
      dutyContent: status.startsWith("ປະຈຳການ") ? manualLog.dutyContent.trim() : null,
      leaveDetails: status === "ລາພັກ" ? {
        type: manualLog.leaveType,
        details: manualLog.leaveDetails.trim() || "ສະເໜີລາພັກຕາມລະບຽບ",
        startDate: manualLog.date,
        endDate: manualLog.date,
        status: "approved"
      } : undefined,
      tripDetails: status.includes("ໄປວຽກນອກ") ? {
        details: manualLog.tripDetails.trim() || "ໄປວຽກນອກຕາມລະບຽບ",
        startDate: manualLog.tripStartDate || manualLog.date,
        endDate: manualLog.tripEndDate || manualLog.date,
        startTime: manualLog.tripStartTime.trim() || undefined,
        endTime: manualLog.tripEndTime.trim() || undefined,
      } : undefined,
      editedAt: getCurrentLocalDateTimeString(),
    };

    onAddAttendance(newRec);
    setShowAddLogModal(false);
    setManualLog({
      employeeId: "",
      date: new Date().toISOString().split("T")[0],
      checkIn: "",
      checkOut: "",
      status: "ເຂົ້າວຽກປົກກະຕິ",
      remarks: "",
      dutyMonth: "",
      dutyContent: "",
      leaveType: "ລາພັກປະຈຳປີ",
      leaveDetails: "",
      tripDetails: "",
      tripStartDate: new Date().toISOString().split("T")[0],
      tripEndDate: new Date().toISOString().split("T")[0],
      tripStartTime: "",
      tripEndTime: "",
    });
    alert("ເພີ່ມບັນທຶກການເຂົ້າ-ອອກວຽກ ຍ້ອນຫຼັງສຳເລັດ!");
  };

  // Calculate forgetful report data
  const getForgetfulReportData = () => {
    const today = new Date(selectedReportDate);

    // Filter records by Daily, Weekly, or Monthly range
    return employees
      .map((emp) => {
        let empRecords = attendance.filter((r) => r.employeeId === emp.id);

        if (forgetReportTimeframe === "daily") {
          empRecords = empRecords.filter((r) => r.date === selectedReportDate);
        } else if (forgetReportTimeframe === "weekly") {
          // Simple 7 days range prior to selected date
          const startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          const startStr = startDate.toISOString().split("T")[0];
          empRecords = empRecords.filter(
            (r) => r.date >= startStr && r.date <= selectedReportDate,
          );
        } else {
          // Monthly
          const monthPrefix = selectedReportDate.substring(0, 7); // YYYY-MM
          empRecords = empRecords.filter((r) => r.date.startsWith(monthPrefix));
        }

        // Count forgot check-ins and check-outs
        let forgotInCount = 0;
        let forgotOutCount = 0;
        let forgotDetailsList: {
          date: string;
          type: "In" | "Out";
          editedAt?: string | null;
        }[] = [];

        empRecords.forEach((rec) => {
          if (rec.status.startsWith("ລາພັກ") || rec.status.startsWith("ໄປວຽກນອກ")) return;

          const isWithinTrip = attendance.some(r => {
            if (r.employeeId !== emp.id) return false;
            if (!r.status.includes('ຫຼາຍວັນ') && !r.status.startsWith('ໄປວຽກນອກ')) return false;
            if (!r.tripDetails) return false;
            const { startDate, endDate } = r.tripDetails;
            const todayStr = new Date().toISOString().split("T")[0];
            return rec.date >= startDate && rec.date <= endDate && todayStr <= endDate;
          });
          if (isWithinTrip) return;

          const keyIn = `${emp.id}-${rec.date}-In`;
          const keyOut = `${emp.id}-${rec.date}-Out`;

          if (!rec.checkIn && rec.checkOut) {
            if (!deletedForgotKeys.includes(keyIn)) {
              forgotInCount++;
              forgotDetailsList.push({
                date: rec.date,
                type: "In",
                editedAt: rec.editedAt,
              });
            }
          }

          // Past day check for missing checkOut
          const isPastDay = rec.date < new Date().toISOString().split("T")[0];
          if (rec.checkIn && !rec.checkOut && isPastDay) {
            if (!deletedForgotKeys.includes(keyOut)) {
              forgotOutCount++;
              forgotDetailsList.push({
                date: rec.date,
                type: "Out",
                editedAt: rec.editedAt,
              });
            }
          }

          // Custom remarks override
          if (rec.remarks === "ລືມ Check In" && !rec.checkIn) {
            if (
              !forgotDetailsList.some(
                (f) => f.date === rec.date && f.type === "In",
              ) && !deletedForgotKeys.includes(keyIn)
            ) {
              forgotInCount++;
              forgotDetailsList.push({
                date: rec.date,
                type: "In",
                editedAt: rec.editedAt,
              });
            }
          }
          if (rec.remarks === "ລືມ Check Out" && !rec.checkOut) {
            if (
              !forgotDetailsList.some(
                (f) => f.date === rec.date && f.type === "Out",
              ) && !deletedForgotKeys.includes(keyOut)
            ) {
              forgotOutCount++;
              forgotDetailsList.push({
                date: rec.date,
                type: "Out",
                editedAt: rec.editedAt,
              });
            }
          }
        });

        return {
          employee: emp,
          forgotInCount,
          forgotOutCount,
          totalForgot: forgotInCount + forgotOutCount,
          details: forgotDetailsList,
        };
      })
      .filter((row) => row.totalForgot > 0); // Only return people who actually forgot something
  };

  // Filter general attendance list
  const filteredAttendance = attendance
    .filter((rec) => {
      const emp = employees.find((e) => e.id === rec.employeeId);
      if (!emp) return false;

      const nameStr =
        `${emp.firstName} ${emp.lastName} ${emp.employeeCode}`.toLowerCase();
      const matchesSearch = nameStr.includes(searchQuery.toLowerCase());
      const matchesDate = selectedDateFilter
        ? rec.date === selectedDateFilter
        : true;
      const matchesStatus = selectedStatusFilter
        ? rec.status === selectedStatusFilter
        : true;

      return matchesSearch && matchesDate && matchesStatus;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  // Export payroll attendance report to CSV format
  const handleExportCSV = () => {
    if (attendance.length === 0) {
      alert("ບໍ່ມີຂໍ້ມູນການລົງເວລາເພື່ອສົ່ງອອກ!");
      return;
    }

    // Define CSV Headers in Lao exactly as requested by user
    const headers = [
      "ພະນັກງານ",
      "ວັນທີ (Date)",
      "ສະຖານະ (Status)",
      "ເວລາເຂົ້າ (In)",
      "ເວລາອອກ (Out)",
      "ຊົ່ວໂມງລວມ",
      "ໝາຍເຫດ/ຂໍ້ຜິດພາດ",
    ];

    // Build the rows
    const rows = attendance.map((rec) => {
      const emp = employees.find((e) => e.id === rec.employeeId);
      const empName = emp ? `${emp.firstName} ${emp.lastName} (${emp.employeeCode})` : `-`;
      
      let warningOrRemark = rec.remarks || "-";
      const isOutOfOffice = rec.status.startsWith("ໄປວຽກນອກ");
      
      if (!isOutOfOffice) {
        if (!rec.checkIn && rec.checkOut) {
          warningOrRemark = "ລືມ Check In";
        } else if (rec.checkIn && !rec.checkOut && rec.date < new Date().toISOString().split("T")[0]) {
          warningOrRemark = "ລືມ Check Out";
        }
      } else {
        if (rec.tripDetails) {
          warningOrRemark = `${rec.tripDetails.details || "ໄປວຽກນອກ"} (ວັນທີ: ${formatLaoDate(rec.tripDetails.startDate)} ຫາ ${formatLaoDate(rec.tripDetails.endDate)})`;
        } else {
          warningOrRemark = "ໄປວຽກນອກ";
        }
      }

      const totalHours = formatHours(rec.hoursWorked);

      return [
        empName,
        formatLaoDate(rec.date),
        rec.status,
        rec.checkIn || "-",
        rec.checkOut || "-",
        totalHours,
        warningOrRemark,
      ];
    });

    // Helper to escape fields for CSV format
    const escapeCSVField = (val: string) => {
      const escaped = String(val).replace(/"/g, '""');
      if (escaped.includes(",") || escaped.includes("\n") || escaped.includes('"')) {
        return `"${escaped}"`;
      }
      return escaped;
    };

    // Combine headers and rows
    const csvContent = [
      headers.map(escapeCSVField).join(","),
      ...rows.map((row) => row.map(escapeCSVField).join(",")),
    ].join("\n");

    // Add UTF-8 BOM so Excel displays Lao script correctly
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const d = new Date();
    const dateStr = d.toISOString().split("T")[0];
    link.setAttribute("download", `payroll_attendance_report_${dateStr}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export attendance by specific timeframe (Daily, Weekly, Monthly)
  const handleExportAttendanceTimeframe = (timeframe: "daily" | "weekly" | "monthly") => {
    let listToExport = [...attendance];
    const dateRef = selectedDateFilter || new Date().toISOString().split("T")[0];
    let fileLabel = "";

    if (timeframe === "daily") {
      listToExport = listToExport.filter((r) => r.date === dateRef);
      fileLabel = `ລາຍວັນ_${dateRef}`;
    } else if (timeframe === "weekly") {
      const startDate = new Date(dateRef);
      startDate.setDate(startDate.getDate() - 7);
      const startStr = startDate.toISOString().split("T")[0];
      listToExport = listToExport.filter(
        (r) => r.date >= startStr && r.date <= dateRef
      );
      fileLabel = `ລາຍອາທິດ_ແຕ່_${startStr}_ຫາ_${dateRef}`;
    } else if (timeframe === "monthly") {
      const monthPrefix = dateRef.substring(0, 7); // YYYY-MM
      listToExport = listToExport.filter((r) => r.date.startsWith(monthPrefix));
      fileLabel = `ລາຍເດືອນ_${monthPrefix}`;
    }

    if (listToExport.length === 0) {
      alert(`ບໍ່ມີຂໍ້ມູນການລົງເວລາ${timeframe === "daily" ? "ປະຈຳວັນ" : timeframe === "weekly" ? "ປະຈຳອາທິດ" : "ປະຈຳເດືອນ"} ໃນວັນທີ/ໄລຍະທີ່ເລືອກເພື່ອສົ່ງອອກ!`);
      return;
    }

    // Sort by date descending, then employee code ascending
    listToExport.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      const empA = employees.find((e) => e.id === a.employeeId)?.employeeCode || "";
      const empB = employees.find((e) => e.id === b.employeeId)?.employeeCode || "";
      return empA.localeCompare(empB);
    });

    const headers = [
      "ພະນັກງານ",
      "ວັນທີ (Date)",
      "ສະຖານະ (Status)",
      "ເວລາເຂົ້າ (In)",
      "ເວລາອອກ (Out)",
      "ຊົ່ວໂມງລວມ",
      "ໝາຍເຫດ/ຂໍ້ຜິດພາດ",
    ];

    const rows = listToExport.map((rec) => {
      const emp = employees.find((e) => e.id === rec.employeeId);
      const empName = emp ? `${emp.firstName} ${emp.lastName} (${emp.employeeCode})` : `-`;
      
      let warningOrRemark = rec.remarks || "-";
      const isOutOfOffice = rec.status.startsWith("ໄປວຽກນອກ");
      
      const isWithinTrip = attendance.some(r => {
        if (r.employeeId !== rec.employeeId) return false;
        if (!r.status.includes('ຫຼາຍວັນ') && !r.status.startsWith('ໄປວຽກນອກ')) return false;
        if (!r.tripDetails) return false;
        const { startDate, endDate } = r.tripDetails;
        const todayStr = new Date().toISOString().split("T")[0];
        return rec.date >= startDate && rec.date <= endDate && todayStr <= endDate;
      });

      if (!isOutOfOffice && !isWithinTrip) {
        if (!rec.checkIn && rec.checkOut) {
          warningOrRemark = "ລືມ Check In";
        } else if (rec.checkIn && !rec.checkOut && rec.date < new Date().toISOString().split("T")[0]) {
          warningOrRemark = "ລືມ Check Out";
        }
      } else if (isOutOfOffice) {
        if (rec.tripDetails) {
          warningOrRemark = `${rec.tripDetails.details || "ໄປວຽກນອກ"} (ວັນທີ: ${formatLaoDate(rec.tripDetails.startDate)} ຫາ ${formatLaoDate(rec.tripDetails.endDate)})`;
        } else {
          warningOrRemark = "ໄປວຽກນອກ";
        }
      } else {
        warningOrRemark = "-";
      }

      const totalHours = formatHours(rec.hoursWorked);

      return [
        empName,
        formatLaoDate(rec.date),
        rec.status,
        rec.checkIn || "-",
        rec.checkOut || "-",
        totalHours,
        warningOrRemark,
      ];
    });

    const escapeCSVField = (val: string) => {
      const escaped = String(val).replace(/"/g, '""');
      if (escaped.includes(",") || escaped.includes("\n") || escaped.includes('"')) {
        return `"${escaped}"`;
      }
      return escaped;
    };

    const csvContent = [
      headers.map(escapeCSVField).join(","),
      ...rows.map((row) => row.map(escapeCSVField).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ລາຍງານການເຂົ້າອອກວຽກ_${fileLabel}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export forgetful report to CSV (Excel compatible)
  const handleExportForgetfulCSV = () => {
    const reportData = getForgetfulReportData();

    if (reportData.length === 0) {
      alert("ບໍ່ມີຂໍ້ມູນລາຍງານລືມສະແກນໃນໄລຍະເວລານີ້ເພື່ອສົ່ງອອກ!");
      return;
    }

    const headers = [
      "Employee Code (ລະຫັດພະນັກງານ)",
      "First Name (ຊື່)",
      "Last Name (ນາມສະກຸນ)",
      "Position (ຕຳແໜ່ງ)",
      "Forgot Check-In Count (ລືມ Check-In คັ້ງ)",
      "Forgot Check-Out Count (ລືມ Check-Out คັ້ງ)",
      "Total Faults (ລວມຄວາມຜິດພາດ ຄັ້ງ)",
      "Fault Dates Details (ລາຍລະອຽດວັນທີ)",
    ];

    const rows = reportData.map((row) => {
      const datesDetailStr = row.details
        .map((d) => `${d.date} (${d.type === "In" ? "ລືມ Check-In" : "ລືມ Check-Out"}${d.editedAt ? " - ແກ້ໄຂແລ້ວ" : ""})`)
        .join("; ");

      return [
        row.employee.employeeCode,
        row.employee.firstName,
        row.employee.lastName,
        row.employee.position,
        row.forgotInCount.toString(),
        row.forgotOutCount.toString(),
        row.totalForgot.toString(),
        datesDetailStr,
      ];
    });

    const escapeCSVField = (val: string) => {
      const escaped = String(val).replace(/"/g, '""');
      if (escaped.includes(",") || escaped.includes("\n") || escaped.includes('"')) {
        return `"${escaped}"`;
      }
      return escaped;
    };

    const csvContent = [
      headers.map(escapeCSVField).join(","),
      ...rows.map((row) => row.map(escapeCSVField).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);

    const timeLabel =
      forgetReportTimeframe === "daily"
        ? `ປະຈຳວັນ_${selectedReportDate}`
        : forgetReportTimeframe === "weekly"
          ? `ປະຈຳອາທິດ_ຮອດ_${selectedReportDate}`
          : `ປະຈຳເດືອນ_${selectedReportDate.substring(0, 7)}`;

    link.setAttribute("download", `ລາຍງານລືມສະແກນ_${timeLabel}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Change Logo
  const handleUpdateLogo = (presetUrl: string) => {
    onLogoChange(presetUrl);
    alert("ປ່ຽນໂລໂກ້ຂອງແອັບພລິເຄຊັນສຳເລັດ!");
  };

  // Change HR Credentials
  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsernameInput.trim() || !newPasswordInput.trim()) {
      alert("ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ!");
      return;
    }

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hrUsername: newUsernameInput.trim(),
          hrPassword: newPasswordInput.trim(),
        }),
      });

      const contentType = res.headers.get("content-type");
      if (res.ok && contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setDbUsername(data.hrUsername);
        setDbPassword(data.hrPassword);
        localStorage.setItem("hr_username", data.hrUsername);
        localStorage.setItem("hr_password", data.hrPassword);
        setCredentialsSuccessMsg("ບັນທຶກຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານໃໝ່ສຳເລັດແລ້ວ!");
        setTimeout(() => setCredentialsSuccessMsg(""), 4000);
      } else {
        alert("ບໍ່ສາມາດບັນທຶກຂໍ້ມູນໄດ້!");
      }
    } catch (err) {
      console.error(err);
      alert("ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ກັບເຊີເວີ!");
    }
  };

  const handleSaveNotificationSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enableAutoNotifications,
          enableQrTimeRestriction,
          enableQrCodeSystem,
          checkInStart,
          checkInDeadline,
          checkOutStart,
          checkOutDeadline,
          enableGpsRestriction,
          enableNetworkRestriction,
          officeLat,
          officeLng,
          officeRadius,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEnableAutoNotifications(data.enableAutoNotifications);
        setEnableQrTimeRestriction(data.enableQrTimeRestriction);
        setEnableQrCodeSystem(data.enableQrCodeSystem !== undefined ? data.enableQrCodeSystem : true);
        setCheckInStart(data.checkInStart || "07:30");
        setCheckInDeadline(data.checkInDeadline);
        setCheckOutStart(data.checkOutStart || "15:40");
        setCheckOutDeadline(data.checkOutDeadline);
        setEnableGpsRestriction(data.enableGpsRestriction !== undefined ? data.enableGpsRestriction : false);
        setEnableNetworkRestriction(data.enableNetworkRestriction !== undefined ? data.enableNetworkRestriction : false);
        setOfficeLat(data.officeLat !== undefined ? data.officeLat : 17.9638);
        setOfficeLng(data.officeLng !== undefined ? data.officeLng : 102.6132);
        setOfficeRadius(data.officeRadius !== undefined ? data.officeRadius : 200);
        if (onUpdateSettings) {
          onUpdateSettings(
            data.checkInDeadline,
            data.checkOutDeadline,
            data.enableQrTimeRestriction,
            data.enableQrCodeSystem,
            data.checkInStart,
            data.checkOutStart,
            data.enableGpsRestriction,
            data.officeLat,
            data.officeLng,
            data.officeRadius,
            data.enableNetworkRestriction
          );
        }
        setNotifSettingsSuccessMsg("ບັນທຶກການຕັ້ງຄ່າລະບົບ QR Code, ເວລາ ແລະ GPS ສຳເລັດ!");
        setTimeout(() => setNotifSettingsSuccessMsg(""), 4000);
      } else {
        alert("ບໍ່ສາມາດບັນທຶກການຕັ້ງຄ່າໄດ້!");
      }
    } catch (err) {
      console.error("Save settings error", err);
      alert("ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ກັບເຊີເວີ!");
    }
  };

  const handleTriggerChecksManually = async () => {
    setIsTriggeringChecks(true);
    setManualCheckResult(null);
    try {
      const res = await fetch("/api/settings/trigger-checks", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setManualCheckResult(data);
      } else {
        setManualCheckResult({ success: false, error: "ເຊີເວີຕອບສະໜອງຜິດພາດ" });
      }
    } catch (err) {
      console.error(err);
      setManualCheckResult({ success: false, error: String(err) });
    } finally {
      setIsTriggeringChecks(false);
    }
  };

  // Helper to open a print-friendly window of the employee's QR Code Card
  const handlePrintQr = (emp: Employee) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(emp.employeeCode)}`;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert(
        "ກະລຸນາອະນຸຍາດໃຫ້ເປີດປັອບອັບ (Popup) ໃນບຣາວເຊີຂອງທ່ານ ເພື່ອພິມ QR Code",
      );
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${emp.firstName} ${emp.lastName}</title>
          <style>
            body {
              font-family: 'Inter', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: white;
            }
            .card {
              border: 3px solid #0d9488;
              border-radius: 24px;
              padding: 40px;
              text-align: center;
              box-shadow: 0 10px 25px rgba(0,0,0,0.05);
              max-width: 320px;
            }
            .logo {
              font-size: 18px;
              font-weight: bold;
              color: #0d9488;
              margin-bottom: 20px;
              letter-spacing: 0.5px;
            }
            .qr-img {
              width: 220px;
              height: 220px;
              margin-bottom: 20px;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 8px;
            }
            .name {
              font-size: 20px;
              font-weight: bold;
              color: #1e293b;
              margin: 5px 0;
            }
            .code {
              font-family: monospace;
              font-size: 18px;
              font-weight: bold;
              color: #0f766e;
              letter-spacing: 1px;
              margin-top: 2px;
            }
            .pos {
              font-size: 13px;
              color: #6b7280;
              margin-top: 6px;
            }
            @media print {
              .no-print { display: none; }
              body { height: auto; }
              .card { border: 2px solid #000; box-shadow: none; page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">👤 UXOLAO XKH SYSTEM</div>
            <img class="qr-img" src="${qrUrl}" alt="QR Code" />
            <div class="name">${emp.firstName} ${emp.lastName}</div>
            <div class="code">${emp.employeeCode}</div>
            <div class="pos">${emp.position}</div>
          </div>
          <div class="no-print" style="margin-top: 30px;">
            <button onclick="window.print()" style="padding: 12px 24px; background: #0d9488; color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 15px; font-family: sans-serif;">ພິມ QR Code (Print)</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Preset logo options
  const logoPresets = [
    {
      name: "Corporate Teal Clock",
      url: "DEFAULT_SVG",
      label: "ໂລໂກ້ ມາດຕະຖານ (Default SVG)",
    },
    {
      name: "Modern Gold Accent",
      url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=120",
      label: "ໂລໂກ້ສີທອງ (Tech Gold)",
    },
    {
      name: "Dynamic Blue Shield",
      url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=120",
      label: "ໂລໂກ້ອົງກອນສີຟ້າ (Corporate Blue)",
    },
  ];

  if (!isAuthenticated) {
    return (
      <div
        id="hr-auth-screen"
        className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-800"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-teal-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-teal-600 mb-3">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-sans">
            ພື້ນທີ່ສຳລັບ HR Admin
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
            ກະລຸນາເຂົ້າສູ່ລະບົບດ້ວຍລະຫັດ HR ເພື່ອແກ້ໄຂ ແລະ ກວດສອບລາຍງານ
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {authError && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold border border-red-100 dark:border-red-900 font-sans">
              {authError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-sans">
              ຊື່ຜູ້ໃຊ້ (Username):
            </label>
            <input
              id="hr-username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full text-sm bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-sans">
              ລະຫັດຜ່ານ (Password):
            </label>
            <input
              id="hr-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <button
              id="hr-login-submit"
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm font-sans cursor-pointer shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              ເຂົ້າສູ່ລະບົບ HR Admin
            </button>
            
            <button
              id="hr-bypass-login"
              type="button"
              onClick={() => {
                setUsername(dbUsername);
                setPassword(dbPassword);
                setIsAuthenticated(true);
                sessionStorage.setItem("hr_authenticated", "true");
                setAuthError("");
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs font-sans cursor-pointer border border-slate-200 dark:border-slate-700/50 mt-1"
            >
              🚀 ເຂົ້າສູ່ລະບົບທັນທີ (Quick Demo Access)
            </button>
          </div>
        </form>
      </div>
    );
  }

  const forgetRows = getForgetfulReportData();

  // Generate overall leave statistics
  const getLeaveStats = () => {
    let annualCount = 0;
    let compensatoryCount = 0;
    let sickCount = 0;
    let maternityCount = 0;
    let personalCount = 0;
    let unspecifiedCount = 0;

    attendance.forEach((rec) => {
      if (rec.status === "ລາພັກ" && (!rec.leaveDetails?.status || rec.leaveDetails?.status === "approved")) {
        const type = rec.leaveDetails?.type;
        let duration = rec.leaveDetails?.duration || 1;
        if (rec.leaveDetails?.startDate && rec.leaveDetails?.endDate) {
          duration = calculateLeaveDuration(rec.leaveDetails.startDate, rec.leaveDetails.endDate);
        }

        if (type === "ລາພັກປະຈຳປີ") {
          annualCount += duration;
        } else if (type === "ລາພັກທົດແທນ") {
          compensatoryCount += duration;
        } else if (type === "ລາພັກເຈັບໄຂ້") {
          sickCount += duration;
        } else if (type === "ລາພັກເກີດລູກ") {
          maternityCount += duration;
        } else if (type === "ລາພັກຈຳເປັນ") {
          personalCount += duration;
        } else {
          unspecifiedCount += duration;
        }
      }
    });

    const totalDays =
      annualCount +
      compensatoryCount +
      sickCount +
      maternityCount +
      personalCount +
      unspecifiedCount;

    const data = [
      { name: "ລາພັກປະຈຳປີ", value: annualCount, color: "#3b82f6", bg: "bg-blue-500" }, // Blue
      { name: "ລາພັກທົດແທນ", value: compensatoryCount, color: "#10b981", bg: "bg-emerald-500" }, // Emerald
      { name: "ລາພັກເຈັບໄຂ້", value: sickCount, color: "#ef4444", bg: "bg-rose-500" }, // Red
      { name: "ລາພັກເກີດລູກ", value: maternityCount, color: "#a855f7", bg: "bg-purple-500" }, // Purple
      { name: "ລາພັກຈຳເປັນ", value: personalCount, color: "#f59e0b", bg: "bg-amber-500" }, // Amber
    ];

    if (unspecifiedCount > 0) {
      data.push({ name: "ອື່ນໆ / ບໍ່ໄດ້ລະບຸ", value: unspecifiedCount, color: "#64748b", bg: "bg-slate-500" });
    }

    const chartData = data.filter((item) => item.value > 0);

    return {
      allStats: data,
      chartData: chartData.length > 0 ? chartData : [{ name: "ບໍ່ມີຂໍ້ມູນ", value: 1, color: "#cbd5e1", bg: "bg-slate-300" }],
      hasData: chartData.length > 0,
      totalDays,
    };
  };

  const leaveStats = getLeaveStats();

  // Generate weekly check-in and check-out volume data
  const getWeeklyVolumeData = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    const weekDays = [];
    const DAYS_LAO = [
      "ຈັນ (Mon)",
      "ອັງຄານ (Tue)",
      "ພຸດ (Wed)",
      "ພະຫັດ (Thu)",
      "ສຸກ (Fri)",
      "ເສົາ (Sat)",
      "ອາທິດ (Sun)"
    ];

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      
      const year = dayDate.getFullYear();
      const month = String(dayDate.getMonth() + 1).padStart(2, "0");
      const dateVal = String(dayDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${dateVal}`;

      const checkInCount = attendance.filter(
        (r) => r.date === dateStr && r.checkIn && r.checkIn.trim() !== ""
      ).length;

      const checkOutCount = attendance.filter(
        (r) => r.date === dateStr && r.checkOut && r.checkOut.trim() !== ""
      ).length;

      weekDays.push({
        dayName: DAYS_LAO[i],
        dateStr,
        "Check-In": checkInCount,
        "Check-Out": checkOutCount,
      });
    }

    return weekDays;
  };

  const weeklyVolumeData = getWeeklyVolumeData();

  // Generate Heatmap calendar data
  const getHeatmapData = () => {
    if (!heatmapMonth) return { dayData: [], firstDayIndex: 0, year: 2026, month: 7 };
    try {
      const year = parseInt(heatmapMonth.substring(0, 4));
      const month = parseInt(heatmapMonth.substring(5, 7));
      const daysInMonth = new Date(year, month, 0).getDate();
      const firstDayIndex = new Date(year, month - 1, 1).getDay();

      const dayData = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const dayStr = `${year}-${month.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
        const recordsOnDay = attendance.filter((r) => r.date === dayStr);
        const presentCount = recordsOnDay.filter((r) => r.status !== "ລາພັກ" && (r.checkIn || r.checkOut)).length;
        const leaveCount = recordsOnDay.filter((r) => r.status === "ລາພັກ").length;
        const absentCount = employees.length - presentCount - leaveCount;
        const rate = employees.length > 0 ? Math.round((presentCount / employees.length) * 100) : 0;

        dayData.push({
          day: d,
          dateStr: dayStr,
          present: presentCount,
          leave: leaveCount,
          absent: Math.max(0, absentCount),
          rate,
        });
      }
      return { dayData, firstDayIndex, year, month };
    } catch (e) {
      console.error(e);
      return { dayData: [], firstDayIndex: 0, year: 2026, month: 7 };
    }
  };

  const { dayData, firstDayIndex, year: hmYear, month: hmMonth } = getHeatmapData();

  // Generate weekly on-time check-ins vs late arrivals
  const getWeeklyOntimeVsLateData = () => {
    const data = [];
    const DAYS_LAO_SHORT = ["ອາທິດ", "ຈັນ", "ອັງຄານ", "ພຸດ", "ພະຫັດ", "ສຸກ", "ເສົາ"];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const dayVal = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${dayVal}`;
      const dayName = DAYS_LAO_SHORT[d.getDay()];

      const recordsOnDay = attendance.filter((r) => r.date === dateStr);
      
      let onTimeCount = 0;
      let lateCount = 0;

      recordsOnDay.forEach((r) => {
        if (r.checkIn && r.checkIn.trim() !== "") {
          const checkInTime = r.checkIn.substring(0, 5); // HH:MM
          const deadline = checkInDeadline || "08:30";
          if (checkInTime <= deadline) {
            onTimeCount++;
          } else {
            lateCount++;
          }
        }
      });

      data.push({
        dayName: `${dayName} (${dayVal}/${month})`,
        dateStr,
        "OnTime": onTimeCount,
        "Late": lateCount,
      });
    }

    return data;
  };

  const weeklyOntimeVsLateData = getWeeklyOntimeVsLateData();
  const WEEKDAYS_LAO = ["ອາທິດ (Sun)", "ຈັນ (Mon)", "ອັງຄານ (Tue)", "ພຸດ (Wed)", "ພະຫັດ (Thu)", "ສຸກ (Fri)", "ເສົາ (Sat)"];

  return (
    <div id="hr-dashboard-container" className="space-y-6">
      {/* HR Header */}
      <div
        id="hr-header-bar"
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-sans">
              HR Authorized Session
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 font-sans mt-1">
            ລະບົບຈັດການ ແລະ ວິເຄາະລາຍງານ (HR Management)
          </h2>
        </div>

        <button
          id="hr-logout-btn"
          onClick={handleLogout}
          className="text-xs font-bold text-red-500 hover:text-red-700 border border-red-100 hover:bg-red-50 dark:border-red-950/50 dark:hover:bg-red-950/20 px-4 py-2 rounded-xl font-sans transition-all"
        >
          ອອກຈາກລະບົບ HR
        </button>
      </div>

      {/* HR Navigation tabs */}
      <div id="hr-navigation-tabs" className="flex overflow-x-auto gap-2 pb-1">
        <button
          id="hr-tab-attendance"
          onClick={() => setActiveTab("attendance")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold font-sans transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "attendance"
              ? "bg-teal-600 text-white"
              : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
          }`}
        >
          <Calendar className="w-4 h-4" />
          ລາຍງານການເຂົ້າ-ອອກວຽກ
        </button>

        <button
          id="hr-tab-reports"
          onClick={() => setActiveTab("forgot_report")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold font-sans transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "forgot_report"
              ? "bg-red-500 text-white"
              : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          ສະຫຼຸບຜູ້ລືມ Check-In/Out
          {forgetRows.length > 0 && (
            <span className="bg-white text-red-600 font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {forgetRows.length}
            </span>
          )}
        </button>

        <button
          id="hr-tab-employees"
          onClick={() => setActiveTab("employees")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold font-sans transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "employees"
              ? "bg-teal-600 text-white"
              : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
          }`}
        >
          <Users className="w-4 h-4" />
          ຈັດການຂໍ້ມູນພະນັກງານ
        </button>

        <button
          id="hr-tab-shifts"
          onClick={() => setActiveTab("shifts")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold font-sans transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "shifts"
              ? "bg-amber-600 text-white"
              : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
          }`}
        >
          <Clock className="w-4 h-4" />
          ຈັດການກະການເຮັດວຽກ (Shifts)
        </button>

        <button
          id="hr-tab-weekend-duty"
          onClick={() => setActiveTab("weekend_duty")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold font-sans transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "weekend_duty"
              ? "bg-indigo-600 text-white"
              : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          ປະຈຳການ & ອະນຸມັດການລາພັກ
        </button>

        <button
          id="hr-tab-leave-management"
          onClick={() => setActiveTab("leave_management")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold font-sans transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "leave_management"
              ? "bg-purple-600 text-white"
              : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          ສະຫຼຸບ & ຈັດການວັນລາພັກ
        </button>

        <button
          id="hr-tab-settings"
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold font-sans transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "settings"
              ? "bg-teal-600 text-white"
              : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
          }`}
        >
          <Settings className="w-4 h-4" />
          ຕັ້ງຄ່າໂລໂກ້ແອັບ
        </button>

        <button
          id="hr-tab-guides"
          onClick={() => setActiveTab("guides")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold font-sans transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "guides"
              ? "bg-rose-600 text-white"
              : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          📘 ຄູ່ມືແກ້ໄຂບັນຫາ & ຕິດຕັ້ງ
        </button>
      </div>

      {/* Tab Content Display */}
      <AnimatePresence mode="wait">
        {/* TAB 1: Attendance Logs */}
        {activeTab === "attendance" && (
          <motion.div
            id="tab-attendance-content"
            key="attendance-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans block">
                    ພະນັກງານທັງໝົດ
                  </span>
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono mt-1 block">
                    {employees.length}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans block">
                    ລົງເວລາເຂົ້າວຽກມື້ນີ້
                  </span>
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono mt-1 block">
                    {
                      attendance.filter(
                        (r) =>
                          r.date === new Date().toISOString().split("T")[0] &&
                          r.checkIn,
                      ).length
                    }
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans block">
                    ບັນທຶກທີ່ HR ແກ້ໄຂ/ລົງເວລາໃຫ້
                  </span>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1 block">
                    {attendance.filter((r) => r.editedAt).length}{" "}
                    <span className="text-xs font-sans text-slate-400">
                      ລາຍການ
                    </span>
                  </span>
                  {attendance.filter((r) => r.editedAt).length > 0 && (
                    <span
                      className="text-[9px] text-slate-400 dark:text-slate-500 font-sans mt-0.5 block truncate max-w-[200px]"
                      title={`ແກ້ໄຂຫຼ້າສຸດ: ${[...attendance.filter((r) => r.editedAt)].sort((a, b) => (b.editedAt || "").localeCompare(a.editedAt || ""))[0]?.editedAt || "-"}`}
                    >
                      ແກ້ໄຂຫຼ້າສຸດ:{" "}
                      {[...attendance.filter((r) => r.editedAt)].sort((a, b) =>
                        (b.editedAt || "").localeCompare(a.editedAt || ""),
                      )[0]?.editedAt || "-"}
                    </span>
                  )}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Edit className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Monthly Attendance Heatmap & Trend */}
            <div id="heatmap-analytics-panel" className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-sans flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-teal-600" />
                    ແຜນພູມຄວາມໜາແໜ້ນ ແລະ ແນວໂນ້ມການເຂົ້າວຽກລາຍເດືອນ (Monthly Heatmap & Trends)
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-0.5">
                    ສະແດງອັດຕາສ່ວນການເຂົ້າວຽກຂອງພະນັກງານທັງໝົດໃນແຕ່ລະວັນ ເພື່ອວິເຄາະຫາຮູບແບບ ແລະ ແນວໂນ້ມການປະຕິບັດງານ
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 font-sans whitespace-nowrap">
                    ເລືອກເດືອນ:
                  </label>
                  <input
                    type="month"
                    value={heatmapMonth}
                    onChange={(e) => setHeatmapMonth(e.target.value)}
                    className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Heatmap Grid Calendar */}
                <div className="lg:col-span-5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
                    ຄວາມໜາແໜ້ນລາຍວັນ (Attendance Density Grid)
                  </h4>
                  
                  <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/10">
                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {WEEKDAYS_LAO.map((day) => (
                        <div key={day} className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 font-sans py-1">
                          {day.substring(0, 3)}
                        </div>
                      ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1.5">
                      {/* Empty padding cells */}
                      {Array.from({ length: firstDayIndex }).map((_, idx) => (
                        <div key={`empty-${idx}`} className="aspect-square bg-transparent rounded-lg" />
                      ))}

                      {/* Day cells */}
                      {dayData.map((d) => {
                        const getHeatmapColorClass = (rate: number, present: number) => {
                          if (present === 0) return "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600";
                          if (rate < 30) return "bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/30";
                          if (rate < 60) return "bg-teal-200 dark:bg-teal-900/40 text-teal-900 dark:text-teal-200";
                          if (rate < 85) return "bg-teal-400 text-white shadow-sm";
                          return "bg-teal-600 text-white font-bold shadow-md shadow-teal-500/10";
                        };

                        return (
                          <div
                            key={d.day}
                            title={`ວັນທີ ${d.day}/${hmMonth}/${hmYear} | ເຂົ້າວຽກ: ${d.present} ຄົນ | ລາພັກ: ${d.leave} ຄົນ | ຂາດ/ບໍ່ມີຂໍ້ມູນ: ${d.absent} ຄົນ | ອັດຕາ: ${d.rate}%`}
                            className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs transition-all hover:scale-105 cursor-pointer relative group ${getHeatmapColorClass(
                              d.rate,
                              d.present
                            )}`}
                          >
                            <span className="text-[11px]">{d.day}</span>
                            <span className="text-[8px] opacity-85 scale-90 font-mono leading-none mt-0.5">
                              {d.rate}%
                            </span>

                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-[10px] rounded-lg p-2.5 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10 font-sans space-y-1">
                              <p className="font-extrabold border-b border-slate-700 pb-1 mb-1">
                                ວັນທີ {d.day}/{hmMonth}/{hmYear}
                              </p>
                              <p className="text-emerald-400 font-medium">✔️ ເຂົ້າວຽກ: {d.present} ຄົນ ({d.rate}%)</p>
                              <p className="text-purple-400">📝 ລາພັກ: {d.leave} ຄົນ</p>
                              <p className="text-slate-400">❌ ຂາດ/ບໍ່ມີຂໍ້ມູນ: {d.absent} ຄົນ</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Heatmap Legend */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] text-slate-400 dark:text-slate-500 font-sans pt-1">
                    <span className="font-bold uppercase tracking-wider">ຄຳອະທິບາຍ (Legend):</span>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700" />
                        0%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 bg-teal-50 dark:bg-teal-950/20 rounded border border-teal-100 dark:border-teal-900/30" />
                        1-30%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 bg-teal-200 dark:bg-teal-900/40 rounded" />
                        31-60%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 bg-teal-400 rounded" />
                        61-85%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 bg-teal-600 rounded" />
                        86-100%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recharts Analytics curve */}
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
                    ເສັ້ນສະແດງແນວໂນ້ມການເຂົ້າວຽກລາຍວັນ (Daily Attendance Rate Curve)
                  </h4>

                  <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/20 dark:bg-slate-950/5">
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dayData}>
                          <defs>
                            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                          <XAxis 
                            dataKey="day" 
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            label={{ value: 'ວັນທີໃນເດືອນ', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                          />
                          <YAxis 
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            domain={[0, 100]}
                            label={{ value: 'ອັດຕາການເຂົ້າວຽກ (%)', angle: -90, position: 'insideLeft', offset: 0, fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                          />
                          <ChartTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl text-xs font-sans space-y-1">
                                    <p className="font-extrabold text-slate-800 dark:text-slate-100">
                                      ວັນທີ {data.day}/{hmMonth}/{hmYear}
                                    </p>
                                    <p className="text-teal-600 font-semibold">
                                      ✔️ ເົ້າວຽກ: {data.present} ຄົນ ({data.rate}%)
                                    </p>
                                    <p className="text-purple-600 font-semibold">
                                      📝 ລາພັກ: {data.leave} ຄົນ
                                    </p>
                                    <p className="text-rose-500 font-semibold">
                                      ❌ ຂາດ/ບໍ່ມີຂໍ້ມູນ: {data.absent} ຄົນ
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="rate" 
                            stroke="#0d9488" 
                            strokeWidth={2.5} 
                            fillOpacity={1} 
                            fill="url(#colorRate)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Check-In & Check-Out Volumes Bar Chart */}
            <div id="weekly-volumes-panel" className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-sans flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-teal-600" />
                    ສະຖິຕິການເຂົ້າ-ອອກວຽກປະຈຳອາທິດ (Weekly Check-In & Check-Out Volumes)
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-0.5">
                    ປຽບທຽບປະລິມານການລົງເວລາເຂົ້າວຽກ (Check-In) ແລະ ອອກວຽກ (Check-Out) ຂອງພະນັກງານໃນແຕ່ລະວັນຂອງອາທິດນີ້
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 font-sans">
                    ອາທິດປັດຈຸບັນ (Current Week)
                  </span>
                </div>
              </div>

              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyVolumeData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                    <XAxis 
                      dataKey="dayName" 
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'medium' }}
                    />
                    <YAxis 
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      allowDecimals={false}
                    />
                    <ChartTooltip
                      cursor={{ fill: 'rgba(13, 148, 136, 0.03)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl text-xs font-sans space-y-2">
                              <p className="font-extrabold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                                ວັນ{data.dayName} ({data.dateStr})
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                                <span className="text-slate-500 dark:text-slate-400">ເຂົ້າວຽກ (Check-In):</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">{data["Check-In"]} ຄົນ</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                                <span className="text-slate-500 dark:text-slate-400">ອອກວຽກ (Check-Out):</span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-sm">{data["Check-Out"]} ຄົນ</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 11, fontWeight: 'bold', fontFamily: 'sans-serif' }}
                    />
                    <Bar dataKey="Check-In" fill="#10b981" radius={[4, 4, 0, 0]} name="ເຂົ້າວຽກ (Check-In)" />
                    <Bar dataKey="Check-Out" fill="#6366f1" radius={[4, 4, 0, 0]} name="ອອກວຽກ (Check-Out)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Daily On-Time vs. Late Arrivals Trend Chart */}
            <div id="weekly-ontime-vs-late-panel" className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-sans flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-teal-600" />
                    ແນວໂນ້ມການເຂົ້າວຽກ ທັນເວລາ VS ມາຊ້າ (On-Time vs. Late Arrivals)
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-0.5">
                    ປຽບທຽບຈຳນວນການ Check-In ທັນເວລາ ແລະ ມາຊ້າ (ຫຼັງຈາກເວລາ {checkInDeadline || "08:30"}) ຂອງພະນັກງານທັງໝົດໃນຮອບ 7 ວັນຜ່ານມາ
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 font-sans">
                    7 ວັນຫຼ້າສຸດ (Last 7 Days)
                  </span>
                </div>
              </div>

              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyOntimeVsLateData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                    <XAxis 
                      dataKey="dayName" 
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'medium' }}
                    />
                    <YAxis 
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      allowDecimals={false}
                    />
                    <ChartTooltip
                      cursor={{ fill: 'rgba(13, 148, 136, 0.03)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl text-xs font-sans space-y-2">
                              <p className="font-extrabold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                                ວັນ{data.dayName}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                                <span className="text-slate-500 dark:text-slate-400">ທັນເວລາ (On-Time):</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">{data.OnTime} ຄົນ</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-rose-500 rounded-full" />
                                <span className="text-slate-500 dark:text-slate-400">ມາຊ້າ (Late):</span>
                                <span className="font-bold text-rose-600 dark:text-rose-400 font-mono text-sm">{data.Late} ຄົນ</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 11, fontWeight: 'bold', fontFamily: 'sans-serif' }}
                    />
                    <Bar dataKey="OnTime" fill="#10b981" radius={[4, 4, 0, 0]} name="ທັນເວລາ (On-Time)" />
                    <Bar dataKey="Late" fill="#ef4444" radius={[4, 4, 0, 0]} name="ມາຊ້າ (Late)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Employee Leave Statistics Overview */}
            <div id="leave-stats-panel" className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <PieChart className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-sans">
                    ພາບລວມສະຖິຕິການລາພັກຂອງພະນັກງານທັງໝົດ (Overall Leave Statistics)
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-0.5">
                    ອັດຕາສ່ວນ ແລະ ຈຳນວນວັນລາພັກແຕ່ລະປະເພດ (ລາພັກປະຈຳປີ, ລາພັກທົດແທນ, ລາພັກເຈັບໄຂ້ ແລະ ລາພັກຈຳເປັນ)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Pie Chart Display */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[240px]">
                  {leaveStats.hasData ? (
                    <div className="relative w-full h-[240px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={leaveStats.chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={90}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {leaveStats.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                const percentage = leaveStats.totalDays > 0 
                                  ? ((data.value / leaveStats.totalDays) * 100).toFixed(1)
                                  : "0";
                                return (
                                  <div className="bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl text-xs font-sans space-y-1">
                                    <p className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                      <span className={`w-2.5 h-2.5 rounded-full ${data.bg}`} />
                                      {data.name}
                                    </p>
                                    <p className="text-slate-600 dark:text-slate-400">
                                      ຈຳນວນວັນລາ: <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">{data.value} ວັນ</span>
                                    </p>
                                    <p className="text-teal-600 dark:text-teal-400 font-semibold">
                                      ອັດຕາສ່ວນ: <span className="font-bold font-mono">{percentage}%</span>
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>

                      {/* Centered Total Info inside Donut Hole */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-black text-slate-800 dark:text-slate-100 font-mono">
                          {leaveStats.totalDays}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans font-extrabold uppercase tracking-wider">
                          ວັນລາພັກລວມ
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 space-y-3">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto text-slate-300 dark:text-slate-600">
                        <Info className="w-8 h-8" />
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-sans">
                        ບໍ່ທັນມີຂໍ້ມູນປະຫວັດການລາພັກໃນລະບົບ
                      </p>
                    </div>
                  )}
                </div>

                {/* Legend & Breakdown Stats */}
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 font-sans flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
                    ລາຍລະອຽດແຕ່ລະປະເພດການລາ (Breakdown by Leave Type)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {leaveStats.allStats.map((stat, idx) => {
                      const percentage = leaveStats.totalDays > 0 
                        ? ((stat.value / leaveStats.totalDays) * 100).toFixed(1)
                        : "0.0";
                      
                      return (
                        <div 
                          key={idx}
                          className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10 flex items-center justify-between gap-4 transition-all hover:border-slate-200 dark:hover:border-slate-700"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`w-3 h-3 rounded-full flex-shrink-0`} style={{ backgroundColor: stat.color }} />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block truncate font-sans">
                                {stat.name}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans block mt-0.5">
                                ອັດຕາສ່ວນ: {percentage}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right flex-shrink-0">
                            <span className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono block">
                              {stat.value}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans font-bold">
                              ວັນ
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Filters panel */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-sans">
                  ຄົ້ນຫາຊື່ພະນັກງານ/ລະຫັດ:
                </label>
                <div className="relative">
                  <input
                    id="search-emp-log"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ປ້ອນຊື່ ຫຼື ລະຫັດ..."
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-sans">
                  ກວດສອບວັນທີ:
                </label>
                <input
                  id="filter-date-log"
                  type="date"
                  value={selectedDateFilter}
                  onChange={(e) => setSelectedDateFilter(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-sans">
                  ສະຖານະ:
                </label>
                <select
                  id="filter-status-log"
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans"
                >
                  <option value="">ທັງໝົດ</option>
                  <option value="ເຂົ້າວຽກປົກກະຕິ">ເຂົ້າວຽກປົກກະຕິ</option>
                  <option value="ໄປວຽກນອກ (ຕອນເຊົ້າ)">
                    ໄປວຽກນອກ (ຕອນເຊົ້າ)
                  </option>
                  <option value="ໄປວຽກນອກ (ຕອນແລງ)">ໄປວຽກນອກ (ຕອນແລງ)</option>
                  <option value="ໄປວຽກນອກ (ໝົດມື້)">ໄປວຽກນອກ (ໝົດມື້)</option>
                  <option value="ໄປວຽກນອກ (ຫຼາຍວັນ)">ໄປວຽກນອກ (ຫຼາຍວັນ)</option>
                  <option value="ປະຈຳການ (ວັນເສົາ ຫາ ວັນອາທິດ)">
                    ປະຈຳການ (ວັນເສົາ ຫາ ວັນອາທິດ)
                  </option>
                  <option value="ປະຈຳການ ວັນເສົາ">ປະຈຳການ ວັນເສົາ</option>
                  <option value="ປະຈຳການ ວັນອາທິດ">ປະຈຳການ ວັນອາທິດ</option>
                  <option value="ລາພັກ">ລາພັກ</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  id="reset-filter-btn"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDateFilter("");
                    setSelectedStatusFilter("");
                  }}
                  className="flex-1 py-2.5 px-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-sans text-xs font-bold transition-all"
                >
                  ລ້າງຄ່າກອງ
                </button>
                <button
                  id="add-manual-log-btn"
                  onClick={() => setShowAddLogModal(true)}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 px-3 rounded-xl font-bold font-sans text-xs flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  ລົງເວລາໃຫ້
                </button>
              </div>
            </div>

            {/* Attendance Logs Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 overflow-x-auto">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-sans">
                  ປະຫວັດການລົງເວລາທັງໝົດ ({filteredAttendance.length} ລາຍການ)
                </h4>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    id="print-report-modal-btn"
                    onClick={() => setShowPrintModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    ພິມລາຍງານທີ່ສວຍງາມ (Print)
                  </button>

                  <div className="relative inline-block text-left">
                    <button
                      id="export-dropdown-toggle-btn"
                      onClick={() => setShowExportDropdown(!showExportDropdown)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      ສົ່ງອອກລາຍງານ Excel/CSV (Export)
                    </button>
                  {showExportDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowExportDropdown(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-20 font-sans text-xs">
                        <button
                          onClick={() => {
                            handleExportAttendanceTimeframe("daily");
                            setShowExportDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Calendar className="w-4 h-4 text-emerald-500" />
                          ສົ່ງອອກລາຍງານ ປະຈຳວັນ
                        </button>
                        <button
                          onClick={() => {
                            handleExportAttendanceTimeframe("weekly");
                            setShowExportDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <CalendarDays className="w-4 h-4 text-teal-500" />
                          ສົ່ງອອກລາຍງານ ປະຈຳອາທິດ (7 ວັນ)
                        </button>
                        <button
                          onClick={() => {
                            handleExportAttendanceTimeframe("monthly");
                            setShowExportDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                          ສົ່ງອອກລາຍງານ ປະຈຳເດືອນ
                        </button>
                        <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                        <button
                          onClick={() => {
                            handleExportCSV();
                            setShowExportDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 font-bold transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-indigo-500" />
                          ສົ່ງອອກທັງໝົດ (Payroll CSV)
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

              {filteredAttendance.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-10 font-sans">
                  ບໍ່ພົບຂໍ້ມູນການລົງເວລາທີ່ກົງກັນ
                </p>
              ) : (
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] font-bold uppercase font-sans">
                      <th className="py-3 px-2">ພະນັກງານ</th>
                      <th className="py-3 px-2">ວັນທີ (Date)</th>
                      <th className="py-3 px-2">ສະຖານະ (Status)</th>
                      <th className="py-3 px-2">ເວລາເຂົ້າ (In)</th>
                      <th className="py-3 px-2">ເວລາອອກ (Out)</th>
                      <th className="py-3 px-2">ຊົ່ວໂມງລວມ</th>
                      <th className="py-3 px-2">ໝາຍເຫດ/ຂໍ້ຜິດພາດ</th>
                      <th className="py-3 px-2 text-right">ຈັດການ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredAttendance.map((rec) => {
                      const emp = employees.find(
                        (e) => e.id === rec.employeeId,
                      );
                      const isOutOfOffice = rec.status.startsWith("ໄປວຽກນອກ");
                      const isLeave = rec.status.startsWith("ລາພັກ");
                      
                      const isWithinTrip = attendance.some(r => {
                        if (r.employeeId !== rec.employeeId) return false;
                        if (!r.status.includes('ຫຼາຍວັນ') && !r.status.startsWith('ໄປວຽກນອກ')) return false;
                        if (!r.tripDetails) return false;
                        const { startDate, endDate } = r.tripDetails;
                        const todayStr = new Date().toISOString().split("T")[0];
                        return rec.date >= startDate && rec.date <= endDate && todayStr <= endDate;
                      });

                      const isExcused = isOutOfOffice || isLeave || isWithinTrip;
                      const isPastDate =
                        rec.date < new Date().toISOString().split("T")[0];
                      const isForgotIn = !isExcused && !rec.checkIn && rec.checkOut;
                      const isForgotOut =
                        !isExcused && rec.checkIn && !rec.checkOut && isPastDate;
                      const hasWarning =
                        !isExcused && (isForgotIn || isForgotOut || rec.remarks);

                      return (
                        <tr
                          key={rec.id}
                          className="text-slate-600 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-3 px-2 font-sans">
                            <div className="flex items-center gap-2">
                              <img
                                src={
                                  emp?.avatar ||
                                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
                                }
                                alt="avatar"
                                className="w-8 h-8 rounded-lg object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-100 block">
                                  {emp
                                    ? `${emp.firstName} ${emp.lastName}`
                                    : "ບໍ່ພົບພະນັກງານ"}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Code: {emp?.employeeCode}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 font-sans">
                            <span className="font-mono block text-slate-700 dark:text-slate-300">
                              {formatLaoDate(rec.date)}
                            </span>
                            {rec.editedAt && (
                              <span
                                className="text-[10px] text-amber-600 dark:text-amber-400 font-sans mt-1 block leading-tight font-medium"
                                title="ແກ້ໄຂຂໍ້ມູນໂດຍ HR"
                              >
                                ✍️ ແກ້ໄຂ: {rec.editedAt}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 font-sans">
                            {rec.status === "ລາພັກ" ? (
                              <div className="flex flex-col gap-1 items-start">
                                <span className="bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-300 px-2 py-0.5 rounded-full text-[10px] font-medium font-sans">
                                  ລາພັກ ({rec.leaveDetails?.type})
                                </span>
                                {rec.leaveDetails?.status === 'approved' ? (
                                  <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[9px] font-bold font-sans">
                                    ✓ ເຫັນດີ
                                  </span>
                                ) : rec.leaveDetails?.status === 'rejected' ? (
                                  <span className="bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-300 px-2 py-0.5 rounded-full text-[9px] font-bold font-sans">
                                    ✗ ບໍ່ເຫັນດີ
                                  </span>
                                ) : (
                                  <span className="bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300 px-2 py-0.5 rounded-full text-[9px] font-bold font-sans">
                                    ⏱ ລໍຖ້າອະນຸມັດ
                                  </span>
                                )}
                              </div>
                            ) : (
                              <>
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                    rec.status === "ເຂົ້າວຽກປົກກະຕິ"
                                      ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-300"
                                      : rec.status.startsWith("ປະຈຳການ")
                                        ? "bg-teal-50 text-teal-700 dark:bg-teal-950/20 dark:text-teal-300"
                                        : "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300"
                                  }`}
                                >
                                  {rec.status}
                                </span>
                                {rec.dutyMonth && (
                                  <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-semibold font-sans mt-1">
                                    📅 ເດືອນ: {rec.dutyMonth}
                                  </span>
                                )}
                              </>
                            )}
                          </td>
                          <td className="py-3 px-2 font-sans font-medium text-slate-800 dark:text-slate-100">
                            <span className="font-mono block">{rec.checkIn || "-"}</span>
                            {rec.checkIn && rec.checkInOutside && rec.checkInLat && rec.checkInLng && (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${rec.checkInLat},${rec.checkInLng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-200/50 dark:border-amber-900/40 cursor-pointer"
                                title={`ຈຸດພິກັດ: ${rec.checkInLat}, ${rec.checkInLng} | ໄລຍະຫ່າງ: ${Math.round(rec.checkInDistance || 0)} ແມັດ`}
                              >
                                <MapPin className="w-3 h-3 text-amber-500" />
                                <span>ນອກ ({( (rec.checkInDistance || 0) / 1000 ).toFixed(1)} km)</span>
                              </a>
                            )}
                          </td>
                          <td className="py-3 px-2 font-sans font-medium text-slate-800 dark:text-slate-100">
                            <span className="font-mono block">{rec.checkOut || "-"}</span>
                            {rec.checkOut && rec.checkOutOutside && rec.checkOutLat && rec.checkOutLng && (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${rec.checkOutLat},${rec.checkOutLng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-200/50 dark:border-amber-900/40 cursor-pointer"
                                title={`ຈຸດພິກັດ: ${rec.checkOutLat}, ${rec.checkOutLng} | ໄລຍະຫ່າງ: ${Math.round(rec.checkOutDistance || 0)} ແມັດ`}
                              >
                                <MapPin className="w-3 h-3 text-amber-500" />
                                <span>ນອກ ({( (rec.checkOutDistance || 0) / 1000 ).toFixed(1)} km)</span>
                              </a>
                            )}
                          </td>
                          <td className="py-3 px-2 font-sans font-semibold text-slate-900 dark:text-slate-100">
                            {formatHours(rec.hoursWorked)}
                          </td>
                          <td className="py-3 px-2 font-sans">
                            {isForgotIn ? (
                              <span className="text-red-500 font-bold bg-red-50 dark:bg-red-950/30 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1">
                                ⚠️ ລືມ Check In
                              </span>
                            ) : isForgotOut ? (
                              <span className="text-red-500 font-bold bg-red-50 dark:bg-red-950/30 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1">
                                ⚠️ ລືມ Check Out
                              </span>
                            ) : rec.remarks ? (
                              <span className="text-red-500 font-bold bg-red-50 dark:bg-red-950/30 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1">
                                ⚠️ {rec.remarks}
                              </span>
                            ) : rec.status === "ລາພັກ" ? (
                              <div className="flex flex-col gap-1.5 max-w-[200px] font-sans text-xs">
                                <span
                                  className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed block"
                                  title={rec.leaveDetails?.details}
                                >
                                  {rec.leaveDetails?.details || "ສະເໜີລາພັກຕາມລະບຽບ"}
                                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-0.5 font-sans leading-none">
                                    ວັນທີ: {formatLaoDate(rec.leaveDetails?.startDate)} ຫາ {formatLaoDate(rec.leaveDetails?.endDate)}
                                  </span>
                                </span>
                                
                                {rec.leaveDetails?.status !== 'approved' && rec.leaveDetails?.status !== 'rejected' ? (
                                  <div className="flex gap-1.5 mt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateLeaveStatus(rec, 'approved')}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1 px-2 rounded-lg transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                                    >
                                      ✓ ເຫັນດີ
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateLeaveStatus(rec, 'rejected')}
                                      className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold py-1 px-2 rounded-lg transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                                    >
                                      ✗ ບໍ່ເຫັນດີ
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateLeaveStatus(rec, 'pending')}
                                    className="text-teal-600 hover:text-teal-800 dark:text-teal-400 hover:underline text-[9px] font-semibold text-left mt-0.5 cursor-pointer font-sans"
                                  >
                                    ປ່ຽນສະຖານະຄືນ (Reset)
                                  </button>
                                )}
                              </div>
                            ) : rec.tripDetails ? (
                              <div className="flex flex-col gap-0.5 max-w-[200px] font-sans text-xs text-slate-500 dark:text-slate-400">
                                <span className="italic block truncate font-medium" title={rec.tripDetails.details}>
                                  {rec.tripDetails.details || 'ໄປວຽກນອກ'}
                                </span>
                                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold block leading-normal mt-0.5">
                                  ✈️ ວັນທີ: {formatLaoDate(rec.tripDetails.startDate)} ຫາ {formatLaoDate(rec.tripDetails.endDate)}
                                  {(rec.tripDetails.startTime || rec.tripDetails.endTime) && (
                                    <span className="block text-[9px] text-teal-500 dark:text-teal-300 font-medium">
                                      ⏰ ເວລາ: {rec.tripDetails.startTime || "-"} ຫາ {rec.tripDetails.endTime || "-"}
                                    </span>
                                  )}
                                </span>
                              </div>
                            ) : rec.status.startsWith("ປະຈຳການ") && rec.dutyContent ? (
                              <span
                                className="text-slate-400 dark:text-slate-500 italic truncate max-w-[150px] block"
                                title={rec.dutyContent}
                              >
                                📝 {rec.dutyContent}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                id={`edit-log-${rec.id}`}
                                onClick={() => handleStartEditAttendance(rec)}
                                className="text-teal-600 hover:text-teal-800 dark:text-teal-400 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors inline-flex"
                                title="ແກ້ໄຂບັນທຶກ"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                id={`delete-log-${rec.id}`}
                                onClick={() => {
                                  if (
                                    confirm(
                                      "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບຂໍ້ມູນການລາຍງານເວລານີ້?",
                                    )
                                  ) {
                                    onDeleteAttendance(rec.id);
                                  }
                                }}
                                className="text-rose-500 hover:text-rose-700 dark:text-rose-400 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors inline-flex"
                                title="ລົບຂໍ້ມູນການລາຍງານ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Editing Record Modal */}
            {editingRecord && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4"
                >
                  <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100 font-sans">
                        ແກ້ໄຂເວລາ ແລະ ສະຖານະ (Edit Entry)
                      </h3>
                      <p className="text-xs text-slate-400 font-sans">
                        ພະນັກງານ:{" "}
                        {
                          employees.find(
                            (e) => e.id === editingRecord.employeeId,
                          )?.firstName
                        }{" "}
                        | ວັນທີ: {editingRecord.date}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingRecord(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                        ສະຖານະວຽກ:
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) =>
                          setEditStatus(e.target.value as WorkStatus | "ລາພັກ")
                        }
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-sans"
                      >
                        <option value="ເຂົ້າວຽກປົກກະຕິ">ເຂົ້າວຽກປົກກະຕິ</option>
                        <option value="ໄປວຽກນອກ (ຕອນເຊົ້າ)">
                          ໄປວຽກນອກ (ຕອນເຊົ້າ)
                        </option>
                        <option value="ໄປວຽກນອກ (ຕອນແລງ)">
                          ໄປວຽກນອກ (ຕອນແລງ)
                        </option>
                        <option value="ໄປວຽກນອກ (ໝົດມື້)">
                          ໄປວຽກນອກ (ໝົດມື້)
                        </option>
                        <option value="ໄປວຽກນອກ (ຫຼາຍວັນ)">
                          ໄປວຽກນອກ (ຫຼາຍວັນ)
                        </option>
                        <option value="ປະຈຳການ (ວັນເສົາ ຫາ ວັນອາທິດ)">
                          ປະຈຳການ (ວັນເສົາ ຫາ ວັນອາທິດ)
                        </option>
                        <option value="ປະຈຳການ ວັນເສົາ">
                          ປະຈຳການ ວັນເສົາ
                        </option>
                        <option value="ປະຈຳການ ວັນອາທິດ">
                          ປະຈຳການ ວັນອາທິດ
                        </option>
                        <option value="ລາພັກ">ລາພັກ</option>
                      </select>
                    </div>

                    {editStatus.includes("ໄປວຽກນອກ") && (
                      <div className="space-y-3 bg-teal-50/50 dark:bg-teal-950/10 p-4 rounded-2xl border border-teal-100 dark:border-teal-950/30">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-teal-700 dark:text-teal-300 mb-1 font-sans">
                              ວັນທີເລີ່ມຕົ້ນ: *
                            </label>
                            <input
                              type="date"
                              value={editTripStartDate}
                              onChange={(e) => setEditTripStartDate(e.target.value)}
                              className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-teal-700 dark:text-teal-300 mb-1 font-sans">
                              ເວລາເລີ່ມຕົ້ນ:
                            </label>
                            <input
                              type="time"
                              value={editTripStartTime}
                              onChange={(e) => setEditTripStartTime(e.target.value)}
                              className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-teal-700 dark:text-teal-300 mb-1 font-sans">
                              ວັນທີສິ້ນສຸດ: *
                            </label>
                            <input
                              type="date"
                              value={editTripEndDate}
                              onChange={(e) => setEditTripEndDate(e.target.value)}
                              className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-teal-700 dark:text-teal-300 mb-1 font-sans">
                              ເວລາສິ້ນສຸດ:
                            </label>
                            <input
                              type="time"
                              value={editTripEndTime}
                              onChange={(e) => setEditTripEndTime(e.target.value)}
                              className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-teal-700 dark:text-teal-300 mb-1 font-sans">
                            ລາຍລະອຽດ/ເຫດຜົນ: *
                          </label>
                          <textarea
                            value={editTripDetails}
                            onChange={(e) => setEditTripDetails(e.target.value)}
                            placeholder="ລະບຸສະຖານທີ່ ຫຼື ຈຸດປະສົງການໄປວຽກນອກ..."
                            className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans h-16 resize-none"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {editStatus === "ລາພັກ" && (
                      <div className="space-y-3 bg-indigo-50/50 dark:bg-indigo-950/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-950/30">
                        <div>
                          <label className="block text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1 font-sans">
                            ປະເພດການລາພັກ: *
                          </label>
                          <select
                            value={editLeaveType}
                            onChange={(e) => setEditLeaveType(e.target.value as LeaveType)}
                            className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans"
                          >
                            <option value="ລາພັກປະຈຳປີ">ລາພັກປະຈຳປີ</option>
                            <option value="ລາພັກເຈັບໄຂ້">ລາພັກເຈັບໄຂ້</option>
                            <option value="ລາພັກຈຳເປັນ">ລາພັກຈຳເປັນ</option>
                            <option value="ລາພັກທົດແທນ">ລາພັກທົດແທນ</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1 font-sans">
                            ລາຍລະອຽດ/ເຫດຜົນການລາພັກ:
                          </label>
                          <textarea
                            value={editLeaveDetails}
                            onChange={(e) => setEditLeaveDetails(e.target.value)}
                            placeholder="ກະລຸນາປ້ອນເຫດຜົນໃນການລາພັກ..."
                            className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans h-16 resize-none"
                          />
                        </div>
                      </div>
                    )}

                    {editStatus.startsWith("ປະຈຳການ") && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                            ເດືອນປະຈຳການ: *
                          </label>
                          <select
                            value={editDutyMonth}
                            onChange={(e) => setEditDutyMonth(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-sans"
                          >
                            {LAO_MONTHS.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                            ເນື້ອໃນໃນການປະຈຳການ: *
                          </label>
                          <textarea
                            value={editDutyContent}
                            onChange={(e) => setEditDutyContent(e.target.value)}
                            placeholder="ກະລຸນາປ້ອນເນື້ອໃນການປະຈຳການ..."
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-sans h-20 resize-none"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                          ເວລາ Check In:
                        </label>
                        <input
                          type="text"
                          value={editCheckIn}
                          onChange={(e) => setEditCheckIn(e.target.value)}
                          placeholder="ຕົວຢ່າງ: 08:30:00"
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                          ເວລາ Check Out:
                        </label>
                        <input
                          type="text"
                          value={editCheckOut}
                          onChange={(e) => setEditCheckOut(e.target.value)}
                          placeholder="ຕົວຢ່າງ: 17:00:00"
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                        ໝາຍເຫດ (Remarks / Warnings):
                      </label>
                      <input
                        type="text"
                        value={editRemarks}
                        onChange={(e) => setEditRemarks(e.target.value)}
                        placeholder="ຕົວຢ່າງ: ລືມ Check In, ຂໍລາພັກຍ້ອນຫຼັງ..."
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setEditingRecord(null)}
                      className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-sans text-xs font-bold transition-all"
                    >
                      ຍົກເລີກ
                    </button>
                    <button
                      onClick={handleSaveAttendanceEdit}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl font-sans text-xs font-bold transition-all"
                    >
                      ບັນທຶກການແກ້ໄຂ
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Manual Attendance Add Modal */}
            {showAddLogModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4"
                >
                  <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100 font-sans">
                        ລົງບັນທຶກການເຂົ້າ-ອອກວຽກຍ້ອນຫຼັງ
                      </h3>
                      <p className="text-xs text-slate-400 font-sans">
                        ສຳລັບເພີ່ມຂໍ້ມູນຍ້ອນຫຼັງໃຫ້ພະນັກງານ
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddLogModal(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={handleAddManualAttendance}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                        ເລືອກພະນັກງານ: *
                      </label>
                      <select
                        value={manualLog.employeeId}
                        onChange={(e) =>
                          setManualLog({
                            ...manualLog,
                            employeeId: e.target.value,
                          })
                        }
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-sans"
                        required
                      >
                        <option value="">-- ເລືອກພະນັກງານ --</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} ({emp.employeeCode})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                          ວັນທີ: *
                        </label>
                        <input
                          type="date"
                          value={manualLog.date}
                          onChange={(e) =>
                            setManualLog({ ...manualLog, date: e.target.value })
                          }
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-sans"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                          ສະຖານະວຽກ:
                        </label>
                        <select
                          value={manualLog.status}
                          onChange={(e) => {
                            const val = e.target.value as WorkStatus | "ລາພັກ";
                            setManualLog({
                              ...manualLog,
                              status: val,
                              dutyMonth: val.startsWith("ປະຈຳການ") ? (manualLog.dutyMonth || LAO_MONTHS[new Date().getMonth()]) : ""
                            });
                          }}
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-sans"
                        >
                          <option value="ເຂົ້າວຽກປົກກະຕິ">
                            ເຂົ້າວຽກປົກກະຕິ
                          </option>
                          <option value="ໄປວຽກນອກ (ຕອນເຊົ້າ)">
                            ໄປວຽກນອກ (ຕອນເຊົ້າ)
                          </option>
                          <option value="ໄປວຽກນອກ (ຕອນແລງ)">
                            ໄປວຽກນອກ (ຕອນແລງ)
                          </option>
                          <option value="ໄປວຽກນອກ (ໝົດມື້)">
                            ໄປວຽກນອກ (ໝົດມື້)
                          </option>
                          <option value="ໄປວຽກນອກ (ຫຼາຍວັນ)">
                            ໄປວຽກນອກ (ຫຼາຍວັນ)
                          </option>
                          <option value="ປະຈຳການ (ວັນເສົາ ຫາ ວັນອາທິດ)">
                            ປະຈຳການ (ວັນເສົາ ຫາ ວັນອາທິດ)
                          </option>
                          <option value="ປະຈຳການ ວັນເສົາ">
                            ປະຈຳການ ວັນເສົາ
                          </option>
                          <option value="ປະຈຳການ ວັນອາທິດ">
                            ປະຈຳການ ວັນອາທິດ
                          </option>
                          <option value="ລາພັກ">ລາພັກ</option>
                        </select>
                      </div>
                    </div>

                    {manualLog.status.includes("ໄປວຽກນອກ") && (
                      <div className="space-y-3 bg-teal-50/50 dark:bg-teal-950/10 p-4 rounded-2xl border border-teal-100 dark:border-teal-950/30">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-teal-700 dark:text-teal-300 mb-1 font-sans">
                              ວັນທີເລີ່ມຕົ້ນ: *
                            </label>
                            <input
                              type="date"
                              value={manualLog.tripStartDate || manualLog.date}
                              onChange={(e) =>
                                setManualLog({
                                  ...manualLog,
                                  tripStartDate: e.target.value,
                                })
                              }
                              className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-teal-700 dark:text-teal-300 mb-1 font-sans">
                              ເວລາເລີ່ມຕົ້ນ:
                            </label>
                            <input
                              type="time"
                              value={manualLog.tripStartTime || ""}
                              onChange={(e) =>
                                setManualLog({
                                  ...manualLog,
                                  tripStartTime: e.target.value,
                                })
                              }
                              className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-teal-700 dark:text-teal-300 mb-1 font-sans">
                              ວັນທີສິ້ນສຸດ: *
                            </label>
                            <input
                              type="date"
                              value={manualLog.tripEndDate || manualLog.date}
                              onChange={(e) =>
                                setManualLog({
                                  ...manualLog,
                                  tripEndDate: e.target.value,
                                })
                              }
                              className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-teal-700 dark:text-teal-300 mb-1 font-sans">
                              ເວລາສິ້ນສຸດ:
                            </label>
                            <input
                              type="time"
                              value={manualLog.tripEndTime || ""}
                              onChange={(e) =>
                                setManualLog({
                                  ...manualLog,
                                  tripEndTime: e.target.value,
                                })
                              }
                              className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-teal-700 dark:text-teal-300 mb-1 font-sans">
                            ລາຍລະອຽດ/ເຫດຜົນ: *
                          </label>
                          <textarea
                            value={manualLog.tripDetails || ""}
                            onChange={(e) =>
                              setManualLog({
                                ...manualLog,
                                tripDetails: e.target.value,
                              })
                            }
                            placeholder="ລະບຸສະຖານທີ່ ຫຼື ຈຸດປະສົງການໄປວຽກນອກ..."
                            className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans h-16 resize-none"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {manualLog.status === "ລາພັກ" && (
                      <div className="space-y-3 bg-indigo-50/50 dark:bg-indigo-950/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-950/30">
                        <div>
                          <label className="block text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1 font-sans">
                            ປະເພດການລາພັກ: *
                          </label>
                          <select
                            value={manualLog.leaveType}
                            onChange={(e) =>
                              setManualLog({
                                ...manualLog,
                                leaveType: e.target.value as LeaveType,
                              })
                            }
                            className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans"
                          >
                            <option value="ລາພັກປະຈຳປີ">ລາພັກປະຈຳປີ</option>
                            <option value="ລາພັກເຈັບໄຂ້">ລາພັກເຈັບໄຂ້</option>
                            <option value="ລາພັກຈຳເປັນ">ລາພັກຈຳເປັນ</option>
                            <option value="ລາພັກທົດແທນ">ລາພັກທົດແທນ</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1 font-sans">
                            ລາຍລະອຽດ/ເຫດຜົນການລາພັກ:
                          </label>
                          <textarea
                            value={manualLog.leaveDetails}
                            onChange={(e) =>
                              setManualLog({
                                ...manualLog,
                                leaveDetails: e.target.value,
                              })
                            }
                            placeholder="ກະລຸນາປ້ອນເຫດຜົນໃນການລາພັກ..."
                            className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans h-16 resize-none"
                          />
                        </div>
                      </div>
                    )}

                    {manualLog.status.startsWith("ປະຈຳການ") && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                            ເດືອນປະຈຳການ: *
                          </label>
                          <select
                            value={manualLog.dutyMonth || LAO_MONTHS[new Date().getMonth()]}
                            onChange={(e) =>
                              setManualLog({
                                ...manualLog,
                                dutyMonth: e.target.value,
                              })
                            }
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-sans"
                          >
                            {LAO_MONTHS.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                            ເນື້ອໃນໃນການປະຈຳການ: *
                          </label>
                          <textarea
                            value={manualLog.dutyContent || ""}
                            onChange={(e) =>
                              setManualLog({
                                ...manualLog,
                                dutyContent: e.target.value,
                              })
                            }
                            placeholder="ກະລຸນາປ້ອນເນື້ອໃນການປະຈຳການ..."
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-sans h-20 resize-none"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                          ເວລາ Check In:
                        </label>
                        <input
                          type="text"
                          value={manualLog.checkIn}
                          onChange={(e) =>
                            setManualLog({
                              ...manualLog,
                              checkIn: e.target.value,
                            })
                          }
                          placeholder="ຕົວຢ່າງ: 08:30:00"
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                          ເວລາ Check Out:
                        </label>
                        <input
                          type="text"
                          value={manualLog.checkOut}
                          onChange={(e) =>
                            setManualLog({
                              ...manualLog,
                              checkOut: e.target.value,
                            })
                          }
                          placeholder="ຕົວຢ່າງ: 17:00:00"
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                        ໝາຍເຫດ (Remarks):
                      </label>
                      <input
                        type="text"
                        value={manualLog.remarks}
                        onChange={(e) =>
                          setManualLog({
                            ...manualLog,
                            remarks: e.target.value,
                          })
                        }
                        placeholder="ຕົວຢ່າງ: ລືມ Check In, ຂໍລາພັກຍ້ອນຫຼັງ..."
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-sans"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddLogModal(false)}
                        className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-sans text-xs font-bold transition-all"
                      >
                        ຍົກເລີກ
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer"
                      >
                        ລົງເວລາ
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}

            {/* Beautiful Printable Attendance Report Modal */}
            {showPrintModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                {/* Print specific style overrides */}
                <style>{`
                  @import url('https://fonts.googleapis.com/css2?family=Phetsarath&family=Noto+Sans+Lao&display=swap');
                  @media print {
                    @page {
                      size: A4 landscape;
                      margin: 10mm !important;
                    }
                    /* Hide EVERYTHING on the screen */
                    body * {
                      visibility: hidden !important;
                    }
                    /* ONLY show our targeted print area and its containers, but strip styles from parent containers */
                    #printable-area, #printable-area * {
                      visibility: visible !important;
                      font-family: "Phetsarath", "Phetsarath OT", "Noto Sans Lao", "Times New Roman", serif !important;
                    }
                    #printable-area-container, #printable-area-container * {
                      visibility: visible !important;
                    }
                    /* Reset modal overlay container for printing */
                    div.fixed.inset-0 {
                      position: static !important;
                      display: block !important;
                      width: 100% !important;
                      height: auto !important;
                      background: transparent !important;
                      backdrop-filter: none !important;
                      -webkit-backdrop-filter: none !important;
                      padding: 0 !important;
                      margin: 0 !important;
                      overflow: visible !important;
                      box-shadow: none !important;
                      z-index: auto !important;
                    }
                    /* Reset modal internal motion wrapper for printing */
                    div.bg-white.dark\:bg-slate-900.rounded-3xl {
                      position: static !important;
                      display: block !important;
                      width: 100% !important;
                      height: auto !important;
                      max-width: none !important;
                      margin: 0 !important;
                      padding: 0 !important;
                      border: none !important;
                      box-shadow: none !important;
                      background: transparent !important;
                    }
                    #printable-area-container {
                      display: block !important;
                      position: relative !important;
                      max-height: none !important;
                      overflow: visible !important;
                      border: none !important;
                      background: transparent !important;
                      padding: 0 !important;
                      margin: 0 !important;
                      box-shadow: none !important;
                      width: 100% !important;
                      height: auto !important;
                    }
                    body, html, #root, #app-root, main, #hr-dashboard-container {
                      display: block !important;
                      position: relative !important;
                      overflow: visible !important;
                      height: auto !important;
                      min-height: 0 !important;
                      background: white !important;
                      margin: 0 !important;
                      padding: 0 !important;
                    }
                    #printable-area {
                      display: block !important;
                      position: relative !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      margin: 0 !important;
                      padding: 0 !important;
                      background: white !important;
                      color: black !important;
                      font-size: 10px !important;
                    }
                    /* Ensure tables print borders correctly */
                    table {
                      border-collapse: collapse !important;
                      width: 100% !important;
                    }
                    th, td {
                      border: 1px solid #111111 !important;
                      padding: 6px 6px !important;
                      text-align: left !important;
                      color: #000000 !important;
                      vertical-align: middle !important;
                    }
                    th {
                      background-color: #f1f5f9 !important;
                      font-weight: bold !important;
                      text-align: center !important;
                      -webkit-print-color-adjust: exact;
                      print-color-adjust: exact;
                    }
                    /* Alternating Row Colors for Readability */
                    tr:nth-child(even) {
                      background-color: #f8fafc !important;
                      -webkit-print-color-adjust: exact;
                      print-color-adjust: exact;
                    }
                    .print-footer-container {
                      page-break-inside: avoid !important;
                      break-inside: avoid !important;
                    }
                    .signature-section {
                      page-break-inside: avoid !important;
                      break-inside: avoid !important;
                    }
                    tr {
                      page-break-inside: avoid !important;
                      break-inside: avoid !important;
                    }
                    #printable-area .font-en {
                      font-family: "Times New Roman", serif !important;
                    }
                    .no-print {
                      display: none !important;
                    }
                  }
                `}</style>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-7xl w-full shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 my-8"
                >
                  {/* Modal Action Header (Hidden during print) */}
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 no-print">
                    <div>
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100 font-sans flex items-center gap-2">
                        <Printer className="w-5 h-5 text-indigo-500" />
                        ພິມລາຍງານທີ່ສວຍງາມ (Print Attendance Report)
                      </h3>
                      <p className="text-xs text-slate-400 font-sans">
                        ຕາຕະລາງລາຍງານໄດ້ຮັບການຈັດຮູບແບບໃຫ້ມີຄວາມສວຍງາມ ແລະ ມີບ່ອນເຊັນອະນຸມັດພ້ອມທີ່ຈະພິມອອກໄດ້ທັນທີ
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-bold py-2.5 px-5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        ພິມລາຍງານ (Print)
                      </button>
                      <button
                        onClick={() => setShowPrintModal(false)}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Document Preview Container */}
                  <div id="printable-area-container" className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-50 dark:bg-slate-950 max-h-[60vh] overflow-y-auto">
                    {/* Rendered HTML Report Area */}
                    <div
                      id="printable-area"
                      className="bg-white text-slate-900 p-8 shadow-sm rounded-xl max-w-6xl w-full mx-auto font-sans"
                      style={{ color: "#000" }}
                    >
                      {/* Document Header */}
                      <div className="text-center space-y-2 mb-6">
                        <div className="flex justify-center items-center gap-3 mb-2">
                          <span className="text-3xl">📋</span>
                          <h2 className="text-xl font-black tracking-tight text-center text-black uppercase font-sans">
                            ລາຍງານການລົງເວລາເຮັດວຽກຂອງພະນັກງານ
                          </h2>
                        </div>
                        <p className="text-xs text-gray-750 font-bold font-sans">
                          (Employee Attendance & Leave Report - Landscape Format A4)
                        </p>
                        <div className="w-36 h-0.5 bg-black mx-auto my-3"></div>
                        <div className="grid grid-cols-2 gap-4 text-left text-[11px] text-gray-800 max-w-2xl mx-auto pt-2 font-sans">
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center gap-2">
                            <span className="text-base">📅</span>
                            <div>
                              <strong className="text-slate-600 block text-[9px] uppercase">ວັນທີພິມລາຍງານ (Print Date)</strong>
                              <span className="font-mono font-bold">{new Date().toLocaleString('lo-LA')}</span>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center gap-2">
                            <span className="text-base">👤</span>
                            <div>
                              <strong className="text-slate-600 block text-[9px] uppercase">ผู้ພິມລາຍງານ (Printed By)</strong>
                              <span className="font-bold">HR Admin</span>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center gap-2">
                            <span className="text-base">📊</span>
                            <div>
                              <strong className="text-slate-600 block text-[9px] uppercase">ຈຳນວນທັງໝົດ (Total Records)</strong>
                              <span className="font-bold">{filteredAttendance.length} ລາຍການ</span>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center gap-2">
                            <span className="text-base">⚙️</span>
                            <div>
                              <strong className="text-slate-600 block text-[9px] uppercase">ຕົວຕອງຂໍ້ມູນ (Filtered By)</strong>
                              <span className="font-bold text-indigo-700">{selectedDateFilter ? `ວັນທີ ${selectedDateFilter}` : 'ທັງໝົດ'} {selectedStatusFilter ? `| ${selectedStatusFilter}` : ''}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Main Report Table */}
                      <table className="w-full text-[10px] border-collapse border border-slate-400 text-black">
                        <thead>
                          <tr className="bg-slate-100 border border-slate-400 font-bold">
                            <th className="border border-slate-400 p-2 text-center w-12 font-sans text-black">ລຳດັບ<br/><span className="text-[8px] font-en block mt-0.5">No.</span></th>
                            <th className="border border-slate-400 p-2 text-center w-20 font-sans text-black">ລະຫັດພະນັກງານ<br/><span className="text-[8px] font-en block mt-0.5">ID</span></th>
                            <th className="border border-slate-400 p-2 text-left font-sans text-black">ພະນັກງານ<br/><span className="text-[8px] font-en block mt-0.5">Employee</span></th>
                            <th className="border border-slate-400 p-2 text-left font-sans text-black">ຕຳແໜ່ງ<br/><span className="text-[8px] font-en block mt-0.5">POSITION</span></th>
                            <th className="border border-slate-400 p-2 text-center w-28 font-sans text-black">ວັນທີ<br/><span className="text-[8px] font-en block mt-0.5">Date</span></th>
                            <th className="border border-slate-400 p-2 text-center w-28 font-sans text-black">ສະຖານະ<br/><span className="text-[8px] font-en block mt-0.5">Status</span></th>
                            <th className="border border-slate-400 p-2 text-center w-16 font-sans text-black">ເວລາເຂົ້າ<br/><span className="text-[8px] font-en block mt-0.5">In</span></th>
                            <th className="border border-slate-400 p-2 text-center w-16 font-sans text-black">ເວລາອອກ<br/><span className="text-[8px] font-en block mt-0.5">Out</span></th>
                            <th className="border border-slate-400 p-2 text-center w-20 font-sans text-black">ຊົ່ວໂມງລວມ<br/><span className="text-[8px] font-en block mt-0.5">Hours</span></th>
                            <th className="border border-slate-400 p-2 text-left font-sans text-black">ໝາຍເຫດ/ຂໍ້ຜິດພາດ<br/><span className="text-[8px] font-en block mt-0.5">Remarks / Errors</span></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAttendance.map((rec, index) => {
                            const emp = employees.find((e) => e.id === rec.employeeId);
                            const empName = emp ? `${emp.firstName} ${emp.lastName}` : `-`;
                            const empCode = emp ? emp.employeeCode : `-`;
                            const position = emp ? emp.position : `-`;
                            
                            let warningOrRemark = rec.remarks || "-";
                            const isOutOfOffice = rec.status.startsWith("ໄປວຽກນອກ");
                            const isLeave = rec.status.startsWith("ລາພັກ");

                            const isWithinTrip = attendance.some(r => {
                              if (r.employeeId !== rec.employeeId) return false;
                              if (!r.status.includes('ຫຼາຍວັນ') && !r.status.startsWith('ໄປວຽກນອກ')) return false;
                              if (!r.tripDetails) return false;
                              const { startDate, endDate } = r.tripDetails;
                              const todayStr = new Date().toISOString().split("T")[0];
                              return rec.date >= startDate && rec.date <= endDate && todayStr <= endDate;
                            });
                            
                            if (!isOutOfOffice && !isLeave && !isWithinTrip) {
                              if (!rec.checkIn && rec.checkOut) {
                                warningOrRemark = "ລືມ Check In";
                              } else if (rec.checkIn && !rec.checkOut && rec.date < new Date().toISOString().split("T")[0]) {
                                warningOrRemark = "ລືມ Check Out";
                              }
                            } else if (isOutOfOffice) {
                              if (rec.tripDetails) {
                                const timeStr = (rec.tripDetails.startTime || rec.tripDetails.endTime)
                                  ? ` ເວລາ: ${rec.tripDetails.startTime || '-'} ຫາ ${rec.tripDetails.endTime || '-'}`
                                  : '';
                                warningOrRemark = `${rec.tripDetails.details || "ໄປວຽກນອກ"} (ວັນທີ: ${formatLaoDateFriendly(rec.tripDetails.startDate)} ຫາ ${formatLaoDateFriendly(rec.tripDetails.endDate)}${timeStr})`;
                              } else {
                                warningOrRemark = "ໄປວຽກນອກ";
                              }
                            } else if (isLeave) {
                              if (rec.leaveDetails) {
                                warningOrRemark = `${rec.leaveDetails.type || "ລາພັກ"}: ${rec.leaveDetails.details || ""}`;
                              } else {
                                warningOrRemark = "ລາພັກ";
                              }
                            }

                            const isEven = index % 2 === 1;
                            const isForgot = warningOrRemark === "ລືມ Check In" || warningOrRemark === "ລືມ Check Out";

                            return (
                              <tr key={rec.id} className={`border border-slate-300 ${isEven ? 'bg-slate-50/70' : 'bg-white'} hover:bg-gray-150`}>
                                <td className="border border-slate-300 p-2 text-center text-slate-800">{index + 1}</td>
                                <td className="border border-slate-300 p-2 text-center font-mono font-bold text-slate-900">{empCode}</td>
                                <td className="border border-slate-300 p-2 font-semibold text-slate-900">{empName}</td>
                                <td className="border border-slate-300 p-2 text-slate-700">{position}</td>
                                <td className="border border-slate-300 p-2 text-center font-medium text-slate-800">{formatLaoDateFriendly(rec.date)}</td>
                                <td className="border border-slate-300 p-2 text-center font-medium">
                                  {rec.status === "ເຂົ້າວຽກປົກກະຕິ" ? (
                                    <span className="text-emerald-700 font-bold">{rec.status}</span>
                                  ) : isLeave ? (
                                    <span className="text-amber-700 font-bold">{rec.status}</span>
                                  ) : isOutOfOffice ? (
                                    <span className="text-blue-700 font-bold">{rec.status}</span>
                                  ) : (
                                    <span className="text-slate-700">{rec.status}</span>
                                  )}
                                </td>
                                <td className="border border-slate-300 p-2 text-center text-slate-800">
                                  <span className="font-mono font-bold block">{rec.checkIn || "-"}</span>
                                  {rec.checkIn && rec.checkInOutside && rec.checkInLat && rec.checkInLng && (
                                    <span className="text-[8px] block text-amber-600 font-bold mt-0.5">
                                      📍 ນອກ ({( (rec.checkInDistance || 0) / 1000 ).toFixed(1)} km)
                                    </span>
                                  )}
                                </td>
                                <td className="border border-slate-300 p-2 text-center text-slate-800">
                                  <span className="font-mono font-bold block">{rec.checkOut || "-"}</span>
                                  {rec.checkOut && rec.checkOutOutside && rec.checkOutLat && rec.checkOutLng && (
                                    <span className="text-[8px] block text-amber-600 font-bold mt-0.5">
                                      📍 ນອກ ({( (rec.checkOutDistance || 0) / 1000 ).toFixed(1)} km)
                                    </span>
                                  )}
                                </td>
                                <td className="border border-slate-300 p-2 text-center font-mono font-bold text-indigo-700">{formatHours(rec.hoursWorked)}</td>
                                <td className="border border-slate-300 p-2 text-[9px]">
                                  {isForgot ? (
                                    <span className="text-red-600 font-black bg-red-50/50 border border-red-100 px-1.5 py-0.5 rounded" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                      ⚠️ {warningOrRemark}
                                    </span>
                                  ) : isLeave ? (
                                    <span className="text-amber-700 font-bold bg-amber-50/50 border border-amber-100 px-1.5 py-0.5 rounded" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                      {warningOrRemark}
                                    </span>
                                  ) : isOutOfOffice ? (
                                    <span className="text-blue-700 font-bold bg-blue-50/50 border border-blue-100 px-1.5 py-0.5 rounded" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                      {warningOrRemark}
                                    </span>
                                  ) : (
                                    <span className="text-slate-600">{warningOrRemark}</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* Summary Panel */}
                      <div className="mt-6 p-4 bg-slate-50 border border-slate-300 rounded-xl text-[11px] text-black space-y-2" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                        <p className="font-extrabold text-xs text-indigo-900 border-b border-slate-200 pb-1.5 flex items-center gap-1">
                          <span>📊</span> ສະຫຼຸບລວມສະຖິຕິການລົງເວລາ (Attendance Summary Metrics)
                        </p>
                        <div className="grid grid-cols-4 gap-4 pt-1">
                          <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                            <span className="text-[9px] text-slate-500 block font-bold">ບັນທຶກທັງໝົດ (Total)</span>
                            <span className="text-sm font-black text-slate-800">{filteredAttendance.length} ລາຍການ</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                            <span className="text-[9px] text-emerald-600 block font-bold">ເຂົ້າວຽກປົກກະຕິ (On Time)</span>
                            <span className="text-sm font-black text-emerald-700">{filteredAttendance.filter(r => r.status === "ເຂົ້າວຽກປົກກະຕິ").length} ລາຍການ</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                            <span className="text-[9px] text-amber-600 block font-bold">ລາພັກ (On Leave)</span>
                            <span className="text-sm font-black text-amber-700">{filteredAttendance.filter(r => r.status.startsWith("ລາພັກ")).length} ລາຍການ</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                            <span className="text-[9px] text-blue-600 block font-bold">ໄປວຽກນອກ (Out of Office)</span>
                            <span className="text-sm font-black text-blue-700">{filteredAttendance.filter(r => r.status.startsWith("ໄປວຽກນອກ")).length} ລາຍການ</span>
                          </div>
                        </div>
                      </div>

                      {/* Signature / Approval Section */}
                      <div className="mt-16 grid grid-cols-3 gap-6 text-center text-[11px] text-black signature-section">
                        {/* Column 1: Approved by PC/DPC */}
                        <div className="space-y-16">
                          <div>
                            <p className="font-bold text-xs text-slate-800">ຫົວໜ້າຫ້ອງການ</p>
                            <p className="text-[9px] text-slate-500 font-en font-serif">(Approved by PC/DPC)</p>
                          </div>
                          <div className="space-y-1.5 text-left pl-2 text-slate-800">
                            <p>ລົງຊື່: ...........................................................</p>
                            <p>ຊື່ແຈ້ງ: (..........................................................)</p>
                            <p>ວັນທີ: ......... / ......... / .............</p>
                          </div>
                        </div>

                        {/* Column 2: Verified by ADMIN */}
                        <div className="space-y-16">
                          <div>
                            <p className="font-bold text-xs text-slate-800">ວິຊາການ ບໍລິຫານ-ຈັດຕັ້ງ</p>
                            <p className="text-[9px] text-slate-500 font-en font-serif">(Verified by ADMIN)</p>
                          </div>
                          <div className="space-y-1.5 text-left pl-2 text-slate-800">
                            <p>ລົງຊື່: ...........................................................</p>
                            <p>ຊື່ແຈ້ງ: (..........................................................)</p>
                            <p>ວັນທີ: ......... / ......... / .............</p>
                          </div>
                        </div>

                        {/* Column 3: Prepared by HR */}
                        <div className="space-y-16">
                          <div>
                            <p className="font-bold text-xs text-slate-800">ຜູ້ຊ່ວຍບໍລິຫານ</p>
                            <p className="text-[9px] text-slate-500 font-en font-serif">(Prepared by HR)</p>
                          </div>
                          <div className="space-y-1.5 text-left pl-2 text-slate-800">
                            <p>ລົງຊື່: ...........................................................</p>
                            <p>ຊື່ແຈ້ງ: (..........................................................)</p>
                            <p>ວັນທີ: ......... / ......... / .............</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer (Hidden during print) */}
                  <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 no-print">
                    <button
                      onClick={() => setShowPrintModal(false)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl font-sans transition-colors cursor-pointer"
                    >
                      ປິດໜ້າຕ່າງ
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl font-sans flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      ພິມເອກະສານດຽວນີ້ (Print Now)
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Floating 'Print Preview' Button */}
            <div className="fixed bottom-6 right-6 z-40 no-print">
              <motion.button
                id="floating-print-preview-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowPrintModal(true);
                  setTimeout(() => {
                    window.print();
                  }, 300);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-xl hover:shadow-indigo-500/20 px-5 py-3 rounded-full font-bold font-sans text-xs transition-all tracking-wide border border-indigo-500/30 cursor-pointer"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-100"></span>
                </span>
                <Printer className="w-4 h-4 animate-pulse" />
                ຕົວຢ່າງກ່ອນພິມ A4 (Print Preview)
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* TAB 2: Forgot Check In/Out Report */}
        {activeTab === "forgot_report" && (
          <motion.div
            id="tab-forgot-content"
            key="forgot-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Control Range bar */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-sans">
                  ລາຍງານພະນັກງານທີ່ລືມ Check-In ຫລື Check-Out
                </h4>
                <p className="text-xs text-slate-400 font-sans">
                  ສະແດງຜິດພາດ/ໝາຍເຫດ ເປັນປະຈຳວັນ, ອາທິດ, ແລະ ເດືອນ
                  (ແຍກສີແດງຈະແຈ້ງ)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {(["daily", "weekly", "monthly"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setForgetReportTimeframe(mode)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all ${
                        forgetReportTimeframe === mode
                          ? "bg-red-500 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-800"
                      }`}
                    >
                      {mode === "daily"
                        ? "ລາຍວັນ"
                        : mode === "weekly"
                          ? "ລາຍອາທິດ"
                          : "ລາຍເດືອນ"}
                    </button>
                  ))}
                </div>

                <input
                  id="report-date-picker"
                  type="date"
                  value={selectedReportDate}
                  onChange={(e) => setSelectedReportDate(e.target.value)}
                  className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans"
                />
              </div>
            </div>

            {/* Results */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 mb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-red-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-red-600 dark:text-red-400 font-sans">
                    ສະຫຼຸບລາຍງານຄວາມຜິດພາດ (
                    {forgetReportTimeframe === "daily"
                      ? "ປະຈຳວັນ"
                      : forgetReportTimeframe === "weekly"
                        ? "ປະຈຳອາທິດ (7 ວັນຍ້ອນຫຼັງ)"
                        : "ປະຈຳເດືອນ"}
                    )
                  </h3>
                </div>
                {forgetRows.length > 0 && (
                  <button
                    id="export-forgetful-btn"
                    onClick={handleExportForgetfulCSV}
                    className="bg-red-600 hover:bg-red-700 text-white font-sans text-xs font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    ສົ່ງອອກລາຍງານລືມສະແກນ Excel/CSV
                  </button>
                )}
              </div>

              {/* Controls and Bulk Actions Toolbar */}
              {forgetRows.length > 0 && (
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl mb-4 border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-sans mr-2">
                      ຈັດການຂໍ້ມູນ (Actions):
                    </span>
                    <button
                      onClick={() => {
                        const allKeys = forgetRows.flatMap((row) =>
                          row.details.map((d) => `${row.employee.id}-${d.date}-${d.type}`)
                        );
                        if (selectedForgetIds.length === allKeys.length) {
                          setSelectedForgetIds([]);
                        } else {
                          setSelectedForgetIds(allKeys);
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold font-sans transition-all"
                    >
                      {selectedForgetIds.length === forgetRows.flatMap(r => r.details).length ? "ຍົກເລີກການເລືອກທັງໝົດ" : "ເລືອກທັງໝົດ"}
                    </button>
                    
                    <button
                      disabled={selectedForgetIds.length === 0}
                      onClick={() => {
                        if (confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ ${selectedForgetIds.length} ລາຍການທີ່ເລືອກ? (ລະບົບຈະບໍ່ດຶງຂໍ້ມູນເກົ່ານີ້ກັບຄືນມາອີກ)`)) {
                          handleDeleteForgotKeys(selectedForgetIds);
                          alert("ລຶບລາຍການທີ່ເລືອກສຳເລັດ!");
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all flex items-center gap-1 ${
                        selectedForgetIds.length > 0
                          ? "bg-red-500 hover:bg-red-600 text-white cursor-pointer shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-650 cursor-not-allowed"
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      ລຶບລາຍການທີ່ເລືອກ ({selectedForgetIds.length})
                    </button>

                    {deletedForgotKeys.length > 0 && (
                      <button
                        onClick={handleRestoreForgotKeys}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold font-sans transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        ກູ້ຄືນລາຍການທີ່ຖືກລົບ ({deletedForgotKeys.length})
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-sans mr-1">
                      ຮູບແບບການສະແດງ:
                    </span>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                      <button
                        onClick={() => setForgetViewMode("cards")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold font-sans transition-all flex items-center gap-1 ${
                          forgetViewMode === "cards"
                            ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <LayoutGrid className="w-3 h-3" />
                        ແບບກາດ
                      </button>
                      <button
                        onClick={() => setForgetViewMode("table")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold font-sans transition-all flex items-center gap-1 ${
                          forgetViewMode === "table"
                            ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <Table2 className="w-3 h-3" />
                        ແບບຕາຕະລາງ
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {forgetRows.length === 0 ? (
                <div className="text-center py-10">
                  <span className="text-3xl">🎉</span>
                  <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-sans mt-2">
                    ບໍ່ມີພະນັກງານລືມລົງເວລາ!
                  </h4>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    ພະນັກງານທຸກຄົນລົງເວລາເຂົ້າ-ອອກວຽກຄົບຖ້ວນໃນໄລຍະເວລານີ້.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {forgetViewMode === "table" ? (
                    <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                      <table className="w-full text-xs text-left text-slate-500 dark:text-slate-400">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] uppercase font-bold">
                          <tr>
                            <th className="p-3 text-center w-12">
                              <input
                                type="checkbox"
                                checked={
                                  selectedForgetIds.length ===
                                    forgetRows.flatMap((r) => r.details).length &&
                                  selectedForgetIds.length > 0
                                }
                                onChange={(e) => {
                                  const allKeys = forgetRows.flatMap((row) =>
                                    row.details.map((d) => `${row.employee.id}-${d.date}-${d.type}`)
                                  );
                                  if (e.target.checked) {
                                    setSelectedForgetIds(allKeys);
                                  } else {
                                    setSelectedForgetIds([]);
                                  }
                                }}
                                className="w-3.5 h-3.5 accent-red-500 rounded"
                              />
                            </th>
                            <th className="p-3">ພະນັກງານ (Employee)</th>
                            <th className="p-3 text-center">ລະຫັດພະນັກງານ</th>
                            <th className="p-3">ຕຳແໜ່ງ (Position)</th>
                            <th className="p-3 text-center">ວັນທີຜິດພາດ (Date)</th>
                            <th className="p-3 text-center">ປະເພດຄວາມຜິດພາດ (Fault)</th>
                            <th className="p-3 text-center">ຈັດການ (Action)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {forgetRows.flatMap((row) =>
                            row.details.map((d) => {
                              const key = `${row.employee.id}-${d.date}-${d.type}`;
                              const isChecked = selectedForgetIds.includes(key);
                              return (
                                <tr
                                  key={key}
                                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                                    isChecked ? "bg-red-50/30 dark:bg-red-950/10" : ""
                                  }`}
                                >
                                  <td className="p-3 text-center">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleToggleForgetSelect(key)}
                                      className="w-3.5 h-3.5 accent-red-500 rounded cursor-pointer"
                                    />
                                  </td>
                                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">
                                    <div className="flex items-center gap-2">
                                      <img
                                        src={row.employee.avatar}
                                        alt="avatar"
                                        className="w-6 h-6 rounded-lg object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                      <span>
                                        {row.employee.firstName} {row.employee.lastName}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-3 text-center font-mono font-bold text-slate-600 dark:text-slate-400">
                                    {row.employee.employeeCode}
                                  </td>
                                  <td className="p-3 text-slate-600 dark:text-slate-400">
                                    {row.employee.position}
                                  </td>
                                  <td className="p-3 text-center font-mono text-slate-700 dark:text-slate-300">
                                    {formatLaoDateFriendly(d.date)}
                                  </td>
                                  <td className="p-3 text-center">
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                        d.type === "In"
                                          ? "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30"
                                          : "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30"
                                      }`}
                                    >
                                      {d.type === "In" ? "ລືມ Check-In" : "ລືມ Check-Out"}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => {
                                        if (confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້? (ລາຍການທີ່ລຶບແລ້ວຈະບໍ່ຖືກດຶງກັບຄືນມາອີກ)")) {
                                          handleDeleteForgotKeys([key]);
                                          alert("ລຶບລາຍການສຳເລັດ!");
                                        }
                                      }}
                                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                                      title="ລຶບລາຍການນີ້"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {forgetRows.map((row) => (
                        <div
                          key={row.employee.id}
                          className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/50 rounded-2xl p-4 space-y-3"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={row.employee.avatar}
                              alt="avatar"
                              className="w-10 h-10 rounded-xl object-cover ring-2 ring-red-500/20"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 font-sans">
                                {row.employee.firstName} {row.employee.lastName}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-sans">
                                ລະຫັດ: {row.employee.employeeCode} |{" "}
                                {row.employee.position}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-white dark:bg-slate-900 rounded-xl p-2 border border-red-100 dark:border-red-950/50">
                              <span className="block text-[9px] text-slate-400 font-sans">
                                ລືມ Check-In
                              </span>
                              <span className="font-mono text-base font-extrabold text-red-500 dark:text-red-400">
                                {row.forgotInCount}
                              </span>
                              <span className="text-[10px] text-slate-400 font-sans block">
                                ຄັ້ງ
                              </span>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-xl p-2 border border-red-100 dark:border-red-950/50">
                              <span className="block text-[9px] text-slate-400 font-sans">
                                ລືມ Check-Out
                              </span>
                              <span className="font-mono text-base font-extrabold text-red-500 dark:text-red-400">
                                {row.forgotOutCount}
                              </span>
                              <span className="text-[10px] text-slate-400 font-sans block">
                                ຄັ້ງ
                              </span>
                            </div>
                          </div>

                          <div className="text-red-600 dark:text-red-400 text-[10px] font-bold font-sans flex items-center justify-between border-t border-red-100/50 dark:border-red-900/30 pt-2">
                            <span>ລວມຄວາມຜິດພາດ:</span>
                            <span className="bg-red-500 text-white px-2 py-0.5 rounded-full font-mono font-black">
                              {row.totalForgot} ຄັ້ງ
                            </span>
                          </div>

                          {/* Detailed list of dates */}
                          <div>
                            <span className="block text-[9px] text-slate-400 font-sans uppercase font-bold mb-1">
                              ລາຍລະອຽດວັນທີ:
                            </span>
                            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                              {row.details.map((d, idx) => {
                                const key = `${row.employee.id}-${d.date}-${d.type}`;
                                const isChecked = selectedForgetIds.includes(key);
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => handleToggleForgetSelect(key)}
                                    title={
                                      d.editedAt
                                        ? `ແກ້ໄຂຂໍ້ມູນເມື່ອ: ${d.editedAt}`
                                        : "ກົດເພື່ອເລືອກ"
                                    }
                                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-1 transition-all border ${
                                      isChecked
                                        ? "bg-red-600 border-red-600 text-white shadow-sm scale-95"
                                        : d.editedAt
                                          ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50 hover:bg-amber-200"
                                          : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 hover:bg-red-200"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      readOnly
                                      className="w-2 h-2 accent-red-600 pointer-events-none rounded"
                                    />
                                    {formatLaoDateFriendly(d.date)} ({d.type}){d.editedAt && " ✍️"}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Summary aggregate chart description */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                    ℹ️ <strong>ວິທີການວິເຄາະ:</strong>{" "}
                    ລະບົບຄຳນວນຄວາມຜິດພາດໂດຍອັດຕະໂນມັດ ໂດຍກວດສອບຈາກ: (1)
                    ລາຍການທີ່ມີເວລາ Check Out ແຕ່{" "}
                    <strong>ບໍ່ມີເວລາ Check In</strong> (ລືມ Check In) ແລະ (2)
                    ລາຍການທີ່ມີເວລາ Check In ແຕ່{" "}
                    <strong>ບໍ່ມີເວລາ Check Out</strong> ໃນວັນທີ່ຜ່ານມາ (ລືມ
                    Check Out). ຂໍ້ມູນທັງໝົດຈະຖືກສະແດງເປັນ{" "}
                    <span className="text-red-500 dark:text-red-400 font-bold">
                      ສີແດງ
                    </span>{" "}
                    ເພື່ອໃຫ້ HR ຕິດຕາມ ແລະ ຕັກເຕືອນພະນັກງານໄດ້ທັນທີ.
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: Manage Employees */}
        {activeTab === "employees" && (
          <motion.div
            id="tab-employees-content"
            key="employees-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Create/Edit form */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 h-fit space-y-4">
              <h3
                id="employee-form-title"
                className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-sans pb-3 border-b border-slate-50 dark:border-slate-800"
              >
                {editingEmployee ? (
                  <>
                    <Edit className="w-4 h-4 text-amber-500" />{" "}
                    ແກ້ໄຂຂໍ້ມູນພະນັກງານ
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-teal-500" />{" "}
                    ເພີ່ມພະນັກງານໃໝ່
                  </>
                )}
              </h3>

              <form onSubmit={handleCreateEmployee} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                    ລະຫັດພະນັກງານ (Employee Code): *
                  </label>
                  <input
                    id="new-emp-code"
                    type="text"
                    value={newEmployee.employeeCode}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        employeeCode: e.target.value,
                      })
                    }
                    placeholder="ຕົວຢ່າງ: EMP006"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono font-bold uppercase"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                      ຊື່ (First Name): *
                    </label>
                    <input
                      id="new-emp-firstname"
                      type="text"
                      value={newEmployee.firstName}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          firstName: e.target.value,
                        })
                      }
                      placeholder="ສົມຈິດ"
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                      ນາມສະກຸນ (Last Name): *
                    </label>
                    <input
                      id="new-emp-lastname"
                      type="text"
                      value={newEmployee.lastName}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          lastName: e.target.value,
                        })
                      }
                      placeholder="ໄຊຍະວົງ"
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                    ຕຳແໜ່ງ (Position): *
                  </label>
                  <input
                    id="new-emp-position"
                    type="text"
                    value={newEmployee.position}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        position: e.target.value,
                      })
                    }
                    placeholder="ຕົວຢ່າງ: ພະນັກງານການຕະຫຼາດ"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                    ເບີໂທລະສັບ (Phone Number):
                  </label>
                  <input
                    id="new-emp-phone"
                    type="text"
                    value={newEmployee.phone}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, phone: e.target.value })
                    }
                    placeholder="ຕົວຢ່າງ: 020 55XXXXXX"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 font-sans">
                    ຮູບພາບໂປຣໄຟລ໌ (Profile Photo):
                  </label>

                  <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="relative group w-16 h-16 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0 border border-slate-300 dark:border-slate-700 shadow-sm flex items-center justify-center">
                      {newEmployee.avatar ? (
                        <img
                          src={newEmployee.avatar}
                          alt="preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Image className="w-6 h-6 text-slate-400" />
                      )}
                      {newEmployee.avatar && (
                        <button
                          type="button"
                          onClick={() =>
                            setNewEmployee((prev) => ({ ...prev, avatar: "" }))
                          }
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity cursor-pointer"
                        >
                          ລົບຮູບ
                        </button>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-black py-2 px-3 rounded-xl cursor-pointer shadow-sm transition-all inline-flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          ເລືອກຮູບຈາກເຄື່ອງ
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEmployeeAvatarFileChange}
                            className="hidden"
                          />
                        </label>
                        {newEmployee.avatar && (
                          <button
                            type="button"
                            onClick={() =>
                              setNewEmployee((prev) => ({
                                ...prev,
                                avatar: "",
                              }))
                            }
                            className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[11px] font-bold py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900/40 transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            ລົບຮູບ
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans">
                        ຮອງຮັບຮູບພາບ JPEG, PNG (ຂະໜາດບໍ່ເກີນ 2MB)
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
                      ຫຼື ໃສ່ URL ຮູບພາບ (ຫຼື ປ່ອຍຫວ່າງໄວ້)
                    </span>
                    <input
                      id="new-emp-avatar"
                      type="text"
                      value={
                        newEmployee.avatar.startsWith("data:")
                          ? ""
                          : newEmployee.avatar
                      }
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          avatar: e.target.value,
                        })
                      }
                      placeholder="https://example.com/photo.jpg"
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans"
                    />
                  </div>
                </div>

                {editingEmployee ? (
                  <div className="flex gap-2">
                    <button
                      id="submit-edit-emp-btn"
                      type="submit"
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs font-sans cursor-pointer shadow-sm shadow-amber-500/10"
                    >
                      <Check className="w-4 h-4" />
                      บันทຶກການແກ້ໄຂ
                    </button>
                    <button
                      id="cancel-edit-emp-btn"
                      type="button"
                      onClick={handleCancelEditEmployee}
                      className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs font-sans cursor-pointer border border-slate-200 dark:border-slate-700/50"
                    >
                      ຍົກເລີກ
                    </button>
                  </div>
                ) : (
                  <button
                    id="submit-new-emp-btn"
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs font-sans cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    ເພີ່ມພະນັກງານເຂົ້າຖານຂໍ້ມູນ
                  </button>
                )}
              </form>
            </div>

            {/* List & Delete column */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-sans">
                ລາຍຊື່ພະນັກງານທັງໝົດໃນລະບົບ ({employees.length} ຄົນ)
              </h3>

              {/* Bulk Selection Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={employees.length > 0 && selectedEmpIds.length === employees.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEmpIds(employees.map(emp => emp.id));
                      } else {
                        setSelectedEmpIds([]);
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">
                    ເລືອກທັງໝົດ ({selectedEmpIds.length}/{employees.length})
                  </span>
                </div>
                {selectedEmpIds.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບພະນັກງານທີ່ເລືອກທັງໝົດ ${selectedEmpIds.length} ຄົນ? (ຂໍ້ມູນການລົງເວລາທັງໝົດຂອງພະນັກງານເຫຼົ່ານີ້ຈະຖືກລຶບໄປນຳ)`)) {
                        onBulkDeleteEmployees(selectedEmpIds);
                        setSelectedEmpIds([]);
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-sans text-xs font-bold py-1.5 px-3.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    ລຶບພະນັກງານທີ່ເລືອກ ({selectedEmpIds.length})
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {employees.map((emp) => {
                  const isSelected = selectedEmpIds.includes(emp.id);
                  return (
                    <div
                      key={emp.id}
                      className={`flex justify-between items-center p-3.5 rounded-2xl border transition-all ${
                        isSelected 
                          ? "bg-red-50/20 dark:bg-red-950/10 border-red-200 dark:border-red-900/50" 
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setSelectedEmpIds(prev => prev.filter(id => id !== emp.id));
                            } else {
                              setSelectedEmpIds(prev => [...prev, emp.id]);
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-red-500 focus:ring-red-400 cursor-pointer"
                        />
                        <img
                          src={
                            emp.avatar ||
                            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
                          }
                          alt="avatar"
                          className="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-200/50"
                          referrerPolicy="no-referrer"
                        />
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 font-sans">
                          {emp.firstName} {emp.lastName}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                          ລະຫັດ:{" "}
                          <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                            {emp.employeeCode}
                          </span>{" "}
                          | {emp.position}
                        </p>
                        {emp.phone && (
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                            {emp.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        id={`qr-emp-${emp.id}`}
                        onClick={() => setSelectedEmployeeForQr(emp)}
                        className="text-teal-600 hover:text-white border border-teal-100 dark:border-teal-950/40 hover:bg-teal-600 p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                        title="ເບິ່ງ QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`edit-emp-${emp.id}`}
                        onClick={() => handleStartEditEmployee(emp)}
                        className="text-amber-500 hover:text-white border border-amber-100 dark:border-amber-950/40 hover:bg-amber-500 p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                        title="ແກ້ໄຂຂໍ້ມູນ"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`delete-emp-${emp.id}`}
                        onClick={() =>
                          handleDeleteEmployee(
                            emp.id,
                            `${emp.firstName} ${emp.lastName}`,
                          )
                        }
                        className="text-red-500 hover:text-white border border-red-100 dark:border-red-950 hover:bg-red-500 dark:hover:bg-red-600 p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                        title="ລຶບພະນັກງານ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: Application Settings & Logo Upload */}
        {activeTab === "settings" && (
          <motion.div
            id="tab-settings-content"
            key="settings-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 max-w-2xl mx-auto space-y-6"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-sans pb-3 border-b border-slate-50 dark:border-slate-800 mb-2">
                <Sliders className="w-4 h-4 text-teal-500" /> ປັບແຕ່ງ ແລະ ປ່ຽນໂລໂກ້ແອັບພລິເຄຊັນ (Customize App Logo)
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                HR ສາມາດປ່ຽນໂລໂກ້ຂອງບໍລິສັດເພື່ອໃຫ້ສະແດງຢູ່ໃນໜ້າຫຼັກ ແລະ ແຖບເມນູດ້ານເທິງຂອງແອັບໄດ້ທັນທີ.
              </p>
            </div>

            {/* Logo Preview box */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed flex flex-col sm:flex-row items-center gap-6 justify-center">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border flex items-center justify-center">
                {customLogo ? (
                  customLogo.startsWith("<svg") ? (
                    <div
                      className="w-16 h-16 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: customLogo }}
                    />
                  ) : (
                    <img
                      src={customLogo}
                      alt="Logo"
                      className="w-16 h-16 object-contain rounded-xl"
                    />
                  )
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center text-slate-300">
                    <Image className="w-12 h-12" />
                  </div>
                )}
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded font-bold uppercase">
                  Active App Logo
                </span>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-sans mt-1">
                  ຕົວຢ່າງໂລໂກ້ທີ່ສະແດງໃນລະບົບ
                </h4>
                <p className="text-xs text-slate-400 font-sans">
                  ຮອງຮັບທັງໄຟລ໌ຮູບພາບ URL (PNG, JPG) ແລະ ໂຄ້ດຮູບພາບ SVG.
                </p>
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-4">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setLogoInputType("preset")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold font-sans transition-all ${
                    logoInputType === "preset"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-800"
                  }`}
                >
                  ເລືອກໂລໂກ້ຕົວຢ່າງ
                </button>
                <button
                  type="button"
                  onClick={() => setLogoInputType("url")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold font-sans transition-all ${
                    logoInputType === "url"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-800"
                  }`}
                >
                  ໃສ່ URL ໂລໂກ້ຂອງທ່ານเอง
                </button>
              </div>

              {logoInputType === "preset" ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {logoPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handleUpdateLogo(preset.url)}
                      className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 rounded-2xl text-left space-y-2 transition-all flex flex-col items-center justify-center text-center hover:shadow-sm"
                    >
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans">
                        {preset.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans block">
                        ຄລິກເພື່ອໃຊ້ງານ
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                      ປ້ອນ URL ຮູບພາບໂລໂກ້ (Image URL):
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="logo-url-input"
                        type="text"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="ຕົວຢ່າງ: https://example.com/logo.png"
                        className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans"
                      />
                      <button
                        onClick={() => {
                          if (logoUrl.trim()) {
                            handleUpdateLogo(logoUrl.trim());
                          } else {
                            alert("ກະລຸນາປ້ອນ URL ໂລໂກ້ກ່ອນ!");
                          }
                        }}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 rounded-xl font-bold font-sans text-xs transition-all"
                      >
                        ນຳໃຊ້
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-teal-50/50 dark:bg-slate-800/50 rounded-xl text-[11px] text-teal-700 dark:text-teal-300 font-sans">
                    💡 <strong>ຄຳແນະນຳ:</strong> ທ່ານສາມາດຄັດລອກລິ້ງຮູບພາບຈາກເວັບໄຊອົງກອນຂອງທ່ານ ຫຼື ໃຊ້ເວັບຝາກຮູບ ແລ້ວເອົາລິ້ງມາປ້ອນໃສ່ບ່ອນນີ້ ເພື່ອສະແດງຜົນ.
                  </div>
                </div>
              )}
            </div>

            {/* QR Code Scanning & Time Settings Block */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-sans pb-3 border-b border-slate-50 dark:border-slate-800 mb-2">
                  <QrCode className="w-4 h-4 text-teal-500" /> ຕັ້ງຄ່າລະບົບສະແກນ QR CODE ແລະ ການກຳນົດເວລາ (QR Scan & Time Settings)
                </h3>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  HR ສາມາດ ປິດ/ເປີດ ລະບົບສະແກນ QR Code ທັງໝົດ ແລະ ກຳນົດເວລາໃນການສະແກນເຂົ້າ-ອອກວຽກຂອງພະນັກງານໄດ້.
                </p>
              </div>

              {notifSettingsSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold border border-emerald-100 dark:border-emerald-900 font-sans">
                  {notifSettingsSuccessMsg}
                </div>
              )}

              <form onSubmit={handleSaveNotificationSettings} className="space-y-4">
                <div className="space-y-3">
                  {/* 1. Global QR Code System Toggle */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="space-y-0.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans block">
                        ປິດ/ເປີດ ລະບົບ SCAN QR CODE ທັງໝົດ (Enable QR Code System)
                      </label>
                      <span className="text-[10px] text-slate-400 font-sans block">
                        ຫາກປິດ, ພະນັກງານຈະບໍ່ສາມາດກົດສະແກນ QR Code ເຂົ້າ/ອອກວຽກໄດ້ໃນໜ້າ Portal.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={enableQrCodeSystem}
                        onChange={(e) => setEnableQrCodeSystem(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>

                  {/* 2. Enable QR Time Restrictions Toggle */}
                  <div className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    enableQrCodeSystem 
                      ? "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/50" 
                      : "bg-slate-100/50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-900/20 opacity-50 pointer-events-none"
                  }`}>
                    <div className="space-y-0.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans block">
                        ເປີດການຈຳກັດເວລາສະແກນ QR CODE (Enforce Scan Time Windows)
                      </label>
                      <span className="text-[10px] text-slate-400 font-sans block">
                        ກວດສອບວ່າການ Check-In ຕ້ອງຢູ່ພາຍໃນກຳນົດເວລາ ແລະ ປ້ອງກັນການ Check-Out ກ່ອນເວລາເລີກວຽກ.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={enableQrTimeRestriction}
                        onChange={(e) => setEnableQrTimeRestriction(e.target.checked)}
                        className="sr-only peer"
                        disabled={!enableQrCodeSystem}
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                </div>

                {/* 3. Deadlines Time Inputs */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-5 transition-all ${
                  enableQrCodeSystem 
                    ? "opacity-100" 
                    : "opacity-50 pointer-events-none"
                }`}>
                  {/* Check-In Window */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold text-teal-600 dark:text-teal-400 font-sans border-b border-teal-50 dark:border-slate-800/80 pb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
                      ກຳນົດເວລາ Check-In (Check-In Scan Window)
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                          ເລີ່ມສະແກນ (Start HH:MM):
                        </label>
                        <input
                          type="text"
                          placeholder="07:30"
                          value={checkInStart}
                          onChange={(e) => setCheckInStart(e.target.value)}
                          className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans font-mono"
                          disabled={!enableQrCodeSystem}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                          ສິ້ນສຸດ (Deadline HH:MM):
                        </label>
                        <input
                          type="text"
                          placeholder="08:30"
                          value={checkInDeadline}
                          onChange={(e) => setCheckInDeadline(e.target.value)}
                          className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans font-mono"
                          disabled={!enableQrCodeSystem}
                          required
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-sans block mt-1">
                      ຊ່ວງເວລາທີ່ພະນັກງານສາມາດ Check-In ໄດ້ (ຕົວຢ່າງ: 07:30 ຫາ 08:30)
                    </span>
                  </div>

                  {/* Check-Out Window */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 font-sans border-b border-amber-50 dark:border-slate-800/80 pb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                      ກຳນົດເວລາ Check-Out (Check-Out Scan Window)
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                          ເລີ່ມສະແກນ (Start HH:MM):
                        </label>
                        <input
                          type="text"
                          placeholder="15:40"
                          value={checkOutStart}
                          onChange={(e) => setCheckOutStart(e.target.value)}
                          className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans font-mono"
                          disabled={!enableQrCodeSystem}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                          ສິ້ນສຸດ (Deadline HH:MM):
                        </label>
                        <input
                          type="text"
                          placeholder="18:00"
                          value={checkOutDeadline}
                          onChange={(e) => setCheckOutDeadline(e.target.value)}
                          className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans font-mono"
                          disabled={!enableQrCodeSystem}
                          required
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-sans block mt-1">
                      ຊ່ວງເວລາທີ່ພະນັກງານສາມາດ Check-Out ໄດ້ (ຕົວຢ່າງ: 15:40 ຫາ 18:00)
                    </span>
                  </div>
                </div>

                {/* 4. GPS / Location Restriction Settings */}
                <div className="bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-sans flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-indigo-500 animate-pulse" />
                        ກຳນົດພື້ນທີ່ GPS ໃນການສະແກນ (GPS Geofencing Restrictions)
                      </h4>
                      <p className="text-[10px] text-slate-400 font-sans">
                        ເປີດ ຫຼື ປິດ ການກວດສອບພື້ນທີ່ສະແກນ QR code ຂອງພະນັກງານ ຢ່າງສົມບູນ.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={enableGpsRestriction}
                        onChange={(e) => setEnableGpsRestriction(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 transition-all ${
                    enableGpsRestriction ? "opacity-100" : "opacity-50 pointer-events-none"
                  }`}>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                        Latitude (ເສັ້ນຂະໜານ):
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="17.9638"
                        value={officeLat}
                        onChange={(e) => setOfficeLat(Number(e.target.value))}
                        className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans font-mono"
                        required={enableGpsRestriction}
                        disabled={!enableGpsRestriction}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                        Longitude (ເສັ້ນແວງ):
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="102.6132"
                        value={officeLng}
                        onChange={(e) => setOfficeLng(Number(e.target.value))}
                        className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans font-mono"
                        required={enableGpsRestriction}
                        disabled={!enableGpsRestriction}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                        Allowed Radius (ໄລຍະຫ່າງທີ່ອະນຸຍາດ - ແມັດ):
                      </label>
                      <input
                        type="number"
                        placeholder="200"
                        value={officeRadius}
                        onChange={(e) => setOfficeRadius(Number(e.target.value))}
                        className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans font-mono"
                        required={enableGpsRestriction}
                        disabled={!enableGpsRestriction}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-sans block mt-1">
                    ຕົວຢ່າງພື້ນທີ່: ຫ້ອງການຫຼັກ (Lat: 17.9638, Lng: 102.6132) ພາຍໃນລັດສະໝີ 200 ແມັດ. ຫາກພະນັກງານຢູ່ນອກເຂດນີ້ ຈະບໍ່ສາມາດສະແກນ QR ໄດ້.
                  </span>
                </div>

                {/* 5. Lao Mobile Carrier / Wi-Fi Restriction Settings */}
                <div className="bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-teal-600 dark:text-teal-400 font-sans flex items-center gap-1.5">
                        <Wifi className="w-4 h-4 text-teal-500 animate-pulse" />
                        ຈຳກັດເຄືອຂ່າຍອິນເຕີເນັດໃນລາວ (Lao Networks Restriction Only)
                      </h4>
                      <p className="text-[10px] text-slate-400 font-sans">
                        ອະນຸຍາດໃຫ້ໝາຍວັນງານ (Check-In/Out) ສະເພາະຜູ້ທີ່ເຊື່ອມຕໍ່ຜ່ານອິນເຕີເນັດມືຖື ຫຼື Wi-Fi ຂອງຜູ້ໃຫ້ບໍລິການໃນລາວ ເທົ່ານັ້ນ (LTC, Unitel, TPlus).
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={enableNetworkRestriction}
                        onChange={(e) => setEnableNetworkRestriction(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                  <div className="bg-teal-50/40 dark:bg-teal-950/10 p-3 rounded-xl border border-teal-100/50 dark:border-teal-900/20">
                    <p className="text-[10px] text-teal-700 dark:text-teal-400 leading-relaxed font-sans">
                      💡 <strong>ໝາຍເຫດ:</strong> ລະບົບຈະກວດສອບ IP ຂອງຜູ້ໃຊ້ໂດຍອັດຕະໂນມັດເພື່ອຢືນຢັນເຄືອຂ່າຍ (Lao Telecom, Star Telecom / Unitel, TPlus / Beeline). ຫາກມີການໃຊ້ VPN ຫຼື ເຄືອຂ່າຍຕ່າງປະເທດ ຈະບໍ່ໄດ້ຮັບອະນຸຍາດໃຫ້ Check-In/Out. (ສຳລັບເຄື່ອງທົດສອບໃນ localhost ຫຼື Sandbox ລະບົບຈະຈຳລອງເຄືອຂ່າຍໃຫ້ຜ່ານອັດຕະໂນມັດເພື່ອຄວາມສະດວກ).
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center pt-2">
                  <button
                    type="button"
                    onClick={handleTriggerChecksManually}
                    disabled={isTriggeringChecks}
                    className="text-xs text-teal-600 hover:text-white border border-teal-200 dark:border-teal-900 hover:bg-teal-600 font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    title="Run auto-forgetfulness check"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTriggeringChecks ? "animate-spin" : ""}`} />
                    {isTriggeringChecks ? "ກຳລັງກວດສອບ..." : "ກວດສອບພະນັກງານລືມ Check-in/out ທັນທີ"}
                  </button>

                  <button
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-5 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer font-sans"
                  >
                    <Save className="w-4 h-4" />
                    ບັນທຶກການຕັ້ງຄ່າລະບົບ QR
                  </button>
                </div>
              </form>

              {manualCheckResult && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 space-y-1">
                  <p className="font-bold text-teal-600 dark:text-teal-400">📊 ຜົນການກວດສອບ:</p>
                  {manualCheckResult.success ? (
                    <p>✓ ສຳເລັດ! ພົບພະນັກງານລືມ ແລະ ສ້າງການແຈ້ງເຕືອນ: {manualCheckResult.sentTo?.length || 0} ຄົນ</p>
                  ) : (
                    <p>ℹ️ ຂ້າມການກວດສອບ: {manualCheckResult.reason || "ບໍ່ມີການປ່ຽນແປງ"}</p>
                  )}
                </div>
              )}
            </div>

            {/* HR Login Credentials config block */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-sans pb-3 border-b border-slate-50 dark:border-slate-800 mb-2">
                  <Lock className="w-4 h-4 text-teal-500" /> ປ່ຽນຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານຂອງ HR (Change HR Credentials)
                </h3>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  ທ່ານສາມາດກຳນົດ Username ແລະ Password ໃໝ່ສຳລັບການເຂົ້າສູ່ລະບົບ HR Admin ໄດ້ຢູ່ບ່ອນນີ້.
                </p>
              </div>

              {credentialsSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold border border-emerald-100 dark:border-emerald-900 font-sans">
                  {credentialsSuccessMsg}
                </div>
              )}

              <form onSubmit={handleSaveCredentials} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-sans">
                      ຊື່ຜູ້ໃຊ້ໃໝ່ (New Username):
                    </label>
                    <input
                      type="text"
                      value={newUsernameInput}
                      onChange={(e) => setNewUsernameInput(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-sans">
                      ລະຫັດຜ່ານໃໝ່ (New Password):
                    </label>
                    <input
                      type="text"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-5 rounded-2xl transition-all shadow-sm flex items-center gap-2 cursor-pointer font-sans"
                  >
                    <Save className="w-4 h-4" />
                    // @ts-ignore
                    ບັນທຶກຂໍ້ມູນໃໝ່
                  </button>
                </div>
              </form>
            </div>

            {/* Database & Data Management Block */}
            {onClearAllAttendance && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 font-sans pb-3 border-b border-slate-50 dark:border-slate-800 mb-2">
                    <Trash2 className="w-4 h-4 text-rose-500" /> ຈັດການຂໍ້ມູນ ແລະ ລຶບລ້າງປະຫວັດ (Data Cleanup & Reset)
                  </h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    ທ່ານສາມາດລຶບລ້າງຂໍ້ມູນການລົງເວລາທັງໝົດໃນລະບົບ (ລວມທັງຂໍ້ມູນໃນຮູບພາບ/ປະຫວັດເກົ່າ) ເພື່ອເລີ່ມຕົ້ນລະບົບໃໝ່ໄດ້ຢູ່ບ່ອນນີ້.
                  </p>
                </div>

                <div className="bg-rose-50/50 dark:bg-rose-950/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-950/30 space-y-3">
                  <p className="text-xs text-rose-700 dark:text-rose-300 font-sans">
                    ⚠️ <strong>ຄຳເຕືອນ:</strong> ການລຶບລ້າງຂໍ້ມູນການລົງເວລາຈະບໍ່ສາມາດກູ້ຄືນໄດ້ອີກ. ກະລຸນາກວດສອບໃຫ້ແນ່ໃຈກ່ອນດຳເນີນການ.
                  </p>
                  
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນການລົງເວລາທັງໝົດໃນລະບົບ?")) {
                          onClearAllAttendance();
                          alert("ລຶບລ້າງຂໍ້ມູນການລົງເວລາທັງໝົດສຳເລັດແລ້ວ!");
                        }
                      }}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-5 rounded-2xl text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer font-sans"
                    >
                      <Trash2 className="w-4 h-4" />
                      ລຶບລ້າງຂໍ້ມູນການລົງເວລາທັງໝົດ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "shifts" && (
          <motion.div
            id="tab-shifts-content"
            key="shifts-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Shift Assignment Form */}
              <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-sans pb-3 border-b border-slate-50 dark:border-slate-800 mb-2">
                    <Clock className="w-4 h-4 text-amber-500" /> {editingShiftId ? "ແກ້ໄຂກະການເຮັດວຽກ (Edit Shift)" : "ມອບໝາຍກະການເຮັດວຽກ (Assign Shift)"}
                  </h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    {editingShiftId 
                      ? "ທ່ານສາມາດປ່ຽນແປງຂໍ້ມູນ ແລະ ເວລາປະຕິບັດງານຂອງກະນີ້ໄດ້ຕາມຕ້ອງການ." 
                      : "ກະລຸນາເລືອກພະນັກງານ, ວັນທີ ແລະ ກະທີ່ຕ້ອງການມອບໝາຍ ເພື່ອໃຫ້ສະແດງໃນ Portal ຂອງເຂົາເຈົ້າ."}
                  </p>
                </div>

                <form onSubmit={handleAssignShiftSubmit} className="space-y-4">
                  {/* Employee Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-sans">
                      ເລືອກພະນັກງານ (Employee): *
                    </label>
                    <select
                      id="shift-emp-select"
                      value={shiftEmployeeId}
                      onChange={(e) => setShiftEmployeeId(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                      required
                      disabled={!!editingShiftId}
                    >
                      <option value="">-- ເລືອກພະນັກງານ --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          [{emp.employeeCode}] {emp.firstName} {emp.lastName} ({emp.position})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-sans">
                      ວັນທີ (Date): *
                    </label>
                    <input
                      id="shift-date-input"
                      type="date"
                      value={shiftDate}
                      onChange={(e) => setShiftDate(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                      required
                    />
                  </div>

                  {/* Shift Type Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 font-sans">
                      ປະເພດກະ (Shift Type): *
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { type: 'morning' as ShiftType, label: '☀️ ກະຕອນເຊົ້າ (Morning)' },
                        { type: 'afternoon' as ShiftType, label: '🌤️ ກະຕອນແລງ (Afternoon)' },
                        { type: 'full_day' as ShiftType, label: '📅 ກະໝົດມື້ (Full Day Shift)' },
                      ].map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => handleShiftTypeChange(item.type)}
                          className={`w-full text-left p-3 rounded-xl border text-xs font-sans transition-all flex items-center justify-between ${
                            shiftType === item.type
                              ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 font-bold"
                              : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          <span>{item.label}</span>
                          {shiftType === item.type && <span className="w-2 h-2 bg-amber-500 rounded-full"></span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Shift Times */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                        ເລີ່ມຕົ້ນ (Start Time): *
                      </label>
                      <input
                        id="shift-start-time"
                        type="time"
                        value={shiftStartTime}
                        onChange={(e) => setShiftStartTime(e.target.value)}
                        className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                        required
                      />
                    </div>
                     <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                        ສິ້ນສຸດ (End Time): *
                      </label>
                      <input
                        id="shift-end-time"
                        type="time"
                        value={shiftEndTime}
                        onChange={(e) => setShiftEndTime(e.target.value)}
                        className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                        required
                      />
                    </div>
                  </div>

                  {/* Notes Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-sans">
                      ໝາຍເຫດ (Notes/Remarks):
                    </label>
                    <textarea
                      id="shift-notes-input"
                      rows={2}
                      value={shiftNotes}
                      onChange={(e) => setShiftNotes(e.target.value)}
                      placeholder="ເຊັ່ນ: ປະຈຳການດ່ວນ, ປ່ຽນແທນ..."
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1">
                    {editingShiftId && (
                      <button
                        id="cancel-edit-shift-btn"
                        type="button"
                        onClick={handleCancelEditShift}
                        className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-xl font-bold text-xs font-sans transition-all cursor-pointer text-center"
                      >
                        ຍົກເລີກ
                      </button>
                    )}
                    <button
                      id="assign-shift-btn"
                      type="submit"
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-600/10 text-xs font-sans cursor-pointer"
                    >
                      {editingShiftId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {editingShiftId ? "ບັນທຶກການແກ້ໄຂ" : "ມອບໝາຍກະ"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Active Shift Assignments List */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-sans pb-3 border-b border-slate-50 dark:border-slate-800">
                    <CalendarDays className="w-4 h-4 text-amber-500" /> ລາຍການມອບໝາຍກະທັງໝົດ (All Shift Assignments)
                  </h3>
                </div>

                {shifts.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <Clock className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-xs text-slate-400 font-sans">
                      ບໍ່ທັນມີຂໍ້ມູນການມອບໝາຍກະການເຮັດວຽກໃນລະບົບ.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] font-bold uppercase font-sans">
                          <th className="py-3 px-2">ພະນັກງານ (Employee)</th>
                          <th className="py-3 px-2">ວັນທີ (Date)</th>
                          <th className="py-3 px-2">ປະເພດກະ (Shift)</th>
                          <th className="py-3 px-2">ເວລາປະຕິບັດງານ (Hours)</th>
                          <th className="py-3 px-2">ໝາຍເຫດ (Notes)</th>
                          <th className="py-3 px-2 text-right">ຈັດການ (Action)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {shifts.slice().sort((a,b) => b.date.localeCompare(a.date)).map((sh) => {
                          const emp = employees.find((e) => e.id === sh.employeeId);
                          return (
                            <tr key={sh.id} className="text-slate-600 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="py-3 px-2 flex items-center gap-2">
                                <img
                                  src={emp?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                                  alt="Avatar"
                                  className="w-6 h-6 rounded-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="font-sans font-medium text-slate-800 dark:text-slate-100">
                                  {emp ? `${emp.firstName} ${emp.lastName}` : "Unknown Employee"}
                                </span>
                              </td>
                              <td className="py-3 px-2 font-mono font-medium">{sh.date}</td>
                              <td className="py-3 px-2 font-sans">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  sh.shiftType === 'morning'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                                    : sh.shiftType === 'afternoon'
                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400'
                                    : 'bg-teal-100 text-teal-800 dark:bg-teal-950/30 dark:text-teal-400'
                                }`}>
                                  {sh.shiftType === 'morning' ? '☀️ ກະຕອນເຊົ້າ' : sh.shiftType === 'afternoon' ? '🌤️ ກະຕອນແລງ' : '📅 ກະໝົດມື້'}
                                </span>
                              </td>
                              <td className="py-3 px-2 font-mono text-slate-500">
                                {sh.startTime || (sh.shiftType === 'morning' ? '08:30' : sh.shiftType === 'afternoon' ? '13:00' : '08:30')} - {sh.endTime || (sh.shiftType === 'morning' ? '12:00' : sh.shiftType === 'afternoon' ? '17:00' : '17:00')}
                              </td>
                              <td className="py-3 px-2 font-sans text-slate-500 italic max-w-[150px] truncate" title={sh.notes}>
                                {sh.notes || '-'}
                              </td>
                              <td className="py-3 px-2 text-right space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditShift(sh)}
                                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-all cursor-pointer inline-flex items-center"
                                  title="Edit assignment"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບການມອບໝາຍກະນີ້?")) {
                                      if (onDeleteShift) onDeleteShift(sh.id);
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-all cursor-pointer inline-flex items-center"
                                  title="Delete assignment"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "weekend_duty" && (
          <motion.div
            id="tab-weekend-duty-content"
            key="weekend-duty-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Top Cards for Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans block">
                    ລາຍການປະຈຳການ ວັນເສົາ-ອາທິດ ທັງໝົດ (Weekend Duty)
                  </span>
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono mt-1 block">
                    {attendance.filter(rec => rec.status.startsWith("ປະຈຳການ")).length}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <CalendarDays className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans block">
                    ໃບລາພັກທີ່ລໍຖ້າອະນຸມັດ (Pending Leave Requests)
                  </span>
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono mt-1 block">
                    {attendance.filter(rec => rec.status === "ລາພັກ" && rec.leaveDetails?.status !== "approved" && rec.leaveDetails?.status !== "rejected").length}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Main Sections Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* Left Column: Weekend Duty Assignments List */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-sans">
                    <Calendar className="w-4 h-4 text-indigo-500" /> ຂໍ້ມູນການປະຈຳການ ວັນເສົາ-ອາທິດ
                  </h3>
                </div>

                {attendance.filter(rec => rec.status.startsWith("ປະຈຳການ")).length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <CalendarDays className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-xs text-slate-400 font-sans">ບໍ່ທັນມີຂໍ້ມູນການປະຈຳການໃນວັນເສົາ-ອາທິດ.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {attendance
                      .filter(rec => rec.status.startsWith("ປະຈຳການ"))
                      .slice()
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((rec) => {
                        const emp = employees.find(e => e.id === rec.employeeId);
                        return (
                          <div
                            key={rec.id}
                            className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 transition-all space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <img
                                  src={emp?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"}
                                  alt="avatar"
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 font-sans">
                                    {emp ? `${emp.firstName} ${emp.lastName}` : "ບໍ່ພົບພະນັກງານ"}
                                  </h4>
                                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                    ລະຫັດ: {emp?.employeeCode || "N/A"} | ຕຳແໜ່ງ: {emp?.position || "N/A"}
                                  </span>
                                  {emp?.phone && (
                                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-sans block mt-0.5">
                                      📞 {emp.phone}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="bg-teal-50 text-teal-700 dark:bg-teal-950/20 dark:text-teal-300 px-2.5 py-0.5 rounded-full text-[9px] font-bold block font-sans whitespace-nowrap">
                                  {rec.status}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500 block mt-1 font-semibold">
                                  {formatLaoDate(rec.date)}
                                </span>
                              </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 font-sans space-y-2">
                              {rec.dutyMonth && (
                                <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                                  📅 ເດືອນປະຈຳການ: <span className="text-slate-700 dark:text-slate-300">{rec.dutyMonth}</span>
                                </p>
                              )}
                              {rec.dutyContent && (
                                <p className="italic leading-relaxed">
                                  📝 ເນື້ອໃນ: <span className="text-slate-800 dark:text-slate-200 not-italic font-medium">{rec.dutyContent}</span>
                                </p>
                              )}
                              <div className="flex gap-4 pt-1 border-t border-slate-50 dark:border-slate-800 text-[10px] font-mono text-slate-400">
                                <span>In: <span className="text-slate-700 dark:text-slate-300 font-semibold">{rec.checkIn || "N/A"}</span></span>
                                <span>Out: <span className="text-slate-700 dark:text-slate-300 font-semibold">{rec.checkOut || "N/A"}</span></span>
                                {rec.hoursWorked !== null && (
                                  <span>Hours: <span className="text-slate-700 dark:text-slate-300 font-semibold">{rec.hoursWorked} h</span></span>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => handleStartEditAttendance(rec)}
                                className="flex items-center gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-slate-800 px-2.5 py-1 rounded-lg transition-all font-sans font-bold cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                ແກ້ໄຂ
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນການປະຈຳການນີ້?")) {
                                    if (onDeleteAttendance) onDeleteAttendance(rec.id);
                                  }
                                }}
                                className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-slate-800 px-2.5 py-1 rounded-lg transition-all font-sans font-bold cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                ລຶບ
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Right Column: Leave Approvals List */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-sans">
                    <ShieldCheck className="w-4 h-4 text-purple-500" /> ລາຍການຂໍອະນຸມັດການລາພັກ
                  </h3>
                </div>

                {attendance.filter(rec => rec.status === "ລາພັກ").length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-xs text-slate-400 font-sans">ບໍ່ທັນມີຂໍ້ມູນຄຳຮ້ອງຂໍລາພັກ.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {attendance
                      .filter(rec => rec.status === "ລາພັກ")
                      .slice()
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((rec) => {
                        const emp = employees.find(e => e.id === rec.employeeId);
                        const isPending = rec.leaveDetails?.status !== "approved" && rec.leaveDetails?.status !== "rejected";
                        const isApproved = rec.leaveDetails?.status === 'approved';
                        const isRejected = rec.leaveDetails?.status === 'rejected';
                        const dur = rec.leaveDetails?.startDate && rec.leaveDetails?.endDate
                          ? calculateLeaveDuration(rec.leaveDetails.startDate, rec.leaveDetails.endDate)
                          : 1;

                        return (
                          <div
                            key={rec.id}
                            className={`p-4 rounded-2xl border transition-all space-y-3 ${
                              isApproved
                                ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30'
                                : isRejected
                                ? 'bg-rose-50/50 border-rose-100 dark:bg-rose-950/10 dark:border-rose-900/30'
                                : 'bg-slate-50 border-slate-100 dark:bg-slate-950/40 dark:border-slate-800'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <img
                                  src={emp?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"}
                                  alt="avatar"
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 font-sans">
                                    {emp ? `${emp.firstName} ${emp.lastName}` : "ບໍ່ພົບພະນັກງານ"}
                                  </h4>
                                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                    ລະຫັດ: {emp?.employeeCode || "N/A"} | ຕຳແໜ່ງ: {emp?.position || "N/A"}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold block font-sans whitespace-nowrap ${
                                  isApproved
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                                    : isRejected
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                                }`}>
                                  {isApproved ? '✓ ເຫັນດີ' : isRejected ? '✗ ບໍ່ເຫັນດີ' : '⏱ ລໍຖ້າອະນຸມັດ'}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500 block mt-1 font-semibold">
                                  {formatLaoDate(rec.date)}
                                </span>
                              </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 font-sans space-y-2">
                              <p className="font-semibold text-purple-600 dark:text-purple-400">
                                🏖️ ປະເພດ: <span className="text-slate-700 dark:text-slate-300">{rec.leaveDetails?.type || "ລາພັກປະຈຳປີ"}</span>
                              </p>
                              <p className="font-semibold">
                                📅 ໄລຍະເວລາ: <span className="text-slate-700 dark:text-slate-300 font-mono">{formatLaoDate(rec.leaveDetails?.startDate)} ຫາ {formatLaoDate(rec.leaveDetails?.endDate)} ({dur} ວັນ)</span>
                              </p>
                              {rec.leaveDetails?.details && (
                                <p className="italic leading-relaxed">
                                  📝 ເຫດຜົນ: <span className="text-slate-800 dark:text-slate-200 not-italic font-medium">{rec.leaveDetails.details}</span>
                                </p>
                              )}
                            </div>

                            {isPending && (
                              <div className="flex justify-end gap-2 text-xs pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateLeaveStatus(rec, 'approved')}
                                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-all font-sans font-bold cursor-pointer shadow-sm"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  ອະນຸມັດ
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateLeaveStatus(rec, 'rejected')}
                                  className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg transition-all font-sans font-bold cursor-pointer shadow-sm"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  ປະຕິເສດ
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "leave_management" && (
          <motion.div
            id="tab-leave-management-content"
            key="leave-management-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans block">
                    ພະນັກງານທັງໝົດ (Total Employees)
                  </span>
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono mt-1 block">
                    {employees.length}
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans block">
                    ລາພັກປະຈຳປີທັງໝົດ (Annual Leaves Taken)
                  </span>
                  <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1 block">
                    {attendance.filter(rec => rec.status === "ລາພັກ" && rec.leaveDetails?.type === "ລາພັກປະຈຳປີ" && rec.leaveDetails?.status === "approved").length}
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <ClipboardList className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans block">
                    ລາພັກເຈັບໄຂ້ທັງໝົດ (Sick Leaves Taken)
                  </span>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1 block">
                    {attendance.filter(rec => rec.status === "ລາພັກ" && rec.leaveDetails?.type === "ລາພັກເຈັບໄຂ້" && rec.leaveDetails?.status === "approved").length}
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans block">
                    ລໍຖ້າການອະນຸມັດ (Pending Leave Requests)
                  </span>
                  <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1 block">
                    {attendance.filter(rec => rec.status === "ລາພັກ" && rec.leaveDetails?.status !== "approved" && rec.leaveDetails?.status !== "rejected").length}
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Leave Management Main Content */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-sans">
                    <ClipboardList className="w-4 h-4 text-purple-500" /> ສະຫຼຸບ ແລະ ຈັດການວັນລາພັກຂອງພະນັກງານ
                  </h3>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">ຈັດການໂກຕາວັນລາພັກປະຈຳປີ ແລະ ບັນທຶກການລາພັກຂອງພະນັກງານແຕ່ລະຄົນ.</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-xs font-sans text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/40 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <th className="py-4 px-4">ພະນັກງານ</th>
                      <th className="py-4 px-4">ໂກຕາວັນພັກປະຈຳປີ</th>
                      <th className="py-4 px-4 text-center">ວັນພັກທີ່ໃຊ້ໄປ</th>
                      <th className="py-4 px-4 text-center">ວັນພັກປະຈຳປີຄົງເຫຼືອ</th>
                      <th className="py-4 px-4 text-right">... ຈັດການ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                    {employees.map((emp) => {
                      const isExpanded = expandedEmpLeavesId === emp.id;
                      const empLeaves = attendance.filter(rec => rec.employeeId === emp.id && rec.status === "ລາພັກ");
                      const quota = emp.totalLeaveQuota !== undefined ? emp.totalLeaveQuota : 15;
                      const annualQuota = quota;
                      const sickQuota = emp.sickLeaveQuota !== undefined ? emp.sickLeaveQuota : 30;
                      const maternityQuota = emp.maternityLeaveQuota !== undefined ? emp.maternityLeaveQuota : 90;
                      const personalQuota = emp.personalLeaveQuota !== undefined ? emp.personalLeaveQuota : 7;

                      const annualTaken = getEmployeeLeaveDaysTakenByType(emp.id, 'ລາພັກປະຈຳປີ');
                      const sickTaken = getEmployeeLeaveDaysTakenByType(emp.id, 'ລາພັກເຈັບໄຂ້');
                      const personalTaken = getEmployeeLeaveDaysTakenByType(emp.id, 'ລາພັກຈຳເປັນ');
                      const compensatoryTaken = getEmployeeLeaveDaysTakenByType(emp.id, 'ລາພັກທົດແທນ');
                      const maternityTaken = getEmployeeLeaveDaysTakenByType(emp.id, 'ລາພັກເກີດລູກ');

                      const taken = annualTaken + sickTaken + personalTaken + compensatoryTaken + maternityTaken;
                      const remaining = quota - annualTaken;

                      return (
                        <React.Fragment key={emp.id}>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all">
                            <td className="py-4 px-4 font-sans">
                              <div className="flex items-center gap-3">
                                <img
                                  src={emp.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"}
                                  alt="avatar"
                                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <p className="font-bold text-slate-800 dark:text-slate-100">{emp.firstName} {emp.lastName}</p>
                                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">ລະຫັດ: {emp.employeeCode} | {emp.position}</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4 font-sans">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{quota}</span>
                                <span className="text-[10px] text-slate-400 font-sans">ວັນ</span>
                                <button
                                  id={`btn-edit-quota-${emp.id}`}
                                  onClick={() => {
                                    setEditingQuotaEmpId(emp.id);
                                    setQuotaValue(quota);
                                    setQuotaValueSick(sickQuota);
                                    setQuotaValueMaternity(maternityQuota);
                                    setQuotaValuePersonal(personalQuota);
                                  }}
                                  className="text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                                  title="ແກ້ໄຂໂກຕາວັນພັກ"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                              </div>
                            </td>

                            <td className="py-4 px-4 font-sans text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className="font-mono font-extrabold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                                  {taken} <span className="text-[10px] font-medium text-slate-400">ວັນ</span>
                                </span>
                                <div className="flex gap-1.5 mt-1 text-[9px] text-slate-400 whitespace-nowrap">
                                  <span title="ປະຈຳປີ (Annual)" className="text-purple-600 dark:text-purple-400">ປີ: {annualTaken}</span>
                                  <span title="ເຈັບໄຂ້ (Sick)" className="text-amber-600 dark:text-amber-400">ໄຂ້: {sickTaken}</span>
                                  <span title="ຈຳເປັນ (Personal)" className="text-blue-600 dark:text-blue-400">ຈຳເປັນ: {personalTaken}</span>
                                  <span title="ເກີດລູກ (Maternity)" className="text-rose-600 dark:text-rose-400">ເກີດລູກ: {maternityTaken}</span>
                                  <span title="ທົດແທນ (Compensatory)" className="text-teal-600 dark:text-teal-400">ທົດແທນ: {compensatoryTaken}</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4 font-sans text-center">
                              <span className={`font-mono font-black text-xs px-2.5 py-1 rounded-full ${
                                remaining <= 2
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                                  : remaining <= 5
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                              }`}>
                                {remaining} ວັນ
                              </span>
                            </td>

                            <td className="py-4 px-4 text-right space-x-1.5">
                              <button
                                id={`btn-record-leave-${emp.id}`}
                                onClick={() => {
                                  setAddingLeaveEmpId(emp.id);
                                  setManualLeaveType('ລາພັກປະຈຳປີ');
                                  setManualLeaveStart(new Date().toISOString().split('T')[0]);
                                  setManualLeaveEnd(new Date().toISOString().split('T')[0]);
                                  setManualLeaveReason('');
                                }}
                                className="inline-flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 dark:hover:bg-purple-900/40 px-3 py-1.5 rounded-xl font-bold text-[10px] font-sans transition-all cursor-pointer border border-purple-100 dark:border-purple-900/30"
                              >
                                <Plus className="w-3 h-3" />
                                ບັນທຶກລາພັກ
                              </button>

                              <button
                                id={`btn-toggle-expanded-${emp.id}`}
                                onClick={() => setExpandedEmpLeavesId(isExpanded ? null : emp.id)}
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-[10px] font-sans transition-all cursor-pointer ${
                                  isExpanded
                                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100'
                                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800'
                                }`}
                              >
                                <ClipboardList className="w-3 h-3" />
                                {isExpanded ? 'ປິດປະຫວັດ' : `ປະຫວັດ (${empLeaves.length})`}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Detail Row for Leave Records */}
                          {isExpanded && (
                            <tr className="bg-slate-50/40 dark:bg-slate-950/10">
                              <td colSpan={5} className="p-4">
                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 space-y-3">
                                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-sans pb-2 border-b border-slate-50 dark:border-slate-800">
                                    <ClipboardList className="w-3.5 h-3.5 text-purple-500" /> ປະຫວັດການລາທັງໝົດຂອງພະນັກງານ
                                  </h4>

                                  {empLeaves.length === 0 ? (
                                    <p className="text-xs text-slate-400 font-sans py-4 text-center">ບໍ່ມີປະຫວັດການລາພັກໃນລະບົບ.</p>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left border-collapse">
                                        <thead>
                                          <tr className="text-[10px] font-bold text-slate-400 border-b border-slate-50 dark:border-slate-800 uppercase tracking-wider">
                                            <th className="py-2 px-3">ປະເພດ</th>
                                            <th className="py-2 px-3">ໄລຍະເວລາ</th>
                                            <th className="py-2 px-3 text-center">ຈຳນວນວັນ</th>
                                            <th className="py-2 px-3">ເຫດຜົນ / ລາຍລະອຽດ</th>
                                            <th className="py-2 px-3 text-center">ສະຖານະ</th>
                                            <th className="py-2 px-3 text-right">ການຈັດການ</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                                          {empLeaves
                                            .slice()
                                            .sort((a, b) => b.date.localeCompare(a.date))
                                            .map((rec) => {
                                              const dur = rec.leaveDetails?.startDate && rec.leaveDetails?.endDate
                                                ? calculateLeaveDuration(rec.leaveDetails.startDate, rec.leaveDetails.endDate)
                                                : 1;
                                              const isApproved = rec.leaveDetails?.status === 'approved';
                                              const isRejected = rec.leaveDetails?.status === 'rejected';

                                              return (
                                                <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                                                  <td className="py-2.5 px-3 font-semibold text-purple-600 dark:text-purple-400">
                                                    {rec.leaveDetails?.type || 'ລາພັກປະຈຳປີ'}
                                                  </td>
                                                  <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300 font-sans">
                                                    {formatLaoDate(rec.leaveDetails?.startDate)} ຫາ {formatLaoDate(rec.leaveDetails?.endDate)}
                                                  </td>
                                                  <td className="py-2.5 px-3 text-center font-bold font-mono">
                                                    {dur} ວັນ
                                                  </td>
                                                  <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={rec.leaveDetails?.details}>
                                                    {rec.leaveDetails?.details || '-'}
                                                  </td>
                                                  <td className="py-2.5 px-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold inline-block ${
                                                      isApproved
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                        : isRejected
                                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
                                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                                                    }`}>
                                                      {isApproved ? '✓ ເຫັນດີ' : isRejected ? '✗ ບໍ່ເຫັນດີ' : '⏱ ລໍຖ້າອະນຸມັດ'}
                                                    </span>
                                                  </td>
                                                  <td className="py-2.5 px-3 text-right">
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        if (confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບໃບສະເໜີລາພັກນີ້? ລະບົບຈະຄືນວັນພັກໃຫ້ພະນັກງານທັນທີ.")) {
                                                          onDeleteAttendance(rec.id);
                                                        }
                                                      }}
                                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-slate-800 p-1 rounded-lg transition-all cursor-pointer inline-flex items-center"
                                                      title="ລຶບບັນທຶກ"
                                                    >
                                                      <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Manual Leave Request Form Modal */}
            {addingLeaveEmpId && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-100 dark:border-slate-800 space-y-4"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-sans flex items-center gap-2">
                      <Plus className="w-4 h-4 text-purple-600" /> ບັນທຶກຂໍ້ມູນການລາພັກ (Record Leave)
                    </h3>
                    <button
                      onClick={() => setAddingLeaveEmpId(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 font-sans text-xs">
                    <div>
                      <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1">ພະນັກງານ:</p>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                        <img
                          src={employees.find(e => e.id === addingLeaveEmpId)?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"}
                          alt="avatar"
                          className="w-8 h-8 rounded-lg object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {employees.find(e => e.id === addingLeaveEmpId)?.firstName} {employees.find(e => e.id === addingLeaveEmpId)?.lastName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            ລະຫັດ: {employees.find(e => e.id === addingLeaveEmpId)?.employeeCode}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">ປະເພດການລາພັກ:</label>
                      <select
                        value={manualLeaveType}
                        onChange={(e) => setManualLeaveType(e.target.value as LeaveType)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                      >
                        <option value="ລາພັກປະຈຳປີ">ລາພັກປະຈຳປີ (Annual Leave)</option>
                        <option value="ລາພັກເຈັບໄຂ້">ລາພັກເຈັບໄຂ້ (Sick Leave)</option>
                        <option value="ລາພັກເກີດລູກ">ລາພັກເກີດລູກ (Maternity Leave)</option>
                        <option value="ລາພັກຈຳເປັນ">ລາພັກຈຳເປັນ (Personal Leave)</option>
                        <option value="ລາພັກທົດແທນ">ລາພັກທົດແທນ (Compensatory Leave)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">ວັນທີເລີ່ມຕົ້ນ:</label>
                        <input
                          type="date"
                          value={manualLeaveStart}
                          onChange={(e) => setManualLeaveStart(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">ວັນທີສິ້ນສຸດ:</label>
                        <input
                          type="date"
                          value={manualLeaveEnd}
                          onChange={(e) => setManualLeaveEnd(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono cursor-pointer"
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-right font-mono text-purple-600 dark:text-purple-400 font-bold">
                      ລວມຈຳນວນ: {calculateLeaveDuration(manualLeaveStart, manualLeaveEnd)} ວັນພັກ
                    </p>

                    <div>
                      <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">ເຫດຜົນ / ລາຍລະອຽດການລາ:</label>
                      <textarea
                        value={manualLeaveReason}
                        onChange={(e) => setManualLeaveReason(e.target.value)}
                        placeholder="ກະລຸນາລະບຸເຫດຜົນໃນການລາພັກ..."
                        rows={3}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-50 dark:border-slate-800/60 justify-end">
                    <button
                      type="button"
                      onClick={() => setAddingLeaveEmpId(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-all font-sans text-xs cursor-pointer"
                    >
                      ຍົກເລີກ
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveManualLeave}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md font-sans text-xs cursor-pointer"
                    >
                      ບັນທຶກການລາ
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Edit Quotas Modal */}
            {editingQuotaEmpId && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-100 dark:border-slate-800 space-y-4"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-sans flex items-center gap-2">
                      <Edit className="w-4 h-4 text-teal-600" /> ແກ້ໄຂໂກຕາວັນພັກ (Edit Leave Quotas)
                    </h3>
                    <button
                      onClick={() => setEditingQuotaEmpId(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 font-sans text-xs">
                    <div>
                      <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1">ພະນັກງານ:</p>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                        <img
                          src={employees.find(e => e.id === editingQuotaEmpId)?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"}
                          alt="avatar"
                          className="w-8 h-8 rounded-lg object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {employees.find(e => e.id === editingQuotaEmpId)?.firstName} {employees.find(e => e.id === editingQuotaEmpId)?.lastName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            ລະຫັດ: {employees.find(e => e.id === editingQuotaEmpId)?.employeeCode}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">🏖️ ໂກຕາລາພັກປະຈຳປີ (ວັນ):</label>
                        <input
                          type="number"
                          min="0"
                          value={quotaValue}
                          onChange={(e) => setQuotaValue(parseInt(e.target.value, 10) || 0)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">🤒 ໂກຕາລາພັກເຈັບໄຂ້ (ວັນ):</label>
                        <input
                          type="number"
                          min="0"
                          value={quotaValueSick}
                          onChange={(e) => setQuotaValueSick(parseInt(e.target.value, 10) || 0)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">🍼 ໂກຕາລາພັກເກີດລູກ (ວັນ):</label>
                        <input
                          type="number"
                          min="0"
                          value={quotaValueMaternity}
                          onChange={(e) => setQuotaValueMaternity(parseInt(e.target.value, 10) || 0)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">📝 ໂກຕາລາພັກຈຳເປັນ (ວັນ):</label>
                        <input
                          type="number"
                          min="0"
                          value={quotaValuePersonal}
                          onChange={(e) => setQuotaValuePersonal(parseInt(e.target.value, 10) || 0)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100/30 dark:border-indigo-900/40">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-bold text-indigo-800 dark:text-indigo-300">🔁 ໂກຕາລາພັກທົດແທນ:</p>
                          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5 leading-relaxed">
                            ມີທັງໝົດ <span className="font-bold font-mono text-xs">{editingQuotaEmpId ? getEmployeeCompensatoryQuota(editingQuotaEmpId) : 0} ວັນ</span>.
                            ໂກຕານີ້ຄຳນວນອັດຕະໂນມັດຈາກການປະຈຳການວັນເສົາ-ອາທິດ ຂອງພະນັກງານ (ໄດ້ 1-2 ວັນຕໍ່ຄັ້ງ).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-50 dark:border-slate-800/60 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingQuotaEmpId(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-all font-sans text-xs cursor-pointer"
                    >
                      ຍົກເລີກ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveQuota(editingQuotaEmpId!, quotaValue, quotaValueSick, quotaValueMaternity, quotaValuePersonal)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-md font-sans text-xs cursor-pointer"
                    >
                      ... ບັນທຶກໂກຕາ
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}





        {activeTab === "guides" && (
          <motion.div
            id="tab-guides-content"
            key="guides-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 font-sans flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-rose-600" /> ຄູ່ມືການຕິດຕັ້ງລະບົບ ແລະ ແກ້ໄຂບັນຫາ (Troubleshooting & Guides)
                </h2>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  ສູນລວມຄູ່ມືລະອຽດ, ວິທີແກ້ໄຂບັນຫາການເປີດລິ້ງບໍ່ໄດ້, ບັນຫາເຄືອຂ່າຍ Wi-Fi, ແລະ ວິທີເປີດໃຊ້ກ້ອງຖ່າຍຮູບ/ຕຳແໜ່ງ GPS ສຳລັບລະບົບ iOS (iPhone) ແລະ ບຣາວເຊີຕ່າງໆ.
                </p>
              </div>

              <BrowserPermissionsGuide />
            </div>
          </motion.div>
        )}

        {selectedEmployeeForQr && (
          <motion.div
            id="qr-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              id="qr-modal-card"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-100 dark:border-slate-800 shadow-xl space-y-5 text-center relative"
            >
              <button
                id="close-qr-modal"
                onClick={() => setSelectedEmployeeForQr(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-full transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1 pt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 text-[10px] font-extrabold rounded-full border border-teal-100 dark:border-teal-900/50 uppercase">
                  Employee QR Code
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-sans">
                  {selectedEmployeeForQr.firstName}{" "}
                  {selectedEmployeeForQr.lastName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                  ຕຳແໜ່ງ: {selectedEmployeeForQr.position}
                </p>
              </div>

              {/* QR Image Frame */}
              <div className="p-4 bg-teal-50/20 dark:bg-slate-950/30 rounded-2xl border border-dashed border-teal-200 dark:border-teal-900/40 flex flex-col items-center justify-center gap-3">
                <img
                  id="qr-code-img"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(selectedEmployeeForQr.employeeCode)}`}
                  alt="QR Code"
                  className="w-48 h-48 bg-white p-2 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <span className="text-sm font-mono font-black text-teal-700 dark:text-teal-400 tracking-wider bg-teal-50/50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-teal-100 dark:border-teal-900/50">
                  {selectedEmployeeForQr.employeeCode}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                ພະນັກງານສາມາດສະແກນ QR Code ນີ້ຜ່ານກ້ອງເວັບແຄມໃນໜ້າຈໍຂອງພະນັກງານ
                ເພື່ອທຳການ Check-In / Check-Out ໄດ້ທັນທີ.
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  id="print-qr-btn"
                  type="button"
                  onClick={() => handlePrintQr(selectedEmployeeForQr)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold font-sans text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  ພິມ QR Code
                </button>
                <a
                  id="download-qr-btn"
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(selectedEmployeeForQr.employeeCode)}`}
                  target="_blank"
                  download={`QR-${selectedEmployeeForQr.employeeCode}.png`}
                  rel="noreferrer"
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold font-sans text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all border border-slate-200 dark:border-slate-700/50 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  ເປີດໄຟລ໌ PNG
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
