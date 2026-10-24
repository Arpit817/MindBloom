import { cn } from "@/utils/cn";

export default function Card({ children, className, interactive, onClick }) {
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
