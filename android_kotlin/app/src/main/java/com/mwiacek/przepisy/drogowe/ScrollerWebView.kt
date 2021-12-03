package com.mwiacek.przepisy.drogowe

import android.content.Context
import android.util.AttributeSet
import android.view.MotionEvent
import android.webkit.WebView

//Shared between Straz and Przepisy
//1.0
class ScrollerWebView : WebView {
    var ev: MotionEvent? = null
    var sv: ScrollerView? = null

    constructor(context: Context?) : super(context!!)
    constructor(context: Context?, attrs: AttributeSet?) : super(
        context!!, attrs
    )

    constructor(context: Context?, attrs: AttributeSet?, defStyle: Int) : super(
        context!!, attrs, defStyle
    )

    override fun onTouchEvent(event: MotionEvent): Boolean {
        if (event.action == MotionEvent.ACTION_DOWN) ev = event
        return super.onTouchEvent(event)
    }

    override fun onScrollChanged(x: Int, y: Int, oldx: Int, oldy: Int) {
        super.onScrollChanged(x, y, oldx, oldy)
        if (sv != null && GetMax() != 0) {
            sv!!.y = this.height - sv!!.myBitmap.height * computeVerticalScrollOffset() / GetMax()
            sv!!.SetTimer()
        }
    }

    fun GetMax(): Int {
        return computeVerticalScrollRange() - computeVerticalScrollExtent()
    }
}