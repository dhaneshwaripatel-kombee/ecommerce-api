import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { getApiErrorMessage, getApiValidationErrors } from '../utils/apiError'
import { Loader2, UserPlus } from 'lucide-react'
import { cn } from '../lib/utils'

export default function Register() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.email.trim()) next.email = 'Email is required'
    if (!form.password) next.password = 'Password is required'
    if (form.password !== form.password_confirmation) {
      next.password_confirmation = 'Passwords do not match'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created successfully.')
      setTimeout(() => navigate('/', { replace: true }), 0)
    } catch (err) {
      const validation = getApiValidationErrors(err)
      if (Object.keys(validation).length > 0) {
        setErrors((prev) => ({ ...prev, ...validation }))
        toast.error('Please fix the validation errors.')
      } else {
        const message = getApiErrorMessage(err)
        toast.error(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-16">
      {/* Cinematic background glows */}
      <div className="absolute left-[-20%] bottom-[-20%] h-[60%] w-[60%] rounded-full bg-primary/20 blur-[150px] animate-pulse" />
      <div className="absolute top-[-20%] right-[-20%] h-[60%] w-[60%] rounded-full bg-primary/10 blur-[150px]" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none" />

      <Card className="z-10 w-full max-w-lg border-white/5 shadow-netflix bg-white/[0.03] backdrop-blur-3xl overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        <CardHeader className="space-y-4 pb-4 pt-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-glow-purple transform group-hover:rotate-12 transition-transform duration-500">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-4xl font-black tracking-tighter text-white uppercase italic">
              JOIN <span className="text-primary text-5xl">US</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm font-bold tracking-widest uppercase">
              Establish Admin Authority
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-500">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Wick"
                  value={form.name}
                  onChange={handleChange}
                  className={cn(
                    "bg-black/40 border-white/10 text-white placeholder:text-slate-700 h-12 rounded-xl focus-visible:ring-primary focus-visible:border-primary/50",
                    errors.name && "border-destructive focus-visible:ring-destructive"
                  )}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-500">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="wick@nexus.com"
                  value={form.email}
                  onChange={handleChange}
                  className={cn(
                    "bg-black/40 border-white/10 text-white placeholder:text-slate-700 h-12 rounded-xl focus-visible:ring-primary focus-visible:border-primary/50",
                    errors.email && "border-destructive focus-visible:ring-destructive"
                  )}
                  required
                />
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-500">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className={cn(
                    "bg-black/40 border-white/10 text-white placeholder:text-slate-700 h-12 rounded-xl focus-visible:ring-primary focus-visible:border-primary/50",
                    errors.password && "border-destructive focus-visible:ring-destructive"
                  )}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_confirmation" className="text-xs font-black uppercase tracking-widest text-slate-500">Confirm Password</Label>
                <Input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  placeholder="••••••••"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  className={cn(
                    "bg-black/40 border-white/10 text-white placeholder:text-slate-700 h-12 rounded-xl focus-visible:ring-primary focus-visible:border-primary/50",
                    errors.password_confirmation && "border-destructive focus-visible:ring-destructive"
                  )}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="h-14 w-full text-lg font-black uppercase tracking-widest bg-primary text-white shadow-glow-purple hover:shadow-primary/40 mt-4" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Create Identity'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t border-white/5 bg-white/[0.01] p-8 text-center mt-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Already verified?{' '}
            <Link to="/login" className="text-primary hover:text-primary/80 transition-colors ml-1 underline decoration-primary/30 underline-offset-4">
              Authorized Entry
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

