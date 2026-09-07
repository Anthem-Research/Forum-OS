package org.forum.os;

import android.app.Activity;
import android.app.ActivityManager;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.SystemClock;
import android.os.UserManager;
import java.util.LinkedHashSet;
import java.util.Set;

final class ForumPolicy {
    private final Context context;
    private final DevicePolicyManager dpm;
    private final ComponentName admin;
    ForumPolicy(Context context) {
        this.context = context;
        dpm = context.getSystemService(DevicePolicyManager.class);
        admin = new ComponentName(context, ForumAdminReceiver.class);
    }
    boolean owner() { return dpm != null && dpm.isDeviceOwnerApp(context.getPackageName()); }
    boolean managedAdmin() { return dpm != null && dpm.isAdminActive(admin); }
    ComponentName admin() { return admin; }
    void apply() {
        if (!owner()) return;
        ForumStore store = new ForumStore(context);
        if (store.maintenance()) return;
        IntentFilter filter = new IntentFilter(Intent.ACTION_MAIN);
        filter.addCategory(Intent.CATEGORY_HOME);
        filter.addCategory(Intent.CATEGORY_DEFAULT);
        dpm.addPersistentPreferredActivity(admin, filter, new ComponentName(context, HomeActivity.class));
        Set<String> packages = new LinkedHashSet<>();
        packages.add(context.getPackageName());
        for (Action action : Action.values()) {
            ComponentName component = store.assigned(action);
            if (ApprovedApps.contains(context, component)) packages.add(component.getPackageName());
        }
        dpm.setLockTaskPackages(admin, packages.toArray(new String[0]));
        dpm.setLockTaskFeatures(admin, DevicePolicyManager.LOCK_TASK_FEATURE_HOME
            | DevicePolicyManager.LOCK_TASK_FEATURE_GLOBAL_ACTIONS
            | DevicePolicyManager.LOCK_TASK_FEATURE_BLOCK_ACTIVITY_START_IN_TASK);
        restrict(UserManager.DISALLOW_ADD_USER, true);
        restrict(UserManager.DISALLOW_MOUNT_PHYSICAL_MEDIA, true);
        restrict(UserManager.DISALLOW_CREATE_WINDOWS, true);
        restrict(UserManager.DISALLOW_SYSTEM_ERROR_DIALOGS, true);
        restrict(UserManager.DISALLOW_FACTORY_RESET, store.sealed());
        restrict(UserManager.DISALLOW_SAFE_BOOT, store.sealed());
    }
    private void restrict(String key, boolean enabled) {
        if (enabled) dpm.addUserRestriction(admin, key); else dpm.clearUserRestriction(admin, key);
    }
    void enter(Activity activity) {
        if (!owner() || new ForumStore(context).maintenance()) return;
        ActivityManager am = context.getSystemService(ActivityManager.class);
        if (dpm.isLockTaskPermitted(context.getPackageName()) && am.getLockTaskModeState() == ActivityManager.LOCK_TASK_MODE_NONE) {
            activity.startLockTask();
        }
    }
    void maintenance(Activity activity) {
        if (!ParentSession.valid()) throw new SecurityException("Parent access required");
        new ForumStore(context).beginMaintenance();
        if (owner()) {
            // Removing all lock-task packages also exits a task started by a different activity.
            dpm.setLockTaskPackages(admin, new String[0]);
            restrict(UserManager.DISALLOW_FACTORY_RESET, false);
            restrict(UserManager.DISALLOW_SAFE_BOOT, false);
            restrict(UserManager.DISALLOW_CREATE_WINDOWS, false);
            restrict(UserManager.DISALLOW_SYSTEM_ERROR_DIALOGS, false);
        }
        PendingIntent recovery = PendingIntent.getBroadcast(context, 0,
            new Intent(context, RecoveryReceiver.class).setAction("org.forum.os.RELOCK"),
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        // This is an inexact fallback; Home and reboot are the deterministic recovery paths.
        context.getSystemService(AlarmManager.class).setAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME_WAKEUP,
            SystemClock.elapsedRealtime() + 120_000, recovery);
    }
}
