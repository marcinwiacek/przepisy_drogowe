package com.mwiacek.przepisy.drogowe;

import android.app.Activity;
import android.app.Dialog;
import android.content.Intent;
import android.net.Uri;
import android.preference.PreferenceManager;
import android.view.GestureDetector;
import android.view.Menu;
import android.view.MotionEvent;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

public class JavaScriptInterface {
    private static final List<String[]> mHistoryURL = new ArrayList<>();
    private static boolean mBackPressed = false;
    private List<String> mURLList;
    private String mCurrentURL;
    private String mToSearch;
    private Activity mContext;
    private Dialog dialog;
    private PlikiClass p;
    private ScrollerWebView webView;
    private ScrollerView scroller;

    JavaScriptInterface(Activity c, Dialog d, List<String> l, PlikiClass p2) {
        mContext = c;
        dialog = d;
        mURLList = l;
        p = p2;
    }

    private void linie(String link, StringBuilder lines, StringBuilder OpisTitle, String tosearch2) {
        if (link.startsWith("q")) {
            StringBuilder lines2 = new StringBuilder(), lines4 = new StringBuilder();
            StringBuilder prev = new StringBuilder();
            int nr = 1;

            try {
                InputStream is = mContext.getAssets().open("kary/y.jso");
                JsonParser jp = (new JsonFactory()).createParser(is);

                jp.nextToken();
                jp.nextToken();
                jp.nextToken();
                while (jp.nextToken() != JsonToken.END_ARRAY) {
                    jp.nextToken();
                    jp.nextToken();
//    				lines2.append("<tr bgcolor=grey><td id=sekcja"+nrsekcji+"><b>"+jp.getText()+"</b></td></tr>");
                    jp.nextToken();
                    jp.nextToken();
                    while (jp.nextToken() != JsonToken.END_ARRAY) {
                        jp.nextToken();
                        jp.nextToken();
                        if (nr == Integer.parseInt(link.substring(1))) {
                            lines.append(jp.getText() + "<br>");//opis
                        }
                        jp.nextToken();
                        jp.nextToken();
                        lines2.delete(0, lines2.length());
                        prev.delete(0, prev.length());
                        while (jp.nextToken() != JsonToken.END_ARRAY) {
                            jp.nextToken();
                            jp.nextToken();
                            if (nr == Integer.parseInt(link.substring(1))) {
                                if (prev.toString().equals("20110524") && jp.getText().equals("20101231")) {
                                    prev.delete(0, prev.length());
                                    prev.append(jp.getText());

                                    jp.nextToken();
                                    jp.nextToken();
                                } else {
                                    lines.append("<br>" + jp.getText());

                                    prev.delete(0, prev.length());
                                    prev.append(jp.getText());

                                    jp.nextToken();
                                    jp.nextToken();

                                    lines.append(": " + jp.getText());
                                }

                                try {
                                    InputStream is2 = mContext.getAssets().open("kary/"
                                            + prev.toString() + ".jso");

                                    jp.nextToken();
                                    jp.nextToken();

                                    if (jp.getText().equals("k.w.")) {
                                        lines.append("<br><div style='margin-left:30px'><b>USTAWA z dnia 20 maja 1971 r. Kodeks Wykroczeń</b></div>");
                                    } else {
                                        JsonParser jp2 = (new JsonFactory()).createParser(is2);

                                        jp2.nextToken();
                                        jp2.nextToken();
                                        jp2.nextToken();
                                        while (jp2.nextToken() != JsonToken.END_ARRAY) {
                                            jp2.nextToken();
                                            jp2.nextToken();
                                            lines4.delete(0, lines4.length());
                                            lines4.append("<br><div style='margin-left:30px'>" + jp2.getText() + "<br><b>");
                                            jp2.nextToken();
                                            jp2.nextToken();
                                            lines4.append(jp2.getText());
                                            jp2.nextToken();
                                            jp2.nextToken();
                                            if (jp2.getText().indexOf(jp.getText()) == 0) {
                                                lines.append(lines4 + "; " + jp2.getText().replaceAll("\\Qc.p.g.\\E", "USTAWY z dnia 13 września 1996 r. o utrzymaniu czystości i porządku w gminach").replaceAll("\\Qk.k.\\E", "USTAWY z dnia 6 czerwca 1997 Kodeks Karny").replaceAll("\\Qk.w.\\E", "USTAWY z dnia 20 maja 1971 r. Kodeks Wykroczeń").replaceAll("\\Qo.o.z.r.\\E", "ROZPORZĄDZENIA MINISTRA TRANSPORTU z dnia 31 lipca 2007 r. w sprawie okresowych ograniczeń oraz zakazu ruchu niektórych rodzajów pojazdów na drogach").replaceAll("\\Qp.r.d.\\E", "USTAWY z dnia 20 czerwca 1997 r. Prawo o ruchu drogowym (dostępna w zakładce \"Treść\")").replaceAll("\\Qu.d.p.\\E", "USTAWY z dnia 21 marca 1985 r. o drogach publicznych").replaceAll("\\Qz.s.d.\\E", "ROZPORZĄDZENIA MINISTRÓW INFRASTRUKTURY ORAZ SPRAW WEWNĘTRZNYCH I ADMINISTRACJI z dnia 31 lipca 2002 r. w sprawie znaków i sygnałów drogowych").replaceAll("\\Qu.t.d.\\E", "USTAWY z dnia 6 września 2001 r. o transporcie drogowym").replaceAll("\\Qh.p.s.\\E", "Rozporządzenia Parlamentu Europejskiego i Rady nr 561/2006 z dnia 15 marca 2006 r. w sprawie harmonizacji niektórych przepisów socjalnych odnoszących się do transportu drogowego oraz zmieniającego rozporządzenie Rady nr 3821/85 i 2135/98, jak również uchylającego rozporządzenie Rady nr 3820/85").replaceAll("\\Qaetr\\E", "Umowy europejskiej dotyczącej pracy załóg pojazdów wykonujących międzynarodowe przewozy drogowe (AETR), sporządzonej w Genewie dnia 1 lipca 1970 r.").replaceAll("\\Qr.u.j.\\E", "Rozporządzenia Rady nr 3821/1985 z dnia 20 grudnia 1985 r. w sprawie urządzeń rejestrujących stosowanych w transporcie drogowym").replaceAll("\\Qu.s.t.c\\E", "USTAWY z dnia 29 lipca 2005 r. o systemie tachografów cyfrowych") + "</b></div>");
                                                break;
                                            }
                                            jp2.nextToken();
                                        }
                                        jp2.close();
                                    }

                                    is2.close();
                                } catch (IOException ignore) {
                                }

                                jp.nextToken();
                            } else {
                                jp.nextToken();
                                jp.nextToken();
                                jp.nextToken();
                                jp.nextToken();
                                jp.nextToken();
                            }
                        }
                        nr++;
                        jp.nextToken();
                    }
                    jp.nextToken();
                }

                jp.close();
                is.close();
            } catch (IOException ignore) {
            }
            if (lines.length() == 0) return;

            OpisTitle.append("Historia zmian i podstawa prawna");
        } else {
            StringBuilder TaryfikatorTitle = new StringBuilder();

            if (tosearch2.length() != 0) {
                StringBuilder lines3 = new StringBuilder();

                p.ReadOpis(link, mContext.getAssets(), lines3, OpisTitle, TaryfikatorTitle);
                if (lines3.length() == 0) return;
                lines.append(lines3.toString().replaceAll(tosearch2,
                        "<ins style='background-color:yellow'>$1</ins>"));
            } else {
                p.ReadOpis(link, mContext.getAssets(), lines, OpisTitle, TaryfikatorTitle);
                if (lines.length() == 0) return;
            }

            if (TaryfikatorTitle.length() != 0) {
                StringBuilder lines2 = new StringBuilder();

                p.ReadMyTaryfikator(lines2, TaryfikatorTitle.toString(),
                        mContext.getAssets(), null, false);

                if (lines2.length() != 0) {
                    lines.append("<table width=100%><tr><td bgcolor=grey><b>Taryfikator od 09.06.2012 - wybrane pozycje</b></td></tr>" + lines2 + "</table>");
                }
            }
        }

//        lines.append("<script>function closeIt(){Android.q(window.pageYOffset);} window.onbeforeunload = closeIt;</script>");

        lines.append("<script>function closeIt(url){Android.q(url,window.pageYOffset);}</script>");
    }

    public void s(String link, String tos, Boolean leftright, Boolean back) {
        mToSearch = tos;
        StringBuilder lines = new StringBuilder();
        StringBuilder OpisTitle = new StringBuilder();
        linie(link, lines, OpisTitle, mToSearch);
        if (lines.length() == 0) return;

        if (dialog == null) {
            dialog = new Dialog(mContext) {
                private final GestureDetector mGestureDetector = new GestureDetector(new CustomGestureListener());

                @Override
                public boolean onPrepareOptionsMenu(Menu menu) {
                    mHistoryURL.clear();
                    if (this.isShowing()) {
                        try {
                            this.cancel();
                        } catch (Exception ignore) {
                        }
                    }
                    return true;
                }

                @Override
                public boolean onTouchEvent(MotionEvent event) {
                    return mGestureDetector.onTouchEvent(event);
                }

                @Override
                public boolean dispatchTouchEvent(MotionEvent e) {
                    super.dispatchTouchEvent(e);
                    return mGestureDetector.onTouchEvent(e);
                }

                @Override
                public void onBackPressed() {
                    if (mHistoryURL.size() > 0) {
                        s(mHistoryURL.get(0)[0], mToSearch, false, true);
                        return;
                    }

                    mHistoryURL.clear();

                    if (this.isShowing()) {
                        try {
                            this.cancel();
                        } catch (Exception ignore) {
                        }
                    }
                }
            };

            ((TextView) dialog.findViewById(android.R.id.title)).setSingleLine(false);

            dialog.setContentView(R.layout.znaki2);
            dialog.setCancelable(true);

            webView = dialog.findViewById(R.id.webView4);
            scroller = dialog.findViewById(R.id.view37);
            scroller.webview = webView;
            webView.sv = scroller;

            scroller.getLayoutParams().width = scroller.myBitmap.getWidth();
            scroller.setLayoutParams(scroller.getLayoutParams());

            webView.getSettings().setJavaScriptEnabled(true);

            if (android.os.Build.VERSION.SDK_INT >= 19) {
                try {
                    Method m;
                    m = webView.getSettings().getClass().getMethod("setDisplayZoomControls", boolean.class);
                    m.invoke(webView.getSettings(), PreferenceManager.getDefaultSharedPreferences(mContext).getBoolean("Kontrolki", false));
                } catch (SecurityException ignore) {
                } catch (NoSuchMethodException ignore) {
                } catch (IllegalArgumentException ignore) {
                } catch (IllegalAccessException ignore) {
                } catch (InvocationTargetException ignore) {
                }
            }

            webView.getSettings().setUseWideViewPort(PreferenceManager.getDefaultSharedPreferences(mContext).getBoolean("Zawijanie", false));

            webView.addJavascriptInterface(new JavaScriptInterface3(), "Android");
            webView.getSettings().setSupportZoom(true);
            webView.getSettings().setBuiltInZoomControls(PreferenceManager.getDefaultSharedPreferences(mContext).getBoolean("Wielkosc", true));
            webView.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
            webView.getSettings().setAppCacheEnabled(false);
            webView.setWebViewClient(
                    new WebViewClient() {
                        @Override
                        public void onPageFinished(WebView view, String url) {
                            super.onPageFinished(view, url);

                            if (mBackPressed) {
                                if (mHistoryURL.size() > 0) {
                                    view.loadUrl("javascript:window.scrollTo(0, "
                                            + Integer.parseInt(mHistoryURL.get(0)[1]) + ");");
                                    mHistoryURL.remove(0);
                                }
                                mBackPressed = false;
                            }
                        }

                        @Override
                        public boolean shouldOverrideUrlLoading(WebView view, String url) {
                            if (url.contains("http")) {
                                Intent intent = new Intent(Intent.ACTION_VIEW);
                                intent.setData(Uri.parse(url));
                                mContext.startActivity(intent);
                                return true;
                            }

                            if (mCurrentURL.equals(url.replace("file:///android_asset/", "")))
                                return true;

                            view.loadUrl("javascript:closeIt('" + mCurrentURL + "');");

                            s(url.replace("file:///android_asset/", ""),
                                    mToSearch, false, false);
                            return true;
                        }
                    }
            );
        }
        dialog.setTitle(OpisTitle);

        mBackPressed = back;

        mCurrentURL = link;
        scroller.Showed = false;
        int scale = (int) (100 * webView.getScale());
        lines.insert(0, "<html><head><meta name=\"viewport\" content=\"minimum-scale=0.1, initial-scale=1.0\"></head><body>");
        lines.append("</body></html>");
        webView.loadDataWithBaseURL("file:///android_asset/", lines.toString(),
                "text/html", "utf-8", null);
        webView.setInitialScale(scale);

        if (!dialog.isShowing()) {
            try {
                dialog.show();
            } catch (Exception ignore) {
            }
        }
    }

    class JavaScriptInterface3 {
        JavaScriptInterface3() {
        }

        @JavascriptInterface
        public void q(String s, int y) {
            String[] myarray = new String[2];
            myarray[0] = s;
            myarray[1] = Integer.toString(y);
            mHistoryURL.add(0, myarray);
        }
    }

    class CustomGestureListener extends GestureDetector.SimpleOnGestureListener {
        public boolean onFling(MotionEvent event1, MotionEvent event2, float distanceX, float distanceY) {
            if (mURLList == null) return true;
            if (event2.getRawX() - event1.getRawX() > 150
                    && Math.abs(event2.getRawY() - event1.getRawY()) < 50) {
                for (int i = 0; i < mURLList.size(); i++) {
                    if (mCurrentURL.equals(mURLList.get(i))) {
                        if (i == 0) {
                            s(mURLList.get(mURLList.size() - 1), mToSearch, true, false);
                        } else {
                            s(mURLList.get(i - 1), mToSearch, true, false);
                        }
                        break;
                    }
                }
            } else if (event2.getRawX() - event1.getRawX() < -150
                    && Math.abs(event2.getRawY() - event1.getRawY()) < 50) {
                for (int i = 0; i < mURLList.size(); i++) {
                    if (mCurrentURL.equals(mURLList.get(i))) {
                        if (i == mURLList.size() - 1) {
                            s(mURLList.get(0), mToSearch, true, false);
                        } else {
                            s(mURLList.get(i + 1), mToSearch, true, false);
                        }
                        break;
                    }
                }
            }
            return true;
        }

        public boolean onDown(MotionEvent event) {
            return true;
        }
    }
}  