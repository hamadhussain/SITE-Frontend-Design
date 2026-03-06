// import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
// import { useNavigate } from 'react-router-dom'
// import api from '@/services/api'
// import { toast } from 'sonner'

// interface User {
//   id: number
//   email: string
//   name: string
//   role: string
//   profileImageUrl?: string
//   emailVerified: boolean
//   twoFactorEnabled: boolean
// }

// interface AuthContextType {
//   user: User | null
//   isLoading: boolean
//   isAuthenticated: boolean
//   login: (email: string, password: string) => Promise<void>
//   register: (data: RegisterData) => Promise<void>
//   logout: () => void
//   refreshAuth: () => Promise<void>
// }

// interface RegisterData {
//   name: string
//   email: string
//   password: string
//   role: string
//   phone?: string
//   city?: string
//   companyName?: string
// }

// const AuthContext = createContext<AuthContextType | null>(null)

// export function useAuth() {
//   const context = useContext(AuthContext)
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider')
//   }
//   return context
// }

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const navigate = useNavigate()

//   useEffect(() => {
//     checkAuth()
//   }, [])

//   const checkAuth = async () => {
//     const token = localStorage.getItem('accessToken')
//     if (!token) {
//       setIsLoading(false)
//       return
//     }

//     try {
//       const response = await api.get('/v1/auth/me')
//       setUser(response.data)
//     } catch (error) {
//       localStorage.removeItem('accessToken')
//       localStorage.removeItem('refreshToken')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const login = async (email: string, password: string) => {
//     try {
//       const response = await api.post('/v1/auth/login', { email, password })
//       const { accessToken, refreshToken, user: userData } = response.data

//       localStorage.setItem('accessToken', accessToken)
//       localStorage.setItem('refreshToken', refreshToken)
//       setUser(userData)

//       toast.success('Welcome back!')

//       // Redirect based on role
//       const redirectPath = getRedirectPath(userData.role)
//       navigate(redirectPath)
//     } catch (error: any) {
//       const message = error.response?.data?.message || 'Login failed'
//       toast.error(message)
//       throw error
//     }
//   }

//   const register = async (data: RegisterData) => {
//     try {
//       const response = await api.post('/v1/auth/register', data)
//       const { accessToken, refreshToken, user: userData } = response.data

//       localStorage.setItem('accessToken', accessToken)
//       localStorage.setItem('refreshToken', refreshToken)
//       setUser(userData)

//       toast.success('Account created successfully!')

//       const redirectPath = getRedirectPath(userData.role)
//       navigate(redirectPath)
//     } catch (error: any) {
//       const message = error.response?.data?.message || 'Registration failed'
//       toast.error(message)
//       throw error
//     }
//   }

//   const logout = () => {
//     api.post('/v1/auth/logout').catch(() => {})
//     localStorage.removeItem('accessToken')
//     localStorage.removeItem('refreshToken')
//     setUser(null)
//     navigate('/login')
//     toast.success('Logged out successfully')
//   }

//   const refreshAuth = async () => {
//     const refreshToken = localStorage.getItem('refreshToken')
//     if (!refreshToken) {
//       logout()
//       return
//     }

//     try {
//       const response = await api.post('/v1/auth/refresh', { refreshToken })
//       const { accessToken, refreshToken: newRefreshToken, user: userData } = response.data

//       localStorage.setItem('accessToken', accessToken)
//       localStorage.setItem('refreshToken', newRefreshToken)
//       setUser(userData)
//     } catch (error) {
//       logout()
//     }
//   }

//   const getRedirectPath = (role: string): string => {
//     switch (role) {
//       case 'CLIENT':
//         return '/client/dashboard'
//       case 'BUILDER':
//         return '/builder/dashboard'
//       case 'SUPPLIER':
//         return '/supplier/dashboard'
//       case 'SUPERVISOR':
//         return '/supervisor/dashboard'
//       case 'INSPECTOR':
//         return '/inspector/dashboard'
//       case 'ADMIN':
//       case 'SUPER_ADMIN':
//         return '/admin/dashboard'
//       default:
//         return '/'
//     }
//   }

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isLoading,
//         isAuthenticated: !!user,
//         login,
//         register,
//         logout,
//         refreshAuth,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   )
// }



import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface User {
  id: number
  email: string
  name: string
  role: string
  profileImageUrl?: string
  emailVerified?: boolean
  twoFactorEnabled?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshAuth: () => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: string
  phone?: string
  city?: string
  companyName?: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('mockUser')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    await new Promise(res => setTimeout(res, 800))

    let userData: User | null = null

    if (email === 'builder@test.com') {
      userData = {
        id: 1,
        email,
        name: 'Builder User',
        role: 'BUILDER',
      }
    } else if (email === 'client@test.com') {
      userData = {
        id: 2,
        email,
        name: 'Client User',
        role: 'CLIENT',
      }
    } else if (email === 'admin@test.com') {
      userData = {
        id: 3,
        email,
        name: 'Admin',
        role: 'ADMIN',
      }
    }

    if (!userData) {
      toast.error('Invalid email or password')
      throw new Error('Invalid credentials')
    }

    localStorage.setItem('mockUser', JSON.stringify(userData))
    setUser(userData)

    toast.success('Welcome back!')

    navigate(getRedirectPath(userData.role))
  }

  const register = async (data: RegisterData) => {
    await new Promise(res => setTimeout(res, 800))

    const userData: User = {
      id: Date.now(),
      email: data.email,
      name: data.name,
      role: data.role,
    }

    localStorage.setItem('mockUser', JSON.stringify(userData))
    setUser(userData)

    toast.success('Account created successfully!')
    navigate(getRedirectPath(userData.role))
  }

  const logout = () => {
    localStorage.removeItem('mockUser')
    setUser(null)
    navigate('/login')
    toast.success('Logged out successfully')
  }

  const refreshAuth = async () => {
    return
  }

  const getRedirectPath = (role: string): string => {
    switch (role) {
      case 'CLIENT':
        return '/client/dashboard'
      case 'BUILDER':
        return '/builder/dashboard'
      case 'SUPPLIER':
        return '/supplier/dashboard'
      case 'SUPERVISOR':
        return '/supervisor/dashboard'
      case 'INSPECTOR':
        return '/inspector/dashboard'
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return '/admin/dashboard'
      default:
        return '/'
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}