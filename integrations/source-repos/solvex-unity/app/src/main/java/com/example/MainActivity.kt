package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.*
import com.example.ui.*
import com.example.ui.theme.*
import java.text.DecimalFormat

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val context = LocalContext.current
                    val database = remember { ParadoxDatabase.getDatabase(context) }
                    val repository = remember { ParadoxRepository(database.paradoxDao()) }
                    val viewModel: ParadoxViewModel = viewModel(
                        factory = ParadoxViewModelFactory(repository)
                    )
                    ParadoxExchangeApp(viewModel)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ParadoxExchangeApp(viewModel: ParadoxViewModel) {
    val paradoxes by viewModel.paradoxes.collectAsStateWithLifecycle()
    val auditLogs by viewModel.auditLogs.collectAsStateWithLifecycle()
    val wallet by viewModel.wallet.collectAsStateWithLifecycle()
    val selectedId by viewModel.selectedParadoxId.collectAsStateWithLifecycle()
    val sandboxState by viewModel.sandboxState.collectAsStateWithLifecycle()
    val enclaveState by viewModel.enclaveState.collectAsStateWithLifecycle()

    var currentTab by remember { mutableStateOf("CORE") }
    var sandboxInput by remember { mutableStateOf("") }
    var enclaveInput by remember { mutableStateOf("") }
    var customCodeContent by remember { mutableStateOf("") }
    var customRulesContent by remember { mutableStateOf("") }

    // Evolutionary tier & Factory States
    var selectedTier by remember { mutableStateOf(1) }
    var watermarkEnabled by remember { mutableStateOf(true) }
    var obfuscationEnabled by remember { mutableStateOf(true) }
    var fingerprintEnabled by remember { mutableStateOf(true) }
    var tamperSealEnabled by remember { mutableStateOf(true) }
    var factoryBuildStatus by remember { mutableStateOf<String?>(null) }
    var factoryLogs by remember { mutableStateOf<List<String>>(emptyList()) }

    val df = remember { DecimalFormat("$#,##0.00") }
    val selectedParadox = remember(paradoxes, selectedId) { paradoxes.find { it.id == selectedId } }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        contentWindowInsets = WindowInsets.safeDrawing,
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(CyberSurface)
                    .drawBehind {
                        drawLine(
                            color = CyberDivider,
                            start = Offset(0f, size.height),
                            end = Offset(size.width, size.height),
                            strokeWidth = 2f
                        )
                    }
                    .padding(horizontal = 16.dp, vertical = 12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(10.dp)
                                .clip(RoundedCornerShape(5.dp))
                                .background(CyberPrimary)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "DAISY HAMINJA SOVEREIGN CORE",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            color = CyberTextBright,
                            letterSpacing = 1.sp
                        )
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(CyberSurfaceVariant)
                            .border(1.dp, CyberPrimary.copy(alpha = 0.4f), RoundedCornerShape(4.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = "Sync Indicator",
                                tint = CyberPrimary,
                                modifier = Modifier.size(12.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "ENCLAVE-OK",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace,
                                color = CyberPrimary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "SECURE ESCROW BALANCE",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = CyberTextMuted,
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            text = wallet?.let { df.format(it.treasuryBalanceUsd) } ?: "$100,000,000.00",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = CyberPrimary,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = "SECURITY STATUS",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = CyberTextMuted,
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            text = wallet?.securityLevel ?: "Quantum-Resistant Shield",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = CyberSecondary,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }
            }
        },
        bottomBar = {
            NavigationBar(
                containerColor = CyberSurface,
                modifier = Modifier.border(0.5.dp, CyberDivider, RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp))
            ) {
                val tabs = listOf(
                    Triple("CORE", Icons.Default.Home, "Core Hub"),
                    Triple("EXPLORE", Icons.Default.Search, "Requisitions"),
                    Triple("ZK-PROVER", Icons.Default.PlayArrow, "ZK-Prover"),
                    Triple("ENCLAVE", Icons.Default.Settings, "Enclaves"),
                    Triple("SYNAPSE", Icons.Default.Info, "Synapse Base")
                )

                tabs.forEach { (tabId, icon, label) ->
                    NavigationBarItem(
                        selected = currentTab == tabId,
                        onClick = { currentTab = tabId },
                        label = {
                            Text(
                                text = label,
                                fontSize = 9.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                        },
                        icon = { Icon(imageVector = icon, contentDescription = label, modifier = Modifier.size(20.dp)) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = CyberPrimary,
                            selectedTextColor = CyberPrimary,
                            indicatorColor = CyberSurfaceVariant,
                            unselectedIconColor = CyberTextMuted,
                            unselectedTextColor = CyberTextMuted
                        )
                    )
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(CyberBackground)
        ) {
            // High-fidelity background grid lines
            Canvas(modifier = Modifier.fillMaxSize()) {
                val step = 45.dp.toPx()
                val gridColor = CyberDivider.copy(alpha = 0.2f)
                var x = 0f
                while (x < size.width) {
                    drawLine(gridColor, Offset(x, 0f), Offset(x, size.height), 1.dp.toPx())
                    x += step
                }
                var y = 0f
                while (y < size.height) {
                    drawLine(gridColor, Offset(0f, y), Offset(size.width, y), 1.dp.toPx())
                    y += step
                }
            }

            AnimatedContent(
                targetState = currentTab,
                transitionSpec = { fadeIn() togetherWith fadeOut() },
                label = "TabContent"
            ) { targetTab ->
                when (targetTab) {
                    "CORE" -> CoreHubTab(
                        auditLogs = auditLogs,
                        onClearLogs = { viewModel.clearAuditLogs() },
                        selectedTier = selectedTier,
                        onTierSelected = { selectedTier = it },
                        watermarkEnabled = watermarkEnabled,
                        onWatermarkToggle = { watermarkEnabled = !watermarkEnabled },
                        obfuscationEnabled = obfuscationEnabled,
                        onObfuscationToggle = { obfuscationEnabled = !obfuscationEnabled },
                        fingerprintEnabled = fingerprintEnabled,
                        onFingerprintToggle = { fingerprintEnabled = !fingerprintEnabled },
                        tamperSealEnabled = tamperSealEnabled,
                        onTamperSealToggle = { tamperSealEnabled = !tamperSealEnabled },
                        factoryBuildStatus = factoryBuildStatus,
                        onBuildStatusChange = { factoryBuildStatus = it },
                        factoryLogs = factoryLogs,
                        onFactoryLogsChange = { factoryLogs = it }
                    )
                    "EXPLORE" -> ExploreTab(
                        paradoxes = paradoxes,
                        selectedParadox = selectedParadox,
                        onSelect = { viewModel.selectParadox(it) },
                        onBuy = { viewModel.buyLicense(it) },
                        onReset = { viewModel.resetSystem() }
                    )
                    "ZK-PROVER" -> ZkProverTab(
                        paradoxes = paradoxes,
                        selectedParadox = selectedParadox,
                        sandboxState = sandboxState,
                        sandboxInput = sandboxInput,
                        onSandboxInputChange = { sandboxInput = it },
                        onSelectParadox = { viewModel.selectParadox(it) },
                        onVerifySandbox = { id, text -> viewModel.runSandboxProofSimulation(id, text) },
                        customCode = customCodeContent,
                        onCustomCodeChange = { customCodeContent = it },
                        customRules = customRulesContent,
                        onCustomRulesChange = { customRulesContent = it },
                        onVerifyCustom = { code, rules -> viewModel.submitCustomCodebaseZKAudit(code, rules) }
                    )
                    "ENCLAVE" -> EnclaveTab(
                        paradoxes = paradoxes,
                        selectedParadox = selectedParadox,
                        enclaveState = enclaveState,
                        input = enclaveInput,
                        onInputChange = { enclaveInput = it },
                        onSelect = { viewModel.selectParadox(it) },
                        onStart = { id, text -> viewModel.executeLicensedEnclaveSimulation(id, text) },
                        onStop = { viewModel.stopEnclaveSimulation() },
                        selectedTier = selectedTier
                    )
                    "SYNAPSE" -> SynapticBaseTab()
                }
            }
        }
    }
}
