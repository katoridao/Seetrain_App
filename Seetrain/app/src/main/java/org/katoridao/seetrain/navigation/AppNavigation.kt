package org.katoridao.seetrain.navigation

import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import org.katoridao.seetrain.screens.HomeScreen
import org.katoridao.seetrain.screens.HistoryScreen
import org.katoridao.seetrain.screens.ResultScreen

@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = "home",
        enterTransition = { slideInHorizontally(initialOffsetX = { it }) + fadeIn() },
        exitTransition = { slideOutHorizontally(targetOffsetX = { -it / 3 }) + fadeOut() },
        popEnterTransition = { slideInHorizontally(initialOffsetX = { -it / 3 }) + fadeIn() },
        popExitTransition = { slideOutHorizontally(targetOffsetX = { it }) + fadeOut() }
    ) {
        composable("home") {
            HomeScreen(
                onOpenHistory = {
                    navController.navigate("history") {
                        launchSingleTop = true
                    }
                },
                onJobCompleted = { videoUrl, infographicUrl ->

                    navController.currentBackStackEntry
                        ?.savedStateHandle
                        ?.set("videoUrl", videoUrl)

                    navController.currentBackStackEntry
                        ?.savedStateHandle
                        ?.set("infographicUrl", infographicUrl)

                    navController.navigate("result") {
                        launchSingleTop = true
                    }
                }
            )
        }

        composable("history") {
            HistoryScreen(
                onBack = {
                    navController.popBackStack()
                }
            )
        }

        composable("result") {
            val savedStateHandle = navController
                .previousBackStackEntry
                ?.savedStateHandle

            val videoUrl = savedStateHandle?.get<String>("videoUrl")
            val infographicUrl = savedStateHandle?.get<String>("infographicUrl")

            ResultScreen(
                videoUrl = videoUrl,
                infographicUrl = infographicUrl,
                onBack = {
                    navController.popBackStack()
                }
            )
        }
    }
}