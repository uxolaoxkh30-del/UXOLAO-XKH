import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogIn, LogOut, Clock, Briefcase, FileText, MapPin, 
  UserCheck, AlertTriangle, Calendar, ClipboardList, CheckCircle2, Phone,
  QrCode, Camera, X, CheckCircle, Loader2
} from 'lucide-react';
import { Employee, AttendanceRecord, WorkStatus, LeaveType, SystemNotification, ShiftAssignment } from '../types';
import { calculateHours, formatHours, formatLaoDate, checkLaoNetwork } from '../data';
import { triggerNativeNotification } from './NotificationBanner';
import { Html5Qrcode } from 'html5-qrcode';

// Helper function to calculate distance in meters using Haversine formula
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Radius of the earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

// Wrapper for navigator.geolocation
const getGPSCoordinates = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("ບຣາວເຊີຂອງທ່ານບໍ່ຮອງຮັບການລະບຸຕຳແໜ່ງ GPS."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => {
        let msg = "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ GPS ຂອງທ່ານ.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "ກະລຸນາອະນຸຍາດໃຫ້ເຂົ້າເຖິງ GPS (Location) ໃນບຣາວເຊີຂອງທ່ານ ເພື່ອທຳການສະແກນເຂົ້າ-ອອກວຽກ.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "ບໍ່ສາມາດລະບຸຕຳແໜ່ງ GPS ຂອງທ່ານໄດ້ໃນຂະນະນີ້. ກະລຸນາເປີດ GPS ໃນໂທລະສັບຂອງທ່ານ.";
        } else if (error.code === error.TIMEOUT) {
          msg = "ການເຊື່ອມຕໍ່ GPS ໝົດເວລາ. ກະລຸນາລອງໃໝ່.";
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

interface EmployeeDashboardProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  shifts?: ShiftAssignment[];
  onAddAttendance: (record: AttendanceRecord) => void;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onTriggerNotification: (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => void;
  enableQrTimeRestriction?: boolean;
  enableQrCodeSystem?: boolean;
  checkInStart?: string;
  checkInDeadline?: string;
  checkOutStart?: string;
  checkOutDeadline?: string;
  enableGpsRestriction?: boolean;
  enableNetworkRestriction?: boolean;
  officeLat?: number;
  officeLng?: number;
  officeRadius?: number;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  employees,
  attendance,
  shifts = [],
  onAddAttendance,
  onUpdateAttendance,
  onTriggerNotification,
  enableQrTimeRestriction = true,
  enableQrCodeSystem = true,
  checkInStart = "07:30",
  checkInDeadline = "08:30",
  checkOutStart = "15:40",
  checkOutDeadline = "18:00",
  enableGpsRestriction = false,
  enableNetworkRestriction = false,
  officeLat = 17.9638,
  officeLng = 102.6132,
  officeRadius = 200,
}) => {
  // Active Employee selection (persisted)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(() => {
    const saved = localStorage.getItem('active_employee_id');
    if (saved) return saved;
    return '';
  });

  // Auto-select the first employee if none is selected to allow immediate entry without manual step
  useEffect(() => {
    if (!selectedEmployeeId && employees.length > 0) {
      setSelectedEmployeeId(employees[0].id);
    }
  }, [employees, selectedEmployeeId]);

  const activeEmployee = employees.find(e => e.id === selectedEmployeeId);

  // Status for Check-in
  const [statusType, setStatusType] = useState<WorkStatus>('ເຂົ້າວຽກປົກກະຕິ');

  // Lao months for duty registration
  const LAO_MONTHS = [
    'ມັງກອນ (January)',
    'ກຸມພາ (February)',
    'ມີນາ (March)',
    'ເມສາ (April)',
    'ພຶດສະພາ (May)',
    'ມິຖຸນາ (June)',
    'ກໍລະກົດ (July)',
    'ສິງຫາ (August)',
    'ກັນຍາ (September)',
    'ຕຸລາ (October)',
    'ພະຈິກ (November)',
    'ທັນວາ (December)'
  ];

  const [dutyMonth, setDutyMonth] = useState<string>(() => {
    return LAO_MONTHS[new Date().getMonth()];
  });
  const [dutyContent, setDutyContent] = useState<string>('');
  
  // Trip details (if Out-of-office)
  const [tripDetails, setTripDetails] = useState({
    details: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Leave Details
  const [leaveType, setLeaveType] = useState<LeaveType>('ລາພັກປະຈຳປີ');
  const [leaveDetailsText, setLeaveDetailsText] = useState('');
  const [leaveDates, setLeaveDates] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Current Live Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // QR Code Scanner states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [qrScanError, setQrScanError] = useState<string | null>(null);
  const [scannedEmployee, setScannedEmployee] = useState<Employee | null>(null);
  const [scannedAction, setScannedAction] = useState<'check_in' | 'check_out' | 'already_done' | null>(null);
  const [scannedTime, setScannedTime] = useState<string | null>(null);
  const [isGpsChecking, setIsGpsChecking] = useState(false);


  const qrReaderRef = useRef<Html5Qrcode | null>(null);

  // Stop camera if scanner is closed
  useEffect(() => {
    return () => {
      if (qrReaderRef.current && qrReaderRef.current.isScanning) {
        qrReaderRef.current.stop().catch(err => console.error("Unmount clean error", err));
      }
    };
  }, []);

  // Auto-close scanner modal after successful scan
  useEffect(() => {
    if (scannedEmployee) {
      const timer = setTimeout(() => {
        setScannedEmployee(null);
        setScannedAction(null);
        setScannedTime(null);
        setIsScannerOpen(false);
      }, 5000); // 5 seconds
      return () => clearTimeout(timer);
    }
  }, [scannedEmployee]);

  const handleQrDecoded = async (decodedText: string) => {
    const code = decodedText.trim();
    if (!code) return;

    const emp = employees.find(e => e.employeeCode.toUpperCase() === code.toUpperCase());
    if (!emp) {
      setQrScanError(`ບໍ່ພົບພະນັກງານທີ່ມີລະຫັດ "${code}" ໃນລະບົບ!`);
      return;
    }

    // GPS/Geofencing Check - always try to get coordinates so we can save them if employee is outside
    let userLat: number | null = null;
    let userLng: number | null = null;
    let distance: number | null = null;
    let isOutside = false;

    setQrScanError("ກຳລັງກວດສອບພື້ນທີ່ GPS ຂອງທ່ານ...");
    try {
      const position = await getGPSCoordinates();
      userLat = position.coords.latitude;
      userLng = position.coords.longitude;
      distance = getDistanceInMeters(userLat, userLng, officeLat, officeLng);
      if (distance > officeRadius) {
        isOutside = true;
      }
      setQrScanError(null);

      if (enableGpsRestriction && isOutside) {
        setQrScanError(`ທ່ານຢູ່ນອກເຂດບໍລິເວນທີ່ກຳນົດ! ໄລຍະຫ່າງຂອງທ່ານ: ${Math.round(distance)} ແມັດ (ອະນຸຍາດບໍ່ເກີນ ${officeRadius} ແມັດ).`);
        return;
      }
    } catch (err: any) {
      if (enableGpsRestriction) {
        setQrScanError(err.message || "ບໍ່ສາມາດກວດສອບພື້ນທີ່ GPS ໄດ້.");
        return;
      }
      console.warn("GPS lookup failed in QR scanner, but continuing since restriction is disabled.", err);
      setQrScanError(null);
    }

    // Lao Network check if enabled (automatically bypasses if verified physically within GPS office radius)
    const isWithinGpsOffice = distance !== null && distance <= officeRadius;
    if (enableNetworkRestriction && !isWithinGpsOffice) {
      setQrScanError("ກຳລັງກວດສອບເຄືອຂ່າຍອິນເຕີເນັດຂອງທ່ານ...");
      try {
        const netInfo = await checkLaoNetwork();
        if (!netInfo.isLaoNetwork) {
          setQrScanError(`ບໍ່ສາມາດໝາຍວັນງານໄດ້: ເຄືອຂ່າຍອິນເຕີເນັດຂອງທ່ານຄື "${netInfo.ispName}" (${netInfo.countryCode}). ລະບົບອະນຸຍາດໃຫ້ Check-In/Out ສະເພາະເຄືອຂ່າຍມືຖື ຫຼື Wi-Fi ໃນລາວ ເທົ່ານັ້ນ (LTC, Unitel, TPlus).`);
          return;
        }
      } catch (err) {
        setQrScanError("ບໍ່ສາມາດກວດສອບເຄືອຂ່າຍອິນເຕີເນັດໄດ້. ກະລຸນາກວດສອບການເຊື່ອມຕໍ່ຂອງທ່ານ.");
        return;
      }
      setQrScanError(null);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecord = attendance.find(r => r.employeeId === emp.id && r.date === todayStr);

    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMin;

    const [inStartHour, inStartMin] = (checkInStart || "07:30").split(':').map(Number);
    const checkInStartMinutes = inStartHour * 60 + inStartMin;

    const [inHour, inMin] = (checkInDeadline || "08:30").split(':').map(Number);
    const checkInEndMinutes = inHour * 60 + inMin;

    const [outStartHour, outStartMin] = (checkOutStart || "15:40").split(':').map(Number);
    const checkOutStartMinutes = outStartHour * 60 + outStartMin;

    const [outHour, outMin] = (checkOutDeadline || "18:00").split(':').map(Number);
    const checkOutEndMinutes = outHour * 60 + outMin;

    const isCheckInTime = currentTotalMinutes >= checkInStartMinutes && currentTotalMinutes <= checkInEndMinutes;
    const isCheckOutTime = currentTotalMinutes >= checkOutStartMinutes && currentTotalMinutes <= checkOutEndMinutes;

    const timeStr = now.toLocaleTimeString('lo-LA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const formatMinutes = (totalMins: number) => {
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    // If they have already completed check-in AND check-out for today, show info and stop camera
    if (todayRecord && todayRecord.checkIn && todayRecord.checkOut) {
      setScannedEmployee(emp);
      setScannedAction('already_done');
      setScannedTime(`${todayRecord.checkIn} (ອອກ: ${todayRecord.checkOut})`);
      stopCamera();
      return;
    }

    let action: 'check_in' | 'check_out' | null = null;

    if (enableQrTimeRestriction) {
      if (isCheckInTime) {
        action = 'check_in';
      } else if (isCheckOutTime) {
        action = 'check_out';
      } else {
        // If not in standard windows but already checked in, show check-in success info directly
        if (todayRecord && todayRecord.checkIn) {
          setScannedEmployee(emp);
          setScannedAction('already_done');
          setScannedTime(todayRecord.checkIn);
          stopCamera();
          return;
        }
        setQrScanError(`ບໍ່ຢູ່ໃນຊ່ວງເວລາສະແກນ! ເວລາ Check In: ${formatMinutes(checkInStartMinutes)} - ${formatMinutes(checkInEndMinutes)} ແລະ ເວລາ Check Out: ${formatMinutes(checkOutStartMinutes)} - ${formatMinutes(checkOutEndMinutes)}`);
        return;
      }
    } else {
      // Unrestricted mode
      if (!todayRecord || !todayRecord.checkIn) {
        action = 'check_in';
      } else if (!todayRecord.checkOut) {
        action = 'check_out';
      }
    }

    if (action === 'check_in') {
      if (todayRecord && todayRecord.checkIn) {
        setScannedEmployee(emp);
        setScannedAction('already_done');
        setScannedTime(todayRecord.checkIn);
        stopCamera();
        return;
      }

      // Auto Check In
      setScannedEmployee(emp);
      const newRecord: AttendanceRecord = {
        id: `att-${emp.id}-${Date.now()}`,
        employeeId: emp.id,
        date: todayStr,
        checkIn: timeStr,
        checkOut: null,
        status: 'ເຂົ້າວຽກປົກກະຕິ',
        hoursWorked: null,
        remarks: null,
        checkInLat: isOutside ? userLat : null,
        checkInLng: isOutside ? userLng : null,
        checkInDistance: isOutside ? distance : null,
        checkInOutside: isOutside,
      };
      onAddAttendance(newRecord);
      setScannedAction('check_in');
      setScannedTime(timeStr);
      stopCamera();

      onTriggerNotification({
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        type: 'check_in',
        message: `ໄດ້ເຮັດການ Check In (ເຂົ້າວຽກປົກກະຕິ) ຜ່ານການສະແກນ QR Code ເວລາ ${timeStr}${isOutside ? ' [ຢູ່ນອກສະຖານທີ່]' : ''}`,
      });

      triggerNativeNotification(
        'Check In ສຳເລັດ! (QR Code)',
        `${emp.firstName} ໄດ້ Check In ຜ່ານ QR Code ແລ້ວ ເວລາ ${timeStr}${isOutside ? ' (ຢູ່ນອກສະຖານທີ່)' : ''}`
      );
    } else if (action === 'check_out') {
      if (!todayRecord || !todayRecord.checkIn) {
        setQrScanError(`ບໍ່ສາມາດ Check Out ໄດ້ເນື່ອງຈາກຍັງບໍ່ໄດ້ Check In ເખົ້າວຽກ!`);
        return;
      }
      if (todayRecord.checkOut) {
        setScannedEmployee(emp);
        setScannedAction('already_done');
        setScannedTime(`${todayRecord.checkIn} (ອອກ: ${todayRecord.checkOut})`);
        stopCamera();
        return;
      }

      // Auto Check Out
      setScannedEmployee(emp);
      const hours = calculateHours(todayRecord.checkIn, timeStr);
      const updatedRecord: AttendanceRecord = {
        ...todayRecord,
        checkOut: timeStr,
        hoursWorked: hours,
        checkOutLat: isOutside ? userLat : null,
        checkOutLng: isOutside ? userLng : null,
        checkOutDistance: isOutside ? distance : null,
        checkOutOutside: isOutside,
      };
      onUpdateAttendance(updatedRecord);
      setScannedAction('check_out');
      setScannedTime(timeStr);
      stopCamera();

      onTriggerNotification({
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        type: 'check_out',
        message: `ໄດ້ເຮັດການ Check Out ຜ່ານການສະແກນ QR Code ເວລາ ${timeStr} (ລວມເວລາເຮັດວຽກ: ${formatHours(hours)})`,
      });

      triggerNativeNotification(
        'Check Out ສຳເລັດ! (QR Code)',
        `${emp.firstName} ໄດ້ Check Out ຜ່ານ QR Code ແລ້ວ ເວລາ ${timeStr}${isOutside ? ' (ຢູ່ນອກສະຖານທີ່)' : ''}`
      );
    }
  };

  const startCamera = async () => {
    try {
      setQrScanError(null);
      setScannedEmployee(null);
      setScannedAction(null);
      setScannedTime(null);
      
      setIsCameraActive(true);
      
      // Delay initialization slightly to let the div mount in the DOM
      setTimeout(async () => {
        try {
          const html5Qr = new Html5Qrcode("reader-container");
          qrReaderRef.current = html5Qr;
          
          await html5Qr.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: (width, height) => {
                const minDim = Math.min(width, height);
                const computed = Math.floor(minDim * 0.7);
                const size = Math.max(50, Math.min(computed, minDim));
                return { width: size, height: size };
              },
            },
            (decodedText) => {
              handleQrDecoded(decodedText);
            },
            (errorMessage) => {
              // Ignore failure scan ticks
            }
          );
        } catch (err: any) {
          console.error("Camera start inner error:", err);
          setQrScanError("ບໍ່ສາມາດເປີດກ້ອງຖ່າຍຮູບໄດ້! ກະລຸນາກວດສອບສິດການອະນຸຍາດ ຫຼື ລອງໃໝ່ອີກຄັ້ງ.");
          setIsCameraActive(false);
        }
      }, 300);

    } catch (err: any) {
      console.error(err);
      setQrScanError("ເກີດຂໍ້ຜິດພາດໃນການເປີດກ້ອງຖ່າຍຮູບ.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (qrReaderRef.current && qrReaderRef.current.isScanning) {
      try {
        await qrReaderRef.current.stop();
      } catch (err) {
        console.error("Failed to stop camera scanner", err);
      }
    }
    setIsCameraActive(false);
  };

  const closeScanner = async () => {
    await stopCamera();
    setIsScannerOpen(false);
    setQrScanError(null);
    setScannedEmployee(null);
    setScannedAction(null);
    setScannedTime(null);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Save selected employee
  useEffect(() => {
    if (selectedEmployeeId) {
      localStorage.setItem('active_employee_id', selectedEmployeeId);
    } else {
      localStorage.removeItem('active_employee_id');
    }
  }, [selectedEmployeeId]);

  // Request browser notification permission on load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Format date helper
  const formattedDate = (() => {
    const weekday = currentTime.toLocaleDateString('lo-LA', { weekday: 'long' });
    const day = String(currentTime.getDate()).padStart(2, '0');
    const month = String(currentTime.getMonth() + 1).padStart(2, '0');
    const year = currentTime.getFullYear();
    return `${weekday}, ${day}/${month}/${year}`;
  })();

  const formattedTime = currentTime.toLocaleTimeString('lo-LA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Check if active employee checked in today
  const todayStr = currentTime.toISOString().split('T')[0];
  const isWeekend = currentTime.getDay() === 0 || currentTime.getDay() === 6;
  const todayRecord = activeEmployee 
    ? attendance.find(r => r.employeeId === activeEmployee.id && r.date === todayStr)
    : undefined;

  const handleCheckIn = async () => {
    if (!activeEmployee) return;

    const isOutOfOffice = statusType.startsWith('ໄປວຽກນອກ');
    const isDuty = statusType.startsWith('ປະຈຳການ');

    if (isDuty && !dutyContent.trim()) {
      alert("ກະລຸນາປ້ອນເນື້ອໃນໃນການປະຈຳການທຸກຄັ້ງ!");
      return;
    }

    let lat: number | null = null;
    let lng: number | null = null;
    let distance: number | null = null;
    let isOutside = false;

    setIsGpsChecking(true);
    try {
      const position = await getGPSCoordinates();
      lat = position.coords.latitude;
      lng = position.coords.longitude;
      distance = getDistanceInMeters(lat, lng, officeLat, officeLng);
      if (distance > officeRadius) {
        isOutside = true;
      }

      if (enableGpsRestriction && isOutside && !isOutOfOffice) {
        alert(`ທ່ານຢູ່ນອກເຂດບໍລິເວນທີ່ກຳນົດ! ໄລຍະຫ່າງຂອງທ່ານ: ${Math.round(distance)} ແມັດ (ອະນຸຍາດບໍ່ເກີນ ${officeRadius} ແມັດ).`);
        setIsGpsChecking(false);
        return;
      }
    } catch (err: any) {
      if (enableGpsRestriction && !isOutOfOffice) {
        alert(err.message || "ບໍ່ສາມາດກວດສອບພື້ນທີ່ GPS ໄດ້. ກະລຸນາອະນຸຍາດໃຫ້ເຂົ້າເຖິງສະຖານທີ່ຂອງທ່ານ.");
        setIsGpsChecking(false);
        return;
      }
      console.warn("GPS lookup failed, continuing since restriction is disabled or is out of office", err);
    }

    // Lao Network check if enabled (automatically bypasses if verified physically within GPS office radius)
    const isWithinGpsOffice = distance !== null && distance <= officeRadius;
    if (enableNetworkRestriction && !isWithinGpsOffice) {
      try {
        const netInfo = await checkLaoNetwork();
        if (!netInfo.isLaoNetwork) {
          alert(`ບໍ່ສາມາດ Check-In ໄດ້: ເຄືອຂ່າຍອິນເຕີເນັດຂອງທ່ານຄື "${netInfo.ispName}" (${netInfo.countryCode}). ລະບົບອະນຸຍາດໃຫ້ Check-In ສະເພາະເຄືອຂ່າຍມືຖື ຫຼື Wi-Fi ໃນລາວ ເທົ່ານັ້ນ (LTC, Unitel, TPlus).`);
          setIsGpsChecking(false);
          return;
        }
      } catch (err) {
        alert("ບໍ່ສາມາດກວດສອບເຄືອຂ່າຍອິນເຕີເນັດໄດ້. ກະລຸນາກວດສອບການເຊື່ອມຕໍ່ຂອງທ່ານ.");
        setIsGpsChecking(false);
        return;
      }
    }

    setIsGpsChecking(false);

    const timeStr = new Date().toLocaleTimeString('lo-LA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const latToRecord = isOutside ? lat : null;
    const lngToRecord = isOutside ? lng : null;
    const distToRecord = isOutside ? distance : null;
    const outsideToRecord = isOutside;
    
    if (todayRecord) {
      const updatedRecord: AttendanceRecord = {
        ...todayRecord,
        checkIn: timeStr,
        status: statusType,
        tripDetails: isOutOfOffice ? {
          details: tripDetails.details || 'ໄປວຽກນອກຕາມມອບໝາຍ',
          startDate: tripDetails.startDate,
          endDate: tripDetails.endDate,
        } : undefined,
        dutyMonth: isDuty ? dutyMonth : undefined,
        dutyContent: isDuty ? dutyContent.trim() : undefined,
        remarks: null, // Clear "ລືມ Check In" warning as they are now checked in
        checkInLat: latToRecord,
        checkInLng: lngToRecord,
        checkInDistance: distToRecord,
        checkInOutside: outsideToRecord,
      };
      onUpdateAttendance(updatedRecord);
    } else {
      const newRecord: AttendanceRecord = {
        id: `att-${activeEmployee.id}-${Date.now()}`,
        employeeId: activeEmployee.id,
        date: todayStr,
        checkIn: timeStr,
        checkOut: null,
        status: statusType,
        tripDetails: isOutOfOffice ? {
          details: tripDetails.details || 'ໄປວຽກນອກຕາມມອບໝາຍ',
          startDate: tripDetails.startDate,
          endDate: tripDetails.endDate,
        } : undefined,
        dutyMonth: isDuty ? dutyMonth : undefined,
        dutyContent: isDuty ? dutyContent.trim() : undefined,
        hoursWorked: null,
        remarks: null,
        checkInLat: latToRecord,
        checkInLng: lngToRecord,
        checkInDistance: distToRecord,
        checkInOutside: outsideToRecord,
      };
      onAddAttendance(newRecord);
    }
    setDutyContent('');

    const message = `ໄດ້ເຮັດການ Check In (${statusType}) ເວລາ ${timeStr}${isOutside ? ' [ຢູ່ນອກສະຖານທີ່]' : ''}`;
    onTriggerNotification({
      employeeId: activeEmployee.id,
      employeeName: `${activeEmployee.firstName} ${activeEmployee.lastName}`,
      type: 'check_in',
      message: isOutOfOffice ? `${message} - ລາຍລະອຽດ: ${tripDetails.details}` : message,
    });

    triggerNativeNotification(
      'Check In ສຳເລັດ!',
      `${activeEmployee.firstName} ໄດ້ Check In ແລ້ວ ເວລາ ${timeStr}${isOutside ? ' (ຢູ່ນອກສະຖານທີ່)' : ''}`
    );
  };

  const handleCheckOut = async () => {
    if (!activeEmployee || !todayRecord) return;

    let lat: number | null = null;
    let lng: number | null = null;
    let distance: number | null = null;
    let isOutside = false;

    setIsGpsChecking(true);
    try {
      const position = await getGPSCoordinates();
      lat = position.coords.latitude;
      lng = position.coords.longitude;
      distance = getDistanceInMeters(lat, lng, officeLat, officeLng);
      if (distance > officeRadius) {
        isOutside = true;
      }

      const isOutOfOffice = todayRecord.status.startsWith('ໄປວຽກນອກ');

      if (enableGpsRestriction && isOutside && !isOutOfOffice) {
        alert(`ທ່ານຢູ່ນອກເຂດບໍລິເວນທີ່ກຳນົດ! ໄລຍະຫ່າງຂອງທ່ານ: ${Math.round(distance)} ແມັດ (ອະນຸຍາດບໍ່ເກີນ ${officeRadius} ແມັດ).`);
        setIsGpsChecking(false);
        return;
      }
    } catch (err: any) {
      const isOutOfOffice = todayRecord.status.startsWith('ໄປວຽກນອກ');
      if (enableGpsRestriction && !isOutOfOffice) {
        alert(err.message || "ບໍ່ສາມາດກວດສອບພື້ນທີ່ GPS ໄດ້. ກະລຸນາອະນຸຍາດໃຫ້ເຂົ້າເຖິງສະຖານທີ່ຂອງທ່ານ.");
        setIsGpsChecking(false);
        return;
      }
      console.warn("GPS lookup failed during check-out, continuing", err);
    }

    // Lao Network check if enabled (automatically bypasses if verified physically within GPS office radius)
    const isWithinGpsOffice = distance !== null && distance <= officeRadius;
    if (enableNetworkRestriction && !isWithinGpsOffice) {
      try {
        const netInfo = await checkLaoNetwork();
        if (!netInfo.isLaoNetwork) {
          alert(`ບໍ່ສາມາດ Check-Out ໄດ້: ເຄືອຂ່າຍອິນເຕີເນັດຂອງທ່ານຄື "${netInfo.ispName}" (${netInfo.countryCode}). ລະບົບອະນຸຍາດໃຫ້ Check-Out ສະເພາະເຄືອຂ່າຍມືຖື ຫຼື Wi-Fi ໃນລາວ ເທົ່ານັ້ນ (LTC, Unitel, TPlus).`);
          setIsGpsChecking(false);
          return;
        }
      } catch (err) {
        alert("ບໍ່ສາມາດກວດສອບເຄືອຂ່າຍອິນເຕີເນັດໄດ້. ກະລຸນາກວດສອບການເຊື່ອມຕໍ່ຂອງທ່ານ.");
        setIsGpsChecking(false);
        return;
      }
    }

    setIsGpsChecking(false);

    const timeStr = new Date().toLocaleTimeString('lo-LA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const hours = todayRecord.checkIn ? calculateHours(todayRecord.checkIn, timeStr) : 0;

    const latToRecord = isOutside ? lat : null;
    const lngToRecord = isOutside ? lng : null;
    const distToRecord = isOutside ? distance : null;
    const outsideToRecord = isOutside;

    const updatedRecord: AttendanceRecord = {
      ...todayRecord,
      checkOut: timeStr,
      hoursWorked: hours,
      remarks: null, // Clear "ລືມ Check Out" warning as they are now checked out
      checkOutLat: latToRecord,
      checkOutLng: lngToRecord,
      checkOutDistance: distToRecord,
      checkOutOutside: outsideToRecord,
    };

    onUpdateAttendance(updatedRecord);

    onTriggerNotification({
      employeeId: activeEmployee.id,
      employeeName: `${activeEmployee.firstName} ${activeEmployee.lastName}`,
      type: 'check_out',
      message: `ໄດ້ເຮັດການ Check Out ເວລາ ${timeStr} (ລວມເວລາເຮັດວຽກ: ${formatHours(hours)})${isOutside ? ' [ຢູ່ນອກສະຖານທີ່]' : ''}`,
    });

    triggerNativeNotification(
      'Check Out ສຳເລັດ!',
      `${activeEmployee.firstName} ໄດ້ Check Out ແລ້ວ ເວລາ ${timeStr}${isOutside ? ' (ຢູ່ນອກສະຖານທີ່)' : ''}`
    );
  };

  // Submit Leave Request
  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEmployee) return;

    const timeStr = new Date().toLocaleTimeString('lo-LA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // Create attendance record(s) for the leave dates
    // For simplicity of prototype, we create an entry on the start date
    const leaveRecord: AttendanceRecord = {
      id: `leave-${activeEmployee.id}-${Date.now()}`,
      employeeId: activeEmployee.id,
      date: leaveDates.startDate,
      checkIn: null,
      checkOut: null,
      status: 'ລາພັກ',
      leaveDetails: {
        type: leaveType,
        details: leaveDetailsText || 'ສະເໜີລາພັກຕາມລະບຽບ',
        startDate: leaveDates.startDate,
        endDate: leaveDates.endDate,
        status: 'pending',
      },
      hoursWorked: null,
      remarks: null,
    };

    onAddAttendance(leaveRecord);

    onTriggerNotification({
      employeeId: activeEmployee.id,
      employeeName: `${activeEmployee.firstName} ${activeEmployee.lastName}`,
      type: 'leave_request',
      message: `ໄດ້ສົ່ງໃບສະເໜີ (${leaveType}) ວັນທີ ${formatLaoDate(leaveDates.startDate)} ຫາ ${formatLaoDate(leaveDates.endDate)} - ລາຍລະອຽດ: ${leaveDetailsText}`,
    });

    triggerNativeNotification(
      'ສົ່ງໃບລາພັກແລ້ວ',
      `${activeEmployee.firstName} ສະເໜີ ${leaveType} ວັນທີ ${formatLaoDate(leaveDates.startDate)} ຫາ ${formatLaoDate(leaveDates.endDate)}`
    );

    // Reset Form
    setLeaveDetailsText('');
    alert('ສົ່ງຄຳຮ້ອງຂໍລາພັກສຳເລັດແລ້ວ!');
  };

  // Filter personal attendance logs for active employee -> Now showing all employees' logs
  const myHistory = [...attendance]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  // Determine if a record is flagged for forgotten check in/out
  const getFlaggedStatus = (record: AttendanceRecord) => {
    // If it is 'ລາພັກ' or starts with 'ໄປວຽກນອກ' there's no checkin/checkout required
    if (record.status.startsWith('ລາພັກ') || record.status.startsWith('ໄປວຽກນອກ')) return null;

    // Suppress warnings for active multi-day trips
    const todayStr = new Date().toISOString().split('T')[0];
    const isWithinTrip = attendance.some(r => {
      if (r.employeeId !== record.employeeId) return false;
      if (!r.status.includes('ຫຼາຍວັນ') && !r.status.startsWith('ໄປວຽກນອກ')) return false;
      if (!r.tripDetails) return false;
      const { startDate, endDate } = r.tripDetails;
      return record.date >= startDate && record.date <= endDate && todayStr <= endDate;
    });
    if (isWithinTrip) return null;

    if (!record.checkIn && record.checkOut) {
      return 'ລືມ Check In';
    }
    // If checkIn was done but no checkOut, and it is a past date
    const isPastDate = record.date < todayStr;
    if (record.checkIn && !record.checkOut && isPastDate) {
      return 'ລືມ Check Out';
    }
    return record.remarks;
  };

  const isCurrentlyCheckedIn = (() => {
    if (!activeEmployee) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    const rec = attendance.find(r => r.employeeId === activeEmployee.id && r.date === todayStr);
    if (!rec || !rec.checkIn) return false;
    if (rec.checkOut) return false; // already checked out
    
    // Check if it is check-out time yet
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMin;

    const [outStartHour, outStartMin] = (checkOutStart || "15:40").split(':').map(Number);
    const checkOutStartMinutes = outStartHour * 60 + outStartMin;
    const [outHour, outMin] = (checkOutDeadline || "18:00").split(':').map(Number);
    const checkOutEndMinutes = outHour * 60 + outMin;
    const isCheckOutTime = currentTotalMinutes >= checkOutStartMinutes && currentTotalMinutes <= checkOutEndMinutes;

    return enableQrTimeRestriction && !isCheckOutTime;
  })();

  return (
    <div id="employee-dashboard-container" className="space-y-6">
      {/* QR Code Fast Attendance Banner */}
      <div id="qr-scan-banner" className="bg-gradient-to-r from-teal-500/10 to-teal-600/5 dark:from-teal-950/20 dark:to-teal-900/10 rounded-3xl p-6 border border-teal-100/60 dark:border-teal-900/30 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm animate-fade-in">
        <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
          <div className="p-3.5 bg-teal-600 text-white rounded-2xl shadow-md shadow-teal-500/20">
            <QrCode className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-sans">
              {enableQrCodeSystem ? "ລະບົບສະແກນ QR Code (QR Code Scanner)" : "ລະບົບສະແກນ QR Code ປິດໃຊ້ງານຊົ່ວຄາວ (Disabled by HR)"}
            </h2>
            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 font-sans mt-0.5 max-w-lg leading-relaxed">
              {enableQrCodeSystem 
                ? "ກົດປຸ່ມຂ້າງໆເພື່ອເລີ່ມການສະແກນບັດ QR Code ຂອງທ່ານ"
                : "HR Admin ໄດ້ປິດການໃຊ້ງານລະບົບສະແກນ QR Code ຊົ່ວຄາວ. ກະລຸນາໃຊ້ຟອມເລືອກລາຍຊື່ ແລະ ລົງເວລາດ້ານລຸ່ມເພື່ອເຂົ້າ/ອອກວຽກ."}
            </p>
          </div>
        </div>
        {!enableQrCodeSystem ? (
          <div className="flex flex-col items-center sm:items-end gap-1">
            <span className="text-[10px] text-rose-500 dark:text-rose-400 font-bold font-sans">
              🔴 ລະບົບສະແກນຖືກປິດໂດຍ HR
            </span>
            <button
              id="open-scanner-btn-system-disabled"
              disabled
              className="bg-rose-100 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 text-sm font-bold font-sans py-3.5 px-7 rounded-2xl flex items-center gap-2.5 opacity-80 cursor-not-allowed whitespace-nowrap"
            >
              <Camera className="w-5 h-5" />
              ປິດການສະແກນ QR
            </button>
          </div>
        ) : isCurrentlyCheckedIn ? (
          <div className="flex flex-col items-center sm:items-end gap-1">
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold font-sans">
              ⚠️ ໄດ້ Check-In ເຂົ້າວຽກແລ້ວ
            </span>
            <button
              id="open-scanner-btn-disabled"
              disabled
              className="bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-bold font-sans py-3.5 px-7 rounded-2xl flex items-center gap-2.5 opacity-60 cursor-not-allowed whitespace-nowrap"
            >
              <Camera className="w-5 h-5" />
              ສະແກນ QR Code
            </button>
          </div>
        ) : (
          <button
            id="open-scanner-btn"
            onClick={() => {
              setIsScannerOpen(true);
              startCamera();
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm sm:text-base font-extrabold font-sans py-4 px-8 rounded-2xl flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 shadow-md shadow-teal-500/20 cursor-pointer whitespace-nowrap"
          >
            <Camera className="w-5 h-5" />
            ສະແກນ QR Code
          </button>
        )}
      </div>

      {/* 1. Employee Selector */}
      <div id="employee-select-card" className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 font-sans">
            ກະລຸນາເລືອກລາຍຊື່ພະນັກງານຂອງທ່ານເພື່ອເຂົ້າໃຊ້ງານ:
          </label>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 text-[11px] font-extrabold rounded-full border border-teal-100 dark:border-teal-900/50">
            ⚡️ ເຂົ້າໃຊ້ງານໄດ້ທັນທີໂດຍບໍ່ຕ້ອງລັອກອິນ
          </span>
        </div>
        <select
          id="employee-selector"
          value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(e.target.value)}
          className="w-full text-base bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans transition-all"
        >
          <option value="">-- ເລືອກພະນັກງານ --</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              [{emp.employeeCode}] {emp.firstName} {emp.lastName} - {emp.position}
            </option>
          ))}
        </select>

        {activeEmployee && (
          <motion.div
            id="employee-profile-banner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mt-5 p-4 bg-teal-50/50 dark:bg-slate-800/50 rounded-2xl border border-teal-100/50 dark:border-slate-700/50"
          >
            <img
              id="employee-profile-avatar"
              src={activeEmployee.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
              alt="Avatar"
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-teal-500/30"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-sans">
                {activeEmployee.firstName} {activeEmployee.lastName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                ລະຫັດ: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{activeEmployee.employeeCode}</span> | ຕຳແໜ່ງ: {activeEmployee.position}
              </p>
              {activeEmployee.phone && (
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                  <Phone className="w-3 h-3" /> {activeEmployee.phone}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {!activeEmployee ? (
        <div id="no-employee-selected-alert" className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <UserCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-600 dark:text-slate-400 font-sans">
            ບໍ່ທັນໄດ້ເລືອກພະນັກງານ
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto font-sans leading-relaxed">
            ກະລຸນາເລືອກລາຍຊື່ຂອງທ່ານຈາກລາຍການດ້ານເທິງ ເພື່ອເຮັດການ Check In, Check Out ຫຼັງຈາກນັ້ນລະບົບຈະບັນທຶກເວລາທັນທີ.
          </p>
        </div>
      ) : (
        <div id="employee-dashboard-modules" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: Check-In/Out Panel */}
          <div id="checkin-panel" className="space-y-6">
            {/* Live Clock Card */}
            <div className="bg-gradient-to-tr from-teal-600 to-teal-800 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                <Clock className="w-56 h-56" />
              </div>
              
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-medium tracking-wide">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                ເວລາປະຈຸບັນ (LIVE)
              </span>

              <h1 className="text-4xl sm:text-5xl font-extrabold font-mono mt-4 tracking-wider">
                {formattedTime}
              </h1>
              
              <p className="text-sm font-medium text-teal-100 mt-2 font-sans flex items-center gap-1">
                <Calendar className="w-4 h-4 text-teal-200" /> {formattedDate}
              </p>
            </div>

            {/* Today's Shift Card */}
            {(() => {
              const todayStr = new Date().toISOString().split('T')[0];
              const todayShift = (shifts || []).find(s => s.employeeId === selectedEmployeeId && s.date === todayStr);
              if (!todayShift) return null;
              
              const startT = todayShift.startTime || (todayShift.shiftType === 'morning' ? '08:30' : todayShift.shiftType === 'afternoon' ? '13:00' : '08:30');
              const endT = todayShift.endTime || (todayShift.shiftType === 'morning' ? '12:00' : todayShift.shiftType === 'afternoon' ? '17:00' : '17:00');
              
              return (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-3xl p-5 shadow-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                      <Clock className="w-4 h-4" />
                    </span>
                    <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 font-sans">
                      ກະການເຮັດວຽກຂອງທ່ານໃນມື້ນີ້ (Your Shift Today)
                    </h4>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${
                      todayShift.shiftType === 'morning'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                        : todayShift.shiftType === 'afternoon'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300'
                        : 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300'
                    }`}>
                      {todayShift.shiftType === 'morning' 
                        ? `☀️ ກະຕອນເຊົ້າ (Morning Shift: ${startT} - ${endT})` 
                        : todayShift.shiftType === 'afternoon' 
                        ? `🌤️ ກະຕອນແລງ (Afternoon Shift: ${startT} - ${endT})` 
                        : `📅 ກະໝົດມື້ (Full Day Shift: ${startT} - ${endT})`}
                    </span>
                    {todayShift.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-sans italic">
                        ໝາຍເຫດ: {todayShift.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Check-In/Out Actions */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-sans pb-3 border-b border-slate-50 dark:border-slate-800">
                <Briefcase className="w-4 h-4 text-teal-500" /> ໝາຍວັນງານ ແລະ ເຂົ້າ-ອອກວຽກ
              </h3>

              {/* Status Picker for Check-in */}
              {!(todayRecord && todayRecord.checkIn) && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 font-sans">
                    ເລືອກສະຖານະການເຂົ້າວຽກ:
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      id="status-normal-btn"
                      type="button"
                      onClick={() => setStatusType('ເຂົ້າວຽກປົກກະຕິ')}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left font-sans transition-all ${
                        statusType === 'ເຂົ້າວຽກປົກກະຕິ'
                          ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-300 font-semibold'
                          : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>ເຂົ້າວຽກປົກກະຕິ</span>
                      {statusType === 'ເຂົ້າວຽກປົກກະຕິ' && <span className="w-2.5 h-2.5 bg-teal-500 rounded-full"></span>}
                    </button>

                    {/* Out of Office Dropdown trigger / toggle */}
                    <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                      <button
                        id="status-out-office-btn"
                        type="button"
                        onClick={() => {
                          if (!statusType.startsWith('ໄປວຽກນອກ')) {
                            setStatusType('ໄປວຽກນອກ (ໝົດມື້)');
                          }
                        }}
                        className={`w-full flex items-center justify-between p-3.5 text-left font-sans transition-all ${
                          statusType.startsWith('ໄປວຽກນອກ')
                            ? 'bg-teal-50/30 dark:bg-teal-950/10 text-teal-700 dark:text-teal-300 font-semibold border-b border-slate-100 dark:border-slate-800'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span>ໄປວຽກນອກ</span>
                        </div>
                        {statusType.startsWith('ໄປວຽກນອກ') && <span className="text-xs text-teal-600 dark:text-teal-400 font-bold">ເລືອກແລ້ວ</span>}
                      </button>

                      {statusType.startsWith('ໄປວຽກນອກ') && (
                        <div className="p-3.5 bg-slate-50/50 dark:bg-slate-900/50 space-y-3 border-t border-slate-100 dark:border-slate-800">
                          {/* Sub Status Selection */}
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase font-sans">
                              ຮູບແບບໄປວຽກນອກ:
                            </span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {(['ໄປວຽກນອກ (ຕອນເຊົ້າ)', 'ໄປວຽກນອກ (ຕອນແລງ)', 'ໄປວຽກນອກ (ໝົດມື້)', 'ໄປວຽກນອກ (ຫຼາຍວັນ)'] as WorkStatus[]).map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => setStatusType(st)}
                                  className={`px-2 py-2 text-[11px] rounded-lg border text-center transition-all truncate font-sans ${
                                    statusType === st
                                      ? 'bg-teal-600 text-white border-teal-600 font-semibold'
                                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  {st.replace('ໄປວຽກນອກ ', '')}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Out-of-office Details */}
                          <div className="space-y-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1 font-sans">
                                ລາຍລະອຽດໄປວຽກນອກ: *
                              </label>
                              <input
                                id="trip-detail-input"
                                type="text"
                                value={tripDetails.details}
                                onChange={(e) => setTripDetails({ ...tripDetails, details: e.target.value })}
                                placeholder="ຕົວຢ່າງ: ປະຊຸມຮ່ວມກັບລູກຄ້າ, ຝຶກອົບຮົມ..."
                                className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans"
                                required={statusType.startsWith('ໄປວຽກນອກ')}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-sans">
                                  ວັນທີ່ເດີນທາງໄປ:
                                </label>
                                <input
                                  id="trip-start-date"
                                  type="date"
                                  value={tripDetails.startDate}
                                  onChange={(e) => setTripDetails({ ...tripDetails, startDate: e.target.value })}
                                  className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-sans">
                                  ວັນທີ່ເດີນທາງກັບ:
                                </label>
                                <input
                                  id="trip-end-date"
                                  type="date"
                                  value={tripDetails.endDate}
                                  onChange={(e) => setTripDetails({ ...tripDetails, endDate: e.target.value })}
                                  className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-sans"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {isWeekend ? (
                      <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                        <button
                          id="status-duty-btn"
                          type="button"
                          onClick={() => {
                            if (!statusType.startsWith('ປະຈຳການ')) {
                              setStatusType('ປະຈຳການ (ວັນເສົາ ຫາ ວັນອາທິດ)');
                            }
                          }}
                          className={`w-full flex items-center justify-between p-3.5 text-left font-sans transition-all ${
                            statusType.startsWith('ປະຈຳການ')
                              ? 'bg-teal-50/30 dark:bg-teal-950/10 text-teal-700 dark:text-teal-300 font-semibold border-b border-slate-100 dark:border-slate-800'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-amber-500" />
                            <span>ປະຈຳການ (ວັນເສົາ, ວັນອາທິດ)</span>
                          </div>
                          {statusType.startsWith('ປະຈຳການ') && <span className="text-xs text-teal-600 dark:text-teal-400 font-bold">ເລືອກແລ້ວ</span>}
                        </button>

                        {statusType.startsWith('ປະຈຳການ') && (
                          <div className="p-3.5 bg-slate-50/50 dark:bg-slate-900/50 space-y-3 border-t border-slate-100 dark:border-slate-800">
                            {/* Sub Status Selection */}
                            <div>
                              <span className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase font-sans">
                                ຮູບແບບປະຈຳການ:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                                {([
                                  'ປະຈຳການ (ວັນເສົາ ຫາ ວັນອາທິດ)',
                                  'ປະຈຳການ ວັນເສົາ',
                                  'ປະຈຳການ ວັນອາທິດ'
                                ] as WorkStatus[]).map((st) => (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => setStatusType(st)}
                                    className={`px-2 py-2 text-[10px] rounded-lg border text-center transition-all truncate font-sans ${
                                      statusType === st
                                        ? 'bg-teal-600 text-white border-teal-600 font-semibold'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                                  >
                                    {st === 'ປະຈຳການ (ວັນເສົາ ຫາ ວັນອາທິດ)'
                                      ? 'ເສົາ ຫາ ອາທິດ'
                                      : st.replace('ປະຈຳການ ', '')}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Month Selection */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1 font-sans">
                                ເລືອກເດືອນປະຈຳການ: *
                              </label>
                              <select
                                value={dutyMonth}
                                onChange={(e) => setDutyMonth(e.target.value)}
                                className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans"
                              >
                                {LAO_MONTHS.map((m) => (
                                  <option key={m} value={m}>
                                    {m}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Duty Content (Required) */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1 font-sans">
                                ເນື້ອໃນໃນການປະຈຳການ: *
                              </label>
                              <textarea
                                value={dutyContent}
                                onChange={(e) => setDutyContent(e.target.value)}
                                placeholder="ກະລຸນາປ້ອນເນື້ອໃນການປະຈຳການ (ເຊັ່ນ: ກວດລະບົບ, ເຝົ້າລະວັງ...)"
                                className="w-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans h-20 resize-none"
                                required
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400 font-sans flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>ປຸ່ມລົງທະບຽນປະຈຳການຈະເປີດໃຫ້ບໍລິການສະເພາະວັນເສົາ-ອາທິດ ເທົ່ານັ້ນ</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Check-In / Check-Out Actions */}
              <div className="pt-2">
                {!(todayRecord && todayRecord.checkIn) ? (
                  <button
                    id="check-in-btn"
                    onClick={handleCheckIn}
                    className="w-full bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-teal-600/15 transition-all text-base font-sans cursor-pointer"
                  >
                    <LogIn className="w-5 h-5" />
                    ເຮັດການ CHECK IN ເຂົ້າວຽກ
                  </button>
                ) : !todayRecord.checkOut ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900 rounded-2xl flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 font-sans">
                          ທ່ານໄດ້ Check In ແລ້ວໃນມື້ນີ້!
                        </p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                          ເວລາເຂົ້າ: {todayRecord.checkIn} | ສະຖານະ: {todayRecord.status}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      id="check-out-btn"
                      onClick={handleCheckOut}
                      className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/15 transition-all text-base font-sans cursor-pointer"
                    >
                      <LogOut className="w-5 h-5" />
                      ເຮັດການ CHECK OUT ອອກວຽກ
                    </button>
                  </div>
                ) : (
                  <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center border border-slate-100 dark:border-slate-700">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-sans">
                      ສໍາເລັດການເຮັດວຽກປະຈໍາວັນນີ້!
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
                      ທ່ານໄດ້ເຮັດການ Check In ແລະ Check Out ຄົບຖ້ວນແລ້ວ.
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-sans">ເວລາເຂົ້າ (In)</span>
                        <span className="font-mono text-xs text-slate-700 dark:text-slate-300 font-bold">{todayRecord.checkIn}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-sans">ເວລາອອກ (Out)</span>
                        <span className="font-mono text-xs text-slate-700 dark:text-slate-300 font-bold">{todayRecord.checkOut}</span>
                      </div>
                    </div>
                    <div className="mt-2.5 text-xs text-teal-600 dark:text-teal-400 font-sans font-bold">
                      ລວມເວລາເຮັດວຽກ: {formatHours(todayRecord.hoursWorked)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Apply Leave Request */}
          <div id="leave-request-panel" className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-sans pb-3 border-b border-slate-50 dark:border-slate-800 mb-5">
              <FileText className="w-4 h-4 text-purple-500" /> ສົ່ງໃບສະເໜີລາພັກ (Leave Request)
            </h3>

            <form id="leave-request-form" onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-sans">
                  ປະເພດການລາພັກ:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {(['ລາພັກປະຈຳປີ', 'ລາພັກເຈັບໄຂ້', 'ລາພັກເກີດລູກ', 'ລາພັກຈຳເປັນ', 'ລາພັກທົດແທນ'] as LeaveType[]).map((lt) => (
                    <button
                      key={lt}
                      type="button"
                      onClick={() => setLeaveType(lt)}
                      className={`py-2.5 px-1.5 text-xs rounded-xl border text-center transition-all truncate font-sans ${
                        leaveType === lt
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {lt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                    ເລີ່ມວັນທີ:
                  </label>
                  <input
                    id="leave-start-date"
                    type="date"
                    value={leaveDates.startDate}
                    onChange={(e) => setLeaveDates({ ...leaveDates, startDate: e.target.value })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                    ຫາວັນທີ:
                  </label>
                  <input
                    id="leave-end-date"
                    type="date"
                    value={leaveDates.endDate}
                    onChange={(e) => setLeaveDates({ ...leaveDates, endDate: e.target.value })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-sans">
                  ເຫດຜົນການລາພັກ / ລາຍລະອຽດ:
                </label>
                <textarea
                  id="leave-reason"
                  rows={3}
                  value={leaveDetailsText}
                  onChange={(e) => setLeaveDetailsText(e.target.value)}
                  placeholder="ກະລຸນາລະບຸເຫດຜົນໃນການລາພັກ..."
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans resize-none"
                  required
                />
              </div>

              <button
                id="submit-leave-btn"
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/10 text-sm font-sans cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                ສົ່ງໃບລາພັກ
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Employee Personal Log History */}
      {activeEmployee && (
        <div id="personal-history-card" className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-sans pb-3 border-b border-slate-50 dark:border-slate-800 mb-4">
            <ClipboardList className="w-4 h-4 text-teal-500" /> ປະຫວັດການລົງເວລາຂອງພະນັກງານທຸກຄົນ (Recent Log)
          </h3>

          {myHistory.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 font-sans">ບໍ່ທັນມີປະຫວັດການລົງເວລາ</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] font-bold uppercase font-sans">
                    <th className="py-3 px-2">ພະນັກງານ (Employee)</th>
                    <th className="py-3 px-2">ວັນທີ (Date)</th>
                    <th className="py-3 px-2">ສະຖານະ (Status)</th>
                    <th className="py-3 px-2">ເວລາເຂົ້າ (In)</th>
                    <th className="py-3 px-2">ເວລາອອກ (Out)</th>
                    <th className="py-3 px-2">ຊົ່ວໂມງລວມ (Hours)</th>
                    <th className="py-3 px-2">ໝາຍເຫດ/ຂໍ້ຜິດພາດ (Warnings)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {myHistory.map((rec) => {
                    const flag = getFlaggedStatus(rec);
                    const emp = employees.find(e => e.id === rec.employeeId);
                    const empName = emp ? `${emp.firstName} ${emp.lastName}` : `ລະຫັດ: ${rec.employeeId}`;
                    return (
                      <tr key={rec.id} className="text-slate-600 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-2 font-sans font-semibold text-slate-700 dark:text-slate-300">{empName}</td>
                        <td className="py-3 px-2 font-mono font-medium">{formatLaoDate(rec.date)}</td>
                        <td className="py-3 px-2 font-sans">
                          {rec.status === 'ລາພັກ' ? (
                            <div className="flex flex-col gap-1 items-start">
                              <span className="bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-300 px-2 py-0.5 rounded-full text-[10px] font-medium">
                                ລາພັກ ({rec.leaveDetails?.type})
                              </span>
                              {rec.leaveDetails?.status === 'approved' ? (
                                <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[9px] font-bold">
                                  ✓ ເຫັນດີ
                                </span>
                              ) : rec.leaveDetails?.status === 'rejected' ? (
                                <span className="bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-300 px-2 py-0.5 rounded-full text-[9px] font-bold">
                                  ✗ ບໍ່ເຫັນດີ
                                </span>
                              ) : (
                                <span className="bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300 px-2 py-0.5 rounded-full text-[9px] font-bold">
                                  ⏱ ລໍຖ້າອະນຸມັດ
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              rec.status === 'ເຂົ້າວຽກປົກກະຕິ' 
                                ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-300'
                                : rec.status.startsWith('ປະຈຳການ')
                                ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/20 dark:text-teal-300'
                                : 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300'
                            }`}>
                              {rec.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 font-mono text-slate-800 dark:text-slate-200">
                          {rec.checkIn || '-'}
                        </td>
                        <td className="py-3 px-2 font-mono text-slate-800 dark:text-slate-200">
                          {rec.checkOut || '-'}
                        </td>
                        <td className="py-3 px-2 font-sans font-medium text-slate-900 dark:text-slate-100">
                          {formatHours(rec.hoursWorked)}
                        </td>
                        <td className="py-3 px-2 font-sans">
                          {flag ? (
                            <span className="inline-flex items-center gap-1 text-red-500 dark:text-red-400 font-bold text-[11px] bg-red-50 dark:bg-red-950/30 px-2.5 py-0.5 rounded-md">
                              <AlertTriangle className="w-3 h-3 animate-pulse" />
                              {flag}
                            </span>
                          ) : rec.status === 'ລາພັກ' ? (
                            <span className="text-slate-400 dark:text-slate-500 italic max-w-[200px] block truncate" title={rec.leaveDetails?.details}>
                              {rec.leaveDetails?.details}
                            </span>
                          ) : rec.status.startsWith('ໄປວຽກນອກ') ? (
                            <div className="flex flex-col gap-0.5 max-w-[200px] font-sans text-xs text-slate-500 dark:text-slate-400">
                              <span className="italic block truncate font-medium" title={rec.tripDetails?.details}>
                                {rec.tripDetails?.details || 'ໄປວຽກນອກ'}
                              </span>
                              {rec.tripDetails && (
                                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold block leading-none mt-0.5">
                                  ✈️ ວັນທີ: {formatLaoDate(rec.tripDetails.startDate)} ຫາ {formatLaoDate(rec.tripDetails.endDate)}
                                </span>
                              )}
                            </div>
                          ) : rec.status.startsWith('ປະຈຳການ') && rec.dutyContent ? (
                            <span className="text-slate-400 dark:text-slate-500 italic max-w-[200px] block truncate" title={rec.dutyContent}>
                              {rec.dutyContent}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. Employee Shifts Schedule */}
      {activeEmployee && (
        <div id="shifts-schedule-card" className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-sans pb-3 border-b border-slate-50 dark:border-slate-800 mb-4">
            <Clock className="w-4 h-4 text-amber-500" /> ຕາຕະລາງກະການເຮັດວຽກສ່ວນຕົວຂອງທ່ານ (Your Shifts Schedule)
          </h3>

          {(() => {
            const myShifts = (shifts || []).filter(s => s.employeeId === selectedEmployeeId)
              .sort((a, b) => b.date.localeCompare(a.date));

            if (myShifts.length === 0) {
              return (
                <p className="text-xs text-slate-400 text-center py-6 font-sans">
                  ບໍ່ທັນມີການກຳນົດກະການເຮັດວຽກໃຫ້ທ່ານໃນໄລຍະນີ້. (No shifts assigned)
                </p>
              );
            }

            return (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] font-bold uppercase font-sans">
                      <th className="py-3 px-2">ວັນທີ (Date)</th>
                      <th className="py-3 px-2">ປະເພດກະການເຮັດວຽກ (Shift Type)</th>
                      <th className="py-3 px-2">ເວລາປະຕິບັດງານ (Hours)</th>
                      <th className="py-3 px-2">ໝາຍເຫດ (Notes)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {myShifts.map((sh) => {
                      const startT = sh.startTime || (sh.shiftType === 'morning' ? '08:30' : sh.shiftType === 'afternoon' ? '13:00' : '08:30');
                      const endT = sh.endTime || (sh.shiftType === 'morning' ? '12:00' : sh.shiftType === 'afternoon' ? '17:00' : '17:00');
                      return (
                        <tr key={sh.id} className="text-slate-600 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-2 font-mono font-medium">{sh.date}</td>
                          <td className="py-3 px-2 font-sans">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sh.shiftType === 'morning'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                                : sh.shiftType === 'afternoon'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400'
                                : 'bg-teal-100 text-teal-800 dark:bg-teal-950/30 dark:text-teal-400'
                            }`}>
                              {sh.shiftType === 'morning' ? '☀️ ກະຕອນເຊົ້າ (Morning Shift)' : sh.shiftType === 'afternoon' ? '🌤️ ກະຕອນແລງ (Afternoon Shift)' : '📅 ກະໝົດມື້ (Full Day Shift)'}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-mono text-slate-500">
                            {startT} - {endT}
                          </td>
                          <td className="py-3 px-2 font-sans text-slate-500">
                            {sh.notes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* QR Scanner Overlay Modal */}
      <AnimatePresence>
        {isScannerOpen && (
          <motion.div
            id="scanner-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              id="scanner-modal-card"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl space-y-6 text-center relative"
            >
              {/* Close Button */}
              <button
                id="close-scanner-btn"
                onClick={closeScanner}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-full transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1.5">
                <div className="mx-auto w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <QrCode className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 font-sans">
                  ສະແກນ QR Code ເຂົ້າ-ອອກວຽກ
                </h3>
                <p className="text-xs text-slate-400 font-sans max-w-xs mx-auto">
                  ຖືບັດ QR Code ຂອງທ່ານໃຫ້ກົງກັບກ້ອງ ເພື່ອທຳການສະແກນ ເຂົ້າ-ອອກວຽກ
                </p>
              </div>

              {/* Scanned Success Result State */}
              {scannedEmployee ? (
                <motion.div
                  id="scanner-success-panel"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/50 rounded-2xl space-y-4"
                >
                  <div className="mx-auto w-14 h-14 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/20">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-teal-600 dark:text-teal-400 font-sans">
                      {scannedAction === 'check_in' 
                        ? 'Check-In ສຳເລັດ!' 
                        : scannedAction === 'check_out' 
                        ? 'Check-Out ສຳເລັດ!' 
                        : 'ບັນທຶກເວລາສຳເລັດ!'}
                    </h4>
                    <p className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-sans">
                      {scannedEmployee.firstName} {scannedEmployee.lastName}
                    </p>
                    <p className="text-xs text-slate-400 font-sans">
                      ລະຫັດ: <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{scannedEmployee.employeeCode}</span> | ຕຳແໜ່ງ: {scannedEmployee.position}
                    </p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-teal-100 dark:border-teal-900/30 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-sans">
                      ປະເພດການໝາຍວັນງານ:
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-black rounded-full ${
                      scannedAction === 'check_in'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        : scannedAction === 'check_out'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                    }`}>
                      {scannedAction === 'check_in' 
                        ? 'Check-In ເຂົ້າວຽກ' 
                        : scannedAction === 'check_out' 
                        ? 'Check-Out ອອກວຽກ' 
                        : 'ບັນທຶກແລ້ວໃນມື້ນີ້'}
                    </span>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2">
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">ວັນທີເດືອນປີ (Date)</span>
                      <span className="text-xs font-bold text-slate-850 dark:text-slate-100 font-sans">
                        {(() => {
                          const now = new Date();
                          const wd = now.toLocaleDateString('lo-LA', { weekday: 'long' });
                          const d = String(now.getDate()).padStart(2, '0');
                          const m = String(now.getMonth() + 1).padStart(2, '0');
                          const y = now.getFullYear();
                          return `${wd}, ${d}/${m}/${y}`;
                        })()}
                      </span>
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-slate-700 w-1/2 mx-auto"></div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">ເວລາທີ່ບັນທຶກ (Time)</span>
                      <span className="text-xl font-black font-mono text-teal-600 dark:text-teal-400 tracking-wider">
                        {scannedTime}
                      </span>
                    </div>
                  </div>

                  {scannedAction === 'check_in' || scannedAction === 'already_done' ? (
                    <div className="space-y-2">
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-[11px] rounded-xl border border-amber-100 dark:border-amber-900/30 font-sans leading-relaxed text-center">
                        ⚠️ ທ່ານໄດ້ Check-In ເຂົ້າວຽກສຳເລັດແລ້ວ. ບໍ່ສາມາດສະແກນຊ້ຳໄດ້ ຈົນກວ່າຈະຮອດເວລາ Check-Out.
                      </div>
                      <button
                        id="dismiss-scan-success"
                        type="button"
                        onClick={() => {
                          setScannedEmployee(null);
                          setScannedAction(null);
                          setScannedTime(null);
                          setIsScannerOpen(false);
                        }}
                        className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                      >
                        ປິດໜ້າຕ່າງ
                      </button>
                    </div>
                  ) : (
                    <button
                      id="dismiss-scan-success"
                      type="button"
                      onClick={() => {
                        setScannedEmployee(null);
                        setScannedAction(null);
                        setScannedTime(null);
                        startCamera();
                      }}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                    >
                      ສະແກນບັດຕໍ່ໄປ
                    </button>
                  )}
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {/* Camera view screen */}
                  <div className="relative mx-auto w-[280px] h-[280px] bg-slate-900 dark:bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    <div id="reader-container" className="absolute inset-0 w-full h-full object-cover"></div>
                    
                    {!isCameraActive && !qrScanError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-900 text-center space-y-3 z-10">
                        <Camera className="w-8 h-8 text-slate-500 animate-pulse" />
                        <span className="text-xs text-slate-400 font-sans">ກຳລັງເປີດກ້ອງຖ່າຍຮູບ...</span>
                      </div>
                    )}

                    {qrScanError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-950/95 text-center space-y-3 z-20">
                        <AlertTriangle className="w-10 h-10 text-rose-500" />
                        <h4 className="text-sm font-bold text-rose-400 font-sans">ເກີດຂໍ້ຜິດພາດໃນການອ່ານ</h4>
                        <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                          {qrScanError}
                        </p>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition-all"
                        >
                          ລອງໃໝ່ອີກຄັ້ງ
                        </button>
                      </div>
                    )}

                    {isCameraActive && !qrScanError && (
                      <div className="absolute inset-0 pointer-events-none z-10">
                        {/* Scanning scanner overlay animation guide */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-teal-400 rounded-xl">
                          <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-teal-400 rounded-tl-sm"></div>
                          <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-teal-400 rounded-tr-sm"></div>
                          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-teal-400 rounded-bl-sm"></div>
                          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-teal-400 rounded-br-sm"></div>
                          {/* Pulsing red laser line */}
                          <div className="absolute left-0 w-full h-[2px] bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.8)] animate-[bounce_2s_infinite]"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Toggle controls / options */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                        {isCameraActive ? 'ກ້ອງຖ່າຍຮູບເຮັດວຽກຢູ່' : 'ລໍຖ້າການສະແກນ'}
                      </span>
                    </div>


                  </div>
                </div>
              )}

              {/* Footer back button */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={closeScanner}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold font-sans rounded-xl transition-all cursor-pointer"
                >
                  ປິດໜ້າຕ່າງ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
