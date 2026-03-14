import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Package, ShoppingBag, ArrowRight, BarChart3, Users, Activity, TrendingUp, DollarSign } from 'lucide-react'
import { cn } from '../lib/utils'

export default function Dashboard() {
  const stats = [
    { title: 'Revenue', value: '$12,450', change: '+12.5%', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Products', value: '1,204', icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Active Orders', value: '48', change: '+8.1%', icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Users', value: '842', icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ]

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter text-white sm:text-5xl uppercase">Dashboard</h1>
        <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
          <Activity className="h-4 w-4" />
          Live Metrics
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-white/5 bg-white/5 shadow-netflix group overflow-hidden relative hover:bg-white/10 transition-all duration-300">
            <div className={`absolute top-0 right-0 h-1 w-0 group-hover:w-full transition-all duration-500 ${stat.bg.replace('/10', '/40')}`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
                {stat.title}
              </CardTitle>
              <div className={cn("rounded-xl p-2 shadow-glow-red", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white tracking-tight">{stat.value}</div>
              {stat.change && (
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-500">{stat.change}</span>
                  <span className="text-[10px] text-slate-600 font-bold uppercase ml-1">v. prev month</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-white/5 bg-white/5 shadow-netflix overflow-hidden">
          <CardHeader className="bg-white/[0.02] border-b border-white/5 p-6">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              Inventory Control
            </CardTitle>
            <CardDescription className="text-slate-500">Manage your product catalog and stock levels.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Link to="/products" className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/40 hover:bg-white/5 hover:border-primary/30 transition-all group">
              <div>
                <h4 className="font-bold text-white group-hover:text-primary transition-colors">Global Catalog</h4>
                <p className="text-sm text-slate-500">View and edit all store items.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-700 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
            <Link to="/products" className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/40 hover:bg-white/5 hover:border-primary/30 transition-all group">
              <div>
                <h4 className="font-bold text-white group-hover:text-primary transition-colors">Critical Alerts</h4>
                <p className="text-sm text-slate-500">12 items requiring immediate restock.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-700 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/5 shadow-netflix overflow-hidden">
          <CardHeader className="bg-white/[0.02] border-b border-white/5 p-6">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Order Nexus
            </CardTitle>
            <CardDescription className="text-slate-500">Processing and fulfillment operations.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Link to="/orders" className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/40 hover:bg-white/5 hover:border-primary/30 transition-all group">
              <div>
                <h4 className="font-bold text-white group-hover:text-primary transition-colors">Pending Operations</h4>
                <p className="text-sm text-slate-500">8 orders ready for dispatch.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-700 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
            <Link to="/orders" className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/40 hover:bg-white/5 hover:border-primary/30 transition-all group">
              <div>
                <h4 className="font-bold text-white group-hover:text-primary transition-colors">Fulfillment Stream</h4>
                <p className="text-sm text-slate-500">History of recently processed shipments.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-700 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

