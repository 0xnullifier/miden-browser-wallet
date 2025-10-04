"use client";

interface RotatingBlockCounterProps {
  blockColor?: string;
  blockSize?: number;
  rotationSpeed?: number;
  className?: string;
}

export function RotatingBlock({
  blockColor = "bg-gradient-to-br from-blue-500 to-purple-600",
  blockSize = 10,
  rotationSpeed = 4,
  className = "",
}: RotatingBlockCounterProps) {
  return (
    <div className={`${className}`}>
      {/* Rotating 3D Block */}
      <div className="flex justify-center">
        <div
          className="relative preserve-3d"
          style={{
            width: `${blockSize}px`,
            height: `${blockSize}px`,
            animation: `rotate3d ${rotationSpeed}s linear infinite`,
          }}
        >
          {/* Cube faces */}
          <div
            className={`absolute inset-0 ${blockColor} shadow-lg`}
            style={{
              transform: `rotateY(0deg) translateZ(${blockSize / 2}px)`,
            }}
          />
          <div
            className={`absolute inset-0 ${blockColor} shadow-lg opacity-80`}
            style={{
              transform: `rotateY(90deg) translateZ(${blockSize / 2}px)`,
            }}
          />
          <div
            className={`absolute inset-0 ${blockColor} shadow-lg opacity-60`}
            style={{
              transform: `rotateY(180deg) translateZ(${blockSize / 2}px)`,
            }}
          />
          <div
            className={`absolute inset-0 ${blockColor} shadow-lg opacity-40`}
            style={{
              transform: `rotateY(-90deg) translateZ(${blockSize / 2}px)`,
            }}
          />
          <div
            className={`absolute inset-0 ${blockColor} shadow-lg opacity-90`}
            style={{
              transform: `rotateX(90deg) translateZ(${blockSize / 2}px)`,
            }}
          />
          <div
            className={`absolute inset-0 ${blockColor} shadow-lg opacity-70`}
            style={{
              transform: `rotateX(-90deg) translateZ(${blockSize / 2}px)`,
            }}
          />
        </div>
      </div>

      {/* CSS for 3D animation */}
      <style jsx>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }

        @keyframes rotate3d {
          0% {
            transform: rotateX(0deg) rotateY(0deg);
          }
          100% {
            transform: rotateX(360deg) rotateY(360deg);
          }
        }

        @media (max-width: 640px) {
          .preserve-3d {
            transform: scale(0.8);
          }
        }
      `}</style>
    </div>
  );
}
