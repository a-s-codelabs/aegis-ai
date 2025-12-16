package com.example.anti_scam.ui.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.anti_scam.ui.call.IncomingCallScreen

@Composable
fun DashboardScreen(
    onNavigateToCallHistory: () -> Unit,
    onNavigateToSettings: () -> Unit,
    dashboardViewModel: DashboardViewModel = viewModel()
) {
    var showIncomingCall by remember { mutableStateOf(false) }

    if (showIncomingCall) {
        IncomingCallScreen(
            phoneNumber = "+1 (528) 204-4389",
            onAnswer = { showIncomingCall = false },
            onDivert = { showIncomingCall = false }
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .systemBarsPadding()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = "Dashboard", style = androidx.compose.material3.MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(32.dp))
        ProtectionStatusCard(isProtected = true)
        Spacer(modifier = Modifier.height(32.dp))
        Counters()
        Spacer(modifier = Modifier.height(32.dp))
        RecentCallSummary()
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = onNavigateToCallHistory) {
            Text(text = "Call History")
        }
        Spacer(modifier = Modifier.height(8.dp))
        Button(onClick = onNavigateToSettings) {
            Text(text = "Settings")
        }
        Spacer(modifier = Modifier.height(8.dp))
        Button(onClick = { showIncomingCall = true }) {
            Text(text = "Simulate Call")
        }
    }
}

@Composable
fun ProtectionStatusCard(isProtected: Boolean) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = if (isProtected) "You are protected" else "You are not protected")
        }
    }
}

@Composable
fun Counters() {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
        Counter(label = "Scam Calls", count = 10)
        Counter(label = "Safe Calls", count = 50)
    }
}

@Composable
fun Counter(label: String, count: Int) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = count.toString(), style = androidx.compose.material3.MaterialTheme.typography.headlineSmall)
        Text(text = label)
    }
}

@Composable
fun RecentCallSummary() {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = "Recent Calls")
            // Add a list of recent calls here
        }
    }
}
