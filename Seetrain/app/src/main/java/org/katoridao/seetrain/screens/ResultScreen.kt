package org.katoridao.seetrain.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import org.katoridao.seetrain.ui.components.MediaImagePreviewCard
import org.katoridao.seetrain.ui.components.MediaVideoPlayerCard
import org.katoridao.seetrain.utils.DownloadUtils

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResultScreen(
    videoUrl: String?,
    infographicUrl: String?,
    onBack: () -> Unit
) {
    val context = LocalContext.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Training Material") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            // Video Section
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Movie,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary
                        )
                        Text(
                            text = "Training Video",
                            style = MaterialTheme.typography.titleLarge
                        )
                    }

                    if (!videoUrl.isNullOrBlank()) {
                        IconButton(onClick = {
                            DownloadUtils.downloadFile(context, videoUrl, "Training_Video", ".mp4")
                        }) {
                            Icon(
                                imageVector = Icons.Default.Download,
                                contentDescription = "Download Video",
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }

                MediaVideoPlayerCard(
                    videoUrl = videoUrl,
                    title = "Training Video"
                )
            }

            HorizontalDivider()

            // Infographic Section
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Image,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary
                        )
                        Text(
                            text = "Infographic",
                            style = MaterialTheme.typography.titleLarge
                        )
                    }

                    if (!infographicUrl.isNullOrBlank()) {
                        IconButton(onClick = {
                            DownloadUtils.downloadFile(context, infographicUrl, "Training_Infographic", ".png")
                        }) {
                            Icon(
                                imageVector = Icons.Default.Download,
                                contentDescription = "Download Infographic",
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }

                MediaImagePreviewCard(
                    imageUrl = infographicUrl,
                    title = "Training Infographic"
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

        }
    }
}
