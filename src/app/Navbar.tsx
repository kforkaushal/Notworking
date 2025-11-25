import Link from 'next/link';

export function Navbar() {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          NotWorking
        </Link>
        <div className="space-x-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900">
            Log In
          </Link>
          <Link
            href="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </nav>
    </header>
  );
}