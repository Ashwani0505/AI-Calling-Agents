import { useEffect, useState } from 'react';

interface TypingStatusProps {
  messages: string[];
  speed?: number;
}

export default function TypingStatus({ messages, speed = 50 }: TypingStatusProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (currentMessageIndex >= messages.length) {
      setCurrentMessageIndex(0);
      return;
    }

    const currentMessage = messages[currentMessageIndex];

    if (charIndex < currentMessage.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prev) => prev + currentMessage[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        setCurrentText('');
        setCharIndex(0);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, currentMessageIndex, messages, speed]);

  return (
    <div className="font-['Share_Tech_Mono'] text-cyan-400 text-lg flex items-center">
      <span className="mr-2 text-cyan-500">&gt;</span>
      <span className="text-cyan-300">{currentText}</span>
      <span className="inline-block w-2 h-5 bg-cyan-400 ml-1 animate-pulse" />
    </div>
  );
}
