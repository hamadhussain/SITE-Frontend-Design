import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Hammer, Eye, EyeOff, CheckCircle2, ArrowRight, User, HardHat, Truck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const roles = [
  { value: 'CLIENT', label: 'Client / Homeowner', description: 'Post projects and hire builders', icon: User },
  { value: 'BUILDER', label: 'Builder / Contractor', description: 'Bid on projects and get work', icon: HardHat },
  { value: 'SUPPLIER', label: 'Material Supplier', description: 'Sell construction materials', icon: Truck },
]

export default function Register() {
  const { register } = useAuth()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: '', phone: '', city: '', companyName: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleRoleSelect = (role: string) => {
    setFormData({ ...formData, role })
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match')
    if (formData.password.length < 8) return setError('Password must be at least 8 characters')

    setIsLoading(true)
    try {
      await register(formData)
    } catch (err) {
      setError('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex bg-white  items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg text-black"> <div className="absolute h-96 w-96 bg-black/10 blur-[100px] rounded-full -top-10 -left-10" />
          <div className="flex items-center gap-3 mb-10 group">
            <div className="bg-primary p-2 rounded-lg group-hover:rotate-12 transition-transform">
              <Hammer className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl tracking-tight">BuilderConnect</span>
          </div>

          {step === 1 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-4xl font-extrabold mb-3 tracking-tight">Join the marketplace</h1>
              <p className="text-muted-foreground mb-8 text-lg">Select your account type to get started.</p>

              <div className="grid gap-4">
                {roles.map((role) => {
                  const Icon = role.icon
                  return (
                    <button
                      key={role.value}
                      onClick={() => handleRoleSelect(role.value)}
                      className="group w-full p-5 border-2 rounded-xl text-left hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-4 relative overflow-hidden"
                    >
                      <div className="p-3 bg-secondary rounded-lg group-hover:bg-primary/10 transition-colors text-primary">
                        <Icon size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{role.label}</p>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      <ArrowRight className="absolute right-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
                <ArrowRight className="rotate-180 h-4 w-4" /> Back to roles
              </button>

              <h1 className="text-3xl font-bold mb-2">Almost there!</h1>
              <p className="text-muted-foreground mb-8">
                Setting up your <span className="text-black font-semibold">{formData.role.toLowerCase()}</span> profile.
              </p>

              {error && <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-medium">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-5" data-aos="fade-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="Hammad Hussain" required />
                  <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="hammad@example.com" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="03001234567" />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 mb-1 block">City</label>
                    <select name="city" value={formData.city} onChange={handleChange} className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-300 focus:border-primary shadow-sm">
                      <option value="">Select City</option>
                      {['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {(formData.role === 'BUILDER' || formData.role === 'SUPPLIER') && (
                  <Input label="Business Name" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Hammad Constructions" className="bg-primary/5" />
                )}

                <div className="relative space-y-2">
                  <div className="relative">
                    <Input label="Password" type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[34px] text-muted-foreground hover:text-primary transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button type="submit" fullWidth disabled={isLoading}>
                  {isLoading ? 'Creating secure account...' : 'Complete Registration'}
                </Button>
              </form>
            </div>
          )}

          <p className="mt-8 text-center text-muted-foreground">
            Already have an account? <Link to="/login" className=" font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right Side Info - Simplified & Elegant */}
      <div className="hidden lg:flex flex-1 bgAuthImage relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />

        {/* <div className="z-10 max-w-2xl  p-10">
         
          <h2 className="text-5xl font-extrabold mb-6  leading-tight">Build the future <br/> of Pakistan.  <CheckCircle2 className="h-16 w-16 mb-6 text-white opacity-80" /></h2>
          <p className="text-xl opacity-80 leading-relaxed font-light">
            Verified professionals, secure escrow payments, and transparent project tracking in one place.
          </p>
        </div> */}
      </div>
    </div>
  )
}