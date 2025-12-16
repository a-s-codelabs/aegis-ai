package com.example.anti_scam.ui.call

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog

@Composable
fun IncomingCallScreen(
    phoneNumber: String,
    onAnswer: () -> Unit,
    onDivert: () -> Unit
) {
    Dialog(onDismissRequest = { /* Do nothing */ }) {
        Card(
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.padding(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1A1A2E))
        ) {
            Column(
                modifier = Modifier.padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Phone,
                    contentDescription = "Phone Icon",
                    modifier = Modifier.size(48.dp),
                    tint = Color(0xFF6A6AFB)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(text = "Incoming Call", style = MaterialTheme.typography.headlineMedium, color = Color.White)
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = phoneNumber, style = MaterialTheme.typography.headlineSmall, color = Color.White)
                Text(
                    text = "Unknown number - not in contacts",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.Gray,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(32.dp))
                Button(
                    onClick = onAnswer,
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2C2C54))
                ) {
                    Icon(Icons.Default.Phone, contentDescription = null, modifier = Modifier.padding(end = 8.dp))
                    Text(text = "Answer Myself")
                }
                Spacer(modifier = Modifier.height(16.dp))
                Button(
                    onClick = onDivert,
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6A6AFB))
                ) {
                    Icon(Icons.Default.Shield, contentDescription = null, modifier = Modifier.padding(end = 8.dp))
                    Text(text = "Divert to AI Protection")
                }
            }
        }
    }
}
