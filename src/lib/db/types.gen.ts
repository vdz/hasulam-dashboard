
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "cta_requests": {
                  Row: {
                    "created_at": string,"cta": Database["public"]['Enums']["cta_kind"],"event_id": string,"id": string,"idempotency_key": string,"payload": NonNullable<Json>,"requested_by": string,"status": Database["public"]['Enums']["cta_status"],"status_note": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"cta": Database["public"]['Enums']["cta_kind"],"event_id": string,"id"?: string,"idempotency_key": string,"payload"?: NonNullable<Json>,"requested_by": string,"status"?: Database["public"]['Enums']["cta_status"],"status_note"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"cta"?: Database["public"]['Enums']["cta_kind"],"event_id"?: string,"id"?: string,"idempotency_key"?: string,"payload"?: NonNullable<Json>,"requested_by"?: string,"status"?: Database["public"]['Enums']["cta_status"],"status_note"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "cta_requests_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "cta_requests_requested_by_fkey"
      columns: ["requested_by"]
isOneToOne: false
      referencedRelation: "people"
      referencedColumns: ["id"]
    }
                  ]
                },"drafts": {
                  Row: {
                    "approved_at": string | null,"approved_by": string | null,"body": string,"channel": string,"created_at": string,"cta_request_id": string | null,"event_id": string | null,"id": string,"recipient": string,"status": Database["public"]['Enums']["draft_status"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "approved_at"?: string | null,"approved_by"?: string | null,"body": string,"channel"?: string,"created_at"?: string,"cta_request_id"?: string | null,"event_id"?: string | null,"id"?: string,"recipient": string,"status"?: Database["public"]['Enums']["draft_status"],"updated_at"?: string
                  }
                  Update: {
                    "approved_at"?: string | null,"approved_by"?: string | null,"body"?: string,"channel"?: string,"created_at"?: string,"cta_request_id"?: string | null,"event_id"?: string | null,"id"?: string,"recipient"?: string,"status"?: Database["public"]['Enums']["draft_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "drafts_approved_by_fkey"
      columns: ["approved_by"]
isOneToOne: false
      referencedRelation: "people"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "drafts_cta_request_id_fkey"
      columns: ["cta_request_id"]
isOneToOne: false
      referencedRelation: "cta_requests"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "drafts_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                },"events": {
                  Row: {
                    "alert_t14_sent_at": string | null,"alert_t7_sent_at": string | null,"created_at": string,"ends_at": string | null,"feedback_summary": string | null,"has_food": boolean | null,"headcount_adults": number | null,"headcount_kids": number | null,"id": string,"invitation_status": string | null,"lessons_next_year": string | null,"location": string | null,"owner_person_id": string | null,"registration_status": string | null,"schedule_text": string | null,"starts_at": string,"theme": string | null,"title": string,"type": Database["public"]['Enums']["event_type"],"updated_at": string,"year": number
                  }
                  ComputedFields: never
                  Insert: {
                    "alert_t14_sent_at"?: string | null,"alert_t7_sent_at"?: string | null,"created_at"?: string,"ends_at"?: string | null,"feedback_summary"?: string | null,"has_food"?: boolean | null,"headcount_adults"?: number | null,"headcount_kids"?: number | null,"id": string,"invitation_status"?: string | null,"lessons_next_year"?: string | null,"location"?: string | null,"owner_person_id"?: string | null,"registration_status"?: string | null,"schedule_text"?: string | null,"starts_at": string,"theme"?: string | null,"title": string,"type": Database["public"]['Enums']["event_type"],"updated_at"?: string,"year": number
                  }
                  Update: {
                    "alert_t14_sent_at"?: string | null,"alert_t7_sent_at"?: string | null,"created_at"?: string,"ends_at"?: string | null,"feedback_summary"?: string | null,"has_food"?: boolean | null,"headcount_adults"?: number | null,"headcount_kids"?: number | null,"id"?: string,"invitation_status"?: string | null,"lessons_next_year"?: string | null,"location"?: string | null,"owner_person_id"?: string | null,"registration_status"?: string | null,"schedule_text"?: string | null,"starts_at"?: string,"theme"?: string | null,"title"?: string,"type"?: Database["public"]['Enums']["event_type"],"updated_at"?: string,"year"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "events_owner_person_id_fkey"
      columns: ["owner_person_id"]
isOneToOne: false
      referencedRelation: "people"
      referencedColumns: ["id"]
    }
                  ]
                },"history": {
                  Row: {
                    "event_id": string | null,"event_title": string,"id": string,"notes": string | null,"person_id": string | null,"person_name": string | null,"role": Database["public"]['Enums']["role_key"],"year": number
                  }
                  ComputedFields: never
                  Insert: {
                    "event_id"?: string | null,"event_title": string,"id"?: string,"notes"?: string | null,"person_id"?: string | null,"person_name"?: string | null,"role": Database["public"]['Enums']["role_key"],"year": number
                  }
                  Update: {
                    "event_id"?: string | null,"event_title"?: string,"id"?: string,"notes"?: string | null,"person_id"?: string | null,"person_name"?: string | null,"role"?: Database["public"]['Enums']["role_key"],"year"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "history_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "history_person_id_fkey"
      columns: ["person_id"]
isOneToOne: false
      referencedRelation: "people"
      referencedColumns: ["id"]
    }
                  ]
                },"people": {
                  Row: {
                    "created_at": string,"email": string | null,"id": string,"name": string,"whatsapp_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"email"?: string | null,"id"?: string,"name": string,"whatsapp_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"email"?: string | null,"id"?: string,"name"?: string,"whatsapp_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"person_roles": {
                  Row: {
                    "person_id": string,"role": Database["public"]['Enums']["role_key"]
                  }
                  ComputedFields: never
                  Insert: {
                    "person_id": string,"role": Database["public"]['Enums']["role_key"]
                  }
                  Update: {
                    "person_id"?: string,"role"?: Database["public"]['Enums']["role_key"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "person_roles_person_id_fkey"
      columns: ["person_id"]
isOneToOne: false
      referencedRelation: "people"
      referencedColumns: ["id"]
    }
                  ]
                },"task_templates": {
                  Row: {
                    "due_note": string | null,"due_offset_days": number | null,"event_type": Database["public"]['Enums']["event_type"],"id": string,"owner_role": Database["public"]['Enums']["role_key"] | null,"position": number,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "due_note"?: string | null,"due_offset_days"?: number | null,"event_type": Database["public"]['Enums']["event_type"],"id"?: string,"owner_role"?: Database["public"]['Enums']["role_key"] | null,"position": number,"title": string
                  }
                  Update: {
                    "due_note"?: string | null,"due_offset_days"?: number | null,"event_type"?: Database["public"]['Enums']["event_type"],"id"?: string,"owner_role"?: Database["public"]['Enums']["role_key"] | null,"position"?: number,"title"?: string
                  }
                  Relationships: [
                    
                  ]
                },"tasks": {
                  Row: {
                    "due_note": string | null,"due_offset_days": number | null,"event_id": string,"id": string,"notes": string | null,"owner_person_id": string | null,"owner_role": Database["public"]['Enums']["role_key"] | null,"position": number,"status": Database["public"]['Enums']["task_status"],"template_id": string | null,"title": string,"updated_at": string,"updated_by": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "due_note"?: string | null,"due_offset_days"?: number | null,"event_id": string,"id"?: string,"notes"?: string | null,"owner_person_id"?: string | null,"owner_role"?: Database["public"]['Enums']["role_key"] | null,"position": number,"status"?: Database["public"]['Enums']["task_status"],"template_id"?: string | null,"title": string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "due_note"?: string | null,"due_offset_days"?: number | null,"event_id"?: string,"id"?: string,"notes"?: string | null,"owner_person_id"?: string | null,"owner_role"?: Database["public"]['Enums']["role_key"] | null,"position"?: number,"status"?: Database["public"]['Enums']["task_status"],"template_id"?: string | null,"title"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "tasks_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "tasks_owner_person_id_fkey"
      columns: ["owner_person_id"]
isOneToOne: false
      referencedRelation: "people"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "tasks_template_id_fkey"
      columns: ["template_id"]
isOneToOne: false
      referencedRelation: "task_templates"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "tasks_updated_by_fkey"
      columns: ["updated_by"]
isOneToOne: false
      referencedRelation: "people"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "generate_tasks_for_event":
{ Args: { "p_event_id": string }; Returns: number
                           }
          }
          Enums: {
            "cta_kind": "request_headcount"|"ask_rav_theme"|"request_invitation"|"remind_team"|"content_prompt"|"shopping_list"|"record_debrief","cta_status": "queued"|"drafted"|"awaiting_yehuda"|"sent"|"done"|"failed","draft_status": "pending_approval"|"approved"|"rejected"|"sent","event_type": "feast"|"shabbat"|"experiential_meeting"|"festive_lesson"|"trip"|"birthday","role_key": "owner"|"operating_heads"|"kitchen"|"invitations"|"content"|"rav_liaison"|"kids_dept"|"buyer"|"chef"|"women_team"|"men_team"|"calendar_keeper","task_status": "todo"|"done"|"na"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "cta_kind": ["request_headcount", "ask_rav_theme", "request_invitation", "remind_team", "content_prompt", "shopping_list", "record_debrief"],"cta_status": ["queued", "drafted", "awaiting_yehuda", "sent", "done", "failed"],"draft_status": ["pending_approval", "approved", "rejected", "sent"],"event_type": ["feast", "shabbat", "experiential_meeting", "festive_lesson", "trip", "birthday"],"role_key": ["owner", "operating_heads", "kitchen", "invitations", "content", "rav_liaison", "kids_dept", "buyer", "chef", "women_team", "men_team", "calendar_keeper"],"task_status": ["todo", "done", "na"]
          }
        }
} as const
