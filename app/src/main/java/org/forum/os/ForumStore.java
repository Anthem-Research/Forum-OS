package org.forum.os;

import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.SystemClock;
import android.provider.Settings;

final class ForumStore {
    private static final Object PIN_LOCK = new Object();
    private final SharedPreferences prefs;
    private final int boot;
    ForumStore(Context context) {
        prefs = context.getSharedPreferences("forum", Context.MODE_PRIVATE);
        boot = Settings.Global.getInt(context.getContentResolver(), Settings.Global.BOOT_COUNT, -1);
    }
    ComponentName assigned(Action action) {
        String raw = prefs.getString("action." + action.name(), null);
        return raw == null ? null : ComponentName.unflattenFromString(raw);
    }
    void assign(Action action, ComponentName component) {
        prefs.edit().putString("action." + action.name(), component == null ? null : component.flattenToString()).commit();
    }
    Action selected() { return Action.parse(prefs.getString("selected", "ASK")); }
    void select(Action action) { prefs.edit().putString("selected", action.name()).apply(); }
    boolean defaultPin() { return !prefs.getBoolean("pin.changed", false); }
    boolean verify(String pin) {
        synchronized (PIN_LOCK) { return verifyLocked(pin); }
    }
    private boolean verifyLocked(String pin) {
        if (waitMillis() > 0) return false;
        String stored = prefs.getString("pin.hash", null);
        if (stored == null) {
            stored = PinHash.create("0209");
            if (!prefs.edit().putString("pin.hash", stored).commit()) return false;
        }
        boolean valid = PinHash.matches(pin, stored);
        int failures = valid ? 0 : Math.min(20, prefs.getInt("pin.failures", 0) + 1);
        long delay = AttemptPolicy.delayMillis(failures);
        prefs.edit().putInt("pin.failures", failures).putInt("pin.boot", boot)
            .putLong("pin.until", SystemClock.elapsedRealtime() + delay).commit();
        return valid;
    }
    long waitMillis() {
        long delay = AttemptPolicy.delayMillis(prefs.getInt("pin.failures", 0));
        if (delay == 0) return 0;
        if (prefs.getInt("pin.boot", -2) != boot) {
            prefs.edit().putInt("pin.boot", boot).putLong("pin.until", SystemClock.elapsedRealtime() + delay).commit();
        }
        return Math.max(0, Math.min(delay, prefs.getLong("pin.until", 0) - SystemClock.elapsedRealtime()));
    }
    boolean setPin(String pin) {
        synchronized (PIN_LOCK) {
            return prefs.edit().putString("pin.hash", PinHash.create(pin)).putBoolean("pin.changed", true)
                .putInt("pin.failures", 0).remove("pin.until").commit();
        }
    }
    boolean sealed() { return prefs.getBoolean("sealed", false) && !defaultPin(); }
    void setSealed(boolean value) { prefs.edit().putBoolean("sealed", value).commit(); }
    boolean maintenance() {
        return prefs.getInt("maintenance.boot", -2) == boot && prefs.getLong("maintenance.until", 0) > SystemClock.elapsedRealtime();
    }
    void beginMaintenance() {
        prefs.edit().putInt("maintenance.boot", boot).putLong("maintenance.until", SystemClock.elapsedRealtime() + 120_000).commit();
    }
    void endMaintenance() { prefs.edit().remove("maintenance.until").commit(); }
}
