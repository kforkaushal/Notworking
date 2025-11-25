export function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Don't just take our word for it.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 italic">"I got laid off and felt totally lost. NotWorking is the only place where I can joke about my resume getting ghosted and have people actually get it."</p>
                <p className="mt-4 font-semibold">- Sarah K., <span className="text-gray-500">Recently "Re-org'd"</span></p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 italic">"It's like LinkedIn's fun, unemployed cousin. 10/10 would recommend for maintaining sanity between job applications."</p>
                <p className="mt-4 font-semibold">- Mike R., <span className="text-gray-500">On a "Funemployment" Break</span></p>
            </div>
        </div>
      </div>
    </section>
  );
}