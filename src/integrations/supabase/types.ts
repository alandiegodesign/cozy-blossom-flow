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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      events: {
        Row: {
          banner_image: string | null
          created_at: string
          created_by: string
          date: string
          deleted_at: string | null
          description: string
          end_date: string | null
          end_time: string | null
          id: string
          is_visible: boolean
          location_address: string | null
          location_name: string | null
          map_image: string | null
          policies: Json | null
          tags: Json | null
          time: string
          title: string
          updated_at: string
        }
        Insert: {
          banner_image?: string | null
          created_at?: string
          created_by: string
          date: string
          deleted_at?: string | null
          description?: string
          end_date?: string | null
          end_time?: string | null
          id?: string
          is_visible?: boolean
          location_address?: string | null
          location_name?: string | null
          map_image?: string | null
          policies?: Json | null
          tags?: Json | null
          time?: string
          title: string
          updated_at?: string
        }
        Update: {
          banner_image?: string | null
          created_at?: string
          created_by?: string
          date?: string
          deleted_at?: string | null
          description?: string
          end_date?: string | null
          end_time?: string | null
          id?: string
          is_visible?: boolean
          location_address?: string | null
          location_name?: string | null
          map_image?: string | null
          policies?: Json | null
          tags?: Json | null
          time?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          quantity: number
          subtotal: number
          ticket_location_id: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          quantity?: number
          subtotal?: number
          ticket_location_id: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          quantity?: number
          subtotal?: number
          ticket_location_id?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_ticket_location_id_fkey"
            columns: ["ticket_location_id"]
            isOneToOne: false
            referencedRelation: "ticket_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string
          validated_at: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id: string
          validated_at?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cpf: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id: string
          user_type?: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      ticket_locations: {
        Row: {
          available_quantity: number
          color: string | null
          created_at: string
          description: string | null
          event_id: string
          id: string
          is_active: boolean
          is_sold_out: boolean
          location_type: string
          name: string
          price: number
          quantity: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          available_quantity?: number
          color?: string | null
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          is_active?: boolean
          is_sold_out?: boolean
          location_type: string
          name: string
          price?: number
          quantity?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          available_quantity?: number
          color?: string | null
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          is_active?: boolean
          is_sold_out?: boolean
          location_type?: string
          name?: string
          price?: number
          quantity?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_locations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrease_availability: {
        Args: { loc_id: string; qty: number }
        Returns: boolean
      }
      find_user_by_email_or_cpf: {
        Args: { p_identifier: string }
        Returns: {
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      get_email_by_cpf: { Args: { p_cpf: string }; Returns: string }
      get_producer_sales: {
        Args: { p_user_id: string }
        Returns: {
          buyer_id: string
          event_date: string
          event_id: string
          event_title: string
          item_id: string
          item_quantity: number
          item_subtotal: number
          item_unit_price: number
          location_name: string
          location_type: string
          order_created_at: string
          order_id: string
          order_status: string
          total_amount: number
        }[]
      }
      get_producer_tickets: {
        Args: { p_user_id: string }
        Returns: {
          buyer_cpf: string
          buyer_email: string
          buyer_id: string
          buyer_name: string
          buyer_phone: string
          event_date: string
          event_id: string
          event_title: string
          item_id: string
          item_quantity: number
          item_subtotal: number
          item_unit_price: number
          location_name: string
          location_type: string
          order_created_at: string
          order_id: string
          order_status: string
          order_updated_at: string
          total_amount: number
          validated_at: string
        }[]
      }
      transfer_order: {
        Args: {
          p_from_user_id: string
          p_order_id: string
          p_to_user_id: string
        }
        Returns: boolean
      }
      validate_order: {
        Args: { p_order_id: string; p_producer_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
