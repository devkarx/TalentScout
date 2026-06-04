import { twMerge } from "tailwind-merge";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export default function GlassCard({
  children,
  className,
  hoverEffect = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={twMerge(
        "surface p-6 transition-all duration-200",
        hoverEffect && "surface-hover",
        className,
      )}
      style={{ transitionTimingFunction: "var(--ease-snappy)" }}
      {...props}
    >
      {children}
    </div>
  );
}
