export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      orders: {
        Row: {
          address: string
          coupon_code: string | null
          created_at: string
          customer_name: string
          delivery_charge: number
          district: string
          email: string | null
          id: string
          items: Json
          payment_method: string
          phone: string
          status: string
          subtotal: number
          discount: number
          admin_note: string | null
          total: number
          tracking_id: string | null
          tracking_number: string | null
          courier_name: string | null
          timeline: Json | null
          status_history: Json | null
          order_number: string | null
        }
        Insert: {
          address: string
          coupon_code?: string | null
          created_at?: string
          customer_name: string
          delivery_charge?: number
          district: string
          email?: string | null
          id?: string
          items: Json
          payment_method?: string
          phone: string
          status?: string
          subtotal: number
          discount?: number
          admin_note?: string | null
          total: number
          tracking_id?: string | null
          tracking_number?: string | null
          courier_name?: string | null
          timeline?: Json | null
          status_history?: Json | null
          order_number?: string | null
        }
        Update: {
          address?: string
          coupon_code?: string | null
          created_at?: string
          customer_name?: string
          delivery_charge?: number
          district?: string
          email?: string | null
          id?: string
          items?: Json
          payment_method?: string
          phone?: string
          status?: string
          subtotal?: number
          discount?: number
          admin_note?: string | null
          total?: number
          tracking_id?: string | null
          tracking_number?: string | null
          courier_name?: string | null
          timeline?: Json | null
          status_history?: Json | null
          order_number?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          badge: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          images: string[]
          installation: string | null
          is_combo: boolean
          material: string | null
          name: string
          name_bn: string
          old_price: number | null
          price: number
          size: string | null
          stock: number
          slug: string | null
          landing_page_config: Json | null
          status: string | null
          inventory_threshold: number | null
          sku: string | null
          meta_title: string | null
          meta_description: string | null
        }
        Insert: {
          badge?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          installation?: string | null
          is_combo?: boolean
          material?: string | null
          name: string
          name_bn: string
          old_price?: number | null
          price: number
          size?: string | null
          stock?: number
          slug?: string | null
          landing_page_config?: Json | null
          status?: string | null
          inventory_threshold?: number | null
          sku?: string | null
          meta_title?: string | null
          meta_description?: string | null
        }
        Update: {
          badge?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          installation?: string | null
          is_combo?: boolean
          material?: string | null
          name?: string
          name_bn?: string
          old_price?: number | null
          price?: number
          size?: string | null
          stock?: number
          slug?: string | null
          landing_page_config?: Json | null
          status?: string | null
          inventory_threshold?: number | null
          sku?: string | null
          meta_title?: string | null
          meta_description?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          name_bn: string | null
          slug: string | null
          icon: string | null
          image: string | null
          description: string | null
          sort_order: number | null
          is_active: boolean
          parent_id: string | null
          meta_title: string | null
          meta_description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          name_bn?: string | null
          slug?: string | null
          icon?: string | null
          image?: string | null
          description?: string | null
          sort_order?: number | null
          is_active?: boolean
          parent_id?: string | null
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_bn?: string | null
          slug?: string | null
          icon?: string | null
          image?: string | null
          description?: string | null
          sort_order?: number | null
          is_active?: boolean
          parent_id?: string | null
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          id: string
          product_id: string
          type: string
          quantity: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          type: string
          quantity: number
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          type?: string
          quantity?: number
          note?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_name: string
          id: string
          image_url: string | null
          product_id: string | null
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_name: string
          id?: string
          image_url?: string | null
          product_id?: string | null
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          image_url?: string | null
          product_id?: string | null
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      abandoned_carts: {
        Row: {
          id: string
          session_id: string | null
          created_at: string
          updated_at: string
          customer_name: string | null
          phone: string | null
          email: string | null
          address: string | null
          items: Json
          total_amount: number
          is_recovered: boolean
          last_active: string
          source_page: string | null
        }
        Insert: {
          id?: string
          session_id?: string | null
          created_at?: string
          updated_at?: string
          customer_name?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          items: Json
          total_amount: number
          is_recovered?: boolean
          last_active?: string
          source_page?: string | null
        }
        Update: {
          id?: string
          session_id?: string | null
          created_at?: string
          updated_at?: string
          customer_name?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          items?: Json
          total_amount?: number
          is_recovered?: boolean
          last_active?: string
          source_page?: string | null
        }
        Relationships: []
      }
      visitor_sessions: {
        Row: {
          id: string
          session_id: string
          ip_address: string | null
          country: string | null
          city: string | null
          browser: string | null
          os: string | null
          device_type: string | null
          referrer: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          is_active: boolean
          last_active: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          ip_address?: string | null
          country?: string | null
          city?: string | null
          browser?: string | null
          os?: string | null
          device_type?: string | null
          referrer?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          is_active?: boolean
          last_active?: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          ip_address?: string | null
          country?: string | null
          city?: string | null
          browser?: string | null
          os?: string | null
          device_type?: string | null
          referrer?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          is_active?: boolean
          last_active?: string
          created_at?: string
        }
        Relationships: []
      }
      visitor_events: {
        Row: {
          id: string
          session_id: string
          event_type: string
          event_data: Json
          page_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          event_type: string
          event_data: Json
          page_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          event_type?: string
          event_data?: Json
          page_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          id: string
          session_id: string
          page_url: string
          page_title: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          page_url: string
          page_title?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          page_url?: string
          page_title?: string | null
          created_at?: string
        }
        Relationships: []
      }
      store_configs: {
        Row: {
          id: string
          value: Json
          updated_at: string
        }
        Insert: {
          id: string
          value?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      courier_configs: {
        Row: {
          id: string
          provider: string
          api_key: string | null
          is_enabled: boolean
          settings: Json
          updated_at: string
        }
        Insert: {
          id?: string
          provider: string
          api_key?: string | null
          is_enabled?: boolean
          settings: Json
          updated_at?: string
        }
        Update: {
          id?: string
          provider?: string
          api_key?: string | null
          is_enabled?: boolean
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          id: string
          code: string
          discount_type: string
          discount_amount: number
          min_order_amount: number | null
          max_discount_amount: number | null
          usage_limit: number | null
          usage_count: number
          expiry_date: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          discount_type: string
          discount_amount: number
          min_order_amount?: number | null
          max_discount_amount?: number | null
          usage_limit?: number | null
          usage_count?: number
          expiry_date?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          discount_type?: string
          discount_amount?: number
          min_order_amount?: number | null
          max_discount_amount?: number | null
          usage_limit?: number | null
          usage_count?: number
          expiry_date?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      blocked_ips: {
        Row: {
          id: string
          ip_address: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ip_address: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          ip_address?: string
          reason?: string | null
          created_at?: string
        }
        Relationships: []
      }
      blocked_numbers: {
        Row: {
          id: string
          phone: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          phone: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          phone?: string
          reason?: string | null
          created_at?: string
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          status: string
          last_login: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          phone?: string | null
          status?: string
          last_login?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string | null
          status?: string
          last_login?: string | null
          created_at?: string
        }
        Relationships: []
      }
      staff_activity_logs: {
        Row: {
          id: string
          staff_id: string
          staff_name: string
          role: string
          action_type: string
          description: string
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          staff_id: string
          staff_name: string
          role: string
          action_type: string
          description: string
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          staff_id?: string
          staff_name?: string
          role?: string
          action_type?: string
          description?: string
          ip_address?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }

    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "moderator" | "production" | "user" | "manager" | "customer_support" | "content_manager" | "inventory_manager"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "moderator", "production", "user", "manager", "customer_support", "content_manager", "inventory_manager"],
    },
  },
} as const
