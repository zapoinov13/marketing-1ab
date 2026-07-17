export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          company: string | null;
          phone: string | null;
          telegram: string | null;
          level: string;
          xp: number;
          progress: number;
          avatar_url: string | null;
          is_admin: boolean;
          is_blocked: boolean;
          is_removed: boolean;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          company?: string | null;
          phone?: string | null;
          telegram?: string | null;
          level?: string;
          xp?: number;
          progress?: number;
          avatar_url?: string | null;
          is_admin?: boolean;
          is_blocked?: boolean;
          is_removed?: boolean;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          company?: string | null;
          phone?: string | null;
          telegram?: string | null;
          level?: string;
          xp?: number;
          progress?: number;
          avatar_url?: string | null;
          is_admin?: boolean;
          is_blocked?: boolean;
          is_removed?: boolean;
          email?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      stage_progress: {
        Row: {
          id: string;
          user_id: string;
          stage_id: string;
          status: "todo" | "active" | "done" | "locked";
          progress: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stage_id: string;
          status?: "todo" | "active" | "done" | "locked";
          progress?: number;
          updated_at?: string;
        };
        Update: {
          status?: "todo" | "active" | "done" | "locked";
          progress?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      checklist_items: {
        Row: {
          id: string;
          user_id: string;
          stage_id: string;
          item_key: string;
          done: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stage_id: string;
          item_key: string;
          done?: boolean;
          updated_at?: string;
        };
        Update: {
          done?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      homework_submissions: {
        Row: {
          id: string;
          user_id: string;
          task_id: string;
          status: "active" | "done" | "overdue";
          answer: string | null;
          submitted_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id: string;
          status?: "active" | "done" | "overdue";
          answer?: string | null;
          submitted_at?: string | null;
          updated_at?: string;
        };
        Update: {
          status?: "active" | "done" | "overdue";
          answer?: string | null;
          submitted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      lesson_content: {
        Row: {
          stage_id: string;
          title: string | null;
          duration: string | null;
          description: string | null;
          about: Json;
          video_embed_url: string | null;
          homework: string | null;
          documents: Json;
          links: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          stage_id: string;
          title?: string | null;
          duration?: string | null;
          description?: string | null;
          about?: Json;
          video_embed_url?: string | null;
          homework?: string | null;
          documents?: Json;
          links?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          stage_id?: string;
          title?: string | null;
          duration?: string | null;
          description?: string | null;
          about?: Json;
          video_embed_url?: string | null;
          homework?: string | null;
          documents?: Json;
          links?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
