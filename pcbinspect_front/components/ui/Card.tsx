interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border dark:border-[#155454] bg-surface p-6 ${className}`}
    >
      {children}
    </div>
  );
}
