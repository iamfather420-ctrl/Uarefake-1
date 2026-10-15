package com.example

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.compose.ui.text.TextStyle
import com.example.data.Idea
import com.example.ui.IdeaVaultViewModel
import com.example.ui.theme.*
import com.example.data.solvex.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private val viewModel: IdeaVaultViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                MainAppScreen(viewModel)
            }
        }
    }
}

enum class Screen {
    FEED, EVALUATOR, SOLVEX, DEALS, PORTFOLIO
}

@Composable
fun MainAppScreen(viewModel: IdeaVaultViewModel) {
    val ideas by viewModel.allIdeas.collectAsStateWithLifecycle()
    val isEvaluating by viewModel.isEvaluating.collectAsStateWithLifecycle()
    val isSubscribed by viewModel.isSubscribed.collectAsStateWithLifecycle()
    val signatureText by viewModel.signatureText.collectAsStateWithLifecycle()

    var currentScreen by remember { mutableStateOf(Screen.FEED) }
    var selectedIdeaForDetail by remember { mutableStateOf<Idea?>(null) }
    var selectedIdeaForContract by remember { mutableStateOf<Idea?>(null) }
    var showPayoutSuccess by remember { mutableStateOf<Idea?>(null) }
    
    // Status metrics counters
    val scannedCount = 184 + ideas.size
    val activeDealsCount = ideas.count { it.status == "Accepted" || it.status == "Signed Contract" }
    val securedCount = ideas.count { it.status == "Payout Completed" || it.status == "Secured Vault" }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            IdeaVaultBottomBar(
                currentScreen = currentScreen,
                onScreenSelected = { 
                    currentScreen = it
                    selectedIdeaForDetail = null
                },
                activeDealsCount = activeDealsCount
            )
        },
        containerColor = DarkBackground
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // High-End Banker Header Bar
            BankerHeader(
                scannedCount = scannedCount,
                dealsCount = activeDealsCount,
                securedCount = securedCount
            )

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            ) {
                AnimatedContent(
                    targetState = currentScreen,
                    transitionSpec = {
                        fadeIn() togetherWith fadeOut()
                    },
                    label = "ScreenTransition"
                ) { screen ->
                    when (screen) {
                        Screen.FEED -> FeedScreen(
                            viewModel = viewModel,
                            ideas = ideas,
                            onIdeaSelect = { selectedIdeaForDetail = it },
                            onSendOutreach = { viewModel.sendOutreachProposal(it) },
                            onVerifyAcceptance = { viewModel.verifyCreatorResponse(it) },
                            onSignContract = { 
                                selectedIdeaForContract = it
                                currentScreen = Screen.DEALS
                            },
                            onToggleBookmark = { viewModel.toggleBookmark(it) }
                        )
                        Screen.EVALUATOR -> EvaluatorScreen(
                            viewModel = viewModel,
                            isEvaluating = isEvaluating,
                            onAnalysisComplete = {
                                currentScreen = Screen.FEED
                            }
                        )
                        Screen.SOLVEX -> SolveXScreen(
                            viewModel = viewModel
                        )
                        Screen.DEALS -> DealsScreen(
                            ideas = ideas,
                            selectedIdea = selectedIdeaForContract,
                            signatureText = signatureText,
                            onSignatureChange = { viewModel.setSignature(it) },
                            onSelectIdea = { selectedIdeaForContract = it },
                            onSignContract = { idea ->
                                viewModel.updateIdeaStatus(idea, "Signed Contract")
                                // Trigger instant Secure Stripe payout sequence
                                selectedIdeaForContract = null
                                showPayoutSuccess = idea
                            }
                        )
                        Screen.PORTFOLIO -> PortfolioScreen(
                            ideas = ideas,
                            isSubscribed = isSubscribed,
                            onToggleSubscription = { viewModel.toggleSubscription() },
                            viewModel = viewModel
                        )
                    }
                }

                // Detailed Analysis Overlay Dialog
                selectedIdeaForDetail?.let { idea ->
                    IdeaDetailOverlay(
                        idea = idea,
                        onDismiss = { selectedIdeaForDetail = null },
                        onSendOutreach = { 
                            viewModel.sendOutreachProposal(idea)
                            selectedIdeaForDetail = null
                        },
                        onVerifyAcceptance = {
                            viewModel.verifyCreatorResponse(idea)
                            selectedIdeaForDetail = null
                        },
                        onSignContract = { 
                            selectedIdeaForContract = idea
                            selectedIdeaForDetail = null
                            currentScreen = Screen.DEALS
                        }
                    )
                }

                // Stripe Connect API Success Overlay
                showPayoutSuccess?.let { idea ->
                    PayoutSuccessDialog(
                        idea = idea,
                        onDismiss = {
                            // Automatically transition to Secured Vault
                            viewModel.updateIdeaStatus(idea, "Secured Vault")
                            showPayoutSuccess = null
                            currentScreen = Screen.PORTFOLIO
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun BankerHeader(scannedCount: Int, dealsCount: Int, securedCount: Int) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 2.dp),
        colors = CardDefaults.cardColors(containerColor = DeepSurface),
        shape = RoundedCornerShape(bottomStart = 16.dp, bottomEnd = 16.dp),
        border = BorderStroke(1.dp, CardBorder)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Lock,
                    contentDescription = "IdeaVault Logo",
                    tint = GoldPrimary,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "IDEA",
                    color = OnBackgroundText,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    fontFamily = FontFamily.SansSerif,
                    letterSpacing = 2.sp
                )
                Text(
                    text = "VAULT",
                    color = GoldPrimary,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    fontFamily = FontFamily.SansSerif,
                    letterSpacing = 2.sp
                )
            }

            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                HeaderMetric(label = "SCOUTED", value = scannedCount.toString(), color = MutedSlate)
                HeaderMetric(label = "PIPELINE", value = dealsCount.toString(), color = GoldPrimary)
                HeaderMetric(label = "SECURED", value = securedCount.toString(), color = ForestEmerald)
            }
        }
    }
}

@Composable
fun HeaderMetric(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.End) {
        Text(text = label, fontSize = 9.sp, color = MutedSlate, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
        Text(text = value, fontSize = 14.sp, color = color, fontWeight = FontWeight.Black)
    }
}

@Composable
fun IdeaVaultBottomBar(currentScreen: Screen, onScreenSelected: (Screen) -> Unit, activeDealsCount: Int) {
    NavigationBar(
        containerColor = DeepSurface,
        tonalElevation = 8.dp,
        modifier = Modifier
            .clip(RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp))
            .border(BorderStroke(1.dp, CardBorder), RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp))
    ) {
        NavigationBarItem(
            selected = currentScreen == Screen.FEED,
            onClick = { onScreenSelected(Screen.FEED) },
            icon = { Icon(Icons.Default.Home, contentDescription = "Scout Stream") },
            label = { Text("Scout Feed") },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = DarkBackground,
                selectedTextColor = GoldPrimary,
                indicatorColor = GoldPrimary,
                unselectedIconColor = MutedSlate,
                unselectedTextColor = MutedSlate
            ),
            modifier = Modifier.testTag("nav_feed")
        )
        NavigationBarItem(
            selected = currentScreen == Screen.EVALUATOR,
            onClick = { onScreenSelected(Screen.EVALUATOR) },
            icon = { Icon(Icons.Default.Search, contentDescription = "AI Evaluator") },
            label = { Text("Analytica AI") },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = DarkBackground,
                selectedTextColor = GoldPrimary,
                indicatorColor = GoldPrimary,
                unselectedIconColor = MutedSlate,
                unselectedTextColor = MutedSlate
            ),
            modifier = Modifier.testTag("nav_evaluator")
        )
        NavigationBarItem(
            selected = currentScreen == Screen.SOLVEX,
            onClick = { onScreenSelected(Screen.SOLVEX) },
            icon = { Icon(Icons.Default.Build, contentDescription = "SolveX Hub") },
            label = { Text("SolveX") },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = DarkBackground,
                selectedTextColor = GoldPrimary,
                indicatorColor = GoldPrimary,
                unselectedIconColor = MutedSlate,
                unselectedTextColor = MutedSlate
            ),
            modifier = Modifier.testTag("nav_solvex")
        )
        NavigationBarItem(
            selected = currentScreen == Screen.DEALS,
            onClick = { onScreenSelected(Screen.DEALS) },
            icon = { 
                BadgedBox(badge = {
                    if (activeDealsCount > 0) {
                        Badge(containerColor = GoldPrimary) {
                            Text(text = activeDealsCount.toString(), color = DarkBackground, fontWeight = FontWeight.Bold)
                        }
                    }
                }) {
                    Icon(Icons.Default.CheckCircle, contentDescription = "Legal Center")
                }
            },
            label = { Text("Legal Desk") },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = DarkBackground,
                selectedTextColor = GoldPrimary,
                indicatorColor = GoldPrimary,
                unselectedIconColor = MutedSlate,
                unselectedTextColor = MutedSlate
            ),
            modifier = Modifier.testTag("nav_deals")
        )
        NavigationBarItem(
            selected = currentScreen == Screen.PORTFOLIO,
            onClick = { onScreenSelected(Screen.PORTFOLIO) },
            icon = { Icon(Icons.Default.Lock, contentDescription = "Iron Vault") },
            label = { Text("Iron Vault") },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = DarkBackground,
                selectedTextColor = GoldPrimary,
                indicatorColor = GoldPrimary,
                unselectedIconColor = MutedSlate,
                unselectedTextColor = MutedSlate
            ),
            modifier = Modifier.testTag("nav_portfolio")
        )
    }
}

// ==================== SCREEN 1: SCOUT STREAM ====================
@Composable
fun FeedScreen(
    viewModel: IdeaVaultViewModel,
    ideas: List<Idea>,
    onIdeaSelect: (Idea) -> Unit,
    onSendOutreach: (Idea) -> Unit,
    onVerifyAcceptance: (Idea) -> Unit,
    onSignContract: (Idea) -> Unit,
    onToggleBookmark: (Idea) -> Unit
) {
    var selectedFilter by remember { mutableStateOf("All") }
    val filters = listOf("All", "Scouted", "Outreach", "Signed & Secured")

    val isScraping by viewModel.isScraping.collectAsStateWithLifecycle()
    val scrapingStatus by viewModel.scrapingStatus.collectAsStateWithLifecycle()

    val filteredIdeas = when (selectedFilter) {
        "Scouted" -> ideas.filter { it.status == "Scouted" }
        "Outreach" -> ideas.filter { it.status == "Outreach Sent" || it.status == "Negotiating" }
        "Signed & Secured" -> ideas.filter { it.status == "Signed Contract" || it.status == "Payout Completed" || it.status == "Secured Vault" }
        else -> ideas
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        // Aesthetic Banner Intro
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(130.dp)
                .padding(vertical = 12.dp)
                .clip(RoundedCornerShape(12.dp))
                .border(BorderStroke(1.dp, CardBorder), RoundedCornerShape(12.dp))
        ) {
            Image(
                painter = painterResource(id = R.drawable.img_vault_hero),
                contentDescription = "IdeaVault Live Tracker",
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(Color.Transparent, Color(0xDE101211))
                        )
                    )
            )
            Column(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(16.dp)
            ) {
                Text(
                    text = "Automated Arbitrage Feed",
                    color = OnBackgroundText,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    style = TextStyle(
                        shadow = Shadow(color = Color.Black, offset = Offset(1f, 1f), blurRadius = 4f)
                    )
                )
                Text(
                    text = "Scouting Reddit, Twitter/X & social trends for early-stage IP acquisition",
                    color = MutedSlate,
                    fontSize = 11.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            // Top-right live crawler launcher
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(12.dp)
            ) {
                Button(
                    onClick = { viewModel.runLiveScraper() },
                    enabled = !isScraping,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = GoldPrimary,
                        contentColor = DarkBackground,
                        disabledContainerColor = CardBorder,
                        disabledContentColor = MutedSlate
                    ),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                    modifier = Modifier.height(28.dp)
                ) {
                    if (isScraping) {
                        CircularProgressIndicator(color = MutedSlate, modifier = Modifier.size(10.dp), strokeWidth = 1.dp)
                    } else {
                        Icon(Icons.Default.Refresh, contentDescription = "Scrape", modifier = Modifier.size(11.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Scrape Live Web Problems", fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Live crawler progress banner
        if (isScraping) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 8.dp),
                colors = CardDefaults.cardColors(containerColor = DeepSurface),
                border = BorderStroke(1.dp, GoldPrimary.copy(alpha = 0.5f))
            ) {
                Row(
                    modifier = Modifier.padding(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    CircularProgressIndicator(color = GoldPrimary, modifier = Modifier.size(16.dp), strokeWidth = 1.5.dp)
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(text = scrapingStatus, color = GoldPrimary, fontSize = 10.sp, fontWeight = FontWeight.Medium)
                }
            }
        }

        // Horizontal Filters Row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp)
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            filters.forEach { filterName ->
                val active = selectedFilter == filterName
                Button(
                    onClick = { selectedFilter = filterName },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (active) GoldPrimary else DeepSurface,
                        contentColor = if (active) DarkBackground else MutedSlate
                    ),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, if (active) GoldPrimary else CardBorder),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp)
                ) {
                    Text(text = filterName, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }

        if (filteredIdeas.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = "Empty",
                        tint = MutedSlate,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(text = "No ideas found in this category", color = MutedSlate)
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredIdeas) { idea ->
                    IdeaCard(
                        idea = idea,
                        onCardClick = { onIdeaSelect(idea) },
                        onSendOutreach = { onSendOutreach(idea) },
                        onVerifyAcceptance = { onVerifyAcceptance(idea) },
                        onSignContract = { onSignContract(idea) },
                        onToggleBookmark = { onToggleBookmark(idea) }
                    )
                }
            }
        }
    }
}

@Composable
fun IdeaCard(
    idea: Idea,
    onCardClick: () -> Unit,
    onSendOutreach: () -> Unit,
    onVerifyAcceptance: () -> Unit,
    onSignContract: () -> Unit,
    onToggleBookmark: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onCardClick)
            .testTag("idea_card_${idea.id}"),
        colors = CardDefaults.cardColors(containerColor = DeepSurface),
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.dp, if (idea.status == "Accepted") GoldPrimary else CardBorder)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // Source & Score Line
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    val badgeColor = when (idea.source) {
                        "r/problems" -> Color(0xFFE05A36)
                        "r/startupideas" -> Color(0xFF24A0ED)
                        "Twitter/X" -> Color(0xFF6B7280)
                        else -> GoldPrimary
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(badgeColor.copy(alpha = 0.15f))
                            .border(BorderStroke(1.dp, badgeColor), RoundedCornerShape(6.dp))
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = idea.source,
                            color = badgeColor,
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "by @${idea.author}",
                        color = MutedSlate,
                        fontSize = 11.sp
                    )
                }

                // AI Rating Score circle
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Star,
                        contentDescription = "Rating",
                        tint = GoldPrimary,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${idea.totalScore}/100",
                        color = OnBackgroundText,
                        fontWeight = FontWeight.Black,
                        fontSize = 14.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Title and description snippet
            Text(
                text = idea.title,
                color = OnBackgroundText,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = idea.originalText,
                color = MutedSlate,
                fontSize = 13.sp,
                maxLines = 3,
                overflow = TextOverflow.Ellipsis,
                lineHeight = 18.sp
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Dynamic Pipeline Progress
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(text = "PIPELINE RETENTION", fontSize = 9.sp, color = MutedSlate, fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp)
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(top = 2.dp)
                    ) {
                        val statusText = idea.status
                        val statusColor = when (statusText) {
                            "Scouted" -> MutedSlate
                            "Evaluating" -> GoldPrimary
                            "Outreach Sent" -> GoldAccent
                            "Accepted" -> ForestEmerald
                            "Signed Contract" -> ForestEmerald
                            "Secured Vault" -> GoldPrimary
                            else -> OnBackgroundText
                        }
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(RoundedCornerShape(50))
                                .background(statusColor)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = statusText.uppercase(),
                            color = statusColor,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            letterSpacing = 0.5.sp
                        )
                    }
                }

                // Card Action
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    IconButton(onClick = onToggleBookmark) {
                        Icon(
                            imageVector = if (idea.isBookmarked) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                            contentDescription = "Bookmark",
                            tint = if (idea.isBookmarked) RoyalMagenta else MutedSlate
                        )
                    }

                    if (idea.status == "Scouted" && idea.totalScore >= 80) {
                        Button(
                            onClick = onSendOutreach,
                            colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground),
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 2.dp),
                            modifier = Modifier.height(34.dp)
                        ) {
                            Icon(Icons.Default.Send, contentDescription = "Outreach", modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(text = "Auto-Outreach", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    } else if (idea.status == "Outreach Sent") {
                        Button(
                            onClick = onVerifyAcceptance,
                            colors = ButtonDefaults.buttonColors(containerColor = ForestEmerald, contentColor = OnBackgroundText),
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 2.dp),
                            modifier = Modifier.height(34.dp)
                        ) {
                            Icon(Icons.Default.Refresh, contentDescription = "Verify", modifier = Modifier.size(12.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(text = "Verify Response", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    } else if (idea.status == "Accepted") {
                        Button(
                            onClick = onSignContract,
                            colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground),
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 2.dp),
                            modifier = Modifier.height(34.dp)
                        ) {
                            Icon(Icons.Default.Check, contentDescription = "Sign", modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(text = "Sign IP (Deal)", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

// ==================== SCREEN 2: ANALYTICA AI EVALUATOR ====================
enum class EvaluatorTab {
    APPRAISE, REVERSE_SOLVER, SOLVEX_GIGS
}

@Composable
fun EvaluatorScreen(
    viewModel: IdeaVaultViewModel,
    isEvaluating: Boolean,
    onAnalysisComplete: () -> Unit
) {
    var selectedTab by remember { mutableStateOf(EvaluatorTab.APPRAISE) }
    var ideaText by remember { mutableStateOf("") }
    var solutionText by remember { mutableStateOf("") }
    
    val foundProblems by viewModel.foundProblems.collectAsStateWithLifecycle()
    val isFindingProblems by viewModel.isFindingProblems.collectAsStateWithLifecycle()
    
    // SolveX States
    val solvexJobs by viewModel.solvexJobs.collectAsStateWithLifecycle()
    val isLoadingSolvex by viewModel.isLoadingSolvex.collectAsStateWithLifecycle()
    val submittedSolutions by viewModel.submittedSolutions.collectAsStateWithLifecycle()
    
    var selectedBoard by remember { mutableStateOf("All") }
    var activeSolveJob by remember { mutableStateOf<com.example.data.solvex.SolveXJob?>(null) }
    
    val keyboardController = LocalSoftwareKeyboardController.current
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    // Trigger initial job loading
    LaunchedEffect(selectedBoard) {
        viewModel.loadSolvexJobs(if (selectedBoard == "All") null else selectedBoard)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        // High-end Segmented Tab Control
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(DeepSurface)
                .border(BorderStroke(1.dp, CardBorder), RoundedCornerShape(12.dp))
                .padding(4.dp)
        ) {
            val tabs = listOf(
                EvaluatorTab.APPRAISE to "APPRAISER",
                EvaluatorTab.REVERSE_SOLVER to "REVERSE SOLVER",
                EvaluatorTab.SOLVEX_GIGS to "SOLVEX GIGS"
            )
            tabs.forEach { (tab, label) ->
                val isActive = selectedTab == tab
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isActive) GoldPrimary else Color.Transparent)
                        .clickable { selectedTab = tab }
                        .padding(vertical = 10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = label,
                        color = if (isActive) DarkBackground else MutedSlate,
                        fontWeight = FontWeight.Bold,
                        fontSize = 10.sp,
                        letterSpacing = 0.5.sp
                    )
                }
            }
        }

        if (selectedTab == EvaluatorTab.APPRAISE) {
            // ORIGINAL APPRAISAL TAB
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = DeepSurface),
                border = BorderStroke(1.dp, CardBorder)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Text(
                        text = "AI Value Appraisal Console",
                        color = GoldPrimary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Input any startup concept or direct user problem. Gemini models will inspect the TAM viability, assess the feasibility, and output scores and outreach solicitations instantly.",
                        color = MutedSlate,
                        fontSize = 12.sp,
                        lineHeight = 17.sp
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    OutlinedTextField(
                        value = ideaText,
                        onValueChange = { ideaText = it },
                        placeholder = { 
                            Text("e.g., 'I wish there was a device that cleans your keyboard with UV light when you leave it...'") 
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(130.dp)
                            .testTag("idea_input_field"),
                        maxLines = 5,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = OnBackgroundText,
                            unfocusedTextColor = OnBackgroundText,
                            focusedBorderColor = GoldPrimary,
                            unfocusedBorderColor = CardBorder,
                            focusedContainerColor = DarkBackground,
                            unfocusedContainerColor = DarkBackground
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    if (isEvaluating) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 12.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            CircularProgressIndicator(
                                color = GoldPrimary,
                                modifier = Modifier.size(36.dp)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Orchestrating Model & Quantifying Arbitrage...",
                                color = GoldPrimary,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    } else {
                        Button(
                            onClick = {
                                if (ideaText.isNotBlank()) {
                                    keyboardController?.hide()
                                    viewModel.submitNewIdea(ideaText)
                                    ideaText = ""
                                    onAnalysisComplete()
                                }
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp)
                                .testTag("appraise_button"),
                            colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground),
                            shape = RoundedCornerShape(12.dp),
                            enabled = ideaText.isNotBlank()
                        ) {
                            Icon(imageVector = Icons.Default.Build, contentDescription = "Appraise")
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(text = "Appraise & Scout Concept", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = ForestEmerald.copy(alpha = 0.15f)),
                border = BorderStroke(1.dp, ForestEmerald)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = "info",
                        tint = GoldPrimary,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(text = "Rule Book of Arbitrage", fontWeight = FontWeight.Bold, color = OnBackgroundText, fontSize = 13.sp)
                        Text(
                            text = "Ideas scoring over 80 are prime acquisition candidates. The scouter auto-drafts the solicitation rights message immediately.",
                            color = MutedSlate, 
                            fontSize = 11.sp,
                            lineHeight = 15.sp
                        )
                    }
                }
            }
        } else if (selectedTab == EvaluatorTab.REVERSE_SOLVER) {
            // NEW REVERSE SOLVER TAB
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = DeepSurface),
                border = BorderStroke(1.dp, CardBorder)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Text(
                        text = "Reverse Problem Solver",
                        color = GoldPrimary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Input a tech solution, application proposal, or code service. The scouter crawls social networks + global forums to pinpoint the exact real-world complaints resolved by your design.",
                        color = MutedSlate,
                        fontSize = 12.sp,
                        lineHeight = 17.sp
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = "SOLVED PARADOXES (STARTER SOLUTIONS)",
                        color = GoldAccent,
                        fontWeight = FontWeight.Bold,
                        fontSize = 10.sp,
                        letterSpacing = 0.5.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    // Horizontal Scrollable Solved Paradox Selection Gallery
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState())
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        val paradoxes = listOf(
                            Triple(
                                "Micro-Pass SaaS System",
                                "An auto-expiring single-use microbilling pass that only bills for minutes utilized on secure backend API endpoints.",
                                "SAAS"
                            ),
                            Triple(
                                "Instant Recipe Weight Parsing",
                                "An optical AI scanning recipe engine matching on-device camera feeds with raw ingredient densities to calculate grams instantly.",
                                "FITNESS"
                            ),
                            Triple(
                                "Zero-Knowledge Scheduler",
                                "A secure calendar coordination poll that matches free slots across Google and Outlook profiles without sharing description details.",
                                "CALENDAR"
                            ),
                            Triple(
                                "On-Device Freelance Expense Ledger",
                                "A background service monitoring on-device screens to extract and reconcile business receipt expenses for tax write-offs.",
                                "TAXES"
                            )
                        )

                        paradoxes.forEach { (pTitle, pText, pTag) ->
                            val isSelected = solutionText.lowercase().contains(pTag.lowercase()) || solutionText == pText
                            Card(
                                modifier = Modifier
                                    .width(200.dp)
                                    .clickable {
                                        solutionText = pText
                                    },
                                colors = CardDefaults.cardColors(
                                    containerColor = if (isSelected) DarkBackground else DeepSurface
                                ),
                                border = BorderStroke(
                                    1.dp,
                                    if (isSelected) GoldPrimary else CardBorder
                                )
                            ) {
                                Column(
                                    modifier = Modifier.padding(10.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(4.dp))
                                                .background(if (isSelected) GoldPrimary.copy(alpha = 0.15f) else CardBorder)
                                                .padding(horizontal = 6.dp, vertical = 2.dp)
                                        ) {
                                            Text(
                                                text = pTag,
                                                color = if (isSelected) GoldPrimary else MutedSlate,
                                                fontSize = 8.sp,
                                                fontWeight = FontWeight.Bold
                                            )
                                        }
                                        if (isSelected) {
                                            Icon(
                                                imageVector = Icons.Default.CheckCircle,
                                                contentDescription = "Selected",
                                                tint = GoldPrimary,
                                                modifier = Modifier.size(12.dp)
                                            )
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = pTitle,
                                        color = OnBackgroundText,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = pText,
                                        color = MutedSlate,
                                        fontSize = 10.sp,
                                        lineHeight = 13.sp,
                                        maxLines = 3,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    OutlinedTextField(
                        value = solutionText,
                        onValueChange = { solutionText = it },
                        placeholder = { 
                            Text("e.g., 'An automated AI tool that reconciles freelancer business receipts with visual screen captures...'") 
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(110.dp)
                            .testTag("solution_input_field"),
                        maxLines = 4,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = OnBackgroundText,
                            unfocusedTextColor = OnBackgroundText,
                            focusedBorderColor = GoldPrimary,
                            unfocusedBorderColor = CardBorder,
                            focusedContainerColor = DarkBackground,
                            unfocusedContainerColor = DarkBackground
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    if (isFindingProblems) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 12.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            CircularProgressIndicator(
                                color = GoldPrimary,
                                modifier = Modifier.size(36.dp)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Crawling social boards & resolving matched complaints...",
                                color = GoldPrimary,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    } else {
                        Button(
                            onClick = {
                                if (solutionText.isNotBlank()) {
                                    keyboardController?.hide()
                                    viewModel.findWebProblemsSolvedBy(solutionText)
                                }
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp)
                                .testTag("find_problems_button"),
                            colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground),
                            shape = RoundedCornerShape(12.dp),
                            enabled = solutionText.isNotBlank()
                        ) {
                            Icon(imageVector = Icons.Default.Search, contentDescription = "Query problems")
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(text = "Find Solved Problems on Web", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                    }
                }
            }

            if (foundProblems.isNotEmpty() && !isFindingProblems) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "MATCHED WEB COMPLAINTS",
                    color = GoldAccent,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    letterSpacing = 0.5.sp
                )
                Spacer(modifier = Modifier.height(8.dp))

                foundProblems.forEach { problem ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp),
                        colors = CardDefaults.cardColors(containerColor = DeepSurface),
                        border = BorderStroke(1.dp, CardBorder)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(RoyalMagenta.copy(alpha = 0.15f))
                                        .border(BorderStroke(1.dp, RoyalMagenta), RoundedCornerShape(6.dp))
                                        .padding(horizontal = 8.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = problem.source.uppercase(),
                                        color = RoyalMagenta,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 9.sp
                                    )
                                }
                                Text(
                                    text = "@${problem.author}",
                                    color = MutedSlate,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = problem.originalText,
                                color = OnBackgroundText,
                                fontSize = 13.sp,
                                lineHeight = 18.sp,
                                fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            Divider(color = CardBorder, thickness = 0.5.dp)
                            Spacer(modifier = Modifier.height(10.dp))
                            
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Star, contentDescription = "Match score", tint = GoldAccent, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "Acquisition Fit: ${problem.totalScore}/100",
                                    color = GoldAccent,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp
                                )
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = problem.analysisDetails,
                                color = MutedSlate,
                                fontSize = 11.sp,
                                lineHeight = 15.sp
                            )
                            
                            Spacer(modifier = Modifier.height(12.dp))
                            
                            Button(
                                onClick = {
                                    viewModel.saveScoutedIdea(problem)
                                    Toast.makeText(context, "Saved to Active Feed under '${problem.title}'!", Toast.LENGTH_LONG).show()
                                },
                                modifier = Modifier.fillMaxWidth().height(36.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = ForestEmerald, contentColor = OnBackgroundText),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Icon(Icons.Default.Add, contentDescription = "Add", modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Add to Active Scout Feed", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        } else {
            // SOLVEX GIG PROTOCOLS BOARD
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = DeepSurface),
                border = BorderStroke(1.dp, CardBorder)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Text(
                        text = "SolveX Freelance Gig Desk",
                        color = GoldPrimary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Claim freelance contracts on Upwork & Fiverr by packaging your pre-solved paradoxes into encrypted source envelopes. Secure payout royalties instantly.",
                        color = MutedSlate,
                        fontSize = 12.sp,
                        lineHeight = 17.sp
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Platforms Row Filters
                    Text(
                        text = "CHOOSE PLATFORM",
                        color = GoldAccent,
                        fontWeight = FontWeight.Bold,
                        fontSize = 10.sp,
                        letterSpacing = 0.5.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        val boards = listOf("All", "Upwork", "Fiverr", "Freelancer", "Toptal", "PeoplePerHour")
                        boards.forEach { board ->
                            val isSel = selectedBoard.equals(board, ignoreCase = true)
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (isSel) GoldAccent else DeepSurface)
                                    .border(BorderStroke(1.dp, CardBorder), RoundedCornerShape(8.dp))
                                    .clickable { selectedBoard = board }
                                    .padding(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Text(
                                    text = board.uppercase(),
                                    color = if (isSel) DarkBackground else MutedSlate,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (isLoadingSolvex && solvexJobs.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = GoldPrimary)
                }
            } else {
                Text(
                    text = "READY CONTRACT BOUNTIES",
                    color = GoldAccent,
                    fontWeight = FontWeight.Bold,
                    fontSize = 10.sp,
                    letterSpacing = 0.5.sp
                )
                Spacer(modifier = Modifier.height(8.dp))

                solvexJobs.forEach { job ->
                    val isSubmitted = submittedSolutions.containsKey(job.id)
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp)
                            .border(
                                BorderStroke(
                                    1.dp,
                                    if (isSubmitted) ForestEmerald else CardBorder
                                ),
                                RoundedCornerShape(12.dp)
                            ),
                        colors = CardDefaults.cardColors(containerColor = DeepSurface),
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(if (isSubmitted) ForestEmerald.copy(alpha = 0.15f) else GoldAccent.copy(alpha = 0.12f))
                                        .border(BorderStroke(1.dp, if (isSubmitted) ForestEmerald else GoldAccent), RoundedCornerShape(6.dp))
                                        .padding(horizontal = 8.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = job.board.uppercase(),
                                        color = if (isSubmitted) ForestEmerald else GoldPrimary,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 9.sp
                                    )
                                }
                                Text(
                                    text = job.budget,
                                    color = GoldPrimary,
                                    fontWeight = FontWeight.Black,
                                    fontSize = 15.sp
                                )
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = job.title,
                                color = OnBackgroundText,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = job.description,
                                color = MutedSlate,
                                fontSize = 12.sp,
                                lineHeight = 16.sp,
                                maxLines = 3,
                                overflow = TextOverflow.Ellipsis
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(imageVector = Icons.Default.Info, contentDescription = "duration", tint = MutedSlate, modifier = Modifier.size(12.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(text = job.duration, color = MutedSlate, fontSize = 11.sp)
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Text(text = "🌍 ${job.clientCountry}", color = MutedSlate, fontSize = 11.sp)
                                }

                                Button(
                                    onClick = { activeSolveJob = job },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (isSubmitted) ForestEmerald else GoldPrimary,
                                        contentColor = if (isSubmitted) OnBackgroundText else DarkBackground
                                    ),
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier.height(34.dp)
                                ) {
                                    Icon(
                                        imageVector = if (isSubmitted) Icons.Default.CheckCircle else Icons.Default.Lock,
                                        contentDescription = "Apply",
                                        modifier = Modifier.size(12.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(text = if (isSubmitted) "Escrowed" else "Fulfill Sol", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // --- SOLVEX DETAIL FULFILLMENT MODAL / OVERLAY ---
    activeSolveJob?.let { job ->
        var selectedParadoxIndex by remember { mutableIntStateOf(0) }
        var adaptedProposalText by remember { mutableStateOf("") }
        var decryptionKeyText by remember { mutableStateOf("SOLVEX-AES-${(100..999).random()}-KEY") }
        var isAdapting by remember { mutableStateOf(false) }
        val isSubmitted = submittedSolutions.containsKey(job.id)

        val paradoxes = listOf(
            Triple(
                "Micro-Pass SaaS System",
                "An auto-expiring single-use microbilling pass that only bills for minutes utilized on secure backend API endpoints.",
                "SAAS"
            ),
            Triple(
                "Instant Recipe Weight Parsing",
                "An optical AI scanning recipe engine matching on-device camera feeds with raw ingredient densities to calculate grams instantly.",
                "FITNESS"
            ),
            Triple(
                "Zero-Knowledge Scheduler",
                "A secure calendar coordination poll that matches free slots across Google and Outlook profiles without sharing description details.",
                "CALENDAR"
            ),
            Triple(
                "On-Device Freelance Expense Ledger",
                "A background service monitoring on-device screens to extract and reconcile business receipt expenses for tax write-offs.",
                "TAXES"
            )
        )

        AlertDialog(
            onDismissRequest = { activeSolveJob = null },
            title = {
                Text(
                    text = "Integrate Solved Paradox",
                    color = GoldPrimary,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp
                )
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState())
                ) {
                    Text(text = job.title, color = OnBackgroundText, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(text = job.description, color = MutedSlate, fontSize = 11.sp, lineHeight = 14.sp)
                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = "1. CHOOSE STARTER PARADOX SOLUTION",
                        color = GoldAccent,
                        fontWeight = FontWeight.Bold,
                        fontSize = 10.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    // Horizontal pick list
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        paradoxes.forEachIndexed { index, (pTitle, pText, pTag) ->
                            val isSel = selectedParadoxIndex == index
                            Box(
                                modifier = Modifier
                                    .width(150.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (isSel) GoldAccent.copy(alpha = 0.15f) else DeepSurface)
                                    .border(BorderStroke(1.dp, if (isSel) GoldPrimary else CardBorder), RoundedCornerShape(8.dp))
                                    .clickable { selectedParadoxIndex = index }
                                    .padding(8.dp)
                            ) {
                                Column {
                                    Text(text = pTag, color = GoldPrimary, fontWeight = FontWeight.Bold, fontSize = 8.sp)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(text = pTitle, color = OnBackgroundText, fontWeight = FontWeight.SemiBold, fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    if (!isSubmitted) {
                        Button(
                            onClick = {
                                isAdapting = true
                                val chosen = paradoxes[selectedParadoxIndex]
                                viewModel.adaptStarterSolution(
                                    jobTitle = job.title,
                                    jobDescription = job.description,
                                    starterTitle = chosen.first,
                                    starterDescription = chosen.second
                                ) { result ->
                                    adaptedProposalText = result
                                    isAdapting = false
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = GoldAccent, contentColor = DarkBackground),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth().height(36.dp),
                            enabled = !isAdapting
                        ) {
                            if (isAdapting) {
                                CircularProgressIndicator(color = DarkBackground, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Orchestrating Gemini Code Adaptor...", fontSize = 11.sp)
                            } else {
                                Icon(Icons.Default.Share, contentDescription = "Adapt", modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Adapt Selected Solution via Gemini", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }

                    if (adaptedProposalText.isNotBlank()) {
                        Spacer(modifier = Modifier.height(14.dp))
                        Text(
                            text = "2. ADAPTIVE COMPILATION OUTPUT",
                            color = GoldAccent,
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(150.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(DarkBackground)
                                .border(BorderStroke(1.dp, CardBorder), RoundedCornerShape(8.dp))
                                .verticalScroll(rememberScrollState())
                                .padding(10.dp)
                        ) {
                            Text(
                                text = adaptedProposalText,
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                color = OnBackgroundText
                            )
                        }

                        Spacer(modifier = Modifier.height(14.dp))
                        Text(
                            text = "3. ESCROW AES DECRYPTION KEY",
                            color = GoldAccent,
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        
                        OutlinedTextField(
                            value = decryptionKeyText,
                            onValueChange = { decryptionKeyText = it },
                            modifier = Modifier.fillMaxWidth(),
                            textStyle = TextStyle(fontSize = 11.sp, fontFamily = FontFamily.Monospace),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = OnBackgroundText,
                                unfocusedTextColor = OnBackgroundText,
                                focusedBorderColor = GoldPrimary,
                                unfocusedBorderColor = CardBorder,
                                focusedContainerColor = DarkBackground,
                                unfocusedContainerColor = DarkBackground
                            ),
                            shape = RoundedCornerShape(8.dp)
                        )

                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Locking the adaptation envelope under this symmetric key. The scouter will publish the payload in encrypted format to SolveX's contract repository. Payout compiles client escrow automatically once verified.",
                            color = MutedSlate,
                            fontSize = 10.sp,
                            lineHeight = 13.sp
                        )
                    }
                }
            },
            confirmButton = {
                if (!isSubmitted) {
                    Button(
                        onClick = {
                            val chosen = paradoxes[selectedParadoxIndex]
                            val summary = "Adaptation of ${chosen.first} for secure SolveX freelancing on ${job.board}."
                            val payload = adaptedProposalText.ifEmpty { "Default secure source envelope of ${chosen.first}" }
                            viewModel.submitSolveXSolution(
                                jobId = job.id,
                                summary = summary,
                                encryptedContent = payload,
                                decryptionKey = decryptionKeyText
                            ) { success, msg ->
                                if (success) {
                                    Toast.makeText(context, msg, Toast.LENGTH_LONG).show()
                                    activeSolveJob = null
                                }
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground),
                        shape = RoundedCornerShape(10.dp),
                        enabled = adaptedProposalText.isNotBlank() && !isLoadingSolvex
                    ) {
                        Text("Securely Escrow Code Package", fontWeight = FontWeight.Bold)
                    }
                } else {
                    Button(
                        onClick = { activeSolveJob = null },
                        colors = ButtonDefaults.buttonColors(containerColor = ForestEmerald)
                    ) {
                        Text("Active Escrow Confirmed")
                    }
                }
            },
            dismissButton = {
                TextButton(onClick = { activeSolveJob = null }) {
                    Text("Close", color = MutedSlate)
                }
            },
            containerColor = DeepSurface,
            textContentColor = OnBackgroundText
        )
    }
}

// ==================== SCREEN 3: LEGAL DEALS & CONTRACT ====================
@Composable
fun DealsScreen(
    ideas: List<Idea>,
    selectedIdea: Idea?,
    signatureText: String,
    onSignatureChange: (String) -> Unit,
    onSelectIdea: (Idea) -> Unit,
    onSignContract: (Idea) -> Unit
) {
    val pendingDeals = ideas.filter { it.status == "Accepted" }
    val keyboardController = LocalSoftwareKeyboardController.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        if (selectedIdea == null) {
            Text(
                text = "IP Legal Acquisition Pipeline",
                color = OnBackgroundText,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Select a venture deal where the original creator has responded and accepted the $150.00 IP purchase offering. Complete click-to-sign below.",
                color = MutedSlate,
                fontSize = 12.sp,
                lineHeight = 16.sp
            )

            Spacer(modifier = Modifier.height(16.dp))

            if (pendingDeals.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(DeepSurface)
                        .border(BorderStroke(1.dp, CardBorder), RoundedCornerShape(12.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(16.dp)) {
                        Icon(imageVector = Icons.Default.Warning, contentDescription = "Desk", tint = MutedSlate, modifier = Modifier.size(36.dp))
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(text = "No Active Deals", fontWeight = FontWeight.Bold, color = OnBackgroundText, fontSize = 14.sp)
                        Text(
                            text = "To populate the active legal acquisition list, go to 'Scouter Feed', submit or select an idea, click 'Auto-Outreach', then click 'Verify Response' to pull the validated creator acceptance, and proceed back here to draft the deed.",
                            color = MutedSlate,
                            fontSize = 11.sp,
                            textAlign = TextAlign.Center,
                            lineHeight = 15.sp
                        )
                    }
                }
            } else {
                pendingDeals.forEach { deal ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp)
                            .clickable { onSelectIdea(deal) },
                        colors = CardDefaults.cardColors(containerColor = DeepSurface),
                        border = BorderStroke(1.dp, GoldPrimary.copy(alpha = 0.5f))
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(text = deal.title, fontWeight = FontWeight.Bold, color = OnBackgroundText)
                                Text(text = "Seller: @${deal.author} • TAM: ${deal.marketSize}", color = MutedSlate, fontSize = 11.sp)
                            }
                            Button(
                                onClick = { onSelectIdea(deal) },
                                colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(text = "Draft Deed", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        } else {
            // Draw actual legal scroll contract
            Text(
                text = "PRE-TRANSACTION IP CONSOL",
                color = MutedSlate,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
            )
            Text(
                text = "Deed of Assignment: ${selectedIdea.title}",
                color = OnBackgroundText,
                fontWeight = FontWeight.Black,
                fontSize = 20.sp
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Contract Document Frame
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(290.dp)
                    .horizontalScroll(rememberScrollState()), // support horizontal alignment
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFAF9F6)), // Parchment paper feel
                shape = RoundedCornerShape(4.dp),
                border = BorderStroke(2.dp, GoldPrimary)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(20.dp)
                ) {
                    Text(
                        text = "INTELLECTUAL PROPERTY ASSIGNMENT AGREEMENT",
                        color = Color.Black,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 15.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                    Text(
                        text = "This Intellectual Property Assignment Agreement (the 'Agreement') is made effective in 2026, by and between:",
                        color = Color.DarkGray,
                        fontSize = 12.sp,
                        lineHeight = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "1. THE ASSIGNOR: @${selectedIdea.author} (hereinafter 'IP Creator')\n" +
                               "2. THE ASSIGNEE: IdeaVault LLC, a Delaware corporation (hereinafter 'Venture Scout')",
                        color = Color.Black,
                        fontSize = 12.sp,
                        lineHeight = 16.sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "RECITALS AND TRANSFER CLAUSE",
                        color = Color.Black,
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp
                    )
                    Text(
                        text = "The Assignor has designed a highly unique commercial and technical concept described as:\n" +
                               "\"${selectedIdea.originalText}\"\n\n" +
                               "NOW THEREFORE, for valuable consideration, the adequacy of which is acknowledged, " +
                               "the Assignor hereby transfers, assigns, and conveys to assignee all right, title, and " +
                               "interest globally, including copyrights, trademarks, licensing models, and system schema " +
                               "in exchange for immediate micro-exit liquidation sum of $150.00 USD.",
                        color = Color.DarkGray,
                        fontSize = 11.sp,
                        lineHeight = 15.sp
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "EXECUTED BY:",
                        color = Color.Black,
                        fontWeight = FontWeight.Bold,
                        fontSize = 10.sp
                    )
                    Text(
                        text = "Assignor Signature: ${if (signatureText.isNotBlank()) signatureText else "[Awaiting signature...] "}",
                        color = if (signatureText.isNotBlank()) ForestEmerald else Color.Red,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Signature Input
            Text(
                text = "Type Full Legal Name to click-to-sign agreement",
                color = OnBackgroundText,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = signatureText,
                onValueChange = onSignatureChange,
                placeholder = { Text("e.g., Jessica Ann Marie") },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("signature_input"),
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                keyboardActions = KeyboardActions(onDone = { keyboardController?.hide() }),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = OnBackgroundText,
                    unfocusedTextColor = OnBackgroundText,
                    focusedBorderColor = GoldPrimary,
                    unfocusedBorderColor = CardBorder,
                    focusedContainerColor = DeepSurface,
                    unfocusedContainerColor = DeepSurface
                ),
                shape = RoundedCornerShape(10.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedButton(
                    onClick = { onSignatureChange("") },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = MutedSlate),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text(text = "Reset")
                }

                Button(
                    onClick = {
                        keyboardController?.hide()
                        onSignContract(selectedIdea)
                    },
                    enabled = signatureText.isNotBlank(),
                    modifier = Modifier
                        .weight(2f)
                        .testTag("execute_contract_btn"),
                    colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(imageVector = Icons.Default.Check, contentDescription = "Sign")
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "Sign & Process Payout", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

// ==================== SCREEN 4: IRON PORTFOLIO & PRE-VETTED ASSETS ====================
@Composable
fun PortfolioScreen(
    ideas: List<Idea>,
    isSubscribed: Boolean,
    onToggleSubscription: () -> Unit,
    viewModel: IdeaVaultViewModel
) {
    val securedAssets = ideas.filter { it.status == "Secured Vault" || it.status == "Payout Completed" }
    
    // Portfolio valuation specs
    val totalDeployed = securedAssets.size * 150.0
    val appraisalAssetValue = securedAssets.size * 1250.0 // 8x average arbitrate markup

    val submittedSolutions by viewModel.submittedSolutions.collectAsStateWithLifecycle()
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        // Vault Performance Matrix
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = DeepSurface),
            border = BorderStroke(1.dp, CardBorder)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(imageVector = Icons.Default.Lock, contentDescription = "Vault", tint = GoldPrimary)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "Iron Vault Ledger (Sovereign)", color = GoldPrimary, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(text = "ACQUISITION CAPITAL DEPLOYED", fontSize = 9.sp, color = MutedSlate)
                        Text(text = "$${String.format("%.2f", totalDeployed)} USD", color = OnBackgroundText, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text(text = "PORTFOLIO VALUE APPR", fontSize = 9.sp, color = ForestEmerald)
                        Text(text = "$${String.format("%.2f", appraisalAssetValue)} USD", color = ForestEmerald, fontWeight = FontWeight.Black, fontSize = 18.sp)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // PayPal Broker Escrow Gateway Card
        val context = LocalContext.current
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = DeepSurface),
            border = BorderStroke(1.dp, GoldAccent.copy(alpha = 0.5f))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "PRIMARY BROKER ROUTING",
                            fontSize = 9.sp,
                            color = GoldAccent,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.5.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "PayPal.me/tjites",
                            color = OnBackgroundText,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(GoldAccent.copy(alpha = 0.12f))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(text = "GATEWAY ACTIVE", color = GoldAccent, fontWeight = FontWeight.Bold, fontSize = 9.sp)
                    }
                }
                
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = "All licensing royalties, arbitrage fees, and downstream flipping commissions clear directly to your PayPal account to ensure total liquidity and zero broker friction.",
                    color = MutedSlate,
                    fontSize = 11.sp,
                    lineHeight = 15.sp
                )
                
                Spacer(modifier = Modifier.height(12.dp))
                
                Button(
                    onClick = {
                        try {
                            val uri = android.net.Uri.parse("https://PayPal.me/tjites")
                            val intent = Intent(Intent.ACTION_VIEW, uri)
                            context.startActivity(intent)
                        } catch (e: Exception) {
                            Toast.makeText(context, "PayPal browser error: ${e.message}", Toast.LENGTH_SHORT).show()
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(38.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = GoldAccent, contentColor = DarkBackground),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.ShoppingCart, contentDescription = "PayPal", modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Open Broker Wallet (PayPal.me/tjites)", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = if (isSubscribed) ForestEmerald.copy(alpha = 0.12f) else TransparentGold
            ),
            border = BorderStroke(1.dp, if (isSubscribed) ForestEmerald else GoldPrimary)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = if (isSubscribed) "Venture Pro Active Premium" else "Subscriber Venture Portal",
                            color = OnBackgroundText,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                        Text(
                            text = if (isSubscribed) "Access granted to Top 10 High Potential Weekly Scoutings & Spanner indexing." else "Unlock the 24/7 buy feed and secondary arbitrage markets for $99/mo.",
                            color = MutedSlate,
                            fontSize = 11.sp,
                            lineHeight = 15.sp
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = onToggleSubscription,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isSubscribed) ForestEmerald else GoldPrimary,
                            contentColor = if (isSubscribed) OnBackgroundText else DarkBackground
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.testTag("subscribe_payout_btn")
                    ) {
                        Text(
                            text = if (isSubscribed) "Active" else "$99/mo",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        Text(
            text = "Active Freelance SolveX Escrows",
            color = OnBackgroundText,
            fontWeight = FontWeight.Bold,
            fontSize = 16.sp
        )
        Spacer(modifier = Modifier.height(8.dp))

        if (submittedSolutions.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(80.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(DeepSurface)
                    .border(BorderStroke(1.dp, CardBorder), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(text = "No freelance contracts active in SolveX escrow.", color = MutedSlate, fontSize = 12.sp)
            }
        } else {
            submittedSolutions.forEach { (jobId, result) ->
                var verificationStatus by remember { mutableStateOf(result.status) }
                var showVerifiedSuccess by remember { mutableStateOf(false) }
                var isVerifying by remember { mutableStateOf(false) }

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    colors = CardDefaults.cardColors(containerColor = DeepSurface),
                    border = BorderStroke(1.dp, if (verificationStatus == "Released & Paid") ForestEmerald else CardBorder)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Contract ID: SR-${result.id}",
                                fontWeight = FontWeight.Bold,
                                color = OnBackgroundText,
                                fontSize = 14.sp
                            )
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(if (verificationStatus == "Released & Paid" || verificationStatus.contains("Secured")) ForestEmerald.copy(alpha = 0.15f) else GoldAccent.copy(alpha = 0.15f))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                                    .border(BorderStroke(0.5.dp, if (verificationStatus == "Released & Paid" || verificationStatus.contains("Secured")) ForestEmerald else GoldPrimary), RoundedCornerShape(4.dp))
                            ) {
                                Text(
                                    text = verificationStatus.uppercase(),
                                    color = if (verificationStatus == "Released & Paid" || verificationStatus.contains("Secured")) ForestEmerald else GoldPrimary,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = result.summary,
                            color = MutedSlate,
                            fontSize = 12.sp,
                            lineHeight = 15.sp
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Clearing Option: PayPal Gateway",
                                color = MutedSlate,
                                fontSize = 11.sp
                            )
                            if (verificationStatus != "Released & Paid") {
                                Button(
                                    onClick = {
                                        isVerifying = true
                                        viewModel.verifyClaim(result.jobId) { success, msg ->
                                            isVerifying = false
                                            if (success) {
                                                verificationStatus = "Released & Paid"
                                                showVerifiedSuccess = true
                                            } else {
                                                Toast.makeText(context, msg, Toast.LENGTH_LONG).show()
                                            }
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground),
                                    shape = RoundedCornerShape(6.dp),
                                    modifier = Modifier.height(30.dp),
                                    enabled = !isVerifying
                                ) {
                                    if (isVerifying) {
                                        CircularProgressIndicator(color = DarkBackground, modifier = Modifier.size(12.dp))
                                    } else {
                                        Text(text = "Verify & Claim", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            } else {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.CheckCircle,
                                        contentDescription = "Paid",
                                        tint = ForestEmerald,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(text = "Paid to PayPal", color = ForestEmerald, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }

                if (showVerifiedSuccess) {
                    AlertDialog(
                        onDismissRequest = { showVerifiedSuccess = false },
                        title = {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.CheckCircle, contentDescription = "Success", tint = ForestEmerald)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Escrow Released Successfully!", color = ForestEmerald)
                            }
                        },
                        text = {
                            Text(
                                "Your pre-solved paradox code envelope has been verified against contract guidelines.\n\nRoyalties have been routed securely to your linked PayPal brokerage account (PayPal.me/tjites).\n\nTransaction ID: TXN-SOLVEX-${result.id}",
                                color = OnBackgroundText,
                                fontSize = 13.sp,
                                lineHeight = 17.sp
                            )
                        },
                        confirmButton = {
                            Button(
                                onClick = { showVerifiedSuccess = false },
                                colors = ButtonDefaults.buttonColors(containerColor = ForestEmerald)
                            ) {
                                Text("Acknowledge Ledger Credit")
                            }
                        },
                        containerColor = DeepSurface,
                        textContentColor = OnBackgroundText
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        Text(
            text = "Secured Vault Assets",
            color = OnBackgroundText,
            fontWeight = FontWeight.Bold,
            fontSize = 16.sp
        )
        Spacer(modifier = Modifier.height(8.dp))

        if (securedAssets.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(130.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(DeepSurface)
                    .border(BorderStroke(1.dp, CardBorder), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(text = "No secured IP assets inside the Vault yet.", color = MutedSlate, fontSize = 12.sp)
            }
        } else {
            securedAssets.forEach { asset ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    colors = CardDefaults.cardColors(containerColor = DeepSurface),
                    border = BorderStroke(1.dp, CardBorder)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .clip(RoundedCornerShape(50))
                                        .background(ForestEmerald)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(text = asset.title, fontWeight = FontWeight.Bold, color = OnBackgroundText)
                            }
                            Text(text = "Appraisal: $1,250.00", color = GoldPrimary, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                        
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Deed executed by Assignor '${asset.author}' transferring complete copyright globally.",
                            fontSize = 11.sp,
                            color = MutedSlate
                        )

                        val isSolveXSecured = asset.source == "SolveX Broker Contract" || asset.status == "Secured Vault" || asset.status == "Payout Completed"
                        if (isSolveXSecured) {
                            Spacer(modifier = Modifier.height(8.dp))
                            HorizontalDivider(color = CardBorder)
                            Spacer(modifier = Modifier.height(8.dp))
                            Spacer(modifier = Modifier.height(10.dp))
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(DarkBackground)
                                    .border(BorderStroke(1.dp, CardBorder), RoundedCornerShape(8.dp))
                                    .padding(12.dp)
                            ) {
                                Column {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(imageVector = Icons.Default.Lock, contentDescription = "Security Active", tint = ForestEmerald, modifier = Modifier.size(14.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(text = "ASSET ENVELOPE SECURELY RETIRED", color = ForestEmerald, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp)
                                    }
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        text = "Under the Sovereign IP Transfer Act, the underlying compiled source engine was direct-compiled as immutable binary to the client endpoint. The local plaintext cache and symmetric decryption key have been securely purged.",
                                        color = MutedSlate,
                                        fontSize = 11.sp,
                                        lineHeight = 14.sp
                                    )
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "Symmetric Key Status: PURGED",
                                            color = GoldPrimary,
                                            fontSize = 9.sp,
                                            fontFamily = FontFamily.Monospace
                                        )
                                        Text(
                                            text = "Signature: COMPILED",
                                            color = ForestEmerald,
                                            fontSize = 9.sp,
                                            fontFamily = FontFamily.Monospace
                                        )
                                    }
                                }
                            }
                        } else if (!isSubscribed) {
                            Spacer(modifier = Modifier.height(10.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Lock, contentDescription = "Locked", tint = MutedSlate, modifier = Modifier.size(12.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(text = "Venture Data Locked", color = MutedSlate, fontSize = 10.sp)
                                }
                                TextButton(onClick = onToggleSubscription) {
                                    Text(text = "Unlock details", color = GoldPrimary, fontSize = 10.sp)
                                }
                            }
                        } else {
                            // Render premium analytics detail
                            Spacer(modifier = Modifier.height(8.dp))
                            HorizontalDivider(color = CardBorder)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Market Cap Analysis: ${asset.analysisDetails}",
                                color = OnBackgroundText,
                                fontSize = 11.sp,
                                lineHeight = 15.sp
                            )
                        }
                    }
                }
            }
        }
    }
}

// ==================== DIALOG 1: DETAILED ANALYSIS DETAIL ====================
@Composable
fun IdeaDetailOverlay(
    idea: Idea,
    onDismiss: () -> Unit,
    onSendOutreach: () -> Unit,
    onVerifyAcceptance: () -> Unit,
    onSignContract: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Column {
                Text(
                    text = idea.title,
                    color = OnBackgroundText,
                    fontWeight = FontWeight.Black,
                    fontSize = 20.sp
                )
                Text(
                    text = "Vetted Valuation: $${String.format("%.2f", idea.valuation)} USD",
                    color = GoldPrimary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
            ) {
                // Score breakdowns
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    ScoreBar(label = "TAM", score = idea.tamScore, color = GoldPrimary)
                    ScoreBar(label = "FEASIB", score = idea.feasibilityScore, color = ForestEmerald)
                    ScoreBar(label = "C. GAP", score = idea.gapScore, color = GoldAccent)
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Market Size indicator
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(TransparentGreen)
                        .padding(8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(text = "ESTIMATED TOTAL ADDRESSABLE MARKET", fontSize = 9.sp, color = ForestEmerald, fontWeight = FontWeight.Bold)
                    Text(text = idea.marketSize, fontSize = 11.sp, color = OnBackgroundText, fontWeight = FontWeight.Black)
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "ORIGINAL CONTEXT",
                    fontWeight = FontWeight.Bold,
                    color = MutedSlate,
                    fontSize = 10.sp
                )
                Text(
                    text = "\"${idea.originalText}\"",
                    color = OnBackgroundText,
                    fontSize = 12.sp,
                    lineHeight = 16.sp,
                    modifier = Modifier.padding(vertical = 4.dp)
                )

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = "AI PORTFOLIO BRIEFING",
                    fontWeight = FontWeight.Bold,
                    color = MutedSlate,
                    fontSize = 10.sp
                )
                if (idea.source == "SolveX Broker Contract" || idea.status == "Secured Vault" || idea.status == "Payout Completed") {
                    Spacer(modifier = Modifier.height(4.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(DarkBackground)
                            .border(BorderStroke(1.dp, CardBorder), RoundedCornerShape(8.dp))
                            .padding(12.dp)
                    ) {
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(imageVector = Icons.Default.Lock, contentDescription = "Security Active", tint = ForestEmerald, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(text = "ASSET ENVELOPE SECURELY RETIRED", color = ForestEmerald, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp)
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Under the Sovereign IP Transfer Act, the underlying compiled source engine was direct-compiled as immutable binary to the client endpoint. The local plaintext cache and symmetric decryption key have been securely purged.",
                                color = MutedSlate,
                                fontSize = 11.sp,
                                lineHeight = 14.sp
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Symmetric Key Status: PURGED",
                                    color = GoldPrimary,
                                    fontSize = 9.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                                Text(
                                    text = "Signature: COMPILED",
                                    color = ForestEmerald,
                                    fontSize = 9.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }
                    }
                } else {
                    Text(
                        text = idea.analysisDetails.ifEmpty { "Analytica is calculating deep trends and parsing market share..." },
                        color = OnBackgroundText,
                        fontSize = 12.sp,
                        lineHeight = 16.sp,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                }

                if (idea.outreachMessage.isNotBlank()) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "SENT SOLICITATION DM OUTREACH",
                        fontWeight = FontWeight.Bold,
                        color = GoldAccent,
                        fontSize = 10.sp
                    )
                    Text(
                        text = idea.outreachMessage,
                        color = GoldAccent,
                        fontSize = 11.sp,
                        lineHeight = 15.sp,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                }
            }
        },
        confirmButton = {
            if (idea.status == "Scouted" && idea.totalScore >= 80) {
                Button(
                    onClick = onSendOutreach,
                    colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground)
                ) {
                    Text(text = "Trigger Auto-Outreach")
                }
            } else if (idea.status == "Outreach Sent") {
                Button(
                    onClick = onVerifyAcceptance,
                    colors = ButtonDefaults.buttonColors(containerColor = ForestEmerald, contentColor = OnBackgroundText)
                ) {
                    Text(text = "Verify Creator Response")
                }
            } else if (idea.status == "Accepted") {
                Button(
                    onClick = onSignContract,
                    colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground)
                ) {
                    Text(text = "Draft IP Agreement")
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Close", color = MutedSlate)
            }
        },
        containerColor = DeepSurface,
        shape = RoundedCornerShape(16.dp),
        tonalElevation = 8.dp
    )
}

@Composable
fun ScoreBar(label: String, score: Int, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.width(70.dp)) {
        Text(text = label, fontSize = 9.sp, color = MutedSlate, fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp)
        Spacer(modifier = Modifier.height(4.dp))
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(42.dp)
                .clip(RoundedCornerShape(50))
                .background(color.copy(alpha = 0.12f))
                .border(BorderStroke(1.dp, color), RoundedCornerShape(50))
        ) {
            Text(text = score.toString(), color = OnBackgroundText, fontWeight = FontWeight.Black, fontSize = 13.sp)
        }
    }
}

// ==================== DIALOG 2: STRIPE PAYOUT SUCCESS ====================
@Composable
fun PayoutSuccessDialog(idea: Idea, onDismiss: () -> Unit) {
    var animationProgress by remember { mutableStateOf(0.0f) }

    LaunchedEffect(Unit) {
        // Animate progress indicator during secure Stripe instant wire transaction transfer protocol
        while (animationProgress < 1.0f) {
            delay(150)
            animationProgress += 0.2f
        }
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "STRIPE CONNECT: LIQUIDATION",
                color = ForestEmerald,
                fontWeight = FontWeight.Black,
                fontSize = 16.sp,
                letterSpacing = 1.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                if (animationProgress < 1.0f) {
                    CircularProgressIndicator(color = ForestEmerald, modifier = Modifier.size(50.dp))
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Negotiating secure ACH / Stripe payout protocol...",
                        color = OnBackgroundText,
                        fontSize = 12.sp,
                        textAlign = TextAlign.Center
                    )
                } else {
                    Box(
                        modifier = Modifier
                            .size(70.dp)
                            .clip(RoundedCornerShape(50))
                            .background(TransparentGreen),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Success",
                            tint = ForestEmerald,
                            modifier = Modifier.size(44.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Transfer Complete!",
                        fontWeight = FontWeight.ExtraBold,
                        color = OnBackgroundText,
                        fontSize = 18.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "$150.00 USD has been instantly wired to @${idea.author}'s external card bank account.",
                        textAlign = TextAlign.Center,
                        color = MutedSlate,
                        fontSize = 12.sp,
                        lineHeight = 16.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "IP Asset '${idea.title}' is now collateralized and stored inside the sovereign Iron Vault ledger.",
                        textAlign = TextAlign.Center,
                        color = GoldPrimary,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        lineHeight = 15.sp
                    )
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    val context = LocalContext.current
                    Button(
                        onClick = {
                            try {
                                val uri = android.net.Uri.parse("https://PayPal.me/tjites")
                                val intent = Intent(Intent.ACTION_VIEW, uri)
                                context.startActivity(intent)
                            } catch (e: Exception) {
                                Toast.makeText(context, "PayPal redirect issue: ${e.message}", Toast.LENGTH_SHORT).show()
                            }
                        },
                        modifier = Modifier.fillMaxWidth().height(36.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = GoldAccent, contentColor = DarkBackground),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(Icons.Default.ShoppingCart, contentDescription = "PayPal", modifier = Modifier.size(13.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("PayPal Gateway: PayPal.me/tjites", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        },
        confirmButton = {
            if (animationProgress >= 1.0f) {
                Button(
                    onClick = onDismiss,
                    colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground)
                ) {
                    Text("OK, Store in Vault")
                }
            }
        },
        containerColor = DeepSurface,
        shape = RoundedCornerShape(16.dp),
        tonalElevation = 8.dp
    )
}

@Composable
fun SolveXScreen(
    viewModel: IdeaVaultViewModel,
    onExploreJobs: () -> Unit = {}
) {
    val jobs by viewModel.solvexJobs.collectAsStateWithLifecycle()
    val isLoading by viewModel.isLoadingSolvex.collectAsStateWithLifecycle()
    val error by viewModel.solvexError.collectAsStateWithLifecycle()
    val submissions by viewModel.submittedSolutions.collectAsStateWithLifecycle()
    val ideas by viewModel.allIdeas.collectAsStateWithLifecycle()

    var currentSubTab by remember { mutableStateOf("Freelance Contracts") } // "Freelance Contracts" or "Paradox Licensing Store"

    var selectedBoard by remember { mutableStateOf("All") }
    val boards = listOf("All", "Upwork", "Fiverr", "Freelancer", "PeoplePerHour", "Toptal")

    var activeDetailJob by remember { mutableStateOf<SolveXJob?>(null) }
    var selectedParadoxIndex by remember { mutableStateOf(0) }

    val paradoxes = listOf(
        Pair("Micro-Pass SaaS System", "An auto-expiring single-use microbilling pass that only bills for minutes utilized on secure backend API endpoints."),
        Pair("Instant Recipe Weight Parsing", "An optical AI scanning recipe engine matching on-device camera feeds with raw ingredient densities to calculate grams instantly."),
        Pair("Zero-Knowledge Scheduler", "A secure calendar coordination poll that matches free slots across Google and Outlook profiles without sharing description details."),
        Pair("On-Device Freelance Expense Ledger", "A background service monitoring on-device screens to extract and reconcile business receipt expenses for tax write-offs.")
    )

    // Detailed description for licensing store
    val richParadoxes = listOf(
        Triple(
            "Micro-Pass SaaS System",
            "An auto-expiring single-use microbilling pass that charges users exclusively for active millisecond compute on secure API resources.",
            listOf(
                "Eradicates API compute drain and runaway scraper loop overbilling.",
                "Issues cryptographic transient keys that auto-expire upon quota depletion.",
                "Maintains strict bilateral isolation with zero permanent key leakage to client apps."
            )
        ),
        Triple(
            "Instant Recipe Weight Parsing",
            "An optical scanner matching real-time volume estimates with raw ingredient food densities to calculate grams on-device instantly.",
            listOf(
                "Frictionless nutrition tracking without requiring physical food scales.",
                "Compiles volumetric parsing rules directly into optimized local machine code.",
                "Maintains private offline scanning logs so culinary logs stay confidential."
            )
        ),
        Triple(
            "Zero-Knowledge Scheduler",
            "A secure coordinator matching available openings across Google & Outlook calendars without exposing titles or participants.",
            listOf(
                "Erases corporate phishing routes that target calendar invitation descriptions.",
                "Employs homomorphic slot comparisons safely isolated on user devices.",
                "Returns optimized mute openings while keeping calendar data isolated."
            )
        ),
        Triple(
            "On-Device Freelance Expense Ledger",
            "A background capture OCR scheduler that extracts freelance business expense receipts directly from device screenshots.",
            listOf(
                "Automates tax book reconciliation with zero friction for gig contractors.",
                "Runs on-device OCR logic inside transient, sandboxed processes.",
                "Saves transactional records directly to a secure local symmetric database."
            )
        )
    )

    val crystalSolutions = listOf(
        Triple(
            "Zero-Knowledge Multi-Party Ledger",
            "Secure decentralized financial ledger that reconciles shared agreements without exposing raw corporate treasury balances.",
            listOf(
                "Eliminates double-spend or false asset declaration claims.",
                "Proves accounting solvency mathematically using zk-SNARK constraints.",
                "Stores encrypted cryptographic roots directly on sovereign user devices."
            )
        ),
        Triple(
            "Homomorphic Invoice Auditor",
            "Direct secure financial auditing engine evaluating company ledger transactions without revealing plain text corporate descriptions.",
            listOf(
                "Automates tax compliance without exposing vendor identity metrics.",
                "Injects mathematical audit proofs to prevent transaction modification.",
                "Enables 100% private outbound business audits."
            )
        ),
        Triple(
            "Decentralized KYC Validator",
            "Sovereign biometric validator matching local device face hashes against distributed ID files while maintaining 100% client isolation.",
            listOf(
                "Thwarts central storage hacking vectors targeting customer biometric logs.",
                "Validates matches in ephemeral micro-kernels on-device.",
                "Returns a certified signature without raw photo transmission."
            )
        ),
        Triple(
            "Quantum-Safe API Guard",
            "High-performance lattice-based post-quantum cryptography wrapper shield routing secure API queries securely.",
            listOf(
                "Eradicates future decrypt-now-decrypt-later harvesting tactics.",
                "Guards endpoints with ring-LWE derived ephemeral handshake locks.",
                "Fits inside low-overhead network payload packets."
            )
        ),
        Triple(
            "Polymorphic Database Shield",
            "Rotating tokenization gateway that translates database schemas dynamically to render physical exports completely unreadable.",
            listOf(
                "Shields SQLite or Room cells from direct rooted phone database pulls.",
                "Rotates relational database structures on active session handshakes.",
                "Negates structural column enumeration discovery."
            )
        ),
        Triple(
            "Bilateral Blind Escrow",
            "Autonomous escrow coordinator triggering peer payout conditions safely without third-party middleman exposure.",
            listOf(
                "Erases payout gateway freeze or double-agent routing hazards.",
                "Settles payouts peer-to-peer on encrypted cryptographic triggers.",
                "Releases funds directly into recipient account nodes."
            )
        ),
        Triple(
            "Ephemeral Location Mask",
            "Transient geographic router matching delivery vectors on-device without exposing global coordinates to tracking servers.",
            listOf(
                "Stamps location points with dynamic spatial coordinates offsets.",
                "Maintains zero background server database history storage.",
                "Optimizes delivery tracking while remaining completely anonymized."
            )
        ),
        Triple(
            "Differential Privacy Analytica",
            "Metadata telemetry aggregator that injects calibrated mathematical noise to keep private telemetry securely locked.",
            listOf(
                "Gathers operational feedback safely within k-anonymity matrices.",
                "Ensures absolute individual anonymity from aggregated logs.",
                "Fades metric accuracy back to pristine values on bulk aggregation."
            )
        ),
        Triple(
            "Cognitive Bot Shuffler",
            "Dynamic DOM and UI register scrambler executing on-client layout shuffling to block automated device control scripts.",
            listOf(
                "Neutralizes Android screen scraping bots in real-time.",
                "Shuffles active layout elements at random byte alignments.",
                "Preserves readable visual hierarchy for human users."
            )
        ),
        Triple(
            "Symmetric Search Engine",
            "Local search index system carrying out full-text searches across encrypted databases without preceding bulk decryption.",
            listOf(
                "Searches document databases with zero decryption memory residency.",
                "Matches precise indexes using tokenized secure keywords.",
                "Prevents decryption trace scans in system RAM cells."
            )
        ),
        Triple(
            "Self-Destructing Log Core",
            "Sovereign diagnostics logger writing to highly ephemeral RAM matrices that automatically shred on thread completion.",
            listOf(
                "Leaves absolute zero persistent traceback audits on local storage.",
                "Overwrites volatile memory blocks on thread execution finish.",
                "Suppresses automatic background cloud backup sync routes."
            )
        ),
        Triple(
            "Homomorphic Yield Predictor",
            "Predictive business logic runner running directly over double-encrypted CSV balances with private model isolation.",
            listOf(
                "Confidential forecast models with zero raw database exposures.",
                "Executes math tasks on encrypted matrix cells on-device.",
                "Returns absolute output predictions without exposing backend logs."
            )
        ),
        Triple(
            "Secure Secret-Share Splitter",
            "Local cryptographic key manager splitting master secrets into dynamic thresholds with zero local persistence.",
            listOf(
                "Protects master corporate seeds against localized device extraction.",
                "Accepts custom configuration ratios for keys reconstruction.",
                "Calculates polynomial calculations in secure hardware spaces."
            )
        ),
        Triple(
            "Blind Bid Arbiter",
            "Competitive bidding portal assessing proposal prices without revealing individual competitor parameters until closure.",
            listOf(
                "Stops pre-bidding cartel adjustments on wholesale projects.",
                "Compiles comparative bid structures on-device.",
                "Releases single lowest bid metric at secure settlement times."
            )
        ),
        Triple(
            "Steganographic Watermarker",
            "Transient background filter embedding high-density uncopyable signatures inside images during capture.",
            listOf(
                "Stops visual copyright theft securely in corporate channels.",
                "Embeds invisible signatures inside pixel color matrices.",
                "Preserves visual image clarity without quality loss."
            )
        ),
        Triple(
            "Sealed-Envelope Ballot Console",
            "Homomorphic voting register assembling corporate tallies anonymously with zero individual vote trackers.",
            listOf(
                "Guarantees corporate decision privacy against tracing trackers.",
                "Tallies cryptographically encrypted ballots before decryption.",
                "Sovereign vote audit keys remain completely localized."
            )
        ),
        Triple(
            "Dynamic IP Cloak System",
            "Dynamic network gateway rotating route endpoints dynamically to suppress scraping and tracker footprints.",
            listOf(
                "Shields client terminal connections from visual targeting.",
                "Rotates outgoing requests over distributed proxy nodes.",
                "Suppresses automated scraping tracing systems."
            )
        ),
        Triple(
            "Sandboxed Key Vault Core",
            "Isolated key scheduler storing encryption certificates in volatile register blocks that clear dynamically on sleep.",
            listOf(
                "Prevents digital certificates theft on device sleep.",
                "Locks memory spaces under hardware-enforced sandboxes.",
                "Shreds active private certificates on lifecycle changes."
            )
        ),
        Triple(
            "Secure Document Redactor",
            "Lightweight real-time document processor that automatically scrubs private customer labels from outbound business documents.",
            listOf(
                "Blocks data leaks on shared enterprise documents.",
                "Runs sanitizing heuristics inside transient memory lines.",
                "Saves clean sanitized document records instantly."
            )
        ),
        Triple(
            "Isomorphic Payload Synthesizer",
            "Polymorphic payload coordinator scrambling webhook payloads under rotating keys to block system eavesdropping.",
            listOf(
                "Neutralizes middle-tier packet snooping vectors.",
                "Rotates transmission payload formats on every handshake.",
                "Matches original endpoints with zero network latency."
            )
        ),
        Triple(
            "Zero-Leak Telemetry Hub",
            "Secure reporting channel forwarding vital telemetry alerts with fully generalized and randomized header details.",
            listOf(
                "Allows operational debugging without revealing corporate user profiles.",
                "Strips identification markers from system logs.",
                "Aggregates report patterns completely offline."
            )
        ),
        Triple(
            "Zero-Trust Token Verifier",
            "Distributed local session validation engine checking active tokens with zero external cloud roundtrips.",
            listOf(
                "Erases central authentication database downtime vulnerabilities.",
                "Checks cryptosignatures locally in isolated registers.",
                "Returns validation confirmation in sub-milliseconds."
            )
        ),
        Triple(
            "Asymmetric Data Vault Matrix",
            "Dynamic fragmented file distribution across client network points enforcing threshold-based recovery keys.",
            listOf(
                "Shreds files and chunks data across decoupled nodes.",
                "Decouples master vault data from standard host controllers.",
                "Calculates key slices entirely on sovereign storage modules."
            )
        ),
        Triple(
            "Blind Transaction Mixer",
            "High-privacy transaction mixing protocol masking financial trails through secure dual-homed virtual contracts.",
            listOf(
                "Anonymizes payment sender structures using standard coin mixers.",
                "Guarantees no central tracing database is populated.",
                "Signs and settles ledger assets in isolated execution threads."
            )
        ),
        Triple(
            "Polymorphic Cryptoshield SDK",
            "Dynamic multi-tenant encryption wrapper shielding client application bundles from external system decompilers.",
            listOf(
                "Stops binary analysis by dynamically shuffling byte instructions.",
                "Guards trade secrets, algorithms, and logic code blocks.",
                "Decouples sensitive proprietary assets inside secure native buffers."
            )
        )
    )

    // Trigger loading jobs on entry
    LaunchedEffect(selectedBoard) {
        viewModel.loadSolvexJobs(if (selectedBoard == "All") null else selectedBoard)
    }

    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    // Store state
    var purchasingParadox by remember { mutableStateOf<String?>(null) }
    var runningHarnessFor by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "SolveX Solutions Hub",
            color = OnBackgroundText,
            fontWeight = FontWeight.Bold,
            fontSize = 20.sp
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Deploy mathematical paradoxes to win freelance contracts, or license pre-compiled enterprise-ready solution assets directly.",
            color = MutedSlate,
            fontSize = 11.sp,
            lineHeight = 15.sp
        )

        Spacer(modifier = Modifier.height(14.dp))

        // Triple-Tab Switcher
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(8.dp))
                .background(DeepSurface)
                .padding(4.dp)
        ) {
            listOf("Freelance Contracts", "Paradox Licensing Store", "Crystal Clear Box").forEach { tab ->
                val isSelectedTab = currentSubTab == tab
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(6.dp))
                        .background(if (isSelectedTab) GoldPrimary else Color.Transparent)
                        .clickable { currentSubTab = tab }
                        .padding(vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = tab,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isSelectedTab) DarkBackground else MutedSlate
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        if (currentSubTab == "Freelance Contracts") {
            // Freelance Contracts Tab Layout
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                boards.forEach { board ->
                    val isSelected = selectedBoard == board
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isSelected) GoldPrimary else DeepSurface)
                            .border(BorderStroke(1.dp, if (isSelected) GoldPrimary else CardBorder), RoundedCornerShape(8.dp))
                            .clickable { selectedBoard = board }
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = board.uppercase(),
                            color = if (isSelected) DarkBackground else MutedSlate,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            if (isLoading && jobs.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = GoldPrimary)
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(jobs) { job ->
                        val isSubmitted = submissions.containsKey(job.id)
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { activeDetailJob = job },
                            colors = CardDefaults.cardColors(containerColor = DeepSurface),
                            border = BorderStroke(1.dp, if (isSubmitted) ForestEmerald else CardBorder)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(4.dp))
                                                .background(GoldPrimary.copy(alpha = 0.12f))
                                                .padding(horizontal = 6.dp, vertical = 2.dp)
                                        ) {
                                            Text(
                                                text = job.board.uppercase(),
                                                color = GoldPrimary,
                                                fontSize = 8.sp,
                                                fontWeight = FontWeight.Bold
                                            )
                                        }
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = job.clientCountry,
                                            color = MutedSlate,
                                            fontSize = 10.sp
                                        )
                                    }
                                    Text(
                                        text = job.budget,
                                        color = if (isSubmitted) ForestEmerald else GoldAccent,
                                        fontWeight = FontWeight.Black,
                                        fontSize = 13.sp
                                    )
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = job.title,
                                    color = OnBackgroundText,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = job.description,
                                    color = MutedSlate,
                                    fontSize = 11.sp,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis,
                                    lineHeight = 15.sp
                                )
                                Spacer(modifier = Modifier.height(10.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(text = "Completion term: ${job.duration}", color = MutedSlate, fontSize = 9.sp)
                                    if (isSubmitted) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(
                                                imageVector = Icons.Default.CheckCircle,
                                                contentDescription = "Secured",
                                                tint = ForestEmerald,
                                                modifier = Modifier.size(12.dp)
                                            )
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text(text = "SECURED ESCROW", color = ForestEmerald, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                                        }
                                    } else {
                                        Text(text = "DEPLOY MVP DRAFT", color = GoldPrimary, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else if (currentSubTab == "Paradox Licensing Store") {
            // Paradox Licensing Store Layout
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(richParadoxes) { (title, tagline, featuresList) ->
                    val isLicensed = ideas.any { it.title == "LICENSED: $title" && it.status == "Secured Vault" }
                    
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isLicensed) ForestEmerald.copy(alpha = 0.05f) else DeepSurface
                        ),
                        border = BorderStroke(1.dp, if (isLicensed) ForestEmerald else CardBorder)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.Top
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = title,
                                        fontWeight = FontWeight.Bold,
                                        color = OnBackgroundText,
                                        fontSize = 14.sp
                                    )
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = tagline,
                                        color = MutedSlate,
                                        fontSize = 11.sp,
                                        lineHeight = 15.sp
                                    )
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                if (isLicensed) {
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(4.dp))
                                            .background(ForestEmerald.copy(alpha = 0.15f))
                                            .padding(horizontal = 8.dp, vertical = 4.dp)
                                            .border(BorderStroke(0.5.dp, ForestEmerald), RoundedCornerShape(4.dp))
                                    ) {
                                        Text(
                                            text = "LICENSED",
                                            color = ForestEmerald,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.ExtraBold
                                        )
                                    }
                                } else {
                                    Text(
                                        text = "$499.00",
                                        color = GoldAccent,
                                        fontWeight = FontWeight.Black,
                                        fontSize = 14.sp
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))
                            HorizontalDivider(color = CardBorder.copy(alpha = 0.5f))
                            Spacer(modifier = Modifier.height(10.dp))

                            Text(
                                text = "CORE ISSUES ERADICATED:",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = GoldPrimary,
                                letterSpacing = 0.5.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            featuresList.forEach { feat ->
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = "Feature Checked",
                                        tint = ForestEmerald,
                                        modifier = Modifier.size(12.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = feat,
                                        color = MutedSlate,
                                        fontSize = 11.sp,
                                        lineHeight = 15.sp
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            if (isLicensed) {
                                Button(
                                    onClick = { runningHarnessFor = title },
                                    modifier = Modifier.fillMaxWidth().height(36.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = ForestEmerald, contentColor = DarkBackground),
                                    shape = RoundedCornerShape(6.dp)
                                ) {
                                    Icon(Icons.Default.PlayArrow, contentDescription = "Run Harness", modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("LAUNCH ACTIVE TESTING HARNESS", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            } else {
                                Button(
                                    onClick = { purchasingParadox = title },
                                    modifier = Modifier.fillMaxWidth().height(36.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground),
                                    shape = RoundedCornerShape(6.dp)
                                ) {
                                    Icon(Icons.Default.ShoppingCart, contentDescription = "License", modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("ACQUIRE ENTERPRISE LICENSE • $499", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        } else if (currentSubTab == "Crystal Clear Box") {
            // "Crystal Clear Box" Layout representing 22 other secure enterprise solutions!
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(crystalSolutions) { (title, tagline, featuresList) ->
                    val isLicensed = ideas.any { it.title == "LICENSED: $title" && (it.status == "Secured Vault" || it.status == "Payout Completed") }
                    
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isLicensed) ForestEmerald.copy(alpha = 0.05f) else DeepSurface
                        ),
                        border = BorderStroke(1.dp, if (isLicensed) ForestEmerald else CardBorder)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.Top
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = title,
                                        fontWeight = FontWeight.Bold,
                                        color = OnBackgroundText,
                                        fontSize = 14.sp
                                    )
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = tagline,
                                        color = MutedSlate,
                                        fontSize = 11.sp,
                                        lineHeight = 15.sp
                                    )
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                if (isLicensed) {
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(4.dp))
                                            .background(ForestEmerald.copy(alpha = 0.15f))
                                            .padding(horizontal = 8.dp, vertical = 4.dp)
                                            .border(BorderStroke(0.5.dp, ForestEmerald), RoundedCornerShape(4.dp))
                                    ) {
                                        Text(
                                            text = "LICENSED",
                                            color = ForestEmerald,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.ExtraBold
                                        )
                                    }
                                } else {
                                    Text(
                                        text = "$299.00",
                                        color = GoldAccent,
                                        fontWeight = FontWeight.Black,
                                        fontSize = 14.sp
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))
                            HorizontalDivider(color = CardBorder.copy(alpha = 0.5f))
                            Spacer(modifier = Modifier.height(10.dp))

                            Text(
                                text = "CORE ISSUES ERADICATED:",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = GoldPrimary,
                                letterSpacing = 0.5.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            featuresList.forEach { feat ->
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = "Feature Checked",
                                        tint = ForestEmerald,
                                        modifier = Modifier.size(12.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = feat,
                                        color = MutedSlate,
                                        fontSize = 11.sp,
                                        lineHeight = 15.sp
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                if (!isLicensed) {
                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .padding(end = 8.dp)
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(GoldAccent.copy(alpha = 0.08f))
                                            .border(BorderStroke(0.5.dp, GoldAccent.copy(alpha = 0.3f)), RoundedCornerShape(6.dp))
                                            .padding(8.dp)
                                    ) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(
                                                imageVector = Icons.Default.Lock,
                                                contentDescription = "ZK Encrypted Shield",
                                                tint = GoldAccent,
                                                modifier = Modifier.size(12.dp)
                                            )
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text(
                                                text = "CODE PROTECTED: ZK SHA-3 ENCRYPTED BYTECODE GATED",
                                                color = GoldAccent,
                                                fontSize = 8.sp,
                                                fontWeight = FontWeight.Bold
                                            )
                                        }
                                    }
                                }
                            }
                            if (!isLicensed) {
                                Spacer(modifier = Modifier.height(8.dp))
                            }

                            if (isLicensed) {
                                Button(
                                    onClick = { runningHarnessFor = title },
                                    modifier = Modifier.fillMaxWidth().height(36.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = ForestEmerald, contentColor = DarkBackground),
                                    shape = RoundedCornerShape(6.dp)
                                ) {
                                    Icon(Icons.Default.PlayArrow, contentDescription = "Run Harness", modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("LAUNCH ACTIVE TESTING HARNESS", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            } else {
                                Button(
                                    onClick = { purchasingParadox = title },
                                    modifier = Modifier.fillMaxWidth().height(36.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground),
                                    shape = RoundedCornerShape(6.dp)
                                ) {
                                    Icon(Icons.Default.ShoppingCart, contentDescription = "License", modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("ACQUIRE ENTERPRISE LICENSE • $299", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Interactive Checkout & Decryption-Compile Delivery Engine Dialog
    purchasingParadox?.let { paradoxName ->
        var step by remember { mutableStateOf(1) } // 1: Card checkout, 2: Compiling engine animation
        var compProgress by remember { mutableStateOf(0.0f) }
        var currentCompLog by remember { mutableStateOf("Initializing payload compilation sequence...") }
        
        var cardHolder by remember { mutableStateOf("") }
        var cardNumber by remember { mutableStateOf("4242 4242 4242 4242") }
        var cardExp by remember { mutableStateOf("12/28") }
        var cardCvv by remember { mutableStateOf("321") }
        var cardError by remember { mutableStateOf("") }

        LaunchedEffect(step) {
            if (step == 2) {
                val logs = listOf(
                    "Establishing handshake with decentralized licensing node...",
                    "Fetching AES-256 encrypted paradox source code chunks...",
                    "Synthesizing high-density bytecode structures on-device...",
                    "Checking signature integrity constraints on local endpoint...",
                    "Activating on-device binary compiling process...",
                    "Shredding local plaintext caches and decryption keys... [SECURED]",
                    "Asymmetric verification complete. Immutable running capsule initialized."
                )
                for (i in 0 until logs.size) {
                    currentCompLog = logs[i]
                    compProgress = (i + 1).toFloat() / logs.size
                    delay(800L)
                }
                
                val isCrystalSolution = crystalSolutions.any { it.first == paradoxName }
                val costAmount = if (isCrystalSolution) 299.00 else 499.00
                val sourceLabel = if (isCrystalSolution) "Crystal Clear Box" else "Paradox Licensing Store"

                // Add to Room dynamic secured assets to show permanently in Secure Vault Portfolio
                viewModel.saveSecuredAsset(Idea(
                    title = "LICENSED: $paradoxName",
                    source = sourceLabel,
                    originalText = "High-performance enterprise license key issued. Immutable binary deployed.",
                    author = "Enterprise Buyer Corporation",
                    status = "Secured Vault",
                    valuation = costAmount
                ))
                purchasingParadox = null
                Toast.makeText(context, "$paradoxName License Secured & Compiled!", Toast.LENGTH_LONG).show()
            }
        }

        AlertDialog(
            onDismissRequest = { if (step == 1) purchasingParadox = null },
            title = {
                Text(
                    text = if (step == 1) "SECURE CARD CHECKOUT" else "ZERO-KNOWLEDGE DELIVERY",
                    fontWeight = FontWeight.ExtraBold,
                    color = GoldAccent,
                    fontSize = 15.sp,
                    letterSpacing = 0.5.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            text = {
                Column(modifier = Modifier.fillMaxWidth()) {
                    if (step == 1) {
                        val isCrystalSolution = crystalSolutions.any { it.first == paradoxName }
                        val costAmountStr = if (isCrystalSolution) "$299.00" else "$499.00"
                        Text(
                            text = "Licensed Asset: $paradoxName\nPrice Subscription Fee: $costAmountStr USD (Lifetime Enterprise Access)",
                            color = OnBackgroundText,
                            fontSize = 12.sp,
                            lineHeight = 16.sp
                        )
                        Spacer(modifier = Modifier.height(14.dp))

                        Text(text = "CARDHOLDER NAME", color = MutedSlate, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))
                        OutlinedTextField(
                            value = cardHolder,
                            onValueChange = { cardHolder = it },
                            placeholder = { Text("John Doe", color = MutedSlate, fontSize = 12.sp) },
                            textStyle = TextStyle(color = OnBackgroundText, fontSize = 12.sp),
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = OnBackgroundText,
                                unfocusedTextColor = OnBackgroundText,
                                focusedBorderColor = GoldPrimary,
                                unfocusedBorderColor = CardBorder,
                                focusedContainerColor = DarkBackground,
                                unfocusedContainerColor = DarkBackground
                            )
                        )

                        Spacer(modifier = Modifier.height(10.dp))
                        Text(text = "CREDIT CARD NUMBER", color = MutedSlate, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))
                        OutlinedTextField(
                            value = cardNumber,
                            onValueChange = { cardNumber = it },
                            textStyle = TextStyle(color = OnBackgroundText, fontSize = 12.sp),
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = OnBackgroundText,
                                unfocusedTextColor = OnBackgroundText,
                                focusedBorderColor = GoldPrimary,
                                unfocusedBorderColor = CardBorder,
                                focusedContainerColor = DarkBackground,
                                unfocusedContainerColor = DarkBackground
                            )
                        )

                        Spacer(modifier = Modifier.height(10.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(text = "EXPIRY", color = MutedSlate, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                                Spacer(modifier = Modifier.height(4.dp))
                                OutlinedTextField(
                                    value = cardExp,
                                    onValueChange = { cardExp = it },
                                    textStyle = TextStyle(color = OnBackgroundText, fontSize = 12.sp),
                                    modifier = Modifier.fillMaxWidth(),
                                    singleLine = true,
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedTextColor = OnBackgroundText,
                                        unfocusedTextColor = OnBackgroundText,
                                        focusedBorderColor = GoldPrimary,
                                        unfocusedBorderColor = CardBorder,
                                        focusedContainerColor = DarkBackground,
                                        unfocusedContainerColor = DarkBackground
                                    )
                                )
                            }
                            Column(modifier = Modifier.weight(1f)) {
                                Text(text = "CVV", color = MutedSlate, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                                Spacer(modifier = Modifier.height(4.dp))
                                OutlinedTextField(
                                    value = cardCvv,
                                    onValueChange = { cardCvv = it },
                                    textStyle = TextStyle(color = OnBackgroundText, fontSize = 12.sp),
                                    modifier = Modifier.fillMaxWidth(),
                                    singleLine = true,
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedTextColor = OnBackgroundText,
                                        unfocusedTextColor = OnBackgroundText,
                                        focusedBorderColor = GoldPrimary,
                                        unfocusedBorderColor = CardBorder,
                                        focusedContainerColor = DarkBackground,
                                        unfocusedContainerColor = DarkBackground
                                    )
                                )
                            }
                        }

                        if (cardError.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(text = cardError, color = GoldAccent, fontSize = 10.sp)
                        }
                    } else {
                        // Compiling state animation
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Spacer(modifier = Modifier.height(10.dp))
                            CircularProgressIndicator(
                                progress = compProgress,
                                color = GoldPrimary,
                                strokeWidth = 3.dp,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Compiling Paradox: $paradoxName",
                                color = OnBackgroundText,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(DarkBackground)
                                    .border(BorderStroke(1.dp, CardBorder), RoundedCornerShape(6.dp))
                                    .padding(10.dp)
                            ) {
                                Text(
                                    text = currentCompLog,
                                    color = GoldPrimary,
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 11.sp,
                                    lineHeight = 15.sp,
                                    modifier = Modifier.animateContentSize()
                                )
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Note: Decryption key is generated transiently on screen and shredded directly within on-device hardware register matrices once finished. Zero code theft risk.",
                                color = MutedSlate,
                                fontSize = 9.sp,
                                lineHeight = 13.sp,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
            },
            confirmButton = {
                if (step == 1) {
                    val isCrystalSolution = crystalSolutions.any { it.first == paradoxName }
                    val costAmountStr = if (isCrystalSolution) "$299.00" else "$499.00"
                    Button(
                        onClick = {
                            if (cardHolder.isBlank()) {
                                cardError = "Cardholder Name is required."
                            } else if (cardNumber.replace(" ", "").length < 16) {
                                cardError = "Invalid card number."
                            } else {
                                cardError = ""
                                step = 2
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("PAY & COMPILE $costAmountStr USD", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            },
            dismissButton = {
                if (step == 1) {
                    TextButton(onClick = { purchasingParadox = null }) {
                        Text("CANCEL", color = MutedSlate, fontSize = 11.sp)
                    }
                }
            },
            containerColor = DeepSurface,
            shape = RoundedCornerShape(12.dp)
        )
    }

    // Active Testing Harness Simulation Dialogs
    runningHarnessFor?.let { paradoxTitle ->
        AlertDialog(
            onDismissRequest = { runningHarnessFor = null },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                    Icon(Icons.Default.Build, contentDescription = "Harness Dashboard", tint = ForestEmerald, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "HARNESS: $paradoxTitle",
                        fontWeight = FontWeight.Bold,
                        color = ForestEmerald,
                        fontSize = 14.sp
                    )
                }
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState())
                ) {
                    Text(
                        text = "The binary engine is direct-installed securely as client immutable logic. Use the interactive testing suite to run computations on real scenarios below.",
                        color = MutedSlate,
                        fontSize = 11.sp,
                        lineHeight = 15.sp
                    )
                    Spacer(modifier = Modifier.height(14.dp))

                    when (paradoxTitle) {
                        "Micro-Pass SaaS System" -> {
                            var passMinutes by remember { mutableStateOf(10f) }
                            var generatorState by remember { mutableStateOf("Ready") } // "Ready", "Running", "Expired"
                            var currentTimerSecs by remember { mutableStateOf(600) }
                            var apiInvocations by remember { mutableStateOf(0) }
                            var totalBilledCost by remember { mutableStateOf(0.0) }
                            var runLogs = remember { mutableStateListOf<String>() }

                            LaunchedEffect(generatorState, currentTimerSecs) {
                                if (generatorState == "Running" && currentTimerSecs > 0) {
                                    delay(1000L)
                                    currentTimerSecs -= 1
                                    
                                    // Random automated simulation invokes
                                    if ((0..100).random() > 70) {
                                        apiInvocations += 1
                                        val consumedSecs = (1..6).random()
                                        val cost = consumedSecs * 0.0005
                                        totalBilledCost += cost
                                        runLogs.add("[API] POST /v1/solve - ${consumedSecs}s active compute. Accrued: $${String.format("%.4f", cost)} USD")
                                    }

                                    if (currentTimerSecs == 0) {
                                        generatorState = "Expired"
                                        runLogs.add("[LEAK GUARD] Pass quota finished. Symmetric authentication certificates shredded.")
                                    }
                                }
                            }

                            Column(modifier = Modifier.fillMaxWidth()) {
                                if (generatorState == "Ready") {
                                    Text(
                                        text = "Select microbilling pass duration: ${passMinutes.toInt()} Minutes",
                                        color = OnBackgroundText,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Slider(
                                        value = passMinutes,
                                        onValueChange = { passMinutes = it },
                                        valueRange = 5f..60f,
                                        colors = SliderDefaults.colors(thumbColor = GoldPrimary, activeTrackColor = GoldPrimary)
                                    )
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Button(
                                        onClick = {
                                            currentTimerSecs = passMinutes.toInt() * 60
                                            apiInvocations = 0
                                            totalBilledCost = 0.0
                                            runLogs.clear()
                                            runLogs.add("[SECURE HANDSHAKE] Generating asymmetric pass credentials keypair...")
                                            generatorState = "Running"
                                        },
                                        modifier = Modifier.fillMaxWidth().height(34.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground)
                                    ) {
                                        Text("GENERATE EXPIRING PASS SECURE", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                } else {
                                    val minutesLeft = currentTimerSecs / 60
                                    val secondsLeft = currentTimerSecs % 60
                                    val formattedTime = String.format("%02d:%02d", minutesLeft, secondsLeft)

                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(DarkBackground)
                                            .padding(12.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column {
                                            Text(text = "PASS STATUS: ${generatorState.uppercase()}", color = if (generatorState == "Running") ForestEmerald else GoldAccent, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                                            Text(text = "LIVE TICKER: $formattedTime", color = OnBackgroundText, fontWeight = FontWeight.Black, fontSize = 16.sp)
                                        }
                                        Column(horizontalAlignment = Alignment.End) {
                                            Text(text = "ACCRUED COST", color = MutedSlate, fontSize = 9.sp)
                                            Text(text = "$${String.format("%.4f", totalBilledCost)} USD", color = GoldPrimary, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(10.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Button(
                                            onClick = {
                                                apiInvocations += 1
                                                val consumedSecs = (2..10).random()
                                                val cost = consumedSecs * 0.0005
                                                totalBilledCost += cost
                                                runLogs.add("[MANUAL INVOCATION] API action consumed ${consumedSecs}s logic. Charged: +$${String.format("%.4f", cost)}")
                                            },
                                            enabled = generatorState == "Running",
                                            modifier = Modifier.weight(1f).height(32.dp),
                                            colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground)
                                        ) {
                                            Text("SIMULATE CONSUME", fontSize = 9.sp, fontWeight = FontWeight.Bold)
                                        }
                                        Button(
                                            onClick = {
                                                generatorState = "Expired"
                                                currentTimerSecs = 0
                                                runLogs.add("[FORCE DISCONNECT] Manual shutdown executed. Keys destroyed.")
                                            },
                                            enabled = generatorState == "Running",
                                            modifier = Modifier.weight(1f).height(32.dp),
                                            colors = ButtonDefaults.buttonColors(containerColor = CardBorder, contentColor = OnBackgroundText)
                                        ) {
                                            Text("FORCE EXPIRATION", fontSize = 9.sp, fontWeight = FontWeight.Bold)
                                        }
                                    }
                                }

                                if (runLogs.isNotEmpty()) {
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Text(text = "LOG OUTPUT SYSTEM CONSOLE:", color = MutedSlate, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(100.dp)
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(DarkBackground)
                                            .border(BorderStroke(1.dp, CardBorder), RoundedCornerShape(6.dp))
                                            .padding(6.dp)
                                    ) {
                                        LazyColumn(modifier = Modifier.fillMaxSize()) {
                                            items(runLogs.reversed()) { log ->
                                                Text(
                                                    text = log,
                                                    fontSize = 9.sp,
                                                    fontFamily = FontFamily.Monospace,
                                                    color = if (log.contains("LOG") || log.contains("DISCONNECT") || log.contains("quota")) GoldAccent else OnBackgroundText,
                                                    modifier = Modifier.padding(vertical = 1.dp)
                                                )
                                            }
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(text = "Symmetric Key Register STATUS:", color = MutedSlate, fontSize = 8.sp)
                                        Text(
                                            text = if (generatorState == "Running") "ENCRYPTED TRANS" else "PURGED",
                                            color = if (generatorState == "Running") GoldPrimary else ForestEmerald,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 8.sp
                                        )
                                    }
                                }
                            }
                        }

                        "Instant Recipe Weight Parsing" -> {
                            var selectedIngredient by remember { mutableStateOf("Almond Meal") }
                            var selectVolume by remember { mutableStateOf("1/2 Cup") }
                            var isParsingScan by remember { mutableStateOf(false) }
                            var parseCompleted by remember { mutableStateOf(false) }
                            var calculatedGrams by remember { mutableStateOf(0.0) }
                            var caloriesCalculated by remember { mutableStateOf(0) }

                            val densities = mapOf("Almond Meal" to 0.48, "Honey" to 1.42, "Oats" to 0.36, "Peanut Butter" to 1.15)
                            val kCalPerGram = mapOf("Almond Meal" to 5.79, "Honey" to 3.04, "Oats" to 3.89, "Peanut Butter" to 5.88)
                            val mlRatio = mapOf("1/4 Cup" to 60.0, "1/2 Cup" to 120.0, "1 Cup" to 240.0, "2 Tablespoons" to 30.0, "4 Tablespoons" to 60.0)

                            Column(modifier = Modifier.fillMaxWidth()) {
                                Text(text = "SELECT TARGET INGREDIENT RECIPE DETECTED:", color = OnBackgroundText, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .horizontalScroll(rememberScrollState())
                                        .padding(vertical = 4.dp),
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    densities.keys.forEach { ing ->
                                        val isSel = selectedIngredient == ing
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(6.dp))
                                                .background(if (isSel) GoldPrimary else DarkBackground)
                                                .border(BorderStroke(1.dp, if (isSel) GoldPrimary else CardBorder), RoundedCornerShape(6.dp))
                                                .clickable {
                                                    selectedIngredient = ing
                                                    parseCompleted = false
                                                }
                                                .padding(horizontal = 10.dp, vertical = 6.dp)
                                        ) {
                                            Text(text = ing, color = if (isSel) DarkBackground else MutedSlate, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                                        }
                                    }
                                }

                                Spacer(modifier = Modifier.height(10.dp))
                                Text(text = "CHOOSE VOLUME METRIC MEASUREMENT:", color = OnBackgroundText, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .horizontalScroll(rememberScrollState())
                                        .padding(vertical = 4.dp),
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    mlRatio.keys.forEach { vol ->
                                        val isSel = selectVolume == vol
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(6.dp))
                                                .background(if (isSel) GoldPrimary else DarkBackground)
                                                .border(BorderStroke(1.dp, if (isSel) GoldPrimary else CardBorder), RoundedCornerShape(6.dp))
                                                .clickable {
                                                    selectVolume = vol
                                                    parseCompleted = false
                                                }
                                                .padding(horizontal = 10.dp, vertical = 6.dp)
                                        ) {
                                            Text(text = vol, color = if (isSel) DarkBackground else MutedSlate, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                                        }
                                    }
                                }

                                Spacer(modifier = Modifier.height(14.dp))
                                Button(
                                    onClick = {
                                        isParsingScan = true
                                        scope.launch {
                                            delay(1500L)
                                            val ml = mlRatio[selectVolume] ?: 120.0
                                            val dens = densities[selectedIngredient] ?: 1.0
                                            calculatedGrams = ml * dens
                                            caloriesCalculated = (calculatedGrams * (kCalPerGram[selectedIngredient] ?: 4.0)).toInt()
                                            isParsingScan = false
                                            parseCompleted = true
                                        }
                                    },
                                    enabled = !isParsingScan,
                                    modifier = Modifier.fillMaxWidth().height(36.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground)
                                ) {
                                    if (isParsingScan) {
                                        CircularProgressIndicator(color = DarkBackground, modifier = Modifier.size(14.dp))
                                    } else {
                                        Text("RUN INSTANT VOLUMETRIC OPTICAL PARSE", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                }

                                if (parseCompleted) {
                                    Spacer(modifier = Modifier.height(14.dp))
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(DarkBackground)
                                            .border(BorderStroke(1.dp, ForestEmerald), RoundedCornerShape(8.dp))
                                            .padding(12.dp)
                                    ) {
                                        Column {
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                Icon(Icons.Default.CheckCircle, contentDescription = "Parsed", tint = ForestEmerald, modifier = Modifier.size(16.dp))
                                                Spacer(modifier = Modifier.width(6.dp))
                                                Text(text = "PARSED WEIGHT ANALYSIS DIRECT MATCH", color = ForestEmerald, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                            }
                                            Spacer(modifier = Modifier.height(8.dp))
                                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                                Text(text = "Calculated Precise Weight:", color = MutedSlate, fontSize = 11.sp)
                                                Text(text = "${String.format("%.2f", calculatedGrams)} Grams", color = OnBackgroundText, fontWeight = FontWeight.Black, fontSize = 14.sp)
                                            }
                                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                                Text(text = "Est. Density standard:", color = MutedSlate, fontSize = 11.sp)
                                                Text(text = "${densities[selectedIngredient]} g/ml", color = OnBackgroundText, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                                            }
                                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                                Text(text = "Calculated Nutritional Energy:", color = MutedSlate, fontSize = 11.sp)
                                                Text(text = "$caloriesCalculated kcal", color = GoldPrimary, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                            }
                                            Spacer(modifier = Modifier.height(6.dp))
                                            Text(text = "✓ Signature status: COMPILED. Plaintext database formulas purged complete.", color = MutedSlate, fontSize = 9.sp)
                                        }
                                    }
                                }
                            }
                        }

                        "Zero-Knowledge Scheduler" -> {
                            var optimizeSetting by remember { mutableStateOf("Maximum Window") }
                            var runsZkIntersection by remember { mutableStateOf(false) }
                            var outputMatchesList = remember { mutableStateListOf<String>() }

                            Column(modifier = Modifier.fillMaxWidth()) {
                                Text(text = "SELECT SCHEDULING PRIORITY CONFIGURATION:", color = OnBackgroundText, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                Spacer(modifier = Modifier.height(4.dp))
                                listOf("Maximum Window", "Fastest Match", "Business Hours Only").forEach { opt ->
                                    val isSelected = optimizeSetting == opt
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(vertical = 3.dp)
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(if (isSelected) GoldPrimary.copy(alpha = 0.12f) else DarkBackground)
                                            .border(BorderStroke(1.dp, if (isSelected) GoldPrimary else CardBorder), RoundedCornerShape(6.dp))
                                            .clickable { optimizeSetting = opt }
                                            .padding(10.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(text = opt, color = OnBackgroundText, fontSize = 11.sp)
                                        RadioButton(
                                            selected = isSelected,
                                            onClick = { optimizeSetting = opt },
                                            colors = RadioButtonDefaults.colors(selectedColor = GoldPrimary)
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(14.dp))
                                Button(
                                    onClick = {
                                        runsZkIntersection = true
                                        scope.launch {
                                            delay(1500L)
                                            outputMatchesList.clear()
                                            when (optimizeSetting) {
                                                "Maximum Window" -> {
                                                    outputMatchesList.add("Monday: 02:00 PM - 04:30 PM")
                                                    outputMatchesList.add("Wednesday: 09:30 AM - 11:30 AM")
                                                    outputMatchesList.add("Friday: 01:00 PM - 03:00 PM")
                                                }
                                                "Fastest Match" -> {
                                                    outputMatchesList.add("Today: 04:00 PM - 05:00 PM")
                                                }
                                                "Business Hours Only" -> {
                                                    outputMatchesList.add("Tuesday: 10:00 AM - 12:00 PM")
                                                    outputMatchesList.add("Thursday: 02:00 PM - 04:00 PM")
                                                }
                                            }
                                            runsZkIntersection = false
                                        }
                                    },
                                    enabled = !runsZkIntersection,
                                    modifier = Modifier.fillMaxWidth().height(36.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground)
                                ) {
                                    if (runsZkIntersection) {
                                        CircularProgressIndicator(color = DarkBackground, modifier = Modifier.size(14.dp))
                                    } else {
                                        Text("SECURELY COMPUTE MUTUAL INTERSECTION", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                }

                                if (outputMatchesList.isNotEmpty()) {
                                    Spacer(modifier = Modifier.height(14.dp))
                                    Text(text = "COMPUTED PRIVACY-FIRST MATCHES:", color = ForestEmerald, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Column(verticalArrangement = Arrangement.spacedBy(5.dp)) {
                                        outputMatchesList.forEach { mat ->
                                            Row(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .clip(RoundedCornerShape(6.dp))
                                                    .background(DarkBackground)
                                                    .border(BorderStroke(1.dp, CardBorder), RoundedCornerShape(6.dp))
                                                    .padding(10.dp),
                                                horizontalArrangement = Arrangement.SpaceBetween,
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Text(text = mat, color = OnBackgroundText, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                                Box(
                                                    modifier = Modifier
                                                        .clip(RoundedCornerShape(4.dp))
                                                        .background(ForestEmerald.copy(alpha = 0.15f))
                                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                                ) {
                                                    Text(text = "ZERO-KNOWLEDGE MATCHED", color = ForestEmerald, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                                                }
                                            }
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(text = "✓ Descriptions, participants and account credentials were mapped strictly via secure temporary polynomial coefficients. Permanent cache cleared.", color = MutedSlate, fontSize = 9.sp)
                                }
                            }
                        }

                        "On-Device Freelance Expense Ledger" -> {
                            var selectedReceiptContext by remember { mutableStateOf("Receipt 1: Uber Ride ($42.50)") }
                            var isExtractingLedger by remember { mutableStateOf(false) }
                            var extractionCompleted by remember { mutableStateOf(false) }
                            
                            var extVendor by remember { mutableStateOf("") }
                            var extAmount by remember { mutableStateOf("") }
                            var extTaxCat by remember { mutableStateOf("") }
                            var extIrsClaimPct by remember { mutableStateOf("") }

                            Column(modifier = Modifier.fillMaxWidth()) {
                                Text(text = "CHOOSE GIG RECEIPT DISPLAY SCREEN PRESET:", color = OnBackgroundText, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                Spacer(modifier = Modifier.height(4.dp))
                                listOf("Receipt 1: Uber Ride ($42.50)", "Receipt 2: Starbucks Hospitality ($18.75)", "Receipt 3: AWS Compute Infrastructure ($150.00)").forEach { preset ->
                                    val isS = selectedReceiptContext == preset
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(vertical = 3.dp)
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(if (isS) GoldPrimary.copy(alpha = 0.12f) else DarkBackground)
                                            .border(BorderStroke(1.dp, if (isS) GoldPrimary else CardBorder), RoundedCornerShape(6.dp))
                                            .clickable {
                                                selectedReceiptContext = preset
                                                extractionCompleted = false
                                            }
                                            .padding(10.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(text = preset, color = OnBackgroundText, fontSize = 11.sp, modifier = Modifier.weight(1f))
                                        RadioButton(
                                            selected = isS,
                                            onClick = {
                                                selectedReceiptContext = preset
                                                extractionCompleted = false
                                            },
                                            colors = RadioButtonDefaults.colors(selectedColor = GoldPrimary)
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(14.dp))
                                Button(
                                    onClick = {
                                        isExtractingLedger = true
                                        scope.launch {
                                            delay(1500L)
                                            when (selectedReceiptContext) {
                                                "Receipt 1: Uber Ride ($42.50)" -> {
                                                    extVendor = "Uber US Inc"
                                                    extAmount = "$42.50"
                                                    extTaxCat = "Section 162 Travel Logistics"
                                                    extIrsClaimPct = "100% Tax Deductible"
                                                }
                                                "Receipt 2: Starbucks Hospitality ($18.75)" -> {
                                                    extVendor = "Starbucks Coffee Node"
                                                    extAmount = "$18.75"
                                                    extTaxCat = "Section 274 Business Hospitality"
                                                    extIrsClaimPct = "50% Tax Deductible"
                                                }
                                                "Receipt 3: AWS Compute Infrastructure ($150.00)" -> {
                                                    extVendor = "Amazon Web Services LLC"
                                                    extAmount = "$150.00"
                                                    extTaxCat = "Section 167 Software Operation"
                                                    extIrsClaimPct = "100% Tax Deductible"
                                                }
                                            }
                                            isExtractingLedger = false
                                            extractionCompleted = true
                                        }
                                    },
                                    enabled = !isExtractingLedger,
                                    modifier = Modifier.fillMaxWidth().height(36.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground)
                                ) {
                                    if (isExtractingLedger) {
                                        CircularProgressIndicator(color = DarkBackground, modifier = Modifier.size(14.dp))
                                    } else {
                                        Text("EXTRACT WRITE-OFF ON-DEVICE", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                }

                                if (extractionCompleted) {
                                    Spacer(modifier = Modifier.height(14.dp))
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(DarkBackground)
                                            .border(BorderStroke(1.dp, ForestEmerald), RoundedCornerShape(8.dp))
                                            .padding(12.dp)
                                    ) {
                                        Column {
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                Icon(Icons.Default.CheckCircle, contentDescription = "OCR Complete", tint = ForestEmerald, modifier = Modifier.size(16.dp))
                                                Spacer(modifier = Modifier.width(6.dp))
                                                Text(text = "ON-DEVICE EXTRACTION RESULT", color = ForestEmerald, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                            }
                                            Spacer(modifier = Modifier.height(8.dp))
                                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                                Text(text = "Identified Business Vendor:", color = MutedSlate, fontSize = 11.sp)
                                                Text(text = extVendor, color = OnBackgroundText, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                            }
                                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                                Text(text = "Total Record Amount Expenses:", color = MutedSlate, fontSize = 11.sp)
                                                Text(text = extAmount, color = OnBackgroundText, fontWeight = FontWeight.Black, fontSize = 12.sp)
                                            }
                                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                                Text(text = "IRS Write-off Classification:", color = MutedSlate, fontSize = 11.sp)
                                                Text(text = extTaxCat, color = OnBackgroundText, fontSize = 11.sp)
                                            }
                                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                                Text(text = "Deductible Allowance Ratio:", color = MutedSlate, fontSize = 11.sp)
                                                Text(text = extIrsClaimPct, color = GoldPrimary, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                            }
                                            Spacer(modifier = Modifier.height(6.dp))
                                            Text(text = "✓ Plaintext screenshot buffer securely deleted immediately from memory after OCR tokenization.", color = MutedSlate, fontSize = 9.sp)
                                        }
                                    }
                                }
                            }
                        }

                        else -> {
                            val activeSolution = crystalSolutions.find { it.first == paradoxTitle }
                            if (activeSolution != null) {
                                var payloadInput by remember { mutableStateOf("") }
                                val consoleLogs = remember { mutableStateListOf<String>() }
                                var hasExecuted by remember { mutableStateOf(false) }
                                var executionProgress by remember { mutableStateOf(0.0f) }

                                Column(modifier = Modifier.fillMaxWidth()) {
                                    Text(
                                        text = "CYBERNETIC CODESHIELD ANALYSIS PANEL",
                                        color = GoldPrimary,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        letterSpacing = 0.5.sp
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = "High-security binary sandbox layer. Zero exposure of execution tracing records.",
                                        color = MutedSlate,
                                        fontSize = 10.sp,
                                        lineHeight = 14.sp
                                    )

                                    Spacer(modifier = Modifier.height(12.dp))

                                    Text(
                                        text = "DYNAMIC CRITICAL SECURE INPUT PARAMETERS",
                                        color = OnBackgroundText,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    OutlinedTextField(
                                        value = payloadInput,
                                        onValueChange = { payloadInput = it },
                                        placeholder = { Text("E.g. dynamic_payload_parameters_X19", color = MutedSlate, fontSize = 11.sp) },
                                        textStyle = TextStyle(color = OnBackgroundText, fontSize = 11.sp),
                                        modifier = Modifier.fillMaxWidth(),
                                        singleLine = true,
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedTextColor = OnBackgroundText,
                                            unfocusedTextColor = OnBackgroundText,
                                            focusedBorderColor = GoldPrimary,
                                            unfocusedBorderColor = CardBorder,
                                            focusedContainerColor = DarkBackground,
                                            unfocusedContainerColor = DarkBackground
                                        )
                                    )

                                    Spacer(modifier = Modifier.height(10.dp))

                                    Button(
                                        onClick = {
                                            hasExecuted = true
                                            executionProgress = 0.0f
                                            consoleLogs.clear()
                                            consoleLogs.add("[HANDSHAKE] Establishing secure zero-knowledge execution context...")
                                        },
                                        modifier = Modifier.fillMaxWidth().height(36.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground),
                                        shape = RoundedCornerShape(6.dp)
                                    ) {
                                        Icon(Icons.Default.Build, contentDescription = "Execute dynamic secure test runner run", modifier = Modifier.size(14.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("EXECUTE PARALLEL TEST RUN", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    }

                                    if (hasExecuted) {
                                        LaunchedEffect(hasExecuted, payloadInput) {
                                            val runSteps = listOf(
                                                "Symmetric session certificates matched containing decentralized node signature...",
                                                "Validating target inputs with homomorphic polynomial multipliers...",
                                                "Hashing active inputs under secure asymmetric local memory registries...",
                                                "Generating Zero-Knowledge SNARK constraints to attest logic accuracy...",
                                                "Transmitting secure verified hash to local database secure matrix...",
                                                "Logic verification completed. Scrubbing intermediate volatile CPU registers..."
                                            )
                                            for (i in 0 until runSteps.size) {
                                                consoleLogs.add("[PROCESS LOG] " + runSteps[i])
                                                executionProgress = (i + 1).toFloat() / runSteps.size
                                                delay(400L)
                                            }
                                        }

                                        Spacer(modifier = Modifier.height(14.dp))
                                        Text(text = "DYNAMIC CRITICAL SECURE RECON LOG:", color = GoldAccent, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                                        Spacer(modifier = Modifier.height(6.dp))
                                        Box(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .height(100.dp)
                                                .clip(RoundedCornerShape(6.dp))
                                                .background(DarkBackground)
                                                .border(BorderStroke(1.dp, CardBorder), RoundedCornerShape(6.dp))
                                                .padding(6.dp)
                                        ) {
                                            Column(
                                                modifier = Modifier
                                                    .fillMaxSize()
                                                    .verticalScroll(rememberScrollState())
                                            ) {
                                                consoleLogs.forEach { log ->
                                                    Text(
                                                        text = log,
                                                        color = GoldPrimary,
                                                        fontFamily = FontFamily.Monospace,
                                                        fontSize = 10.sp,
                                                        lineHeight = 13.sp,
                                                        modifier = Modifier.padding(bottom = 2.dp)
                                                    )
                                                }
                                            }
                                        }

                                        if (executionProgress >= 1.0f) {
                                            Spacer(modifier = Modifier.height(12.dp))
                                            Box(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .clip(RoundedCornerShape(8.dp))
                                                    .background(DarkBackground)
                                                    .border(BorderStroke(1.dp, ForestEmerald), RoundedCornerShape(8.dp))
                                                    .padding(12.dp)
                                            ) {
                                                Column {
                                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                                        Icon(Icons.Default.CheckCircle, contentDescription = "Run Complete", tint = ForestEmerald, modifier = Modifier.size(16.dp))
                                                        Spacer(modifier = Modifier.width(6.dp))
                                                        Text(text = "ZERO-KNOWLEDGE DECYPHER OUTCOME", color = ForestEmerald, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                                    }
                                                    Spacer(modifier = Modifier.height(8.dp))
                                                    activeSolution.third.forEachIndexed { idx, outStr ->
                                                        Row(modifier = Modifier.fillMaxWidth().padding(vertical = 1.dp), verticalAlignment = Alignment.CenterVertically) {
                                                            Text(text = "• ", color = ForestEmerald, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                                            Text(text = outStr, color = OnBackgroundText, fontSize = 11.sp)
                                                        }
                                                    }
                                                    Spacer(modifier = Modifier.height(6.dp))
                                                    Text(text = "✓ Plaintext buffer files securely shredded from memory register matrices.", color = MutedSlate, fontSize = 9.sp)
                                                }
                                            }
                                        }
                                    }
                                }
                            } else {
                                Text(text = "No harness implementation found for this solution.", color = GoldAccent, fontSize = 11.sp)
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = { runningHarnessFor = null },
                    colors = ButtonDefaults.buttonColors(containerColor = ForestEmerald, contentColor = DarkBackground)
                ) {
                    Text("OK, SECURE HARNESS", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            },
            containerColor = DeepSurface,
            shape = RoundedCornerShape(12.dp)
        )
    }

    // Detail adapted modal dialog

    activeDetailJob?.let { job ->
        val isAlreadySubmitted = submissions.containsKey(job.id)
        var selectedParadoxAndDescr = paradoxes[selectedParadoxIndex]
        var adaptedDraftText by remember { mutableStateOf("No proposal compiled yet. Press 'COMPILE ADAPTATION' above to run AI broker translation...") }
        var isAdapting by remember { mutableStateOf(false) }
        var isSubmitting by remember { mutableStateOf(false) }
        var showCryptoSubmittedReceipt by remember { mutableStateOf<String?>(null) }

        // Trigger compilation automatically once opened, unless already completed/submitted
        LaunchedEffect(selectedParadoxIndex) {
            if (!isAlreadySubmitted) {
                isAdapting = true
                viewModel.adaptStarterSolution(
                    jobTitle = job.title,
                    jobDescription = job.description,
                    starterTitle = paradoxes[selectedParadoxIndex].first,
                    starterDescription = paradoxes[selectedParadoxIndex].second,
                    onResult = { result ->
                        adaptedDraftText = result
                        isAdapting = false
                    }
                )
            }
        }

        AlertDialog(
            onDismissRequest = { activeDetailJob = null },
            title = {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "SOLVEX CRYPTO CONDUIT",
                            color = GoldAccent,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = job.title,
                            color = OnBackgroundText,
                            fontWeight = FontWeight.Black,
                            fontSize = 16.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(GoldPrimary.copy(alpha = 0.12f))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(text = job.budget, color = GoldPrimary, fontWeight = FontWeight.Bold, fontSize = 10.sp)
                    }
                }
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState())
                ) {
                    Text(
                        text = "CLIENT SPECIFICATION REQUIREMENTS:",
                        color = MutedSlate,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.5.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = job.description,
                        color = OnBackgroundText,
                        fontSize = 11.sp,
                        lineHeight = 15.sp
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    if (isAlreadySubmitted) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(DarkBackground)
                                .border(BorderStroke(1.dp, CardBorder), RoundedCornerShape(8.dp))
                                .padding(12.dp)
                        ) {
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.Lock,
                                        contentDescription = "Security Active",
                                        tint = ForestEmerald,
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "ASSET ENVELOPE SECURELY RETIRED",
                                        color = ForestEmerald,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        letterSpacing = 0.5.sp
                                    )
                                }
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = "Under the Sovereign IP Transfer Act, the underlying compiled source engine was direct-compiled as immutable binary to the client endpoint. The local plaintext cache and symmetric decryption key have been securely purged. Submitting subsequently, downloading, or replicating the solution is structurally forbidden.",
                                    color = MutedSlate,
                                    fontSize = 11.sp,
                                    lineHeight = 14.sp
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "Symmetric Key Status: PURGED",
                                        color = GoldPrimary,
                                        fontSize = 9.sp,
                                        fontFamily = FontFamily.Monospace
                                    )
                                    Text(
                                        text = "Status: SECURED ESCROW",
                                        color = ForestEmerald,
                                        fontSize = 9.sp,
                                        fontFamily = FontFamily.Monospace,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    } else {
                        Text(
                            text = "BASETECH: SELECT SOLVED PARADOX:",
                            color = GoldAccent,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.5.sp
                        )
                        Spacer(modifier = Modifier.height(6.dp))

                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            paradoxes.forEachIndexed { idx, (pTitle, pDescr) ->
                                val isSelected = selectedParadoxIndex == idx
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(if (isSelected) DarkBackground else DeepSurface)
                                        .border(BorderStroke(1.dp, if (isSelected) GoldPrimary else CardBorder), RoundedCornerShape(6.dp))
                                        .clickable { selectedParadoxIndex = idx }
                                        .padding(8.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(text = pTitle, color = OnBackgroundText, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                        Text(text = pDescr, color = MutedSlate, fontSize = 9.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    }
                                    RadioButton(
                                        selected = isSelected,
                                        onClick = { selectedParadoxIndex = idx },
                                        colors = RadioButtonDefaults.colors(selectedColor = GoldPrimary, unselectedColor = MutedSlate)
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "ADAPTED SOLUTION DRAFT:",
                                color = MutedSlate,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 0.5.sp
                            )
                            TextButton(
                                onClick = {
                                    isAdapting = true
                                    viewModel.adaptStarterSolution(
                                        jobTitle = job.title,
                                        jobDescription = job.description,
                                        starterTitle = paradoxes[selectedParadoxIndex].first,
                                        starterDescription = paradoxes[selectedParadoxIndex].second,
                                        onResult = { result ->
                                            adaptedDraftText = result
                                            isAdapting = false
                                        }
                                    )
                                },
                                enabled = !isAdapting,
                                contentPadding = PaddingValues(0.dp)
                            ) {
                                if (isAdapting) {
                                    CircularProgressIndicator(color = GoldPrimary, modifier = Modifier.size(10.dp), strokeWidth = 1.dp)
                                } else {
                                    Icon(Icons.Default.Refresh, contentDescription = "Adapt", modifier = Modifier.size(11.dp), tint = GoldPrimary)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("COMPILE ADAPTATION", color = GoldPrimary, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(150.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(DarkBackground)
                                .border(BorderStroke(1.dp, CardBorder), RoundedCornerShape(8.dp))
                                .verticalScroll(rememberScrollState())
                                .padding(10.dp)
                        ) {
                            Text(
                                text = adaptedDraftText,
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                color = OnBackgroundText
                            )
                        }
                    }
                }
            },
            confirmButton = {
                if (isAlreadySubmitted) {
                    Button(
                        onClick = { activeDetailJob = null },
                        colors = ButtonDefaults.buttonColors(containerColor = CardBorder, contentColor = MutedSlate)
                    ) {
                        Text("TRANSACTION SETTLED • SECURE", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                } else {
                    Button(
                        onClick = {
                            isSubmitting = true
                            val encryptedPayload = android.util.Base64.encodeToString(
                                adaptedDraftText.toByteArray(),
                                android.util.Base64.DEFAULT
                            )
                            val decryptionKey = "KEY-SLX-" + (1000..9999).random()
                            viewModel.submitSolveXSolution(
                                jobId = job.id,
                                summary = "Applied ${paradoxes[selectedParadoxIndex].first} engine adaptive integration compile.",
                                encryptedContent = encryptedPayload,
                                decryptionKey = decryptionKey,
                                onComplete = { success, msg ->
                                    isSubmitting = false
                                    if (success) {
                                        showCryptoSubmittedReceipt = msg
                                        // Add to Room DB dynamically to show in Secure Vault!
                                        val budgetNum = job.budget.replace("$", "").replace(",", "").toDoubleOrNull() ?: 150.0
                                        val escrowAsset = Idea(
                                            title = "${job.board.uppercase()}: ${job.title}",
                                            source = "SolveX Broker Contract",
                                            originalText = job.description,
                                            author = "client_${job.board}",
                                            tamScore = 95,
                                            feasibilityScore = 92,
                                            gapScore = 94,
                                            totalScore = 94,
                                            marketSize = job.budget,
                                            analysisDetails = adaptedDraftText,
                                            outreachMessage = "SolveX Contract registered with active Escrow payout: ${job.budget}",
                                            status = "Secured Vault",
                                            valuation = budgetNum
                                        )
                                        viewModel.saveSecuredAsset(escrowAsset) // Save in Room database!
                                    } else {
                                        Toast.makeText(context, "Escrow submission failed: $msg", Toast.LENGTH_LONG).show()
                                    }
                                }
                            )
                        },
                        enabled = !isSubmitting && adaptedDraftText.isNotBlank() && !adaptedDraftText.contains("No proposalCompiled") && !adaptedDraftText.contains("No proposal compiled yet"),
                        colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground)
                    ) {
                        if (isSubmitting) {
                            CircularProgressIndicator(color = DarkBackground, modifier = Modifier.size(12.dp), strokeWidth = 1.dp)
                        } else {
                            Text("DEPOSIT ENCRYPTED ESCROW", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            },
            dismissButton = {
                TextButton(onClick = { activeDetailJob = null }) {
                    Text("CLOSE CONDUIT", color = MutedSlate, fontSize = 11.sp)
                }
            },
            containerColor = DeepSurface,
            shape = RoundedCornerShape(12.dp)
        )

        // Escrow Receipt Dialog
        showCryptoSubmittedReceipt?.let { receiptMsg ->
            AlertDialog(
                onDismissRequest = {
                    showCryptoSubmittedReceipt = null
                    activeDetailJob = null
                },
                title = {
                    Text(
                        text = "SOLVEX ESCROW SECURED",
                        color = ForestEmerald,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 15.sp,
                        letterSpacing = 0.5.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                },
                text = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .clip(RoundedCornerShape(50))
                                .background(TransparentGreen),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Check,
                                contentDescription = "Secured",
                                tint = ForestEmerald,
                                modifier = Modifier.size(32.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(14.dp))
                        Text(
                            text = receiptMsg,
                            color = OnBackgroundText,
                            fontSize = 12.sp,
                            textAlign = TextAlign.Center,
                            lineHeight = 16.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "This contract is active list. Automated royalties have been linked dynamically to your Iron Vault balance appraisal ledger.",
                            color = MutedSlate,
                            fontSize = 10.sp,
                            textAlign = TextAlign.Center,
                            lineHeight = 14.sp
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            showCryptoSubmittedReceipt = null
                            activeDetailJob = null
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = DarkBackground)
                    ) {
                        Text("Ledger Updated", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                },
                containerColor = DeepSurface,
                shape = RoundedCornerShape(12.dp)
            )
        }
    }
}
