import Image from "next/image";
import Link from "next/link";

export default function SiteHeader({ blog = false, designs = false }: { blog?: boolean; designs?: boolean }) {
  return <header className="site-header">
    <Link className="brand" href="/"><Image className="header-monogram" src="/monogram.svg" width={40} height={40} alt="" /><span>lesterjessh<span className="domain-suffix">.space</span></span></Link>
    <nav aria-label="Main navigation">
      <Link href="/#work">Projects</Link>
      <Link href="/designs" aria-current={designs ? "page" : undefined}>Designs</Link>
      <Link href="/#about">About</Link>
      <Link href="/blog" aria-current={blog ? "page" : undefined}>Blog</Link>
      <a className="nav-cta" href="mailto:lesterjess.heyrana@g.msuiit.edu.ph">Get in touch <span>↗</span></a>
    </nav>
  </header>;
}
