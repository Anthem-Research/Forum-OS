# Tablet setup and adult recovery

## Start with ordinary launcher testing

Install the debug APK using a trusted computer:

```sh
adb devices -l
adb install -r -t app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n org.forum.os/.HomeActivity
```

Do not execute commands against a device unless its serial is the intended tablet. With more than one connected device, use `adb -s SERIAL` for every command.

Long-press `FORUM`; starter PIN `0209`. Change the PIN, assign destinations, and test returning Home. In parent controls, **Make Forum home** asks Android to choose this launcher. Do not enable sealed mode during the first round of tests.

## Dedicated-device mode is separate

Android device-owner provisioning gives this app substantial authority over the whole tablet. It is not an ordinary permission dialog. Existing accounts, another owner, work profiles and device setup state can prevent provisioning. Production enrollment generally involves a factory reset, which erases local data. Back up first and obtain explicit approval before any reset. No reset command is included here.

For an eligible development device with no conflicting accounts or owner, the Android development setup uses:

```sh
adb shell dpm set-device-owner org.forum.os/.ForumAdminReceiver
adb shell am start -n org.forum.os/.HomeActivity
```

This command changes device administration. It must be a deliberate adult action, not part of automatic installation. If Android refuses, stop and read the reason; do not work around existing management or erase the device automatically.

Forum then registers itself as persistent Home, configures an app-package allowlist, and enters lock task when unlocked and in the foreground. This build does not implement QR/EMM enrollment.

Confirm the actual state, not just the appearance:

```sh
adb shell dumpsys device_policy
adb shell dumpsys activity activities
```

The owner should be `org.forum.os/.ForumAdminReceiver`. Lock-task state should be `LOCKED`, not merely screen-pinned. Review the configured packages and test all of [device-tests.md](device-tests.md).

## Parent maintenance

Long-press `FORUM` → PIN → **Android settings** → confirm. The lock-task allowlist is temporarily cleared so settings can open. Keep possession of the tablet. Press Android Home to restore Forum and its policy; a reboot also ends the stored maintenance window. An inexact alarm attempts a return after two minutes, but Android can delay it.

Only after checking both the PIN and recovery route should you consider **Sealed mode**. It adds safe-boot and Settings factory-reset restrictions. It does not make the device immune to hardware recovery.

## Development emergency recovery

The debug build is intentionally marked `testOnly`, so an already authorized development computer can remove its device-owner admin:

```sh
adb shell dpm remove-active-admin org.forum.os/.ForumAdminReceiver
```

This changes administration and should only be used by the adult owner for recovery. After successful removal, choose Samsung's launcher in Android default-home settings. Uninstall Forum only if wanted; uninstalling removes the local PIN and assignments. Do not use this command as a claimed recovery path for an eventual non-test release: Android does not allow the same removal for an ordinary production device owner.

If ADB is unauthorized/unavailable, do not enable stronger restrictions while still developing. A production signing, provisioning and recovery procedure is required before unattended use.

References: [Android dedicated-device setup](https://developer.android.com/work/dpc/dedicated-devices), [lock-task guide](https://developer.android.com/work/dpc/dedicated-devices/lock-task-mode), [device administration testing](https://developer.android.com/work/dpc/dedicated-devices/cookbook).
