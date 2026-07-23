import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { BLOG_POSTS, getPostBySlug } from "@/content/blog-posts";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) return <Navigate to="/blog" replace />;

  const url = `https://privaro.ai/blog/${post.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.date,
      author: { "@type": "Organization", name: "Privaro" },
      publisher: {
        "@type": "Organization",
        name: "Privaro",
        logo: {
          "@type": "ImageObject",
          url: "https://privaro.ai/favicon.ico",
        },
      },
      mainEntityOfPage: url,
      keywords: post.tags.join(", "),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://privaro.ai/" },
        { "@type": "ListItem", position: 2, name: "Blog", item: "https://privaro.ai/blog" },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title={`${post.title} | Privaro Blog`}
        description={post.description}
        path={`/blog/${post.slug}`}
        ogType="article"
        jsonLd={jsonLd}
      />
      <Navbar />

      <article className="pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> All posts
          </Link>

          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full border border-border text-[11px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.1] mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-10 pb-8 border-b border-border">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-4 h-4" /> {post.readingTime} read
            </span>
          </div>

          <div className="text-muted-foreground">{post.content}</div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="py-16 border-t border-border">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-8">Keep reading</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  className="group block p-5 rounded-lg border border-border bg-surface/30 hover:border-primary/40 hover:bg-surface/60 transition-colors"
                >
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {p.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-primary">
                    Read <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogPost;
