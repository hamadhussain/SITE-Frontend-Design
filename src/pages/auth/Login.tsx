import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, Hammer, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function Login() {
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(email, password)
    } catch {
      setError('Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemo = (e: string, p: string) => {
    setEmail(e)
    setPassword(p)
  }

  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex bg-white items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg text-black">
          <div className="flex items-center gap-3 mb-10 group">
            <div className="bgprimary p-2 rounded-lg group-hover:rotate-12 transition-transform">
              <Hammer className="h-8 w-8 textprimary-foreground" />
            </div>
            <span className="font-bold text-2xl tracking-tight">BuilderConnect</span>
          </div>

          <h1 className="text-4xl font-extrabold mb-3 tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Access your workspace and project dashboard.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" data-aos="fade-up">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary font-bold hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[10px] text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? (
                'Authenticating...'
              ) : (
                <>
                  <ShieldCheck size={20} /> Secure Login
                </>
              )}
            </Button>
          </form>

          {(import.meta as any).env.DEV && (
            <div className="mt-12 p-4 border-2 border-dashed rounded-2xl bg-primary/5">
              <p className="text-xs font-bold textprimary uppercase tracking-widest mb-3">
                Dev Sandbox:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => fillDemo('client@test.com', 'password123')}
                  className="text-[10px] bg-white border p-2 rounded-lg hover:border-primary"
                >
                  Client
                </button>
                <button
                  onClick={() => fillDemo('builder@test.com', 'password123')}
                  className="text-[10px] bg-white border p-2 rounded-lg hover:border-primary"
                >
                  Builder
                </button>
                <button
                  onClick={() => fillDemo('admin@test.com', 'password123')}
                  className="text-[10px] bg-white border p-2 rounded-lg hover:border-primary col-span-2"
                >
                  Admin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="hidden lg:flex flex-1 bgAuthImage relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
      </div>
    </div>
  )
}



// import { useAuth } from '@/contexts/AuthContext'
// import { Eye, EyeOff, Hammer, ShieldCheck } from 'lucide-react'
// import { useState } from 'react'
// import { Link,useNavigate } from 'react-router-dom'

// export default function Login() {


//   const navigate = useNavigate()
//  const authApi = {
//   login: async (email: string, password: string) => {
//     // Fake delay
//     await new Promise(res => setTimeout(res, 800))

//     // Fake users
//     if (email === 'builder@test.com') {
//       return {
//         data: {
//           user: {
//             id: 1,
//             name: 'Builder User',
//             role: 'BUILDER',
//           },
//           accessToken: 'fake-access-token',
//           refreshToken: 'fake-refresh-token',
//         },
//       }
//     }

//     if (email === 'client@test.com') {
//       return {
//         data: {
//           user: {
//             id: 2,
//             name: 'Client User',
//             role: 'CLIENT',
//           },
//           accessToken: 'fake-access-token',
//           refreshToken: 'fake-refresh-token',
//         },
//       }
//     }

//     if (email === 'admin@test.com') {
//       return {
//         data: {
//           user: {
//             id: 3,
//             name: 'Admin',
//             role: 'ADMIN',
//           },
//           accessToken: 'fake-access-token',
//           refreshToken: 'fake-refresh-token',
//         },
//       }
//     }

//     throw new Error('Invalid credentials')
//   },
// }

//   // const { login } = useAuth()
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState('')

// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault()
//   setIsLoading(true)
//   setError('')

//   try {
//     const response = await authApi.login(email, password)
//     const user = response.data.user

//     // Store fake auth data
//     localStorage.setItem('accessToken', response.data.accessToken)
//     localStorage.setItem('user', JSON.stringify(user))

//     // Redirect based on role
//     switch (user.role) {
//       case 'BUILDER':
//         navigate('/builder/dashboard')
//         break
//       case 'CLIENT':
//         navigate('/client/dashboard')
//         break
//       case 'ADMIN':
//         navigate('/admin/dashboard')
//         break
//       default:
//         navigate('/')
//     }

//   } catch (err) {
//     setError('Invalid email or password')
//   } finally {
//     setIsLoading(false)
//   }
// }

//   const fillDemo = (e: string, p: string) => {
//     setEmail(e)
//     setPassword(p)
//   }

//   return (
//     <div className="min-h-screen flex bg-background">
//       <div className="flex-1 flex bg-white items-center justify-center p-6 md:p-12">
//         <div className="w-full max-w-lg text-black">
//           <div className="flex items-center gap-3 mb-10 group">
//             <div className="bgprimary p-2 rounded-lg group-hover:rotate-12 transition-transform">
//               <Hammer className="h-8 w-8 textprimary-foreground" />
//             </div>
//             <span className="font-bold text-2xl tracking-tight">BuilderConnect</span>
//           </div>

//           <h1 className="text-4xl font-extrabold mb-3 tracking-tight">Welcome back</h1>
//           <p className="text-muted-foreground mb-8 text-lg">Access your workspace and project dashboard.</p>

//           {error && (
//             <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-medium">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div className="space-y-2">
//               <label className="text-sm font-semibold">Email</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-4 py-2.5 bgsecondary/50 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
//                 placeholder="name@example.com"
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <div className="flex justify-between items-center">
//                 <label className="text-sm font-semibold">Password</label>
//                 <Link to="/forgot-password" className="text-xs textprimary font-bold hover:underline">
//                   Forgot?
//                 </Link>
//               </div>
//               <div className="relative">
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full px-4 py-2.5 bgsecondary/50 border rounded-lg focus:ring-2 focus:ring-primary outline-none pr-10"
//                   placeholder="••••••••"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
//             >
//               {isLoading ? 'Authenticating...' : (
//                 <>
//                   <ShieldCheck size={20} /> Secure Login
//                 </>
//               )}
//             </button>
//           </form>

//           <p className="mt-8 text-center text-muted-foreground">
//             New here?{' '}
//             <Link to="/register" className="text-black font-bold hover:underline">
//               Create Business Account
//             </Link>
//           </p>

//           {(import.meta as any).env.DEV && (
//             <div className="mt-12 p-4 border-2 border-dashed rounded-2xl bg-primary/5">
//               <p className="text-xs font-bold textprimary uppercase tracking-widest mb-3">Dev Sandbox:</p>
//               <div className="grid grid-cols-2 gap-2">
//                 <button onClick={() => fillDemo('client@test.com', 'password123')} className="text-[10px] bg-white border p-2 rounded-lg hover:border-primary">
//                   Client
//                 </button>
//                 <button onClick={() => fillDemo('builder@test.com', 'password123')} className="text-[10px] bg-white border p-2 rounded-lg hover:border-primary">
//                   Builder
//                 </button>
//                 <button onClick={() => fillDemo('admin@test.com', 'password123')} className="text-[10px] bg-white border p-2 rounded-lg hover:border-primary col-span-2">
//                   Admin
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//        <div className="hidden lg:flex flex-1 bgAuthImage relative overflow-hidden items-center justify-center">
//         <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
       
//         {/* <div className="z-10 max-w-2xl  p-10">
         
//           <h2 className="text-5xl font-extrabold mb-6  leading-tight">Build the future <br/> of Pakistan.  <CheckCircle2 className="h-16 w-16 mb-6 text-white opacity-80" /></h2>
//           <p className="text-xl opacity-80 leading-relaxed font-light">
//             Verified professionals, secure escrow payments, and transparent project tracking in one place.
//           </p>
//         </div> */}
//       </div>
//     </div>
//   )
// }