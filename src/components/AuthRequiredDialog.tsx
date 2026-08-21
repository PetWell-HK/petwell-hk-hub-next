import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useAuthPanel } from "@/contexts/AuthPanelContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

const AuthRequiredDialog = ({
  open,
  onOpenChange,
  title = "儲存追蹤清單",
  description = "登入 PetWell 帳戶，即可儲存追蹤清單及獲取最平價格通知",
}: Props) => {
  const navigate = useAppNavigate();
  const { openPanel } = useAuthPanel();

  const handleLogin = () => {
    onOpenChange(false);
    openPanel("LANDING");
  };

  const handleRegister = () => {
    onOpenChange(false);
    navigate("/register");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Button variant="outline" onClick={handleLogin}>
            登入
          </Button>
          <Button onClick={handleRegister}>立即註冊</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthRequiredDialog;
