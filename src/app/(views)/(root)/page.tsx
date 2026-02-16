"use client";

import { getAbout } from "@/services/about";
import { useQuery } from "@tanstack/react-query";
import { Header } from "./sections/Header";
import { HeroSection } from "./sections/Hero";
import { ProjectsSection } from "./sections/projects";
import { TapeSection } from "./sections/Tape";
import { WorkExperienceSection } from "./sections/WorkExperience";
import { AboutSection } from "./sections/About";
import { ContactSection } from "./sections/Contact";
import { FooterSection } from "./sections/Footer";

export default function LandingPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["getAbout"],
    queryFn: getAbout,
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  );

  if (isError || !data) return <p>Error</p>;

  return (
    <>
    <Header />

    <section id="hero">
        <HeroSection home={data} />
      </section>

      <section id="projects">
        <ProjectsSection home={data} />
      </section>

      <section aria-hidden className="min-h-30">
        <TapeSection
          rotation="-rotate-3"
          animation="animate-move-left [animation-duration:400s]"
        />
      </section>

      <section id="work-experience">
        <WorkExperienceSection home={data} />
      </section>

      <section aria-hidden className="min-h-30">
        <TapeSection
          rotation="rotate-3"
          animation="animate-move-right [animation-duration:400s]"
        />
      </section>

      <section id="about">
        <AboutSection home={data} />
      </section>

      <section id="contact">
        <ContactSection />
      </section>

      <section aria-label="footer">
        <FooterSection home={data} />
      </section>
    </>
  );
}
