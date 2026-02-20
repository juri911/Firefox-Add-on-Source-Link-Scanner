(function() {
  const btnScan = document.getElementById("btnScan");
  const btnCopy = document.getElementById("btnCopy");
  const linkList = document.getElementById("linkList");
  const resultsCount = document.getElementById("resultsCount");
  const hint = document.getElementById("hint");
  const currentUrlEl = document.getElementById("currentUrl");
  const filterWebsiteInput = document.getElementById("filterWebsite");

  let lastResult = null;

  function getFilter() {
    const r = document.querySelector('input[name="filter"]:checked');
    return r ? r.value : "all";
  }

  function normalizeWebsiteInput(input) {
    const s = (input || "").trim();
    if (!s) return null;
    try {
      if (!/^https?:\/\//i.test(s)) {
        return new URL("https://" + s);
      }
      return new URL(s);
    } catch (_) {
      return null;
    }
  }

  function linkMatchesWebsite(linkUrl, filterUrl) {
    try {
      const link = new URL(linkUrl);
      return link.hostname === filterUrl.hostname;
    } catch (_) {
      return false;
    }
  }

  function getDisplayLinks() {
    if (!lastResult) return [];
    const filter = getFilter();
    if (filter === "same") return lastResult.linksSamePage;
    if (filter === "website") {
      const filterUrl = normalizeWebsiteInput(filterWebsiteInput.value);
      if (!filterUrl) return lastResult.linksAll;
      return lastResult.linksAll.filter(function(href) {
        return linkMatchesWebsite(href, filterUrl);
      });
    }
    return lastResult.linksAll;
  }

  function showLinks() {
    const links = getDisplayLinks();
    linkList.innerHTML = "";
    hint.classList.toggle("hidden", links.length > 0);
    resultsCount.textContent = links.length + " Link(s)";

    links.forEach(function(href) {
      const row = document.createElement("div");
      row.className = "link-row";
      const a = document.createElement("a");
      a.className = "link-item";
      a.href = href;
      a.textContent = href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.title = href;
      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "btn-copy-one";
      copyBtn.textContent = "Kopieren";
      copyBtn.title = "Link kopieren";
      copyBtn.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(href).then(function() {
          const t = copyBtn.textContent;
          copyBtn.textContent = "Kopiert!";
          setTimeout(function() { copyBtn.textContent = t; }, 1200);
        });
      });
      row.appendChild(a);
      row.appendChild(copyBtn);
      linkList.appendChild(row);
    });
  }

  function setError(msg) {
    linkList.innerHTML = "";
    const p = document.createElement("p");
    p.className = "error";
    p.textContent = msg;
    linkList.appendChild(p);
    resultsCount.textContent = "—";
    hint.classList.add("hidden");
  }

  async function scan() {
    btnScan.disabled = true;
    linkList.innerHTML = "";
    resultsCount.textContent = "…";
    hint.classList.remove("hidden");
    hint.textContent = "Scanne (inkl. iframes) …";

    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        setError("Kein aktiver Tab.");
        return;
      }
      if (tab.url.startsWith("about:") || tab.url.startsWith("moz-extension:") || tab.url.startsWith("file:")) {
        setError("Auf dieser Seite können keine Links gescannt werden.");
        return;
      }

      const results = await browser.tabs.executeScript(tab.id, { file: "content.js" });
      if (!results || !results[0]) {
        setError("Keine Links gefunden oder Seite blockiert.");
        return;
      }
      var data = results[0];
      if (data && typeof data.then === "function") {
        data = await data;
      }
      if (!data || !data.linksAll) {
        setError("Keine Links gefunden oder Seite blockiert.");
        return;
      }
      lastResult = data;
      hint.textContent = "Klicke auf „Seite scannen“, um die Links der aktuellen Seite zu extrahieren.";
      showLinks();
    } catch (e) {
      setError("Fehler: " + (e.message || "Unbekannt"));
    } finally {
      btnScan.disabled = false;
    }
  }

  function copyLinks() {
    const links = getDisplayLinks();
    if (links.length === 0) return;
    const text = links.join("\n");
    navigator.clipboard.writeText(text).then(() => {
      const old = btnCopy.textContent;
      btnCopy.textContent = "Kopiert!";
      setTimeout(() => { btnCopy.textContent = old; }, 1500);
    });
  }

  document.querySelectorAll('input[name="filter"]').forEach(function(input) {
    input.addEventListener("change", showLinks);
  });
  filterWebsiteInput.addEventListener("input", showLinks);
  filterWebsiteInput.addEventListener("change", showLinks);
  btnScan.addEventListener("click", scan);
  btnCopy.addEventListener("click", copyLinks);

  browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
    if (tab && tab.url) {
      try {
        const u = new URL(tab.url);
        if (u.protocol === "http:" || u.protocol === "https:") {
          currentUrlEl.textContent = u.origin + u.pathname;
        } else {
          currentUrlEl.textContent = tab.url;
        }
      } catch (_) {
        currentUrlEl.textContent = tab.url;
      }
    } else {
      currentUrlEl.textContent = "—";
    }
  });
})();
