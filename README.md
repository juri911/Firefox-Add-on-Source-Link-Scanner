# Quelltext-Links-Scanner (Firefox-Addon)

Dieses Addon scannt den Quelltext der aktuell geöffneten Webseite nach Links und zeigt sie im Popup an.

## Funktionen

- **Seite scannen**: Extrahiert Links aus dem DOM, Quelltext und **Subdokumenten (#document)**: `<a href>`, `<area href>`, `<link href>`, `<iframe src>`, `<frame src>`, `<object data>`, `<embed src>`, URLs in **`<script>`-Inhalten**, **Shadow DOM**, **iframes/frames** (inkl. Warten auf Laden), **`document.frames`** (alle Kind-#documents des Fensters), **`<object>`-Subdokumente** (same-origin). Cross-Origin-Inhalte können aus Sicherheitsgründen nicht gelesen werden.
- **Filter**:
  - **Alle Links**: Zeigt alle gefundenen Links.
  - **Nur diese Seite**: Zeigt nur Links, die auf exakt die gleiche Seite zeigen (gleicher Origin + Pfad, ohne Hash/Query).
- **Kopieren**: Button „Kopieren“ schreibt die aktuell angezeigten Links (einen pro Zeile) in die Zwischenablage.
- Links im Popup sind klickbar und öffnen sich in einem neuen Tab.

## Installation als Erweiterung (dauerhaft)

1. **XPI-Paket erstellen** (im Projektordner im Terminal):
   ```bash
   chmod +x build-xpi.sh
   ./build-xpi.sh
   ```
   Es entsteht die Datei **`quelltext-links-scanner.xpi`**.

2. **Unsignierte Erweiterungen erlauben** (nur nötig, weil die Erweiterung nicht von Mozilla signiert ist):
   - In Firefox in die Adresszeile eingeben: `about:config`
   - Warnung mit **„Risiko akzeptieren und fortfahren“** bestätigen
   - In die Suche eingeben: **`xpinstall.signatures.required`**
   - Den Wert durch Doppelklick auf **`false`** setzen

3. **Erweiterung installieren**:
   - Adresszeile: **`about:addons`**
   - Oben rechts auf das **Zahnrad-Symbol** klicken
   - **„Add-on aus Datei installieren…“** wählen
   - Die Datei **`quelltext-links-scanner.xpi`** auswählen und mit **„Öffnen“** bestätigen
   - Die Meldung mit **„Add-on hinzufügen“** bestätigen

Die Erweiterung bleibt installiert (auch nach Neustart von Firefox) und erscheint unter **Erweiterungen** in `about:addons`. Das Symbol kannst du ggf. über das Puzzle-Icon in der Symbolleiste anheften.

### Meldung „könnte beschädigt sein“ / Installation schlägt fehl

Firefox blockiert unsignierte Erweiterungen und zeigt dann oft eine allgemeine Fehlermeldung. **Vor** dem Installieren der XPI unbedingt:

1. **`about:config`** in die Adresszeile eingeben und bestätigen.
2. Die Hinweis-Seite mit **„Risiko akzeptieren und fortfahren“** bestätigen.
3. In das Suchfeld **`xpinstall.signatures.required`** eintragen.
4. Auf den Eintrag **doppelklicken**, sodass der Wert von `true` auf **`false`** wechselt (in der Spalte „Wert“ steht dann `false`).

Erst danach unter **about:addons** → Zahnrad → **„Add-on aus Datei installieren…“** die **`quelltext-links-scanner.xpi`** auswählen. Ohne diesen Schritt lehnt Firefox die Installation ab.

### Tor Browser

Die Erweiterung funktioniert auch im **Tor Browser** (basiert auf Firefox ESR). Installation wie unter Firefox:

1. **XPI bauen** (wie oben) und **`quelltext-links-scanner.xpi`** bereithalten.
2. Im Tor Browser **`about:config`** öffnen → **„Risiko akzeptieren und fortfahren“**.
3. **`xpinstall.signatures.required`** suchen und per Doppelklick auf **`false`** setzen.
4. **`about:addons`** öffnen → Zahnrad → **„Add-on aus Datei installieren…“** → **`quelltext-links-scanner.xpi`** wählen und bestätigen.

Hinweis: Nutzung von Erweiterungen im Tor Browser kann das Anonymitätsprofil verändern. Nur verwenden, wenn du die Risiken kennst und akzeptierst.

---

## Installation (temporär / Entwickler)

1. Firefox öffnen und in die Adresszeile eingeben: `about:debugging`
2. Links **„Dieses Firefox“** wählen.
3. Auf **„Add-on temporär laden…“** klicken.
4. Im Dateidialog den Ordner **FF Quelltext links scanner** (bzw. die Datei `manifest.json`) auswählen.
5. Das Addon erscheint in der Liste; das Symbol erscheint in der Symbolleiste (ggf. über das Puzzle-Symbol einblenden).

Zum erneuten Laden nach Änderungen: bei dem Addon auf **„Entladen“** klicken und es danach wieder **„Add-on temporär laden…“** laden.

## Dateien

- `manifest.json` – Addon-Manifest
- `popup.html` / `popup.css` / `popup.js` – Popup-Oberfläche und Logik
- `content.js` – Script, das im Tab ausgeführt wird und die Links extrahiert

## Hinweise

- Auf Sonderseiten (`about:`, `file:`, Erweiterungsseiten) ist kein Scan möglich.
- Bei manchen Seiten kann das Ausführen von Skripten eingeschränkt sein (z. B. durch Richtlinien der Seite).

---

# Source Link Scanner (Firefox Add-on) — English

This add-on scans the currently open webpage’s source for links and displays them in a popup.

## Features

- **Scan page**: Extracts links from the DOM, source, and **subdocuments (#document)**: `<a href>`, `<area href>`, `<link href>`, `<iframe src>`, `<frame src>`, `<object data>`, `<embed src>`, URLs inside **`<script>` content**, **Shadow DOM**, **iframes/frames** (including wait for load), **`document.frames`** (all child #documents of the window), **`<object>` subdocuments** (same-origin). Cross-origin content cannot be read for security reasons.
- **Filters**:
  - **All links**: Show all found links.
  - **This page only**: Show only links that point to the exact same page (same origin + path, no hash/query).
  - **Website only**: Enter a domain (e.g. `example.com`) to show only links targeting that site.
- **Copy**: The “Kopieren” / Copy button copies the currently shown links (one per line) to the clipboard. Each link row also has a per-link copy button on hover.
- Links in the popup are clickable and open in a new tab.

## Installation as extension (permanent)

1. **Build the XPI** (in the project folder, in a terminal):
   ```bash
   chmod +x build-xpi.sh
   ./build-xpi.sh
   ```
   This creates **`quelltext-links-scanner.xpi`**.

2. **Allow unsigned extensions** (required because the extension is not signed by Mozilla):
   - In Firefox, go to **`about:config`** in the address bar.
   - Accept the warning (“Accept the Risk and Continue”).
   - Search for **`xpinstall.signatures.required`**.
   - Double-click the row to set the value to **`false`**.

3. **Install the extension**:
   - Open **`about:addons`**.
   - Click the **gear icon** (top right) → **“Install Add-on from File…”**.
   - Select **`quelltext-links-scanner.xpi`** and confirm.
   - Confirm “Add add-on” (or equivalent).

The extension stays installed (including after restart) and appears under **Extensions** in `about:addons`. You can pin its icon via the puzzle piece in the toolbar.

### “Could be corrupted” / installation fails

Firefox blocks unsigned extensions and often shows a generic error. **Before** installing the XPI:

1. Open **`about:config`** and accept the warning.
2. Search for **`xpinstall.signatures.required`**.
3. **Double-click** the entry so the value becomes **`false`**.

Then install via **about:addons** → gear → **“Install Add-on from File…”**. Without this step, Firefox will reject the installation.

### Tor Browser

The extension also works in **Tor Browser** (Firefox ESR–based). Install the same way as in Firefox:

1. Build the XPI (as above) and have **`quelltext-links-scanner.xpi`** ready.
2. In Tor Browser open **`about:config`** and set **`xpinstall.signatures.required`** to **`false`**.
3. Open **`about:addons`** → gear → **“Install Add-on from File…”** → select the XPI and confirm.

Note: Using extensions in Tor Browser can affect the anonymity profile. Use only if you understand and accept the trade-offs.

---

## Temporary / developer installation

1. Open Firefox and go to **`about:debugging`**.
2. Click **“This Firefox”** (left).
3. Click **“Load Temporary Add-on…”**.
4. Select the **FF Quelltext links scanner** folder (or the `manifest.json` file).
5. The add-on appears in the list; pin its icon from the puzzle piece in the toolbar if needed.

To reload after code changes: click **“Remove”** on the add-on, then load it again via **“Load Temporary Add-on…”**.

## Files

- `manifest.json` – Add-on manifest
- `popup.html` / `popup.css` / `popup.js` – Popup UI and logic
- `content.js` – Script injected into the tab to extract links

## Notes

- Scanning is not possible on special pages (`about:`, `file:`, extension pages).
- On some sites, script execution may be restricted (e.g. by the page’s policy).
