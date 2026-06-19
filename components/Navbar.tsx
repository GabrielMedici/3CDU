"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { href: "#sobre",       label: "Sobre" },
  { href: "#palestrantes", label: "Palestrantes" },
  { href: "#programacao", label: "Programação" },
  { href: "/galeria/1",  label: "Galeria" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-[rgba(232,170,26,0.15)]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-[100px] flex items-center justify-between">

        {/* ── Logo ────────────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center group -ml-2">
          <div
            className="relative w-[180px] h-[103px] transition-all duration-300 group-hover:scale-105"
            style={{
              filter: "drop-shadow(0 10px 8px rgba(0,0,0,0.4)) drop-shadow(0 0 12px rgba(232,170,26,0.3))",
            }}
          >
            <Image
              src="/images/logo.png"
              alt="Logo 3CDU"
              fill
              sizes="180px"
              className="object-contain"
              style={{ mixBlendMode: "screen" }}
              priority
            />
          </div>
          <div className="hidden sm:block -ml-8">
            <p className="text-[12px] font-semibold tracking-[0.25em] text-[#a399b8] uppercase">
              Unicesumar
            </p>
            <p className="text-lg font-bold text-white leading-tight">
              3º<span className="text-gold-glow">CDU</span>
            </p>
          </div>
        </Link>

        {/* ── Desktop Links ────────────────────────────────────────────── */}
        <ul className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="relative text-sm font-medium text-[#c299ff] hover:text-white transition-colors duration-200 group"
              >
                {link.label}
                {/* underline dourada animada */}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-[#e8aa1a] to-[#f5c842] group-hover:w-full transition-all duration-300" />
              </Link>
            </li>
          ))}
        </ul>

        {/* ── CTA Button ──────────────────────────────────────────────── */}
        <div className="hidden lg:block">
          <Link
            href="https://www.even3.com.br/3cdu/"
            target="_blank"
            rel="noopener noreferrer"
            id="nav-cta-btn"
            className="btn-gold inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold tracking-wide"
          >
            <span>Garantir Ingresso</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>

        {/* ── Mobile Hamburger ─────────────────────────────────────────── */}
        <button
          id="mobile-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden flex flex-col gap-1.5 w-8 h-8 justify-center items-center rounded-lg hover:bg-[rgba(232,170,26,0.1)] transition-colors"
          aria-label="Menu"
        >
          <span
            className={`block w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </nav>

      {/* ── Mobile Menu Dropdown ─────────────────────────────────────────── */}
      <div
        className={`lg:hidden glass border-t border-[rgba(232,170,26,0.1)] transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col px-6 py-4 gap-4">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block text-base font-medium text-[#c299ff] hover:text-white hover:pl-2 transition-all duration-200"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="https://www.even3.com.br/3cdu/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="btn-gold block text-center px-6 py-3 rounded-full text-sm font-bold mt-2"
            >
              Garantir Ingresso
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
