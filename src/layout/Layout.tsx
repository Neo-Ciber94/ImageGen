import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-full min-h-screen flex-col justify-between overflow-hidden">
      <Header />
      <div className="container mx-auto flex-grow">{children}</div>
      <Footer />
    </main>
  );
}
