import React from 'react';
import { Compass, Copy, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      icon: Compass,
      title: 'Discover Reference Visuals',
      description:
        'Browse curated editorial aesthetics, high-resolution textures, cinematography, and product photography across 12 distinct artistic disciplines.',
    },
    {
      step: '02',
      icon: Copy,
      title: 'Copy the Tested Prompt',
      description:
        'Inspect camera lens configurations, lighting ratios, aspect ratios, negative prompts, and copy the full text recipe with a single click.',
    },
    {
      step: '03',
      icon: Sparkles,
      title: 'Create in Your Preferred Tool',
      description:
        'Paste directly into Midjourney, Stable Diffusion, DALL-E 3, Flux.1, or Adobe Firefly and generate breathtaking original variations.',
    },
  ];

  return (
    <section className="py-20 border-t border-brand-border/60 bg-brand-surface/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-lavender bg-brand-violet/10 px-3 py-1 rounded-full border border-brand-violet/20">
            Seamless Creation
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-brand-text tracking-tight">
            How PromptVista Works
          </h2>
          <p className="mt-3 text-sm text-brand-muted">
            Three simple steps between seeing inspiration and generating your next creative masterpiece.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative bg-brand-card p-8 rounded-2xl border border-brand-border hover:border-brand-violet/40 transition-all duration-300 hover:shadow-card flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-brand-violet/10 border border-brand-violet/20 flex items-center justify-center text-brand-lavender group-hover:bg-brand-violet group-hover:text-white transition-all duration-300 shadow-glow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-brand-border font-mono group-hover:text-brand-violet/30 transition-colors">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-brand-text mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-brand-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-brand-border/60 flex items-center text-xs font-semibold text-brand-lavender group-hover:text-white transition-colors">
                  <span>Step {index + 1} of 3</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Callout */}
        <div className="mt-12 text-center">
          <Link
            to="/explore"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-violet hover:bg-brand-violet-hover text-white text-sm font-semibold transition-all shadow-glow-sm hover:shadow-glow-violet"
          >
            <span>Start Exploring Prompts</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
