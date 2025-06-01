import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
          Welcome to TheraBot
        </h1>
        <p className="text-lg mb-8">
          Your emotionally intelligent AI companion for support, mentorship, and coping tools.
        </p>
        <div className="space-y-4">
          <Link href="/login" className="btn-primary block">
            Get Started
          </Link>
          <Link href="/about" className="text-primary hover:underline">
            Learn more about TheraBot
          </Link>
        </div>
      </div>
    </main>
  );
}
