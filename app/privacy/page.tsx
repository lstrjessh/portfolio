import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../SiteHeader";

export const metadata: Metadata = {
  title: "Privacy | Lester Heyrana",
  description: "Privacy information for Lester Heyrana’s portfolio. This site does not run analytics.",
};

export default function Privacy() {
  return <main className="blog-page"><SiteHeader />
    <article className="blog-post privacy-policy">
      <span className="section-label">SITE INFORMATION</span>
      <h1>Privacy policy</h1>
      <div className="post-body">
        <h2>No analytics</h2>
        <p>This site does not run analytics, advertising trackers, or session recording tools.</p>
        <h2>Visiting the site</h2>
        <p>You do not need an account to browse this portfolio or blog. The hosting provider may process technical information, such as IP addresses and request logs, to serve and secure the site.</p>
        <h2>Getting in touch</h2>
        <p>If you email me, I use the information you share to respond to your message.</p>
        <h2>External links</h2>
        <p>Links to GitHub, LinkedIn, research papers, and project sites take you to services with their own privacy policies.</p>
        <h2>Questions</h2>
        <p>Contact <a href="mailto:lesterjess.heyrana@g.msuiit.edu.ph">lesterjess.heyrana@g.msuiit.edu.ph</a> with any questions about this policy.</p>
      </div>
    </article>
    <footer><Link href="/">← Portfolio</Link><span>© 2026 LESTER HEYRANA</span><Link href="/privacy" aria-current="page">Privacy</Link></footer>
  </main>;
}
