package com.mwiacek.przepisy.drogowe;

import android.content.Context;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.Arrays;

public class TaryfikatorActivity extends OneTabActivity {
    ArrayList<CharSequence> al2 = new ArrayList<>();

    @Override
    protected boolean LoadFromIntent() {
        if (((PrzepisyDrogoweActivity) getParent()).in != null) {
            Uri intentData = ((PrzepisyDrogoweActivity) getParent()).in.getData();
            if (intentData != null) {
                if (intentData.toString().charAt(0) == 't') {
                    textView.setText(intentData.toString().substring(2));

                    ((PrzepisyDrogoweActivity) getParent()).in = null;

                    if (spinner.getSelectedItemPosition() != 0) {
                        spinner.setSelection(0);
                    } else {
                        textView.dispatchKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_ENTER));
                    }
                    return true;
                }
            }
        }
        return false;
    }

    @Override
    boolean loadMyUrl(String url) {
        JavaScriptInterface j = new JavaScriptInterface(sp, MyActivity, null,
                null, ((PrzepisyDrogoweActivity) getParent()).p);
        j.s(url.replace("file:///android_asset/", ""), "",
                false, false);
        return true;
    }

    @Override
    public void onSelected(int i, int position) {
        if (spinner.getCount() > 5 &&
                spinner.getSelectedItemPosition() < spinner.getCount() - 5) {
            String scroll = "window.scrollTo(0, " +
                    (position == -1 ? " document.getElementById('sekcja" + spinner.getSelectedItemPosition() + "').offsetTop" : position) +
                    ");";
            if (!webView.getTitle().equals("wlasny")) {
                DisplayIt(scroll);
            } else {
                webView.loadUrl("javascript:" + scroll);
            }
        } else {
            DisplayIt(position == -1 ? "" : "window.scrollTo(0, " + position + ");");
        }
    }

    @Override
    protected void GetDisplayBytes() {
        String title = "";
        StringBuilder DisplayLines = new StringBuilder();
        if (spinner.getSelectedItemPosition() == spinner.getCount() - 5 &&
                spinner.getCount() != 1) {
            DisplayLines.append("<tr><td bgcolor=grey><b>Mandaty od 01.01.2022</b></td></tr>");
            ((PrzepisyDrogoweActivity) getParent()).p.ReadTaryfikator2(DisplayLines,
                    "kary/20220101.jso", textView.getText().toString(), getAssets(),
                    al2, true);
            DisplayLines.append("<tr><td bgcolor=grey><b>Punkty od 09.06.2012</b></td></tr>");
            ((PrzepisyDrogoweActivity) getParent()).p.ReadTaryfikator2(DisplayLines,
                    "kary/20120609.jso", textView.getText().toString(), getAssets(),
                    al2, true);
        } else if (spinner.getSelectedItemPosition() == spinner.getCount() - 4 &&
                spinner.getCount() != 1) {
            DisplayLines.append("<tr><td bgcolor=grey><b>Mandaty od 10.08.2017</b></td></tr>");
            ((PrzepisyDrogoweActivity) getParent()).p.ReadTaryfikator2(DisplayLines,
                    "kary/20170810.jso", textView.getText().toString(), getAssets(),
                    al2, true);
            DisplayLines.append("<tr><td bgcolor=grey><b>Punkty od 09.06.2012</b></td></tr>");
            ((PrzepisyDrogoweActivity) getParent()).p.ReadTaryfikator2(DisplayLines,
                    "kary/20120609.jso", textView.getText().toString(), getAssets(),
                    al2, true);
        } else if (spinner.getSelectedItemPosition() == spinner.getCount() - 3 &&
                spinner.getCount() != 1) {
            DisplayLines.append("<tr><td bgcolor=grey><b>Mandaty od 11.04.2015</b></td></tr>");
            ((PrzepisyDrogoweActivity) getParent()).p.ReadTaryfikator2(DisplayLines,
                    "kary/20150411.jso", textView.getText().toString(), getAssets(),
                    al2, true);
            DisplayLines.append("<tr><td bgcolor=grey><b>Punkty od 09.06.2012</b></td></tr>");
            ((PrzepisyDrogoweActivity) getParent()).p.ReadTaryfikator2(DisplayLines,
                    "kary/20120609.jso", textView.getText().toString(), getAssets(),
                    al2, true);
        } else if (spinner.getSelectedItemPosition() == spinner.getCount() - 2 &&
                spinner.getCount() != 1) {
            DisplayLines.append("<tr><td bgcolor=grey><b>Mandaty od 24.05.2011</b></td></tr>");
            ((PrzepisyDrogoweActivity) getParent()).p.ReadTaryfikator2(DisplayLines,
                    "kary/20110524.jso", textView.getText().toString(), getAssets(),
                    al2, true);
            DisplayLines.append("<tr><td bgcolor=grey><b>Punkty od 09.06.2012</b></td></tr>");
            ((PrzepisyDrogoweActivity) getParent()).p.ReadTaryfikator2(DisplayLines,
                    "kary/20120609.jso", textView.getText().toString(), getAssets(),
                    al2, true);
        } else if (spinner.getSelectedItemPosition() == spinner.getCount() - 1 &&
                spinner.getCount() != 1) {
            DisplayLines.append("<tr><td bgcolor=grey><b>Mandaty od 24.05.2011</b></td></tr>");
            ((PrzepisyDrogoweActivity) getParent()).p.ReadTaryfikator2(DisplayLines,
                    "kary/20110524.jso", textView.getText().toString(), getAssets(),
                    al2, true);
            DisplayLines.append("<tr><td bgcolor=grey><b>Punkty 31.12.2010-08.06.2012</b></td></tr>");
            ((PrzepisyDrogoweActivity) getParent()).p.ReadTaryfikator2(DisplayLines,
                    "kary/20101231.jso", textView.getText().toString(), getAssets(),
                    al2, true);
        } else {
            ((PrzepisyDrogoweActivity) getParent()).p.ReadMyTaryfikator(DisplayLines,
                    textView.getText().toString(), getAssets(), al2, true);
            title = "wlasny";
        }

        if (spinner.getCount() == 1) {
            adapter1.clear();
            adapter1.add("(do 31.12.2021) Mandaty i pkt razem - opracowanie własne");
            for (int x = al2.size() - 1; x >= 0; x--) {
                adapter1.add(al2.get(x));
            }
            adapter1.add("Mandaty i pkt osobno (od 1.1.2022) - Rozporządzenia");
            adapter1.add("Mandaty i pkt osobno (10.08.2017-31.12.2021) - Rozporządzenia");
            adapter1.add("Mandaty i pkt osobno (11.04.2015-09.08.2017) - Rozporządzenia");
            adapter1.add("Mandaty i pkt osobno (09.06.2012-10.04.2015) - Rozporządzenia");
            adapter1.add("Mandaty i pkt osobno (24.05.2011-08.06.2012) - Rozporządzenia");
            adapter1.notifyDataSetChanged();
        }

        DisplayLines.insert(0, "<html><head><meta name=\"viewport\" content=\"width=device-width, minimum-scale=0.1, initial-scale=1.0\">" +
                    "<title>" + title + "</title></head><body><table>");
        DisplayLines.append("</table></body></html>");

        if ((spinner.getSelectedItemPosition() == spinner.getCount() - 5 ||
                spinner.getSelectedItemPosition() == spinner.getCount() - 4 ||
                spinner.getSelectedItemPosition() == spinner.getCount() - 3 ||
                spinner.getSelectedItemPosition() == spinner.getCount() - 2 ||
                spinner.getSelectedItemPosition() == spinner.getCount() - 1)
                && spinner.getCount() != 1) {
            DisplayTotal = DisplayLines.toString()
                    .replaceAll("\\Qc.p.g.\\E",
                            "USTAWY z dnia 13 września 1996 r. o utrzymaniu czystości i porządku w gminach")
                    .replaceAll("\\Qk.k.\\E",
                            "USTAWY z dnia 6 czerwca 1997 Kodeks Karny")
                    .replaceAll("\\Qk.w.\\E",
                            "USTAWY z dnia 20 maja 1971 r. Kodeks Wykroczeń")
                    .replaceAll("\\Qo.o.z.r.\\E",
                            "ROZPORZĄDZENIA MINISTRA TRANSPORTU z dnia 31 lipca 2007 r. w sprawie okresowych ograniczeń oraz zakazu ruchu niektórych rodzajów pojazdów na drogach")
                    .replaceAll("\\Qp.r.d.\\E",
                            "USTAWY z dnia 20 czerwca 1997 r. Prawo o ruchu drogowym (dostępna w zakładce \"Treść\")")
                    .replaceAll("\\Qu.d.p.\\E",
                            "USTAWY z dnia 21 marca 1985 r. o drogach publicznych")
                    .replaceAll("\\Qz.s.d.\\E",
                            "ROZPORZĄDZENIA MINISTRÓW INFRASTRUKTURY ORAZ SPRAW WEWNĘTRZNYCH I ADMINISTRACJI z dnia 31 lipca 2002 r. w sprawie znaków i sygnałów drogowych")
                    .replaceAll("\\Qu.t.d.\\E",
                            "USTAWY z dnia 6 września 2001 r. o transporcie drogowym")
                    .replaceAll("\\Qu.k.p.\\E",
                            "USTAWY z dnia 5 stycznia 2011 r. o kierujących pojazdami (dostępna w zakładce \"Treść\")")
                    .replaceAll("\\Qh.p.s.\\E",
                            "Rozporządzenia Parlamentu Europejskiego i Rady nr 561/2006 z dnia 15 marca 2006 r. w sprawie harmonizacji niektórych przepisów socjalnych odnoszących się do transportu drogowego oraz zmieniającego rozporządzenie Rady nr 3821/85 i 2135/98, jak również uchylającego rozporządzenie Rady nr 3820/85")
                    .replaceAll("\\Qaetr\\E",
                            "Umowy europejskiej dotyczącej pracy załóg pojazdów wykonujących międzynarodowe przewozy drogowe (AETR), sporządzonej w Genewie dnia 1 lipca 1970 r.")
                    .replaceAll("\\Qr.u.j.\\E",
                            "Rozporządzenia Rady nr 3821/1985 z dnia 20 grudnia 1985 r. w sprawie urządzeń rejestrujących stosowanych w transporcie drogowym").replaceAll("\\Qu.s.t.c\\E", "USTAWY z dnia 29 lipca 2005 r. o systemie tachografów cyfrowych");
        } else {
            DisplayTotal = DisplayLines.toString();
        }
    }

    @Override
    ArrayAdapter<CharSequence> getMyAdapter() {
        return new MyCustomArrayAdapter<>(this,
                new ArrayList<>(Arrays.asList(getResources().getStringArray(
                        R.array.taryfikator1))));
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        MyActivity = this;

        Db_Number_Of_Selection = "";
        Db_Size_Name = PrzepisyDrogoweActivity.DB_TARYFIKATOR_SIZE;

        sp = ((PrzepisyDrogoweActivity) getParent()).sp;
        db = ((PrzepisyDrogoweActivity) getParent()).db;

        LayoutId = R.layout.taryfikator;
        setContentView(LayoutId);

        webView = findViewById(R.id.webView2);
        b1 = findViewById(R.id.button2l);
        b2 = findViewById(R.id.button2r);
        textView = findViewById(R.id.autoCompleteTextView2);
        spinner = findViewById(R.id.spinner2);
        scroller = findViewById(R.id.view2);

        internalSearch = false;

        onCreateTab();
    }

    //Potrzebne przy szukaniu
    @Override
    protected void onResume() {
        super.onResume();

        if (((PrzepisyDrogoweActivity) getParent()).in != null) {
            Uri intentData = ((PrzepisyDrogoweActivity) getParent()).in.getData();
            if (intentData != null) {
                if (intentData.toString().charAt(0) == 't') {
                    textView.setText(intentData.toString().substring(2));

                    ((PrzepisyDrogoweActivity) getParent()).in = null;

                    if (spinner.getSelectedItemPosition() != 0) {
                        spinner.setSelection(0);
                    } else {
                        textView.dispatchKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_ENTER));
                    }
                }
            }
        }
    }

    class MyCustomArrayAdapter<T> extends ArrayAdapter<T> {
        MyCustomArrayAdapter(Context ctx, ArrayList<T> objects) {
            super(ctx, android.R.layout.simple_spinner_item, objects);
        }

        @Override
        public View getDropDownView(int position, View convertView, ViewGroup parent) {
            if (convertView == null) {
                LayoutInflater vi = (LayoutInflater) getSystemService(Context.LAYOUT_INFLATER_SERVICE);
                convertView = vi.inflate(android.R.layout.simple_spinner_dropdown_item, null);
            }

            View view = super.getView(position, convertView, parent);

            TextView text = view.findViewById(android.R.id.text1);
            text.setTypeface(null, text.getText().toString().indexOf("Mandaty") != 0
                    ? Typeface.NORMAL : Typeface.BOLD);
            text.setSingleLine(false);

            return view;
        }
    }
}
