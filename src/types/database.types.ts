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
      body_metrics: {
        Row: {
          belly: number | null
          bicep: number | null
          chest: number | null
          date: string
          forearm: number | null
          height: number
          hip: number | null
          shoulder: number | null
          thigh: number | null
          updated_at: string
          user_id: string
          waist: number | null
          weight: number
        }
        Insert: {
          belly?: number | null
          bicep?: number | null
          chest?: number | null
          date: string
          forearm?: number | null
          height: number
          hip?: number | null
          shoulder?: number | null
          thigh?: number | null
          updated_at?: string
          user_id?: string
          waist?: number | null
          weight: number
        }
        Update: {
          belly?: number | null
          bicep?: number | null
          chest?: number | null
          date?: string
          forearm?: number | null
          height?: number
          hip?: number | null
          shoulder?: number | null
          thigh?: number | null
          updated_at?: string
          user_id?: string
          waist?: number | null
          weight?: number
        }
        Relationships: []
      }
      exercises: {
        Row: {
          equipment: string | null
          id: string
          is_public: boolean
          metrics: Json
          muscle: string | null
          muscle_group: string
          name: string
          rest_seconds: number
          updated_at: string
          user_id: string
          variation: string | null
        }
        Insert: {
          equipment?: string | null
          id: string
          is_public?: boolean
          metrics?: Json
          muscle?: string | null
          muscle_group: string
          name: string
          rest_seconds?: number
          updated_at?: string
          user_id?: string
          variation?: string | null
        }
        Update: {
          equipment?: string | null
          id?: string
          is_public?: boolean
          metrics?: Json
          muscle?: string | null
          muscle_group?: string
          name?: string
          rest_seconds?: number
          updated_at?: string
          user_id?: string
          variation?: string | null
        }
        Relationships: []
      }
      goals: {
        Row: {
          completed_at: string | null
          created_at: string
          goaltype: Database["public"]["Enums"]["GOAL_TYPE"]
          id: string
          name: string
          target: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at: string
          goaltype: Database["public"]["Enums"]["GOAL_TYPE"]
          id: string
          name: string
          target: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          goaltype?: Database["public"]["Enums"]["GOAL_TYPE"]
          id?: string
          name?: string
          target?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_records: {
        Row: {
          exercise_id: string
          id: string
          prtype: string
          set_id: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          exercise_id: string
          id?: string
          prtype: string
          set_id: string
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          exercise_id?: string
          id?: string
          prtype?: string
          set_id?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_exercises: {
        Row: {
          exercise_id: string
          routine_id: string
          sequence_number: number
          sets: number | null
          value1: number | null
          value2: number | null
        }
        Insert: {
          exercise_id?: string
          routine_id: string
          sequence_number: number
          sets?: number | null
          value1?: number | null
          value2?: number | null
        }
        Update: {
          exercise_id?: string
          routine_id?: string
          sequence_number?: number
          sets?: number | null
          value1?: number | null
          value2?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "routine_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_exercises_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: true
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id: string
          name: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sets: {
        Row: {
          completed: boolean
          distance: number | null
          duration: number | null
          exercise_id: string
          id: string
          reps: number | null
          set_number: number | null
          set_type: Database["public"]["Enums"]["SET_TYPE"]
          updated_at: string
          user_id: string
          weight: number | null
          workout_id: string
        }
        Insert: {
          completed?: boolean
          distance?: number | null
          duration?: number | null
          exercise_id: string
          id: string
          reps?: number | null
          set_number?: number | null
          set_type?: Database["public"]["Enums"]["SET_TYPE"]
          updated_at?: string
          user_id?: string
          weight?: number | null
          workout_id: string
        }
        Update: {
          completed?: boolean
          distance?: number | null
          duration?: number | null
          exercise_id?: string
          id?: string
          reps?: number | null
          set_number?: number | null
          set_type?: Database["public"]["Enums"]["SET_TYPE"]
          updated_at?: string
          user_id?: string
          weight?: number | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sets_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      static_types: {
        Row: {
          id: number
          last_updated_timestamp: string
          rec_type: Database["public"]["Enums"]["STATIC_DATA"]
          value: string
        }
        Insert: {
          id?: number
          last_updated_timestamp?: string
          rec_type: Database["public"]["Enums"]["STATIC_DATA"]
          value: string
        }
        Update: {
          id?: number
          last_updated_timestamp?: string
          rec_type?: Database["public"]["Enums"]["STATIC_DATA"]
          value?: string
        }
        Relationships: []
      }
      steps: {
        Row: {
          date: string
          user_id: string
          value: number
        }
        Insert: {
          date: string
          user_id?: string
          value?: number
        }
        Update: {
          date?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          current_xp: number
          dob: string
          gender: string
          name: string
          role: Database["public"]["Enums"]["USER_ROLE"]
          updated_at: string
          user_id: string
          xp: number | null
        }
        Insert: {
          created_at?: string
          current_xp?: number
          dob: string
          gender: string
          name: string
          role?: Database["public"]["Enums"]["USER_ROLE"]
          updated_at?: string
          user_id?: string
          xp?: number | null
        }
        Update: {
          created_at?: string
          current_xp?: number
          dob?: string
          gender?: string
          name?: string
          role?: Database["public"]["Enums"]["USER_ROLE"]
          updated_at?: string
          user_id?: string
          xp?: number | null
        }
        Relationships: []
      }
      workouts: {
        Row: {
          completed: boolean | null
          date: string
          duration_sec: number | null
          end_time: string | null
          exercise_ids: Json | null
          id: string
          note: string | null
          start_time: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          date: string
          duration_sec?: number | null
          end_time?: string | null
          exercise_ids?: Json | null
          id: string
          note?: string | null
          start_time?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          completed?: boolean | null
          date?: string
          duration_sec?: number | null
          end_time?: string | null
          exercise_ids?: Json | null
          id?: string
          note?: string | null
          start_time?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      xp_log: {
        Row: {
          date: string | null
          delta: number | null
          id: string
          reason: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          date?: string | null
          delta?: number | null
          id: string
          reason?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          date?: string | null
          delta?: number | null
          id?: string
          reason?: string | null
          updated_at?: string | null
          user_id?: string
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
      GOAL_TYPE: "MEASUREMENT" | "WORKOUT_DAYS" | "EXERCISE"
      SET_TYPE: "WARMUP" | "MAIN" | "DROP"
      STATIC_DATA: "EQUIPMENT" | "MUSCLE" | "MUSCLE_GROUP"
      USER_ROLE: "ADMIN" | "USER"
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
      GOAL_TYPE: ["MEASUREMENT", "WORKOUT_DAYS", "EXERCISE"],
      SET_TYPE: ["WARMUP", "MAIN", "DROP"],
      STATIC_DATA: ["EQUIPMENT", "MUSCLE", "MUSCLE_GROUP"],
      USER_ROLE: ["ADMIN", "USER"],
    },
  },
} as const
