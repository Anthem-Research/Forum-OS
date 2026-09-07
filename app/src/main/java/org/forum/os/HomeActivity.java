package org.forum.os;

import android.app.ActivityOptions;
import android.app.KeyguardManager;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;

public final class HomeActivity extends ForumActivity {
    private ForumStore store;
    private ForumPolicy policy;
    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        store = new ForumStore(this);
        policy = new ForumPolicy(this);
        setContentView(R.layout.activity_home);
        View wordmark = findViewById(R.id.forum_wordmark);
        wordmark.setFocusable(true);
        wordmark.setOnLongClickListener(view -> {
            startActivity(new Intent(this, ParentGateActivity.class));
            return true;
        });
        for (Action action : Action.values()) {
            View target = findViewById(action.targetId);
            target.setContentDescription(action.name());
            target.setOnClickListener(view -> launch(action));
            target.setOnFocusChangeListener((view, focused) -> { if (focused) highlight(action); });
        }
    }
    @Override protected void onResume() {
        super.onResume();
        ParentSession.close();
        store.endMaintenance();
        highlight(store.selected());
        try {
            policy.apply();
            if (!getSystemService(KeyguardManager.class).isKeyguardLocked()) policy.enter(this);
        } catch (RuntimeException e) { android.util.Log.e("ForumPolicy", "Managed mode needs parent attention", e); }
    }
    private void highlight(Action selected) {
        for (Action action : Action.values()) {
            findViewById(action.dotId).setVisibility(action == selected ? View.VISIBLE : View.INVISIBLE);
            findViewById(action.targetId).setSelected(action == selected);
        }
    }
    private void launch(Action action) {
        if (!ApprovedApps.contains(this, store.assigned(action))) {
            Toast.makeText(this, getString(R.string.not_assigned_message, action.name()), Toast.LENGTH_SHORT).show();
            return;
        }
        Intent target = new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
            .setComponent(store.assigned(action)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);
        try {
            if (policy.owner()) {
                ActivityOptions options = ActivityOptions.makeBasic();
                options.setLockTaskEnabled(true);
                startActivity(target, options.toBundle());
            } else startActivity(target);
            store.select(action);
            highlight(action);
        } catch (ActivityNotFoundException | SecurityException e) {
            Toast.makeText(this, "This destination is unavailable.", Toast.LENGTH_SHORT).show();
        }
    }
    @Override public void onBackPressed() { /* Home is the root of the child environment. */ }
    static void returnHome(Context context) {
        context.startActivity(new Intent(context, HomeActivity.class)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP));
    }
}
