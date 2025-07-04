import Link from "next/link"

export default async function AboutPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          &larr; Back to home
        </Link>
        <h1 className="text-3xl font-bold mt-4 mb-6">About Shit That Never Happened</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-lg">
            Welcome to "Shit That Never Happened" — a digital museum dedicated to preserving the internet's most
            creative works of fiction disguised as real-life events.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
          <p>
            In an era where social media clout is currency, we've created a space to celebrate, archive, and gently mock
            the most outlandish stories that people share online for likes and retweets.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Community Guidelines</h2>
          <p>
            While we enjoy a good laugh, we're not here to bully individuals. Our focus is on the phenomenon of
            fabricated stories, not attacking specific people. We moderate submissions to ensure they meet our standards
            for both humor and ethics.
          </p>

          <p className="mt-6">
            Have a suggestion or want to report content? Contact us at{" "}
            <span className="font-mono">nah@stnh.com</span>
          </p>
        </div>
      </div>
    </div>
  )
}
