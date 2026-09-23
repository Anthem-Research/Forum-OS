# Forum OS

Forum OS now contains three deliberately separate parts:

- [`app/`](app/) — the quiet native Android launcher and containment client for
  Atlas's Galaxy Tab;
- [`workbench/`](workbench/) — an offline-capable, browser-local place for
  questions, notes, drawings, connections, versions and branches;
- [`engine/`](engine/) — Forum Engine, the networked and locally self-hostable
  application built around Blocks, Builds, Collections and Connections.

The launcher is a protected doorway. The Workbench keeps early work in one
browser profile with no background sync. Forum Engine is the persistent
environment for Nodes, the Network and the curated Library. Local browser
storage is not account isolation or encryption; see the
[Workbench README](workbench/README.md) before using it with private material.

## Forum Engine

The Engine foundation implements the revised Forum product architecture in
strict TypeScript and Next.js. It includes the core graph, child/guardian privacy
rules, PostgreSQL row-level-security migration, realistic seed Builds and the
first sparse institutional interface. See the [Engine README](engine/README.md).

---

A quiet Android home for Atlas. Built for the Galaxy Tab S10 Lite, with **The Quiet Axis** as its visual source of truth.

Near-black forest. Warm paper type. A clock and date. Five words: `ASK`, `DRAW`, `LOOK`, `SYNTHESIS`, `PLAY`. One orange dot. No child-facing settings, app drawer, feed, icons, cards or notifications.

This repository contains a native Android launcher, not a web wrapper or replacement Android firmware. `design-preview/` is a separate visual prototype; it cannot enforce Android policies or launch installed Android apps.

## Current status

Version **0.1.0 — development build**. Debug APK, optimized unsigned release APK, Android lint, and three JVM PIN-security tests build successfully. Native device execution and Samsung containment/recovery tests remain pending; do not leave this build with a child unattended. See [verification](docs/verification.md).

## Try the native launcher

1. Connect the tablet by USB and authorize USB debugging on the tablet. Keep the computer and its authorized debugging access under adult control.
2. Install the debug APK with `adb install -r -t app/build/outputs/apk/debug/app-debug.apk`.
3. Open Forum OS. Long-press `FORUM`, enter the starter PIN **0209**, and change it immediately. Assign an installed app to each word.
4. Choose **Make Forum home** from parent controls for ordinary launcher testing. This is not containment: Android system controls remain reachable in this mode.

Do not reset the tablet to try the visual launcher. Stronger dedicated-device setup is a separate, consequential step: [setup and recovery](docs/device-setup.md).

## Parent controls

- The four-digit PIN is salted and hashed locally. Repeated wrong attempts introduce a persistent 30-second delay after the fifth failure, increasing to five minutes. The delay survives app restarts and restarts on reboot while failures remain outstanding.
- Parent sessions expire after two minutes of inactivity and are discarded when Home is shown or the process dies. Parent activities are not externally exported.
- App assignments persist as exact launch components. Missing or removed destinations stay on Home with a short message; they never fall back to a browser or app store.
- **Android settings** opens an explicitly confirmed adult maintenance window. Keep the tablet with you; press Home to restore Forum. The two-minute alarm is an inexact fallback, not a guaranteed deadline.
- **Sealed mode** is opt-in, requires device-owner setup and a changed PIN, and adds Settings factory-reset and safe-boot restrictions. It deliberately does not disable USB-debugging recovery during development.

## Build

JDK 17, Android SDK platform 36 / build tools 36.0.0, Gradle 9.6.0, Android Gradle Plugin 9.4.0. Minimum Android 11 / API 30. No production third-party runtime dependencies and no Internet permission.

With a configured Android SDK:

```sh
./gradlew :app:assembleDebug :app:lintDebug :app:testDebugUnitTest
```

On Windows use `gradlew.bat`. The optional PowerShell helpers download a portable toolchain under ignored `.tools/`, without changing machine-wide environment settings:

```powershell
.\scripts\prepare-build.ps1
.\scripts\install-sdk.ps1
.\scripts\build-local.ps1
```

`install-sdk.ps1` accepts the standard Android SDK licenses. Review the licenses before running it if you have not already accepted them.

Debug output: `app/build/outputs/apk/debug/app-debug.apk`. It is deliberately `testOnly` and debuggable, with ADB recovery available. The release build is unsigned: use a privately backed-up, stable signing key for eventual deployment. Never commit signing keys. An APK signed with another key cannot update an existing installation in place.

GitHub Actions builds, lints, tests and uploads a debug APK artifact on pushes to `main` and pull requests.

## Boundaries

“Indestructible” is the design intent, not an absolute security claim. Real child containment depends on device-owner provisioning, Android lock-task behavior, carefully chosen apps, and testing on the actual Samsung firmware. An approved app can still expose its own content, accounts, settings and embedded web views. Forum does not filter the contents of another app. Root access, authorized ADB access, hardware recovery and OEM behavior are outside this launcher's trust boundary.

See [security model](docs/security.md), [device acceptance checklist](docs/device-tests.md), and [selected design](docs/design/README.md).
