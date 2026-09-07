package org.forum.os;

import android.app.admin.DeviceAdminReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public final class ForumAdminReceiver extends DeviceAdminReceiver {
    @Override public void onEnabled(Context context, Intent intent) { reapply(context); }
    @Override public void onProfileProvisioningComplete(Context context, Intent intent) {
        reapply(context);
        HomeActivity.returnHome(context);
    }
    private void reapply(Context context) {
        try { new ForumPolicy(context).apply(); }
        catch (RuntimeException e) { Log.e("ForumPolicy", "Policy could not be applied", e); }
    }
}
