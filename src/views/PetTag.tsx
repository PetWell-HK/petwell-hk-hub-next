"use client";

import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Phone, Calendar, Weight, Heart, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPetById, getPetByNFCId, Pet, getOwnerDisplayName, getOwnerPhoneNumber } from "@/services/petApi";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPublicEnv } from "@/lib/env";

// Calculate age from birthdate
const calculateAge = (birthdate: string | undefined): number | null => {
  if (!birthdate) return null;
  const birth = new Date(birthdate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1;
  }
  return age;
};

// Helper to check if string is a valid UUID
const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

const normalizeTagId = (value?: string) => {
  if (!value) return value;
  return value.trim().replace(/^\{+/, "").replace(/\}+$/, "");
};

const normalizePhoneForDial = (phone?: string | null): string | null => {
  if (!phone) return null;
  const raw = phone.trim();
  if (!raw) return null;

  const startsWithPlus = raw.startsWith("+");
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;

  if (startsWithPlus) return `+${digits}`;
  if (digits.length === 8) return `+852${digits}`;
  if (digits.startsWith("852") && digits.length === 11) return `+${digits}`;
  return digits;
};

const SPECIES_I18N_KEY: Record<string, string> = {
  dog: "petTag.speciesValues.dog",
  dogs: "petTag.speciesValues.dogs",
  cat: "petTag.speciesValues.cat",
  cats: "petTag.speciesValues.cats",
};

const PetTag = () => {
  const { tagId: rawTagId } = useParams();
  const tagId = normalizeTagId(rawTagId);
  const { t } = useTranslation();

  const {
    data: pet,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pet", tagId],
    queryFn: async () => {
      if (!tagId) return null;

      // Tag ID is the pet's UUID
      return getPetById(tagId);
    },
    enabled: !!tagId,
    retry: false,
  });

  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const loadCover = async () => {
      const profileImage = pet?.profileImage?.trim();
      if (!pet || !profileImage) {
        setCoverPhotoUrl(null);
        setImageLoading(false);
        return;
      }

      try {
        // New nametag registrations store an already-public S3 URL.
        if (/^https?:\/\//i.test(profileImage)) {
          setCoverPhotoUrl(profileImage);
          setImageLoading(false);
          return;
        }

        // Legacy records still store only the object key and need signed URL fetch.
        const EDGE_URL = `${getPublicEnv("VITE_SUPABASE_URL")}/functions/v1/getS3ImageUrl`;
        const response = await fetch(EDGE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bucket: "petwellclientstoragee8eec-prod",
            filePath: profileImage,
          }),
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error || "Failed to get image URL");
        }
        const data = await response.json();
        if (data.ok && data.url) {
          setCoverPhotoUrl(data.url);
        } else {
          setCoverPhotoUrl(null);
        }
      } catch (error) {
        console.error("Failed to load pet profile image:", error);
        setCoverPhotoUrl(null);
      } finally {
        setImageLoading(false);
      }
    };

    loadCover();

    return () => {
      // ensure loading state reset on cleanup
      setImageLoading(false);
    };
  }, [pet]);

  if (isLoading || imageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !pet || !pet.isTagActivated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">寵物尚未啟動</h2>
            <p className="text-muted-foreground mb-6">{t("petTag.notActivated.description")}</p>
            <Button size="lg" className="w-full" onClick={() => (window.location.href = `/activate/${tagId}`)}>
              {t("petTag.notActivated.cta")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const age = calculateAge(pet.birthdate);
  const ownerName = getOwnerDisplayName(pet);
  const ownerPhone = getOwnerPhoneNumber(pet);
  const dialPhone = normalizePhoneForDial(ownerPhone);
  const speciesValue = (pet.species || "").trim();
  const speciesKey = SPECIES_I18N_KEY[speciesValue.toLowerCase()];
  const localizedSpecies = speciesKey ? t(speciesKey) : speciesValue;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Emergency Notice */}
        <Card className="mb-6 border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Heart className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-1">{t("petTag.foundLostPet")}</h3>
                <p className="text-sm text-muted-foreground">{t("petTag.thankYouMessage")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pet Information */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center mb-6">
              <img
                src={coverPhotoUrl || "/placeholder.svg"}
                alt={pet.name}
                className="w-40 h-40 rounded-full object-cover border-4 border-primary/20 mb-4"
              />
              <h1 className="text-3xl font-bold mb-2">{pet.name}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {age !== null && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("petTag.age")}</p>
                    <p className="font-semibold">
                      {age} {t("petTag.yearsOld")}
                    </p>
                  </div>
                </div>
              )}

              {pet.species && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Heart className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("petTag.species")}</p>
                    <p className="font-semibold">{localizedSpecies}</p>
                  </div>
                </div>
              )}

              {pet.breed && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Heart className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("petTag.breed")}</p>
                    <p className="font-semibold">{pet.breed}</p>
                  </div>
                </div>
              )}

              {pet.weight && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Weight className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("petTag.weight")}</p>
                    <p className="font-semibold">{pet.weight} kg</p>
                  </div>
                </div>
              )}

              {pet.birthdate && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("petTag.birthday")}</p>
                    <p className="font-semibold">{new Date(pet.birthdate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>

            {pet.microchipId && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">{t("petTag.microchipId")}</p>
                <p className="font-mono font-semibold">{pet.microchipId}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Owner CTA */}
        <Card>
          <CardContent className="pt-6 text-center">
            <Phone className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">{t("petTag.contactOwner")}</h3>
            <p className="text-foreground mb-4">{ownerName}</p>
            {dialPhone ? (
              <>
                <p className="mb-3 text-base font-semibold text-primary">{ownerPhone}</p>
                <Button size="lg" className="w-full" onClick={() => (window.location.href = `tel:${dialPhone}`)}>
                  <Phone className="mr-2 h-5 w-5" />
                  {t("petTag.callOwnerNow")}
                </Button>
              </>
            ) : (
              <Button size="lg" className="w-full" disabled>
                <Phone className="mr-2 h-5 w-5" />
                {t("petTag.phoneNotAvailable")}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Footer Message */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>{t("petTag.footer")}</p>
        </div>
      </div>
    </div>
  );
};

export default PetTag;
