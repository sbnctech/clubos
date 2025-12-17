/**
 * Mentorship Email Notifications
 *
 * Queues emails to the EmailOutbox for mentor-newbie notifications.
 * Emails are processed asynchronously by a worker.
 *
 * Reference: docs/ORG/SBNC_BUSINESS_MODEL.md - mentorship as volunteer on-ramp
 */

import { prisma } from "@/lib/prisma";

const PORTAL_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sbnc.club";

interface MentorMatchEmailData {
  assignmentId: string;
  newbieName: string;
  newbieEmail: string;
  mentorName: string;
  mentorEmail: string;
}

/**
 * Queue emails to notify both mentor and newbie of their match.
 */
export async function queueMentorMatchEmails(
  data: MentorMatchEmailData
): Promise<{ mentorEmailId: string; newbieEmailId: string }> {
  const { assignmentId, newbieName, newbieEmail, mentorName, mentorEmail } =
    data;

  // Email to newbie
  const newbieSubject = `Welcome to SBNC! Meet your mentor, ${mentorName}`;
  const newbieBodyText = `Hi ${newbieName},

Welcome to SBNC! We're so glad you're here.

You've been paired with ${mentorName} as your mentor. They're here to help you get the most out of your membership and answer any questions you might have.

What happens next:
1. ${mentorName} will reach out to introduce themselves
2. Feel free to ask them about events, groups, or anything else
3. Check out upcoming events at ${PORTAL_URL}/events

We're excited to have you in our community!

Best,
The SBNC Team`;

  const newbieBodyHtml = `
<p>Hi ${newbieName},</p>

<p>Welcome to SBNC! We're so glad you're here.</p>

<p>You've been paired with <strong>${mentorName}</strong> as your mentor. They're here to help you get the most out of your membership and answer any questions you might have.</p>

<p><strong>What happens next:</strong></p>
<ol>
  <li>${mentorName} will reach out to introduce themselves</li>
  <li>Feel free to ask them about events, groups, or anything else</li>
  <li>Check out upcoming events at <a href="${PORTAL_URL}/events">${PORTAL_URL}/events</a></li>
</ol>

<p>We're excited to have you in our community!</p>

<p>Best,<br>The SBNC Team</p>
`;

  // Email to mentor
  const mentorSubject = `You've been matched with a new mentee: ${newbieName}`;
  const mentorBodyText = `Hi ${mentorName},

Thank you for being a mentor! You've been matched with ${newbieName}.

As their mentor, you can help them feel welcome and navigate their first months with SBNC. Here are some tips:

1. Reach out to introduce yourself
2. Let them know you're available for questions
3. Consider inviting them to an upcoming event you're attending

You can view your mentee's profile at ${PORTAL_URL}/members

Thanks for helping make SBNC a welcoming place!

Best,
The SBNC Team`;

  const mentorBodyHtml = `
<p>Hi ${mentorName},</p>

<p>Thank you for being a mentor! You've been matched with <strong>${newbieName}</strong>.</p>

<p>As their mentor, you can help them feel welcome and navigate their first months with SBNC. Here are some tips:</p>
<ol>
  <li>Reach out to introduce yourself</li>
  <li>Let them know you're available for questions</li>
  <li>Consider inviting them to an upcoming event you're attending</li>
</ol>

<p>You can view your mentee's profile at <a href="${PORTAL_URL}/members">${PORTAL_URL}/members</a></p>

<p>Thanks for helping make SBNC a welcoming place!</p>

<p>Best,<br>The SBNC Team</p>
`;

  // Queue both emails in a transaction
  const [newbieEmailRecord, mentorEmailRecord] = await prisma.$transaction([
    prisma.emailOutbox.create({
      data: {
        to: newbieEmail,
        subject: newbieSubject,
        bodyText: newbieBodyText,
        bodyHtml: newbieBodyHtml,
        metadata: {
          type: "mentor_match_newbie",
          assignmentId,
          newbieName,
          mentorName,
        },
      },
    }),
    prisma.emailOutbox.create({
      data: {
        to: mentorEmail,
        subject: mentorSubject,
        bodyText: mentorBodyText,
        bodyHtml: mentorBodyHtml,
        metadata: {
          type: "mentor_match_mentor",
          assignmentId,
          newbieName,
          mentorName,
        },
      },
    }),
  ]);

  return {
    newbieEmailId: newbieEmailRecord.id,
    mentorEmailId: mentorEmailRecord.id,
  };
}
