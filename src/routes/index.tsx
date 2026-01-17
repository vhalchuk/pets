import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

const projects = [
  {
    name: 'chords',
    path: '/chords',
    description: 'Music theory and chord progression tool',
  },
  {
    name: 'SPR',
    path: '/spr',
    description: 'Speed Reading',
  },
  // Add more projects here as you create them
];

function Index() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Pet Projects
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Welcome to my collection of pet projects!
          </p>
        </header>
        <main className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Projects
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.path}
                to={project.path}
                className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {project.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {project.description}
                </p>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
