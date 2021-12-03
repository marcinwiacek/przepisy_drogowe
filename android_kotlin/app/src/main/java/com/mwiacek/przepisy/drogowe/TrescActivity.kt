package com.mwiacek.przepisy.drogowe

import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.KeyEvent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.TextView
import java.util.*

class TrescActivity : OneTabActivity(
    arrayOf()
) {
    var iloscWPDR = 40
    var iloscwUKP = 20
    override fun LoadFromIntent(): Boolean {
        if ((parent as PrzepisyDrogoweActivity).`in` != null) {
            val intentData = (parent as PrzepisyDrogoweActivity).`in`!!.data
            if (intentData != null) {
                if (intentData.toString()[0] == 'k') {
                    textView!!.setText(intentData.toString().substring(1))
                    (parent as PrzepisyDrogoweActivity).`in` = null
                    spinner!!.setSelection(0, false) //kodeks
                    return true
                }
                if (intentData.toString()[0] == 'i') {
                    textView!!.setText(intentData.toString().substring(1))
                    (parent as PrzepisyDrogoweActivity).`in` = null
                    spinner!!.setSelection(iloscWPDR + 1, false) //ust. o kier. poj.
                    return true
                }
            }
        }
        return false
    }

    override fun onResume() {
        super.onResume()
        if ((parent as PrzepisyDrogoweActivity).sp!!.getBoolean("Czarne_tlo_tresc", false)) {
            webView!!.setBackgroundColor(Color.BLACK)
            webView!!.loadUrl("javascript:lustro();")
        } else {
            webView!!.setBackgroundColor(Color.WHITE)
            webView!!.loadUrl("javascript:normalnie();")
        }
        if ((parent as PrzepisyDrogoweActivity).`in` != null) {
            val intentData = (parent as PrzepisyDrogoweActivity).`in`!!.data
            if (intentData != null) {
                if (intentData.toString()[0] == 'k') {
                    textView!!.setText(intentData.toString().substring(1))
                    (parent as PrzepisyDrogoweActivity).`in` = null
                    if (spinner!!.selectedItemPosition != 0) {
                        spinner!!.setSelection(0) //kodeks
                    } else {
                        textView!!.dispatchKeyEvent(
                            KeyEvent(
                                KeyEvent.ACTION_DOWN,
                                KeyEvent.KEYCODE_ENTER
                            )
                        )
                    }
                }
                if (intentData.toString()[0] == 'i') {
                    textView!!.setText(intentData.toString().substring(1))
                    (parent as PrzepisyDrogoweActivity).`in` = null
                    if (spinner!!.selectedItemPosition != iloscWPDR + 1) {
                        spinner!!.setSelection(iloscWPDR + 1) //UKP
                    } else {
                        textView!!.dispatchKeyEvent(
                            KeyEvent(
                                KeyEvent.ACTION_DOWN,
                                KeyEvent.KEYCODE_ENTER
                            )
                        )
                    }
                }
            }
        }
    }

    override fun onSelected(i: Int, position: Int) {
        //prd
        if (i >= 0 && i < iloscWPDR + 1) {
            val scroll = "window.scrollTo(0, " +
                    (if (position == -1) " document.getElementById('bok$i').offsetTop" else position) +
                    ");"
            if (firstLoad || webView!!.title != "prd") {
                DisplayIt(scroll)
                return
            }
            webView!!.loadUrl("javascript:$scroll")
            return
        }
        //ukp
        if (i > iloscWPDR && i < iloscWPDR + iloscwUKP + 2) {
            val scroll = "window.scrollTo(0, " +
                    (if (position == -1) " document.getElementById('bok" + (i - iloscWPDR - 1) + "').offsetTop" else position) +
                    ");"
            if (webView!!.title != "ukp") {
                DisplayIt(scroll)
                return
            }
            webView!!.loadUrl("javascript:$scroll")
            return
        }
        val scroll = if (position == -1) "" else "window.scrollTo(0, $position);"
        DisplayIt(scroll)
    }

    override fun setBlack() {
        webView!!.setBackgroundColor(
            if ((parent as PrzepisyDrogoweActivity).sp!!.getBoolean(
                    "Czarne_tlo_tresc",
                    false
                )
            ) Color.BLACK else Color.WHITE
        )
    }

    override fun GetDisplayBytes() {
        DisplayTotal = ""
        if (spinner!!.selectedItemPosition >= 0
            && spinner!!.selectedItemPosition <= iloscWPDR
        ) {
            readFile("tekst/kodeks.htm")
        } else if (spinner!!.selectedItemPosition > iloscWPDR
            && spinner!!.selectedItemPosition < iloscWPDR + iloscwUKP + 2
        ) {
            readFile("tekst/kierpoj.htm")
        } else if (spinner!!.selectedItemPosition == iloscWPDR + iloscwUKP + 2) {
            readFile("tekst/rozp2012.htm")
        } else {
            readFile("tekst/rozp2002.htm")
        }
    }

    override val myAdapter: ArrayAdapter<CharSequence>
        get() = MyCustomArrayAdapter<CharSequence>(
            this,
            ArrayList<CharSequence>(
                Arrays.asList(
                    *resources.getStringArray(
                        R.array.typyaktowprawnych
                    )
                )
            )
        )

    public override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        MyActivity = this
        Db_Number_Of_Selection = ""
        Db_Size_Name = PrzepisyDrogoweActivity.DB_TRESC_SIZE
        Sp_Black_Name = "Czarne_tlo_tresc"
        sp = (parent as PrzepisyDrogoweActivity).sp
        db = (parent as PrzepisyDrogoweActivity).db
        LayoutId = R.layout.tresc
        setContentView(LayoutId)
        webView = findViewById(R.id.webView3)
        b1 = findViewById(R.id.button3l)
        b2 = findViewById(R.id.button3r)
        textView = findViewById(R.id.autoCompleteTextView3)
        spinner = findViewById(R.id.spinner3)
        scroller = findViewById(R.id.view3)
        onCreateTab()
    }

    internal inner class MyCustomArrayAdapter<T>(ctx: Context?, objects: ArrayList<T>?) :
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
            if (text.text.toString().indexOf("Rozp. ") == 0 || text.text.toString()
                    .indexOf("Prawo o ruchu") == 0 || text.text.toString()
                    .indexOf("Ustawa o ") == 0 || text.text.toString().indexOf("Stare ") == 0
            ) {
                text.setTypeface(null, Typeface.BOLD)
            } else {
                text.setTypeface(null, Typeface.NORMAL)
            }
            text.isSingleLine = false
            return view
        }
    }
}