import { Link } from "wouter";
import { Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MapPin,
  Mail,
  Phone,
  Send,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Leaf className="h-5 w-5 text-secondary" />
              <span className="font-bold text-3xl">GREEN PATH</span>
            </div>
            <p className="text-neutral-medium mb-4">
              A community-driven waste management and donation platform designed
              to reduce waste, promote recycling, and support those in need.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-neutral-medium hover:text-white transition"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-neutral-medium hover:text-white transition"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-neutral-medium hover:text-white transition"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-neutral-medium hover:text-white transition"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-neutral-medium hover:text-white transition">
                    Home
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/media">
                  <a className="text-neutral-medium hover:text-white transition">
                    Media Resources
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-neutral-medium hover:text-white transition">
                    About Us
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-neutral-medium hover:text-white transition">
                    Contact Us
                  </a>
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-neutral-medium hover:text-white transition"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-neutral-medium hover:text-white transition"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Features</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-neutral-medium hover:text-white transition"
                >
                  Waste Reporting
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-neutral-medium hover:text-white transition"
                >
                  Scheduled Pickups
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-neutral-medium hover:text-white transition"
                >
                  Donation System
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-neutral-medium hover:text-white transition"
                >
                  Community Events
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-neutral-medium hover:text-white transition"
                >
                  Social Points
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-neutral-medium hover:text-white transition"
                >
                  Educational Resources
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-secondary shrink-0 mt-1 mr-2" />
                <span className="text-neutral-medium">
                  123 Eco Street, Green City, Earth 54321
                </span>
              </li>
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-secondary shrink-0 mt-1 mr-2" />
                <a
                  href="mailto:contact@greenpath.org"
                  className="text-neutral-medium hover:text-white transition"
                >
                  contact@greenpath.org
                </a>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-secondary shrink-0 mt-1 mr-2" />
                <a
                  href="tel:+1234567890"
                  className="text-neutral-medium hover:text-white transition"
                >
                  +123 456 7890
                </a>
              </li>
            </ul>
            <form className="mt-4">
              <label className="text-sm text-neutral-medium block mb-2">
                Subscribe to our newsletter
              </label>
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="rounded-r-none text-neutral-darker focus:outline-none"
                />
                <Button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-l-none hover:bg-primary-dark transition"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="border-t border-neutral-dark mt-10 pt-6 text-center text-neutral-medium text-sm">
          <p>
            &copy; {new Date().getFullYear()} Green Path. All rights reserved.
            Making the world greener, one step at a time.
          </p>
        </div>
      </div>
    </footer>
  );
}
