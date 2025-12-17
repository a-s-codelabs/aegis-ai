package com.example.anti_scam.ui.permissions

import android.Manifest
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel

@Composable
fun PermissionScreen(
    onContinueClick: () -> Unit,
    permissionViewModel: PermissionViewModel = viewModel()
) {
    val context = LocalContext.current
    val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            permissionViewModel.saveContactsToWhitelist(context)
            onContinueClick()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = "Permissions", style = androidx.compose.material3.MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))
        Text(text = "To protect you from scams, we need the following permissions:")
        Spacer(modifier = Modifier.height(16.dp))
        PermissionRow(permission = "Contacts") {
            launcher.launch(Manifest.permission.READ_CONTACTS)
        }
        PermissionRow(permission = "Phone") {}
        PermissionRow(permission = "Overlay") {}
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = onContinueClick) {
            Text(text = "Continue")
        }
    }
}

@Composable
fun PermissionRow(permission: String, onGrantClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = permission)
        Button(onClick = onGrantClick) {
            Text(text = "Grant")
        }
    }
}
