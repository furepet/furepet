import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getBreedsBySpecies } from "@/data/petBreeds";
import { cn } from "@/lib/utils";

type BreedComboboxProps = {
  species: string;
  value: string;
  onChange: (breed: string) => void;
};

export const BreedCombobox = ({ species, value, onChange }: BreedComboboxProps) => {
  const [open, setOpen] = useState(false);
  const breeds = useMemo(() => getBreedsBySpecies(species), [species]);

  return (
    <div>
      <Label>Breed</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="mt-1.5 w-full justify-between"
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value || "Select breed"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search breed..." />
            <CommandList>
              <CommandEmpty>No breed found.</CommandEmpty>
              <CommandGroup>
                {breeds.map((breed) => (
                  <CommandItem
                    key={breed}
                    value={breed}
                    onSelect={(selectedBreed) => {
                      const matchedBreed = breeds.find(
                        (option) => option.toLowerCase() === selectedBreed.toLowerCase(),
                      );

                      onChange(matchedBreed ?? "");
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === breed ? "opacity-100" : "opacity-0")} />
                    {breed}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
