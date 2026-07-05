import { InputHTMLAttributes } from "react";

export default function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={["ui-input", className].filter(Boolean).join(" ")} {...props} />;
}
