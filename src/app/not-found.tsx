import Link from 'next/link'
import { WhatsAppSupportLink } from '@/components/ui/WhatsAppSupportLink'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-[#C9A84C] text-3xl mb-6 select-none">✦</div>

      <p className="text-[#C9A84C] text-xs uppercase tracking-widest mb-4">Error 404</p>

      <h1 className="font-cormorant text-5xl md:text-6xl text-white mb-4">
        Página no encontrada
      </h1>

      <div className="w-16 h-px bg-[#C9A84C]/40 mx-auto mb-6" />

      <p className="text-[#9CA3AF] text-base max-w-sm mb-10">
        La página que buscás no existe o fue movida. Si creés que es un error, contactanos por
        WhatsApp y lo revisamos enseguida.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="bg-[#C9A84C] hover:bg-[#b8943e] text-[#0A0A0A] font-semibold text-sm px-6 py-3 rounded-full transition-colors"
        >
          Volver al inicio
        </Link>
        <WhatsAppSupportLink
          message="Hola SoomosNova! Encontré un error 404 en su sitio y quiero reportarlo."
          label="Contactar soporte"
          className="border border-[#2A2A2A] hover:border-[#C9A84C]/40 text-[#9CA3AF] hover:text-white text-sm px-6 py-3 rounded-full transition-colors cursor-pointer"
        />
      </div>

      <p className="text-[#9CA3AF]/30 text-xs mt-16">SoomosNova</p>
    </div>
  )
}
