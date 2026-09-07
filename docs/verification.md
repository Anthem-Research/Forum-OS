# Verification record

Date: 2026-09-06. Environment: Windows, portable Temurin JDK 17, Gradle 9.6.0, Android SDK 36.

## Confirmed locally

- `:app:assembleDebug` — successful; approximately 0.6 MB APK.
- `:app:assembleRelease` — successful, including R8/resource shrinking; unsigned output, not an installable release distribution.
- `:app:testDebugUnitTest` — 3 tests, 0 failures, 0 skipped. Covers PIN format, salted hash verification/rejection, bounded brute-force delays. These are JVM tests, not Android lifecycle/instrumentation tests.
- `:app:lintDebug` — no errors. Warnings remain, including intentional synchronous preference durability, English-only copy, older API usage/target choices, layout allocations/overdraw and unfinished installation-icon polish. Do not describe this as warning-free.
- `apksigner verify` — debug APK signature verified (v2).
- APK manifest inspected: `org.forum.os`, version 0.1.0, min API 30, target API 36, `testOnly`, debuggable, only `RECEIVE_BOOT_COMPLETED` permission, no Internet permission.
- Gradle wrapper generated; distribution SHA-256 pinned.
- Web visual preview: production build successful; all 28 protected runtime hashes pass.
- Browser: the five words render; DRAW selection moves the active state; wrong PIN displays TRY AGAIN; starter PIN opens parent controls; ASK assignment changes to Synthesis; LOCK FORUM returns Home. No warning/error console entries were returned during this verification.

The web preview uses memory-only sample data. Direct `?screen=pin` / `?screen=parent` fixtures exist for design testing; these are not Android authentication routes and are never included in the APK.

## Not confirmed

- No Android device/emulator was connected (`adb devices -l` returned an empty list).
- Native first launch, visual match, touch behavior, real app launch, persistence/lifecycle behavior, owner provisioning, lock-task containment, boot/wake recovery, maintenance alarm and emergency removal have **not been runtime-tested**.
- Browser long-press timing and phone-only fallback need additional interaction coverage. Browser tests are not substitutes for the native checks.
- GitHub CI results, if not separately linked, are not implied by local build success.
- Native design QA remains blocked on a rendered tablet capture; see [design QA](../design-qa.md).

The test APK is a development milestone. Pass [device-tests.md](device-tests.md) before unattended use, then establish production signing and recovery.
