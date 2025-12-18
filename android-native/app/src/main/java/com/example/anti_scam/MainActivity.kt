package com.example.anti_scam

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

/**
 * MainActivity now hosts React Native.
 *
 * Previous Compose UI code is commented out below for reference.
 * To switch back to Compose, uncomment and change base class to ComponentActivity.
 */
class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "AntiScamMobile"

    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return DefaultReactActivityDelegate(
            this,
            getMainComponentName(),
            fabricEnabled
        )
    }

    // Previous Compose implementation (commented out for reference):
    //
    // import android.os.Bundle
    // import androidx.activity.ComponentActivity
    // import androidx.activity.compose.setContent
    // import androidx.activity.enableEdgeToEdge
    // import com.example.anti_scam.ui.Navigation
    // import com.example.anti_scam.ui.theme.AntiScamTheme
    //
    // class MainActivity : ComponentActivity() {
    //     override fun onCreate(savedInstanceState: Bundle?) {
    //         super.onCreate(savedInstanceState)
    //         enableEdgeToEdge()
    //         setContent {
    //             AntiScamTheme {
    //                 Navigation()
    //             }
    //         }
    //     }
    // }
}
