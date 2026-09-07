package org.forum.os;

import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class ChangePinActivity extends ParentOnlyActivity {
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        if (isFinishing()) return;
        setContentView(R.layout.activity_change_pin);
        findViewById(R.id.save_pin).setOnClickListener(view -> {
            if (!ParentSession.valid()) { HomeActivity.returnHome(this); return; }
            String pin = ((EditText)findViewById(R.id.new_pin)).getText().toString();
            String confirm = ((EditText)findViewById(R.id.confirm_pin)).getText().toString();
            if (!PinHash.valid(pin) || !pin.equals(confirm) || "0209".equals(pin)) {
                TextView error = findViewById(R.id.pin_change_error);
                error.setVisibility(View.VISIBLE);
                error.setText("Use four matching digits different from the starter PIN."); return;
            }
            view.setEnabled(false);
            executor.execute(() -> {
                boolean saved = false;
                try { saved = ParentSession.valid() && new ForumStore(this).setPin(pin); } catch (RuntimeException ignored) { }
                boolean result = saved;
                runOnUiThread(() -> {
                    if (isFinishing() || isDestroyed()) return;
                    if (result) { Toast.makeText(this, R.string.pin_saved, Toast.LENGTH_SHORT).show(); finish(); }
                    else { view.setEnabled(true); Toast.makeText(this, "PIN was not saved. Try again.", Toast.LENGTH_LONG).show(); }
                });
            });
        });
    }
    @Override protected void onDestroy() { executor.shutdown(); super.onDestroy(); }
}
