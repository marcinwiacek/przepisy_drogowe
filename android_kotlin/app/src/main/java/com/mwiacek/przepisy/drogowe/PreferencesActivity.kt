package com.mwiacek.przepisy.drogowe

import android.app.Activity
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.ActivityInfo
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.preference.ListPreference
import android.preference.Preference
import android.preference.Preference.OnPreferenceChangeListener
import android.preference.Preference.OnPreferenceClickListener
import android.preference.PreferenceActivity
import android.preference.PreferenceManager
import java.util.*

class PreferencesActivity : PreferenceActivity() {
    val MyActivity5: Activity = this
    var listItems: MutableList<String> = ArrayList()
    var listItems2: MutableList<String> = ArrayList()
    override fun onCreate(savedInstanceState: Bundle?) {
        if (PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "")!!.length == 0
            || PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "") == "pusty"
        ) {
            setTheme(android.R.style.Theme)
        } else if (PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "") == "pusty2"
        ) {
            setTheme(android.R.style.Theme_Black)
        } else if (PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "") == "holo"
        ) {
            setTheme(android.R.style.Theme_Holo)
        } else if (PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "") == "holo2"
        ) {
            setTheme(android.R.style.Theme_Holo_Light)
        } else if (PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "") == "domyslnyurzadzenie"
        ) {
            setTheme(android.R.style.Theme_DeviceDefault)
        } else if (PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "") == "domyslnyurzadzenie2"
        ) {
            setTheme(android.R.style.Theme_DeviceDefault_Light)
        } else if (PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "") == "light"
        ) {
            setTheme(android.R.style.Theme_Light)
        } else if (PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "") == "material"
        ) {
            setTheme(android.R.style.Theme_Material)
        } else if (PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "") == "material_light"
        ) {
            setTheme(android.R.style.Theme_Material_Light)
        } else if (PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "") == "translucent"
        ) {
            setTheme(android.R.style.Theme_Translucent)
        }
        super.onCreate(savedInstanceState)
        addPreferencesFromResource(R.xml.sett2)
        try {
            val manager = packageManager
            val info = manager.getPackageInfo(packageName, 0)
            title = "Przepisy drogowe " + info.versionName
        } catch (ignore: Exception) {
        }
        val intent = Intent()
        intent.putExtra(
            "wyglad", PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "")
        )
        setResult(RESULT_OK, intent)
        listItems.add("Android 2.x")
        listItems2.add("pusty")
        listItems.add("Android 2.x (czarny)")
        listItems2.add("pusty2")
        listItems.add("Lekki (przestarzały)")
        listItems2.add("light")
        listItems.add("translucent")
        listItems2.add("translucent")
        if (Build.VERSION.SDK_INT > 10) {
            listItems.add("Holo (przestarzały)")
            listItems2.add("holo")
            listItems.add("Holo jasny (przestarzały)")
            listItems2.add("holo2")
        }
        if (Build.VERSION.SDK_INT > 13) {
            listItems.add("producenta")
            listItems2.add("domyslnyurzadzenie")
            listItems.add("producenta (jasny)")
            listItems2.add("domyslnyurzadzenie2")
        }
        if (Build.VERSION.SDK_INT > 20) {
            listItems.add("material (przestarzały)")
            listItems2.add("material")
            listItems.add("material_light (przestarzały)")
            listItems2.add("material_light")
        }
        val customPref2 = findPreference("wyglad") as ListPreference
        customPref2.entries = listItems.toTypedArray<CharSequence>()
        customPref2.entryValues = listItems2.toTypedArray<CharSequence>()
        val it1: Iterator<String>
        val it2: Iterator<String>
        it1 = listItems.iterator()
        it2 = listItems2.iterator()
        while (it1.hasNext()) {
            if (it2.next() == PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                    .getString("wyglad", "")
            ) {
                customPref2.summary = "Wybrany wygląd: " + it1.next()
                break
            } else {
                it1.next()
            }
        }
        customPref2.onPreferenceChangeListener =
            OnPreferenceChangeListener { preference: Preference, newValue: Any ->
                if (newValue != PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                        .getString("wyglad", "")
                ) {
                    MyActivity5.finish()
                    MyActivity5.startActivity(Intent(MyActivity5, MyActivity5.javaClass))
                }
                val it3: Iterator<String>
                val it4: Iterator<String>
                it3 = listItems.iterator()
                it4 = listItems2.iterator()
                while (it3.hasNext()) {
                    if (it4.next() == PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                            .getString("wyglad", "")
                    ) {
                        preference.summary = "Wybrany wygląd: " + it3.next()
                        break
                    } else {
                        it3.next()
                    }
                }
                true
            }
        val sp = PreferenceManager.getDefaultSharedPreferences(this)
        sp.registerOnSharedPreferenceChangeListener { prefs: SharedPreferences, key: String? ->
            requestedOrientation = if (prefs.getBoolean(
                    "Obrot",
                    false
                )
            ) ActivityInfo.SCREEN_ORIENTATION_SENSOR else ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        }
        if (!sp.getBoolean("Obrot", false)) {
            requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        }
        findPreference("Czyszczenie").onPreferenceClickListener =
            OnPreferenceClickListener {
                val intent2 = Intent(Intent.ACTION_VIEW)
                intent2.data = Uri.parse("https://github.com/marcinwiacek/przepisy_drogowe")
                MyActivity5.startActivity(intent2)
                true
            }
        if (Build.VERSION.SDK_INT < 19) {
            findPreference("Kontrolki").isEnabled = false
        }
    }
}