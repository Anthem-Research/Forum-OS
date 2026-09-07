package org.forum.os;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

abstract class ParentOnlyActivity extends ForumActivity {
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable expiry = new Runnable() {
        @Override public void run() {
            if (!ParentSession.valid()) { HomeActivity.returnHome(ParentOnlyActivity.this); finish(); }
            else handler.postDelayed(this, 1000);
        }
    };
    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        if (!ParentSession.valid()) { HomeActivity.returnHome(this); finish(); }
    }
    @Override protected void onResume() { super.onResume(); handler.post(expiry); }
    @Override protected void onPause() { handler.removeCallbacks(expiry); super.onPause(); }
    @Override public void onUserInteraction() { super.onUserInteraction(); ParentSession.touch(); }
}
