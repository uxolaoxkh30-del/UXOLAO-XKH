import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  X, 
  HelpCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  Compass, 
  Chrome, 
  Network, 
  Wifi, 
  ShieldCheck, 
  Info,
  AlertTriangle,
  CheckCircle,
  Apple,
  Settings,
  Lock,
  Globe
} from 'lucide-react';

export function MobileLinkGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedDev, setCopiedDev] = useState(false);
  const [copiedPre, setCopiedPre] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'quick' | 'ios' | 'android' | 'browser' | 'admin'>('quick');

  const [sharedPreUrl, setSharedPreUrl] = useState("https://lao-hr-attendance.vercel.app");
  const [developmentUrl, setDevelopmentUrl] = useState("https://ais-dev-qmhxuah63lqalyzr3tvskk-290613800212.asia-east1.run.app");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
      const origin = window.location.origin;
      if (!origin.includes('ais-dev-') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        setSharedPreUrl(origin);
      } else {
        setSharedPreUrl("https://lao-hr-attendance.vercel.app");
      }
    }
  }, []);

  const handleCopyLink = (url: string, type: 'dev' | 'pre') => {
    navigator.clipboard.writeText(url).then(() => {
      if (type === 'dev') {
        setCopiedDev(true);
        setTimeout(() => setCopiedDev(false), 2000);
      } else {
        setCopiedPre(true);
        setTimeout(() => setCopiedPre(false), 2000);
      }
    }).catch(err => {
      console.error('Failed to copy link:', err);
    });
  };

  const isCurrentDev = currentUrl.includes('ais-dev-');

  return (
    <>
      {/* Floating Action Button (Only visible on mobile/tablet) */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          id="btn-floating-mobile-guide"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold font-sans text-xs px-4 py-3 rounded-full shadow-lg hover:shadow-teal-600/30 transition-all border border-teal-500/30 cursor-pointer"
        >
          <Smartphone className="w-4 h-4 animate-bounce" />
          <span>📱 ວິທີແກ້ໄຂເປີດລິ້ງໃນມືຖືບໍ່ໄດ້</span>
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute -top-0.5 -right-0.5" />
        </motion.button>
      </div>

      {/* Inline Warning Alert Banner for dashboard */}
      <div 
        id="mobile-alert-banner"
        className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-950 rounded-2xl border border-amber-200 dark:border-slate-800 p-4 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl flex-shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-amber-900 dark:text-amber-400 font-sans tracking-tight">
                📱 ສາເຫດ ແລະ ວິທີແກ້ໄຂ ເປີດລິ້ງໃນໂທລະສັບມືຖືບໍ່ໄດ້! (ຄລິກທີ່ນີ້)
              </h4>
              <p className="text-[11px] text-amber-700/90 dark:text-slate-400 font-sans mt-0.5 leading-relaxed">
                {isCurrentDev ? (
                  <span className="text-red-600 dark:text-red-400 font-bold">
                    ⚠️ ທ່ານກຳລັງເປີດ "ລິ້ງພັດທະນາສ່ວນຕົວ" (ais-dev) ເຊິ່ງລະບົບຈະບລັອກບໍ່ໃຫ້ມືຖືທົ່ວໄປເປີດໄດ້! ຕ້ອງໃຊ້ລິ້ງແບ່ງປັນສາທາລະນະ (ais-pre) ແທນ.
                  </span>
                ) : (
                  <span>ເຄືອຂ່າຍ LTC, Unitel, TPlus ບາງຄັ້ງອາດມີບັນຫາ DNS ບລັອກລິ້ງ, ຫຼື ເປີດໃນ LINE / Facebook ແລ້ວສະແກນ QR ບໍ່ໄດ້.</span>
                )}
              </p>
            </div>
          </div>
          <button
            id="btn-open-mobile-guide-banner"
            onClick={() => setIsOpen(true)}
            className="w-full sm:w-auto text-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold font-sans rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            ເບິ່ງວິທີແກ້ໄຂ 100% ໄດ້ຜົນ
          </button>
        </div>
      </div>

      {/* Modal Guide Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Smartphone className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold font-sans tracking-tight">
                      ຄູ່ມືແກ້ໄຂການເປີດລິ້ງໃນມືຖື (Mobile Troubleshooting Guide)
                    </h3>
                    <p className="text-[10px] sm:text-xs text-teal-100/90 font-sans">
                      ແກ້ໄຂບັນຫາເປີດລິ້ງບໍ່ໄດ້, ບັນຫາເຄືອຂ່າຍບລັອກ DNS, ແລະ ວິທີເປີດກ້ອງ/GPS
                    </p>
                  </div>
                </div>
                <button
                  id="btn-close-mobile-guide"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* URL sharing block */}
              <div className="bg-amber-500/5 dark:bg-amber-500/10 p-4 border-b border-slate-100 dark:border-slate-800/50 space-y-3.5">
                <div className="flex flex-col gap-2.5 bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 text-xs text-rose-900 dark:text-rose-400">
                  <div className="flex items-start gap-2">
                    <Lock className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="font-extrabold text-sm text-rose-800 dark:text-rose-300">⚠️ ສາເຫດທີ່ເປີດລິ້ງ Google Cloud Run (.run.app) ໃນໂທລະສັບບໍ່ໄດ້:</strong>
                      <p className="text-[11px] mt-1 leading-relaxed text-slate-700 dark:text-slate-300">
                        ລິ້ງທີ່ຂຶ້ນຕົ້ນດ້ວຍ <code className="bg-white/60 dark:bg-black/30 px-1 rounded font-mono text-red-600 font-bold">ais-dev-...</code> ຫຼື <code className="bg-white/60 dark:bg-black/30 px-1 rounded font-mono text-red-600 font-bold">ais-pre-...</code> (.run.app) ແມ່ນລິ້ງທົດສອບຄວາມປອດໄພສ່ວນຕົວຂອງ Google AI Studio. 
                        <strong className="text-red-600 dark:text-red-400"> ລະບົບຈະອະນຸຍາດໃຫ້ສະເພາະແຕ່ຄອມພິວເຕີຂອງທ່ານເອງເຂົ້າເບິ່ງໄດ້ເທົ່ານັ້ນ!</strong> ຫາກເປີດໃນໂທລະສັບ ຫຼື ໃຫ້ພະນັກງານຄົນອື່ນເປີດ ຈະຂຶ້ນໜ້າຈໍຂາວ, Error 403, ໝູນຕະຫຼອດ ຫຼື ຖາມຫາສິດເຂົ້າເຖິງ.
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-rose-500/20 pt-2.5 mt-1">
                    <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                      ✅ ວິທີແກ້ໄຂ: ຕ້ອງໃຊ້ລິ້ງ Vercel ທີ່ທ່ານໄດ້ Deploy ສໍາເລັດແລ້ວ!
                    </strong>
                    <p className="text-[11.5px] mt-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                      ລິ້ງ Vercel ແມ່ນສາທາລະນະ 100% ສາມາດເຂົ້າໄດ້ຈາກໂທລະສັບທຸກເຄື່ອງ ແລະ ພະນັກງານທຸກຄົນ. 
                      ແຕ່ຫາກເຄືອຂ່າຍມືຖືໃນລາວ (LTC, Unitel, TPlus) ບາງເຄື່ອງມີບັນຫາ DNS ຈຳກັດໂດເມນ <code className="font-mono font-bold">.vercel.app</code>, ໃຫ້ເຮັດຕາມ <strong>ວິທີທີ 1 (ໃຊ້ແອັບ 1.1.1.1)</strong> ດ້ານລຸ່ມນີ້ ຈະເຂົ້າໄດ້ 100% ທັນທີ!
                    </p>
                  </div>
                </div>

                {/* Shared Link Block */}
                <div className="space-y-1.5 bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" /> 🔗 ລິ້ງເວັບໄຊສາທາລະນະ (Vercel Link - ກະລຸນາໃຊ້ລິ້ງນີ້ໃນໂທລະສັບ!)
                    </span>
                    <span className="bg-emerald-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                      Public URL
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value="https://lao-hr-attendance.vercel.app" 
                      className="w-full text-xs font-mono bg-white dark:bg-slate-950 border border-emerald-200 dark:border-slate-800 px-3 py-2 rounded-xl text-emerald-800 dark:text-emerald-300 font-bold select-all"
                    />
                    <button
                      onClick={() => handleCopyLink("https://lao-hr-attendance.vercel.app", 'pre')}
                      className="flex items-center justify-center p-2.5 bg-white dark:bg-slate-950 text-emerald-600 hover:text-emerald-700 border border-emerald-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer shadow-sm flex-shrink-0"
                      title="ຄັດລອກລິ້ງສາທາລະນະ"
                    >
                      {copiedPre ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => window.open("https://lao-hr-attendance.vercel.app", '_blank')}
                      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex-shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>ເປີດ</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans pl-1">
                    * ສົ່ງລິ້ງນີ້ໃຫ້ພະນັກງານຂອງທ່ານຜ່ານທາງ LINE / WhatsApp ເພື່ອໃຫ້ທຸກຄົນສາມາດລົງເວລາເຮັດວຽກຜ່ານມືຖືໄດ້.
                  </p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-2 overflow-x-auto gap-1">
                <button
                  onClick={() => setActiveTab('quick')}
                  className={`px-3 py-2 rounded-xl font-bold font-sans text-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'quick'
                      ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm border border-slate-100 dark:border-slate-750'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>⚡ ວິທີທີ 1: ແກ້ເຄືອຂ່າຍ LTC/Unitel (DNS)</span>
                </button>
                <button
                  onClick={() => setActiveTab('browser')}
                  className={`px-3 py-2 rounded-xl font-bold font-sans text-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'browser'
                      ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm border border-slate-100 dark:border-slate-750'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>💬 ວິທີທີ 2: ແກ້ LINE / Facebook</span>
                </button>
                <button
                  onClick={() => setActiveTab('ios')}
                  className={`px-3 py-2 rounded-xl font-bold font-sans text-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'ios'
                      ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm border border-slate-100 dark:border-slate-750'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Apple className="w-3.5 h-3.5" />
                  <span>🍎 ວິທີທີ 3: ຕັ້ງຄ່າ iPhone</span>
                </button>
                <button
                  onClick={() => setActiveTab('android')}
                  className={`px-3 py-2 rounded-xl font-bold font-sans text-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'android'
                      ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm border border-slate-100 dark:border-slate-750'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Chrome className="w-3.5 h-3.5" />
                  <span>🤖 ວິທີທີ 4: ຕັ້ງຄ່າ Android</span>
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-3 py-2 rounded-xl font-bold font-sans text-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'admin'
                      ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm border border-slate-100 dark:border-slate-750'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-amber-500" />
                  <span>👑 HR Admin: ວິທີແກ້ໄຂຖາວອນ (Custom Domain)</span>
                </button>
              </div>

              {/* Tab Content Box */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                
                {activeTab === 'quick' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-4 rounded-xl text-xs text-emerald-900 dark:text-emerald-400 font-sans leading-relaxed">
                      <span className="font-extrabold flex items-center gap-1.5 text-xs sm:text-sm">
                        💡 ສາເຫດຫຼັກທີ 2: ບັນຫາ DNS ຂອງເຄືອຂ່າຍມືຖືໃນລາວ (LTC, Unitel, TPlus)
                      </span>
                      <p className="mt-1">
                        ເຄືອຂ່າຍອິນເຕີເນັດໃນລາວບາງຄັ້ງບໍ່ສາມາດແປງຊື່ເວັບໄຊ `.run.app` ຂອງ Google Cloud ໄດ້, ເຮັດໃຫ້ເປີດລິ້ງແລ້ວຂຶ້ນ "ບໍ່ສາມາດເຂົ້າເຖິງເວັບໄຊນີ້ໄດ້" (Site can't be reached) ຫຼື ໂຫຼດໝູນຕະຫຼອດ. ວິທີແກ້ໄຂມີດັ່ງນີ້:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Step A */}
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center">1</span>
                          <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-200">ປິດ/ເປີດ ໂໝດເຮືອບິນ ຫຼື ປ່ຽນ Wi-Fi</h4>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                          ໃຫ້ທຳການເປີດ <strong>Airplane Mode (ໂໝດເຮືອບິນ)</strong> ປະໄວ້ 5 ວິນາທີແລ້ວປິດ ເພື່ອໃຫ້ໂທລະສັບຣີເຊັດສັນຍານ ແລະ ດຶງ DNS ໃໝ່, ຫຼື ລອງປ່ຽນຈາກ Wi-Fi ມາໃຊ້ 3G/4G/5G ຂອງມືຖືແທນ.
                        </p>
                      </div>

                      {/* Step B */}
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center">2</span>
                          <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-200">ໃຊ້ແອັບ 1.1.1.1 (WARP)</h4>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                          ວິທີນີ້ໄດ້ຜົນ 100%! ພຽງແຕ່ດາວໂຫຼດແອັບ <strong>1.1.1.1: Faster Internet</strong> (ຟຣີໃນ App Store & Play Store) ແລ້ວກົດເປີດເຊື່ອມຕໍ່. ທ່ານຈະສາມາດເປີດລິ້ງໄດ້ທັນທີໂດຍບໍ່ມີການບລັອກໃດໆ.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-400 font-sans flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>ຄຳແນະນຳເພີ່ມເຕີມ:</strong> ກະລຸນາກວດສອບໃຫ້ແນ່ໃຈວ່າໄດ້ໃຊ້ <strong>ລິ້ງສີຂຽວ (Public Link)</strong> ດ້ານເທິງ, ເພາະລິ້ງສ່ວນຕົວຂອງນັກພັດທະນາ (Dev Link) ຈະບໍ່ສາມາດເປີດໄດ້ໃນມືຖືອື່ນ ເຖິງແມ່ນວ່າຈະປ່ຽນເຄືອຂ່າຍແລ້ວກໍຕາມ.
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'browser' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-rose-500/10 border-l-4 border-rose-500 p-4 rounded-xl text-xs text-rose-950 dark:text-rose-400 font-sans leading-relaxed">
                      <span className="font-extrabold text-xs sm:text-sm text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
                        ⚠️ ບັນຫາຈາກການເປີດລິ້ງຜ່ານ LINE, Messenger, Facebook, WeChat
                      </span>
                      <p className="mt-1">
                        ຫາກທ່ານກົດເປີດລິ້ງນີ້ຈາກຫ້ອງແຊັດ LINE ຫຼື Messenger ໂດຍກົງ, ລະບົບບຣາວເຊີໃນແອັບເຫຼົ່ານັ້ນ <strong>ຈະບລັອກການເຂົ້າເຖິງ ກ້ອງຖ່າຍຮູບ (Camera)</strong> ແລະ <strong>ຕຳແໜ່ງ (GPS Location)</strong> ເຮັດໃຫ້ບໍ່ສາມາດສະແກນ QR ຫຼື ລົງເວລາໄດ້!
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        👉 ວິທີແກ້ໄຂທີ່ຖືກຕ້ອງ:
                      </h4>
                      <div className="pl-4 border-l-2 border-teal-500 space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-sans">
                        <p>
                          1. <strong>ຄັດລອກລິ້ງ (Copy Link):</strong> ກົດປຸ່ມຄັດລອກລິ້ງແອັບພລິເຄຊັນດ້ານເທິງ.
                        </p>
                        <p>
                          2. <strong>ເປີດໃນບຣາວເຊີຫຼັກ (Open in Main Browser):</strong> 
                        </p>
                        <div className="pl-4 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <p>• <strong>ສຳລັບ iPhone (iOS):</strong> ໃຫ້ເປີດແອັບ <span className="font-bold text-slate-800 dark:text-white">Safari</span> ແລ້ວນຳລິ້ງໄປວາງ (Paste) ເພື່ອເປີດ.</p>
                          <p>• <strong>ສຳລັບ Android (Samsung, etc.):</strong> ໃຫ້ເປີດແອັບ <span className="font-bold text-slate-800 dark:text-white">Google Chrome</span> ແລ້ວນຳລິ້ງໄປວາງເພື່ອເປີດ.</p>
                        </div>
                        <p>
                          3. <strong>ອະນຸຍາດ Camera & Location:</strong> ເມື່ອມີປ໊ອບອັບຖາມ, ໃຫ້ກົດ **"ອະນຸຍາດ (Allow)"** ທ່ານກໍຈະສະແກນ ແລະ ລົງເວລາໄດ້ຢ່າງສົມບູນ.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'ios' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-indigo-500/10 border-l-4 border-indigo-500 p-4 rounded-xl text-xs text-indigo-950 dark:text-indigo-400 font-sans">
                      <span className="font-extrabold text-indigo-800 dark:text-indigo-400 flex items-center gap-1.5">
                        🍎 ວິທີຕັ້ງຄ່າສິດ ແລະ ແກ້ໄຂລິ້ງສຳລັບ iPhone (iOS)
                      </span>
                      <p className="mt-1">
                        ຫາກໃຊ້ iPhone ແລ້ວເປີດລິ້ງບໍ່ໄດ້ ຫຼື ເປີດກ້ອງຖ່າຍຮູບບໍ່ໄດ້, ໃຫ້ປະຕິບັດຕາມ 2 ວິທີດ້ານລຸ່ມນີ້:
                      </p>
                    </div>

                    {/* Option 1: Change DNS on Wi-Fi */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                      <span className="bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-bold px-2 py-0.5 rounded">
                        ວິທີ A: ຕັ້ງຄ່າ DNS ໃນ Wi-Fi ຂອງ iPhone (ແກ້ໄຂເປີດລິ້ງບໍ່ໄດ້)
                      </span>
                      <div className="pl-4 border-l-2 border-teal-500 space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-sans">
                        <p>1. ໄປທີ່ <strong>Settings (ການຕັ້ງຄ່າ)</strong> &gt; <strong>Wi-Fi</strong></p>
                        <p>2. ກົດປຸ່ມຮູບຕົວ <strong>(i) ຢູ່ຂ້າງຫຼັງຊື່ Wi-Fi</strong> ທີ່ກຳລັງເຊື່ອມຕໍ່</p>
                        <p>3. ເລື່ອນລົງລຸ່ມສຸດ ເລືອກ <strong>Configure DNS (ຕັ້ງຄ່າ DNS)</strong> &gt; ປ່ຽນເປັນ <strong>Manual (ດ້ວຍຕົນເອງ)</strong></p>
                        <p>4. ກົດ <strong>Add Server (ເພີ່ມເຊີເວີ)</strong> ແລ້ວປ້ອນ DNS ເຂົ້າໄປ:</p>
                        <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded font-mono text-[11px] space-y-1 text-slate-800 dark:text-slate-200">
                          <div>• ເຊີເວີ 1: <code className="bg-white dark:bg-slate-950 px-1 py-0.5 rounded font-bold text-teal-600">1.1.1.1</code></div>
                          <div>• ເຊີເວີ 2: <code className="bg-white dark:bg-slate-950 px-1 py-0.5 rounded font-bold text-teal-600">8.8.8.8</code></div>
                        </div>
                        <p>5. ກົດ <strong>Save (บันทึก)</strong> ຢູ່ມຸມຂວາເທິງ ແລ້ວ Refresh 🔄 ໂຫຼດແອັບຄືນໃໝ່ ຈະເປີດໄດ້ທັນທີ!</p>
                      </div>
                    </div>

                    {/* Option 2: Safari Permissions */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                      <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded">
                        ວິທີ B: ເປີດສິດກ້ອງຖ່າຍຮູບ ແລະ GPS (ແກ້ໄຂສະແກນບໍ່ໄດ້)
                      </span>
                      <div className="pl-4 border-l-2 border-indigo-500 space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-sans">
                        <p>1. ໄປທີ່ <strong>Settings (ການຕັ້ງຄ່າ)</strong> ຂອງ iPhone &gt; ເລື່ອນລົງໄປຫາ <strong>Safari</strong></p>
                        <p>2. ເລື່ອນລົງຫາຫົວຂໍ້ <strong>Camera (ກ້ອງຖ່າຍຮູບ)</strong> &gt; ປ່ຽນຄ່າເປັນ <strong className="text-indigo-600 dark:text-indigo-400">"Allow (ອະນຸຍາດ)"</strong></p>
                        <p>3. ເຂົ້າຫາຫົວຂໍ້ <strong>Location (ຕຳແໜ່ງ)</strong> &gt; ປ່ຽນຄ່າເປັນ <strong className="text-indigo-600 dark:text-indigo-400">"Allow (ອະນຸຍາດ)"</strong></p>
                        <p>4. ກັບຄືນໄປທີ່ແອັບໃນ Safari ແລ້ວກົດ Refresh 🔄 ຈະສະແກນໄດ້ຢ່າງສົມບູນ!</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'android' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-teal-500/10 border-l-4 border-teal-500 p-4 rounded-xl text-xs text-teal-950 dark:text-teal-400 font-sans">
                      <span className="font-extrabold text-teal-800 dark:text-teal-400 flex items-center gap-1.5">
                        🤖 ວິທີຕັ້ງຄ່າສິດ ແລະ ແກ້ໄຂລິ້ງສຳລັບ Android (Samsung, Xiaomi, Vivo, etc.)
                      </span>
                      <p className="mt-1">
                        ຫາກໃຊ້ໂທລະສັບ Android ແລ້ວເປີດລິ້ງບໍ່ໄດ້ ຫຼື ເປີດກ້ອງຖ່າຍຮູບບໍ່ໄດ້, ໃຫ້ປະຕິບັດຕາມວິທີດັ່ງນີ້:
                      </p>
                    </div>

                    {/* Option 1: Chrome Permissions */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                      <span className="bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-bold px-2 py-0.5 rounded">
                        ວິທີ A: ອະນຸຍາດສິດກ້ອງຖ່າຍຮູບ ແລະ GPS ໃນ Chrome
                      </span>
                      <div className="pl-4 border-l-2 border-teal-500 space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-sans">
                        <p>1. ເປີດແອັບ <strong>Chrome</strong> ແລ້ວໄປທີ່ເວັບໄຊແອັບພລິເຄຊັນ</p>
                        <p>2. ກົດປຸ່ມ **ຮູບຕົວເລືອກຕັ້ງຄ່າ (ຮູບແມ່ກະແຈ 🔒 ຫຼື ປຸ່ມ 3 ຈຸດ)** ຢູ່ເບື້ອງຂວາຂອງແຖບ URL</p>
                        <p>3. ເລືອກ <strong>Site settings (ການຕັ້ງຄ່າເວັບໄຊ)</strong></p>
                        <p>4. ກົດອະນຸຍາດ <strong>Camera (ກ້ອງຖ່າຍຮູບ)</strong> ແລະ <strong>Location (ຕຳແໜ່ງ)</strong> ໃຫ້ເປັນ "Allowed"</p>
                        <p>5. ກັບຄືນໄປທີ່ແອັບ, ກົດ Refresh 🔄 ໂຫຼດແອັບຄືນໃໝ່ ຈະໃຊ້ງານໄດ້ທັນທີ!</p>
                      </div>
                    </div>

                    {/* Option 2: Cloudflare WARP App */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                      <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded">
                        ວິທີ B: ຕິດຕັ້ງແອັບ 1.1.1.1 (Cloudflare WARP) (ແກ້ໄຂເປີດລິ້ງບໍ່ໄດ້ 100%)
                      </span>
                      <div className="pl-4 border-l-2 border-amber-500 space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-sans">
                        <p>1. ເຂົ້າໄປ Play Store ແລ້ວຄົ້ນຫາຄຳວ່າ <strong>"1.1.1.1"</strong> ຫຼື <strong>"WARP"</strong></p>
                        <p>2. ທຳການຕິດຕັ້ງແອັບ ແລະ ເປີດໃຊ້ງານ, ກົດສະວິດໃຫ້ເປັນສີສົ້ມ 🟠 (**Connected**)</p>
                        <p>3. ກັບຄືນມາເປີດລິ້ງແອັບໃນ Chrome ຈະສາມາດໂຫຼດໜ້າແອັບໄດ້ຢ່າງວ່ອງໄວ ແລະ ປອດໄພທັນທີ!</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'admin' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-xl text-xs text-amber-950 dark:text-amber-400 font-sans">
                      <span className="font-extrabold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 text-xs sm:text-sm">
                        👑 ສຳລັບ HR Admin / ເຈົ້າຂອງລະບົບ (ວິທີແກ້ໄຂຖາວອນ 100%)
                      </span>
                      <p className="mt-1 leading-relaxed">
                        ໂດເມນທີ່ລົງທ້າຍດ້ວຍ <code className="bg-white/60 dark:bg-black/30 px-1 py-0.5 rounded text-amber-700 font-mono font-bold">.run.app</code> ແມ່ນເຄືອຂ່າຍ Cloud Server ຂອງ Google ໂດຍກົງ. ເຄືອຂ່າຍອິນເຕີເນັດມືຖື ຫຼື Wi-Fi ບາງຄ່າຍໃນລາວ (LTC, Unitel, TPlus) ບໍ່ສາມາດແປງຊື່ເວັບໄຊນີ້ໄດ້ (DNS Resolution Issue) ເຮັດໃຫ້ຂຶ້ນຂໍ້ຄວາມ "can't reach this page".
                      </p>
                    </div>

                    <div className="p-5 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-950 dark:to-slate-900 rounded-3xl border border-teal-100 dark:border-slate-800 space-y-4">
                      <h4 className="font-extrabold text-xs sm:text-sm text-teal-900 dark:text-teal-400 flex items-center gap-2">
                        ✨ ວິທີການແກ້ໄຂແບບຖາວອນດ້ວຍ "Custom Domain":
                      </h4>
                      
                      <div className="space-y-3.5 text-xs font-sans text-slate-700 dark:text-slate-300">
                        <p className="leading-relaxed">
                          ວິທີແກ້ໄຂທີ່ເປັນມືອາຊີບ ແລະ ໄດ້ຜົນດີທີ່ສຸດຄື <strong>ການຊື້ໂດເມນສ່ວນຕົວ</strong> (ເຊັ່ນ: <code className="bg-teal-100 dark:bg-slate-800 text-teal-800 dark:text-teal-300 px-1 py-0.5 rounded font-mono">hr-company.com</code> ຫຼື <code className="bg-teal-100 dark:bg-slate-800 text-teal-800 dark:text-teal-300 px-1 py-0.5 rounded font-mono font-bold">.la</code>, <code className="bg-teal-100 dark:bg-slate-800 text-teal-800 dark:text-teal-300 px-1 py-0.5 rounded font-mono font-bold">.com</code>) ແລ້ວນຳມາເຊື່ອມຕໍ່ກັບ Cloud Run ຂອງ Google.
                        </p>

                        <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-2">
                          <span className="font-extrabold text-[11px] text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                            🛠️ ຂັ້ນຕອນການເຊື່ອມຕໍ່ Custom Domain ໃນ Cloud Run:
                          </span>
                          <div className="pl-4 border-l-2 border-teal-500 space-y-2 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                            <p>
                              1. ເຂົ້າໄປທີ່ <strong>Google Cloud Console</strong> &gt; ຄົ້ນຫາ <strong>Cloud Run</strong>.
                            </p>
                            <p>
                              2. ເລືອກ Service ຂອງແອັບພລິເຄຊັນນີ້ &gt; ຄລິກທີ່ແຖບ <strong>"Manage Custom Domains"</strong>.
                            </p>
                            <p>
                              3. ຄລິກ <strong>"Add Mapping"</strong> ແລ້ວປ້ອນຊື່ໂດເມນສ່ວນຕົວຂອງທ່ານ (ເຊັ່ນ: <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded">hr.mycompany.com</code>).
                            </p>
                            <p>
                              4. ນຳເອົາຄ່າ <strong>DNS Records (A / AAAA ຫຼື CNAME)</strong> ທີ່ໄດ້ຈາກ Google Console ໄປເພີ່ມໃສ່ໃນເວັບໄຊຜູ້ໃຫ້ບໍລິການໂດເມນຂອງທ່ານ (ເຊັ່ນ Namecheap, GoDaddy, ຫຼື ສູນອິນເຕີເນັດແຫ່ງຊາດ LANIC).
                            </p>
                            <p>
                              5. ລໍຖ້າ DNS ອັບເດດປະມານ 10-30 ນາທີ, ພະນັກງານທຸກຄົນກໍຈະສາມາດເປີດຜ່ານມືຖືໄດ້ທັນທີ 100% ໂດຍບໍ່ມີບັນຫາເຄືອຂ່າຍບລັອກອີກຕໍ່ໄປ!
                            </p>
                          </div>
                        </div>

                        <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-[10.5px] text-amber-800 dark:text-amber-400 leading-relaxed flex items-start gap-2">
                          <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <strong>ເປັນຫຍັງຕ້ອງໃຊ້ Custom Domain?</strong> ເພາະວ່າເຄືອຂ່າຍໃນລາວຈະບລັອກ ຫຼື ບໍ່ຮູ້ຈັກໂດເມນ <code className="font-mono">.run.app</code> ຂອງ Google. ແຕ່ຖ້າປ່ຽນມາໃຊ້ໂດເມນທົ່ວໄປ (ເຊັ່ນ <code className="font-mono">.com</code>), ທຸກເຄືອຂ່າຍ LTC, Unitel, TPlus ຈະແປງ DNS ໄດ້ທັນທີ ແລະ ເປີດໃຊ້ງານໄດ້ຢ່າງວ່ອງໄວ.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  id="btn-close-mobile-guide-footer"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold font-sans text-xs rounded-xl transition-all cursor-pointer"
                >
                  ປິດໜ້າຕ່າງ
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
