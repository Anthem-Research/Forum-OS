# Security model

## Trust boundary

The child-facing surface is a native Home activity. Only the parent picks the five destinations. Forum stores exact components, rechecks installed/exported/enabled activities at launch, and never substitutes another destination silently. The device-owner allowlist is package-scoped, not screen-scoped. Approved apps and packages sharing their UID are part of the trusted surface.

The picker excludes Home providers, the resolved Settings provider, Android Settings, Play Store, Galaxy Store, common package installers, Chrome and Samsung Internet. It also rejects apps with the Android system UID or the UID of a visible excluded package. This is defense in depth, not an exhaustive content-safety classifier: other browsers, web views or unsafe content can exist in otherwise selectable apps. An adult must review each app, its sign-in, links, sharing, accounts and internal settings.

In device-owner mode, Forum configures `LOCK_TASK_FEATURE_BLOCK_ACTIVITY_START_IN_TASK` as well as the Home and power-menu features. The same-task flag reduces an escape route that ordinary task allowlisting leaves open. See the [Android API contract](https://developer.android.com/reference/android/app/admin/DevicePolicyManager#LOCK_TASK_FEATURE_BLOCK_ACTIVITY_START_IN_TASK). System exceptions and OEM behavior still need device testing.

## Parent gate

- Four ASCII digits; starter `0209` must be changed before child use.
- PBKDF2-HMAC-SHA256, 120,000 iterations, 16-byte random salt, 32-byte hash. No plaintext stored PIN, telemetry or cloud copy.
- Failed-attempt count persists. Monotonic deadlines avoid bypass via changing wall-clock time. Outstanding penalties restart after reboot.
- PIN work executes off the UI thread and is serialized between gate instances. A paused/destroyed gate cannot promote a completed background check into a new parent session.
- Parent sessions exist only in process memory, expire after two idle minutes, and are cleared on return Home. Private activities check session validity before protected mutations.
- Parent windows prevent screenshots; backup is disabled. The home screen remains capturable for design verification.

A four-digit PIN is a convenience barrier against casual child access, not a high-entropy credential. Debugging/rooted access can bypass this barrier.

## Recovery and limitations

Home and normal boot reapply owner policy; maintenance stores a boot-bound monotonic deadline. The recovery alarm is deliberately described as best effort. Do not hand over the tablet during maintenance.

No Accessibility service, overlay interception, VPN, root exploit, remote kill switch or automatic factory reset is used. No network permission is requested. App-level network/content limits must be supplied by the selected apps or a separate adult-chosen system.

Unattended deployment is not approved by compilation or unit tests. It requires the Samsung device checklist, a stable production signing key, a proven recovery route and a decision about developer access. The test APK retains ADB recovery and is not the final hardened distribution.
