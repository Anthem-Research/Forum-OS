package org.forum.os;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.TextView;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class ParentGateActivity extends ForumActivity {
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final StringBuilder input = new StringBuilder();
    private final int[] dots = {R.id.pin_dot_1, R.id.pin_dot_2, R.id.pin_dot_3, R.id.pin_dot_4};
    private ForumStore store;
    private boolean busy;
    private boolean resumed;
    private int generation;
    private boolean failed;
    private final Runnable tick = new Runnable() {
        @Override public void run() { render(); handler.postDelayed(this, 500); }
    };
    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        setContentView(R.layout.activity_parent_gate);
        store = new ForumStore(this);
        int[] keys = {R.id.key_0, R.id.key_1, R.id.key_2, R.id.key_3, R.id.key_4, R.id.key_5, R.id.key_6, R.id.key_7, R.id.key_8, R.id.key_9};
        for (int i = 0; i < keys.length; i++) {
            String digit = String.valueOf(i);
            findViewById(keys[i]).setOnClickListener(view -> digit(digit));
        }
        findViewById(R.id.key_delete).setOnClickListener(view -> {
            if (!busy && input.length() > 0) input.deleteCharAt(input.length() - 1);
            render();
        });
        findViewById(R.id.gate_cancel).setOnClickListener(view -> finish());
    }
    @Override protected void onResume() { super.onResume(); resumed = true; handler.post(tick); }
    @Override protected void onPause() {
        resumed = false;
        generation++;
        busy = false;
        input.setLength(0);
        handler.removeCallbacks(tick);
        super.onPause();
    }
    @Override protected void onDestroy() { executor.shutdown(); handler.removeCallbacksAndMessages(null); super.onDestroy(); }
    private void digit(String digit) {
        if (busy || store.waitMillis() > 0 || input.length() >= 4) return;
        failed = false;
        input.append(digit);
        render();
        if (input.length() != 4) return;
        busy = true;
        int attemptGeneration = generation;
        String candidate = input.toString();
        executor.execute(() -> {
            boolean accepted;
            try { accepted = store.verify(candidate); } catch (RuntimeException e) { accepted = false; }
            final boolean success = accepted;
            handler.post(() -> {
                if (!resumed || attemptGeneration != generation || isFinishing() || isDestroyed()) return;
                busy = false;
                input.setLength(0);
                if (success) {
                    ParentSession.open();
                    startActivity(new Intent(this, ParentActivity.class));
                    finish();
                } else { failed = true; render(); }
            });
        });
    }
    private void render() {
        long wait = store.waitMillis();
        ((TextView)findViewById(R.id.gate_status)).setText(wait > 0
            ? getString(R.string.wait_seconds, (wait + 999) / 1000)
            : getString(failed ? R.string.try_again : R.string.enter_pin));
        for (int i = 0; i < dots.length; i++) findViewById(dots[i]).setBackgroundResource(i < input.length() ? R.drawable.pin_dot_filled : R.drawable.pin_dot_empty);
        findViewById(R.id.pin_dots).setContentDescription(input.length() + " of 4 digits entered");
    }
}
