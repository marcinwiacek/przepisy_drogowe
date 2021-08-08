package com.mwiacek.przepisy.drogowe;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.os.CountDownTimer;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;

//Shared between Straz and Przepisy
//1.0
public class ScrollerView extends View {
    boolean Touched = false, Showed = false;
    int y;
    Paint p = new Paint();
    Bitmap myBitmap = BitmapFactory.decodeResource(getResources(), R.drawable.scroll1);
    CountDownTimer ct;
    ScrollerWebView webview;

    public ScrollerView(Context context) {
        super(context);
        p.setAlpha(200);
    }

    public ScrollerView(Context context, AttributeSet attrs) {
        super(context, attrs);
        p.setAlpha(200);
    }

    public ScrollerView(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
        p.setAlpha(200);
    }

    public void SetTimer() {
        if (ct != null) ct.cancel();
        Showed = true;
        invalidate();
        ct = new CountDownTimer(2000, 2000) {
            public void onTick(long millisUntilFinished) {
            }

            public void onFinish() {
                if (Showed || !Touched) {
                    Showed = false;
                    invalidate();
                }
            }
        }.start();
    }

    @Override
    public void onDraw(Canvas canvas) {
        if (Showed) canvas.drawBitmap(myBitmap, 0, y, p);
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        if (!Showed) return false;
        if (event.getAction() == MotionEvent.ACTION_DOWN) {
            if ((int) event.getY() >= y && (int) event.getY() <= y + myBitmap.getHeight()) {
                Touched = true;
                return true;
            }
        }
        if (event.getAction() == MotionEvent.ACTION_MOVE && Touched) {
            y = (int) event.getY();
            if (y + myBitmap.getHeight() > webview.getHeight()) {
                y = webview.getHeight() - myBitmap.getHeight();
            }
            if (y - myBitmap.getHeight() < 0) y = 0;
            webview.scrollTo(0,
                    (y * webview.GetMax() / (this.getHeight() - myBitmap.getHeight())));
            return true;
        }
        if (event.getAction() == MotionEvent.ACTION_UP && Touched) {
            Touched = false;
            SetTimer();
            return true;
        }
        return false;
    }
}
