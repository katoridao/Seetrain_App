package org.katoridao.seetrain

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import org.katoridao.seetrain.navigation.AppNavigation
import org.katoridao.seetrain.ui.theme.SeetrainTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            SeetrainTheme {
                AppNavigation()
            }
        }
    }
}
