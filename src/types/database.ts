export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      services: {
        Row: {
          id: string;
          name: string;
          description: string;
          features: string[];
          price: number;
          duration_minutes: number;
          category_id: string;
          paystack_link: string;
          popular: boolean;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          features: string[];
          price: number;
          duration_minutes: number;
          category_id: string;
          paystack_link: string;
          popular?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          features?: string[];
          price?: number;
          duration_minutes?: number;
          category_id?: string;
          paystack_link?: string;
          popular?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "service_categories";
            referencedColumns: ["id"];
          }
        ];
      };
      service_categories: {
        Row: {
          id: string;
          title: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          service_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          appointment_date: string;
          appointment_time: string;
          status: "pending" | "confirmed" | "completed" | "cancelled";
          payment_status: "pending" | "paid" | "failed" | "refunded";
          payment_reference: string | null;
          paystack_reference: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          appointment_date: string;
          appointment_time: string;
          status?: "pending" | "confirmed" | "completed" | "cancelled";
          payment_status?: "pending" | "paid" | "failed" | "refunded";
          payment_reference?: string | null;
          paystack_reference?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string;
          appointment_date?: string;
          appointment_time?: string;
          status?: "pending" | "confirmed" | "completed" | "cancelled";
          payment_status?: "pending" | "paid" | "failed" | "refunded";
          payment_reference?: string | null;
          paystack_reference?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey";
            columns: ["service_id"];
            referencedRelation: "services";
            referencedColumns: ["id"];
          }
        ];
      };
      transactions: {
        Row: {
          id: string;
          booking_id: string | null;
          paystack_reference: string;
          amount: number;
          currency: string;
          status: "success" | "failed" | "pending";
          customer_email: string;
          service_name: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          paystack_reference: string;
          amount: number;
          currency?: string;
          status: "success" | "failed" | "pending";
          customer_email: string;
          service_name: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          paystack_reference?: string;
          amount?: number;
          currency?: string;
          status?: "success" | "failed" | "pending";
          customer_email?: string;
          service_name?: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_booking_id_fkey";
            columns: ["booking_id"];
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          }
        ];
      };
      availability: {
        Row: {
          id: string;
          date: string;
          start_time: string;
          end_time: string;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          start_time: string;
          end_time: string;
          is_available?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          is_available?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      blocked_dates: {
        Row: {
          id: string;
          date: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          reason?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Service = Database["public"]["Tables"]["services"]["Row"];
export type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"];
export type ServiceCategory =
  Database["public"]["Tables"]["service_categories"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type TransactionInsert =
  Database["public"]["Tables"]["transactions"]["Insert"];
export type Availability = Database["public"]["Tables"]["availability"]["Row"];
export type BlockedDate = Database["public"]["Tables"]["blocked_dates"]["Row"];
export type BlockedDateInsert =
  Database["public"]["Tables"]["blocked_dates"]["Insert"];