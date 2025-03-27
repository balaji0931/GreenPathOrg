import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Header() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => location === path;

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link 
      href={href}
      className={`font-medium transition ${
        isActive(href)
          ? "text-primary"
          : "text-neutral-darker hover:text-primary"
      }`}
    >
      {children}
    </Link>
  );

  const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <SheetClose asChild>
      <Link 
        href={href}
        className={`block py-2 font-medium transition ${
          isActive(href)
            ? "text-primary"
            : "text-neutral-darker hover:text-primary"
        }`}
      >
        {children}
      </Link>
    </SheetClose>
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl text-primary">Green Path</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/media">Media</NavLink>
          <NavLink href="/about">About Us</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Button variant="outline" className="hidden md:inline-flex" asChild>
                <Link href={`/dashboard/${user.role}`}>
                  Dashboard
                </Link>
              </Button>
              <Button onClick={handleLogout} variant="default">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Login
                </Button>
              </Link>
              <Link href="/auth">
                <Button variant="default" className="hidden md:inline-flex">
                  Register
                </Button>
              </Link>
            </>
          )}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                <MobileNavLink href="/">Home</MobileNavLink>
                <MobileNavLink href="/media">Media</MobileNavLink>
                <MobileNavLink href="/about">About Us</MobileNavLink>
                <MobileNavLink href="/contact">Contact</MobileNavLink>
                {user && (
                  <MobileNavLink href={`/dashboard/${user.role}`}>
                    Dashboard
                  </MobileNavLink>
                )}
                {!user ? (
                  <MobileNavLink href="/auth">Login / Register</MobileNavLink>
                ) : (
                  <SheetClose asChild>
                    <Button onClick={handleLogout} variant="destructive" className="mt-4">
                      Logout
                    </Button>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
