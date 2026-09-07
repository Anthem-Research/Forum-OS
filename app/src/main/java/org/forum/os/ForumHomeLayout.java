package org.forum.os;

import android.content.Context;
import android.util.AttributeSet;
import android.util.TypedValue;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

/** Percentage anchors from the chosen Quiet Axis image, with a portrait fallback. */
public final class ForumHomeLayout extends FrameLayout {
    public ForumHomeLayout(Context context, AttributeSet attrs) { super(context, attrs); }
    @Override protected void onMeasure(int widthSpec, int heightSpec) {
        int width = MeasureSpec.getSize(widthSpec), height = MeasureSpec.getSize(heightSpec);
        float density = getResources().getDisplayMetrics().density;
        boolean landscape = width >= height;
        float unit = landscape ? height : width * 0.8f;
        text(R.id.forum_time, unit * 0.092f);
        text(R.id.forum_date, Math.max(11 * density, unit * 0.0155f));
        text(R.id.forum_wordmark, Math.max(13 * density, unit * 0.019f));
        TextView date = findViewById(R.id.forum_date);
        LinearLayout.LayoutParams dateParams = (LinearLayout.LayoutParams) date.getLayoutParams();
        dateParams.topMargin = (int) (unit * 0.029f);
        LinearLayout actions = findViewById(R.id.forum_actions);
        actions.setOrientation(landscape ? LinearLayout.HORIZONTAL : LinearLayout.VERTICAL);
        for (Action action : Action.values()) {
            FrameLayout target = findViewById(action.targetId);
            target.setLayoutParams(new LinearLayout.LayoutParams(landscape ? 0 : LayoutParams.MATCH_PARENT,
                landscape ? LayoutParams.MATCH_PARENT : 0, 1));
            TextView label = (TextView) target.getChildAt(0);
            label.setTextSize(TypedValue.COMPLEX_UNIT_PX, Math.max(18 * density, unit * 0.0305f));
            FrameLayout.LayoutParams dot = (FrameLayout.LayoutParams) target.getChildAt(1).getLayoutParams();
            dot.width = dot.height = (int) Math.max(7 * density, unit * 0.0125f);
            dot.topMargin = (int) (unit * 0.054f);
        }
        View clock = findViewById(R.id.forum_clock), mark = findViewById(R.id.forum_wordmark);
        clock.measure(MeasureSpec.makeMeasureSpec((int)(width * 0.65f), MeasureSpec.AT_MOST), MeasureSpec.makeMeasureSpec(height / 3, MeasureSpec.AT_MOST));
        mark.measure(MeasureSpec.makeMeasureSpec((int)(width * 0.22f), MeasureSpec.EXACTLY), MeasureSpec.makeMeasureSpec((int)(64 * density), MeasureSpec.EXACTLY));
        actions.measure(MeasureSpec.makeMeasureSpec((int)(width * 0.91f), MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(landscape ? (int)(height * 0.18f) : (int)(height * 0.52f), MeasureSpec.EXACTLY));
        setMeasuredDimension(width, height);
    }
    private void text(int id, float px) { ((TextView)findViewById(id)).setTextSize(TypedValue.COMPLEX_UNIT_PX, px); }
    @Override protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int w = r - l, h = b - t;
        boolean landscape = w >= h;
        place(findViewById(R.id.forum_clock), (int)(w * 0.0665f), (int)(h * 0.117f));
        View mark = findViewById(R.id.forum_wordmark);
        place(mark, (int)(w * 0.932f) - mark.getMeasuredWidth(), (int)(h * 0.117f));
        place(findViewById(R.id.forum_actions), (int)(w * 0.045f), (int)(h * (landscape ? 0.7758f : 0.4f)));
    }
    private void place(View view, int x, int y) { view.layout(x, y, x + view.getMeasuredWidth(), y + view.getMeasuredHeight()); }
}
