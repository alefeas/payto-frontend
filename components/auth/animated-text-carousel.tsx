"use client";

import { useState, useEffect } from "react";

interface TextPart {
  text: string;
  bold?: boolean;
}

interface AnimatedTextCarouselProps {
  messages: (string | TextPart[])[];
  interval?: number;
  fadeDuration?: number;
}

export default function AnimatedTextCarousel({
  messages,
  interval = 4500,
  fadeDuration = 600,
}: AnimatedTextCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setIsVisible(false);
    }, interval - fadeDuration);

    const changeTextTimer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
      setIsVisible(true);
    }, interval);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(changeTextTimer);
    };
  }, [currentIndex, messages.length, interval, fadeDuration]);

  const renderMessage = (message: string | TextPart[]) => {
    if (typeof message === "string") {
      return message;
    }

    return message.map((part, index) => (
      <span
        key={index}
        className={part.bold ? "font-medium" : "font-thin"}
      >
        {part.text}
      </span>
    ));
  };

  return (
    <div className="relative">
      <p
        className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white transition-opacity duration-600 break-words leading-none"
        style={{
          opacity: isVisible ? 1 : 0,
          transitionDuration: `${fadeDuration}ms`,
        }}
      >
        {renderMessage(messages[currentIndex])}
      </p>
    </div>
  );
}
