export type MemberPaymentMethod = {
  id: string;
  type: string;
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
  isDefault: boolean;
};

export type PaymentMethodsResponse = {
  defaultPaymentMethodId: string | null;
  paymentMethods: MemberPaymentMethod[];
};
