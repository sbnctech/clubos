# Wild Apricot Custom HTML Gadget Constraints

Technical constraints and safe patterns for embedding widgets in Wild Apricot Custom HTML blocks.

```
Audience: Developers, Migration Engineers
Purpose: Technical reference for WA embedding constraints
Classification: Technical Documentation
```

---

## 1. Script Limitations

### 1.1 JavaScript Whitelist (CSP)

Wild Apricot enforces a Content Security Policy that blocks external JavaScript from non-whitelisted domains.

**How WA CSP Works:**

```
Request: <script src="https://example.com/widget.js"></script>

WA CSP Check:
  1. Extract domain: example.com
  2. Check against whitelist
  3. If not whitelisted: Block with console error
  4. If whitelisted: Allow execution
```

**Console Error When Blocked:**

```
Refused to load the script 'https://example.com/widget.js'
because it violates the following Content Security Policy directive:
"script-src 'self' 'unsafe-inline' *.wildapricot.org [whitelisted domains]"
```

**Whitelisting Process:**

1. Navigate to **Website > Settings** (top right gear icon)
2. Under **Website security**, click **JavaScript whitelist**
3. Add domain to **Custom whitelisted domains**
4. Click **Add domain**

**Important Limitations:**

| Constraint | Detail |
|------------|--------|
| Subdomain handling | `cdn.example.com` must be whitelisted separately from `example.com` |
| No wildcards | Cannot whitelist `*.example.com`; each subdomain requires entry |
| Propagation delay | Whitelist changes may take 5-10 minutes to propagate |
| Per-account | Each WA account maintains its own whitelist |

### 1.2 Inline Script Restrictions

WA allows inline scripts (`<script>...</script>`) in Custom HTML blocks, but with constraints:

**What Works:**

```html
<!-- Simple inline script - allowed -->
<script>
  console.log('Hello from inline script');
</script>

<!-- Inline script calling whitelisted external library - allowed -->
<script src="https://whitelisted-cdn.com/library.js"></script>
<script>
  LibraryName.init({ container: '#my-widget' });
</script>
```

**What Fails:**

```html
<!-- External script from non-whitelisted domain - blocked -->
<script src="https://not-whitelisted.com/script.js"></script>

<!-- Dynamic script injection (may fail) -->
<script>
  var s = document.createElement('script');
  s.src = 'https://not-whitelisted.com/script.js';
  document.head.appendChild(s);  // CSP blocks this too
</script>
```

### 1.3 Execution Timing

**DOM Ready Issues:**

WA page structure means Custom HTML blocks load at unpredictable times relative to the full page.

**Problem:**

```html
<script>
  // May fail - element not in DOM yet
  document.getElementById('my-element').innerHTML = 'Hello';
</script>
<div id="my-element"></div>
```

**Solution:**

```html
<div id="my-element"></div>
<script>
  // Option 1: DOMContentLoaded (safest)
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('my-element').innerHTML = 'Hello';
  });

  // Option 2: Immediate if element is above script
  // Works because parser reaches element before script
</script>
```

**WA-Specific Timing:**

WA dynamically loads gadgets. Scripts may execute before WA's own JavaScript completes.

```javascript
// Check if WA API is available
if (typeof WA !== 'undefined' && WA.ready) {
  WA.ready(function() {
    // WA environment is fully initialized
    initializeWidget();
  });
} else {
  // Fallback: DOM ready
  document.addEventListener('DOMContentLoaded', initializeWidget);
}
```

### 1.4 Module and Import Limitations

**ES Modules: Partially Supported**

```html
<!-- May fail in older WA themes -->
<script type="module">
  import { something } from 'https://whitelisted.com/module.js';
</script>
```

**Recommendation:** Use IIFE (Immediately Invoked Function Expression) pattern for maximum compatibility:

```html
<script>
  (function() {
    'use strict';
    // Widget code here - isolated scope
  })();
</script>
```

---

## 2. CSS Collisions

### 2.1 Global Scope Problem

WA pages have extensive existing CSS. Custom HTML blocks share the global CSS namespace.

**Common Collision Patterns:**

| Your CSS | WA CSS Conflict | Result |
|----------|-----------------|--------|
| `.button { ... }` | WA uses `.button` for forms | Your buttons break or WA buttons break |
| `h2 { font-size: ... }` | WA has `h2` rules in theme | Unpredictable heading sizes |
| `a { color: ... }` | WA navigation uses `a` | Navigation colors change |
| `* { box-sizing: ... }` | Affects entire page | Layout breaks throughout |

### 2.2 CSS Isolation Strategies

**Strategy 1: Prefixed Classes (Recommended)**

```css
/* BAD - collides with WA */
.calendar { ... }
.event-card { ... }

/* GOOD - prefixed namespace */
.clubcal-calendar { ... }
.clubcal-event-card { ... }
```

**Strategy 2: Scoped Container**

```html
<div id="my-widget-root">
  <!-- All widget content here -->
</div>

<style>
  #my-widget-root .button {
    /* Only affects buttons inside our container */
  }

  #my-widget-root h2 {
    /* Only affects h2 inside our container */
  }
</style>
```

**Strategy 3: CSS Reset Within Container**

```css
/* Reset WA styles within our container */
#my-widget-root {
  all: initial;           /* Reset all inherited properties */
  font-family: inherit;   /* Re-inherit what we want */
  font-size: 16px;        /* Set our baseline */
}

#my-widget-root * {
  box-sizing: border-box;
}
```

### 2.3 WA Theme Interference

WA themes may use `!important` rules that override your CSS:

```css
/* WA theme might have */
.button {
  background-color: #blue !important;
}

/* Your CSS without !important loses */
#my-widget-root .button {
  background-color: red;  /* Ignored */
}

/* Must counter with higher specificity + !important */
#my-widget-root .clubcal-button {
  background-color: red !important;
}
```

**Best Practice:** Use highly specific selectors to avoid `!important` wars:

```css
/* Very specific - wins over most WA rules */
body #contentContainer #my-widget-root .clubcal-button {
  background-color: red;
}
```

### 2.4 Responsive/Media Query Conflicts

WA themes have their own breakpoints. Your media queries may conflict:

```css
/* Your breakpoint */
@media (max-width: 768px) {
  #my-widget-root { flex-direction: column; }
}

/* WA theme breakpoint */
@media (max-width: 800px) {
  /* WA changes layout here */
}

/* Result: Layout breaks between 768px and 800px */
```

**Mitigation:** Use container queries where supported, or match WA breakpoints:

```css
/* Match common WA breakpoints */
@media (max-width: 991px) {  /* WA tablet breakpoint */
  #my-widget-root { ... }
}

@media (max-width: 767px) {  /* WA mobile breakpoint */
  #my-widget-root { ... }
}
```

---

## 3. Caching

### 3.1 WA Page Cache

WA caches pages aggressively. Custom HTML changes may not appear immediately.

**Cache Behavior:**

| Content Type | Cache Duration | Bypass Method |
|--------------|----------------|---------------|
| Page HTML | Minutes to hours | Edit page, re-save |
| Linked CSS files | Browser dependent | Add version query param |
| Linked JS files | Browser dependent | Add version query param |
| API responses | Varies by endpoint | No control from widget |

### 3.2 Cache-Busting for External Resources

```html
<!-- Without cache busting - may serve stale version -->
<script src="https://cdn.example.com/widget.js"></script>
<link rel="stylesheet" href="https://cdn.example.com/widget.css">

<!-- With cache busting - forces reload on version change -->
<script src="https://cdn.example.com/widget.js?v=1.2.3"></script>
<link rel="stylesheet" href="https://cdn.example.com/widget.css?v=1.2.3">

<!-- With timestamp (development only - defeats caching) -->
<script src="https://cdn.example.com/widget.js?t=1703548800"></script>
```

### 3.3 Inline Content Caching

Inline scripts and styles are part of the page HTML. Changes require:

1. Edit the page in WA admin
2. Save/publish the page
3. Wait for cache to expire OR
4. Force-refresh in browser (Ctrl+Shift+R / Cmd+Shift+R)

**For Rapid Development:**

Add cache-control meta (limited effectiveness):

```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

### 3.4 WA CDN Behavior

WA serves static assets from CDN. Considerations:

- CDN may cache aggressively (hours to days)
- Geographic distribution means inconsistent cache state
- No direct cache purge available to org admins

**Workaround for Critical Updates:**

```javascript
// Fetch with cache bypass for critical data
fetch(apiUrl, {
  cache: 'no-store',  // Bypass browser cache
  headers: {
    'Cache-Control': 'no-cache'
  }
});
```

---

## 4. Authentication Context

### 4.1 WA Session Detection

Custom HTML widgets can detect if a user is logged into Wild Apricot.

**Method 1: WA JavaScript API**

```javascript
// Check if WA API is available and user is logged in
if (typeof WA !== 'undefined') {
  WA.ready(function() {
    if (WA.user && WA.user.id) {
      console.log('Logged in as:', WA.user.displayName);
      initMemberMode();
    } else {
      console.log('Not logged in');
      initPublicMode();
    }
  });
}
```

**Method 2: Cookie Detection (Less Reliable)**

```javascript
// WA sets cookies for logged-in users
// Cookie names may vary - use with caution
function isWaLoggedIn() {
  return document.cookie.includes('WA_USER') ||
         document.cookie.includes('WildApricotUser');
}
```

### 4.2 Auth Context Limitations

**Cannot Access:**

| Data | Reason |
|------|--------|
| User password | Security - never exposed |
| Payment details | PCI compliance |
| Full member record | Requires API call with auth |
| Other members' data | Privacy - scoped to current user |

**Can Access (When Logged In):**

| Data | Via |
|------|-----|
| User ID | `WA.user.id` |
| Display name | `WA.user.displayName` |
| Email (sometimes) | `WA.user.email` |
| Membership level | `WA.user.membershipLevel` |

### 4.3 Auth Token Forwarding

Widgets needing to call WA API on behalf of the user face challenges:

**Problem:**

```javascript
// Your widget cannot directly call WA API with user's credentials
fetch('https://api.wildapricot.org/v2/accounts/12345/contacts/me', {
  headers: {
    'Authorization': 'Bearer ???'  // Widget doesn't have token
  }
});
```

**Solutions:**

1. **Proxy through your server:**
   - Widget calls your server
   - Your server has WA API credentials
   - Your server calls WA API
   - Returns filtered data to widget

2. **Use WA's session-based endpoints:**
   - Some WA pages expose data to logged-in users via HTML
   - Widget can read from DOM (fragile, not recommended)

3. **Pre-sync data:**
   - Batch sync WA data to your server
   - Widget fetches from your server
   - No real-time WA API calls needed

### 4.4 Public vs Member Content

**Critical Security Pattern:**

```javascript
function initWidget(mode) {
  if (mode === 'member') {
    // Verify user is actually logged in before showing member content
    if (!isAuthenticated()) {
      console.warn('Member mode requested but user not authenticated');
      mode = 'public';  // Fallback to public
    }
  }

  // Fetch appropriate data
  const dataUrl = mode === 'member'
    ? '/api/events?include=attendees'  // Member-only fields
    : '/api/events';                   // Public fields only

  fetchAndRender(dataUrl, mode);
}

function isAuthenticated() {
  // Server-side auth check via your API
  // OR WA.user.id check
  return typeof WA !== 'undefined' && WA.user && WA.user.id;
}
```

---

## 5. Safe Patterns for Inline-Only Widgets

### 5.1 Minimal Inline Widget Template

```html
<!--
  Self-contained inline widget template
  - No external dependencies
  - Isolated CSS namespace
  - Safe DOM manipulation
-->

<div id="clubcal-widget-root" data-config='{"mode":"public"}'>
  <div class="clubcal-loading">Loading...</div>
</div>

<style>
  /* Scoped reset */
  #clubcal-widget-root {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: #333;
  }

  /* Prefixed classes only */
  #clubcal-widget-root .clubcal-loading {
    text-align: center;
    padding: 20px;
    color: #666;
  }

  #clubcal-widget-root .clubcal-event {
    padding: 12px;
    margin: 8px 0;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  #clubcal-widget-root .clubcal-event-title {
    font-weight: 600;
    margin: 0 0 4px 0;
  }

  #clubcal-widget-root .clubcal-event-date {
    font-size: 14px;
    color: #666;
  }
</style>

<script>
(function() {
  'use strict';

  // Configuration
  var root = document.getElementById('clubcal-widget-root');
  var config = JSON.parse(root.getAttribute('data-config') || '{}');

  // Safe text content helper (XSS prevention)
  function text(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.textContent;
  }

  // Safe element creation
  function el(tag, className, content) {
    var elem = document.createElement(tag);
    if (className) elem.className = 'clubcal-' + className;
    if (content) elem.textContent = content;
    return elem;
  }

  // Render events
  function render(events) {
    root.innerHTML = '';  // Clear loading state

    if (!events || events.length === 0) {
      root.appendChild(el('div', 'empty', 'No upcoming events'));
      return;
    }

    events.forEach(function(event) {
      var card = el('div', 'event');
      card.appendChild(el('div', 'event-title', text(event.title)));
      card.appendChild(el('div', 'event-date', text(event.date)));
      root.appendChild(card);
    });
  }

  // Fetch and display
  function init() {
    var apiUrl = config.apiUrl || '/api/events';

    fetch(apiUrl)
      .then(function(response) {
        if (!response.ok) throw new Error('Fetch failed');
        return response.json();
      })
      .then(render)
      .catch(function(err) {
        root.innerHTML = '';
        root.appendChild(el('div', 'error', 'Unable to load events'));
        console.error('Widget error:', err);
      });
  }

  // Initialize when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>
```

### 5.2 Safe URL Handling

```javascript
// Validate and sanitize URLs before use
function safeUrl(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    var parsed = new URL(url, window.location.origin);

    // Only allow http(s) protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      console.warn('Blocked non-http URL:', url);
      return null;
    }

    return parsed.href;
  } catch (e) {
    console.warn('Invalid URL:', url);
    return null;
  }
}

// Usage
var eventUrl = safeUrl(event.detailUrl);
if (eventUrl) {
  link.href = eventUrl;
} else {
  link.removeAttribute('href');
  link.style.cursor = 'default';
}
```

### 5.3 Configuration Validation

```javascript
// Validate widget configuration
function validateConfig(config) {
  var validated = {};

  // Mode: only allow known values
  var validModes = ['public', 'member', 'preview'];
  validated.mode = validModes.includes(config.mode) ? config.mode : 'public';

  // API URL: must be relative or from allowed origins
  if (config.apiUrl) {
    var allowedOrigins = [
      window.location.origin,
      'https://api.clubos.example.com'
    ];

    try {
      var apiOrigin = new URL(config.apiUrl, window.location.origin).origin;
      if (allowedOrigins.includes(apiOrigin)) {
        validated.apiUrl = config.apiUrl;
      } else {
        console.warn('Blocked API URL from disallowed origin:', apiOrigin);
      }
    } catch (e) {
      console.warn('Invalid API URL:', config.apiUrl);
    }
  }

  // Numeric values: validate range
  validated.limit = Math.min(Math.max(parseInt(config.limit) || 10, 1), 100);

  return validated;
}
```

### 5.4 Error Display Pattern

```javascript
// User-friendly error display
function showError(root, message, isRecoverable) {
  root.innerHTML = '';

  var container = document.createElement('div');
  container.className = 'clubcal-error';
  container.style.cssText = 'padding:20px;text-align:center;color:#666;';

  var icon = document.createElement('div');
  icon.textContent = isRecoverable ? '⚠️' : '❌';
  icon.style.fontSize = '24px';
  container.appendChild(icon);

  var msg = document.createElement('p');
  msg.textContent = message;
  container.appendChild(msg);

  if (isRecoverable) {
    var retry = document.createElement('button');
    retry.textContent = 'Try Again';
    retry.style.cssText = 'padding:8px 16px;cursor:pointer;';
    retry.onclick = function() { init(); };
    container.appendChild(retry);
  }

  root.appendChild(container);
}

// Usage
fetch(apiUrl)
  .then(...)
  .catch(function(err) {
    if (err.message.includes('network')) {
      showError(root, 'Network error. Check your connection.', true);
    } else {
      showError(root, 'Unable to load content.', false);
    }
  });
```

### 5.5 Graceful Degradation

```javascript
// Feature detection and fallbacks
function init() {
  // Check for required APIs
  if (typeof fetch === 'undefined') {
    showError(root, 'Browser not supported. Please update your browser.', false);
    return;
  }

  // Check for JSON.parse (very old browsers)
  if (typeof JSON === 'undefined') {
    root.innerHTML = '<p>Please use a modern browser to view this content.</p>';
    return;
  }

  // Check for required DOM methods
  if (!document.querySelector) {
    root.innerHTML = '<p>Browser not supported.</p>';
    return;
  }

  // Proceed with initialization
  loadWidget();
}
```

---

## 6. Testing Checklist

Before deploying an inline widget to WA:

### Script Execution

- [ ] Widget loads without console errors
- [ ] Works with JavaScript whitelist (if using external scripts)
- [ ] Works without external dependencies (inline-only mode)
- [ ] Handles DOM ready timing correctly
- [ ] No conflicts with WA's own JavaScript

### CSS Isolation

- [ ] Widget styles use prefixed class names
- [ ] No global element selectors (`h1`, `a`, `button`)
- [ ] Tested in multiple WA themes
- [ ] Responsive layout works alongside WA responsive
- [ ] No `!important` conflicts with WA theme

### Caching

- [ ] Version parameter on external resources
- [ ] Widget functions after page cache
- [ ] Development mode has cache bypass option

### Authentication

- [ ] Public mode shows only public data
- [ ] Member mode correctly detects login state
- [ ] Graceful fallback if auth detection fails
- [ ] No member data leaked in public mode

### Security

- [ ] No `innerHTML` with untrusted content
- [ ] URL parameters validated
- [ ] API URLs restricted to allowed origins
- [ ] No `eval()` or `new Function()`
- [ ] Config values validated before use

### Error Handling

- [ ] Network errors display user-friendly message
- [ ] Invalid config shows helpful error
- [ ] Widget fails gracefully if container missing
- [ ] Console errors are informative for debugging

---

## Related Documents

- [Custom HTML Blocks Guide](./WILD_APRICOT_CUSTOM_HTML_BLOCKS_GUIDE.md) - Operator-focused guide
- [Widgets vs Gadgets](./WILD_APRICOT_WIDGETS_VS_GADGETS.md) - Terminology clarification
- [Gadget Tagging](./WILD_APRICOT_GADGET_TAGGING.md) - Migration classification
- [SafeEmbed Allowlist Policy](../ARCH/SAFEEMBED_ALLOWLIST_POLICY.md) - Iframe allowlist management

---

## References

- [Wild Apricot JavaScript Whitelist](https://gethelp.wildapricot.com/en/articles/1929-javascript-whitelist-and-csp)
- [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

---

*Last updated: 2025-12-26*
