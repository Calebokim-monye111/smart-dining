'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Store, 
  Utensils, 
  ClipboardList, 
  Bike, 
  Wallet, 
  Heart, 
  MessageSquare, 
  Calendar, 
  Settings 
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Cafeterias', href: '/cafeterias', icon: Store },
    { name: 'Menu', href: '/cafeterias', icon: Utensils },
    { name: 'Orders', href: '/orders/history', icon: ClipboardList },
    { name: 'Delivery', href: '/delivery', icon: Bike },
    { name: 'Wallet', href: '#', icon: Wallet },
    { name: 'Favorites', href: '#', icon: Heart },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Events', href: '#', icon: Calendar },
  ];

  return (
    <div className="h-full w-full bg-[#8a1515] text-white flex flex-col">
      {/* LOGO SECTION */}
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-10 h-10 bg-[#f5a623] rounded-xl flex items-center justify-center text-[#8a1515] font-extrabold text-xl">
          S
        </div>
        <div>
          <h1 className="font-extrabold text-lg leading-tight tracking-wide">SMART DINING</h1>
          <p className="text-[10px] text-[#f5a623] font-medium uppercase tracking-widest">University Food Hub</p>
        </div>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        {navLinks.map((link) => {
          // Check if this link is the currently active page
          const isActive = pathname === link.href || 
                           (link.href !== '/' && pathname.startsWith(link.href));

          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium text-sm ${
                isActive 
                  ? 'bg-black/20 text-white relative shadow-inner' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              {/* Yellow active indicator line */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#f5a623] rounded-r-full"></div>
              )}
              <link.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* SETTINGS / PROFILE AT BOTTOM */}
      <div className="p-4 border-t border-white/10">
        <Link 
          href="/profile"
          className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium text-sm ${
            pathname.startsWith('/profile') 
              ? 'bg-black/20 text-white relative' 
              : 'text-white/70 hover:bg-white/5 hover:text-white'
          }`}
        >
          {pathname.startsWith('/profile') && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#f5a623] rounded-r-full"></div>
          )}
          <Settings size={20} />
          Settings
        </Link>
      </div>
    </div>
  );
}