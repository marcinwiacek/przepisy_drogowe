package com.mwiacek.przepisy.drogowe;

import android.content.Context;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

//Shared between Straz and Przepisy
//1.0
class DBClass {
    private final Context mCtx;
    private DBClassHelper mDbHelper;
    private SQLiteDatabase mDb;

    DBClass(Context ctx) {
        this.mCtx = ctx;
        this.open();
    }

    DBClass open() throws SQLException {
        mDbHelper = new DBClassHelper(mCtx);
        mDb = mDbHelper.getWritableDatabase();
        return this;
    }

    void close() {
        mDbHelper.close();
    }

    void SetSetting(String searchFor, String value) {
        mDb.beginTransaction();
        mDb.execSQL("delete from USTAWIENIA where nam='" + searchFor + "'");
        mDb.execSQL("insert into USTAWIENIA (nam, val) values ('" + searchFor + "','" + value + "')");
        mDb.setTransactionSuccessful();
        mDb.endTransaction();
    }

    String GetSetting(String searchFor, String def) {
        Cursor c = mDb.rawQuery("select val from ustawienia where nam='" + searchFor + "'", null);

        if (c == null) {
            return def;
        } else {
            if (c.moveToFirst()) {
                String s = c.getString(0);
                c.close();
                return s;
            } else {
                c.close();
                return def;
            }
        }
    }

    private static class DBClassHelper extends SQLiteOpenHelper {
        DBClassHelper(Context context) {
            super(context, "przep", null, 1);
        }

        @Override
        public void onCreate(SQLiteDatabase db) {
            db.execSQL("create table USTAWIENIA (NAM text not null, VAL text not null)");
        }

        @Override
        public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
            db.execSQL("DROP TABLE IF EXISTS USTAWIENIA");
            onCreate(db);
        }
    }
}
