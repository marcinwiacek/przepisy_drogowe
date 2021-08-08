package com.mwiacek.przepisy.drogowe;

import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.SystemClock;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.MenuInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Button;
import android.widget.PopupMenu;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;

//Shared between Straz and Przepisy
//1.0
public abstract class OneTabActivity extends Activity {
    private static final String[] Tips = new String[]{
            "zakręt", "ostrzegawcze", "zakaz"
    };
    ArrayAdapter<String> adapter;
    ArrayAdapter<CharSequence> adapter1;
    Activity MyActivity;
    AutoCompleteTextView textView;
    ScrollerWebView webView;
    Button b1, b2;
    Spinner spinner;
    ScrollerView scroller;
    ProgressDialog progressDialog;
    boolean firstLoad = true;
    boolean Kontrolki, Zawijanie;
    boolean internalSearch = true;
    String[] fileNames;
    String DisplayTotal;
    int mSpinnerListaId;
    int SearchCurr, SearchNum;
    int LayoutId;

    DBClass db;
    String Db_Number_Of_Selection;
    String Db_Size_Name;
    SharedPreferences sp;

    protected boolean LoadFromIntent() {
        return false;
    }

    protected void GetDisplayBytes() {
        if (spinner.getSelectedItemPosition() < fileNames.length) {
            try {
                InputStream stream = getAssets().open(fileNames[spinner.getSelectedItemPosition()]);
                byte[] DisplayTotal0 = new byte[stream.available()];
                stream.read(DisplayTotal0, 0, DisplayTotal0.length);
                stream.close();
                DisplayTotal = new String(DisplayTotal0, 0, DisplayTotal0.length);
            } catch (IOException ignore) {
                DisplayTotal = "";
            }
        } else {
            DisplayTotal = "";
        }
    }

    @Override
    protected void onDestroy() {
        db.SetSetting(Db_Size_Name, Integer.toString((int) (100 * webView.getScale())));

        super.onDestroy();
    }

    public void DisplayIt() {
        if (progressDialog != null) return;

        progressDialog = ProgressDialog.show(this, "", "Odświeżanie", true, false);

        if (!firstLoad) {
            MyActivity.runOnUiThread(() -> {
                webView.dispatchTouchEvent(MotionEvent.obtain(
                        SystemClock.uptimeMillis(),
                        SystemClock.uptimeMillis(),
                        MotionEvent.ACTION_DOWN,
                        (float) 0.0,
                        (float) 0.0,
                        0));

                webView.dispatchTouchEvent(MotionEvent.obtain(
                        SystemClock.uptimeMillis(),
                        SystemClock.uptimeMillis(),
                        MotionEvent.ACTION_UP,
                        (float) 0.0,
                        (float) 0.0,
                        0));
            });
        }

        new Thread(() -> {
            GetDisplayBytes();

            scroller.Showed = false;

            MyActivity.runOnUiThread(new Runnable() {
                public void run() {
                    int scale = (int) (100 * webView.getScale());

                    if (android.os.Build.VERSION.SDK_INT >= 19) {
                        Kontrolki = sp.getBoolean("Kontrolki", false);
                        try {
                            Method m;
                            m = webView.getSettings().getClass().getMethod("setDisplayZoomControls", boolean.class);
                            m.invoke(webView.getSettings(), Kontrolki);
                        } catch (SecurityException ignore) {
                        } catch (NoSuchMethodException ignore) {
                        } catch (IllegalArgumentException ignore) {
                        } catch (IllegalAccessException ignore) {
                        } catch (InvocationTargetException ignore) {
                        }
                    }

                    Zawijanie = sp.getBoolean("Zawijanie", false);
                    webView.getSettings().setUseWideViewPort(Zawijanie);

                    if (textView.length() != 0 && internalSearch) {
                        DisplayTotal = DisplayTotal.replaceAll("(?![^<]+>)((?i:\\Q"
                                        + textView.getText().toString()
                                        .replace("\\E", "\\E\\\\E\\Q")
                                        .replace("a", "\\E[aąĄ]\\Q")
                                        .replace("c", "\\E[cćĆ]\\Q")
                                        .replace("e", "\\E[eęĘ]\\Q")
                                        .replace("l", "\\E[lłŁ]\\Q")
                                        .replace("n", "\\E[nńŃ]\\Q")
                                        .replace("o", "\\E[oóÓ]\\Q")
                                        .replace("s", "\\E[sśŚ]\\Q")
                                        .replace("z", "\\E[zźżŻŹ]\\Q")
                                        + "\\E))",
                                "<ins style='background-color:yellow'>$1</ins>");
                    }
                    webView.loadDataWithBaseURL("file:///android_asset/",
                            DisplayTotal.replace("</body>",
                                    "<script>function lustro() {document.body.style.background='black';document.body.style.color='white';} function normalnie() {document.body.style.background='white';document.body.style.color='black';}" +
                                            "function GetY (object) {if (!object) {return 0;} else {return object.offsetTop+GetY(object.offsetParent);}}</script></body>"),
                            "text/html", null, null);

                    DisplayTotal = null;

                    if (sp.getBoolean("Wielkosc2", true)) {
                        if (firstLoad) {
                            if (!db.GetSetting(Db_Size_Name, "").equals("")) {
                                webView.setInitialScale(Integer.parseInt(db.GetSetting(Db_Size_Name, "")));
                            }
                        } else {
                            webView.setInitialScale(scale);
                        }
                    }
                }
            });
        }).start();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);

        if (progressDialog != null) {
            if (progressDialog.isShowing()) {
                try {
                    progressDialog.cancel();
                } catch (Exception ignore) {
                }
            }
            progressDialog = null;
            if (Db_Number_Of_Selection != "") {
                db.SetSetting(Db_Number_Of_Selection,
                        Integer.toString(spinner.getSelectedItemPosition()));
            }
        }
    }

    public void scrollTo() {
    }

    public void setBlack() {
    }

    public void onSelected(int i) {
        DisplayIt();
    }

    public void onCreateTab() {
        ViewGroup.LayoutParams params = scroller.getLayoutParams();
        params.width = scroller.myBitmap.getWidth();
        scroller.setLayoutParams(params);
        scroller.webview = webView;
        webView.sv = scroller;

        webView.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        webView.getSettings().setAppCacheEnabled(false);
        webView.getSettings().setRenderPriority(WebSettings.RenderPriority.HIGH);
        webView.getSettings().setSupportZoom(true);
        webView.getSettings().setBuiltInZoomControls(sp.getBoolean("Wielkosc", true));

        setBlack();

        webView.setWebViewClient(
                new WebViewClient() {
                    @Override
                    public void onPageFinished(WebView view, String url) {
                        super.onPageFinished(view, url);

                        firstLoad = false;

                        scrollTo();

                        if (b1 != null) b1.setEnabled(false);
                        if (textView.length() != 0) {
                            webView.loadUrl(
                                    "javascript:Android.ShowToast(document.getElementsByTagName('ins').length);");
                        } else {
                            if (b2 != null) b2.setEnabled(false);
                            webView.loadUrl("javascript:Android.ShowToast0();");
                        }
                    }

                    @Override
                    public boolean shouldOverrideUrlLoading(WebView view, String url) {
                        if (webView.ev.getX() != 0.0 ||
                                webView.ev.getY() != 0.0 ||
                                webView.ev.getDownTime() != webView.ev.getEventTime()) {
                            return loadMyUrl(url);
                        }
                        return true;
                    }
                }
        );

        webView.getSettings().setJavaScriptEnabled(true);
        webView.addJavascriptInterface(new ThisJavaScriptInterface(this), "Android");

        if (android.os.Build.VERSION.SDK_INT > 10) {
            webView.setOnLongClickListener(v -> {
                PopupMenu popup = new PopupMenu(this, v);
                MenuInflater inflater = popup.getMenuInflater();
                inflater.inflate(R.menu.menu, popup.getMenu());
                getParent().onPrepareOptionsMenu(popup.getMenu());
                popup.show();
                popup.setOnMenuItemClickListener(item ->
                        getParent().onOptionsItemSelected(item)
                );
                return false;
            });
        }

        adapter1 = getMyAdapter();
        adapter1.setDropDownViewResource(R.layout.sspinner);
        spinner.setAdapter(adapter1);
        spinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            public void onItemSelected(AdapterView<?> adapterView, View view, int i, long l) {
                onSelected(i);
            }

            public void onNothingSelected(AdapterView<?> adapterView) {
            }
        });
        if (!LoadFromIntent() && Db_Number_Of_Selection != "") {
            spinner.setSelection(Integer.parseInt(db.GetSetting(
                    Db_Number_Of_Selection, "0")), false);
        }
        if (android.os.Build.VERSION.SDK_INT > 10) {
            spinner.setOnLongClickListener(v -> {
                PopupMenu popup = new PopupMenu(this, v);
                MenuInflater inflater = popup.getMenuInflater();
                inflater.inflate(R.menu.menu, popup.getMenu());
                getParent().onPrepareOptionsMenu(popup.getMenu());
                popup.show();
                popup.setOnMenuItemClickListener(item ->
                        getParent().onOptionsItemSelected(item)
                );
                return false;
            });
        }

        adapter = new ArrayAdapter<>(this, R.layout.tip_item, Tips);
        textView.setAdapter(adapter);
        textView.setImeActionLabel("Szukaj", KeyEvent.KEYCODE_ENTER);
        textView.setOnKeyListener((v, keyCode, event) -> {
            if (event.getAction() == KeyEvent.ACTION_DOWN && keyCode == KeyEvent.KEYCODE_ENTER) {
                DisplayIt();
                return true;
            }
            return false;
        });

        if (b1 != null) {
            b1.setOnClickListener(v -> {
                SearchCurr--;

                webView.loadUrl("javascript:window.scrollTo(0, GetY (document.getElementsByTagName('ins').item(" + (SearchCurr - 1) + ")));");

                if (SearchCurr == 1) v.setEnabled(false);
                b2.setEnabled(true);
            });
        }

        if (b2 != null) {
            b2.setOnClickListener(v -> {
                SearchCurr++;

                webView.loadUrl("javascript:window.scrollTo(0, GetY (document.getElementsByTagName('ins').item(" + (SearchCurr - 1) + ")));");

                b1.setEnabled(SearchCurr != 1);
                if (SearchCurr == SearchNum) v.setEnabled(false);
            });
        }
    }

    ArrayAdapter<java.lang.CharSequence> getMyAdapter() {
        return new CustomArrayAdapter<>(this,
                new ArrayList<>(Arrays.asList(getResources().getStringArray(mSpinnerListaId))));
    }

    boolean loadMyUrl(String url) {
        if (url.contains("http")) {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(Uri.parse(url));
            MyActivity.startActivity(intent);
            return true;
        }
        return false;
    }

    @Override
    protected void onResume() {
        super.onResume();

        webView.getSettings().setBuiltInZoomControls(sp.getBoolean("Wielkosc", true));

        if (android.os.Build.VERSION.SDK_INT >= 19) {
            Kontrolki = sp.getBoolean("Kontrolki", false);
            try {
                Method m;
                m = webView.getSettings().getClass().getMethod("setDisplayZoomControls", boolean.class);
                m.invoke(webView.getSettings(), Kontrolki);
            } catch (SecurityException ignore) {
            } catch (NoSuchMethodException ignore) {
            } catch (IllegalArgumentException ignore) {
            } catch (IllegalAccessException ignore) {
            } catch (InvocationTargetException ignore) {
            }
        }

        Zawijanie = sp.getBoolean("Zawijanie", false);
        webView.getSettings().setUseWideViewPort(Zawijanie);

        if (sp.getBoolean("No_Lock", false)) {
            (getParent()).getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
                    WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
                    WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);

        } else {
            (getParent()).getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
                    WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
                    WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
        }
    }

    class ThisJavaScriptInterface {
        ThisJavaScriptInterface(Context c) {
        }

        @JavascriptInterface
        public void ShowToast0() {
            if (progressDialog != null) {
                if (progressDialog.isShowing()) {
                    try {
                        progressDialog.cancel();
                    } catch (Exception ignore) {
                    }
                }
                progressDialog = null;
                if (Db_Number_Of_Selection != "") {
                    db.SetSetting(Db_Number_Of_Selection,
                            Integer.toString(spinner.getSelectedItemPosition()));
                }
            }
        }

        @JavascriptInterface
        public void ShowToast(int Numberr) {
            SearchNum = Numberr;
            SearchCurr = 0;

            Toast.makeText(MyActivity, "Ilość wyników: " + (SearchNum), Toast.LENGTH_SHORT).show();

            if (b2 != null) {
                MyActivity.runOnUiThread(() -> {
                    b2.setEnabled(SearchNum > 0);
                });
            }

            ShowToast0();
        }
    }

    class CustomArrayAdapter<T> extends ArrayAdapter<T> {
        CustomArrayAdapter(Context ctx, ArrayList<T> objects) {
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
            text.setTypeface(null, Typeface.NORMAL);
            text.setSingleLine(false);

            return view;
        }
    }
}
