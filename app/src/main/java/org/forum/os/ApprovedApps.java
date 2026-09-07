package org.forum.os;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.provider.Settings;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

final class ApprovedApps {
    static final class Entry {
        final ComponentName component;
        final String label;
        Entry(ComponentName component, String label) { this.component = component; this.label = label; }
        @Override public String toString() { return label + "\n" + component.getPackageName(); }
    }
    static List<Entry> list(Context context) {
        PackageManager pm = context.getPackageManager();
        Set<String> excluded = new HashSet<>();
        excluded.add(context.getPackageName());
        excluded.add("com.android.vending");
        excluded.add("com.sec.android.app.samsungapps");
        excluded.add("com.android.packageinstaller");
        excluded.add("com.google.android.packageinstaller");
        excluded.add("com.android.settings");
        excluded.add("com.android.chrome");
        excluded.add("com.sec.android.app.sbrowser");
        for (ResolveInfo info : pm.queryIntentActivities(new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME), 0)) {
            excluded.add(info.activityInfo.packageName);
        }
        ResolveInfo settings = pm.resolveActivity(new Intent(Settings.ACTION_SETTINGS), PackageManager.MATCH_DEFAULT_ONLY);
        if (settings != null) excluded.add(settings.activityInfo.packageName);
        Set<Integer> excludedUids = new HashSet<>();
        // Android extends lock-task permission to packages sharing an allowed UID.
        excludedUids.add(android.os.Process.SYSTEM_UID);
        for (String name : excluded) {
            try { excludedUids.add(pm.getApplicationInfo(name, 0).uid); }
            catch (PackageManager.NameNotFoundException ignored) { }
        }
        List<Entry> result = new ArrayList<>();
        for (ResolveInfo info : pm.queryIntentActivities(new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER), 0)) {
            ActivityInfo activity = info.activityInfo;
            if (activity.exported && activity.enabled && activity.applicationInfo.enabled
                && !excluded.contains(activity.packageName) && !excludedUids.contains(activity.applicationInfo.uid)) {
                result.add(new Entry(new ComponentName(activity.packageName, activity.name), info.loadLabel(pm).toString()));
            }
        }
        result.sort(Comparator.comparing((Entry e) -> e.label, String.CASE_INSENSITIVE_ORDER).thenComparing(e -> e.component.flattenToString()));
        return result;
    }
    static boolean contains(Context context, ComponentName component) {
        if (component == null) return false;
        for (Entry entry : list(context)) if (entry.component.equals(component)) return true;
        return false;
    }
    static String label(Context context, ComponentName component) {
        for (Entry entry : list(context)) if (entry.component.equals(component)) return entry.label;
        return component == null ? context.getString(R.string.not_assigned) : "Unavailable — choose another app";
    }
}
