---
name: RCCG School of Disciples (Americas-1)
description: Reverent, welcoming clarity with disciplined academic order across public discovery, student portal, and center administration.
colors:
  primary-cobalt: "#001EC5"
  deep-navy: "#001F54"
  amber-gold: "#FFC107"
  crimson-alert: "#FF3739"
  surface-white: "#FFFFFF"
  surface-tinted: "#EEF2FF"
  surface-subtle: "#F3F4F6"
  surface-charcoal: "#121921"
  ink-primary: "#22272F"
  ink-muted: "#64748B"
  border-input: "#C9C9C9"
  border-hairline: "#E5E7EB"
typography:
  display:
    fontFamily: "Poppins, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0em"
  title:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0em"
  body:
    fontFamily: "Poppins, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  label:
    fontFamily: "Poppins, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0em"
rounded:
  sm: "4px"
  md: "6px"
  pill: "20px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary-cobalt}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.md}"
    padding: "0 32px"
    height: "40px"
  button-outlined:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.primary-cobalt}"
    rounded: "{rounded.md}"
    padding: "0 32px"
    height: "40px"
  button-red:
    backgroundColor: "{colors.crimson-alert}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.md}"
    padding: "0 32px"
    height: "40px"
  button-nav-cta:
    backgroundColor: "{colors.amber-gold}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.pill}"
    padding: "6px 20px"
  input-field:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.md}"
    padding: "12px"
---

# Design System: RCCG School of Disciples (Americas-1)

## Overview

**Creative North Star: "The Structured Sanctuary"**

RCCG School of Disciples (Americas-1) balances the welcoming warmth of a church discipleship community with the clarity and accountability of an academic institution. Public surfaces invite prospective students into a clear, trustworthy story, while authenticated student, coordinator, and admin portals prioritize scanability, disciplined hierarchy, and zero-ambiguity form and payment workflows.

The system is grounded in a crisp, flat-by-default visual language: high-legibility geometric sans-serif typography (`Poppins`), authoritative deep-navy and cobalt-blue anchors, and restrained warm amber reserved for primary public calls to action.

**Key Characteristics:**
- Geometric clarity with `Poppins` across every display, form, and operational surface.
- High-contrast cobalt and deep-navy authority paired with clean white and subtle cool-gray surfaces.
- Flat-by-default containers separated by crisp 1px hairline borders rather than heavy drop shadows.
- Responsive, mobile-first clarity for students registering and checking results on any device.

## Colors

A disciplined institutional palette anchored in cobalt blue and deep navy, supported by cool neutral grays and a single warm amber accent for public conversion.

### Primary
- **Primary Cobalt** (`#001EC5`): Primary interactive actions (`AppButton` primary/outlined), active navigation/tab states, matriculation numbers, and calendar/appointment highlights.
- **Deep Navy** (`#001F54`): Structural headings, form field labels, and authoritative institutional accents across student and admin portals.

### Secondary
- **Warm Amber Gold** (`#FFC107`): Reserved for high-visibility public navigation CTA pills ("Register") and warning/awaiting status emphasis.

### Tertiary
- **Crimson Alert** (`#FF3739`): Destructive actions (`AppButton` red variant), validation errors, and urgent removal confirmations.

### Neutral
- **Pure White** (`#FFFFFF`): Primary card, modal, and page backgrounds.
- **Tinted Indigo Surface** (`#EEF2FF`): Active list/row highlights and soft informational containers.
- **Subtle Cool Gray** (`#F3F4F6`): Row dividers and secondary surface separation.
- **Charcoal Dark** (`#121921`): High-contrast dark metrics band on the public Home page.
- **Slate Ink** (`#22272F`): Primary body text and input values.
- **Muted Slate** (`#64748B`): Secondary metadata, helper copy, and inactive icons.
- **Input Border Gray** (`#C9C9C9`): Default form input strokes and placeholder text.
- **Hairline Border Gray** (`#E5E7EB`): Card outlines, table borders, and structural dividers.

### Named Rules
**The Cobalt-For-Action Rule.** Reserve Primary Cobalt for interactive controls, active selections, and key academic identifiers (like matric numbers); never flood entire backgrounds with it.
**The Amber-CTA Rule.** Warm Amber Gold appears on the public navigation CTA and status indicators, never as a generic body background.

## Typography

**Display Font:** Poppins (with `sans-serif` fallback)
**Body Font:** Poppins (with `sans-serif` fallback)

**Character:** Clean, geometric, and approachable. Varying weight (`400`–`600`) and deep-navy vs. slate-ink contrast creates clear hierarchy without introducing a second typeface.

### Hierarchy
- **Display** (`600`, `2.25rem`, `1.2`): Hero headlines and major page banners.
- **Headline** (`600`, `1.5rem`, `1.3`): Section headings and dashboard welcome headers.
- **Title** (`600`, `1.125rem`, `1.4`): Card titles, modal headers, and subsection headings.
- **Body** (`400`, `0.875rem`, `1.6`): General copy, table cells, and narrative text (keep prose around 65–75ch).
- **Label** (`500`, `0.875rem`, `1.4`): Form labels in Deep Navy, button text (`600`), and metadata captions.

### Named Rules
**The Single-Family Hierarchy Rule.** Establish contrast through weight (`400`, `500`, `600`) and ink tone (`#001F54` vs. `#22272F` vs. `#64748B`) rather than mixing additional font families.

## Layout

Public pages use centered `container mx-auto` layouts with generous vertical section padding (`py-16`) and multi-column responsive grids (`grid md:grid-cols-2` / `md:grid-cols-3`). Authenticated student and admin portals use a structured `Frame` shell with consistent `space-y-6` vertical rhythm and `pb-16` bottom breathing room.

## Elevation & Depth

Surfaces are flat by default and rely on crisp 1px borders (`#E5E7EB`, `#C9C9C9`) and subtle tonal shifts (`#FFFFFF` on `#F3F4F6` / `#EEF2FF`) to establish hierarchy. Shadows are used sparingly on floating overlays, drawers, and subtle card lifts.

### Named Rules
**The Flat-By-Default Rule.** Cards and data panels rest flat with 1px hairline borders; reserve elevation for overlays, dropdowns, and intentional hover feedback.

## Shapes

Form controls, buttons, and standard cards share a consistent medium corner radius (`6px` / `rounded-md`) for approachable precision. Public navigation CTAs and status chips use pill rounding (`20px` / full) to distinguish navigation actions from form controls.

## Components

### Buttons
- **Shape:** Gently rounded corners (`6px`).
- **Primary:** Solid Primary Cobalt fill, white semibold `14px` text, `40px` height, `32px` horizontal padding.
- **Hover / Focus:** Clear pointer feedback, visible focus outline, and soft active state on outlined variants (`#001EC5` at 10% opacity).
- **Outlined / Red / Plain:** Outlined uses a `1px` Primary Cobalt border; Red uses Crimson Alert fill for destructive actions; Plain uses dark ink without background fill.

### Cards / Containers
- **Corner Style:** `6px`–`8px` radius (`rounded-md` / MUI Joy Card `outlined`).
- **Background:** Pure White (`#FFFFFF`) with Subtle Cool Gray (`#F3F4F6`) internal row dividers.
- **Shadow Strategy:** Flat-by-default with `1px` hairline border.
- **Internal Padding:** `16px`–`24px`.

### Inputs / Fields
- **Style:** Pure White background, `1px` border (`#C9C9C9`), `6px` radius, `12px` padding, paired with Deep Navy (`#001F54`) `14px` medium label above.
- **Focus:** Clear focus ring/border transition without layout shift.
- **Password Toggle:** Inline trailing eye-icon button inside the input container.

### Navigation
- **Style:** Fixed top bar on public routes using a cyan-to-blue horizontal gradient (`from-cyan-500 to-blue-500`), white links, official SOD logos on the left, Warm Amber Gold pill "Register" CTA on the right, and an MUI Drawer on mobile viewports.

## Do's and Don'ts

### Do:
- **Do** use Primary Cobalt (`#001EC5`) for primary buttons, active states, and key student identifiers.
- **Do** pair form inputs with Deep Navy (`#001F54`) labels and `6px` (`rounded-md`) corners.
- **Do** keep cards flat with `1px` borders and clean whitespace (`space-y-6`).
- **Do** preserve official RCCG/SOD logos and leadership photography from `public/images/`.

### Don't:
- **Don't** introduce competing font families outside `Poppins`.
- **Don't** stack heavy drop shadows on every card or table container.
- **Don't** use Crimson Alert (`#FF3739`) for non-destructive actions.
- **Don't** hide essential student actions (registration, payment status, results) behind hover-only interactions on mobile.
