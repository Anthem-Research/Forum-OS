package org.forum.os;

import android.app.AlertDialog;
import android.app.admin.DevicePolicyManager;
import android.app.role.RoleManager;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.os.Bundle;
import android.provider.Settings;
import android.view.View;
import android.widget.Button;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

public final class ParentActivity extends ParentOnlyActivity {
    private ForumStore store;
    private ForumPolicy policy;
    private boolean updating;
    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        if (isFinishing()) return;
        store = new ForumStore(this);
        policy = new ForumPolicy(this);
        setContentView(R.layout.activity_parent);
        for (Action action : Action.values()) findViewById(action.assignmentId).setOnClickListener(view ->
            startActivity(new Intent(this, AppPickerActivity.class).putExtra("action", action.name())));
        findViewById(R.id.change_pin).setOnClickListener(view -> startActivity(new Intent(this, ChangePinActivity.class)));
        findViewById(R.id.lock_forum).setOnClickListener(view -> HomeActivity.returnHome(this));
        findViewById(R.id.relock_device).setOnClickListener(view -> HomeActivity.returnHome(this));
        findViewById(R.id.request_home).setOnClickListener(view -> requestHome());
        // Device admin by itself cannot contain a child environment. Provisioning is documented separately.
        findViewById(R.id.enable_admin).setVisibility(View.GONE);
        findViewById(R.id.maintenance_exit).setVisibility(View.GONE);
        findViewById(R.id.open_settings).setOnClickListener(view -> new AlertDialog.Builder(this)
            .setTitle("Open Android settings?")
            .setMessage("Keep the tablet with you. Press Home when finished to restore Forum. A timed recovery also attempts to return in two minutes.")
            .setNegativeButton("Cancel", null).setPositiveButton("Open settings", (dialog, which) -> {
                if (!ParentSession.valid()) return;
                try { policy.maintenance(this); startActivity(new Intent(Settings.ACTION_SETTINGS)); }
                catch (RuntimeException e) { HomeActivity.returnHome(this); }
            }).show());
        ((Switch)findViewById(R.id.sealed_mode)).setOnCheckedChangeListener((button, enabled) -> {
            if (updating) return;
            if (!ParentSession.valid()) { HomeActivity.returnHome(this); return; }
            updating = true; button.setChecked(store.sealed()); updating = false;
            if (!policy.owner()) { Toast.makeText(this, "Device-owner setup is required.", Toast.LENGTH_LONG).show(); return; }
            if (enabled && store.defaultPin()) {
                Toast.makeText(this, "Change the starter PIN before sealing the tablet.", Toast.LENGTH_LONG).show();
                startActivity(new Intent(this, ChangePinActivity.class)); return;
            }
            if (enabled) new AlertDialog.Builder(this).setTitle("Seal this tablet?")
                .setMessage("This blocks Settings factory reset and safe boot. First check your PIN and parent recovery. USB debugging remains available for development recovery.")
                .setNegativeButton("Cancel", null).setPositiveButton("Seal", (dialog, which) -> setSealed(true)).show();
            else setSealed(false);
        });
    }
    @Override protected void onResume() { super.onResume(); if (!isFinishing() && store != null) refresh(); }
    private void refresh() {
        for (Action action : Action.values()) ((Button)findViewById(action.assignmentId)).setText(ApprovedApps.label(this, store.assigned(action)));
        ((TextView)findViewById(R.id.policy_status)).setText(getString(policy.owner() ? R.string.device_owner_active : R.string.standard_launcher_mode)
            + (store.defaultPin() ? " · Starter PIN: change before child use" : ""));
        updating = true;
        ((Switch)findViewById(R.id.sealed_mode)).setChecked(store.sealed());
        updating = false;
    }
    private void setSealed(boolean enabled) {
        if (!ParentSession.valid()) return;
        boolean previous = store.sealed();
        store.setSealed(enabled);
        try { policy.apply(); }
        catch (RuntimeException e) {
            store.setSealed(previous);
            Toast.makeText(this, "Policy could not be applied. Check parent setup.", Toast.LENGTH_LONG).show();
        }
        refresh();
    }
    private void requestHome() {
        if (!ParentSession.valid()) return;
        RoleManager roles = getSystemService(RoleManager.class);
        if (roles.isRoleAvailable(RoleManager.ROLE_HOME) && !roles.isRoleHeld(RoleManager.ROLE_HOME)) {
            try { startActivityForResult(roles.createRequestRoleIntent(RoleManager.ROLE_HOME), 20); }
            catch (ActivityNotFoundException e) { Toast.makeText(this, "Choose Forum OS in Android default home settings.", Toast.LENGTH_LONG).show(); }
        } else Toast.makeText(this, "Forum is already the home app.", Toast.LENGTH_SHORT).show();
    }
    @Override public void onBackPressed() { HomeActivity.returnHome(this); }
}
