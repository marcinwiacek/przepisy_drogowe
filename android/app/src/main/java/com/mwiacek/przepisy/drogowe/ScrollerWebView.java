package com.mwiacek.przepisy.drogowe;

import android.content.Context;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.webkit.WebView;

//Shared between Straz and Przepisy
//1.0
public class ScrollerWebView extends WebView {
    MotionEvent ev;
    ScrollerView sv;

    public ScrollerWebView(Context context) {
        super(context);
    }

    public ScrollerWebView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public ScrollerWebView(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        if (event.getAction() == MotionEvent.ACTION_DOWN) ev = event;
        return super.onTouchEvent(event);
    }

    @Override
    protected void onScrollChanged(int x, int y, int oldx, int oldy) {
        super.onScrollChanged(x, y, oldx, oldy);
        if (sv != null && GetMax() != 0) {
            sv.y = (this.getHeight() - sv.myBitmap.getHeight())
                    * computeVerticalScrollOffset() / GetMax();
            sv.SetTimer();
        }
    }

    int GetMax() {
        return computeVerticalScrollRange() - computeVerticalScrollExtent();
    }
}
