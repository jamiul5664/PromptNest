import React from 'react';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  useDocumentHead({
    title: 'Terms of Service',
    description: 'PromptVista Terms of Service: Acceptable use, licensing terms, and independent platform disclaimer.',
  });

  return (
    <div className="py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in text-brand-text">
      <div className="space-y-2 border-b border-brand-border/60 pb-6">
        <div className="flex items-center space-x-2 text-brand-lavender text-xs uppercase tracking-widest font-semibold">
          <FileText className="w-4 h-4 text-brand-violet" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black">Terms of Service</h1>
        <p className="text-xs text-brand-muted">Last updated: October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-brand-muted leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-brand-text">1. Acceptance of Terms</h2>
          <p>
            By accessing or using PromptVista, you agree to comply with and be bound by these Terms of Service. If you do not agree, please discontinue using the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-brand-text">2. Nature of Platform</h2>
          <p>
            PromptVista is an educational prompt discovery platform that curates text prompt formulas, camera settings, and reference visuals. PromptVista is an independent entity and does not directly render or host AI generation inference engines unless explicitly specified.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-brand-text">3. Intellectual Property & License</h2>
          <p>
            Prompt recipes published on PromptVista are made available for personal and commercial creative use. Reference imagery is shared with credit to original creators under respective licenses (e.g., Unsplash Free Commercial License or Creative Commons). If you believe your copyrighted work has been included erroneously, please use our Report Content dialog to submit a removal request.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-brand-text">4. Prohibited Uses</h2>
          <p>
            You agree not to submit prompts designed to generate non-consensual sexual content, hate speech, malware, or illegal material. We reserve the right to remove any reported prompts that violate safety standards.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-brand-text">5. Disclaimer of Warranties</h2>
          <p>
            PromptVista is provided &quot;as is&quot; without warranties of any kind. AI models are non-deterministic and future model versions may produce differing visual results from the same prompt text.
          </p>
        </section>
      </div>
    </div>
  );
};
