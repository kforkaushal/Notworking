import Link from 'next/link';

export function FinalCTA() {
  return (
    <section className="bg-blue-600">
      <div className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to join a network that gets it?</h2>
        <p className="mt-4 text-blue-200 text-lg">Create your profile in seconds and start connecting.</p>
        <div className="mt-8">
          <Link href="/signup" className="bg-white hover:bg-gray-100 text-blue-600 font-bold py-4 px-8 rounded-lg text-lg shadow-lg transition-colors">
            Sign Up Now
          </Link>
        </div>
      </div>
    </section>
  );
}