interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export default function Tag({ children, className = "" }: TagProps) {
  return (
    <span
      className={`text-xs font-sans uppercase text-wine/70 ${className}`}
    >
      {children}
    </span>
  );
}
