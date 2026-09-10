import { Leaf, Menu, Sprout } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Button } from "./ui/button";

const navItems = [
  { to: "/", label: "Início" },
  { to: "/plantas", label: "Plantas" },
  { to: "/problemas", label: "Diagnóstico" }
];

export function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-primary/95 text-cream backdrop-blur">
        <div className="section-shell flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-semibold">
            <Sprout className="h-6 w-6 text-moss" />
            Florae
          </Link>
          <nav className="hidden items-center gap-7 text-sm md:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "text-moss" : "text-cream/80 hover:text-cream")}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Button className="md:hidden" size="icon" variant="outline" onClick={() => setOpen((value) => !value)} aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        {open && (
          <nav className="section-shell grid gap-3 pb-4 text-sm md:hidden">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className="rounded-md px-2 py-2 text-cream/85 hover:bg-white/10">
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="bg-primary py-10 text-cream">
        <div className="section-shell flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Leaf className="h-5 w-5 text-moss" />
              Florae
            </div>
            <p className="mt-2 max-w-xl text-sm text-cream/70">Guia elegante para conhecer, cuidar e administrar informações sobre plantas.</p>
          </div>
          <p className="text-sm text-cream/60">React + Tailwind + Express + Prisma</p>
        </div>
      </footer>
    </div>
  );
}
