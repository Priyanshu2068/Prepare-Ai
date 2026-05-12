import { useRouter } from 'next/router';
import Navbar from './Navbar';

export default function LoginPrompt({ title = 'Login required', message = 'Please log in to continue.' }) {
  const router = useRouter();
  const next = router.asPath && router.asPath !== '/login' ? router.asPath : '/dashboard';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-800 bg-blue-950/50 text-2xl font-black text-blue-300">
          !
        </div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-3 text-gray-400">{message}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => router.push(`/login?next=${encodeURIComponent(next)}`)}
            className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Login to Continue
          </button>
          <button
            onClick={() => router.push('/')}
            className="rounded-full border border-gray-700 px-6 py-3 text-sm font-semibold text-gray-200 hover:border-gray-500"
          >
            Back Home
          </button>
        </div>
      </div>
    </div>
  );
}
