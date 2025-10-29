import React from "react";
import { colors } from "@/styles";

interface FloatingBlobsProps {
  /**
   * Number of blobs to render
   * @default 1
   */
  count?: number;
  /**
   * Size of each blob in pixels
   * @default 384 (96 in rem)
   */
  size?: number;
  /**
   * Background color/gradient for the blob
   * Can be a CSS color string or "gradient" for the default gradient
   * @default "gradient"
   */
  color?: string | "gradient";
  /**
   * Opacity of the blob
   * @default 0.3
   */
  opacity?: number;
  /**
   * Blur intensity in pixels
   * @default 96 (3xl)
   */
  blur?: number;
  /**
   * Animation duration in seconds
   * @default 15
   */
  duration?: number;
  /**
   * Custom className for additional styling
   */
  className?: string;
  /**
   * Position of the blob: "center", "top-left", "top-right", "bottom-left", "bottom-right", or "custom"
   * @default "center"
   */
  position?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "custom";
  /**
   * Custom position values (only used when position is "custom")
   */
  customPosition?: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
}

export default function FloatingBlobs({
  count = 1,
  size = 384,
  color = "gradient",
  opacity = 0.3,
  blur = 96,
  duration = 15,
  className = "",
  position = "center",
  customPosition,
}: FloatingBlobsProps) {
  const getBackground = () => {
    if (color === "gradient") {
      return `radial-gradient(circle at center, ${colors.gradient.topLeft}, ${colors.gradient.topRight}, ${colors.gradient.bottomRight})`;
    }
    return color;
  };

  const getPositionStyles = (): React.CSSProperties => {
    if (position === "custom" && customPosition) {
      return customPosition;
    }

    const positions = {
      center: {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      },
      "top-left": {
        top: "10%",
        left: "10%",
      },
      "top-right": {
        top: "10%",
        right: "10%",
      },
      "bottom-left": {
        bottom: "10%",
        left: "10%",
      },
      "bottom-right": {
        bottom: "10%",
        right: "10%",
      },
    };

    return positions[position];
  };

  const blobs = Array.from({ length: count }, (_, index) => {
    const delay = index * (duration / count);
    
    return (
      <div
        key={index}
        className={`absolute rounded-full animate-blob ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: getBackground(),
          opacity,
          filter: `blur(${blur}px)`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          ...getPositionStyles(),
        }}
      />
    );
  });

  return <>{blobs}</>;
}

