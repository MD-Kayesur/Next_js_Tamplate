"use client";

import { useGetPaymentsQuery } from "@/redux/features/auth/paymentApi";
import { useParams, useRouter } from "next/navigation";
import defaultAvatar from "@/assets/images/profile.png";
import Image from "next/image";
import { PaymentStatus } from "@/redux/types/venue.type";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import React from "react";
import Title from "@/components/reuseabelComponents/Title";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Type definitions
interface User {
  fullName: string;
  email: string;
  phoneNumber?: string;
}

interface Plan {
  name: string;
  price: number;
  interval?: string;
  features: string[];
}

interface Subscription {
  user: User;
  plan: Plan;
  startDate: string;
  endDate: string;
}

interface Payment {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  subscription: Subscription;
}

const STATUS_CONFIG: Record<
  PaymentStatus,
  { text: string; bg: string; textColor: string }
> = {
  SUCCESS: {
    text: "Success",
    bg: "bg-emerald-50",
    textColor: "text-emerald-700",
  },
  FAILED: {
    text: "Failed",
    bg: "bg-red-50",
    textColor: "text-red-700",
  },
  PENDING: {
    text: "Pending",
    bg: "bg-amber-50",
    textColor: "text-amber-700",
  },
  REFUNDED: {
    text: "Refunded",
    bg: "bg-purple-50",
    textColor: "text-purple-700",
  },
};

// Helper components
const LoadingState = () => (
  <div className="mx-auto space-y-6">
    <Skeleton className="h-10 w-1/3" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="max-w-6xl mx-auto p-6">
    <div className="flex flex-col items-center justify-center space-y-4 text-center h-[50vh]">
      <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
        <span className="text-2xl">!</span>
      </div>
      <h2 className="text-2xl font-bold">Payment Error</h2>
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);

const NotFoundState = () => (
  <ErrorState message="The payment you're looking for doesn't exist or may have been removed." />
);

const PaymentHeader = ({
  transactionId,
  status,
}: {
  transactionId: string;
  status: PaymentStatus;
}) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <Title title="Payment Details" />
      <p className="text-black font-semibold mt-2">
        Transaction ID: <span className="text-gray-600">{transactionId}</span>
      </p>
    </div>
    <Badge
      className={`${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].textColor} px-3 py-1 text-sm font-medium`}
    >
      {STATUS_CONFIG[status].text}
    </Badge>
  </div>
);

const UserInfoCard = ({ user }: { user: User }) => (
  <Card className="lg:col-span-1">
    <CardHeader>
      <CardTitle className="text-lg font-semibold">User Information</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center space-x-4">
        <Image
          src={defaultAvatar}
          alt={user.fullName}
          width={80}
          height={80}
          className="rounded-full border"
          priority
        />
        <div className="space-y-1">
          <p className="font-medium text-lg">{user.fullName}</p>
          <p className="text-muted-foreground">{user.email}</p>
          {user.phoneNumber && (
            <p className="text-muted-foreground">{user.phoneNumber}</p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const PaymentInfoCard = ({ payment }: { payment: Payment }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-semibold">
        Payment Information
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <InfoRow
        label="Amount"
        value={`${payment.amount.toLocaleString()} ${payment.currency}`}
      />
      <InfoRow
        label="Date"
        value={format(new Date(payment.createdAt), "MMM dd, yyyy HH:mm")}
      />
      <InfoRow label="Payment Method" value="Credit Card" />
      <InfoRow
        label="Invoice Number"
        value={`INV-${payment.transactionId.slice(0, 8).toUpperCase()}`}
      />
    </CardContent>
  </Card>
);

const SubscriptionInfoCard = ({
  subscription,
  currency,
}: {
  subscription: Subscription;
  currency: string;
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-semibold">
        Subscription Details
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <InfoRow label="Plan" value={subscription.plan.name} />
      <InfoRow
        label="Price"
        value={`${subscription.plan.price.toLocaleString()} ${currency}`}
      />
      <InfoRow label="Billing Cycle" value="Monthly" />
      <InfoRow
        label="Period"
        value={`${format(
          new Date(subscription.startDate),
          "MMM dd, yyyy"
        )} - ${format(new Date(subscription.endDate), "MMM dd, yyyy")}`}
      />
    </CardContent>
  </Card>
);

const PlanFeaturesCard = ({
  features,
  planName,
}: {
  features: string[];
  planName: string;
}) => (
  <Card className="lg:col-span-3">
    <CardHeader>
      <CardTitle className="text-lg font-semibold">Plan Features</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <FeatureItem key={index} feature={feature} planName={planName} />
        ))}
      </div>
    </CardContent>
  </Card>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const FeatureItem = ({
  feature,
  planName,
}: {
  feature: string;
  planName: string;
}) => (
  <div className="flex items-start gap-3">
    <span className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
    <div>
      <p className="font-medium">{feature}</p>
      <p className="text-sm text-muted-foreground">
        Included in {planName} plan
      </p>
    </div>
  </div>
);

export function PaymentDetails() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: payments, isLoading, isError } = useGetPaymentsQuery();

  const payment = payments?.find((p: Payment) => p.id === id);

  if (isLoading) return <LoadingState />;
  if (isError)
    return (
      <ErrorState message="Failed to load payment details. Please try again later." />
    );
  if (!payment) return <NotFoundState />;

  return (
    <div className="mx-auto space-y-6">
      <Button
        variant="outline"
        size="sm"
        className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] hover:text-white text-white transition-colors duration-200 mb-6 cursor-pointer"
        onClick={() => router.push("/admin/all-payment")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <PaymentHeader
        transactionId={payment.transactionId}
        status={payment.status}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UserInfoCard user={payment.subscription.user} />
        <PaymentInfoCard payment={payment} />
        <SubscriptionInfoCard
          subscription={payment.subscription}
          currency={payment.currency}
        />
        <PlanFeaturesCard
          features={payment.subscription.plan.features}
          planName={payment.subscription.plan.name}
        />
      </div>
    </div>
  );
}
