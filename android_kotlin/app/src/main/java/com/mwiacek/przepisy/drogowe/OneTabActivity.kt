package com.mwiacek.przepisy.drogowe

import android.annotation.SuppressLint
import android.app.Activity
import android.app.ProgressDialog
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.res.Configuration
import android.graphics.Color
import android.graphics.Typeface
import android.net.Uri
import android.os.Build
import android.os.SystemClock
import android.view.*
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.*
import android.widget.AdapterView.OnItemSelectedListener
import java.io.IOException
import java.lang.reflect.InvocationTargetException
import java.lang.reflect.Method
import java.util.*

//Shared between Straz and Przepisy
//1.0
abstract class OneTabActivity(
    var fileNames: Array<String>
) : Activity() {
    var MyActivity: Activity? = null
    var Db_Number_Of_Selection: String? = null
    var Db_Size_Name: String? = null
    var db: DBClass? = null
    var sp: SharedPreferences? = null
    var textView: AutoCompleteTextView? = null
    var webView: ScrollerWebView? = null
    var b1: Button? = null
    var b2: Button? = null
    var spinner: Spinner? = null
    var scroller: ScrollerView? = null


    var mHistory = ArrayList<ArrayList<String>>()
    var adapter: ArrayAdapter<String>? = null

    @JvmField
    var adapter1: ArrayAdapter<CharSequence>? = null

    @JvmField
    var progressDialog: ProgressDialog? = null

    @JvmField
    var firstLoad = true
    var Kontrolki = false
    var Zawijanie = false

    @JvmField
    var internalSearch = true

    @JvmField
    var DisplayTotal: String? = null
    var mSpinnerListaId = 0
    var SearchCurr = 0
    var SearchNum = 0

    @JvmField
    var LayoutId = 0
    var oldSpinner = 0
    var backPressed = false

    @JvmField
    var Sp_Black_Name = ""

    protected open fun LoadFromIntent(): Boolean {
        return false
    }

    protected fun readFile(name: String?) {
        DisplayTotal = try {
            val stream = assets.open(name!!)
            val DisplayTotal0 = ByteArray(stream.available())
            stream.read(DisplayTotal0, 0, DisplayTotal0.size)
            stream.close()
            String(DisplayTotal0, 0, DisplayTotal0.size)
        } catch (ignore: IOException) {
            ""
        }
    }

    protected open fun GetDisplayBytes() {
        DisplayTotal = ""
        if (spinner!!.selectedItemPosition < fileNames.size) {
            readFile(fileNames[spinner!!.selectedItemPosition])
        }
    }

    override fun onBackPressed() {
        if (mHistory.size > 0) {
            backPressed = true
            spinner!!.setSelection(mHistory[0][1].toInt())
            onSelected(mHistory[0][1].toInt(), mHistory[0][0].toInt())
            mHistory.removeAt(0)
            return
        }
        super.onBackPressed()
    }

    override fun onDestroy() {
        db!!.SetSetting(Db_Size_Name!!, Integer.toString((100 * webView!!.scale).toInt()))
        super.onDestroy()
    }

    fun DisplayIt(scroll: String) {
        if (progressDialog != null) return
        progressDialog = ProgressDialog.show(this, "", "Odświeżanie", true, false)
        GetDisplayBytes()
        if (!firstLoad) {
            MyActivity!!.runOnUiThread {
                webView!!.dispatchTouchEvent(
                    MotionEvent.obtain(
                        SystemClock.uptimeMillis(),
                        SystemClock.uptimeMillis(),
                        MotionEvent.ACTION_DOWN,
                        0.0.toFloat(),
                        0.0.toFloat(),
                        0
                    )
                )
                webView!!.dispatchTouchEvent(
                    MotionEvent.obtain(
                        SystemClock.uptimeMillis(),
                        SystemClock.uptimeMillis(),
                        MotionEvent.ACTION_UP,
                        0.0.toFloat(),
                        0.0.toFloat(),
                        0
                    )
                )
            }
        }
        Thread {
            scroller!!.Showed = false
            MyActivity!!.runOnUiThread {
                val scale = (100 * webView!!.scale).toInt()
                if (Build.VERSION.SDK_INT >= 19) {
                    Kontrolki = sp!!.getBoolean("Kontrolki", false)
                    try {
                        val m = webView!!.settings.javaClass.getMethod(
                            "setDisplayZoomControls",
                            Boolean::class.javaPrimitiveType
                        )
                        m.invoke(webView!!.settings, Kontrolki)
                    } catch (ignore: SecurityException) {
                    } catch (ignore: NoSuchMethodException) {
                    } catch (ignore: IllegalArgumentException) {
                    } catch (ignore: IllegalAccessException) {
                    } catch (ignore: InvocationTargetException) {
                    }
                }
                Zawijanie = sp!!.getBoolean("Zawijanie", false)
                webView!!.settings.useWideViewPort = Zawijanie
                if (textView!!.length() != 0 && internalSearch) {
                    DisplayTotal = DisplayTotal!!.replace(
                        ("(?![^<]+>)((?i:\\Q"
                                + textView!!.text.toString()
                            .replace("\\E", "\\E\\\\E\\Q")
                            .replace("a", "\\E[aąĄ]\\Q")
                            .replace("c", "\\E[cćĆ]\\Q")
                            .replace("e", "\\E[eęĘ]\\Q")
                            .replace("l", "\\E[lłŁ]\\Q")
                            .replace("n", "\\E[nńŃ]\\Q")
                            .replace("o", "\\E[oóÓ]\\Q")
                            .replace("s", "\\E[sśŚ]\\Q")
                            .replace("z", "\\E[zźżŻŹ]\\Q")
                                + "\\E))").toRegex(),
                        "<ins style='background-color:yellow'>$1</ins>"
                    )
                }
                var black = ""
                if (!Sp_Black_Name.isEmpty()) {
                    if (sp!!.getBoolean(Sp_Black_Name, false)) {
                        webView!!.setBackgroundColor(Color.BLACK)
                        black = "lustro();"
                    } else {
                        webView!!.setBackgroundColor(Color.WHITE)
                        black = "normalnie();"
                    }
                }
                webView!!.loadDataWithBaseURL(
                    "file:///android_asset/",
                    DisplayTotal!!.replace(
                        "</body>",
                        ("<script>function lustro() {document.body.style.background='black';document.body.style.color='white'; for (var i = 0; i < document.links.length; ++i) {document.links[i].style.color='#00FFFF';}}" +
                                "function normalnie() {document.body.style.background='white';document.body.style.color='black'; ; for (var i = 0; i < document.links.length; ++i) {document.links[i].style.color='blue';}}" +
                                "function GetY (object) {if (!object) {return 0;} else {return object.offsetTop+GetY(object.offsetParent);}}" +
                                "function closeIt(oldspinner){Android.q(oldspinner,window.pageYOffset);}" +
                                "links = document.getElementsByTagName(\"a\"); for (i = 0; i < links.length; i++){" +
                                "href = links[i].getAttribute(\"href\");" +
                                "if (href!=null && href.indexOf(\"#\") >= 0) {" +
                                "links[i].addEventListener(\"click\", function() {" +
                                "closeIt(-1);});}};     " +
                                scroll + " " + black + "</script></body>")
                    ),
                    "text/html", null, null
                )
                DisplayTotal = null
                if (sp!!.getBoolean("Wielkosc2", true)) {
                    if (firstLoad) {
                        if (db!!.GetSetting((Db_Size_Name)!!, "") != "") {
                            webView!!.setInitialScale(db!!.GetSetting((Db_Size_Name)!!, "").toInt())
                        }
                    } else {
                        webView!!.setInitialScale(scale)
                    }
                }
            }
        }.start()
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        if (progressDialog != null) {
            if (progressDialog!!.isShowing) {
                try {
                    progressDialog!!.cancel()
                } catch (ignore: Exception) {
                }
            }
            progressDialog = null
            if (!Db_Number_Of_Selection!!.isEmpty()) {
                db!!.SetSetting(
                    Db_Number_Of_Selection!!,
                    Integer.toString(spinner!!.selectedItemPosition)
                )
            }
        }
    }

    open fun setBlack() {}
    open fun onSelected(i: Int, position: Int) {
        DisplayIt("")
    }

    @SuppressLint("SetJavaScriptEnabled", "AddJavascriptInterface")
    fun onCreateTab() {
        val params = scroller!!.layoutParams
        params.width = scroller!!.myBitmap.width
        scroller!!.layoutParams = params
        scroller!!.webview = webView
        webView!!.sv = scroller
        webView!!.settings.cacheMode = WebSettings.LOAD_NO_CACHE
        webView!!.settings.setAppCacheEnabled(false)
        webView!!.settings.setRenderPriority(WebSettings.RenderPriority.HIGH)
        webView!!.settings.setSupportZoom(true)
        webView!!.settings.builtInZoomControls = sp!!.getBoolean("Wielkosc", true)
        setBlack()
        webView!!.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView, url: String) {
                super.onPageFinished(view, url)
                firstLoad = false
                if (b1 != null) b1!!.isEnabled = false
                if (textView!!.length() != 0) {
                    webView!!.loadUrl(
                        "javascript:Android.ShowToast(document.getElementsByTagName('ins').length);"
                    )
                } else {
                    if (b2 != null) b2!!.isEnabled = false
                    webView!!.loadUrl("javascript:Android.ShowToast0();")
                }
            }

            override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                //Toast.makeText(MyActivity, "URL", Toast.LENGTH_SHORT).show();
                return if ((webView!!.ev!!.x.toDouble() != 0.0) || (webView!!.ev!!.y.toDouble() != 0.0) || (
                            webView!!.ev!!.downTime != webView!!.ev!!.eventTime)
                ) {
                    loadMyUrl(url)
                } else true
            }
        }
        webView!!.settings.javaScriptEnabled = true
        webView!!.addJavascriptInterface(ThisJavaScriptInterface(), "Android")
        if (Build.VERSION.SDK_INT > 10) {
            webView!!.setOnLongClickListener {
                if (parent.findViewById<View>(android.R.id.tabs).visibility == View.GONE) {
                    spinner!!.performLongClick()
                    return@setOnLongClickListener true
                }
                false
            }
        }
        adapter1 = myAdapter
        adapter1!!.setDropDownViewResource(R.layout.sspinner)
        spinner!!.adapter = adapter1


        // onSelected(0);
        spinner!!.onItemSelectedListener = object : OnItemSelectedListener {
            override fun onItemSelected(adapterView: AdapterView<*>?, view: View, i: Int, l: Long) {
                if (backPressed) {
                    backPressed = false
                } else {
                    webView!!.loadUrl("javascript:closeIt($oldSpinner);")
                    oldSpinner = i
                    onSelected(i, -1)
                }
            }

            override fun onNothingSelected(adapterView: AdapterView<*>?) {}
        }
        if (!LoadFromIntent() && !Db_Number_Of_Selection!!.isEmpty()) {
            spinner!!.setSelection(
                db!!.GetSetting(
                    Db_Number_Of_Selection!!, "0"
                ).toInt(), false
            )
        }
        if (Build.VERSION.SDK_INT > 10) {
            spinner!!.setOnLongClickListener { v: View? ->
                val popup = PopupMenu(this, v)
                val inflater = popup.menuInflater
                inflater.inflate(R.menu.menu, popup.menu)
                parent.onPrepareOptionsMenu(popup.menu)
                popup.show()
                popup.setOnMenuItemClickListener { item: MenuItem? ->
                    parent.onOptionsItemSelected(
                        (item)!!
                    )
                }
                false
            }
        }
        adapter = ArrayAdapter(this, R.layout.tip_item, Tips)
        textView!!.setAdapter(adapter)
        textView!!.setImeActionLabel("Szukaj", KeyEvent.KEYCODE_ENTER)
        textView!!.setOnKeyListener { _: View?, keyCode: Int, event: KeyEvent ->
            if (event.action == KeyEvent.ACTION_DOWN && keyCode == KeyEvent.KEYCODE_ENTER) {
                DisplayIt("")
                return@setOnKeyListener true
            }
            false
        }
        if (b1 != null) {
            b1!!.setOnClickListener { v: View ->
                SearchCurr--
                webView!!.loadUrl("javascript:window.scrollTo(0, GetY (document.getElementsByTagName('ins').item(" + (SearchCurr - 1) + ")));")
                if (SearchCurr == 1) v.isEnabled = false
                b2!!.isEnabled = true
            }
        }
        if (b2 != null) {
            b2!!.setOnClickListener { v: View ->
                SearchCurr++
                webView!!.loadUrl("javascript:window.scrollTo(0, GetY (document.getElementsByTagName('ins').item(" + (SearchCurr - 1) + ")));")
                b1!!.isEnabled = SearchCurr != 1
                if (SearchCurr == SearchNum) v.isEnabled = false
            }
        }
    }

    open val myAdapter: ArrayAdapter<CharSequence>?
        get() = CustomArrayAdapter(
            this,
            ArrayList(Arrays.asList(*resources.getStringArray(mSpinnerListaId)))
        )

    open fun loadMyUrl(url: String): Boolean {
        if (url.contains("http")) {
            val intent = Intent(Intent.ACTION_VIEW)
            intent.data = Uri.parse(url)
            MyActivity!!.startActivity(intent)
            return true
        }
        webView!!.loadUrl("javascript:closeIt($oldSpinner);")
        return false
    }

    override fun onResume() {
        super.onResume()
        webView!!.settings.builtInZoomControls = sp!!.getBoolean("Wielkosc", true)
        if (Build.VERSION.SDK_INT >= 19) {
            Kontrolki = sp!!.getBoolean("Kontrolki", false)
            try {
                val m: Method
                m = webView!!.settings.javaClass.getMethod(
                    "setDisplayZoomControls",
                    Boolean::class.javaPrimitiveType
                )
                m.invoke(webView!!.settings, Kontrolki)
            } catch (ignore: SecurityException) {
            } catch (ignore: NoSuchMethodException) {
            } catch (ignore: IllegalArgumentException) {
            } catch (ignore: IllegalAccessException) {
            } catch (ignore: InvocationTargetException) {
            }
        }
        Zawijanie = sp!!.getBoolean("Zawijanie", false)
        webView!!.settings.useWideViewPort = Zawijanie
        if (sp!!.getBoolean("No_Lock", false)) {
            parent.window.addFlags(
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                        WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
                        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            )
        } else {
            parent.window.clearFlags(
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                        WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
                        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            )
        }
    }

    internal inner class ThisJavaScriptInterface {
        @JavascriptInterface
        fun q(old: Int, y: Int) {
            val myarray = ArrayList<String>(2)
            myarray.add(Integer.toString(y))
            myarray.add(Integer.toString(if (old == -1) spinner!!.selectedItemPosition else old))
            if (old == -1) oldSpinner = spinner!!.selectedItemPosition
            mHistory.add(0, myarray)
        }

        @JavascriptInterface
        fun ShowToast0() {
            if (progressDialog != null) {
                if (progressDialog!!.isShowing) {
                    try {
                        progressDialog!!.cancel()
                    } catch (ignore: Exception) {
                    }
                }
                progressDialog = null
                if (!Db_Number_Of_Selection!!.isEmpty()) {
                    db!!.SetSetting(
                        Db_Number_Of_Selection!!,
                        Integer.toString(spinner!!.selectedItemPosition)
                    )
                }
            }
        }

        @JavascriptInterface
        fun ShowToast(Numberr: Int) {
            SearchNum = Numberr
            SearchCurr = 0
            Toast.makeText(MyActivity, "Ilość wyników: $SearchNum", Toast.LENGTH_SHORT).show()
            if (b2 != null) {
                MyActivity!!.runOnUiThread { b2!!.isEnabled = SearchNum > 0 }
            }
            ShowToast0()
        }
    }

    internal inner class CustomArrayAdapter<T>(ctx: Context?, objects: ArrayList<T>?) :
        ArrayAdapter<T>(
            ctx!!, android.R.layout.simple_spinner_item, objects!!
        ) {
        override fun getDropDownView(position: Int, convert: View?, parent: ViewGroup): View {
            var convertView: View? = convert
            if (convertView == null) {
                val vi = getSystemService(LAYOUT_INFLATER_SERVICE) as LayoutInflater
                convertView = vi.inflate(android.R.layout.simple_spinner_dropdown_item, null)
            }
            val view = super.getView(position, convertView, parent)
            val text = view.findViewById<TextView>(android.R.id.text1)
            text.setTypeface(null, Typeface.NORMAL)
            text.isSingleLine = false
            return view
        }
    }

    companion object {
        private val Tips = arrayOf(
            "zakręt", "ostrzegawcze", "zakaz"
        )
    }
}