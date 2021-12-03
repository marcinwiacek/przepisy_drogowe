package com.mwiacek.przepisy.drogowe

import android.annotation.SuppressLint
import android.app.Activity
import android.app.Dialog
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.preference.PreferenceManager
import android.view.*
import android.view.GestureDetector.SimpleOnGestureListener
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.TextView
import com.fasterxml.jackson.core.JsonFactory
import com.fasterxml.jackson.core.JsonToken
import java.io.IOException
import java.lang.reflect.InvocationTargetException
import java.lang.reflect.Method
import java.util.*

class JavaScriptInterface internal constructor(
    private val mContext: Activity,
    private var dialog: Dialog?,
    private val mURLList: List<String>?,
    private val p: PlikiClass
) {
    private var mCurrentURL: String? = null
    private var mToSearch: String? = null
    private var webView: ScrollerWebView? = null
    private var scroller: ScrollerView? = null
    private fun linie(
        link: String?,
        lines: StringBuilder,
        OpisTitle: StringBuilder,
        tosearch2: String?
    ) {
        if (link!!.startsWith("q")) {
            val lines2 = StringBuilder()
            val lines4 = StringBuilder()
            val prev = StringBuilder()
            var nr = 1
            try {
                val `is` = mContext.assets.open("kary/y.jso")
                val jp = JsonFactory().createParser(`is`)
                jp.nextToken()
                jp.nextToken()
                jp.nextToken()
                while (jp.nextToken() != JsonToken.END_ARRAY) {
                    jp.nextToken()
                    jp.nextToken()
                    //    				lines2.append("<tr bgcolor=grey><td id=sekcja"+nrsekcji+"><b>"+jp.getText()+"</b></td></tr>");
                    jp.nextToken()
                    jp.nextToken()
                    while (jp.nextToken() != JsonToken.END_ARRAY) {
                        jp.nextToken()
                        jp.nextToken()
                        if (nr == link.substring(1).toInt()) {
                            lines.append(jp.text + "<br>") //opis
                        }
                        jp.nextToken()
                        jp.nextToken()
                        lines2.delete(0, lines2.length)
                        prev.delete(0, prev.length)
                        while (jp.nextToken() != JsonToken.END_ARRAY) {
                            jp.nextToken()
                            jp.nextToken()
                            if (nr == link.substring(1).toInt()) {
                                if (prev.toString() == "20110524" && jp.text == "20101231") {
                                    prev.delete(0, prev.length)
                                    prev.append(jp.text)
                                    jp.nextToken()
                                    jp.nextToken()
                                } else {
                                    lines.append("<br>" + jp.text)
                                    prev.delete(0, prev.length)
                                    prev.append(jp.text)
                                    jp.nextToken()
                                    jp.nextToken()
                                    lines.append(": " + jp.text)
                                }
                                try {
                                    val is2 = mContext.assets.open(
                                        "kary/"
                                                + prev.toString() + ".jso"
                                    )
                                    jp.nextToken()
                                    jp.nextToken()
                                    if (jp.text == "k.w.") {
                                        lines.append("<br><div style='margin-left:30px'><b>USTAWA z dnia 20 maja 1971 r. Kodeks Wykroczeń</b></div>")
                                    } else {
                                        val jp2 = JsonFactory().createParser(is2)
                                        jp2.nextToken()
                                        jp2.nextToken()
                                        jp2.nextToken()
                                        while (jp2.nextToken() != JsonToken.END_ARRAY) {
                                            jp2.nextToken()
                                            jp2.nextToken()
                                            lines4.delete(0, lines4.length)
                                            lines4.append("<br><div style='margin-left:30px'>" + jp2.text + "<br><b>")
                                            jp2.nextToken()
                                            jp2.nextToken()
                                            lines4.append(jp2.text)
                                            jp2.nextToken()
                                            jp2.nextToken()
                                            if (jp2.text.indexOf(jp.text) == 0) {
                                                lines.append(
                                                    lines4.toString() + "; " + jp2.text.replace(
                                                        "\\Qc.p.g.\\E".toRegex(),
                                                        "USTAWY z dnia 13 września 1996 r. o utrzymaniu czystości i porządku w gminach"
                                                    ).replace(
                                                        "\\Qk.k.\\E".toRegex(),
                                                        "USTAWY z dnia 6 czerwca 1997 Kodeks Karny"
                                                    ).replace(
                                                        "\\Qk.w.\\E".toRegex(),
                                                        "USTAWY z dnia 20 maja 1971 r. Kodeks Wykroczeń"
                                                    ).replace(
                                                        "\\Qo.o.z.r.\\E".toRegex(),
                                                        "ROZPORZĄDZENIA MINISTRA TRANSPORTU z dnia 31 lipca 2007 r. w sprawie okresowych ograniczeń oraz zakazu ruchu niektórych rodzajów pojazdów na drogach"
                                                    ).replace(
                                                        "\\Qp.r.d.\\E".toRegex(),
                                                        "USTAWY z dnia 20 czerwca 1997 r. Prawo o ruchu drogowym (dostępna w zakładce \"Treść\")"
                                                    ).replace(
                                                        "\\Qu.d.p.\\E".toRegex(),
                                                        "USTAWY z dnia 21 marca 1985 r. o drogach publicznych"
                                                    ).replace(
                                                        "\\Qz.s.d.\\E".toRegex(),
                                                        "ROZPORZĄDZENIA MINISTRÓW INFRASTRUKTURY ORAZ SPRAW WEWNĘTRZNYCH I ADMINISTRACJI z dnia 31 lipca 2002 r. w sprawie znaków i sygnałów drogowych"
                                                    ).replace(
                                                        "\\Qu.t.d.\\E".toRegex(),
                                                        "USTAWY z dnia 6 września 2001 r. o transporcie drogowym"
                                                    ).replace(
                                                        "\\Qh.p.s.\\E".toRegex(),
                                                        "Rozporządzenia Parlamentu Europejskiego i Rady nr 561/2006 z dnia 15 marca 2006 r. w sprawie harmonizacji niektórych przepisów socjalnych odnoszących się do transportu drogowego oraz zmieniającego rozporządzenie Rady nr 3821/85 i 2135/98, jak również uchylającego rozporządzenie Rady nr 3820/85"
                                                    ).replace(
                                                        "\\Qaetr\\E".toRegex(),
                                                        "Umowy europejskiej dotyczącej pracy załóg pojazdów wykonujących międzynarodowe przewozy drogowe (AETR), sporządzonej w Genewie dnia 1 lipca 1970 r."
                                                    ).replace(
                                                        "\\Qr.u.j.\\E".toRegex(),
                                                        "Rozporządzenia Rady nr 3821/1985 z dnia 20 grudnia 1985 r. w sprawie urządzeń rejestrujących stosowanych w transporcie drogowym"
                                                    ).replace(
                                                        "\\Qu.s.t.c\\E".toRegex(),
                                                        "USTAWY z dnia 29 lipca 2005 r. o systemie tachografów cyfrowych"
                                                    ) + "</b></div>"
                                                )
                                                break
                                            }
                                            jp2.nextToken()
                                        }
                                        jp2.close()
                                    }
                                    is2.close()
                                } catch (ignore: IOException) {
                                }
                                jp.nextToken()
                            } else {
                                jp.nextToken()
                                jp.nextToken()
                                jp.nextToken()
                                jp.nextToken()
                                jp.nextToken()
                            }
                        }
                        nr++
                        jp.nextToken()
                    }
                    jp.nextToken()
                }
                jp.close()
                `is`.close()
            } catch (ignore: IOException) {
            }
            if (lines.length == 0) return
            OpisTitle.append("Historia zmian i podstawa prawna")
        } else {
            val TaryfikatorTitle = StringBuilder()
            if (tosearch2!!.length != 0) {
                val lines3 = StringBuilder()
                p.ReadOpis(link, mContext.assets, lines3, OpisTitle, TaryfikatorTitle)
                if (lines3.length == 0) return
                lines.append(
                    lines3.toString().replace(
                        tosearch2.toRegex(),
                        "<ins style='background-color:yellow'>$1</ins>"
                    )
                )
            } else {
                p.ReadOpis(link, mContext.assets, lines, OpisTitle, TaryfikatorTitle)
                if (lines.length == 0) return
            }
            if (TaryfikatorTitle.length != 0) {
                val lines2 = StringBuilder()
                p.ReadMyTaryfikator(
                    lines2, TaryfikatorTitle.toString(),
                    mContext.assets, null, false
                )
                if (lines2.length != 0) {
                    lines.append("<table width=100%><tr><td bgcolor=grey><b>Taryfikator od 09.06.2012 - wybrane pozycje</b></td></tr>$lines2</table>")
                }
            }
        }

//        lines.append("<script>function closeIt(){Android.q(window.pageYOffset);} window.onbeforeunload = closeIt;</script>");
        lines.append("<script>function closeIt(url){Android.q(url,window.pageYOffset);}</script>")
    }

    @SuppressLint("SetJavaScriptEnabled", "AddJavascriptInterface")
    fun s(link: String?, tos: String?, back: Boolean) {
        mToSearch = tos
        val lines = StringBuilder()
        val OpisTitle = StringBuilder()
        linie(link, lines, OpisTitle, mToSearch)
        if (lines.length == 0) return
        if (dialog == null) {
            dialog = object : Dialog(mContext) {
                private val mGestureDetector = GestureDetector(CustomGestureListener())
                override fun onPrepareOptionsMenu(menu: Menu): Boolean {
                    mHistoryURL.clear()
                    if (this.isShowing) {
                        try {
                            cancel()
                        } catch (ignore: Exception) {
                        }
                    }
                    return true
                }

                override fun onTouchEvent(event: MotionEvent): Boolean {
                    return mGestureDetector.onTouchEvent(event)
                }

                override fun dispatchTouchEvent(e: MotionEvent): Boolean {
                    super.dispatchTouchEvent(e)
                    return mGestureDetector.onTouchEvent(e)
                }

                override fun onBackPressed() {
                    if (mHistoryURL.size > 0) {
                        s(mHistoryURL[0][0], mToSearch, true)
                        return
                    }

                    //mHistoryURL.clear();
                    if (this.isShowing) {
                        try {
                            cancel()
                        } catch (ignore: Exception) {
                        }
                    }
                }
            }
            ((dialog as Dialog).findViewById<View>(android.R.id.title) as TextView).isSingleLine =
                false
            (dialog as Dialog).setContentView(R.layout.znaki2)
            (dialog as Dialog).setCancelable(true)
            val lp = WindowManager.LayoutParams()
            lp.copyFrom((dialog as Dialog).window!!.attributes)
            lp.gravity = Gravity.CENTER
            lp.width = WindowManager.LayoutParams.MATCH_PARENT
            lp.height = WindowManager.LayoutParams.WRAP_CONTENT
            (dialog as Dialog).window!!.attributes = lp
            webView = (dialog as Dialog).findViewById(R.id.webView4)
            scroller = (dialog as Dialog).findViewById(R.id.view37)
            scroller!!.webview = webView
            webView!!.sv = scroller
            scroller!!.layoutParams.width = scroller!!.myBitmap.width
            scroller!!.layoutParams = scroller!!.layoutParams
            webView!!.settings.javaScriptEnabled = true
            if (Build.VERSION.SDK_INT >= 19) {
                try {
                    val m: Method
                    m = webView!!.settings.javaClass.getMethod(
                        "setDisplayZoomControls",
                        Boolean::class.javaPrimitiveType
                    )
                    m.invoke(
                        webView!!.settings,
                        PreferenceManager.getDefaultSharedPreferences(mContext)
                            .getBoolean("Kontrolki", false)
                    )
                } catch (ignore: SecurityException) {
                } catch (ignore: NoSuchMethodException) {
                } catch (ignore: IllegalArgumentException) {
                } catch (ignore: IllegalAccessException) {
                } catch (ignore: InvocationTargetException) {
                }
            }
            webView!!.settings.useWideViewPort =
                PreferenceManager.getDefaultSharedPreferences(mContext)
                    .getBoolean("Zawijanie", false)
            webView!!.addJavascriptInterface(JavaScriptInterface3(), "Android")
            webView!!.settings.setSupportZoom(true)
            webView!!.settings.builtInZoomControls =
                PreferenceManager.getDefaultSharedPreferences(mContext).getBoolean("Wielkosc", true)
            webView!!.settings.cacheMode = WebSettings.LOAD_NO_CACHE
            webView!!.settings.setAppCacheEnabled(false)
            webView!!.webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView, url: String) {
                    super.onPageFinished(view, url)
                    if (mBackPressed) {
                        if (mHistoryURL.size > 0) {
                            view.loadUrl(
                                "javascript:window.scrollTo(0, "
                                        + mHistoryURL[0][1]!!.toInt() + ");"
                            )
                            mHistoryURL.removeAt(0)
                        }
                        mBackPressed = false
                    }
                }

                override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                    if (url.contains("http")) {
                        val intent = Intent(Intent.ACTION_VIEW)
                        intent.data = Uri.parse(url)
                        mContext.startActivity(intent)
                        return true
                    }
                    if (mCurrentURL == url.replace("file:///android_asset/", "")) return true
                    view.loadUrl("javascript:closeIt('$mCurrentURL');")
                    s(
                        url.replace("file:///android_asset/", ""),
                        mToSearch, false
                    )
                    return true
                }
            }
        }
        dialog!!.setTitle(OpisTitle)
        mBackPressed = back
        mCurrentURL = link
        scroller!!.Showed = false
        val scale = (100 * webView!!.scale).toInt()
        lines.insert(
            0,
            "<html><head><meta name=\"viewport\" content=\"minimum-scale=0.1, initial-scale=1.0\"></head><body>"
        )
        lines.append("</body></html>")
        webView!!.loadDataWithBaseURL(
            "file:///android_asset/", lines.toString(),
            "text/html", "utf-8", null
        )
        webView!!.setInitialScale(scale)
        if (!dialog!!.isShowing) {
            try {
                dialog!!.show()
            } catch (ignore: Exception) {
            }
        }
    }

    internal class JavaScriptInterface3 {
        @JavascriptInterface
        fun q(s: String?, y: Int) {
            val myarray = arrayOfNulls<String>(2)
            myarray[0] = s
            myarray[1] = Integer.toString(y)
            mHistoryURL.add(0, myarray)
        }
    }

    internal inner class CustomGestureListener : SimpleOnGestureListener() {
        override fun onFling(
            event1: MotionEvent,
            event2: MotionEvent,
            distanceX: Float,
            distanceY: Float
        ): Boolean {
            if (mURLList == null) return true
            if (event2.rawX - event1.rawX > 150
                && Math.abs(event2.rawY - event1.rawY) < 50
            ) {
                for (i in mURLList.indices) {
                    if (mCurrentURL == mURLList[i]) {
                        if (i == 0) {
                            s(mURLList[mURLList.size - 1], mToSearch, false)
                        } else {
                            s(mURLList[i - 1], mToSearch, false)
                        }
                        break
                    }
                }
            } else if (event2.rawX - event1.rawX < -150
                && Math.abs(event2.rawY - event1.rawY) < 50
            ) {
                for (i in mURLList.indices) {
                    if (mCurrentURL == mURLList[i]) {
                        if (i == mURLList.size - 1) {
                            s(mURLList[0], mToSearch, false)
                        } else {
                            s(mURLList[i + 1], mToSearch, false)
                        }
                        break
                    }
                }
            }
            return true
        }

        override fun onDown(event: MotionEvent): Boolean {
            return true
        }
    }

    companion object {
        private val mHistoryURL: MutableList<Array<String?>> = ArrayList()
        private var mBackPressed = false
    }
}