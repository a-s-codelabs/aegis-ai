package com.example.anti_scam.ui.permissions

import android.annotation.SuppressLint
import android.content.Context
import android.provider.ContactsContract
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.anti_scam.data.AppDatabase
import com.example.anti_scam.data.WhitelistedContact
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class PermissionViewModel : ViewModel() {

    @SuppressLint("Range")
    fun saveContactsToWhitelist(context: Context) {
        viewModelScope.launch(Dispatchers.IO) {
            val contacts = mutableListOf<WhitelistedContact>()
            val contentResolver = context.contentResolver
            val cursor = contentResolver.query(
                ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                null,
                null,
                null,
                null
            )

            cursor?.use {
                while (it.moveToNext()) {
                    val number = it.getString(it.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER))
                    val normalizedNumber = number.replace("[^0-9]".toRegex(), "")
                    if (normalizedNumber.isNotBlank()) {
                        contacts.add(WhitelistedContact(normalizedNumber))
                    }
                }
            }

            val dao = AppDatabase.getDatabase(context).whitelistedContactDao()
            dao.insertAll(contacts)
        }
    }
}
