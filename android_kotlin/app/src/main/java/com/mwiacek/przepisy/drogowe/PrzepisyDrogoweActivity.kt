package com.mwiacek.przepisy.drogowe

import android.app.Activity
import android.app.AlertDialog
import android.app.Dialog
import android.app.TabActivity
import android.content.DialogInterface
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.ActivityInfo
import android.content.pm.PackageManager
import android.graphics.Paint
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.CountDownTimer
import android.preference.PreferenceManager
import android.view.*
import android.webkit.WebSettings
import android.widget.PopupMenu
import android.widget.TabHost.TabSpec
import android.widget.TextView
import android.widget.Toast
import java.util.*

class PrzepisyDrogoweActivity : TabActivity() {
    //ostatni 27
    val MyActivity5: Activity = this

    @JvmField
    var `in`: Intent? = null

    @JvmField
    var db: DBClass? = null

    @JvmField
    var p = PlikiClass()

    @JvmField
    var sp: SharedPreferences? = null
    var ad: AlertDialog? = null
    fun ShowUpdateInfo2() {
        if (!sp!!.getBoolean("Notka_Start2", false)) {
            return
        }
        val D2 = Date()
        if (D2.compareTo(Date(121, 5, 1)) > 0) {
            Toast.makeText(
                MyActivity5,
                "1.6.2021 - Usunięcie prędkości 60km/h, zmiana pierwszeństwa i obowiązków pieszych",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(121, 2, 13)) > 0) {
            Toast.makeText(
                MyActivity5,
                "13.03.2021 - Zmiana znaku B-19, E-15a - E-15d, usunięcie znaków E-15e - E-15h",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(119, 7, 13)) > 0) {
            Toast.makeText(MyActivity5, "13.08.2019 - Znaki D-51a i D-51b", Toast.LENGTH_LONG)
                .show()
            return
        }
        if (D2.compareTo(Date(118, 7, 29)) > 0) {
            Toast.makeText(
                MyActivity5,
                "29.08.2018 - Znaki D-54 i D-55 i drobne poprawki innych znaków",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(118, 7, 6)) > 0) {
            Toast.makeText(
                MyActivity5,
                "06.08.2018 - Zmiany dotyczące znaków rowerowych (wycofanie znaków R-2 i R-2a)",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(117, 5, 30)) > 0) {
            Toast.makeText(
                MyActivity5,
                "30.06.2017 - Znak P-24 na powierzchni niebieskiej (inne zmiany w trakcie opracowywania)",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(116, 4, 24)) > 0) {
            Toast.makeText(MyActivity5, "24.05.2016 - Nowy znak E-15h", Toast.LENGTH_LONG).show()
            return
        }
        if (D2.compareTo(Date(116, 0, 4)) > 0) {
            Toast.makeText(
                MyActivity5,
                "04.01.2016 - Część ustawy o kierujących pojazdami i zmiany na podst. Ustawy z dnia 23 października 2013 r. o zmianie ustawy – Prawo o ruchu drogowym oraz niektórych innych ustaw",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(115, 9, 7)) > 0) {
            Toast.makeText(
                MyActivity5,
                "07.10.2015 - Nowe znaki E-15f, E-15g, P-26, P-27, S01a, S03a i zmiany przy innych znakach",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(115, 4, 18)) > 0) {
            Toast.makeText(
                MyActivity5,
                "18.05.2015 - przepisy Ustawy z dnia 20 marca 2015 (zatrzymywanie prawa jazdy na 3 miesiące, itp.)",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(115, 4, 15)) > 0) {
            Toast.makeText(
                MyActivity5,
                "15.05.2015 - przepisy Ustawy z dnia 9 kwietnia 2015 (m.in. foteliki samochodowe)",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(115, 3, 11)) > 0) {
            Toast.makeText(
                MyActivity5,
                "11.04.2015 - zmiany wysokości niektórych grzywien",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(115, 0, 1)) > 0) {
            Toast.makeText(
                MyActivity5,
                "01.01.2015 - zmiany wynikające z Ustawy z 26 czerwca 2014",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(114, 9, 24)) > 0) {
            Toast.makeText(
                MyActivity5,
                "24.10.2014 - zmiany wynikające z Ustawy z 26 czerwca 2014",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(114, 7, 30)) > 0) {
            Toast.makeText(
                MyActivity5,
                "30.08.2014 - nowe przepisy dotyczące noszenia elementów odblaskowych przez pieszych",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(114, 7, 23)) > 0) {
            Toast.makeText(
                MyActivity5,
                "23.08.2014 - zmiany wynikające z Ustawy z 26 czerwca 2014 (m.in. kierowanie niektórymi motocyklami z kat. B)",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(114, 6, 1)) > 0) {
            Toast.makeText(
                MyActivity5,
                "01.07.2014 - Zmiany na podst. Ustawy z dnia 23 października 2013 r. o zmianie ustawy – Prawo o ruchu drogowym oraz niektórych innych ustaw",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(114, 5, 29)) > 0) {
            Toast.makeText(
                MyActivity5,
                "29.06.2014 - Tracą legalność stacjonarne urządzenia rejestrujące bez obudów spełniających obecne warunki techniczne (np. 'nieoklejone na żółto')",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(114, 4, 9)) > 0) {
            Toast.makeText(
                MyActivity5,
                "09.05.2014 - M.in. dodanie obowiązku zapisu przebiegu w systemach (Ustawa z 4 kwietnia 2014)",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(114, 3, 29)) > 0) {
            Toast.makeText(
                MyActivity5,
                "29.04.2014 - M.in. utworzenie Krajowego Punktu Kontaktowego (Ustawa z 14 marca 2014)",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(114, 1, 14)) > 0) {
            Toast.makeText(
                MyActivity5,
                "14.02.2014 - Zmiany nazw znaków D-44 i D-45 (dot. płatnego parkowania)",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(114, 0, 19)) > 0) {
            Toast.makeText(
                MyActivity5,
                "19.01.2014 - Art. 110 ustawy o kierujących pojazdami",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(114, 0, 1)) > 0) {
            Toast.makeText(
                MyActivity5,
                "01.01.2014 - Zmiany na podst. Ustawy z dnia 8 listopada 2013 r. o zmianie ustawy – Prawo o ruchu drogowym oraz ustawy o dozorze technicznym",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(113, 7, 13)) > 0) {
            Toast.makeText(
                MyActivity5,
                "13.08.2013 - Zmiany dotyczące znaków rowerowych",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(113, 6, 7)) > 0) {
            Toast.makeText(
                MyActivity5,
                "07.07.2013 - Dodanie ust. 4a w art. 51 ustawy o kierujących pojazdami",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(113, 5, 21)) > 0) {
            Toast.makeText(
                MyActivity5,
                "21.06.2013 - Zmiany na podstawie Ustawy z dnia 10 października 2012 r. o zmianie ustawy – Prawo o ruchu drogowym oraz niektórych innych ustaw",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(113, 5, 20)) > 0) {
            Toast.makeText(
                MyActivity5,
                "20.06.2013 - Zmiany na podstawie Ustawy z dnia 24 maja 2013 r. o zmianie ustawy o kierujących pojazdami oraz niektórych innych ustaw",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(113, 0, 19)) > 0) {
            Toast.makeText(
                MyActivity5,
                "19.01.2013 - Część ustawy o kierujących pojazdami (wchodzi w życie oraz zmienia Kodeks Drogowy)",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(113, 0, 1)) > 0) {
            Toast.makeText(
                MyActivity5,
                "01.01.2013 - Zmiana art. 140d pkt 4 Kodeksu Drogowego",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(112, 9, 19)) > 0) {
            Toast.makeText(
                MyActivity5,
                "19.10.2012 - część ustawy z dnia 18.08.2011 o zmianie ustawy — Prawo o ruchu drogowym oraz niektórych innych ustaw",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(112, 5, 9)) > 0) {
            Toast.makeText(
                MyActivity5,
                "09.06.2012 - ROZPORZĄDZENIE z dnia 25 kwietnia 2012 r. w sprawie postępowania z kierowcami naruszającymi przepisy ruchu drogowego (nowy taryfikator punktów)",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(112, 4, 31)) > 0) {
            Toast.makeText(
                MyActivity5,
                "31.05.2012 - Część ustawy z dnia 13 kwietnia 2012 r. o zmianie ustawy o drogach publicznych oraz niektórych innych ustaw (zmienia Kodeks Drogowy)",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(112, 1, 25)) > 0) {
            Toast.makeText(
                MyActivity5,
                "25.02.2012 - art. 125 pkt 9 ustawy o kierujących pojazdami (zmienia Kodeks Drogowy)",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(112, 1, 11)) > 0) {
            Toast.makeText(
                MyActivity5,
                "11.02.2012 - Część ustawy o zmianie ustawy o ubezpieczeniach obowiązkowych oraz Ustawy z dnia 13.01.2012 r. o zmianie ustawy o kierujących pojazdami oraz ustawy – Prawo o ruchu drogowym... (zmieniają Kodeks Drogowy)",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(112, 1, 10)) > 0) {
            Toast.makeText(
                MyActivity5,
                "10.02.2012 - Część Ustawy z dnia 13.01.2012 r. o zmianie ustawy o kierujących pojazdami oraz ustawy – Prawo o ruchu drogowym",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(112, 0, 19)) > 0) {
            Toast.makeText(
                MyActivity5,
                "19.01.2012 - część ustawy z dnia 18.08.2011 o zmianie ustawy — Prawo o ruchu drogowym oraz niektórych innych ustaw",
                Toast.LENGTH_LONG
            ).show()
            return
        }
        if (D2.compareTo(Date(112, 0, 1)) > 0) {
            Toast.makeText(
                MyActivity5,
                "01.01.2012 - ustawa o zmianie ustawy o transporcie drogowym, ustawa o bezpieczeństwie osób przebywających na obszarach wodnych, ustawa o przewozie towarów niebezpiecznych (zmieniają Kodeks Drogowy)",
                Toast.LENGTH_LONG
            ).show()
            return
        }
    }

    override fun onResume() {
        super.onResume()
        requestedOrientation = if (sp!!.getBoolean(
                "Obrot",
                false
            )
        ) ActivityInfo.SCREEN_ORIENTATION_SENSOR else ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
    }

    public override fun onCreate(savedInstanceState: Bundle?) {
        sp = PreferenceManager.getDefaultSharedPreferences(this)
        if (sp!!.getString("wyglad", "")!!.length == 0) {
            setTheme(android.R.style.Theme)
            val editor1 = sp!!.edit()
            editor1.putString("wyglad", "pusty")
            editor1.commit()
        } else if (sp!!.getString("wyglad", "") == "pusty") {
            setTheme(android.R.style.Theme)
        } else if (sp!!.getString("wyglad", "") == "pusty2") {
            setTheme(android.R.style.Theme_Black)
        } else if (sp!!.getString("wyglad", "") == "holo") {
            setTheme(android.R.style.Theme_Holo)
        } else if (sp!!.getString("wyglad", "") == "holo2") {
            setTheme(android.R.style.Theme_Holo_Light)
        } else if (sp!!.getString("wyglad", "") == "domyslnyurzadzenie") {
            setTheme(android.R.style.Theme_DeviceDefault)
        } else if (sp!!.getString("wyglad", "") == "domyslnyurzadzenie2") {
            setTheme(android.R.style.Theme_DeviceDefault_Light)
        } else if (sp!!.getString("wyglad", "") == "light") {
            setTheme(android.R.style.Theme_Light)
        } else if (sp!!.getString("wyglad", "") == "material") {
            setTheme(android.R.style.Theme_Material)
        } else if (sp!!.getString("wyglad", "") == "material_light") {
            setTheme(android.R.style.Theme_Material_Light)
        } else if (sp!!.getString("wyglad", "") == "translucent") {
            setTheme(android.R.style.Theme_Translucent)
        }
        window.requestFeature(Window.FEATURE_NO_TITLE)
        super.onCreate(savedInstanceState)
        if (!sp!!.getBoolean("Obrot", false)) {
            requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        }
        if (sp!!.getBoolean("No_Lock", false)) {
            window.addFlags(
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                        WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
                        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            )
        } else {
            window.clearFlags(
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                        WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
                        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            )
        }
        db = DBClass(this)
        if (db!!.GetSetting(DB_NR_WERSJI, "0") == "0" && Build.VERSION.SDK_INT >= 19) {
            val editor = sp!!.edit()
            editor.putBoolean("Zawijanie", true)
            editor.commit()
        }
        val p = Paint()
        val h =
            (p.measureText("Marcin") * applicationContext.resources.displayMetrics.density).toInt()
        setContentView(R.layout.main)
        `in` = intent
        val tabHost = tabHost
        var spec: TabSpec?
        var intent: Intent
        intent = Intent().setClass(this, InneActivity::class.java)
        spec = tabHost.newTabSpec("inne").setIndicator("Inne", null).setContent(intent)
        tabHost.addTab(spec)
        intent = Intent().setClass(this, TaryfikatorActivity::class.java)
        spec =
            tabHost.newTabSpec("taryfikator").setIndicator("Taryfikator", null).setContent(intent)
        tabHost.addTab(spec)
        intent = Intent().setClass(this, TrescActivity::class.java)
        spec = tabHost.newTabSpec("tresc").setIndicator("Treść", null).setContent(intent)
        tabHost.addTab(spec)
        intent = Intent().setClass(this, ZnakiActivity::class.java)
        spec = tabHost.newTabSpec("znaki").setIndicator("Na drodze", null).setContent(intent)
        tabHost.addTab(spec)
        for (i in 0..3) {
            tabHost.tabWidget.getChildAt(i).layoutParams.height = h
            tabHost.tabWidget.getChildAt(i).layoutParams.width = ViewGroup.LayoutParams.WRAP_CONTENT
        }
        if (Build.VERSION.SDK_INT > 10) {
            tabHost.tabWidget.setOnLongClickListener { view: View? ->
                val popup = PopupMenu(this, view)
                val inflater = popup.menuInflater
                inflater.inflate(R.menu.menu, popup.menu)
                onPrepareOptionsMenu(popup.menu)
                popup.show()
                popup.setOnMenuItemClickListener { item: MenuItem -> onOptionsItemSelected(item) }
                false
            }
        }
        tabHost.currentTab = if (db!!.GetSetting(DB_TABHOST, "3") == "4") 3 else db!!.GetSetting(
            DB_TABHOST, "3"
        ).toInt()
        try {
            if (db!!.GetSetting(DB_NR_WERSJI, "0") != packageManager.getPackageInfo(
                    packageName, 0
                ).versionName
            ) {
                ad = AlertDialog.Builder(this).create()
                ad!!.setCancelable(false)
                // ad.setMessage("Aplikacja została uaktualniona, używając jej zgadzasz się na to, że autor nie ponosi żadnej odpowiedzialności z tytułu jej używania przez Ciebie, w razie znalezienia błędów prośba o kontakt (np. przez \"Kontakt email\")\n\nAplikacja nie uwzględnia np. Ustawy o transporcie drogowym, możesz przyspieszyć jej rozwój składając datek.");
                // ad.setMessage("Na chwilę obecną aplikacja nie uwzględnia np. Ustawy o transporcie drogowym i nie zawiera aktualnych danych, prace nad uaktualnieniem trwają, jeżeli chcesz się dołączyć, prośba o kontakt (np. przez \"Kontakt email\").\n\nUżywając aplikacji zgadzasz się na to, że autor nie ponosi żadnej odpowiedzialności z tytułu jej używania.");
                ad!!.setMessage("Aplikacja dostępna z kodem na GitHub. Nie uwzględnia np. Ustawy o transporcie drogowym. Jeżeli chcesz się dołączyć, prośba o kontakt (np. przez \"Kontakt email\").\n\nUżywając aplikacji zgadzasz się na to, że autor nie ponosi żadnej odpowiedzialności z tytułu jej używania.")
                ad!!.setButton(
                    DialogInterface.BUTTON_POSITIVE,
                    "OK (00:07)",
                    DialogInterface.OnClickListener { dialog: DialogInterface, _: Int -> dialog.dismiss() })
                ad!!.setButton(
                    DialogInterface.BUTTON_NEGATIVE,
                    "Info o wydaniu",
                    { _: DialogInterface?, which: Int ->
                        val intent1 = Intent(Intent.ACTION_VIEW)
                        intent1.data =
                            Uri.parse("https://www.salon24.pl/u/techracja/1175547,przepisy-drogowe-1-48")
                        MyActivity5.startActivity(intent1)
                    })
                ad!!.show()
                ad!!.getButton(DialogInterface.BUTTON_POSITIVE).isEnabled = false
                object : CountDownTimer(7000, 1000) {
                    override fun onTick(millisUntilFinished: Long) {
                        ad!!.getButton(DialogInterface.BUTTON_POSITIVE).text =
                            "OK (00:0" + millisUntilFinished / 1000 + ")"
                    }

                    override fun onFinish() {
                        ad!!.getButton(DialogInterface.BUTTON_POSITIVE).text = "OK"
                        ad!!.getButton(DialogInterface.BUTTON_POSITIVE).isEnabled = true
                    }
                }.start()
                db!!.SetSetting(
                    DB_NR_WERSJI, packageManager.getPackageInfo(
                        packageName, 0
                    ).versionName
                )
            }
        } catch (ignore: PackageManager.NameNotFoundException) {
        }
        handleIntent(getIntent())
    }

    override fun onNewIntent(intent: Intent) {
        setIntent(intent)
        `in` = intent
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent) {
        val tabHost = tabHost
        val intentData = intent.data
        if (intentData != null) {
            when (intentData.toString()[0]) {
                'u' -> tabHost.currentTab = 0
                't' -> tabHost.currentTab = 1
                'k', 'i' -> tabHost.currentTab = 2
                'z' -> tabHost.currentTab = 3
            }
            ShowUpdateInfo2()
        } else {
            if (Intent.ACTION_SEARCH == intent.action) {
                val alertDialog = AlertDialog.Builder(this).create()
                alertDialog.setTitle("Informacja")
                alertDialog.setMessage("Aplikacja reaguje tylko na wybór podpowiedzi")
                alertDialog.show()
            } else {
                ShowUpdateInfo2()
            }
        }
    }

    override fun onDestroy() {
        db!!.SetSetting(
            DB_TABHOST, Integer.toString(
                tabHost.currentTab
            )
        )
        super.onDestroy()
        if (db != null) {
            db!!.close()
        }
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        val inflater = menuInflater
        inflater.inflate(R.menu.menu, menu)
        return true
    }

    override fun onPrepareOptionsMenu(menu: Menu): Boolean {
        menu.getItem(1).isEnabled = sp!!.getBoolean("Kodeks_szukanie", true) ||
                sp!!.getBoolean("Taryfikator_szukanie", true) ||
                sp!!.getBoolean("Znaki_szukanie", true) ||
                sp!!.getBoolean("KodyUN_szukanie", true) ||
                sp!!.getBoolean("KierPoj_szukanie", true)
        return true
    }

    fun SetSearchVisibility(setting: String?, vararg fields: Int) {
        val sett: String
        sett = db!!.GetSetting(setting!!, "true")
        db!!.SetSetting(setting, if ("true" == sett) "false" else "true")
        SetControlVisibility(if ("false" == sett) View.VISIBLE else View.GONE, *fields)
    }

    fun SetControlVisibility(state: Int, vararg fields: Int) {
        for (i in fields) {
            var found = false
            for (x in 0 until tabHost.tabContentView.childCount) {
                if (tabHost.tabContentView.getChildAt(x)
                        .findViewById<View?>(i) != null
                ) {
                    tabHost.tabContentView.getChildAt(x)
                        .findViewById<View>(i).visibility = state
                    found = true
                }
            }
            if (!found) {
                Toast.makeText(
                    MyActivity5, "Błąd zmiany statusu kontrolki " +
                            baseContext.resources.getResourceEntryName(i), Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.about -> {
                ShowAbout()
                true
            }
            R.id.sett -> {
                ShowSett()
                true
            }
            R.id.szukaj -> {
                onSearchRequested()
                true
            }
            R.id.szukanie -> {
                when (tabHost.currentTab) {
                    0 -> SetSearchVisibility(
                        DB_INNE_SZUKANIE,
                        R.id.button1r, R.id.button1l, R.id.autoCompleteTextView1
                    )
                    1 -> SetSearchVisibility(
                        DB_TARYFIKATOR_SZUKANIE,
                        R.id.button2r, R.id.button2l, R.id.autoCompleteTextView2
                    )
                    2 -> SetSearchVisibility(
                        DB_TRESC_SZUKANIE,
                        R.id.button3r, R.id.button3l, R.id.autoCompleteTextView3
                    )
                    3 -> SetSearchVisibility(
                        DB_ZNAKI_SZUKANIE,
                        R.id.checkBox4, R.id.autoCompleteTextView4
                    )
                    else -> {
                    }
                }
                true
            }
            R.id.full -> {
                val show =
                    if (findViewById<View>(android.R.id.tabs).visibility == View.VISIBLE) View.GONE else View.VISIBLE
                when (tabHost.currentTab) {
                    0 -> {
                        SetControlVisibility(
                            if (show == View.GONE) show else if (db!!.GetSetting(
                                    DB_INNE_SZUKANIE,
                                    "true"
                                ) === "true"
                            ) View.VISIBLE else View.GONE,
                            R.id.button1r, R.id.button1l,
                            R.id.autoCompleteTextView1
                        )
                        SetControlVisibility(show, R.id.spinner1)
                    }
                    1 -> {
                        SetControlVisibility(
                            if (show == View.GONE) show else if (db!!.GetSetting(
                                    DB_TARYFIKATOR_SZUKANIE,
                                    "true"
                                ) === "true"
                            ) View.VISIBLE else View.GONE,
                            R.id.button2r, R.id.button2l,
                            R.id.autoCompleteTextView2
                        )
                        SetControlVisibility(show, R.id.spinner2)
                    }
                    2 -> {
                        SetControlVisibility(
                            if (show == View.GONE) show else if (db!!.GetSetting(
                                    DB_TRESC_SZUKANIE,
                                    "true"
                                ) === "true"
                            ) View.VISIBLE else View.GONE,
                            R.id.button3r, R.id.button3l,
                            R.id.autoCompleteTextView3
                        )
                        SetControlVisibility(show, R.id.spinner3)
                    }
                    3 -> {
                        SetControlVisibility(
                            if (show == View.GONE) show else if (db!!.GetSetting(
                                    DB_ZNAKI_SZUKANIE,
                                    "true"
                                ) === "true"
                            ) View.VISIBLE else View.GONE,
                            R.id.checkBox4, R.id.autoCompleteTextView4
                        )
                        SetControlVisibility(show, R.id.spinner4)
                    }
                    else -> {
                    }
                }
                findViewById<View>(android.R.id.tabs).visibility = show
                true
            }
            R.id.report -> {
                val emailIntent = Intent(Intent.ACTION_SEND)
                var subject = ""
                try {
                    subject = ("Przepisy drogowe "
                            + packageManager.getPackageInfo(packageName, 0).versionName
                            + " / Android " + Build.VERSION.RELEASE)
                } catch (ignore: Exception) {
                }
                val extra = arrayOf("marcin@mwiacek.com")
                emailIntent.putExtra(Intent.EXTRA_EMAIL, extra)
                emailIntent.putExtra(Intent.EXTRA_SUBJECT, subject)
                emailIntent.type = "message/rfc822"
                try {
                    startActivity(emailIntent)
                } catch (e: Exception) {
                    val alertDialog: AlertDialog
                    alertDialog = AlertDialog.Builder(this).create()
                    alertDialog.setTitle("Informacja")
                    alertDialog.setMessage("Błąd stworzenia maila")
                    alertDialog.show()
                }
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    fun ShowAbout() {
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.znaki2)
        dialog.setCancelable(true)
        val lp = WindowManager.LayoutParams()
        lp.copyFrom(dialog.window!!.attributes)
        lp.gravity = Gravity.CENTER
        lp.width = WindowManager.LayoutParams.MATCH_PARENT
        lp.height = WindowManager.LayoutParams.WRAP_CONTENT
        dialog.window!!.attributes = lp
        val webview: ScrollerWebView = dialog.findViewById(R.id.webView4)
        val scroller: ScrollerView = dialog.findViewById(R.id.view37)
        scroller.webview = webview
        webview.sv = scroller
        val params = scroller.layoutParams
        params.width = scroller.myBitmap.width
        scroller.layoutParams = params
        try {
            dialog.setTitle(
                "Przepisy drogowe "
                        + packageManager.getPackageInfo(packageName, 0).versionName
            )
        } catch (ignore: Exception) {
        }
        val title = dialog.findViewById<TextView>(android.R.id.title)
        title.isSingleLine = false
        webview.isHorizontalScrollBarEnabled = false
        webview.settings.cacheMode = WebSettings.LOAD_NO_CACHE
        webview.settings.setAppCacheEnabled(false)
        webview.loadUrl("file:///android_asset/about.htm")
        dialog.show()
    }

    fun ShowSett() {
        val intent = Intent(MyActivity5, PreferencesActivity::class.java)
        intent.putExtra("wyglad", sp!!.getString("wyglad", ""))
        startActivityForResult(intent, 0)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent) {
        if (requestCode == 0 && resultCode == RESULT_OK) {
            if (sp!!.getString("wyglad", "") != data.getStringExtra("wyglad")) {
                MyActivity5.finish()
                MyActivity5.startActivity(Intent(MyActivity5, MyActivity5.javaClass))
            }
        }
    }

    companion object {
        const val DB_TABHOST = "3" //nr zakladki
        const val DB_ZNAKI_SIZE = "4" //wielkosc w zakladce znaki
        const val DB_TRESC_SIZE = "7" //wielkosc w zakladce tresc
        const val DB_INNE_SIZE = "19" //wielkosc w zakladce inne
        const val DB_TARYFIKATOR_SIZE = "20" //wielkosc w zakladce taryfikator
        const val DB_NR_WERSJI = "21" //nr wersji aplikacji
        const val DB_ZNAKI_ZAKLADKA = "22"
        const val DB_INNE_ZAKLADKA = "23"
        const val DB_INNE_SZUKANIE = "24"
        const val DB_TARYFIKATOR_SZUKANIE = "25"
        const val DB_TRESC_SZUKANIE = "26"
        const val DB_ZNAKI_SZUKANIE = "27"
    }
}