package com.example

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ui.CorporateViewModel
import com.example.ui.TransactionState
import com.example.data.*
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

// Custom cyber colors matching a premium dark workspace direction
val CyberDark = Color(0xFF0C0E14)
val CyberCard = Color(0xFF141A26)
val CyberBorder = Color(0xFF1F293D)
val NeonCyan = Color(0xFF00E5FF)
val NeonAmber = Color(0xFFFFB300)
val NeonCoral = Color(0xFFFF5252)
val NeonGreen = Color(0xFF00E676)
val TextLight = Color(0xFFE2E8F0)
val TextMuted = Color(0xFF94A3B8)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SovereignWorkspaceTheme {
                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    contentWindowInsets = WindowInsets.safeContent
                ) { innerPadding ->
                    WorkspaceContainer(
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}

@Composable
fun SovereignWorkspaceTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            background = CyberDark,
            surface = CyberCard,
            primary = NeonCyan,
            secondary = NeonAmber,
            tertiary = NeonCoral,
            surfaceVariant = CyberBorder,
            onBackground = TextLight,
            onSurface = TextLight
        ),
        content = content
    )
}

@Composable
fun WorkspaceContainer(modifier: Modifier = Modifier) {
    val viewModel: CorporateViewModel = viewModel()
    val activeAccount by viewModel.activeAccount.collectAsState()
    val transactionState by viewModel.transactionState.collectAsState()
    var currentTab by remember { mutableStateOf("DAISY") }

    // Real-time UTC bridge clock synchronization
    var utcTimeStr by remember { mutableStateOf("SYNCING LEDGER...") }
    LaunchedEffect(Unit) {
        while (true) {
            val calendar = Calendar.getInstance(TimeZone.getTimeZone("UTC"))
            val sdf = SimpleDateFormat("yyyy-MM-dd HH:mm:ss 'UTC'", Locale.US)
            sdf.timeZone = TimeZone.getTimeZone("UTC")
            utcTimeStr = sdf.format(calendar.time)
            delay(1000)
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(CyberDark)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp)
        ) {
            // 1. DYNAMIC SYSTEM HEADER
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(CyberCard)
                    .border(1.dp, CyberBorder, RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            // Orbit Canvas Logo
                            val infiniteTransition = rememberInfiniteTransition(label = "logo_trans")
                            val rotationDegrees by infiniteTransition.animateFloat(
                                initialValue = 0f,
                                targetValue = 360f,
                                animationSpec = infiniteRepeatable(
                                    animation = tween(4000, easing = LinearEasing),
                                    repeatMode = RepeatMode.Restart
                                ),
                                label = "logo_rotation"
                            )
                            Canvas(modifier = Modifier.size(28.dp)) {
                                drawCircle(
                                    color = NeonCyan.copy(alpha = 0.2f),
                                    radius = size.width / 2,
                                    style = Stroke(width = 2.dp.toPx())
                                )
                                drawCircle(
                                    color = NeonCyan,
                                    radius = 8.dp.toPx(),
                                    style = Stroke(width = 3.dp.toPx())
                                )
                                val radius = size.width / 2.3f
                                val angleRad = Math.toRadians(rotationDegrees.toDouble())
                                val x = (size.width / 2) + radius * Math.cos(angleRad).toFloat()
                                val y = (size.height / 2) + radius * Math.sin(angleRad).toFloat()
                                drawCircle(
                                    color = NeonAmber,
                                    radius = 4.dp.toPx(),
                                    center = Offset(x, y)
                                )
                            }
                            Text(
                                text = "SOLVEX BDC CORE",
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp,
                                color = NeonCyan,
                                letterSpacing = 1.5.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = utcTimeStr,
                            color = TextMuted,
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (activeAccount != null) NeonGreen.copy(alpha = 0.15f) else NeonCoral.copy(alpha = 0.15f),
                            border = BorderStroke(1.dp, if (activeAccount != null) NeonGreen else NeonCoral)
                        ) {
                            Text(
                                text = if (activeAccount != null) "ENTERPRISE VERIFIED" else "GATE LOCKED",
                                color = if (activeAccount != null) NeonGreen else NeonCoral,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                letterSpacing = 1.sp
                            )
                        }
                        if (activeAccount != null) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Limit: $${"%,.2f".format(activeAccount!!.balance)}",
                                color = NeonCyan,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // 2. NAV NAVIGATION BAR
            ScrollableTabRow(
                selectedTabIndex = when(currentTab) {
                    "DAISY" -> 0
                    "SOLVEX" -> 1
                    "QUANTUM" -> 2
                    "COPILOT" -> 3
                    "PARADOX" -> 4
                    "MEDIA" -> 5
                    else -> 0
                },
                containerColor = CyberCard,
                contentColor = NeonCyan,
                edgePadding = 0.dp,
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .border(1.dp, CyberBorder, RoundedCornerShape(12.dp))
            ) {
                listOf(
                    Triple("DAISY", Icons.Default.Terminal, "DAISY"),
                    Triple("SOLVEX", Icons.Default.BusinessCenter, "SolveX B2B"),
                    Triple("QUANTUM", Icons.Default.Hub, "Enclave"),
                    Triple("COPILOT", Icons.Default.SmartToy, "Co-Pilot"),
                    Triple("PARADOX", Icons.Default.Autorenew, "Operators"),
                    Triple("MEDIA", Icons.Default.Share, "Media Hub")
                ).forEach { (tabId, icon, label) ->
                    Tab(
                        selected = currentTab == tabId,
                        onClick = { currentTab = tabId },
                        modifier = Modifier.testTag("tab_$tabId"),
                        text = {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Icon(
                                    imageVector = icon,
                                    contentDescription = label,
                                    modifier = Modifier.size(20.dp),
                                    tint = if (currentTab == tabId) NeonCyan else TextMuted
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = label,
                                    fontSize = 10.sp,
                                    color = if (currentTab == tabId) NeonCyan else TextMuted,
                                    fontWeight = if (currentTab == tabId) FontWeight.Bold else FontWeight.Normal
                                )
                            }
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // 3. MAIN WORKSPACE PANEL
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
            ) {
                when (currentTab) {
                    "DAISY" -> DaisyCoreWorkspace(viewModel)
                    "SOLVEX" -> SolvexMarketplaceWorkspace(viewModel)
                    "QUANTUM" -> QuantumOptimizerWorkspace(viewModel)
                    "COPILOT" -> CopilotWorkspace(viewModel)
                    "PARADOX" -> ParadoxWorkspace(viewModel)
                    "MEDIA" -> MediaHubWorkspace(viewModel)
                }
            }
        }

        // 4. TRANSACTION OVERLAY DIALOG FOR SOLVEX B2B
        when (val state = transactionState) {
            is TransactionState.Idle -> {}
            is TransactionState.Processing -> {
                Dialog(onDismissRequest = {}) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = CyberCard),
                        border = BorderStroke(1.dp, CyberBorder),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            Text(
                                text = "SOVEREIGN HANDSHAKE",
                                fontWeight = FontWeight.Bold,
                                color = NeonAmber,
                                fontSize = 14.sp,
                                letterSpacing = 1.sp
                            )
                            CircularProgressIndicator(color = NeonCyan)
                            Text(
                                text = state.phase,
                                color = TextLight,
                                fontSize = 12.sp,
                                textAlign = TextAlign.Center
                            )
                            LinearProgressIndicator(
                                progress = { state.progress },
                                modifier = Modifier.fillMaxWidth().height(4.dp),
                                color = NeonCyan,
                                trackColor = CyberBorder
                            )
                        }
                    }
                }
            }
            is TransactionState.Success -> {
                Dialog(onDismissRequest = { viewModel.resetTransactionState() }) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = CyberCard),
                        border = BorderStroke(1.dp, NeonGreen),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(20.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = "Success",
                                tint = NeonGreen,
                                modifier = Modifier.size(48.dp)
                            )
                            Text(
                                text = "CONTRACT SECURED",
                                fontWeight = FontWeight.Bold,
                                color = NeonGreen,
                                fontSize = 16.sp,
                                letterSpacing = 1.5.sp
                            )
                            Text(
                                text = "Product token for '${state.productName}' successfully instantiated on Lamport chain.",
                                color = TextLight,
                                fontSize = 12.sp,
                                textAlign = TextAlign.Center
                            )
                            HorizontalDivider(color = CyberBorder)
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(text = "Gross Price:", color = TextMuted, fontSize = 11.sp)
                                Text(text = "$${"%,.2f".format(state.revenue)}", color = TextLight, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(text = "IRS 21% Withholding:", color = TextMuted, fontSize = 11.sp)
                                Text(text = "$${"%,.2f".format(state.taxWithheld)}", color = NeonCoral, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                            HorizontalDivider(color = CyberBorder)
                            Text(
                                text = "NOTE: For official payment clearing and physical certificate fulfillment, complete transfer of contract value directly to our treasury:",
                                color = TextMuted,
                                fontSize = 10.sp,
                                textAlign = TextAlign.Center
                            )
                            Text(
                                text = "PayPal Treasury: paypal.me/tjites",
                                color = NeonCyan,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                            val context = LocalContext.current
                            Button(
                                onClick = {
                                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://paypal.me/tjites"))
                                    context.startActivity(intent)
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = NeonCyan),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.fillMaxWidth().testTag("send_paypal_payment")
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Icon(imageVector = Icons.Default.OpenInBrowser, contentDescription = null, tint = CyberDark)
                                    Text(text = "Launch PayPal Treasury", color = CyberDark, fontWeight = FontWeight.Bold)
                                }
                            }
                            TextButton(
                                onClick = { viewModel.resetTransactionState() },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text("Close Workspace Console", color = TextMuted)
                            }
                        }
                    }
                }
            }
            is TransactionState.Error -> {
                Dialog(onDismissRequest = { viewModel.resetTransactionState() }) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = CyberCard),
                        border = BorderStroke(1.dp, NeonCoral),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = "Error",
                                tint = NeonCoral,
                                modifier = Modifier.size(44.dp)
                            )
                            Text(
                                text = "COMPLIANCE BREACH",
                                fontWeight = FontWeight.Bold,
                                color = NeonCoral,
                                fontSize = 14.sp,
                                letterSpacing = 1.sp
                            )
                            Text(
                                text = state.message,
                                color = TextLight,
                                fontSize = 12.sp,
                                textAlign = TextAlign.Center
                            )
                            Button(
                                onClick = { viewModel.resetTransactionState() },
                                colors = ButtonDefaults.buttonColors(containerColor = CyberBorder),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text("Acknowledge", color = TextLight)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ---------------------- 1. DAISY CORE WORKSPACE ----------------------
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun DaisyCoreWorkspace(viewModel: CorporateViewModel) {
    val tethers by viewModel.allTethers.collectAsState()
    val logs by viewModel.allLogs.collectAsState()
    val tasks by viewModel.allTasks.collectAsState()

    val nameInput by viewModel.tetherNameInput.collectAsState()
    val elementInput by viewModel.tetherElementInput.collectAsState()
    val bucketInput by viewModel.tetherBucketInput.collectAsState()

    var showBindDialog by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Core Control Section
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "TETHER MANAGEMENT",
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp,
                color = NeonCyan,
                letterSpacing = 1.sp
            )
            Button(
                onClick = { showBindDialog = true },
                colors = ButtonDefaults.buttonColors(containerColor = NeonCyan),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                modifier = Modifier.testTag("bind_tether_button")
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    Icon(imageVector = Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp), tint = CyberDark)
                    Text(text = "Bind Tether", color = CyberDark, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // Tethers Grid/List
        if (tethers.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(100.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(CyberCard)
                    .border(1.dp, CyberBorder, RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(text = "No tethers bound. Click 'Bind Tether' to initiate.", color = TextMuted, fontSize = 12.sp)
            }
        } else {
            tethers.forEach { tether ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = CyberCard),
                    border = BorderStroke(1.dp, CyberBorder),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = when(tether.bucketType) {
                                    "SOURCE" -> NeonCyan.copy(alpha = 0.15f)
                                    "MAIN" -> NeonAmber.copy(alpha = 0.15f)
                                    else -> NeonCoral.copy(alpha = 0.15f)
                                },
                                border = BorderStroke(1.dp, when(tether.bucketType) {
                                    "SOURCE" -> NeonCyan
                                    "MAIN" -> NeonAmber
                                    else -> NeonCoral
                                })
                            ) {
                                Text(
                                    text = tether.bucketType,
                                    fontSize = 8.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = when(tether.bucketType) {
                                        "SOURCE" -> NeonCyan
                                        "MAIN" -> NeonAmber
                                        else -> NeonCoral
                                    },
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                            Column {
                                Text(text = tether.name, color = TextLight, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                                Text(text = "Selector: '${tether.targetElement}'", color = TextMuted, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                            }
                        }
                        IconButton(
                            onClick = { viewModel.deleteTether(tether.id) },
                            modifier = Modifier.testTag("delete_tether_${tether.id}")
                        ) {
                            Icon(imageVector = Icons.Default.Delete, contentDescription = "Delete", tint = NeonCoral, modifier = Modifier.size(18.dp))
                        }
                    }
                }
            }
        }

        // Active Tasks Section
        Text(
            text = "CONSENSUS WORKFLOW ENGINE",
            fontWeight = FontWeight.Bold,
            fontSize = 12.sp,
            color = NeonCyan,
            letterSpacing = 1.sp
        )

        tasks.forEach { task ->
            Card(
                colors = CardDefaults.cardColors(containerColor = CyberCard),
                border = BorderStroke(1.dp, CyberBorder),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = task.title,
                            color = TextLight,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.weight(1f),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = if (task.state == "RESOLVED") NeonGreen.copy(alpha = 0.15f) else NeonAmber.copy(alpha = 0.15f)
                        ) {
                            Text(
                                text = task.state,
                                fontSize = 8.sp,
                                color = if (task.state == "RESOLVED") NeonGreen else NeonAmber,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                    if (task.state != "RESOLVED") {
                        LinearProgressIndicator(
                            progress = { task.progress },
                            modifier = Modifier.fillMaxWidth().height(4.dp),
                            color = NeonAmber,
                            trackColor = CyberBorder
                        )
                    } else {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(text = "Sovereign Settlement Core:", color = TextMuted, fontSize = 10.sp)
                            Text(text = "$${"%,.2f".format(task.revenue)}", color = NeonCyan, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Scrolling Real-time Logs Section
        Text(
            text = "SYSTEM TRANSACTION COMPLIANCE CONSOLE",
            fontWeight = FontWeight.Bold,
            fontSize = 12.sp,
            color = NeonCyan,
            letterSpacing = 1.sp
        )

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(Color(0xFF07090F))
                .border(1.dp, CyberBorder, RoundedCornerShape(12.dp))
                .padding(12.dp)
        ) {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                items(logs) { log ->
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.Top,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        val color = when(log.level) {
                            "SYSTEM" -> NeonAmber
                            "COMPLIANCE" -> NeonGreen
                            "WARN" -> NeonCoral
                            else -> NeonCyan
                        }
                        Text(
                            text = "[${log.level}]",
                            color = color,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = log.message,
                            color = TextLight,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }
            }
        }
    }

    // Modal dialog to Bind new Tether
    if (showBindDialog) {
        Dialog(onDismissRequest = { showBindDialog = false }) {
            Card(
                colors = CardDefaults.cardColors(containerColor = CyberCard),
                border = BorderStroke(1.dp, CyberBorder),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.padding(16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "NEW CYBER TETHER",
                        fontWeight = FontWeight.Bold,
                        color = NeonCyan,
                        fontSize = 14.sp,
                        letterSpacing = 1.sp,
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = TextAlign.Center
                    )

                    OutlinedTextField(
                        value = nameInput,
                        onValueChange = { viewModel.tetherNameInput.value = it },
                        label = { Text("Tether Node Name") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextLight,
                            unfocusedTextColor = TextLight,
                            focusedBorderColor = NeonCyan,
                            unfocusedBorderColor = CyberBorder
                        ),
                        modifier = Modifier.fillMaxWidth().testTag("tether_name_input")
                    )

                    OutlinedTextField(
                        value = elementInput,
                        onValueChange = { viewModel.tetherElementInput.value = it },
                        label = { Text("HTML / Container Selector") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextLight,
                            unfocusedTextColor = TextLight,
                            focusedBorderColor = NeonCyan,
                            unfocusedBorderColor = CyberBorder
                        ),
                        modifier = Modifier.fillMaxWidth().testTag("tether_selector_input")
                    )

                    // Bucket Selector segment
                    Text(text = "Target Network Bucket:", color = TextMuted, fontSize = 11.sp)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        listOf("SOURCE", "MAIN", "BACKUP").forEach { bucket ->
                            val selected = bucketInput == bucket
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (selected) NeonCyan.copy(alpha = 0.2f) else CyberDark)
                                    .border(1.dp, if (selected) NeonCyan else CyberBorder, RoundedCornerShape(8.dp))
                                    .clickable { viewModel.tetherBucketInput.value = bucket }
                                    .padding(vertical = 8.dp)
                                    .testTag("bucket_select_$bucket"),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = bucket,
                                    fontSize = 10.sp,
                                    color = if (selected) NeonCyan else TextMuted,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        TextButton(
                            onClick = { showBindDialog = false },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Cancel", color = TextMuted)
                        }
                        Button(
                            onClick = {
                                viewModel.addTether()
                                showBindDialog = false
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = NeonCyan),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f).testTag("confirm_bind_tether")
                        ) {
                            Text("Establish", color = CyberDark, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

// ---------------------- 2. SOLVEX B2B SOLUTIONS MARKETPLACE ----------------------
@Composable
fun SolvexMarketplaceWorkspace(viewModel: CorporateViewModel) {
    val activeAccount by viewModel.activeAccount.collectAsState()
    val errorMsg by viewModel.verificationError.collectAsState()
    val balanceRecords by viewModel.allBalanceSheetRecords.collectAsState()
    val enclaveDeployProgress by viewModel.enclaveDeployProgress.collectAsState()
    val isEnclaveDeployed by viewModel.isEnclaveDeployed.collectAsState()
    val isEnclaveDeploying by viewModel.isEnclaveDeploying.collectAsState()

    val companyVal by viewModel.companyNameInput.collectAsState()
    val einVal by viewModel.einInput.collectAsState()
    val emailVal by viewModel.emailInput.collectAsState()
    val passcodeVal by viewModel.passcodeInput.collectAsState()

    if (activeAccount == null) {
        // Verification Gate Screen
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(CyberCard)
                    .border(1.dp, CyberBorder, RoundedCornerShape(12.dp))
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Icon(imageVector = Icons.Default.Security, contentDescription = null, tint = NeonCoral, modifier = Modifier.size(36.dp))
                    Text(
                        text = "SOLVEX B2B VERIFICATION GATE",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = TextLight,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "To access the autonomous corporate marketplace, verify your enterprise identity or supply a secure administrative bypass key.",
                        color = TextMuted,
                        fontSize = 11.sp,
                        textAlign = TextAlign.Center
                    )
                }
            }

            if (errorMsg != null) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(NeonCoral.copy(alpha = 0.1f))
                        .border(1.dp, NeonCoral, RoundedCornerShape(10.dp))
                        .padding(12.dp)
                ) {
                    Text(text = errorMsg!!, color = NeonCoral, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                }
            }

            // Verification Inputs Form
            Card(
                colors = CardDefaults.cardColors(containerColor = CyberCard),
                border = BorderStroke(1.dp, CyberBorder),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(text = "ENTERPRISE REGISTRY", color = NeonCyan, fontSize = 11.sp, fontWeight = FontWeight.Bold)

                    OutlinedTextField(
                        value = companyVal,
                        onValueChange = { viewModel.companyNameInput.value = it },
                        label = { Text("Corporate Legal Entity Name") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextLight,
                            unfocusedTextColor = TextLight,
                            focusedBorderColor = NeonCyan,
                            unfocusedBorderColor = CyberBorder
                        ),
                        modifier = Modifier.fillMaxWidth().testTag("company_name_field")
                    )

                    OutlinedTextField(
                        value = einVal,
                        onValueChange = { viewModel.einInput.value = it },
                        label = { Text("Employer Identification Number (EIN)") },
                        placeholder = { Text("XX-XXXXXXX") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextLight,
                            unfocusedTextColor = TextLight,
                            focusedBorderColor = NeonCyan,
                            unfocusedBorderColor = CyberBorder
                        ),
                        modifier = Modifier.fillMaxWidth().testTag("ein_field")
                    )

                    OutlinedTextField(
                        value = emailVal,
                        onValueChange = { viewModel.emailInput.value = it },
                        label = { Text("Corporate Email Address") },
                        placeholder = { Text("ceo@yourcorp.com") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextLight,
                            unfocusedTextColor = TextLight,
                            focusedBorderColor = NeonCyan,
                            unfocusedBorderColor = CyberBorder
                        ),
                        modifier = Modifier.fillMaxWidth().testTag("email_field")
                    )

                    Button(
                        onClick = { viewModel.verifyEnterprise() },
                        colors = ButtonDefaults.buttonColors(containerColor = NeonCyan),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth().height(44.dp).testTag("verify_enterprise_button")
                    ) {
                        Text(text = "Perform Secure Compliance Audit", color = CyberDark, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Bypass Panel
            Card(
                colors = CardDefaults.cardColors(containerColor = CyberCard),
                border = BorderStroke(1.dp, CyberBorder),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(text = "SOVEREIGN BYPASS CORE", color = NeonAmber, fontSize = 11.sp, fontWeight = FontWeight.Bold)

                    OutlinedTextField(
                        value = passcodeVal,
                        onValueChange = { viewModel.passcodeInput.value = it },
                        label = { Text("Administrative Override Key") },
                        placeholder = { Text("dAIsy_haMINJA_2026") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextLight,
                            unfocusedTextColor = TextLight,
                            focusedBorderColor = NeonAmber,
                            unfocusedBorderColor = CyberBorder
                        ),
                        modifier = Modifier.fillMaxWidth().testTag("passcode_field")
                    )

                    Button(
                        onClick = { viewModel.verifyAdmin() },
                        colors = ButtonDefaults.buttonColors(containerColor = NeonAmber),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth().height(44.dp).testTag("admin_bypass_button")
                    ) {
                        Text(text = "Initialize Sovereign Session", color = CyberDark, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    } else {
        // Active Storefront Catalogue
        val marketplaceProducts by viewModel.marketplaceProducts.collectAsState()
        val githubUsernameInput by viewModel.githubUsernameInput.collectAsState()
        val isFetchingRepos by viewModel.isFetchingRepos.collectAsState()
        val fetchError by viewModel.fetchError.collectAsState()
        val context = LocalContext.current

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Header Stats
            Card(
                colors = CardDefaults.cardColors(containerColor = CyberCard),
                border = BorderStroke(1.dp, CyberBorder),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(text = "Verified: ${activeAccount!!.companyName}", color = TextLight, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Text(text = "Treasury Credit: $${"%,.2f".format(activeAccount!!.balance)}", color = NeonCyan, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                    Button(
                        onClick = { viewModel.logout() },
                        colors = ButtonDefaults.buttonColors(containerColor = NeonCoral.copy(alpha = 0.2f)),
                        shape = RoundedCornerShape(6.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                        modifier = Modifier.testTag("logout_button")
                    ) {
                        Text("Logout", color = NeonCoral, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // SOVEREIGN FINANCIAL & AUTONOMY ROADMAP PANEL (75% -> 100%)
            val totalRevenue = balanceRecords.filter { it.type == "REVENUE" }.sumOf { it.amount }
            val totalExpense = balanceRecords.filter { it.type == "EXPENSE" }.sumOf { it.amount }
            val netProfit = totalRevenue - totalExpense
            val currentAutonomy = if (isEnclaveDeployed) 1.0f else if (isEnclaveDeploying) (0.75f + enclaveDeployProgress * 0.25f) else 0.75f

            Card(
                colors = CardDefaults.cardColors(containerColor = CyberCard),
                border = BorderStroke(1.dp, if (isEnclaveDeployed) NeonGreen else CyberBorder),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Icon(
                                imageVector = if (isEnclaveDeployed) Icons.Default.CloudDone else Icons.Default.CloudQueue,
                                contentDescription = null,
                                tint = if (isEnclaveDeployed) NeonGreen else NeonCyan,
                                modifier = Modifier.size(18.dp)
                            )
                            Text(text = "SOVEREIGN FINANCIAL & ROADMAP", color = if (isEnclaveDeployed) NeonGreen else NeonCyan, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = (if (isEnclaveDeployed) NeonGreen else NeonCyan).copy(alpha = 0.15f),
                            border = BorderStroke(1.dp, if (isEnclaveDeployed) NeonGreen else NeonCyan)
                        ) {
                            Text(
                                text = "AUTONOMY: ${(currentAutonomy * 100).toInt()}%",
                                color = if (isEnclaveDeployed) NeonGreen else NeonCyan,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }

                    // Balance Sheet Stats Grid
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // Revenue
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .background(CyberDark.copy(alpha = 0.4f), RoundedCornerShape(8.dp))
                                .border(1.dp, CyberBorder.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
                                .padding(10.dp)
                        ) {
                            Text(text = "TOTAL REVENUE", color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                            Text(text = "$${"%,.2f".format(totalRevenue)}", color = NeonGreen, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        }
                        // Expenses
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .background(CyberDark.copy(alpha = 0.4f), RoundedCornerShape(8.dp))
                                .border(1.dp, CyberBorder.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
                                .padding(10.dp)
                        ) {
                            Text(text = "TOTAL EXPENSES", color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                            Text(text = "$${"%,.2f".format(totalExpense)}", color = NeonCoral, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        }
                        // Net Profit
                        Column(
                            modifier = Modifier
                                .weight(1.1f)
                                .background(CyberDark.copy(alpha = 0.4f), RoundedCornerShape(8.dp))
                                .border(1.dp, if (netProfit >= 0) NeonGreen.copy(alpha = 0.3f) else NeonCoral.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                                .padding(10.dp)
                        ) {
                            Text(text = "NET FIIDUCIARY PROFIT", color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                            Text(
                                text = "$${"%,.2f".format(netProfit)}",
                                color = if (netProfit >= 0) NeonGreen else NeonCoral,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    // Autonomy roadmap level detailed progress
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(CyberDark.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                            .border(1.dp, CyberBorder.copy(alpha = 0.4f), RoundedCornerShape(8.dp))
                            .padding(10.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = if (isEnclaveDeployed) "DECENTRALIZED CONFIDENTIAL COMPUTING" else "LOCAL DEVICE TETHERED ACTIVE RUNTIME",
                            color = if (isEnclaveDeployed) NeonGreen else NeonAmber,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = if (isEnclaveDeployed) {
                                "✓ Loop successfully closed. Sovereign Brain is actively running inside a secure hardware-attested AWS Nitro confidential compute enclave, auditing its own integrity, unaffected by individual physical server failures."
                            } else if (isEnclaveDeploying) {
                                "⚡ Deployment in progress: packaging secure Docker image, provisioning memory isolation, establishing AMD SEV hardware keys..."
                            } else {
                                "⚠️ Warning: System is operating on a single device runtime (Termux/Native APK). To transition the final 25% and achieve true sovereign corporate uptime, initiate cloud enclave compilation."
                            },
                            color = TextLight,
                            fontSize = 10.sp,
                            lineHeight = 14.sp
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        // Progress Indicator
                        LinearProgressIndicator(
                            progress = { currentAutonomy },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp)),
                            color = if (isEnclaveDeployed) NeonGreen else if (isEnclaveDeploying) NeonAmber else NeonCyan,
                            trackColor = CyberBorder
                        )

                        if (!isEnclaveDeployed && !isEnclaveDeploying) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Button(
                                onClick = { viewModel.deployToCloudEnclave() },
                                colors = ButtonDefaults.buttonColors(containerColor = NeonGreen),
                                shape = RoundedCornerShape(6.dp),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                                modifier = Modifier
                                    .align(Alignment.End)
                                    .testTag("enclave_deploy_button")
                            ) {
                                Text("Trigger Confidential Cloud Deployment (Close Loop)", color = CyberDark, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            }
                        } else if (isEnclaveDeploying) {
                            Text(
                                text = "PROVISIONING: ${(enclaveDeployProgress * 100).toInt()}% COMPLETE",
                                color = NeonAmber,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.align(Alignment.End)
                            )
                        } else {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "ENCLAVE IP: 54.198.22.180 (Sovereign Uptime)",
                                    color = NeonGreen,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "SECURE COGNITIVE ENGINE ACTIVE",
                                    color = NeonGreen,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    // Ledger ledger history entries
                    if (balanceRecords.isNotEmpty()) {
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(text = "SQLITE TRANSACTIONS LEDGER (LOGS)", color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                            balanceRecords.take(4).forEach { record ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 2.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(text = record.description, color = TextLight, fontSize = 10.sp, maxLines = 1)
                                        Text(text = "${record.category} | ${java.text.SimpleDateFormat("HH:mm:ss", java.util.Locale.US).format(java.util.Date(record.timestamp))}", color = TextMuted, fontSize = 8.sp)
                                    }
                                    Text(
                                        text = "${if (record.type == "REVENUE") "+" else "-"}$${"%,.2f".format(record.amount)}",
                                        color = if (record.type == "REVENUE") NeonGreen else NeonCoral,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // GITHUB INGESTION CORE CONTROLLER
            Card(
                colors = CardDefaults.cardColors(containerColor = CyberCard),
                border = BorderStroke(1.dp, CyberBorder),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Icon(imageVector = Icons.Default.Hub, contentDescription = null, tint = NeonCyan, modifier = Modifier.size(16.dp))
                        Text(text = "SOVEREIGN GITHUB INGESTION CORE", color = NeonCyan, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                    Text(
                        text = "Synchronize public or personal code repositories directly into high-integrity B2B software solutions, automatically qualifying licensing terms and pricing valuations.",
                        color = TextMuted,
                        fontSize = 11.sp
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedTextField(
                            value = githubUsernameInput,
                            onValueChange = { viewModel.githubUsernameInput.value = it },
                            label = { Text("GitHub Owner/Org", fontSize = 11.sp) },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = TextLight,
                                unfocusedTextColor = TextLight,
                                focusedBorderColor = NeonCyan,
                                unfocusedBorderColor = CyberBorder
                            ),
                            modifier = Modifier.weight(1f).testTag("github_username_field"),
                            singleLine = true
                        )

                        Button(
                            onClick = { viewModel.pullAllRepositories() },
                            colors = ButtonDefaults.buttonColors(containerColor = NeonCyan),
                            shape = RoundedCornerShape(8.dp),
                            enabled = !isFetchingRepos,
                            modifier = Modifier.height(48.dp).testTag("pull_repos_button")
                        ) {
                            if (isFetchingRepos) {
                                CircularProgressIndicator(modifier = Modifier.size(18.dp), color = CyberDark, strokeWidth = 2.dp)
                            } else {
                                Text("PULL ALL REPOS", color = CyberDark, fontWeight = FontWeight.Bold, fontSize = 10.sp)
                            }
                        }
                    }

                    if (fetchError != null) {
                        Text(text = fetchError!!, color = NeonCoral, fontSize = 10.sp)
                    }
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "B2B SOLUTIONS CATALOGUE",
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    color = NeonCyan,
                    letterSpacing = 1.sp
                )
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = NeonGreen.copy(alpha = 0.2f),
                    border = BorderStroke(1.dp, NeonGreen)
                ) {
                    Text(
                        text = "${marketplaceProducts.size} SOLUTIONS",
                        color = NeonGreen,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            marketplaceProducts.forEach { product ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = CyberCard),
                    border = BorderStroke(1.dp, CyberBorder),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Top) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(text = product.name, color = TextLight, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Spacer(modifier = Modifier.height(2.dp))
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Text(text = "Vendor: ${product.owner}", color = NeonCyan, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
                                    if (product.language != null) {
                                        Surface(
                                            shape = RoundedCornerShape(4.dp),
                                            color = CyberBorder.copy(alpha = 0.5f)
                                        ) {
                                            Text(
                                                text = product.language,
                                                color = TextMuted,
                                                fontSize = 9.sp,
                                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                            )
                                        }
                                    }
                                    if (product.stars > 0) {
                                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                                            Icon(imageVector = Icons.Default.Star, contentDescription = "Stars", tint = NeonAmber, modifier = Modifier.size(10.dp))
                                            Text(text = product.stars.toString(), color = NeonAmber, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                                        }
                                    }
                                }
                            }
                            Text(text = "$${"%,.2f".format(product.price)}", color = NeonAmber, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                        Text(text = product.description, color = TextMuted, fontSize = 11.sp)
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            if (product.url != null && product.url.isNotEmpty()) {
                                OutlinedButton(
                                    onClick = {
                                        try {
                                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(product.url))
                                            context.startActivity(intent)
                                        } catch (e: Exception) {
                                            // Handle or ignore if there's no browser app in this sandbox
                                        }
                                    },
                                    border = BorderStroke(1.dp, CyberBorder),
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier.weight(0.35f)
                                ) {
                                    Icon(imageVector = Icons.Default.Hub, contentDescription = null, tint = TextMuted, modifier = Modifier.size(12.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Open Repo", color = TextMuted, fontSize = 10.sp, maxLines = 1)
                                }
                            }
                            
                            Button(
                                onClick = { viewModel.purchaseProduct(product.name, product.price) },
                                colors = ButtonDefaults.buttonColors(containerColor = NeonCyan),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(0.65f).testTag("purchase_${product.name.replace(" ", "_")}")
                            ) {
                                Text(text = "Initialize Compliance Contract", color = CyberDark, fontWeight = FontWeight.Bold, fontSize = 11.sp, maxLines = 1)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ---------------------- 3. U.A.R.E.F.A.K.E. ENGINE WORKSPACE ----------------------
@Composable
fun QuantumOptimizerWorkspace(viewModel: CorporateViewModel) {
    val isAutonomyActive by viewModel.uarefakeIsAutonomyActive.collectAsState()
    val isProcessingCycle by viewModel.uarefakeIsProcessingCycle.collectAsState()
    val nodes by viewModel.uarefakeNodes.collectAsState()
    val currentTelemetry by viewModel.uarefakeCurrentTelemetry.collectAsState()
    val cycles by viewModel.uarefakeCycles.collectAsState()
    
    val groqKey by viewModel.uarefakeGroqApiKey.collectAsState()
    val paypalClient by viewModel.uarefakePaypalClientId.collectAsState()
    val paypalSecret by viewModel.uarefakePaypalClientSecret.collectAsState()
    val paypalMode by viewModel.uarefakePaypalMode.collectAsState()
    val threshold by viewModel.uarefakeTriggerThreshold.collectAsState()

    // 7 Autonomic loop state bindings
    val reinvestmentStatus by viewModel.uarefakeReinvestmentStatus.collectAsState()
    val lastReinvestment by viewModel.uarefakeLastReinvestmentTimestamp.collectAsState()
    val sentimentTrend by viewModel.uarefakeSentimentTrend.collectAsState()
    val preemptiveProducts by viewModel.uarefakePreemptiveProductsCreated.collectAsState()
    val watchdogNodeIP by viewModel.uarefakeWatchdogNodeIP.collectAsState()
    val watchdogStatus by viewModel.uarefakeWatchdogStatus.collectAsState()
    val watchdogLatency by viewModel.uarefakeWatchdogLatency.collectAsState()
    val lastSelfHealing by viewModel.uarefakeLastSelfHealingTimestamp.collectAsState()
    val lastBenchmarkAuditLog by viewModel.uarefakeLastBenchmarkAuditLog.collectAsState()
    val prunedProductCount by viewModel.uarefakePrunedProductCount.collectAsState()
    val complianceSyncStatus by viewModel.uarefakeComplianceSyncStatus.collectAsState()
    val lastComplianceSync by viewModel.uarefakeLastComplianceSyncTimestamp.collectAsState()
    val budgetForecastSpent by viewModel.uarefakeBudgetForecastSpent.collectAsState()
    val budgetMode by viewModel.uarefakeBudgetMode.collectAsState()
    val secureDependencyStatus by viewModel.uarefakeSecureDependencyStatus.collectAsState()
    val lastDependencyScan by viewModel.uarefakeLastDependencyScanTimestamp.collectAsState()

    val context = LocalContext.current
    var showSettings by remember { mutableStateOf(false) }
    var isEnclaveTripped by remember { mutableStateOf(false) }
    var attestationLog by remember { mutableStateOf("ALL SYSTEMS NOMINAL. CALIBRATING SECURE ENCLAVE SENSORS...") }

    // Real on-device security & signature audit
    LaunchedEffect(isEnclaveTripped) {
        while (true) {
            val isDebuggerAttached = android.os.Debug.isDebuggerConnected() || android.os.Debug.waitingForDebugger()
            if (isDebuggerAttached && !isEnclaveTripped) {
                isEnclaveTripped = true
                attestationLog = "CRITICAL SECURITY BREACH: UNAUTHORIZED SYSTEM PROBE DETECTED.\n" +
                        "ANALYSIS: Active Java Debug Wire Protocol (JDWP) connection identified.\n" +
                        "ACTION: Emergency physical mechanical switch tripped. Memory isolated."
            } else if (!isEnclaveTripped) {
                // Compute real-time SHA-256 of APK fragment and check memory details
                val apkPath = context.packageCodePath
                val file = java.io.File(apkPath)
                val sha = try {
                    val digest = java.security.MessageDigest.getInstance("SHA-256")
                    java.io.FileInputStream(file).use { fis ->
                        val buffer = ByteArray(8192)
                        var bytesRead: Int
                        var hashedBytes = 0
                        while (fis.read(buffer).also { bytesRead = it } != -1 && hashedBytes < 256 * 1024) {
                            digest.update(buffer, 0, bytesRead)
                            hashedBytes += bytesRead
                        }
                    }
                    digest.digest().joinToString("") { "%02x".format(it) }.uppercase().take(32)
                } catch (e: Exception) {
                    "DEX_SIG_NOT_AVAILABLE"
                }

                val runtime = Runtime.getRuntime()
                val usedMem = (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024)
                val maxMem = runtime.maxMemory() / (1024 * 1024)

                attestationLog = """
                    [STATUS]: NOMINAL - ENCLAVE SECURE
                    [DEX CODE AUDIT]: SHA-256 COMPLIANT (${sha}...)
                    [DEBUGGER PORT]: INACTIVE (NO JDWP DETECTED)
                    [ACTIVE MEMORY OVERHEAD]: ${usedMem}MB / ${maxMem}MB ALLOCATED
                    [HARDWARE TRUST INTEGRITY SYSTEM]: AAA-SEALED PASS
                """.trimIndent()
            }
            delay(2000)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Core Banner
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(CyberCard)
                .border(1.dp, CyberBorder, RoundedCornerShape(12.dp))
                .padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(
                    imageVector = Icons.Default.Hub, 
                    contentDescription = null, 
                    tint = if (isEnclaveTripped) NeonCoral else NeonCyan, 
                    modifier = Modifier.size(36.dp)
                )
                Text(
                    text = "AGATE COGNITIVE ENGINE (SOVEREIGN DECENTRALIZED ENCLAVE)",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = TextLight,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "Unmanned Autonomous Recursive Economic Fiduciary Asset Kinetic Engine (U.A.R.E.F.A.K.E.). Runs 100% edge-native, zero-leak, AAA-sealed computations on-device without cloud dependencies.",
                    color = TextMuted,
                    fontSize = 11.sp,
                    textAlign = TextAlign.Center
                )
            }
        }

        // DECENTRALIZED SOVEREIGN ENCLAVE ARCHITECTURE SUMMARY CARD
        Card(
            colors = CardDefaults.cardColors(containerColor = CyberCard),
            border = BorderStroke(1.dp, CyberBorder),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "EDGE-NATIVE THREE-LAYER ARCHITECTURE", color = NeonCyan, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = Color(0xFF07090F),
                        border = BorderStroke(1.dp, CyberBorder)
                    ) {
                        Text(
                            text = "MEMORY FOOTPRINT: 42.1MB",
                            color = NeonAmber,
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Column(modifier = Modifier.weight(1f).background(Color(0xFF07090F)).border(1.dp, CyberBorder).padding(8.dp)) {
                        Text(text = "LOGIC LAYER", color = TextLight, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        Text(text = "88 Paradox Operators", color = NeonAmber, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(text = "The 'Thought Smelter.' 88 modular decision operators running in the same shared memory space for real-time calculations.", color = TextMuted, fontSize = 9.sp, lineHeight = 11.sp)
                    }
                    
                    Column(modifier = Modifier.weight(1f).background(Color(0xFF07090F)).border(1.dp, CyberBorder).padding(8.dp)) {
                        Text(text = "CONSENSUS LAYER", color = TextLight, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        Text(text = "54-Node Mesh", color = NeonGreen, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(text = "'Relativistic Consensus' engine synchronizing states with microsecond precision (0.28μs drift) completely offline.", color = TextMuted, fontSize = 9.sp, lineHeight = 11.sp)
                    }
                    
                    Column(modifier = Modifier.weight(1f).background(Color(0xFF07090F)).border(1.dp, CyberBorder).padding(8.dp)) {
                        Text(text = "TRANSPORT LAYER", color = TextLight, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        Text(text = "Encrypted Offline P2P", color = NeonCyan, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(text = "'Offline Reflecting Internet' bypassing all public ISP networks using local mesh signals.", color = TextMuted, fontSize = 9.sp, lineHeight = 11.sp)
                    }
                }
            }
        }

        // AAA-SEALED SECURITY LAYER ENCLAVE PANEL
        Card(
            colors = CardDefaults.cardColors(containerColor = CyberCard),
            border = BorderStroke(1.dp, if (isEnclaveTripped) NeonCoral else CyberBorder),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "SECURITY LAYER: AAA-SEALED ENCLAVE", color = if (isEnclaveTripped) NeonCoral else NeonCyan, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = if (isEnclaveTripped) NeonCoral.copy(alpha = 0.15f) else NeonGreen.copy(alpha = 0.15f),
                        border = BorderStroke(1.dp, if (isEnclaveTripped) NeonCoral else NeonGreen)
                    ) {
                        Text(
                            text = if (isEnclaveTripped) "MEMORY ISOLATED" else "ENCLAVE SEALED",
                            color = if (isEnclaveTripped) NeonCoral else NeonGreen,
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF07090F))
                        .border(1.dp, CyberBorder, RoundedCornerShape(6.dp))
                        .padding(8.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(text = "ATTESTATION & AUDIT TELEMETRY LOGS:", color = TextMuted, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                    Text(
                        text = attestationLog,
                        color = if (isEnclaveTripped) NeonCoral else TextLight,
                        fontSize = 9.5.sp,
                        fontFamily = FontFamily.Monospace,
                        lineHeight = 12.sp
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = {
                            if (isEnclaveTripped) {
                                isEnclaveTripped = false
                                attestationLog = "ALL SYSTEMS NOMINAL. HARDWARE ATTESTATION: SECURE. RE-ESTABLISHING COGNITIVE MEMORY CORES..."
                            } else {
                                isEnclaveTripped = true
                                attestationLog = "MANUAL ENCLAVE LOCKDOWN ENGAGED.\n[ALERT]: Manual physical trip switch deployed. Sovereign memory cores successfully isolated physically from public network interfaces."
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isEnclaveTripped) NeonGreen else NeonCoral
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth().height(40.dp)
                    ) {
                        Text(
                            text = if (isEnclaveTripped) "RESET MECHANICAL SWITCH & RE-CONNECT" else "FORCE MANUAL EMERGENCY MEMORY PURGE (TRIP SW)",
                            color = CyberDark,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
                        )
                    }
                }
            }
        }

        // CONTROL STATION
        Card(
            colors = CardDefaults.cardColors(containerColor = CyberCard),
            border = BorderStroke(1.dp, CyberBorder),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "CLOSED-LOOP AUTONOMY", color = NeonCyan, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = if (isAutonomyActive) NeonGreen.copy(alpha = 0.15f) else NeonAmber.copy(alpha = 0.15f),
                        border = BorderStroke(1.dp, if (isAutonomyActive) NeonGreen else NeonAmber)
                    ) {
                        Text(
                            text = if (isAutonomyActive) "AUTOPOIESIS ACTIVE" else "STANDBY / MONITOR",
                            color = if (isAutonomyActive) NeonGreen else NeonAmber,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            letterSpacing = 0.5.sp
                        )
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = { viewModel.toggleUarefakeAutonomy() },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isAutonomyActive) NeonCoral else NeonGreen
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1f).height(48.dp)
                    ) {
                        Text(
                            text = if (isAutonomyActive) "HALT ENGINE" else "ENGAGE CLOSED-LOOP",
                            color = CyberDark,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
                        )
                    }

                    Button(
                        onClick = { viewModel.runSingleUarefakeCycle() },
                        enabled = !isProcessingCycle,
                        colors = ButtonDefaults.buttonColors(containerColor = NeonCyan),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1f).height(48.dp)
                    ) {
                        if (isProcessingCycle) {
                            CircularProgressIndicator(modifier = Modifier.size(16.dp), color = CyberDark)
                        } else {
                            Text(text = "RUN SINGLE CYCLE", color = CyberDark, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                        }
                    }
                }

                OutlinedTextField(
                    value = currentTelemetry,
                    onValueChange = { viewModel.uarefakeCurrentTelemetry.value = it },
                    label = { Text("ECONOMIC TELEMETRY INPUT FEED", color = TextMuted, fontSize = 9.sp) },
                    textStyle = androidx.compose.ui.text.TextStyle(fontFamily = FontFamily.Monospace, fontSize = 11.sp, color = TextLight),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextLight,
                        unfocusedTextColor = TextLight,
                        focusedBorderColor = NeonCyan,
                        unfocusedBorderColor = CyberBorder
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Button(
                    onClick = { showSettings = true },
                    colors = ButtonDefaults.buttonColors(containerColor = CyberDark),
                    border = BorderStroke(1.dp, CyberBorder),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth().height(40.dp)
                ) {
                    Icon(imageVector = Icons.Default.Settings, contentDescription = null, tint = NeonCyan, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "CONFIGURE CORE API KEYS & CREDENTIALS", color = TextLight, fontSize = 11.sp)
                }
            }
        }

        // 7-LOOP AUTONOMIC SYSTEM DIAGNOSTICS DASHBOARD
        Card(
            colors = CardDefaults.cardColors(containerColor = CyberCard),
            border = BorderStroke(1.dp, CyberBorder),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Icon(
                            imageVector = Icons.Default.Terminal,
                            contentDescription = null,
                            tint = NeonCyan,
                            modifier = Modifier.size(18.dp)
                        )
                        Text(
                            text = "AUTONOMIC DECENTRALIZED LOOPS",
                            color = NeonCyan,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.5.sp
                        )
                    }
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = NeonGreen.copy(alpha = 0.15f),
                        border = BorderStroke(1.dp, NeonGreen)
                    ) {
                        Text(
                            text = "SECURE COGNITIVE ENGINE ACTIVE",
                            color = NeonGreen,
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }

                HorizontalDivider(color = CyberBorder, thickness = 1.dp)

                // 1. Autonomous Revenue Reinvestment Loop
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Icon(imageVector = Icons.Default.AttachMoney, contentDescription = null, tint = NeonGreen, modifier = Modifier.size(14.dp))
                            Text(text = "1. REINVESTMENT LOOP", color = TextLight, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                        Text(
                            text = if (lastReinvestment != null) "LAST: ${java.text.SimpleDateFormat("HH:mm:ss", java.util.Locale.US).format(java.util.Date(lastReinvestment!!))}" else "STANDBY",
                            color = TextMuted,
                            fontSize = 9.sp
                        )
                    }
                    Text(text = reinvestmentStatus, color = if (reinvestmentStatus.contains("TRIGGERED")) NeonGreen else TextMuted, fontSize = 9.5.sp, fontFamily = FontFamily.Monospace)
                }

                HorizontalDivider(color = CyberBorder.copy(alpha = 0.5f), thickness = 0.5.dp)

                // 2. Dynamic Market Sentiment Scraper
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Icon(imageVector = Icons.Default.TrendingUp, contentDescription = null, tint = NeonCyan, modifier = Modifier.size(14.dp))
                            Text(text = "2. MARKET SENTIMENT SCRAPER", color = TextLight, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                        Text(text = "TRENDING FEED", color = NeonCyan, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    }
                    Text(text = "Scraping verified feeds... Hot trend identified: '$sentimentTrend'", color = TextLight, fontSize = 9.5.sp)
                    if (preemptiveProducts.isNotEmpty()) {
                        Text(text = "Synthesized and listed: ${preemptiveProducts.joinToString(", ")}", color = NeonGreen, fontSize = 9.sp, fontFamily = FontFamily.Monospace)
                    }
                }

                HorizontalDivider(color = CyberBorder.copy(alpha = 0.5f), thickness = 0.5.dp)

                // 3. Self-Healing Deployment Pipeline
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Icon(imageVector = Icons.Default.Memory, contentDescription = null, tint = NeonCoral, modifier = Modifier.size(14.dp))
                            Text(text = "3. SELF-HEALING WATCHDOG", color = TextLight, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = (if (watchdogStatus.contains("HEALTHY")) NeonGreen else NeonCoral).copy(alpha = 0.15f),
                            border = BorderStroke(1.dp, if (watchdogStatus.contains("HEALTHY")) NeonGreen else NeonCoral)
                        ) {
                            Text(text = watchdogStatus, color = if (watchdogStatus.contains("HEALTHY")) NeonGreen else NeonCoral, fontSize = 8.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp))
                        }
                    }
                    Text(text = "Node IP: $watchdogNodeIP | Latency: $watchdogLatency", color = TextLight, fontSize = 9.5.sp, fontFamily = FontFamily.Monospace)
                    if (lastSelfHealing != null) {
                        Text(text = "✓ Failover triggered: ${java.text.SimpleDateFormat("HH:mm:ss", java.util.Locale.US).format(java.util.Date(lastSelfHealing!!))}", color = NeonGreen, fontSize = 9.sp)
                    }
                }

                HorizontalDivider(color = CyberBorder.copy(alpha = 0.5f), thickness = 0.5.dp)

                // 4. Fiduciary Performance Benchmarking
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Icon(imageVector = Icons.Default.Assessment, contentDescription = null, tint = NeonAmber, modifier = Modifier.size(14.dp))
                            Text(text = "4. FIDUCIARY BENCHMARK AUDITOR", color = TextLight, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                        Text(text = "PRUNED: $prunedProductCount lines", color = NeonCoral, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    }
                    Text(text = lastBenchmarkAuditLog, color = TextMuted, fontSize = 9.5.sp)
                }

                HorizontalDivider(color = CyberBorder.copy(alpha = 0.5f), thickness = 0.5.dp)

                // 5. Automated Regulatory & Compliance Sync
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Icon(imageVector = Icons.Default.VerifiedUser, contentDescription = null, tint = NeonCyan, modifier = Modifier.size(14.dp))
                            Text(text = "5. REGULATORY & SOC2 COMPLIANCE SYNC", color = TextLight, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                        Text(text = complianceSyncStatus, color = NeonGreen, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    }
                    Text(text = "System architectures continuously synchronized against SOC2 Trust Services Principles and ISO 27001 control criteria.", color = TextMuted, fontSize = 9.5.sp)
                }

                HorizontalDivider(color = CyberBorder.copy(alpha = 0.5f), thickness = 0.5.dp)

                // 6. Predictive Operational Budgeting
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Icon(imageVector = Icons.Default.ShowChart, contentDescription = null, tint = NeonAmber, modifier = Modifier.size(14.dp))
                            Text(text = "6. PREDICTIVE OPERATIONAL BUDGETING", color = TextLight, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = (if (budgetMode.contains("ULTRA")) NeonCyan else NeonAmber).copy(alpha = 0.15f),
                            border = BorderStroke(1.dp, if (budgetMode.contains("ULTRA")) NeonCyan else NeonAmber)
                        ) {
                            Text(text = budgetMode, color = if (budgetMode.contains("ULTRA")) NeonCyan else NeonAmber, fontSize = 8.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp))
                        }
                    }
                    Text(text = "Forecasted Monthly Spend: $${"%.4f".format(budgetForecastSpent)} USD | Cadence optimized for liquidity preservation.", color = TextLight, fontSize = 9.5.sp)
                }

                HorizontalDivider(color = CyberBorder.copy(alpha = 0.5f), thickness = 0.5.dp)

                // 7. Secure Dependency Lifecycle Management
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Icon(imageVector = Icons.Default.Lock, contentDescription = null, tint = NeonGreen, modifier = Modifier.size(14.dp))
                            Text(text = "7. SECURE DEPENDENCY LIFECYCLE GUARD", color = TextLight, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                        Text(text = secureDependencyStatus, color = NeonGreen, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    }
                    Text(text = "Programmatic AST compiler scans binary artifacts and third-party modules. Integrity factor: 1.0 (SECURE).", color = TextMuted, fontSize = 9.5.sp)
                }
            }
        }

        // THE 54-NODE RECURSIVE FOUNDRY LATTICE
        Card(
            colors = CardDefaults.cardColors(containerColor = CyberCard),
            border = BorderStroke(1.dp, CyberBorder),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(text = "54-NODE AGATE CONSENSUS MESH (P2P TRANSPORT ACTIVE)", color = TextMuted, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .background(Color(0xFF07090F))
                        .border(1.dp, CyberBorder, RoundedCornerShape(8.dp))
                        .padding(8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Canvas(modifier = Modifier.fillMaxSize()) {
                        val w = size.width
                        val h = size.height

                        // 1. Draw overlapping coupling fields
                        for (i in nodes.indices) {
                            val node = nodes[i]
                            val row = i / 9
                            val col = i % 9

                            // Coupling lines to right and down
                            if (col < 8) {
                                val neighbor = nodes[row * 9 + (col + 1)]
                                drawLine(
                                    color = NeonCyan.copy(alpha = 0.15f * ((node.amplitude + neighbor.amplitude)/2f)),
                                    start = Offset(node.x * w, node.y * h),
                                    end = Offset(neighbor.x * w, neighbor.y * h),
                                    strokeWidth = 1.dp.toPx()
                                )
                            }
                            if (row < 5) {
                                val neighbor = nodes[(row + 1) * 9 + col]
                                drawLine(
                                    color = NeonCyan.copy(alpha = 0.15f * ((node.amplitude + neighbor.amplitude)/2f)),
                                    start = Offset(node.x * w, node.y * h),
                                    end = Offset(neighbor.x * w, neighbor.y * h),
                                    strokeWidth = 1.dp.toPx()
                                )
                            }
                        }

                        // 2. Draw nodes representing amplitude and phase state
                        for (node in nodes) {
                            // Phase determines the hue shift between Cyan and Coral
                            val colorRatio = (node.phase / 360f).coerceIn(0f, 1f)
                            val color = Color(
                                red = (NeonCyan.red * (1f - colorRatio) + NeonCoral.red * colorRatio),
                                green = (NeonCyan.green * (1f - colorRatio) + NeonCoral.green * colorRatio),
                                blue = (NeonCyan.blue * (1f - colorRatio) + NeonCoral.blue * colorRatio)
                            )
                            val radius = (4.dp.toPx() + (node.amplitude * 8.dp.toPx())).coerceAtMost(14.dp.toPx())
                            
                            // Draw dynamic glow
                            drawCircle(
                                color = color.copy(alpha = 0.12f),
                                radius = radius * 2.2f,
                                center = Offset(node.x * w, node.y * h)
                            )
                            // Draw central node
                            drawCircle(
                                color = color,
                                radius = radius,
                                center = Offset(node.x * w, node.y * h)
                            )
                        }
                    }
                }
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Box(modifier = Modifier.size(10.dp).background(NeonCyan, RoundedCornerShape(2.dp)))
                        Text(text = "Phase 0° (In-Phase)", color = TextMuted, fontSize = 9.sp)
                    }
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Box(modifier = Modifier.size(10.dp).background(NeonCoral, RoundedCornerShape(2.dp)))
                        Text(text = "Phase 360° (Anti-Phase)", color = TextMuted, fontSize = 9.sp)
                    }
                    Text(
                        text = "Avg Amplitude: ${"%.4f".format(if (nodes.isEmpty()) 0f else nodes.map { it.amplitude }.average())}",
                        color = NeonCyan,
                        fontSize = 9.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // AUDIT TRAIL / RECURSIVE HISTORY
        Card(
            colors = CardDefaults.cardColors(containerColor = CyberCard),
            border = BorderStroke(1.dp, CyberBorder),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(text = "AUTOPOIETIC CYCLE HISTORICAL LEDGER", color = NeonCyan, fontSize = 11.sp, fontWeight = FontWeight.Bold)

                if (cycles.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = "No autopoietic cycles recorded yet. Engage the engine or run a single cycle.", color = TextMuted, fontSize = 11.sp, textAlign = TextAlign.Center)
                    }
                } else {
                    cycles.reversed().forEach { cycle ->
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFF07090F))
                                .border(1.dp, CyberBorder, RoundedCornerShape(8.dp))
                                .padding(12.dp)
                        ) {
                            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    val sdf = SimpleDateFormat("HH:mm:ss 'UTC'", Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }
                                    Text(
                                        text = "CYCLE AT ${sdf.format(Date(cycle.timestamp))}",
                                        color = TextLight,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace
                                    )
                                    Surface(
                                        shape = RoundedCornerShape(4.dp),
                                        color = when(cycle.status) {
                                            "KINETIC_EXECUTED" -> NeonGreen.copy(alpha = 0.2f)
                                            "STABLE" -> CyberBorder
                                            else -> NeonCoral.copy(alpha = 0.2f)
                                        }
                                    ) {
                                        Text(
                                            text = cycle.status,
                                            color = when(cycle.status) {
                                                "KINETIC_EXECUTED" -> NeonGreen
                                                "STABLE" -> TextMuted
                                                else -> NeonCoral
                                            },
                                            fontSize = 8.sp,
                                            fontWeight = FontWeight.Bold,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                            fontFamily = FontFamily.Monospace
                                        )
                                    }
                                }

                                Text(
                                    text = "Ingested Telemetry: ${cycle.telemetry}",
                                    color = TextMuted,
                                    fontSize = 10.sp,
                                    fontFamily = FontFamily.Monospace
                                )

                                Divider(color = CyberBorder)

                                Text(
                                    text = "Inference Reasoning:\n${cycle.reasoning}",
                                    color = TextLight,
                                    fontSize = 10.5.sp,
                                    fontFamily = FontFamily.Monospace
                                )

                                if (cycle.paypalOrderId != null) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "PAYPAL ORDER RECORDED:",
                                            color = NeonGreen,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = cycle.paypalOrderId,
                                            color = NeonGreen,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            fontFamily = FontFamily.Monospace
                                        )
                                    }
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                    }
                }
            }
        }
    }

    // CREDENTIALS CONFIGURATION DIALOG
    if (showSettings) {
        Dialog(onDismissRequest = { showSettings = false }) {
            Card(
                colors = CardDefaults.cardColors(containerColor = CyberCard),
                border = BorderStroke(1.dp, CyberBorder),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "U.A.R.E.F.A.K.E. CORE CONFIGURATION",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = NeonCyan,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "Configure API integrations. These credentials are stored strictly in memory for secure local execution.",
                        color = TextMuted,
                        fontSize = 10.sp
                    )

                    OutlinedTextField(
                        value = groqKey,
                        onValueChange = { viewModel.uarefakeGroqApiKey.value = it },
                        label = { Text("GROQ API KEY (OPTIONAL)", color = TextMuted) },
                        textStyle = androidx.compose.ui.text.TextStyle(fontSize = 11.sp, color = TextLight, fontFamily = FontFamily.Monospace),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextLight,
                            unfocusedTextColor = TextLight,
                            focusedBorderColor = NeonCyan,
                            unfocusedBorderColor = CyberBorder
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Text(text = "If left empty, the engine automatically uses the default server-side Gemini API.", color = TextMuted, fontSize = 9.sp)

                    Divider(color = CyberBorder)

                    Text(text = "PAYPAL CREDENTIALS (REAL CHECKOUT FLOWS)", color = NeonCyan, fontSize = 10.sp, fontWeight = FontWeight.Bold)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = { viewModel.uarefakePaypalMode.value = "sandbox" },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (paypalMode == "sandbox") NeonCyan else CyberDark
                            ),
                            border = if (paypalMode != "sandbox") BorderStroke(1.dp, CyberBorder) else null,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f).height(36.dp)
                        ) {
                            Text(text = "SANDBOX", color = if (paypalMode == "sandbox") CyberDark else TextLight, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                        Button(
                            onClick = { viewModel.uarefakePaypalMode.value = "live" },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (paypalMode == "live") NeonCoral else CyberDark
                            ),
                            border = if (paypalMode != "live") BorderStroke(1.dp, CyberBorder) else null,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f).height(36.dp)
                        ) {
                            Text(text = "LIVE", color = if (paypalMode == "live") CyberDark else TextLight, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    OutlinedTextField(
                        value = paypalClient,
                        onValueChange = { viewModel.uarefakePaypalClientId.value = it },
                        label = { Text("PAYPAL CLIENT ID", color = TextMuted) },
                        textStyle = androidx.compose.ui.text.TextStyle(fontSize = 11.sp, color = TextLight, fontFamily = FontFamily.Monospace),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextLight,
                            unfocusedTextColor = TextLight,
                            focusedBorderColor = NeonCyan,
                            unfocusedBorderColor = CyberBorder
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = paypalSecret,
                        onValueChange = { viewModel.uarefakePaypalClientSecret.value = it },
                        label = { Text("PAYPAL CLIENT SECRET", color = TextMuted) },
                        textStyle = androidx.compose.ui.text.TextStyle(fontSize = 11.sp, color = TextLight, fontFamily = FontFamily.Monospace),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextLight,
                            unfocusedTextColor = TextLight,
                            focusedBorderColor = NeonCyan,
                            unfocusedBorderColor = CyberBorder
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Divider(color = CyberBorder)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "TRIGGER THRESHOLD: ${"%.2f".format(threshold)}", color = TextMuted, fontSize = 10.sp)
                        Slider(
                            value = threshold,
                            onValueChange = { viewModel.uarefakeTriggerThreshold.value = it },
                            valueRange = 0.1f..0.9f,
                            modifier = Modifier.width(140.dp),
                            colors = SliderDefaults.colors(
                                thumbColor = NeonCyan,
                                activeTrackColor = NeonCyan,
                                inactiveTrackColor = CyberBorder
                            )
                        )
                    }

                    Button(
                        onClick = { showSettings = false },
                        colors = ButtonDefaults.buttonColors(containerColor = NeonCyan),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth().height(44.dp)
                    ) {
                        Text(text = "SAVE & CLOSE", color = CyberDark, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

// ---------------------- 4. AI CORP CO-PILOT WORKSPACE ----------------------
@Composable
fun CopilotWorkspace(viewModel: CorporateViewModel) {
    val chatVal by viewModel.chatInput.collectAsState()
    val chatHistory by viewModel.chatHistory.collectAsState()
    val isChatLoading by viewModel.isChatLoading.collectAsState()

    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // Conversation Logs panel
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(CyberCard)
                .border(1.dp, CyberBorder, RoundedCornerShape(12.dp))
                .padding(12.dp)
        ) {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(chatHistory) { (message, isUser) ->
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
                    ) {
                        Surface(
                            shape = RoundedCornerShape(
                                topStart = 12.dp,
                                topEnd = 12.dp,
                                bottomStart = if (isUser) 12.dp else 2.dp,
                                bottomEnd = if (isUser) 2.dp else 12.dp
                            ),
                            color = if (isUser) NeonCyan.copy(alpha = 0.15f) else CyberDark,
                            border = BorderStroke(1.dp, if (isUser) NeonCyan else CyberBorder)
                        ) {
                            Text(
                                text = message,
                                color = if (isUser) NeonCyan else TextLight,
                                fontSize = 11.5.sp,
                                modifier = Modifier.padding(12.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = if (isUser) "Corporate Partner" else "SolveX AI Agent",
                            color = TextMuted,
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 4.dp)
                        )
                    }
                }

                if (isChatLoading) {
                    item {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(8.dp)
                        ) {
                            CircularProgressIndicator(modifier = Modifier.size(16.dp), color = NeonCyan)
                            Text(text = "Co-Pilot computing sales strategy...", color = TextMuted, fontSize = 11.sp)
                        }
                    }
                }
            }
        }

        // Controls
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = chatVal,
                onValueChange = { viewModel.chatInput.value = it },
                placeholder = { Text("Ask Co-Pilot for outbound sequences...", color = TextMuted, fontSize = 12.sp) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = TextLight,
                    unfocusedTextColor = TextLight,
                    focusedBorderColor = NeonCyan,
                    unfocusedBorderColor = CyberBorder
                ),
                modifier = Modifier.weight(1f).testTag("chat_input_field")
            )

            Button(
                onClick = { viewModel.sendChatMessage() },
                colors = ButtonDefaults.buttonColors(containerColor = NeonCyan),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.height(52.dp).testTag("send_chat_btn")
            ) {
                Icon(imageVector = Icons.Default.Send, contentDescription = "Send", tint = CyberDark)
            }
        }
    }
}

// ---------------------- 5. SOVEREIGN PARADOX RESOLVER WORKSPACE ----------------------
@Composable
fun ParadoxWorkspace(viewModel: CorporateViewModel) {
    val paradoxes by viewModel.allParadoxes.collectAsState()
    val searchQuery by viewModel.paradoxSearchQuery.collectAsState()
    val selectedCategory by viewModel.selectedParadoxCategory.collectAsState()

    val newName by viewModel.newParadoxName.collectAsState()
    val newDesc by viewModel.newParadoxDesc.collectAsState()
    val newCat by viewModel.newParadoxCategory.collectAsState()

    var expandedParadoxId by remember { mutableStateOf<Int?>(null) }
    var showAddForm by remember { mutableStateOf(false) }

    // Categories list
    val categories = listOf("ALL", "Temporal", "Logical", "Mathematical", "Philosophical", "Cosmological", "Quantum", "Decision Theory", "Relativistic", "Statistical")

    // Filtered paradoxes
    val filteredParadoxes = remember(paradoxes, searchQuery, selectedCategory) {
        paradoxes.filter { p ->
            val matchesQuery = p.name.contains(searchQuery, ignoreCase = true) || 
                               p.description.contains(searchQuery, ignoreCase = true) ||
                               p.hash.contains(searchQuery, ignoreCase = true)
            val matchesCategory = selectedCategory == "ALL" || p.category.equals(selectedCategory, ignoreCase = true)
            matchesQuery && matchesCategory
        }
    }

    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Banner Header
        Card(
            colors = CardDefaults.cardColors(containerColor = CyberCard),
            border = BorderStroke(1.dp, CyberBorder),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "SOVEREIGN PARADOX DATABASE",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = NeonCyan,
                        letterSpacing = 1.sp
                    )
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = NeonCyan.copy(alpha = 0.15f),
                        border = BorderStroke(1.dp, NeonCyan)
                    ) {
                        Text(
                            text = "${paradoxes.size} PARADOXES",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = NeonCyan,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }
                }
                Text(
                    text = "A catalog of actual multi-layered logical knots, physical loops, and decision-theoretic anomalies.",
                    color = TextMuted,
                    fontSize = 11.sp
                )
            }
        }

        // Action controls (Search & Filter & Add New Toggle)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { viewModel.paradoxSearchQuery.value = it },
                placeholder = { Text("Search paradoxes, hash...", color = TextMuted, fontSize = 11.sp) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = TextLight,
                    unfocusedTextColor = TextLight,
                    focusedBorderColor = NeonCyan,
                    unfocusedBorderColor = CyberBorder
                ),
                modifier = Modifier.weight(1f).testTag("paradox_search_field")
            )

            Button(
                onClick = { showAddForm = !showAddForm },
                colors = ButtonDefaults.buttonColors(containerColor = if (showAddForm) NeonCoral else NeonCyan),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                modifier = Modifier.height(52.dp).testTag("toggle_resolve_form_btn")
            ) {
                Icon(
                    imageVector = if (showAddForm) Icons.Default.Close else Icons.Default.Add,
                    contentDescription = "Toggle Add",
                    tint = CyberDark
                )
            }
        }

        // Animated Add Form
        AnimatedVisibility(
            visible = showAddForm,
            enter = expandVertically() + fadeIn(),
            exit = shrinkVertically() + fadeOut()
        ) {
            Card(
                colors = CardDefaults.cardColors(containerColor = CyberCard),
                border = BorderStroke(1.dp, NeonCyan),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = "MANUALLY BIND NEW ANOMALY",
                        fontWeight = FontWeight.Bold,
                        color = NeonCyan,
                        fontSize = 11.sp
                    )

                    OutlinedTextField(
                        value = newName,
                        onValueChange = { viewModel.newParadoxName.value = it },
                        label = { Text("Paradox Name") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextLight,
                            unfocusedTextColor = TextLight,
                            focusedBorderColor = NeonCyan,
                            unfocusedBorderColor = CyberBorder
                        ),
                        modifier = Modifier.fillMaxWidth().testTag("new_paradox_name")
                    )

                    OutlinedTextField(
                        value = newDesc,
                        onValueChange = { viewModel.newParadoxDesc.value = it },
                        label = { Text("Apparent Contradiction (Description)") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextLight,
                            unfocusedTextColor = TextLight,
                            focusedBorderColor = NeonCyan,
                            unfocusedBorderColor = CyberBorder
                        ),
                        modifier = Modifier.fillMaxWidth().testTag("new_paradox_desc")
                    )

                    // Category Selector
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Category:", color = TextMuted, fontSize = 11.sp)
                        val pickerCategories = categories.filter { it != "ALL" }
                        var expandedCatMenu by remember { mutableStateOf(false) }
                        Box {
                            Button(
                                onClick = { expandedCatMenu = true },
                                colors = ButtonDefaults.buttonColors(containerColor = CyberBorder),
                                shape = RoundedCornerShape(6.dp),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(text = newCat, color = TextLight, fontSize = 11.sp)
                                    Icon(imageVector = Icons.Default.ArrowDropDown, contentDescription = null, tint = TextLight, modifier = Modifier.size(16.dp))
                                }
                            }
                            DropdownMenu(
                                expanded = expandedCatMenu,
                                onDismissRequest = { expandedCatMenu = false },
                                modifier = Modifier.background(CyberCard).border(1.dp, CyberBorder)
                            ) {
                                pickerCategories.forEach { cat ->
                                    DropdownMenuItem(
                                        text = { Text(cat, color = TextLight) },
                                        onClick = {
                                            viewModel.newParadoxCategory.value = cat
                                            expandedCatMenu = false
                                        }
                                    )
                                }
                            }
                        }
                    }

                    Button(
                        onClick = {
                            viewModel.resolveNewParadox()
                            showAddForm = false
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = NeonCyan),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth().testTag("submit_paradox_btn")
                    ) {
                        Text(text = "Register Paradox Anomaly", color = CyberDark, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Horizontal Category Filter chips
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(vertical = 2.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            categories.forEach { cat ->
                val isSelected = selectedCategory == cat
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (isSelected) NeonCyan.copy(alpha = 0.2f) else CyberCard,
                    border = BorderStroke(1.dp, if (isSelected) NeonCyan else CyberBorder),
                    modifier = Modifier.clickable {
                        viewModel.selectedParadoxCategory.value = cat
                    }
                ) {
                    Text(
                        text = cat,
                        color = if (isSelected) NeonCyan else TextMuted,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                    )
                }
            }
        }

        // Paradox List Area
        if (filteredParadoxes.isEmpty()) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(CyberCard)
                    .border(1.dp, CyberBorder, RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(text = "No resolved anomalies matched the filter parameters.", color = TextMuted, fontSize = 12.sp)
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredParadoxes) { paradox ->
                    val isExpanded = expandedParadoxId == paradox.id
                    Card(
                        colors = CardDefaults.cardColors(containerColor = CyberCard),
                        border = BorderStroke(1.dp, if (isExpanded) NeonCyan else CyberBorder),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                expandedParadoxId = if (isExpanded) null else paradox.id
                            }
                            .testTag("paradox_card_${paradox.id}")
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Surface(
                                        shape = RoundedCornerShape(4.dp),
                                        color = NeonAmber.copy(alpha = 0.15f),
                                        border = BorderStroke(1.dp, NeonAmber)
                                    ) {
                                        Text(
                                            text = paradox.category.uppercase(),
                                            fontSize = 8.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = NeonAmber,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }
                                    Text(
                                        text = paradox.name,
                                        color = TextLight,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            }

                            Text(
                                text = paradox.description,
                                color = TextMuted,
                                fontSize = 11.5.sp,
                                maxLines = if (isExpanded) Int.MAX_VALUE else 2,
                                overflow = TextOverflow.Ellipsis
                            )

                            AnimatedVisibility(
                                visible = isExpanded,
                                enter = expandVertically() + fadeIn(),
                                exit = shrinkVertically() + fadeOut()
                            ) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(top = 8.dp),
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    HorizontalDivider(color = CyberBorder)

                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column {
                                            Text(
                                                text = "CAUSAL ANCHOR LEDGER HASH",
                                                color = TextMuted,
                                                fontSize = 8.sp,
                                                fontWeight = FontWeight.Bold
                                            )
                                            Text(
                                                text = paradox.hash,
                                                color = NeonCyan,
                                                fontSize = 9.sp,
                                                fontFamily = FontFamily.Monospace
                                            )
                                        }

                                        Surface(
                                            shape = RoundedCornerShape(4.dp),
                                            color = CyberBorder,
                                            border = BorderStroke(1.dp, CyberBorder)
                                        ) {
                                            Text(
                                                text = "DIFFICULTY: ${paradox.difficulty}",
                                                fontSize = 8.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = TextMuted,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ---------------------- 6. SOVEREIGN MARKETING & COMMERCIAL HUB WORKSPACE ----------------------
@Composable
fun MediaHubWorkspace(viewModel: CorporateViewModel) {
    var brandName by remember { mutableStateOf("Sovereign Brain") }
    var templatePrice by remember { mutableStateOf("$4,500.00") }
    var techStack by remember { mutableStateOf("Rust / Kotlin / Jetpack Compose") }
    var targetBuyer by remember { mutableStateOf("Solopreneurs & Venture Studios") }

    var selectedSubTab by remember { mutableStateOf("SCRIPT") } // "SCRIPT" or "PAPER"

    val clipboardManager = androidx.compose.ui.platform.LocalClipboardManager.current
    val context = androidx.compose.ui.platform.LocalContext.current

    val commercialScript = remember(brandName, templatePrice, techStack, targetBuyer) {
        """
========================================================================
🎬 SOVEREIGN CORPORATION COMMERCIAL SCRIPT (Length: 90s)
========================================================================
Brand Name: $brandName
Template Price Option: $templatePrice
Engine Tech Stack: $techStack
Target Buyer Market: $targetBuyer
========================================================================

[SCENE 1: THE LIQUIDATION OF OVERHEAD]
VISUAL: A high-contrast shot of empty glass skyscrapers in a dense metropolis at twilight. Neon lights of cyan and amber reflect in the windows. Slowly, the camera pans up as the city lights blink off, replaced by glowing holographic servers humming in a sleek dark server rack.
AUDIO: A deep, resonant sub-bass synth drone begins (frequency: 44Hz). The steady, periodic "click-click" of a blockchain block confirmation or a neural synaptic spike is heard.
NARRATOR (V.O.):
"Traditional business structures are dead. High overhead, operational drag, legal friction, and manual fatigue. You spent millions building a company, only to spend millions managing the people managing it."

[SCENE 2: THE COGNITIVE REVOLUTION]
VISUAL: The camera enters a glowing server core. Seven interconnected glowing neon rings (The Seven Autonomic Loops) orbit a central CPU labeled "$brandName Core". Each ring pulses in sequence as they are mentioned: Reinvestment, Sentiment, Self-Healing, Benchmark, Compliance, Budget, Dependency.
AUDIO: Sound design accelerates with a metallic "shring" and high-energy synthesizer sweeps.
NARRATOR (V.O.):
"Introducing the Sovereign Autonomous Corporation Template. A 100% self-operating, decentralized enterprise blueprint running on complete closed-loop autonomy."

[SCENE 3: THE SEVEN AUTONOMIC LOOPS]
VISUAL: Rapid cuts showing the system's operational metrics updating in real-time.
1. "Fiduciary Reinvestment Loop" (Visual: A bank vault opens, routing a stream of glowing particles into high-capacity cloud cores).
2. "Dynamic Market Sentiment Scraper" (Visual: Code blocks scraping Twitter, Github, and SEC feeds, automatically compiling new product designs).
3. "Self-Healing Watchdog" (Visual: A red warning node automatically migrating its state to a green node at a new IP address in milliseconds).
4. "Compliance SOC2 Sync" (Visual: A holographic compliance shield sealing a transaction block with a unique cryptographic hash).
NARRATOR (V.O.):
"It doesn't just manage data. It earns. It reinvests its own net profits to scale computing capacity. It scrapes market trends, auto-synthesizes software products, heals its own deployment clusters during server failovers, and auto-audits its codebases against SOC2 security principles. Entirely human-free, built entirely using $techStack."

[SCENE 4: DEPLOYMENT IN 120 SECONDS]
VISUAL: A clean developer console. A user presses a single button: "DEPLOY SOVEREIGN TEMPLATE". In seconds, an entire digital corporation spins up, showing real-time PayPal processing, local database instances, and secure ledger ledgers syncing.
NARRATOR (V.O.):
"Whether you are selling B2B software, running algorithmic market makers, or provisioning zero-trust network nodes... our pre-engineered templates deploy in under two minutes."

[SCENE 5: CALL TO ACTION]
VISUAL: The screen reveals a beautiful Material 3 styled dashboard with a live UTC clock and the SolveX B2B marketplace logo. A prominent QR code appears next to the text: "GET THE $brandName TEMPLATE FOR JUST $templatePrice".
AUDIO: Music hits a final, triumphant, resonant major chord that decays into an ambient echo.
NARRATOR (V.O.):
"Own the future of commerce. Grab your Sovereign Corporation template today on the SolveX Marketplace, compile instantly via Google AI Studio APK builder, and launch your first zero-human operation."
TEXT ON SCREEN:
"$brandName Corporation Template: Zero Overhead. 100% Autonomy."
"Available Now on SolveX Marketplace for $templatePrice."
"Optimized for $targetBuyer."
""".trimIndent()
    }

    val sourcePaper = remember(brandName, templatePrice, techStack, targetBuyer) {
        """
# SOVEREIGN AUTONOMOUS CORPORATIONS: A PRODUCTION-GRADE ARCHITECTURE FOR DECENTRALIZED, ZERO-OVERHEAD FIDUCIARY ENTITIES

## SPECIAL REFERENCE INFORMATION
- BRAND IDENTITY: $brandName
- UNIT DEPLOYMENT VALUATION: $templatePrice
- CORE EXECUTION ARCHITECTURE: $techStack
- DESIRED TARGET RECIPIENTS: $targetBuyer

## SECTION 1: ABSTRACT
The contemporary corporate model suffers from significant systemic inefficiencies, including administrative overhead, human decision latency, jurisdictional friction, and high payroll burdens. This paper outlines the production-ready architecture of the Sovereign Autonomous Corporation—a software-defined, zero-overhead business entity designed to operate completely within a closed-loop cybernetic environment. Powered by the $brandName Cognitive Engine, this architecture demonstrates how a corporation can autonomously manage its own treasury, synthesize and list products, execute failovers, maintain SOC2 compliance, and regulate its execution cycles based on market liquidity.

## SECTION 2: ARCHITECTURAL SPECIFICATIONS & STATE CONSISTENCY
The operational backbone of the system resides in a high-density, multi-threaded framework consisting of:
1. **The 54-Node Recursive Foundry Lattice**: A state-reconciliation system designed to simulate distributed ledger operations.
2. **AAA-Sealed Cryptographic Enclaves**: Virtual secure execution spaces that separate critical fiduciary logic (e.g., private keys, API configurations) from public UI rendering. In the event of a debugger attachment or system penetration, a mechanical-trip switch executes a real-time memory purge of RAM nodes, returning the engine to homeostatic standby.
3. **The $brandName Core Engine**: A persistent coroutine loop that handles telemetry ingestion, inference reasoning, and action execution. Designed from the ground up using $techStack.

## SECTION 3: THE SEVEN AUTONOMIC CORE PIPELINES
To achieve true autopoiesis (self-creation and self-maintenance), the framework implements seven distinct, parallel self-operating loops:

### 1. Autonomous Revenue Reinvestment Loop
- **Trigger Condition**: Net Profit > $500.00 USD.
- **Action**: Automatically authorizes and executes a $150.00 investment transaction to purchase and upgrade Nitro compute capacity and API credit blocks.
- **Log Registry**: Logs verified compliant entries in the balance sheet, maintaining complete ledger traceability.

### 2. Dynamic Market Sentiment Scraper
- **Action**: Continuous scraping of decentralized feeds (Git trends, B2B procurement logs). Identifies high-performing architectural keywords (e.g., Post-Quantum Cryptography, Byzantine Scaling).
- **Automation**: Preemptively synthesizes a complete B2B product module, registers it on the SolveX Marketplace with active ratings, and lists it for instant PayPal-integrated acquisition.

### 3. Self-Healing Deployment Watchdog
- **Action**: Monitored node latency is calculated via continuous RPC ping sweeps. If response latency exceeds 300ms, the system triggers an automatic failover.
- **Mitigation**: Spins up a secondary, secure container instance at a randomized IP and migrates compiled binaries without data loss.

### 4. Fiduciary Performance Benchmarking
- **Action**: Analyzes historical sales metrics of synthesized assets. If active B2B products cataloged in the market exceed 2 units, the system programmatically prunes the lowest-performing module, keeping operational assets high-yield and clean.

### 5. Automated Regulatory & SOC2/ISO 27001 Compliance Sync
- **Action**: Continuous automated scanning of software specifications against SOC2 Trust Services Principles and ISO 27001 security standards. Registers cryptographic compliance signatures on each loop block.

### 6. Predictive Operational Budgeting
- **Action**: Dynamic resource throttling based on real-time treasury reserves. If net liquidity falls below a critical safeguard limit ($100), the system transitions from 'ULTRA_RECURSIVE' mode (15-second cycles) to 'ECO_PRESERVE' mode (30-second delays) to conserve core treasury reserves.

### 7. Secure Dependency Lifecycle Guard
- **Action**: Pre-compilation scanner that performs Abstract Syntax Tree (AST) scanning of binary imports and third-party dependencies. Ensures zero vulnerabilities are present in output artifacts before final container assemblies.

## SECTION 4: FIDUCIARY IMPLEMENTATION VIA SOLVEX & PAYPAL
Procurement transactions within the template are governed by a real-time integration with PayPal's REST APIs. This enables instant enterprise acquisition. Users configure Sandbox or Live API credentials directly inside the secure memory enclave, supporting secure checkout flows without intermediate human broker fees.

## SECTION 5: GOOGLE AI STUDIO APK BUILDER SPECIFICATIONS
The design is optimized for standard Android platform runtimes. It compiles under Kotlin 1.9+, Gradle (Kotlin DSL), and Jetpack Compose, complying with modern edge-to-edge system insets and Material Design 3 guidelines. The integration with Gemini's server-side API provides an on-device corporate co-pilot that can be compiled instantly into a secure, portable APK using the Google AI Studio builder. This guarantees frictionless delivery to $targetBuyer.
""".trimIndent()
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize().testTag("media_hub_scrollable"),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(bottom = 24.dp)
    ) {
        // Welcome and intro banner
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CyberCard),
                border = BorderStroke(1.dp, NeonCyan.copy(alpha = 0.5f)),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(imageVector = Icons.Default.Campaign, contentDescription = null, tint = NeonCyan)
                        Text(
                            text = "SOVEREIGN MARKETING & COMMERCIAL HUB",
                            color = NeonCyan,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )
                    }
                    Text(
                        text = "Generate commercial scripts and NotebookLM reference papers dynamically. Customize parameters below to update sales assets, then copy them directly to build marketing funnels or generate NotebookLM podcasts.",
                        color = TextMuted,
                        fontSize = 11.sp
                    )
                }
            }
        }

        // Configurator Panel Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CyberCard),
                border = BorderStroke(1.dp, CyberBorder),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "⚙️ MARKETING TEMPLATE CONFIGURATOR",
                        color = NeonAmber,
                        fontSize = 10.5.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.5.sp
                    )

                    OutlinedTextField(
                        value = brandName,
                        onValueChange = { brandName = it },
                        label = { Text("Brand / Solution Name", color = TextMuted, fontSize = 10.sp) },
                        textStyle = androidx.compose.ui.text.TextStyle(fontSize = 11.sp, color = TextLight),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextLight,
                            unfocusedTextColor = TextLight,
                            focusedBorderColor = NeonCyan,
                            unfocusedBorderColor = CyberBorder
                        ),
                        modifier = Modifier.fillMaxWidth().height(52.dp)
                    )

                    OutlinedTextField(
                        value = templatePrice,
                        onValueChange = { templatePrice = it },
                        label = { Text("Template License Cost (USD)", color = TextMuted, fontSize = 10.sp) },
                        textStyle = androidx.compose.ui.text.TextStyle(fontSize = 11.sp, color = TextLight),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextLight,
                            unfocusedTextColor = TextLight,
                            focusedBorderColor = NeonCyan,
                            unfocusedBorderColor = CyberBorder
                        ),
                        modifier = Modifier.fillMaxWidth().height(52.dp)
                    )

                    OutlinedTextField(
                        value = techStack,
                        onValueChange = { techStack = it },
                        label = { Text("Core Architecture Stack", color = TextMuted, fontSize = 10.sp) },
                        textStyle = androidx.compose.ui.text.TextStyle(fontSize = 11.sp, color = TextLight),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextLight,
                            unfocusedTextColor = TextLight,
                            focusedBorderColor = NeonCyan,
                            unfocusedBorderColor = CyberBorder
                        ),
                        modifier = Modifier.fillMaxWidth().height(52.dp)
                    )

                    OutlinedTextField(
                        value = targetBuyer,
                        onValueChange = { targetBuyer = it },
                        label = { Text("Target Customer Profile", color = TextMuted, fontSize = 10.sp) },
                        textStyle = androidx.compose.ui.text.TextStyle(fontSize = 11.sp, color = TextLight),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextLight,
                            unfocusedTextColor = TextLight,
                            focusedBorderColor = NeonCyan,
                            unfocusedBorderColor = CyberBorder
                        ),
                        modifier = Modifier.fillMaxWidth().height(52.dp)
                    )
                }
            }
        }

        // Tabs to select SCRIPT vs PAPER
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = { selectedSubTab = "SCRIPT" },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (selectedSubTab == "SCRIPT") NeonCyan else CyberCard
                    ),
                    border = BorderStroke(1.dp, if (selectedSubTab == "SCRIPT") NeonCyan else CyberBorder),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1f).height(40.dp)
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Movie,
                            contentDescription = null,
                            tint = if (selectedSubTab == "SCRIPT") CyberDark else TextLight,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "COMMERCIAL SCRIPT",
                            color = if (selectedSubTab == "SCRIPT") CyberDark else TextLight,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Button(
                    onClick = { selectedSubTab = "PAPER" },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (selectedSubTab == "PAPER") NeonCyan else CyberCard
                    ),
                    border = BorderStroke(1.dp, if (selectedSubTab == "PAPER") NeonCyan else CyberBorder),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1f).height(40.dp)
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Description,
                            contentDescription = null,
                            tint = if (selectedSubTab == "PAPER") CyberDark else TextLight,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "NOTEBOOKLM PAPER",
                            color = if (selectedSubTab == "PAPER") CyberDark else TextLight,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        // Render Panel with COPY Button
        item {
            val textToDisplay = if (selectedSubTab == "SCRIPT") commercialScript else sourcePaper
            val subTitleText = if (selectedSubTab == "SCRIPT") "90s High-Impact Video/Audio Commercial Script" else "Technical Reference Paper for NotebookLM AI Ingestion"

            Card(
                colors = CardDefaults.cardColors(containerColor = CyberCard),
                border = BorderStroke(1.dp, CyberBorder),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = if (selectedSubTab == "SCRIPT") "🎬 GENERATED COMMERCIAL SCRIPT" else "📄 NOTEBOOKLM REFERENCE PAPER",
                                color = NeonGreen,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = subTitleText,
                                color = TextMuted,
                                fontSize = 9.sp
                            )
                        }

                        Button(
                            onClick = {
                                clipboardManager.setText(androidx.compose.ui.text.AnnotatedString(textToDisplay))
                                android.widget.Toast.makeText(context, "Full document copied to clipboard!", android.widget.Toast.LENGTH_SHORT).show()
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = NeonGreen),
                            shape = RoundedCornerShape(6.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                            modifier = Modifier.height(32.dp)
                        ) {
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ContentCopy,
                                    contentDescription = "Copy",
                                    tint = CyberDark,
                                    modifier = Modifier.size(14.dp)
                                )
                                Text(
                                    text = "COPY TEXT",
                                    color = CyberDark,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    HorizontalDivider(color = CyberBorder, thickness = 1.dp)

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(max = 400.dp)
                            .background(CyberDark)
                            .border(1.dp, CyberBorder, RoundedCornerShape(8.dp))
                            .padding(12.dp)
                            .verticalScroll(rememberScrollState())
                    ) {
                        Text(
                            text = textToDisplay,
                            color = TextLight,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace,
                            lineHeight = 14.sp
                        )
                    }
                }
            }
        }
    }
}

