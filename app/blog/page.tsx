import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../SiteHeader";
import { posts } from "./posts";

export const metadata: Metadata = {
  title: "Blog | Lester Heyrana",
  description: "Project notes and a timeline of my work in software, hardware, and machine learning.",
};

export default function Blog() {
  const periods = [...new Set(posts.map(post => post.period))];
  return <main className="blog-page">
    <SiteHeader blog />
    <section className="blog-heading">
      <span className="section-label">BLOG / TIMELINE</span>
      <h1>Notes along<br/><span>the way.</span></h1>
      <p>What I’m building, working on, and figuring out. Newest first.</p>
    </section>
    <div className="blog-timeline">
      {periods.map(period => <section className="timeline-period" key={period} aria-labelledby={`year-${period}`}>
        <h2 id={`year-${period}`}>{period}</h2>
        <ol>{posts.filter(post => post.period === period).map(post => <li key={post.slug}>
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
