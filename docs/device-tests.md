# Galaxy Tab acceptance checklist

Status: **not run — no tablet connected during this build**. Use the exact Samsung firmware intended for Atlas, with the selected real apps. Keep sealed mode off initially and retain authorized ADB recovery.

- [ ] Install/open in ordinary mode without changing default Home; check no launch crash.
- [ ] Compare the native home against `design/quiet-axis-home.png`: forest, paper, thin clock, date, five words, orange dot, no Android chrome at rest.
- [ ] Confirm landscape and portrait/resized fallback; no text collision with increased display/font size.
- [ ] Long-press FORUM; short taps do nothing. Wrong PIN is rejected, correct PIN works, cancel returns Home.
- [ ] Five wrong PINs cause a 30-second penalty. Restart app and reboot during penalty; rate limit remains effective.
- [ ] Change PIN, reject mismatched/invalid/starter values, relaunch and verify new PIN works and old PIN fails.
- [ ] Home, app backgrounding, process death and two minutes of inactivity do not preserve unauthorized parent access.
- [ ] Cancel/background the PIN screen while verification is running; it must not reopen parent controls.
- [ ] Assign/clear/reassign each word; labels persist after process death and reboot.
- [ ] Uninstall/disable a selected destination during adult testing. Its word stays on Forum with an unavailable message, not another app.
- [ ] Enable device owner on an approved eligible test device. Verify DPM owner and lock-task state `LOCKED` using ADB.
- [ ] Launch all five real apps and return Home repeatedly; no chooser or Samsung launcher appears.
- [ ] Try Back, Home, Recents, navigation gestures, notification shade, quick settings, split screen, keyboard settings and long-press shortcuts.
- [ ] Try links, share sheets, account/sign-in controls, file pickers, store links and embedded browsing within every approved app. Reject destinations that expose unwanted content or escape routes.
- [ ] Sleep/wake, power menu/reboot, low battery, offline start, app update and process termination return to the intended environment.
- [ ] Open adult Android settings, complete maintenance and press Home. Verify lock-task mode and restrictions are restored.
- [ ] Observe the best-effort maintenance alarm without assuming an exact deadline; never return the tablet to the child before manual relocking.
- [ ] Exercise debug recovery using the authorized computer. Do not enable sealed mode without a working recovery route.
- [ ] With separate adult approval, test sealed-mode policy and its reversal; do not perform a destructive factory reset as a casual test.

Record serial/model, Android/One UI build, APK SHA-256, app versions, results and screenshots. Fail the unattended-use gate if any escape/recovery check fails.
