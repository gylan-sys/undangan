import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  Copy, 
  CheckCircle2, 
  Send, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  Info,
  Gift,
  Check,
  X,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Types for Interactivity ---
interface PixelInvitationProps {
  weddingData: {
    groom: string;
    groomShort: string;
    bride: string;
    brideShort: string;
    groomPhoto: string;
    bridePhoto: string;
    date: string;
    isoDate: string;
    greetingText: string;
    quoteText: string;
    akadTime: string;
    akadLocation: string;
    akadAddress: string;
    resepsiTime: string;
    resepsiLocation: string;
    resepsiAddress: string;
    mapsLink: string;
    bcaOwner: string;
    bcaNumber: string;
    danaOwner: string;
    danaNumber: string;
    giftAddress: string;
    groomParents: string;
    brideParents: string;
    storyAwal: string;
    storyDekat: string;
    storyLamaran: string;
    bgColor: string;
    accentColor: string;
  };
  guestName: string;
  wishes: Array<{ name: string; message: string; time: string }>;
  setWishes: React.Dispatch<React.SetStateAction<Array<{ name: string; message: string; time: string }>>>;
  rsvp: { name: string; status: string; guests: string };
  setRsvp: React.Dispatch<React.SetStateAction<{ name: string; status: string; guests: string }>>;
  submitRsvp: (e: React.FormEvent) => void;
  submitWish: (e: React.FormEvent) => void;
  newWish: { name: string; message: string };
  setNewWish: React.Dispatch<React.SetStateAction<{ name: string; message: string }>>;
  onSwitchTheme: () => void;
}

export default function PixelInvitation({
  weddingData,
  guestName,
  wishes,
  setWishes,
  rsvp,
  setRsvp,
  submitRsvp,
  submitWish,
  newWish,
  setNewWish,
  onSwitchTheme
}: PixelInvitationProps) {
  // --- Game State Engine ---
  const [character, setCharacter] = useState<'groom' | 'bride'>('groom');
  const [posX, setPosX] = useState(60); // Player position in px along the scrolling world (0 to 1200)
  const [isWalking, setIsWalking] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [walkFrame, setWalkFrame] = useState(0);
  
  // Interactive spot tracking
  const [activeSpot, setActiveSpot] = useState<string | null>(null);
  const [openedPanel, setOpenedPanel] = useState<'mailbox' | 'signpost' | 'arch' | 'gift' | null>(null);
  
  // Easter egg triggers
  const [catState, setCatState] = useState<'idle' | 'happy' | 'meow'>('idle');
  const [pigeonState, setPigeonState] = useState<'idle' | 'eating' | 'fly'>('idle');
  const [catClicks, setCatClicks] = useState(0);
  const [pigeonClicks, setPigeonClicks] = useState(0);
  const [isCopied, setIsCopied] = useState<'bca' | 'dana' | null>(null);
  const [speechBubble, setSpeechBubble] = useState<string | null>("Use arrows or buttons to walk! 🎮");

  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(750); // virtual game frame width in CSS pixels
  const worldLength = 1400; // total scrollable length of the level

  // High performance refs for locking coordinates and frame timing
  const posXRef = useRef(60);
  const keysPressedRef = useRef({ left: false, right: false });
  const touchWalkDirectionRef = useRef<'left' | 'right' | null>(null);
  const directionRef = useRef<'left' | 'right'>('right');
  const openedPanelRef = useRef<string | null>(null);

  useEffect(() => {
    openedPanelRef.current = openedPanel;
  }, [openedPanel]);

  const startWalking = (dir: 'left' | 'right') => {
    if (openedPanel) return;
    touchWalkDirectionRef.current = dir;
  };

  const stopWalking = () => {
    touchWalkDirectionRef.current = null;
  };

  // Buttery-smooth Game Animation Loop (60 FPS synced to screen refresh)
  useEffect(() => {
    let animFrameId: number;
    let isMovingLastFrame = false;

    const tick = () => {
      const leftActive = keysPressedRef.current.left || touchWalkDirectionRef.current === 'left';
      const rightActive = keysPressedRef.current.right || touchWalkDirectionRef.current === 'right';

      let isWalkingNow = false;
      let nextX = posXRef.current;
      let activeDirection = directionRef.current;

      if (openedPanelRef.current === null) {
        if (leftActive && !rightActive) {
          nextX = Math.max(posXRef.current - 6.5, 40);
          activeDirection = 'left';
          isWalkingNow = true;
        } else if (rightActive && !leftActive) {
          nextX = Math.min(posXRef.current + 6.5, worldLength - 80);
          activeDirection = 'right';
          isWalkingNow = true;
        }
      }

      if (nextX !== posXRef.current) {
        posXRef.current = nextX;
        setPosX(nextX);
      }

      if (activeDirection !== directionRef.current) {
        directionRef.current = activeDirection;
        setDirection(activeDirection);
      }

      if (isWalkingNow !== isMovingLastFrame) {
        isMovingLastFrame = isWalkingNow;
        setIsWalking(isWalkingNow);
      }

      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.clientWidth);
      }
    };
    updateSize();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Interactive Spot Coordinates
  const spots = {
    mailbox: { x: 300, label: "Love Mailbox" },
    signpost: { x: 700, label: "Wedding Schedule" },
    arch: { x: 1150, label: "Ceremony Arch & Guestbook" }
  };

  // Keyboard Walking Controls (Event-driven keys tracking)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (openedPanelRef.current) return; // Ignore movement when a panel modal is open
      
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysPressedRef.current.right = true;
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysPressedRef.current.left = true;
      } else if (e.key === ' ' || e.key === 'Enter') {
        // Trigger currently hovered action
        if (activeSpot) {
          triggerSpotAction(activeSpot);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysPressedRef.current.right = false;
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysPressedRef.current.left = false;
      }
    };

    const handleBlur = () => {
      keysPressedRef.current.left = false;
      keysPressedRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [activeSpot]);

  // Handle character frame toggles when walking
  useEffect(() => {
    if (!isWalking) {
      setWalkFrame(0);
      return;
    }
    const interval = setInterval(() => {
      setWalkFrame(prev => (prev === 1 ? 2 : 1));
    }, 180);
    return () => clearInterval(interval);
  }, [isWalking]);

  // Proximity check to trigger the prompt/button glow
  useEffect(() => {
    let foundSpot: string | null = null;
    
    if (Math.abs(posX - spots.mailbox.x) < 55) {
      foundSpot = 'mailbox';
    } else if (Math.abs(posX - spots.signpost.x) < 55) {
      foundSpot = 'signpost';
    } else if (Math.abs(posX - spots.arch.x) < 65) {
      foundSpot = 'arch';
    }
    
    setActiveSpot(foundSpot);

    // Help instructions overlay
    if (foundSpot === 'mailbox') {
      setSpeechBubble(" 📫 Tap the Mailbox to see Gilang & Nissa's Love Letter!");
    } else if (foundSpot === 'signpost') {
      setSpeechBubble(" 📜 Check the Signpost for Ceremony & Tasyakuran schedule!");
    } else if (foundSpot === 'arch') {
      setSpeechBubble(" 💍 The Flower Arch! Tap to sign Guestbook & confirm RSVP!");
    } else if (posX > 60 && posX < 220) {
      setSpeechBubble("That mailbox ahead looks interesting... Keep walking east!");
    } else if (posX > 360 && posX < 550) {
      setSpeechBubble("Beautiful day in pixel valley. Let's inspect the wooden sign!");
    } else if (posX > 760 && posX < 950) {
      setSpeechBubble("The arch is just ahead! Your partner is waiting!");
    }
  }, [posX]);



  // Trigger Panel view
  const triggerSpotAction = (spotName: string) => {
    if (spotName === 'mailbox') setOpenedPanel('mailbox');
    else if (spotName === 'signpost') setOpenedPanel('signpost');
    else if (spotName === 'arch') {
      setOpenedPanel('arch');
      // Spark a small confetti burst
      confetti({
        particleCount: 20,
        spread: 30,
        colors: ['#FAF9F6', '#C5A059']
      });
    }
  };

  // Copy Clipboard details
  const copyDetail = (text: string, type: 'bca' | 'dana') => {
    navigator.clipboard.writeText(text);
    setIsCopied(type);
    setTimeout(() => setIsCopied(null), 1500);
  };

  // Auto scroll logic for the 2D frame
  // Centering player based on real physical screen width
  const scrollOffset = Math.max(0, Math.min(posX - canvasWidth / 2, worldLength - canvasWidth));

  return (
    <div className="w-full flex flex-col items-center bg-zinc-950 min-h-screen py-6 px-4 select-none font-mono">
      {/* Top Header Selector - Direct contrast of vintage vs luxury */}
      <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between mb-2 gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-md">
            <span>🎮</span>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold font-sans uppercase tracking-[0.2em]">Theme Engine Activated</h4>
            <p className="text-zinc-400 text-[10px] tracking-wide mt-0.5">Custom Retro Pixel Interactive World</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Character Switcher */}
          <div className="bg-zinc-950 p-1 flex border border-zinc-800 rounded-lg">
            <button 
              onClick={() => setCharacter('groom')}
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-all rounded ${character === 'groom' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              🎮 {weddingData.groomShort}
            </button>
            <button 
              onClick={() => setCharacter('bride')}
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-all rounded ${character === 'bride' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              🎀 {weddingData.brideShort}
            </button>
          </div>


        </div>
      </div>

      {/* Main Pixel Stage Viewport (750x450 viewport dimension) - Optimized with Border-4 on mobile and dynamic ref */}
      <div ref={containerRef} className="relative w-full max-w-[760px] aspect-[16/10] md:aspect-[16/9] min-h-[200px] sm:min-h-[300px] md:min-h-[360px] overflow-hidden border-4 sm:border-8 border-zinc-800 rounded-2xl bg-[#daf0ff] shadow-2xl">
        
        {/* PARALLAX SKY LAYER (Deep sky to bright sun-blushed yellow) */}
        <div className="absolute inset-x-0 top-0 h-[65%] bg-gradient-to-b from-[#407bb0] via-[#85bfe9] to-[#faedd0] pointer-events-none overflow-hidden">
          {/* Big retro pixel sun */}
          <div className="absolute left-[70%] top-[15%] w-16 h-16 bg-[#ffecb3] border border-amber-100 rounded-none transform opacity-60">
            <div className="absolute inset-1 border border-amber-200"></div>
          </div>
          
          {/* Floating Pixel Clouds */}
          <motion.div 
            animate={{ x: [-80, worldLength] }} 
            transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
            className="absolute top-[8%] left-0 w-24 h-6 opacity-30 select-none pointer-events-none"
          >
            <svg viewBox="0 0 48 16" className="w-full h-full fill-white" style={{ imageRendering: 'pixelated' }}>
              <path d="M 12,0 H 36 V 4 H 42 V 8 H 48 V 12 H 0 V 8 H 6 V 4 H 12 Z"/>
            </svg>
          </motion.div>
          
          <motion.div 
            animate={{ x: [-120, worldLength] }} 
            transition={{ duration: 90, repeat: Infinity, ease: "linear", delay: 15 }}
            className="absolute top-[25%] left-0 w-32 h-8 opacity-40 select-none pointer-events-none"
          >
            <svg viewBox="0 0 56 16" className="w-full h-full fill-white" style={{ imageRendering: 'pixelated' }}>
              <path d="M 16,0 H 40 V 4 H 48 V 8 H 56 V 12 H 0 V 8 H 8 V 4 H 16 Z"/>
            </svg>
          </motion.div>
        </div>

        {/* PARALLAX MOUNTAIN LAYER (Back hills, scroll slower, -scrollOffset * 0.15) */}
        <div 
          className="absolute inset-x-0 top-[25%] h-[40%] pointer-events-none select-none"
          style={{ transform: `translateX(${-scrollOffset * 0.15}px)` }}
        >
          <svg viewBox="0 0 400 120" className="w-[1400px] h-full fill-[#8bb6d6] opacity-45" preserveAspectRatio="none" style={{ imageRendering: 'pixelated' }}>
            <polygon points="0,120 40,40 90,120 120,70 180,120 230,30 290,120 340,50 400,120" />
            <polygon points="40,120 100,50 150,120 200,80 270,120 320,60 380,120" className="fill-[#7aaacb] opacity-60" />
          </svg>
        </div>

        {/* PARALLAX HILLS & TREES LAYER (Mid hills, scroll slightly faster, -scrollOffset * 0.4) */}
        <div 
          className="absolute inset-x-0 bottom-[18%] h-[35%] pointer-events-none select-none"
          style={{ transform: `translateX(${-scrollOffset * 0.45}px)` }}
        >
          <svg viewBox="0 0 400 60" className="w-[1700px] h-full fill-[#498c69] opacity-75" preserveAspectRatio="none" style={{ imageRendering: 'pixelated' }}>
            {/* Soft rolling landscape hills */}
            <path d="M 0,60 Q 40,10 90,40 T 180,20 T 270,35 T 360,15 T 400,60 Z" />
          </svg>

          {/* Random simple retro pines on mid hills */}
          <div className="absolute bottom-[20%] left-[12%] w-10 h-16 fill-[#2b6d47]">
            <svg viewBox="0 0 16 32" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
              <path d="M 8,0 L 14,12 H 11 L 15,20 H 9 L 16,28 H 0 L 7,20 H 1 L 5,12 H 2 Z" />
              <rect x="7" y="28" width="2" height="4" fill="#3a1e12" />
            </svg>
          </div>
          <div className="absolute bottom-[10%] left-[34%] w-9 h-14 fill-[#2a6d45]">
            <svg viewBox="0 0 16 32" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
              <path d="M 8,0 L 14,12 H 11 L 15,20 H 9 L 16,28 H 0 L 7,20 H 1 L 5,12 H 2 Z" />
              <rect x="7" y="28" width="2" height="4" fill="#3a1e12" />
            </svg>
          </div>
          <div className="absolute bottom-[16%] left-[62%] w-12 h-20 fill-[#205a39]">
            <svg viewBox="0 0 16 32" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
              <path d="M 8,0 L 14,12 H 11 L 15,20 H 9 L 16,28 H 0 L 7,20 H 1 L 5,12 H 2 Z" />
              <rect x="7" y="28" width="2" height="4" fill="#3a1e12" />
            </svg>
          </div>
          <div className="absolute bottom-[8%] left-[84%] w-8 h-12 fill-[#2c6e48]">
            <svg viewBox="0 0 16 32" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
              <path d="M 8,0 L 14,12 H 11 L 15,20 H 9 L 16,28 H 0 L 7,20 H 1 L 5,12 H 2 Z" />
              <rect x="7" y="28" width="2" height="4" fill="#3a1e12" />
            </svg>
          </div>
        </div>

        {/* PRIMARY GAME TRACK (Contains roads, interactives, characters. Moves full speed, -scrollOffset) */}
        <div 
          className="absolute inset-y-0 left-0 w-[1400px]"
          style={{ transform: `translateX(${-scrollOffset}px)` }}
        >
          {/* Ground floor block */}
          <div className="absolute inset-x-0 bottom-0 h-[22%] bg-[#614532] border-t-8 border-[#2e1d11] overflow-hidden">
            {/* Grass topper dither */}
            <div className="absolute top-0 inset-x-0 h-4 bg-[#6ab04c] border-b-4 border-[#418029]"></div>
            
            {/* Stone textures and rocks */}
            <div className="absolute top-8 left-[90px] w-6 h-3 bg-[#423126] border border-zinc-700 opacity-60"></div>
            <div className="absolute top-10 left-[430px] w-12 h-4 bg-[#423126] border border-zinc-700 opacity-60"></div>
            <div className="absolute top-6 left-[820px] w-8 h-3 bg-[#423126] border border-zinc-700 opacity-60"></div>
            <div className="absolute top-8 left-[1190px] w-10 h-3 bg-[#423126] border border-zinc-700 opacity-60"></div>
          </div>

          {/* BACKGROUND FENCING BLOCK */}
          {[...Array(24)].map((_, i) => (
            <div key={i} className="absolute bottom-[22%] w-10 h-10 select-none pointer-events-none fill-[#a07455] opacity-50" style={{ left: `${i * 60 + 20}px` }}>
              <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
                <path d="M 1,2 V 16 H 4 V 2 H 8 V 16 H 11 V 2 H 15 V 16 H 16 V 0 H 0 V 16 Z M 0,6 H 16 V 8 H 0 Z M 0,11 H 16 V 13 H 0 Z" />
              </svg>
            </div>
          ))}

          {/* ================= INTERACTIVE SPOT 1: MAILBOX (x = 300) ================= */}
          <div 
            onClick={() => triggerSpotAction('mailbox')}
            className={`absolute bottom-[21.5%] left-[300px] w-14 h-24 cursor-pointer text-center group flex flex-col items-center justify-end z-20`}
          >
            {/* Active hover arrow floating */}
            {activeSpot === 'mailbox' && (
              <motion.div 
                animate={{ y: [0, -8, 0] }} 
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-amber-400 bg-amber-500/10 border border-amber-500/30 font-sans text-[7px] font-bold px-1.5 py-0.5 uppercase tracking-wider mb-2"
              >
                OPEN POST
              </motion.div>
            )}
            
            {/* Mailbox retro pixel SVG block */}
            <svg viewBox="0 0 16 32" className="w-12 h-20 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.30)]" style={{ imageRendering: 'pixelated' }}>
              {/* Post */}
              <rect x="7" y="16" width="2" height="16" fill="#523928"/>
              <rect x="6" y="24" width="4" height="1" fill="#321e12"/>
              {/* Mailbox Head */}
              <rect x="4" y="6" width="8" height="10" fill="#d32121"/>
              <path d="M 4,6 Q 8,1 12,6 Z" fill="#b11010" />
              <rect x="4" y="14" width="8" height="2" fill="#800404" />
              {/* Mail Box Door Details (Yellow flag) */}
              <rect x="11" y="8" width="1" height="5" fill="#fbc531" />
              <rect x="10" y="7" width="3" height="2" fill="#fbc531" />
              {/* Envelope protruding */}
              <rect x="2" y="10" width="4" height="3" fill="#ffffff" />
              <rect x="3" y="11" width="2" height="1" fill="#e84118" />
            </svg>
          </div>

          {/* ================= INTERACTIVE SPOT 2: RUSTIC SIGNPOST (x = 700) ================= */}
          <div 
            onClick={() => triggerSpotAction('signpost')}
            className="absolute bottom-[21.5%] left-[700px] w-20 h-28 cursor-pointer flex flex-col items-center justify-end z-20"
          >
            {activeSpot === 'signpost' && (
              <motion.div 
                animate={{ y: [0, -8, 0] }} 
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-[#96f26d] bg-[#5cb32e]/10 border border-[#5cb32e]/30 font-sans text-[7px] font-bold px-1.5 py-0.5 uppercase tracking-wider mb-2"
              >
                VIEW EVENT
              </motion.div>
            )}
            
            {/* Wooden Signboard SVG */}
            <svg viewBox="0 0 32 48" className="w-16 h-24 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]" style={{ imageRendering: 'pixelated' }}>
              {/* Main Pole */}
              <rect x="14" y="12" width="4" height="36" fill="#51301b"/>
              <rect x="13" y="44" width="6" height="4" fill="#2d170a"/>
              {/* Sign 1 (Holy Matrimony pointed left) */}
              <rect x="2" y="12" width="26" height="8" fill="#a46d4a" />
              <rect x="1" y="13" width="28" height="6" fill="#b98561" />
              <rect x="1" y="14" width="1" height="4" fill="#faf5f0" /> {/* arrow tip */}
              <rect x="2" y="13" width="1" height="6" fill="#faf5f0" /> 
              {/* Text indicator mock */}
              <rect x="12" y="15" width="12" height="1" fill="#4a2510" />
              <rect x="14" y="17" width="8" height="1" fill="#4a2510" />

              {/* Sign 2 (Reception pointed right) */}
              <rect x="4" y="24" width="26" height="8" fill="#8c5836" />
              <rect x="3" y="25" width="28" height="6" fill="#a06d4a" />
              <rect x="30" y="26" width="1" height="4" fill="#faf5f0" /> {/* arrow tip right */}
              <rect x="29" y="25" width="1" height="6" fill="#faf5f0" />
              {/* Text indicator mock */}
              <rect x="6" y="27" width="14" height="1" fill="#3a1c09" />
              <rect x="8" y="29" width="10" height="1" fill="#3a1c09" />
            </svg>
          </div>

          {/* ================= INTERACTIVE SPOT 3: WEDDING ARCH & VINTAGE VENUE COTTAGE (x = 1150) ================= */}
          <div 
            onClick={() => triggerSpotAction('arch')}
            className="absolute bottom-[21.5%] left-[1050px] w-64 h-48 cursor-pointer flex flex-col items-center justify-end z-20"
          >
            {activeSpot === 'arch' && (
              <motion.div 
                animate={{ y: [0, -8, 0] }} 
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-pink-400 bg-pink-500/10 border border-pink-500/30 font-sans text-[7px] font-bold px-1.5 py-0.5 uppercase tracking-wider mb-2"
              >
                JOIN RSVP / GUEST
              </motion.div>
            )}

            <div className="flex items-end justify-center w-full">
              {/* Beautiful Retro Stone Arch and Garland Structure SVGs */}
              <svg viewBox="0 0 120 75" className="w-[230px] h-[150px] filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.40)] overflow-visible" style={{ imageRendering: 'pixelated', overflow: 'visible' }}>
                {/* Vintage Church/Arbor base cottage redesigned as KUA Soreang office */}
                <rect x="0" y="15" width="48" height="60" fill="#fcfcf7" stroke="#cccccc" strokeWidth="0.8"/>
                <polygon points="-2,15 24,1 50,15" fill="#124e1d" stroke="#082b08" strokeWidth="0.8"/>{/* Traditional Indonesian Green Roof */}

                {/* Green Ministry/Office top accent band */}
                <rect x="0" y="15" width="48" height="5" fill="#1b5e20" />

                {/* Signboard on the wall saying KUA SOREANG */}
                <rect x="4" y="24" width="40" height="11" fill="#1b4332" stroke="#d4af37" strokeWidth="0.8" rx="1" />
                <text x="24" y="31.5" fill="#f1c40f" fontSize="4.8" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.1">KUA SOREANG</text>

                {/* Double Wooden Doors */}
                <rect x="26" y="47" width="16" height="28" fill="#5c4033" stroke="#3d2b1f" strokeWidth="1"/>
                <line x1="34" y1="47" x2="34" y2="75" stroke="#3d2b1f" strokeWidth="0.8" />
                <circle cx="32.5" cy="61" r="1.2" fill="#eccc68"/>{/* Left Knob */}
                <circle cx="35.5" cy="61" r="1.2" fill="#eccc68"/>{/* Right Knob */}

                {/* Glass window with dark frames */}
                <rect x="5" y="42" width="14" height="18" fill="#7ed6df" stroke="#1e272e" strokeWidth="0.8" opacity="0.8"/>
                <line x1="12" y1="42" x2="12" y2="60" stroke="#1e272e" strokeWidth="0.5"/>
                <line x1="5" y1="51" x2="19" y2="51" stroke="#1e272e" strokeWidth="0.5"/>

                {/* Decorative flower pot near KUA entrance */}
                <rect x="21" y="70" width="4" height="5" fill="#8d6e63" />
                <circle cx="23" cy="67" r="3" fill="#2e7d32" />

                {/* Stone pillars for Archway */}
                <rect x="54" y="10" width="12" height="65" fill="#a5b1c2"/>{/* Column Left */}
                <rect x="52" y="8" width="16" height="4" fill="#778ca3"/>
                <rect x="94" y="10" width="12" height="65" fill="#a5b1c2"/>{/* Column Right */}
                <rect x="92" y="8" width="16" height="4" fill="#778ca3"/>

                {/* Overlapping Rose Garland Wrap */}
                <path d="M 54,10 Q 80,-4 106,10" fill="none" stroke="#26de81" strokeWidth="6" strokeLinecap="round"/>
                {/* Pink pixel flowers on the garland */}
                <rect x="60" y="4" width="4" height="4" fill="#ff7675" />
                <rect x="70" y="0" width="4" height="4" fill="#ff7675" />
                <rect x="80" y="-1" width="4" height="4" fill="#fd79a8" />
                <rect x="90" y="2" width="4" height="4" fill="#ff7675" />
                <rect x="100" y="6" width="4" height="4" fill="#fd79a8" />

                {/* Floor Carpet */}
                <rect x="66" y="72" width="28" height="3" fill="#cf1c24" />
              </svg>
            </div>
          </div>

          {/* ================= EASTER EGGS: PLAYFUL ANIMALS ================= */}
          {/* A cute retro pixel cat sitting next to the mailbox (x = 420) */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              setCatState('meow');
              setCatClicks(p => p + 1);
              setSpeechBubble("😸 Meow! Wishing the couple an eternity of delicious tuna!");
              setTimeout(() => setCatState('idle'), 1500);
            }}
            className="absolute bottom-[21.5%] left-[420px] w-12 h-12 cursor-pointer z-20 flex flex-col items-center justify-end"
          >
            {catState === 'meow' && (
              <div className="absolute top-[-25px] bg-white text-black text-[7px] font-bold px-1.5 py-0.5 border border-black uppercase whitespace-nowrap animate-bounce font-mono">
                MEOW~! 🐾
              </div>
            )}
            <svg viewBox="0 0 16 16" className="w-8 h-8 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" style={{ imageRendering: 'pixelated' }}>
              <rect x="4" y="10" width="8" height="5" fill="#7f8c8d" /> {/* Body */}
              <rect x="3" y="12" width="1.5" height="4" fill="#7f8c8d" /> {/* Left leg */}
              <rect x="11.5" y="12" width="1.5" height="4" fill="#7f8c8d" /> {/* Right leg */}
              <rect x="3" y="15" width="2" height="1" fill="#34495e" /> {/* Feet */}
              <rect x="11" y="15" width="2" height="1" fill="#34495e" /> {/* Feet */}
              <rect x="4" y="5" width="7" height="6" fill="#95a5a6" /> {/* Head */}
              <polygon points="4,5 2,2 6,5" fill="#7f8c8d" /> {/* Left ear */}
              <polygon points="11,5 13,2 9,5" fill="#7f8c8d" /> {/* Right ear */}
              <rect x="5" y="7" width="1.5" height="1.5" fill="#2c3e50" /> {/* Eye */}
              <rect x="8.5" y="7" width="1.5" height="1.5" fill="#2c3e50" /> {/* Eye */}
              <rect x="7" y="9" width="1" height="1" fill="#e74c3c" /> {/* Nose */}
              <rect x="12" y="8" width="1" height="5" fill="#95a5a6" /> {/* Tail */}
              <rect x="11" y="7" width="2" height="1" fill="#e74c3c" opacity={catState === 'meow' ? 1 : 0} />
            </svg>
          </div>

          {/* A cute retro woodland pigeon standing near the signpost (x = 880) */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              setPigeonState('fly');
              setPigeonClicks(p => p + 1);
              setSpeechBubble("🐦 Coo~! Keep walking, love is in the air!");
              // Confetti heart splash
              confetti({
                particleCount: 8,
                spread: 20,
                colors: ['#ff4757']
              });
              setTimeout(() => setPigeonState('idle'), 2500);
            }}
            className="absolute bottom-[21.5%] left-[880px] w-12 h-12 cursor-pointer z-20 flex flex-col items-center justify-end"
          >
            {pigeonState === 'fly' && (
              <div className="absolute top-[-25px] bg-white text-black text-[7px] font-bold px-1.5 py-0.5 border border-black uppercase whitespace-nowrap animate-bounce font-mono">
                COO COO~! 💕
              </div>
            )}
            <svg 
              viewBox="0 0 16 16" 
              className={`w-7 h-7 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-all duration-1000 ${pigeonState === 'fly' ? 'translate-y-[-50px] opacity-0 scale-75' : 'translate-y-0'}`} 
              style={{ imageRendering: 'pixelated' }}
            >
              <rect x="5" y="9" width="6" height="4" fill="#95afc0" /> {/* Body */}
              <rect x="4" y="6" width="4" height="4" fill="#78909c" /> {/* Chest */}
              <rect x="3" y="4" width="4" height="4" fill="#95afc0" /> {/* Head */}
              <rect x="2" y="5" width="1.5" height="1.5" fill="#ffa502" /> {/* Beak */}
              <rect x="5" y="5" width="1" height="1" fill="#2c3e50" /> {/* Eye */}
              <rect x="6" y="13" width="1" height="3" fill="#ffa502" /> {/* Leg 1 */}
              <rect x="9" y="13" width="1" height="3" fill="#ffa502" /> {/* Leg 2 */}
              <rect x="9" y="8" width="3" height="3" fill="#78909c" /> {/* Wing */}
            </svg>
          </div>

          {/* Partner NPC standin waiting at the Arch (stands at 1195) */}
          <div className="absolute bottom-[21.5%] left-[1190px] w-12 h-20 z-20">
            {/* Red heart float */}
            {posX > 1050 && (
              <motion.div 
                animate={{ y: [0, -12, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-[-30px] left-2 text-red-500 text-lg"
              >
                ❤️
              </motion.div>
            )}
            {character === 'groom' ? (
              /* Bride NPC is waiting */
              <svg viewBox="0 0 16 32" className="w-12 h-20" style={{ imageRendering: 'pixelated' }}>
                {/* Hair */}
                <rect x="3" y="1" width="10" height="9" fill="#2d1d11" />
                <rect x="1" y="3" width="14" height="8" fill="#2d1d11" />
                {/* Face */}
                <rect x="4" y="4" width="8" height="6" fill="#fbd3b6" />
                <rect x="5" y="6" width="1" height="1.5" fill="#e74c3c" /> {/* Eye */}
                <rect x="10" y="6" width="1" height="1.5" fill="#e74c3c" /> {/* Eye */}
                {/* Blush */}
                <rect x="4" y="8" width="1.5" height="1" fill="#ff7675" />
                <rect x="10.5" y="8" width="1.5" height="1" fill="#ff7675" />
                {/* Dress (gorgeous wedding white gown with lace) */}
                <rect x="3" y="10" width="10" height="2" fill="#faf9f6" />
                <rect x="2" y="12" width="12" height="10" fill="#fcfbf7" />
                <rect x="1" y="22" width="14" height="6" fill="#f2f0ea" />
                {/* Ribbon */}
                <rect x="4" y="11" width="8" height="1" fill="#ff7675" />
                {/* Veil */}
                <rect x="4" y="0" width="8" height="1" fill="#ffffff" opacity="0.9" />
                <rect x="13" y="6" width="2" height="18" fill="#ffffff" opacity="0.5" />
                <rect x="1" y="6" width="2" height="18" fill="#ffffff" opacity="0.5" />
              </svg>
            ) : (
              /* Groom NPC is waiting */
              <svg viewBox="0 0 16 32" className="w-12 h-20" style={{ imageRendering: 'pixelated' }}>
                {/* Hair */}
                <rect x="4" y="2" width="8" height="6" fill="#4a3c31" />
                {/* Face */}
                <rect x="4" y="5" width="8" height="5" fill="#ffdfca" />
                <rect x="5" y="6" width="1" height="1.5" fill="#2c3e50" /> {/* Eye */}
                <rect x="10" y="6" width="1" height="1.5" fill="#2c3e50" /> {/* Eye */}
                {/* Suit (Emerald / Midnight Groom tuxedo) */}
                <rect x="3" y="10" width="10" height="18" fill="#1a3026" />
                {/* White Shirt Collar */}
                <polygon points="6,10 10,10 8,14" fill="#ffffff" />
                {/* Gold bow tie */}
                <rect x="7" y="11" width="2" height="1" fill="#c5a059" />
                {/* Pants */}
                <rect x="4" y="23" width="8" height="5" fill="#1b1b1b" />
                {/* Shoes */}
                <rect x="3" y="28" width="3" height="1.5" fill="#000000" />
                <rect x="10" y="28" width="3" height="1.5" fill="#000000" />
              </svg>
            )}
          </div>

          {/* ================= ACTIVE PLAYABLE PLAYER CHARACTER (Scrolls smoothly) ================= */}
          <div 
            className="absolute bottom-[21.5%] w-12 h-20 z-30"
            style={{ left: `${posX}px` }}
          >
            {character === 'groom' ? (
              /* Groom Sprite Object */
              <svg 
                viewBox="0 0 16 32" 
                className={`w-full h-full transform transition-transform ${direction === 'left' ? 'scale-x-[-1]' : 'scale-x-[1]'}`} 
                style={{ imageRendering: 'pixelated' }}
              >
                {/* Hair */}
                <rect x="4" y="2" width="8" height="6" fill="#4a3c31" />
                {/* Face */}
                <rect x="4" y="5" width="8" height="5" fill="#ffdfca" />
                <rect x="5" y="6" width="1" height="1.5" fill="#2c3e50" /> {/* Eye */}
                <rect x="10" y="6" width="1" height="1.5" fill="#2c3e50" /> {/* Eye */}
                
                {/* Suit (emerald jacket with golden bow tie) */}
                <rect x="3" y="10" width="10" height="12" fill="#1a3026" />
                {/* Shirt Collar */}
                <polygon points="6,10 10,10 8,14" fill="#ffffff" />
                <rect x="7" y="11" width="2" height="1" fill="#c5a059" /> {/* bowtie */}

                {/* Animated Legs walking cycle */}
                {walkFrame === 0 && (
                  <>
                    <rect x="4" y="22" width="3" height="6" fill="#1b1b1b" />
                    <rect x="9" y="22" width="3" height="6" fill="#1b1b1b" />
                    <rect x="3" y="28" width="4" height="1.5" fill="#000000" />
                    <rect x="9" y="28" width="4" height="1.5" fill="#000000" />
                  </>
                )}
                {walkFrame === 1 && (
                  <>
                    <rect x="5" y="22" width="3" height="6" fill="#1b1b1b" />
                    <rect x="8" y="21" width="3" height="5" fill="#1b1b1b" />
                    <rect x="4" y="28" width="4" height="1.5" fill="#000000" />
                    <rect x="9" y="26" width="3" height="1.5" fill="#000000" />
                  </>
                )}
                {walkFrame === 2 && (
                  <>
                    <rect x="3" y="21" width="3" height="5" fill="#1b1b1b" />
                    <rect x="8" y="22" width="3" height="6" fill="#1b1b1b" />
                    <rect x="2" y="26" width="3" height="1.5" fill="#000000" />
                    <rect x="8" y="28" width="4" height="1.5" fill="#000000" />
                  </>
                )}
              </svg>
            ) : (
              /* Bride Sprite Object */
              <svg 
                viewBox="0 0 16 32" 
                className={`w-full h-full transform transition-transform ${direction === 'left' ? 'scale-x-[-1]' : 'scale-x-[1]'}`} 
                style={{ imageRendering: 'pixelated' }}
              >
                {/* Hair */}
                <rect x="3" y="1" width="10" height="9" fill="#2d1d11" />
                <rect x="1" y="3" width="14" height="8" fill="#2d1d11" />
                {/* Face */}
                <rect x="4" y="4" width="8" height="6" fill="#fbd3b6" />
                <rect x="5" y="6" width="1" height="1.5" fill="#e74c3c" /> {/* Eye */}
                <rect x="10" y="6" width="1" height="1.5" fill="#e74c3c" /> {/* Eye */}
                {/* Blush */}
                <rect x="4" y="8" width="1.5" height="1" fill="#ff7675" />
                <rect x="10.5" y="8" width="1.5" height="1" fill="#ff7675" />
                {/* Dress (gorgeous wedding white gown with lace) */}
                <rect x="3" y="10" width="10" height="2" fill="#faf9f6" />
                <rect x="2" y="12" width="12" height="9" fill="#fcfbf7" />
                <rect x="1" y="21" width="14" height="6" fill="#f2f0ea" />
                <rect x="4" y="11" width="8" height="1" fill="#ff7675" /> {/* Ribbon */}
                {/* Veil */}
                <rect x="4" y="0" width="8" height="1" fill="#ffffff" opacity="0.9" />
                <rect x="13" y="6" width="2" height="18" fill="#ffffff" opacity="0.5" />
                <rect x="1" y="6" width="2" height="18" fill="#ffffff" opacity="0.5" />

                {/* Feet walking slightly under the long gown */}
                {walkFrame === 1 && <rect x="3" y="27" width="2" height="1.5" fill="#2d1d11" />}
                {walkFrame === 2 && <rect x="11" y="27" width="2" height="1.5" fill="#2d1d11" />}
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Retro HUD, Game Instructions & Touch Controller Panel - Optimized for mobile finger-tapping and positioning */}
      <div className="w-full max-w-[760px] bg-zinc-900 border-x-4 sm:border-x-8 border-b-4 sm:border-b-8 border-zinc-800 p-4 sm:p-5 rounded-b-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 font-mono">
        
        {/* Helper Dialogue Bubble - Responsive arrow direction pointer pointing up on mobile, left on desktop */}
        <div className="flex-1 min-w-[200px] w-full bg-zinc-950 px-4 py-3 border border-zinc-800 rounded-xl relative mt-2 md:mt-0">
          <div className="absolute top-[-6px] md:top-1/2 left-1/2 md:left-[-6px] -translate-x-1/2 md:translate-x-0 md:-translate-y-1/2 w-3 h-3 bg-zinc-950 border-t md:border-t-0 border-l md:border-b rotate-45"></div>
          <div className="flex items-start gap-2 relative z-10">
            <span className="text-amber-500 animate-pulse text-sm">💬</span>
            <p className="text-zinc-300 text-[10px] leading-relaxed tracking-wider">
              {speechBubble}
            </p>
          </div>
        </div>

        {/* Vintage Directional Pad Console Buttons */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4 shrink-0 sm:justify-start">
          <div className="flex flex-col items-center flex-1 sm:flex-initial">
            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 font-sans text-center">Walk Level</span>
            <div className="flex bg-zinc-950 p-2 border border-zinc-800 rounded-xl gap-2 shadow-inner w-full justify-center">
              <button 
                onMouseDown={() => startWalking('left')}
                onMouseUp={stopWalking}
                onMouseLeave={stopWalking}
                onTouchStart={(e) => { e.preventDefault(); startWalking('left'); }}
                onTouchEnd={(e) => { e.preventDefault(); stopWalking(); }}
                onTouchCancel={(e) => { e.preventDefault(); stopWalking(); }}
                className="w-16 h-12 bg-zinc-800 hover:bg-zinc-750 text-amber-500 border border-zinc-700 active:bg-amber-500 active:text-black flex items-center justify-center rounded-lg shadow-md transition-all active:scale-95 cursor-pointer touch-none"
              >
                <ArrowLeft size={20} strokeWidth={3} />
              </button>
              
              <button 
                onMouseDown={() => startWalking('right')}
                onMouseUp={stopWalking}
                onMouseLeave={stopWalking}
                onTouchStart={(e) => { e.preventDefault(); startWalking('right'); }}
                onTouchEnd={(e) => { e.preventDefault(); stopWalking(); }}
                onTouchCancel={(e) => { e.preventDefault(); stopWalking(); }}
                className="w-16 h-12 bg-zinc-800 hover:bg-zinc-750 text-amber-500 border border-zinc-700 active:bg-amber-500 active:text-black flex items-center justify-center rounded-lg shadow-md transition-all active:scale-95 cursor-pointer touch-none"
              >
                <ArrowRight size={20} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Large Action "A" Button for proximity trigger */}
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 font-sans text-center">Interact</span>
            <button 
              disabled={!activeSpot}
              onClick={() => activeSpot && triggerSpotAction(activeSpot)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-bold text-center border-4 tracking-wider transition-all shadow-lg active:scale-90 ${
                activeSpot 
                  ? 'bg-amber-500 text-black border-amber-300 scale-105 animate-pulse cursor-pointer shadow-[0_4px_0_0_#b5840d] active:shadow-none translate-y-[-2px] active:translate-y-0' 
                  : 'bg-zinc-800 text-zinc-600 border-zinc-700 cursor-not-allowed opacity-50'
              }`}
            >
              <span className="text-xl font-black font-sans">A</span>
            </button>
          </div>
        </div>
      </div>



      {/* ================= MODAL PANELS (RETRO STYLE WITH PIXEL BOARDERS) ================= */}
      <AnimatePresence>
        {/* SPOT 1: MAILBOX POPUP PANEL (Groom/Bride Love Letter) */}
        {openedPanel === 'mailbox' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-[#faf5f0] border-4 sm:border-8 border-amber-700 w-full max-w-lg p-4 sm:p-6 relative max-h-[90vh] sm:max-h-[85vh] overflow-y-auto shadow-[0_0_0_4px_rgba(0,0,0,0.1),0_0_0_8px_rgba(0,0,0,0.15),0_20px_40px_rgba(0,0,0,0.6)] rounded-xl"
            >
              {/* Close Button top corner */}
              <button 
                onClick={() => setOpenedPanel(null)}
                className="absolute top-2 right-2 bg-amber-700 text-white w-8 h-8 flex items-center justify-center hover:bg-amber-800 border-2 border-black font-bold font-sans cursor-pointer text-sm"
              >
                X
              </button>

              <div className="text-center mt-3">
                <span className="text-3xl">📬</span>
                <p className="text-[10px] text-amber-700 uppercase tracking-[0.3em] font-sans font-black mt-2">Love Letter Mail</p>
                <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-700 to-transparent my-4"></div>
                
                {/* Greeting text */}
                <p className="text-lg italic font-serif text-zinc-800 font-bold tracking-wide mt-2">
                  {weddingData.greetingText ?? "Om Swastiastu"}
                </p>

                {/* Minimal polaroid pixel layout */}
                <div className="my-6 bg-white border-4 border-amber-800/10 p-3 shadow-md max-w-[280px] mx-auto text-center transform -rotate-1 rotate-hover transition-transform duration-500">
                  <div className="aspect-[4/5] bg-zinc-100 overflow-hidden border border-zinc-300 relative">
                    <img 
                      src={character === 'groom' ? weddingData.groomPhoto : weddingData.bridePhoto} 
                      alt="Couple" 
                      className="w-full h-full object-cover select-none pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-amber-500/10 mix-blend-overlay"></div>
                  </div>
                  <p className="text-[10px] font-sans text-zinc-600 uppercase font-black tracking-widest mt-4">
                    {character === 'groom' ? weddingData.groom : weddingData.bride}
                  </p>
                </div>

                {/* Narrative quote text */}
                <p className="text-sm font-serif text-zinc-700 italic leading-relaxed text-justify px-4 bg-amber-500/5 p-4 border border-amber-700/10 rounded">
                  "{weddingData.quoteText}"
                </p>

                {/* Parent's declaration */}
                <div className="mt-6 p-4 border-2 border-dashed border-amber-700/20 text-left bg-stone-50">
                  <h5 className="text-[9px] uppercase font-sans font-black text-amber-700 tracking-wider mb-2">Our Beloved Families</h5>
                  <div className="grid grid-cols-1 gap-3 text-zinc-700 text-xs">
                    <div>
                      <p className="font-bold text-amber-900 font-sans text-[10px]">Groom's Parents:</p>
                      <p className="italic font-serif leading-snug">{weddingData.groomParents}</p>
                    </div>
                    <div>
                      <p className="font-bold text-amber-900 font-sans text-[10px]">Bride's Parents:</p>
                      <p className="italic font-serif leading-snug">{weddingData.brideParents}</p>
                    </div>
                  </div>
                </div>

                {/* Love Story Snippets */}
                <div className="mt-6 text-left">
                  <h5 className="text-[9px] uppercase font-sans font-black text-amber-700 tracking-wider mb-3">Our Love Story Chronology</h5>
                  <div className="space-y-4">
                    <div className="flex gap-3 bg-white p-3 border border-amber-700/10">
                      <span className="text-sm shrink-0">✨</span>
                      <div>
                        <p className="text-[9px] font-bold text-amber-800">First Encounter (2022)</p>
                        <p className="text-xs text-zinc-600 font-serif italic mt-0.5 leading-relaxed">{weddingData.storyAwal}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 bg-white p-3 border border-amber-700/10">
                      <span className="text-sm shrink-0">✈️</span>
                      <div>
                        <p className="text-[9px] font-bold text-amber-800">Growing Closer (2023)</p>
                        <p className="text-xs text-zinc-600 font-serif italic mt-0.5 leading-relaxed">{weddingData.storyDekat}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 bg-white p-3 border border-amber-700/10">
                      <span className="text-sm shrink-0">💍</span>
                      <div>
                        <p className="text-[9px] font-bold text-amber-800">The Beautiful Proposal (2026)</p>
                        <p className="text-xs text-zinc-600 font-serif italic mt-0.5 leading-relaxed">{weddingData.storyLamaran}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button 
                    onClick={() => setOpenedPanel(null)}
                    className="bg-amber-700 hover:bg-amber-800 text-white font-sans text-[10px] uppercase font-black tracking-widest px-8 py-3.5 border-4 border-amber-900 shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    Close Letter 📁
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* SPOT 2: SIGNPOST POPUP PANEL (Ceremony, Reception schedule details) */}
        {openedPanel === 'signpost' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-[#faf5f0] border-4 sm:border-8 border-green-800 w-full max-w-lg p-4 sm:p-6 relative max-h-[90vh] sm:max-h-[85vh] overflow-y-auto shadow-[0_0_0_4px_rgba(0,0,0,0.1),0_0_0_8px_rgba(0,0,0,0.15),0_20px_40px_rgba(0,0,0,0.6)] rounded-xl"
            >
              <button 
                onClick={() => setOpenedPanel(null)}
                className="absolute top-2 right-2 bg-green-800 text-white w-8 h-8 flex items-center justify-center hover:bg-green-900 border-2 border-black font-bold font-sans cursor-pointer text-sm"
              >
                X
              </button>

              <div className="text-center mt-3">
                <span className="text-4xl">📜</span>
                <p className="text-[10px] text-green-800 uppercase tracking-[0.3em] font-sans font-black mt-2">Wedding Schedule</p>
                <div className="h-0.5 bg-gradient-to-r from-transparent via-green-800 to-transparent my-4"></div>
                
                {/* Save the date info */}
                <div className="p-4 bg-green-800/5 border border-green-800/10 rounded-lg mb-6">
                  <p className="text-[10px] uppercase font-sans font-black text-green-800 tracking-wider">Event Timeline Date</p>
                  <p className="text-xl font-serif text-zinc-800 italic font-bold mt-1">{weddingData.date}</p>
                </div>

                <div className="space-y-6 text-left">
                  {/* Holy Matrimony Block */}
                  <div className="p-5 bg-white border border-green-800/10 shadow-sm rounded relative group hover:border-green-800/30 transition-all duration-350">
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-green-800"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-green-800"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-green-800"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-green-800"></div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-500/10 text-green-800 shrink-0">
                        <Clock size={20} />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-sans font-black uppercase text-green-900 tracking-wider">Akad Nikah</h4>
                        <p className="text-xs text-zinc-500 font-sans font-bold mt-1 tracking-wider">🕐 Time: {weddingData.akadTime}</p>
                        <p className="text-sm font-serif font-bold text-zinc-800 mt-2">📍 Location: {weddingData.akadLocation}</p>
                        <p className="text-xs text-zinc-500 leading-relaxed font-sans mt-1 bg-stone-50 p-2.5 border border-stone-200">{weddingData.akadAddress}</p>
                      </div>
                    </div>
                  </div>

                  {/* Wedding Reception Block */}
                  <div className="p-5 bg-white border border-green-800/10 shadow-sm rounded relative group hover:border-green-800/30 transition-all duration-350">
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-green-800"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-green-800"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-green-800"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-green-800"></div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-500/10 text-green-800 shrink-0">
                        <Users size={20} />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-sans font-black uppercase text-green-900 tracking-wider">Tasyakuran Pernikahan</h4>
                        <p className="text-xs text-zinc-500 font-sans font-bold mt-1 tracking-wider">🕐 Time: {weddingData.resepsiTime}</p>
                        <p className="text-sm font-serif font-bold text-zinc-800 mt-2">📍 Location: {weddingData.resepsiLocation}</p>
                        <p className="text-xs text-zinc-500 leading-relaxed font-sans mt-1 bg-stone-50 p-2.5 border border-stone-200">{weddingData.resepsiAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Google Maps Link Buttons inside signpost */}
                <div className="mt-8 flex flex-col gap-3">
                  <a 
                    href={weddingData.mapsLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full bg-green-800 hover:bg-green-900 text-white font-sans text-[10px] uppercase font-black tracking-widest py-4 border-4 border-green-950 shadow-md text-center flex items-center justify-center gap-3 transition-all cursor-pointer"
                  >
                    <span>🧭</span> Open Google Maps Navigation
                  </a>
                  
                  <button 
                    onClick={() => setOpenedPanel(null)}
                    className="w-full bg-stone-200 hover:bg-stone-300 text-zinc-700 font-sans text-[10px] uppercase font-black tracking-widest py-3 border border-stone-400 cursor-pointer transition-all"
                  >
                    Go Back To Map 🏔️
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* SPOT 3: WEDDING ARCH POPUP PANEL (RSVP, Guest Blessings & Gifts) */}
        {openedPanel === 'arch' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-[#faf5f0] border-4 sm:border-8 border-pink-700 w-full max-w-2xl p-4 sm:p-6 relative max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-[0_0_0_4px_rgba(0,0,0,0.1),0_0_0_8px_rgba(0,0,0,0.15),0_20px_40px_rgba(0,0,0,0.6)] rounded-xl"
            >
              <button 
                onClick={() => setOpenedPanel(null)}
                className="absolute top-2 right-2 bg-pink-700 text-white w-8 h-8 flex items-center justify-center hover:bg-pink-800 border-2 border-black font-bold font-sans cursor-pointer text-sm"
              >
                X
              </button>

              <div className="text-center mt-3">
                <span className="text-4xl text-pink-500 animate-pulse inline-block">💒</span>
                <p className="text-[10px] text-pink-700 uppercase tracking-[0.3em] font-sans font-black mt-2">Wedding Arch & Ceremony</p>
                <div className="h-0.5 bg-gradient-to-r from-transparent via-pink-700 to-transparent my-4"></div>
                
                <h3 className="font-display text-4xl text-zinc-900 leading-none tracking-tight">
                  {weddingData.groomShort} & {weddingData.brideShort}
                </h3>
                <p className="text-[10px] text-zinc-500 tracking-[0.2em] font-sans font-bold uppercase mt-2">{weddingData.date}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mt-8 items-start">
                  
                  {/* Left Side: Interactive RSVP & Gifts */}
                  <div className="space-y-6">
                    {/* RSVP Form Column */}
                    <div className="p-5 bg-white border border-pink-700/10 shadow-sm rounded relative">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-rose-400"></div>
                      <h4 className="text-[10px] uppercase font-sans font-black text-pink-700 tracking-wider mb-4 flex items-center gap-1.5">
                        <span>🖋️</span> Guest RSVP Form
                      </h4>

                      <form onSubmit={submitRsvp} className="space-y-4">
                        <div>
                          <label className="block text-[8px] font-sans font-black text-zinc-500 uppercase tracking-widest mb-1">Your Full Name</label>
                          <input 
                            type="text" 
                            required
                            value={rsvp.name}
                            onChange={(e) => setRsvp({...rsvp, name: e.target.value})}
                            placeholder="Type name..." 
                            className="w-full p-3 border border-pink-700/25 bg-pink-500/5 focus:outline-none focus:border-pink-500 font-serif italic text-xs leading-none" 
                          />
                        </div>
                        
                        <div>
                          <label className="block text-[8px] font-sans font-black text-zinc-500 uppercase tracking-widest mb-1.5">Will You Join Us?</label>
                          <div className="grid grid-cols-2 gap-3 mb-2">
                            <button 
                              type="button"
                              onClick={() => setRsvp({...rsvp, status: 'hadir'})}
                              className={`py-3 text-[10px] font-sans font-bold uppercase tracking-wider border-2 transition-all ${rsvp.status === 'hadir' ? 'bg-[#5cb32e] text-white border-[#5cb32e]' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-zinc-300'}`}
                            >
                              Joy Attend
                            </button>
                            <button 
                              type="button"
                              onClick={() => setRsvp({...rsvp, status: 'tidak_hadir'})}
                              className={`py-3 text-[10px] font-sans font-bold uppercase tracking-wider border-2 transition-all ${rsvp.status === 'tidak_hadir' ? 'bg-zinc-700 text-white border-zinc-700' : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-zinc-300'}`}
                            >
                              Decline
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[8px] font-sans font-black text-zinc-500 uppercase tracking-widest mb-1">Total Attendants</label>
                          <select 
                            value={rsvp.guests}
                            onChange={(e) => setRsvp({...rsvp, guests: e.target.value})}
                            className="w-full p-2.5 border border-pink-700/25 bg-pink-500/0 text-xs font-serif italic"
                          >
                            <option value="1">1 Person</option>
                            <option value="2">2 Persons</option>
                            <option value="3">3 Persons</option>
                          </select>
                        </div>
                        
                        <button 
                          type="submit"
                          className="w-full bg-pink-700 hover:bg-pink-800 text-white py-3 border-4 border-pink-900 text-[10px] uppercase font-black tracking-widest shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Check size={14} /> Send RSVP
                        </button>
                      </form>
                    </div>

                    {/* Gifts & Digital Wallets */}
                    <div className="p-5 bg-white border border-pink-700/10 shadow-sm rounded relative">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-yellow-400"></div>
                      <h4 className="text-[10px] uppercase font-sans font-black text-amber-700 tracking-wider mb-4 flex items-center gap-1.5">
                        <span>🎁</span> Love Gifts
                      </h4>
                      <p className="text-[10px] text-zinc-500 italic font-serif leading-relaxed mb-4">
                        Should you wish to send of a contribution or a token of love, click below to copy the gift wallet numbers:
                      </p>

                      <div className="space-y-3 font-sans">
                        {/* DANA Wallet */}
                        <div className="p-3 bg-stone-50 border border-amber-700/10">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[11px] font-black text-zinc-700 font-sans">DANA Wallet</span>
                            <span className="text-[9px] text-amber-700">A/N: {weddingData.danaOwner}</span>
                          </div>
                          <div className="flex gap-2 items-center justify-between">
                            <span className="text-xs font-mono font-bold font-black text-zinc-800 bg-white px-2 py-1 border border-zinc-200">{weddingData.danaNumber}</span>
                            <button 
                              onClick={() => copyDetail(weddingData.danaNumber, 'dana')}
                              className={`px-3 py-1.5 text-[8px] font-black uppercase text-white rounded transition-all flex items-center gap-1 shrink-0 cursor-pointer ${isCopied === 'dana' ? 'bg-[#5cb32e]' : 'bg-amber-600 hover:bg-amber-700'}`}
                            >
                              {isCopied === 'dana' ? <CheckCircle2 size={10} /> : <Copy size={10} />}
                              {isCopied === 'dana' ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>

                        {/* BCA Wallet */}
                        <div className="p-3 bg-stone-50 border border-amber-700/10">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[11px] font-black text-zinc-700 font-sans">Mandiri Transfer</span>
                            <span className="text-[9px] text-amber-700">A/N: {weddingData.bcaOwner}</span>
                          </div>
                          <div className="flex gap-2 items-center justify-between">
                            <span className="text-xs font-mono font-bold font-black text-zinc-800 bg-white px-2 py-1 border border-zinc-200">{weddingData.bcaNumber}</span>
                            <button 
                              onClick={() => copyDetail(weddingData.bcaNumber, 'bca')}
                              className={`px-3 py-1.5 text-[8px] font-black uppercase text-white rounded transition-all flex items-center gap-1 shrink-0 cursor-pointer ${isCopied === 'bca' ? 'bg-[#5cb32e]' : 'bg-amber-600 hover:bg-amber-700'}`}
                            >
                              {isCopied === 'bca' ? <CheckCircle2 size={10} /> : <Copy size={10} />}
                              {isCopied === 'bca' ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>

                        {/* Gift address */}
                        <div className="bg-amber-500/5 p-3 border border-amber-700/15 text-[10px] leading-relaxed italic text-zinc-600 font-serif">
                          🏠 Shipping Address: "{weddingData.giftAddress}"
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Wishes / Blessings Guestbook */}
                  <div className="space-y-6">
                    {/* Add Wishes Letter */}
                    <div className="p-5 bg-white border border-pink-700/10 shadow-sm rounded">
                      <h4 className="text-[10px] uppercase font-sans font-black text-pink-750 tracking-wider mb-4 flex items-center gap-1.5">
                        <span>💗</span> Write Blessings
                      </h4>
                      <form onSubmit={submitWish} className="space-y-4">
                        <div>
                          <input 
                            type="text" 
                            required
                            value={newWish.name}
                            onChange={(e) => setNewWish({...newWish, name: e.target.value})}
                            placeholder="Your Name..." 
                            className="w-full p-3 border border-zinc-200 focus:outline-none focus:border-pink-500 font-serif italic text-xs leading-none" 
                          />
                        </div>
                        <div>
                          <textarea 
                            required
                            value={newWish.message}
                            onChange={(e) => setNewWish({...newWish, message: e.target.value})}
                            placeholder="Write your beautiful prayers and warm greetings here..." 
                            className="w-full p-3 border border-zinc-200 focus:outline-none focus:border-pink-500 h-28 bg-transparent font-serif italic text-xs resize-none"
                          ></textarea>
                        </div>
                        <button 
                          type="submit"
                          className="w-full bg-pink-700 hover:bg-pink-800 text-white py-3 border-4 border-pink-900 text-[10px] uppercase font-black tracking-widest shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Send size={12} /> Send Blessings
                        </button>
                      </form>
                    </div>

                    {/* Wishes Board feed list */}
                    <div className="bg-white border border-pink-700/10 p-4 rounded max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-pink-700/10">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-sans font-black uppercase text-pink-800 tracking-wider">Prayers Received ({wishes.length})</span>
                      </div>
                      <div className="space-y-3">
                        {wishes.map((wish, index) => (
                          <div key={index + wish.name} className="p-3 bg-stone-50 border border-zinc-100 text-left rounded hover:border-pink-700/20 transition-all">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-sans font-black text-pink-800 leading-none">{wish.name}</span>
                              <span className="text-[7.5px] uppercase font-bold text-zinc-400 font-sans tracking-wide">{wish.time}</span>
                            </div>
                            <p className="text-stone-700 font-serif text-xs italic mt-1 leading-relaxed whitespace-pre-wrap">"{wish.message}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button 
                    onClick={() => setOpenedPanel(null)}
                    className="bg-stone-800 hover:bg-stone-900 text-white font-sans text-[10px] uppercase font-black tracking-widest px-8 py-3.5 border-4 border-stone-950 shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    Close Arch Gateway 🚪
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
