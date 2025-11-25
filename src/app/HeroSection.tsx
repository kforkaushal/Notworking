import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
          Your professional life is on a break.
          <br />
          <span className="text-blue-600">Your social life doesn't have to be.</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          Connect with a community that gets it. Share layoff stories, celebrate unemployment milestones, and find your next (or not-so-next) move without the pressure.
        </p>
        <div className="mt-10">
          <Link
            href="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-xl transition-transform transform hover:scale-105"
          >
            Join the Community
          </Link>
        </div>
      </div>
    </section>
  );
}