"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Dashboard", href: "/recruiter" },
  { name: "Upload Resume", href: "/upload" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none"
    >
      <div className="glass-nav px-6 py-3.5 rounded-2xl flex items-center justify-between gap-10 pointer-events-auto">
        <Link href="/" className="group flex items-center gap-1.5 transition-transform duration-300 hover:scale-[1.02]">
          <span className="font-display text-xl tracking-tight">
            <span className="font-bold text-text-primary">Talent</span>
            <span className="font-light text-text-muted">Scout</span>
          </span>
          <div className="w-1.5 h-1.5 bg-accent rounded-sm" />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium transition-colors duration-300 ${
                  isActive ? "text-text-primary" : "text-text-muted hover:text-text-primary"
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full"
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <Link href="/upload" className="btn-primary px-7 py-2.5 text-[0.9375rem] hidden sm:inline-flex">
          Get Started
        </Link>
      </div>
    </motion.nav>
  );
}
