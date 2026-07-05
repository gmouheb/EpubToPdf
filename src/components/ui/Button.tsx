import { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface BaseButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}

type ButtonProps = BaseButtonProps & ButtonHTMLAttributes<HTMLButtonElement>;
type ButtonLinkProps = BaseButtonProps & AnchorHTMLAttributes<HTMLAnchorElement>;

function buttonClassName(variant: ButtonVariant, className?: string): string {
  return ["ui-button", `ui-button-${variant}`, className].filter(Boolean).join(" ");
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonClassName(variant, className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <a className={buttonClassName(variant, className)} {...props}>
      {children}
    </a>
  );
}
