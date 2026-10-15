package com.example.ui.theme

import android.os.Build
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

// Clean Minimalism Palette mapping
private val MinimalistColorScheme = lightColorScheme(
    primary = MinimalistPrimary,
    secondary = MinimalistSecondary,
    tertiary = MinimalistTertiary,
    background = MinimalistBackground,
    surface = MinimalistSurface,
    surfaceVariant = MinimalistSurfaceVariant,
    onPrimary = MinimalistOnPrimary,
    onSecondary = MinimalistOnPrimary,
    onTertiary = MinimalistOnPrimary,
    onBackground = MinimalistOnBackground,
    onSurface = MinimalistOnSurface,
    outline = MinimalistBorderSolid,
    primaryContainer = MinimalistPrimaryContainer,
    onPrimaryContainer = MinimalistOnPrimaryContainer
)

private val MinimalistDarkColorScheme = darkColorScheme(
    primary = MinimalistPrimary,
    secondary = MinimalistSecondary,
    tertiary = MinimalistTertiary,
    background = MinimalistOnBackground, // reverse for dark mode
    surface = MinimalistSecondary,
    surfaceVariant = MinimalistBorderSolid,
    onPrimary = MinimalistOnPrimary,
    onSecondary = MinimalistOnPrimary,
    onTertiary = MinimalistOnPrimary,
    onBackground = MinimalistBackground,
    onSurface = MinimalistBackground,
    outline = MinimalistBorderSolid
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = false, // Clean Minimalism uses light theme aesthetic by default
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit,
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> MinimalistDarkColorScheme
        else -> MinimalistColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
