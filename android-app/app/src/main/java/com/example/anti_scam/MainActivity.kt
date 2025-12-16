package com.example.anti_scam

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.example.anti_scam.ui.Navigation
import com.example.anti_scam.ui.theme.AntiScamTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AntiScamTheme {
                Navigation()
            }
        }
    }
}
