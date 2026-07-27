import { useParams, Link, Navigate } from "react-router-dom";
import { Check, X, ArrowRight, Shield, Scale, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { getComparisonBySlug } from "@/content/comparisons";

const ComparisonPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const cmp = slug ? getComparisonBySlug(slug) : undefined;

  if (!cmp) return <Navigate to="/" replace />;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: cmp.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Privaro", item: "https://privaro.ai/" },
        { "@type": "ListItem", position: 2, name: "Compare", item: "https://privaro.ai/vs" },
        {
          "@type": "ListItem",
          position: 3,
          name: cmp.tagline,
          item: `https://privaro.ai/vs/${cmp.slug}`,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title={cmp.seoTitle}
        description={cmp.seoDescription}
        path={`/vs/${cmp.slug}`}
        jsonLd={jsonLd}
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-border bg-surface/50 text-sm text-muted-foreground">
            <Scale className="w-4 h-4 text-primary" />
            Side-by-side comparison
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.1] mb-6">
            {cmp.hero.h1}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            {cmp.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/demo"
              className="px-8 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Book a Privaro demo
            </Link>
            <Link
              to="/pricing"
              className="px-8 py-3.5 rounded-md border border-border font-medium hover:bg-secondary transition-colors"
            >
              See Privaro pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-base md:text-lg text-muted-foreground italic border-l-2 border-primary pl-6">
            {cmp.summary}
          </p>
        </div>
      </section>

      {/* Positioning */}
      <section className="py-16 px-6 bg-surface/30 border-y border-border">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-primary/40 bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Privaro</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{cmp.positioning.privaro}</p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-bold">{cmp.competitorName}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{cmp.positioning.competitor}</p>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
            Feature by feature
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left">
              <thead className="bg-surface/50">
                <tr>
                  <th className="p-4 font-semibold">Feature</th>
                  <th className="p-4 font-semibold text-primary">Privaro</th>
                  <th className="p-4 font-semibold">{cmp.competitorName}</th>
                </tr>
              </thead>
              <tbody>
                {cmp.rows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-t border-border align-top"
                  >
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className="p-4">
                      <div className="flex items-start gap-2">
                        {row.privaroWins ? (
                          <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        ) : (
                          <span className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span className="text-sm text-muted-foreground">{row.privaro}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-2">
                        {!row.privaroWins ? (
                          <Check className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/60 mt-1 flex-shrink-0" />
                        )}
                        <span className="text-sm text-muted-foreground">{row.competitor}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Best for */}
      <section className="py-20 px-6 bg-surface/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
            Which one is right for you?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-primary/40 bg-card">
              <h3 className="text-lg font-semibold text-primary mb-4">Pick Privaro if…</h3>
              <ul className="space-y-3">
                {cmp.bestFor.privaro.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-lg font-semibold mb-4">Pick {cmp.competitorName} if…</h3>
              <ul className="space-y-3">
                {cmp.bestFor.competitor.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <Check className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {cmp.faq.map((f, i) => (
              <div key={i} className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-semibold text-lg mb-2">{f.q}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related comparisons */}
      <section className="py-16 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">Other comparisons</h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["skyflow", "nightfall", "private-ai"]
              .filter((s) => s !== cmp.slug)
              .map((s) => (
                <Link
                  key={s}
                  to={`/vs/${s}`}
                  className="px-4 py-2 rounded-md border border-border hover:bg-secondary transition-colors text-sm"
                >
                  Privaro vs {s === "private-ai" ? "Private AI" : s === "nightfall" ? "Nightfall AI" : "Skyflow"}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-surface/30 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See Privaro on your own data
          </h2>
          <p className="text-muted-foreground mb-8">
            Book a 20-minute demo and we'll show detection, tokenization and audit running live against a real prompt from your stack.
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Book a demo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ComparisonPage;
