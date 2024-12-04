export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          category: Database["public"]["Enums"]["audit_category"]
          created_at: string | null
          description: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          organization_id: string | null
          severity: Database["public"]["Enums"]["audit_severity"] | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          category: Database["public"]["Enums"]["audit_category"]
          created_at?: string | null
          description: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id?: string | null
          severity?: Database["public"]["Enums"]["audit_severity"] | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          category?: Database["public"]["Enums"]["audit_category"]
          created_at?: string | null
          description?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id?: string | null
          severity?: Database["public"]["Enums"]["audit_severity"] | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_limits: {
        Row: {
          current_usage: number | null
          max_amount: number
          organization_id: string
          resource_type: string
        }
        Insert: {
          current_usage?: number | null
          max_amount: number
          organization_id: string
          resource_type: string
        }
        Update: {
          current_usage?: number | null
          max_amount?: number
          organization_id?: string
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_limits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          joined_date: string | null
          membership_number: string | null
          organization_id: string
          permissions: Json | null
          role: Database["public"]["Enums"]["user_role"]
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          joined_date?: string | null
          membership_number?: string | null
          organization_id: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          joined_date?: string | null
          membership_number?: string | null
          organization_id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_usage: {
        Row: {
          amount: number
          id: string
          organization_id: string | null
          resource_type: string
          timestamp: string | null
        }
        Insert: {
          amount: number
          id?: string
          organization_id?: string | null
          resource_type: string
          timestamp?: string | null
        }
        Update: {
          amount?: number
          id?: string
          organization_id?: string | null
          resource_type?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: Json | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          settings: Json | null
          slug: string
          timezone: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          address?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          settings?: Json | null
          slug: string
          timezone?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          address?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          settings?: Json | null
          slug?: string
          timezone?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          alternative_email: string | null
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          email: string
          first_name: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          is_superadmin: boolean | null
          language: string | null
          last_login: string | null
          last_name: string | null
          notification_preferences: Json | null
          phone: string | null
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          alternative_email?: string | null
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email: string
          first_name?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          is_superadmin?: boolean | null
          language?: string | null
          last_login?: string | null
          last_name?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          alternative_email?: string | null
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_superadmin?: boolean | null
          language?: string | null
          last_login?: string | null
          last_name?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      akeys: {
        Args: {
          "": unknown
        }
        Returns: string[]
      }
      avals: {
        Args: {
          "": unknown
        }
        Returns: string[]
      }
      citext:
        | {
            Args: {
              "": boolean
            }
            Returns: string
          }
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
      citext_hash: {
        Args: {
          "": string
        }
        Returns: number
      }
      citextin: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      citextout: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      citextrecv: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      citextsend: {
        Args: {
          "": string
        }
        Returns: string
      }
      each: {
        Args: {
          hs: unknown
        }
        Returns: Record<string, unknown>[]
      }
      ghstore_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ghstore_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ghstore_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ghstore_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      ghstore_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hstore:
        | {
            Args: {
              "": string[]
            }
            Returns: unknown
          }
        | {
            Args: {
              "": Record<string, unknown>
            }
            Returns: unknown
          }
      hstore_hash: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      hstore_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hstore_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hstore_recv: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hstore_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      hstore_subscript_handler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hstore_to_array: {
        Args: {
          "": unknown
        }
        Returns: string[]
      }
      hstore_to_json: {
        Args: {
          "": unknown
        }
        Returns: Json
      }
      hstore_to_json_loose: {
        Args: {
          "": unknown
        }
        Returns: Json
      }
      hstore_to_jsonb: {
        Args: {
          "": unknown
        }
        Returns: Json
      }
      hstore_to_jsonb_loose: {
        Args: {
          "": unknown
        }
        Returns: Json
      }
      hstore_to_matrix: {
        Args: {
          "": unknown
        }
        Returns: string[]
      }
      hstore_version_diag: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      log_audit_event:
        | {
            Args: {
              p_category: Database["public"]["Enums"]["audit_category"]
              p_action: string
              p_organization_id: string
              p_actor_id: string
              p_description: string
              p_metadata?: Json
              p_severity?: Database["public"]["Enums"]["audit_severity"]
            }
            Returns: string
          }
        | {
            Args: {
              p_category: string
              p_action: string
              p_actor_id: string
              p_description: string
              p_metadata?: Json
              p_severity?: string
            }
            Returns: string
          }
        | {
            Args: {
              p_category: string
              p_action: string
              p_organization_id: string
              p_actor_id: string
              p_description: string
              p_metadata?: Json
              p_severity?: string
            }
            Returns: string
          }
      manage_impersonation: {
        Args: {
          target_user_id: string
          action: string
        }
        Returns: Json
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: string[]
      }
      skeys: {
        Args: {
          "": unknown
        }
        Returns: string[]
      }
      svals: {
        Args: {
          "": unknown
        }
        Returns: string[]
      }
    }
    Enums: {
      audit_category: "auth" | "organization" | "member" | "security" | "system"
      audit_severity: "info" | "notice" | "warning" | "alert" | "critical"
      user_role: "admin" | "staff" | "ministry_leader" | "member" | "visitor"
      visibility_level: "public" | "members_only" | "staff_only" | "private"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
