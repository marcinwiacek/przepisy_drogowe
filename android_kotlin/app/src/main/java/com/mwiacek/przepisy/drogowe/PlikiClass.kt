package com.mwiacek.przepisy.drogowe

import android.content.res.AssetManager
import com.fasterxml.jackson.core.JsonFactory
import com.fasterxml.jackson.core.JsonToken
import java.io.BufferedReader
import java.io.IOException
import java.io.InputStreamReader
import java.util.*

class PlikiClass internal constructor() {
    @JvmField
    var znaki: Array<Array<String>>
    val znaki1 = arrayOf(
        arrayOf(
            "a/a01", "a/a02", "a/a03", "a/a04", "a/a05", "a/a06a", "a/a06b", "a/a06c",
            "a/a06d", "a/a06e", "a/a07", "a/a08", "a/a09", "a/a10", "a/a11",
            "a/a11a", "a/a12a", "a/a12b", "a/a12c", "a/a13", "a/a14",
            "a/a15", "a/a16", "a/a17", "a/a18a", "a/a18b", "a/a19", "a/a20",
            "a/a21", "a/a22", "a/a23", "a/a24", "a/a25", "a/a26", "a/a27",
            "a/a28", "a/a29", "a/a30", "a/a31", "a/a31odwrocony",
            "a/a32", "a/a33", "a/a34"
        ),
        arrayOf(
            "b/b01", "b/b01_godziny", "b/b02", "b/b03", "b/b03_04", "b/b03_04_10",
            "b/b03a", "b/b04", "b/b05", "b/b05_6ton", "b/b06", "b/b06_08",
            "b/b06_08_09", "b/b07", "b/b07_5ton", "b/b08", "b/b09", "b/b09_12",
            "b/b10", "b/b11", "b/b12", "b/b13", "b/b13_14", "b/b13a", "b/b14",
            "b/b15", "b/b16", "b/b17", "b/b18", "b/b19", "b/b20", "b/b21",
            "b/b22", "b/b23", "b/b24", "b/b25", "b/b26", "b/b27", "b/b28",
            "b/b29", "b/b30", "b/b31", "b/b32", "b/b32a", "b/b32b", "b/b32c",
            "b/b32d", "b/b32e", "b/b32f", "b/b33", "b/b34", "b/b35",
            "b/b35_ponad", "b/b35_w_godz", "b/b35_all", "b/b36", "b/b37",
            "b/b38", "b/b39", "b/b40", "b/b41", "b/b42", "b/b43", "b/b44"
        ),
        arrayOf(
            "c/c01", "c/c02", "c/c03", "c/c04", "c/c05", "c/c06", "c/c07", "c/c08",
            "c/c09", "c/c10", "c/c11", "c/c12", "c/c13", "c/c13_16_1",
            "c/c13_16_2", "c/c13_16_3", "c/c13a", "c/c14", "c/c15", "c/c16",
            "c/c16a", "c/c17", "c/c18", "c/c19"
        ),
        arrayOf(
            "d/d01", "d/d02", "d/d03", "d/d04a", "d/d04b", "d/d04b_2", "d/d05",
            "d/d06", "d/d06a", "d/d06b", "d/d07", "d/d08", "d/d09", "d/d10",
            "d/d11", "d/d12", "d/d13", "d/d13a", "d/d13b", "d/d14", "d/d14a",
            "d/d14a_2", "d/d14b", "d/d15", "d/d16", "d/d17", "d/d18", "d/d18a",
            "d/d18b", "d/d19", "d/d19a", "d/d20", "d/d20a", "d/d21", "d/d21a",
            "d/d22", "d/d23", "d/d23a", "d/d24", "d/d25", "d/d25_2", "d/d26",
            "d/d26a", "d/d26b", "d/d26c", "d/d26c_2", "d/d26d", "d/d27", "d/d28",
            "d/d29", "d/d30", "d/d31", "d/d32", "d/d33", "d/d34", "d/d34a",
            "d/d35", "d/d35a", "d/d36", "d/d36a", "d/d37", "d/d38", "d/d39",
            "d/d39a", "d/d40", "d/d41", "d/d42", "d/d43", "d/d44", "d/d45",
            "d/d46", "d/d47", "d/d48", "d/d48_2", "d/d49", "d/d50", "d/d51",
            "d/d51a", "d/d51b", "d/d52", "d/d53", "d/d54", "d/d55"
        ),
        arrayOf(
            "e/e01", "e/e01_2", "e/e01_3", "e/e01_4", "e/e01_5", "e/e01_6", "e/e01_7",
            "e/e01a", "e/e01a_2", "e/e01b", "e/e01b_2", "e/e02a", "e/e02a_1",
            "e/e02a_2", "e/e02a_3", "e/e02a_4", "e/e02a_5", "e/e02a_6",
            "e/e02b", "e/e02c", "e/e02d", "e/e02e", "e/e02f", "e/e03",
            "e/e03_2", "e/e04", "e/e04_2", "e/e05", "e/e05a", "e/e06",
            "e/e06a", "e/e06a_2", "e/e06b", "e/e06c", "e/e06_wz1", "e/e06_wz2",
            "e/e06_wz3", "e/e06_wz4", "e/e07", "e/e07_2", "e/e08",
            "e/e08_2", "e/e09", "e/e10", "e/e10_2", "e/e10_3", "e/e11",
            "e/e11_2", "e/e11_3", "e/e11_4", "e/e12", "e/e12a", "e/e12a_2",
            "e/e_d18", "e/e_d30", "e/e_przem", "e/e13", "e/e14", "e/e14_2",
            "e/e14a", "e/e15a", "e/e15b", "e/e15c", "e/e15d",
            "e/e16", "e/e17a", "e/e18a",
            "e/e19a", "e/e20", "e/e20_2", "e/e21", "e/e22a", "e/e22b",
            "e/e22b_2", "e/e22c"
        ),
        arrayOf(
            "f/f01", "f/f02", "f/f02a", "f/f03", "f/f04", "f/f05", "f/f06",
            "f/f07", "f/f07_2", "f/f07_3", "f/f07_4", "f/f07_5", "f/f07_6",
            "f/f07_7", "f/f07_8", "f/f08", "f/f09", "f/f10", "f/f11", "f/f12",
            "f/f13", "f/f14a", "f/f14b", "f/f14c", "f/f15", "f/f16",
            "f/f17", "f/f18", "f/f18a", "f/f18b", "f/f19", "f/f20",
            "f/f21", "f/f21_2", "f/f21_3", "f/f22", "f/f22a"
        ),
        arrayOf(
            "t/t01", "t/t01a", "t/t01b", "t/t02", "t/t03", "t/t03a", "t/t04",
            "t/t05", "t/t06a", "t/t06b", "t/t06c", "t/t06d", "t/t07", "t/t08",
            "t/t09", "t/t10", "t/t11", "t/t12", "t/t13", "t/t14", "t/t14a",
            "t/t14b", "t/t14c", "t/t14d", "t/t15", "t/t16", "t/t16a",
            "t/t17", "t/t18", "t/t18a", "t/t18b", "t/t18c", "t/t19",
            "t/t20", "t/t21", "t/t22", "t/t23a", "t/t23b", "t/t23c",
            "t/t23d", "t/t23e", "t/t23f", "t/t23g", "t/t23h", "t/t23i",
            "t/t23j", "t/t24", "t/t25a", "t/t25b", "t/t25c", "t/t26",
            "t/t27", "t/t28", "t/t28a", "t/t29", "t/t30", "t/t30a",
            "t/t30b", "t/t30c", "t/t30d", "t/t30e", "t/t30f", "t/t30g",
            "t/t30h", "t/t30i", "t/t31", "t/t32", "t/t33", "t/t34"
        ),
        arrayOf(
            "g/g01a", "g/g01b", "g/g01c", "g/g01d", "g/g01e", "g/g01f", "g/g02",
            "g/g03", "g/g04"
        ),
        arrayOf(
            "at_bt/at1", "at_bt/at2", "at_bt/at3", "at_bt/at4", "at_bt/at5",
            "at_bt/bt1", "at_bt/bt2", "at_bt/bt3", "at_bt/bt4"
        ),
        arrayOf(
            "r/r1", "r/r1a", "r/r1b", "r/r2", "r/r2a", "r/r3", "r/r4", "r/r4_2",
            "r/r4_3", "r/r4a", "r/r4b", "r/r4c", "r/r4d", "r/r4e"
        ),
        arrayOf("w/w1", "w/w2", "w/w3", "w/w4", "w/w5", "w/w6", "w/w7"),
        arrayOf(
            "p/p01", "p/p01a", "p/p01b", "p/p01c", "p/p01d", "p/p01e", "p/p02",
            "p/p02a", "p/p02b", "p/p03", "p/p03a", "p/p03b", "p/p04", "p/p05",
            "p/p06", "p/p06a", "p/p07a", "p/p07b", "p/p07c", "p/p07d", "p/p08a",
            "p/p08b", "p/p08c", "p/p08d", "p/p08e", "p/p08f", "p/p08g", "p/p08h",
            "p/p08i", "p/p09", "p/p09a", "p/p09b", "p/p10", "p/p11", "p/p12",
            "p/p13", "p/p14", "p/p15", "p/p16", "p/p17", "p/p18", "p/p19",
            "p/p20", "p/p21", "p/p22", "p/p23", "p/p24", "p/p25", "p/p26", "p/p27"
        ),
        arrayOf(
            "s/s01", "s/s01a", "s/s02", "s/s03", "s/s03a", "s/s04", "s/s05", "s/s06",
            "s/s07"
        ),
        arrayOf("sb_st/sb", "sb_st/st", "sb_st/stk", "sb_st/stt1", "sb_st/stt2"),
        arrayOf("inne/e15e", "inne/e15f", "inne/e15g", "inne/e15h", "inne/suwak"),
        arrayOf(""),
        arrayOf(
            "u/u01a", "u/u01b", "u/u01c", "u/u01d", "u/u01e", "u/u01f", "u/u02",
            "u/u03a", "u/u03b", "u/u03c", "u/u03d", "u/u03e", "u/u04a",
            "u/u04b", "u/u04c", "u/u05a", "u/u05b", "u/u05c", "u/u06a",
            "u/u06b", "u/u06c", "u/u06d", "u/u07", "u/u08", "u/u09a",
            "u/u09b", "u/u09c", "u/u10a", "u/u10b", "u/u11a", "u/u11b",
            "u/u12a", "u/u12b", "u/u12c", "u/u13a", "u/u13b", "u/u13c",
            "u/u14a", "u/u14b", "u/u14c", "u/u14d", "u/u14e", "u/u15a",
            "u/u15b", "u/u16a", "u/u16b", "u/u16c", "u/u16d", "u/u17",
            "u/u18a", "u/u18b", "u/u19", "u/u20a", "u/u20b", "u/u20c",
            "u/u20d", "u/u21a", "u/u21b", "u/u21c", "u/u21d", "u/u21e",
            "u/u21f", "u/u22", "u/u23a", "u/u23b", "u/u23c", "u/u23d",
            "u/u24", "u/u25a", "u/u25b", "u/u25c", "u/u26", "u/u26a",
            "u/u26b", "u/u26c", "u/u26d", "u/u27", "u/u28", "u/wiatr",
            "u/wahadlo", "u/pogoda", "u/tablica", "u/ostrzeg", "u/speed"
        )
    )
    val znaki2 = arrayOf(
        arrayOf(
            "a/a01", "a/a02", "a/a03", "a/a04", "a/a05", "a/a06a", "a/a06b",
            "a/a06c", "a/a06d", "a/a06e", "a/a07", "a/a08", "a/a09",
            "a/a10", "a/a11", "a/a11a", "a/a12a", "a/a12b", "a/a12c",
            "a/a13", "a/a14", "a/a15", "a/a16", "a/a17", "a/a18a",
            "a/a18b", "a/a19", "a/a20", "a/a21", "a/a22", "a/a23",
            "a/a24", "a/a25", "a/a26", "a/a27", "a/a28", "a/a29", "a/a30",
            "a/a31", "a/a32", "a/a33", "a/a34"
        ),
        arrayOf(
            "b/b01", "b/b02", "b/b03", "b/b03a", "b/b04", "b/b05", "b/b06", "b/b07",
            "b/b08", "b/b09", "b/b10", "b/b11", "b/b12", "b/b13", "b/b13a",
            "b/b14", "b/b15", "b/b16", "b/b17", "b/b18", "b/b19", "b/b20",
            "b/b21", "b/b22", "b/b23", "b/b24", "b/b25", "b/b26", "b/b27",
            "b/b28", "b/b29", "b/b30", "b/b31", "b/b32", "b/b33", "b/b34",
            "b/b35", "b/b36", "b/b37", "b/b38", "b/b39", "b/b40", "b/b41",
            "b/b42", "b/b43", "b/b44"
        ),
        arrayOf(
            "c/c01", "c/c02", "c/c03", "c/c04", "c/c05", "c/c06", "c/c07", "c/c08",
            "c/c09", "c/c10", "c/c11", "c/c12", "c/c13", "c/c13a", "c/c14",
            "c/c15", "c/c16", "c/c16a", "c/c17", "c/c18", "c/c19"
        ),
        arrayOf(
            "d/d01", "d/d02", "d/d03", "d/d04a", "d/d04b", "d/d05", "d/d06", "d/d06a",
            "d/d06b", "d/d07", "d/d08", "d/d09", "d/d10", "d/d11", "d/d12",
            "d/d13", "d/d13a", "d/d14", "d/d15", "d/d16", "d/d17", "d/d18",
            "d/d18a", "d/d18b", "d/d19", "d/d20", "d/d21", "d/d21a", "d/d22",
            "d/d23", "d/d23a", "d/d24", "d/d25", "d/d26", "d/d26a", "d/d26b",
            "d/d26c", "d/d26d", "d/d27", "d/d28", "d/d29", "d/d30", "d/d31",
            "d/d32", "d/d33", "d/d34", "d/d34a", "d/d35", "d/d35a", "d/d36",
            "d/d36a", "d/d37", "d/d38", "d/d39", "d/d39a", "d/d40", "d/d41",
            "d/d42", "d/d43", "d/d44", "d/d45", "d/d46", "d/d47", "d/d48",
            "d/d49", "d/d50", "d/d51", "d/d51a", "d/d51b", "d/d52", "d/d53",
            "d/d54", "d/d55"
        ),
        arrayOf(
            "e/e01", "e/e01a", "e/e01b", "e/e02a", "e/e02b", "e/e02c", "e/e02d",
            "e/e02e", "e/e02f", "e/e03", "e/e04", "e/e05", "e/e06", "e/e06a",
            "e/e06b", "e/e06c", "e/e07", "e/e08", "e/e09", "e/e10", "e/e11",
            "e/e12", "e/e12a", "e/e13", "e/e14", "e/e14a", "e/e15a", "e/e15b",
            "e/e15c", "e/e15d", "e/e16",
            "e/e17a", "e/e18a", "e/e19a", "e/e20", "e/e21", "e/e22a", "e/e22b",
            "e/e22c"
        ),
        arrayOf(
            "f/f01", "f/f02", "f/f02a", "f/f03", "f/f04", "f/f05", "f/f06", "f/f07",
            "f/f08", "f/f09", "f/f10", "f/f11", "f/f12", "f/f13", "f/f14a",
            "f/f14b", "f/f14c", "f/f15", "f/f16", "f/f17", "f/f18", "f/f19",
            "f/f20", "f/f21", "f/f22"
        ),
        arrayOf(
            "t/t01", "t/t01a", "t/t01b", "t/t02", "t/t03", "t/t03a", "t/t04", "t/t05",
            "t/t06a", "t/t06b", "t/t06c", "t/t06d", "t/t07", "t/t08", "t/t09",
            "t/t10", "t/t11", "t/t12", "t/t13", "t/t14", "t/t15", "t/t16",
            "t/t17", "t/t18", "t/t19", "t/t20", "t/t21", "t/t22", "t/t23a",
            "t/t23b", "t/t23c", "t/t23d", "t/t23e", "t/t23f", "t/t23g",
            "t/t23h", "t/t23i", "t/t23j", "t/t24", "t/t25a", "t/t25b",
            "t/t25c", "t/t26", "t/t27", "t/t28", "t/t29", "t/t30", "t/t31",
            "t/t32", "t/t33", "t/t34"
        ),
        arrayOf(
            "g/g01a", "g/g01b", "g/g01c", "g/g01d", "g/g01e", "g/g01f", "g/g02",
            "g/g03", "g/g04"
        ),
        arrayOf(
            "at_bt/at1", "at_bt/at2", "at_bt/at3", "at_bt/at4", "at_bt/at5",
            "at_bt/bt1", "at_bt/bt2", "at_bt/bt3", "at_bt/bt4"
        ),
        arrayOf(
            "r/r1", "r/r1a", "r/r1b", "r/r2", "r/r2a", "r/r3", "r/r4", "r/r4a",
            "r/r4b", "r/r4c", "r/r4d", "r/r4e"
        ),
        arrayOf("w/w1", "w/w2", "w/w3", "w/w4", "w/w5", "w/w6", "w/w7"),
        arrayOf(
            "p/p01", "p/p02", "p/p03", "p/p04", "p/p05", "p/p06", "p/p07a",
            "p/p07b", "p/p08a", "p/p08b", "p/p08c", "p/p09", "p/p10",
            "p/p11", "p/p12", "p/p13", "p/p14", "p/p15", "p/p16", "p/p17",
            "p/p18", "p/p19", "p/p20", "p/p21", "p/p22", "p/p23", "p/p24",
            "p/p25", "p/p26", "p/p27"
        ),
        arrayOf(
            "s/s01", "s/s01a", "s/s02", "s/s03", "s/s03a", "s/s04", "s/s05",
            "s/s06", "s/s07"
        ),
        arrayOf("sb_st/sb", "sb_st/st", "sb_st/stk", "sb_st/stt1", "sb_st/stt2"),
        arrayOf("inne/e15e", "inne/e15f", "inne/e15g", "inne/e15h", "inne/suwak"),
        arrayOf(""),
        arrayOf()
    )

    fun ReadOpis(
        Nazwa: String,
        assetManager: AssetManager,
        lines: StringBuilder,
        OpisTitle: StringBuilder?,
        TaryfikatorTitle: StringBuilder
    ) {
        try {
            val stream = assetManager.open("$Nazwa.htm")
            val buffReader = BufferedReader(InputStreamReader(stream))
            val s = buffReader.readLine()
            lines.append("<center><img src=").append(Nazwa)
            if (Nazwa == "d/d39" || Nazwa == "d/d39a") {
                lines.append("_big")
            }
            lines.append(".png style='max-width:100%'></center>")
            if (OpisTitle != null) {
                when (Nazwa[0]) {
                    'a' -> when (Nazwa[1]) {
                        '/' -> OpisTitle.append("Znak ostrzegawczy")
                        't' -> OpisTitle.append("Dodatkowy znak dla kierujących tramwajami")
                    }
                    'b' -> when (Nazwa[1]) {
                        '/' -> OpisTitle.append("Znak zakazu")
                        't' -> OpisTitle.append("Dodatkowy znak dla kierujących tramwajami")
                    }
                    'c' -> OpisTitle.append("Znak nakazu")
                    'd' -> OpisTitle.append("Znak informacyjny")
                    'e' -> OpisTitle.append("Znak kierunku i miejscowości")
                    'f' -> OpisTitle.append("Znak uzupełniający")
                    'g' -> OpisTitle.append("Dodatkowy znak przed przejazdami kolejowymi")
                    'i' -> OpisTitle.append("Znak")
                    'p' -> OpisTitle.append("Znak poziomy")
                    'r' -> OpisTitle.append("Dodatkowy znak szlaków rowerowych")
                    's' -> when (Nazwa[1]) {
                        'b' -> OpisTitle.append("Sygnał świetlny dla kierujących pojazdami wykonującymi odpłatny przewóz na regularnych liniach")
                        '/' -> OpisTitle.append("Sygnał świetlny dla kierujących i pieszych")
                    }
                    't' -> OpisTitle.append("Tabliczka")
                    'w' -> OpisTitle.append("Dodatkowy znak dla kierujących pojazdami wojskowymi")
                    'u' -> OpisTitle.append("Urządzenie bezpieczeństwa ruchu drogowego")
                }
                OpisTitle.append(" ").append(buffReader.readLine())
                if (s[0] == '"') {
                    OpisTitle.append(" ").append(s)
                } else {
                    OpisTitle.append(" \"").append(s).append("\"")
                }
            } else {
                buffReader.readLine()
            }
            TaryfikatorTitle.append(buffReader.readLine())
            if (TaryfikatorTitle.length == 1) TaryfikatorTitle.delete(0, 1)
            var line: String?
            while (buffReader.readLine().also { line = it } != null) {
                lines.append(line).append(" ")
            }
            stream.close()
        } catch (ignore: IOException) {
        }
    }

    fun ReadTaryfikator2(
        lines2: StringBuilder,
        Nazwa: String?,
        SearchFor: String,
        assetManager: AssetManager,
        sss: ArrayList<CharSequence?>?,
        ShowSearch: Boolean
    ) {
        val lines = StringBuilder()
        var first = true
        sss?.clear()
        try {
            val `is` = assetManager.open(Nazwa!!)
            val jp = JsonFactory().createParser(`is`)
            jp.nextToken()
            jp.nextToken()
            jp.nextToken()
            if (SearchFor.length != 0) {
                val tosearch = "(?![^<]+>)((?i:\\Q" + SearchFor
                    .replace("\\E", "\\E\\\\E\\Q")
                    .replace("a", "\\E[aąĄ]\\Q")
                    .replace("c", "\\E[cćĆ]\\Q")
                    .replace("e", "\\E[eęĘ]\\Q")
                    .replace("l", "\\E[lłŁ]\\Q")
                    .replace("n", "\\E[nńŃ]\\Q")
                    .replace("o", "\\E[oóÓ]\\Q")
                    .replace("s", "\\E[sśŚ]\\Q")
                    .replace("z", "\\E[zźżŻŹ]\\Q") + "\\E))"
                while (jp.nextToken() != JsonToken.END_ARRAY) {
                    lines.delete(0, lines.length)
                    jp.nextToken()
                    jp.nextToken()
                    lines.append(jp.text + "<br><b>")
                    jp.nextToken()
                    jp.nextToken()
                    lines.append(jp.text + "; ")
                    jp.nextToken()
                    jp.nextToken()
                    lines.append(jp.text + "</b></td></tr>")
                    jp.nextToken()
                    if (!lines.toString().replaceFirst(tosearch.toRegex(), "<mark>")
                            .contains("<mark>")
                    ) continue
                    if (first) {
                        lines2.append("<tr bgcolor=silver><td>")
                    } else {
                        lines2.append("<tr><td>")
                    }
                    if (ShowSearch) {
                        lines2.append(
                            lines.toString().replace(
                                tosearch.toRegex(),
                                "<ins style='background-color:yellow'>$1</ins>"
                            )
                        )
                    } else {
                        lines2.append(lines)
                    }
                    first = !first
                }
            } else {
                while (jp.nextToken() != JsonToken.END_ARRAY) {
                    if (first) {
                        lines2.append("<tr bgcolor=silver>")
                    } else {
                        lines2.append("<tr>")
                    }
                    jp.nextToken()
                    jp.nextToken()
                    lines2.append("<td>" + jp.text + "<br><b>")
                    jp.nextToken()
                    jp.nextToken()
                    lines2.append(jp.text + "; ")
                    jp.nextToken()
                    jp.nextToken()
                    lines2.append(jp.text + "</b></td></tr>")
                    jp.nextToken()
                    first = !first
                }
            }
            jp.close()
            `is`.close()
        } catch (ignore: IOException) {
        }
    }

    fun ReadMyTaryfikator(
        lines2: StringBuilder,
        SearchFor: String,
        assetManager: AssetManager,
        s2: ArrayList<CharSequence?>?,
        ShowSearch: Boolean
    ) {
        val lines4 = StringBuilder()
        val lines3 = StringBuilder()
        val lines = StringBuilder()
        var first: Boolean
        var nrsekcji = 1
        var nr = 1
        s2?.clear()
        try {
            val `is` = assetManager.open("kary/y.jso")
            val jp = JsonFactory().createParser(`is`)
            if (SearchFor.length != 0) {
                val tosearch: String
                tosearch = if (ShowSearch) {
                    "(?![^<]+>)((?i:\\Q" + SearchFor
                        .replace("\\E", "\\E\\\\E\\Q")
                        .replace("a", "\\E[aąĄ]\\Q")
                        .replace("c", "\\E[cćĆ]\\Q")
                        .replace("e", "\\E[eęĘ]\\Q")
                        .replace("l", "\\E[lłŁ]\\Q")
                        .replace("n", "\\E[nńŃ]\\Q")
                        .replace("o", "\\E[oóÓ]\\Q")
                        .replace("s", "\\E[sśŚ]\\Q")
                        .replace("z", "\\E[zźżŻŹ]\\Q") + "\\E))"
                } else {
                    "(?i:\\Q$SearchFor\\E)"
                }
                jp.nextToken()
                jp.nextToken()
                jp.nextToken()
                while (jp.nextToken() != JsonToken.END_ARRAY) {
                    jp.nextToken()
                    jp.nextToken()
                    lines4.append(jp.text)
                    jp.nextToken()
                    jp.nextToken()
                    first = false
                    while (jp.nextToken() != JsonToken.END_ARRAY) {
                        jp.nextToken()
                        jp.nextToken()
                        lines3.delete(0, lines3.length)
                        if (first) {
                            lines3.append("<tr bgcolor=silver><td>" + jp.text)
                        } else {
                            lines3.append("<tr><td>" + jp.text)
                        }
                        jp.nextToken()
                        jp.nextToken()
                        lines.delete(0, lines.length)
                        while (jp.nextToken() != JsonToken.END_ARRAY) {
                            jp.nextToken()
                            jp.nextToken()
                            if (lines.length == 0 || lines.length != 0 && lines.toString() == jp.text) {
                                if (lines.length == 0) {
                                    lines.append(jp.text)
                                }
                                jp.nextToken()
                                jp.nextToken()
                                lines3.append(
                                    "<br><b><a href=q" + nr + ">"
                                            + jp.text + "</a></b>"
                                )
                            } else {
                                jp.nextToken()
                                jp.nextToken()
                            }
                            jp.nextToken()
                            jp.nextToken()
                            jp.nextToken()
                        }
                        nr++
                        jp.nextToken()
                        if (!lines3.toString().replaceFirst(tosearch.toRegex(), "<mark>")
                                .contains("<mark>")
                        ) continue
                        if (lines4.length != 0) {
                            lines2.append(
                                "<tr bgcolor=grey><td id=sekcja" + nrsekcji
                                        + "><b>" + lines4.toString() + "</b></td></tr>"
                            )
                            s2?.add(0, lines4.toString())
                            nrsekcji++
                            lines4.delete(0, lines4.length)
                        }
                        if (ShowSearch) {
                            lines2.append(
                                lines3.toString().replace(
                                    tosearch.toRegex(),
                                    "<ins style='background-color:yellow'>$1</ins>"
                                )
                            )
                        } else {
                            lines2.append(lines3)
                        }
                        lines2.append("</td></tr>")
                        first = !first
                    }
                    jp.nextToken()
                    lines4.delete(0, lines4.length)
                }
            } else {
                jp.nextToken()
                jp.nextToken()
                jp.nextToken()
                while (jp.nextToken() != JsonToken.END_ARRAY) {
                    jp.nextToken()
                    jp.nextToken()
                    lines2.append(
                        "<tr bgcolor=grey><td id=sekcja" + nrsekcji
                                + "><b>" + jp.text + "</b></td></tr>"
                    )
                    s2?.add(0, jp.text)
                    nrsekcji++
                    jp.nextToken()
                    jp.nextToken()
                    first = false
                    while (jp.nextToken() != JsonToken.END_ARRAY) {
                        jp.nextToken()
                        jp.nextToken()
                        if (first) {
                            lines2.append("<tr bgcolor=silver><td>" + jp.text)
                        } else {
                            lines2.append("<tr><td>" + jp.text)
                        }
                        first = !first
                        jp.nextToken()
                        jp.nextToken()
                        lines.delete(0, lines.length)
                        while (jp.nextToken() != JsonToken.END_ARRAY) {
                            jp.nextToken()
                            jp.nextToken()
                            if (lines.length == 0 || lines.length != 0 && lines.toString() == jp.text) {
                                if (lines.length == 0) {
                                    lines.append(jp.text)
                                }
                                jp.nextToken()
                                jp.nextToken()
                                lines2.append(
                                    "<br><b><a href=q" + nr + ">" + jp.text
                                            + "</a></b>"
                                )
                            } else {
                                jp.nextToken()
                                jp.nextToken()
                            }
                            jp.nextToken()
                            jp.nextToken()
                            jp.nextToken()
                        }
                        nr++
                        jp.nextToken()
                        lines2.append("</td></tr>")
                    }
                    jp.nextToken()
                }
            }
            jp.close()
            `is`.close()
        } catch (ignore: IOException) {
        }
    }

    init {
        znaki = znaki1
    }
}