export type PromotionStatus = "active" | "inactive" | "expired";

export type AdminPromotion = {
  id: string;
  code: string;
  description: string;
  discount: string;
  discountPercent: number;
  redemptions: number;
  maxRedemptions: number | null;
  expires: string;
  expiresAt: string | null;
  status: PromotionStatus;
  stripePromotionCodeId: string;
  assignedUserIds: string[];
  assignedUsers: Array<{ _id: string; email: string; name: string }>;
};

export type ListPromotionsResponse = {
  promotions: AdminPromotion[];
};

export type CreatePromotionPayload = {
  code: string;
  description: string;
  discountPercent: number;
  maxRedemptions?: number | null;
  expiresAt?: string | null;
  status?: "active" | "inactive";
  assignedUserIds?: string[];
};

export type UpdatePromotionPayload = {
  description?: string;
  status?: "active" | "inactive";
  assignedUserIds?: string[];
};
