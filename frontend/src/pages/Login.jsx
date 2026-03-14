import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { getApiErrorMessage } from '../utils/apiError'
import { Loader2, LogIn } from 'lucide-react'
import { cn } from '../lib/utils'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const next = {}
    if (!email.trim()) next.email = 'Email is required'
    if (!password) next.password = 'Password is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(email.trim(), password)
      toast.success('Welcome back!')
      setTimeout(() => navigate('/', { replace: true }), 0)
    } catch (err) {
      const message = getApiErrorMessage(err)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Cinematic background glows */}
      <div className="absolute left-[-20%] top-[-20%] h-[60%] w-[60%] rounded-full bg-primary/20 blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-20%] h-[60%] w-[60%] rounded-full bg-primary/10 blur-[150px]" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none" />
      
      <Card className="z-10 w-full max-w-md border-white/5 shadow-netflix bg-white/[0.03] backdrop-blur-3xl overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        <CardHeader className="space-y-4 pb-4 pt-10 text-center">
          <Link to="/" className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-glow-purple transform group-hover:scale-110 transition-transform duration-500">
            <LogIn className="h-8 w-8 text-white" />
          </Link>
          <div className="space-y-2">
            <CardTitle className="text-4xl font-black tracking-tighter text-white uppercase italic">
              ECOM<span className="text-primary">ADMIN</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm font-bold tracking-widest uppercase">
              Secure Terminal Access
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-500">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@nexus.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "bg-black/40 border-white/10 text-white placeholder:text-slate-700 h-12 rounded-xl focus-visible:ring-primary focus-visible:border-primary/50",
                  errors.email && "border-destructive focus-visible:ring-destructive"
                )}
                required
              />
              {errors.email && <p className="text-xs font-bold text-destructive animate-bounce">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-500">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "bg-black/40 border-white/10 text-white placeholder:text-slate-700 h-12 rounded-xl focus-visible:ring-primary focus-visible:border-primary/50",
                  errors.password && "border-destructive focus-visible:ring-destructive"
                )}
                required
              />
              {errors.password && <p className="text-xs font-bold text-destructive animate-bounce">{errors.password}</p>}
            </div>
            <Button type="submit" className="h-14 w-full text-lg font-black uppercase tracking-widest bg-primary text-white shadow-glow-purple hover:shadow-primary/40" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Syncing...
                </>
              ) : (
                'Initialize Session'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t border-white/5 bg-white/[0.01] p-8 text-center mt-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Don't have access?{' '}
            <Link to="/register" className="text-primary hover:text-primary/80 transition-colors ml-1 underline decoration-primary/30 underline-offset-4">
              Request credentials
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

