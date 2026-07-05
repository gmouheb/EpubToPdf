import { ReactNode } from "react";

interface AlertProps {
  tone?: "info" | "success" | "error";
  title: string;
  children?: ReactNode;
}

export default function Alert({ tone = "info", title, children }: AlertProps) {
  return (
    <div className={`ui-alert ui-alert-${tone}`} role={tone === "error" ? "alert" : "status"}>
      <strong>{title}</strong>
      {children ? <p>{children}</p> : null}
    </div>
  );
}
