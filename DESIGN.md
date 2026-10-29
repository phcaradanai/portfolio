---
name: Phatcharadanai Kanyapan, Working Studio
description: A portfolio hung as an exhibition of working software, every work with a paper wall label and every claim pinned to its evidence.
colors:
  thread: "oklch(0.64 0.21 29)"
  thread-ink: "oklch(0.5 0.2 29)"
  wall-studio: "oklch(0.3 0.08 245)"
  wall-works: "oklch(0.3 0.09 22)"
  wall-lab: "oklch(0.285 0.055 178)"
  wall-gallery: "oklch(0.2 0.01 270)"
  wall-journey: "oklch(0.32 0.065 68)"
  wall-storage: "oklch(0.35 0.014 235)"
  paper: "oklch(0.975 0.006 92)"
  paper-edge: "oklch(0.86 0.01 92)"
  ink: "oklch(0.17 0.014 258)"
  ink-soft: "oklch(0.38 0.02 258)"
  vinyl: "oklch(0.955 0.012 85)"
  vinyl-soft: "oklch(0.82 0.018 85)"
  lamp: "oklch(0.94 0.07 85)"
  focus: "oklch(0.86 0.15 85)"
  rail: "oklch(0.14 0.012 262)"
  frame-black: "oklch(0.1 0.01 260)"
typography:
  display:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(2.75rem, 1.6rem + 4.6vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.005em"
    fontVariation: "'wdth' 62"
  headline:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(2rem, 1.5rem + 2.2vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.005em"
    fontVariation: "'wdth' 62"
  title:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(1.5rem, 1.3rem + 0.9vw, 2.125rem)"
    fontWeight: 800
    lineHeight: 1
    fontVariation: "'wdth' 62"
  label-title:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1.05rem + 0.35vw, 1.375rem)"
    fontWeight: 750
    lineHeight: 1.2
  wall-text:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1.05rem + 0.35vw, 1.375rem)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(0.9375rem, 0.91rem + 0.15vw, 1.0625rem)"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "'tnum' 1, 'kern' 1"
  label:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  accession:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    letterSpacing: "0.04em"
  code:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  edge: "2px"
spacing:
  s-1: "0.25rem"
  s-2: "0.5rem"
  s-3: "0.75rem"
  s-4: "1rem"
  s-5: "1.5rem"
  s-6: "2rem"
  s-7: "3rem"
  s-8: "4.5rem"
  s-9: "7rem"
  s-10: "10rem"
  gutter: "clamp(1rem, 4vw, 3rem)"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.edge}"
    padding: "0 1.5rem"
    height: "48px"
  button-primary-hover:
    backgroundColor: "oklch(1 0 0)"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.vinyl}"
    rounded: "{rounded.edge}"
    padding: "0 1.5rem"
    height: "48px"
  wall-label:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.edge}"
    padding: "1rem 1.5rem 1.5rem"
    width: "26rem"
  paper-sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.edge}"
    padding: "2rem"
  storage-tag:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.edge}"
    padding: "1.5rem"
  chip:
    backgroundColor: "transparent"
    rounded: "{rounded.edge}"
    padding: "0.15rem 0.5rem 0.15rem 0.4rem"
  tab:
    backgroundColor: "transparent"
    textColor: "{colors.vinyl-soft}"
    padding: "0 1rem"
    height: "44px"
  tab-selected:
    textColor: "{colors.vinyl}"
  filter:
    backgroundColor: "transparent"
    textColor: "{colors.vinyl}"
    rounded: "{rounded.edge}"
    padding: "0 1rem"
    height: "44px"
  filter-pressed:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  frame-mat:
    backgroundColor: "{colors.frame-black}"
    padding: "clamp(6px, 0.7vw, 10px)"
  rail:
    backgroundColor: "{colors.rail}"
    textColor: "{colors.vinyl-soft}"
---

# Design System: Phatcharadanai Kanyapan, Working Studio

## Overview

**Creative North Star: "The Working Studio Exhibition"**

The site is a building, not a page. Each section is a room drenched in one deep wall colour, lit from above by a warm lamp glow that falls off toward a skirting board and a wooden floor. Works hang on those walls in black frames with soft cast shadows, and beside every work sits a white paper wall label written in museum grammar: a bold title with the year, run-in fields (Medium, Made, Made by, Status), a short text, evidence chips, and an accession number at the foot. Room names and section names are cut vinyl lettering applied straight to the wall: heavy, condensed, uppercase Archivo.

The density is that of a well-hung gallery: few objects per wall, generous space between them, long reading moved onto paper sheets like catalogue pages. Proof is the ornament. The single accent colour is a red thread that marks evidence: the current room in the rail, the selected tab, the x-ray edge, the architecture drawing's edges, a targeted ledger entry. Everything else is wall, paper, ink, vinyl and black frames.

Motion is one authored moment per surface, an exponential ease-out on transform and opacity: frames lift 3px on hover, doorway arrows slide 4px, the depth painting follows the pointer. Content is visible by default, and reduced motion removes every transition and the painting's movement.

**Key Characteristics:**
- One deep wall colour per room, with lamp glow above and a floor below.
- Works in black frames with soft cast shadows; paper wall labels beside them.
- Condensed uppercase vinyl lettering for room and section names; Hanken Grotesk for all reading.
- One red thread accent, reserved for evidence and current state.
- Near-square 2px corners on every paper and control.
- Evidence level carried by shape and word, never colour alone.

## Colors

Six saturated, dark wall colours carry the rooms; warm paper and cool ink carry the reading; a single red carries evidence.

### Primary
- **Evidence Thread** (`thread`): The one accent. The current-room underline in the rail, the selected tab's 3px rule, the x-ray split edge and the range input's accent, blueprint edges, the open mobile menu, text selection, a targeted ledger entry's outline.
- **Thread on Paper** (`thread-ink`): The same red darkened to hold 4.5:1 on paper. Link underlines inside wall labels and the square bullets of the caveats list.

### Secondary
The room walls. Each room owns exactly one, set through the room's wall variable; lamp glow, skirting and floor are mixed from it.
- **Prussian** (`wall-studio`): The Foyer and the Studio, and the page background.
- **Oxblood** (`wall-works`): Project worlds and every case study.
- **Verdigris** (`wall-lab`): The engineering lab.
- **Graphite** (`wall-gallery`): The art gallery; also the scrollbar track.
- **Umber** (`wall-journey`): The journey.
- **Concrete** (`wall-storage`): Storage: private works, the evidence ledger, the 404 room.

### Neutral
- **Label Paper** (`paper`): Wall labels, paper sheets, storage tags, the resume, primary buttons, the pressed filter.
- **Paper Edge** (`paper-edge`): Hairline dividers on paper; the accession rule.
- **Ink** (`ink`): All text on paper.
- **Soft Ink** (`ink-soft`): Secondary text on paper, at 7:1 or better.
- **Vinyl** (`vinyl`): Lettering and text applied directly to a wall.
- **Soft Vinyl** (`vinyl-soft`): Secondary text on walls, captions, inactive tabs and rail links.
- **Lamp** (`lamp`): The warm overhead light mixed into each wall's glow and into frame halos; the command line colour in captured runs.
- **Brass Focus** (`focus`): The 3px focus outline, offset 3px.
- **Ceiling Black** (`rail`): The sticky rail, the mobile sheet and, one step darker, the lobby footer.
- **Frame Black** (`frame-black`): The mat of every frame.

### Named Rules
**The Red Thread Rule.** Red marks evidence and current state only: what is selected, targeted or connected. It is never a fill for a button, a heading colour, or decoration.

**The One Wall Rule.** A room has one wall colour. Glow, skirting and floor are mixed from it with `color-mix`, never introduced as new hues.

**The Paper and Wall Rule.** Text on paper uses ink; text on a wall uses vinyl. Never put ink on a wall or vinyl on paper.

## Typography

**Display Font:** Archivo variable (width and weight axes), with Arial Narrow fallback
**Body Font:** Hanken Grotesk, with system-ui fallback
**Label/Mono Font:** Martian Mono, with ui-monospace fallback

**Character:** Archivo at 800 weight and 62% width reads as cut vinyl on a gallery wall; Hanken Grotesk is a calm, legible label face; Martian Mono appears only where a value must be copied exactly.

### Hierarchy
- **Display** (Archivo 800, width 62%, uppercase, up to 6rem, line-height 0.92): Room names and the Foyer name. 6rem is the ceiling.
- **Headline** (Archivo 800, width 62%, uppercase, up to 3.5rem): Section names on a wall, such as "On the wall now" and "In storage".
- **Title** (Archivo 800, width 62%, uppercase, up to 2.125rem, line-height 1): Doorway signs, the next-work sign, sub-sections on a wall. Storage-tag titles and story headings use the same weight at 75% width.
- **Label title** (Hanken Grotesk 750, up to 1.375rem, line-height 1.2): Wall-label titles, paper-sheet headings, lobby headings, shelf titles.
- **Wall text** (Hanken Grotesk 400, up to 1.375rem, line-height 1.5, max 38ch): Statements applied directly to a wall.
- **Body** (Hanken Grotesk 400, up to 1.0625rem, line-height 1.6, tabular numerals): Running text; story paragraphs at 68ch and line-height 1.65.
- **Label** (Hanken Grotesk, 0.9375rem, line-height 1.5): Wall-label fields and text. Field names are 650 weight, followed by a colon, run in with the value.
- **Accession** (Martian Mono 500, 0.6875rem, 0.04em tracking): Accession numbers, at the foot of a label above a paper-edge hairline.
- **Code** (Martian Mono, 0.8125rem, line-height 1.7): Code excerpts, file paths, commit hashes, captured runs.

### Named Rules
**The Vinyl Ceiling Rule.** Display vinyl never exceeds 6rem. Long work titles step down from Display to Headline.

**The Mono for Identifiers Rule.** Martian Mono is only for identifiers, paths, hashes and code. Prose, headings, captions, dates and counts are Hanken Grotesk.

## Layout

Each room is a full-bleed section with a centred wall of at most 90rem, a responsive gutter, 4.5rem of space above the content and 7rem below, then the floor. Inside, the wall is a 12-column grid with a 1.5rem column gap and 3rem row gap. Works hang in pairs: a frame across seven columns and its label across five, alternating left and right so the walk down a room zig-zags. In the Foyer the intro takes the left six columns and the framed painting the right six, with the painting's label under the intro.

The spacing scale runs from 0.25rem to 10rem on a 4px base (see `spacing`). Long reading uses an 8-column paper sheet with a sticky 4-column aside of labels. The gallery hangs pictures in CSS columns (3 columns, 17rem minimum) without crops. Below 52rem everything collapses to a single column in reading order, the rail links fold into a paper "menu" button, and the case aside stops being sticky. Touch targets are at least 44px.

## Elevation & Depth

Depth is physical: objects hang on a lit wall. Frames and paper cast soft, layered, downward shadows; walls carry a radial lamp glow from above and darken toward a floor with an inset shadow under the skirting. Frames add a faint screen-blended lamp halo behind them. There are no hard offset shadows, no glass, and no blur.

### Shadow Vocabulary
- **Frame cast** (`box-shadow: 0 1px 1px oklch(0 0 0 / 0.5), 0 10px 18px -6px oklch(0 0 0 / 0.55), 0 28px 48px -16px oklch(0 0 0 / 0.5)`): Every frame mat. On a linked frame's hover it deepens and the frame lifts 3px.
- **Paper on wall** (`box-shadow: 0 1px 0 oklch(1 0 0 / 0.6) inset, 0 2px 3px oklch(0 0 0 / 0.35), 0 12px 20px -10px oklch(0 0 0 / 0.55)`): Wall labels, paper sheets, storage tags, primary buttons, code and capture panels.
- **Rail** (`box-shadow: 0 8px 18px -10px oklch(0 0 0 / 0.7)`): The sticky ceiling rail.
- **Viewer** (`box-shadow: 0 30px 80px oklch(0 0 0 / 0.6)`): The picture viewer dialog.

### Named Rules
**The Hung Object Rule.** Only objects that hang on the wall cast shadows, and they cast them downward from an overhead light. Wall text and vinyl lettering sit flat, with at most a 1px shadow.

## Shapes

Edges are near-square: 2px (`rounded.edge`) on paper, buttons, chips, tabs, filters, code panels and the viewer. Frames have no radius. Dividers are 1px hairlines, white at 8 to 20% on walls and paper-edge on paper. Private work is marked by dashed lines: a dashed chip border and a dashed inner rule inset 8px on storage tags. The AI-generated chip uses a 3px double border.

## Components

### Buttons
Paper cards you can press.
- **Shape:** near-square (2px), 48px tall, 1.5rem side padding, 700 weight text with an optional trailing arrow.
- **Primary:** paper with ink text and the paper shadow.
- **Hover / Focus:** lifts 2px and turns pure white; the arrow slides 3px. Focus is the brass outline.
- **Ghost:** transparent with a 2px inset white line at 50% and vinyl text; hover fills white at 10%.
- **Small:** 44px tall with a paper-edge border and no shadow, used in the viewer.

### Chips
Evidence levels, each a shape plus a word.
- **Style:** 0.75rem, 650 weight, 1px border in the current colour, transparent fill, a 14px line glyph before the word.
- **Variants:** Source (bracketed glyph, green-ink on paper), Reported (speech glyph, amber-ink), Ran (play glyph, blue-ink), Private (box glyph, dashed border), AI-generated (3px double border).
- **State:** linked chips gain a faint fill and underline on hover.

### Cards / Containers
- **Wall label:** paper, 2px corners, paper shadow, max 26rem. Bold title with the year in soft ink, run-in fields, text, chips, accession number at the foot.
- **Paper sheet:** the same paper at 2rem padding for long reading, tables and charts.
- **Storage tag:** private work. Paper with a dashed soft-ink inner rule inset 8px, a condensed vinyl title in ink, period and stack, plain facts, a "Not on view" private chip, and the accession at the foot. Nothing inside a private work is shown.

### Navigation
- **Rail:** sticky ceiling-black bar. Condensed uppercase name mark with the role in soft vinyl, five room links in 550 weight soft vinyl, a small floor-plan glyph. Hover and current turn vinyl; current adds a 2px red thread underline.
- **Mobile:** a paper "menu" summary that turns red when open, revealing a full-height sheet of large condensed links.
- **Doorway:** the way to the next room is a vinyl sign, an arrow that slides 4px on hover, and an optional soft hint. Nothing more.

### Tabs and Filters
- **Tabs:** transparent, 44px tall, soft vinyl at 650 weight; selected turns vinyl with a 3px red thread underline.
- **Filters:** outlined toggles (1px white at 42%); pressed becomes paper with ink.

### X-ray Split
The signature component. On any work with both a screenshot and an architecture drawing, the running screen sits over its blueprint and a native range input wipes between them. The split edge is a 2px red thread line; the blueprint is deep blue with hairline nodes, mono labels and red edges.

### Code and Captures
Ceiling-black panels with the paper shadow and a lighter header carrying the file path, commit and source link. Code shows right-aligned line numbers at the pinned start line. Captured runs show the command in lamp colour.

## Night Gallery & Future Museum Specification (Awwwards / Contest Experience)

The Future Museum direction upgrades the Working Studio exhibition with an immersive 3D isometric island world powered by React Three Fiber (R3F), while preserving the museum core:

1. **Dark 3D Stage Boundary:** The dark 3D isometric stage is permitted exclusively in the Foyer (`/`) and the Agent Command Studio (`/agents`).
2. **WebGL Containment Rule:** Bloom, specular metallic glints, depth-of-field, and film grain are strictly contained within the WebGL canvas viewport. All DOM UI elements outside the canvas adhere to the physical museum grammar: flat paper cards, crisp ink typography, and 2px rounded corners. No DOM glassmorphism or floating frosted glass cards.
3. **Evidence Thread as Light Beam:** The red thread (`thread`) remains the singular accent color for evidence and current state. In the 3D world, it manifests as a dedicated procedural light beam connecting monuments directly to their corresponding museum paper wall labels.
4. **Cinematic Motion Vocabulary:**
   - 3D camera transitions between districts/monuments use an easeInOut cubic curve (900–1400 ms).
   - DOM page transitions use React 19 `<ViewTransition>` (320 ms) with directional cues.
   - Cinematic intro sequence runs for at most 2.5 seconds, is skippable via keyboard/click, and never replays within the same session.
5. **Universal Fallback & Reduced Motion:** When `prefers-reduced-motion: reduce` or non-WebGL capability is detected, the 3D canvas is replaced with an optimized static poster hero image (`world-poster.avif`), transitions drop to instantaneous, and full semantic HTML remains 100% accessible.

## Do's and Don'ts

### Do:
- **Do** give every room exactly one wall colour from the six walls and mix its glow and floor from it.
- **Do** hang every shown work in a black frame with the frame cast shadow, with a paper wall label beside it.
- **Do** write wall labels in run-in museum grammar and put the accession number at the foot.
- **Do** carry evidence level with a glyph and a word in a chip, never colour alone.
- **Do** show private work only as a storage tag with a dashed inner rule, marked "Not on view".
- **Do** keep vinyl display at or under 6rem, and every interactive target at least 44px.
- **Do** honour reduced motion: content stays visible and transitions drop to nothing.
- **Do** contain WebGL bloom and post-processing strictly inside the canvas container.

### Don't:
- **Don't** use the red thread as a fill, a heading colour or decoration.
- **Don't** set prose, headings, captions, dates or counts in Martian Mono.
- **Don't** round paper or controls beyond 2px, or give frames a radius.
- **Don't** use DOM-level glassmorphism, blur, or floating dark glass cards over content.
- **Don't** put ink text directly on a wall or vinyl text on paper.
