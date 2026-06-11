"use client"

import { useState } from "react"
import Hero from "./components/sections/Hero"
import CountdownBanner from "./components/sections/CountdownBanner"
import Schedule from "./components/sections/Schedule"
import Speakers from "./components/sections/Speakers"
import About from "./components/sections/About"
import Pricing from "./components/sections/Pricing"
import Bonus from "./components/sections/Bonus"
import Testimonials from "./components/sections/Testimonials"
import Gallery from "./components/sections/Gallery"
import Sponsors from "./components/sections/Sponsors"
import FAQ from "./components/sections/FAQ"
import EventDay from "./components/sections/EventDay"
import Contact from "./components/sections/Contact"
import ShareSection from "./components/sections/ShareSection"
import StickyCTA from "./components/layout/StickyCTA"
import VideoEmbed from "@/components/VideoEmbed"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { videoUrls } from "./data/eventData"

export default function CafecitoClient() {
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <main className="font-sans">
      <Hero onWatchVideo={() => setVideoOpen(true)}>
        <CountdownBanner />
      </Hero>

      <Schedule />
      <Speakers />
      <About />
      <Pricing onVideo={() => setVideoOpen(true)} />
      <Bonus />
      <Testimonials />
      <Gallery />
      <Sponsors />
      <ShareSection />
      <FAQ />
      <EventDay />
      <Contact />
      <StickyCTA />

      {/* Video Modal */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-3xl p-0 bg-transparent border-none shadow-none">
          <VideoEmbed
            url={videoUrls.pastConference || videoUrls.hero}
            className="w-full rounded-2xl overflow-hidden"
          />
        </DialogContent>
      </Dialog>
    </main>
  )
}
