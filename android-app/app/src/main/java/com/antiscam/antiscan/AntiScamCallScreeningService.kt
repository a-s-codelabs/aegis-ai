package com.antiscam.antiscan

import android.content.Intent
import android.graphics.PixelFormat
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.telecom.Call
import android.telecom.CallScreeningService
import android.util.Log
import android.view.WindowManager
import androidx.compose.ui.platform.ComposeView
import com.antiscam.antiscan.ui.IncomingCallPopup

class AntiScamCallScreeningService : CallScreeningService() {

    private lateinit var windowManager: WindowManager
    private lateinit var overlayView: ComposeView

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
    }

    override fun onScreenCall(callDetails: Call.Details) {
        val phoneNumber = callDetails.handle.schemeSpecificPart
        Log.d("AntiScamCallScreeningService", "Incoming call from: $phoneNumber")

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")
            )
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(intent)
            return
        }

        // TODO: Normalize phone number
        // TODO: Check against WhitelistedContact table

        showOverlay(phoneNumber)

    }

    private fun showOverlay(phoneNumber: String) {
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            } else {
                WindowManager.LayoutParams.TYPE_PHONE
            },
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        )

        overlayView = ComposeView(this)
        overlayView.setContent {
            IncomingCallPopup(
                phoneNumber = phoneNumber,
                onAllowCall = {
                    // Allow call
                    val response = CallResponse.Builder()
                        .setDisallowCall(false)
                        .setRejectCall(false)
                        .setSkipCallLog(false)
                        .setSkipNotification(false)
                        .build()
                    // This is not available here, needs a way to get the callDetails
                    // respondToCall(callDetails, response)
                    windowManager.removeView(overlayView)
                },
                onLetAiCheck = {
                    // TODO: Implement AI check
                    windowManager.removeView(overlayView)
                }
            )
        }
        windowManager.addView(overlayView, params)
    }
}
