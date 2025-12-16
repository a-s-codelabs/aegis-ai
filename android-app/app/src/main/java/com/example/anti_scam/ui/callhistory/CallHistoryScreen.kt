package com.example.anti_scam.ui.callhistory

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel

data class Call(val number: String, val status: String, val confidence: Int)

@Composable
fun CallHistoryScreen(callHistoryViewModel: CallHistoryViewModel = viewModel()) {
    val calls = listOf(
        Call("123-456-7890", "Scam", 95),
        Call("098-765-4321", "Safe", 99),
        Call("555-555-5555", "Unknown", 50)
    )

    Column(modifier = Modifier
        .fillMaxSize()
        .padding(16.dp)) {
        Text(text = "Call History", style = androidx.compose.material3.MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(32.dp))
        LazyColumn {
            items(calls) { call ->
                CallHistoryItem(call = call)
            }
        }
    }
}

@Composable
fun CallHistoryItem(call: Call) {
    Card(modifier = Modifier
        .fillMaxWidth()
        .padding(vertical = 8.dp)) {
        Row(modifier = Modifier.padding(16.dp)) {
            Column(modifier = Modifier.weight(1f)) {
                Text(text = call.number)
                Text(text = "Status: ${call.status}")
            }
            Text(text = "${call.confidence}%")
        }
    }
}
