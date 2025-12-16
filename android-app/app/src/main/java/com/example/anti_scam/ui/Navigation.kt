package com.example.anti_scam.ui

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.anti_scam.ui.auth.LoginScreen
import com.example.anti_scam.ui.auth.SignupScreen
import com.example.anti_scam.ui.callhistory.CallHistoryScreen
import com.example.anti_scam.ui.dashboard.DashboardScreen
import com.example.anti_scam.ui.permissions.PermissionScreen
import com.example.anti_scam.ui.settings.SettingsScreen

@Composable
fun Navigation() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "login") {
        composable("login") {
            LoginScreen(
                onLoginClick = { navController.navigate("dashboard") },
                onSignUpClick = { navController.navigate("signup") }
            )
        }
        composable("signup") {
            SignupScreen(
                onSignupClick = { navController.navigate("permission") },
                onLoginClick = { navController.navigate("login") }
            )
        }
        composable("permission") {
            PermissionScreen(onContinueClick = { navController.navigate("dashboard") })
        }
        composable("dashboard") {
            DashboardScreen(
                onNavigateToCallHistory = { navController.navigate("call_history") },
                onNavigateToSettings = { navController.navigate("settings") }
            )
        }
        composable("call_history") {
            CallHistoryScreen()
        }
        composable("settings") {
            SettingsScreen(onLogoutClick = { navController.navigate("login") })
        }
    }
}
