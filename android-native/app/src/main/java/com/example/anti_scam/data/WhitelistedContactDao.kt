package com.example.anti_scam.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface WhitelistedContactDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(contacts: List<WhitelistedContact>)

    @Query("SELECT EXISTS(SELECT 1 FROM whitelisted_contacts WHERE number = :number)")
    suspend fun exists(number: String): Boolean
}
