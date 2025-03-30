import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Newspaper, Mail, FileText, Rss, Menu, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { BASE_URL } from "@/consts/general-const";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

function NavItem({ href, icon, children, onClick }: NavItemProps) {
  const [location] = useLocation();
  const active = location === href;

  return (
    <Link href={href}>
      <div
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer",
          active
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted"
        )}
      >
        {icon}
        <span>{children}</span>
      </div>
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyRss = async () => {
    try {
      await navigator.clipboard.writeText(`${BASE_URL}/api/rss`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy RSS link:', err);
    }
  };

  const navItems = (onClick?: () => void) => (
    <>
      <NavItem href="/" icon={<Newspaper className="h-4 w-4" />} onClick={onClick}>
        Home
      </NavItem>
      <NavItem href="/articles" icon={<FileText className="h-4 w-4" />} onClick={onClick}>
        Articles
      </NavItem>
      <NavItem href="/newsletters" icon={<Mail className="h-4 w-4" />} onClick={onClick}>
        Newsletters
      </NavItem>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 border-b bg-background/95 backdrop-blur z-50">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center">
            <div className="mr-4 font-semibold">Newsletter Hub</div>
            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-2">
              {navItems()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyRss}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Rss className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? 'Copied!' : 'Copy RSS Link'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[240px] sm:w-[280px]">
                  <nav className="flex flex-col gap-2 mt-4">
                    {navItems(() => setIsOpen(false))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
      <main className="container pt-20 pb-8">{children}</main>
    </div>
  );
}