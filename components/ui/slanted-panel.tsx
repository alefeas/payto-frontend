import { ReactNode } from "react";

interface SlantedPanelProps {
  children: ReactNode;
  direction: "left" | "right";
  className?: string;
  id?: string;
}

export default function SlantedPanel({
  children,
  direction,
  className = "",
  id,
}: SlantedPanelProps) {
  const clipPathId = id || `slanted-${direction}-${Math.random().toString(36).substr(2, 9)}`;
  
  // SVG paths for left and right slanted panels with rounded corners
  const clipPaths = {
    left: "M 0.05,0 L 0.83,0 Q 0.88,0 0.88,0.05 L 0.8,0.95 Q 0.8,1 0.75,1 L 0.05,1 Q 0,1 0,0.95 L 0,0.05 Q 0,0 0.05,0 Z",
    right: "M 0.17,0 Q 0.12,0 0.12,0.05 L 0.2,0.95 Q 0.2,1 0.25,1 L 0.95,1 Q 1,1 1,0.95 L 1,0.05 Q 1,0 0.95,0 Z",
  };

  const boxShadows = {
    left: "20px 0 40px -10px rgba(0, 43, 255, 0.3)",
    right: "-20px 0 40px -10px rgba(0, 43, 255, 0.3)",
  };

  return (
    <>
      {/* SVG Clip Path Definition */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
            <path d={clipPaths[direction]} />
          </clipPath>
        </defs>
      </svg>

      {/* Slanted Panel */}
      <div
        className={`relative overflow-hidden ${className}`}
        style={{
          clipPath: `url(#${clipPathId})`,
          boxShadow: boxShadows[direction],
        }}
      >
        {children}
      </div>
    </>
  );
}
