import { Slab } from 'react-loading-indicators'

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-[#0a1628] flex flex-col items-center justify-center gap-6">
      <img 
        src="/pwa-192x192.png" 
        alt="Kaizen" 
        className="w-24 h-24 rounded-2xl"
      />
      <h1 className="text-4xl font-black tracking-tight text-white">KAIZEN</h1>
      <Slab color="#22d3ee" size="medium" />
    </div>
  )
}