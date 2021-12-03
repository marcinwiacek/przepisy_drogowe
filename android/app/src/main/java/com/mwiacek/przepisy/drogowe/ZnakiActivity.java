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
import android.widget.CheckBox;
import android.widget.TextView;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ZnakiActivity extends OneTabActivity {
    CheckBox checkbox;
    List<String> Lista = new ArrayList<>();

    @Override
    protected boolean LoadFromIntent() {
        Uri intentData = ((PrzepisyDrogoweActivity) getParent()).in.getData();
        if (intentData != null) {
            if (intentData.toString().charAt(0) == 'z') {
                textView.setText(intentData.toString().substring(2));

                ((PrzepisyDrogoweActivity) getParent()).in = null;

                spinner.setSelection(15, false);
                return true;
            }
        }
        return false;
    }

    @Override
    protected void onResume() {
        super.onResume();

        if (((PrzepisyDrogoweActivity) getParent()).in != null) {
            Uri intentData = ((PrzepisyDrogoweActivity) getParent()).in.getData();
            if (intentData != null) {
                if (intentData.toString().charAt(0) == 'z') {

                    textView.setText(intentData.toString().substring(2));
                    spinner.setSelection(15);
                    checkbox.setChecked(false);

                    ((PrzepisyDrogoweActivity) getParent()).in = null;

                    textView.dispatchKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN,
                            KeyEvent.KEYCODE_ENTER));
                }
            }
        }
    }

    @Override
    protected void GetDisplayBytes() {
        InputStreamReader inputreader;
        InputStream stream;
        char[] bytes = new char[10000];
        int numRead = 0, start, end, mpz;
        StringBuilder lines2 = new StringBuilder();
        StringBuilder DisplayLines;
        String tosearch;

        if (textView.length() == 0) {
            tosearch = "";
        } else {
            tosearch = "(?![^<]+>)((?i:\\Q" + textView.getText().toString()
                    .replace("\\E", "\\E\\\\E\\Q")
                    .replace("a", "\\E[aąĄ]\\Q")
                    .replace("c", "\\E[cćĆ]\\Q")
                    .replace("e", "\\E[eęĘ]\\Q")
                    .replace("l", "\\E[lłŁ]\\Q")
                    .replace("n", "\\E[nńŃ]\\Q")
                    .replace("o", "\\E[oóÓ]\\Q")
                    .replace("s", "\\E[sśŚ]\\Q")
                    .replace("z", "\\E[zźżŻŹ]\\Q") + "\\E))";
        }

        DisplayLines = new StringBuilder();

        if (spinner.getSelectedItemPosition() == 15) {
            start = 0;
            end = 14;
        } else {
            start = spinner.getSelectedItemPosition();
            end = spinner.getSelectedItemPosition();
        }

        Lista.clear();

        DisplayLines.delete(0, DisplayLines.length());

        if (checkbox.isChecked()) {
            for (int z = start; z <= end; z++) {
                int l = ((PrzepisyDrogoweActivity) getParent()).p.znaki[z].length;
                for (int j = 0; j < l; j++) {
                    try {
                        //FIXME: read
                        stream = getAssets().open(((PrzepisyDrogoweActivity) getParent()).p.znaki[z][j] + ".htm");
                        inputreader = new InputStreamReader(stream);
                        lines2.delete(0, lines2.length());
                        while ((numRead = inputreader.read(bytes, 0, 10000)) >= 0) {
                            lines2.append(bytes, 0, numRead);
                        }
                        stream.close();
                        if (tosearch.length() != 0) {
                            if (!lines2.toString().replaceFirst(tosearch, "<mark>").contains("<mark>"))
                                continue;
                        }
                        DisplayLines.append("<tr><td width=40%><a href=" + ((PrzepisyDrogoweActivity) getParent()).p.znaki[z][j] +
                                "><img src=" + ((PrzepisyDrogoweActivity) getParent()).p.znaki[z][j] +
                                ".png style='margin:2px;max-width:100%'></a>" +
                                "</td><td><a href=" + ((PrzepisyDrogoweActivity) getParent()).p.znaki[z][j] + ">");
                        mpz = lines2.indexOf("\n");
                        DisplayLines.append("<b>" + lines2.subSequence(mpz + 1, lines2.indexOf("\n", mpz + 1)) + "</b> " +
                                lines2.subSequence(0, mpz) + "</a></td></tr>");
                        Lista.add(((PrzepisyDrogoweActivity) getParent()).p.znaki[z][j]);
                    } catch (IOException ignore) {
                    }
                }
            }
            if (DisplayLines.length() != 0) {
                DisplayLines.insert(0, "<html><head><meta name=\"viewport\" content=\"width=device-width, minimum-scale=1.0, initial-scale=1.0\"></head><body><table>");
                DisplayLines.append("</table>");
            }
        } else {
            DisplayLines.append("<html><head><meta name=\"viewport\" content=\"width=device-width, minimum-scale=0.4, initial-scale=0.4\"></head><body>");

            StringBuilder summary2 = new StringBuilder();
            for (int z = start; z <= end; z++) {
                summary2.delete(0, summary2.length());
                int l = ((PrzepisyDrogoweActivity) getParent()).p.znaki[z].length;
                for (int j = 0; j < l; j++) {
                    try {
                        //FIXME: search
                        if (textView.length() != 0) {
                            stream = getAssets().open(((PrzepisyDrogoweActivity) getParent()).p.znaki[z][j] + ".htm");
                            inputreader = new InputStreamReader(stream);
                            lines2.delete(0, lines2.length());
                            while ((numRead = inputreader.read(bytes, 0, 10000)) >= 0) {
                                lines2.append(bytes, 0, numRead);
                            }
                            stream.close();
                            if (tosearch.length() != 0) {
                                if (!lines2.toString().replaceFirst(tosearch, "<mark>").contains("<mark>"))
                                    continue;
                            }
                        }
                        summary2.append("<a href=" + ((PrzepisyDrogoweActivity) getParent()).p.znaki[z][j] +
                                "><img src=" + ((PrzepisyDrogoweActivity) getParent()).p.znaki[z][j] +
                                ".png style='margin:2px;max-width:100%'></a>");
                        Lista.add(((PrzepisyDrogoweActivity) getParent()).p.znaki[z][j]);
                    } catch (IOException ignore) {
                    }
                }
                if (summary2.length() != 0) {
                    DisplayLines.append("<div width=100%><center>" + summary2 + "</center></div>");
                }
            }
        }

        //FIXME: do we still need this?
       /* if (firstLoad) {
            DisplayLines.append("<br><div style='display:none'>");
            for (int z = 6; z <= 13; z++) {
                for (int j = 0; j < ((PrzepisyDrogoweActivity) getParent()).p.znaki[z].length; j++) {
                    DisplayLines.append("<img src=" + ((PrzepisyDrogoweActivity) getParent()).p.znaki[z][j] + ".png>");
                }
            }
            DisplayLines.append("</div>");
        }*/

        DisplayLines.append("</body></html>");

        DisplayTotal = DisplayLines.toString();
    }

    @Override
    public void onSelected(int i, int position) {
        DisplayIt("");
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        MyActivity = this;

        Db_Number_Of_Selection = PrzepisyDrogoweActivity.DB_ZNAKI_ZAKLADKA;
        Db_Size_Name = PrzepisyDrogoweActivity.DB_ZNAKI_SIZE;

        sp = ((PrzepisyDrogoweActivity) getParent()).sp;
        db = ((PrzepisyDrogoweActivity) getParent()).db;

        LayoutId = R.layout.znaki;
        setContentView(LayoutId);

        webView = findViewById(R.id.webView4);
        b1 = null;
        b2 = null;
        textView = findViewById(R.id.autoCompleteTextView4);
        spinner = findViewById(R.id.spinner4);
        scroller = findViewById(R.id.view4);

        checkbox = findViewById(R.id.checkBox4);
        checkbox.setOnCheckedChangeListener((buttonView, isChecked) -> DisplayIt(""));

        onCreateTab();
    }

    @Override
    boolean loadMyUrl(String url) {
        JavaScriptInterface j = new JavaScriptInterface(MyActivity,
                null, Lista, ((PrzepisyDrogoweActivity) getParent()).p);
        if (textView.length() != 0) {
            j.s(url.replace("file:///android_asset/", ""),
                    "(?![^<]+>)((?i:\\Q" + textView.getText().toString()
                            .replace("\\E", "\\E\\\\E\\Q")
                            .replace("a", "\\E[aąĄ]\\Q")
                            .replace("c", "\\E[cćĆ]\\Q")
                            .replace("e", "\\E[eęĘ]\\Q")
                            .replace("l", "\\E[lłŁ]\\Q")
                            .replace("n", "\\E[nńŃ]\\Q")
                            .replace("o", "\\E[oóÓ]\\Q")
                            .replace("s", "\\E[sśŚ]\\Q")
                            .replace("z", "\\E[zźżŻŹ]\\Q") + "\\E))",
                    false, false);
        } else {
            j.s(url.replace("file:///android_asset/", ""), "", false, false);
        }
        return true;
    }

    @Override
    ArrayAdapter<CharSequence> getMyAdapter() {
        return new MyCustomArrayAdapter<>(this,
                new ArrayList<>(Arrays.asList(getResources().getStringArray(
                        R.array.typyznakow))));
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
            text.setTypeface(null, text.getText().toString().indexOf("Wszystkie") == 0 ?
                    Typeface.BOLD : Typeface.NORMAL);
            text.setSingleLine(false);

            return view;
        }
    }
}
