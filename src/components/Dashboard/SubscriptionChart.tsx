/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";
import { useGetSubscriptionGraphQuery } from "@/redux/features/auth/paymentApi";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const SubscriptionChart: React.FC<{ period?: string }> = ({ period = "weekly" }) => {
  const [selectedPeriod, setSelectedPeriod] = React.useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >(period as any);

  const { data, isLoading, error } = useGetSubscriptionGraphQuery({ period: selectedPeriod });

  const series = React.useMemo(() => {
    if (!data?.timeSeriesData) return [];
    return data.timeSeriesData.map((item: any) => ({
      period: item.period,
      revenue: item.revenue ?? 0,
      count: item.count ?? 0,
    }));
  }, [data]);

  return (
    <div className="w-full bg-card p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Subscriptions ({selectedPeriod})</h3>
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        <div className="flex flex-col p-2 rounded-md bg-muted-foreground/5">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="text-sm font-semibold">{data?.summary?.totalSubscriptions ?? 0}</span>
        </div>
        <div className="flex flex-col p-2 rounded-md bg-green-50">
          <span className="text-xs text-muted-foreground">Active</span>
          <span className="text-sm font-semibold text-green-700">{data?.summary?.activeSubscriptions ?? 0}</span>
        </div>
        <div className="flex flex-col p-2 rounded-md bg-red-50">
          <span className="text-xs text-muted-foreground">Expired</span>
          <span className="text-sm font-semibold text-red-700">{data?.summary?.expiredSubscriptions ?? 0}</span>
        </div>
        <div className="flex flex-col p-2 rounded-md bg-muted-foreground/5">
          <span className="text-xs text-muted-foreground">Total Revenue</span>
          <span className="text-sm font-semibold">{data?.summary?.totalRevenue ?? 0}</span>
        </div>
        <div className="flex flex-col p-2 rounded-md bg-muted-foreground/5">
          <span className="text-xs text-muted-foreground">Avg Revenue</span>
          <span className="text-sm font-semibold">{data?.summary?.averageRevenue ?? 0}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="h-40 grid place-items-center">Loading...</div>
      ) : error ? (
        <div className="h-40 grid place-items-center text-destructive">Failed to load</div>
      ) : (
        <ChartContainer id="subscription-graph" config={{ revenue: { label: "Revenue", color: "#06b6d4" }, count: { label: "Count", color: "#6366f1" } }}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip content={<ChartTooltipContent />} />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="var(--color-revenue, #06b6d4)" strokeWidth={2} dot={{ r: 2 }} />
              <Line yAxisId="right" type="monotone" dataKey="count" stroke="var(--color-count, #6366f1)" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </div>
  );
};

export default SubscriptionChart;
