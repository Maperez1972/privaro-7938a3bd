import { useLanguage } from "@/context/LanguageContext";
import type { BlogFaq } from "@/content/blog-posts";

interface BlogFaqSectionProps {
  faq: BlogFaq[];
}

export default function BlogFaqSection({ faq }: BlogFaqSectionProps) {
  const { lang } = useLanguage();
  return (
    <section className="mt-12" aria-labelledby="post-faq-title">
      <h2 id="post-faq-title" className="text-2xl font-bold text-foreground mb-4">
        {lang === "es" ? "Preguntas frecuentes" : "Frequently asked questions"}
      </h2>
      <div className="space-y-3">
        {faq.map((f) => (
          <details key={f.q} className="rounded-lg border border-border bg-surface/30 p-4">
            <summary className="cursor-pointer font-semibold text-foreground">{f.q}</summary>
            <p className="mt-2 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
