package com.mwiacek.przepisy.drogowe;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.app.TabActivity;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager.NameNotFoundException;
import android.graphics.Paint;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.preference.PreferenceManager;
import android.view.Gravity;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.widget.PopupMenu;
import android.widget.TabHost;
import android.widget.TextView;
import android.widget.Toast;

import java.util.Date;

public class PrzepisyDrogoweActivity extends TabActivity {
    public static final String DB_TABHOST = "3"; //nr zakladki

    public static final String DB_ZNAKI_SIZE = "4";//wielkosc w zakladce znaki
    public static final String DB_TRESC_SIZE = "7";//wielkosc w zakladce tresc
    public static final String DB_INNE_SIZE = "19";//wielkosc w zakladce inne
    public static final String DB_TARYFIKATOR_SIZE = "20";//wielkosc w zakladce taryfikator

    public static final String DB_NR_WERSJI = "21";//nr wersji aplikacji

    public static final String DB_ZNAKI_ZAKLADKA = "22";
    public static final String DB_INNE_ZAKLADKA = "23";

    public static final String DB_INNE_SZUKANIE = "24";
    public static final String DB_TARYFIKATOR_SZUKANIE = "25";
    public static final String DB_TRESC_SZUKANIE = "26";
    public static final String DB_ZNAKI_SZUKANIE = "27";

    //ostatni 27

    final Activity MyActivity5 = this;
    public Intent in;
    DBClass db;
    PlikiClass p = new PlikiClass();
    SharedPreferences sp;
    AlertDialog ad;

    void ShowUpdateInfo2() {
        if (!sp.getBoolean("Notka_Start2", false)) {
            return;
        }
        Date D2 = new Date();
        if (D2.compareTo(new Date(121, 11, 2)) > 0) {
            Toast.makeText(MyActivity5, "2.12.2021 - Zmiany znaków (D-18, D-18a, D-18b, D-23, D-23b, D-23c, D-34b, etc.)", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(121, 5, 1)) > 0) {
            Toast.makeText(MyActivity5, "1.6.2021 - Usunięcie prędkości 60km/h, zmiana pierwszeństwa i obowiązków pieszych", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(121, 2, 13)) > 0) {
            Toast.makeText(MyActivity5, "13.03.2021 - Zmiana znaku B-19, E-15a - E-15d, usunięcie znaków E-15e - E-15h", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(119, 7, 13)) > 0) {
            Toast.makeText(MyActivity5, "13.08.2019 - Znaki D-51a i D-51b", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(118, 7, 29)) > 0) {
            Toast.makeText(MyActivity5, "29.08.2018 - Znaki D-54 i D-55 i drobne poprawki innych znaków", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(118, 7, 6)) > 0) {
            Toast.makeText(MyActivity5, "06.08.2018 - Zmiany dotyczące znaków rowerowych (wycofanie znaków R-2 i R-2a)", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(117, 5, 30)) > 0) {
            Toast.makeText(MyActivity5, "30.06.2017 - Znak P-24 na powierzchni niebieskiej (inne zmiany w trakcie opracowywania)", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(116, 4, 24)) > 0) {
            Toast.makeText(MyActivity5, "24.05.2016 - Nowy znak E-15h", Toast.LENGTH_LONG).show();
            return;
        }

        if (D2.compareTo(new Date(116, 0, 04)) > 0) {
            Toast.makeText(MyActivity5, "04.01.2016 - Część ustawy o kierujących pojazdami i zmiany na podst. Ustawy z dnia 23 października 2013 r. o zmianie ustawy – Prawo o ruchu drogowym oraz niektórych innych ustaw", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(115, 9, 07)) > 0) {
            Toast.makeText(MyActivity5, "07.10.2015 - Nowe znaki E-15f, E-15g, P-26, P-27, S01a, S03a i zmiany przy innych znakach", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(115, 4, 18)) > 0) {
            Toast.makeText(MyActivity5, "18.05.2015 - przepisy Ustawy z dnia 20 marca 2015 (zatrzymywanie prawa jazdy na 3 miesiące, itp.)", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(115, 4, 15)) > 0) {
            Toast.makeText(MyActivity5, "15.05.2015 - przepisy Ustawy z dnia 9 kwietnia 2015 (m.in. foteliki samochodowe)", Toast.LENGTH_LONG).show();
            return;
        }

        if (D2.compareTo(new Date(115, 3, 11)) > 0) {
            Toast.makeText(MyActivity5, "11.04.2015 - zmiany wysokości niektórych grzywien", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(115, 0, 1)) > 0) {
            Toast.makeText(MyActivity5, "01.01.2015 - zmiany wynikające z Ustawy z 26 czerwca 2014", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(114, 9, 24)) > 0) {
            Toast.makeText(MyActivity5, "24.10.2014 - zmiany wynikające z Ustawy z 26 czerwca 2014", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(114, 7, 30)) > 0) {
            Toast.makeText(MyActivity5, "30.08.2014 - nowe przepisy dotyczące noszenia elementów odblaskowych przez pieszych", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(114, 7, 23)) > 0) {
            Toast.makeText(MyActivity5, "23.08.2014 - zmiany wynikające z Ustawy z 26 czerwca 2014 (m.in. kierowanie niektórymi motocyklami z kat. B)", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(114, 6, 1)) > 0) {
            Toast.makeText(MyActivity5, "01.07.2014 - Zmiany na podst. Ustawy z dnia 23 października 2013 r. o zmianie ustawy – Prawo o ruchu drogowym oraz niektórych innych ustaw", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(114, 5, 29)) > 0) {
            Toast.makeText(MyActivity5, "29.06.2014 - Tracą legalność stacjonarne urządzenia rejestrujące bez obudów spełniających obecne warunki techniczne (np. 'nieoklejone na żółto')", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(114, 4, 9)) > 0) {
            Toast.makeText(MyActivity5, "09.05.2014 - M.in. dodanie obowiązku zapisu przebiegu w systemach (Ustawa z 4 kwietnia 2014)", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(114, 3, 29)) > 0) {
            Toast.makeText(MyActivity5, "29.04.2014 - M.in. utworzenie Krajowego Punktu Kontaktowego (Ustawa z 14 marca 2014)", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(114, 1, 14)) > 0) {
            Toast.makeText(MyActivity5, "14.02.2014 - Zmiany nazw znaków D-44 i D-45 (dot. płatnego parkowania)", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(114, 0, 19)) > 0) {
            Toast.makeText(MyActivity5, "19.01.2014 - Art. 110 ustawy o kierujących pojazdami", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(114, 0, 1)) > 0) {
            Toast.makeText(MyActivity5, "01.01.2014 - Zmiany na podst. Ustawy z dnia 8 listopada 2013 r. o zmianie ustawy – Prawo o ruchu drogowym oraz ustawy o dozorze technicznym", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(113, 7, 13)) > 0) {
            Toast.makeText(MyActivity5, "13.08.2013 - Zmiany dotyczące znaków rowerowych", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(113, 6, 7)) > 0) {
            Toast.makeText(MyActivity5, "07.07.2013 - Dodanie ust. 4a w art. 51 ustawy o kierujących pojazdami", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(113, 5, 21)) > 0) {
            Toast.makeText(MyActivity5, "21.06.2013 - Zmiany na podstawie Ustawy z dnia 10 października 2012 r. o zmianie ustawy – Prawo o ruchu drogowym oraz niektórych innych ustaw", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(113, 5, 20)) > 0) {
            Toast.makeText(MyActivity5, "20.06.2013 - Zmiany na podstawie Ustawy z dnia 24 maja 2013 r. o zmianie ustawy o kierujących pojazdami oraz niektórych innych ustaw", Toast.LENGTH_LONG).show();
            return;
        }

        if (D2.compareTo(new Date(113, 0, 19)) > 0) {
            Toast.makeText(MyActivity5, "19.01.2013 - Część ustawy o kierujących pojazdami (wchodzi w życie oraz zmienia Kodeks Drogowy)", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(113, 0, 1)) > 0) {
            Toast.makeText(MyActivity5, "01.01.2013 - Zmiana art. 140d pkt 4 Kodeksu Drogowego", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(112, 9, 19)) > 0) {
            Toast.makeText(MyActivity5, "19.10.2012 - część ustawy z dnia 18.08.2011 o zmianie ustawy — Prawo o ruchu drogowym oraz niektórych innych ustaw", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(112, 5, 9)) > 0) {
            Toast.makeText(MyActivity5, "09.06.2012 - ROZPORZĄDZENIE z dnia 25 kwietnia 2012 r. w sprawie postępowania z kierowcami naruszającymi przepisy ruchu drogowego (nowy taryfikator punktów)", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(112, 4, 31)) > 0) {
            Toast.makeText(MyActivity5, "31.05.2012 - Część ustawy z dnia 13 kwietnia 2012 r. o zmianie ustawy o drogach publicznych oraz niektórych innych ustaw (zmienia Kodeks Drogowy)", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(112, 1, 25)) > 0) {
            Toast.makeText(MyActivity5, "25.02.2012 - art. 125 pkt 9 ustawy o kierujących pojazdami (zmienia Kodeks Drogowy)", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(112, 1, 11)) > 0) {
            Toast.makeText(MyActivity5, "11.02.2012 - Część ustawy o zmianie ustawy o ubezpieczeniach obowiązkowych oraz Ustawy z dnia 13.01.2012 r. o zmianie ustawy o kierujących pojazdami oraz ustawy – Prawo o ruchu drogowym... (zmieniają Kodeks Drogowy)", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(112, 1, 10)) > 0) {
            Toast.makeText(MyActivity5, "10.02.2012 - Część Ustawy z dnia 13.01.2012 r. o zmianie ustawy o kierujących pojazdami oraz ustawy – Prawo o ruchu drogowym", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(112, 0, 19)) > 0) {
            Toast.makeText(MyActivity5, "19.01.2012 - część ustawy z dnia 18.08.2011 o zmianie ustawy — Prawo o ruchu drogowym oraz niektórych innych ustaw", Toast.LENGTH_LONG).show();
            return;
        }
        if (D2.compareTo(new Date(112, 0, 1)) > 0) {
            Toast.makeText(MyActivity5, "01.01.2012 - ustawa o zmianie ustawy o transporcie drogowym, ustawa o bezpieczeństwie osób przebywających na obszarach wodnych, ustawa o przewozie towarów niebezpiecznych (zmieniają Kodeks Drogowy)", Toast.LENGTH_LONG).show();
            return;
        }
    }

    @Override
    protected void onResume() {
        super.onResume();

        setRequestedOrientation(sp.getBoolean("Obrot", false) ?
                ActivityInfo.SCREEN_ORIENTATION_SENSOR : ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        sp = PreferenceManager.getDefaultSharedPreferences(this);
        if (sp.getString("wyglad", "").length() == 0) {
            setTheme(android.R.style.Theme);
            SharedPreferences.Editor editor1 = sp.edit();
            editor1.putString("wyglad", "pusty");
            editor1.commit();
        } else if (sp.getString("wyglad", "").equals("pusty")) {
            setTheme(android.R.style.Theme);
        } else if (sp.getString("wyglad", "").equals("pusty2")) {
            setTheme(android.R.style.Theme_Black);
        } else if (sp.getString("wyglad", "").equals("holo")) {
            setTheme(android.R.style.Theme_Holo);
        } else if (sp.getString("wyglad", "").equals("holo2")) {
            setTheme(android.R.style.Theme_Holo_Light);
        } else if (sp.getString("wyglad", "").equals("domyslnyurzadzenie")) {
            setTheme(android.R.style.Theme_DeviceDefault);
        } else if (sp.getString("wyglad", "").equals("domyslnyurzadzenie2")) {
            setTheme(android.R.style.Theme_DeviceDefault_Light);
        } else if (sp.getString("wyglad", "").equals("light")) {
            setTheme(android.R.style.Theme_Light);
        } else if (sp.getString("wyglad", "").equals("material")) {
            setTheme(android.R.style.Theme_Material);
        } else if (sp.getString("wyglad", "").equals("material_light")) {
            setTheme(android.R.style.Theme_Material_Light);
        } else if (sp.getString("wyglad", "").equals("translucent")) {
            setTheme(android.R.style.Theme_Translucent);
        }

        getWindow().requestFeature(Window.FEATURE_NO_TITLE);
        super.onCreate(savedInstanceState);

        if (!sp.getBoolean("Obrot", false)) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        }
        if (sp.getBoolean("No_Lock", false)) {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
                    WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
                    WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);

        } else {
            getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
                    WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
                    WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
        }

        db = new DBClass(this);

        if (db.GetSetting(DB_NR_WERSJI, "0").equals("0") && android.os.Build.VERSION.SDK_INT >= 19) {
            Editor editor = sp.edit();
            editor.putBoolean("Zawijanie", true);
            editor.commit();
        }

        Paint p = new Paint();
        int h = (int) (p.measureText("Marcin") * getApplicationContext().getResources().getDisplayMetrics().density);

        setContentView(R.layout.main);

        in = getIntent();

        TabHost tabHost = getTabHost();
        TabHost.TabSpec spec;
        Intent intent;

        intent = new Intent().setClass(this, InneActivity.class);
        spec = tabHost.newTabSpec("inne").setIndicator("Inne", null).setContent(intent);
        tabHost.addTab(spec);

        intent = new Intent().setClass(this, TaryfikatorActivity.class);
        spec = tabHost.newTabSpec("taryfikator").setIndicator("Taryfikator", null).setContent(intent);
        tabHost.addTab(spec);

        intent = new Intent().setClass(this, TrescActivity.class);
        spec = tabHost.newTabSpec("tresc").setIndicator("Treść", null).setContent(intent);
        tabHost.addTab(spec);

        intent = new Intent().setClass(this, ZnakiActivity.class);
        spec = tabHost.newTabSpec("znaki").setIndicator("Na drodze", null).setContent(intent);
        tabHost.addTab(spec);

        for (int i = 0; i < 4; i++) {
            tabHost.getTabWidget().getChildAt(i).getLayoutParams().height = h;
            tabHost.getTabWidget().getChildAt(i).getLayoutParams().width =
                    ViewGroup.LayoutParams.WRAP_CONTENT;
        }

        if (android.os.Build.VERSION.SDK_INT > 10) {
            tabHost.getTabWidget().setOnLongClickListener(view -> {
                PopupMenu popup = new PopupMenu(this, view);
                MenuInflater inflater = popup.getMenuInflater();
                inflater.inflate(R.menu.menu, popup.getMenu());
                onPrepareOptionsMenu(popup.getMenu());
                popup.show();
                popup.setOnMenuItemClickListener(this::onOptionsItemSelected);
                return false;
            });
        }

        tabHost.setCurrentTab(db.GetSetting(DB_TABHOST, "3").equals("4") ? 3 :
                Integer.parseInt(db.GetSetting(DB_TABHOST, "3")));

        try {
            if (!db.GetSetting(DB_NR_WERSJI, "0").equals(getPackageManager().getPackageInfo(getPackageName(), 0).versionName)) {
                ad = new AlertDialog.Builder(this).create();
                ad.setCancelable(false);
                // ad.setMessage("Aplikacja została uaktualniona, używając jej zgadzasz się na to, że autor nie ponosi żadnej odpowiedzialności z tytułu jej używania przez Ciebie, w razie znalezienia błędów prośba o kontakt (np. przez \"Kontakt email\")\n\nAplikacja nie uwzględnia np. Ustawy o transporcie drogowym, możesz przyspieszyć jej rozwój składając datek.");
                // ad.setMessage("Na chwilę obecną aplikacja nie uwzględnia np. Ustawy o transporcie drogowym i nie zawiera aktualnych danych, prace nad uaktualnieniem trwają, jeżeli chcesz się dołączyć, prośba o kontakt (np. przez \"Kontakt email\").\n\nUżywając aplikacji zgadzasz się na to, że autor nie ponosi żadnej odpowiedzialności z tytułu jej używania.");
                ad.setMessage("Aplikacja dostępna z kodem na GitHub. Nie uwzględnia np. Ustawy o transporcie drogowym. Jeżeli chcesz się dołączyć, prośba o kontakt (np. przez \"Kontakt email\").\n\nUżywając aplikacji zgadzasz się na to, że autor nie ponosi żadnej odpowiedzialności z tytułu jej używania.");

                ad.setButton(DialogInterface.BUTTON_POSITIVE, "OK (00:07)", (dialog, which) -> dialog.dismiss());

                ad.setButton(DialogInterface.BUTTON_NEGATIVE, "Info o wydaniu", (dialog, which) -> {
                    String url = "https://www.salon24.pl/u/techracja/1195742,polski-nie-lad-w-praktyce-i-walka-o-jasnosc-z-przepisami-drogowymi-apka-1-52-i-1-53";
                    if (sp.getBoolean("Share_Link", false)) {
                        Intent intent1 = new Intent(Intent.ACTION_SEND);
                        intent1.putExtra(Intent.EXTRA_TEXT, url);
                        intent1.setType("text/plain");
                        MyActivity5.startActivity(intent1);
                    } else {
                        Intent intent1 = new Intent(Intent.ACTION_VIEW);
                        intent1.setData(Uri.parse(url));
                        MyActivity5.startActivity(intent1);
                    }
                });

                ad.show();
                ad.getButton(DialogInterface.BUTTON_POSITIVE).setEnabled(false);

                new CountDownTimer(7000, 1000) {
                    @Override
                    public void onTick(long millisUntilFinished) {
                        ad.getButton(DialogInterface.BUTTON_POSITIVE).setText(
                                "OK (00:0" + millisUntilFinished / 1000 + ")");
                    }

                    @Override
                    public void onFinish() {
                        ad.getButton(DialogInterface.BUTTON_POSITIVE).setText("OK");
                        ad.getButton(DialogInterface.BUTTON_POSITIVE).setEnabled(true);
                    }
                }.start();

                db.SetSetting(DB_NR_WERSJI, getPackageManager().getPackageInfo(getPackageName(), 0).versionName);
            }
        } catch (NameNotFoundException ignore) {
        }

        handleIntent(getIntent(), true);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        setIntent(intent);
        in = intent;
        handleIntent(intent, false);
    }

    private void handleIntent(Intent intent, Boolean oncreate) {
        TabHost tabHost = getTabHost();
        Uri intentData = intent.getData();

        if (intentData != null) {
            switch (intentData.toString().charAt(0)) {
                case 'u':
                    tabHost.setCurrentTab(0);
                    break;
                case 't':
                    tabHost.setCurrentTab(1);
                    break;
                case 'k':
                case 'i':
                    tabHost.setCurrentTab(2);
                    break;
                case 'z':
                    tabHost.setCurrentTab(3);
                    break;
            }
            ShowUpdateInfo2();
        } else {
            if (Intent.ACTION_SEARCH.equals(intent.getAction())) {
                AlertDialog alertDialog = new AlertDialog.Builder(this).create();
                alertDialog.setTitle("Informacja");
                alertDialog.setMessage("Aplikacja reaguje tylko na wybór podpowiedzi");
                alertDialog.show();
            } else {
                ShowUpdateInfo2();
            }
        }
    }

    @Override
    protected void onDestroy() {
        db.SetSetting(DB_TABHOST, Integer.toString(getTabHost().getCurrentTab()));
        super.onDestroy();
        if (db != null) {
            db.close();
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.menu, menu);
        return true;
    }

    @Override
    public boolean onPrepareOptionsMenu(Menu menu) {
        menu.getItem(1).setEnabled(sp.getBoolean("Kodeks_szukanie", true) ||
                sp.getBoolean("Taryfikator_szukanie", true) ||
                sp.getBoolean("Znaki_szukanie", true) ||
                sp.getBoolean("KodyUN_szukanie", true) ||
                sp.getBoolean("KierPoj_szukanie", true));
        return true;
    }

    public void SetSearchVisibility(String setting, int... fields) {
        String sett;

        sett = db.GetSetting(setting, "true");
        db.SetSetting(setting, "true".equals(sett) ? "false" : "true");

        SetControlVisibility("false".equals(sett) ? View.VISIBLE : View.GONE, fields);
    }

    public void SetControlVisibility(int state, int... fields) {
        for (int i : fields) {
            boolean found = false;
            for (int x = 0; x < getTabHost().getTabContentView().getChildCount(); x++) {
                if (getTabHost().getTabContentView().getChildAt(x)
                        .findViewById(i) != null) {
                    getTabHost().getTabContentView().getChildAt(x)
                            .findViewById(i).setVisibility(state);
                    found = true;
                }
            }
            if (!found) {
                Toast.makeText(MyActivity5, "Błąd zmiany statusu kontrolki " +
                        getBaseContext().getResources().getResourceEntryName(i), Toast.LENGTH_LONG).show();

            }
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case R.id.about:
                ShowAbout();
                return true;
            case R.id.sett:
                ShowSett();
                return true;
            case R.id.szukaj:
                onSearchRequested();
                return true;
            case R.id.szukanie:
                switch (getTabHost().getCurrentTab()) {
                    case 0:
                        SetSearchVisibility(DB_INNE_SZUKANIE,
                                R.id.button1r, R.id.button1l, R.id.autoCompleteTextView1);
                        break;
                    case 1:
                        SetSearchVisibility(DB_TARYFIKATOR_SZUKANIE,
                                R.id.button2r, R.id.button2l, R.id.autoCompleteTextView2);
                        break;
                    case 2:
                        SetSearchVisibility(DB_TRESC_SZUKANIE,
                                R.id.button3r, R.id.button3l, R.id.autoCompleteTextView3);
                        break;
                    case 3:
                        SetSearchVisibility(DB_ZNAKI_SZUKANIE,
                                R.id.checkBox4, R.id.autoCompleteTextView4);
                        break;
                    default:
                        break;
                }
                return true;
            case R.id.full:
                int show = findViewById(android.R.id.tabs).getVisibility() == View.VISIBLE ?
                        View.GONE : View.VISIBLE;

                switch (getTabHost().getCurrentTab()) {
                    case 0:
                        SetControlVisibility(
                                show == View.GONE ? show :
                                        (db.GetSetting(DB_INNE_SZUKANIE, "true") == "true"
                                                ? View.VISIBLE : View.GONE),
                                R.id.button1r, R.id.button1l,
                                R.id.autoCompleteTextView1);
                        SetControlVisibility(show, R.id.spinner1);
                        break;
                    case 1:
                        SetControlVisibility(
                                show == View.GONE ? show :
                                        (db.GetSetting(DB_TARYFIKATOR_SZUKANIE, "true") == "true"
                                                ? View.VISIBLE : View.GONE),
                                R.id.button2r, R.id.button2l,
                                R.id.autoCompleteTextView2);
                        SetControlVisibility(show, R.id.spinner2);
                        break;
                    case 2:
                        SetControlVisibility(
                                show == View.GONE ? show :
                                        (db.GetSetting(DB_TRESC_SZUKANIE, "true") == "true"
                                                ? View.VISIBLE : View.GONE),
                                R.id.button3r, R.id.button3l,
                                R.id.autoCompleteTextView3);
                        SetControlVisibility(show, R.id.spinner3);
                        break;
                    case 3:
                        SetControlVisibility(
                                show == View.GONE ? show :
                                        (db.GetSetting(DB_ZNAKI_SZUKANIE, "true") == "true"
                                                ? View.VISIBLE : View.GONE),
                                R.id.checkBox4, R.id.autoCompleteTextView4);
                        SetControlVisibility(show, R.id.spinner4);
                        break;
                    default:
                        break;
                }
                findViewById(android.R.id.tabs).setVisibility(show);
                return true;
            case R.id.report:
                Intent emailIntent = new Intent(Intent.ACTION_SEND);
                String subject = "";
                try {
                    subject = "Przepisy drogowe "
                            + getPackageManager().getPackageInfo(getPackageName(), 0).versionName
                            + " / Android " + Build.VERSION.RELEASE;
                } catch (Exception ignore) {
                }

                String[] extra = new String[]{"marcin@mwiacek.com"};
                emailIntent.putExtra(Intent.EXTRA_EMAIL, extra);
                emailIntent.putExtra(Intent.EXTRA_SUBJECT, subject);
                emailIntent.setType("message/rfc822");
                try {
                    startActivity(emailIntent);
                } catch (Exception e) {
                    AlertDialog alertDialog;
                    alertDialog = new AlertDialog.Builder(this).create();
                    alertDialog.setTitle("Informacja");
                    alertDialog.setMessage("Błąd stworzenia maila");
                    alertDialog.show();
                }
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    void ShowAbout() {
        final Dialog dialog = new Dialog(this);

        dialog.setContentView(R.layout.znaki2);
        dialog.setCancelable(true);

        WindowManager.LayoutParams lp = new WindowManager.LayoutParams();
        lp.copyFrom(dialog.getWindow().getAttributes());
        lp.gravity = Gravity.CENTER;
        lp.width = WindowManager.LayoutParams.MATCH_PARENT;
        lp.height = WindowManager.LayoutParams.WRAP_CONTENT;
        dialog.getWindow().setAttributes(lp);

        ScrollerWebView webview = dialog.findViewById(R.id.webView4);
        ScrollerView scroller = dialog.findViewById(R.id.view37);
        scroller.webview = webview;
        webview.sv = scroller;

        ViewGroup.LayoutParams params = scroller.getLayoutParams();
        params.width = scroller.myBitmap.getWidth();
        scroller.setLayoutParams(params);

        try {
            dialog.setTitle("Przepisy drogowe "
                    + getPackageManager().getPackageInfo(getPackageName(), 0).versionName);
        } catch (Exception ignore) {
        }

        TextView title = dialog.findViewById(android.R.id.title);
        title.setSingleLine(false);

        webview.setHorizontalScrollBarEnabled(false);
        webview.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        webview.getSettings().setAppCacheEnabled(false);

        webview.loadUrl("file:///android_asset/about.htm");

        dialog.show();
    }

    void ShowSett() {
        Intent intent = new Intent(MyActivity5, PreferencesActivity.class);
        intent.putExtra("wyglad", sp.getString("wyglad", ""));
        startActivityForResult(intent, 0);
    }

    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == 0 && resultCode == RESULT_OK) {
            if (!sp.getString("wyglad", "").equals(data.getStringExtra("wyglad"))) {
                MyActivity5.finish();
                MyActivity5.startActivity(new Intent(MyActivity5, MyActivity5.getClass()));
            }
        }
    }

}
