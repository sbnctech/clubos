import * as React from "react";
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export interface RenewalReminderEmailProps {
  memberName: string;
  expirationDate: string;
  daysUntilExpiration: number;
  renewalUrl: string;
}

export function RenewalReminderEmail({ memberName, expirationDate, daysUntilExpiration, renewalUrl }: RenewalReminderEmailProps): React.ReactElement {
  return (
    <Html>
      <Head />
      <Preview>Your membership expires in {String(daysUntilExpiration)} days</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ backgroundColor: "#fff", padding: "40px 20px", maxWidth: "600px" }}>
          <Heading style={{ color: "#1e40af" }}>Membership Renewal Reminder</Heading>
          <Text>Dear {memberName},</Text>
          <Text>Your membership expires on {expirationDate} ({String(daysUntilExpiration)} days).</Text>
          <Section style={{ textAlign: "center", margin: "30px 0" }}>
            <Button href={renewalUrl} style={{ backgroundColor: "#1e40af", color: "#fff", padding: "14px 30px" }}>Renew Now</Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default RenewalReminderEmail;
