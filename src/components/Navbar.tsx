"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, HeartPulse, Search } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home", Icon: Home },
    { href: "/history", label: "History", Icon: ClipboardList },
    { href: "/status", label: "Status", Icon: HeartPulse },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-inner">
            {/* Logo */}
            <Link href="/" className="navbar-logo">
              <div className="logo-container">
                <div className="logo-icon-wrapper">
                  <Search size={16} strokeWidth={2.5} color="white" />
                </div>
              </div>
              <div className="logo-text">
                <span>Vendor</span>
                <span className="text-gradient">Discovery</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <ul className="navbar-nav desktop-nav">
              {navLinks.map(({ href, label, Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={pathname === href ? "active" : ""}
                  >
                    <Icon size={15} strokeWidth={2} />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <div className="mobile-bottom-nav">
        {navLinks.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`mobile-nav-link ${pathname === href ? "active" : ""}`}
          >
            <Icon size={20} strokeWidth={2} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
