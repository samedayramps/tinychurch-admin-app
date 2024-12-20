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
      calendar_events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          end_time: string
          frequency: Database["public"]["Enums"]["event_frequency"]
          id: string
          location: Json
          metadata: Json | null
          organization_id: string | null
          participant_groups: string[] | null
          participant_type: Database["public"]["Enums"]["participant_type"]
          participant_users: string[] | null
          recurring_days: number[] | null
          recurring_until: string | null
          start_date: string
          start_time: string
          status: Database["public"]["Enums"]["event_status"]
          timezone: string
          title: string
          updated_at: string
          use_different_address: boolean | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time: string
          frequency?: Database["public"]["Enums"]["event_frequency"]
          id?: string
          location?: Json
          metadata?: Json | null
          organization_id?: string | null
          participant_groups?: string[] | null
          participant_type?: Database["public"]["Enums"]["participant_type"]
          participant_users?: string[] | null
          recurring_days?: number[] | null
          recurring_until?: string | null
          start_date: string
          start_time: string
          status?: Database["public"]["Enums"]["event_status"]
          timezone?: string
          title: string
          updated_at?: string
          use_different_address?: boolean | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string
          frequency?: Database["public"]["Enums"]["event_frequency"]
          id?: string
          location?: Json
          metadata?: Json | null
          organization_id?: string | null
          participant_groups?: string[] | null
          participant_type?: Database["public"]["Enums"]["participant_type"]
          participant_users?: string[] | null
          recurring_days?: number[] | null
          recurring_until?: string | null
          start_date?: string
          start_time?: string
          status?: Database["public"]["Enums"]["event_status"]
          timezone?: string
          title?: string
          updated_at?: string
          use_different_address?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string | null
          error: string | null
          event_id: string | null
          id: string
          organization_id: string | null
          recipient_email: string
          status: string
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          event_id?: string | null
          id?: string
          organization_id?: string | null
          recipient_email: string
          status: string
        }
        Update: {
          created_at?: string | null
          error?: string | null
          event_id?: string | null
          id?: string
          organization_id?: string | null
          recipient_email?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      group_invitations: {
        Row: {
          created_at: string
          expires_at: string
          group_id: string
          id: string
          invited_by: string
          invited_user: string
          organization_id: string
          role: Database["public"]["Enums"]["group_member_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          group_id: string
          id?: string
          invited_by: string
          invited_user: string
          organization_id: string
          role?: Database["public"]["Enums"]["group_member_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          group_id?: string
          id?: string
          invited_by?: string
          invited_user?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["group_member_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_invitations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_invitations_invited_user_fkey"
            columns: ["invited_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      group_join_requests: {
        Row: {
          group_id: string
          id: string
          message: string | null
          processed_at: string | null
          processed_by: string | null
          requested_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          message?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          message?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_join_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_join_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_join_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          deleted_at: string | null
          group_id: string
          id: string
          joined_at: string | null
          notifications_enabled: boolean | null
          role: Database["public"]["Enums"]["group_member_role"]
          status: string
          user_id: string
        }
        Insert: {
          deleted_at?: string | null
          group_id: string
          id?: string
          joined_at?: string | null
          notifications_enabled?: boolean | null
          role?: Database["public"]["Enums"]["group_member_role"]
          status?: string
          user_id: string
        }
        Update: {
          deleted_at?: string | null
          group_id?: string
          id?: string
          joined_at?: string | null
          notifications_enabled?: boolean | null
          role?: Database["public"]["Enums"]["group_member_role"]
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          max_members: number | null
          name: string
          organization_id: string
          settings: Json | null
          type: Database["public"]["Enums"]["group_type"]
          updated_at: string | null
          visibility: Database["public"]["Enums"]["group_visibility"]
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          max_members?: number | null
          name: string
          organization_id: string
          settings?: Json | null
          type?: Database["public"]["Enums"]["group_type"]
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["group_visibility"]
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          max_members?: number | null
          name?: string
          organization_id?: string
          settings?: Json | null
          type?: Database["public"]["Enums"]["group_type"]
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["group_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "groups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body: string
          category: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          organization_id: string | null
          subject: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body: string
          category?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          subject: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          subject?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          error_message: string | null
          group_id: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          recipient_id: string | null
          resend_id: string | null
          scheduled_for: string | null
          sender_id: string
          sent_at: string | null
          status: Database["public"]["Enums"]["message_status"]
          subject: string
          updated_at: string | null
        }
        Insert: {
          body: string
          created_at?: string
          error_message?: string | null
          group_id?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          recipient_id?: string | null
          resend_id?: string | null
          scheduled_for?: string | null
          sender_id: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          subject: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          error_message?: string | null
          group_id?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          recipient_id?: string | null
          resend_id?: string | null
          scheduled_for?: string | null
          sender_id?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_settings: {
        Row: {
          created_at: string | null
          default_from_name: string | null
          default_reply_to: string | null
          default_send_time: string | null
          id: string
          notifications_enabled: boolean | null
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_from_name?: string | null
          default_reply_to?: string | null
          default_send_time?: string | null
          id?: string
          notifications_enabled?: boolean | null
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_from_name?: string | null
          default_reply_to?: string | null
          default_send_time?: string | null
          id?: string
          notifications_enabled?: boolean | null
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messaging_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
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
      organization_settings: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          key: string
          organization_id: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          key: string
          organization_id: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          key?: string
          organization_id?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          email_from: string
          email_settings: Json | null
          id: string
          name: string
          slug: string
          status: string | null
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
          email_from: string
          email_settings?: Json | null
          id?: string
          name: string
          slug: string
          status?: string | null
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
          email_from?: string
          email_settings?: Json | null
          id?: string
          name?: string
          slug?: string
          status?: string | null
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
          invitation_token: string | null
          invited_at: string | null
          is_active: boolean | null
          is_superadmin: boolean | null
          last_login: string | null
          last_name: string | null
          last_sign_in_at: string | null
          notification_preferences: Json | null
          phone: string | null
          status: Database["public"]["Enums"]["auth_status"] | null
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
          invitation_token?: string | null
          invited_at?: string | null
          is_active?: boolean | null
          is_superadmin?: boolean | null
          last_login?: string | null
          last_name?: string | null
          last_sign_in_at?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          status?: Database["public"]["Enums"]["auth_status"] | null
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
          invitation_token?: string | null
          invited_at?: string | null
          is_active?: boolean | null
          is_superadmin?: boolean | null
          last_login?: string | null
          last_name?: string | null
          last_sign_in_at?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          status?: Database["public"]["Enums"]["auth_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          details: string
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id: string
          metadata: Json | null
          organization_id: string | null
          severity: Database["public"]["Enums"]["audit_severity"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          details: string
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          severity?: Database["public"]["Enums"]["audit_severity"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          details?: string
          event_type?: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          severity?: Database["public"]["Enums"]["audit_severity"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_group_invitation: {
        Args: {
          invitation_id: string
          user_id: string
        }
        Returns: undefined
      }
      add_group_member: {
        Args: {
          p_group_id: string
          p_user_id: string
          p_role?: Database["public"]["Enums"]["group_member_role"]
        }
        Returns: string
      }
      aggregate_audit_metrics: {
        Args: {
          operation_name: string
          time_window?: unknown
        }
        Returns: {
          operation: string
          avg_time: number
          max_time: number
          total_count: number
          error_count: number
        }[]
      }
      akeys: {
        Args: {
          "": unknown
        }
        Returns: string[]
      }
      are_in_same_organization: {
        Args: {
          user_a: string
          user_b: string
        }
        Returns: boolean
      }
      avals: {
        Args: {
          "": unknown
        }
        Returns: string[]
      }
      check_current_user_superadmin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_superadmin_status: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      check_user_org_access: {
        Args: {
          org_id: string
        }
        Returns: boolean
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
      cleanup_old_audit_logs: {
        Args: {
          days_to_keep: number
        }
        Returns: number
      }
      each: {
        Args: {
          hs: unknown
        }
        Returns: Record<string, unknown>[]
      }
      get_user_organization: {
        Args: {
          user_id: string
        }
        Returns: Json
      }
      get_user_profile: {
        Args: {
          user_id: string
        }
        Returns: {
          id: string
          email: string
          is_superadmin: boolean
          is_active: boolean
        }[]
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
      is_in_same_organization: {
        Args: {
          target_user_id: string
        }
        Returns: boolean
      }
      is_invitation_active: {
        Args: {
          used_at: string
          expires_at: string
        }
        Returns: boolean
      }
      is_superadmin:
        | {
            Args: Record<PropertyKey, never>
            Returns: boolean
          }
        | {
            Args: {
              user_id: string
            }
            Returns: boolean
          }
      is_user_superadmin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      process_join_request: {
        Args: {
          p_request_id: string
          p_status: string
          p_processor_id: string
        }
        Returns: boolean
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
      update_resource_usage: {
        Args: {
          org_id: string
          resource: string
          usage_delta: number
        }
        Returns: undefined
      }
    }
    Enums: {
      activity_event_type:
        | "login"
        | "logout"
        | "profile_update"
        | "password_change"
        | "organization_join"
        | "organization_leave"
        | "role_change"
        | "invitation_sent"
        | "invitation_accepted"
        | "account_created"
        | "account_deleted"
        | "account_suspended"
        | "account_reactivated"
      audit_event_type:
        | "auth"
        | "data"
        | "system"
        | "security"
        | "performance"
        | "error"
        | "user_action"
        | "profile_update"
        | "role_change"
      audit_severity: "info" | "warning" | "error" | "critical"
      auth_status: "invited" | "active" | "suspended" | "inactive" | "deleted"
      event_frequency: "once" | "daily" | "weekly" | "monthly" | "yearly"
      event_status: "scheduled" | "cancelled" | "completed"
      group_member_role: "leader" | "member"
      group_type:
        | "ministry"
        | "small_group"
        | "committee"
        | "service_team"
        | "other"
      group_visibility: "public" | "private" | "hidden"
      invitation_status: "pending" | "accepted" | "rejected" | "cancelled"
      message_priority: "low" | "normal" | "high" | "urgent"
      message_status: "pending" | "sent" | "failed" | "scheduled" | "cancelled"
      message_type: "email" | "notification" | "announcement" | "alert"
      participant_type: "all" | "groups" | "individuals"
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
