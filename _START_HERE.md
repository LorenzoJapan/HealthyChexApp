# HealthyChex — project knowledge orientation

Read this first. It tells you what each file is, which is canonical, and the rules for changing the app.

## Files in this project

| File | What it is |
|---|---|
| `HealthyChex_v4_1_Jul2026.html` | **The app. Single canonical copy.** Self-contained HTML + CSS + JS, including an inline PWA manifest and icon (data-URIs — no external files, single-file architecture preserved). All clinical thresholds live in the `RULES` object at the top of the script. |
| `HealthyChex_App_Summary_071226.md` | **Read before touching the app.** Full state: changelog, conventions, deliberate exceptions, what's validated. Cheap to read; orients you without parsing 216K of HTML. |
| `validation/appcore.js` | Mirror of the app's recommendation engine, used by the harness. |
| `validation/oracle.js` | Independent guideline oracle — re-derives recommendations from first principles. |
| `validation/run.js` | Synthetic-patient generator + comparison harness. Run with `node validation/run.js` (all three files must sit in the same folder). |
| `validation/boundaries.js` | Boundary unit tests asserting the exact guideline cut points against BOTH engines. Run with `node validation/boundaries.js`. |
| `HealthyChex_EvidenceGrade_Review_FINAL_071326.xlsx` | Physician-signed evidence grades currently wired into the app. Provenance for the grade badges. |
| `HealthyChex_App_v4_0_Jun2026.xlsx` | Clinical specification workbook (logic + evidence references). |
| `README.md` | Public repo readme. |

## Changing a guideline threshold

**Edit `RULES` at the top of the app's `<script>`, not `gen()`.** Every clinical threshold the engine reads lives in one versioned object (`RULES._version` stamps it). `gen()` reads from it; it holds no bare numbers.

Two constraints on `RULES`:
- **It is data, read by fixed logic — never an expression the app evaluates.** `{start: 45}` is data. `{eligible: "age >= 45"}` would be code, and would put any future iOS wrapper on the wrong side of Apple's interpreted-code rule (§3.3.1(B) / guideline 2.5.2). Keep it data.
- **`validation/oracle.js` deliberately does NOT read `RULES`.** It hardcodes thresholds independently from the guideline text. If both read the same object, a typo would make them agree on the wrong answer and the harness would bless it. The oracle's independence is the whole point.

`validation/appcore.js` carries a mirrored copy of `RULES`; `validation/run.js` compares the two on every run and fails loudly on drift.

## The one rule that matters

**Clinical logic is sacrosanct.** The recommendation engine is validated at **6,200/6,200 decisions across 62 recommendation types** (100 synthetic patients x 62 decisions), plus **284 boundary assertions**. Both are the acceptance gate.

- **UI / styling changes** → must be CSS-only or JS-additive. Preserve every existing selector, class name, and element ID. The harness must still pass unchanged.
- **Engine changes** → validate first, ship second:
  1. Verify the clinical threshold against the actual guideline source (don't trust memory — guidelines move).
  2. Update `validation/appcore.js` (mirror) **and** `validation/oracle.js` (independent derivation) **and** `validation/run.js` (so synthetic patients exercise the new boundaries) in lockstep.
  3. Re-run `node validation/run.js` — must be 6,200/6,200 — and `node validation/boundaries.js` — must be 284/284.
  4. Add boundary unit tests to `validation/boundaries.js` for any new threshold.

> **Known fragility:** `validation/appcore.js` is a *hand-maintained* mirror of the engine in the HTML. It can silently drift. After any engine edit, diff the logic in both and confirm they match.

## Conventions

- **Lockstep files:** deliverables ship as a renamed HTML + an updated dated summary `.md`. Unchanged artifacts are called out explicitly rather than silently re-versioned (e.g. the spec workbook is deliberately held at v4.0 when no clinical content changed).
- **Flag deliberate exceptions** rather than leaving them implicit.
- **Validation before wiring:** for changes that assert new clinical thresholds, produce a review table (question → threshold → resulting recommendation → source) for physician sign-off *before* touching the engine.

## Current state (v4.3, October 2026)

- "Clinical Calm" design system: CSS design tokens, iOS HIG 44pt touch targets, WCAG AA contrast, white grouped-inset cards, 4px status rail on recommendation cards.
- Results view-mode toggle: Summary ↔ Update checklist (non-destructive).
- Evidence-grade badges in each body's native system (USPSTF letters, ACIP routine/shared-decision, AHA/ACC class), with tap-to-open plain-language popovers. Grade values render in a serif face so "Grade I" doesn't read as "Grade 1". Grade I items are labeled **Optional**.
- LDCT lung screening applies real USPSTF 2021 criteria (age 50–80, ≥20 pack-years, smoking now or quit ≤15 yrs), driven by years-smoked / packs-per-day / years-since-quit inputs.
- Documented intentional divergences from USPSTF: cholesterol follows AHA/ACC (from age 20); hearing screening offered from 50 despite USPSTF Grade I.

### v4.1.1 — colorectal update (ACS 2026, Wolf et al., CA Cancer J Clin 2026;e70083)

- Copy fidelity pass on the 45–75 card: blood-based cfDNA now offered to patients who decline **or have not completed** a preferred test; prior-discussion requirement stated; non-preferred rationale (lower sensitivity for advanced precancerous lesions and stage I cancer) stated; the 3-year interval attributed to CMS coverage rather than a manufacturer recommendation; life-expectancy >10 yr qualifier added for continuing through 75.
- **New 58th recommendation type `crcstop`** (`RULES.crcstop.start = 86`): ACS 2026 directs clinicians to discourage screening beyond 85, and the app previously rendered no colorectal card at all at that age. Lynch/FAP carriers are excluded (lifelong surveillance). No interval picker — there is no interval to set.
- `RULES._version` stamped `2026-09-13`. Spec workbook re-versioned to `HealthyChex_App_v4_1_1_Sep2026.xlsx` (clinical content changed, so it was NOT held at v4.0 this time).

### v4.1.1 — interface pass (same release)

All UI-layer; the engine, `RULES`, and the 58 recommendation types are untouched.

- **Stepped intake.** The single scrolling form is grouped at runtime into one-screen steps (About you · Medical history · Family cancer · Genetic syndrome · Social · Sexual · Childhood vaccines · Review). The two detail steps appear only when their parent question is answered Yes. Sections are *moved* into `.fstep` wrappers, never rewritten, so every original id, class and inline handler still binds.
- **Review-and-edit step** before generation: one compact row per section, whole row is a 44pt tap target that jumps back to that step.
- **No pre-set answers.** `blankProfile()` no longer seeds `'no'`/`'none'`/`'yes'`, and `rf()` no longer paints an answer that was never given. Profiles carry `_ansv`; anything saved before it has its 13 ambiguous answers blanked once on load. Next is gated per step, with an `aria-live` hint naming what is missing.
- **Layout fixes.** `html` no longer double-applies body padding/`min-height` (this was causing a permanent 20px page overflow behind the `.screen` scroller); `body` and `.iphone` use `align-self:stretch` so the frame width no longer tracks per-step content; `.screen` is sized in `dvh`; nav bar is `position:sticky;bottom:0`.
- **Design review items 1, 2, 5, 6, 10 applied.** Type scale raised to iOS HIG and expressed in `rem` (Dynamic Type verified at 125% and 200%); real `<label for>` + `autocomplete` + `inputmode` on step 1; dashed marker on unanswered controls; profile name in the brand strip; persistent disclaimer on the results view.

> **Two selector traps hit during this work, both invisible to the harness.** `#vf{display:flex}` (id) silently beat `.view{display:none}` (class) and left the form painted over the results. And a new element reusing the existing `.rdisc` class was overridden by the app's own later rule. When adding UI, use a new class name and never raise specificity above the view-switching rules.

### v4.3.2 — About this tool & sources (October 2026)

UI only: engine, `RULES` and the 62 recommendation types untouched (harness 6,200/6,200 and 284/284 unchanged). Spec workbook held at v4.3. Modeled on the Acute PE Predictor's About screen.

- **Link:** "About this tool & sources" plus "Guideline-based · v4.3.2 · Developed by MDGadgetz LLC." at the bottom of the two first screens: step 1 (below the Back/Next bar; hidden on later steps via `#vf.fdeep`) and Welcome back (below Manage data). Uses spare height only: no screen gained scrolling at 926, 845 or 760 pt, or at 125% text.
- **About page:** full-screen overlay inside `.iphone` (so it fills the phone frame in the desktop preview), with a Back button; it is a history entry, so browser Back, Safari's edge-swipe and the Home Screen edge-swipe close it. Sections: medical disclaimer (reuses the first-launch modal's wording), what it does, whose guidelines, deliberate divergences, family history and genes, privacy, how it is checked, references, version.
- **No drift by design:** the reference list is built at open time from the app's own `RF` citation table (44 unique references), and the rules date from `RULES._version`. **Lockstep item:** update `HCX_ABOUT.version`, `.types` and `.validated` in `index.html` with every release.

### v4.3.1 — icons (October 2026)

UI only: the engine, `RULES` and the 62 recommendation types are untouched (harness 6,200/6,200 and 284/284 unchanged; browser cross-check 0 differences). Spec workbook held at v4.3 — no clinical content changed.

- **Recommendation cards:** every card title gets a small teal icon by code (`HCX_RCI` map: heartbeat for blood pressure, scale for BMI, vaccine for all vaccines, DNA for genetics referrals, and so on), added by wrapping `mkc()`. Faded on Done cards.
- **Intake:** an icon at the start of each main question label, and on each Family cancer history option. Added after page load by matching label text, so no markup was rewritten.
- 25 Tabler icons (v3.49, MIT) inlined as data-URI masks in the existing `.ti-*` format, so they take the text colour and work in dark mode. All are `aria-hidden` (decorative) and hidden in print.
- **Inherited cancer gene label:** with the icon added, this one label now flows as text (sub-text on its own line), and its last word and asterisk sit in a no-wrap span so the asterisk never strands on its own line. Verified at 100%, 125% and 150% text size with no collision with the Yes/No buttons.
- Fit unchanged: every step still fits at Pro Max; the Family history step still scrolls 48 pt in a Safari tab.

### v4.3 — family history of pancreatic cancer (October 2026)

Engine change, validated in lockstep. Full record: `docs/HealthyChex_Pancreatic_FH_Audit_100726.md`.

- **Two new Family cancer history options, mutually exclusive:** `panc1` "Pancreatic — parent, sibling or child (not neuroendocrine, if known)" and `panc2` "Pancreatic — two or more on one side, at least one a parent, sibling or child" (footnote: if only two, the other must also be first- or second-degree).
- **`pancgen`** (61st type): `panc1` or `panc2` → genetic counseling and germline testing (NCCN BOPP v1.2027, CRIT-5).
- **`pancsurv`** (62nd type): `panc2` only → specialist surveillance discussion (MRI/EUS), start ~50 or 10 yrs before youngest affected relative (NCCN PANC-A; CAPS 2020). **One affected first-degree relative alone does not trigger surveillance**: NCCN is explicit, and a boundary test pins it.
- Not age- or sex-gated (relatives' ages are not collected). No `RULES` change.
- Melanoma tier-2 row relabelled "Melanoma plus pancreatic"; `melgen` logic unchanged.
- `run.js` draws pancreatic answers from a third seeded stream, so the v4.2 cohort is unchanged. Spec workbook re-versioned to `HealthyChex_App_v4_3_Oct2026.xlsx`.
- NCCN text came from a licensed platform with a no-redistribution notice: paraphrase it, don't paste it into the app or docs.

### v4.2 — family history of melanoma + USPSTF reference audit (October 2026)

Engine change, validated in lockstep. Full record: `docs/HealthyChex_Melanoma_FH_Audit_100726.md`.

- **Two new Family cancer history options:** `mel1` "Melanoma — parent, sibling or child, at any age (not basal or squamous cell)" and `mel2` "Melanoma or pancreatic — three or more relatives on one side, at least one melanoma". Not mutually exclusive.
- **`skinfh`** (59th type): age ≥ `RULES.skin.start` (20) with either option → replaces the average-risk `skin` card. USPSTF 2023 Grade I explicitly excludes people with a family history of skin cancer. Badge: Expert consensus.
- **`melgen`** (60th type): `mel2` → genetic counseling referral (CDKN2A), any age, either sex. Criteria: Leachman et al., JAAD 2009, U.S. thresholds ("rule of three"), not the two-relative threshold used in low-incidence countries.
- **Average-risk `skin` card** reworded from "Yearly clinical skin check" to Optional / discuss with clinician (USPSTF 2023 Grade I); schedule label likewise. Deliberately unchanged: `REC.skin` stays 12 months for done-item reminders, matching the other Grade I item (hearing).
- **References:** `aad-skin` (which cited USPSTF 2016) renamed `uspstf-skin` → USPSTF 2023. Also corrected: depression 2016 → 2023, osteoporosis 2018 → 2025, obesity label 2012 → 2018. The app's recommendations for those three are unchanged; the updated statements still support them. New: `aad-selfexam`, `leachman-mel`.
- `RULES._version` → `2026-10-07` (no threshold value changed). `run.js` draws the melanoma answers from a separate seeded stream, so the original 100 patients are unchanged and only the melanoma rows are new. Additionally verified the shipped `index.html` against `appcore.js` in a browser on all 100 patients: 2,432 recommendations, 0 differences.
- Spec workbook re-versioned to `HealthyChex_App_v4_2_Oct2026.xlsx` (since superseded by v4.3).

> **USPSTF citations not changed — verify:** cervical (2018, retained for 21–29; a newer statement may exist), prostate (2018; update in progress at last check), and motor-vehicle counseling (2007, labeled USPSTF but keyed `cdc-mvs`; the topic is inactive). Osteoporosis 2025 also gives Grade B to postmenopausal women <65 at increased risk, which the app does not yet offer.

### v4.1.2 — screen fit and streamlining (October 2026)

UI layer only: the engine, `RULES` (still `_version 2026-09-13`) and the 58 recommendation types are untouched; no changed line falls inside `gen()` or `RULES`. Every addition uses new `hcx-` class names, and the existing functions it touches (`goStep`, `sv2`, `showWS`, `setOutputMode`, `updFProg`) are wrapped or reassigned at the end of the script rather than edited. Spec workbook held at v4.1.1 (no clinical content changed).

- **Screen fit (item 4).** On touch devices the demo bezel, brand strip, drawn island and home pill are dropped; the app runs edge to edge with `env(safe-area-inset-*)`. On desktop the frame is locked to iPhone 13 Pro Max (428 × 926 pt) and scaled to fit the window (`--hcx-fit`).
- **Spare height.** `hcxRoom()` measures each intake step on entry, with every conditional reveal forced open: 120px+ spare → `.hcx-roomy` enlarges prompts and targets (kept only if it still fits); the rest becomes a top offset (`--hcx-pad`), not flex centring, so a "Yes" reveal grows downward. Review step excluded.
- **Copy.** "Known genetic syndrome" → "Inherited cancer gene" (row, `*` popover listing BRCA1/2, Lynch, FAP, step title, review, hint). `S.syndrome` unchanged.
- **Remove this person** from intake, results and Welcome (Manage data), confirmed through an in-app action sheet (`hcxConfirm`) — `window.confirm()` is silently blocked in sandboxed previews. Unsaved drafts are just cleared.
- **Welcome back (suggestion 2).** One primary "Open my checklist" (regenerates, keeps statuses, skips the view prompt); "Edit my answers" opens Review; "Due now" list opens and highlights the card. Backup/Restore/Remove/Clear moved into a collapsed "Manage data".
- **First screen (3).** Import is a header link to the same panel; privacy + Add-to-Home-Screen notes moved off Review into a one-time sheet after the first checklist (`healthychex_onboard_v1`).
- **Consistency (4, item 7).** One prompt style for every question; progress always "n of 6" (detail steps count inside Medical history).
- **Native feel (5, items 3, 9).** Dark mode via `prefers-color-scheme` (screen only; print stays light); each step and screen is a history entry, so Safari's edge-swipe/Back go back one step, and a left-edge swipe does it in the Home Screen app; directional slide transitions (off under Reduce Motion).

> **Known issues, not changed:** the first-launch disclaimer modal ships with `style="display: none;"` and no code ever shows it (present in v4.1.1). The FHIR "reviewed imported data?" check in `gen()` still uses `confirm()`. "Clear all data" also still uses `confirm()`.

Open design-review items: 8 (results card density — triage into Due now / Coming up / Up to date). See `docs/HealthyChex_Design_Review_091326.html`.
