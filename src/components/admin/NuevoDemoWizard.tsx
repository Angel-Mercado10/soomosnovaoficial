'use client'

import { useState, useTransition } from 'react'
import { crearDemo } from '@/app/actions/admin-demo'
import { VALID_TEMPLATES, type Template, type CrearDemoResult } from '@/lib/admin-demo-types'

// ─────────────────────────────────────────────────────────────────────────────
// Metadatos de templates
// ─────────────────────────────────────────────────────────────────────────────

const TEMPLATE_META: Record<
  Template,
  { label: string; descripcion: string; paleta: string[]; acento: string }
> = {
  clasica: {
    label: 'Clásica',
    descripcion: 'Tipografía serif, ivory y oro. Elegancia atemporal.',
    paleta: ['#F5F0E8', '#C9A84C', '#2C2C2C'],
    acento: '#C9A84C',
  },
  'art-deco': {
    label: 'Art Déco',
    descripcion: 'Geometría, negro intenso y champagne. Años 20 revisitados.',
    paleta: ['#1A1A1A', '#D4AF6A', '#F0E6C8'],
    acento: '#D4AF6A',
  },
  celestial: {
    label: 'Celestial',
    descripcion: 'Azul medianoche, plata y estrellas. Romántico y etéreo.',
    paleta: ['#0D1B2A', '#8BA7BE', '#E8EFF5'],
    acento: '#8BA7BE',
  },
  botanical: {
    label: 'Botánico',
    descripcion: 'Verde salvia, terracota y papel crema. Jardín editorial.',
    paleta: ['#E8E0D0', '#6B7C5C', '#B5654A'],
    acento: '#6B7C5C',
  },
  romantica: {
    label: 'Romántica',
    descripcion: 'Rosa palo, borgoña y oro rosa. Sensual y luminoso.',
    paleta: ['#F9EEE8', '#9B2335', '#D4956A'],
    acento: '#D4956A',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Tipos de estado del wizard
// ─────────────────────────────────────────────────────────────────────────────

type Step = 'datos' | 'diseno' | 'invitados' | 'resultado'

interface InvitadoForm {
  nombre: string
  email: string
  telefono: string
}

interface FormState {
  // Pareja
  nombre_1: string
  nombre_2: string
  email_contacto: string
  telefono: string
  plan: 'fundador' | 'starter' | 'premium'
  // Evento
  nombre_evento: string
  fecha_evento: string
  hora_evento: string
  lugar_nombre: string
  lugar_direccion: string
  dress_code: string
  // Diseño
  template: Template
  crear_paquete: boolean
  // Invitados
  invitados: InvitadoForm[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers UI
// ─────────────────────────────────────────────────────────────────────────────

function InputField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  hint,
}: {
  label: string
  name: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-[#9CA3AF] uppercase tracking-wider">
        {label}
        {required && <span className="text-[#C9A84C] ml-0.5">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/20 transition-colors"
      />
      {hint && <p className="text-[10px] text-[#666]">{hint}</p>}
    </div>
  )
}

function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'datos', label: 'Datos' },
    { key: 'diseno', label: 'Diseño' },
    { key: 'invitados', label: 'Invitados' },
    { key: 'resultado', label: 'Resultado' },
  ]
  const idx = steps.findIndex((s) => s.key === current)

  return (
    <div className="flex items-center gap-0 mb-8" role="list" aria-label="Pasos del wizard">
      {steps.map((step, i) => {
        const done = i < idx
        const active = i === idx
        return (
          <div key={step.key} className="flex items-center" role="listitem">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors
                  ${active ? 'bg-[#C9A84C] text-[#0A0A0A]' : done ? 'bg-[#C9A84C]/30 text-[#C9A84C]' : 'bg-[#1E1E1E] text-[#555]'}`}
              >
                {done ? '✓' : i + 1}
              </div>
              <span
                className={`text-xs ${active ? 'text-white' : done ? 'text-[#C9A84C]/70' : 'text-[#555]'}`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-px mx-2 ${done ? 'bg-[#C9A84C]/40' : 'bg-[#1E1E1E]'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:border-[#C9A84C]/40 transition-colors"
      aria-label={`Copiar ${label}`}
    >
      {copied ? (
        <>
          <span className="text-[#C9A84C]">✓</span> Copiado
        </>
      ) : (
        <>
          <span>⎘</span> Copiar
        </>
      )}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Wizard principal
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_FORM: FormState = {
  nombre_1: '',
  nombre_2: '',
  email_contacto: '',
  telefono: '',
  plan: 'fundador',
  nombre_evento: '',
  fecha_evento: '',
  hora_evento: '',
  lugar_nombre: '',
  lugar_direccion: '',
  dress_code: '',
  template: 'clasica',
  crear_paquete: false,
  invitados: [{ nombre: '', email: '', telefono: '' }],
}

export function NuevoDemoWizard() {
  const [step, setStep] = useState<Step>('datos')
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [resultado, setResultado] = useState<CrearDemoResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setInvitado(idx: number, field: keyof InvitadoForm, value: string) {
    setForm((prev) => {
      const next = [...prev.invitados]
      next[idx] = { ...next[idx], [field]: value }
      return { ...prev, invitados: next }
    })
  }

  function addInvitado() {
    setForm((prev) => ({
      ...prev,
      invitados: [...prev.invitados, { nombre: '', email: '', telefono: '' }],
    }))
  }

  function removeInvitado(idx: number) {
    setForm((prev) => ({
      ...prev,
      invitados: prev.invitados.filter((_, i) => i !== idx),
    }))
  }

  function submitFinal() {
    setError(null)
    const invitadosLimpios = form.invitados.filter((i) => i.nombre.trim())
    if (invitadosLimpios.length === 0) {
      setError('Debe incluir al menos un invitado con nombre.')
      return
    }

    startTransition(async () => {
      const res = await crearDemo({
        nombre_1: form.nombre_1,
        nombre_2: form.nombre_2,
        email_contacto: form.email_contacto,
        telefono: form.telefono || undefined,
        plan: form.plan,
        nombre_evento: form.nombre_evento,
        fecha_evento: form.fecha_evento,
        hora_evento: form.hora_evento || undefined,
        lugar_nombre: form.lugar_nombre || undefined,
        lugar_direccion: form.lugar_direccion || undefined,
        dress_code: form.dress_code || undefined,
        template: form.template,
        crear_paquete: form.crear_paquete,
        invitados: invitadosLimpios,
      })

      setResultado(res)
      if (res.success) {
        setStep('resultado')
      } else {
        setError(res.error ?? 'Error al crear la demo.')
      }
    })
  }

  // ──────────────────── Step: DATOS ──────────────────────────────────────────

  function renderDatos() {
    const canContinue =
      form.nombre_1.trim() &&
      form.nombre_2.trim() &&
      form.email_contacto.trim() &&
      form.nombre_evento.trim() &&
      form.fecha_evento

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl text-white font-medium mb-1">Datos de la pareja y el evento</h2>
          <p className="text-[#9CA3AF] text-sm">
            Esta información se guarda en la base de datos. El email de contacto NO se usa para auth.
          </p>
        </div>

        <section>
          <h3 className="text-xs text-[#C9A84C] uppercase tracking-widest mb-3">La pareja</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Nombre 1"
              name="nombre_1"
              value={form.nombre_1}
              onChange={(v) => set('nombre_1', v)}
              placeholder="Elena"
              required
            />
            <InputField
              label="Nombre 2"
              name="nombre_2"
              value={form.nombre_2}
              onChange={(v) => set('nombre_2', v)}
              placeholder="Martín"
              required
            />
            <InputField
              label="Email de contacto"
              name="email_contacto"
              type="email"
              value={form.email_contacto}
              onChange={(v) => set('email_contacto', v)}
              placeholder="cliente@ejemplo.com"
              required
              hint="Se guarda en parejas.email, no en auth.users"
            />
            <InputField
              label="Teléfono"
              name="telefono"
              value={form.telefono}
              onChange={(v) => set('telefono', v)}
              placeholder="+52 55 0000 0000"
            />
            <div className="flex flex-col gap-1">
              <label htmlFor="plan" className="text-xs text-[#9CA3AF] uppercase tracking-wider">
                Plan
              </label>
              <select
                id="plan"
                value={form.plan}
                onChange={(e) => set('plan', e.target.value as FormState['plan'])}
                className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
              >
                <option value="fundador">Fundador</option>
                <option value="starter">Starter</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs text-[#C9A84C] uppercase tracking-widest mb-3">El evento</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <InputField
                label="Nombre del evento"
                name="nombre_evento"
                value={form.nombre_evento}
                onChange={(v) => set('nombre_evento', v)}
                placeholder="Boda Elena y Martín"
                required
              />
            </div>
            <InputField
              label="Fecha"
              name="fecha_evento"
              type="date"
              value={form.fecha_evento}
              onChange={(v) => set('fecha_evento', v)}
              required
            />
            <InputField
              label="Hora"
              name="hora_evento"
              type="time"
              value={form.hora_evento}
              onChange={(v) => set('hora_evento', v)}
            />
            <InputField
              label="Lugar"
              name="lugar_nombre"
              value={form.lugar_nombre}
              onChange={(v) => set('lugar_nombre', v)}
              placeholder="Hacienda Los Pinos"
            />
            <InputField
              label="Dirección"
              name="lugar_direccion"
              value={form.lugar_direccion}
              onChange={(v) => set('lugar_direccion', v)}
              placeholder="Carretera Toluca km 12"
            />
            <InputField
              label="Dress code"
              name="dress_code"
              value={form.dress_code}
              onChange={(v) => set('dress_code', v)}
              placeholder="Formal / Etiqueta"
            />
          </div>
        </section>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => setStep('diseno')}
            disabled={!canContinue}
            className="px-6 py-2.5 bg-[#C9A84C] text-[#0A0A0A] text-sm font-medium rounded-lg hover:bg-[#D4B85C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Continuar →
          </button>
        </div>
      </div>
    )
  }

  // ──────────────────── Step: DISEÑO ─────────────────────────────────────────

  function renderDiseno() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl text-white font-medium mb-1">Selección de diseño</h2>
          <p className="text-[#9CA3AF] text-sm">
            Elija el template para la demo o genere el paquete completo de 5 diseños.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VALID_TEMPLATES.map((tpl) => {
            const meta = TEMPLATE_META[tpl]
            const isSelected = form.template === tpl
            return (
              <button
                key={tpl}
                type="button"
                onClick={() => set('template', tpl)}
                className={`relative text-left rounded-xl border p-4 transition-all group
                  ${isSelected
                    ? 'border-[#C9A84C]/60 bg-[#C9A84C]/5 ring-1 ring-[#C9A84C]/20'
                    : 'border-[#1E1E1E] bg-[#111111] hover:border-[#2A2A2A] hover:bg-[#141414]'
                  }`}
                aria-pressed={isSelected}
              >
                {/* Paleta de colores */}
                <div className="flex gap-1.5 mb-3">
                  {meta.paleta.map((color) => (
                    <div
                      key={color}
                      className="w-5 h-5 rounded-full border border-white/10"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <p
                  className="font-medium text-sm mb-1"
                  style={{ color: isSelected ? meta.acento : '#E5E7EB' }}
                >
                  {meta.label}
                </p>
                <p className="text-[11px] text-[#9CA3AF] leading-relaxed">{meta.descripcion}</p>

                {isSelected && (
                  <div
                    className="absolute top-3 right-3 w-4 h-4 rounded-full flex items-center justify-center text-[9px]"
                    style={{ backgroundColor: meta.acento, color: '#0A0A0A' }}
                  >
                    ✓
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Opción paquete */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={form.crear_paquete}
            onChange={(e) => set('crear_paquete', e.target.checked)}
            className="mt-0.5 accent-[#C9A84C] w-4 h-4"
          />
          <span>
            <span className="text-white text-sm font-medium">
              Crear paquete completo (5 templates)
            </span>
            <span className="block text-[#9CA3AF] text-xs mt-0.5">
              Genera un evento por cada diseño con los mismos datos. Ideal para presentar al cliente
              todas las opciones de una sola vez.
            </span>
          </span>
        </label>

        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={() => setStep('datos')}
            className="px-5 py-2.5 text-sm text-[#9CA3AF] hover:text-white border border-[#2A2A2A] rounded-lg hover:border-[#3A3A3A] transition-colors"
          >
            ← Regresar
          </button>
          <button
            type="button"
            onClick={() => setStep('invitados')}
            className="px-6 py-2.5 bg-[#C9A84C] text-[#0A0A0A] text-sm font-medium rounded-lg hover:bg-[#D4B85C] transition-colors"
          >
            Continuar →
          </button>
        </div>
      </div>
    )
  }

  // ──────────────────── Step: INVITADOS ──────────────────────────────────────

  function renderInvitados() {
    const canSubmit = form.invitados.some((i) => i.nombre.trim())
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl text-white font-medium mb-1">Invitados demo</h2>
          <p className="text-[#9CA3AF] text-sm">
            Se crearán con tokens únicos. Use nombres de prueba o del cliente.
          </p>
        </div>

        <div className="space-y-3">
          {form.invitados.map((inv, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#111111] rounded-xl border border-[#1E1E1E] relative"
            >
              <InputField
                label={`Invitado ${idx + 1} — Nombre`}
                name={`inv_nombre_${idx}`}
                value={inv.nombre}
                onChange={(v) => setInvitado(idx, 'nombre', v)}
                placeholder="Ana García"
                required={idx === 0}
              />
              <InputField
                label="Email"
                name={`inv_email_${idx}`}
                type="email"
                value={inv.email}
                onChange={(v) => setInvitado(idx, 'email', v)}
                placeholder="ana@ejemplo.com"
              />
              <div className="relative">
                <InputField
                  label="Teléfono"
                  name={`inv_tel_${idx}`}
                  value={inv.telefono}
                  onChange={(v) => setInvitado(idx, 'telefono', v)}
                  placeholder="+52 55 0000 0000"
                />
                {form.invitados.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInvitado(idx)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1E1E1E] text-[#9CA3AF] hover:text-red-400 hover:bg-red-400/10 text-xs flex items-center justify-center transition-colors"
                    aria-label={`Eliminar invitado ${idx + 1}`}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addInvitado}
          className="text-sm text-[#C9A84C] hover:text-[#D4B85C] flex items-center gap-1.5 transition-colors"
        >
          + Agregar invitado
        </button>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={() => setStep('diseno')}
            className="px-5 py-2.5 text-sm text-[#9CA3AF] hover:text-white border border-[#2A2A2A] rounded-lg hover:border-[#3A3A3A] transition-colors"
          >
            ← Regresar
          </button>
          <button
            type="button"
            onClick={submitFinal}
            disabled={!canSubmit || isPending}
            className="px-6 py-2.5 bg-[#C9A84C] text-[#0A0A0A] text-sm font-semibold rounded-lg hover:bg-[#D4B85C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-w-[140px] flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-[#0A0A0A]/40 border-t-[#0A0A0A] rounded-full animate-spin" />
                Creando…
              </>
            ) : (
              'Crear demo ✓'
            )}
          </button>
        </div>
      </div>
    )
  }

  // ──────────────────── Step: RESULTADO ──────────────────────────────────────

  function renderResultado() {
    if (!resultado?.success || !resultado.eventos) return null
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] text-sm">
              ✓
            </div>
            <h2 className="text-xl text-white font-medium">Demo creada con éxito</h2>
          </div>
          <p className="text-[#9CA3AF] text-sm">
            {resultado.eventos.length === 1
              ? 'Se generó el evento y sus invitados demo.'
              : `Se generaron ${resultado.eventos.length} eventos, uno por cada template.`}
          </p>
        </div>

        <div className="space-y-4">
          {resultado.eventos.map((evento) => {
            const meta = TEMPLATE_META[evento.template]
            return (
              <div
                key={evento.id}
                className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: meta.acento }}
                      aria-hidden="true"
                    />
                    <span className="text-white font-medium text-sm">{meta.label}</span>
                  </div>
                  <a
                    href={`/admin/eventos/${evento.id}`}
                    className="text-xs text-[#C9A84C] hover:underline"
                  >
                    Ver en admin →
                  </a>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3 p-2.5 bg-[#0D0D0D] rounded-lg border border-[#1A1A1A]">
                    <span className="text-[11px] text-[#666] shrink-0">Invitación</span>
                    <a
                      href={`/i/${evento.invitados[0]?.token ?? ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#9CA3AF] hover:text-white truncate flex-1 text-right transition-colors"
                    >
                      /i/{evento.invitados[0]?.token?.slice(0, 8)}…
                    </a>
                    <CopyButton
                      text={`${baseUrl}/i/${evento.invitados[0]?.token ?? ''}`}
                      label="link de invitación"
                    />
                  </div>
                </div>

                {evento.invitados.length > 0 && (
                  <div>
                    <p className="text-[10px] text-[#666] uppercase tracking-wider mb-2">
                      Invitados demo
                    </p>
                    <div className="space-y-1.5">
                      {evento.invitados.map((inv) => (
                        <div
                          key={inv.token}
                          className="flex items-center justify-between gap-3 p-2 bg-[#0D0D0D] rounded-lg border border-[#1A1A1A]"
                        >
                          <span className="text-sm text-white">{inv.nombre}</span>
                          <div className="flex items-center gap-2">
                            <CopyButton
                              text={`${baseUrl}/i/${inv.token}`}
                              label={`invitación de ${inv.nombre}`}
                            />
                            <CopyButton
                              text={`${baseUrl}/rsvp/${inv.token}`}
                              label={`RSVP de ${inv.nombre}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex gap-3 pt-2 flex-wrap">
          <a
            href="/admin/demos"
            className="px-5 py-2.5 text-sm text-[#9CA3AF] hover:text-white border border-[#2A2A2A] rounded-lg hover:border-[#3A3A3A] transition-colors"
          >
            Ver demos
          </a>
          <button
            type="button"
            onClick={() => {
              setForm(INITIAL_FORM)
              setResultado(null)
              setError(null)
              setStep('datos')
            }}
            className="px-6 py-2.5 bg-[#C9A84C] text-[#0A0A0A] text-sm font-medium rounded-lg hover:bg-[#D4B85C] transition-colors"
          >
            Crear otra demo
          </button>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl">
      <StepIndicator current={step} />
      <div>
        {step === 'datos' && renderDatos()}
        {step === 'diseno' && renderDiseno()}
        {step === 'invitados' && renderInvitados()}
        {step === 'resultado' && renderResultado()}
      </div>
    </div>
  )
}
