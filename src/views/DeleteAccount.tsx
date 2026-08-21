"use client";

import { useState } from "react";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getPublicEnv } from "@/lib/env";
import { Loader2, AlertTriangle } from "lucide-react";

const DeleteAccount = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useAppNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [email, setEmail] = useState("");
  const [understood, setUnderstood] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE" && confirmText !== "刪除") {
      toast({
        title: t('deleteAccount.error'),
        description: t('deleteAccount.confirmError'),
        variant: "destructive",
      });
      return;
    }

    if (!understood) {
      toast({
        title: t('deleteAccount.error'),
        description: t('deleteAccount.checkboxError'),
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      // Get current user to ensure they're authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      // Verify email matches
      if (email.toLowerCase().trim() !== user.email?.toLowerCase().trim()) {
        toast({
          title: t('deleteAccount.error'),
          description: t('deleteAccount.emailMismatch'),
          variant: "destructive",
        });
        setIsDeleting(false);
        return;
      }

      // Get the current session to pass the auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No active session");
      }

      // Call the edge function to delete the account
      const response = await fetch(`${getPublicEnv("VITE_SUPABASE_URL")}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete account');
      }

      toast({
        title: t('deleteAccount.success'),
        description: t('deleteAccount.successMessage'),
      });

      // Sign out and redirect
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: t('deleteAccount.error'),
        description: t('deleteAccount.errorMessage'),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDialog(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-1 py-10 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-destructive/10 border border-destructive rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <h1 className="text-2xl font-bold text-destructive mb-2">
                    {t('deleteAccount.title')}
                  </h1>
                  <p className="text-foreground">
                    {t('deleteAccount.warning')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-secondary rounded-2xl p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  {t('deleteAccount.whatHappens')}
                </h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">•</span>
                    <span>{t('deleteAccount.consequence1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">•</span>
                    <span>{t('deleteAccount.consequence2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">•</span>
                    <span>{t('deleteAccount.consequence3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">•</span>
                    <span>{t('deleteAccount.consequence4')}</span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  {t('deleteAccount.confirmTitle')}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('deleteAccount.emailLabel')}
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('deleteAccount.emailPlaceholder')}
                      className="max-w-md"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('deleteAccount.emailHint')}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('deleteAccount.typeDelete')}
                    </label>
                    <Input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder={t('deleteAccount.deletePlaceholder')}
                      className="max-w-xs"
                    />
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="understood"
                      checked={understood}
                      onCheckedChange={(checked) => setUnderstood(checked as boolean)}
                    />
                    <label
                      htmlFor="understood"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {t('deleteAccount.understand')}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  {t('deleteAccount.cancel')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDialog(true)}
                  disabled={!confirmText || !email || !understood}
                  className="flex-1"
                >
                  {t('deleteAccount.deleteButton')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>


      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteAccount.finalWarning')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteAccount.finalWarningMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('deleteAccount.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('deleteAccount.deleting')}
                </>
              ) : (
                t('deleteAccount.confirmDelete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeleteAccount;
