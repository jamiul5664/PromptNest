import { useEffect } from 'react';

interface DocumentHeadProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  canonicalUrl?: string;
}

export function useDocumentHead({
  title,
  description,
  imageUrl,
  canonicalUrl,
}: DocumentHeadProps) {
  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = `${title} | PromptVista`;
    } else {
      document.title = 'PromptVista — See It. Copy It. Create It. | Premium AI Image Prompts';
    }

    // 2. Helper to set or create meta tag
    const setMetaTag = (selector: string, attribute: 'name' | 'property', attrValue: string, content: string) => {
      let meta = document.querySelector(selector) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, attrValue);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Description
    if (description) {
      setMetaTag('meta[name="description"]', 'name', 'description', description);
      setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
      setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    }

    // OpenGraph Title
    if (title) {
      setMetaTag('meta[property="og:title"]', 'property', 'og:title', `${title} | PromptVista`);
      setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', `${title} | PromptVista`);
    }

    // Image Preview
    if (imageUrl) {
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', imageUrl);
      setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);
    }

    // Canonical link
    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonicalUrl);
    }
  }, [title, description, imageUrl, canonicalUrl]);
}
