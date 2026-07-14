export interface Employee {
  id: string;
  employeeCode: string; // ລະຫັດພະນັກງານ
  firstName: string; // ຊື່
  lastName: string; // ນາມສະກຸນ
  position: string; // ຕຳແໜ່ງ
  phone?: string;
  avatar?: string;
  totalLeaveQuota?: number; // ຈຳນວນວັນພັກທັງໝົດທີ່ໄດ້ຮັບ (Annual Leave)
  sickLeaveQuota?: number; // ໂກຕາລາພັກເຈັບໄຂ້
  maternityLeaveQuota?: number; // ໂກຕາລາພັກເກີດລູກ
  personalLeaveQuota?: number; // ໂກຕາລາພັກຈຳເປັນ
}

export type WorkStatus =
  | 'ເຂົ້າວຽກປົກກະຕິ'
  | 'ໄປວຽກນອກ (ຕອນເຊົ້າ)'
  | 'ໄປວຽກນອກ (ຕອນແລງ)'
  | 'ໄປວຽກນອກ (ໝົດມື້)'
  | 'ໄປວຽກນອກ (ຫຼາຍວັນ)'
  | 'ປະຈຳການ (ວັນເສົາ ຫາ ວັນອາທິດ)'
  | 'ປະຈຳການ ວັນເສົາ'
  | 'ປະຈຳການ ວັນອາທິດ';

export type LeaveType =
  | 'ລາພັກປະຈຳປີ'
  | 'ລາພັກເຈັບໄຂ້'
  | 'ລາພັກເກີດລູກ'
  | 'ລາພັກຈຳເປັນ'
  | 'ລາພັກທົດແທນ';

export interface TripDetails {
  details: string; // ລາຍລະອຽດການໄປວຽກນອກ
  startDate: string; // ວັນທີ່ເດີນທາງໄປ
  endDate: string; // ວັນທີ່ເດີນທາງກັບ
  startTime?: string; // ເວລາເລີ່ມຕົ້ນ
  endTime?: string; // ເວລາສິ້ນສຸດ
}

export interface LeaveDetails {
  type: LeaveType;
  details: string;
  startDate: string;
  endDate: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // HH:mm:ss
  checkOut: string | null; // HH:mm:ss
  status: WorkStatus | 'ລາພັກ';
  tripDetails?: TripDetails;
  leaveDetails?: LeaveDetails;
  hoursWorked: number | null; // ລວມເວລາຊົ່ວໂມງ
  remarks: string | null; // "ລືມ Check In" or "ລືມ Check Out" or custom notes (will be highlighted in red)
  dutyMonth?: string | null; // ເດືອນປະຈຳການ
  dutyContent?: string | null; // ເນື້ອໃນໃນການປະຈຳການ
  editedAt?: string | null; // ວັນເວລາທີ່ HR ແກ້ໄຂຂໍ້ມູນ
  checkInLat?: number | null;
  checkInLng?: number | null;
  checkInDistance?: number | null;
  checkInOutside?: boolean | null;
  checkOutLat?: number | null;
  checkOutLng?: number | null;
  checkOutDistance?: number | null;
  checkOutOutside?: boolean | null;
}

export interface SystemNotification {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'check_in' | 'check_out' | 'leave_request' | 'trip_request';
  message: string;
  timestamp: string; // HH:mm:ss or ISO
  read: boolean;
}

export type ShiftType = 'morning' | 'afternoon' | 'full_day';

export interface ShiftAssignment {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  shiftType: ShiftType;
  startTime?: string; // HH:MM
  endTime?: string;   // HH:MM
  notes?: string;
}
