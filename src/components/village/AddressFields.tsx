import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CA_PROVINCES = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick",
  "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia",
  "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon",
];

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming",
];

const COUNTRIES = ["United States", "Canada"];

export interface AddressData {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export function parseAddress(raw: string | undefined | null): AddressData {
  if (!raw) return { street: "", city: "", state: "Texas", zip: "", country: "United States" };
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "street" in parsed) {
      return { street: parsed.street ?? "", city: parsed.city ?? "", state: parsed.state ?? "", zip: parsed.zip ?? "", country: parsed.country ?? "United States" };
    }
  } catch { /* not JSON, treat as legacy plain string */ }
  return { street: raw, city: "", state: "Texas", zip: "", country: "United States" };
}

export function formatAddressLine(addr: AddressData): string {
  const parts = [addr.street, addr.city, addr.state && addr.zip ? `${addr.state} ${addr.zip}` : addr.state || addr.zip, addr.country].filter(Boolean);
  return parts.join(", ");
}

export function serializeAddress(addr: AddressData): string {
  return JSON.stringify(addr);
}

interface AddressFieldsProps {
  address: AddressData;
  onChange: (addr: AddressData) => void;
}

export function AddressFields({ address, onChange }: AddressFieldsProps) {
  const set = (key: keyof AddressData, val: string) => onChange({ ...address, [key]: val });
  const regions = address.country === "United States" ? US_STATES : CA_PROVINCES;
  const regionLabel = address.country === "United States" ? "State" : "Province";
  const zipLabel = address.country === "United States" ? "ZIP Code" : "Postal Code";

  return (
    <div className="space-y-3">
      <div>
        <Label>Street Address</Label>
        <Input placeholder="123 Main St" value={address.street} onChange={(e) => set("street", e.target.value)} />
      </div>
      <div>
        <Label>City</Label>
        <Input placeholder="Austin" value={address.city} onChange={(e) => set("city", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Country</Label>
          <Select value={address.country} onValueChange={(v) => set("country", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{regionLabel}</Label>
          <Select value={address.state} onValueChange={(v) => set("state", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>{zipLabel}</Label>
        <Input placeholder={address.country === "United States" ? "10001" : "M5V 1A1"} value={address.zip} onChange={(e) => set("zip", e.target.value)} />
      </div>
    </div>
  );
}
