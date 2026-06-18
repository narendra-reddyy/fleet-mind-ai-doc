import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { ProductDemo } from "@/components/landing/ProductDemo";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FleetMind AI — The AI Operations Copilot for Trucking" },
      {
        name: "description",
        content:
          "Upload any fleet document — registrations, insurance, fuel receipts, maintenance, IFTA — and ask anything in plain English. Sourced answers in seconds.",
      },
      { property: "og:title", content: "FleetMind AI — Fleet Operations Copilot" },
      {
        property: "og:description",
        content:
          "Replace your filing cabinet with an AI that knows every document in your fleet.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <ProductDemo />
        <Features />
        <Pricing />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <Toaster theme="dark" />
    </div>
  );
}
