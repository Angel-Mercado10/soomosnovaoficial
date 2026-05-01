import 'server-only'
import type { Metadata } from 'next'
import { NuevoDemoWizard } from '@/components/admin/NuevoDemoWizard'

export const metadata: Metadata = {
  title: 'Crear demo — Admin SoomosNova',
}

export default function NuevoDemoPage() {
  return (
    <div className="space-y-6">
      {/* Header editorial */}
      <div className="pb-6 border-b border-[#1E1E1E]">
        <p className="text-xs text-[#C9A84C] uppercase tracking-widest mb-2">
          Fábrica de demos
        </p>
        <h1 className="font-cormorant text-4xl text-white leading-tight">
          Crear demo completa
        </h1>
        <p className="text-[#9CA3AF] text-sm mt-2 max-w-xl">
          Configure los datos de la pareja, seleccione el diseño y genere invitaciones
          demo listas para presentar al cliente. Todo en un flujo.
        </p>
      </div>

      <NuevoDemoWizard />
    </div>
  )
}
