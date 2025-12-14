# Copilot Instructions for Relíquias do Xis

## Project Overview
**Relíquias do Xis** is a burger review rating system for Porto Alegre (Brazil). Users can view and rate local burger establishments ("xis") on an interactive map with three rating dimensions: overall quality (nota), cleanliness level (sujeira), and digestive aftermath (cagada).

## Architecture

### Core Technology Stack
- **Frontend**: Plain HTML/CSS/JS (no framework)
- **Backend**: Firebase (Firestore + Authentication)
- **Maps**: Google Maps API v3 with Places autocomplete
- **Image Storage**: Cloudinary (unsigned uploads with preset)
- **Contact Form**: FormSubmit.co (anonymous submissions)
- **Hosting**: GitHub Pages

### Data Model (Firestore)
Collection `locais` (establishments):
```javascript
{
  nome: string,
  latitude: float,
  longitude: float,
  resenha: string,
  nota: 1-5 (star rating),
  sujeira: 1-5 (cleanliness level),
  cagada: 1-5 (digestive effect rating),
  imagem: URL,
  autor: user email,
  timestamp: serverTimestamp
}
```

### Key Components

**[index.html](index.html)** - Public map view
- Loads all `locais` from Firestore
- Displays markers with info windows (name, review, image)
- Implements rating filter dropdown
- Fixed footer with rotating phrases
- Lightbox for image enlargement

**[admin.html](admin.html)** - Admin panel (Firebase auth required)
- Login/logout with email/password
- Google Places autocomplete for location search
- Three-star rating systems (setupRating pattern)
- Cloudinary upload widget integration
- Form validation (all fields required)

**[script.js](script.js)** - Map initialization and filtering
- `initMap()`: Fetches locais, renders markers, attaches info windows with HTML
- `filterMarkers()`: Shows/hides markers based on selected rating
- Global marker array stores { marker, nota } pairs for filtering

**[admin.js](admin.js)** - Admin functionality
- Maps Google Places selection to latitude/longitude/nome fields
- Handles image upload to Cloudinary (stores in `imagemUrl` array)
- Publishes entry with `addDoc(collection(db, "locais"), ...)`
- Clears form state after successful submission
- Auth state listener: shows login form if not authenticated

## Critical Workflows

### Adding a New Review (End-to-End)
1. Admin logs in at `/admin.html`
2. Types location → Places autocomplete updates map marker + fields
3. Selects 3 ratings (visual highlight of selected option)
4. Uploads image → Cloudinary returns URL to `imagemUrl[0]`
5. Submits → Firestore saves with `serverTimestamp()`
6. Form auto-resets, marker hidden

### Viewing Reviews (Public)
1. Map initializes with ordered snapshot: `orderBy("timestamp", "desc")`
2. Each marker stores info window HTML with embedded image
3. Filter dropdown triggers `filterMarkers()` - uses stored `nota` value
4. Image errors handled silently (onerror handler)

## Configuration & Secrets

### GitHub Secrets (injected at deploy time)
```
FIREBASE_API_KEY
FIREBASE_PROJECT_ID
GOOGLE_MAPS_API_KEY
```

**Deployment flow** (GitHub Actions):
- `sed` replaces placeholders in HTML (e.g., `FIREBASE_API_KEY` → actual key)
- Publishes to GitHub Pages

### Local Development
- Create `secrets.js` at root:
```javascript
const firebaseConfig = { /* actual credentials */ };
firebase.initializeApp(firebaseConfig);
```
- Only loaded in localhost (see admin.html conditional)

### Cloudinary Config (Static)
- Cloud Name: `dgdjaz541`
- Upload Preset: `reliquias_do_xis` (unsigned, allows anonymous uploads)

## Project-Specific Patterns

### Rating Selection (Reusable Pattern)
```javascript
function setupRating(containerId, callback) {
  // Toggles 'selected' class on rating-option elements
  // Calls callback(value) on click
}
```
Used for: nota-rating, sujeira-rating, cagada-rating. Pattern should be extended if new rating types added.

### Firestore Security Rules
```
allow read: if true;        // Public map view
allow write: if request.auth != null;  // Only authenticated admins
```

### Image Error Handling
All images include `onerror="this.style.display='none'"` to silently hide failures (CORS policy, dead URLs).

## Common Pitfalls & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Map doesn't load | Google Maps API key invalid/expired | Check GitHub Secrets, redeploy |
| Images don't appear | Cloudinary URL returns 404 or CORS blocked | Verify Cloudinary preset exists; image links use `crossorigin="anonymous"` |
| Upload widget doesn't open | Pop-ups blocked | Instruct user to allow pop-ups for domain |
| Form submit fails | Missing required field validation | All 5 fields + 3 ratings must have values before publicarBtn click |
| Rating not saved | `setupRating` not called after auth | Auth state listener initializes all three ratings in admin.js |

## Files to Modify for Common Tasks

- **New rating dimension**: Add `setupRating('dimension-rating', ...)` in admin.js auth listener; update Firestore schema
- **New admin page**: Copy `admin.html` structure; ensure Firebase init; add to nav footer
- **Map styling**: Edit `initMap()` zoom/center defaults; modify info window content HTML
- **Filter logic**: Extend `filterMarkers()` to check multiple criteria
- **Form validation**: Add checks before `addDoc()` call in admin.js

## Deployment Notes

- GitHub Pages serves root directory (`./`)
- Only `.html`, `.css`, `.js` files needed (no build step)
- API keys injected via GitHub Actions before deploy
- Backup files (`.bak`) can be safely deleted
- No database migrations needed (Firestore flexible schema)
