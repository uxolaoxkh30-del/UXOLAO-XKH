import { Employee, AttendanceRecord, SystemNotification } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [];

// Helper to get past dates relative to today
const getPastDateString = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [];

// Helper function to calculate duration between two time strings
export const calculateHours = (start: string | null, end: string | null): number | null => {
  if (!start || !end) return null;
  try {
    const [h1, m1, s1] = start.split(':').map(Number);
    const [h2, m2, s2] = end.split(':').map(Number);
    
    const d1 = new Date();
    d1.setHours(h1, m1, s1 || 0, 0);
    
    const d2 = new Date();
    d2.setHours(h2, m2, s2 || 0, 0);
    
    const diffMs = d2.getTime() - d1.getTime();
    if (diffMs < 0) return null; // Overnight shifts not handled directly or returns null
    
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
  } catch (e) {
    return null;
  }
};

// Formatter for hours worked
export const formatHours = (hours: number | null): string => {
  if (hours === null || isNaN(hours)) return '-';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h} ຊົ່ວໂມງ ${m} ນາທີ`;
};

// Default logo SVG
export const DEFAULT_LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-12 h-12 text-teal-600">
  <defs>
    <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d9488" />
      <stop offset="100%" stop-color="#0f766e" />
    </linearGradient>
  </defs>
  <circle cx="256" cy="256" r="240" fill="url(#logo-grad)" />
  <circle cx="256" cy="256" r="180" fill="none" stroke="#ffffff" stroke-width="16" stroke-dasharray="10 15" opacity="0.6" />
  <path d="M256 120V256L340 300" stroke="#ffffff" stroke-width="28" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M160 256 H180" stroke="#ffffff" stroke-width="24" stroke-linecap="round" />
  <path d="M332 256 H352" stroke="#ffffff" stroke-width="24" stroke-linecap="round" />
  <path d="M256 160 V180" stroke="#ffffff" stroke-width="24" stroke-linecap="round" />
  <path d="M256 332 V352" stroke="#ffffff" stroke-width="24" stroke-linecap="round" />
  <rect x="206" y="380" width="100" height="30" rx="15" fill="#ffffff" />
  <text x="256" y="401" font-family="Inter, sans-serif" font-weight="bold" font-size="16" fill="#0d9488" text-anchor="middle">HR-TIME</text>
</svg>
`;

// Convert YYYY-MM-DD to Lao format DD/MM/YYYY
export const formatLaoDate = (dateStr: string | undefined | null): string => {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

// Convert YYYY-MM-DD to readable Lao text format (e.g. 25 ກໍລະກົດ 2026)
export const formatLaoDateFriendly = (dateStr: string | undefined | null): string => {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const laoMonths = [
      "ມັງກອນ", "ກຸມພາ", "ມີນາ", "ເມສາ", "ພຶດສະພາ", "ມິຖຸນາ",
      "ກໍລະກົດ", "ສິງຫາ", "ກັນຍາ", "ຕຸລາ", "ພະຈິກ", "ທັນວາ"
    ];
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${day} ${laoMonths[monthIndex]} ${year}`;
    }
    return `${day}/${monthIndex + 1}/${year}`;
  }
  return dateStr;
};

