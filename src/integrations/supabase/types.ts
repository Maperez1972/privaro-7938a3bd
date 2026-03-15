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
      api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          org_id: string
          permissions: string[]
          pipeline_ids: string[] | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          org_id: string
          permissions?: string[]
          pipeline_ids?: string[] | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          org_id?: string
          permissions?: string[]
          pipeline_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action_taken: string
          created_at: string
          entity_category: string
          entity_type: string
          event_type: string
          ibs_certification_hash: string | null
          ibs_certified_at: string | null
          ibs_evidence_id: string | null
          ibs_network: string | null
          ibs_status: string
          id: string
          metadata: Json
          org_id: string
          pipeline_id: string | null
          pipeline_stage: string | null
          processing_ms: number | null
          prompt_hash: string | null
          regulation_triggered: string | null
          severity: string
          source: string
          token_id: string | null
          user_id: string | null
        }
        Insert: {
          action_taken: string
          created_at?: string
          entity_category?: string
          entity_type: string
          event_type: string
          ibs_certification_hash?: string | null
          ibs_certified_at?: string | null
          ibs_evidence_id?: string | null
          ibs_network?: string | null
          ibs_status?: string
          id?: string
          metadata?: Json
          org_id: string
          pipeline_id?: string | null
          pipeline_stage?: string | null
          processing_ms?: number | null
          prompt_hash?: string | null
          regulation_triggered?: string | null
          severity?: string
          source?: string
          token_id?: string | null
          user_id?: string | null
        }
        Update: {
          action_taken?: string
          created_at?: string
          entity_category?: string
          entity_type?: string
          event_type?: string
          ibs_certification_hash?: string | null
          ibs_certified_at?: string | null
          ibs_evidence_id?: string | null
          ibs_network?: string | null
          ibs_status?: string
          id?: string
          metadata?: Json
          org_id?: string
          pipeline_id?: string | null
          pipeline_stage?: string | null
          processing_ms?: number | null
          prompt_hash?: string | null
          regulation_triggered?: string | null
          severity?: string
          source?: string
          token_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          attachment_name: string | null
          attachment_size: number | null
          attachment_type: string | null
          attachment_url: string | null
          audit_log_id: string | null
          content_preview: string | null
          content_protected: string
          conversation_id: string
          created_at: string
          id: string
          model_used: string | null
          org_id: string
          pii_detected: number
          pii_protected: number
          processing_ms: number | null
          role: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          attachment_url?: string | null
          audit_log_id?: string | null
          content_preview?: string | null
          content_protected: string
          conversation_id: string
          created_at?: string
          id?: string
          model_used?: string | null
          org_id: string
          pii_detected?: number
          pii_protected?: number
          processing_ms?: number | null
          role: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          attachment_url?: string | null
          audit_log_id?: string | null
          content_preview?: string | null
          content_protected?: string
          conversation_id?: string
          created_at?: string
          id?: string
          model_used?: string | null
          org_id?: string
          pii_detected?: number
          pii_protected?: number
          processing_ms?: number | null
          role?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_audit_log_id_fkey"
            columns: ["audit_log_id"]
            isOneToOne: false
            referencedRelation: "audit_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          is_archived: boolean
          last_message_at: string | null
          org_id: string
          pipeline_id: string
          title: string
          total_messages: number
          total_pii_detected: number
          total_pii_protected: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_archived?: boolean
          last_message_at?: string | null
          org_id: string
          pipeline_id: string
          title?: string
          total_messages?: number
          total_pii_detected?: number
          total_pii_protected?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_archived?: boolean
          last_message_at?: string | null
          org_id?: string
          pipeline_id?: string
          title?: string
          total_messages?: number
          total_pii_detected?: number
          total_pii_protected?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      ibs_sync_queue: {
        Row: {
          audit_log_id: string
          created_at: string
          error_detail: string | null
          ibs_payload_hash: string
          ibs_request_sent_at: string
          id: string
          last_retry_at: string | null
          max_retries: number
          org_id: string
          retry_count: number
          status: string
        }
        Insert: {
          audit_log_id: string
          created_at?: string
          error_detail?: string | null
          ibs_payload_hash: string
          ibs_request_sent_at?: string
          id?: string
          last_retry_at?: string | null
          max_retries?: number
          org_id: string
          retry_count?: number
          status?: string
        }
        Update: {
          audit_log_id?: string
          created_at?: string
          error_detail?: string | null
          ibs_payload_hash?: string
          ibs_request_sent_at?: string
          id?: string
          last_retry_at?: string | null
          max_retries?: number
          org_id?: string
          retry_count?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ibs_sync_queue_audit_log_id_fkey"
            columns: ["audit_log_id"]
            isOneToOne: false
            referencedRelation: "audit_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ibs_sync_queue_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_providers: {
        Row: {
          api_key_encrypted: string | null
          api_key_hint: string | null
          available_models: string[]
          base_url: string | null
          created_at: string
          created_by: string | null
          data_region: string
          display_name: string
          gdpr_compliant: boolean
          id: string
          is_active: boolean
          org_id: string
          provider: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          api_key_hint?: string | null
          available_models?: string[]
          base_url?: string | null
          created_at?: string
          created_by?: string | null
          data_region?: string
          display_name: string
          gdpr_compliant?: boolean
          id?: string
          is_active?: boolean
          org_id: string
          provider: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          api_key_hint?: string | null
          available_models?: string[]
          base_url?: string | null
          created_at?: string
          created_by?: string | null
          data_region?: string
          display_name?: string
          gdpr_compliant?: boolean
          id?: string
          is_active?: boolean
          org_id?: string
          provider?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "llm_providers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_notifications: {
        Row: {
          channel: string
          created_at: string
          id: string
          is_enabled: boolean
          last_triggered: string | null
          org_id: string
          recipients: string[]
          threshold: number | null
          type: string
          webhook_url: string | null
        }
        Insert: {
          channel?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_triggered?: string | null
          org_id: string
          recipients?: string[]
          threshold?: number | null
          type: string
          webhook_url?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_triggered?: string | null
          org_id?: string
          recipients?: string[]
          threshold?: number | null
          type?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_settings: {
        Row: {
          audit_retention_days: number
          billing_cycle_start: string
          enforce_gdpr_providers: boolean
          id: string
          org_id: string
          requests_limit: number
          requests_used: number
          require_2fa_for_dpo: boolean
          sandbox_enabled: boolean
          sandbox_log_events: boolean
          session_timeout_min: number
          token_ttl_days: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          audit_retention_days?: number
          billing_cycle_start?: string
          enforce_gdpr_providers?: boolean
          id?: string
          org_id: string
          requests_limit?: number
          requests_used?: number
          require_2fa_for_dpo?: boolean
          sandbox_enabled?: boolean
          sandbox_log_events?: boolean
          session_timeout_min?: number
          token_ttl_days?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          audit_retention_days?: number
          billing_cycle_start?: string
          enforce_gdpr_providers?: boolean
          id?: string
          org_id?: string
          requests_limit?: number
          requests_used?: number
          require_2fa_for_dpo?: boolean
          sandbox_enabled?: boolean
          sandbox_log_events?: boolean
          session_timeout_min?: number
          token_ttl_days?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          data_region: string
          gdpr_dpo_email: string | null
          id: string
          max_pipelines: number
          name: string
          plan: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_region?: string
          gdpr_dpo_email?: string | null
          id?: string
          max_pipelines?: number
          name: string
          plan?: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_region?: string
          gdpr_dpo_email?: string | null
          id?: string
          max_pipelines?: number
          name?: string
          plan?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      pii_detections: {
        Row: {
          audit_log_id: string
          confidence_score: number | null
          created_at: string
          detector_used: string | null
          end_offset: number | null
          entity_type: string
          id: string
          org_id: string
          original_length: number | null
          start_offset: number | null
          token_ref: string | null
        }
        Insert: {
          audit_log_id: string
          confidence_score?: number | null
          created_at?: string
          detector_used?: string | null
          end_offset?: number | null
          entity_type: string
          id?: string
          org_id: string
          original_length?: number | null
          start_offset?: number | null
          token_ref?: string | null
        }
        Update: {
          audit_log_id?: string
          confidence_score?: number | null
          created_at?: string
          detector_used?: string | null
          end_offset?: number | null
          entity_type?: string
          id?: string
          org_id?: string
          original_length?: number | null
          start_offset?: number | null
          token_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pii_detections_audit_log_id_fkey"
            columns: ["audit_log_id"]
            isOneToOne: false
            referencedRelation: "audit_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pii_detections_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          avg_latency_ms: number
          created_at: string
          id: string
          llm_endpoint_url: string | null
          llm_model: string
          llm_provider: string
          name: string
          org_id: string
          policy_set_id: string | null
          sector: string
          status: string
          total_leaked: number
          total_pii_detected: number
          total_pii_masked: number
          total_requests: number
          updated_at: string
        }
        Insert: {
          avg_latency_ms?: number
          created_at?: string
          id?: string
          llm_endpoint_url?: string | null
          llm_model?: string
          llm_provider?: string
          name: string
          org_id: string
          policy_set_id?: string | null
          sector?: string
          status?: string
          total_leaked?: number
          total_pii_detected?: number
          total_pii_masked?: number
          total_requests?: number
          updated_at?: string
        }
        Update: {
          avg_latency_ms?: number
          created_at?: string
          id?: string
          llm_endpoint_url?: string | null
          llm_model?: string
          llm_provider?: string
          name?: string
          org_id?: string
          policy_set_id?: string | null
          sector?: string
          status?: string
          total_leaked?: number
          total_pii_detected?: number
          total_pii_masked?: number
          total_requests?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipelines_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipelines_policy_set_id_fkey"
            columns: ["policy_set_id"]
            isOneToOne: false
            referencedRelation: "policy_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_rules: {
        Row: {
          action: string
          applies_to_providers: string[]
          category: string
          created_at: string
          custom_pattern: string | null
          entity_type: string
          id: string
          is_enabled: boolean
          org_id: string
          priority: number
          regulation_ref: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          action?: string
          applies_to_providers?: string[]
          category?: string
          created_at?: string
          custom_pattern?: string | null
          entity_type: string
          id?: string
          is_enabled?: boolean
          org_id: string
          priority?: number
          regulation_ref?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          action?: string
          applies_to_providers?: string[]
          category?: string
          created_at?: string
          custom_pattern?: string | null
          entity_type?: string
          id?: string
          is_enabled?: boolean
          org_id?: string
          priority?: number
          regulation_ref?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          org_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          is_active?: boolean
          org_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens_vault: {
        Row: {
          access_roles: string[]
          created_at: string
          encrypted_original: string
          encryption_key_id: string
          entity_type: string
          expires_at: string | null
          id: string
          is_reversible: boolean
          org_id: string
          pipeline_id: string | null
          reversal_count: number
          token_value: string
        }
        Insert: {
          access_roles?: string[]
          created_at?: string
          encrypted_original: string
          encryption_key_id: string
          entity_type: string
          expires_at?: string | null
          id?: string
          is_reversible?: boolean
          org_id: string
          pipeline_id?: string | null
          reversal_count?: number
          token_value: string
        }
        Update: {
          access_roles?: string[]
          created_at?: string
          encrypted_original?: string
          encryption_key_id?: string
          entity_type?: string
          expires_at?: string | null
          id?: string
          is_reversible?: boolean
          org_id?: string
          pipeline_id?: string | null
          reversal_count?: number
          token_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "tokens_vault_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokens_vault_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_org_id: { Args: { _user_id: string }; Returns: string }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "dpo" | "developer" | "viewer"
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
      app_role: ["admin", "dpo", "developer", "viewer"],
    },
  },
} as const
