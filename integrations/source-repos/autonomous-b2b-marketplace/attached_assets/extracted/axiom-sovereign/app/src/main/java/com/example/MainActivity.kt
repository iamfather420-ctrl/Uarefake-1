package com.example

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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
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

    var currentTab by remember { mutableStateOf("EXPLORE") }
    var sandboxInput by remember { mutableStateOf("") }
    var enclaveInput by remember { mutableStateOf("") }
    var customCodeContent by remember { mutableStateOf("") }
    var customRulesContent by remember { mutableStateOf("") }

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
                            text = "PARADOX EXCHANGE",
                            fontSize = 18.sp,
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
                    Triple("EXPLORE", Icons.Default.Search, "Explore"),
                    Triple("SANDBOX", Icons.Default.PlayArrow, "ZK-Sandbox"),
                    Triple("ENCLAVE", Icons.Default.Settings, "Enclaves"),
                    Triple("AUDITS", Icons.Default.List, "Audits"),
                    Triple("CODE-ZK", Icons.Default.CheckCircle, "Custom ZK")
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
                    "EXPLORE" -> ExploreTab(
                        paradoxes = paradoxes,
                        selectedParadox = selectedParadox,
                        onSelect = { viewModel.selectParadox(it) },
                        onBuy = { viewModel.buyLicense(it) },
                        onReset = { viewModel.resetSystem() }
                    )
                    "SANDBOX" -> SandboxTab(
                        paradoxes = paradoxes,
                        selectedParadox = selectedParadox,
                        sandboxState = sandboxState,
                        input = sandboxInput,
                        onInputChange = { sandboxInput = it },
                        onSelect = { viewModel.selectParadox(it) },
                        onVerify = { id, text -> viewModel.runSandboxProofSimulation(id, text) }
                    )
                    "ENCLAVE" -> EnclaveTab(
                        paradoxes = paradoxes,
                        selectedParadox = selectedParadox,
                        enclaveState = enclaveState,
                        input = enclaveInput,
                        onInputChange = { enclaveInput = it },
                        onSelect = { viewModel.selectParadox(it) },
                        onStart = { id, text -> viewModel.executeLicensedEnclaveSimulation(id, text) },
                        onStop = { viewModel.stopEnclaveSimulation() }
                    )
                    "AUDITS" -> AuditsTab(
                        auditLogs = auditLogs,
                        onClear = { viewModel.clearAuditLogs() }
                    )
                    "CODE-ZK" -> CodeZkTab(
                        codeContent = customCodeContent,
                        onCodeChange = { customCodeContent = it },
                        rulesContent = customRulesContent,
                        onRulesChange = { customRulesContent = it },
                        sandboxState = sandboxState,
                        onVerify = { code, rules -> viewModel.submitCustomCodebaseZKAudit(code, rules) }
                    )
                }
            }
        }
    }
}

@Composable
fun ExploreTab(
    paradoxes: List<ParadoxEntity>,
    selectedParadox: ParadoxEntity?,
    onSelect: (String?) -> Unit,
    onBuy: (String) -> Unit,
    onReset: () -> Unit
) {
    Box(modifier = Modifier.fillMaxSize()) {
        if (selectedParadox == null) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                item {
                    Column {
                        Text(
                            text = "SOVEREIGN HIGH-TECH PROTOCOLS",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            color = CyberSecondary
                        )
                        Text(
                            text = "Select a cryptographic paradox to verify mathematically or deploy to a secure enclave.",
                            fontSize = 11.sp,
                            color = CyberTextMuted
                        )
                    }
                }

                items(paradoxes) { item ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSelect(item.id) }
                            .testTag("paradox_card_${item.id}"),
                        colors = CardDefaults.cardColors(containerColor = CyberSurface),
                        border = BorderStroke(1.dp, if (item.isLicensed) CyberPrimary.copy(alpha = 0.5f) else CyberDivider),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(CyberSurfaceVariant)
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = item.category.uppercase(),
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace,
                                        color = CyberSecondary
                                    )
                                }

                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(if (item.isLicensed) CyberPrimary.copy(alpha = 0.15f) else CyberTertiary.copy(alpha = 0.15f))
                                        .border(1.dp, if (item.isLicensed) CyberPrimary else CyberTertiary.copy(alpha = 0.6f), RoundedCornerShape(4.dp))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = if (item.isLicensed) "LICENSED [ACTIVE]" else "SECURED [LOCKED]",
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        fontFamily = FontFamily.Monospace,
                                        color = if (item.isLicensed) CyberPrimary else CyberTertiary
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))
                            Text(text = item.title, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = CyberTextBright, fontFamily = FontFamily.Monospace)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(text = item.summary, fontSize = 11.sp, color = CyberTextMuted)
                            Spacer(modifier = Modifier.height(10.dp))
                            Divider(color = CyberDivider)
                            Spacer(modifier = Modifier.height(10.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(text = "DIFFICULTY: ${item.difficulty.uppercase()}", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = CyberTextMuted, fontFamily = FontFamily.Monospace)
                                Text(text = DecimalFormat("$#,##0").format(item.costUsd) + " USD", fontSize = 12.sp, fontWeight = FontWeight.ExtraBold, color = CyberPrimary, fontFamily = FontFamily.Monospace)
                            }
                        }
                    }
                }

                item {
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = onReset,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .testTag("reset_system_button"),
                        colors = ButtonDefaults.buttonColors(containerColor = CyberAlertRed.copy(alpha = 0.15f), contentColor = CyberAlertRed),
                        border = BorderStroke(1.dp, CyberAlertRed.copy(alpha = 0.5f)),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Refresh, contentDescription = "Reset Icon")
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(text = "RESET ESCROWS & RELOCK ALL ENCLAVES", fontSize = 11.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                        }
                    }
                }
            }
        } else {
            // Detailed View
            val scrollState = rememberScrollState()
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(scrollState)
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { onSelect(null) },
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(CyberSurface)
                            .border(1.dp, CyberDivider, RoundedCornerShape(8.dp))
                    ) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back icon", tint = CyberPrimary, modifier = Modifier.size(18.dp))
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(text = "RETURN TO CATALOUGE", fontSize = 11.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = CyberTextMuted)
                }

                Text(text = selectedParadox.title, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold, color = CyberTextBright, fontFamily = FontFamily.Monospace)
                Spacer(modifier = Modifier.height(12.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Box(modifier = Modifier.weight(1f).clip(RoundedCornerShape(8.dp)).background(CyberSurface).border(1.dp, CyberDivider, RoundedCornerShape(8.dp)).padding(12.dp)) {
                        Column {
                            Text(text = "RATING", fontSize = 9.sp, color = CyberTextMuted, fontFamily = FontFamily.Monospace)
                            Text(text = selectedParadox.difficulty.uppercase(), fontSize = 13.sp, fontWeight = FontWeight.Bold, color = CyberTertiary, fontFamily = FontFamily.Monospace)
                        }
                    }
                    Box(modifier = Modifier.weight(1f).clip(RoundedCornerShape(8.dp)).background(CyberSurface).border(1.dp, CyberDivider, RoundedCornerShape(8.dp)).padding(12.dp)) {
                        Column {
                            Text(text = "LICENSE FEE", fontSize = 9.sp, color = CyberTextMuted, fontFamily = FontFamily.Monospace)
                            Text(text = DecimalFormat("$#,##0").format(selectedParadox.costUsd), fontSize = 13.sp, fontWeight = FontWeight.Bold, color = CyberPrimary, fontFamily = FontFamily.Monospace)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (selectedParadox.isLicensed) CyberPrimary.copy(alpha = 0.05f) else CyberTertiary.copy(alpha = 0.05f))
                        .border(1.dp, if (selectedParadox.isLicensed) CyberPrimary else CyberTertiary, RoundedCornerShape(8.dp))
                        .padding(16.dp)
                ) {
                    if (selectedParadox.isLicensed) {
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.CheckCircle, contentDescription = "Active icon", tint = CyberPrimary, modifier = Modifier.size(20.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(text = "SECURE ENCLAVE ACTIVE", fontSize = 12.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = CyberPrimary)
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(text = "This protocol is compiled in your hardware-shielded CPU enclave. Navigate to the Enclaves tab or ZK-Sandbox to execute payload pipelines.", fontSize = 11.sp, color = CyberTextBright)
                        }
                    } else {
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Lock, contentDescription = "Locked icon", tint = CyberTertiary, modifier = Modifier.size(20.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(text = "SOLVEX ESCROW REQUISITION", fontSize = 12.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = CyberTertiary)
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(text = "Deploy the fully resolved cryptographic solution directly to your secure server. Source files are strictly secured from cloning.", fontSize = 11.sp, color = CyberTextMuted)
                            Spacer(modifier = Modifier.height(12.dp))
                            Button(
                                onClick = { onBuy(selectedParadox.id) },
                                modifier = Modifier.fillMaxWidth().height(48.dp).testTag("purchase_license_button"),
                                colors = ButtonDefaults.buttonColors(containerColor = CyberPrimary, contentColor = CyberOnPrimary),
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.ShoppingCart, contentDescription = "Buy icon")
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(text = "BUY LICENSE & DEPLOY TO ENCLAVE", fontSize = 11.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))
                Text(text = "THE SYSTEMIC PARADOX", fontSize = 11.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = CyberSecondary)
                Spacer(modifier = Modifier.height(6.dp))
                Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(CyberSurface).border(1.dp, CyberDivider, RoundedCornerShape(8.dp)).padding(14.dp)) {
                    Text(text = selectedParadox.paradoxStatement, fontSize = 12.sp, color = CyberTextBright, lineHeight = 18.sp)
                }

                Spacer(modifier = Modifier.height(20.dp))
                Text(text = "SECURE PROTOCOL RESOLUTION", fontSize = 11.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = CyberPrimary)
                Spacer(modifier = Modifier.height(6.dp))
                Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(CyberSurface).border(1.dp, CyberPrimary.copy(alpha = 0.2f), RoundedCornerShape(8.dp)).padding(14.dp)) {
                    Column {
                        Text(text = selectedParadox.secureSolution, fontSize = 12.sp, color = CyberTextBright, lineHeight = 18.sp)
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(text = "ALGEBRAIC MATRIX: " + selectedParadox.cryptographicPrimitives, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = CyberSecondary, fontFamily = FontFamily.Monospace)
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))
                Text(text = "HARDWARE DEPLOYMENT TARGET", fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = CyberTextMuted)
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = selectedParadox.technicalStack,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    color = CyberTextMuted,
                    modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(4.dp)).background(CyberSurface).border(0.5.dp, CyberDivider, RoundedCornerShape(4.dp)).padding(12.dp)
                )
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
fun SandboxTab(
    paradoxes: List<ParadoxEntity>,
    selectedParadox: ParadoxEntity?,
    sandboxState: SandboxState,
    input: String,
    onInputChange: (String) -> Unit,
    onSelect: (String?) -> Unit,
    onVerify: (String, String) -> Unit
) {
    var dropdownExpanded by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        Text(text = "ZK-PROOFS BEFORE-SALE SANBOX", fontSize = 14.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = CyberSecondary)
        Text(text = "Audit and mathematically prove that solutions operate cleanly without accessing raw source libraries.", fontSize = 11.sp, color = CyberTextMuted, modifier = Modifier.padding(bottom = 16.dp))

        Text(text = "CHOOSE SECURE INTERACTIVE PROVER:", fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = CyberTextBright)
        Spacer(modifier = Modifier.height(6.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(8.dp))
                .background(CyberSurface)
                .border(1.dp, CyberDivider, RoundedCornerShape(8.dp))
                .clickable { dropdownExpanded = true }
                .padding(14.dp)
        ) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = selectedParadox?.title ?: "-- EXPAND SELECTOR --",
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    color = if (selectedParadox != null) CyberPrimary else CyberTextMuted
                )
                Icon(imageVector = Icons.Default.ArrowDropDown, contentDescription = "Arrow Dropdown", tint = CyberPrimary)
            }

            DropdownMenu(
                expanded = dropdownExpanded,
                onDismissRequest = { dropdownExpanded = false },
                modifier = Modifier.fillMaxWidth(0.9f).background(CyberSurface).border(1.dp, CyberDivider)
            ) {
                paradoxes.forEach { paradox ->
                    DropdownMenuItem(
                        text = { Text(text = paradox.title, fontFamily = FontFamily.Monospace, fontSize = 11.sp, color = CyberTextBright) },
                        onClick = {
                            onSelect(paradox.id)
                            dropdownExpanded = false
                        }
                    )
                }
            }
        }

        if (selectedParadox != null) {
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedTextField(
                value = input,
                onValueChange = onInputChange,
                modifier = Modifier.fillMaxWidth().testTag("sandbox_payload_input"),
                textStyle = TextStyle(fontFamily = FontFamily.Monospace, fontSize = 12.sp, color = CyberTextBright),
                placeholder = { Text(text = "Input test parameters (e.g. SWIFT 100k, Clock drift max, or Custom rules)", fontSize = 11.sp, color = CyberTextMuted, fontFamily = FontFamily.Monospace) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = CyberPrimary,
                    unfocusedBorderColor = CyberDivider,
                    focusedContainerColor = CyberSurface,
                    unfocusedContainerColor = CyberSurface
                ),
                shape = RoundedCornerShape(6.dp)
            )

            Spacer(modifier = Modifier.height(14.dp))
            Button(
                onClick = { onVerify(selectedParadox.id, input) },
                enabled = sandboxState !is SandboxState.Proving,
                modifier = Modifier.fillMaxWidth().height(48.dp).testTag("generate_proof_button"),
                colors = ButtonDefaults.buttonColors(containerColor = CyberPrimary, contentColor = CyberOnPrimary),
                shape = RoundedCornerShape(6.dp)
            ) {
                if (sandboxState is SandboxState.Proving) {
                    CircularProgressIndicator(modifier = Modifier.size(24.dp), color = CyberOnPrimary)
                } else {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.PlayArrow, contentDescription = "Compute Proof")
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = "GENERATE ZERO-KNOWLEDGE PROOF CHALLENGE", fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                    }
                }
            }

            AnimatedVisibility(visible = sandboxState !is SandboxState.Idle) {
                Spacer(modifier = Modifier.height(16.dp))
                when (sandboxState) {
                    is SandboxState.Proving -> {
                        Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(CyberSurface).border(1.dp, CyberTertiary.copy(alpha = 0.5f), RoundedCornerShape(8.dp)).padding(20.dp), contentAlignment = Alignment.Center) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                CircularProgressIndicator(color = CyberPrimary)
                                Spacer(modifier = Modifier.height(10.dp))
                                Text(text = "RESOLVING POLYNOMIAL CONSTRAINTS...", fontSize = 10.sp, fontFamily = FontFamily.Monospace, color = CyberTertiary, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                    is SandboxState.Success -> {
                        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(CyberPrimary.copy(alpha = 0.1f)).border(1.dp, CyberPrimary, RoundedCornerShape(8.dp)).padding(14.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.CheckCircle, contentDescription = "Check Circle", tint = CyberPrimary, modifier = Modifier.size(24.dp))
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Column {
                                        Text(text = "ZK PROOF CHALLENGE SOLVED", fontSize = 12.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = CyberPrimary)
                                        Text(text = "Verification: 100% SECURE. Executed logic matches rule specifications perfectly.", fontSize = 9.sp, color = CyberTextBright)
                                    }
                                }
                            }

                            Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(CyberSurface).border(1.dp, CyberDivider, RoundedCornerShape(8.dp)).padding(12.dp)) {
                                Column {
                                    Text(text = "ZK-PROOFS PARAMETERS", fontSize = 8.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = CyberSecondary)
                                    sandboxState.proofs.forEach { proof ->
                                        Text(text = proof, fontSize = 9.sp, fontFamily = FontFamily.Monospace, color = CyberTextMuted)
                                    }
                                }
                            }

                            Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(Color.Black).border(1.dp, CyberDivider, RoundedCornerShape(8.dp)).padding(12.dp)) {
                                Text(text = sandboxState.logOutput, fontSize = 9.sp, fontFamily = FontFamily.Monospace, color = CyberPrimary, lineHeight = 13.sp)
                            }
                        }
                    }
                    else -> {}
                }
            }
        }
        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
fun EnclaveTab(
    paradoxes: List<ParadoxEntity>,
    selectedParadox: ParadoxEntity?,
    enclaveState: EnclaveExecutionState,
    input: String,
    onInputChange: (String) -> Unit,
    onSelect: (String?) -> Unit,
    onStart: (String, String) -> Unit,
    onStop: () -> Unit
) {
    var dropdownExpanded by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        Text(text = "SECURE SYSTEM ENCLAVES", fontSize = 14.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = CyberPrimary)
        Text(text = "Stream real-time high-velocity data feeds inside hardware-isolated CPU enclaves (Intel SGX / AMD SEV) and observe isolated execution logs.", fontSize = 11.sp, color = CyberTextMuted, modifier = Modifier.padding(bottom = 16.dp))

        Text(text = "SELECT ACTIVE SYSTEM ENCLAVE ROUTINE:", fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = CyberTextBright)
        Spacer(modifier = Modifier.height(6.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(8.dp))
                .background(CyberSurface)
                .border(1.dp, CyberDivider, RoundedCornerShape(8.dp))
                .clickable { dropdownExpanded = true }
                .padding(14.dp)
        ) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = selectedParadox?.title ?: "-- EXPAND ACTIVE SERVICES --",
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    color = if (selectedParadox != null) CyberPrimary else CyberTextMuted
                )
                Icon(imageVector = Icons.Default.ArrowDropDown, contentDescription = "Dropdown icon", tint = CyberPrimary)
            }

            DropdownMenu(
                expanded = dropdownExpanded,
                onDismissRequest = { dropdownExpanded = false },
                modifier = Modifier.fillMaxWidth(0.9f).background(CyberSurface).border(1.dp, CyberDivider)
            ) {
                val licensedList = paradoxes.filter { it.isLicensed }
                if (licensedList.isEmpty()) {
                    DropdownMenuItem(
                        text = { Text(text = "No active enclaves found. Activate one in Explore.", color = CyberTextMuted, fontSize = 11.sp) },
                        onClick = { dropdownExpanded = false }
                    )
                } else {
                    licensedList.forEach { paradox ->
                        DropdownMenuItem(
                            text = { Text(text = paradox.title, fontFamily = FontFamily.Monospace, fontSize = 11.sp, color = CyberTextBright) },
                            onClick = {
                                onSelect(paradox.id)
                                dropdownExpanded = false
                            }
                        )
                    }
                }
            }
        }

        if (selectedParadox != null) {
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedTextField(
                value = input,
                onValueChange = onInputChange,
                modifier = Modifier.fillMaxWidth().testTag("enclave_stream_input"),
                textStyle = TextStyle(fontFamily = FontFamily.Monospace, fontSize = 12.sp, color = CyberTextBright),
                placeholder = { Text(text = "Enter live execution stream data payload...", fontSize = 11.sp, color = CyberTextMuted, fontFamily = FontFamily.Monospace) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = CyberPrimary,
                    unfocusedBorderColor = CyberDivider,
                    focusedContainerColor = CyberSurface,
                    unfocusedContainerColor = CyberSurface
                ),
                shape = RoundedCornerShape(6.dp)
            )

            Spacer(modifier = Modifier.height(14.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Button(
                    onClick = { onStart(selectedParadox.id, input) },
                    enabled = enclaveState !is EnclaveExecutionState.Starting,
                    modifier = Modifier.weight(1f).height(48.dp).testTag("start_enclave_button"),
                    colors = ButtonDefaults.buttonColors(containerColor = CyberPrimary, contentColor = CyberOnPrimary),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.PlayArrow, contentDescription = "Run Icon")
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "START RUNTIME", fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                    }
                }

                Button(
                    onClick = onStop,
                    modifier = Modifier.weight(1f).height(48.dp).testTag("stop_enclave_button"),
                    colors = ButtonDefaults.buttonColors(containerColor = CyberAlertRed.copy(alpha = 0.15f), contentColor = CyberAlertRed),
                    border = BorderStroke(1.dp, CyberAlertRed.copy(alpha = 0.5f)),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Close, contentDescription = "Stop icon")
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "TERMINATE", fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                    }
                }
            }

            AnimatedVisibility(visible = enclaveState !is EnclaveExecutionState.Idle) {
                Spacer(modifier = Modifier.height(20.dp))
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    when (enclaveState) {
                        is EnclaveExecutionState.Starting -> {
                            Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(CyberSurface).border(1.dp, CyberTertiary, RoundedCornerShape(8.dp)).padding(20.dp), contentAlignment = Alignment.Center) {
                                CircularProgressIndicator(color = CyberTertiary)
                            }
                        }
                        is EnclaveExecutionState.Running -> {
                            Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(CyberBlueAccent.copy(alpha = 0.1f)).border(1.dp, CyberBlueAccent, RoundedCornerShape(8.dp)).padding(14.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Lock, contentDescription = "Running tag", tint = CyberBlueAccent, modifier = Modifier.size(20.dp))
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Column {
                                        Text(text = "HARDWARE ISOLATION ENCRYPTED", fontSize = 12.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = CyberBlueAccent)
                                        Text(text = "Intel SGX runtime active. Data stream is mathematically isolated.", fontSize = 9.sp, color = CyberTextBright)
                                    }
                                }
                            }

                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                Box(modifier = Modifier.weight(1f).clip(RoundedCornerShape(8.dp)).background(CyberSurface).border(1.dp, CyberDivider, RoundedCornerShape(8.dp)).padding(10.dp)) {
                                    Column {
                                        Text(text = "THROUGHPUT", fontSize = 8.sp, color = CyberTextMuted, fontFamily = FontFamily.Monospace)
                                        Text(text = String.format("%.2f Tx/s", enclaveState.throughput), fontSize = 11.sp, fontWeight = FontWeight.Bold, color = CyberPrimary, fontFamily = FontFamily.Monospace)
                                    }
                                }
                                Box(modifier = Modifier.weight(1f).clip(RoundedCornerShape(8.dp)).background(CyberSurface).border(1.dp, CyberDivider, RoundedCornerShape(8.dp)).padding(10.dp)) {
                                    Column {
                                        Text(text = "LATENCY", fontSize = 8.sp, color = CyberTextMuted, fontFamily = FontFamily.Monospace)
                                        Text(text = String.format("%.1f ms", enclaveState.latencyMs), fontSize = 11.sp, fontWeight = FontWeight.Bold, color = CyberSecondary, fontFamily = FontFamily.Monospace)
                                    }
                                }
                                Box(modifier = Modifier.weight(1f).clip(RoundedCornerShape(8.dp)).background(CyberSurface).border(1.dp, CyberDivider, RoundedCornerShape(8.dp)).padding(10.dp)) {
                                    Column {
                                        Text(text = "CPU LOAD", fontSize = 8.sp, color = CyberTextMuted, fontFamily = FontFamily.Monospace)
                                        Text(text = String.format("%.1f %%", enclaveState.activeCpuLoad), fontSize = 11.sp, fontWeight = FontWeight.Bold, color = CyberTertiary, fontFamily = FontFamily.Monospace)
                                    }
                                }
                            }

                            Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(CyberSurface).border(1.dp, CyberPrimary.copy(alpha = 0.3f), RoundedCornerShape(8.dp)).padding(14.dp)) {
                                Column {
                                    Text(text = "COMPUTATIONAL ENCLAVE PIPELINE OUTPUT:", fontSize = 8.sp, fontWeight = FontWeight.Bold, color = CyberPrimary, fontFamily = FontFamily.Monospace)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(text = enclaveState.computationalResult, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = CyberTextBright)
                                }
                            }

                            Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(CyberSurface).border(1.dp, CyberDivider, RoundedCornerShape(8.dp)).padding(10.dp)) {
                                Column {
                                    Text(text = "SGX ATTESTATION MSR QUOTE KEY:", fontSize = 8.sp, color = CyberTextMuted, fontFamily = FontFamily.Monospace)
                                    Text(text = enclaveState.attestationSignature, fontSize = 9.sp, fontFamily = FontFamily.Monospace, color = CyberTertiary, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                }
                            }

                            Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(Color.Black).border(1.dp, CyberDivider, RoundedCornerShape(8.dp)).padding(12.dp)) {
                                enclaveState.logLines.forEach { line ->
                                    Text(text = line, fontSize = 9.sp, fontFamily = FontFamily.Monospace, color = CyberPrimary, lineHeight = 13.sp)
                                }
                            }
                        }
                        is EnclaveExecutionState.Terminated -> {
                            Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(CyberAlertRed.copy(alpha = 0.1f)).border(1.dp, CyberAlertRed, RoundedCornerShape(8.dp)).padding(14.dp)) {
                                Text(text = "ENCLAVE TERMINATED: RAM cache safely cleared of all cryptographic material.", color = CyberAlertRed, fontSize = 11.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold)
                            }
                        }
                        else -> {}
                    }
                }
            }
        } else {
            Box(modifier = Modifier.fillMaxWidth().padding(vertical = 40.dp), contentAlignment = Alignment.Center) {
                Text(text = "SELECT AN ACTIVE ENCLAVE FROM THE LIST FIRST", fontSize = 11.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = CyberTextMuted)
            }
        }
        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
fun AuditsTab(
    auditLogs: List<AuditLogEntity>,
    onClear: () -> Unit
) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f)) {
                Text(text = "CRYPTO TRANSACTION LEDGER", fontSize = 14.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = CyberPrimary)
                Text(text = "Immutable ledger records of enclave creations and verification runs.", fontSize = 11.sp, color = CyberTextMuted)
            }
            IconButton(onClick = onClear, modifier = Modifier.clip(RoundedCornerShape(6.dp)).background(CyberSurface).border(1.dp, CyberDivider, RoundedCornerShape(6.dp))) {
                Icon(Icons.Default.Delete, contentDescription = "Clear", tint = CyberAlertRed)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (auditLogs.isEmpty()) {
            Box(modifier = Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                Text(text = "LEDGER IS CURRENTLY VACANT", fontSize = 11.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = CyberTextMuted)
            }
        } else {
            LazyColumn(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(auditLogs) { log ->
                    Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = CyberSurface), border = BorderStroke(1.dp, CyberDivider), shape = RoundedCornerShape(6.dp)) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(text = log.paradoxTitle.uppercase(), fontSize = 11.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = CyberSecondary)
                                Box(modifier = Modifier.clip(RoundedCornerShape(4.dp)).background(CyberSurfaceVariant).padding(horizontal = 4.dp, vertical = 2.dp)) {
                                    Text(text = "${log.latencyMs} ms", fontSize = 9.sp, fontFamily = FontFamily.Monospace, color = CyberTertiary)
                                }
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(text = "PAYLOAD: ${log.inputData}", fontSize = 10.sp, fontFamily = FontFamily.Monospace, color = CyberTextBright)
                            Text(text = "OUT: ${log.outputData}", fontSize = 10.sp, fontFamily = FontFamily.Monospace, color = CyberPrimary)
                            Spacer(modifier = Modifier.height(6.dp))
                            Divider(color = CyberDivider)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(text = "ZK-SIG: ${log.verificationProof.take(24)}...", fontSize = 8.sp, fontFamily = FontFamily.Monospace, color = CyberTextMuted)
                            Text(text = "MSR-KEY: ${log.hardwareAttestation.take(24)}...", fontSize = 8.sp, fontFamily = FontFamily.Monospace, color = CyberTextMuted)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CodeZkTab(
    codeContent: String,
    onCodeChange: (String) -> Unit,
    rulesContent: String,
    onRulesChange: (String) -> Unit,
    sandboxState: SandboxState,
    onVerify: (String, String) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        Text(text = "SOVEREIGN CODE COMPLIANCE AUDITOR", fontSize = 14.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = CyberTertiary)
        Text(text = "Perform zero-knowledge codebase audits. Compile AST representations of proprietary logic to verify policy compliance without exposing raw strings.", fontSize = 11.sp, color = CyberTextMuted, modifier = Modifier.padding(bottom = 16.dp))

        Text(text = "PASTE TARGET CODEBASE FOR COMPILATION:", fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = CyberTextBright)
        Spacer(modifier = Modifier.height(6.dp))
        OutlinedTextField(
            value = codeContent,
            onValueChange = onCodeChange,
            modifier = Modifier.fillMaxWidth().height(120.dp).testTag("custom_code_input"),
            textStyle = TextStyle(fontFamily = FontFamily.Monospace, fontSize = 11.sp, color = CyberTextBright),
            placeholder = { Text(text = "e.g.,\nfn clear_transfer(amt: u64) {\n  if amt < 1000000 {\n    do_wire();\n  }\n}", fontSize = 10.sp, color = CyberTextMuted, fontFamily = FontFamily.Monospace) },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = CyberTertiary,
                unfocusedBorderColor = CyberDivider,
                focusedContainerColor = CyberSurface,
                unfocusedContainerColor = CyberSurface
            ),
            shape = RoundedCornerShape(6.dp)
        )

        Spacer(modifier = Modifier.height(14.dp))
        Text(text = "SPECIFY COMPLIANCE SAFETY RULE INVARIANTS:", fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = CyberTextBright)
        Spacer(modifier = Modifier.height(6.dp))
        OutlinedTextField(
            value = rulesContent,
            onValueChange = onRulesChange,
            modifier = Modifier.fillMaxWidth().testTag("custom_rules_input"),
            textStyle = TextStyle(fontFamily = FontFamily.Monospace, fontSize = 11.sp, color = CyberTextBright),
            placeholder = { Text(text = "e.g., Rule: 'No transfers above 1,000,000 can bypass validation'", fontSize = 11.sp, color = CyberTextMuted, fontFamily = FontFamily.Monospace) },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = CyberTertiary,
                unfocusedBorderColor = CyberDivider,
                focusedContainerColor = CyberSurface,
                unfocusedContainerColor = CyberSurface
            ),
            shape = RoundedCornerShape(6.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = { onVerify(codeContent, rulesContent) },
            enabled = sandboxState !is SandboxState.Proving,
            modifier = Modifier.fillMaxWidth().height(48.dp).testTag("run_custom_audit_button"),
            colors = ButtonDefaults.buttonColors(containerColor = CyberTertiary, contentColor = CyberOnPrimary),
            shape = RoundedCornerShape(6.dp)
        ) {
            if (sandboxState is SandboxState.Proving) {
                CircularProgressIndicator(modifier = Modifier.size(24.dp), color = CyberOnPrimary)
            } else {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Check, contentDescription = "Verify icon")
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "COMPILE & VERIFY COMPLIANCE INVARIANT", fontSize = 11.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                }
            }
        }

        AnimatedVisibility(visible = sandboxState !is SandboxState.Idle) {
            Spacer(modifier = Modifier.height(16.dp))
            when (sandboxState) {
                is SandboxState.Proving -> {
                    Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(CyberSurface).border(1.dp, CyberTertiary.copy(alpha = 0.5f), RoundedCornerShape(8.dp)).padding(20.dp), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = CyberTertiary)
                    }
                }
                is SandboxState.Success -> {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(CyberPrimary.copy(alpha = 0.1f)).border(1.dp, CyberPrimary, RoundedCornerShape(8.dp)).padding(14.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.CheckCircle, contentDescription = "OK Circle", tint = CyberPrimary, modifier = Modifier.size(24.dp))
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(text = "CODEBASE VERIFIED SECURE", fontSize = 12.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = CyberPrimary)
                                    Text(text = "Mathematical ZK-SNARK compiler confirms logic is 100% compliant.", fontSize = 9.sp, color = CyberTextBright)
                                }
                            }
                        }

                        Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(Color.Black).border(1.dp, CyberDivider, RoundedCornerShape(8.dp)).padding(12.dp)) {
                            Text(text = sandboxState.logOutput, fontSize = 9.sp, fontFamily = FontFamily.Monospace, color = CyberPrimary, lineHeight = 13.sp)
                        }
                    }
                }
                else -> {}
            }
        }
        Spacer(modifier = Modifier.height(24.dp))
    }
}
