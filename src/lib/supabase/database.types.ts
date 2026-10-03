export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      leaderboard: {
        Row: {
          created_at: string
          finish_time: number
          id: string
          nitro_used: number
          pickups_collected: number
          player_name: string
          stunts_performed: number
        }
        Insert: {
          created_at?: string
          finish_time: number
          id?: string
          nitro_used?: number
          pickups_collected?: number
          player_name: string
          stunts_performed?: number
        }
        Update: {
          created_at?: string
          finish_time?: number
          id?: string
          nitro_used?: number
          pickups_collected?: number
          player_name?: string
          stunts_performed?: number
        }
        Relationships: []
      }
      master_obstacles: {
        Row: {
          created_at: string
          description: string
          duration: number
          icon: string
          id: string
          indonesian_name: string
          name: string
          speed_penalty: number
        }
        Insert: {
          created_at?: string
          description: string
          duration: number
          icon: string
          id: string
          indonesian_name: string
          name: string
          speed_penalty: number
        }
        Update: {
          created_at?: string
          description?: string
          duration?: number
          icon?: string
          id?: string
          indonesian_name?: string
          name?: string
          speed_penalty?: number
        }
        Relationships: []
      }
      master_pickups: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          indonesian_name: string
          name: string
          nitro_bonus: number
          rarity: string
          shield_duration: number
        }
        Insert: {
          created_at?: string
          description: string
          icon: string
          id: string
          indonesian_name: string
          name: string
          nitro_bonus?: number
          rarity?: string
          shield_duration?: number
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          indonesian_name?: string
          name?: string
          nitro_bonus?: number
          rarity?: string
          shield_duration?: number
        }
        Relationships: []
      }
      room_players: {
        Row: {
          color_scheme: string
          finish_time: number | null
          id: string
          is_host: boolean
          is_ready: boolean
          joined_at: string
          player_id: string
          player_name: string
          rank: number | null
          room_id: string
        }
        Insert: {
          color_scheme?: string
          finish_time?: number | null
          id?: string
          is_host?: boolean
          is_ready?: boolean
          joined_at?: string
          player_id: string
          player_name: string
          rank?: number | null
          room_id: string
        }
        Update: {
          color_scheme?: string
          finish_time?: number | null
          id?: string
          is_host?: boolean
          is_ready?: boolean
          joined_at?: string
          player_id?: string
          player_name?: string
          rank?: number | null
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          code: string
          created_at: string
          host_name: string
          id: string
          max_players: number
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          host_name: string
          id?: string
          max_players?: number
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          host_name?: string
          id?: string
          max_players?: number
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
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
