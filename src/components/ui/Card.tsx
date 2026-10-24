import { cn } from "@/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Makes the card show hover pointer and lift effects */
  interactive?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, interactive, onClick }: CardProps) {
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      className={cn("card", interactive && "card-interactive", className)}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      {children}
    </Tag>
  );
}
