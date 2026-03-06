import { Construction } from 'lucide-react'

export default function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Construction className="h-16 w-16 text-gray-400 mb-4" />
      <h1 className="text-2xl font-bold text-gray-700 mb-2">Coming Soon</h1>
      <p className="text-gray-500 max-w-md">
        This feature is currently under development. Check back soon for updates.
      </p>
    </div>
  )
}
