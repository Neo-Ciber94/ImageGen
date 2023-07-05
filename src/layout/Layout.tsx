import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-screen flex-col justify-between">
      <Header />
      <div className="container h-full">{children}</div>
      <Footer />
    </main>
  );
}
