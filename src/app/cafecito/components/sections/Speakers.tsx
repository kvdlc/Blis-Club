"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { Linkedin, Instagram } from "lucide-react"
import { speakers, videoUrls } from "@/app/cafecito/data/eventData"
import SectionWrapper from "@/app/cafecito/components/shared/SectionWrapper"
import NeuralNetwork from "@/app/cafecito/components/shared/NeuralNetwork"
import VideoEmbed from "@/components/VideoEmbed"

function SpeakerCard({
  speaker,
  index,
}: {
  speaker: (typeof speakers)[0]
  index: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [glow, setGlow] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setRotateX(-y * 15)
    setRotateY(x * 15)
  }

  const handleMouseEnter = () => setGlow(true)
  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
    setGlow(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group relative rounded-2xl bg-white border border-cafe-200 p-6 transition-all duration-200"
        style={{
          transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          boxShadow: glow
            ? "0 20px 40px -12px rgba(107, 68, 35, 0.25)"
            : "0 4px 20px -4px rgba(0,0,0,0.04)",
          transition: "transform 0.1s ease-out, box-shadow 0.3s ease",
        }}
      >
        {/* Gradient border glow on hover */}
        <div
          className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-cafe-400 via-cafe-500 to-cafe-600 opacity-0 transition-opacity duration-300 -z-10 ${
            glow ? "opacity-100" : ""
          }`}
        />

        {/* Photo */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto mb-5">
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-br from-cafe-400 via-cafe-500 to-cafe-600 blur-md transition-opacity duration-300 ${
              glow ? "opacity-100" : "opacity-0"
            }`}
          />
          <div className="relative w-full h-full rounded-full bg-cafe-100 border-2 border-white overflow-hidden shadow-sm">
            <img
              src={speaker.image}
              alt={speaker.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Name & Title */}
        <h3 className="text-lg font-bold text-cafe-800 text-center">
          {speaker.name}
        </h3>
        <p className="text-cafe-500 text-sm font-medium text-center mb-2">
          {speaker.title}
        </p>

        {/* Topic */}
        <div className="bg-cafe-50 rounded-lg px-3 py-2 mb-3 text-center">
          <p className="text-xs font-semibold text-cafe-700 leading-snug">
            &ldquo;{speaker.topic}&rdquo;
          </p>
        </div>

        {/* Bio */}
        <p className="text-cafe-600/70 text-xs leading-relaxed text-center mb-4 line-clamp-3">
          {speaker.bio}
        </p>

        {/* Social */}
        <div className="flex items-center justify-center gap-3">
          {speaker.social.linkedin && (
            <motion.a
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              href={speaker.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-cafe-100 text-cafe-600 hover:bg-cafe-600 hover:text-white transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </motion.a>
          )}
          {speaker.social.instagram && (
            <motion.a
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              href={speaker.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-cafe-100 text-cafe-600 hover:bg-cafe-600 hover:text-white transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function Speakers() {
  return (
    <section id="speakers" className="relative bg-white py-20 sm:py-28 overflow-hidden">
      <NeuralNetwork color="107, 68, 35" nodeCount={35} maxDistance={180} opacity={0.05} dashSpeed={0.3} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-cafe-100/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-cafe-200/15 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionWrapper className="text-center mb-16" direction="scale" delay={0.1}>
          <span className="text-cafe-500 text-sm font-semibold uppercase tracking-widest">
            Speakers
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-cafe-900 mt-3 mb-4">
            Un grupo de líderes e innovadores
          </h2>
          <p className="text-cafe-600/70 max-w-xl mx-auto text-lg">
            Expertos que compartirán su experiencia y conocimiento práctico para impulsar tu carrera.
          </p>
        </SectionWrapper>

        {/* Speakers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {speakers.map((speaker, i) => (
            <SpeakerCard key={speaker.id} speaker={speaker} index={i} />
          ))}
        </div>

        {/* Interviews Video */}
        {videoUrls.interviews && (
          <SectionWrapper delay={0.2}>
            <VideoEmbed
              url={videoUrls.interviews}
              className="max-w-2xl mx-auto shadow-2xl shadow-cafe-900/10 rounded-2xl overflow-hidden"
            />
          </SectionWrapper>
        )}
      </div>
    </section>
  )
}
