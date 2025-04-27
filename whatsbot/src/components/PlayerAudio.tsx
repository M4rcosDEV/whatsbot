import { useRef, useState } from 'react';
import { CirclePlay, AudioLines, CirclePause } from 'lucide-react';

export function PlayerAudio({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setProgress((audio.currentTime / audio.duration) * 100);
    setDuration(audio.duration);
    setCurrentTime(audio.currentTime);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percent = clickX / width;

    audio.currentTime = percent * audio.duration;
  };

  return (
    <div className="flex items-center gap-2 w-full bg-gray-300 p-2 rounded-xl shadow">
      <button onClick={togglePlay} className="p-2 cursor-pointer">
        {isPlaying ? <CirclePause /> : <CirclePlay />}
      </button>
      <AudioLines className={isPlaying ? "animate-wave" : ""} />
      <div onClick={handleSeek} className="relative flex-1 bg-gray-400 h-2 rounded-full overflow-hidden cursor-pointer">
        <div className="bg-green-500 h-full " style={{ width: `${progress}%` }}>--------------</div>
      </div>

      <span className="text-xs text-gray-600 min-w-[60px] text-right">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
          setCurrentTime(0);
        }}
        className="hidden"
      />
    </div>
  );
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60) || 0;
  const secs = Math.floor(seconds % 60) || 0;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};
