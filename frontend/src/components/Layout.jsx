import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { LogOut, LayoutDashboard, Package, ShoppingCart, User } from 'lucide-react'
import { cn } from '../lib/utils'

export function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Orders', path: '/orders', icon: ShoppingCart },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 w-full border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-10">
              <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter text-primary">
                <span>ECOM</span>
                <span className="bg-primary px-1 text-white">ADMIN</span>
              </Link>
              
              <div className="hidden md:flex md:items-center md:gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all duration-300",
                      location.pathname === item.path 
                        ? "text-white bg-white/10 shadow-glow-red" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", location.pathname === item.path && "text-primary")} />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-3 rounded-full bg-white/5 pl-1 pr-4 py-1 sm:flex border border-white/10">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary shadow-glow-red">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-bold text-white/90">{user?.name ?? user?.email}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-slate-400 hover:text-primary hover:bg-primary/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-in fade-in zoom-in-95 duration-700">
          {children}
        </div>
      </main>
    </div>
  )
}

