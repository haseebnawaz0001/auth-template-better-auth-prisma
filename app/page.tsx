import Navbar from "@/components/navbar/navbar";
import Features from "@/components/template/feature";
import Footer from "@/components/template/footer";
import Hero from "@/components/template/hero";
import Testimonial from "@/components/template/testimonials";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Features />
      <Testimonial />
      <Footer />
    </div>
  );
}
