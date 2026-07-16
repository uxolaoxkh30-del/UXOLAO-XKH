import React from 'react';
import { motion } from 'motion/react';
import { 
  QrCode, 
  MapPin, 
  CalendarCheck, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Smartphone, 
  Laptop, 
  HelpCircle, 
  Award, 
  Clock, 
  FileSpreadsheet,
  Globe
} from 'lucide-react';

interface HomeLandingProps {
  onNavigate: (view: 'employee' | 'hr') => void;
  onOpenMobileGuide: () => void;
  employeeCount: number;
  todayCheckInCount: number;
}

export function HomeLanding({ onNavigate, onOpenMobileGuide, employeeCount, todayCheckInCount }: HomeLandingProps) {
  const [isBlockedDomain, setIsBlockedDomain] = React.useState(false);
  const [currentHostname, setCurrentHostname] = React.useState('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      setCurrentHostname(host);
      setIsBlockedDomain(host.includes('run.app'));
    }
  }, []);

  return (
    <div className="space-y-12 py-4 animate-fade-in">
      {/* Hero Banner Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 rounded-3xl overflow-hidden shadow-xl border border-slate-700/30 text-white p-8 md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.15),transparent_50%)]" />
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-3xl space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 px-3.5 py-1.5 rounded-full text-teal-400 text-xs font-bold font-sans"
          >
            <Award className="w-4 h-4 animate-pulse" />
            <span>ເວີຊັນໃໝ່ລ້າສຸດ 2026 • ລະບົບທັນສະໄໝ 100%</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-extrabold font-sans tracking-tight leading-tight">
            ລະບົບໝາຍວັນງານ <br className="hidden md:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              ແລະ ຄຸ້ມຄອງເວລາເຮັດວຽກພະນັກງານ
            </span>
          </h2>
          
          <p className="text-sm md:text-base text-slate-300 font-sans leading-relaxed max-w-2xl">
            ເວັບໄຊ້ບໍລິການຈັດການຂໍ້ມູນເຂົ້າ-ອອກວຽກ, ການລາພັກ, ແລະ ການມອບໝາຍວັນງານຂອງພະນັກງານໃນອົງກອນ 
            ຮອງຮັບການສະແກນ QR Code ບັດພະນັກງານ ແລະ ການກວດສອບພື້ນທີ່ GPS Geo-fencing ຜ່ານໂທລະສັບມືຖືຢ່າງຖືກຕ້ອງ.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4 max-w-md pt-2">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">ພະນັກງານທັງໝົດ</div>
              <div className="text-xl md:text-2xl font-extrabold text-teal-400 font-sans mt-0.5">{employeeCount} ຄົນ</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">ລົງເວລາແລ້ວມື້ນີ້</div>
              <div className="text-xl md:text-2xl font-extrabold text-emerald-400 font-sans mt-0.5">{todayCheckInCount} ລາຍການ</div>
            </div>
          </div>

          {/* Call To Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('employee')}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-extrabold text-sm px-6 py-4 rounded-2xl shadow-lg shadow-teal-500/20 transition-all cursor-pointer font-sans"
            >
              <Smartphone className="w-5 h-5" />
              <span>ເຂົ້າສູ່ລະບົບພະນັກງານ (ລົງເວລາ)</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('hr')}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 font-extrabold text-sm px-6 py-4 rounded-2xl transition-all cursor-pointer font-sans"
            >
              <Laptop className="w-5 h-5" />
              <span>ເຂົ້າສູ່ລະບົບ ຝ່າຍບຸກຄົນ (HR)</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Access Warning / Mobile Network Notice */}
      <div className={`border rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm ${
        isBlockedDomain 
          ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-900 dark:text-slate-100" 
          : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-950 dark:text-slate-100"
      }`}>
        <div className="flex gap-4">
          <div className={`p-3 text-white rounded-2xl flex-shrink-0 shadow-sm self-start ${
            isBlockedDomain ? "bg-amber-500" : "bg-emerald-500"
          }`}>
            {isBlockedDomain ? <HelpCircle className="w-6 h-6 animate-pulse" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-extrabold font-sans">
              {isBlockedDomain 
                ? "📱 ວິທີແກ້ໄຂເປີດລິ້ງໃນມືຖື ແລະ ຄອມພິວເຕີ ໃນລາວ (LTC, Unitel, TPlus)" 
                : "🎉 ລະບົບພ້ອມໃຊ້ງານ 100% ຜ່ານທຸກເຄືອຂ່າຍໃນລາວ!"}
            </h3>
            <p className="text-xs leading-relaxed font-sans max-w-2xl text-slate-700 dark:text-slate-300">
              {isBlockedDomain ? (
                <>
                  ເຄືອຂ່າຍມືຖືໃນລາວ (LTC, Unitel, TPlus) ມີບັນຫາ <strong>DNS Block</strong> ກັບໂດເມນ <code className="bg-amber-500/15 px-1 py-0.5 rounded font-mono text-amber-700 dark:text-amber-400 font-bold">.run.app</code> ຂອງ Google Cloud ໂດຍກົງ. ເພື່ອໃຫ້ພະນັກງານເປີດໄດ້ 100% ໂດຍບໍ່ຕ້ອງໃຊ້ VPN ຫຼື ປ່ຽນ DNS, ກະລຸນາກົດປຸ່ມດ້ານຂວາເພື່ອເບິ່ງຄູ່ມືການຕິດຕັ້ງໂດເມນສ່ວນຕົວຟຣີ!
                </>
              ) : (
                <>
                  ຍິນດີດ້ວຍ! ທ່ານກຳລັງເຂົ້າໃຊ້ງານຜ່ານໂດເມນປົດບລັອກ <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">{currentHostname}</strong> ແລ້ວ. ພະນັກງານທຸກຄົນສາມາດເປີດແອັບນີ້ໃນ Chrome & Safari ໄດ້ໂດຍກົງ ໂດຍບໍ່ຈຳເປັນຕ້ອງມີ VPN ຫຼື ປ່ຽນຄ່າ DNS ໃດໆທັງສິ້ນ!
                </>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={onOpenMobileGuide}
          className={`w-full md:w-auto text-center px-6 py-3 text-white text-xs font-bold font-sans rounded-2xl transition-all shadow-md cursor-pointer whitespace-nowrap ${
            isBlockedDomain 
              ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/10" 
              : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10"
          }`}
        >
          {isBlockedDomain ? "📱 ເບິ່ງວິທີປົດບລັອກ & ແກ້ໄຂ" : "⚙️ ຕັ້ງຄ່າ / ເບິ່ງຄູ່ມືເພີ່ມເຕີມ"}
        </button>
      </div>

      {/* Core Features Overview */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white font-sans tracking-tight">
            ຄຸນສົມບັດຫຼັກຂອງລະບົບ (Core Features)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            ທຸກຄຸນສົມບັດຖືກອອກແບບມາເພື່ອອໍານວຍຄວາມສະດວກໃຫ້ແກ່ພະນັກງານ ແລະ ຝ່າຍບຸກຄົນຢ່າງມີປະສິດທິພາບ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: QR Code Scanner */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-sans">
                ສະແກນ QR Code ບັດພະນັກງານ
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                ພະນັກງານພຽງແຕ່ຍື່ນບັດ QR Code ຂອງຕົນໃສ່ກ້ອງ, ລະບົບຈະທຳການ Check-in ຫຼື Check-out ໃຫ້ໂດຍອັດຕະໂນມັດທັນທີ ໂດຍບໍ່ຕ້ອງປ້ອນຂໍ້ມູນໃດໆ.
              </p>
            </div>
          </div>

          {/* Card 2: GPS Fencing */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-sans">
                ກວດສອບພື້ນທີ່ GPS (Geo-Fencing)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                HR ສາມາດເປີດໃຊ້ລະບົບຈຳກັດພື້ນທີ່, ເພື່ອໃຫ້ພະນັກງານສາມາດລົງເວລາໄດ້ສະເພາະເວລາຢູ່ໃນຂອບເຂດບໍລິສັດ (ເຊັ່ນ: ລັດສະໝີ 200 ແມັດ) ເທົ່ານັ້ນ.
              </p>
            </div>
          </div>

          {/* Card 3: Shift Management */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-sans">
                ຈັດຕາຕະລາງ ແລະ ໝາຍວັນງານ
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                ຈັດການກະລິ ຫຼື ກະເຮັດວຽກຂອງພະນັກງານ, ໝາຍວັນພັກ, ວັນເຮັດວຽກພິເສດ ແລະ ກວດສອບຄວາມກົງຕໍ່ເວລາໃນແຕ່ລະວັນຢ່າງຊັດເຈນ.
              </p>
            </div>
          </div>

          {/* Card 4: Leave Requests */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-sans">
                ສົ່ງໃບລາພັກ ແລະ ໄປວຽກນອກ
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                ພະນັກງານສາມາດສົ່ງຄຳຮ້ອງຂໍລາພັກ (ພັກຜ່ອນ, ເຈັບໄຂ້, ວຽກສ່ວນຕົວ) ຫຼື ລົງທະບຽນອອກໄປເຮັດວຽກນອກສະຖານທີ່ຜ່ານມື້ຖືໄດ້ຢ່າງສະດວກ.
              </p>
            </div>
          </div>

          {/* Card 5: Real-time Notification */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-sans">
                ລະບົບແຈ້ງເຕືອນ ແລະ ຄວາມປອດໄພ
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                ແຈ້ງເຕືອນທັນທີເມື່ອມີການລົງເວລາພ້ອມສຽງແຈ້ງເຕືອນ ແລະ ລະບົບປ້ອງກັນການປອມແປງຂໍ້ມູນເວລາ Check-in / Out ຂອງພະນັກງານ.
              </p>
            </div>
          </div>

          {/* Card 6: Reports & Export */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-sans">
                ລາຍງານ ແລະ ສົ່ງອອກ Excel
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                ຝ່າຍບຸກຄົນ (HR) ສາມາດກວດສອບສະຖິຕິການເຂົ້າຮ່ວມ, ວັນຂາດ, ວັນລາ, ສົ່ງອອກໄຟລ໌ Excel, ແລະ ຈັດການກູ້ຄືນຂໍ້ມູນໄດ້ທັນທີ.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Mobile App Install Guide */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800/85 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white font-sans">
              ວິທີຕິດຕັ້ງເປັນ Web App ຢູ່ໜ້າຈໍໂທລະສັບ (PWA Web App)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
              ເພີ່ມຄວາມສະດວກໃນການລົງເວລາໃນແຕ່ລະວັນ ໂດຍການເອົາແອັບໄວ້ໜ້າຈໍໂຮລະສັບຄືກັບແອັບທົ່ວໄປ!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-700 dark:text-slate-300 font-sans pl-2">
          {/* iOS Safari */}
          <div className="space-y-2 border-l-2 border-teal-500 pl-4">
            <h4 className="font-extrabold text-slate-800 dark:text-slate-200">🍏 ສຳລັບ iPhone (iOS):</h4>
            <ol className="list-decimal pl-4 space-y-1 text-slate-500 dark:text-slate-400">
              <li>ເປີດລິ້ງເວັບໄຊນີ້ໃນບຣາວເຊີ <strong>Safari</strong></li>
              <li>ກົດປຸ່ມ <strong>Share (ຮູບກ່ອງມີລູກສອນຂຶ້ນ 📤)</strong> ຢູ່ແຖບດ້ານລຸ່ມ</li>
              <li>ເລື່ອນລົງແລ້ວເລືອກ <strong>"Add to Home Screen" (ເພີ່ມໃສ່ໜ້າຈໍຫຼັກ ➕)</strong></li>
              <li>ກົດ <strong>Add (ເພີ່ມ)</strong> ຢູ່ມຸມຂວາເທິງ, ທ່ານຈະໄດ້ແອັບຢູ່ໜ້າຈໍທັນທີ!</li>
            </ol>
          </div>

          {/* Android Chrome */}
          <div className="space-y-2 border-l-2 border-emerald-500 pl-4">
            <h4 className="font-extrabold text-slate-800 dark:text-slate-200">🤖 ສຳລັບ Android (Samsung, etc.):</h4>
            <ol className="list-decimal pl-4 space-y-1 text-slate-500 dark:text-slate-400">
              <li>ເປີດລິ້ງເວັບໄຊນີ້ໃນບຣາວເຊີ <strong>Google Chrome</strong></li>
              <li>ກົດປຸ່ມ <strong>ເມນູ 3 ຈຸດ (⋮)</strong> ຢູ່ມຸມຂວາເທິງ</li>
              <li>ເລືອກ <strong>"Add to Home screen" (ເພີ່ມໃສ່ໜ້າຈໍຫຼັກ)</strong> ຫຼື <strong>"Install app"</strong></li>
              <li>ກົດ <strong>Add/Install</strong>, ລະບົບຈະສ້າງໄອຄອນແອັບຢູ່ໜ້າຈໍມືຖືຂອງທ່ານທັນທີ!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
