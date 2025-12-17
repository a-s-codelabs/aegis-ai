package com.antiscam.antiscan.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun IncomingCallPopup(
    phoneNumber: String,
    onAllowCall: () -> Unit,
    onLetAiCheck: () -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = "Incoming Call")
            Text(text = phoneNumber)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                Button(onClick = onAllowCall) {
                    Text(text = "Allow Call")
                }
                Button(onClick = onLetAiCheck) {
                    Text(text = "Let AI Check")
                }
            }
        }
    }
}
