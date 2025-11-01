import Navbar from "@/components/global/navbar";
import Hero from "@/components/landing/hero";
import HoldingPhone from "@/components/landing/holding-phone";
import Footer from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-x-hidden flex flex-col">
        <section className="flex-1 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center">
          <div className="w-full max-w-6xl mx-auto px-6 py-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <Hero />
              <HoldingPhone />
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
