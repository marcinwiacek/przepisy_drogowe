package com.mwiacek.przepisy.drogowe

import android.content.Context
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Paint
import android.os.CountDownTimer
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View

//Shared between Straz and Przepisy
//1.0
class ScrollerView : View {
    var Touched = false
    var Showed = false

    @JvmField
    var y = 0
    var p = Paint()

    @JvmField
    var myBitmap = BitmapFactory.decodeResource(resources, R.drawable.scroll1)
    var ct: CountDownTimer? = null
    var webview: ScrollerWebView? = null

    constructor(context: Context?) : super(context) {
        p.alpha = 200
    }

    constructor(context: Context?, attrs: AttributeSet?) : super(context, attrs) {
        p.alpha = 200
    }

    constructor(context: Context?, attrs: AttributeSet?, defStyle: Int) : super(
        context,
        attrs,
        defStyle
    ) {
        p.alpha = 200
    }

    fun SetTimer() {
        if (ct != null) ct!!.cancel()
        Showed = true
        invalidate()
        ct = object : CountDownTimer(2000, 2000) {
            override fun onTick(millisUntilFinished: Long) {}
            override fun onFinish() {
                if (Showed || !Touched) {
                    Showed = false
                    invalidate()
                }
            }
        }.start()
    }

    public override fun onDraw(canvas: Canvas) {
        if (Showed) canvas.drawBitmap(myBitmap, 0f, y.toFloat(), p)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        if (!Showed) return false
        if (event.action == MotionEvent.ACTION_DOWN) {
            if (event.y.toInt() >= y && event.y.toInt() <= y + myBitmap.height) {
                Touched = true
                return true
            }
        }
        if (event.action == MotionEvent.ACTION_MOVE && Touched) {
            y = event.y.toInt()
            if (y + myBitmap.height > webview!!.height) {
                y = webview!!.height - myBitmap.height
            }
            if (y - myBitmap.height < 0) y = 0
            webview!!.scrollTo(
                0,
                y * webview!!.GetMax() / (this.height - myBitmap.height)
            )
            return true
        }
        if (event.action == MotionEvent.ACTION_UP && Touched) {
            Touched = false
            SetTimer()
            return true
        }
        return false
    }
}