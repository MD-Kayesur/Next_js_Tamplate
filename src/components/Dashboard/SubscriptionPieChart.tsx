"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useGetSubscriptionGraphQuery } from "@/redux/features/auth/paymentApi";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const COLORS = ["#10B981", "#F97316", "#6366F1"];

const SubscriptionPieChart: React.FC<{ period?: string }> = ({ period = "weekly" }) => {
  const [selectedPeriod, setSelectedPeriod] = React.useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >(period as any);

  const { data, isLoading, error } = useGetSubscriptionGraphQuery({ period: selectedPeriod });

  const summary = data?.summary;

  const active = summary?.activeSubscriptions ?? 0;
  const expired = summary?.expiredSubscriptions ?? 0;
  const total = summary?.totalSubscriptions ?? 0;
  const other = Math.max(0, total - active - expired);

  const pieData = [
    { name: "Active", value: active },
    { name: "Expired", value: expired },
  ];

  if (other > 0) pieData.push({ name: "Other", value: other });

  return (
    <div className="w-full bg-card p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Subscriptions Breakdown</h3>
        <div className="flex items-center gap-3">
          <div className="w-36">
            <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)}>
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">daily</SelectItem>
                <SelectItem value="weekly">weekly</SelectItem>
                <SelectItem value="monthly">monthly</SelectItem>
                <SelectItem value="yearly">yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
        <div className="flex flex-col p-2 rounded-md bg-muted-foreground/5">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="text-sm font-semibold">{summary?.totalSubscriptions ?? 0}</span>
        </div>
        <div className="flex flex-col p-2 rounded-md bg-green-50">
          <span className="text-xs text-muted-foreground">Active</span>
          <span className="text-sm font-semibold text-green-700">{summary?.activeSubscriptions ?? 0}</span>
        </div>
        <div className="flex flex-col p-2 rounded-md bg-red-50">
          <span className="text-xs text-muted-foreground">Expired</span>
          <span className="text-sm font-semibold text-red-700">{summary?.expiredSubscriptions ?? 0}</span>
        </div>
        <div className="flex flex-col p-2 rounded-md bg-muted-foreground/5">
          <span className="text-xs text-muted-foreground">Total Revenue</span>
          <span className="text-sm font-semibold">{summary?.totalRevenue ?? 0}</span>
        </div>
        <div className="flex flex-col p-2 rounded-md bg-muted-foreground/5">
          <span className="text-xs text-muted-foreground">Avg Revenue</span>
          <span className="text-sm font-semibold">{summary?.averageRevenue ?? 0}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="h-40 grid place-items-center">Loading...</div>
      ) : error ? (
        <div className="h-40 grid place-items-center text-destructive">Failed to load</div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={80}
                paddingAngle={2}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPieChart;
