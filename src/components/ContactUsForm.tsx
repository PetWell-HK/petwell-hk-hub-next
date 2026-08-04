import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getClientsByEmail } from "@/services/forumApi";
import { createContactUsReport } from "@/services/reportService";
import { cn } from "@/lib/utils";

export type ContactFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  message: string;
  privacyConfirmed: boolean;
};

type ContactUsFormProps = {
  sourceLabel: string;
  onSuccess?: () => void;
  className?: string;
  compact?: boolean;
};

type LoggedInContact = {
  reporterName: string;
  reporterEmail: string;
  reporterPhone: string;
};

type ContactUsFormInnerProps = ContactUsFormProps & {
  isLoggedIn: boolean;
  userInfo: {
    userId: string;
    username: string;
    email: string;
    rawEmail?: string;
  } | null;
};

const ContactUsFormInner = ({
  sourceLabel,
  onSuccess,
  className,
  compact = false,
  isLoggedIn,
  userInfo,
}: ContactUsFormInnerProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loggedInContact, setLoggedInContact] = useState<LoggedInContact | null>(null);

  const labelClassName = compact ? "text-xs font-medium leading-snug" : undefined;
  const inputClassName = compact ? "h-9 text-sm" : undefined;
  const privacyLabelClassName = cn(
    "font-normal leading-relaxed text-muted-foreground",
    compact ? "text-[11px] leading-snug" : "text-xs",
  );

  const contactFormSchema = useMemo(() => {
    if (isLoggedIn) {
      return z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().optional(),
        contactNumber: z.string().optional(),
        message: z.string().trim().min(1, { message: t("about.form.messageRequired") }).max(2000),
        privacyConfirmed: z.boolean().refine((val) => val === true, {
          message: t("about.form.privacyRequired"),
        }),
      });
    }

    return z.object({
      firstName: z.string().trim().min(1, { message: t("about.form.firstNameRequired") }).max(100),
      lastName: z.string().trim().min(1, { message: t("about.form.lastNameRequired") }).max(100),
      email: z.string().trim().email({ message: t("about.form.emailInvalid") }).max(255),
      contactNumber: z
        .string()
        .trim()
        .min(1, { message: t("about.form.phoneRequired") })
        .max(50),
      message: z.string().trim().min(1, { message: t("about.form.messageRequired") }).max(2000),
      privacyConfirmed: z.boolean().refine((val) => val === true, {
        message: t("about.form.privacyRequired"),
      }),
    });
  }, [isLoggedIn, t]);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      contactNumber: "",
      message: "",
      privacyConfirmed: false,
    },
  });

  useEffect(() => {
    if (!isLoggedIn || !userInfo?.email) {
      setLoggedInContact(null);
      return;
    }

    let cancelled = false;

    const loadLoggedInContact = async () => {
      const fallbackName =
        userInfo.username && !userInfo.username.includes("@") ? userInfo.username : "";
      const fallbackEmail = userInfo.email.trim().toLowerCase();

      try {
        const clients = await getClientsByEmail(userInfo.rawEmail || userInfo.email);
        if (cancelled) return;

        const bestClient = [...clients].sort((a, b) => {
          const score = (client: (typeof clients)[number]) =>
            Number(Boolean(client.firstName?.trim())) +
            Number(Boolean(client.lastName?.trim())) +
            Number(Boolean(client.phone?.trim()));
          return score(b) - score(a);
        })[0];

        const fullName = [bestClient?.firstName, bestClient?.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();

        setLoggedInContact({
          reporterName: fullName || fallbackName || fallbackEmail,
          reporterEmail: (bestClient?.email || fallbackEmail).trim().toLowerCase(),
          reporterPhone: bestClient?.phone?.trim() || "",
        });
      } catch (error) {
        console.warn("Unable to load contact profile for contact form:", error);
        if (!cancelled) {
          setLoggedInContact({
            reporterName: fallbackName || fallbackEmail,
            reporterEmail: fallbackEmail,
            reporterPhone: "",
          });
        }
      }
    };

    void loadLoggedInContact();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, userInfo?.email, userInfo?.rawEmail, userInfo?.username]);

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const reportMessage = [
        sourceLabel,
        `Privacy Confirmed: ${values.privacyConfirmed ? "Yes" : "No"}`,
        "",
        values.message.trim(),
      ].join("\n");

      const contact = isLoggedIn
        ? {
            reporterName: loggedInContact?.reporterName || userInfo?.email || "User",
            reporterEmail:
              loggedInContact?.reporterEmail ||
              userInfo?.email?.trim().toLowerCase() ||
              "",
            reporterPhone: loggedInContact?.reporterPhone || "",
          }
        : {
            reporterName: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
            reporterEmail: values.email.trim().toLowerCase(),
            reporterPhone: values.contactNumber.trim(),
          };

      if (!contact.reporterEmail) {
        throw new Error("Missing reporter email");
      }

      await createContactUsReport({
        reporterId: isLoggedIn ? userInfo?.userId ?? null : null,
        message: reportMessage,
        contact,
      });

      toast({
        title: t("about.form.successTitle"),
        description: t("about.form.successDescription"),
      });

      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        contactNumber: "",
        message: "",
        privacyConfirmed: false,
      });
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast({
        title: t("about.form.errorTitle"),
        description: t("about.form.errorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn(compact ? "space-y-3" : "space-y-4", className)}>
        {!isLoggedIn && (
          <>
            <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", compact && "gap-3")}>
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClassName}>{t("about.form.firstName")}</FormLabel>
                    <FormControl>
                      <Input className={inputClassName} placeholder={t("about.form.firstNamePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage className={compact ? "text-xs" : undefined} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClassName}>{t("about.form.lastName")}</FormLabel>
                    <FormControl>
                      <Input className={inputClassName} placeholder={t("about.form.lastNamePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage className={compact ? "text-xs" : undefined} />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClassName}>{t("about.form.email")} *</FormLabel>
                  <FormControl>
                    <Input className={inputClassName} type="email" placeholder={t("about.form.emailPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage className={compact ? "text-xs" : undefined} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClassName}>{t("about.form.phone")} *</FormLabel>
                  <FormControl>
                    <Input className={inputClassName} placeholder={t("about.form.phonePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage className={compact ? "text-xs" : undefined} />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClassName}>{t("about.form.message")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("about.form.messagePlaceholder")}
                  className={cn(compact ? "min-h-[88px] text-sm" : "min-h-[150px]")}
                  {...field}
                />
              </FormControl>
              <FormMessage className={compact ? "text-xs" : undefined} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="privacyConfirmed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-2.5 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} className={compact ? "mt-0.5" : undefined} />
              </FormControl>
              <div className="space-y-1">
                <FormLabel className={privacyLabelClassName}>{t("about.form.privacyLabel")}</FormLabel>
                <FormMessage className={compact ? "text-xs" : undefined} />
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" size={compact ? "default" : "lg"} className={cn("w-full", compact && "h-9 text-sm")} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("about.submitting")}
            </>
          ) : (
            t("about.sendMessage")
          )}
        </Button>
      </form>
    </Form>
  );
};

const ContactUsForm = (props: ContactUsFormProps) => {
  const { isAuthenticated, userInfo } = useAuth();
  const isLoggedIn = isAuthenticated === true;

  return (
    <ContactUsFormInner
      key={isLoggedIn ? "logged-in" : "guest"}
      isLoggedIn={isLoggedIn}
      userInfo={userInfo}
      {...props}
    />
  );
};

export default ContactUsForm;
