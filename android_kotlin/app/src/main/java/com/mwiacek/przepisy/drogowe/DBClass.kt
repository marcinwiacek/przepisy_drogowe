package com.mwiacek.przepisy.drogowe

import android.content.Context
import android.database.SQLException
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

//Shared between Straz and Przepisy
//1.0
class DBClass(private val mCtx: Context) {
    private var mDbHelper: DBClassHelper? = null
    private var mDb: SQLiteDatabase? = null

    @Throws(SQLException::class)
    fun open() {
        mDbHelper = DBClassHelper(mCtx)
        mDb = mDbHelper!!.writableDatabase
    }

    fun close() {
        mDbHelper!!.close()
    }

    fun SetSetting(searchFor: String, value: String) {
        mDb!!.beginTransaction()
        mDb!!.execSQL("delete from USTAWIENIA where nam='$searchFor'")
        mDb!!.execSQL("insert into USTAWIENIA (nam, val) values ('$searchFor','$value')")
        mDb!!.setTransactionSuccessful()
        mDb!!.endTransaction()
    }

    fun GetSetting(searchFor: String, def: String): String {
        val c = mDb!!.rawQuery("select val from ustawienia where nam='$searchFor'", null)
        return if (c == null) {
            def
        } else {
            if (c.moveToFirst()) {
                val s = c.getString(0)
                c.close()
                s
            } else {
                c.close()
                def
            }
        }
    }

    private class DBClassHelper(context: Context?) :
        SQLiteOpenHelper(context, "przep", null, 1) {
        override fun onCreate(db: SQLiteDatabase) {
            db.execSQL("create table USTAWIENIA (NAM text not null, VAL text not null)")
        }

        override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
            db.execSQL("DROP TABLE IF EXISTS USTAWIENIA")
            onCreate(db)
        }
    }

    init {
        open()
    }
}