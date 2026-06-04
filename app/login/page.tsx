import { login, signup } from './actions'

export default async function LoginPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto min-h-screen">
      <form className="flex-1 flex flex-col w-full justify-center gap-2 text-brand-text">
        <h1 className="text-2xl font-extrabold text-brand-primary mb-6 text-center">Smart Dining Hub</h1>
        
        <label className="text-md font-medium" htmlFor="fullName">
          Full Name (For Signup)
        </label>
        <input
          className="rounded-md px-4 py-2 bg-brand-surface border mb-4"
          name="fullName"
          placeholder="e.g. Oyebode Precious Isaac"
        />

        <label className="text-md font-medium" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-brand-surface border mb-4"
          name="email"
          placeholder="you@example.com"
          required
        />
        
        <label className="text-md font-medium" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-2 bg-brand-surface border mb-6"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        
        <button
          formAction={login}
          className="bg-brand-primary text-white rounded-md px-4 py-2 mb-2 hover:opacity-90 transition-opacity font-medium"
        >
          Sign In
        </button>
        <button
          formAction={signup}
          className="border border-brand-text/20 rounded-md px-4 py-2 mb-2 hover:bg-brand-surface transition-colors font-medium"
        >
          Sign Up
        </button>

        {searchParams?.message && (
          <p className="mt-4 p-4 bg-red-100 text-red-600 text-center rounded-md">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  )
}