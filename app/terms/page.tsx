import Link from "next/link"

export default function TermsPage() {
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
            <h1>Terms of Service</h1>
            <p>
              Welcome to Shit That Never Happened (&quot;STNH&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). These Terms of Service (&quot;Terms&quot;)
              govern your access to and use of the STNH website (the &quot;Service&quot;). By accessing or using the Service,
              you agree to be bound by these Terms.
            </p>

            <h2>1. User Content</h2>
            <p>
              You are solely responsible for any content you submit to the Service. By submitting content, you grant
              us a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content in
              connection with the Service.
            </p>

            <h2>2. Prohibited Conduct</h2>
            <p>
              You agree not to use the Service to submit any content that is illegal, defamatory, or infringes on
              the rights of any third party. We reserve the right to remove any content that violates these Terms.
            </p>

            <h2>3. Disclaimers</h2>
            <p>
              The Service is provided &quot;as is&quot; without any warranties, express or implied. We do not warrant that the
              Service will be error-free or uninterrupted.
            </p>

            <h2>4. Limitation of Liability</h2>
            <p>
              In no event shall STNH be liable for any damages arising out of your use of the Service.
            </p>

            <h2>5. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. We will notify you of any changes by posting the new Terms on
              this page.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
