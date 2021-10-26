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
import android.widget.Toast;

import java.util.ArrayList;
import java.util.Arrays;

public class TrescActivity extends OneTabActivity {

    int iloscWPDR = 40;
    int iloscwUKP = 20;

    @Override
    protected boolean LoadFromIntent() {
        if (((PrzepisyDrogoweActivity) getParent()).in != null) {
            Uri intentData = ((PrzepisyDrogoweActivity) getParent()).in.getData();
            if (intentData != null) {
                if (intentData.toString().charAt(0) == 'k') {
                    textView.setText(intentData.toString().substring(1));

                    ((PrzepisyDrogoweActivity) getParent()).in = null;

                    spinner.setSelection(0, false);//kodeks
                    return true;
                }
                if (intentData.toString().charAt(0) == 'i') {
                    textView.setText(intentData.toString().substring(1));

                    ((PrzepisyDrogoweActivity) getParent()).in = null;

                    spinner.setSelection(iloscWPDR + 1, false);//ust. o kier. poj.
                    return true;
                }
            }
        }
        return false;
    }

    @Override
    protected void onResume() {
        super.onResume();

        if (((PrzepisyDrogoweActivity) getParent()).sp.getBoolean("Czarne_tlo_tresc", false)) {
            webView.setBackgroundColor(android.graphics.Color.BLACK);
            webView.loadUrl("javascript:lustro();");
        } else {
            webView.setBackgroundColor(android.graphics.Color.WHITE);
            webView.loadUrl("javascript:normalnie();");
        }

        if (((PrzepisyDrogoweActivity) getParent()).in != null) {
            Uri intentData = ((PrzepisyDrogoweActivity) getParent()).in.getData();
            if (intentData != null) {
                if (intentData.toString().charAt(0) == 'k') {
                    textView.setText(intentData.toString().substring(1));

                    ((PrzepisyDrogoweActivity) getParent()).in = null;

                    if (spinner.getSelectedItemPosition() != 0) {
                        spinner.setSelection(0);//kodeks
                    } else {
                        textView.dispatchKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN,
                                KeyEvent.KEYCODE_ENTER));
                    }
                }
                if (intentData.toString().charAt(0) == 'i') {
                    textView.setText(intentData.toString().substring(1));

                    ((PrzepisyDrogoweActivity) getParent()).in = null;

                    if (spinner.getSelectedItemPosition() != iloscWPDR + 1) {
                        spinner.setSelection(iloscWPDR + 1);//UKP
                    } else {
                        textView.dispatchKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN,
                                KeyEvent.KEYCODE_ENTER));
                    }
                }
            }
        }
    }

    @Override
    public void onSelected(int i, int position) {
         //prd
        if (i >= 0 && i < iloscWPDR + 1) {
            String scroll = "window.scrollTo(0, " +
                    (position == -1 ? " document.getElementById('bok" + i + "').offsetTop" : position) +
                    ");";
            if (firstLoad || !webView.getTitle().equals("prd")) {
                DisplayIt(scroll);
                return;
            }
            webView.loadUrl("javascript:" + scroll);
            return;
        }
        //ukp
        if (i > iloscWPDR && i < iloscWPDR + iloscwUKP + 2) {
            String scroll = "window.scrollTo(0, " +
                    (position == -1 ? " document.getElementById('bok" + (i - iloscWPDR - 1) + "').offsetTop" : position) +
                    ");";
            if (!webView.getTitle().equals("ukp")) {
                DisplayIt(scroll);
                return;
            }
            webView.loadUrl("javascript:" + scroll);
            return;
        }
        String scroll = (position == -1) ? "" : "window.scrollTo(0, " + position + ");";
        DisplayIt(scroll);
    }

    @Override
    public void setBlack() {
        webView.setBackgroundColor(
                ((PrzepisyDrogoweActivity) getParent()).sp.getBoolean("Czarne_tlo_tresc", false) ?
                        android.graphics.Color.BLACK :
                        android.graphics.Color.WHITE);
    }

    @Override
    protected void GetDisplayBytes() {
        DisplayTotal = "";
        if (spinner.getSelectedItemPosition() >= 0
                && spinner.getSelectedItemPosition() <= iloscWPDR) {
            readFile("tekst/kodeks.htm");
        } else if (spinner.getSelectedItemPosition() > iloscWPDR
                && spinner.getSelectedItemPosition() < iloscWPDR + iloscwUKP + 2) {
            readFile("tekst/kierpoj.htm");
        } else if (spinner.getSelectedItemPosition() == iloscWPDR + iloscwUKP + 2) {
            readFile("tekst/rozp2012.htm");
        } else {
            readFile("tekst/rozp2002.htm");
        }
    }

    @Override
    ArrayAdapter<CharSequence> getMyAdapter() {
        return new MyCustomArrayAdapter<>(this,
                new ArrayList<>(Arrays.asList(getResources().getStringArray(
                        R.array.typyaktowprawnych))));
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        MyActivity = this;

        Db_Number_Of_Selection = "";
        Db_Size_Name = PrzepisyDrogoweActivity.DB_TRESC_SIZE;

        Sp_Black_Name = "Czarne_tlo_tresc";

        sp = ((PrzepisyDrogoweActivity) getParent()).sp;
        db = ((PrzepisyDrogoweActivity) getParent()).db;

        LayoutId = R.layout.tresc;
        setContentView(LayoutId);

        webView = findViewById(R.id.webView3);
        b1 = findViewById(R.id.button3l);
        b2 = findViewById(R.id.button3r);
        textView = findViewById(R.id.autoCompleteTextView3);
        spinner = findViewById(R.id.spinner3);
        scroller = findViewById(R.id.view3);

        onCreateTab();
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
            if (text.getText().toString().indexOf("Rozp. ") == 0 ||
                    text.getText().toString().indexOf("Prawo o ruchu") == 0 ||
                    text.getText().toString().indexOf("Ustawa o ") == 0 ||
                    text.getText().toString().indexOf("Stare ") == 0) {
                text.setTypeface(null, Typeface.BOLD);
            } else {
                text.setTypeface(null, Typeface.NORMAL);
            }
            text.setSingleLine(false);

            return view;
        }
    }
}
