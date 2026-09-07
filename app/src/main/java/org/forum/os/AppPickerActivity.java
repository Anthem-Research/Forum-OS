package org.forum.os;

import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;
import java.util.List;

public final class AppPickerActivity extends ParentOnlyActivity {
    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        if (isFinishing()) return;
        setContentView(R.layout.activity_app_picker);
        Action action = Action.parse(getIntent().getStringExtra("action"));
        ((TextView)findViewById(R.id.picker_title)).setText(getString(R.string.choose_app, action.name()));
        List<ApprovedApps.Entry> entries = ApprovedApps.list(this);
        ListView list = findViewById(R.id.app_list);
        list.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, entries));
        list.setOnItemClickListener((parent, view, position, id) -> save(action, entries.get(position)));
        findViewById(R.id.clear_assignment).setOnClickListener(view -> save(action, null));
    }
    private void save(Action action, ApprovedApps.Entry entry) {
        if (!ParentSession.valid()) { HomeActivity.returnHome(this); return; }
        ForumStore store = new ForumStore(this);
        android.content.ComponentName previous = store.assigned(action);
        store.assign(action, entry == null ? null : entry.component);
        try { new ForumPolicy(this).apply(); finish(); }
        catch (RuntimeException e) {
            store.assign(action, previous);
            Toast.makeText(this, "The destination could not be approved.", Toast.LENGTH_LONG).show();
        }
    }
}
