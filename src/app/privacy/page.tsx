import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Privacy Policy | Koine Greek Vocab',
  description: 'Privacy policy for the Koine Greek Vocab application',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" aria-label="Back to home">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Privacy Policy</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: December 29, 2025</p>

          <h2>Introduction</h2>
          <p>
            Koine Greek Vocab ("we," "our," or "us") is committed to protecting your privacy.
            This Privacy Policy explains how we handle information when you use our mobile
            application and web service.
          </p>

          <h2>Information We Collect</h2>
          <p>
            <strong>Local Storage Only:</strong> Koine Greek Vocab stores all your learning
            progress, settings, and preferences locally on your device using browser localStorage.
            This data never leaves your device and is not transmitted to any servers.
          </p>
          <p>The locally stored information includes:</p>
          <ul>
            <li>Vocabulary learning progress and spaced repetition data</li>
            <li>App settings and preferences (theme, study goals)</li>
            <li>Achievement and streak data</li>
            <li>Viewed content history</li>
          </ul>

          <h2>Information We Do NOT Collect</h2>
          <p>We do not collect, store, or transmit:</p>
          <ul>
            <li>Personal identification information (name, email, phone number)</li>
            <li>Location data</li>
            <li>Device identifiers</li>
            <li>Usage analytics or tracking data</li>
            <li>Any data to third-party services</li>
          </ul>

          <h2>No Account Required</h2>
          <p>
            Koine Greek Vocab does not require you to create an account or sign in.
            All functionality is available without providing any personal information.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            This app does not integrate with any third-party analytics, advertising,
            or tracking services. We do not share any data with third parties.
          </p>

          <h2>Data Storage and Security</h2>
          <p>
            All data is stored locally on your device. If you clear your browser data
            or uninstall the app, your learning progress will be deleted. We recommend
            noting your progress if you plan to clear your device data.
          </p>

          <h2>Children's Privacy</h2>
          <p>
            Our app is suitable for users of all ages. We do not knowingly collect
            any personal information from children or adults, as our app does not
            collect personal information from any users.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be
            posted on this page with an updated revision date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:{' '}
            <a href="mailto:keratinqw@gmail.com">keratinqw@gmail.com</a>
          </p>

          <hr />
          <p className="text-sm text-muted-foreground">
            This privacy policy applies to the Koine Greek Vocab application available
            on the Google Play Store and at koine-vocab.vercel.app.
          </p>
        </article>
      </main>
    </div>
  );
}
