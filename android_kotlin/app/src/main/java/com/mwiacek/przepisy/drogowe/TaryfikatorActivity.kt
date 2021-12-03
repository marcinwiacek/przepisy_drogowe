package com.mwiacek.przepisy.drogowe

import android.content.Context
import android.graphics.Typeface
import android.os.Bundle
import android.view.KeyEvent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.TextView
import java.util.*

class TaryfikatorActivity : OneTabActivity(arrayOf()) {
    var al2 = ArrayList<CharSequence?>()
    override fun LoadFromIntent(): Boolean {
        if ((parent as PrzepisyDrogoweActivity).`in` != null) {
            val intentData = (parent as PrzepisyDrogoweActivity).`in`!!.data
            if (intentData != null) {
                if (intentData.toString()[0] == 't') {
                    textView!!.setText(intentData.toString().substring(2))
                    (parent as PrzepisyDrogoweActivity).`in` = null
                    if (spinner!!.selectedItemPosition != 0) {
                        spinner!!.setSelection(0)
                    } else {
                        textView!!.dispatchKeyEvent(
                            KeyEvent(
                                KeyEvent.ACTION_DOWN,
                                KeyEvent.KEYCODE_ENTER
                            )
                        )
                    }
                    return true
                }
            }
        }
        return false
    }

    override fun loadMyUrl(url: String): Boolean {
        val j = JavaScriptInterface(
            MyActivity!!, null,
            null, (parent as PrzepisyDrogoweActivity).p
        )
        j.s(
            url.replace("file:///android_asset/", ""), "",
            false
        )
        return true
    }

    override fun onSelected(i: Int, position: Int) {
        if (spinner!!.count > 5 &&
            spinner!!.selectedItemPosition < spinner!!.count - 4
        ) {
            val scroll = "window.scrollTo(0, " +
                    (if (position == -1) " document.getElementById('sekcja" + spinner!!.selectedItemPosition + "').offsetTop" else position) +
                    ");"
            if (webView!!.title != "wlasny") {
                DisplayIt(scroll)
            } else {
                webView!!.loadUrl("javascript:$scroll")
            }
        } else {
            DisplayIt(if (position == -1) "" else "window.scrollTo(0, $position);")
        }
    }

    override fun GetDisplayBytes() {
        var title = ""
        val DisplayLines = StringBuilder()
        if (spinner!!.selectedItemPosition == spinner!!.count - 4 &&
            spinner!!.count != 1
        ) {
            DisplayLines.append("<tr><td bgcolor=grey><b>Mandaty od 10.08.2017</b></td></tr>")
            (parent as PrzepisyDrogoweActivity).p.ReadTaryfikator2(
                DisplayLines,
                "kary/20170810.jso", textView!!.text.toString(), assets,
                al2, true
            )
            DisplayLines.append("<tr><td bgcolor=grey><b>Punkty od 09.06.2012</b></td></tr>")
            (parent as PrzepisyDrogoweActivity).p.ReadTaryfikator2(
                DisplayLines,
                "kary/20120609.jso", textView!!.text.toString(), assets,
                al2, true
            )
        } else if (spinner!!.selectedItemPosition == spinner!!.count - 3 &&
            spinner!!.count != 1
        ) {
            DisplayLines.append("<tr><td bgcolor=grey><b>Mandaty od 11.04.2015</b></td></tr>")
            (parent as PrzepisyDrogoweActivity).p.ReadTaryfikator2(
                DisplayLines,
                "kary/20150411.jso", textView!!.text.toString(), assets,
                al2, true
            )
            DisplayLines.append("<tr><td bgcolor=grey><b>Punkty od 09.06.2012</b></td></tr>")
            (parent as PrzepisyDrogoweActivity).p.ReadTaryfikator2(
                DisplayLines,
                "kary/20120609.jso", textView!!.text.toString(), assets,
                al2, true
            )
        } else if (spinner!!.selectedItemPosition == spinner!!.count - 2 &&
            spinner!!.count != 1
        ) {
            DisplayLines.append("<tr><td bgcolor=grey><b>Mandaty od 24.05.2011</b></td></tr>")
            (parent as PrzepisyDrogoweActivity).p.ReadTaryfikator2(
                DisplayLines,
                "kary/20110524.jso", textView!!.text.toString(), assets,
                al2, true
            )
            DisplayLines.append("<tr><td bgcolor=grey><b>Punkty od 09.06.2012</b></td></tr>")
            (parent as PrzepisyDrogoweActivity).p.ReadTaryfikator2(
                DisplayLines,
                "kary/20120609.jso", textView!!.text.toString(), assets,
                al2, true
            )
        } else if (spinner!!.selectedItemPosition == spinner!!.count - 1 &&
            spinner!!.count != 1
        ) {
            DisplayLines.append("<tr><td bgcolor=grey><b>Mandaty od 24.05.2011</b></td></tr>")
            (parent as PrzepisyDrogoweActivity).p.ReadTaryfikator2(
                DisplayLines,
                "kary/20110524.jso", textView!!.text.toString(), assets,
                al2, true
            )
            DisplayLines.append("<tr><td bgcolor=grey><b>Punkty 31.12.2010-08.06.2012</b></td></tr>")
            (parent as PrzepisyDrogoweActivity).p.ReadTaryfikator2(
                DisplayLines,
                "kary/20101231.jso", textView!!.text.toString(), assets,
                al2, true
            )
        } else {
            (parent as PrzepisyDrogoweActivity).p.ReadMyTaryfikator(
                DisplayLines,
                textView!!.text.toString(), assets, al2, true
            )
            title = "wlasny"
        }
        if (spinner!!.count == 1) {
            adapter1!!.clear()
            adapter1!!.add("Mandaty i pkt razem - opracowanie własne")
            for (x in al2.indices.reversed()) {
                adapter1!!.add(al2[x])
            }
            adapter1!!.add("Mandaty i pkt osobno - Rozporządzenia")
            adapter1!!.add("Mandaty i pkt osobno (11.04.2015-09.08.2017) - Rozporządzenia")
            adapter1!!.add("Mandaty i pkt osobno (09.06.2012-10.04.2015) - Rozporządzenia")
            adapter1!!.add("Mandaty i pkt osobno (24.05.2011-08.06.2012) - Rozporządzenia")
            adapter1!!.notifyDataSetChanged()
        }
        if (DisplayLines.length != 0) {
            DisplayLines.insert(
                0,
                "<html><head><meta name=\"viewport\" content=\"width=device-width, minimum-scale=0.1, initial-scale=1.0\">" +
                        "<title>" + title + "</title></head><body><table>"
            )
            DisplayLines.append("</table></body></html>")
        }
        DisplayTotal =
            if ((spinner!!.selectedItemPosition == spinner!!.count - 3 || spinner!!.selectedItemPosition == spinner!!.count - 2 || spinner!!.selectedItemPosition == spinner!!.count - 1)
                && spinner!!.count != 1
            ) {
                DisplayLines.toString()
                    .replace(
                        "\\Qc.p.g.\\E".toRegex(),
                        "USTAWY z dnia 13 września 1996 r. o utrzymaniu czystości i porządku w gminach"
                    )
                    .replace(
                        "\\Qk.k.\\E".toRegex(),
                        "USTAWY z dnia 6 czerwca 1997 Kodeks Karny"
                    )
                    .replace(
                        "\\Qk.w.\\E".toRegex(),
                        "USTAWY z dnia 20 maja 1971 r. Kodeks Wykroczeń"
                    )
                    .replace(
                        "\\Qo.o.z.r.\\E".toRegex(),
                        "ROZPORZĄDZENIA MINISTRA TRANSPORTU z dnia 31 lipca 2007 r. w sprawie okresowych ograniczeń oraz zakazu ruchu niektórych rodzajów pojazdów na drogach"
                    )
                    .replace(
                        "\\Qp.r.d.\\E".toRegex(),
                        "USTAWY z dnia 20 czerwca 1997 r. Prawo o ruchu drogowym (dostępna w zakładce \"Treść\")"
                    )
                    .replace(
                        "\\Qu.d.p.\\E".toRegex(),
                        "USTAWY z dnia 21 marca 1985 r. o drogach publicznych"
                    )
                    .replace(
                        "\\Qz.s.d.\\E".toRegex(),
                        "ROZPORZĄDZENIA MINISTRÓW INFRASTRUKTURY ORAZ SPRAW WEWNĘTRZNYCH I ADMINISTRACJI z dnia 31 lipca 2002 r. w sprawie znaków i sygnałów drogowych"
                    )
                    .replace(
                        "\\Qu.t.d.\\E".toRegex(),
                        "USTAWY z dnia 6 września 2001 r. o transporcie drogowym"
                    )
                    .replace(
                        "\\Qh.p.s.\\E".toRegex(),
                        "Rozporządzenia Parlamentu Europejskiego i Rady nr 561/2006 z dnia 15 marca 2006 r. w sprawie harmonizacji niektórych przepisów socjalnych odnoszących się do transportu drogowego oraz zmieniającego rozporządzenie Rady nr 3821/85 i 2135/98, jak również uchylającego rozporządzenie Rady nr 3820/85"
                    )
                    .replace(
                        "\\Qaetr\\E".toRegex(),
                        "Umowy europejskiej dotyczącej pracy załóg pojazdów wykonujących międzynarodowe przewozy drogowe (AETR), sporządzonej w Genewie dnia 1 lipca 1970 r."
                    )
                    .replace(
                        "\\Qr.u.j.\\E".toRegex(),
                        "Rozporządzenia Rady nr 3821/1985 z dnia 20 grudnia 1985 r. w sprawie urządzeń rejestrujących stosowanych w transporcie drogowym"
                    ).replace(
                        "\\Qu.s.t.c\\E".toRegex(),
                        "USTAWY z dnia 29 lipca 2005 r. o systemie tachografów cyfrowych"
                    )
            } else {
                DisplayLines.toString()
            }
    }

    override val myAdapter: ArrayAdapter<CharSequence>
        get() = MyCustomArrayAdapter<CharSequence>(
            this,
            ArrayList<CharSequence>(
                Arrays.asList(
                    *resources.getStringArray(
                        R.array.taryfikator1
                    )
                )
            )
        )

    public override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        MyActivity = this
        Db_Number_Of_Selection = ""
        Db_Size_Name = PrzepisyDrogoweActivity.DB_TARYFIKATOR_SIZE
        sp = (parent as PrzepisyDrogoweActivity).sp
        db = (parent as PrzepisyDrogoweActivity).db
        LayoutId = R.layout.taryfikator
        setContentView(LayoutId)
        webView = findViewById(R.id.webView2)
        b1 = findViewById(R.id.button2l)
        b2 = findViewById(R.id.button2r)
        textView = findViewById(R.id.autoCompleteTextView2)
        spinner = findViewById(R.id.spinner2)
        scroller = findViewById(R.id.view2)
        internalSearch = false
        onCreateTab()
    }

    //Potrzebne przy szukaniu
    override fun onResume() {
        super.onResume()
        if ((parent as PrzepisyDrogoweActivity).`in` != null) {
            val intentData = (parent as PrzepisyDrogoweActivity).`in`!!.data
            if (intentData != null) {
                if (intentData.toString()[0] == 't') {
                    textView!!.setText(intentData.toString().substring(2))
                    (parent as PrzepisyDrogoweActivity).`in` = null
                    if (spinner!!.selectedItemPosition != 0) {
                        spinner!!.setSelection(0)
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
            text.setTypeface(
                null,
                if (text.text.toString().indexOf("Mandaty") != 0) Typeface.NORMAL else Typeface.BOLD
            )
            text.isSingleLine = false
            return view
        }
    }
}