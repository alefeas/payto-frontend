"use client";

import { useState, useEffect } from "react";

interface HeroContent {
  title: string;
  description: string;
}

interface AnimatedHeroContentProps {
  contents: HeroContent[];
  interval?: number;
  fadeDuration?: number;
}

export default function AnimatedHeroContent({
  contents,
  interval = 5000,
  fadeDuration = 600,
}: AnimatedHeroContentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setIsVisible(false);
    }, interval - fadeDuration);

    const changeTextTimer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % contents.length);
      setIsVisible(true);
    }, interval);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(changeTextTimer);
    };
  }, [currentIndex, contents.length, interval, fadeDuration]);

  return (
    <div className="space-y-3">
      <h1
        className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium text-foreground leading-none transition-opacity"
        style={{
          opacity: isVisible ? 1 : 0,
          transitionDuration: `${fadeDuration}ms`,
        }}
      >
        {contents[currentIndex].title}
      </h1>

      <p
        className="text-muted-foreground text-sm md:text-base lg:text-lg leading-normal max-w-xl pt-1 transition-opacity"
        style={{
          opacity: isVisible ? 1 : 0,
          transitionDuration: `${fadeDuration}ms`,
        }}
      >
        {contents[currentIndex].description}
      </p>
    </div>
  );
}

