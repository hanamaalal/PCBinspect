"use client";

export default function RobotCameraBottom() {
  return (
    <div className="w-130 overflow-hidden rounded-lg bg-black">
      <img
        src="http://localhost:5000/camera/bottom"
        alt="Caméra BOTTOM"
        className="w-full h-auto object-contain"
      />
    </div>
  );
}