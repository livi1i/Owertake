# Plaid — engraved electric optimism

## Overview

An optimistic infrastructure style that pairs banknote-like engraving and flowing data filaments with electric blue, mint and violet light. Rounded geometric sans headlines and practical grotesk body text keep elaborate illustrations approachable, while occasional delicate serif numerals add an unexpected editorial note. Spacious pale canvases alternate with deep navy stages, luminous product diagrams and human customer stories; it suits ambitious technical products that need both trust and energy.

### Essentials

- Big promises feel rounded rather than monumental: the default headline is Plaid Sans 76px/1.12, weight 500, tracking -3.4px, with lime-to-mint-to-white clipped color.
- The opening is an illustrated environment, not a boxed dashboard: a 929px full-width blue-to-mint stage carries a left headline across about two thirds of the width and a giant engraved subject on the right, behind the text.
- Controls are little luminous objects: 56px pill actions pair pale mint fill with charcoal fill and a thin multicolor rim; the floating navigation is a 71px translucent white capsule with 40px corners and 15px backdrop blur.
- Color has a hierarchy: pale ice and lavender cover most of the default page, saturated blue and mint belong to the opening and conversion stages, and navy anchors feature panels and the footer. Violet is concentrated in numerals, glows and illustrated media rather than everyday paragraphs.
- Technical ideas become tangible scenes: interface fragments sit on pastel gradient fields, over fine flowing contour lines, with soft cyan or violet lighting. Every new page carries the filament motif and at least one luminous product scene; use a simple connected SVG diagram when bespoke art is unavailable.
- Proof changes register: delicate Bowery Street numerals at 70px/0.94, weight 300, -0.05em tracking, carry purple gradient fill above compact 30px sans explanations.
- The final invitation is a visual destination: a short stacked headline faces a white 35px-radius form inside a 5px luminous surround with magenta glow, followed by a deep navy directory footer.

## Colors

### Brand

| Name | Value | Token | Roles | Use |
| --- | --- | --- | --- | --- |
| Electric blue | `#0e94d8` | `--color-electric-blue` | background | Saturated atmospheric gradient midpoint. |
| Electric mint | `#42f0cd` | `--color-electric-mint` | background, accent | Atmospheric gradient end and submit action start. |
| Ocean blue | `#07578c` | `--color-ocean` | background | Saturated atmospheric gradient start. |
| Teal ink | `#003e4a` | `--color-teal-ink` | text | Pale mint action text and comparison links. |
| Panel blue | `#02294b` | `--color-panel-blue` | background, text, border | Feature panels, form headings and field outlines. |
| Violet night | `#0d0d3f` | `--color-violet-night` | background | Developer stage. |
| Deep navy | `#00172e` | `--color-navy` | text, background | Primary ink on pale canvases, dark product themes and footer. |

### Accent

| Name | Value | Token | Roles | Use |
| --- | --- | --- | --- | --- |
| Submit blue | `#0dadf2` | `--color-submit-blue` | action | Mint-to-blue submit gradient end. |
| Headline mint | `#10d0b7` | `--color-headline-mint` | text, accent | Gradient headline midpoint. |
| Cyan light | `#56ddf7` | `--color-cyan-light` | accent, action | Developer action and cyan lighting. |
| Headline lime | `#86ef5a` | `--color-lime` | text, accent | Gradient headline start. |
| Numeral purple | `#6748d8` | `--color-purple` | text, accent | Serif proof numeral gradient start. |
| Numeral orchid | `#b14edb` | `--color-orchid` | text, accent | Serif proof numeral gradient end. |
| Violet light | `#8b8bf9` | `--color-violet-light` | accent, action | Developer action and outer panel glow. |
| Plum ink | `#3f0849` | `--color-privacy-ink` | text | Text on reassurance ribbon. |
| Tile cyan | `#ccf8ff` | `--color-tile-cyan` | surface | Product tile gradient end and announcement ticket. |
| Pale cyan | `#cdf5fd` | `--color-button-cyan` | action | Pale opening action gradient start. |
| Pale lime | `#e8fed7` | `--color-pale-lime` | action | Pale opening action gradient end. |
| Pale mint | `#d8fef3` | `--color-pale-mint` | action, text | Opening action midpoint and footer category headings. |
| Lavender ribbon | `#eaddfd` | `--color-privacy-lavender` | surface | Secondary reassurance ribbon near conversion. |
| Tile lavender | `#e6e6ff` | `--color-tile-lavender` | surface | Pastel product tile gradient start. |
| Tile blue | `#e5effe` | `--color-tile-blue` | surface | Pastel product tile gradient midpoint. |

### Neutral

| Name | Value | Token | Roles | Use |
| --- | --- | --- | --- | --- |
| Soft blue text | `#5c7695` | `--color-slate` | text | Supporting clause inside product tile headings. |
| Ice cyan | `#e5fcff` | `--color-ice-cyan` | background | Pale canvas gradient end. |
| Near black | `#111111` | `--color-ink` | text, background | Pricing and institutional headings. |
| Action charcoal | `#111112` | `--color-charcoal` | action, background | Dark action gradient start. |
| Navigation ink | `#232424` | `--color-nav-text` | text | Navigation text on glass. |
| Action charcoal light | `#373839` | `--color-charcoal-soft` | action, background | Dark action gradient end. |
| Paragraph gray | `#383838` | `--color-body-muted` | text | Secondary paragraphs on pale grounds. |
| Field gray | `#555555` | `--color-field-text` | text | Form labels. |
| Ice lavender | `#f5f5ff` | `--color-ice-lavender` | background | Pale canvas gradient end. |
| Ice blue | `#f7faff` | `--color-ice-blue` | background | Pale canvas midpoint. |
| White | `#ffffff` | `--color-white` | text, background, surface | Form interiors, pale actions and reversed text. Navigation uses white at 70% alpha. |

### Page-type variants

| Only for | Name | Value | Token | Roles | Use |
| --- | --- | --- | --- | --- | --- |
| institutional pages | Institutional lavender | `#e1e1ff` | `--color-culture-lavender` | background | Mission introduction. |
| developer demonstrations | Code black | `#0c1116` | `--color-code-black` | background | Code demonstration panel. |
| developer demonstrations | Code gray | `#c5c5c5` | `--color-code-gray` | text | Code demonstration text. |

## Typography

- **Plaid Sans** — Marketing headlines, product tile labels and lead paragraphs. Rounded geometric sans with open counters and broad, friendly curves; medium weights carry the largest statements. If unavailable, use **DM Sans**. Use 500–600 and retain tight tracking; adjust line wrapping to the intended composition. Font stack: "Plaid Sans", "DM Sans", Cern, Helvetica, Arial, sans-serif.
- **Cern** — Body copy, navigation, actions and forms. Practical grotesk with clear small text and firmer bold cuts. If unavailable, use **Inter**. Use 400–800; keep body paragraphs less tightly tracked than headings. Font stack: "Cern", "Inter", Helvetica, Arial, sans-serif.
- **Bowery Street** — Large proof numerals. Delicate high-contrast serif numerals with a narrow editorial silhouette. If unavailable, use **Bodoni Moda**. Use 400 with tight spacing; preserve the thin-stroke contrast. Font stack: "Bowery Street", "Bodoni Moda", Georgia, serif.
- **Inconsolata** — Code and institutional overlines. Narrow, human monospace; airy uppercase labels contrast with closely set code. Font stack: "Inconsolata", Consolas, Courier, monospace.

| Recipe | Font | Weight | Size | Line height | Tracking | Use |
| --- | --- | --- | --- | --- | --- | --- |
| display | Plaid Sans | 500 | 76px | 1.12 | -0.0447em | Default illustrated opening headline. |
| heading-lg | Plaid Sans | 500 | 70px | 1.08 | -0.0286em | Large reversed feature-panel headline. |
| proof-heading | Plaid Sans | 500 | 70px | 1.2 | -0.04em | Large headline beside the flowing proof scene. |
| developer-heading | Plaid Sans | 500 | 70px | 1.13 | -0.04em | Centered developer-stage heading. |
| closing-heading | Plaid Sans | 500 | 70px | 1.1 | -0.0129em | Stacked gradient closing invitation. |
| stat | Bowery Street | 300 | 70px | 0.94 | -0.05em | Gradient proof numerals. |
| heading | Plaid Sans | 500 | 58px | 1.14 | -0.0345em | Default pale section introduction. |
| story-heading | Plaid Sans | 500 | 50px | 0.94 | -0.04em | Customer-story gallery lead. |
| form-heading | Plaid Sans | 500 | 30px | 1.2 | -0.02em | Conversion form heading. |
| stat-caption | Plaid Sans | 500 | 30px | 0.94 | -0.04em | Compact explanations directly below serif numerals. |
| tile-title | Plaid Sans | 600 | 26px | 1.4 | -0.0192em | Emphasized leading phrase inside a product tile title. |
| tile-support | Plaid Sans | 500 | 26px | 1.4 | -0.0192em | Blue-gray continuation of product tile title. |
| lead | Plaid Sans | 400 | 24px | 1.4 | normal | Opening support paragraph. |
| body-lg | Cern | 400 | 24px | 1.5 | normal | Editorial support for large proof sections. |
| body | Cern | 400 | 20px | 1.5 | -0.01em | Feature explanations. |
| action | Cern | 600 | 20px | 1.5 | -0.0375em | Standard marketing action labels. |
| gradient-action | Cern | 600 | 20px | 1.5 | normal | Developer and closing gradient action labels. |
| body-small | Cern | 400 | 16px | 1.5 | normal | Forms, directory links and institutional paragraphs. |
| nav | Cern | 600 | 16px | 1.5 | normal | Floating navigation. |
| footer-heading | Cern | 700 | 16px | 1.33333 | normal | Mint footer category labels. |

### Page-type variants

| Only for | Recipe | Font | Weight | Size | Line height | Tracking | Use |
| --- | --- | --- | --- | --- | --- | --- | --- |
| pricing pages | pricing-display | Plaid Sans | 600 | 80px | 1 | -0.025em | Plan-selection introduction. |
| product landing pages | product-display | Plaid Sans | 600 | 64px | 1.08 | -0.0313em | Product-specific opening headline. |
| product and pricing pages | product-heading | Plaid Sans | 600 | 60px | 1.1 | -0.0333em | Product section leads, conversion headlines and FAQ introductions. |
| institutional pages | institutional-stat | Cern | 300 | 60px | 1 | normal | Plain organizational fact numerals. |
| pricing and testimonial sections | plan-heading | Plaid Sans | 600 | 40px | 1.2 | -0.05em | Plan names and large light-theme quotes. |
| product landing pages | feature-heading | Plaid Sans | 600 | 36px | 42px | -0.0556em | Split feature chapters and testimonial text. |
| institutional pages | institutional-display | Cern | 800 | 36px | 1.33333 | normal | Mission headline. |
| dark product pages | feature-card-heading | Plaid Sans | 600 | 28px | 36px | -0.0536em | Three-column product capability headings. |
| developer demonstrations | code | Inconsolata | 400 | 26.9px | 1.5 | -0.0023em, features "clig" 0, "liga" 0 | Oversized readable code scene. |
| product landing pages | compact-card-heading | Plaid Sans | 600 | 24px | 36px | -0.0333em | Related-product and use-case cards. |
| institutional pages | institutional-heading | Cern | 800 | 24px | 1.5 | normal | Editorial chapter and recruitment headings. |
| FAQ sections | question | Cern | 600 | 20px | 1.5 | -0.015em | Accordion question labels. |
| product landing pages | compact-card-body | Cern | 400 | 18px | 28px | -0.0167em | Related-product and use-case descriptions. |
| product landing pages | eyebrow | Cern | 800 | 16px | 1.12 | 0.125em, uppercase | Product identity and use-case overlines. |
| institutional pages | institutional-label | Inconsolata | 600 | 14px | 20px | 0.214em, uppercase | Editorial chapter overlines. |

**Notes:**

- Default marketing headings favor weight 500; product-specific pages use weight 600 and a narrower 64px opening scale. Do not average these into one recipe.
- Large headlines use negative tracking but ordinary body text stays close to normal. Product tile titles combine two weights and two colors in the same sentence.
- Gradient text is real text with transparent fill and background clipping; preserve selectable, semantic headings.
- The serif appears as a proof accent, not as a general heading or paragraph family.

## Layout

**Density:** Airy stages with concentrated content groups: broad chapter breaks surround compact cards, forms and directory lists.

### Spacing

| Value | Use |
| --- | --- |
| 8px | Small label margins and internal alignment. |
| 16px | Paired actions, form columns and feature title-to-copy gaps. |
| 24px | Product tile gutters, related-card gutters and headline-to-lead separation. |
| 32px | Product hero text stack and feature grid gutters. |
| 48px | Large panel headline-to-action separation. |
| 64px | Major internal content groups and promotional panel vertical padding. |
| 70px | Conversion form inner padding and developer stage top inset. |
| 80px | Footer top and bottom padding. |
| 130px | Pale section introduction after the illustrated opening. |
| 164px | Customer gallery top breathing room. |
| 200px | Product chapter separation. |

### Containers and grids

- **outer-shell**: max width 1730px · side padding 40px. Centered desktop shell; full-bleed atmosphere extends outside it.
- **marketing-stage**: max width 1245px · gap 24px. Wide default content span at a 1440px desktop: product tiles, feature stages and closing form composition.
- **product-content**: max width 1131px · gap 32px. Narrower product-page content span; two balanced columns with roughly 557px media.
- **feature-grid**: 3 columns · gap 32px. Three capability illustrations with aligned headings and descriptions.
- **card-grid**: 3 columns · gap 24px. Related-product cards, use cases and plan selection.
- **footer-grid**: 5 columns · gap 24px. Brand mark column plus four directory columns; smaller directory groups continue below.
- **institutional-container** (only for institutional pages): max width 1008px · side padding 24px. Narrow editorial text and fact-row alignment.

## Corner radius

| Only for | Element | Radius |
| --- | --- | --- |
|  | action | 100px |
|  | navigation | 40px |
|  | feature-stage | 24px |
|  | developer-stage | 40px |
|  | form-interior | 35px |
|  | form-surround | 40px |
|  | input | 8px |
| pricing pages | plan-card | 12px |
| product landing pages | related-card | 17px |

## Surfaces and depth

### Shadows

| Only for | Name | Value | Use |
| --- | --- | --- | --- |
|  | navigation | `0px 2px 8px 0px rgba(0,0,0,0.06), 0px 0px 0px 1px rgba(255,255,255,0.12) inset, 0px 6px 12px 0px rgba(85,85,85,0.12)` | Soft floating navigation elevation. |
|  | conversion-glow | `0px 0px 36px 5px rgba(243,49,247,0.43)` | Magenta glow around conversion form surround. |
|  | developer-glow | `0px 0px 70px 0px rgba(139,139,249,0.7)` | Violet halo around developer stage. |
| developer demonstrations | code-glow | `0px 4px 150px 0px rgba(86,221,247,0.8)` | Cyan glow behind code demonstration. |

### Surfaces

#### Pale atmosphere · level 0

**Use:** Default long-form marketing canvas.

**CSS:** `background: linear-gradient(to left bottom, #f5f5ff 0%, #f7faff 50%, #e5fcff 100%)`

**Observed:** The light canvas reads almost neutral; gently changing cool hues hold large amounts of whitespace.

**Transfer:** Use this as the default between saturated narrative stages.

#### Electric atmosphere · level 0

**Use:** Opening and closing conversion environments.

**CSS:** `background: linear-gradient(-210deg, #07578c 27.07%, #0e94d8 59.71%, #42f0cd 92.45%)`

**Observed:** A broad ocean-to-cyan-to-mint field carries contour lines and large illustrative layers. The closing variant runs at 101deg with stops at 25.5%, 55.8% and 86.2%.

**Transfer:** Keep the darkest region behind supporting white text and the brightest glow toward the illustrative edge.

#### Pastel product field · level 1

**Use:** Product category tile backing.

**CSS:** `background: linear-gradient(46deg, #e6e6ff 2.73%, #e5effe 47.11%, #ccf8ff 100%); border-radius: 24px; overflow: hidden`

**Observed:** Illustrations occupy the lower majority of each tile; titles live above them.

**Transfer:** Tint diagrams softly rather than making the entire tile vivid purple.

#### Blue feature stage · level 1

**Use:** Large illustrative feature or testimonial panels.

**CSS:** `background: #02294b; border-radius: 24px; overflow: hidden`

**Observed:** White text sits over engraving or network art with the subject anchored to the opposite side.

**Transfer:** Use for an important change of narrative register.

#### Developer night · level 1

**Use:** Technical invitation and code demonstration.

**CSS:** `background: #0d0d3f; border-radius: 40px; box-shadow: 0px 0px 70px 0px rgba(139,139,249,0.7); overflow: hidden`

**Observed:** A centered white headline and actions sit above a cyan-lit code panel; filaments emerge along the lower edges.

**Transfer:** Use a real short example or a simplified diagram as the centerpiece.

#### Navy canvas · level 0

**Use:** Dark product variant and common footer.

**CSS:** `background: #00172e; color: #ffffff`

**Observed:** Dark product pages maintain long uninterrupted navy fields, with localized blue/violet illumination.

**Transfer:** Use as a scoped dark product theme instead of turning every default section dark.

#### Form surround · level 2

**Use:** Luminous edge around the final form.

**CSS:** `padding: 5px; border-radius: 40px; box-shadow: 0px 0px 36px 5px rgba(243,49,247,0.43); overflow: hidden`

**Observed:** A narrow iridescent layer is visible between the white card and magenta halo.

**Transfer:** Layer a fine spectrum ring beneath the white form; keep the glow localized to its perimeter.

#### Institutional field · level 0

**Only for:** institutional pages

**Use:** Mission introduction.

**CSS:** `background: #e1e1ff`

**Observed:** Flat lavender supports black type and outlined human illustration without the electric opening treatment.

**Transfer:** Use for a calmer organizational story.

## Components

### Floating navigation

**Use:** Persistent global navigation.

**CSS:** `background: rgba(255,255,255,0.7); backdrop-filter: blur(15px); border-radius: 40px; height: 71px; padding: 0px 18px 0px 24px; box-shadow: 0px 2px 8px 0px rgba(0,0,0,0.06), 0px 0px 0px 1px rgba(255,255,255,0.12) inset, 0px 6px 12px 0px rgba(85,85,85,0.12)`

**Text style:** `nav` — Cern 600 · 16px/1.5

**Observed:** Centered capsule floats 24px below the viewport top, narrower than the main marketing content. Mark on left, grouped text tabs in the middle, outlined sign-in and small dark sales action on right. Dropdown tabs have small downward chevrons.

**Transfer:** Keep the capsule distinct from the scene behind it; do not stretch it into a full-width bar.

### Dark spectrum button

**Use:** Primary or paired technical action.

**CSS:** `background: linear-gradient(77deg, #111112 0%, #373839 100%); color: #ffffff; border-radius: 100px; height: 56px; padding: 0px 24px; box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.2); display: inline-flex; align-items: center; justify-content: center`

**Text style:** `action` — Cern 600 · 20px/1.5 · tracking -0.0375em

**Observed:** The dark inner pill is inset inside a thin spectrum ring. Build that ring as an absolutely positioned masked layer with 3px padding and a full-hue conic gradient; the inner face conceals most of it. Navigation uses a 39px-height version.

**States:** Declared: hover box-shadow #5e5ed9 0px 0px 14px and color #0f0f0f; focus-visible outline #043c67 solid 2px with 3px offset; active box-shadow none.

**Transfer:** Use one dark action next to a light action, not a row of equal dark buttons.

### Pale mint button

**Use:** Default opening conversation action.

**CSS:** `background: linear-gradient(108deg, #cdf5fd 0%, #d8fef3 50%, #e8fed7 100%); color: #003e4a; border-radius: 46px; height: 56px; padding: 13px 32px; box-shadow: 0px 1px 5px 0px rgba(0,0,0,0.15) inset; display: inline-flex; align-items: center; justify-content: center`

**Text style:** `action` — Cern 600 · 20px/1.5 · tracking -0.0375em

**Observed:** A soft luminous solid-looking pill without an icon, paired with the dark action.

**States:** Declared: hover background linear-gradient(266deg, #c0ffc0 -7.84%, #ffffff 100%) and color #0f0f0f.

**Transfer:** Retain the pale fill on saturated backgrounds; related light spectrum buttons on navy use white-to-gray interiors.

### Product tile

**Use:** Clickable category overview.

**CSS:** `background: linear-gradient(46deg, #e6e6ff 2.73%, #e5effe 47.11%, #ccf8ff 100%); border-radius: 24px; overflow: hidden; position: relative`

**Text style:** `tile-support` — Plaid Sans 500 · 26px/1.4 · tracking -0.0192em

**Observed:** A dark semibold leading phrase flows directly into a muted medium-weight explanation. Title padding is 29px top and 24px left; a 42px circular arrow with a fine lavender outline is pinned to the upper right. Two wide tiles sit above three narrower tiles; detailed product scenes occupy the bottom.

**Transfer:** Use a concise category plus a benefit clause and one focused diagram per tile.

### Conversion form

**Use:** Final lead-generation destination.

**CSS:** `background: #ffffff; border-radius: 35px; padding: 70px; color: #02294b`

**Text style:** `form-heading` — Plaid Sans 500 · 30px/1.2 · tracking -0.02em

**Observed:** Placed inside Form surround. Heading precedes three paired field rows, a short consent line and a left-aligned pill submit. Two columns have a 16px gutter; row groups occupy 80px including spacing. Dark product themes retain the white form.

**Transfer:** Ask only for information necessary to continue the conversation; use the same bright form object across themes.

### Form field

**Use:** Contact details and country selector.

**CSS:** `background: #ffffff; border: 1px solid #02294b; border-radius: 8px; height: 48px; padding: 8px 8px 8px 16px; color: #555555`

**Text style:** `body-small` — Cern 400 · 16px/1.5

**Observed:** Visible labels sit within the field area; the country selector adds a restrained down chevron. Desktop fields are approximately 253px wide within a 522px form content area.

**Transfer:** Maintain accessible persistent labels even when their visual treatment resembles placeholder text.

### Gradient submit

**Use:** Conversion form submit action.

**CSS:** `background: linear-gradient(132deg, #42f0cd 0%, #0dadf2 82.97%); color: #00172e; height: 46px; border-radius: 46px; padding: 8px 30px; box-shadow: 0px 1px 5px 0px rgba(0,0,0,0.15)`

**Text style:** `gradient-action` — Cern 600 · 20px/1.5

**Observed:** Smaller than the opening actions. Dark product variants use Dark spectrum button instead.

**States:** Declared: hover background linear-gradient(141deg, #42f0cd 67.77%, #0dadf2 93.58%); active transform scale(0.98) and transparent box-shadow.

**Transfer:** Reserve this vivid mint-to-blue pill for the actual final form action.

### Reassurance ribbon

**Use:** Secondary user-facing reassurance beside the main conversion story.

**CSS:** `background: #eaddfd; border-radius: 50px; padding: 32px 54px; display: flex; align-items: center; justify-content: space-between; gap: 32px; color: #3f0849`

**Text style:** `body` — Cern 400 · 20px/1.5 · tracking -0.01em

**Observed:** Wide low ribbon beneath the form composition; a two-line reassurance sits left and a purple-gradient destination link sits right.

**Transfer:** Use for a distinct secondary audience or trust concern, separate from the sales form.

### Directory footer

**Use:** Common ending across page types.

**CSS:** `background: #00172e; color: #ffffff; border-radius: 40px 40px 0px 0px; padding: 80px 100px`

**Text style:** `body-small` — Cern 400 · 16px/1.5

**Observed:** A small white brand mark occupies the first grid column. Mint category headings sit above dense white link lists; secondary categories continue underneath. The lower edge contains social icons and a compact row of copyright, country selection and privacy choices. Dark product and institutional variants join flush without rounded top corners.

**States:** Declared: hover footer link color #0a85ea with no text decoration.

**Transfer:** Preserve a substantial navigational ending; scale the number of categories to the actual information architecture.

### Plan card

**Only for:** pricing pages

**Use:** Plan selection.

**CSS:** `background: #ffffff; border-radius: 12px; padding: 40px 36px 36px 36px; display: flex; flex-direction: column; justify-content: space-between`

**Text style:** `plan-heading` — Plaid Sans 600 · 40px/1.2 · tracking -0.05em

**Observed:** Three equal-height cards use plan name, colored audience line, short explanation, uppercase key-features label and check list, with actions aligned at the bottom. Each plan gets its own teal, purple or blue gradient action and matching accent text; soft rainbow illumination sits behind the cards.

**Transfer:** Distinguish audiences rather than inventing a single oversized recommended card.

### FAQ item

**Only for:** FAQ sections

**Use:** Resolve practical objections.

**CSS:** `background: #ffffff; border-radius: 12px 12px 0px 0px; padding: 40px 24px`

**Text style:** `question` — Cern 600 · 20px/1.5 · tracking -0.015em

**Observed:** Default open light-theme item has a question row with minus icon, answer beneath and a 3px blue-lavender gradient underline. Closed rows are unfilled with plus icons and fine separators. Dark variant uses navy backing, blue rules and white labels.

**Transfer:** Place a compact introduction to the left and a wider question column to the right.

## Imagery and graphics

### Engraved hero subject

**Use:** Default illustrated opening and large feature panels.

**Observed:** Oversized currency-style portraits are reinterpreted with contemporary objects and gestures. Dense dark violet engraved strokes sit over cyan and mint light; the subject fills the right half and is cut off at the lower edge, while text can overlap its left contour. It is graphic linework, not a rectangular photograph.

**Transfer:** Commission an engraved rendering of a product-relevant object or human gesture. Minimum equivalent: a large original silhouette filled with directional curved hatch lines, not a stock photo under a blue overlay.

**Build:** Create an SVG object mask occupying roughly 55–65% of the stage width. Fill it with dark violet curved hatch paths spaced 3–6px apart and short crosshatch accents; preserve recognizable negative-space highlights. Put blue/cyan light beneath the mask and let the lower silhouette overflow the stage. Add a narrow horizontal iridescent streak near its lower third.

### Flowing filaments

**Use:** Signature connective material across opening, proof, developer and closing stages.

**Observed:** Dozens of fine parallel lines bend like a banknote guilloche or flowing fabric. On pale grounds they are faint lavender and mint; on navy they glow cyan. They remain behind text and can form a tall twisting ribbon behind floating proof objects.

**Transfer:** Carry this device onto every new marketing page, varying orientation and intensity with the section rather than repeating an identical background image.

**Build:** Use an SVG viewBox 0 0 1440 900 with 50–90 parallel cubic Bézier paths, no fill, stroke-width 0.6–1px. Offset curves by 6–10px; bend them through a broad S-shaped waist. Apply a lavender-to-cyan-to-mint stroke gradient at 0.12–0.3 opacity on pale fields, or cyan/white at 0.08–0.2 on blue. For a proof ribbon, rotate a narrow 350–500px group and twist its center. Keep a clear low-contrast zone behind paragraphs.

### Luminous product diagrams

**Use:** Category tiles and feature chapters.

**Observed:** Simplified white or translucent app fragments float on soft pastel cyan/lavender grounds. Light-theme product chapters intensify into lavender-to-pink fields with glowing rounded chips, orbit diagrams and faint white contour lines. Cards show only one meaningful task, with the surrounding UI de-emphasized.

**Transfer:** Represent the new product's most legible workflow with two or three crisp interface fragments, rounded chips and connector lines. Minimum equivalent is an original SVG flow with one central card, two connected chips and a soft halo.

**Build:** Back a rounded media rectangle with lavender and cyan gradients. Place a white panel with 12–20px corners near the lower center; add a thin translucent lavender rim and a soft shadow. Connect 2–5 pale pill nodes with 1px paths; use small cyan/mint glow pools behind key junctions. Keep tiny UI text illustrative rather than making the page depend on it.

### Floating proof ribbon

**Use:** Quantified network or ecosystem proof.

**Observed:** A tall twisting filament stream carries alternating white notification cards and narrow colorful photographic cutouts. Rounded notification cards have very faint dark edges and soft downward shadows; they are distributed irregularly along the ribbon rather than aligned in a rigid grid. Large serif statistics occupy the other half.

**Transfer:** Use original activity events, outcomes or artifact thumbnails to make a system feel active without creating a fake dashboard.

**Build:** Place 5–7 small objects along an S-shaped filament column. Alternate approximately 320px-wide white 16px-radius notification cards with smaller image strips. Use a 0.5px rgba(17,17,17,0.08) edge and diffuse gray shadows; vary horizontal position while keeping the adjacent text column clear.

### Customer story media

**Use:** Story gallery and video proof.

**Observed:** Warm, naturally lit interview portraits fill wide rounded rectangles. Small white customer marks overlay the media; story headlines and circled-arrow links sit below. The larger video variant places a white headline and light play pill over the lower-left image, with navy filaments and teal light outside the frame.

**Transfer:** Use authentic people in lived-in professional settings, keeping photography warmer and more natural than the abstract product art.

### Iridescent rims and glows

**Use:** Action rings, conversion form and highlighted stages.

**Observed:** Very narrow spectrum edges move from mint and cyan through violet, pink and pale yellow. Broad glow is localized around the form or code stage, not applied to every card.

**Transfer:** Use iridescence to mark interactive or conversion-important objects, never as a general page border.

**Build:** Layer a rounded outer element beneath its inner face. For pills use 3px masked conic-gradient padding; for the form use a 5px surround with soft pastel hue segments and a 35px white inner radius. Add 0px 0px 36px 5px rgba(243,49,247,0.43) only to the form surround. Keep broad atmospheric gradients separate from this fine ring.

### Dark product signal scene

**Only for:** dark product landing pages

**Use:** Opening object and interface capability illustrations.

**Observed:** A circular radar-like diagram uses concentric navy-blue rings, radial divisions and dim engraved currency fragments. A blue interface card floats across its center with a violet highlight along the upper edge. Later UI scenes fade into navy at the edges, so they feel embedded rather than pasted on.

**Transfer:** Replace the radar content with a relevant system model and one highlighted result card; maintain the dark falloff and restrained violet light.

**Build:** Draw three concentric circles and 8–12 radial lines in low-opacity blue inside a 557px square. Place a centered horizontal result panel with a blue gradient, rounded corners and a violet radial glow at the top. Mask outer detail with a navy radial vignette.

### Outlined human illustration

**Only for:** institutional pages

**Use:** Mission and editorial chapters.

**Observed:** Flat people and small symbolic objects use thin black outlines, white negative space and cyan/lavender fills. Rough mint brush swashes sit behind circular frames and geometric building blocks. The illustration occupies roughly the right half while narrow text remains on the left.

**Transfer:** Use original inclusive human scenes with small relevant symbols; retain flat shapes, sparse black outlines and hand-painted backing rather than glossy product rendering.

**Build:** Combine simple outlined SVG figures, white geometric blocks and a few mint or lavender accent shapes. Place a rough-edged mint brush mask behind the illustration, with generous unpainted white space.

### Icons

**Observed:** Small directional arrows, chevrons, plus/minus controls and thin functional pictograms complement the rounded type. Navigation chevrons are 12px; tile arrows sit in 42px circles; social icons are 24–32px. Product cards use small line icons in softly lit rounded-square badges.

**Transfer:** Choose simple line pictograms for product functions and small circled right arrows for story destinations. Do not replace arrows with oversized solid chevrons or decorative emoji.

## Section recipes

How recurring sections are built.

### First screen: Engraved electric opening

**Observed:** A 929px full-bleed Electric atmosphere sits behind fine Flowing filaments, an oversized Engraved hero subject anchored to the right/lower edge, and left-aligned text in the foreground. Floating navigation sits above all of it. The 76px display headline begins around the upper-middle of the screen and spans about two thirds of the width in two lines; lime, mint and white move across its letters. A 24px white lead is narrower than the headline, with 24px separation. After 50px come Pale mint button and Dark spectrum button, separated by 16px. Within the first 900px the full headline, support, both actions, main object, a customer-mark strip and a small announcement ticket are visible. The lower subject is cut by the viewport; the next pale section begins below it.

**Transfer:** Give a different product an equally bold original engraved object or hatched silhouette, preserving the overlap and atmosphere even without portrait art. Product-specific openings use a narrower two-column composition with a 64px headline, 16px uppercase eyebrow and a roughly 557px product scene; dark variants use Navy canvas and signal art, light variants use Pale atmosphere. Pricing uses an 80px black headline with plan cards entering the first screen; institutional pages use a compact 36px mission headline on flat lavender.

**Avoid:** Do not replace this with a centered headline above a generic laptop, a full-screen photographic background or a tiny isolated illustration. Do not let the engraved detail reduce support-copy contrast.

**Text style:** `display` — Plaid Sans 500 · 76px/1.12 · tracking -0.0447em

### Pale introduction and product mosaic

**Observed:** A left-aligned heading on Pale atmosphere has a 32px gap to a dark action, then a broad gap to Product tile. Two wide tiles sit above three narrower tiles with 24px gutters; each combines a two-tone sentence and a lower product scene.

**Transfer:** Organize offerings by user outcome; vary the tile spans to establish editorial hierarchy.

**Text style:** `heading` — Plaid Sans 500 · 58px/1.14 · tracking -0.0345em

### Illustrated blue feature

**Observed:** Blue feature stage spans about 1245px with 24px corners. A large white headline and light spectrum action sit left while engraved subject and network lines fill the right. Inner content has about 73px padding and 48px between title and action.

**Transfer:** Use one dramatic feature or strategic promise rather than a dense benefit list.

**Text style:** `heading-lg` — Plaid Sans 500 · 70px/1.08 · tracking -0.0286em

### Flowing proof chapter

**Observed:** A tall Floating proof ribbon fills the left half; the right half contains a 70px heading, 24px support and a two-column group of serif gradient statistics. Stat captions are compact and visually attached to the numeral.

**Transfer:** Combine proof of activity with two to four defensible outcome metrics, using the ribbon as a spatial counterweight.

**Text style:** `proof-heading` — Plaid Sans 500 · 70px/1.2 · tracking -0.04em

### Developer invitation

**Observed:** Developer night is a wide rounded stage with centered heading, one short support line, paired actions and a large cyan-lit code demonstration emerging from below. The code panel is approximately 890px wide with a labeled header, line-number gutter and restrained syntax color.

**Transfer:** Offer a concrete next technical step, using code only when the product genuinely serves builders.

**Text style:** `developer-heading` — Plaid Sans 500 · 70px/1.13 · tracking -0.04em

### Story rail

**Observed:** A 50px left headline shares a row with two circular navigation controls. Wide interview thumbnails, concise story titles and small circled-arrow links form an overflowing horizontal gallery; filaments reappear along its lower edge.

**Transfer:** Make human proof visually warmer than capability diagrams and let neighboring cards hint at more stories.

**Text style:** `story-heading` — Plaid Sans 500 · 50px/0.94 · tracking -0.04em

### Luminous closing invitation

**Observed:** Electric atmosphere and Flowing filaments return behind a short stacked closing headline on the left and Conversion form on the right. Form surround makes the white card the brightest object. The default headline is 70px gradient text; dark product variants use 60px white text and a fine iridescent line at the top of the section. A Reassurance ribbon can serve the secondary audience beneath the main composition. Directory footer follows, overlapping the saturated stage by 40px in the rounded-top version.

**Transfer:** Give the last conversion request a distinct visual stage, not merely another button. Keep the headline short enough to balance the form and adapt the fields to the product.

**Text style:** `closing-heading` — Plaid Sans 500 · 70px/1.1 · tracking -0.0129em

### Product capability chapter

**Only for:** product landing pages

**Observed:** Product-content alternates roughly square media and text columns. A 36px heading leads 20px paragraphs or three icon-led benefit rows. Three-column variants use aligned media above titles and copy, with 32px gutters and 16px title-to-copy gaps. Broad 200px chapter breaks separate these compositions.

**Transfer:** Alternate overview diagrams, specific workflows and concise explanations instead of repeating identical grids.

**Text style:** `feature-heading` — Plaid Sans 600 · 36px/42px · tracking -0.0556em

### Patterned claim band

**Only for:** product landing pages

**Observed:** A 1131px-wide, 24px-radius blue patterned band uses 64px vertical and 56px horizontal padding. Large white claim sits left; a light spectrum action is vertically centered to its right. Fine contour lines supply detail without competing with the headline.

**Transfer:** Use one verified result or implementation promise as a mid-page punctuation mark.

**Text style:** `product-heading` — Plaid Sans 600 · 60px/1.1 · tracking -0.0333em

### Related capability grid

**Only for:** product landing pages

**Observed:** A centered 60px lead introduces three columns of dark blue cards with 24px gutters. Cards use 17px inner corners, 32px by 24px padding, a lit icon badge, 24px title and 18px explanation. The related-product version has a text action at the bottom; use-case variants form two rows.

**Transfer:** Make cards genuinely parallel in purpose and maintain similar description lengths.

**Text style:** `product-heading` — Plaid Sans 600 · 60px/1.1 · tracking -0.0333em

### Plan selection and comparison

**Only for:** pricing pages

**Observed:** A large left headline shares the pale opening with a faint mint engraved object on the right. Three Plan cards enter the first screen. A pastel rounded trial band precedes a four-column comparison: descriptive feature column plus three plan columns. Checks use plan-associated colors. Repeated plan actions finish the matrix before the FAQ.

**Transfer:** Make the plan audiences readable before presenting a long feature comparison; keep the comparison visually light and horizontally aligned.

**Text style:** `pricing-display` — Plaid Sans 600 · 80px/1 · tracking -0.025em

### Split FAQ

**Only for:** FAQ sections

**Observed:** A 60px introduction and short contact line sit in a narrow left column; the right column contains 615px-wide FAQ items. Light variant shows one open white answer card with a gradient underline; dark variant uses uninterrupted navy and blue separators.

**Transfer:** Write questions in the user's language and answer the practical buying objections before the final action.

**Text style:** `product-heading` — Plaid Sans 600 · 60px/1.1 · tracking -0.0333em

### Institutional editorial story

**Only for:** institutional pages

**Observed:** Flat lavender opening pairs a compact bold headline and narrow paragraphs with outlined human illustration. A mission video leads into three plain lightweight 60px facts, each above bold labels and short explanation. Alternating 800px editorial illustration panels use small mono overlines and 24px bold headings. A 140px-padded recruitment row closes the story before a flush navy footer.

**Transfer:** For organizational content, preserve the calmer editorial scale and human illustration instead of importing the electric product hero.

**Text style:** `institutional-display` — Cern 800 · 36px/1.33333

## Page flow

**Storyline:** Ambitious promise → tangible product model → capabilities and evidence → practical next step → confident conversion → substantial directory.

### Introduce a broad product platform and invite exploration

1. **promise** — Immersive engraved opening with paired actions, customer marks and small news ticket.
2. **offering overview** — Pale introduction and two-plus-three product mosaic.
3. **strategic differentiator** — Large blue illustrated feature panel.
4. **quantified proof** — Flowing activity ribbon beside gradient serif metrics.
5. **technical next step** — Centered dark developer stage with code.
6. **social proof** — Human interview story rail.
7. **closing call** — Electric form stage, reassurance ribbon and rounded navy directory.

**Transfer:** Use the visual register changes to move between ambition, explanation, proof and action without requiring the same number of chapters.

### Help buyers choose a level of commitment

1. **plan framing** — Large black promise with faint engraved backdrop and three audience-led plan cards.
2. **low-friction trial** — Pastel trial invitation band.
3. **comparison** — Long four-column feature matrix with colored checks and repeated plan actions.
4. **objection handling** — Split FAQ, followed by breathing room.
5. **ending** — Rounded navy directory without an additional lead form.

**Transfer:** Lead with audience fit and commitment differences; let the matrix support rather than replace that decision.

### Explain a specialized risk-oriented product

1. **promise** — Dark two-column opening, radar-like product object and customer marks.
2. **product demonstration** — Centered headline above an embedded dark interface scene and three short benefits.
3. **quantified proof** — Blue testimonial panel with large thin-serif statistics.
4. **capability chapters** — Split workflow illustration, migration claim band and three illustrated capability columns.
5. **ecosystem fit** — Three related-product cards.
6. **objection handling** — Dark split FAQ.
7. **closing call** — White glowing form on navy, then flush directory.

**Transfer:** Use the navy variant when the subject benefits from a concentrated, high-confidence technical mood.

### Explain a flexible operational product and its applications

1. **promise** — Pale two-column opening with workflow diagram and customer marks.
2. **capability overview** — Three violet-backed illustrations.
3. **capability chapters** — Alternating split diagrams and operational benefits, interrupted by a patterned claim band.
4. **social proof** — Large unboxed customer quotation with attribution and story link.
5. **audience expansion** — Platform-specific workflow chapter.
6. **applications** — Navy use-case grid.
7. **demonstration** — Large warm interview video on a teal-lit navy stage.
8. **closing call** — Glowing white form, contour background and flush directory.

**Transfer:** Let a light explanation theme transition into a darker application-and-conversion ending.

### Explain organizational purpose and attract collaborators

1. **purpose** — Lavender mission opening with human illustration.
2. **human context** — Mission video.
3. **quantified proof** — Three plain sans fact blocks.
4. **editorial chapters** — Two spacious text-and-illustration panels.
5. **closing call** — Compact recruitment statement with rectangular action.
6. **ending** — Flush navy directory with common social and utility row.

**Transfer:** Use a smaller editorial type scale and flat illustration for institutional storytelling while retaining the shared navigation and footer.

## Writing

Confident, enabling and conversational. The product sounds technically capable without sounding bureaucratic; claims are grounded in a clear mechanism, a concrete task or a specific result.

**Do not copy:** Do not reuse Plaid names, logos, currency portraits, customer marks, quotes, financial-network claims, customer counts or performance numbers. Source examples illustrate phrasing only; replace them with original product-specific facts and authorized assets.

- **Addressing the reader:** Address the builder or buyer as you and your team. Use we for infrastructure responsibilities and a product name when explaining a specific capability.
- **Rhythm:** Headlines usually make one direct promise, sometimes split into two short sentences. Support lines explain the mechanism in one or two sentences. Actions are brief verbs or invitations; contractions and an occasional playful question make the technical story human.

| Role | Pattern | Typical length | Examples of the pattern |
| --- | --- | --- | --- |
| Opening headline | Turn an input into a meaningful outcome, or name an operational benefit without jargon-heavy qualification. | 5–9 words | “Turn data into revolutionary financial products”<br>“AML compliance, without the noise”<br>“Scale bank payments, on more rails” |
| Section headline | Pair capability with outcome; short sentence fragments can create a two-beat rhythm. | 4–12 words | “Instant rails. Smarter operations.”<br>“Screen against every major watchlist. Automatically.” |
| Support line | Divide responsibility clearly and connect the product mechanism to a practical benefit. | 1–2 sentences | “You build the experience. We'll handle the data.”<br>“Watchlists stay up to date automatically. Screening stays accurate without manual work.” |
| Technical invitation | Make a technical entry point sound accessible; use a question followed by a confident answer. | 8–14 words | “Want access to 12K banks? We've got the API keys.” |
| Primary action | Use a concrete next step or warm team invitation, not a generic slogan. | 2–5 words | “Start building”<br>“Talk with our team”<br>“Get the API keys” |
| Objection handling | Name the friction and answer with a clear contrast or timeframe. | 1–2 short sentences | “Switching providers or want a fast start? Migrate in weeks, not months.”<br>“Get answers to your pricing questions” |

**Words and phrasing to use:** build; connect; smarter; real-time; without the friction; your team; automatically; fast, safe, and smart; get started; we'll handle

**Avoid:** synergize; best-in-class; disrupt everything; revolutionary repeated in every section; vague AI magic; fear-heavy compliance language; unsupported superlatives

**Rules:**

- State an outcome before listing the underlying mechanisms.
- Give parallel cards parallel syntax and similar description lengths.
- Use specific technical terms when they clarify the actual task; explain their benefit in ordinary language.
- Keep playful accents concentrated in an opening announcement or a memorable headline, not in forms and technical explanations.
- Use numerical proof only with a defensible basis and a clear explanation of what it measures.

## Do's and Don'ts

### Do

- Keep default opening headlines at 76px/1.12, weight 500, with tight -3.4px tracking.
- Pair 56px dark and pale pill actions with a 16px gap.
- Keep long-form default sections on near-white cool gradients, not pure saturated fills.
- Use 24px corners for large illustrated feature stages and 35px for the white form interior.
- Let product diagrams occupy roughly half of a split feature chapter, with clear whitespace around the text.
- Use delicate 70px serif numerals as a distinct proof register.
- Keep the final form white across light and dark themes, with a 5px luminous surround.
- Finish with mint category headings and 16px white directory text on deep navy.

### Don't

- Do not make every heading weight 700 or 800; that belongs to compact institutional text, not the default marketing display.
- Do not turn the thin spectrum action rim into a thick rainbow button face.
- Do not apply magenta outer glow to every card; the 36px glow identifies the final form.
- Do not use the institutional 2px-corner rectangular action as the standard marketing button.
- Do not substitute opaque white full-width navigation for the 71px glass capsule.
- Do not set ordinary paragraphs in the high-contrast numeral serif.
- Do not make product UI diagrams as text-dense as a functioning application screen.
- Do not collapse the substantial directory ending into a single copyright line.

## Motion and responsive

### Motion

**Observed:**

- Declared action text transitions use color 0.1s ease-in-out; navigation tabs use background-color 0.15s ease-out.
- Declared input transitions use box-shadow 0.5s and border-color 0.25s ease-in-out.
- Gradient actions declare background 200ms ease-in-out with box-shadow and transform; active scale is 0.98.
- Spectrum layers declare rotate and background transitions of 0.5s cubic-bezier(0.23,0.41,0.07,0.96).

**Transfer:**

- Keep the spectrum ring as a separate decorative layer so its behavior does not move the label.
- Use the declared subtle press scale for gradient actions; keep fields geometrically stable while border and shadow change.

**Unknown:**

- Continuous filament, canvas and logo-strip animation timing is not established.
- No complete entrance-animation choreography is prescribed.

### Responsive

**Observed:**

- Desktop composition uses a 1730px outer-shell maximum and 40px side padding.
- Declared CSS includes common thresholds at 640px, 768px, 1024px and 1280px; exact component behavior is not established.

**Transfer:**

- As a design adaptation, stack text before product diagrams and keep the engraved subject visually substantial rather than reducing it to a small thumbnail.
- On narrow layouts, stack paired form fields and preserve the thin luminous surround; reduce padding before shrinking field height.
- Keep proof numerals and their captions together when the two-column proof group reflows.

**Unknown:**

- Mobile navigation behavior, mobile type sizes and exact artwork re-framing are unspecified.

## How to use this guide

1. Start from the Essentials and the first-screen recipe; where the guide offers variants, use the default named for a new marketing page.
2. Plan the page before building: map your content onto the section recipes and page flow, then check the plan against the Do's and Don'ts.
3. Build with the tokens and component specs; recreate signature graphics with their build recipes instead of generic decoration, and use the named font substitutes if a font is unavailable.
4. Render the page at desktop and mobile widths, compare it with the Essentials and the Don'ts, and fix the differences before you finish.
