# SeeTrain

SeeTrain is an Android application that turns PDF, DOC, DOCX, and text training documents into polished learning materials. A Kotlin Jetpack Compose client sends the source document to an Express backend; the backend extracts and organizes the content, then generates a narrated MP4 video and an infographic.

The generated video and infographic are stored in Supabase, while job status and history are retrieved through REST APIs from the Android app.

## Project Showcase

| Experience | Description |
|---|---|
| Document upload | Choose a supported document from the Android Storage Access Framework picker |
| AI lesson planning | Convert source text into concise, structured training sections |
| AI illustrations | Generate visuals for each section |
| Training video | Add narration and section titles, then encode the final MP4 |
| Infographic | Render a portrait PNG from the same training content |
| Job progress | Show processing stages while Android polls for updates |
| History | Review completed materials and reopen or download their outputs |
| Result viewer | Preview videos and infographics in full-screen dialogs |

## System Overview

```mermaid
flowchart LR
    User["Android user"] --> Compose["Jetpack Compose UI"]
    Compose --> VM["ViewModels + StateFlow"]
    VM --> Repo["Repository layer"]
    Repo --> Retrofit["Retrofit REST client"]
    Retrofit --> API["Express 5 API"]

    API --> Upload["Multer upload validation"]
    Upload --> Extract["Document extraction"]
    Extract --> Groq["Groq content planning"]
    Groq --> Stability["Stability AI illustrations"]
    Stability --> Eleven["ElevenLabs narration"]
    Stability --> Sharp["Sharp slide rendering"]
    Eleven --> FFmpeg["FFmpeg MP4 encoding"]
    Sharp --> FFmpeg
    Stability --> Browser["Puppeteer infographic rendering"]

    API --> Supabase["Supabase Storage + jobs table"]
    FFmpeg --> Supabase
    Browser --> Supabase
    Supabase --> API
    API --> Retrofit
    Retrofit --> Compose
```

## Components

### Android application

The `Seetrain` module is a native Android application built with:

- Kotlin 2.2
- Jetpack Compose Material 3
- Android Material components
- Navigation Compose
- Lifecycle ViewModels and StateFlow
- Retrofit and Gson
- OkHttp
- Coil 3 for image loading
- Media3 ExoPlayer for video playback
- Android DownloadManager for file downloads
- Coroutines

Main app features:

- Select PDF, DOC, DOCX, or TXT files
- Upload through multipart HTTP requests
- Poll the backend every three seconds until a job succeeds or fails
- Display a processing overlay while generation is running
- Preview and download the generated MP4
- Preview and download the generated PNG
- Browse globally completed jobs through the history screen

### Backend service

The `Seetrain_BE` module is an Express CommonJS service responsible for:

- Upload validation and document storage
- PDF, DOC, DOCX, and text extraction
- AI training-content planning
- Job status persistence
- Illustration, narration, video, and infographic generation
- Supabase uploads and signed URL delivery
- Job history lookup
- Optional D-ID connection testing

The backend accepts documents up to 20 MB and returns HTTP `202 Accepted` with a UUID after creating a job.

### Data and storage

Supabase provides:

- The `jobs` database table
- The private `seetrain-files` storage bucket
- Original document storage
- Generated MP4 storage
- Generated PNG storage
- One-hour signed URLs for client access

## Processing Flow

1. The user selects a document in the Android app.
2. Android reads the document metadata and bytes, then sends it as multipart form data.
3. Multer validates the format and size.
4. The backend creates a Supabase job and stores the original file.
5. The document extractor converts the source into plain text.
6. Groq plans exactly 3 or 4 educational sections with headings, key points, narration, and visual concepts.
7. Stability AI creates an illustration for every section.
8. ElevenLabs creates narration audio for each section.
9. Sharp renders slide content while FFmpeg joins narrated sections into one MP4.
10. Puppeteer renders the infographic HTML and exports it as PNG.
11. The backend uploads both generated files and marks the job `completed`.
12. Android receives one-hour signed URLs, displays the result, and can download the media.

## AI Tools and Services

| Service | Project usage |
|---|---|
| Groq | Creates strict, structured training content from extracted text using `openai/gpt-oss-20b` |
| Stability AI | Generates educational illustrations for video slides and the infographic |
| ElevenLabs | Generates section narration audio |
| FFmpeg | Combines narration and slide content into the final MP4 |
| Sharp | Resizes images and composites titles and key points |
| Puppeteer | Renders infographic HTML in Chromium and exports PNG |
| Google Gemini | Auxiliary script-generation module; not the primary upload pipeline |
| D-ID | Auxiliary connection, presenter, and clip modules; not the primary video pipeline |

The main upload pipeline uses Groq, Stability AI, ElevenLabs, FFmpeg, Sharp, and Puppeteer. Gemini, D-ID, and Google Cloud Text-to-Speech integration code are present as auxiliary capabilities but are not required by the standard document-generation flow.

## Repository Structure

```text
Seetrain_App/
├── Seetrain/                  # Android application
│   ├── app/src/main/java/
│   │   └── org/katoridao/seetrain/
│   │       ├── data/          # Models, Retrofit APIs, repositories
│   │       ├── navigation/    # Compose navigation
│   │       ├── screens/       # Home, history, and result screens
│   │       ├── ui/            # Theme and reusable media components
│   │       ├── utils/         # Android download helpers
│   │       └── viewmodel/     # Upload and history state management
│   └── app/build.gradle.kts
│
├── Seetrain_BE/               # Express backend
│   ├── src/
│   │   ├── config/            # Supabase and auxiliary AI configuration
│   │   ├── routes/            # HTTP routes
│   │   └── services/          # Extraction, generation, and storage services
│   ├── package.json
│   └── README.md
│
└── README.md                  # Project-wide showcase documentation
```

## Android Setup

### Requirements

- Android Studio with current Android SDK support
- JDK 11 or later
- Android emulator or physical device with API 30+
- The backend running and reachable from the device

### Run the Android app

```bash
cd Seetrain
```

Open the `Seetrain` folder in Android Studio, sync Gradle, select a device, and run the app.

The REST base URL is currently configured in:

```text
Seetrain/app/src/main/java/org/katoridao/seetrain/data/remote/RetrofitClient.kt
```

Before running on a physical device, replace the current LAN IP with the backend machine's reachable IPv4 address:

```kotlin
private const val BASE_URL = "http://YOUR_BACKEND_IP:3000/"
```

The app also permits cleartext HTTP because the current local development configuration uses it. Production builds should use HTTPS.

## Backend Setup

### Requirements

- Node.js 20 or later recommended
- npm
- Supabase project
- API credentials for Groq, Stability AI, and ElevenLabs

### Install and run

```bash
cd Seetrain_BE
npm install
npm start
```

For auto-restart development:

```bash
npm run dev
```

The backend listens on port `3000` by default. Create a `.env` file based on the following variable names:

```env
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-server-side-key
GROQ_API_KEY=your-groq-key
STABILITY_API_KEY=your-stability-key
ELEVENLABS_API_KEY=your-elevenlabs-key
ELEVENLABS_VOICE_ID=your-elevenlabs-voice-id
ELEVENLABS_MODEL_ID=eleven_multilingual_v2

# Optional auxiliary integrations
GEMINI_API_KEY=your-gemini-key
DID_API_KEY=your-did-key
DID_PRESENTER_ID=your-did-presenter-id
```

Never commit real values or expose server secrets in the Android application.

## Supabase Setup

Create:

- A private storage bucket named `seetrain-files`
- A `jobs` table with job status, messages, document metadata, extracted text, and output paths

Expected object layout:

```text
documents/<jobId>/<unique-document-name>.<extension>
videos/<jobId>/training.mp4
infographics/<jobId>.png
```

Configure server-side storage access and database permissions separately. The API generates signed URLs lasting one hour for private media delivery.

## Backend API

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/test-supabase` | Verify Supabase database access |
| `POST` | `/upload` | Upload a document and create an async job |
| `GET` | `/jobs/:id` | Retrieve status and signed result URLs |
| `GET` | `/history` | Retrieve completed jobs |
| `GET` | `/did/test` | Test auxiliary D-ID connectivity |
| `GET` | `/did/avatars` | List auxiliary D-ID presenters |

Example upload:

```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@training-document.pdf"
```

## Technical Decisions

- **Jetpack Compose and Material 3** provide a consistent native Android interface with declarative UI and edge-to-edge support.
- **MVVM plus StateFlow** keeps asynchronous upload and polling state separate from Compose screens.
- **Repository abstractions** isolate Android network calls and document URI access.
- **Supabase** combines persistent job state with private generated-file storage.
- **Strict JSON planning** makes AI output predictable and reduces downstream parsing failures.
- **Shared illustrations** prevent duplicate visual generation between the video and infographic.
- **Private storage and signed URLs** expose generated output only for a limited duration.
- **Asynchronous upload handling** returns quickly instead of blocking the HTTP connection during media generation.
- **FFmpeg and Puppeteer** provide a deterministic local media-generation pipeline without additional rendering microservices.
- **Poll-based status updates** match the current lightweight architecture and avoid adding a real-time transport dependency.

## Challenges

- AI providers can return malformed data, time out, or run out of credits.
- A complete generation job combines several external services and CPU-heavy local media tools.
- Temporary media must be cleaned up correctly after success and partial failure.
- Section clips must have compatible dimensions, codecs, frame rates, and audio settings.
- Long-running work currently lives inside the Express process and is lost if the server restarts.
- The Android app currently uses a fixed LAN IP and cleartext HTTP, which must be replaced for deployment.
- History is global because the current backend does not implement user identity or job ownership.
- The app has no authentication, route authorization, upload rate limiting, or retry queue.
- Signed URLs may expire while a user leaves the app or result screen open.

## Future Improvements

- Add user authentication and per-user job history
- Replace the fixed LAN URL with BuildConfig values or environment-based configuration
- Use HTTPS and server-specific API configuration
- Move processing to durable queues and dedicated workers
- Add automatic retries, exponential backoff, and provider fallbacks
- Stream progress over WebSockets or Server-Sent Events
- Add OCR for scanned or image-only PDFs
- Support cancellation and resume of generation jobs
- Add prompt, voice, duration, aspect ratio, theme, and language controls
- Add unit, integration, and end-to-end tests
- Add provider usage, generation cost, duration, and failure telemetry
- Generate a downloadable or shareable training package
- Add cloud deployment, CI/CD, containerization, and infrastructure configuration
- Add OpenAPI documentation and Android contract tests
- Apply storage lifecycle rules and signed-media refresh
- Add accessibility improvements and localization

## Security Notes

- Keep API keys and Supabase server credentials in `.env` only.
- Do not place Supabase service credentials or AI keys in Android resources.
- Do not commit generated uploads, credentials, service account files, or local media.
- Use HTTPS and authentication before exposing the API publicly.
- Apply job ownership checks before serving status, history, source text, or generated media.
- Limit file size, MIME types, concurrency, and anonymous request volume.
- Rotate any credential that has been committed, copied into logs, or shared outside the development environment.

## License

License information has not yet been defined for this project.
