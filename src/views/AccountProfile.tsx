"use client";

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Camera, Loader2, Plus } from "lucide-react";
import AccountHomeShell from "@/components/account/AccountHomeShell";
import { AppDownloadCTA } from "@/components/AppDownloadCTA";
import UserReviewList from "@/components/UserReviewList";
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
import { useMyReviews } from "@/hooks/useMyReviews";
import { signOutUser } from "@/services/authService";
import {
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

function petAgeLabel(
  birthdate: string | null | undefined,
  t: (key: string, options?: { count: number }) => string,
) {
  if (!birthdate) return "";
  const birth = new Date(birthdate);
  if (Number.isNaN(birth.getTime())) return "";
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) return "";
  if (months < 12) return t("accountProfile.ageMonths", { count: Math.max(months, 0) });
  return t("accountProfile.ageYears", { count: Math.floor(months / 12) });
}

const AccountProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, userInfo, setIsAuthenticated } = useAuth();
  const { openPanel } = useAuthPanel();
  const userId = userInfo?.userId;
  const { data: profile } = useMyAccountProfile();
  const { data: reviews = [] } = useMyReviews();
  const updateProfile = useUpdateMyAccountProfile();

  const [editOpen, setEditOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [activePet, setActivePet] = useState<AccountPet | null>(null);
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
  const reviewPreview = reviews.slice(0, 2);

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

  const petFacts = (pet: AccountPet) => {
    const parts = [
      pet.breed?.trim(),
      localizeSpecies(pet.species),
      petAgeLabel(pet.birthdate, t),
      typeof pet.weight === "number" && pet.weight > 0
        ? t("accountProfile.weightKg", { weight: pet.weight })
        : "",
    ].filter(Boolean);
    return parts.join(" · ");
  };

  const editAvatarSrc = avatarPreview || avatarUrl;
  const canAddPet = pets.length < MAX_ACCOUNT_PETS;

  return (
    <>
      <AccountHomeShell tab="profile" onEditProfile={openEdit}>
        <div className="space-y-8">
          <section className="account-home-reveal">
            <p className="account-home-kicker">{t("accountProfile.myPets")}</p>
            {pets.length === 0 ? (
              <div className="account-home-empty">
                <h3>{t("accountProfile.noPets")}</h3>
                <p>{t("accountProfile.noPetsHint")}</p>
                <div className="account-home-empty__actions">
                  <Button onClick={() => setDownloadOpen(true)}>{t("accountProfile.addPet")}</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="account-home-family">
                  {pets.map((pet) => {
                    const petImage = resolveProfileImageUrl(pet.profileImage);
                    const shared = isSharedPet(pet, userId);
                    return (
                      <button
                        key={pet.id}
                        type="button"
                        className="account-home-pet"
                        onClick={() => setActivePet(pet)}
                      >
                        <span className="account-home-pet__photo">
                          {petImage ? (
                            <img src={petImage} alt="" />
                          ) : (
                            <span className="account-home-pet__fallback">{pet.name.charAt(0)}</span>
                          )}
                          {shared ? <span className="account-home-pet__badge" title={t("accountProfile.sharedBadge")} /> : null}
                        </span>
                        <span className="account-home-pet__name">{pet.name}</span>
                      </button>
                    );
                  })}
                  {canAddPet ? (
                    <button
                      type="button"
                      className="account-home-pet account-home-pet--add"
                      onClick={() => setDownloadOpen(true)}
                    >
                      <span className="account-home-pet__photo">
                        <Plus className="h-5 w-5" />
                      </span>
                      <span className="account-home-pet__name">{t("accountProfile.addPet")}</span>
                    </button>
                  ) : null}
                </div>
                <p className="account-home-hint">{t("accountProfile.appHint")}</p>
              </>
            )}
          </section>

          <section className="account-home-reveal">
            <div className="account-home-teaser">
              <h2>{t("accountProfile.reviewsTeaser")}</h2>
              {reviews.length > 0 ? (
                <Link to="/account/reviews">{t("accountProfile.reviewsTeaserCta")}</Link>
              ) : null}
            </div>
            {reviews.length === 0 ? (
              <div className="account-home-empty">
                <p>{t("accountProfile.reviewsTeaserEmpty")}</p>
                <div className="account-home-empty__actions">
                  <Button variant="outline" asChild>
                    <Link to="/restaurants">{t("userReviews.emptyCtaRestaurants")}</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/clinics">{t("userReviews.emptyCtaClinics")}</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <UserReviewList reviews={reviewPreview} variant="journal" showAnonymousBadge />
            )}
          </section>

          <section className="account-home-reveal">
            <div className="account-home-foot">
              <button type="button" onClick={handleLogout}>
                {t("auth.logout")}
              </button>
              <Link to="/delete-account" className="account-home-foot__danger">
                {t("accountProfile.deleteAccount")}
              </Link>
            </div>
          </section>
        </div>
      </AccountHomeShell>

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
                <span className="account-home-portrait__ring account-home-portrait__ring--sm">
                  {editAvatarSrc ? <img src={editAvatarSrc} alt="" /> : <span aria-hidden>{initials}</span>}
                </span>
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

      <Dialog open={Boolean(activePet)} onOpenChange={(open) => !open && setActivePet(null)}>
        <DialogContent>
          {activePet ? (
            <>
              <DialogHeader>
                <DialogTitle className="sr-only">{activePet.name}</DialogTitle>
              </DialogHeader>
              <div className="account-home-pet-sheet">
                <div className="account-home-pet-sheet__photo">
                  {resolveProfileImageUrl(activePet.profileImage) ? (
                    <img src={resolveProfileImageUrl(activePet.profileImage)} alt="" />
                  ) : (
                    <span className="account-home-pet-sheet__fallback">{activePet.name.charAt(0)}</span>
                  )}
                </div>
                <h3>{activePet.name}</h3>
                {petFacts(activePet) ? <p className="account-home-pet-sheet__facts">{petFacts(activePet)}</p> : null}
                {isSharedPet(activePet, userId) ? (
                  <p className="account-home-pet-sheet__facts">{t("accountProfile.sharedBadge")}</p>
                ) : null}
                {isSharingPet(activePet, userId) ? (
                  <p className="account-home-pet-sheet__facts">{t("accountProfile.sharingBadge")}</p>
                ) : null}
              </div>
              <AppDownloadCTA
                title={t("accountProfile.managePetInApp", { name: activePet.name })}
                description={t("accountProfile.appHint")}
              />
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={downloadOpen} onOpenChange={setDownloadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("accountProfile.downloadGateTitle")}</DialogTitle>
            <DialogDescription>{t("accountProfile.downloadGateBody")}</DialogDescription>
          </DialogHeader>
          <AppDownloadCTA
            title={t("accountProfile.addPet")}
            description={t("accountProfile.noPetsHint")}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountProfile;
