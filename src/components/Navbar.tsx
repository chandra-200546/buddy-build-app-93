import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Compass, MessageCircle, MapPin, Users } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Destinations", href: "/destinations", icon: MapPin },
    { name: "Plan Trip", href: "/plan", icon: Compass },
    { name: "Local Guides", href: "/guides", icon: Users },
    { name: "AI Assistant", href: "/chat", icon: MessageCircle },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-full bg-gradient-warm flex items-center justify-center shadow-warm transition-transform group-hover:scale-110">
              <Compass className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-warm bg-clip-text text-transparent">
              Chandra Tourism
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.name} to={item.href}>
                <Button variant="ghost" className="text-foreground hover:text-primary">
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost">Sign In</Button>
            <Button className="bg-gradient-warm shadow-warm hover:shadow-elegant transition-all">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-border animate-in slide-in-from-top">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              >
                <item.icon className="w-5 h-5 mr-3 text-primary" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
            <div className="px-4 pt-4 space-y-2 border-t border-border">
              <Button variant="outline" className="w-full">Sign In</Button>
              <Button className="w-full bg-gradient-warm">Get Started</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
