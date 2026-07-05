import { InputHTMLAttributes, ReactNode } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  description?: ReactNode;
}

export default function Checkbox({ label, description, className, ...props }: CheckboxProps) {
  return (
    <label className={["ui-checkbox", className].filter(Boolean).join(" ")}>
      <input type="checkbox" {...props} />
      <span>
        <span className="ui-checkbox-label">{label}</span>
        {description ? <span className="ui-checkbox-description">{description}</span> : null}
      </span>
    </label>
  );
}
