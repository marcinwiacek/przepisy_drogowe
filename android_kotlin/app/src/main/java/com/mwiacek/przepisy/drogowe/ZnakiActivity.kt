package com.mwiacek.przepisy.drogowe

import android.content.Context
import android.graphics.Typeface
import android.os.Bundle
import android.view.KeyEvent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.CheckBox
import android.widget.CompoundButton
import android.widget.TextView
import java.io.IOException
import java.io.InputStream
import java.io.InputStreamReader
import java.util.*

class ZnakiActivity : OneTabActivity(arrayOf()) {
    var checkbox: CheckBox? = null
    var Lista: MutableList<String> = ArrayList()
    override fun LoadFromIntent(): Boolean {
        val intentData = (parent as PrzepisyDrogoweActivity).`in`!!.data
        if (intentData != null) {
            if (intentData.toString()[0] == 'z') {
                textView!!.setText(intentData.toString().substring(2))
                (parent as PrzepisyDrogoweActivity).`in` = null
                spinner!!.setSelection(15, false)
                return true
            }
        }
        return false
    }

    override fun onResume() {
        super.onResume()
        if ((parent as PrzepisyDrogoweActivity).`in` != null) {
            val intentData = (parent as PrzepisyDrogoweActivity).`in`!!.data
            if (intentData != null) {
                if (intentData.toString()[0] == 'z') {
                    textView!!.setText(intentData.toString().substring(2))
                    spinner!!.setSelection(15)
                    checkbox!!.isChecked = false
                    (parent as PrzepisyDrogoweActivity).`in` = null
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

    override fun GetDisplayBytes() {
        var inputreader: InputStreamReader
        var stream: InputStream
        val bytes = CharArray(10000)
        var numRead = 0
        val start: Int
        val end: Int
        var mpz: Int
        val lines2 = StringBuilder()
        val DisplayLines: StringBuilder
        val tosearch: String
        tosearch = if (textView!!.length() == 0) {
            ""
        } else {
            "(?![^<]+>)((?i:\\Q" + textView!!.text.toString()
                .replace("\\E", "\\E\\\\E\\Q")
                .replace("a", "\\E[aąĄ]\\Q")
                .replace("c", "\\E[cćĆ]\\Q")
                .replace("e", "\\E[eęĘ]\\Q")
                .replace("l", "\\E[lłŁ]\\Q")
                .replace("n", "\\E[nńŃ]\\Q")
                .replace("o", "\\E[oóÓ]\\Q")
                .replace("s", "\\E[sśŚ]\\Q")
                .replace("z", "\\E[zźżŻŹ]\\Q") + "\\E))"
        }
        DisplayLines = StringBuilder()
        if (spinner!!.selectedItemPosition == 15) {
            start = 0
            end = 14
        } else {
            start = spinner!!.selectedItemPosition
            end = spinner!!.selectedItemPosition
        }
        Lista.clear()
        DisplayLines.delete(0, DisplayLines.length)
        if (checkbox!!.isChecked) {
            for (z in start..end) {
                val l: Int = (parent as PrzepisyDrogoweActivity).p.znaki[z].size
                for (j in 0 until l) {
                    try {
                        stream =
                            assets.open((parent as PrzepisyDrogoweActivity).p.znaki[z][j] + ".htm")
                        inputreader = InputStreamReader(stream)
                        lines2.delete(0, lines2.length)
                        while (inputreader.read(bytes, 0, 10000).also { numRead = it } >= 0) {
                            lines2.append(bytes, 0, numRead)
                        }
                        stream.close()
                        if (tosearch.length != 0) {
                            if (!lines2.toString().replaceFirst(tosearch.toRegex(), "<mark>")
                                    .contains("<mark>")
                            ) continue
                        }
                        DisplayLines.append(
                            "<tr><td width=40%><a href=" + (parent as PrzepisyDrogoweActivity).p.znaki[z][j] + "><img src=" + (parent as PrzepisyDrogoweActivity).p.znaki[z][j] + ".png style='margin:2px;max-width:100%'></a>" +
                                    "</td><td><a href=" + (parent as PrzepisyDrogoweActivity).p.znaki[z][j] + ">"
                        )
                        mpz = lines2.indexOf("\n")
                        DisplayLines.append(
                            "<b>" + lines2.subSequence(
                                mpz + 1,
                                lines2.indexOf("\n", mpz + 1)
                            ) + "</b> " +
                                    lines2.subSequence(0, mpz) + "</a></td></tr>"
                        )
                        Lista.add((parent as PrzepisyDrogoweActivity).p.znaki[z][j])
                    } catch (ignore: IOException) {
                    }
                }
            }
            if (DisplayLines.length != 0) {
                DisplayLines.insert(
                    0,
                    "<html><head><meta name=\"viewport\" content=\"width=device-width, minimum-scale=1.0, initial-scale=1.0\"></head><body><table>"
                )
                DisplayLines.append("</table>")
            }
        } else {
            DisplayLines.append("<html><head><meta name=\"viewport\" content=\"width=device-width, minimum-scale=0.4, initial-scale=0.4\"></head><body>")
            val summary2 = StringBuilder()
            for (z in start..end) {
                summary2.delete(0, summary2.length)
                val l: Int = (parent as PrzepisyDrogoweActivity).p.znaki[z].size
                for (j in 0 until l) {
                    try {
                        if (textView!!.length() != 0) {
                            stream =
                                assets.open((parent as PrzepisyDrogoweActivity).p.znaki[z][j] + ".htm")
                            inputreader = InputStreamReader(stream)
                            lines2.delete(0, lines2.length)
                            while (inputreader.read(bytes, 0, 10000).also { numRead = it } >= 0) {
                                lines2.append(bytes, 0, numRead)
                            }
                            stream.close()
                            if (tosearch.length != 0) {
                                if (!lines2.toString().replaceFirst(tosearch.toRegex(), "<mark>")
                                        .contains("<mark>")
                                ) continue
                            }
                        }
                        summary2.append("<a href=" + (parent as PrzepisyDrogoweActivity).p.znaki[z][j] + "><img src=" + (parent as PrzepisyDrogoweActivity).p.znaki[z][j] + ".png style='margin:2px;max-width:100%'></a>")
                        Lista.add((parent as PrzepisyDrogoweActivity).p.znaki[z][j])
                    } catch (ignore: IOException) {
                    }
                }
                if (summary2.length != 0) {
                    DisplayLines.append("<div width=100%><center>$summary2</center></div>")
                }
            }
        }
        if (firstLoad) {
            DisplayLines.append("<br><div style='display:none'>")
            for (z in 6..13) {
                for (j in 0 until (parent as PrzepisyDrogoweActivity).p.znaki[z].size) {
                    DisplayLines.append("<img src=" + (parent as PrzepisyDrogoweActivity).p.znaki[z][j] + ".png>")
                }
            }
            DisplayLines.append("</div>")
        }
        DisplayLines.append("</body></html>")
        DisplayTotal = DisplayLines.toString()
    }

    public override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        MyActivity = this
        Db_Number_Of_Selection = PrzepisyDrogoweActivity.DB_ZNAKI_ZAKLADKA
        Db_Size_Name = PrzepisyDrogoweActivity.DB_ZNAKI_SIZE
        sp = (parent as PrzepisyDrogoweActivity).sp
        db = (parent as PrzepisyDrogoweActivity).db
        LayoutId = R.layout.znaki
        setContentView(LayoutId)
        webView = findViewById(R.id.webView4)
        b1 = null
        b2 = null
        textView = findViewById(R.id.autoCompleteTextView4)
        spinner = findViewById(R.id.spinner4)
        scroller = findViewById(R.id.view4)
        checkbox = findViewById(R.id.checkBox4)
        checkbox!!.setOnCheckedChangeListener { _: CompoundButton?, _: Boolean ->
            DisplayIt(
                ""
            )
        }
        onCreateTab()
    }

    override fun loadMyUrl(url: String): Boolean {
        val j = JavaScriptInterface(
            MyActivity!!,
            null, Lista, (parent as PrzepisyDrogoweActivity).p
        )
        if (textView!!.length() != 0) {
            j.s(
                url.replace("file:///android_asset/", ""),
                "(?![^<]+>)((?i:\\Q" + textView!!.text.toString()
                    .replace("\\E", "\\E\\\\E\\Q")
                    .replace("a", "\\E[aąĄ]\\Q")
                    .replace("c", "\\E[cćĆ]\\Q")
                    .replace("e", "\\E[eęĘ]\\Q")
                    .replace("l", "\\E[lłŁ]\\Q")
                    .replace("n", "\\E[nńŃ]\\Q")
                    .replace("o", "\\E[oóÓ]\\Q")
                    .replace("s", "\\E[sśŚ]\\Q")
                    .replace("z", "\\E[zźżŻŹ]\\Q") + "\\E))",
                false
            )
        } else {
            j.s(url.replace("file:///android_asset/", ""), "", false)
        }
        return true
    }

    override val myAdapter: ArrayAdapter<CharSequence>
        get() = MyCustomArrayAdapter<CharSequence>(
            this,
            ArrayList<CharSequence>(
                Arrays.asList(
                    *resources.getStringArray(
                        R.array.typyznakow
                    )
                )
            )
        )

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
                if (text.text.toString()
                        .indexOf("Wszystkie") == 0
                ) Typeface.BOLD else Typeface.NORMAL
            )
            text.isSingleLine = false
            return view
        }
    }
}