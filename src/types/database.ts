/**
 * Tipos del schema de Supabase para SoomosNova.
 * Generados manualmente siguiendo el formato de supabase-js v2.
 * Para regenerar con CLI: npx supabase gen types typescript --project-id vnrspkiynlrioxpkheue > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      parejas: {
        Row: {
          id: string
          auth_user_id: string
          nombre_1: string
          nombre_2: string
          email: string
          telefono: string | null
          plan: 'fundador' | 'starter' | 'premium'
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          auth_user_id: string
          nombre_1: string
          nombre_2: string
          email: string
          telefono?: string | null
          plan?: 'fundador' | 'starter' | 'premium'
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          auth_user_id?: string
          nombre_1?: string
          nombre_2?: string
          email?: string
          telefono?: string | null
          plan?: 'fundador' | 'starter' | 'premium'
          created_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      eventos: {
        Row: {
          id: string
          pareja_id: string
          nombre_evento: string
          slug: string
          fecha_evento: string
          hora_evento: string | null
          lugar_nombre: string | null
          lugar_direccion: string | null
          lugar_maps_url: string | null
          dress_code: string | null
          cuenta_regalo: string | null
          opciones_menu: Json
          permite_acompanante: boolean
          album_activo: boolean
          album_expira_at: string | null
          pin_venue: string | null
          estado_pago: 'pendiente' | 'pagado'
          stripe_session_id: string | null
          template: 'clasica' | 'art-deco' | 'celestial' | 'botanical' | 'romantica'
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          pareja_id: string
          nombre_evento: string
          slug: string
          fecha_evento: string
          hora_evento?: string | null
          lugar_nombre?: string | null
          lugar_direccion?: string | null
          lugar_maps_url?: string | null
          dress_code?: string | null
          cuenta_regalo?: string | null
          opciones_menu?: Json
          permite_acompanante?: boolean
          album_activo?: boolean
          album_expira_at?: string | null
          pin_venue?: string | null
          estado_pago?: 'pendiente' | 'pagado'
          stripe_session_id?: string | null
          template?: 'clasica' | 'art-deco' | 'celestial' | 'botanical' | 'romantica'
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          pareja_id?: string
          nombre_evento?: string
          slug?: string
          fecha_evento?: string
          hora_evento?: string | null
          lugar_nombre?: string | null
          lugar_direccion?: string | null
          lugar_maps_url?: string | null
          dress_code?: string | null
          cuenta_regalo?: string | null
          opciones_menu?: Json
          permite_acompanante?: boolean
          album_activo?: boolean
          album_expira_at?: string | null
          pin_venue?: string | null
          estado_pago?: 'pendiente' | 'pagado'
          stripe_session_id?: string | null
          template?: 'clasica' | 'art-deco' | 'celestial' | 'botanical' | 'romantica'
          created_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      invitados: {
        Row: {
          id: string
          evento_id: string
          nombre: string
          telefono: string | null
          email: string | null
          token: string
          estado_envio: 'pendiente_envio' | 'enviado' | 'error_envio'
          estado_confirmacion: 'pendiente' | 'confirmado' | 'rechazo' | 'pendiente_decision'
          qr_url: string | null
          enviado_at: string | null
          recordatorio_1_at: string | null
          recordatorio_2_at: string | null
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          evento_id: string
          nombre: string
          telefono?: string | null
          email?: string | null
          token?: string
          estado_envio?: 'pendiente_envio' | 'enviado' | 'error_envio'
          estado_confirmacion?: 'pendiente' | 'confirmado' | 'rechazo' | 'pendiente_decision'
          qr_url?: string | null
          enviado_at?: string | null
          recordatorio_1_at?: string | null
          recordatorio_2_at?: string | null
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          evento_id?: string
          nombre?: string
          telefono?: string | null
          email?: string | null
          token?: string
          estado_envio?: 'pendiente_envio' | 'enviado' | 'error_envio'
          estado_confirmacion?: 'pendiente' | 'confirmado' | 'rechazo' | 'pendiente_decision'
          qr_url?: string | null
          enviado_at?: string | null
          recordatorio_1_at?: string | null
          recordatorio_2_at?: string | null
          created_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          id: string
          invitado_id: string
          evento_id: string
          storage_path: string
          public_url: string
          generado_at: string
          regenerado_at: string | null
        }
        Insert: {
          id?: string
          invitado_id: string
          evento_id: string
          storage_path: string
          public_url: string
          generado_at?: string
          regenerado_at?: string | null
        }
        Update: {
          id?: string
          invitado_id?: string
          evento_id?: string
          storage_path?: string
          public_url?: string
          generado_at?: string
          regenerado_at?: string | null
        }
        Relationships: []
      }
      confirmaciones: {
        Row: {
          id: string
          invitado_id: string
          evento_id: string
          asiste: boolean
          opcion_menu: string | null
          lleva_acompanante: boolean | null
          nombre_acompanante: string | null
          confirmed_at: string
        }
        Insert: {
          id?: string
          invitado_id: string
          evento_id: string
          asiste: boolean
          opcion_menu?: string | null
          lleva_acompanante?: boolean | null
          nombre_acompanante?: string | null
          confirmed_at?: string
        }
        Update: {
          id?: string
          invitado_id?: string
          evento_id?: string
          asiste?: boolean
          opcion_menu?: string | null
          lleva_acompanante?: boolean | null
          nombre_acompanante?: string | null
          confirmed_at?: string
        }
        Relationships: []
      }
      ingresos: {
        Row: {
          id: string
          invitado_id: string
          evento_id: string
          ingresado_at: string
          duplicado: boolean
          metodo: 'qr' | 'manual'
          registrado_por: string | null
        }
        Insert: {
          id?: string
          invitado_id: string
          evento_id: string
          ingresado_at?: string
          duplicado?: boolean
          metodo?: 'qr' | 'manual'
          registrado_por?: string | null
        }
        Update: {
          id?: string
          invitado_id?: string
          evento_id?: string
          ingresado_at?: string
          duplicado?: boolean
          metodo?: 'qr' | 'manual'
          registrado_por?: string | null
        }
        Relationships: []
      }
      fotos: {
        Row: {
          id: string
          evento_id: string
          invitado_id: string | null
          cloudinary_public_id: string
          url_original: string
          url_thumbnail: string
          tipo: 'foto' | 'video'
          oculto: boolean
          subido_at: string
        }
        Insert: {
          id?: string
          evento_id: string
          invitado_id?: string | null
          cloudinary_public_id: string
          url_original: string
          url_thumbnail: string
          tipo: 'foto' | 'video'
          oculto?: boolean
          subido_at?: string
        }
        Update: {
          id?: string
          evento_id?: string
          invitado_id?: string | null
          cloudinary_public_id?: string
          url_original?: string
          url_thumbnail?: string
          tipo?: 'foto' | 'video'
          oculto?: boolean
          subido_at?: string
        }
        Relationships: []
      }
      dedicatorias: {
        Row: {
          id: string
          evento_id: string
          invitado_id: string | null
          tipo: 'texto' | 'dibujo'
          contenido: string
          oculto: boolean
          creado_at: string
        }
        Insert: {
          id?: string
          evento_id: string
          invitado_id?: string | null
          tipo: 'texto' | 'dibujo'
          contenido: string
          oculto?: boolean
          creado_at?: string
        }
        Update: {
          id?: string
          evento_id?: string
          invitado_id?: string | null
          tipo?: 'texto' | 'dibujo'
          contenido?: string
          oculto?: boolean
          creado_at?: string
        }
        Relationships: []
      }
      pagos: {
        Row: {
          id: string
          evento_id: string
          pareja_id: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          amount_cents: number
          currency: string
          status: 'pending' | 'succeeded' | 'failed' | 'refunded'
          is_manual: boolean
          paid_at: string | null
          raw_event: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          evento_id: string
          pareja_id: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          amount_cents: number
          currency?: string
          status?: 'pending' | 'succeeded' | 'failed' | 'refunded'
          is_manual?: boolean
          paid_at?: string | null
          raw_event?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          evento_id?: string
          pareja_id?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          amount_cents?: number
          currency?: string
          status?: 'pending' | 'succeeded' | 'failed' | 'refunded'
          is_manual?: boolean
          paid_at?: string | null
          raw_event?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      pago_status: 'pending' | 'succeeded' | 'failed' | 'refunded'
    }
    CompositeTypes: Record<string, never>
  }
}

// Helpers de tipo para uso en la aplicación
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Tipos de entidades nombradas (importar desde aquí en la app)
export type Pareja = Tables<'parejas'>
export type Evento = Tables<'eventos'>
export type Invitado = Tables<'invitados'>
export type QrCode = Tables<'qr_codes'>
export type Confirmacion = Tables<'confirmaciones'>
export type Ingreso = Tables<'ingresos'>
export type Foto = Tables<'fotos'>
export type Dedicatoria = Tables<'dedicatorias'>
export type Pago = Tables<'pagos'>
export type PagoStatus = Database['public']['Enums']['pago_status']
