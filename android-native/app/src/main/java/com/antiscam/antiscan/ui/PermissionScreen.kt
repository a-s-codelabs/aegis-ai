package com.antiscam.antiscan.ui

import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

@Composable
fun PermissionScreen() {
    val context = LocalContext.current
    Column(verticalArrangement = Arrangement.Center) {
        Text(text = "Please grant the overlay permission")
        Button(onClick = {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:${context.packageName}")
            )
            context.startActivity(intent)
        }) {
            Text(text = "Grant Permission")
        }
    }
}
