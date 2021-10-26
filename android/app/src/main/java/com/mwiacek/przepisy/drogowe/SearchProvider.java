package com.mwiacek.przepisy.drogowe;

import android.app.SearchManager;
import android.content.ContentProvider;
import android.content.ContentValues;
import android.content.SharedPreferences;
import android.content.UriMatcher;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.preference.PreferenceManager;
import android.provider.BaseColumns;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

public class SearchProvider extends ContentProvider {
    public static final String AUTHORITY = "com.mwiacek.przepisy.drogowe.SearchProvider";

    private static final String[] COLUMN_NAMES = new String[]{
            BaseColumns._ID,
            SearchManager.SUGGEST_COLUMN_TEXT_1,
            SearchManager.SUGGEST_COLUMN_TEXT_2,
            SearchManager.SUGGEST_COLUMN_INTENT_DATA,
            SearchManager.SUGGEST_COLUMN_SHORTCUT_ID};

    private static final int SEARCH_SUGGEST = 1;
    private static final int SHORTCUT_REFRESH = 0;

    private static final UriMatcher uriMatcher = buildUriMatcher();

    private static UriMatcher buildUriMatcher() {
        UriMatcher matcher = new UriMatcher(UriMatcher.NO_MATCH);
        matcher.addURI(AUTHORITY, SearchManager.SUGGEST_URI_PATH_QUERY, SEARCH_SUGGEST);
        matcher.addURI(AUTHORITY, SearchManager.SUGGEST_URI_PATH_QUERY + "/*", SEARCH_SUGGEST);
        matcher.addURI(AUTHORITY, SearchManager.SUGGEST_URI_PATH_SHORTCUT, SHORTCUT_REFRESH);
        matcher.addURI(AUTHORITY, SearchManager.SUGGEST_URI_PATH_SHORTCUT + "/*", SHORTCUT_REFRESH);
        return matcher;
    }

    @Override
    public boolean onCreate() {
        return true;
    }

    @Override
    public Cursor query(Uri uri, String[] projection, String selection, String[] selectionArgs, String sortOrder) {

        MatrixCursor cursor = new MatrixCursor(COLUMN_NAMES);

        switch (uriMatcher.match(uri)) {
            case SEARCH_SUGGEST:
            case SHORTCUT_REFRESH:
                break;
            //String shortcutId = null;
            //if (uri.getPathSegments().size() > 1) {
            //shortcutId = uri.getLastPathSegment();
            //}
            //return refreshShortcut(shortcutId, projection);
            default:
                throw new IllegalArgumentException("Unknown URL " + uri);
        }

        if (uri.getPath().equals("/search_suggest_query/")) {
            return cursor;
        }

        String searchString = uri.getLastPathSegment().toLowerCase();
        if (searchString.length() == 0) return cursor;

        SharedPreferences sp = PreferenceManager.getDefaultSharedPreferences(this.getContext());

        PlikiClass p = new PlikiClass();
        InputStream stream;
        char[] bytes = new char[20000];
        int numRead;
        StringBuilder lines2 = new StringBuilder();
        InputStreamReader inputreader;
        Object[] rowObject;
        String tosearch = "(?![^<]+>)((?i:\\Q" + uri.getLastPathSegment()
                .replace("\\E", "\\E\\\\E\\Q")
                .replace("a", "\\E[aąĄ]\\Q")
                .replace("c", "\\E[cćĆ]\\Q")
                .replace("e", "\\E[eęĘ]\\Q")
                .replace("l", "\\E[lłŁ]\\Q")
                .replace("n", "\\E[nńŃ]\\Q")
                .replace("o", "\\E[oóÓ]\\Q")
                .replace("s", "\\E[sśŚ]\\Q")
                .replace("z", "\\E[zźżŻŹ]\\Q") + "\\E))";

        if (sp.getBoolean("KodyUN_szukanie", false)) {
            boolean Kody = false;
            try {
                stream = getContext().getAssets().open("adr/adr3.htm");
                inputreader = new InputStreamReader(stream);
                lines2.delete(0, lines2.length());

                while ((numRead = inputreader.read(bytes, 0, 20000)) >= 0) {
                    lines2.append(bytes, 0, numRead);
                }

                stream.close();

                if (lines2.toString().replaceFirst(tosearch, "<mark>").contains("<mark>")) {
                    Kody = true;
                }
            } catch (IOException ignore) {
            }
            if (Kody) {
                //counter++;
                rowObject = new Object[]{
                        String.valueOf(3),
                        "Kody UN",
                        "Znaleziono co najmniej raz " + uri.getLastPathSegment(),
                        "u " + uri.getLastPathSegment(),
                        SearchManager.SUGGEST_NEVER_MAKE_SHORTCUT};
                cursor.addRow(rowObject);
            } else {
                //counter++;
                rowObject = new Object[]{
                        String.valueOf(3),
                        "Kody UN",
                        "Nie znaleziono " + uri.getLastPathSegment(),
                        "f " + uri.getLastPathSegment(),
                        SearchManager.SUGGEST_NEVER_MAKE_SHORTCUT};
                cursor.addRow(rowObject);
            }
        }

        if (sp.getBoolean("Znaki_szukanie", true)) {
            boolean Znak = false;
            int l;
            for (int z = 0; z < 15; z++) {
                l = p.znaki[z].length;
                for (int j = 0; j < l; j++) {
                    try {
                        stream = getContext().getAssets().open(p.znaki[z][j] + ".htm");
                        inputreader = new InputStreamReader(stream);
                        lines2.delete(0, lines2.length());
                        while ((numRead = inputreader.read(bytes, 0, 20000)) >= 0) {
                            lines2.append(bytes, 0, numRead);
                        }
                        stream.close();
                        if (!lines2.toString().replaceFirst(tosearch, "<mark>").contains("<mark>"))
                            continue;
                        Znak = true;
                        break;
                    } catch (IOException ignore) {
                    }
                }
                if (Znak) {
                    break;
                }
            }
            if (Znak) {
                //counter++;
                rowObject = new Object[]{
                        String.valueOf(1),
                        "Opisy i nazwy znaków",
                        "Znaleziono co najmniej raz " + uri.getLastPathSegment(),
                        "z " + uri.getLastPathSegment(),
                        SearchManager.SUGGEST_NEVER_MAKE_SHORTCUT};
                cursor.addRow(rowObject);
            } else {
                //counter++;
                rowObject = new Object[]{
                        String.valueOf(1),
                        "Opisy i nazwy znaków",
                        "Nie znaleziono " + uri.getLastPathSegment(),
                        "f " + uri.getLastPathSegment(),
                        SearchManager.SUGGEST_NEVER_MAKE_SHORTCUT};
                cursor.addRow(rowObject);
            }
        }

        if (sp.getBoolean("Kodeks_szukanie", true)) {
            boolean Kodeks = false;
            try {
                stream = getContext().getAssets().open("tekst/kodeks.htm");
                inputreader = new InputStreamReader(stream);
                lines2.delete(0, lines2.length());

                while ((numRead = inputreader.read(bytes, 0, 20000)) >= 0) {
                    lines2.append(bytes, 0, numRead);
                }

                stream.close();

                if (lines2.toString().replaceFirst(tosearch, "<mark>").contains("<mark>")) {
                    Kodeks = true;
                }
            } catch (IOException ignore) {
            }
            if (Kodeks) {
                //counter++;
                rowObject = new Object[]{
                        String.valueOf(2),
                        "Prawo o ruchu drogowym",
                        "Znaleziono co najmniej raz " + uri.getLastPathSegment(),
                        "k " + uri.getLastPathSegment(),
                        SearchManager.SUGGEST_NEVER_MAKE_SHORTCUT};
                cursor.addRow(rowObject);
            } else {
                //counter++;
                rowObject = new Object[]{
                        String.valueOf(2),
                        "Prawo o ruchu drogowym",
                        "Nie znaleziono " + uri.getLastPathSegment(),
                        "f " + uri.getLastPathSegment(),
                        SearchManager.SUGGEST_NEVER_MAKE_SHORTCUT};
                cursor.addRow(rowObject);
            }
        }


        if (sp.getBoolean("Taryfikator_szukanie", true)) {
            boolean taryfikator = false;
            try {
                stream = getContext().getAssets().open("kary/y.jso");
                JsonParser jp = (new JsonFactory()).createParser(stream);

                jp.nextToken();
                jp.nextToken();
                jp.nextToken();
                while (jp.nextToken() != JsonToken.END_ARRAY) {
                    jp.nextToken();
                    jp.nextToken();
                    if (jp.getText().replaceFirst(tosearch, "<mark>").contains("<mark>")) {
                        taryfikator = true;
                        break;
                    }
                    jp.nextToken();
                    jp.nextToken();
                    while (jp.nextToken() != JsonToken.END_ARRAY) {
                        jp.nextToken();
                        jp.nextToken();
                        if (jp.getText().replaceFirst(tosearch, "<mark>").contains("<mark>")) {
                            taryfikator = true;
                            break;
                        }
                        jp.nextToken();
                        jp.nextToken();
                        while (jp.nextToken() != JsonToken.END_ARRAY) {
                            jp.nextToken();
                            jp.nextToken();
                            if (jp.getText().replaceFirst(tosearch, "<mark>").contains("<mark>")) {
                                taryfikator = true;
                                break;
                            }
                            jp.nextToken();
                            jp.nextToken();
                            if (jp.getText().replaceFirst(tosearch, "<mark>").contains("<mark>")) {
                                taryfikator = true;
                                break;
                            }
                            jp.nextToken();
                            jp.nextToken();
                            if (jp.getText().replaceFirst(tosearch, "<mark>").contains("<mark>")) {
                                taryfikator = true;
                                break;
                            }
                            jp.nextToken();

                        }
                        if (taryfikator) {
                            break;
                        }

                        jp.nextToken();
                    }
                    if (taryfikator) {
                        break;
                    }
                    jp.nextToken();
                }

                jp.close();
                stream.close();
            } catch (IOException ignore) {
            }

            if (taryfikator) {
                //counter++;
                rowObject = new Object[]{
                        String.valueOf(4),
                        "Taryfikator od 09.06.2012",
                        "Znaleziono co najmniej raz " + uri.getLastPathSegment(),
                        "t " + uri.getLastPathSegment(),
                        SearchManager.SUGGEST_NEVER_MAKE_SHORTCUT};
                cursor.addRow(rowObject);
            } else {
                //counter++;
                rowObject = new Object[]{
                        String.valueOf(4),
                        "Taryfikator od 09.06.2012",
                        "Nie znaleziono " + uri.getLastPathSegment(),
                        "f " + uri.getLastPathSegment(),
                        SearchManager.SUGGEST_NEVER_MAKE_SHORTCUT};
                cursor.addRow(rowObject);
            }
        }

        if (sp.getBoolean("KierPoj_szukanie", false)) {
            boolean KierPoj = false;
            try {
                stream = getContext().getAssets().open("tekst/kierpoj.htm");
                inputreader = new InputStreamReader(stream);
                lines2.delete(0, lines2.length());

                while ((numRead = inputreader.read(bytes, 0, 20000)) >= 0) {
                    lines2.append(bytes, 0, numRead);
                }

                stream.close();

                if (lines2.toString().replaceFirst(tosearch,
                        "<mark>").contains("<mark>")) {
                    KierPoj = true;
                }
            } catch (IOException ignore) {
            }
            if (KierPoj) {
                //counter++;
                rowObject = new Object[]{
                        String.valueOf(5),
                        "Ustawa o kierujących pojazdami",
                        "Znaleziono co najmniej raz " + uri.getLastPathSegment(),
                        "i " + uri.getLastPathSegment(),
                        SearchManager.SUGGEST_NEVER_MAKE_SHORTCUT};
                cursor.addRow(rowObject);
            } else {
                //counter++;
                rowObject = new Object[]{
                        String.valueOf(5),
                        "Ustawa o kierujących pojazdami",
                        "Nie znaleziono " + uri.getLastPathSegment(),
                        "f " + uri.getLastPathSegment(),
                        SearchManager.SUGGEST_NEVER_MAKE_SHORTCUT};
                cursor.addRow(rowObject);

            }
        }

        return cursor;
    }

    @Override
    public String getType(Uri uri) {
        switch (uriMatcher.match(uri)) {
            case SEARCH_SUGGEST:
                return SearchManager.SUGGEST_MIME_TYPE;
            case SHORTCUT_REFRESH:
                return SearchManager.SHORTCUT_MIME_TYPE;
            default:
                throw new IllegalArgumentException("Unknown URI " + uri);
        }
    }

    @Override
    public Uri insert(Uri uri, ContentValues values) {
        throw new UnsupportedOperationException();
    }

    @Override
    public int update(Uri uri, ContentValues values, String selection, String[] selectionArgs) {
        throw new UnsupportedOperationException();
    }

    @Override
    public int delete(Uri uri, String selection, String[] selectionArgs) {
        throw new UnsupportedOperationException();
    }
}
