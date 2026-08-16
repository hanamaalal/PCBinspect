"use client";

export default function RobotCameraTop() {
  return (
    <div className="w-130 overflow-hidden rounded-lg bg-black">
      <img
        src="http://localhost:5000/camera/top"
        alt="Caméra TOP"
        className="block h-auto w-full object-contain"
      />
    </div>
  );
}