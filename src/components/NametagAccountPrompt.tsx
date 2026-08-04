import { Check, CircleUserRound, UserRoundPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

type NametagAccountPromptProps = {
  alreadyHasAccount: boolean;
  onSelect: (hasAccount: boolean) => void;
};

const NametagAccountPrompt = ({ alreadyHasAccount, onSelect }: NametagAccountPromptProps) => {
  const { t } = useTranslation();

  const choices = [
    {
      id: "has-account",
      value: true,
      label: t("nametagPage.accountPrompt.hasAccount"),
      Icon: CircleUserRound,
    },
    {
      id: "no-account",
      value: false,
      label: t("nametagPage.accountPrompt.noAccount"),
      Icon: UserRoundPlus,
    },
  ] as const;

  return (
    <fieldset className="nametag-account-prompt">
      <legend className="sr-only">{t("nametagPage.accountPrompt.title")}</legend>

      <div className="nametag-account-prompt__glow" aria-hidden />

      <div className="nametag-account-prompt__head">
        <span className="nametag-account-prompt__step" aria-hidden>
          {t("nametagPage.accountPrompt.step")}
        </span>
        <div className="nametag-account-prompt__copy">
          <p className="nametag-account-prompt__title">{t("nametagPage.accountPrompt.title")}</p>
          <p className="nametag-account-prompt__hint">{t("nametagPage.accountPrompt.hint")}</p>
        </div>
      </div>

      <div className="nametag-account-prompt__choices" role="radiogroup" aria-label={t("nametagPage.accountPrompt.title")}>
        {choices.map(({ id, value, label, Icon }) => {
          const selected = alreadyHasAccount === value;
          return (
            <button
              key={id}
              id={id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`nametag-account-choice${selected ? " nametag-account-choice--selected" : ""}`}
              onClick={() => onSelect(value)}
            >
              <span className="nametag-account-choice__icon" aria-hidden>
                <Icon className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <span className="nametag-account-choice__label">{label}</span>
              <span className="nametag-account-choice__check" aria-hidden>
                {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};

export default NametagAccountPrompt;
