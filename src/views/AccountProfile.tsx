"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Camera,
  Loader2,
  LogOut,
  MessageSquareText,
  Pencil,
  Plus,
  Smartphone,
  Trash2,
  UserRound,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AppDownloadCTA } from "@/components/AppDownloadCTA";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthPanel } from "@/contexts/AuthPanelContext";
import { useSEO } from "@/hooks/useSEO";
import { toast } from "@/hooks/use-toast";
import { useMyAccountProfile, useUpdateMyAccountProfile } from "@/hooks/useMyAccountProfile";
import { signOutUser } from "@/services/authService";
import {
  formatDisplayPhone,
  getAccountDisplayName,
  isHongKongPhone,
  isSharedPet,
  isSharingPet,
  MAX_ACCOUNT_PETS,
  toFormPhone,
  type AccountPet,
} from "@/services/accountApi";
import { resolveProfileImageUrl } from "@/utils/reviewDisplay";
import { cn } from "@/lib/utils";

const SPECIES_I18N_KEY: Record<string, string> = {
  dog: "petTag.speciesValues.dog",
  dogs: "petTag.speciesValues.dogs",
  cat: "petTag.speciesValues.cat",
  cats: "petTag.speciesValues.cats",
};

const AccountProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, userInfo, setIsAuthenticated } = useAuth();
  const { openPanel } = useAuthPanel();
  const userId = userInfo?.userId;
  const isLoggedIn = isAuthenticated === true && Boolean(userId);
  const isAuthPending = isAuthenticated !== false && !isLoggedIn;
  const { data: profile, isLoading, isError } = useMyAccountProfile();
  const showLoading = isAuthPending || (isLoggedIn && isLoading);
  const updateProfile = useUpdateMyAccountProfile();

  const [editOpen, setEditOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useSEO({
    title: `${t("accountProfile.title")} | PetWell`,
    description: t("accountProfile.seoDescription"),
    canonicalUrl: "https://petwellhk.com/account",
  });

  useEffect(() => {
    if (isAuthenticated === false) {
      openPanel("LANDING");
    }
  }, [isAuthenticated, openPanel]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const displayName = getAccountDisplayName(profile, userInfo?.username) || userInfo?.email || "";
  const email = profile?.email || userInfo?.rawEmail || userInfo?.email || "";
  const avatarUrl = resolveProfileImageUrl(profile?.profileImage);
  const initials = (displayName || email || "?").charAt(0).toUpperCase();
  const pets = profile?.pets ?? [];

  const openEdit = () => {
    setFirstName(profile?.firstName || "");
    setLastName(profile?.lastName || "");
    setPhone(toFormPhone(profile?.phone));
    setAddress(profile?.address || "");
    setAvatarFile(null);
    setAvatarPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setEditOpen(true);
  };

  const handleAvatarChange = (file?: File) => {
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      toast({ title: t("accountProfile.firstNameRequired"), variant: "destructive" });
      return;
    }
    if (!lastName.trim()) {
      toast({ title: t("accountProfile.lastNameRequired"), variant: "destructive" });
      return;
    }
    if (!isHongKongPhone(phone)) {
      toast({ title: t("accountProfile.phoneInvalid"), variant: "destructive" });
      return;
    }

    try {
      await updateProfile.mutateAsync({
        firstName,
        lastName,
        phone,
        address,
        avatarFile,
      });
      setEditOpen(false);
      toast({ title: t("accountProfile.saveSuccess") });
    } catch (error) {
      console.error("Failed to update account profile", error);
      toast({ title: t("accountProfile.saveFailed"), variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setIsAuthenticated(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const localizeSpecies = (species?: string | null) => {
    if (!species) return "";
    const key = SPECIES_I18N_KEY[species.trim().toLowerCase()];
    return key ? t(key) : species;
  };

  const petMeta = (pet: AccountPet) => {
    const parts = [
      pet.breed?.trim(),
      localizeSpecies(pet.species),
      typeof pet.weight === "number" && pet.weight > 0
        ? t("accountProfile.weightKg", { weight: pet.weight })
        : "",
    ].filter(Boolean);
    return parts.join(" · ");
  };

  const editAvatarSrc = avatarPreview || avatarUrl;

  const infoRows = useMemo(
    () => [
      { label: t("accountProfile.phone"), value: formatDisplayPhone(profile?.phone) },
      { label: t("accountProfile.address"), value: profile?.address?.trim() || "" },
    ],
    [profile?.address, profile?.phone, t],
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="mb-2 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-primary">{t("nav.home")}</Link>
              <span className="mx-2">/</span>
              <span>{t("accountProfile.breadcrumb")}</span>
            </div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-4xl">
              <UserRound className="h-6 w-6 text-primary md:h-8 md:w-8" />
              {t("accountProfile.title")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              {t("accountProfile.subtitle")}
            </p>
          </div>
        </section>

        <section className="container mx-auto max-w-3xl px-4 py-8">
          {showLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t("accountProfile.loading")}
            </div>
          ) : isAuthenticated === false ? (
            <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-8 text-center">
              <h2 className="mb-2 text-lg font-semibold">{t("accountProfile.loginRequiredTitle")}</h2>
              <p className="mb-5 text-sm text-muted-foreground">{t("accountProfile.loginRequiredBody")}</p>
              <Button onClick={() => openPanel("LANDING")}>{t("auth.login")}</Button>
            </div>
          ) : isError || !profile ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              {t("accountProfile.loadFailed")}
            </div>
          ) : (
            <div className="space-y-6">
              <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border border-border md:h-24 md:w-24">
                    {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
                    <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">
                      {t("userReviews.memberBadge")}
                    </p>
                    <h2 className="truncate text-xl font-bold md:text-2xl">{displayName}</h2>
                    {email ? (
                      <p className="truncate text-sm text-muted-foreground">{email}</p>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">{t("accountProfile.personalInfo")}</h3>
                  <Button variant="outline" size="sm" onClick={openEdit} className="gap-1.5">
                    <Pencil className="h-3.5 w-3.5" />
                    {t("accountProfile.edit")}
                  </Button>
                </div>
                <dl className="space-y-3">
                  {infoRows.map((row) => (
                    <div key={row.label} className="flex items-start justify-between gap-4">
                      <dt className="text-sm text-muted-foreground">{row.label}</dt>
                      <dd className="text-right text-sm font-medium">
                        {row.value || t("accountProfile.notSet")}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">{t("accountProfile.myPets")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("accountProfile.petCount", { count: pets.length, max: MAX_ACCOUNT_PETS })}
                  </p>
                </div>

                {pets.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
                    <p className="font-medium">{t("accountProfile.noPets")}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{t("accountProfile.noPetsHint")}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pets.map((pet) => {
                      const petImage = resolveProfileImageUrl(pet.profileImage);
                      const shared = isSharedPet(pet, userId);
                      const sharing = isSharingPet(pet, userId);
                      return (
                        <button
                          key={pet.id}
                          type="button"
                          onClick={() => setDownloadOpen(true)}
                          className="flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40"
                        >
                          <Avatar className="h-12 w-12">
                            {petImage ? <AvatarImage src={petImage} alt="" /> : null}
                            <AvatarFallback>{pet.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-medium">{pet.name}</p>
                              {shared ? (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                  {t("accountProfile.sharedBadge")}
                                </span>
                              ) : null}
                              {sharing ? (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                                  {t("accountProfile.sharingBadge")}
                                </span>
                              ) : null}
                            </div>
                            {petMeta(pet) ? (
                              <p className="truncate text-xs text-muted-foreground">{petMeta(pet)}</p>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => setDownloadOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    {t("accountProfile.addPet")}
                  </Button>
                  <Button className="flex-1 gap-2" onClick={() => setDownloadOpen(true)}>
                    <Smartphone className="h-4 w-4" />
                    {t("accountProfile.manageInApp")}
                  </Button>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <h3 className="mb-3 text-lg font-semibold">{t("accountProfile.activity")}</h3>
                <Link
                  to="/account/reviews"
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <MessageSquareText className="h-4 w-4 text-primary" />
                    {t("userReviews.myReviews")}
                  </span>
                </Link>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <h3 className="mb-3 text-lg font-semibold">{t("accountProfile.account")}</h3>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="justify-start gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    {t("auth.logout")}
                  </Button>
                  <Button variant="ghost" className="justify-start gap-2 text-destructive hover:text-destructive" asChild>
                    <Link to="/delete-account">
                      <Trash2 className="h-4 w-4" />
                      {t("accountProfile.deleteAccount")}
                    </Link>
                  </Button>
                </div>
              </section>
            </div>
          )}
        </section>
      </main>
      <Footer />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("accountProfile.editProfile")}</DialogTitle>
            <DialogDescription>{t("accountProfile.editProfileDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative"
                aria-label={t("accountProfile.changePhoto")}
              >
                <Avatar className="h-20 w-20 border border-border">
                  {editAvatarSrc ? <AvatarImage src={editAvatarSrc} alt="" /> : null}
                  <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                  <Camera className="h-3.5 w-3.5" />
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => handleAvatarChange(event.target.files?.[0])}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="account-first-name">{t("accountProfile.firstName")}</Label>
                <Input
                  id="account-first-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-last-name">{t("accountProfile.lastName")}</Label>
                <Input
                  id="account-last-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-email">{t("accountProfile.email")}</Label>
              <Input id="account-email" value={email} disabled />
              <p className="text-xs text-muted-foreground">{t("accountProfile.emailReadOnly")}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-phone">{t("accountProfile.phone")}</Label>
              <Input
                id="account-phone"
                inputMode="numeric"
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 8))}
              />
              <p className="text-xs text-muted-foreground">{t("accountProfile.phoneHint")}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-address">{t("accountProfile.address")}</Label>
              <Input
                id="account-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {t("accountProfile.cancel")}
            </Button>
            <Button onClick={handleSave} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? (
                <>
                  <Loader2 className={cn("mr-2 h-4 w-4 animate-spin")} />
                  {t("accountProfile.saving")}
                </>
              ) : (
                t("accountProfile.save")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={downloadOpen} onOpenChange={setDownloadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("accountProfile.downloadGateTitle")}</DialogTitle>
            <DialogDescription>{t("accountProfile.downloadGateBody")}</DialogDescription>
          </DialogHeader>
          <AppDownloadCTA
            title={t("accountProfile.manageInApp")}
            description={t("accountProfile.noPetsHint")}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountProfile;
