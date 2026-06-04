import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Shield, LogOut } from 'lucide-react';
import { signOut } from './actions';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Fetch their profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-[#1f2937]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-5 bg-white border-b border-gray-200 shadow-sm">
        <Link href="/" className="p-2 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-700" />
        </Link>
        <h2 className="text-xl font-extrabold text-gray-900">Profile & Settings</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-6 pb-24">
          
          {/* PROFILE CARD */}
          <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-[#8a1515] h-32 relative">
              {/* Avatar positioning */}
              <div className="absolute -bottom-10 left-8 w-24 h-24 bg-white rounded-full p-1 shadow-md">
                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-[#8a1515]">
                  <User size={40} />
                </div>
              </div>
            </div>
            
            <div className="pt-14 p-8">
              <h3 className="text-2xl font-extrabold text-gray-900">{profile?.full_name || 'Campus Student'}</h3>
              <p className="text-gray-500 font-medium capitalize mt-1 flex items-center gap-2">
                <Shield size={16} /> {profile?.role || 'Student'} Account
              </p>
            </div>
          </section>

          {/* ACCOUNT DETAILS */}
          <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-6">
            <h4 className="font-extrabold text-gray-900 text-lg border-b border-gray-100 pb-4">Account Information</h4>
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-xl text-gray-500">
                <User size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Full Name</p>
                <p className="font-bold text-gray-900">{profile?.full_name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-xl text-gray-500">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Email Address</p>
                <p className="font-bold text-gray-900">{user.email}</p>
              </div>
            </div>
          </section>

          {/* DANGER ZONE / LOGOUT */}
          <section className="bg-white rounded-3xl border border-red-100 shadow-sm p-6 space-y-4">
            <h4 className="font-extrabold text-red-600 text-lg">System Access</h4>
            <p className="text-sm text-gray-500">Securely sign out of your account on this device.</p>
            
            <form action={signOut}>
              <button 
                type="submit" 
                className="w-full bg-red-50 text-red-600 hover:bg-red-100 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </form>
          </section>

        </div>
      </main>
    </div>
  );
}