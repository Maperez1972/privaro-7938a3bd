import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getRelatedPages } from "@/content/blog-related";
import type { LocalizedBlogPost } from "@/content/blog-posts";

interface BlogRelatedPagesProps {
  post: LocalizedBlogPost;
}

export default function BlogRelatedPages({ post }: BlogRelatedPagesProps) {
  const { lang } = useLanguage();
  const pages = getRelatedPages(post, lang);
  return (
    <aside className="mt-12 pt-8 border-t border-border" aria-labelledby="related-pages-title">
      <h2 id="related-pages-title" className="text-xl font-bold text-foreground mb-4">
        {lang === "es" ? "Sigue explorando Privaro" : "Keep exploring Privaro"}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-3">
        {pages.map((p) => (
          <li key={p.path}>
            <Link
              to={p.path}
              className="group block h-full p-4 rounded-lg border border-border bg-surface/30 hover:border-primary/40 transition-colors"
            >
              <span className="flex items-center gap-1 font-semibold text-foreground group-hover:text-primary transition-colors">
                {p.title} <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <span className="block mt-1 text-sm text-muted-foreground">{p.desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
