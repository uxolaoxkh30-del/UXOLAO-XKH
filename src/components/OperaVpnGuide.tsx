import React, { useState, useEffect } from 'react';
import { 
  Download, 
  ShieldCheck, 
  Camera, 
  Smartphone, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Info,
  QrCode,
  Briefcase,
  CalendarDays,
  UserCheck,
  FileText,
  MapPin,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

export function OperaVpnGuide() {
  const [isVpnOpen, setIsVpnOpen] = useState(false);
  const [isUsageOpen, setIsUsageOpen] = useState(false);
  const [isIosOpen, setIsIosOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [appUrl, setAppUrl] = useState("https://ais-pre-qmhxuah63lqalyzr3tvskk-290613800212.asia-east1.run.app");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAppUrl(window.location.origin);
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }).catch(err => {
      console.error('Failed to copy link:', err);
    });
  };

  return (
    <div id="employee-comprehensive-guide-container" className="space-y-4 mb-6">
      
      {/* SECTION 1: Chrome & Safari Mobile Guide (No VPN Required) */}
      <div 
        id="chrome-safari-no-vpn-guide-card"
        className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-900 dark:to-slate-950 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300"
      >
        <div 
          id="chrome-safari-guide-header"
          onClick={() => setIsVpnOpen(!isVpnOpen)}
          className="px-6 py-4 flex items-center justify-between cursor-pointer select-none hover:bg-teal-100/10 dark:hover:bg-slate-800/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/10">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-teal-900 dark:text-teal-400 font-sans tracking-tight flex items-center gap-2">
                📱 ຄູ່ມືການໃຊ້ງານໃນ Chrome & Safari ໂດຍບໍ່ໃຊ້ VPN (ສຳລັບມືຖື)
                <span className="bg-teal-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  VPN-Free 100%
                </span>
              </h3>
              <p className="text-[10px] sm:text-xs text-teal-700/80 dark:text-slate-400 font-sans mt-0.5">
                ວິທີເປີດແອັບ ແລະ ຕັ້ງຄ່າສິດກ້ອງຖ່າຍຮູບ / GPS ໃນ Chrome ແລະ Safari ໂດຍບໍ່ຕ້ອງໃຊ້ VPN
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isVpnOpen ? (
              <ChevronUp className="w-5 h-5 text-teal-700 dark:text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-teal-700 dark:text-slate-400" />
            )}
          </div>
        </div>

        {isVpnOpen && (
          <div id="chrome-safari-guide-body" className="px-6 pb-6 pt-2 border-t border-teal-100/50 dark:border-slate-800/50 space-y-6 animate-fade-in">
            
            <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-2xl text-xs text-red-900 dark:text-red-300 font-sans space-y-1.5 leading-relaxed">
              <span className="font-extrabold text-red-800 dark:text-red-400 flex items-center gap-1.5 text-xs sm:text-sm">
                🚨 ຄຳເຕືອນສຳຄັນ: ຫ້າມເປີດ VPN ເດັດຂາດ!
              </span>
              <p>
                ເນື່ອງຈາກລະບົບໄດ້ເປີດໃຊ້ງານ <strong>ຈຳກັດເຄືອຂ່າຍພາຍໃນປະເທດລາວ (LTC, Unitel, TPlus)</strong>, ຫາກທ່ານເປີດໃຊ້ງານ VPN (ເຊັ່ນ Opera VPN, 1.1.1.1 WARP, ຫຼື VPN ອື່ນໆ), ລະບົບຈະກວດພົບວ່າທ່ານໃຊ້ IP ຕ່າງປະເທດ ແລະ <strong>ຈະບລັອກບໍ່ໃຫ້ Check-In/Out ທັນທີ!</strong>
              </p>
              <p className="font-bold">
                👉 ກະລຸນາ ປິດ (Turn OFF) VPN ທຸກຊະນິດກ່ອນການລົງເວລາເຮັດວຽກ.
              </p>
            </div>

            <div className="bg-teal-500/10 border-l-4 border-teal-500 p-4 rounded-r-2xl text-xs text-teal-900 dark:text-teal-300 font-sans space-y-1.5 leading-relaxed">
              <span className="font-extrabold text-teal-800 dark:text-teal-400 flex items-center gap-1.5 text-xs sm:text-sm">
                💡 ເປີດແອັບໂດຍບໍ່ໃຊ້ VPN ໃນ Chrome ແລະ Safari ແນວໃດ?
              </span>
              <p>
                ທ່ານສາມາດເປີດໃຊ້ງານແອັບພລິເຄຊັນນີ້ໄດ້ໂດຍກົງ ຜ່ານບຣາວເຊີມາດຕະຖານ <strong>Google Chrome</strong> (ສຳລັບ Android) ຫຼື <strong>Safari</strong> (ສຳລັບ iPhone) ໂດຍພຽງແຕ່ເຊື່ອມຕໍ່ກັບອິນເຕີເນັດມືຖື ຫຼື Wi-Fi ຂອງ <strong>LTC, Unitel, ຫຼື TPlus</strong> ເທົ່ານັ້ນ.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* iOS Safari Guide */}
              <div id="safari-guide-card" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-teal-100/40 dark:border-slate-800 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center">🍎</span>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-950 dark:text-teal-400 font-sans flex items-center gap-1.5">
                    ຕັ້ງຄ່າສິດໃນ iPhone / Safari
                  </h4>
                </div>
                
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                  ຫາກກ້ອງຖ່າຍຮູບບໍ່ຂຶ້ນ ຫຼື ບໍ່ສາມາດດຶງ GPS ໄດ້ໃນ Safari, ໃຫ້ປະຕິບັດຕາມຂັ້ນຕອນນີ້:
                </p>

                <div className="space-y-2 text-[11px] text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                  <div className="flex gap-2">
                    <span className="font-bold text-teal-600 flex-shrink-0">1.</span>
                    <p>ໄປທີ່ <strong>Settings (ການຕັ້ງຄ່າ)</strong> ຂອງ iPhone &gt; ເລືອນລົງໄປຫາແອັບ <strong>Safari</strong></p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-teal-600 flex-shrink-0">2.</span>
                    <p>ເລືອນລົງໄປຫາຫົວຂໍ້ <strong>Camera (ກ້ອງຖ່າຍຮູບ)</strong> &gt; ປ່ຽນເປັນ <strong>Allow (ອະນຸຍາດ)</strong></p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-teal-600 flex-shrink-0">3.</span>
                    <p>ເລືອນຫາຫົວຂໍ້ <strong>Location (ຕຳແໜ່ງ)</strong> &gt; ປ່ຽນເປັນ <strong>Allow (ອະນຸຍາດ)</strong></p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-teal-600 flex-shrink-0">4.</span>
                    <p>ກັບຄືນໄປທີ່ Safari ແລ້ວກົດ <strong>Refresh (ໂຫຼດຄືນໃໝ່) 🔄</strong> ຈະສະແກນໄດ້ທັນທີ 100%!</p>
                  </div>
                </div>
              </div>

              {/* Android Chrome Guide */}
              <div id="chrome-guide-card" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-teal-100/40 dark:border-slate-800 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center">🤖</span>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-950 dark:text-teal-400 font-sans flex items-center gap-1.5">
                    ຕັ້ງຄ່າສິດໃນ Android / Google Chrome
                  </h4>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                  ຫາກກ້ອງຖ່າຍຮູບບໍ່ຂຶ້ນ ຫຼື ບໍ່ສາມາດດຶງ GPS ໄດ້ໃນ Google Chrome, ໃຫ້ປະຕິບັດຕາມຂັ້ນຕອນນີ້:
                </p>

                <div className="space-y-2 text-[11px] text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                  <div className="flex gap-2">
                    <span className="font-bold text-teal-600 flex-shrink-0">1.</span>
                    <p>ເປີດແອັບ <strong>Chrome</strong> ແລ້ວໄປທີ່ເວັບໄຊແອັບພລິເຄຊັນ</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-teal-600 flex-shrink-0">2.</span>
                    <p>ກົດປຸ່ມ **ຮູບຕົວເລືອກຕັ້ງຄ່າ (ຮູບແມ່ກະແຈ 🔒 ຫຼື ປຸ່ມ 3 ຈຸດ)** ຢູ່ເບື້ອງຂວາຂອງແຖບ URL</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-teal-600 flex-shrink-0">3.</span>
                    <p>ເລືອກ <strong>Site settings (ການຕັ້ງຄ່າເວັບໄຊ)</strong></p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-teal-600 flex-shrink-0">4.</span>
                    <p>ກົດອະນຸຍາດ <strong>Camera (ກ້ອງຖ่ายຮູບ)</strong> ແລະ <strong>Location (ຕຳແໜ່ງ)</strong> ໃຫ້ເປັນ "Allowed"</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-teal-600 flex-shrink-0">5.</span>
                    <p>ກັບຄືນໄປທີ່ແອັບ, ກົດ Refresh 🔄 ໂຫຼດແອັບຄືນໃໝ່ ຈະໃຊ້ງານໄດ້ທັນທີ!</p>
                  </div>
                </div>
              </div>

              {/* Solution 4: Camera Permissions in Safari */}
              <div id="ios-solution-4" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-rose-100/40 dark:border-slate-800 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-rose-600 text-white font-extrabold text-xs flex items-center justify-center">4</span>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-rose-400 font-sans flex items-center gap-1.5">
                    📷 ວິທີແກ້ໄຂ "ບໍ່ສາມາດເປີດກ້ອງຖ່າຍຮູບໄດ້"
                  </h4>
                </div>
                
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                  ຫາກທ່ານກົດປຸ່ມ "ສະແກນ QR Code" ແລ້ວພົບຂໍ້ຄວາມແຈ້ງເຕືອນວ່າບໍ່ສາມາດເປີດກ້ອງໄດ້:
                </p>

                <div className="pl-4 border-l-2 border-rose-500 space-y-2 text-[11px] text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                  <p>1. ໄປທີ່ <strong>Settings (ການຕັ້ງຄ່າ)</strong> ຂອງ iPhone &gt; ເລື່ອນລົງໄປຫາ <strong>Safari</strong></p>
                  <p>2. ເລື່ອນລົງລຸ່ມສຸດໃນຫົວຂໍ້ <strong>Camera (ກ້ອງຖ່າຍຮູບ)</strong></p>
                  <p>3. ປ່ຽນຄ່າຈາກ "Ask (ຖາມ)" ຫຼື "Deny" ໃຫ້ເປັນ <strong className="text-rose-600 font-bold">"Allow (ອະນຸຍາດ)"</strong></p>
                  <p>4. ກວດສອບໃນຫົວຂໍ້ <strong>Location (ຕຳແໜ່ງ)</strong> ແລະ ປ່ຽນເປັນ <strong className="text-rose-600 font-bold">"Allow (ອະນຸຍາດ)"</strong> ເຊັ່ນດຽວກັນ</p>
                  <p>5. ກັບຄືນໄປທີ່ແອັບ, ກົດ Refresh 🔄 ແລ້ວສະແກນ QR ອີກຄັ້ງ ຈະໃຊ້ງານໄດ້ຢ່າງສົມບູນ!</p>
                </div>
              </div>

            </div>

            {/* Note about In-App Browsers */}
            <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-xs text-amber-900 dark:text-amber-400 font-sans leading-relaxed flex items-start gap-2.5">
              <Info className="w-4.5 h-4.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>⚠️ ຄຳເຕືອນສຳຄັນ:</strong> ຫາກທ່ານເປີດລິ້ງນີ້ຜ່ານຫ້ອງແຊັດຂອງແອັບອື່ນ (ເຊັ່ນ <strong>Line, Facebook Messenger, WeChat, WhatsApp</strong>), ບຣາວເຊີພາຍໃນແອັບເຫຼົ່ານັ້ນອາດຈະ <strong>ບໍ່ຮອງຮັບການເປີດກ້ອງຖ່າຍຮູບ ແລະ ລະບຸຕຳແໜ່ງ GPS.</strong> 
                <p className="mt-1 font-bold">
                  👉 ວິທີແກ້ໄຂ: ໃຫ້ຄັດລອກລິ້ງແອັບນີ້ແລ້ວນຳໄປວາງເປີດໃນແອັບ Safari ຫຼື Chrome ໂດຍກົງ ເພື່ອໃຫ້ໃຊ້ງານໄດ້ຢ່າງເຕັມປະສິດທິພາບ!
                </p>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* SECTION 2: System Usage Guide */}
      <div 
        id="system-usage-guide-card"
        className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-950 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300"
      >
        <div 
          id="system-usage-header"
          onClick={() => setIsUsageOpen(!isUsageOpen)}
          className="px-6 py-4 flex items-center justify-between cursor-pointer select-none hover:bg-emerald-100/10 dark:hover:bg-slate-800/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/10">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-emerald-900 dark:text-emerald-400 font-sans tracking-tight">
                📖 ຄູ່ມືການໃຊ້ງານ ລະບົບລົງເວລາ ແລະ ການລາພັກ
              </h3>
              <p className="text-[10px] sm:text-xs text-emerald-700/80 dark:text-slate-400 font-sans mt-0.5">
                ຂັ້ນຕອນແນະນຳວິທີນຳໃຊ້ການ ສະແກນ, ການເຂົ້າວຽກປົກກະຕິ, ການປະຈຳການ, ການໄປວຽກນອກ ແລະ ການລາພັກ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isUsageOpen ? (
              <ChevronUp className="w-5 h-5 text-emerald-700 dark:text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-emerald-700 dark:text-slate-400" />
            )}
          </div>
        </div>

        {isUsageOpen && (
          <div id="system-usage-guide-body" className="px-6 pb-6 pt-4 border-t border-emerald-100/50 dark:border-slate-800/50 space-y-6 animate-fade-in">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 📸 QR Scan Guide */}
              <div id="guide-qr-scan" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-emerald-100/40 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                    <QrCode className="w-4.5 h-4.5 animate-bounce" />
                  </div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-200 font-sans">
                    📸 1. ວິທີສະແກນ QR Code (ເຂົ້າ-ອອກວຽກ)
                  </h4>
                </div>
                <div className="space-y-2.5 text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-teal-600">ຂັ້ນຕອນ 1:</span>
                    <p>ກົດປຸ່ມ **"ສະແກນ QR Code ເພື່ອເຂົ້າ/ເລີກວຽກ"** (ປຸ່ມສີຂຽວໃຫຍ່ຢູ່ໜ້າຫຼັກ).</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-teal-600">ຂັ້ນຕອນ 2:</span>
                    <p>ຫາກມີປ໊ອບອັບຂໍສິດເຂົ້າເຖິງກ້ອງຖ່າຍຮູບຈາກບຣາວເຊີ, ໃຫ້ກົດ **"ອະນຸຍາດ (Allow/Grant Permission)"** ສະເໝີ.</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-teal-600">ຂັ້ນຕອນ 3:</span>
                    <p>ນຳບັດພະນັກງານ ຫຼື ລະຫັດ QR Code ສ່ວນຕົວຂອງທ່ານ ມາແນບໃສ່ໜ້າກ້ອງໃຫ້ພໍດີກັບກອບສະແກນ.</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-teal-600">ຂັ້ນຕອນ 4:</span>
                    <p>ລະບົບຈະທຳການກວດສອບພື້ນທີ່ GPS (ຫາກ HR ເປີດໃຊ້ງານ GPS Restrictions) ແລະ ບັນທຶກເວລາພ້ອມສຽງແຈ້ງເຕືອນສຳເລັດ!</p>
                  </div>
                </div>
              </div>

              {/* 🏢 Normal Work Guide */}
              <div id="guide-normal-work" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-emerald-100/40 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                    <UserCheck className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-200 font-sans">
                    🏢 2. ການເຂົ້າວຽກປົກກະຕິ (Normal Work Attendance)
                  </h4>
                </div>
                <div className="space-y-2.5 text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-teal-600">ຂັ້ນຕອນ 1:</span>
                    <p>ໃນແຖບສະຖານະ, ເລືອກຫົວຂໍ້ **"ເຂົ້າວຽກປົກກະຕິ"** (ເປັນຄ່າເລີ່ມຕົ້ນຂອງລະບົບ).</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-teal-600">ຂັ້ນຕອນ 2:</span>
                    <p>**ການ Check-In:** ຕ້ອງສະແກນ ຫຼື ກົດເຂົ້າວຽກໃນລະຫວ່າງ **08:00 ຫາ 08:30 ໂມງ** ເພື່ອໃຫ້ສະຖານະເປັນ **"ທັນເວລາ"**. ຫາກກາຍເວລານີ້ ຈະຖືກໝາຍວ່າ **"ມາຊ້າ"**.</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-teal-600">ຂັ້ນຕອນ 3:</span>
                    <p>**ການ Check-Out:** ຕ້ອງສະແກນ ຫຼື ກົດເລີກວຽກໃນລະຫວ່າງ **15:40 ຫາ 18:00 ໂມງ** ເພື່ອບັນທຶກເວລາເລີກວຽກຢ່າງສົມບູນ.</p>
                  </div>
                  <div className="flex items-start gap-1.5 text-rose-500 font-semibold">
                    <span>⚠️ ຄຳເຕືອນ:</span>
                    <p>ຫາກຮອດເວລາແລ້ວຍັງບໍ່ທັນ Check-In ຫຼັງ 08:30 ໂມງ ຫຼື Check-Out ຫຼັງ 18:00 ໂມງ ລະບົບຈະສົ່ງການແຈ້ງເຕືອນລືມອັດຕະໂນມັດ!</p>
                  </div>
                </div>
              </div>

              {/* 📅 Presence Guide */}
              <div id="guide-presence" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-emerald-100/40 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                    <CalendarDays className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-200 font-sans">
                    📅 3. ການປະຈຳການ (On-Duty / Shift Duty)
                  </h4>
                </div>
                <div className="space-y-2.5 text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-indigo-600">ເງື່ອນໄຂ:</span>
                    <p>ປຸ່ມລົງທະບຽນປະຈຳການຈະເປີດໃຫ້ໃຊ້ງານ **ສະເພາະວັນເສົາ ແລະ ວັນອາທິດ** ເທົ່ານັ້ນ.</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-indigo-600">ຂັ້ນຕອນ 1:</span>
                    <p>ເລືອກເມນູ **"ປະຈຳການ (ວັນເສົາ, ວັນອາທິດ)"** ໃນສ່ວນເລືອກສະຖານະ.</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-indigo-600">ຂັ້ນຕອນ 2:</span>
                    <p>ເລືອກຮູບແບບປະຈຳການ (ເສົາ-ອາທິດ, ວັນເສົາ, ຫຼື ວັນອາທິດ), ເລືອກເດືອນປະຈຳການ ແລະ ປ້ອນ **"ເນື້ອໃນໃນການປະຈຳການ"** (ຕ້ອງການ).</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-indigo-600">ຂັ້ນຕອນ 3:</span>
                    <p>ກົດປຸ່ມ **"CHECK IN"** ຫຼື ທຳການສະແກນ QR Code ເພື່ອລົງທະບຽນປະຈຳການໃຫ້ສຳເລັດ.</p>
                  </div>
                </div>
              </div>

              {/* 🚗 Offsite Work Guide */}
              <div id="guide-offsite" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-emerald-100/40 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <Briefcase className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-200 font-sans">
                    🚗 4. ການໄປວຽກນອກ (Offsite Work)
                  </h4>
                </div>
                <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-amber-600">1.</span>
                    <p>ຫາກທ່ານມີຄວາມຈຳເປັນຕ້ອງໄປປະຕິບັດວຽກນອກສະຖານທີ່, ໃຫ້ເລືອກເມນູ **"ໄປວຽກນອກ"** ຢູ່ໜ້າຫຼັກ.</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-amber-600">2.</span>
                    <p>ກະລຸນາປ້ອນສະຖານທີ່, ເຫດຜົນ ຫຼື ຈຸດປະສົງໃນການໄປ ແລະ ເວລາປະຕິບັດວຽກໃຫ້ຄົບຖ້ວນ.</p>
                  </div>
                  <div className="flex items-start gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="font-bold">✨ ຈຸດສຳຄັນ:</span>
                    <p>ເມື່ອທ່ານໄດ້ຮັບການລົງສະຖານະ "ໄປວຽກນອກ" ແລ້ວ, **ລະບົບຈະປິດການສົ່ງແຈ້ງເຕືອນລືມ Check-In/Check-Out** ທັນທີ ເພື່ອບໍ່ໃຫ້ລົບກວນທ່ານ.</p>
                  </div>
                </div>
              </div>

              {/* 📝 Leave Guide */}
              <div id="guide-leave" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-emerald-100/40 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-200 font-sans">
                    📝 5. ການລາພັກ (Leave Request)
                  </h4>
                </div>
                <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-rose-600">1.</span>
                    <p>ກົດສົ່ງຄຳຮ້ອງຂໍລາພັກໄດ້ທີ່ເມນູ **"ສະເໜີລາພັກ"** ໃນແອັບພລິເຄຊັນ.</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-rose-600">2.</span>
                    <p>ເລືອກປະເພດການລາພັກໃຫ້ຖືກຕ້ອງ: ລາພັກປະຈຳປີ, ລາພັກເຈັບໄຂ້, ລາພັກຈຳເປັນ, ຫຼື ລາພັກທົດແທນ.</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-rose-600">3.</span>
                    <p>ລະບຸວັນທີເລີ່ມຕົ້ນ - ສິ້ນສຸດ ແລະ ປ້ອນເຫດຜົນປະກອບໃຫ້ຊັດເຈນ ເພື່ອໃຫ້ HR ອະນຸມັດ.</p>
                  </div>
                  <div className="flex items-start gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="font-bold">✨ ຈຸດສຳຄັນ:</span>
                    <p>ພະນັກງານທີ່ສະເໜີລາພັກສຳເລັດ (ແລະ ໄດ້ຮັບການອະນຸມັດ) **ຈະບໍ່ໄດ້ຮັບການແຈ້ງເຕືອນລືມ Check-In/Check-Out** ໃນວັນດັ່ງກ່າວຢ່າງເດັດຂາດ.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Summary/Tip Banner */}
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-300 font-sans leading-relaxed flex items-start gap-2.5">
              <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>💡 ຂໍ້ແນະນຳເພີ່ມເຕີມ:</strong> ການຮັກສາສະຖານະການເຂົ້າວຽກໃຫ້ຖືກຕ້ອງ ເປັນສິ່ງສຳຄັນຕໍ່ການຄິດໄລ່ເງິນເດືອນ ແລະ ສະຖິຕິການເຮັດວຽກ. ກະລຸນາກວດສອບປະຫວັດການລົງເວລາຂອງທ່ານເປັນປະຈຳທຸກວັນຢູ່ທີ່ສ່ວນ **"ປະຫວັດການລົງເວລາ"** ໃນແອັບພລິເຄຊັນຂອງທ່ານເອງ.
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
