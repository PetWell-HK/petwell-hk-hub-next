import { useEffect } from "react";
const logo = "/assets/logo.png";

const MailGoogleForm = () => {
  useEffect(() => {
    // Automatically redirect to the Google Form
    window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLSddKmBLbJ5f8rB71O1FlvAcal6zfvWIpatVO0nIiMPfOKkb-g/viewform?usp=dialog";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6">
        <img src={logo} alt="PetWell Logo" className="h-24 w-auto animate-fade-in" />
        <p className="text-lg text-muted-foreground animate-fade-in">Redirecting to form...</p>
      </div>
    </div>
  );
};

export default MailGoogleForm;
