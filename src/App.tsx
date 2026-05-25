/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import PixelInvitation from './components/PixelInvitation';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Clock, 
  Music, 
  Pause, 
  Play, 
  ChevronDown,
  Instagram,
  Send,
  Copy,
  ExternalLink,
  Map as MapIcon,
  CheckCircle2,
  Users,
  Settings,
  X,
  Download,
  Utensils
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Types ---
interface Wish {
  name: string;
  message: string;
  time: string;
}

// --- Constants ---
const retroCoupleImage = '/src/assets/images/couple_retro_pink_1779690932288.png';
const groomRetroPortrait = '/src/assets/images/groom_gilang_retro_1779692140275.png';
const brideRetroPortrait = '/src/assets/images/bride_retro_portrait_1779691433453.png';

// --- Components ---

const FloatingElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0,
            x: Math.random() * 100 + "%", 
            y: "110%" 
          }}
          animate={{ 
            opacity: [0, 0.2, 0],
            y: "-10%",
            x: (Math.random() * 100 - 10) + "%",
            rotate: 360
          }}
          transition={{ 
            duration: Math.random() * 30 + 20, 
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 15
          }}
          className="absolute text-luxury-gold/20"
        >
          <div className="w-1 h-32 bg-gradient-to-b from-transparent via-luxury-gold/10 to-transparent rotate-45 blur-sm"></div>
        </motion.div>
      ))}
    </div>
  );
};

const DecorativeDivider = () => (
  <div className="flex items-center justify-center gap-6 my-20">
    <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-luxury-gold/40"></div>
    <div className="rotate-45 border border-luxury-gold/60 w-3 h-3 flex items-center justify-center">
       <div className="w-1 h-1 bg-luxury-gold"></div>
    </div>
    <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-luxury-gold/40"></div>
  </div>
);

const Countdown = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    };

    const timer = setInterval(calculate, 1000);
    calculate();
    return () => clearInterval(timer);
  }, [targetDate]);

  const items = [
    { label: 'Hari', value: timeLeft.days },
    { label: 'Jam', value: timeLeft.hours },
    { label: 'Menit', value: timeLeft.minutes },
    { label: 'Detik', value: timeLeft.seconds }
  ];

  return (
    <div className="flex justify-center gap-6 md:gap-12">
      {items.map((item, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 md:w-28 md:h-28 bg-luxury-emerald text-luxury-gold rounded-full border border-luxury-gold/30 shadow-luxury flex flex-col items-center justify-center mb-4 group hover:border-luxury-gold transition-colors">
            <span className="font-display text-3xl md:text-5xl leading-none">{item.value}</span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-luxury-gold-dark font-bold">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
};

const MusicPlayer = ({ url }: { url: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.loop = true;
    } else {
      audioRef.current.src = url;
    }

    const handleAutoPlay = () => {
      audioRef.current?.play().catch(e => console.log("Autoplay blocked or failed:", e));
      setIsPlaying(true);
    };

    window.addEventListener('playMusic', handleAutoPlay);
    return () => window.removeEventListener('playMusic', handleAutoPlay);
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Audio playback failed:", error);
          setIsPlaying(false);
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={togglePlay}
        className="bg-white/20 backdrop-blur-xl p-4 rounded-full shadow-luxury border border-luxury-gold/30 text-luxury-gold-dark hover:bg-white/40 transition-all"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </motion.button>
    </div>
  );
};

export default function App() {
  const [isOpened, setIsOpened] = useState(false);
  const [invitationTheme, setInvitationTheme] = useState<'pixel' | 'luxury'>('pixel');
  const [guestName, setGuestName] = useState('Tamu Undangan');
  const [heroImage, setHeroImage] = useState(() => {
    const saved = localStorage.getItem('heroImage');
    if (!saved || saved.includes('photo-158393900') || saved.includes('retro_couple_1779690503650.png') || saved.includes('retro_couple_game_1779690536197.png')) {
      return retroCoupleImage;
    }
    return saved;
  });
  const [bgImage, setBgImage] = useState(() => localStorage.getItem('bgImage') || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80');
  const [musicUrl, setMusicUrl] = useState(() => {
    const saved = localStorage.getItem('musicUrl');
    if (!saved || saved.includes('8-Bit%20Ed%20Sheeran%20-%20Perfect.mp3') || saved.includes('8-bit-ed-sheeran-perfect')) {
      return 'https://archive.org/download/wedding-march-piano/wedding-march-piano.mp3';
    }
    return saved;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [wishes, setWishes] = useState<Wish[]>(() => {
    const saved = localStorage.getItem('weddingWishes');
    return saved ? JSON.parse(saved) : [
      { name: "Andi Pratama", message: "Selamat menempuh hidup baru Gilang & Nissa! Semoga samawa selamanya.", time: "Barusan" },
      { name: "Siti Halimah", message: "Barakallah! Semoga lancar sampai hari-H dan jadi keluarga sakinah.", time: "2 jam yang lalu" },
      { name: "Rizky Ramadhan", message: "Happy wedding ya buat kalian berdua! Semoga langgeng terus sampai maut memisahkan.", time: "Kemarin" }
    ];
  });
  const [newWish, setNewWish] = useState({ name: '', message: '' });
  const [weddingData, setWeddingData] = useState(() => {
    const saved = localStorage.getItem('weddingData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let updated = false;
        if (!parsed.groomPhoto || parsed.groomPhoto.includes('unsplash.com') || parsed.groomPhoto.includes('photo-154941687') || parsed.groomPhoto.includes('groom_retro_portrait')) {
          parsed.groomPhoto = groomRetroPortrait;
          updated = true;
        }
        if (!parsed.bridePhoto || parsed.bridePhoto.includes('unsplash.com') || parsed.bridePhoto.includes('photo-15327129')) {
          parsed.bridePhoto = brideRetroPortrait;
          updated = true;
        }
        if (!parsed.groomParents || parsed.groomParents.includes('Lord Montagu')) {
          parsed.groomParents = "Bpk. Azmi Tanjung & Ibu Dahniar";
          updated = true;
        }
        if (!parsed.brideParents || parsed.brideParents.includes('Lord Capulet')) {
          parsed.brideParents = "Bpk. Dadang Suhendar & Ibu Nani Marliani";
          updated = true;
        }
        if (!parsed.storyAwal || parsed.storyAwal.includes('gala charity') || parsed.storyAwal.includes('teman kuliah')) {
          parsed.storyAwal = "Berawal dari teman kantor di PT Medialab Indonesia";
          updated = true;
        }
        if (!parsed.storyDekat || parsed.storyDekat.includes('keliling dunia')) {
          parsed.storyDekat = "Mulai menjalin hubungan yang lebih serius dan saling mengenal keluarga.";
          updated = true;
        }
        if (!parsed.storyLamaran || parsed.storyLamaran.includes('Eiffel')) {
          parsed.storyLamaran = "Memutuskan untuk melangkah ke jenjang yang lebih serius.";
          updated = true;
        }
        if (!parsed.akadTime || parsed.akadTime.includes("09.00")) {
          parsed.akadTime = "13.30";
          updated = true;
        }
        if (!parsed.bride || parsed.bride === "Annisa Fitri") {
          parsed.bride = "Nissa Marlinda";
          updated = true;
        }
        if (!parsed.danaOwner || parsed.danaOwner === "Annisa Fitri") {
          parsed.danaOwner = "Nissa Marlinda";
          updated = true;
        }
        if (!parsed.resepsiTime || parsed.resepsiTime.includes("12.00")) {
          parsed.resepsiTime = "14.00 - 17.00 WIB";
          updated = true;
        }
        if (!parsed.resepsiLocation || parsed.resepsiLocation.includes("Gedung Serbaguna")) {
          parsed.resepsiLocation = "Pawon Bu Sri 3";
          updated = true;
        }
        if (!parsed.resepsiAddress || parsed.resepsiAddress.includes("Soreang No 132")) {
          parsed.resepsiAddress = "Jl. Raya Gading Tutuka, Kab. Bandung";
          updated = true;
        }
        if (!parsed.bcaNumber || parsed.bcaNumber === "1234567890") {
          parsed.bcaNumber = "1660002192250";
          updated = true;
        }
        if (!parsed.danaNumber || parsed.danaNumber === "0812 3456 7890" || parsed.danaNumber === "081234567890") {
          parsed.danaNumber = "08159716078";
          updated = true;
        }
        if (!parsed.giftAddress || parsed.giftAddress.includes("Soreang No 132")) {
          parsed.giftAddress = "Perumahan Puri harmoni 10, Jalan Raya Kelapa Nunggal, Cikahuripan, Klpa Nunggal ( Kelapa Nunggal ) (Blok B1 No.34 ), Jawa Barat,ID, 16710";
          updated = true;
        }
        if (updated) {
          localStorage.setItem('weddingData', JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        // Fallback to default
      }
    }
    return {
      groom: "Gilang Krismantara",
      groomShort: "Gilang",
      bride: "Nissa Marlinda",
      brideShort: "Nissa",
      groomPhoto: groomRetroPortrait,
      bridePhoto: brideRetroPortrait,
      date: "Selasa, 2 Juni 2026",
      isoDate: "2026-06-02T09:00:00",
      greetingText: "Om Swastiastu",
      quoteText: "Berawal dari ketidaksengajaan saat kita bertemu, siapa sangka ternyata hati kita berlabuh di dermaga yang sama. Setelah perjalanan panjang penuh tawa dan rindu, kini saatnya kita bersatu dalam ikatan suci pernikahan.",
      akadTime: "13.30",
      akadLocation: "KUA SOREANG",
      akadAddress: "Jl. Raya Soreang No 132, Kab. Bandung",
      resepsiTime: "14.00 - 17.00 WIB",
      resepsiLocation: "Pawon Bu Sri 3",
      resepsiAddress: "Jl. Raya Gading Tutuka, Kab. Bandung",
      mapsLink: "https://maps.google.com/?q=KUA+Soreang",
      bcaOwner: "Gilang Krismantara",
      bcaNumber: "1660002192250",
      danaOwner: "Nissa Marlinda",
      danaNumber: "08159716078",
      giftAddress: "Perumahan Puri harmoni 10, Jalan Raya Kelapa Nunggal, Cikahuripan, Klpa Nunggal ( Kelapa Nunggal ) (Blok B1 No.34 ), Jawa Barat,ID, 16710",
      groomParents: "Bpk. Azmi Tanjung & Ibu Dahniar",
      brideParents: "Bpk. Dadang Suhendar & Ibu Nani Marliani",
      storyAwal: "Berawal dari teman kantor di PT Medialab Indonesia",
      storyDekat: "Mulai menjalin hubungan yang lebih serius dan saling mengenal keluarga.",
      storyLamaran: "Memutuskan untuk melangkah ke jenjang yang lebih serius.",
      bgColor: "#FAF9F6",
      accentColor: "#C5A059"
    };
  });
  const [rsvp, setRsvp] = useState({ name: '', status: '', guests: '1' });
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // --- Persistence Hooks ---
  useEffect(() => {
    // Migrate old cache to new KUA Soreang location automatically or update groom name
    if (weddingData.akadLocation === "The Ritz-Carlton Bali" || !weddingData.akadAddress.includes("No 132") || weddingData.groom === "Gilang Prasetya") {
      setWeddingData(prev => ({
        ...prev,
        groom: "Gilang Krismantara",
        bcaOwner: "Gilang Krismantara",
        akadTime: "13.30",
        akadLocation: "KUA SOREANG",
        akadAddress: "Jl. Raya Soreang No 132, Kab. Bandung",
        resepsiTime: "14.00 - 17.00 WIB",
        resepsiLocation: "Pawon Bu Sri 3",
        resepsiAddress: "Jl. Raya Gading Tutuka, Kab. Bandung",
        giftAddress: "Perumahan Puri harmoni 10, Jalan Raya Kelapa Nunggal, Cikahuripan, Klpa Nunggal ( Kelapa Nunggal ) (Blok B1 No.34 ), Jawa Barat,ID, 16710",
        mapsLink: "https://maps.google.com/?q=KUA+Soreang"
      }));
    }
  }, [weddingData.akadLocation, weddingData.akadAddress, weddingData.groom]);

  useEffect(() => {
    document.title = `The Wedding of ${weddingData.groomShort} & ${weddingData.brideShort}`;
  }, [weddingData.groomShort, weddingData.brideShort]);

  useEffect(() => {
    try {
      localStorage.setItem('weddingData', JSON.stringify(weddingData));
    } catch (e) { console.error("Failed to save weddingData", e); }
  }, [weddingData]);

  useEffect(() => {
    try {
      localStorage.setItem('weddingWishes', JSON.stringify(wishes));
    } catch (e) { console.error("Failed to save wishes", e); }
  }, [wishes]);

  useEffect(() => {
    try {
      localStorage.setItem('heroImage', heroImage);
    } catch (e) { 
      console.error("Failed to save heroImage", e);
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        alert("Ukuran foto terlalu besar untuk disimpan secara permanen di browser ini.");
      }
    }
  }, [heroImage]);

  useEffect(() => {
    try {
      localStorage.setItem('bgImage', bgImage);
    } catch (e) { 
      console.error("Failed to save bgImage", e);
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        alert("Ukuran background terlalu besar untuk disimpan secara permanen di browser ini.");
      }
    }
  }, [bgImage]);

  useEffect(() => {
    try {
      localStorage.setItem('musicUrl', musicUrl);
    } catch (e) { 
      console.error("Failed to save musicUrl", e);
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        alert("Ukuran musik terlalu besar untuk disimpan secara permanen di browser ini.");
      }
    }
  }, [musicUrl]);

  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load configuration from server on mount
  useEffect(() => {
    let isMounted = true;
    fetch('/api/config')
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        if (!isMounted) return;
        if (data && Object.keys(data).length > 0) {
          if (data.weddingData) setWeddingData(data.weddingData);
          if (data.musicUrl) setMusicUrl(data.musicUrl);
          if (data.heroImage) setHeroImage(data.heroImage);
          if (data.bgImage) setBgImage(data.bgImage);
          if (data.wishes) setWishes(data.wishes);
        }
      })
      .catch(err => console.error("Error loading server config:", err));
    return () => { isMounted = false; };
  }, []);

  const saveConfigToServer = () => {
    setIsSaving(true);
    const fullConfig = {
      weddingData,
      heroImage,
      bgImage,
      musicUrl,
      wishes
    };

    fetch('/api/save-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullConfig)
    })
    .then(res => {
      if (!res.ok) throw new Error("Gagal menyimpan ke server");
      return res.json();
    })
    .then(() => {
      alert("🎉 Konfigurasi berhasil disimpan sebagai default untuk seluruh tamu!");
    })
    .catch(err => {
      console.error("Save config error:", err);
      alert("Gagal menyimpan konfigurasi ke server.");
    })
    .finally(() => {
      setIsSaving(false);
    });
  };

  // Upload to server chunk / base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio' | 'bg' | 'groom' | 'bride') => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = type === 'audio' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
         alert(`Ukuran file terlalu besar (Maks ${type === 'audio' ? '10MB' : '5MB'})`);
         return;
      }
      setIsUploading(type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        
        fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            type: type,
            base64: base64String
          })
        })
        .then(res => {
          if (!res.ok) throw new Error("Gagal mengunggah file ke server");
          return res.json();
        })
        .then(data => {
          const uploadedUrl = data.url;
          if (type === 'image') setHeroImage(uploadedUrl);
          else if (type === 'bg') setBgImage(uploadedUrl);
          else if (type === 'audio') setMusicUrl(uploadedUrl);
          else if (type === 'groom') setWeddingData(prev => ({ ...prev, groomPhoto: uploadedUrl }));
          else if (type === 'bride') setWeddingData(prev => ({ ...prev, bridePhoto: uploadedUrl }));
          
          alert("File berhasil diunggah!");
        })
        .catch(err => {
          console.error("Upload error:", err);
          alert("Gagal mengunggah file. Silakan coba lagi.");
        })
        .finally(() => {
          setIsUploading(null);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadConfig = () => {
    const fullConfig = {
      weddingData,
      heroImage,
      bgImage,
      musicUrl,
      wishes
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullConfig, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "wedding_config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const config = JSON.parse(event.target?.result as string);
          if (config.weddingData) setWeddingData(config.weddingData);
          if (config.heroImage) setHeroImage(config.heroImage);
          if (config.bgImage) setBgImage(config.bgImage);
          if (config.musicUrl) setMusicUrl(config.musicUrl);
          if (config.wishes) setWishes(config.wishes);
          alert("Konfigurasi berhasil diimpor!");
        } catch (error) {
          alert("Gagal mengimpor file. Pastikan format file benar.");
        }
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('to');
    const adminMode = urlParams.get('admin');

    if (name) {
      setGuestName(decodeURIComponent(name));
      setRsvp(prev => ({ ...prev, name: decodeURIComponent(name) }));
      setNewWish(prev => ({ ...prev, name: decodeURIComponent(name) }));
    }

    if (adminMode === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const handleOpen = () => {
    setIsOpened(true);
    // Trigger autoplay when invitation is opened
    window.dispatchEvent(new CustomEvent('playMusic'));
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4A5D4E', '#FDFBF9', '#8DA399']
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const submitWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWish.name || !newWish.message) return;
    
    // Save wish directly on server
    fetch('/api/wishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newWish.name,
        message: newWish.message
      })
    })
    .then(res => {
      if (!res.ok) throw new Error("Gagal mengirim ucapan");
      return res.json();
    })
    .then(data => {
      if (data.wishes) {
        setWishes(data.wishes);
      }
    })
    .catch(err => {
      console.error("Error submitting wish:", err);
      // Local fallback
      setWishes(prev => [
        { name: newWish.name, message: newWish.message, time: "Barusan" },
        ...prev
      ]);
    });

    setNewWish({ ...newWish, message: '' });
    
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.9 },
      colors: ['#4A5D4E', '#8DA399']
    });
  };

  const submitRsvp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvp.name || !rsvp.status) return;
    alert(`Terima kasih ${rsvp.name}, konfirmasi Anda telah terkirim!`);
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.5 }
    });
  };

  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 800], [0, 200]);

  return (
    <div 
      className="min-h-screen relative selection:bg-luxury-gold selection:text-luxury-midnight"
      style={{ backgroundColor: weddingData.bgColor }}
    >
      <AnimatePresence mode="wait">
        {!isOpened ? (
          <motion.div
            key="opening"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0, 
              scale: 0.9,
              transition: { duration: 0.6, ease: "easeInOut" } 
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-zinc-950 text-white font-mono"
          >
            {/* CRT Scanline Overlay & Starry Sky Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.07] bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[length:100%_4px,_6px_100%] z-50"></div>
            
            {/* Retro Pixelated Twinkling Stars in Background */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black z-0">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400 animate-pulse rounded-none"></div>
              <div className="absolute top-1/3 left-3/4 w-1.5 h-1.5 bg-sky-300 animate-ping rounded-none" style={{ animationDuration: '3s' }}></div>
              <div className="absolute top-2/3 left-1/3 w-2 h-2 bg-pink-500 animate-pulse rounded-none" style={{ animationDuration: '4s' }}></div>
              <div className="absolute top-1/2 left-2/3 w-1 h-1 bg-white animate-pulse rounded-none" style={{ animationDuration: '2s' }}></div>
              <div className="absolute top-12 right-12 w-2 h-2 bg-emerald-400 animate-ping rounded-none" style={{ animationDuration: '5s' }}></div>
            </div>

            <div className="text-center max-w-sm w-full mx-4 px-6 py-8 relative z-10 border-4 border-zinc-800 bg-zinc-900 rounded-2xl shadow-[0px_0px_0px_4px_#18181b,_8px_8px_0px_0px_#09090b]">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              >
                <div className="inline-block border border-amber-500/30 px-3 py-1 bg-amber-500/10 text-amber-500 font-bold uppercase text-[9px] tracking-widest rounded-md mb-6 animate-pulse">
                  👾 RETRO WEDDING GAME v2.0 👾
                </div>
                
                <div className="space-y-1">
                  <h1 className="text-3xl font-black text-[#f5f5f7] tracking-wider uppercase font-mono drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
                    {weddingData.groomShort}
                  </h1>
                  <div className="flex justify-center items-center py-1">
                    <span className="text-red-500 text-3xl animate-bounce tracking-wide drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">❤️</span>
                  </div>
                  <h1 className="text-3xl font-black text-[#f5f5f7] tracking-wider uppercase font-mono drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
                    {weddingData.brideShort}
                  </h1>
                </div>
                <div className="text-[10px] text-zinc-500 tracking-wider mt-2 uppercase font-bold">
                  Wedding Adventure
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="mb-8"
              >
                {/* 2D Arcade Style Character Portrait Frame */}
                <div className="w-44 h-44 mx-auto border-4 border-amber-500/80 p-1 shadow-2xl bg-zinc-950 overflow-hidden relative rounded-xl">
                  <div className="absolute inset-0 border border-zinc-800 m-1 pointer-events-none z-10"></div>
                  <img 
                    src={heroImage} 
                    alt="Couple" 
                    className="w-full h-full object-cover transition-all" 
                    style={{ imageRendering: 'pixelated' }}
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle retro matrix grid on the photo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                </div>
              </motion.div>

              <div className="space-y-6">
                <div className="bg-zinc-950/80 border-2 border-zinc-800/80 p-3 rounded-xl text-center shadow-inner relative">
                  <span className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 px-2 bg-zinc-900 border border-zinc-800/60 rounded text-[8px] font-extrabold tracking-[0.1em] text-zinc-500 uppercase">
                    PLAYER ONE (GUEST)
                  </span>
                  <div className="text-amber-500 text-base font-extrabold tracking-wide pt-1.5 pb-0.5">
                    {guestName}
                  </div>
                </div>

                <motion.button
                  onClick={handleOpen}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-amber-500 hover:bg-amber-400 text-black border-2 border-amber-300 px-6 py-4 rounded-xl font-mono text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 w-full cursor-pointer shadow-[0_4px_0_0_#b5840d] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2"
                >
                  PRESS START TO PLAY 🎮
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : invitationTheme === 'pixel' ? (
          <motion.div
            key="pixel-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-screen bg-zinc-950"
          >
            <MusicPlayer url={musicUrl} />
            <PixelInvitation
              weddingData={weddingData}
              guestName={guestName}
              wishes={wishes}
              setWishes={setWishes}
              rsvp={rsvp}
              setRsvp={setRsvp}
              submitRsvp={submitRsvp}
              submitWish={submitWish}
              newWish={newWish}
              setNewWish={setNewWish}
              onSwitchTheme={() => setInvitationTheme('luxury')}
            />
          </motion.div>
        ) : (
          <motion.div
            key="main-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="pb-20"
            style={{ backgroundColor: weddingData.bgColor }}
          >
            <div className="relative z-40 flex justify-center pt-8">
              <button
                onClick={() => setInvitationTheme('pixel')}
                className="bg-zinc-900 border border-zinc-800 text-amber-500 hover:text-white hover:bg-zinc-800 transition-all font-mono text-[10px] uppercase tracking-widest px-6 py-3 rounded-full flex items-center gap-2 shadow-lg cursor-pointer"
              >
                🎮 Switch to Retro Game Invitation
              </button>
            </div>
            
            {/* Hero Section - Luxury Gold/Emerald Theme */}
            <section className="h-screen relative flex items-center justify-center p-6 text-center overflow-hidden">
               <FloatingElements />
               <motion.div 
                 style={{ y: yParallax }}
                 initial={{ scale: 1.1, opacity: 0 }}
                 animate={{ scale: 1, opacity: 0.05 }}
                 transition={{ duration: 4, ease: "easeOut" }}
                 className="absolute inset-0 bg-luxury-emerald"
               >
                 <img 
                  src={bgImage} 
                  alt="Background" 
                  className="w-full h-full object-cover scale-110 blur-[2px]"
                 />
                 <div className="absolute inset-0 bg-luxury-emerald/40 mix-blend-multiply"></div>
                 <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-luxury-cream to-transparent"></div>
               </motion.div>
               
               <div className="relative z-10 max-w-4xl px-4">
                 <motion.div
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   className="space-y-8"
                 >
                   <motion.p 
                     initial={{ opacity: 0, letterSpacing: "0.2em" }}
                     whileInView={{ opacity: 1, letterSpacing: "0.8em" }}
                     transition={{ duration: 2 }}
                     className="font-serif text-luxury-gold italic text-xl uppercase"
                   >
                     {weddingData.greetingText}
                   </motion.p>
                   
                   <div className="relative">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 2 }}
                        className="absolute -inset-10 border border-luxury-gold/10 -z-0"
                      />
                      <h1 className="font-display text-7xl md:text-9xl text-luxury-midnight leading-none tracking-tighter relative z-10">
                        {weddingData.groomShort} <span className="block italic text-3xl font-serif text-luxury-gold my-6">&</span> {weddingData.brideShort}
                      </h1>
                   </div>

                   <motion.div
                     initial={{ width: 0 }}
                     whileInView={{ width: "40%" }}
                     transition={{ duration: 1.5, delay: 0.5 }}
                     className="h-[1px] bg-gradient-to-r from-transparent via-luxury-gold to-transparent mx-auto"
                   />
                   
                   <div className="space-y-4">
                     <p className="font-serif italic text-3xl text-luxury-emerald/70">{weddingData.date}</p>
                   </div>
                   
                   <div className="pt-12">
                     <Countdown targetDate={weddingData.isoDate} />
                   </div>
                 </motion.div>
                 
                 <motion.div 
                   animate={{ y: [0, 8, 0] }}
                   transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute bottom-[-15vh] left-1/2 -translate-x-1/2 opacity-20"
                 >
                   <ChevronDown size={32} className="text-luxury-gold" />
                 </motion.div>
               </div>
            </section>

            {/* Quote Section */}
            <section 
              style={{ backgroundColor: weddingData.bgColor }}
              className="py-32 px-6 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-luxury-gold to-transparent"></div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5 }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-12">
                   <div className="w-12 h-12 mx-auto border border-luxury-gold/30 rotate-45 flex items-center justify-center">
                     <Heart className="text-luxury-gold fill-luxury-gold/20 -rotate-45" size={16} />
                   </div>
                </div>
                <p className="font-serif italic text-2xl md:text-3xl text-luxury-emerald/90 leading-relaxed max-w-2xl mx-auto px-4 gold-text-gradient">
                  "{weddingData.quoteText}"
                </p>
                <div className="mt-12 flex flex-col items-center gap-4">
                   <div className="w-20 h-px bg-luxury-gold/30"></div>
                   <p className="font-display text-lg tracking-[0.2em] text-luxury-gold uppercase">— {weddingData.groomShort} & {weddingData.brideShort} —</p>
                </div>
              </motion.div>
            </section>

            {/* Profile Section - Luxury Frames */}
            <section 
              style={{ backgroundColor: weddingData.bgColor }}
              className="py-32 px-6 relative overflow-hidden"
            >
               <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 md:gap-12 items-center max-w-5xl">
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2 }}
                    className="text-center group"
                  >
                    <div className="relative inline-block mb-16">
                       {/* Frame Decoration */}
                       <div className="absolute -inset-8 border border-luxury-gold/20 -z-0 rotate-3"></div>
                       <div className="absolute -inset-4 border border-luxury-gold/40 -z-0 -rotate-3"></div>
                       
                       <motion.div 
                         whileHover={{ scale: 1.02 }}
                         className="w-72 h-96 relative z-10 shadow-2xl overflow-hidden border-8 border-white p-1 bg-white"
                       >
                         <img 
                           src={weddingData.groomPhoto} 
                           alt="Groom" 
                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                         />
                         <div className="absolute inset-0 bg-luxury-emerald/20 mix-blend-overlay"></div>
                       </motion.div>
                    </div>
                    <h2 className="font-display text-5xl mb-4 text-luxury-emerald tracking-tight">{weddingData.groom}</h2>
                    <div className="w-12 h-px bg-luxury-gold mx-auto mb-6"></div>
                    <p className="font-serif italic text-luxury-gold-dark text-xl mb-4 uppercase tracking-[0.1em]">Putra Dari</p>
                    <p className="text-luxury-midnight/70 font-serif italic text-lg leading-relaxed max-w-xs mx-auto">{weddingData.groomParents}</p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                    className="text-center group"
                  >
                    <div className="relative inline-block mb-16">
                       {/* Frame Decoration */}
                       <div className="absolute -inset-8 border border-luxury-gold/20 -z-0 -rotate-3"></div>
                       <div className="absolute -inset-4 border border-luxury-gold/40 -z-0 rotate-3"></div>
                       
                       <motion.div 
                         whileHover={{ scale: 1.02 }}
                         className="w-72 h-96 relative z-10 shadow-2xl overflow-hidden border-8 border-white p-1 bg-white"
                       >
                         <img 
                           src={weddingData.bridePhoto} 
                           alt="Bride" 
                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                         />
                         <div className="absolute inset-0 bg-luxury-emerald/20 mix-blend-overlay"></div>
                       </motion.div>
                    </div>
                    <h2 className="font-display text-5xl mb-4 text-luxury-emerald tracking-tight">{weddingData.bride}</h2>
                    <div className="w-12 h-px bg-luxury-gold mx-auto mb-6"></div>
                    <p className="font-serif italic text-luxury-gold-dark text-xl mb-4 uppercase tracking-[0.1em]">Putri Dari</p>
                    <p className="text-luxury-midnight/70 font-serif italic text-lg leading-relaxed max-w-xs mx-auto">{weddingData.brideParents}</p>
                  </motion.div>
               </div>
               
               <DecorativeDivider />
            </section>

            {/* Story Section */}
            <section 
              style={{ backgroundColor: weddingData.bgColor }}
              className="py-32 px-6 relative"
            >
               <div className="container mx-auto max-w-4xl">
                 <div className="text-center mb-24">
                   <p className="font-serif italic text-luxury-gold text-xl mb-4 tracking-[0.2em] uppercase">Our Journey</p>
                   <h2 className="font-display text-6xl text-luxury-emerald">Beautiful Story</h2>
                 </div>
                 
                 <div className="space-y-32 relative">
                   {/* Decorative Vertical Line */}
                   <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-luxury-gold/5 via-luxury-gold/20 to-luxury-gold/5 hidden md:block"></div>
                   
                   {[
                      { title: "First Encounter", date: "2022", desc: weddingData.storyAwal },
                      { title: "Growing Deeper", date: "2023", desc: weddingData.storyDekat },
                      { title: "The Proposal", date: "January 2026", desc: weddingData.storyLamaran }
                   ].map((item, i) => (
                     <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.2, duration: 1 }}
                      className={`flex flex-col md:flex-row gap-12 items-center ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                     >
                       <div className="flex-1 text-center md:text-right">
                          {i % 2 === 0 && (
                            <div className="space-y-4">
                              <h3 className="font-display text-3xl text-luxury-emerald">{item.title}</h3>
                              <p className="text-[10px] font-bold tracking-[0.4em] text-luxury-gold uppercase">{item.date}</p>
                              <p className="text-luxury-midnight/70 font-serif italic text-lg leading-relaxed">{item.desc}</p>
                            </div>
                          )}
                       </div>
                       
                       <div className="w-16 h-16 rounded-full bg-luxury-emerald border-4 border-luxury-gold/30 shadow-luxury flex items-center justify-center relative z-10 shrink-0">
                          <div className="w-3 h-3 bg-luxury-gold rotate-45"></div>
                       </div>
                       
                       <div className="flex-1 text-center md:text-left">
                          {i % 2 !== 0 && (
                            <div className="space-y-4">
                              <h3 className="font-display text-3xl text-luxury-emerald">{item.title}</h3>
                              <p className="text-[10px] font-bold tracking-[0.4em] text-luxury-gold uppercase">{item.date}</p>
                              <p className="text-luxury-midnight/70 font-serif italic text-lg leading-relaxed">{item.desc}</p>
                            </div>
                          )}
                       </div>
                     </motion.div>
                   ))}
                 </div>
               </div>
             </section>

             <DecorativeDivider />
             {/* Event Details - Luxury Cards */}
            <section 
               style={{ backgroundColor: weddingData.bgColor }}
               className="py-32 px-6 relative bg-pattern"
            >
               <div className="container mx-auto text-center relative z-10">
                 <div className="mb-24">
                   <p className="font-serif italic text-luxury-gold text-xl mb-4 tracking-[0.2em] uppercase">Save The Date</p>
                   <h2 className="font-display text-6xl text-luxury-emerald tracking-tight">The Ceremony</h2>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-5xl mx-auto">
                    {[
                      { 
                        title: "Akad Nikah", 
                        icon: <div className="w-16 h-16 mx-auto mb-10 border border-luxury-gold/40 rotate-45 flex items-center justify-center group-hover:border-luxury-gold transition-colors duration-500">
                                <Clock className="text-luxury-gold -rotate-45" size={24} />
                              </div>,
                        date: weddingData.date,
                        time: weddingData.akadTime,
                        location: weddingData.akadLocation,
                        address: weddingData.akadAddress,
                      },
                      { 
                        title: "Tasyakuran", 
                        icon: <div className="w-16 h-16 mx-auto mb-10 border border-luxury-gold/40 rotate-45 flex items-center justify-center group-hover:border-luxury-gold transition-colors duration-500">
                                <Utensils className="text-luxury-gold -rotate-45" size={24} />
                              </div>,
                        date: weddingData.date,
                        time: weddingData.resepsiTime,
                        location: weddingData.resepsiLocation,
                        address: weddingData.resepsiAddress,
                      }
                    ].map((event, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.3, duration: 1.2 }}
                        className="p-16 bg-white border border-luxury-gold/20 shadow-luxury relative group overflow-hidden"
                      >
                        {/* Decorative Corners */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-luxury-gold"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-luxury-gold"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-luxury-gold"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-luxury-gold"></div>

                        {event.icon}
                        <h3 className="font-display text-4xl mb-8 text-luxury-midnight tracking-tight italic">{event.title}</h3>
                        
                        <div className="space-y-6 text-luxury-midnight font-serif italic text-xl">
                           <div className="flex flex-col items-center gap-2">
                             <span className="text-[10px] font-bold not-italic font-sans text-luxury-gold uppercase tracking-[0.3em] mb-2">When</span>
                             <p>{event.date}</p>
                             <p className="text-luxury-gold-dark">{event.time}</p>
                           </div>
                           
                           <div className="pt-8 flex flex-col items-center gap-2">
                             <span className="text-[10px] font-bold not-italic font-sans text-luxury-gold uppercase tracking-[0.3em] mb-2">Where</span>
                             <p className="font-display not-italic font-medium text-2xl text-luxury-emerald">{event.location}</p>
                             <p className="text-sm opacity-60 max-w-xs mx-auto not-italic font-sans leading-relaxed">{event.address}</p>
                           </div>
                        </div>
                        
                        <div className="mt-16">
                          <motion.a 
                            href={weddingData.mapsLink} 
                            target="_blank" 
                            rel="noreferrer"
                            whileHover={{ backgroundColor: "#1A3026", color: "#C5A059" }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center justify-center gap-4 border border-luxury-gold text-luxury-gold py-5 px-12 text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 shadow-sm"
                          >
                            Google Maps
                          </motion.a>
                        </div>
                      </motion.div>
                    ))}
                 </div>
               </div>
            </section>

            <DecorativeDivider />

            {/* Wedding Gift - Luxury Style */}
            <section 
              style={{ backgroundColor: weddingData.bgColor }}
              className="py-32 px-6 text-center"
            >
               <div className="max-w-3xl mx-auto">
                 <div className="mb-20">
                   <p className="font-serif italic text-luxury-gold text-xl mb-4 tracking-[0.2em] uppercase">Wedding Gift</p>
                   <h2 className="font-display text-5xl text-luxury-emerald">Share Your Love</h2>
                 </div>
                 <p className="text-luxury-midnight/60 text-lg mb-16 italic font-serif leading-relaxed px-4 max-w-2xl mx-auto">
                   Your presence and prayers are the greatest gift of all. However, should you wish to honor us with a gift, a contribution or a token of love would be cherished.
                 </p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-10 bg-white border border-luxury-gold/20 shadow-luxury relative overflow-hidden text-left flex flex-col justify-between group">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-luxury-gold/5 -mr-12 -mt-12 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                       <div>
                         <p className="font-bold text-luxury-midnight mb-2 text-xs uppercase tracking-[0.3em]">Bank Transfer</p>
                         <p className="text-2xl font-display text-luxury-emerald mb-2">Mandiri</p>
                         <p className="text-[10px] text-luxury-gold-dark mb-6 font-sans uppercase tracking-[0.1em]">Account Holder: {weddingData.bcaOwner}</p>
                         <p className="font-mono text-xl tracking-wider text-luxury-midnight font-bold border-b border-luxury-gold/10 pb-2">{weddingData.bcaNumber}</p>
                       </div>
                       <button 
                        onClick={() => handleCopy(weddingData.bcaNumber, 'bca')}
                        className={`mt-10 w-full text-[10px] font-bold uppercase tracking-[0.3em] border border-luxury-gold/30 px-6 py-4 transition-all flex items-center justify-center gap-3 ${copyStatus === 'bca' ? 'bg-luxury-emerald text-luxury-gold border-luxury-emerald' : 'hover:bg-luxury-emerald hover:text-luxury-gold'}`}
                       >
                         {copyStatus === 'bca' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                         {copyStatus === 'bca' ? 'Copied to Clipboard' : 'Copy Account Number'}
                       </button>
                    </div>
                    
                    <div className="p-10 bg-white border border-luxury-gold/20 shadow-luxury relative overflow-hidden text-left flex flex-col justify-between group">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-luxury-gold/5 -mr-12 -mt-12 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                       <div>
                         <p className="font-bold text-luxury-midnight mb-2 text-xs uppercase tracking-[0.3em]">Digital Wallet</p>
                         <p className="text-2xl font-display text-luxury-emerald mb-2">DANA</p>
                         <p className="text-[10px] text-luxury-gold-dark mb-6 font-sans uppercase tracking-[0.1em]">Account Holder: {weddingData.danaOwner}</p>
                         <p className="font-mono text-xl tracking-wider text-luxury-midnight font-bold border-b border-luxury-gold/10 pb-2">{weddingData.danaNumber}</p>
                       </div>
                       <button 
                        onClick={() => handleCopy(weddingData.danaNumber, 'dana')}
                        className={`mt-10 w-full text-[10px] font-bold uppercase tracking-[0.3em] border border-luxury-gold/30 px-6 py-4 transition-all flex items-center justify-center gap-3 ${copyStatus === 'dana' ? 'bg-luxury-emerald text-luxury-gold border-luxury-emerald' : 'hover:bg-luxury-emerald hover:text-luxury-gold'}`}
                       >
                         {copyStatus === 'dana' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                         {copyStatus === 'dana' ? 'Copied to Clipboard' : 'Copy Wallet Number'}
                       </button>
                    </div>
                 </div>

                 <div className="mt-16 p-10 bg-luxury-emerald text-luxury-gold shadow-luxury border-t-4 border-luxury-gold max-w-xl mx-auto">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Mailing Address</p>
                    <p className="font-serif italic text-2xl mb-4 italic">"{weddingData.giftAddress}"</p>
                    <div className="w-12 h-px bg-luxury-gold/30 mx-auto"></div>
                 </div>
               </div>
            </section>

            {/* RSVP / Konfirmasi Kehadiran - Luxury Style */}
            <section 
              style={{ backgroundColor: weddingData.bgColor }}
              className="py-32 px-6 relative overflow-hidden"
            >
               <div className="max-w-2xl mx-auto text-center">
                 <div className="mb-20">
                    <p className="font-serif italic text-luxury-gold text-xl mb-4 tracking-[0.2em] uppercase">RSVP</p>
                    <h2 className="font-display text-5xl text-luxury-emerald tracking-tight">Confirm Your Attendance</h2>
                 </div>
                 <p className="text-luxury-midnight/60 text-lg mb-16 italic font-serif leading-relaxed px-4 max-w-xl mx-auto">
                   Please let us know if you can join our special celebration by filling out the form below.
                 </p>
                 
                 <form onSubmit={submitRsvp} className="bg-white p-12 shadow-luxury border border-luxury-gold/10 text-left relative">
                    {/* Decorative line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-luxury-gold via-luxury-champagne to-luxury-gold"></div>
                    <div className="space-y-8">
                       <div>
                         <label className="block text-[10px] uppercase tracking-[0.3em] text-luxury-gold mb-3 font-bold">Full Name</label>
                         <input 
                            type="text" 
                            required
                            value={rsvp.name}
                            onChange={(e) => setRsvp({...rsvp, name: e.target.value})}
                            placeholder="Your name..." 
                            className="w-full p-5 border border-luxury-gold/20 focus:outline-none focus:border-luxury-gold bg-luxury-cream/30 font-serif italic text-lg" 
                         />
                       </div>
                       
                       <div>
                         <label className="block text-[10px] uppercase tracking-[0.3em] text-luxury-gold mb-3 font-bold">Will you attend?</label>
                         <div className="grid grid-cols-2 gap-6">
                            <button 
                              type="button"
                              onClick={() => setRsvp({...rsvp, status: 'hadir'})}
                              className={`p-5 font-display text-lg tracking-wide transition-all duration-500 border-2 ${rsvp.status === 'hadir' ? 'bg-luxury-emerald text-luxury-gold border-luxury-emerald' : 'bg-white text-luxury-midnight border-luxury-gold/10 hover:border-luxury-gold'}`}
                            >
                              Joyfully Attend
                            </button>
                            <button 
                              type="button"
                              onClick={() => setRsvp({...rsvp, status: 'tidak_hadir'})}
                              className={`p-5 font-display text-lg tracking-wide transition-all duration-500 border-2 ${rsvp.status === 'tidak_hadir' ? 'bg-luxury-gold/20 text-luxury-gold-dark border-luxury-gold' : 'bg-white text-luxury-midnight border-luxury-gold/10 hover:border-luxury-gold'}`}
                            >
                              Regretfully Decline
                            </button>
                         </div>
                       </div>
                       
                       <div>
                         <label className="block text-[10px] uppercase tracking-[0.3em] text-luxury-gold mb-3 font-bold">Number of Guests</label>
                         <div className="relative">
                            <select 
                              value={rsvp.guests}
                              onChange={(e) => setRsvp({...rsvp, guests: e.target.value})}
                              className="w-full p-5 pr-12 border border-luxury-gold/20 focus:outline-none appearance-none bg-luxury-cream/30 text-lg font-serif italic"
                            >
                              <option value="1">1 Guest</option>
                              <option value="2">2 Guests</option>
                              <option value="3">3 Guests</option>
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-luxury-gold pointer-events-none" size={20} />
                         </div>
                       </div>
                       
                       <button className="w-full bg-luxury-emerald text-luxury-gold py-5 font-sans text-[10px] uppercase tracking-[0.4em] font-bold shadow-luxury hover:bg-luxury-midnight transition-all duration-500 transform active:scale-[0.99] border border-luxury-gold/50">Send Confirmation</button>
                    </div>
                 </form>
               </div>
            </section>

            {/* Wishes / Guestbook - Luxury Theme */}
            <section 
              style={{ backgroundColor: weddingData.bgColor }}
              className="py-32 px-6 relative overflow-hidden bg-pattern"
            >
               <div className="max-w-4xl mx-auto text-center relative z-10">
                 <div className="mb-20">
                    <p className="font-serif italic text-luxury-gold text-xl mb-4 tracking-[0.2em] uppercase">Guestbook</p>
                    <h2 className="font-display text-5xl text-luxury-emerald tracking-tight">Blessings & Greetings</h2>
                 </div>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
                   {/* Form */}
                   <div className="lg:col-span-2">
                     <motion.div 
                       initial={{ opacity: 0, x: -20 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       className="bg-white p-10 border border-luxury-gold/10 shadow-luxury text-left sticky top-10"
                     >
                       <form onSubmit={submitWish} className="space-y-8">
                          <div>
                            <label className="block text-[10px] uppercase font-bold tracking-[0.3em] text-luxury-gold mb-3">Your Name</label>
                            <input 
                              type="text" 
                              required
                              value={newWish.name}
                              onChange={(e) => setNewWish({...newWish, name: e.target.value})}
                              placeholder="Name..." 
                              className="w-full p-4 border border-luxury-gold/20 focus:outline-none focus:border-luxury-gold bg-luxury-cream/30 font-serif italic text-lg" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold tracking-[0.3em] text-luxury-gold mb-3">Your Message</label>
                            <textarea 
                              required
                              value={newWish.message}
                              onChange={(e) => setNewWish({...newWish, message: e.target.value})}
                              placeholder="Write your wishes here..." 
                              className="w-full p-4 border border-luxury-gold/20 focus:outline-none focus:border-luxury-gold h-48 bg-luxury-cream/30 resize-none font-serif italic text-lg"
                            ></textarea>
                          </div>
                          <button 
                            type="submit"
                            className="w-full bg-luxury-emerald text-luxury-gold py-5 font-sans text-[10px] uppercase tracking-[0.4em] font-bold shadow-luxury flex items-center justify-center gap-3 hover:bg-luxury-midnight transition-all border border-luxury-gold/30"
                          >
                            <Send size={16} /> Send Wishes
                          </button>
                       </form>
                     </motion.div>
                   </div>

                   {/* List */}
                   <div className="lg:col-span-3 space-y-8 max-h-[800px] overflow-y-auto pr-6 scrollbar-thin scrollbar-thumb-luxury-gold/20">
                      <AnimatePresence initial={false}>
                        {wishes.map((wish, index) => (
                          <motion.div 
                            key={index + wish.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-8 border border-luxury-gold/5 shadow-sm relative group hover:border-luxury-gold/30 transition-all duration-500 text-left"
                          >
                             <div className="flex justify-between items-start mb-6">
                               <div className="w-12 h-12 border border-luxury-gold/30 rotate-45 flex items-center justify-center text-luxury-gold font-display text-xl group-hover:bg-luxury-emerald group-hover:text-luxury-gold transition-all duration-700">
                                 <span className="-rotate-45">{wish.name.charAt(0).toUpperCase()}</span>
                               </div>
                               <span className="text-[9px] text-luxury-gold-dark font-sans uppercase tracking-[0.2em] pt-2">{wish.time}</span>
                             </div>
                             <p className="font-display text-2xl text-luxury-emerald mb-4 tracking-tight">{wish.name}</p>
                             <p className="text-luxury-midnight/70 italic font-serif text-xl leading-relaxed whitespace-pre-wrap">{wish.message}</p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                   </div>
                 </div>
               </div>
            </section>

            {/* Closing - Luxury Type */}
            <footer 
              style={{ backgroundColor: weddingData.bgColor }}
              className="py-32 px-6 text-center border-t border-luxury-gold/10"
            >
               <div className="max-w-2xl mx-auto space-y-12">
                 <div className="relative inline-block">
                    <div className="absolute -inset-4 border border-luxury-gold/30 rounded-full animate-pulse"></div>
                    <div className="w-32 h-32 rounded-full border-2 border-luxury-gold p-1 overflow-hidden relative z-10">
                       <img src={heroImage} alt="Couple" className="w-full h-full object-cover rounded-full" style={{ imageRendering: 'pixelated' }} referrerPolicy="no-referrer" />
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <p className="font-serif italic text-luxury-gold text-xl tracking-[0.2em] uppercase">With Love,</p>
                    <h3 className="font-display text-6xl text-luxury-emerald">{weddingData.groomShort} & {weddingData.brideShort}</h3>
                    <div className="w-16 h-px bg-luxury-gold mx-auto mt-8"></div>
                    <p className="text-[10px] uppercase font-bold tracking-[0.6em] text-luxury-gold-dark mt-8">{weddingData.date}</p>
                 </div>
               </div>
            </footer>

            {/* Settings Button - Only visible for admin */}
            {false && (
              <div className="fixed bottom-6 left-6 z-50">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSettings(!showSettings)}
                  className="bg-luxury-emerald p-4 rounded-full shadow-luxury border border-luxury-gold text-luxury-gold flex items-center justify-center translate-z-10"
                >
                  <Settings size={20} />
                </motion.button>
                
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.9 }}
                      className="absolute bottom-16 left-0 bg-white p-8 rounded-none shadow-luxury border border-luxury-gold/20 min-w-[320px]"
                    >
                      <div className="flex justify-between items-center mb-8">
                        <h4 className="font-display text-2xl text-luxury-emerald tracking-tight">Customization</h4>
                        <button onClick={() => setShowSettings(false)} className="text-luxury-gold-dark hover:text-luxury-gold">
                          <X size={20} />
                        </button>
                      </div>
                      
                      <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-luxury-gold/20">
                        <div className="space-y-6">
                          <h5 className="text-[10px] uppercase tracking-[0.3em] text-luxury-gold font-bold border-b border-luxury-gold/10 pb-2">Bride & Groom Details</h5>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[9px] text-luxury-gold-dark font-bold uppercase tracking-widest">Groom Full Name</label>
                              <input 
                                type="text" 
                                value={weddingData.groom}
                                onChange={(e) => setWeddingData({...weddingData, groom: e.target.value})}
                                className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20 focus:outline-none focus:border-luxury-gold transition-all" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] text-luxury-gold-dark font-bold uppercase tracking-widest">Bride Full Name</label>
                              <input 
                                type="text" 
                                value={weddingData.bride}
                                onChange={(e) => setWeddingData({...weddingData, bride: e.target.value})}
                                className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20 focus:outline-none focus:border-luxury-gold transition-all" 
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[9px] text-luxury-gold-dark font-bold uppercase tracking-widest">Groom Nickname</label>
                              <input 
                                type="text" 
                                value={weddingData.groomShort}
                                onChange={(e) => setWeddingData({...weddingData, groomShort: e.target.value})}
                                className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20 focus:outline-none focus:border-luxury-gold transition-all" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] text-luxury-gold-dark font-bold uppercase tracking-widest">Bride Nickname</label>
                              <input 
                                type="text" 
                                value={weddingData.brideShort}
                                onChange={(e) => setWeddingData({...weddingData, brideShort: e.target.value})}
                                className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20 focus:outline-none focus:border-luxury-gold transition-all" 
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[9px] text-luxury-gold-dark font-bold uppercase tracking-widest">Display Date</label>
                              <input 
                                type="text" 
                                value={weddingData.date}
                                onChange={(e) => setWeddingData({...weddingData, date: e.target.value})}
                                className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20 focus:outline-none focus:border-luxury-gold transition-all" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] text-luxury-gold-dark font-bold uppercase tracking-widest">ISO Date (Countdown)</label>
                              <input 
                                type="text" 
                                value={weddingData.isoDate}
                                onChange={(e) => setWeddingData({...weddingData, isoDate: e.target.value})}
                                className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20 focus:outline-none focus:border-luxury-gold transition-all" 
                                placeholder="YYYY-MM-DDTHH:MM:SS"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[9px] text-luxury-gold-dark font-bold uppercase tracking-widest">Greeting Text</label>
                            <input 
                              type="text" 
                              value={weddingData.greetingText}
                              onChange={(e) => setWeddingData({...weddingData, greetingText: e.target.value})}
                              className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20 focus:outline-none focus:border-luxury-gold transition-all" 
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[9px] text-luxury-gold-dark font-bold uppercase tracking-widest">Quote Text</label>
                            <textarea 
                              value={weddingData.quoteText}
                              onChange={(e) => setWeddingData({...weddingData, quoteText: e.target.value})}
                              className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20 focus:outline-none focus:border-luxury-gold h-20 resize-none" 
                            />
                          </div>

                          <div className="space-y-4 pt-4 border-t border-luxury-gold/5">
                            <h5 className="text-[10px] uppercase tracking-[0.3em] text-luxury-gold font-bold mb-2">Parents Details</h5>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[9px] text-luxury-gold-dark font-bold uppercase tracking-widest">Groom's Parents</label>
                                <input type="text" value={weddingData.groomParents} onChange={(e) => setWeddingData({...weddingData, groomParents: e.target.value})} className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] text-luxury-gold-dark font-bold uppercase tracking-widest">Bride's Parents</label>
                                <input type="text" value={weddingData.brideParents} onChange={(e) => setWeddingData({...weddingData, brideParents: e.target.value})} className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 pt-4 border-t border-luxury-gold/5">
                            <h5 className="text-[10px] uppercase tracking-[0.3em] text-luxury-gold font-bold mb-2">Love Story</h5>
                            <textarea placeholder="Story Awal" value={weddingData.storyAwal} onChange={(e) => setWeddingData({...weddingData, storyAwal: e.target.value})} className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20 h-16 resize-none" />
                            <textarea placeholder="Story Dekat" value={weddingData.storyDekat} onChange={(e) => setWeddingData({...weddingData, storyDekat: e.target.value})} className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20 h-16 resize-none" />
                            <textarea placeholder="Story Lamaran" value={weddingData.storyLamaran} onChange={(e) => setWeddingData({...weddingData, storyLamaran: e.target.value})} className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20 h-16 resize-none" />
                          </div>

                          <div className="space-y-4 pt-4 border-t border-luxury-gold/5">
                            <h5 className="text-[10px] uppercase tracking-[0.3em] text-luxury-gold font-bold mb-2">Event Schedule</h5>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[9px] text-luxury-gold-dark font-bold uppercase tracking-widest">Akad Time</label>
                                <input type="text" value={weddingData.akadTime} onChange={(e) => setWeddingData({...weddingData, akadTime: e.target.value})} className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] text-luxury-gold-dark font-bold uppercase tracking-widest">Akad Location</label>
                                <input type="text" value={weddingData.akadLocation} onChange={(e) => setWeddingData({...weddingData, akadLocation: e.target.value})} className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20" />
                              </div>
                            </div>
                            <textarea placeholder="Akad Address" value={weddingData.akadAddress} onChange={(e) => setWeddingData({...weddingData, akadAddress: e.target.value})} className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20 h-20 resize-none" />
                            
                            <div className="grid grid-cols-2 gap-4 mt-6">
                              <div className="space-y-2">
                                <label className="text-[9px] text-luxury-gold-dark font-bold uppercase tracking-widest">Reception Time</label>
                                <input type="text" value={weddingData.resepsiTime} onChange={(e) => setWeddingData({...weddingData, resepsiTime: e.target.value})} className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] text-luxury-gold-dark font-bold uppercase tracking-widest">Reception Location</label>
                                <input type="text" value={weddingData.resepsiLocation} onChange={(e) => setWeddingData({...weddingData, resepsiLocation: e.target.value})} className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20" />
                              </div>
                            </div>
                            <textarea placeholder="Reception Address" value={weddingData.resepsiAddress} onChange={(e) => setWeddingData({...weddingData, resepsiAddress: e.target.value})} className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20 h-20 resize-none" />
                          </div>

                          <div className="space-y-4 pt-4 border-t border-luxury-gold/5">
                            <h5 className="text-[10px] uppercase tracking-[0.3em] text-luxury-gold font-bold mb-2">Guest Link Generator</h5>
                            <input 
                              type="text" 
                              placeholder="Guest Name..." 
                              onChange={(e) => {
                                const name = e.target.value;
                                const baseUrl = window.location.origin + window.location.pathname;
                                const link = name ? `${baseUrl}?to=${encodeURIComponent(name)}` : baseUrl;
                                const linkInput = document.getElementById('generated-link') as HTMLInputElement;
                                if (linkInput) linkInput.value = link;
                              }}
                              className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20" 
                            />
                            <div className="flex gap-2">
                              <input 
                                id="generated-link"
                                type="text" 
                                readOnly
                                className="flex-1 p-3 text-[9px] bg-luxury-emerald/5 text-luxury-midnight border border-luxury-gold/10"
                              />
                              <button 
                                onClick={() => {
                                  const linkInput = document.getElementById('generated-link') as HTMLInputElement;
                                  linkInput.select();
                                  navigator.clipboard.writeText(linkInput.value);
                                }}
                                className="px-6 py-3 bg-luxury-emerald text-luxury-gold text-[9px] font-bold uppercase tracking-widest hover:bg-luxury-midnight transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                          </div>

                          <div className="space-y-4 pt-4 border-t border-luxury-gold/5">
                            <h5 className="text-[10px] uppercase tracking-[0.3em] text-luxury-gold font-bold mb-2">Gift & Wallet Details</h5>
                            <div className="grid grid-cols-2 gap-4">
                              <input type="text" placeholder="Wallet Name" value={weddingData.danaOwner} onChange={(e) => setWeddingData({...weddingData, danaOwner: e.target.value})} className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20" />
                              <input type="text" placeholder="Wallet Number" value={weddingData.danaNumber} onChange={(e) => setWeddingData({...weddingData, danaNumber: e.target.value})} className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20" />
                            </div>
                            <textarea placeholder="Mailing Address" value={weddingData.giftAddress} onChange={(e) => setWeddingData({...weddingData, giftAddress: e.target.value})} className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20 h-20 resize-none" />
                          </div>
                        </div>

                        <div className="border-t border-luxury-gold/10 pt-8 space-y-6 pb-12">
                          <h5 className="text-[10px] uppercase tracking-[0.3em] text-luxury-gold font-bold">Media Configuration</h5>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[9px] text-luxury-gold-dark font-bold uppercase tracking-widest">Groom Photo URL</label>
                              <input type="text" value={weddingData.groomPhoto} onChange={(e) => setWeddingData({...weddingData, groomPhoto: e.target.value})} className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20" />
                              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'groom')} className="hidden" id="groom-photo-upload" />
                              <label htmlFor="groom-photo-upload" className="block text-center p-3 text-[9px] font-bold uppercase border border-luxury-gold/20 cursor-pointer hover:bg-luxury-cream/30 transition-colors">Upload</label>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] text-luxury-gold-dark font-bold uppercase tracking-widest">Bride Photo URL</label>
                              <input type="text" value={weddingData.bridePhoto} onChange={(e) => setWeddingData({...weddingData, bridePhoto: e.target.value})} className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20" />
                              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'bride')} className="hidden" id="bride-photo-upload" />
                              <label htmlFor="bride-photo-upload" className="block text-center p-3 text-[9px] font-bold uppercase border border-luxury-gold/20 cursor-pointer hover:bg-luxury-cream/30 transition-colors">Upload</label>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[9px] text-luxury-gold-dark font-bold uppercase tracking-widest">Background Image URL</label>
                            <input type="text" value={bgImage} onChange={(e) => setBgImage(e.target.value)} className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20" />
                          </div>

                          <div className="space-y-3">
                            <label className="text-[9px] text-luxury-gold-dark font-bold uppercase tracking-widest">Background Music (MP3 URL)</label>
                            <input type="text" value={musicUrl} onChange={(e) => setMusicUrl(e.target.value)} className="w-full p-3 text-xs border border-luxury-gold/10 bg-luxury-cream/20" placeholder="https://example.com/song.mp3" />
                            
                            {/* Music Presets Selection */}
                            <div className="space-y-1 bg-luxury-cream/10 p-2 border border-luxury-gold/10 rounded">
                              <span className="text-[8px] text-luxury-gold-dark uppercase font-bold tracking-wider block mb-1">Preset Tema Pernikahan:</span>
                              <div className="flex flex-col gap-1">
                                {[
                                  { name: "🎹 Classic Wedding March (Piano)", url: "https://archive.org/download/wedding-march-piano/wedding-march-piano.mp3" },
                                  { name: "🎻 Pachelbel Canon (Orchestra)", url: "https://archive.org/download/pachelbel-canon-in-d/Pachelbel-Canon-in-D.mp3" },
                                  { name: "👾 Ed Sheeran - Perfect (8-Bit)", url: "https://archive.org/download/8-bit-ed-sheeran-perfect/8-Bit%20Ed%20Sheeran%20-%20Perfect.mp3" }
                                ].map((preset) => (
                                  <button
                                    key={preset.url}
                                    type="button"
                                    onClick={() => setMusicUrl(preset.url)}
                                    className={`text-left text-[9px] p-1.5 rounded transition-all cursor-pointer font-sans ${musicUrl === preset.url ? 'bg-luxury-gold text-luxury-midnight font-bold' : 'hover:bg-luxury-cream/30 text-zinc-700'}`}
                                  >
                                    {preset.name}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <input type="file" accept="audio/mpeg,audio/mp3" onChange={(e) => handleFileUpload(e, 'audio')} className="hidden" id="music-file-upload" />
                            <label htmlFor="music-file-upload" className={`block text-center p-3 text-[9px] font-bold uppercase border tracking-widest cursor-pointer transition-all ${isUploading === 'audio' ? 'bg-luxury-cream/30 text-zinc-400 border-zinc-200 cursor-not-allowed' : 'border-luxury-gold/20 hover:bg-luxury-cream/30 text-luxury-gold-dark'}`}>
                              {isUploading === 'audio' ? '⏳ Mengunggah Musik...' : '🎵 Upload File MP3 (Mak 10MB)'}
                            </label>
                          </div>

                          <div className="space-y-4 pt-6">
                            <button 
                              onClick={saveConfigToServer}
                              disabled={isSaving}
                              className="w-full p-5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-black uppercase tracking-[0.25em] border border-amber-500 shadow-luxury transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                              {isSaving ? '⏳ MENYIMPAN SEBAGAI DEFAULT...' : '💾 SIMPAN SEBAGAI DEFAULT UNTUK SEMUA TAMU'}
                            </button>

                            <button 
                              onClick={downloadConfig}
                              className="w-full p-5 bg-luxury-emerald text-luxury-gold text-[10px] font-bold uppercase tracking-[0.3em] border border-luxury-gold/30 shadow-luxury hover:bg-luxury-midnight transition-all cursor-pointer"
                            >
                              Download Configuration
                            </button>
                            
                            <label className="w-full p-5 bg-white border border-luxury-gold/20 text-luxury-emerald text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center cursor-pointer hover:bg-luxury-cream transition-all">
                              Import Configuration
                              <input type="file" accept=".json" onChange={importConfig} className="hidden" />
                            </label>

                            <p className="text-[8px] text-luxury-gold-dark text-center mt-4 uppercase tracking-[0.2em] leading-relaxed">
                              Changes are saved locally. Use export/import for backup.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Admin Settings Button & Customization Panel */}
      {isAdmin && (
        <div className="fixed bottom-6 left-6 z-[9999] select-none">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSettings(!showSettings)}
            className="bg-[#1b3d2b] text-[#dfb86c] p-4 rounded-full shadow-[0_4px_20px_0_rgba(27,61,43,0.3)] border border-[#dfb86c] flex items-center justify-center cursor-pointer shadow-lg hover:bg-zinc-900 transition-colors"
            title="Admin Settings"
          >
            <Settings size={22} />
          </motion.button>
          
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="absolute bottom-16 left-0 bg-[#fdfbf9] py-6 px-5 border border-zinc-200 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.15)] min-w-[325px] sm:min-w-[400px] max-w-[450px] rounded-2xl text-zinc-800"
              >
                <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚙️</span>
                    <h4 className="font-sans font-bold text-lg text-zinc-900 tracking-tight">Admin Customization</h4>
                  </div>
                  <button onClick={() => setShowSettings(false)} className="text-zinc-400 hover:text-zinc-600 cursor-pointer p-1 rounded-full hover:bg-zinc-100">
                    <X size={18} />
                  </button>
                </div>
                
                <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-200">
                  {/* Bride & Groom Details */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] uppercase tracking-[0.2em] text-[#b58c4c] font-black border-l-2 border-[#b58c4c] pl-2">Bride & Groom</h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Groom Name</label>
                        <input 
                          type="text" 
                          value={weddingData.groom}
                          onChange={(e) => setWeddingData({...weddingData, groom: e.target.value})}
                          className="w-full p-2 text-xs border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:border-[#b58c4c] focus:bg-white transition-all text-zinc-800 font-medium" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Bride Name</label>
                        <input 
                          type="text" 
                          value={weddingData.bride}
                          onChange={(e) => setWeddingData({...weddingData, bride: e.target.value})}
                          className="w-full p-2 text-xs border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:border-[#b58c4c] focus:bg-white transition-all text-zinc-800 font-medium" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Groom Short</label>
                        <input 
                          type="text" 
                          value={weddingData.groomShort}
                          onChange={(e) => setWeddingData({...weddingData, groomShort: e.target.value})}
                          className="w-full p-2 text-xs border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:border-[#b58c4c] focus:bg-white transition-all text-zinc-800 font-medium" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Bride Short</label>
                        <input 
                          type="text" 
                          value={weddingData.brideShort}
                          onChange={(e) => setWeddingData({...weddingData, brideShort: e.target.value})}
                          className="w-full p-2 text-xs border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:border-[#b58c4c] focus:bg-white transition-all text-zinc-800 font-medium" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Groom Parents</label>
                        <input 
                          type="text" 
                          value={weddingData.groomParents} 
                          onChange={(e) => setWeddingData({...weddingData, groomParents: e.target.value})} 
                          className="w-full p-2 text-xs border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:border-[#b58c4c] focus:bg-white transition-all text-zinc-800 font-medium" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Bride Parents</label>
                        <input 
                          type="text" 
                          value={weddingData.brideParents} 
                          onChange={(e) => setWeddingData({...weddingData, brideParents: e.target.value})} 
                          className="w-full p-2 text-xs border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:border-[#b58c4c] focus:bg-white transition-all text-zinc-800 font-medium" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Schedule Details */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] uppercase tracking-[0.2em] text-[#b58c4c] font-black border-l-2 border-[#b58c4c] pl-2">Schedule</h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Akad Time</label>
                        <input 
                          type="text" 
                          value={weddingData.akadTime} 
                          onChange={(e) => setWeddingData({...weddingData, akadTime: e.target.value})} 
                          className="w-full p-2 text-xs border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:border-[#b58c4c] focus:bg-white transition-all text-zinc-800 font-medium" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Resepsi Time</label>
                        <input 
                          type="text" 
                          value={weddingData.resepsiTime} 
                          onChange={(e) => setWeddingData({...weddingData, resepsiTime: e.target.value})} 
                          className="w-full p-2 text-xs border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:border-[#b58c4c] focus:bg-white transition-all text-zinc-800 font-medium" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Akad Place</label>
                        <input 
                          type="text" 
                          value={weddingData.akadLocation} 
                          onChange={(e) => setWeddingData({...weddingData, akadLocation: e.target.value})} 
                          className="w-full p-2 text-xs border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:border-[#b58c4c] focus:bg-white transition-all text-zinc-800 font-medium" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Resepsi Place</label>
                        <input 
                          type="text" 
                          value={weddingData.resepsiLocation} 
                          onChange={(e) => setWeddingData({...weddingData, resepsiLocation: e.target.value})} 
                          className="w-full p-2 text-xs border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:border-[#b58c4c] focus:bg-white transition-all text-zinc-800 font-medium" 
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Resepsi Address</label>
                      <input 
                        type="text" 
                        value={weddingData.resepsiAddress} 
                        onChange={(e) => setWeddingData({...weddingData, resepsiAddress: e.target.value})} 
                        className="w-full p-2 text-xs border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:border-[#b58c4c] focus:bg-white transition-all text-zinc-800 font-medium" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Maps Link</label>
                      <input 
                        type="text" 
                        value={weddingData.mapsLink} 
                        onChange={(e) => setWeddingData({...weddingData, mapsLink: e.target.value})} 
                        className="w-full p-2 text-xs border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:border-[#b58c4c] focus:bg-white transition-all text-zinc-800 font-medium" 
                      />
                    </div>
                  </div>

                  {/* Payment & Shipping */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] uppercase tracking-[0.2em] text-[#b58c4c] font-black border-l-2 border-[#b58c4c] pl-2">Gift, Cash & Shipping</h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Mandiri Owner</label>
                        <input 
                          type="text" 
                          value={weddingData.bcaOwner} 
                          onChange={(e) => setWeddingData({...weddingData, bcaOwner: e.target.value})} 
                          className="w-full p-2 text-xs border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:border-[#b58c4c] focus:bg-white transition-all text-zinc-800 font-medium" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Mandiri Number</label>
                        <input 
                          type="text" 
                          value={weddingData.bcaNumber} 
                          onChange={(e) => setWeddingData({...weddingData, bcaNumber: e.target.value})} 
                          className="w-full p-2 text-xs border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:border-[#b58c4c] focus:bg-white transition-all text-zinc-800 font-medium" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">DANA Owner</label>
                        <input 
                          type="text" 
                          value={weddingData.danaOwner} 
                          onChange={(e) => setWeddingData({...weddingData, danaOwner: e.target.value})} 
                          className="w-full p-2 text-xs border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:border-[#b58c4c] focus:bg-white transition-all text-zinc-800 font-medium" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">DANA Number</label>
                        <input 
                          type="text" 
                          value={weddingData.danaNumber} 
                          onChange={(e) => setWeddingData({...weddingData, danaNumber: e.target.value})} 
                          className="w-full p-2 text-xs border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:border-[#b58c4c] focus:bg-white transition-all text-zinc-800 font-medium" 
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Shipping Address (giftAddress)</label>
                      <textarea 
                        value={weddingData.giftAddress} 
                        onChange={(e) => setWeddingData({...weddingData, giftAddress: e.target.value})} 
                        className="w-full p-2 text-xs border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:border-[#b58c4c] focus:bg-white transition-all h-20 resize-none font-medium text-zinc-800" 
                      />
                    </div>
                  </div>

                  {/* Audio & Music */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] uppercase tracking-[0.2em] text-[#b58c4c] font-black border-l-2 border-[#b58c4c] pl-2">Music (MP3)</h5>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Background Music URL</label>
                        <input 
                          type="text" 
                          value={musicUrl} 
                          onChange={(e) => setMusicUrl(e.target.value)} 
                          placeholder="https://example.com/song.mp3"
                          className="w-full p-2 text-xs border border-[#dfb86c]/30 rounded-lg bg-zinc-50 focus:outline-none focus:border-[#b58c4c] focus:bg-white transition-all text-zinc-800 font-medium" 
                        />
                      </div>
                      
                      {/* Presets Selection */}
                      <div className="space-y-1 bg-zinc-50 p-2 border border-zinc-200 rounded-lg">
                        <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Pilih Preset Lagu Pernikahan:</span>
                        <div className="flex flex-col gap-1">
                          {[
                            { name: "🎹 Classic Wedding March (Piano)", url: "https://archive.org/download/wedding-march-piano/wedding-march-piano.mp3" },
                            { name: "🎻 Pachelbel Canon (Orchestra)", url: "https://archive.org/download/pachelbel-canon-in-d/Pachelbel-Canon-in-D.mp3" },
                            { name: "👾 Ed Sheeran - Perfect (8-Bit)", url: "https://archive.org/download/8-bit-ed-sheeran-perfect/8-Bit%20Ed%20Sheeran%20-%20Perfect.mp3" }
                          ].map((preset) => (
                            <button
                              key={preset.url}
                              type="button"
                              onClick={() => setMusicUrl(preset.url)}
                              className={`text-left text-[9px] p-1.5 rounded transition-all cursor-pointer font-sans ${musicUrl === preset.url ? 'bg-[#1b3d2b] text-[#dfb86c] font-bold' : 'hover:bg-zinc-100 text-zinc-600'}`}
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Audio File Upload */}
                      <div className="mt-2 text-center">
                        <input 
                          type="file" 
                          accept="audio/mpeg,audio/mp3" 
                          onChange={(e) => handleFileUpload(e, 'audio')} 
                          className="hidden" 
                          id="music-file-upload-pixel" 
                        />
                        <label 
                          htmlFor="music-file-upload-pixel" 
                          className={`block text-center p-2 text-[9px] font-bold uppercase border tracking-wider rounded-lg transition-all cursor-pointer ${
                            isUploading === 'audio' 
                              ? 'bg-zinc-150 text-zinc-400 border-zinc-200 cursor-not-allowed' 
                              : 'border-[#dfb86c]/40 hover:bg-[#dfb86c]/10 text-[#b58c4c] bg-white'
                          }`}
                        >
                          {isUploading === 'audio' ? '⏳ Mengunggah Musik...' : '🎵 Upload File MP3 (Maks 10MB)'}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#dfb86c]/20 flex flex-col gap-2">
                  <button 
                    onClick={saveConfigToServer}
                    disabled={isSaving}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSaving ? '⏳ MENYIMPAN SEBAGAI DEFAULT...' : '💾 SIMPAN SEBAGAI DEFAULT UNTUK SEMUA TAMU'}
                  </button>

                  <button 
                    onClick={downloadConfig}
                    className="w-full py-2.5 bg-[#1b3d2b] hover:bg-[#12281c] text-[#dfb86c] text-[10px] font-bold uppercase tracking-widest rounded-lg shadow transition-colors cursor-pointer"
                  >
                    Download Configuration (JSON)
                  </button>
                  <label className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-[10px] items-center justify-center font-bold uppercase tracking-widest rounded-lg flex cursor-pointer transition-colors">
                    Import Configuration
                    <input type="file" accept=".json" onChange={importConfig} className="hidden" />
                  </label>
                  <p className="text-[8px] text-zinc-400 text-center mt-2 leading-tight uppercase tracking-wider">
                    Changes are saved locally on this browser.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
