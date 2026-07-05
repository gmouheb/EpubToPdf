import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={["ui-card", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}
