import React from 'react';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { ShieldCheck } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  useDocumentHead({
    title: 'Privacy Policy',
    description: 'PromptVista Privacy Policy: We respect your privacy and never collect sensitive personal information.',
  });

  return (
    <div className="py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in text-brand-text">
      <div className="space-y-2 border-b border-brand-border/60 pb-6">
        <div className="flex items-center space-x-2 text-brand-lavender text-xs uppercase tracking-widest font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Trust & Transparency</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black">Privacy Policy</h1>
        <p className="text-xs text-brand-muted">Last updated: October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-brand-muted leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-brand-text">1. Overview</h2>
          <p>
            At PromptVista, we believe your browsing habits belong to you. We do not require an account or credit card to browse, search, or copy prompts from our discovery catalog.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-brand-text">2. Information Stored Locally</h2>
          <p>
            When you use PromptVista, your saved favorite prompts and visual theme preferences (light/dark mode) are stored strictly inside your browser&apos;s <code>localStorage</code>. This data never leaves your device unless you explicitly connect to a cloud Supabase account.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-brand-text">3. Analytics & Telemetry</h2>
          <p>
            We use privacy-friendly client telemetry to understand aggregate metrics (such as the total number of prompt copies or popular search categories). We do not record IP addresses, fingerprint devices, or sell data to third-party ad brokers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-brand-text">4. Outbound Links & Partners</h2>
          <p>
            PromptVista may display clearly labeled sponsored tools or partner compute resources. Clicking an outbound link will direct you to that third party&apos;s website, subject to their respective privacy terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-brand-text">5. Contact</h2>
          <p>
            If you have questions regarding our privacy practices, please contact us at <a href="mailto:privacy@promptvista.com" className="text-brand-lavender underline">privacy@promptvista.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
};
