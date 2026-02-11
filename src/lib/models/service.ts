export interface Service {
  id: string;
  name: string;
  description: string;
  features: string[];
  popular?: boolean;
  paystackLink: string;
  categoryId: string;
  price: number;
  durationMinutes: number;
}
