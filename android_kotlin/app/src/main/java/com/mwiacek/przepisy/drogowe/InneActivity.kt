package com.mwiacek.przepisy.drogowe

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.KeyEvent

class InneActivity : OneTabActivity(
    arrayOf(
        "nr.htm",
        "alkohol/alkoinfo.htm",
        "alkohol/alkolicz.htm",
        "kierruch.htm",
        "klima.htm",
        "oleje.htm",
        "opony/opony.htm",
        "prawko.htm",
        "",
        "speed/sp_licz.htm",
        "speed/sp_pom.htm",
        "adr/adr3.htm",
        "adr/adr2.htm",
        "adr/adr.htm",
        "linki.htm",
        "wyppoj.htm"
    )
) {
    override fun LoadFromIntent(): Boolean {
        if ((parent as PrzepisyDrogoweActivity).`in` != null) {
            val intentData = (parent as PrzepisyDrogoweActivity).`in`?.data
            if (intentData != null) {
                if (intentData.toString()[0] == 'u') {
                    textView?.setText(intentData.toString().substring(2))
                    (parent as PrzepisyDrogoweActivity).`in` = null
                    spinner?.setSelection(11, false)
                    return true
                }
            }
        }
        return false
    }

    override fun GetDisplayBytes() {
        if (spinner?.selectedItemPosition == 8) {
            val DisplayLines = StringBuilder()
            val TaryfikatorTitle = StringBuilder()
            DisplayLines.append("<html><head><meta name=\"viewport\" content=\"minimum-scale=0.1, initial-scale=1.0\"></head><body>")
            (parent as PrzepisyDrogoweActivity).p.ReadOpis(
                "d/d39",
                assets, DisplayLines, null, TaryfikatorTitle
            )
            DisplayLines.append("<table><tr><td bgcolor=grey><center><b>Taryfikator od 09.06.2012 - wybrane pozycje</b></center></td></tr>")
            MyActivity?.assets?.let {
                (parent as PrzepisyDrogoweActivity).p.ReadMyTaryfikator(
                    DisplayLines,
                    TaryfikatorTitle.toString(), it,
                    null, false
                )
            }
            DisplayLines.append("</table></body></html>")
            DisplayTotal = DisplayLines.toString()
        } else {
            super.GetDisplayBytes()
        }
    }

    public override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        MyActivity = this
        mSpinnerListaId = R.array.typyinne
        Db_Number_Of_Selection = PrzepisyDrogoweActivity.DB_INNE_ZAKLADKA
        Db_Size_Name = PrzepisyDrogoweActivity.DB_INNE_SIZE
        sp = (parent as PrzepisyDrogoweActivity).sp
        db = (parent as PrzepisyDrogoweActivity).db

        LayoutId = R.layout.inne
        setContentView(LayoutId)
        webView = findViewById(R.id.webView1)
        b1 = findViewById(R.id.button1l)
        b2 = findViewById(R.id.button1r)
        textView = findViewById(R.id.autoCompleteTextView1)
        spinner = findViewById(R.id.spinner1)
        scroller = findViewById(R.id.view1)
        onCreateTab()
    }

    override fun loadMyUrl(url: String): Boolean {
        if (url.contains("http")) {
            val intent = Intent(Intent.ACTION_VIEW)
            intent.data = Uri.parse(url)
            MyActivity?.startActivity(intent)
        } else {
            val j = MyActivity?.let {
                JavaScriptInterface(
                    it, null,
                    null, (parent as PrzepisyDrogoweActivity).p
                )
            }
            j?.s(
                url.replace("file:///android_asset/", ""), "",
                false
            )
        }
        return true
    }

    //Potrzebne przy szukaniu
    override fun onResume() {
        super.onResume()
        if ((parent as PrzepisyDrogoweActivity).`in` != null) {
            val intentData = (parent as PrzepisyDrogoweActivity).`in`?.data
            if (intentData != null) {
                if (intentData.toString()[0] == 'u') {
                    textView?.setText(intentData.toString().substring(2))
                    (parent as PrzepisyDrogoweActivity).`in` = null
                    if (spinner?.selectedItemPosition != 11) {
                        spinner?.setSelection(11)
                    } else {
                        textView?.dispatchKeyEvent(
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
}