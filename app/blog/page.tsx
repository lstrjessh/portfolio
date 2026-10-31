import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../SiteHeader";
import { posts } from "./posts";

export const metadata: Metadata = {
  title: "Blog | Lester Heyrana",
  description: "Project notes and a timeline of my work in software, hardware, and machine learning.",
};

export default function Blog() {
  // Preserve the requested project order, including when a year appears again.
  const groups: { period: string; entries: typeof posts }[] = [];
  for (const post of posts) {
    const previous = groups.at(-1);
    if (previous?.period === post.period) previous.entries.push(post);
    else groups.push({ period: post.period, entries: [post] });
  }
  return <main className="blog-page">
    <SiteHeader blog />
    <section className="blog-heading">
      <span className="section-label">BLOG / TIMELINE</span>
      <h1>Notes along<br/><span>the way.</span></h1>
      <p>Notes on the projects I’m building and the work behind them. Newest first.</p>
    </section>
    <div className="blog-timeline">
      {groups.map(({ period, entries }, index) => <section className="timeline-period" key={`${period}-${index}`} aria-labelledby={`year-${period}-${index}`}>
        <h2 id={`year-${period}-${index}`}>{period}</h2>
        <ol>{entries.map(post => <li key={post.slug}>
          <article>
            <span className="section-label">{post.category}</span>
            <h3><Link href={`/blog/${post.slug}`}>{post.title}<span aria-hidden="true">↗</span></Link></h3>
            <p>{post.summary}</p>
          </article>
        </li>)}</ol>
      </section>)}
    </div>
    <footer><Link href="/">← Portfolio</Link><a href="https://www.linkedin.com/in/lstrjessh/">LinkedIn ↗</a><span>© 2026 LESTER HEYRANA</span><Link href="/privacy">Privacy</Link></footer>
  </main>;
}
