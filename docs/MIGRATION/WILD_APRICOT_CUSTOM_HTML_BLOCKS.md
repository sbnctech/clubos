# Wild Apricot Custom HTML Blocks: Migration Guide

This document explains how to identify, capture, and migrate custom HTML blocks
from Wild Apricot sites.

Related:
- [Widgets vs Gadgets](./WILD_APRICOT_WIDGETS_VS_GADGETS.md)
- [Gadget Tagging](./WILD_APRICOT_GADGET_TAGGING.md)
- [Migration Intake Checklist](./WILD_APRICOT_MIGRATION_INTAKE_CHECKLIST.md)

---

## What Are Custom HTML Blocks?

In Wild Apricot, operators can add "Custom HTML" gadgets to pages. These blocks
accept raw HTML code, which can include:

- Iframe embeds (maps, videos, forms, calendars)
- Tracking pixels and analytics scripts
- CSS style overrides
- Third-party widget embed codes
- Newsletter signup forms

Custom HTML blocks require special handling because they may contain code that
cannot be automatically migrated or may pose security risks.

---

## Migration Categories for Custom HTML

| Content Type | Tag | Migration Approach |
|--------------|-----|-------------------|
| Iframe embeds (maps, videos, forms) | MANUAL | Re-embed in ClubOS page editor |
| Tracking pixels (GA, FB Pixel) | MANUAL | Configure in ClubOS settings |
| CSS tweaks (styling only) | MANUAL | Apply via ClubOS theme or page styles |
| Newsletter signups (Mailchimp, etc.) | MANUAL | Re-embed form in ClubOS |
| Inline JavaScript | UNSUPPORTED | Requires security review; may be excluded |
| External widget scripts | UNSUPPORTED | Case-by-case security review required |

---

## Concrete Examples

### Example 1: Google Maps Iframe

**What it looks like in WA:**
```
<iframe
  src="https://www.google.com/maps/embed?pb=..."
  width="600"
  height="450"
  style="border:0;"
  allowfullscreen=""
  loading="lazy">
</iframe>
```

**What to capture:**
- The full iframe src URL
- Desired width and height
- Page URL where it appears

**Tag:** MANUAL

**Migration action:** Re-embed in ClubOS page editor using the embed block.
Copy the src URL from the original iframe.

---

### Example 2: YouTube Video Embed

**What it looks like in WA:**
```
<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/VIDEO_ID"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media"
  allowfullscreen>
</iframe>
```

**What to capture:**
- The YouTube video ID (from the src URL)
- Desired display size
- Page URL where it appears

**Tag:** MANUAL

**Migration action:** Re-embed in ClubOS using video embed block or paste the
iframe code in an embed-safe block.

---

### Example 3: Google Form Embed

**What it looks like in WA:**
```
<iframe
  src="https://docs.google.com/forms/d/e/FORM_ID/viewform?embedded=true"
  width="640"
  height="800"
  frameborder="0"
  marginheight="0"
  marginwidth="0">
  Loading...
</iframe>
```

**What to capture:**
- The Google Form ID (from the src URL)
- Who owns the Google account (for future access)
- What the form is used for (RSVP, survey, feedback)
- Page URL where it appears

**Tag:** MANUAL

**Migration action:** Re-embed in ClubOS page editor. Form responses stay in
Google Forms; no data migration needed.

---

### Example 4: Google Analytics / Facebook Pixel

**What it looks like in WA:**
```
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA-XXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA-XXXXXXX');
</script>

<!-- Facebook Pixel -->
<script>
  !function(f,b,e,v,n,t,s){...}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'PIXEL_ID');
  fbq('track', 'PageView');
</script>
```

**What to capture:**
- Google Analytics property ID (GA-XXXXXXX or G-XXXXXXX)
- Facebook Pixel ID
- Who owns these accounts (for verification)
- List of all tracking services in use

**Tag:** MANUAL

**Migration action:** Do NOT copy the script code. Instead, configure tracking
in ClubOS admin settings using the account IDs. ClubOS handles script injection
in a controlled way.

---

### Example 5: Custom CSS Tweak

**What it looks like in WA:**
```
<style>
  .wa-event-list .event-title {
    font-size: 18px;
    color: #2c5282;
  }
  .member-directory .member-name {
    font-weight: bold;
  }
</style>
```

**What to capture:**
- The CSS rules being applied
- What visual effect the operator wanted
- Screenshots showing the desired appearance

**Tag:** MANUAL (if CSS only) / UNSUPPORTED (if contains JS)

**Migration action:** Review the CSS intent with the operator. Apply equivalent
styling via ClubOS theme settings or page-level style options. Do not blindly
copy CSS that targets WA-specific class names.

**Important:** If the style block contains any JavaScript (even in comments),
flag for security review.

---

### Example 6: Newsletter Signup (Mailchimp)

**What it looks like in WA:**
```
<!-- Begin Mailchimp Signup Form -->
<div id="mc_embed_signup">
<form action="https://clubname.us1.list-manage.com/subscribe/post?u=XXX&id=YYY"
  method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form"
  class="validate" target="_blank">
  <input type="email" name="EMAIL" placeholder="Email Address" required>
  <input type="submit" value="Subscribe" name="subscribe">
</form>
</div>
<!-- End Mailchimp Signup Form -->
```

**What to capture:**
- The Mailchimp list/audience ID
- Who owns the Mailchimp account
- What the signup is for (newsletter, announcements, etc.)
- Page URL where it appears

**Tag:** MANUAL

**Migration action:** Re-embed the Mailchimp form in ClubOS. The form posts
directly to Mailchimp servers; no data migration needed. Verify the form still
works after migration.

---

## Operator Playbook: What to Ask the Webmaster

Use these questions during intake to discover custom HTML blocks:

1. **Do you have any pages with embedded maps, videos, or external calendars?**
   (Identifies iframe embeds)

2. **Do you use Google Analytics, Facebook Pixel, or other tracking on your site?**
   (Identifies tracking scripts)

3. **Have you customized the look of any pages beyond the standard WA themes?**
   (Identifies CSS tweaks)

4. **Do you have signup forms for newsletters, mailing lists, or external services?**
   (Identifies Mailchimp, Constant Contact, etc.)

5. **Did anyone paste code from another website or service into your pages?**
   (Catches miscellaneous embeds)

6. **Do you have any interactive features that required custom code?**
   (Identifies potential JS concerns)

7. **Who set up these custom blocks? Are they still available to help?**
   (Identifies knowledge holders)

8. **Do you have login credentials for the external services (GA, Mailchimp, etc.)?**
   (Identifies account ownership for post-migration setup)

9. **Are there any pages you cannot edit because the HTML is "fragile"?**
   (Identifies high-risk blocks that may break if touched)

10. **Can you show me all pages with custom content so I can take screenshots?**
    (Gets visual documentation)

---

## Security Boundaries

ClubOS does NOT support:

- Inline JavaScript in page content
- Script tags that load external code
- Event handlers in HTML attributes (onclick, onload, etc.)
- Arbitrary third-party widgets without security review

If a custom HTML block contains JavaScript:
1. Flag it as UNSUPPORTED
2. Document what the script does
3. Discuss alternatives with the operator
4. Escalate to security review if the feature is critical

---

## Capture Checklist

For each custom HTML block discovered:

- [ ] Screenshot of the page showing the block in action
- [ ] Copy of the raw HTML source code
- [ ] Page URL where the block appears
- [ ] What the block does (in plain English)
- [ ] Who created it and when (if known)
- [ ] Tag: MANUAL or UNSUPPORTED
- [ ] External service account ownership (if applicable)

---

Last updated: 2025-12-26
