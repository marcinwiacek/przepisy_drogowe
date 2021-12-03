package com.mwiacek.przepisy.drogowe;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.KeyEvent;

public class InneActivity extends OneTabActivity {
    @Override
    protected boolean LoadFromIntent() {
        if (((PrzepisyDrogoweActivity) getParent()).in != null) {
            Uri intentData = ((PrzepisyDrogoweActivity) getParent()).in.getData();
            if (intentData != null) {
                if (intentData.toString().charAt(0) == 'u') {
                    textView.setText(intentData.toString().substring(2));

                    ((PrzepisyDrogoweActivity) getParent()).in = null;

                    spinner.setSelection(11, false);

                    return true;
                }
            }
        }
        return false;
    }

    @Override
    protected void GetDisplayBytes() {
        if (spinner.getSelectedItemPosition() == 8) {
            StringBuilder DisplayLines = new StringBuilder();
            StringBuilder TaryfikatorTitle = new StringBuilder();

            DisplayLines.append("<html><head><meta name=\"viewport\" content=\"minimum-scale=0.1, initial-scale=1.0\"></head><body>");

            ((PrzepisyDrogoweActivity) getParent()).p.ReadOpis("d/d39",
                    getAssets(), DisplayLines, null, TaryfikatorTitle);

            DisplayLines.append("<table><tr><td bgcolor=grey><center><b>Taryfikator od 09.06.2012 - wybrane pozycje</b></center></td></tr>");
            ((PrzepisyDrogoweActivity) getParent()).p.ReadMyTaryfikator(DisplayLines,
                    TaryfikatorTitle.toString(), MyActivity.getAssets(),
                    null, false);
            DisplayLines.append("</table></body></html>");
            DisplayTotal = DisplayLines.toString();
        } else {
            super.GetDisplayBytes();
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        MyActivity = this;

        mSpinnerListaId = R.array.typyinne;
        Db_Number_Of_Selection = PrzepisyDrogoweActivity.DB_INNE_ZAKLADKA;
        Db_Size_Name = PrzepisyDrogoweActivity.DB_INNE_SIZE;

        sp = ((PrzepisyDrogoweActivity) getParent()).sp;
        db = ((PrzepisyDrogoweActivity) getParent()).db;

        fileNames = new String[16];
        fileNames[0] = "nr.htm";
        fileNames[1] = "alkohol/alkoinfo.htm";
        fileNames[2] = "alkohol/alkolicz.htm";
        fileNames[3] = "kierruch.htm";
        fileNames[4] = "klima.htm";
        fileNames[5] = "oleje.htm";
        fileNames[6] = "opony/opony.htm";
        fileNames[7] = "prawko.htm";
        fileNames[8] = "";
        fileNames[9] = "speed/sp_licz.htm";
        fileNames[10] = "speed/sp_pom.htm";
        fileNames[11] = "adr/adr3.htm";
        fileNames[12] = "adr/adr2.htm";
        fileNames[13] = "adr/adr.htm";
        fileNames[14] = "linki.htm";
        fileNames[15] = "wyppoj.htm";

        LayoutId = R.layout.inne;
        setContentView(LayoutId);

        webView = findViewById(R.id.webView1);
        b1 = findViewById(R.id.button1l);
        b2 = findViewById(R.id.button1r);
        textView = findViewById(R.id.autoCompleteTextView1);
        spinner = findViewById(R.id.spinner1);
        scroller = findViewById(R.id.view1);

        onCreateTab();
    }

    boolean loadMyUrl(String url) {
        if (url.contains("http")) {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(Uri.parse(url));
            MyActivity.startActivity(intent);
        } else {
            JavaScriptInterface j = new JavaScriptInterface(MyActivity, null,
                    null, ((PrzepisyDrogoweActivity) getParent()).p);
            j.s(url.replace("file:///android_asset/", ""), "",
                    false, false);
        }
        return true;
    }

    @Override
    public void onSelected(int i, int position) {
        DisplayIt("");
    }

    //Potrzebne przy szukaniu
    @Override
    protected void onResume() {
        super.onResume();

        if (((PrzepisyDrogoweActivity) getParent()).in != null) {
            Uri intentData = ((PrzepisyDrogoweActivity) getParent()).in.getData();
            if (intentData != null) {
                if (intentData.toString().charAt(0) == 'u') {
                    textView.setText(intentData.toString().substring(2));
                    ((PrzepisyDrogoweActivity) getParent()).in = null;
                    if (spinner.getSelectedItemPosition() != 11) {
                        spinner.setSelection(11);
                    } else {
                        textView.dispatchKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN,
                                KeyEvent.KEYCODE_ENTER));
                    }
                }
            }
        }
    }
}
