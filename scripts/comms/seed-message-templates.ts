/**
 * Seed Message Templates
 *
 * Creates pre-built message templates for common use cases.
 * These serve as a template library that operators can use or customize.
 *
 * P1.5: Template Library
 *
 * Usage:
 *   npx tsx scripts/comms/seed-message-templates.ts
 *
 * Copyright (c) Murmurant, Inc.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "dotenv";

config();

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

interface TemplateDefinition {
  slug: string;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  isActive: boolean;
  category?: string;
}

const TEMPLATES: TemplateDefinition[] = [
  // Welcome Email
  {
    slug: "welcome-new-member",
    name: "Welcome - New Member",
    subject: "Welcome to {{club.name}}, {{member.firstName}}!",
    bodyHtml: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #1e40af;">Welcome to {{club.name}}!</h1>

  <p>Dear {{member.firstName}},</p>

  <p>We're thrilled to welcome you to our community! Your membership is now active and you're ready to start enjoying all the benefits of being a member.</p>

  <h2 style="color: #374151; font-size: 18px;">Getting Started</h2>

  <ul>
    <li><strong>Browse upcoming events:</strong> Check out our calendar to find activities that interest you</li>
    <li><strong>Join an activity group:</strong> Connect with members who share your hobbies and interests</li>
    <li><strong>Attend a Coffee:</strong> Our monthly social gatherings are a great way to meet other newcomers</li>
    <li><strong>Update your profile:</strong> Add your interests and contact preferences</li>
  </ul>

  <p>If you have any questions, don't hesitate to reach out. We're here to help you make the most of your membership!</p>

  <p>
    Warm regards,<br>
    The {{club.name}} Team
  </p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

  <p style="font-size: 12px; color: #6b7280;">
    {{club.name}} | <a href="{{club.website}}">{{club.website}}</a>
  </p>
</div>
    `.trim(),
    bodyText: `
Welcome to {{club.name}}!

Dear {{member.firstName}},

We're thrilled to welcome you to our community! Your membership is now active and you're ready to start enjoying all the benefits of being a member.

Getting Started:
- Browse upcoming events: Check out our calendar to find activities that interest you
- Join an activity group: Connect with members who share your hobbies and interests
- Attend a Coffee: Our monthly social gatherings are a great way to meet other newcomers
- Update your profile: Add your interests and contact preferences

If you have any questions, don't hesitate to reach out. We're here to help you make the most of your membership!

Warm regards,
The {{club.name}} Team

---
{{club.name}} | {{club.website}}
    `.trim(),
    isActive: true,
    category: "membership",
  },

  // Event Invitation
  {
    slug: "event-invitation",
    name: "Event Invitation",
    subject: "You're Invited: {{event.title}}",
    bodyHtml: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #1e40af;">You're Invited!</h1>

  <p>Dear {{member.firstName}},</p>

  <p>We'd love for you to join us at an upcoming event:</p>

  <div style="background-color: #f3f4f6; border-left: 4px solid #2563eb; padding: 16px; margin: 16px 0;">
    <h2 style="margin: 0 0 8px 0; color: #1f2937;">{{event.title}}</h2>
    <p style="margin: 4px 0; color: #4b5563;"><strong>Date:</strong> {{event.date}}</p>
    <p style="margin: 4px 0; color: #4b5563;"><strong>Time:</strong> {{event.time}}</p>
    <p style="margin: 4px 0; color: #4b5563;"><strong>Location:</strong> {{event.location}}</p>
  </div>

  <p>{{event.description}}</p>

  <p style="text-align: center; margin: 24px 0;">
    <a href="{{event.registrationUrl}}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
      Register Now
    </a>
  </p>

  <p>We hope to see you there!</p>

  <p>
    Best regards,<br>
    {{club.name}}
  </p>
</div>
    `.trim(),
    isActive: true,
    category: "events",
  },

  // Event Reminder
  {
    slug: "event-reminder",
    name: "Event Reminder - Day Before",
    subject: "Reminder: {{event.title}} is Tomorrow!",
    bodyHtml: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #16a34a;">Don't Forget - It's Tomorrow!</h1>

  <p>Dear {{member.firstName}},</p>

  <p>This is a friendly reminder about an event you're registered for:</p>

  <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 16px 0;">
    <h2 style="margin: 0 0 8px 0; color: #166534;">{{event.title}}</h2>
    <p style="margin: 4px 0; color: #166534;"><strong>Date:</strong> {{event.date}}</p>
    <p style="margin: 4px 0; color: #166534;"><strong>Time:</strong> {{event.time}}</p>
    <p style="margin: 4px 0; color: #166534;"><strong>Location:</strong> {{event.location}}</p>
  </div>

  <p>If your plans have changed and you can no longer attend, please update your registration so we can offer your spot to someone on the waitlist.</p>

  <p>See you tomorrow!</p>

  <p>
    Best regards,<br>
    {{club.name}}
  </p>
</div>
    `.trim(),
    isActive: true,
    category: "events",
  },

  // Registration Confirmation
  {
    slug: "event-confirmation",
    name: "Event Registration Confirmation",
    subject: "Confirmed: You're Registered for {{event.title}}",
    bodyHtml: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #16a34a;">Registration Confirmed!</h1>

  <p>Dear {{member.firstName}},</p>

  <p>Great news! You're registered for:</p>

  <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; margin: 16px 0; border-radius: 8px;">
    <h2 style="margin: 0 0 12px 0; color: #166534;">{{event.title}}</h2>
    <p style="margin: 4px 0; color: #374151;"><strong>Date:</strong> {{event.date}}</p>
    <p style="margin: 4px 0; color: #374151;"><strong>Time:</strong> {{event.time}}</p>
    <p style="margin: 4px 0; color: #374151;"><strong>Location:</strong> {{event.location}}</p>
  </div>

  <p>We'll send you a reminder before the event. If you need to cancel or have questions, please visit your member dashboard.</p>

  <p>We look forward to seeing you!</p>

  <p>
    Best regards,<br>
    {{club.name}}
  </p>
</div>
    `.trim(),
    isActive: true,
    category: "events",
  },

  // Renewal Reminder
  {
    slug: "renewal-reminder",
    name: "Membership Renewal Reminder",
    subject: "Your {{club.name}} Membership is Expiring Soon",
    bodyHtml: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #b45309;">Time to Renew Your Membership</h1>

  <p>Dear {{member.firstName}},</p>

  <p>Your {{club.name}} membership is expiring soon. Don't miss out on all the great activities and connections!</p>

  <div style="background-color: #fef3c7; border: 1px solid #fcd34d; padding: 16px; margin: 16px 0; border-radius: 8px;">
    <p style="margin: 0; color: #92400e;">
      <strong>Your membership expires:</strong> {{member.expirationDate}}
    </p>
  </div>

  <h2 style="color: #374151; font-size: 18px;">Why Renew?</h2>

  <ul>
    <li>Continue attending exclusive member events</li>
    <li>Stay connected with your activity groups</li>
    <li>Access member-only resources</li>
    <li>Support our community programs</li>
  </ul>

  <p style="text-align: center; margin: 24px 0;">
    <a href="{{club.website}}/renew" style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
      Renew Now
    </a>
  </p>

  <p>If you have any questions about renewal, please don't hesitate to contact us.</p>

  <p>
    Warm regards,<br>
    The {{club.name}} Membership Team
  </p>
</div>
    `.trim(),
    isActive: true,
    category: "membership",
  },

  // Committee Announcement
  {
    slug: "committee-announcement",
    name: "Committee Announcement",
    subject: "[{{committee.name}}] {{subject}}",
    bodyHtml: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #2563eb; color: white; padding: 16px; text-align: center; margin-bottom: 20px;">
    <h1 style="margin: 0; font-size: 20px;">{{committee.name}} Update</h1>
  </div>

  <p>Dear {{member.firstName}},</p>

  <p>As a member of the {{committee.name}}, we wanted to share an important update with you:</p>

  <div style="border-left: 4px solid #2563eb; padding-left: 16px; margin: 16px 0;">
    <!-- Add your announcement content here -->
    <p>[Your announcement content goes here]</p>
  </div>

  <p>If you have any questions, please reach out to us.</p>

  <p>
    Best regards,<br>
    {{committee.name}} Chair
  </p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

  <p style="font-size: 12px; color: #6b7280;">
    You received this email because you are a member of the {{committee.name}}.
  </p>
</div>
    `.trim(),
    isActive: true,
    category: "committees",
  },

  // General Newsletter
  {
    slug: "monthly-newsletter",
    name: "Monthly Newsletter",
    subject: "{{club.name}} Newsletter - {{system.monthYear}}",
    bodyHtml: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #1e40af; color: white; padding: 24px; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">{{club.name}}</h1>
    <p style="margin: 8px 0 0 0; opacity: 0.9;">Monthly Newsletter - {{system.monthYear}}</p>
  </div>

  <div style="padding: 20px;">
    <p>Dear {{member.firstName}},</p>

    <p>Welcome to this month's newsletter! Here's what's happening in our community.</p>

    <h2 style="color: #1e40af; font-size: 18px; border-bottom: 2px solid #1e40af; padding-bottom: 8px;">
      Upcoming Events
    </h2>

    <!-- Add upcoming events here -->
    <ul>
      <li>[Event 1]</li>
      <li>[Event 2]</li>
      <li>[Event 3]</li>
    </ul>

    <h2 style="color: #1e40af; font-size: 18px; border-bottom: 2px solid #1e40af; padding-bottom: 8px;">
      Club News
    </h2>

    <p>[Add news items here]</p>

    <h2 style="color: #1e40af; font-size: 18px; border-bottom: 2px solid #1e40af; padding-bottom: 8px;">
      Member Spotlight
    </h2>

    <p>[Feature a member or activity group here]</p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

    <p>We hope to see you at an upcoming event!</p>

    <p>
      Warm regards,<br>
      The {{club.name}} Communications Team
    </p>
  </div>

  <div style="background-color: #f3f4f6; padding: 16px; text-align: center;">
    <p style="margin: 0; font-size: 12px; color: #6b7280;">
      {{club.name}} | <a href="{{club.website}}">{{club.website}}</a><br>
      {{club.email}}
    </p>
  </div>
</div>
    `.trim(),
    isActive: true,
    category: "newsletters",
  },

  // Activity Group Message
  {
    slug: "activity-group-message",
    name: "Activity Group Message",
    subject: "[{{group.name}}] {{subject}}",
    bodyHtml: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #16a34a; color: white; padding: 16px; text-align: center; margin-bottom: 20px;">
    <h1 style="margin: 0; font-size: 20px;">{{group.name}}</h1>
  </div>

  <p>Hi {{member.firstName}},</p>

  <!-- Add your message content here -->
  <p>[Your message to group members goes here]</p>

  <p>
    See you soon!<br>
    {{group.coordinatorName}}<br>
    <em>{{group.name}} Coordinator</em>
  </p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

  <p style="font-size: 12px; color: #6b7280;">
    You received this email because you are a member of {{group.name}}.
    <a href="{{club.website}}/groups">Manage your groups</a>
  </p>
</div>
    `.trim(),
    isActive: true,
    category: "groups",
  },
];

async function seedTemplates(): Promise<void> {
  console.log("Seeding message templates...");

  for (const template of TEMPLATES) {
    const existing = await prisma.messageTemplate.findUnique({
      where: { slug: template.slug },
    });

    if (existing) {
      console.log(`  Skipping "${template.name}" (already exists)`);
      continue;
    }

    await prisma.messageTemplate.create({
      data: {
        slug: template.slug,
        name: template.name,
        subject: template.subject,
        bodyHtml: template.bodyHtml,
        bodyText: template.bodyText || null,
        isActive: template.isActive,
      },
    });

    console.log(`  Created "${template.name}"`);
  }

  console.log("Done seeding message templates.");
}

async function main(): Promise<void> {
  try {
    await seedTemplates();
  } catch (error) {
    console.error("Error seeding templates:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
