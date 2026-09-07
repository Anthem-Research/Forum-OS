package org.forum.os;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public final class RecoveryReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (!Intent.ACTION_BOOT_COMPLETED.equals(action) && !Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)
            && !"org.forum.os.RELOCK".equals(action)) return;
        ParentSession.close();
        new ForumStore(context).endMaintenance();
        ForumPolicy policy = new ForumPolicy(context);
        try {
            policy.apply();
            if (policy.owner()) HomeActivity.returnHome(context);
        } catch (RuntimeException e) { Log.e("ForumPolicy", "Recovery policy could not be applied", e); }
    }
}
