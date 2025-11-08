import { Link } from "@heroui/link";

import { Navbar } from "@/components/navbar";

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
      <footer className="w-full flex items-center justify-center py-3 bg-black/40 backdrop-blur-md border-t border-gray-800">
        <Link
          isExternal
          className="flex items-center gap-1 text-current"
          href="https://verimint.io"
          title="VeriMint homepage"
        >
          <span className="text-gray-400">Powered by</span>
          <p className="text-orange-500">VeriMint</p>
        </Link>
      </footer>
    </div>
  );
}
