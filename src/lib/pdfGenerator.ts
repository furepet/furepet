import jsPDF from "jspdf";
import { format, parseISO, differenceInYears, differenceInMonths } from "date-fns";
import type { Pet } from "@/hooks/usePets";
import type { MedicalRecord } from "@/hooks/useMedicalRecords";

const PRIMARY_COLOR: [number, number, number] = [46, 125, 50]; // #2E7D32
const ALLERGY_BG: [number, number, number] = [255, 248, 225]; // amber-50
const HEADER_HEIGHT = 28;

const formatAge = (dob: string | null): string => {
  if (!dob) return "Unknown";
  const bd = parseISO(dob);
  const y = differenceInYears(new Date(), bd);
  if (y >= 1) return `${y} year${y !== 1 ? "s" : ""} old`;
  const m = differenceInMonths(new Date(), bd);
  return m >= 1 ? `${m} month${m !== 1 ? "s" : ""} old` : "< 1 month old";
};

function addHeader(doc: jsPDF, petName: string) {
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, 210, HEADER_HEIGHT, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("FurePET", 14, 12);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${petName}'s Report`, 14, 20);
  doc.setFontSize(8);
  doc.text(`Generated on ${format(new Date(), "MMMM d, yyyy")}`, 210 - 14, 20, { align: "right" });
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  if (y > 265) { doc.addPage(); addHeader(doc, ""); y = HEADER_HEIGHT + 10; }
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(title, 14, y);
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.line(14, y + 2, 196, y + 2);
  return y + 8;
}

function addRow(doc: jsPDF, label: string, value: string, y: number): number {
  if (y > 275) { doc.addPage(); y = HEADER_HEIGHT + 10; }
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100);
  doc.text(label, 14, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  const lines = doc.splitTextToSize(value || "—", 120);
  doc.text(lines, 70, y);
  return y + Math.max(lines.length * 4.5, 6);
}

function addBasicsSection(doc: jsPDF, pet: Pet, y: number): number {
  y = addSectionTitle(doc, "Pet Profile", y);
  y = addRow(doc, "Name", pet.pet_name, y);
  if (pet.nickname) y = addRow(doc, "Nickname", pet.nickname, y);
  y = addRow(doc, "Species", pet.species, y);
  y = addRow(doc, "Breed", pet.breed || "Unknown", y);
  y = addRow(doc, "Age", formatAge(pet.date_of_birth), y);
  if (pet.date_of_birth) y = addRow(doc, "Date of Birth", format(parseISO(pet.date_of_birth), "MMMM d, yyyy"), y);
  y = addRow(doc, "Microchip", pet.microchip_number || "Not on file", y);
  y = addRow(doc, "Neuter/Spay", pet.neuter_spay_status, y);
  if (pet.has_insurance) {
    y = addRow(doc, "Insurance", [pet.insurance_company, pet.policy_number].filter(Boolean).join(" · ") || "On file", y);
  }
  return y + 4;
}

function addAllergySection(doc: jsPDF, records: MedicalRecord[], y: number): number {
  const allergies = records.filter((r) => r.category === "allergies");
  if (allergies.length === 0) return y;
  y = addSectionTitle(doc, "⚠️ Allergies", y);
  // Highlight background
  const blockHeight = allergies.length * 6 + 4;
  if (y + blockHeight > 275) { doc.addPage(); y = HEADER_HEIGHT + 10; }
  doc.setFillColor(...ALLERGY_BG);
  doc.roundedRect(14, y - 4, 182, blockHeight, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(120, 80, 0);
  allergies.forEach((a) => {
    const d = a.details as Record<string, any>;
    doc.setFont("helvetica", "bold");
    doc.text(`• ${a.title}`, 18, y);
    doc.setFont("helvetica", "normal");
    if (d.type) doc.text(`(${d.type})`, 18 + doc.getTextWidth(`• ${a.title} `), y);
    if (d.reaction) { y += 4.5; doc.text(`  Reaction: ${d.reaction}`, 18, y); }
    y += 5.5;
  });
  return y + 4;
}

function addMedicalRecordsSection(doc: jsPDF, title: string, category: string, records: MedicalRecord[], y: number): number {
  const items = records.filter((r) => r.category === category);
  if (items.length === 0) return y;
  y = addSectionTitle(doc, title, y);
  doc.setFontSize(9);
  items.forEach((item) => {
    if (y > 270) { doc.addPage(); y = HEADER_HEIGHT + 10; }
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(`• ${item.title}`, 18, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    if (item.record_date) doc.text(format(parseISO(item.record_date), "MMM d, yyyy"), 140, y);
    const d = item.details as Record<string, any>;
    if (d.status) { y += 4.5; doc.text(`  Status: ${d.status}`, 18, y); }
    if (d.dosage) { y += 4.5; doc.text(`  Dosage: ${d.dosage} — ${d.frequency || ""}`, 18, y); }
    if (d.notes) { y += 4.5; const lines = doc.splitTextToSize(`  Notes: ${d.notes}`, 170); doc.text(lines, 18, y); y += (lines.length - 1) * 4; }
    y += 6;
  });
  return y + 2;
}

function addFooter(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated by FurePET — For informational purposes only. Consult your veterinarian for medical advice.", 105, 290, { align: "center" });
    doc.text(`Page ${i} of ${pages}`, 196, 290, { align: "right" });
  }
}

export type ShareType = "full" | "vet" | "basics";

export function generatePetPdf(
  pet: Pet,
  records: MedicalRecord[],
  type: ShareType
): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  addHeader(doc, pet.pet_name);

  let y = HEADER_HEIGHT + 10;

  // Basics always included
  y = addBasicsSection(doc, pet, y);

  if (type === "basics") {
    addFooter(doc);
    return doc;
  }

  // Allergies (highlighted) — for vet and full
  y = addAllergySection(doc, records, y);

  // Vaccines
  y = addMedicalRecordsSection(doc, "Vaccine History", "vaccines", records, y);

  // Medications
  y = addMedicalRecordsSection(doc, "Current Medications", "medications", records, y);

  if (type === "full") {
    // Diagnoses
    y = addMedicalRecordsSection(doc, "Diagnoses", "diagnoses", records, y);
    // Surgeries
    y = addMedicalRecordsSection(doc, "Surgeries", "surgeries", records, y);
    // Behavioral
    y = addMedicalRecordsSection(doc, "Behavioral Issues", "behavioral", records, y);
    // Observations
    y = addMedicalRecordsSection(doc, "Observations", "observations", records, y);
  }

  addFooter(doc);
  return doc;
}

export async function sharePdf(doc: jsPDF, filename: string) {
  const blob = doc.output("blob");
  const file = new File([blob], filename, { type: "application/pdf" });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return true;
    } catch {
      // User cancelled or share failed, fall back to download
    }
  }

  // Fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}
