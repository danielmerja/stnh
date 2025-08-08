import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-xl">STNH 💩</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/" className="transition-colors hover:text-foreground/80">
                Home
              </Link>
              <Link href="/about" className="transition-colors hover:text-foreground/80">
                About
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container py-10">
          <div className="prose mx-auto max-w-4xl">
            <h1>Privacy Policy</h1>
            <p>
              This Privacy Policy describes how Shit That Never Happened (&quot;STNH&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects,
              uses, and discloses your information.
            </p>

            <h2>1. Information We Collect</h2>
            <p>
              We may collect information that you provide to us directly, such as when you submit a post or contact
              us. We may also collect certain information automatically when you visit our site, such as your IP
              address and browser type.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>
              We use the information we collect to operate and improve the Service, to communicate with you, and to
              comply with legal obligations.
            </p>

            <h2>3. Information Sharing</h2>
            <p>
              We do not sell or rent your personal information to third parties. We may share your information with
              service providers who perform services on our behalf.
            </p>

            <h2>4. Data Retention</h2>
            <p>
              We will retain your information for as long as necessary to provide the Service and to comply with our
              legal obligations.
            </p>

            <h2>5. Your Rights</h2>
            <p>
              You may have certain rights regarding your personal information, subject to local data protection laws.
            </p>

            <h2>6. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the
              new Privacy Policy on this page.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
