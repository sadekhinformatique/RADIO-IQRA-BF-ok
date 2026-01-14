
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Radio, Clock, Info, Facebook, Twitter, Instagram, Share2 } from 'lucide-react';
import { Visualizer } from './components/Visualizer';
import { AIInspiration } from './components/AIInspiration';
import { STREAM_URL, RADIO_NAME, SLOGAN, FREQUENCY, WEEKLY_PROGRAMS, COLORS } from './constants';
import { PlayerStatus } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<PlayerStatus>(PlayerStatus.IDLE);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const node = ctx.createAnalyser();
      node.fftSize = 256;

      if (audioRef.current) {
        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(node);
        node.connect(ctx.destination);
      }
      
      audioContextRef.current = ctx;
      setAnalyser(node);
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (status === PlayerStatus.PLAYING) {
      audioRef.current.pause();
      setStatus(PlayerStatus.PAUSED);
    } else {
      try {
        setStatus(PlayerStatus.LOADING);
        initAudio();
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        await audioRef.current.play();
        setStatus(PlayerStatus.PLAYING);
      } catch (err) {
        console.error("Playback failed", err);
        setStatus(PlayerStatus.ERROR);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
    if (val > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMute = !isMuted;
    setIsMuted(newMute);
    audioRef.current.muted = newMute;
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        src={STREAM_URL} 
        crossOrigin="anonymous"
        onEnded={() => setStatus(PlayerStatus.IDLE)}
      />

      {/* Header / Hero */}
      <header className="bg-green-800 text-white pt-16 pb-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 gap-4 rotate-12 -translate-y-12">
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={i} className="h-24 w-24 border border-white rounded-lg"></div>
            ))}
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="w-32 h-32 bg-white rounded-full p-2 shadow-2xl mb-6 ring-4 ring-green-600/30 overflow-hidden">
             {/* Using a nice placeholder that resembles the logo provided */}
             <div className="w-full h-full rounded-full bg-green-50 flex items-center justify-center border-2 border-green-600">
                <Radio size={64} className="text-green-700" />
             </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">{RADIO_NAME}</h1>
          <div className="flex items-center gap-3 mb-4">
             <span className="bg-green-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">{FREQUENCY}</span>
             <span className="text-green-200 text-lg font-medium">Direct</span>
          </div>
          <p className="text-xl text-green-100 font-arabic italic">{SLOGAN}</p>
        </div>
      </header>

      {/* Main Content (Player Overlay) */}
      <main className="max-w-4xl mx-auto px-4 -mt-20 relative z-20 space-y-8">
        {/* Player Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 glass">
          <div className="flex flex-col items-center gap-8">
            {/* Visualizer */}
            <Visualizer analyser={analyser} isPlaying={status === PlayerStatus.PLAYING} />

            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8">
              <div className="flex-1 hidden md:block">
                 <div className="flex items-center gap-2 text-green-800 mb-1">
                   <Clock size={16} />
                   <span className="text-sm font-semibold">En ce moment</span>
                 </div>
                 <p className="font-bold text-gray-800">Direct Live Studio</p>
              </div>

              <div className="flex items-center gap-6">
                <button 
                  onClick={togglePlay}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-lg ${
                    status === PlayerStatus.PLAYING 
                    ? 'bg-green-100 text-green-700 border-2 border-green-600' 
                    : 'bg-green-700 text-white hover:bg-green-800'
                  }`}
                >
                  {status === PlayerStatus.LOADING ? (
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : status === PlayerStatus.PLAYING ? (
                    <Pause size={36} fill="currentColor" />
                  ) : (
                    <Play size={36} fill="currentColor" className="ml-2" />
                  )}
                </button>
              </div>

              <div className="flex-1 flex items-center justify-end gap-4 w-full md:w-auto">
                <button onClick={toggleMute} className="text-green-700 hover:bg-green-50 p-2 rounded-full transition-colors">
                  {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full md:w-32 h-1.5 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
              </div>
            </div>

            {status === PlayerStatus.PLAYING && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full radio-pulse"></div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Émission en direct</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Section */}
        <AIInspiration />

        {/* Info & Program Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Programs */}
          <section className="bg-white p-8 rounded-3xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg text-green-700">
                <Clock size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Programmation</h2>
            </div>
            <div className="space-y-6">
              {WEEKLY_PROGRAMS.map(prog => (
                <div key={prog.id} className="group cursor-default">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-green-900 group-hover:text-green-600 transition-colors">{prog.title}</h3>
                    <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase">{prog.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{prog.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Socials & Info */}
          <section className="space-y-8">
            <div className="bg-green-700 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="absolute bottom-0 right-0 p-4 opacity-20">
                <Info size={120} />
              </div>
              <h2 className="text-xl font-bold mb-4">À propos d'Iqra</h2>
              <p className="text-green-50 leading-relaxed mb-6">
                Radio Iqra est votre compagnon spirituel quotidien, diffusant la parole d'Allah et des enseignements enrichissants pour la communauté. 
                Rejoignez-nous sur 96.1 MHz ou partout dans le monde via notre plateforme numérique.
              </p>
              <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl font-semibold transition-all">
                <Share2 size={18} /> Partager la station
              </button>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Suivez-nous</h2>
              <div className="flex justify-center gap-6">
                {[
                  { icon: Facebook, color: 'hover:text-blue-600' },
                  { icon: Twitter, color: 'hover:text-sky-500' },
                  { icon: Instagram, color: 'hover:text-pink-600' }
                ].map((social, i) => (
                  <a 
                    key={i} 
                    href="#" 
                    className={`p-4 bg-gray-50 rounded-2xl text-gray-400 ${social.color} transition-all hover:bg-white hover:shadow-md transform hover:-translate-y-1`}
                  >
                    <social.icon size={28} />
                  </a>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 mt-16 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Radio Iqra 96.1 MHz. Tous droits réservés.</p>
        <p className="mt-2 italic">"Lis, au nom de ton Seigneur qui a créé..."</p>
      </footer>
    </div>
  );
};

export default App;
