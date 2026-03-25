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
      accessories: {
        Row: {
          company_id: string
          created_at: string
          description: string
          id: string
          no: number
          price: number
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description: string
          id?: string
          no?: number
          price?: number
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          no?: number
          price?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      benefits: {
        Row: {
          company_id: string
          created_at: string
          description: string
          id: string
          no: number
          price: number
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description: string
          id?: string
          no?: number
          price?: number
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          no?: number
          price?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      branches: {
        Row: {
          branch_id: string
          branch_name: string
          company_id: string
          created_at: string
          doc_prefix: string | null
          id: string
          no: number
          status: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          branch_name: string
          company_id: string
          created_at?: string
          doc_prefix?: string | null
          id?: string
          no?: never
          status?: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          branch_name?: string
          company_id?: string
          created_at?: string
          doc_prefix?: string | null
          id?: string
          no?: never
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      colors: {
        Row: {
          company_id: string
          created_at: string
          description: string
          hex_color: string
          id: string
          model_id: string | null
          no: number
          status: string
          sub_model_id: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description: string
          hex_color?: string
          id?: string
          model_id?: string | null
          no: number
          status?: string
          sub_model_id?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          hex_color?: string
          id?: string
          model_id?: string | null
          no?: number
          status?: string
          sub_model_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "colors_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colors_sub_model_id_fkey"
            columns: ["sub_model_id"]
            isOneToOne: false
            referencedRelation: "sub_models"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address1: string | null
          address2: string | null
          company_id: string
          created_at: string
          customer_id: string
          customer_type: string
          district: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          mobile_phone: string | null
          no: number
          postal_code: string | null
          province: string | null
          status: string
          surname_id: string | null
          tax_id: string
          telephone: string | null
          updated_at: string
        }
        Insert: {
          address1?: string | null
          address2?: string | null
          company_id: string
          created_at?: string
          customer_id: string
          customer_type?: string
          district?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          mobile_phone?: string | null
          no: number
          postal_code?: string | null
          province?: string | null
          status?: string
          surname_id?: string | null
          tax_id: string
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          address1?: string | null
          address2?: string | null
          company_id?: string
          created_at?: string
          customer_id?: string
          customer_type?: string
          district?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          mobile_phone?: string | null
          no?: number
          postal_code?: string | null
          province?: string | null
          status?: string
          surname_id?: string | null
          tax_id?: string
          telephone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_surname_id_fkey"
            columns: ["surname_id"]
            isOneToOne: false
            referencedRelation: "surnames"
            referencedColumns: ["id"]
          },
        ]
      }
      document_sequences: {
        Row: {
          last_number: number
          prefix: string
          year_month: string
        }
        Insert: {
          last_number?: number
          prefix: string
          year_month: string
        }
        Update: {
          last_number?: number
          prefix?: string
          year_month?: string
        }
        Relationships: []
      }
      engine_sizes: {
        Row: {
          company_id: string
          created_at: string
          description: string
          id: string
          no: number
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description: string
          id?: string
          no?: number
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          no?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      freebies: {
        Row: {
          company_id: string
          created_at: string
          description: string
          id: string
          no: number
          price: number
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description: string
          id?: string
          no?: number
          price?: number
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          no?: number
          price?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      models: {
        Row: {
          company_id: string
          created_at: string
          description: string
          id: string
          no: number
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description: string
          id?: string
          no?: number
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          no?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          branch_id: string | null
          company_id: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          status: string
          supervisor_id: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          branch_id?: string | null
          company_id: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          status?: string
          supervisor_id?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          branch_id?: string | null
          company_id?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          status?: string
          supervisor_id?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      reservation_activity_logs: {
        Row: {
          action: string
          action_label: string | null
          branch_id: string | null
          company_id: string
          created_at: string
          details: Json | null
          id: string
          performed_by: string
          performed_by_name: string | null
          reservation_id: string
        }
        Insert: {
          action: string
          action_label?: string | null
          branch_id?: string | null
          company_id: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by: string
          performed_by_name?: string | null
          reservation_id: string
        }
        Update: {
          action?: string
          action_label?: string | null
          branch_id?: string | null
          company_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by?: string
          performed_by_name?: string | null
          reservation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_activity_logs_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservation_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          assigned_user_id: string
          branch_id: string | null
          company_id: string
          id: string
          reservation_id: string
          stage: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          assigned_user_id: string
          branch_id?: string | null
          company_id: string
          id?: string
          reservation_id: string
          stage: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          assigned_user_id?: string
          branch_id?: string | null
          company_id?: string
          id?: string
          reservation_id?: string
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_assignments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservation_attachments: {
        Row: {
          company_id: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          reservation_id: string
          uploaded_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          reservation_id: string
          uploaded_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          reservation_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservation_attachments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          accessories: Json | null
          approval_remark: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          benefits: Json | null
          branch_id: string | null
          buyer_address: string | null
          buyer_id_card: string | null
          buyer_name: string | null
          buyer_phone: string | null
          cancel_approval_remark: string | null
          cancel_approval_status: string | null
          cancel_approved_at: string | null
          cancel_approved_by: string | null
          cancel_reason: string | null
          cancel_request_status: string | null
          cancel_requested_at: string | null
          cancel_requested_by: string | null
          cancel_review_remark: string | null
          cancel_review_status: string | null
          cancel_reviewed_at: string | null
          cancel_reviewed_by: string | null
          cashier_user_id: string | null
          cashier_user_name: string | null
          color: string | null
          company_id: string
          confirmation_method: string | null
          confirmation_otp: string | null
          confirmation_otp_expires_at: string | null
          confirmation_status: string | null
          confirmation_token: string | null
          confirmation_token_expires_at: string | null
          confirmed_at: string | null
          created_at: string
          created_by: string | null
          customer_address: string | null
          customer_email: string | null
          customer_id_card: string | null
          customer_name: string
          customer_phone: string | null
          customer_type: string
          deposit_amount: number | null
          discount: number | null
          document_number: string
          expected_delivery_date: string | null
          freebies: Json | null
          fuel_type: string | null
          id: string
          list_price: number | null
          model: string | null
          net_price: number | null
          review_remark: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submodel: string | null
          updated_at: string
          vehicle_type: string | null
        }
        Insert: {
          accessories?: Json | null
          approval_remark?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          benefits?: Json | null
          branch_id?: string | null
          buyer_address?: string | null
          buyer_id_card?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          cancel_approval_remark?: string | null
          cancel_approval_status?: string | null
          cancel_approved_at?: string | null
          cancel_approved_by?: string | null
          cancel_reason?: string | null
          cancel_request_status?: string | null
          cancel_requested_at?: string | null
          cancel_requested_by?: string | null
          cancel_review_remark?: string | null
          cancel_review_status?: string | null
          cancel_reviewed_at?: string | null
          cancel_reviewed_by?: string | null
          cashier_user_id?: string | null
          cashier_user_name?: string | null
          color?: string | null
          company_id: string
          confirmation_method?: string | null
          confirmation_otp?: string | null
          confirmation_otp_expires_at?: string | null
          confirmation_status?: string | null
          confirmation_token?: string | null
          confirmation_token_expires_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_id_card?: string | null
          customer_name: string
          customer_phone?: string | null
          customer_type?: string
          deposit_amount?: number | null
          discount?: number | null
          document_number: string
          expected_delivery_date?: string | null
          freebies?: Json | null
          fuel_type?: string | null
          id?: string
          list_price?: number | null
          model?: string | null
          net_price?: number | null
          review_remark?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submodel?: string | null
          updated_at?: string
          vehicle_type?: string | null
        }
        Update: {
          accessories?: Json | null
          approval_remark?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          benefits?: Json | null
          branch_id?: string | null
          buyer_address?: string | null
          buyer_id_card?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          cancel_approval_remark?: string | null
          cancel_approval_status?: string | null
          cancel_approved_at?: string | null
          cancel_approved_by?: string | null
          cancel_reason?: string | null
          cancel_request_status?: string | null
          cancel_requested_at?: string | null
          cancel_requested_by?: string | null
          cancel_review_remark?: string | null
          cancel_review_status?: string | null
          cancel_reviewed_at?: string | null
          cancel_reviewed_by?: string | null
          cashier_user_id?: string | null
          cashier_user_name?: string | null
          color?: string | null
          company_id?: string
          confirmation_method?: string | null
          confirmation_otp?: string | null
          confirmation_otp_expires_at?: string | null
          confirmation_status?: string | null
          confirmation_token?: string | null
          confirmation_token_expires_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_id_card?: string | null
          customer_name?: string
          customer_phone?: string | null
          customer_type?: string
          deposit_amount?: number | null
          discount?: number | null
          document_number?: string
          expected_delivery_date?: string | null
          freebies?: Json | null
          fuel_type?: string | null
          id?: string
          list_price?: number | null
          model?: string | null
          net_price?: number | null
          review_remark?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submodel?: string | null
          updated_at?: string
          vehicle_type?: string | null
        }
        Relationships: []
      }
      sales_team_members: {
        Row: {
          created_at: string
          id: string
          member_user_id: string
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_user_id: string
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          member_user_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "sales_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_teams: {
        Row: {
          branch_id: string
          company_id: string
          created_at: string
          id: string
          status: string
          supervisor_id: string
          team_name: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          company_id: string
          created_at?: string
          id?: string
          status?: string
          supervisor_id: string
          team_name: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          company_id?: string
          created_at?: string
          id?: string
          status?: string
          supervisor_id?: string
          team_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      standard_prices: {
        Row: {
          company_id: string
          created_at: string
          id: string
          model_id: string
          no: number
          price: number
          status: string
          sub_model_id: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          model_id: string
          no?: number
          price?: number
          status?: string
          sub_model_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          model_id?: string
          no?: number
          price?: number
          status?: string
          sub_model_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "standard_prices_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standard_prices_sub_model_id_fkey"
            columns: ["sub_model_id"]
            isOneToOne: false
            referencedRelation: "sub_models"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_models: {
        Row: {
          company_id: string
          created_at: string
          description: string
          id: string
          model_id: string
          no: number
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description: string
          id?: string
          model_id: string
          no?: number
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          model_id?: string
          no?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_models_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      surnames: {
        Row: {
          created_at: string
          description: string
          id: string
          no: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          no?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          no?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_approval_templates: {
        Row: {
          assigned_user_id: string
          company_id: string
          created_at: string
          id: string
          stage: string
          team_id: string
          updated_at: string
        }
        Insert: {
          assigned_user_id: string
          company_id: string
          created_at?: string
          id?: string
          stage: string
          team_id: string
          updated_at?: string
        }
        Update: {
          assigned_user_id?: string
          company_id?: string
          created_at?: string
          id?: string
          stage?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_approval_templates_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "sales_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_cancel_approval_templates: {
        Row: {
          assigned_user_id: string
          branch_id: string
          company_id: string
          created_at: string
          id: string
          stage: string
          team_id: string
          updated_at: string
        }
        Insert: {
          assigned_user_id: string
          branch_id: string
          company_id: string
          created_at?: string
          id?: string
          stage: string
          team_id: string
          updated_at?: string
        }
        Update: {
          assigned_user_id?: string
          branch_id?: string
          company_id?: string
          created_at?: string
          id?: string
          stage?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_cancel_approval_templates_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "sales_teams"
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
      vehicle_types: {
        Row: {
          company_id: string
          created_at: string
          description: string
          id: string
          no: number
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description: string
          id?: string
          no?: number
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          no?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_customer_id: { Args: { p_company_id: string }; Returns: string }
      generate_document_number: {
        Args: { p_branch_id: string; p_company_id: string }
        Returns: string
      }
      get_next_customer_no: { Args: { p_company_id: string }; Returns: number }
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "sale"
        | "cashier"
        | "sale_supervisor"
        | "sale_manager"
        | "it"
        | "user_admin"
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
      app_role: [
        "sale",
        "cashier",
        "sale_supervisor",
        "sale_manager",
        "it",
        "user_admin",
      ],
    },
  },
} as const
