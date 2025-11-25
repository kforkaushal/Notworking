"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const authContext = useAuth();
  const user = authContext?.user;
  const logout = authContext?.logout;

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          NotWorking
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-700">Hi, {user.displayName?.split(' ')[0]}</span>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Log In
              </Link>
              <Link
                href="/login" // Changed from /signup to simplify, points to login
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}