import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../SiteHeader";
import ProjectVisual from "../../ProjectVisual";
import { posts } from "../posts";

const visuals: Record<string, string[]> = {
  "working-on-gakit": ["01"],
  "portable-spectrophotometer": ["02"],
  "geosafe-satellite-mapping": ["03"],
  "drowsiness-detection-on-device": ["06"],
  "scanning-and-classifying-3d-shapes": ["07", "04"],
};

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find(post => post.slug === slug);
  return post ? { title: `${post.title} | Lester Heyrana`, description: post.summary } : {};
}

export default async function Post({ params }: Props) {
  const { slug } = await params;
  const post = posts.find(post => post.slug === slug);
  if (!post) notFound();
  return <main className="blog-page"><SiteHeader blog />
    <article className="blog-post">
      <Link className="back-link" href="/blog">← All notes</Link>
      <div className="section-label">{post.period} / {post.category}</div>
      <h1>{post.title}</h1>
      <div className="post-intro post-body"><p>{post.paragraphs[0]}</p></div>
      <div className="post-content-grid"><div className="post-body">{post.paragraphs.slice(1).map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      <div className="post-links">{post.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label} <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>)}</div></div><aside className="post-visuals" aria-label="Project illustration">{visuals[slug]?.map(id => <ProjectVisual key={id} id={id} />)}</aside></div>
    </article>
    <footer><Link href="/blog">← Timeline</Link><span>© 2026 LESTER HEYRANA</span><Link href="/privacy">Privacy</Link></footer>
  </main>;
}
