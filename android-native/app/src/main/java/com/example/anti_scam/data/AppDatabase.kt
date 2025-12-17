package com.example.anti_scam.data

import android.content.Context
import androidx.Implement incoming call handling for unknown numbers.

Requirements:

1. Create AntiScamCallScreeningService extending CallScreeningService.
2. On incoming call:
- Extract incoming phone number.
- Normalize the number.
- Check if number exists in the WhitelistedContact table.
3. If number exists:
- Allow call normally.
4. If number does NOT exist:
- Show an overlay popup using WindowManager with:
- Incoming number
- Buttons: "Allow Call", "Let AI Check"
5. Overlay must appear above the incoming call screen.
6. Ensure overlay permission is requested in PermissionScreen.
7. Register CallScreeningService properly in AndroidManifest.xml.

Do NOT block calls automatically.
User action decides.
room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [WhitelistedContact::class], version = 1, exportSchema = false)
public abstract class AppDatabase : RoomDatabase() {

    abstract fun whitelistedContactDao(): WhitelistedContactDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "app_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
