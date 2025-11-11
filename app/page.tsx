import Navbar from "@/components/global/navbar";
import Hero from "@/components/landing/hero";
import HoldingPhone from "@/components/landing/holding-phone";
import Footer from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-x-hidden pt-20">
        <section className="bg-white flex items-center min-h-[calc(100vh-80px)]">
          <div className="w-full max-w-6xl mx-auto px-6 py-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <Hero />
              <HoldingPhone />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
