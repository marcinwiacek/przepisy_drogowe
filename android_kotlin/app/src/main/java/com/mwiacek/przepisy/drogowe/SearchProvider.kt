package com.mwiacek.przepisy.drogowe

import android.app.SearchManager
import android.content.ContentProvider
import android.content.ContentValues
import android.content.UriMatcher
import android.database.Cursor
import android.database.MatrixCursor
import android.net.Uri
import android.preference.PreferenceManager
import android.provider.BaseColumns
import com.fasterxml.jackson.core.JsonFactory
import com.fasterxml.jackson.core.JsonToken
import java.io.IOException
import java.io.InputStream
import java.io.InputStreamReader
import java.util.*

class SearchProvider : ContentProvider() {
    override fun onCreate(): Boolean {
        return true
    }

    override fun query(
        uri: Uri,
        projection: Array<String>?,
        selection: String?,
        selectionArgs: Array<String>?,
        sortOrder: String?
    ): Cursor? {
        val cursor = MatrixCursor(COLUMN_NAMES)
        when (uriMatcher.match(uri)) {
            SEARCH_SUGGEST, SHORTCUT_REFRESH -> {
            }
            else -> throw IllegalArgumentException("Unknown URL $uri")
        }
        if (uri.path == "/search_suggest_query/") {
            return cursor
        }
        val searchString = uri.lastPathSegment!!.lowercase(Locale.getDefault())
        if (searchString.length == 0) return cursor
        val sp = PreferenceManager.getDefaultSharedPreferences(this.context)
        val p = PlikiClass()
        var stream: InputStream
        val bytes = CharArray(20000)
        var numRead: Int
        val lines2 = StringBuilder()
        var inputreader: InputStreamReader
        var rowObject: Array<Any>
        val tosearch = "(?![^<]+>)((?i:\\Q" + uri.lastPathSegment!!
            .replace("\\E", "\\E\\\\E\\Q")
            .replace("a", "\\E[aąĄ]\\Q")
            .replace("c", "\\E[cćĆ]\\Q")
            .replace("e", "\\E[eęĘ]\\Q")
            .replace("l", "\\E[lłŁ]\\Q")
            .replace("n", "\\E[nńŃ]\\Q")
            .replace("o", "\\E[oóÓ]\\Q")
            .replace("s", "\\E[sśŚ]\\Q")
            .replace("z", "\\E[zźżŻŹ]\\Q") + "\\E))"
        if (sp.getBoolean("KodyUN_szukanie", false)) {
            var Kody = false
            try {
                stream = context!!.assets.open("adr/adr3.htm")
                inputreader = InputStreamReader(stream)
                lines2.delete(0, lines2.length)
                while (inputreader.read(bytes, 0, 20000).also { numRead = it } >= 0) {
                    lines2.append(bytes, 0, numRead)
                }
                stream.close()
                if (lines2.toString().replaceFirst(tosearch.toRegex(), "<mark>")
                        .contains("<mark>")
                ) {
                    Kody = true
                }
            } catch (ignore: IOException) {
            }
            if (Kody) {
                //counter++;
                rowObject = arrayOf(
                    3.toString(),
                    "Kody UN",
                    "Znaleziono co najmniej raz " + uri.lastPathSegment,
                    "u " + uri.lastPathSegment,
                    SearchManager.SUGGEST_NEVER_MAKE_SHORTCUT
                )
                cursor.addRow(rowObject)
            } else {
                //counter++;
                rowObject = arrayOf(
                    3.toString(),
                    "Kody UN",
                    "Nie znaleziono " + uri.lastPathSegment,
                    "f " + uri.lastPathSegment,
                    SearchManager.SUGGEST_NEVER_MAKE_SHORTCUT
                )
                cursor.addRow(rowObject)
            }
        }
        if (sp.getBoolean("Znaki_szukanie", true)) {
            var Znak = false
            var l: Int
            for (z in 0..14) {
                l = p.znaki[z].size
                for (j in 0 until l) {
                    try {
                        stream = context!!.assets.open(p.znaki[z][j] + ".htm")
                        inputreader = InputStreamReader(stream)
                        lines2.delete(0, lines2.length)
                        while (inputreader.read(bytes, 0, 20000).also { numRead = it } >= 0) {
                            lines2.append(bytes, 0, numRead)
                        }
                        stream.close()
                        if (!lines2.toString().replaceFirst(tosearch.toRegex(), "<mark>")
                                .contains("<mark>")
                        ) continue
                        Znak = true
                        break
                    } catch (ignore: IOException) {
                    }
                }
                if (Znak) {
                    break
                }
            }
            if (Znak) {
                //counter++;
                rowObject = arrayOf(
                    1.toString(),
                    "Opisy i nazwy znaków",
                    "Znaleziono co najmniej raz " + uri.lastPathSegment,
                    "z " + uri.lastPathSegment,
                    SearchManager.SUGGEST_NEVER_MAKE_SHORTCUT
                )
                cursor.addRow(rowObject)
            } else {
                //counter++;
                rowObject = arrayOf(
                    1.toString(),
                    "Opisy i nazwy znaków",
                    "Nie znaleziono " + uri.lastPathSegment,
                    "f " + uri.lastPathSegment,
                    SearchManager.SUGGEST_NEVER_MAKE_SHORTCUT
                )
                cursor.addRow(rowObject)
            }
        }
        if (sp.getBoolean("Kodeks_szukanie", true)) {
            var Kodeks = false
            try {
                stream = context!!.assets.open("tekst/kodeks.htm")
                inputreader = InputStreamReader(stream)
                lines2.delete(0, lines2.length)
                while (inputreader.read(bytes, 0, 20000).also { numRead = it } >= 0) {
                    lines2.append(bytes, 0, numRead)
                }
                stream.close()
                if (lines2.toString().replaceFirst(tosearch.toRegex(), "<mark>")
                        .contains("<mark>")
                ) {
                    Kodeks = true
                }
            } catch (ignore: IOException) {
            }
            if (Kodeks) {
                //counter++;
                rowObject = arrayOf(
                    2.toString(),
                    "Prawo o ruchu drogowym",
                    "Znaleziono co najmniej raz " + uri.lastPathSegment,
                    "k " + uri.lastPathSegment,
                    SearchManager.SUGGEST_NEVER_MAKE_SHORTCUT
                )
                cursor.addRow(rowObject)
            } else {
                //counter++;
                rowObject = arrayOf(
                    2.toString(),
                    "Prawo o ruchu drogowym",
                    "Nie znaleziono " + uri.lastPathSegment,
                    "f " + uri.lastPathSegment,
                    SearchManager.SUGGEST_NEVER_MAKE_SHORTCUT
                )
                cursor.addRow(rowObject)
            }
        }
        if (sp.getBoolean("Taryfikator_szukanie", true)) {
            var taryfikator = false
            try {
                stream = context!!.assets.open("kary/y.jso")
                val jp = JsonFactory().createParser(stream)
                jp.nextToken()
                jp.nextToken()
                jp.nextToken()
                while (jp.nextToken() != JsonToken.END_ARRAY) {
                    jp.nextToken()
                    jp.nextToken()
                    if (jp.text.replaceFirst(tosearch.toRegex(), "<mark>").contains("<mark>")) {
                        taryfikator = true
                        break
                    }
                    jp.nextToken()
                    jp.nextToken()
                    while (jp.nextToken() != JsonToken.END_ARRAY) {
                        jp.nextToken()
                        jp.nextToken()
                        if (jp.text.replaceFirst(tosearch.toRegex(), "<mark>").contains("<mark>")) {
                            taryfikator = true
                            break
                        }
                        jp.nextToken()
                        jp.nextToken()
                        while (jp.nextToken() != JsonToken.END_ARRAY) {
                            jp.nextToken()
                            jp.nextToken()
                            if (jp.text.replaceFirst(tosearch.toRegex(), "<mark>")
                                    .contains("<mark>")
                            ) {
                                taryfikator = true
                                break
                            }
                            jp.nextToken()
                            jp.nextToken()
                            if (jp.text.replaceFirst(tosearch.toRegex(), "<mark>")
                                    .contains("<mark>")
                            ) {
                                taryfikator = true
                                break
                            }
                            jp.nextToken()
                            jp.nextToken()
                            if (jp.text.replaceFirst(tosearch.toRegex(), "<mark>")
                                    .contains("<mark>")
                            ) {
                                taryfikator = true
                                break
                            }
                            jp.nextToken()
                        }
                        if (taryfikator) {
                            break
                        }
                        jp.nextToken()
                    }
                    if (taryfikator) {
                        break
                    }
                    jp.nextToken()
                }
                jp.close()
                stream.close()
            } catch (ignore: IOException) {
            }
            if (taryfikator) {
                //counter++;
                rowObject = arrayOf(
                    4.toString(),
                    "Taryfikator od 09.06.2012",
                    "Znaleziono co najmniej raz " + uri.lastPathSegment,
                    "t " + uri.lastPathSegment,
                    SearchManager.SUGGEST_NEVER_MAKE_SHORTCUT
                )
                cursor.addRow(rowObject)
            } else {
                //counter++;
                rowObject = arrayOf(
                    4.toString(),
                    "Taryfikator od 09.06.2012",
                    "Nie znaleziono " + uri.lastPathSegment,
                    "f " + uri.lastPathSegment,
                    SearchManager.SUGGEST_NEVER_MAKE_SHORTCUT
                )
                cursor.addRow(rowObject)
            }
        }
        if (sp.getBoolean("KierPoj_szukanie", false)) {
            var KierPoj = false
            try {
                stream = context!!.assets.open("tekst/kierpoj.htm")
                inputreader = InputStreamReader(stream)
                lines2.delete(0, lines2.length)
                while (inputreader.read(bytes, 0, 20000).also { numRead = it } >= 0) {
                    lines2.append(bytes, 0, numRead)
                }
                stream.close()
                if (lines2.toString().replaceFirst(
                        tosearch.toRegex(),
                        "<mark>"
                    ).contains("<mark>")
                ) {
                    KierPoj = true
                }
            } catch (ignore: IOException) {
            }
            if (KierPoj) {
                //counter++;
                rowObject = arrayOf(
                    5.toString(),
                    "Ustawa o kierujących pojazdami",
                    "Znaleziono co najmniej raz " + uri.lastPathSegment,
                    "i " + uri.lastPathSegment,
                    SearchManager.SUGGEST_NEVER_MAKE_SHORTCUT
                )
                cursor.addRow(rowObject)
            } else {
                //counter++;
                rowObject = arrayOf(
                    5.toString(),
                    "Ustawa o kierujących pojazdami",
                    "Nie znaleziono " + uri.lastPathSegment,
                    "f " + uri.lastPathSegment,
                    SearchManager.SUGGEST_NEVER_MAKE_SHORTCUT
                )
                cursor.addRow(rowObject)
            }
        }
        return cursor
    }

    override fun getType(uri: Uri): String? {
        return when (uriMatcher.match(uri)) {
            SEARCH_SUGGEST -> SearchManager.SUGGEST_MIME_TYPE
            SHORTCUT_REFRESH -> SearchManager.SHORTCUT_MIME_TYPE
            else -> throw IllegalArgumentException("Unknown URI $uri")
        }
    }

    override fun insert(uri: Uri, values: ContentValues?): Uri? {
        throw UnsupportedOperationException()
    }

    override fun update(
        uri: Uri,
        values: ContentValues?,
        selection: String?,
        selectionArgs: Array<String>?
    ): Int {
        throw UnsupportedOperationException()
    }

    override fun delete(uri: Uri, selection: String?, selectionArgs: Array<String>?): Int {
        throw UnsupportedOperationException()
    }

    companion object {
        const val AUTHORITY = "com.mwiacek.przepisy.drogowe.SearchProvider"
        private val COLUMN_NAMES = arrayOf(
            BaseColumns._ID,
            SearchManager.SUGGEST_COLUMN_TEXT_1,
            SearchManager.SUGGEST_COLUMN_TEXT_2,
            SearchManager.SUGGEST_COLUMN_INTENT_DATA,
            SearchManager.SUGGEST_COLUMN_SHORTCUT_ID
        )
        private const val SEARCH_SUGGEST = 1
        private const val SHORTCUT_REFRESH = 0
        private val uriMatcher = buildUriMatcher()
        private fun buildUriMatcher(): UriMatcher {
            val matcher = UriMatcher(UriMatcher.NO_MATCH)
            matcher.addURI(AUTHORITY, SearchManager.SUGGEST_URI_PATH_QUERY, SEARCH_SUGGEST)
            matcher.addURI(AUTHORITY, SearchManager.SUGGEST_URI_PATH_QUERY + "/*", SEARCH_SUGGEST)
            matcher.addURI(AUTHORITY, SearchManager.SUGGEST_URI_PATH_SHORTCUT, SHORTCUT_REFRESH)
            matcher.addURI(
                AUTHORITY,
                SearchManager.SUGGEST_URI_PATH_SHORTCUT + "/*",
                SHORTCUT_REFRESH
            )
            return matcher
        }
    }
}