import React, { useState, useEffect } from 'react';
import { OperaVpnGuide } from './OperaVpnGuide';
import { 
  AlertCircle, 
  ExternalLink, 
  Settings, 
  Lock, 
  Copy, 
  Check, 
  Info, 
  Bell, 
  Smartphone, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  User,
  Key,
  Globe,
  CheckCircle
} from 'lucide-react';

export function BrowserPermissionsGuide() {
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('hr_permissions_guide_open');
    return saved !== 'false';
  });

  const [currentUrl, setCurrentUrl] = useState('');
  const [copiedStable, setCopiedStable] = useState(false);
  const [copiedDev, setCopiedDev] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  
  const [notifPermission, setNotifPermission] = useState<string>('default');
  const [testPopupStatus, setTestPopupStatus] = useState<'idle' | 'success' | 'blocked'>('idle');

  // Load credentials from local storage (synced with server)
  const [hrUser, setHrUser] = useState('admin');
  const [hrPass, setHrPass] = useState('123456');

  useEffect(() => {
    setCurrentUrl(window.location.href);
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }

    // Periodically sync credentials from localStorage
    const syncCredentials = () => {
      const u = localStorage.getItem('hr_username') || 'admin';
      const p = localStorage.getItem('hr_password') || '123456';
      setHrUser(u);
      setHrPass(p);
    };
    syncCredentials();
    const interval = setInterval(syncCredentials, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleOpen = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    localStorage.setItem('hr_permissions_guide_open', String(nextState));
  };

  // Generate stable public URL (-pre-) and development URL (-dev-)
  const getStableUrl = () => {
    if (!currentUrl) return '';
    if (currentUrl.includes('ais-dev-')) {
      return currentUrl.replace('ais-dev-', 'ais-pre-');
    }
    return currentUrl;
  };

  const getDevUrl = () => {
    if (!currentUrl) return '';
    if (currentUrl.includes('ais-pre-')) {
      return currentUrl.replace('ais-pre-', 'ais-dev-');
    }
    return currentUrl;
  };

  const handleCopyText = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setter(true);
      setTimeout(() => setter(false), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank');
  };

  const handleRequestNotification = () => {
    if (!('Notification' in window)) {
      alert('ບຣາວເຊີນີ້ບໍ່ຮອງຮັບ Native Notifications.');
      return;
    }
    Notification.requestPermission().then((permission) => {
      setNotifPermission(permission);
      if (permission === 'granted') {
        alert('🎉 ອະນຸຍາດການແຈ້ງເຕືອນສຳເລັດ! ທ່ານຈະໄດ້ຮັບແຈ້ງເຕືອນຜ່ານບຣາວເຊີທັນທີ.');
      } else if (permission === 'denied') {
        alert('⚠️ ທ່ານໄດ້ປະຕິເສດການແຈ້ງເຕືອນ. ກະລຸນາແກ້ໄຂໃນການຕັ້ງຄ່າບຣາວເຊີເພື່ອຮັບແຈ້ງເຕືອນ.');
      }
    });
  };

  const handleTestPopup = () => {
    setTestPopupStatus('idle');
    try {
      const testWindow = window.open('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200', '_blank');
      if (!testWindow || testWindow.closed || typeof testWindow.closed === 'undefined') {
        setTestPopupStatus('blocked');
      } else {
        setTestPopupStatus('success');
        setTimeout(() => {
          try {
            testWindow.close();
          } catch(e){}
        }, 1500);
      }
    } catch (e) {
      setTestPopupStatus('blocked');
    }
  };

  const stableUrl = getStableUrl();
  const devUrl = getDevUrl();

  return (
    <div 
      id="browser-permissions-guide-container"
      className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-900 dark:to-slate-950 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-sm overflow-hidden mb-6 transition-all duration-300"
    >
      {/* Header section */}
      <div 
        onClick={toggleOpen}
        className="px-6 py-4 flex items-center justify-between cursor-pointer select-none hover:bg-teal-100/10 dark:hover:bg-slate-800/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/10 animate-pulse">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-teal-900 dark:text-teal-400 font-sans tracking-tight flex items-center gap-2">
              ຄູ່ມືແກ້ໄຂລິ້ງ & ຂໍ້ມູນເຂົ້າລະບົບ (App Links & HR Login Guide)
              <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-bounce">
                ສຳຄັນຫຼາຍ!
              </span>
            </h3>
            <p className="text-[10px] sm:text-xs text-teal-700/80 dark:text-slate-400 font-sans mt-0.5">
              ແກ້ໄຂບັນຫາ DNS / ເປີດລິ້ງບໍ່ໄດ້ ແລະ ສະແດງຂໍ້ມູນເຂົ້າລະບົບ HR Admin ຢ່າງລະອຽດ
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-teal-700 dark:text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-teal-700 dark:text-slate-400" />
          )}
        </div>
      </div>

      {/* Expanded body with details */}
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-teal-100/50 dark:border-slate-800/50 space-y-6">
          
          {/* Opera VPN User Guide for Mobile */}
          <OperaVpnGuide />
          
          {/* DNS Resolution Alert & Guide */}
          <div className="bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/30 p-5 space-y-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <ShieldAlert className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-rose-900 dark:text-rose-400 font-sans tracking-tight">
                  🚨 ວິທີແກ້ໄຂຂໍ້ຜິດພາດ "can't reach this page / ERR_NAME_NOT_RESOLVED" (ໂດຍບໍ່ຕ້ອງໃຊ້ VPN!)
                </h4>
                <div className="text-xs text-rose-700/95 dark:text-rose-300 font-sans mt-1 leading-relaxed space-y-2">
                  <p>
                    ຂໍ້ຜິດພາດນີ້ເກີດຈາກເຄືອຂ່າຍອິນເຕີເນັດຂອງທ່ານ ບໍ່ສາມາດແປງທີ່ຢູ່ IP ຂອງ Google Cloud Run (<code className="bg-rose-100 dark:bg-rose-900/40 px-1 py-0.5 rounded font-mono font-bold">.run.app</code>) ໄດ້.
                  </p>
                  
                  <div className="bg-emerald-500/15 border-l-4 border-emerald-500 p-3 rounded-xl text-[11px] text-emerald-900 dark:text-emerald-300 font-sans space-y-1.5">
                    <span className="font-extrabold text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      💡 ທ່ານສາມາດເຂົ້າໃຊ້ງານແອັບໄດ້ ໂດຍບໍ່ຕ້ອງໃຊ້ VPN (VPN-Free)!
                    </span>
                    <p>
                      ບໍ່ຈຳເປັນຕ້ອງຕິດຕັ້ງ ຫຼື ໃຊ້ງານລະບົບ VPN ໃດໆທັງສິ້ນ! ພຽງແຕ່ເລືອກເຮັດຕາມ <strong>ວິທີທີ 1 (ປ່ຽນ DNS ຂອງ Windows ໂດຍກົງ)</strong> ຫຼື <strong>ວິທີທີ 2 (ປ່ຽນໄປໃຊ້ເນັດມືຖື)</strong> ດ້ານລຸ່ມນີ້. ວິທີເຫຼົ່ານີ້ປອດໄພ 100% ແລະ ມີຄວາມໄວສູງກວ່າການໃຊ້ VPN ຢ່າງຫຼວງຫຼາຍ.
                    </p>
                  </div>

                  <div className="bg-indigo-500/15 border-l-4 border-indigo-500 p-3 rounded-xl text-[11px] text-indigo-900 dark:text-indigo-300 font-sans space-y-1.5">
                    <span className="font-extrabold text-xs text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                      🌐 ສຳລັບຜູ້ໃຊ້ບຣາວເຊີ Opera (ທີ່ມີ VPN ໃນຕົວ):
                    </span>
                    <p>
                      ຫາກທ່ານໃຊ້ <strong>Opera Browser</strong> ແລະ ເປີດໃຊ້ VPN ໃນຕົວຢູ່ ແຕ່ຍັງພົບບັນຫາເປີດແອັບບໍ່ໄດ້: ເນື່ອງຈາກ VPN ຂອງ Opera ບາງຄັ້ງອາດຈະບໍ່ສາມາດແປງ IP ຂອງ Google Cloud Run ໄດ້ ຫຼື ຖືກເຄືອຂ່າຍບລັອກ.
                    </p>
                    <p className="font-bold">
                      👉 <strong>ວິທີແກ້ໄຂ:</strong> ກະລຸນາ <strong>ປິດ (Turn Off) VPN ໃນຕົວຂອງ Opera</strong> (ໂດຍຄລິກທີ່ປຸ່ມ VPN ສີຟ້າຢູ່ຂ້າງແຖບ URL) ແລ້ວປ່ຽນມາໃຊ້ <strong>ວິທີທີ 1 (ປ່ຽນ DNS ໃນ Windows ໂດຍກົງ)</strong> ຫຼື <strong>ວິທີທີ 2 (ໃຊ້ເນັດມືຖື)</strong> ດ້ານລຸ່ມນີ້ແທນ ເຊິ່ງປອດໄພ, ສະຖຽນ ແລະ ໄວກວ່າ VPN ຫຼາຍ!
                    </p>
                  </div>

                  <div className="bg-amber-500/15 border-l-4 border-amber-500 p-2.5 rounded text-[11px] text-amber-900 dark:text-amber-300 font-sans">
                    <strong>⚠️ ສາເຫດທີ່ປຸ່ມ "Use secure DNS" ຖືກລັອກ (ມີຮູບແມ່ກະແຈ 🔒 / Briefcase icon):</strong>
                    <p className="mt-1">
                      ເນື່ອງຈາກຄອມພິວເຕີ ຫຼື ບຣາວເຊີ Microsoft Edge ຂອງທ່ານຖືກຄວບຄຸມໂດຍ <strong>"ນະໂຍບາຍອົງກອນ (Managed by your organization)"</strong> (ເຊັ່ນ: ຄອມພິວເຕີຫ້ອງການ ຫຼື ໂຮງຮຽນ). ເຮັດໃຫ້ທ່ານ <strong>ບໍ່ສາມາດເປີດສະວິດ Secure DNS ໃນ Edge ໄດ້ໂດຍກົງ.</strong>
                    </p>
                    <p className="mt-1 font-bold">
                      👉 ແນະນຳໃຫ້ເຮັດຕາມ "ວິທີທີ 1" ດ້ານລຸ່ມ ເພື່ອຕັ້ງຄ່າ DNS ໃນ Windows ໂດຍກົງ (ບໍ່ຕ້ອງໃຊ້ VPN ແລະ ບໍ່ຕ້ອງຜ່ານ Edge):
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps with options */}
            <div className="bg-white/80 dark:bg-slate-900/80 p-5 rounded-xl border border-rose-100 dark:border-rose-950/50 space-y-4">
              
              {/* Option A: Windows DNS (Now promoted because it requires NO internet/downloads to configure!) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-teal-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">ວິທີທີ 1 (ແນະນຳທີ່ສຸດ - ແກ້ໄຂໄດ້ທັນທີໂດຍບໍ່ຕ້ອງໂຫຼດແອັບ)</span>
                  <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">ປ່ຽນ DNS ຂອງ Windows ໂດຍກົງ (Windows System DNS Setup)</h5>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                  ຖ້າຫາກທ່ານ <strong>ເປີດເວັບໄຊ https://1.1.1.1 ບໍ່ໄດ້</strong>, ແນະນຳໃຫ້ຕັ້ງຄ່າ DNS ໃນ Windows ໂດຍກົງ (ບໍ່ຕ້ອງດາວໂຫຼດຫຍັງທັງສິ້ນ):
                </p>
                <div className="pl-4 border-l-2 border-teal-500 space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-sans">
                  <p>1. ໄປທີ່ <strong className="text-slate-900 dark:text-white">Windows Settings (ປຸ່ມ Start ⚙️)</strong> &gt; <strong className="text-slate-900 dark:text-white">Network & internet</strong></p>
                  <p>2. ຄລິກທີ່ <strong className="text-slate-900 dark:text-white">Wi-Fi</strong> (ຫຼື Ethernet ຖ້າໃຊ້ສາຍແລນ) &gt; ເລືອກ <strong className="text-slate-900 dark:text-white">Hardware properties</strong></p>
                  <p>3. ຢູ່ຫົວຂໍ້ <strong>DNS server assignment</strong> ໃຫ້ກົດປຸ່ມ <strong className="text-teal-600 font-bold">Edit</strong> &gt; ປ່ຽນຈາກ Automatic ເປັນ <strong className="text-teal-600 font-bold">Manual</strong> &gt; ເປີດສະວິດ <strong className="text-teal-600 font-bold">IPv4</strong></p>
                  <p>4. ປ້ອນຄ່າ DNS ຂອງ Google ແລະ Cloudflare ດັ່ງນີ້:</p>
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded font-mono text-[11.5px] space-y-1 text-slate-800 dark:text-slate-200">
                    <div>• <strong>Preferred DNS:</strong> <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded font-bold text-teal-600">8.8.8.8</code></div>
                    <div>• <strong>Alternate DNS:</strong> <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded font-bold text-teal-600">1.1.1.1</code></div>
                  </div>
                  <p>5. ກົດ <strong className="text-teal-600 font-bold">Save</strong> ແລ້ວລອງ Refresh 🔄 ໂຫຼດໜ້າແອັບຄືນໃໝ່ ຈະເຂົ້າໄດ້ທັນທີ!</p>
                </div>
              </div>

              {/* Option B: Use Mobile Network */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">ວິທີທີ 2 (ງ່າຍ ແລະ ໄວທີ່ສຸດ)</span>
                  <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">ປ່ຽນໄປໃຊ້ ເນັດມືຖື (Switch to Mobile Hotspot)</h5>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                  ເນື່ອງຈາກເຄືອຂ່າຍ Wi-Fi ຫ້ອງການ ຫຼື ເຮືອນຂອງທ່ານອາດມີການບລັອກ DNS ຢ່າງເຂັ້ມງວດ:
                </p>
                <div className="pl-4 border-l-2 border-amber-500 space-y-1 text-[11px] text-slate-700 dark:text-slate-300 font-sans">
                  <p>1. ປິດການເຊື່ອມຕໍ່ Wi-Fi ຢູ່ຄອມພິວເຕີຂອງທ່ານ</p>
                  <p>2. ເປີດ <strong>Hotspot ຈາກມືຖືຂອງທ່ານ (3G/4G/5G)</strong> ແລ້ວເຊື່ອມຕໍ່ຄອມພິວເຕີເຂົ້າກັບ Hotspot ນັ້ນ</p>
                  <p>3. ກົດ Refresh 🔄 ໂຫຼດໜ້າແອັບຄືນໃໝ່ ຈະສາມາດໃຊ້ງານໄດ້ທັນທີຢ່າງປົກກະຕິ!</p>
                </div>
              </div>

              {/* Option C: Cloudflare Warp as fallback */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">ວິທີທີ 3 (ສຳລັບມືຖື ຫຼື ຕ້ອງການໃຊ້ແອັບຊ່ວຍ)</span>
                  <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">ຕິດຕັ້ງແອັບ Cloudflare WARP</h5>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                  ຖ້າຫາກທ່ານບໍ່ສາມາດເປີດ <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">1.1.1.1</code> ໄດ້:
                </p>
                <div className="pl-4 border-l-2 border-slate-400 space-y-1 text-[11px] text-slate-700 dark:text-slate-300 font-sans">
                  <p>• <strong>ສຳລັບມືຖື (Android / iOS):</strong> ໃຫ້ເຂົ້າໄປຄົ້ນຫາຄຳວ່າ <strong className="text-teal-600">"1.1.1.1"</strong> ຫຼື <strong className="text-teal-600">"WARP"</strong> ໃນ Play Store ຫຼື App Store ໂດຍກົງເພື່ອຕິດຕັ້ງໄດ້ຟຣີ</p>
                  <p>• <strong>ສຳລັບຄອມພິວເຕີ:</strong> ຖ້າຫາກເຄືອຂ່າຍ Wi-Fi ປັດຈຸບັນບລັອກເວັບໄຊດັ່ງກ່າວ, ໃຫ້ເຊື່ອມຕໍ່ເນັດມືຖື (Hotspot) ຊົ່ວຄາວເພື່ອເຂົ້າໄປດາວໂຫຼດແອັບ WARP ຈາກເວັບໄຊ <a href="https://1.1.1.1" target="_blank" rel="noreferrer" className="text-teal-600 font-bold underline">https://1.1.1.1</a> ແລ້ວຈຶ່ງຕິດຕັ້ງ</p>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-100/50 text-[10px] text-amber-800 dark:text-amber-400 font-sans leading-relaxed flex items-center gap-1.5 mt-2">
                <Info className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>
                  <strong>ຫຼັງຈາກເຮັດສໍາເລັດ:</strong> ໃຫ້ກົດປຸ່ມ <strong>Refresh 🔄</strong> ຫຼື ໂຫຼດໜ້າແອັບຄືນໃໝ່. ທ່ານຈະສາມາດເປີດລິ້ງ ແລະ ໃຊ້ງານລະບົບໄດ້ຢ່າງປົກກະຕິທັນທີ!
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left side: Links and DNS Fix Guide */}
            <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
              <div className="bg-white/80 dark:bg-slate-900/50 p-5 rounded-2xl border border-teal-100/30 dark:border-slate-800 space-y-4 flex-1">
                <div className="flex items-start gap-2.5">
                  <Globe className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0 animate-spin-slow" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans flex items-center gap-2">
                      ແກ້ໄຂບັນຫາເປີດລິ້ງບໍ່ໄດ້ / DNS Error (IP Address Not Found)
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed mt-1">
                      ເນື່ອງຈາກລິ້ງພັດທະນາ (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded font-mono text-amber-600">ais-dev-...</code>) ເປັນລິ້ງຊົ່ວຄາວທີ່ບາງເຄືອຂ່າຍອາດຈະບໍ່ສາມາດແປງ IP ໄດ້ (DNS Error). ກະລຸນາໃຊ້ <strong>ລິ້ງຫຼັກທີ່ໝັ້ນຄົງ (-pre-)</strong> ເພື່ອໃຊ້ງານປົກກະຕິ.
                    </p>
                  </div>
                </div>

                {/* Link Blocks */}
                <div className="space-y-3 pt-2">
                  
                  {/* Stable Recommended URL */}
                  <div className="p-3 bg-teal-500/5 dark:bg-teal-500/10 rounded-xl border border-teal-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        ລິ້ງແນະນຳສຳລັບໃຊ້ງານ (Stable Preview Link)
                      </span>
                      <span className="bg-teal-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        ແນະນຳ (Recommended)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={stableUrl} 
                        className="w-full text-[11px] font-mono bg-white dark:bg-slate-900 border border-teal-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 select-all"
                      />
                      <button
                        onClick={() => handleCopyText(stableUrl, setCopiedStable)}
                        className="flex items-center justify-center p-2 bg-white dark:bg-slate-900 text-teal-600 hover:text-teal-700 border border-teal-200 dark:border-slate-800 rounded-lg transition-all cursor-pointer"
                        title="ຄັດລອກລິ້ງ"
                      >
                        {copiedStable ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleOpenLink(stableUrl)}
                        className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>ເປີດໃຊ້</span>
                      </button>
                    </div>
                  </div>

                  {/* Dev URL */}
                  <div className="p-3 bg-slate-500/5 rounded-xl border border-slate-200/50 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        ລິ້ງນັກພັດທະນາ (Development Link)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={devUrl} 
                        className="w-full text-[11px] font-mono bg-white dark:bg-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 select-all"
                      />
                      <button
                        onClick={() => handleCopyText(devUrl, setCopiedDev)}
                        className="flex items-center justify-center p-2 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg transition-all cursor-pointer"
                        title="ຄັດລອກລິ້ງ"
                      >
                        {copiedDev ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleOpenLink(devUrl)}
                        className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[11px] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>ເປີດ</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Quick Settings instructions */}
              <div className="bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-teal-100/10 text-[10px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>
                  <strong>ຄຳແນະນຳ:</strong> ຖ້າຫາກເປີດລິ້ງພັດທະນາບໍ່ໄດ້, ໃຫ້ກົດທີ່ປຸ່ມ <strong>"ເປີດໃຊ້"</strong> ຂອງລິ້ງແນະນຳ (-pre-) ເພື່ອເປີດແອັບພລິເຄຊັນໃນແທບໃໝ່ ແລະ ໃຊ້ງານໄດ້ທັນທີ!
                </span>
              </div>
            </div>

            {/* Right side: HR Login Credentials & Live Tests */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* HR Login Credentials Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-teal-100/50 dark:border-slate-800 shadow-sm space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-teal-900 dark:text-teal-400 font-sans flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-teal-600" />
                  🔑 ຂໍ້ມູນເຂົ້າລະບົບ HR Admin (HR Login Credentials)
                </h4>
                
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                  ໃຊ້ຂໍ້ມູນນີ້ເພື່ອເຂົ້າສູ່ລະບົບ HR ເພື່ອກວດສອບ ແລະ ຈັດການພະນັກງານ:
                </p>

                <div className="space-y-2 pt-1">
                  {/* Username field */}
                  <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">Username:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-[11px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-100 dark:border-slate-800">
                        {hrUser}
                      </code>
                      <button
                        onClick={() => handleCopyText(hrUser, setCopiedUser)}
                        className="bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-500 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
                        title="ຄັດລອກ Username"
                      >
                        {copiedUser ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">Password:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-[11px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-100 dark:border-slate-800">
                        {hrPass}
                      </code>
                      <button
                        onClick={() => handleCopyText(hrPass, setCopiedPass)}
                        className="bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-500 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
                        title="ຄັດລອກ Password"
                      >
                        {copiedPass ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/10 p-2.5 rounded-xl border border-amber-100/30 text-[9.5px] text-amber-700 dark:text-amber-400 font-sans leading-relaxed">
                  💡 ທ່ານສາມາດປ່ຽນແປງ ຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານນີ້ໄດ້ໃນເມນູ <strong>"ຕັ້ງຄ່າລະບົບ (Settings)"</strong> ຫຼັງຈາກເຂົ້າລະບົບ HR ຮຽບຮ້ອຍແລ້ວ.
                </div>
              </div>

              {/* Live Status and browser tests */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-teal-100/50 dark:border-slate-800 shadow-sm space-y-3">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-sans flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-teal-600" />
                  ທົດສອບສະຖານະການອະນຸຍາດ (Browser Status Tests)
                </h4>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-sans">
                        ອະນຸຍາດ Popups (ເປີດລິ້ງ)
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {testPopupStatus === 'success' && (
                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded">
                          ✔️ ຜ່ານ
                        </span>
                      )}
                      {testPopupStatus === 'blocked' && (
                        <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[9px] font-bold px-2 py-0.5 rounded">
                          ❌ ຖືກບລັອກ
                        </span>
                      )}
                      {testPopupStatus === 'idle' && (
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-400 text-[9px] px-2 py-0.5 rounded">
                          ບໍ່ທັນທົດສອບ
                        </span>
                      )}
                      <button
                        onClick={handleTestPopup}
                        className="bg-teal-50 hover:bg-teal-100 text-teal-700 text-[9px] font-bold px-2 py-0.5 rounded border border-teal-100 transition-all cursor-pointer"
                      >
                        ⚡ ທົດສອບ
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-sans">
                        ການແຈ້ງເຕືອນ (Notifications)
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {notifPermission === 'granted' ? (
                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded">
                          ✔️ อະນຸຍາດແລ້ວ
                        </span>
                      ) : (
                        <button
                          onClick={handleRequestNotification}
                          className="bg-teal-600 hover:bg-teal-700 text-white text-[9px] font-bold px-2.5 py-0.5 rounded transition-all cursor-pointer"
                        >
                          🔔 ຂໍອະນຸຍາດ
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Quick link disclaimer */}
          <div className="text-center p-3 bg-slate-100/50 dark:bg-slate-900/40 rounded-xl border border-slate-200/30 dark:border-slate-800/50 text-[10px] text-slate-500 font-sans">
            🔔 <strong>ຄຳເຕືອນ:</strong> ຫຼັງຈາກອະນຸຍາດໃນບຣາວເຊີແລ້ວ ໃຫ້ລອງກົດໂຫຼດໜ້າແອັບຄືນໃໝ່ (Refresh) ເພື່ອໃຫ້ການຕັ້ງຄ່າຕ່າງໆມີຜົນເຕັມປະສິດທິພາບ.
          </div>

        </div>
      )}
    </div>
  );
}
