# HealthyChex — App Review Notes & 1.4.1 Positioning

Paste the **Review Notes** block into App Store Connect → your version → *Notes for Review*. The rest is context for you, not for Apple.

---

## Review Notes (paste this)

HealthyChex is an **informational preventive-health checklist** for average-risk adults. It surfaces published screening and immunization guidelines — U.S. Preventive Services Task Force (USPSTF), CDC/ACIP, American Cancer Society (ACS), and NCCN — organized around the user's age, sex, and self-reported history.

**It does not diagnose, treat, or make medical decisions.** It takes no physiological measurements and uses no device sensors. It simply maps well-established, publicly available guideline criteria (e.g., "USPSTF recommends colorectal screening for average-risk adults 45–75") to the profile the user enters, and reminds them to confirm with their clinician.

Methodology / accuracy (per Guideline 1.4.1): each recommendation cites its source guideline and evidence grade in its native system (USPSTF letter grade, ACIP routine/shared-decision, AHA/ACC class, NCCN). The recommendation logic is validated against an independent guideline oracle across 100 synthetic patients and 5,700 decisions at 100% concordance.

Privacy: all data is stored locally on device (Preferences/localStorage). Nothing is transmitted to any server or third party. There is no account, no analytics, and no network calls for user data.

Disclaimers: a mandatory disclaimer gate on first launch (must be accepted to proceed) states the app is not a medical device and not a substitute for professional care. A persistent informational disclaimer is also shown on the results screen. Privacy policy: [YOUR HOSTED URL].

To test: launch, accept the disclaimer, enter an age and sex on the profile screen, tap generate, and choose a view mode. No login required.

---

## Why this framing is your safest lane (context for you)

Guideline 1.4.1 gives extra scrutiny to medical apps that "could provide inaccurate data" or "could be used for diagnosing or treating patients," and requires you to disclose data and methodology behind any health-measurement accuracy claim. The apps it rejects hardest are ones that *measure* (BP, glucose, oximetry from sensors) or *diagnose*.

HealthyChex does neither. It's an information-organizing tool over published guidelines. Keeping every surface — listing, screenshots, description, in-app copy — in that lane is what keeps you clear of the diagnostic-tool bar.

**Language to use:** "informational," "checklist," "surfaces published guidelines," "reminds you to discuss with your clinician."
**Language to avoid everywhere:** "diagnose," "assess your risk," "tells you what you need," "medical advice," "clinical decision support." Even in marketing copy — a screenshot caption that says "know your cancer risk" invites the scrutiny the rest of the app avoids.

## What's already in the app (all present as of this build)

- First-launch disclaimer **gate** — hard stop, checkbox required, states not-a-medical-device / not-a-diagnosis / consult-your-doctor, acceptance persisted.
- **Persistent** informational disclaimer on the results screen (added this build) — always visible under the recommendations, not dismissible.
- Per-recommendation guideline **citations + evidence grades** in each body's native system.
- "Discuss with your clinician" framing throughout individual cards.
- On-device-only storage; explicit privacy + HIPAA-scope notice in the gate.
- Physician print report builds from validated items only.

## Still to do before submission (outside the app itself)

1. **Host a privacy policy** and put the URL in App Store Connect *and* in the Review Notes above. Yours is short and strong: no data collected, nothing transmitted, all on-device.
2. **App Privacy questions** in App Store Connect — answer truthfully as "Data Not Collected." Don't overclaim; matching reality is the whole point.
3. **Category** — Medical or Health & Fitness. Medical fits the content; Health & Fitness draws slightly less scrutiny. Either is defensible for an informational checklist.
4. **Screenshots** — show the checklist and the disclaimer. Avoid captions implying diagnosis.
5. Expect a possible clarification request. Health apps often get one; respond in Resolution Center pointing to the disclaimer gate, the on-device privacy model, and the guideline citations.
