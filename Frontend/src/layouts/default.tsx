import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <Navbar />
      <main className="w-full flex-grow pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
