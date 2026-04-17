import Link from 'next/link'

export default function PagoCanceladoPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        {/* Ícono X */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[#9CA3AF]/10 border border-[#9CA3AF]/20 flex items-center justify-center">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        </div>

        {/* Título */}
        <div className="space-y-2">
          <h1 className="font-cormorant text-4xl text-white">Pago cancelado</h1>
          <p className="text-[#9CA3AF] text-sm">
            No se realizó ningún cargo. Podés intentarlo nuevamente cuando quieras.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[#C9A84C] hover:text-[#B8943E] transition-colors text-sm font-medium"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver al dashboard
        </Link>
      </div>
    </div>
  )
}
