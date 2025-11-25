import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-600">&copy; {new Date().getFullYear()} NotWorking. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
          <Link href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy</Link>
          <Link href="/terms" className="text-gray-600 hover:text-gray-900">Terms</Link>
          <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
        </div>
      </div>
    </footer>
  );
}