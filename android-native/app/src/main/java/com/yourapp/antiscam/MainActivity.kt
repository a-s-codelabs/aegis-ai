package com.yourapp.antiscam

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge

/**
 * Placeholder MainActivity for package route `com.yourapp.antiscam`.
 *
 * NOTE:
 * - The existing `com.example.anti_scam.MainActivity` remains the actual launcher.
 * - This class is added only to satisfy the requested folder/package structure.
 * - Wire this activity into the manifest if/when you decide to switch to this package.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Keeping this extremely minimal for now.
        // You can later replace this with your app's real composable content.
        enableEdgeToEdge()
        setContent {
            // TODO: Provide your app UI here (e.g., AntiscamTheme { Navigation() })
        }
    }
}


