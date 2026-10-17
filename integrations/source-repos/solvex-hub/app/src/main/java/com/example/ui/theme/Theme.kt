package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme =
  darkColorScheme(
    primary = GoldPrimary,
    secondary = ForestEmerald,
    tertiary = GoldAccent,
    background = DarkBackground,
    surface = DeepSurface,
    onPrimary = DarkBackground,
    onSecondary = OnBackgroundText,
    onBackground = OnBackgroundText,
    onSurface = OnBackgroundText
  )

private val LightColorScheme = DarkColorScheme // Always maintain premium dark theme for that banker safe look

@Composable
fun MyApplicationTheme(
  darkTheme: Boolean = true, // Force dark theme for executive look
  dynamicColor: Boolean = false, // Disable dynamic colors, we want the carefully crafted branding
  content: @Composable () -> Unit,
) {
  val colorScheme = DarkColorScheme

  MaterialTheme(colorScheme = colorScheme, typography = Typography, content = content)
}
