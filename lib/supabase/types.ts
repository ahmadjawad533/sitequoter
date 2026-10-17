export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type GenericRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          labor_rate: number;
          markup_percent: number;
          min_margin_percent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          labor_rate?: number;
          markup_percent?: number;
          min_margin_percent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          labor_rate?: number;
          markup_percent?: number;
          min_margin_percent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      profiles: {
        Row: {
          id: string;
          company_id: string | null;
          name: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          company_id?: string | null;
          name: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          name?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      price_items: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          category: string;
          unit: string;
          unit_price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          category?: string;
          unit?: string;
          unit_price?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          category?: string;
          unit?: string;
          unit_price?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      customers: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          phone: string;
          address: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          phone: string;
          address: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          phone?: string;
          address?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      jobs: {
        Row: {
          id: string;
          company_id: string;
          customer_id: string | null;
          created_by: string | null;
          job_type: "repair" | "replacement" | "maintenance";
          notes: string;
          status: "draft" | "sent" | "approved" | "lost";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          customer_id?: string | null;
          created_by?: string | null;
          job_type: "repair" | "replacement" | "maintenance";
          notes?: string;
          status?: "draft" | "sent" | "approved" | "lost";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          customer_id?: string | null;
          created_by?: string | null;
          job_type?: "repair" | "replacement" | "maintenance";
          notes?: string;
          status?: "draft" | "sent" | "approved" | "lost";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      job_photos: {
        Row: {
          id: string;
          job_id: string;
          storage_path: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          storage_path: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          storage_path?: string;
          created_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      quotes: {
        Row: {
          id: string;
          job_id: string;
          company_id: string;
          status: "draft" | "sent" | "approved" | "lost";
          ai_raw_output: Json | null;
          subtotal: number;
          labor_total: number;
          total: number;
          public_token: string;
          sent_at: string | null;
          viewed_at: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          company_id: string;
          status?: "draft" | "sent" | "approved" | "lost";
          ai_raw_output?: Json | null;
          subtotal?: number;
          labor_total?: number;
          total?: number;
          public_token?: string;
          sent_at?: string | null;
          viewed_at?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          company_id?: string;
          status?: "draft" | "sent" | "approved" | "lost";
          ai_raw_output?: Json | null;
          subtotal?: number;
          labor_total?: number;
          total?: number;
          public_token?: string;
          sent_at?: string | null;
          viewed_at?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      quote_lines: {
        Row: {
          id: string;
          quote_id: string;
          price_item_id: string | null;
          description: string;
          qty: number;
          unit_price: number | null;
          line_total: number | null;
          is_ai_suggested: boolean;
          reason: string | null;
          confidence: "low" | "medium" | "high" | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          quote_id: string;
          price_item_id?: string | null;
          description: string;
          qty?: number;
          unit_price?: number | null;
          line_total?: number | null;
          is_ai_suggested?: boolean;
          reason?: string | null;
          confidence?: "low" | "medium" | "high" | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          quote_id?: string;
          price_item_id?: string | null;
          description?: string;
          qty?: number;
          unit_price?: number | null;
          line_total?: number | null;
          is_ai_suggested?: boolean;
          reason?: string | null;
          confidence?: "low" | "medium" | "high" | null;
          created_at?: string;
        };
        Relationships: GenericRelationship[];
      };
    };
    Views: Record<string, any>;
    Functions: Record<string, any>;
  };
};
