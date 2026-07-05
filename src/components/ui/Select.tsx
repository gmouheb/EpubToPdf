import { SelectHTMLAttributes } from "react";

export default function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={["ui-input", "ui-select", className].filter(Boolean).join(" ")} {...props} />;
}
