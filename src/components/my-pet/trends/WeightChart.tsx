import { useState, useMemo } from "react";
import { format, subMonths, parseISO } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { PetWeight } from "@/hooks/usePetWeights";

type Range = "3M" | "6M" | "1Y" | "All";

interface Props {
  weights: PetWeight[];
}

export const WeightChart = ({ weights }: Props) => {
  const [range, setRange] = useState<Range>("All");

  const filtered = useMemo(() => {
    if (range === "All") return weights;
    const months = range === "3M" ? 3 : range === "6M" ? 6 : 12;
    const cutoff = subMonths(new Date(), months);
    return weights.filter((w) => parseISO(w.recorded_date) >= cutoff);
  }, [weights, range]);

  const chartData = filtered.map((w) => ({
    date: format(parseISO(w.recorded_date), "MMM d"),
    fullDate: format(parseISO(w.recorded_date), "PPP"),
    weight: Number(w.weight_value),
    unit: w.weight_unit,
  }));

  const ranges: Range[] = ["3M", "6M", "1Y", "All"];

  if (weights.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground rounded-xl bg-card border border-border">
        No weight entries yet. Tap "Add Weight" to get started.
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border p-4">
      {/* Range filter */}
      <div className="flex gap-1 mb-4">
        {ranges.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {chartData.length === 1 ? (
        <div className="flex flex-col items-center justify-center h-40 text-sm text-muted-foreground">
          <div className="text-2xl font-bold text-foreground mb-1">
            {chartData[0].weight} {chartData[0].unit}
          </div>
          <p>{chartData[0].fullDate}</p>
          <p className="mt-2 text-xs">Add more entries to see trends</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={40} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: 13,
              }}
              formatter={(value: number, _name: string, props: any) => [`${value} ${props.payload.unit}`, "Weight"]}
              labelFormatter={(_label: string, payload: any[]) => payload?.[0]?.payload?.fullDate ?? ""}
            />
            <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
