import { Cpu, Layers } from "lucide-react";

interface StatCardProps {
  icon: "of-prf" | "pieces";
  label: string;
  value: number;
}

const ICONS = {
  "of-prf": Cpu,
  pieces: Layers,
};

export function StatCard({ icon, label, value }: StatCardProps) {

  const Icon = ICONS[icon];

  if (!Icon) {
    return null;
  }

  return (
    <div className="flex-1 rounded-2xl border border-border bg-surface p-4 dark:border-[#294444] dark:bg-[#155454]">
      <span className="mb-6 flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-text-secondary  dark:text-teal-300 ">
        <Icon size={18} />
      </span>

      <p className="text-sm text-text-secondary dark:text-gray-300">
        {label}
      </p>

      <p className="text-2xl font-bold text-text-primary dark:text-white">
        {value}
      </p>

    </div>
  );
}