import Link from "next/link";

type ButtonVariant = "filled" | "ghost" | "gold";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: ButtonVariant;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const variantStyles: Record<ButtonVariant, string> = {
  filled:
    "bg-wine text-cream border border-wine hover:bg-ink hover:border-ink",
  ghost:
    "btn-ghost bg-transparent text-ink border border-[var(--border)] hover:text-cream",
  gold: "bg-gold text-ink border border-gold hover:bg-ink hover:text-gold hover:border-ink",
};

export default function Button({
  children,
  href,
  variant = "filled",
  className = "",
  onClick,
  disabled = false,
  type = "button",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 px-6 py-3 font-ui text-[11px] font-normal tracking-[2px] uppercase transition-colors duration-300";

  const classes = `${base} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
  );
}
