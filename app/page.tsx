import Sidebar from "@/components/layout/Sidebar";
import { Search, Bell, ShoppingCart, ChevronDown, Plus } from "lucide-react";

export default function DashboardLanding() {
  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-[#1f2937]">
      {/* 1. SIDEBAR: Hidden on mobile, fixed width on desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* 2. MAIN FEED: Responsive flex-grow */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER: Sticky and responsive padding */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8 py-5 bg-[#f8f9fa]/80 backdrop-blur-md border-b border-gray-200/50">
          <div>
            <h2 className="text-xl lg:text-2xl font-extrabold text-gray-900 tracking-tight">
              Hello, PEDOPHIle 👋
            </h2>
            <p className="text-xs lg:text-sm text-gray-500 font-medium">Welcome back!</p>
          </div>

          <div className="flex items-center gap-3 lg:gap-5">
            {/* Search hidden on small mobile, visible on larger screens */}
            <div className="hidden sm:block relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search meals..." 
                className="w-48 lg:w-80 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-[#f5a623]/50 focus:border-[#f5a623] shadow-sm"
              />
            </div>

            <button className="p-2.5 bg-white rounded-full border border-gray-200 shadow-sm relative">
              <Bell size={18} className="text-gray-600" />
            </button>

            <button className="hidden lg:flex bg-[#8a1515] hover:bg-[#6f1111] text-white px-5 py-2.5 rounded-xl text-sm font-bold items-center gap-2 shadow-md transition-all">
              <Plus size={18} /> New Order
            </button>
          </div>
        </header>

        {/* SCROLLABLE FEED */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 scroll-smooth">
          {/* Dashboard Sections Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
               <h3 className="font-bold text-gray-900 mb-4">Choose a Cafeteria</h3>
               <div className="h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400">Carousel Placeholder</div>
            </div>
            
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
               <h3 className="font-bold text-gray-900 mb-4">Popular Meals</h3>
               <div className="h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400">Meals Placeholder</div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
               <h3 className="font-bold text-gray-900 mb-4">Recent Orders</h3>
               <div className="h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400">Table Placeholder</div>
            </div>
          </section>
        </div>
      </main>

      {/* 3. RIGHT PANEL: Hidden on mobile, fixed width on XL screens */}
      <aside className="hidden xl:block w-[350px] bg-white border-l border-gray-100 p-6 space-y-6 h-screen overflow-y-auto">
         <div className="text-sm font-bold text-gray-900">Live Delivery</div>
         <div className="h-64 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">Map Placeholder</div>
         <div className="h-40 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">QR Code Placeholder</div>
         <div className="h-40 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">Chat Placeholder</div>
      </aside>
    </div>
  );
}