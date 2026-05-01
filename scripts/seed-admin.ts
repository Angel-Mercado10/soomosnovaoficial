#!/usr/bin/env tsx
/**
 * seed-admin.ts
 *
 * Crea (o actualiza) el usuario administrador SoomosAdmin99 en Supabase Auth.
 * NUNCA hardcodea credenciales — lee desde variables de entorno o argumentos.
 *
 * Uso:
 *   ADMIN_EMAIL=admin@soomosnova.com ADMIN_PASSWORD=... npx tsx scripts/seed-admin.ts
 *
 * O bien, pasar la contraseña como argumento posicional (no queda en el repo):
 *   npx tsx scripts/seed-admin.ts admin@soomosnova.com "MiPassword123"
 *
 * Variables de entorno requeridas (además de las opcionales de arriba):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

// ── Configuración ────────────────────────────────────────────────────────────

const ADMIN_USERNAME = 'SoomosAdmin99'

// Email interno (no se muestra en el login público — solo se usa en Supabase Auth)
const email =
  process.argv[2] ??
  process.env.ADMIN_EMAIL

const password =
  process.argv[3] ??
  process.env.ADMIN_PASSWORD

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// ── Validaciones ─────────────────────────────────────────────────────────────

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌  NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas.')
  console.error('    Copiá .env.example a .env.local y completá los valores.')
  process.exit(1)
}

if (!email || !password) {
  console.error('❌  Email y password son requeridos.')
  console.error('    Uso: npx tsx scripts/seed-admin.ts <email> <password>')
  console.error('    O bien: ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/seed-admin.ts')
  process.exit(1)
}

if (password.length < 12) {
  console.error('❌  La contraseña debe tener al menos 12 caracteres.')
  process.exit(1)
}

// ── Ejecución ─────────────────────────────────────────────────────────────────

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function seedAdmin() {
  console.log(`🔍  Buscando usuario con email: ${email}`)

  // Intentar obtener el usuario por email vía admin API
  const { data: listData, error: listError } = await adminClient.auth.admin.listUsers()

  if (listError) {
    console.error('❌  Error al listar usuarios:', listError.message)
    process.exit(1)
  }

  const existingUser = listData.users.find((u) => u.email === email)

  if (existingUser) {
    console.log(`✏️   Usuario encontrado (${existingUser.id}). Actualizando password y metadata...`)

    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      existingUser.id,
      {
        password,
        // app_metadata: fuente de verdad para roles — solo escribible por service role/admin API.
        // user_metadata puede ser modificado por el usuario; NUNCA usarlo para autorización.
        app_metadata: {
          role: 'super_admin',
          username: ADMIN_USERNAME,
        },
        // user_metadata.username solo para display (no se usa para autorizar).
        user_metadata: {
          username: ADMIN_USERNAME,
        },
      }
    )

    if (updateError) {
      console.error('❌  Error al actualizar usuario:', updateError.message)
      process.exit(1)
    }

    console.log('✅  Admin actualizado correctamente.')
    console.log(`    Username para login: ${ADMIN_USERNAME}`)
    console.log(`    Email Supabase: ${email}`)
  } else {
    console.log('➕  Creando nuevo usuario admin...')

    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // No requiere confirmación de email
      // app_metadata: fuente de verdad para roles — solo escribible por service role/admin API.
      // user_metadata puede ser modificado por el usuario; NUNCA usarlo para autorización.
      app_metadata: {
        role: 'super_admin',
        username: ADMIN_USERNAME,
      },
      // user_metadata.username solo para display (no se usa para autorizar).
      user_metadata: {
        username: ADMIN_USERNAME,
      },
    })

    if (createError) {
      console.error('❌  Error al crear usuario:', createError.message)
      process.exit(1)
    }

    console.log(`✅  Admin creado correctamente (ID: ${createData.user.id})`)
    console.log(`    Username para login: ${ADMIN_USERNAME}`)
    console.log(`    Email Supabase: ${email}`)
    console.log(`    NOTA: El trigger de creación de pareja NO crea fila en parejas`)
    console.log(`          porque tiene role=super_admin en metadata.`)
    console.log(`          Asegurate de haber ejecutado supabase/admin_role_migration.sql primero.`)
  }
}

seedAdmin().catch((err: unknown) => {
  console.error('❌  Error inesperado:', err)
  process.exit(1)
})
