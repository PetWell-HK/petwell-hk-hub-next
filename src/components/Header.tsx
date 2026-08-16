import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, LogIn, ChevronDown } from "lucide-react";
const logo = "/assets/logo.png";
import LanguageSwitcher from "./LanguageSwitcher";
import NameTagBanner from "./NameTagBanner";
import UserAccountMenu from "./UserAccountMenu";
import { useAuth } from "@/contexts/AuthContext";
import { signOutUser } from "@/services/authService";
import { useAuthPanel } from "@/contexts/AuthPanelContext";
const PET_FRIENDLY_PATHS = ["/restaurants", "/pet-friendly-restaurants", "/salons", "/lodging", "/clinics", "/malls", "/home-visits"];
const SECONDARY_LINKS = [{ to: "/terms", translationKey: "footer.terms" }];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isAuthenticated, userInfo, setIsAuthenticated } = useAuth();
  const showAccountMenu = isAuthenticated === true && Boolean(userInfo);
  const authResolved = isAuthenticated !== null;
  const { openPanel } = useAuthPanel();

  const isPetFriendlyActive = PET_FRIENDLY_PATHS.some(
    (path) => location.pathname === path || location.pathname.startsWith(path + "/")
  );

  const handleLogout = async () => {
    try {
      await signOutUser();
      setIsAuthenticated(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navLinks = [
    { to: "/", label: t('nav.home') },
    {
      petFriendly: true,
      to: "/restaurants",
      label: t('nav.petFriendly'),
      children: [
        { to: "/restaurants", label: t('nav.restaurants') },
        { to: "/clinics", label: t('nav.clinics') },
        { to: "/home-visits", label: t('nav.homeVisits') },
        { to: "/salons", label: t('nav.salons') },
        { to: "/lodging", label: t('nav.lodging') },
        { to: "/malls", label: t('nav.malls') },
      ],
    },
    { to: "/forum", label: t('nav.forum') },
    { to: "/pet-activities", label: t('nav.petActivities') },
    { to: "/owner-zone", label: t('nav.blog') },
    { to: "/other-services", label: t('nav.otherServices') },
    { to: "/about", label: t('nav.about') },
  ];

  const isActivePath = (path: string) =>
    location.pathname === path || (path !== "/" && location.pathname.startsWith(path + "/"));

  return (
    <header className="sticky top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm flex flex-col">
      <NameTagBanner />
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logo} alt={t("nav.logoAlt")} className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              if ("petFriendly" in link && link.petFriendly) {
                return (
                  <DropdownMenu key="pet-friendly">
                    <DropdownMenuTrigger
                      aria-label={t('nav.petFriendly')}
                      aria-haspopup="menu"
                      className={`inline-flex items-center gap-1.5 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-md py-1.5 px-2 -mx-1 hover:text-primary data-[state=open]:text-primary [&>svg]:data-[state=open]:rotate-180 [&>svg]:transition-transform ${
                        isPetFriendlyActive ? "text-primary" : "text-foreground"
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      side="bottom"
                      sideOffset={6}
                      className="min-w-[200px]"
                      alignOffset={0}
                    >
                      {link.children.map((child) => (
                        <DropdownMenuItem key={child.to} asChild>
                          <Link to={child.to}>{child.label}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }
              const isActive = isActivePath(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`font-medium transition-colors rounded-md px-1 -mx-1 hover:text-primary ${
                    isActive ? "text-primary" : "text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher />
            {!authResolved || (isAuthenticated && !userInfo) ? (
              <span className="h-9 w-9 rounded-full bg-muted animate-pulse" aria-hidden />
            ) : showAccountMenu ? (
              <UserAccountMenu variant="desktop" onLogout={handleLogout} />
            ) : (
              <Button
                variant="outline"
                onClick={() => openPanel("LANDING")}
                className="items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                {t('auth.login')}
              </Button>
            )}

            <Button 
              onClick={() => navigate("/download")}
              className="bg-background border-2 border-primary text-primary hover:bg-gradient-primary hover:text-primary-foreground transition-all shadow-soft"
            >
              {t('hero.cta')}
            </Button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Button 
              onClick={() => navigate("/download")}
              className="bg-background border-2 border-primary px-3 text-primary shadow-soft transition-all hover:bg-gradient-primary hover:text-primary-foreground"
            >
              {t('hero.cta')}
            </Button>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">{t("nav.openMenu")}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100vw-1rem,350px)] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <img src={logo} alt={t("nav.logoAlt")} className="h-8 w-auto" />
                  </SheetTitle>
                </SheetHeader>
                {showAccountMenu ? (
                  <div className="mt-6">
                    <UserAccountMenu
                      variant="mobile"
                      onLogout={handleLogout}
                      onNavigate={() => setIsOpen(false)}
                    />
                  </div>
                ) : null}
                <nav className={`${showAccountMenu ? "mt-6" : "mt-8"} flex flex-col gap-6`}>
                  {navLinks.map((link) => {
                    if ("petFriendly" in link && link.petFriendly) {
                      return (
                        <div key="pet-friendly-mobile" className="flex flex-col gap-2">
                          <Link
                            to={link.to}
                            onClick={() => setIsOpen(false)}
                            className={`text-lg font-medium transition-colors ${
                              isPetFriendlyActive ? "text-primary" : "text-foreground hover:text-primary"
                            }`}
                          >
                            {link.label}
                          </Link>
                          <div className="pl-4 flex flex-col gap-1 border-l-2 border-border">
                            {link.children.map((child) => (
                              <Link
                                key={child.to}
                                to={child.to}
                                onClick={() => setIsOpen(false)}
                                className="text-base text-muted-foreground hover:text-primary transition-colors"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    const isActive = isActivePath(link.to);
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setIsOpen(false)}
                        className={`text-lg font-medium transition-colors ${
                          isActive ? "text-primary" : "text-foreground hover:text-primary"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}

                  <div className="space-y-2 border-t border-border pt-4">
                    {SECONDARY_LINKS.map((link) => {
                      const isActive = isActivePath(link.to);

                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setIsOpen(false)}
                          className={`block text-base font-medium transition-colors ${
                            isActive ? "text-primary" : "text-foreground hover:text-primary"
                          }`}
                        >
                          {t(link.translationKey)}
                        </Link>
                      );
                    })}
                  </div>
                  
                  <div className="pt-4 border-t border-border space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isAuthenticated === false ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            openPanel("LANDING");
                            setIsOpen(false);
                          }}
                          className="justify-start"
                        >
                          <LogIn className="h-4 w-4 mr-2" />
                          {t('auth.login')}
                        </Button>
                      ) : null}
                      <LanguageSwitcher />
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
