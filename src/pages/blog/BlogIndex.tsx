import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { getLocalizedPosts } from "@/content/blog-posts";
import { useLanguage } from "@/context/LanguageContext";

const BlogIndex = () => {
  const { lang, t } = useLanguage();
  const posts = getLocalizedPosts(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Privaro Blog",
    url: "https://privaro.ai/blog",
    description: t("blog.index.seoDesc"),
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      url: `https://privaro.ai/blog/${p.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title={t("blog.index.seoTitle")}
        description={t("blog.index.seoDesc")}
        path="/blog"
        jsonLd={jsonLd}
      />
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-border bg-surface/50 text-sm text-muted-foreground">
            <BookOpen className="w-4 h-4 text-primary" />
            {t("blog.index.badge")}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.1] mb-4">
            {t("blog.index.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-12">
            {t("blog.index.subtitle")}
          </p>

          <div className="grid gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group block p-6 rounded-lg border border-border bg-surface/30 hover:border-primary/40 hover:bg-surface/60 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <span>·</span>
                  <span>{post.readingTime} {t("blog.read")}</span>
                  <span>·</span>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full border border-border text-[11px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground mb-4">{post.description}</p>
                <span className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                  {t("blog.readPost")} <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogIndex;
