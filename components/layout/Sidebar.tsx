import Link from "next/link";
import { 
  LayoutDashboard, Store, UtensilsCrossed, ClipboardList, 
  Bike, Wallet, Heart, MessageSquare, Calendar, Settings, Plus 
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-[#8a1515] text-white flex flex-col justify-between fixed left-0 top-0 overflow-y-auto">
      
      {/* Top Section: Logo & Nav */}
      <div>
        {/* Logo Area */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f5a623] text-[#8a1515] font-bold flex items-center justify-center rounded-xl text-xl">
            S
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight uppercase tracking-wide">Smart Dining</h1>
            <p className="text-xs text-[#f5a623]/80">University Food Hub</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-4 px-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" isActive />
          <NavItem icon={<Store size={20} />} label="Cafeterias" />
          <NavItem icon={<UtensilsCrossed size={20} />} label="Menu" />
          <NavItem icon={<ClipboardList size={20} />} label="Orders" />
          <NavItem icon={<Bike size={20} />} label="Delivery" />
          <NavItem icon={<Wallet size={20} />} label="Wallet" />
          <NavItem icon={<Heart size={20} />} label="Favorites" />
          <NavItem icon={<MessageSquare size={20} />} label="Chat" />
          <NavItem icon={<Calendar size={20} />} label="Events" />
          <NavItem icon={<Settings size={20} />} label="Settings" />
        </nav>
      </div>

      {/* Bottom Section: Wallet Widget */}
      <div className="p-4 mb-4">
        <div className="bg-[#6f1111] rounded-2xl p-5 shadow-lg border border-red-900/50">
          <p className="text-xs text-white/70 mb-1">Wallet Balance</p>
          <h2 className="text-2xl font-bold mb-4">₦30,000.00</h2>
          
          <button className="w-full bg-[#f5a623] hover:bg-yellow-500 text-[#8a1515] font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Plus size={18} />
            Add Funds
          </button>
        </div>

        {/* Quick Pay Info */}
        <div className="mt-4 px-2 text-xs text-white/60">
          <p className="font-semibold text-white/80 mb-0.5">Quick Pay</p>
          <p>Pay faster using saved cards.</p>
          <button className="text-[#f5a623] mt-2 hover:underline">Manage Cards →</button>
        </div>
      </div>

    </aside>
  );
}

// Helper component for clean navigation items
function NavItem({ icon, label, isActive = false }: { icon: React.ReactNode, label: string, isActive?: boolean }) {
  return (
    <Link 
      href="#" 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        isActive 
          ? "bg-[#6f1111] border-l-4 border-[#f5a623]" 
          : "hover:bg-[#6f1111]/50 border-l-4 border-transparent text-white/80 hover:text-white"
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}