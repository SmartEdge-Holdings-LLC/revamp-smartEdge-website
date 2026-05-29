import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import {
  profileFieldHintClass,
  profileFieldInputClass,
  profileFieldLabelClass,
} from "@/lib/profile-form-ui";

type ProfileFieldProps = {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  placeholder?: string;
  minLength?: number;
};

export function ProfileField({
  id,
  label,
  hint,
  value,
  onChange,
  type = "text",
  required,
  disabled,
  autoComplete,
  placeholder,
  minLength,
}: ProfileFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={profileFieldLabelClass}>
        {label}
      </label>
      <p className={profileFieldHintClass}>{hint}</p>
      <Input
        id={id}
        type={type}
        className={profileFieldInputClass}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        placeholder={placeholder}
        minLength={minLength}
      />
    </div>
  );
}
