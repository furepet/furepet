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
      allergies: {
        Row: {
          allergen: string
          created_at: string
          date_identified: string | null
          id: string
          notes: string | null
          pet_id: string
          reaction: string | null
          severity: string | null
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allergen?: string
          created_at?: string
          date_identified?: string | null
          id?: string
          notes?: string | null
          pet_id: string
          reaction?: string | null
          severity?: string | null
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allergen?: string
          created_at?: string
          date_identified?: string | null
          id?: string
          notes?: string | null
          pet_id?: string
          reaction?: string | null
          severity?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "allergies_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      behavioral_issues: {
        Row: {
          created_at: string
          first_noticed: string | null
          id: string
          issue: string
          notes: string | null
          pet_id: string
          severity: string | null
          status: string
          treatment_plan: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_noticed?: string | null
          id?: string
          issue?: string
          notes?: string | null
          pet_id: string
          severity?: string | null
          status?: string
          treatment_plan?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_noticed?: string | null
          id?: string
          issue?: string
          notes?: string | null
          pet_id?: string
          severity?: string | null
          status?: string
          treatment_plan?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "behavioral_issues_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      breed_weight_ranges: {
        Row: {
          avg_weight_lbs: number
          breed: string
          id: string
          max_weight_lbs: number
          min_weight_lbs: number
          species: string
        }
        Insert: {
          avg_weight_lbs: number
          breed: string
          id?: string
          max_weight_lbs: number
          min_weight_lbs: number
          species: string
        }
        Update: {
          avg_weight_lbs?: number
          breed?: string
          id?: string
          max_weight_lbs?: number
          min_weight_lbs?: number
          species?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          pet_id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          pet_id: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          pet_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnoses: {
        Row: {
          created_at: string
          date_diagnosed: string | null
          diagnosing_vet: string | null
          diagnosis_name: string
          id: string
          notes: string | null
          pet_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_diagnosed?: string | null
          diagnosing_vet?: string | null
          diagnosis_name?: string
          id?: string
          notes?: string | null
          pet_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_diagnosed?: string | null
          diagnosing_vet?: string | null
          diagnosis_name?: string
          id?: string
          notes?: string | null
          pet_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnoses_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          pet_id: string
          phone: string | null
          priority: number
          relationship: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          pet_id: string
          phone?: string | null
          priority?: number
          relationship?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          pet_id?: string
          phone?: string | null
          priority?: number
          relationship?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_documents: {
        Row: {
          created_at: string
          extracted_data: Json | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          pet_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          extracted_data?: Json | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          pet_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          extracted_data?: Json | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          pet_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_documents_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          category: string
          created_at: string
          details: Json
          id: string
          pet_id: string
          record_date: string | null
          source_document_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          details?: Json
          id?: string
          pet_id: string
          record_date?: string | null
          source_document_id?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          details?: Json
          id?: string
          pet_id?: string
          record_date?: string | null
          source_document_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          medication_name: string
          notes: string | null
          pet_id: string
          prescribing_vet: string | null
          refill_date: string | null
          refill_reminder_enabled: boolean
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          medication_name?: string
          notes?: string | null
          pet_id: string
          prescribing_vet?: string | null
          refill_date?: string | null
          refill_reminder_enabled?: boolean
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          medication_name?: string
          notes?: string | null
          pet_id?: string
          prescribing_vet?: string | null
          refill_date?: string | null
          refill_reminder_enabled?: boolean
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      memorial: {
        Row: {
          created_at: string
          favorite_memory: string | null
          id: string
          message_to_pet: string | null
          pet_id: string
          photo_urls: string[] | null
          updated_at: string
          user_id: string
          what_made_special: string | null
        }
        Insert: {
          created_at?: string
          favorite_memory?: string | null
          id?: string
          message_to_pet?: string | null
          pet_id: string
          photo_urls?: string[] | null
          updated_at?: string
          user_id: string
          what_made_special?: string | null
        }
        Update: {
          created_at?: string
          favorite_memory?: string | null
          id?: string
          message_to_pet?: string | null
          pet_id?: string
          photo_urls?: string[] | null
          updated_at?: string
          user_id?: string
          what_made_special?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memorial_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: true
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          enabled: boolean
          groomer_reminders: boolean
          id: string
          medication_reminders: boolean
          observation_followups: boolean
          quiet_hours_end: string
          quiet_hours_start: string
          updated_at: string
          user_id: string
          vaccine_reminders: boolean
          vet_checkup_reminders: boolean
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          groomer_reminders?: boolean
          id?: string
          medication_reminders?: boolean
          observation_followups?: boolean
          quiet_hours_end?: string
          quiet_hours_start?: string
          updated_at?: string
          user_id: string
          vaccine_reminders?: boolean
          vet_checkup_reminders?: boolean
        }
        Update: {
          created_at?: string
          enabled?: boolean
          groomer_reminders?: boolean
          id?: string
          medication_reminders?: boolean
          observation_followups?: boolean
          quiet_hours_end?: string
          quiet_hours_start?: string
          updated_at?: string
          user_id?: string
          vaccine_reminders?: boolean
          vet_checkup_reminders?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string
          created_at: string
          id: string
          pet_id: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body: string
          created_at?: string
          id?: string
          pet_id?: string | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string
          created_at?: string
          id?: string
          pet_id?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      observations: {
        Row: {
          body_location: string | null
          created_at: string
          date_first_noticed: string | null
          follow_up_date: string | null
          id: string
          notes: string | null
          pet_id: string
          photo_url: string | null
          size_description: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body_location?: string | null
          created_at?: string
          date_first_noticed?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          pet_id: string
          photo_url?: string | null
          size_description?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body_location?: string | null
          created_at?: string
          date_first_noticed?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          pet_id?: string
          photo_url?: string | null
          size_description?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "observations_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_measurements: {
        Row: {
          category: string
          created_at: string
          custom_category: string | null
          id: string
          measurement_unit: string
          measurement_value: number
          pet_id: string
          recorded_date: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          custom_category?: string | null
          id?: string
          measurement_unit?: string
          measurement_value: number
          pet_id: string
          recorded_date?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          custom_category?: string | null
          id?: string
          measurement_unit?: string
          measurement_value?: number
          pet_id?: string
          recorded_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_measurements_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_weights: {
        Row: {
          created_at: string
          id: string
          note: string | null
          pet_id: string
          recorded_date: string
          user_id: string
          weight_unit: string
          weight_value: number
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          pet_id: string
          recorded_date?: string
          user_id: string
          weight_unit?: string
          weight_value: number
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          pet_id?: string
          recorded_date?: string
          user_id?: string
          weight_unit?: string
          weight_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "pet_weights_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          breed: string | null
          breed_description: string | null
          created_at: string
          date_of_birth: string | null
          date_of_passing: string | null
          deceased_at: string | null
          has_insurance: boolean
          id: string
          insurance_company: string | null
          is_deceased: boolean
          is_premium: boolean
          memorial_memories: Json | null
          memorial_photos: string[] | null
          microchip_number: string | null
          neuter_spay_date: string | null
          neuter_spay_status: string
          nickname: string | null
          pet_name: string
          photo_url: string | null
          policy_number: string | null
          species: string
          status: string
          together_since: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          breed?: string | null
          breed_description?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_of_passing?: string | null
          deceased_at?: string | null
          has_insurance?: boolean
          id?: string
          insurance_company?: string | null
          is_deceased?: boolean
          is_premium?: boolean
          memorial_memories?: Json | null
          memorial_photos?: string[] | null
          microchip_number?: string | null
          neuter_spay_date?: string | null
          neuter_spay_status?: string
          nickname?: string | null
          pet_name: string
          photo_url?: string | null
          policy_number?: string | null
          species?: string
          status?: string
          together_since?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          breed?: string | null
          breed_description?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_of_passing?: string | null
          deceased_at?: string | null
          has_insurance?: boolean
          id?: string
          insurance_company?: string | null
          is_deceased?: boolean
          is_premium?: boolean
          memorial_memories?: Json | null
          memorial_photos?: string[] | null
          microchip_number?: string | null
          neuter_spay_date?: string | null
          neuter_spay_status?: string
          nickname?: string | null
          pet_name?: string
          photo_url?: string | null
          policy_number?: string | null
          species?: string
          status?: string
          together_since?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          deleted_at: string | null
          first_name: string
          id: string
          onboarding_completed: boolean
          stripe_customer_id: string | null
          subscription_status: string
          unit_preference: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          first_name?: string
          id?: string
          onboarding_completed?: boolean
          stripe_customer_id?: string | null
          subscription_status?: string
          unit_preference?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          first_name?: string
          id?: string
          onboarding_completed?: boolean
          stripe_customer_id?: string | null
          subscription_status?: string
          unit_preference?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      surgeries: {
        Row: {
          created_at: string
          date: string | null
          id: string
          outcome_notes: string | null
          pet_id: string
          procedure_name: string
          reason: string | null
          surgeon_clinic: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          id?: string
          outcome_notes?: string | null
          pet_id: string
          procedure_name?: string
          reason?: string | null
          surgeon_clinic?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string | null
          id?: string
          outcome_notes?: string | null
          pet_id?: string
          procedure_name?: string
          reason?: string | null
          surgeon_clinic?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "surgeries_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccines: {
        Row: {
          administering_vet: string | null
          created_at: string
          date_administered: string | null
          id: string
          lot_number: string | null
          next_due_date: string | null
          notes: string | null
          pet_id: string
          updated_at: string
          user_id: string
          vaccine_name: string
        }
        Insert: {
          administering_vet?: string | null
          created_at?: string
          date_administered?: string | null
          id?: string
          lot_number?: string | null
          next_due_date?: string | null
          notes?: string | null
          pet_id: string
          updated_at?: string
          user_id: string
          vaccine_name?: string
        }
        Update: {
          administering_vet?: string | null
          created_at?: string
          date_administered?: string | null
          id?: string
          lot_number?: string | null
          next_due_date?: string | null
          notes?: string | null
          pet_id?: string
          updated_at?: string
          user_id?: string
          vaccine_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccines_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      vapid_keys: {
        Row: {
          created_at: string
          id: number
          private_key: string
          public_key: string
        }
        Insert: {
          created_at?: string
          id?: number
          private_key: string
          public_key: string
        }
        Update: {
          created_at?: string
          id?: number
          private_key?: string
          public_key?: string
        }
        Relationships: []
      }
      village_daycare: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          facility_name: string
          favorite_caretaker: string | null
          friends: string[] | null
          id: string
          notes: string | null
          pet_id: string
          phone: string | null
          started_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          facility_name?: string
          favorite_caretaker?: string | null
          friends?: string[] | null
          id?: string
          notes?: string | null
          pet_id: string
          phone?: string | null
          started_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          facility_name?: string
          favorite_caretaker?: string | null
          friends?: string[] | null
          id?: string
          notes?: string | null
          pet_id?: string
          phone?: string | null
          started_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_daycare_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      village_groomer: {
        Row: {
          created_at: string
          email: string | null
          frequency: string | null
          groomer_name: string | null
          id: string
          last_appointment_date: string | null
          notes: string | null
          pet_id: string
          phone: string | null
          preferred_services: string[] | null
          rebook_reminder_enabled: boolean
          salon_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          frequency?: string | null
          groomer_name?: string | null
          id?: string
          last_appointment_date?: string | null
          notes?: string | null
          pet_id: string
          phone?: string | null
          preferred_services?: string[] | null
          rebook_reminder_enabled?: boolean
          salon_name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          frequency?: string | null
          groomer_name?: string | null
          id?: string
          last_appointment_date?: string | null
          notes?: string | null
          pet_id?: string
          phone?: string | null
          preferred_services?: string[] | null
          rebook_reminder_enabled?: boolean
          salon_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_groomer_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      village_members: {
        Row: {
          category: string
          created_at: string
          details: Json
          id: string
          pet_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          details?: Json
          id?: string
          pet_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          details?: Json
          id?: string
          pet_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_members_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      village_vet: {
        Row: {
          address: string | null
          checkup_reminder_enabled: boolean
          clinic_name: string
          created_at: string
          email: string | null
          id: string
          last_checkup_date: string | null
          pet_id: string
          phone: string | null
          updated_at: string
          user_id: string
          vet_name: string
        }
        Insert: {
          address?: string | null
          checkup_reminder_enabled?: boolean
          clinic_name?: string
          created_at?: string
          email?: string | null
          id?: string
          last_checkup_date?: string | null
          pet_id: string
          phone?: string | null
          updated_at?: string
          user_id: string
          vet_name?: string
        }
        Update: {
          address?: string | null
          checkup_reminder_enabled?: boolean
          clinic_name?: string
          created_at?: string
          email?: string | null
          id?: string
          last_checkup_date?: string | null
          pet_id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          vet_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_vet_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      village_walker: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          pet_id: string
          phone: string | null
          started_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          pet_id: string
          phone?: string | null
          started_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          pet_id?: string
          phone?: string | null
          started_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_walker_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
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
