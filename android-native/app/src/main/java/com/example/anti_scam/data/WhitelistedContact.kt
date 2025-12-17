package com.example.anti_scam.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "whitelisted_contacts")
data class WhitelistedContact(
    @PrimaryKey val number: String
)
