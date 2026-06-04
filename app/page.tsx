import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MapPin, QrCode, Bell, Home, ShoppingBag, MessageSquare, User, Bike, ChevronRight } from 'lucide-react';
import Sidebar from "@/components/layout/Sidebar";

export default async function DashboardLanding() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  const { data: cafeterias } = await supabase
    .from('cafeterias')
    .select('*')
    .order('name');

  const displayName = profile?.full_name || 'Oyebode Precious Isaac';
  const userRole = profile?.role || 'student';

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-[#1f2937] overflow-hidden">
      
      {/* DESKTOP SIDEBAR: Strictly hidden on mobile, fixed on desktop */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-white border-r border-gray-200 z-40 h-full">
        <Sidebar />
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        
        {/* HEADER */}
        <header className="flex-none flex items-center justify-between px-6 py-5 bg-white border-b border-gray-200 z-30 shadow-sm">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              Hello, {displayName} 👋
            </h2>
            <p className="text-sm text-gray-500 font-medium capitalize mt-1">
              {userRole} Dashboard
            </p>
          </div>

          <Link href="/notifications" className="p-2.5 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors relative">
            <Bell size={20} className="text-gray-700" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#8a1515] rounded-full border-2 border-white"></span>
          </Link>
        </header>

        {/* SCROLLABLE AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* ACTIVE ORDER STATUS */}
            <Link href="/orders/active" className="block">
              <section className="bg-[#8a1515] rounded-2xl p-6 text-white shadow-md flex justify-between items-center hover:bg-[#6f1111] transition-colors">
                <div>
                  <h3 className="text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">Active Order Status</h3>
                  <p className="text-2xl md:text-3xl font-extrabold mb-4">Preparing...</p>
                  <div className="flex items-center gap-2 text-sm bg-black/20 px-3 py-1.5 rounded-lg w-fit">
                    <MapPin size={16} />
                    <span className="font-medium">Est. Ready Time: 15 mins</span>
                  </div>
                </div>
                
                <div className="bg-white px-4 py-3 rounded-xl shadow-sm text-[#8a1515] flex flex-col items-center justify-center min-w-[90px]">
                  <QrCode size={32} />
                  <span className="text-[10px] font-extrabold mt-1.5 uppercase">Pickup ID</span>
                </div>
              </section>
            </Link>

            {/* CAFETERIAS GRID */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-gray-900 text-lg md:text-xl">Choose a Cafeteria</h3>
                <Link href="/cafeterias" className="text-sm font-bold text-[#8a1515] hover:underline">
                  View All
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {cafeterias && cafeterias.length > 0 ? (
                  cafeterias.map((cafe) => (
                    <Link href={`/cafeterias/${cafe.id}`} key={cafe.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[140px]">
                      <div>
                        <h4 className="font-extrabold text-gray-900 text-lg mb-2">{cafe.name}</h4>
                        <span className="inline-block border border-gray-300 text-gray-700 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                          {cafe.is_active ? 'Currently Open' : 'Closed'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-500 font-semibold">Explore Menu</span>
                        <ChevronRight size={18} className="text-gray-400" />
                      </div>
                    </Link>
                  ))
                ) : (
                  /* Loading Fallback */
                  [1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 h-[140px] animate-pulse"></div>
                  ))
                )}
              </div>
            </section>

            {/* DELIVER & EARN CTA */}
            {userRole !== 'rider' && (
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                <div className="p-6 flex items-center gap-4 flex-1">
                  <div className="bg-[#8a1515]/10 p-3 rounded-full text-[#8a1515]">
                    <Bike size={24} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg text-gray-900">Deliver & Earn</h4>
                    <p className="text-gray-500 text-sm mt-0.5">Sign up as an agent on campus to earn delivery fees.</p>
                  </div>
                </div>
                <Link href="/delivery/signup" className="bg-[#8a1515] hover:bg-[#6f1111] text-white px-6 py-4 md:py-auto font-bold text-center flex items-center justify-center transition-colors">
                  Become a Rider
                </Link>
              </section>
            )}

          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAV: Strictly bound to bottom, hidden on md+ */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 flex justify-around items-center py-3 pb-safe shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
        <Link href="/" className="flex flex-col items-center gap-1 text-[#8a1515]">
          <Home size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-bold">Home</span>
        </Link>
      <Link href="/orders/history" className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
  <ShoppingBag size={24} />
  <span className="text-[10px] font-semibold">Orders</span>
</Link>s
        <Link href="/chat" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900">
          <MessageSquare size={22} />
          <span className="text-[10px] font-semibold">Chat</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900">
          <User size={22} />
          <span className="text-[10px] font-semibold">Profile</span>
        </Link>
      </nav>

    </div>
  );
}