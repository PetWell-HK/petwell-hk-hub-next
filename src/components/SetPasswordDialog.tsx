import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setAccountPassword } from "@/services/authLinkingService";

type SetPasswordDialogProps = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

const SetPasswordDialog = ({ open, onClose, onSaved }: SetPasswordDialogProps) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isValidPassword = (value: string) =>
    value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);

  const handleSubmit = async () => {
    if (!isValidPassword(password)) {
      setError(t("auth.passwordInvalid"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.passwordsDoNotMatch"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await setAccountPassword(password);
      setSuccess(true);
      onSaved?.();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("auth.unknownError"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("authLinking.setPasswordTitle")}</DialogTitle>
          <DialogDescription>
            {success ? t("authLinking.setPasswordSuccess") : t("authLinking.setPasswordDescription")}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <Button onClick={handleClose}>{t("auth.continueBtn")}</Button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="set-password">{t("auth.password")}</Label>
              <Input
                id="set-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError(null);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-set-password">{t("auth.confirmPassword")}</Label>
              <Input
                id="confirm-set-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError(null);
                }}
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleClose} disabled={loading}>
                {t("auth.back")}
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                {loading ? t("auth.verifying") : t("authLinking.setPasswordSubmit")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SetPasswordDialog;
