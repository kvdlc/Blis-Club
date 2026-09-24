import { candidate } from "@/data/campaign";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { Stats } from "@/components/sections/Stats";
import { About } from "@/components/sections/About";
import { SloganMeaning } from "@/components/sections/SloganMeaning";
import { Diagnostico } from "@/components/sections/Diagnostico";
import { Proposals } from "@/components/sections/Proposals";
import { InternetGratis } from "@/components/sections/InternetGratis";
import { Galeria } from "@/components/sections/Galeria";
import { Agenda } from "@/components/sections/Agenda";
import { Voices } from "@/components/sections/Voices";
import { News } from "@/components/sections/News";
import { Faq } from "@/components/sections/Faq";
import { Join } from "@/components/sections/Join";
import { Donate } from "@/components/sections/Donate";
import { Contact } from "@/components/sections/Contact";
import { SiteFooter } from "@/components/sections/SiteFooter";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: candidate.name,
  alternateName: candidate.nickname,
  jobTitle: candidate.position,
  description: candidate.sloganLong,
  address: {
    "@type": "PostalAddress",
    addressLocality: candidate.city,
    addressRegion: candidate.province,
    addressCountry: "EC",
  },
  affiliation: { "@type": "Organization", name: candidate.movement },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Marquee />
        <Stats />
        <About />
        <SloganMeaning />
        <Diagnostico />
        <Proposals />
        <InternetGratis />
        <Galeria />
        <Agenda />
        <Voices />
        <News />
        <Faq />
        <Join />
        <Donate />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
