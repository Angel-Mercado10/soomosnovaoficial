import Link from 'next/link'

export default function PagoExitoPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        {/* Ícono check dorado */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C9A84C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* Título */}
        <div className="space-y-2">
          <h1 className="font-cormorant text-4xl text-white">
            ¡Tu evento está activado!
          </h1>
          <p className="text-[#9CA3AF] text-sm">
            Ya podés enviar las invitaciones a tus invitados.
          </p>
        </div>

        {/* Ornamento */}
        <div className="text-[#C9A84C] text-lg">✦</div>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="inline-block bg-[#C9A84C] text-[#0A0A0A] font-semibold text-sm px-8 py-3 rounded-full hover:bg-[#B8943E] transition-colors"
        >
          Ir al dashboard
        </Link>
      </div>
    </div>
  )
}
