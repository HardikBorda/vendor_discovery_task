import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import ShortlistBuilder from "@/components/ShortlistBuilder";
import { Search, Scale, Rocket, BarChart2, Loader2 } from "lucide-react";

export default function Home() {
  const steps = [
    {
      n: "1",
      Icon: Search,
      title: "Describe Your Need",
      desc: "Tell us what software or service you're looking for",
    },
    {
      n: "2",
      Icon: Scale,
      title: "Set Requirements",
      desc: "Add requirements and weight their importance",
    },
    {
      n: "3",
      Icon: Rocket,
      title: "Build Shortlist",
      desc: "AI researches vendors and scores them for you",
    },
    {
      n: "4",
      Icon: BarChart2,
      title: "Compare & Decide",
      desc: "View cards or table, export, and save history",
    },
  ];

  return (
    <div className="page-wrapper">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="hero">
          <div className="container">
            <div className="hero-badge">
              <Search size={12} strokeWidth={2.5} />
              <span>AI-Powered Vendor Research</span>
            </div>

            <h1 className="hero-title">
              Find the right vendor
              <br />
              <span className="gradient-text">in minutes, not days</span>
            </h1>

            <p className="hero-subtitle">
              Describe your need, set weighted requirements, and get a
              comprehensive vendor comparison with pricing, features, risks,
              and evidence links — all in one place.
            </p>

            {/* Steps */}
            <div className="steps-grid">
              {steps.map(({ n, Icon, title, desc }) => (
                <div key={n} className="step-item">
                  <div className="step-num">{n}</div>
                  <Icon
                    size={22}
                    strokeWidth={1.5}
                    color="var(--brand)"
                  />
                  <div className="step-title">{title}</div>
                  <div className="step-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Builder */}
        <section style={{ paddingBottom: "var(--space-3xl)" }}>
          <div className="container">
            <Suspense fallback={
              <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-8)" }}>
                <Loader2 size={28} color="var(--brand)" style={{ animation: "spin 1s linear infinite" }} />
              </div>
            }>
              <ShortlistBuilder />
            </Suspense>
          </div>
        </section>
      </main>
    </div>
  );
}
