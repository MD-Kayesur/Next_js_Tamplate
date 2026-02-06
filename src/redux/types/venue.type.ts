/* eslint-disable @typescript-eslint/no-explicit-any */
export type VenueStatus = "active" | "hold" | "suspend";

export interface Venue {
  id: string;
  venueName: string;
  status: VenueStatus;
  address: string;
  totalEarning: number;
  commission: number;
  photo: string;
  coverImage?: string;
}

/* Message */
export interface Message {
  id: string;
  name: string;
  email: string;
  opinion: string;
  createdAt: string;
  read?: boolean;
}

export type LoginResponse = {
  user: {
    userId: string; // Changed from id
    email: string;
    fullName: string;
    role: string;
    currentSubscription: any | null;
  };
  access_token: string; // Changed from accessToken
  refresh_token: string; // Added refresh_token
};

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  currentSubscription: any | null;
};

export type TAuth = {
  user: User | null;
  token: string | null;
};

/* Subscription Plan */

/* Subscription Plan */

export type Plan = {
  subscriptionPlanId: string; // Note: Changed from 'id' to 'subscriptionPlanId'
  planName: string; // Note: Changed from 'name' to 'planName'
  description: string;
  price: number;
  duration: number; // Note: Added 'duration' field
  features: string[];
  createdAt?: string;
  updatedAt?: string;
  // Removed: planType, status, isPopular as they're not in API response
};

export type PlanFormData = {
  planName: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
};

export interface Quote {
  id: string;
  quote: string;
  author: string;
  createdAt?: string;
}
/* Faq Category */

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category?: FAQCategory;
}

export interface FAQCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  faqs?: FAQ[];
}

export interface FAQFormData {
  question: string;
  answer: string;
  categoryId: string;
  categoryName?: string;
}

export interface FaqState {
  currentFaq: FAQ | null;
  isDialogOpen: {
    faq: boolean;
    category: boolean;
  };
}

/* Terms anagement type */
export interface TermCategory {
  id: string;
  title: string;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  keyPoints?: KeyPoint[]; // Optional as it might be loaded separately
}

export interface KeyPoint {
  id: string;
  point: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTermCategoryPayload {
  title: string;
  lastUpdated?: string; // Optional as we can default it on the backend
}

export interface CreateKeyPointPayload {
  point: string;
  categoryId: string;
}

/* Course  */

// src/redux/types/venue.type.ts
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  isPaid: boolean;
  category: string[];
  createdAt: string;
  updatedAt: string;
  modules?: IModule[];
}

export interface CourseFormData {
  title: string;
  description: string;
  category: string; // Comma-separated string for input
  isPaid: boolean;
}

export interface CourseState {
  searchTerm: string;
  filterPaid: "all" | "paid" | "free";
}
/* Module Type */

export interface IModule {
  id: string;
  title: string;
  description: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
  contents?: IModuleContent[];
}

export interface IModuleContent {
  id: string;
  title: string;
  url: string;
  duration: number;
  description: string;
  viewCount: number;
  tags: string[];
  moduleId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IModuleState {
  modules: IModule[];
  isLoading: boolean;
  error: string | null;
  currentModule: IModule | null;
  searchTerm: string;
  sortConfig: {
    field: keyof IModule;
    direction: "asc" | "desc";
  };
}

/* Content */

export interface Content {
  id: string;
  title: string;
  url: string; // or fileUrl if you prefer

  duration: number;
  description: string;
  tags: string[];
  moduleId: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
}

export interface Module {
  id: string;
  title: string;
  courseId: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

/* Notifications */
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

/* Payment */

// src/types/payment.ts
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: "SUCCESS" | "FAILED" | "PENDING" | "REFUNDED";
  transactionId: string;
  subscriptionId: string;
  createdAt: string;
  subscription: {
    id: string;
    userId: string;
    planId: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      fullName: string;
      email: string;
      phoneNumber: string;
    };
    plan: {
      id: string;
      name: string;
      description: string;
      price: number;
      features: string[];
      planType: string;
      status: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING" | "REFUNDED";

// New Subscription Types based on API response
export interface SubscriptionUser {
  userId: string;
  email: string;
  fullName: string;
  profilePictureUrl: string | null;
}

export interface SubscriptionPlan {
  subscriptionPlanId: string;
  planName: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
}

export interface Subscription {
  subscriptionId: string;
  userId: string;
  subscriptionPlanId: string;
  transactionId: string;
  startDate: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: SubscriptionUser;
  subscriptionPlan: SubscriptionPlan;
  status: "active" | "expired";
  daysRemaining: number;
}

export interface SubscriptionsResponse {
  total: number;
  activeCount: number;
  expiredCount: number;
  subscriptions: Subscription[];
}

export type SubscriptionStatusFilter = "all" | "active" | "expired";

/* Subscription Graph response */
export interface SubscriptionGraphDateRange {
  start: string;
  end: string;
}

export interface SubscriptionGraphSummary {
  totalSubscriptions: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  totalRevenue: number;
  averageRevenue: number;
}

export interface SubscriptionGraphDatum {
  period: string; // e.g., 2025-W04 or date
  count: number;
  revenue: number;
  active: number;
  expired: number;
}

export interface SubscriptionGraphResponse {
  period: string; // requested period grouping
  dateRange: SubscriptionGraphDateRange;
  summary: SubscriptionGraphSummary;
  timeSeriesData: SubscriptionGraphDatum[];
}

/* Admin/ user profile */
export interface IProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  photo: string | null;
  role: string;
  isSubscribed: boolean;
  subscriptions: ISubscription[];
  // progresses: any[];
  // FavoriteContents: any[];
  // notifications: any[];
  // SavedQuotes: any[];
  createdAt: string;
  updatedAt: string;
}

export interface ISubscription {
  id: string;
  userId: string;
  planId: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export type ProfileUpdatePayload = {
  fullName?: string;
  phoneNumber?: string;
  file?: File;
};

export type ProfileFormData = {
  fullName: string;
  phoneNumber: string;
  photo?: string | null;
  address?: string;
};

/* Update Content  */

// types/updates.ts
export interface UpcomingUpdate {
  id: string;
  title: string;
  description: string;
  releaseDate: string;
  contentType: "video" | "course";
  bannerImage?: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUpdateDto {
  title: string;
  description: string;
  releaseDate: string;
  contentType: "video" | "course";
  bannerImage?: File;
}
