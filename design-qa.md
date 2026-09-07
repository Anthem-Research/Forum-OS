# Forum OS design QA

final result: blocked

The web reference comparison is useful evidence, but it cannot sign off the native Android UI. A connected tablet or emulator is required for the native capture and touch/rotation checks.

## Evidence

- Source truth: `docs/design/quiet-axis-home.png`, 1501 × 1048 pixels.
- Latest browser home: `docs/design/qa/home-tablet.png`, 1280 × 800 pixels.
- Parent state: `docs/design/qa/parent-tablet.png`, 1280 × 800 pixels.
- Full browser captures: `docs/design/qa/full-browser.png`, `parent-browser.png`.
- Browser viewport: 1500 × 1050 CSS pixels; reported DPR approximately 1. Device-screen bounds: x110, y125.2, width1280, height800; unscaled tablet preset. Browser PNG width is1499 due backend rounding. Cropped at x110/y125 without resampling.
- State: 09:42, SATURDAY · 5 SEPTEMBER, ASK selected, matching the source copy/state. The source's 1.432:1 aspect differs from the required 16:10 tablet. Percentage anchors and height-relative typography intentionally adapt to that display; this is not a claim of identical pixel geometry.
- The source and corrected home capture were opened together in one comparison input, alongside the parent capture. Full-view evidence confirms the same sparse composition, hierarchy, palette and words. Native full-view/focused evidence remains unavailable.

## Required fidelity surfaces

- **Typography:** bundled Inter variable, light clock, tracked small date/wordmark and uppercase action row. Replaced the earlier Roboto approximation. Source is a generated raster, not a font specification; native font metrics/optical placement remain to be inspected on Android.
- **Spacing:** same proportional top corners, broad negative space, low horizontal row and centered active dot. Tablet adaptation is intentionally wider. No action text is clipped in the verified landscape browser capture. Parent screen begins at the correct top position after navigation.
- **Colors:** forest `#0D1C16`, paper `#F5F1E6`, orange `#EE6B3B`. Flat native/app fills; subtle raster variation in the generated reference is not reproduced as decorative wallpaper.
- **Assets:** no photographic/illustrated assets or icon grid in this direction. Clock, date, wordmark and action names remain live text; orange dot is functional selection state. The preview's rounded frame belongs to its device runtime, not the native app layout.
- **Copy:** source state and all five destinations match exactly in the latest browser home capture. Parent-only explanatory copy is outside the selected home mock. Preview-only limits are explicitly labelled.

## Comparison history / findings

1. Earlier preview used Roboto, had mismatched fixed clock/date sizing, a vertically offset wordmark, and preserved scroll position when entering parent controls. Corrected to local Inter, proportional sizing/spacing, top alignment and keyed screen scroll containers.
2. First captured browser image used an unreliable clip result, included whitespace and the wrong clock/date fixture; it was not valid comparison evidence. Replaced with a full capture cropped to the DOM-measured tablet bounds and the source's exact clock/date state.
3. The revised source and implementation were opened together. No new tablet-browser layout blocker was observed, but their aspect ratios intentionally differ. A strict matched-viewport/native fidelity pass has not occurred. Do not promote this report to passed based on compilation or browser screenshots alone.

## Interaction evidence

Browser action selection, wrong/correct PIN states, sample assignment change and relocking were exercised. Error/warning console results were empty. Runtime integrity and production build passed. Real Android app launching, parent lifecycle and lock-task behavior are not represented by the web prototype.

## Implementation checklist

- [x] Keep the selected composition and remove child-facing ornament/chrome.
- [x] Bundle matching font and use shared palette/proportional anchors.
- [x] Verify core browser preview states and save evidence.
- [ ] Install the APK on the Galaxy Tab, capture native Home and parent screens, and compare at normalized matching viewport/state.
- [ ] Capture focused clock/date and action-row comparisons; inspect font metrics and touch targets on the native device.
- [ ] Complete the native rotation/accessibility and containment acceptance checklist.

Follow-up polish: exact native optical alignment, launch icon used outside the child home, English string extraction, and wider phone-only preview coverage.
