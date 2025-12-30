"use client";

import { useGetPaymentsQuery } from "@/redux/features/auth/paymentApi";
 import { useGetPlansQuery } from "@/redux/features/auth/planApi";
import { useGetUsersQuery } from "@/redux/features/auth/userApi";

const CalculateCard = () => {
  const { data: users } = useGetUsersQuery(undefined);
  const { data: plans } = useGetPlansQuery(undefined);
  const { data: subscriptionsData } = useGetPaymentsQuery("all");

  // Extract subscriptions array from the response
  const subscriptions = subscriptionsData?.subscriptions ?? [];
  
  const userCount = users?.length ?? 0;
  const planCount = plans?.length ?? 0;
  const paymentCount = subscriptions.length ?? 0;

  // Filter data created in last 30 days
  const getLast30DaysData = <T extends { createdAt?: string }>(
    data: T[] | undefined
  ) => {
    if (!data || !Array.isArray(data)) return [];
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    return data.filter((item) => {
      const createdDate = item.createdAt ? new Date(item.createdAt) : null;
      return createdDate && createdDate >= thirtyDaysAgo && createdDate <= now;
    });
  };

  const subscriptionsLast30 = getLast30DaysData(subscriptions);
  const usersLast30 = getLast30DaysData(users);
  const plansLast30 = getLast30DaysData(plans);

  // Calculate revenue from subscription plan prices
  const totalRevenueAll =
    subscriptions.reduce((sum, s) => sum + (s.subscriptionPlan?.price ?? 0), 0);
  const totalRevenue30 =
    subscriptionsLast30.reduce((sum, s) => sum + (s.subscriptionPlan?.price ?? 0), 0);

  // Percentage change between current period and previous period
  // Here current = last 30 days, total = all time, so previous = total - current
  // Return a formatted string with "increase" or "decrease"
  // const getChange = (current: number, total: number): string | undefined => {
  //   if (total === 0) return "No data";
  //   const previous = total - current;

  //   // Avoid division by zero or nonsensical values
  //   // if (previous === 0) return current > 0 ? "100% increase" : "No change";

  //   const diffPercent = ((current - previous) / previous) * 100;
  //   // const isIncrease = diffPercent > 0;
  //   // const formattedPercent = Math.abs(diffPercent).toFixed(1);

  //   // return isIncrease
  //   //   // ? `+${formattedPercent}% increase`
  //   //   // : `-${formattedPercent}% decrease`;
  // };

  // Average revenue per user all time and recent users
  const avgRevenueAll = userCount ? totalRevenueAll / userCount : 0;
  const avgRevenueRecent = usersLast30.length
    ? totalRevenue30 / usersLast30.length
    : 0;

  const getChange = (current: number, total: number): string | undefined => {
    if (total === 0) return "No data";
    const previous = total - current;
    const diffPercent = ((current - previous) / previous) * 100;
    return `${diffPercent >= 0 ? "+" : ""}${diffPercent.toFixed(1)}%`;
  };

  const statusData: Array<{
    title: string;
    amount: string;
    change: string | undefined;
    unit?: string;
  }> = [
    {
      title: "Total Revenue",
      amount: `$${totalRevenueAll.toFixed(2)} USD`,
      change: getChange(totalRevenue30, totalRevenueAll),
      // unit: `(${paymentCount} subscriptions total)`,
    },
    {
      title: "Registered Users",
      amount: `${userCount} total`,
      change: getChange(usersLast30.length, userCount),
      // unit: `${usersLast30.length} new this month`,
    },
    // {
    //   title: "Active Courses",
    //   amount: `${planCount} courses`,
    //   change: getChange(plansLast30.length, planCount),
    //   // unit: `${plansLast30.length} added recently`,
    // },
    {
      title: "Avg. Revenue",
      amount: `$${avgRevenueAll.toFixed(2)}`,
      change: getChange(avgRevenueRecent, avgRevenueAll),
      // unit: "based on recent activity",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {statusData.map((single) => (
        <div
          key={single.title}
          className="p-5 sm:p-7 bg-white rounded-2xl shadow-md flex flex-col justify-between "
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-base sm:text-lg text-[#484848] font-Robot">
              {single.title}
            </h1>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl sm:text-3xl font-semibold text-[var(--color-accent)] font-Robot tracking-[-0.68px]">
              {single.amount}
            </h2>
            {/* <p className="text-sm text-[var(--color-textRed)] font-Robot">
              {single.change} {single.unit && single.unit}
            </p> */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CalculateCard;

// "use client";

// import { useGetPaymentsQuery } from "@/redux/features/auth/paymentApi";
// import { useGetPlansQuery } from "@/redux/features/auth/planApi";
// import { useGetUsersQuery } from "@/redux/features/auth/userApi";

// const CalculateCard = () => {
//   const { data: users } = useGetUsersQuery(undefined);
//   const { data: plans } = useGetPlansQuery(undefined);
//   const { data: payments } = useGetPaymentsQuery();

//   const userCount = users?.length ?? 0;
//   const planCount = plans?.length ?? 0;
//   const paymentCount = payments?.length ?? 0;

//   // Helper: Filter last 30 days
//   const getLast30DaysData = <T extends { createdAt?: string }>(
//     data: T[] | undefined
//   ) => {
//     if (!data) return [];
//     const now = new Date();
//     const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 3));
//     return data.filter(
//       (item) => new Date(item.createdAt || "") >= thirtyDaysAgo
//     );
//   };

//   const paymentsLast30 = getLast30DaysData(payments);
//   const usersLast30 = getLast30DaysData(users);
//   const plansLast30 = getLast30DaysData(plans);

//   const totalAmountAll =
//     payments?.reduce((sum, p) => sum + (p.amount || 0), 0) ?? 0;
//   const totalAmount30 =
//     paymentsLast30?.reduce((sum, p) => sum + (p.amount || 0), 0) ?? 0;

//   const getChange = (current: number, total: number): string => {
//     if (total === 0 || current === total) return "0%";
//     const previous = total - current;
//     if (previous <= 0) return "+100%";
//     const diff = ((current - previous) / previous) * 100;
//     return `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`;
//   };

//   const statusData = [
//     {
//       title: "All Payments",
//       amount: `$${totalAmountAll.toFixed(2)} USD`,
//       change: getChange(totalAmount30, totalAmountAll),
//       unit:
//         "in the last 30 days " +
//         (paymentCount ? `(${paymentCount} payments)` : ""),
//     },
//     {
//       title: "Total Users",
//       amount: `${userCount} users`,
//       change: getChange(usersLast30.length, userCount),
//       unit: "new users this month",
//     },
//     {
//       title: "Total Courses",
//       amount: `${planCount} plans`,
//       change: getChange(plansLast30.length, planCount),
//       unit: "added recently",
//     },
//     {
//       title: "Average Revenue",
//       amount: `$${
//         userCount ? (totalAmountAll / userCount).toFixed(2) : "0"
//       } / user`,
//       change: getChange(
//         usersLast30.length ? totalAmount30 / usersLast30.length : 0,
//         userCount ? totalAmountAll / userCount : 0
//       ),
//       unit: "based on recent users",
//     },
//   ];

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
//       {statusData.map((single) => (
//         <div
//           key={single.title}
//           className="p-5 sm:p-7 bg-white rounded-2xl shadow-md flex flex-col justify-between"
//         >
//           {/* Top Row */}
//           <div className="flex items-center justify-between mb-2">
//             <h1 className="text-base sm:text-lg  text-[#484848] font-Robot">
//               {single.title}
//             </h1>
//           </div>

//           {/* Bottom Row */}
//           <div className="space-y-1">
//             <h2 className="text-xl sm:text-3xl font-semibold text-[var(--color-accent)] font-Robot tracking-[-0.68px]">
//               {single.amount}
//             </h2>
//             <p className="text-sm text-[var(--color-textRed)] font-Robot">
//               {single.change} {single.unit}
//             </p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default CalculateCard;
