import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

interface PhoneInputProps {
  label?: string;
  value?: string;
  onChange: (v: string) => void;
}

export function PhoneInput({ label = "Phone Number", value = "", onChange }: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(formatPhone(e.target.value));
  };

  return (
    <div>
      <Label>{label}</Label>
      <Input
        type="tel"
        placeholder="(555) 555-5555"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
