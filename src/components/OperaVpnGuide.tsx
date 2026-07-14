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
      
      {/* SECTION 1: Opera VPN Guide */}
      <div 
        id="opera-vpn-guide-card"
        className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-950 rounded-3xl border border-indigo-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300"
      >
        <div 
          id="opera-guide-header"
          onClick={() => setIsVpnOpen(!isVpnOpen)}
          className="px-6 py-4 flex items-center justify-between cursor-pointer select-none hover:bg-indigo-100/10 dark:hover:bg-slate-800/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/10">
              <Smartphone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-indigo-900 dark:text-indigo-400 font-sans tracking-tight flex items-center gap-2">
                📱 ຄູ່ມືການຕິດຕັ້ງ ແລະ ໃຊ້ງານ Opera Browser VPN (ສຳລັບມືຖື)
                <span className="bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ຟຣີ 100%
                </span>
              </h3>
              <p className="text-[10px] sm:text-xs text-indigo-700/80 dark:text-slate-400 font-sans mt-0.5">
                ວິທີແກ້ໄຂບັນຫາເປີດລິ້ງບໍ່ໄດ້, ດາວໂຫຼດບໍ່ໄດ້, ຫຼື ກ້ອງຖ່າຍຮູບບໍ່ຂຶ້ນ ເມື່ອໃຊ້ໂທລະສັບສະແກນ QR
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isVpnOpen ? (
              <ChevronUp className="w-5 h-5 text-indigo-700 dark:text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-indigo-700 dark:text-slate-400" />
            )}
          </div>
        </div>

        {isVpnOpen && (
          <div id="opera-guide-body" className="px-6 pb-6 pt-2 border-t border-indigo-100/50 dark:border-slate-800/50 space-y-6 animate-fade-in">
            
            <div className="bg-indigo-500/10 border-l-4 border-indigo-500 p-4 rounded-r-2xl text-xs text-indigo-900 dark:text-indigo-300 font-sans space-y-1.5 leading-relaxed">
              <span className="font-extrabold text-indigo-800 dark:text-indigo-400 flex items-center gap-1.5 text-xs sm:text-sm">
                💡 ເປັນຫຍັງຕ້ອງໃຊ້ Opera Browser VPN?
              </span>
              <p>
                ເນື່ອງຈາກເຄືອຂ່າຍອິນເຕີເນັດມືຖືບາງຄ່າຍໃນລາວ ອາດຈະບໍ່ສາມາດແປທີ່ຢູ່ IP ຂອງ Google Cloud Run (<code className="bg-indigo-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono font-bold">.run.app</code>) ໄດ້ໂດຍກົງ, ເຮັດໃຫ້ເກີດຂໍ້ຜິດພາດ <strong>"ERR_NAME_NOT_RESOLVED"</strong> ຫຼື ເປີດໜ້າແອັບບໍ່ໄດ້. 
              </p>
              <p>
                ການນຳໃຊ້ <strong>Opera Browser</strong> ທີ່ມີລະບົບ <strong>VPN ຟຣີໃນຕົວ</strong> ຈະຊ່ວຍແກ້ໄຂບັນຫານີ້ໄດ້ທັນທີ 100% ໂດຍປອດໄພ, ສະດວກສະບາຍ ແລະ ບໍ່ຕ້ອງເສຍເງິນຊື້ແອັບ VPN ພາຍນອກ.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Step 1: Download */}
              <div id="opera-step-1" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-indigo-100/40 dark:border-slate-800 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">1</span>
                  <h4 className="font-extrabold text-xs sm:text-sm text-indigo-950 dark:text-indigo-400 font-sans flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-indigo-500" />
                    ຂັ້ນຕອນການ Download
                  </h4>
                </div>
                
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                  ເລືອກດາວໂຫຼດ ແລະ ຕິດຕັ້ງແອັບ Opera Browser ໃຫ້ຖືກຕ້ອງຕາມລະບົບປະຕິບັດການຂອງໂທລະສັບມືຖືທ່ານ:
                </p>

                <div className="space-y-3 pt-1">
                  {/* Android Play Store Link */}
                  <a 
                    id="link-opera-android"
                    href="https://play.google.com/store/apps/details?id=com.opera.browser" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/40 dark:hover:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🤖</span>
                      <div>
                        <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200">Android Play Store</p>
                        <p className="text-[9px] text-slate-400">ສຳລັບ Samsung, Xiaomi, Vivo, Oppo, etc.</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </a>

                  {/* iOS App Store Link */}
                  <a 
                    id="link-opera-ios"
                    href="https://apps.apple.com/us/app/opera-browser-fast-private/id1411869174" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/40 dark:hover:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🍎</span>
                      <div>
                        <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200">iOS App Store</p>
                        <p className="text-[9px] text-slate-400">ສຳລັບ iPhone / iPad</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              </div>

              {/* Step 2: Open VPN */}
              <div id="opera-step-2" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-indigo-100/40 dark:border-slate-800 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">2</span>
                  <h4 className="font-extrabold text-xs sm:text-sm text-indigo-950 dark:text-indigo-400 font-sans flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    ຂັ້ນຕອນການເປີດ VPN
                  </h4>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                  ຫຼັງຈາກຕິດຕັ້ງແລ້ວ, ໃຫ້ທຳການເປີດໃຊ້ງານ VPN ຟຣີໃນບຣາວເຊີ Opera ຕາມຂັ້ນຕອນດັ່ງນີ້:
                </p>

                <div className="space-y-2 text-[11px] text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                  <div className="flex gap-2">
                    <span className="font-bold text-indigo-600 flex-shrink-0">1.</span>
                    <p>ເປີດແອັບ <strong>Opera Browser</strong> ທີ່ຕິດຕັ້ງໃໝ່</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-indigo-600 flex-shrink-0">2.</span>
                    <p>ກົດທີ່ **ປຸ່ມຮູບຕົວ "O" (Opera icon)** ຢູ່ມຸມຂວາລຸ່ມຂອງໜ້າຈໍ</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-indigo-600 flex-shrink-0">3.</span>
                    <p>ເລືອກເມນູ **"ການຕັ້ງຄ່າ (Settings)"** (ຮູບເຟືອງ ⚙️)</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-indigo-600 flex-shrink-0">4.</span>
                    <p>ຊອກຫາຫົວຂໍ້ **"VPN"** ແລ້ວກົດ **ເປີດໃຊ້ງານ (Turn On)** ໃຫ້ເປັນປຸ່ມສີຟ້າ 🔵</p>
                  </div>
                  <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 text-[10px] text-emerald-800 dark:text-emerald-400 font-sans mt-2">
                    💡 <strong>ຄຳແນະນຳ:</strong> ໃນໜ້າຕັ້ງຄ່າ VPN, ໃຫ້ຕັ້ງພື້ນທີ່ (Virtual Location) ເປັນ <strong>"Asia"</strong> ຫຼື <strong>"Optimal"</strong> ເພື່ອໃຫ້ຄວາມໄວສູງສຸດ!
                  </div>
                </div>
              </div>

              {/* Step 3: Scan QR Code */}
              <div id="opera-step-3" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-indigo-100/40 dark:border-slate-800 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">3</span>
                  <h4 className="font-extrabold text-xs sm:text-sm text-indigo-950 dark:text-indigo-400 font-sans flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-teal-500" />
                    ຂັ້ນຕອນການສະແກນ
                  </h4>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                  ເລີ່ມຕົ້ນສະແກນ QR Code ເພື່ອລົງເວລາເຂົ້າວຽກ/ເລີກວຽກຢ່າງວ່ອງໄວ:
                </p>

                <div className="space-y-2 text-[11px] text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                  <div className="flex gap-2">
                    <span className="font-bold text-indigo-600 flex-shrink-0">1.</span>
                    <div className="space-y-1">
                      <p>ຄັດລອກລິ້ງແອັບພລິເຄຊັນນີ້ ໄປວາງໃສ່ແຖບ URL ຂອງ Opera:</p>
                      <div className="flex items-center gap-1.5 mt-1 bg-slate-50 dark:bg-slate-850 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        <code className="text-[9.5px] font-mono truncate text-indigo-600 dark:text-indigo-400 max-w-[130px]" title={appUrl}>
                          {appUrl}
                        </code>
                        <button
                          id="copy-opera-link"
                          onClick={handleCopyLink}
                          className="p-1 bg-white dark:bg-slate-900 hover:bg-slate-100 text-indigo-600 rounded border border-slate-200 transition-all cursor-pointer flex-shrink-0"
                          title="ຄັດລອກລິ້ງ"
                        >
                          {copiedUrl ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-indigo-600 flex-shrink-0">2.</span>
                    <p>ກົດປຸ່ມ **"ສະແກນ QR Code"** ໃນໜ້າຈໍແອັບ</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-indigo-600 flex-shrink-0">3.</span>
                    <p>ເມື່ອ Opera ຂໍສິດເຂົ້າເຖິງກ້ອງ, ໃຫ້ກົດ **"ອະນຸຍາດ (Allow)"**</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-indigo-600 flex-shrink-0">4.</span>
                    <p>ແນບ QR Code ຂອງທ່ານໃສ່ກ້ອງ, ລະບົບຈະ Check-In / Check-Out ໃຫ້ທັນທີ!</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Additional note / Troubleshooting */}
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-xs text-amber-900 dark:text-amber-400 font-sans leading-relaxed flex items-start gap-2.5">
              <Info className="w-4.5 h-4.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>⚠️ ຂໍ້ແນະນຳເພີ່ມເຕີມ:</strong> ຫາກທ່ານເປີດ VPN ໃນ Opera ແລ້ວ ແຕ່ຍັງພົບບັນຫາເປີດແອັບບໍ່ໄດ້, ໃຫ້ກວດສອບວ່າທ່ານໄດ້ປິດການເຊື່ອມຕໍ່ Wi-Fi ຫ້ອງການ/ເຮືອນ ທີ່ບລັອກ DNS ແລ້ວປ່ຽນມາໃຊ້ <strong>ອິນເຕີເນັດມືຖື (3G/4G/5G)</strong> ແທນ.
              </div>
            </div>

          </div>
        )}
      </div>

      {/* SECTION 1.5: iOS/iPhone Troubleshooting Guide */}
      <div 
        id="ios-troubleshooting-guide-card"
        className="bg-gradient-to-br from-rose-50 to-amber-50 dark:from-slate-900 dark:to-slate-950 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300"
      >
        <div 
          id="ios-guide-header"
          onClick={() => setIsIosOpen(!isIosOpen)}
          className="px-6 py-4 flex items-center justify-between cursor-pointer select-none hover:bg-rose-100/10 dark:hover:bg-slate-800/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/10">
              <span className="text-xl font-bold">🍎</span>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-rose-950 dark:text-rose-400 font-sans tracking-tight flex items-center gap-2">
                🍎 ຄູ່ມືແກ້ໄຂບັນຫາສຳລັບຜູ້ໃຊ້ iPhone / iPad (iOS)
                <span className="bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  ແກ້ໄຂໄດ້ 100%
                </span>
              </h3>
              <p className="text-[10px] sm:text-xs text-rose-700/80 dark:text-slate-400 font-sans mt-0.5">
                ວິທີແກ້ໄຂບັນຫາເປີດລິ້ງບໍ່ໄດ້, ກ້ອງຖ່າຍຮູບບໍ່ຂຶ້ນ, ຫຼື ດຶງຕຳແໜ່ງ GPS ບໍ່ໄດ້ ເມື່ອໃຊ້ລະບົບ iOS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isIosOpen ? (
              <ChevronUp className="w-5 h-5 text-rose-700 dark:text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-rose-700 dark:text-slate-400" />
            )}
          </div>
        </div>

        {isIosOpen && (
          <div id="ios-guide-body" className="px-6 pb-6 pt-2 border-t border-rose-100/50 dark:border-slate-800/50 space-y-6 animate-fade-in">
            
            <div className="bg-rose-500/10 border-l-4 border-rose-500 p-4 rounded-r-2xl text-xs text-rose-900 dark:text-rose-300 font-sans space-y-1.5 leading-relaxed">
              <span className="font-extrabold text-rose-800 dark:text-rose-400 flex items-center gap-1.5 text-xs sm:text-sm">
                💡 ເປັນຫຍັງລະບົບ iOS ຈຶ່ງພົບບັນຫາເຂົ້າໃຊ້ງານບໍ່ໄດ້?
              </span>
              <p>
                1. <strong>ບັນຫາ DNS ຂອງເຄືອຂ່າຍ Wi-Fi:</strong> ເຄືອຂ່າຍອິນເຕີເນັດບ້ານ ຫຼື ຫ້ອງການໃນລາວ (ເຊັ່ນ LTC, Unitel, ບາງຄ່າຍ) ມັກຈະມີບັນຫາບໍ່ສາມາດແປງ IP ຂອງໂດເມນ Google Cloud Run (<code className="bg-rose-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono font-bold text-rose-600">.run.app</code>) ໄດ້ໂດຍກົງ ເຮັດໃຫ້ເປີດເວັບບໍ່ໄດ້.
              </p>
              <p>
                2. <strong>ລະບົບຄວາມປອດໄພຂອງ Safari/iOS:</strong> iOS ມີການຈຳກັດສິດການເຂົ້າເຖິງ ກ້ອງຖ່າຍຮູບ (Camera) ແລະ ຕຳແໜ່ງ (Geolocation/GPS) ຢ່າງເຂັ້ມງວດ ຫາກບໍ່ໄດ້ຕັ້ງຄ່າອະນຸຍາດ ຈະເຮັດໃຫ້ສະແກນ QR ບໍ່ໄດ້.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Solution 1: Switch to Mobile Data */}
              <div id="ios-solution-1" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-rose-100/40 dark:border-slate-800 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-rose-600 text-white font-extrabold text-xs flex items-center justify-center">1</span>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-rose-400 font-sans flex items-center gap-1.5">
                    📱 ປ່ຽນໄປໃຊ້ "ເນັດມືຖື (3G/4G/5G)"
                  </h4>
                </div>
                
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                  <strong>ເປັນວິທີທີ່ງ່າຍ ແລະ ໄວທີ່ສຸດໃນ 1 ວິນາທີ!</strong> ໂດຍບໍ່ຕ້ອງດາວໂຫຼດແອັບ ຫຼື ຕັ້ງຄ່າໃດໆ:
                </p>

                <div className="pl-4 border-l-2 border-rose-500 space-y-2 text-[11px] text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                  <p>1. ປິດການເຊື່ອມຕໍ່ <strong>Wi-Fi</strong> ຢູ່ iPhone ຂອງທ່ານ.</p>
                  <p>2. ເປີດໃຊ້ງານ <strong>ອິນເຕີເນັດມືຖື (Cellular Data)</strong> 3G/4G/5G (ເຊັ່ນ Unitel, LTC, TPlus, Lao Telecom).</p>
                  <p>3. ກັບຄືນໄປທີ່ Safari ແລ້ວກົດ <strong>Refresh (ໂຫຼດຄືນໃໝ່) 🔄</strong> ຈະສາມາດເປີດແອັບ ແລະ ໃຊ້ງານໄດ້ທັນທີ 100%!</p>
                </div>
              </div>

              {/* Solution 2: Change DNS on iPhone */}
              <div id="ios-solution-2" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-rose-100/40 dark:border-slate-800 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-rose-600 text-white font-extrabold text-xs flex items-center justify-center">2</span>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-rose-400 font-sans flex items-center gap-1.5">
                    ⚙️ ຕັ້ງຄ່າ DNS ໃນ Wi-Fi ຂອງ iPhone
                  </h4>
                </div>
                
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                  ຫາກຕ້ອງການເຊື່ອມຕໍ່ Wi-Fi ແລ້ວໃຫ້ສາມາດເຂົ້າເວັບໄຊໄດ້ຕະຫຼອດ ໃຫ້ຕັ້ງຄ່າ DNS ດັ່ງນີ້:
                </p>

                <div className="pl-4 border-l-2 border-rose-500 space-y-2 text-[11px] text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                  <p>1. ໄປທີ່ <strong>Settings (ການຕັ້ງຄ່າ)</strong> &gt; <strong>Wi-Fi</strong></p>
                  <p>2. ກົດປຸ່ມຮູບຕົວ <strong>(i) ຢູ່ຂ້າງຫຼັງຊື່ Wi-Fi</strong> ທີ່ທ່ານກຳລັງເຊື່ອມຕໍ່</p>
                  <p>3. ເລື່ອນລົງລຸ່ມສຸດ ເລືອກ <strong>Configure DNS (ຕັ້ງຄ່າ DNS)</strong> &gt; ປ່ຽນເປັນ <strong>Manual (ດ້ວຍຕົນເອງ)</strong></p>
                  <p>4. ກົດ <strong>Add Server (ເພີ່ມເຊີເວີ)</strong> ແລ້ວປ້ອນ DNS ເຂົ້າໄປ 2 ຄ່າ:</p>
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded font-mono text-[11px] space-y-1 text-slate-800 dark:text-slate-200">
                    <div>• ເຊີເວີທີ 1: <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded font-bold text-rose-600">1.1.1.1</code></div>
                    <div>• ເຊີເວີທີ 2: <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded font-bold text-rose-600">8.8.8.8</code></div>
                  </div>
                  <p>5. ກົດ <strong>Save (ບັນທຶກ)</strong> ຢູ່ມຸມຂວາເທິງ. ແລ້ວໂຫຼດໜ້າແອັບຄືນໃໝ່!</p>
                </div>
              </div>

              {/* Solution 3: Cloudflare WARP App */}
              <div id="ios-solution-3" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-rose-100/40 dark:border-slate-800 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-rose-600 text-white font-extrabold text-xs flex items-center justify-center">3</span>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-rose-400 font-sans flex items-center gap-1.5">
                    ⚡ ຕິດຕັ້ງແອັບ "1.1.1.1" (Cloudflare WARP)
                  </h4>
                </div>
                
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                  ເປັນວິທີແກ້ໄຂ DNS Error ທີ່ໄດ້ຜົນດີທີ່ສຸດສຳລັບມືຖືທຸກລຸ້ນ ໂດຍຈະປ່ຽນ DNS ໃຫ້ປອດໄພ ແລະ ໄວຂຶ້ນ:
                </p>

                <div className="pl-4 border-l-2 border-rose-500 space-y-2 text-[11px] text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                  <p>1. ເຂົ້າໄປທີ່ App Store ຄົ້ນຫາຄຳວ່າ <strong>"1.1.1.1"</strong> ຫຼື <strong>"WARP"</strong> ແລ້ວທຳການດາວໂຫຼດ</p>
                  <a 
                    href="https://apps.apple.com/us/app/1-1-1-1-faster-internet/id1433556537" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 font-bold text-[10px] px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-slate-700 transition-all mt-1"
                  >
                    🚀 ໄປທີ່ App Store ເພື່ອດາວໂຫຼດ 1.1.1.1
                  </a>
                  <p>2. ເປີດແອັບ, ກົດຍອມຮັບຂໍ້ຕົກລົງ ແລະ ກົດ <strong>"ອະນຸຍາດໃຫ້ຕິດຕັ້ງ VPN Profile"</strong> (ຕ້ອງກົດອະນຸຍາດ ແລະ ປ້ອນ Passcode ຂອງ iPhone)</p>
                  <p>3. ກົດສະວິດ <strong>ເປີດ (Connected)</strong> ໃຫ້ເປັນສີສົ້ມ 🟠, ຈາກນັ້ນເຂົ້າ Safari ເປີດແອັບພລິເຄຊັນໄດ້ທັນທີ!</p>
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
