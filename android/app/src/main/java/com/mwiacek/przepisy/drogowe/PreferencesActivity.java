package com.mwiacek.przepisy.drogowe;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.preference.ListPreference;
import android.preference.PreferenceActivity;
import android.preference.PreferenceManager;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class PreferencesActivity extends PreferenceActivity {
    final Activity MyActivity5 = this;
    List<String> listItems = new ArrayList<>();
    List<String> listItems2 = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        if (PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "").length() == 0
                || PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "").equals("pusty")) {
            setTheme(android.R.style.Theme);
        } else if (PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "").equals("pusty2")) {
            setTheme(android.R.style.Theme_Black);
        } else if (PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "").equals("holo")) {
            setTheme(android.R.style.Theme_Holo);
        } else if (PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "").equals("holo2")) {
            setTheme(android.R.style.Theme_Holo_Light);
        } else if (PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "").equals("domyslnyurzadzenie")) {
            setTheme(android.R.style.Theme_DeviceDefault);
        } else if (PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "").equals("domyslnyurzadzenie2")) {
            setTheme(android.R.style.Theme_DeviceDefault_Light);
        } else if (PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "").equals("light")) {
            setTheme(android.R.style.Theme_Light);
        } else if (PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "").equals("material")) {
            setTheme(android.R.style.Theme_Material);
        } else if (PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "").equals("material_light")) {
            setTheme(android.R.style.Theme_Material_Light);
        } else if (PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", "").equals("translucent")) {
            setTheme(android.R.style.Theme_Translucent);
        }

        super.onCreate(savedInstanceState);
        addPreferencesFromResource(R.xml.sett2);

        try {
            PackageManager manager = getPackageManager();
            PackageInfo info = manager.getPackageInfo(getPackageName(), 0);

            setTitle("Przepisy drogowe " + info.versionName);
        } catch (Exception ignore) {
        }

        Intent intent = new Intent();
        intent.putExtra("wyglad", PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                .getString("wyglad", ""));
        setResult(RESULT_OK, intent);

        listItems.add("Android 2.x");
        listItems2.add("pusty");
        listItems.add("Android 2.x (czarny)");
        listItems2.add("pusty2");
        listItems.add("Lekki (przestarzały)");
        listItems2.add("light");
        listItems.add("translucent");
        listItems2.add("translucent");
        if (android.os.Build.VERSION.SDK_INT > 10) {
            listItems.add("Holo (przestarzały)");
            listItems2.add("holo");
            listItems.add("Holo jasny (przestarzały)");
            listItems2.add("holo2");
        }
        if (android.os.Build.VERSION.SDK_INT > 13) {
            listItems.add("producenta");
            listItems2.add("domyslnyurzadzenie");
            listItems.add("producenta (jasny)");
            listItems2.add("domyslnyurzadzenie2");
        }
        if (android.os.Build.VERSION.SDK_INT > 20) {
            listItems.add("material (przestarzały)");
            listItems2.add("material");
            listItems.add("material_light (przestarzały)");
            listItems2.add("material_light");
        }

        ListPreference customPref2 = (ListPreference) findPreference("wyglad");
        customPref2.setEntries(listItems.toArray(new CharSequence[listItems.size()]));
        customPref2.setEntryValues(listItems2.toArray(new CharSequence[listItems2.size()]));
        Iterator<String> it1, it2;
        it1 = listItems.iterator();
        it2 = listItems2.iterator();
        while (it1.hasNext()) {
            if (it2.next().equals(PreferenceManager.getDefaultSharedPreferences(MyActivity5).getString("wyglad", ""))) {
                customPref2.setSummary("Wybrany wygląd: " + it1.next());
                break;
            } else {
                it1.next();
            }
        }
        customPref2.setOnPreferenceChangeListener((preference, newValue) -> {
            if (!newValue.equals(PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                    .getString("wyglad", ""))) {
                MyActivity5.finish();
                MyActivity5.startActivity(new Intent(MyActivity5, MyActivity5.getClass()));
            }

            Iterator<String> it3, it4;
            it3 = listItems.iterator();
            it4 = listItems2.iterator();
            while (it3.hasNext()) {
                if (it4.next().equals(PreferenceManager.getDefaultSharedPreferences(MyActivity5)
                        .getString("wyglad", ""))) {
                    preference.setSummary("Wybrany wygląd: " + it3.next());
                    break;
                } else {
                    it3.next();
                }
            }
            return true;
        });

        SharedPreferences sp = PreferenceManager.getDefaultSharedPreferences(this);
        sp.registerOnSharedPreferenceChangeListener((prefs, key) -> {
            setRequestedOrientation(prefs.getBoolean("Obrot", false) ?
                    ActivityInfo.SCREEN_ORIENTATION_SENSOR :
                    ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        });
        if (!sp.getBoolean("Obrot", false)) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        }

        findPreference("Czyszczenie").setOnPreferenceClickListener(preference -> {
                    Intent intent2 = new Intent(Intent.ACTION_VIEW);
                    intent2.setData(Uri.parse("https://github.com/marcinwiacek/przepisy_drogowe"));
                    MyActivity5.startActivity(intent2);

                    return true;
                }
        );

        if (android.os.Build.VERSION.SDK_INT < 19) {
            findPreference("Kontrolki").setEnabled(false);
        }
    }

}	
