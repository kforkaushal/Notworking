import { Users, MessageSquare, ThumbsDown } from 'lucide-react';

const features = [
  {
    icon: <MessageSquare size={32} className="text-blue-600" />,
    title: 'Post Honestly',
    description: 'Vent about a bad interview or share a funny rejection email. No corporate jargon required.',
  },
  {
    icon: <Users size={32} className="text-blue-600" />,
    title: 'Join Real Groups',
    description: 'Find your people in groups like "Laid Off Legends" or "Career Pivot Contemplators".',
  },
  {
    icon: <ThumbsDown size={32} className="text-blue-600" />,
    title: 'Share Rejection Stories',
    description: 'Turn Ls into lessons (and laughs). Track your "rejection streak" and wear it as a badge of honor.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Finally, a network that's actually social.</h2>
          <p className="mt-4 text-lg text-gray-600">Ditch the pressure. Embrace the process.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}