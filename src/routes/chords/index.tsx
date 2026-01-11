import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/chords/')({
  component: Chords,
});

function Chords() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <Link
            to="/"
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
          >
            ← Back to Projects
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Chords
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Music theory and chord progression tool
          </p>
        </header>
        <main className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <p className="text-gray-700 dark:text-gray-300">
            Welcome to the Chords project! This is where your music theory and
            chord progression tool will live.
          </p>
        </main>
      </div>
    </div>
  );
}
