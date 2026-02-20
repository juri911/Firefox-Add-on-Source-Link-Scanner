#!/bin/bash
# Erstellt eine .xpi-Datei zum Installieren der Erweiterung in Firefox.
cd "$(dirname "$0")"
XPI="quelltext-links-scanner.xpi"
rm -f "$XPI"
# Ohne Kompression packen (weniger anfällig für "beschädigt"-Meldung)
zip -0 -r "$XPI" manifest.json popup.html popup.css popup.js content.js -x "*.DS_Store"
echo "Erstellt: $XPI"
