export type BillingInvoice = {
  id: string;
  number: string | null;
  status: string;
  currency: string;
  amountDue: number;
  amountPaid: number;
  total: number;
  created: string;
  periodStart: string | null;
  periodEnd: string | null;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  description: string | null;
};

export type BillingHistoryResponse = {
  invoices: BillingInvoice[];
};
