import type { ReactElement } from "react";
import { WelcomeEmail, type WelcomeEmailProps } from "./WelcomeEmail";
import { PasswordResetEmail, type PasswordResetEmailProps } from "./PasswordResetEmail";
import { RenewalReminderEmail, type RenewalReminderEmailProps } from "./RenewalReminderEmail";

export const TEMPLATE_IDS = {
  WELCOME: "welcome",
  PASSWORD_RESET: "password-reset",
  RENEWAL_REMINDER: "renewal-reminder",
} as const;

export type TemplateId = (typeof TEMPLATE_IDS)[keyof typeof TEMPLATE_IDS];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TemplateFunction = (props: any) => ReactElement;

const templates: Record<string, TemplateFunction> = {
  [TEMPLATE_IDS.WELCOME]: WelcomeEmail,
  [TEMPLATE_IDS.PASSWORD_RESET]: PasswordResetEmail,
  [TEMPLATE_IDS.RENEWAL_REMINDER]: RenewalReminderEmail,
};

export function getEmailTemplate(templateId: string): TemplateFunction | undefined {
  return templates[templateId];
}

export { WelcomeEmail, type WelcomeEmailProps };
export { PasswordResetEmail, type PasswordResetEmailProps };
export { RenewalReminderEmail, type RenewalReminderEmailProps };
