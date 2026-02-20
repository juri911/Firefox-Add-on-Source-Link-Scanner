(function() {
  var links = new Set();
  var baseUrl = document.baseURI || window.location.href;
  var visitedDocs = new Set();
  var pageUrl = window.location.href;

  function addUrl(href, base, set) {
    if (!href || href.indexOf("javascript:") === 0 || href === "#") return;
    try {
      set.add(new URL(href, base).href);
    } catch (e) {}
  }

  function fromDOM(doc, base, set) {
    var selectors = ["a[href]", "area[href]", "link[href]"];
    for (var i = 0; i < selectors.length; i++) {
      try {
        var els = doc.querySelectorAll(selectors[i]);
        for (var j = 0; j < els.length; j++) {
          var href = (els[j].getAttribute("href") || "").trim();
          addUrl(href, base, set);
        }
      } catch (e) {}
    }
    try {
      var iframes = doc.querySelectorAll("iframe[src]");
      for (var k = 0; k < iframes.length; k++) {
        var src = (iframes[k].getAttribute("src") || "").trim();
        if (!src || src.indexOf("javascript:") === 0) continue;
        try {
          set.add(new URL(src, base).href);
        } catch (e) {}
      }
      var frames = doc.querySelectorAll("frame[src]");
      for (var kf = 0; kf < frames.length; kf++) {
        var fsrc = (frames[kf].getAttribute("src") || "").trim();
        if (!fsrc || fsrc.indexOf("javascript:") === 0) continue;
        try {
          set.add(new URL(fsrc, base).href);
        } catch (e) {}
      }
      var objects = doc.querySelectorAll("object[data]");
      for (var o = 0; o < objects.length; o++) {
        var data = (objects[o].getAttribute("data") || "").trim();
        if (data && data.indexOf("javascript:") !== 0) {
          try { set.add(new URL(data, base).href); } catch (e) {}
        }
      }
      var embeds = doc.querySelectorAll("embed[src]");
      for (var e = 0; e < embeds.length; e++) {
        var esrc = (embeds[e].getAttribute("src") || "").trim();
        if (esrc && esrc.indexOf("javascript:") !== 0) {
          try { set.add(new URL(esrc, base).href); } catch (err) {}
        }
      }
    } catch (e) {}
  }

  function fromSource(doc, base, set) {
    var html = doc.documentElement.outerHTML;
    var reHref = /href\s*=\s*["']([^"']+)["']/gi;
    var m;
    while ((m = reHref.exec(html)) !== null) {
      addUrl(m[1].trim(), base, set);
    }
    var reIframeSrc = /<iframe[^>]+src\s*=\s*["']([^"']+)["']/gi;
    while ((m = reIframeSrc.exec(html)) !== null) {
      var src = m[1].trim();
      if (!src || src.indexOf("javascript:") === 0) continue;
      try {
        set.add(new URL(src, base).href);
      } catch (e) {}
    }
    var reFrameSrc = /<frame[^>]+src\s*=\s*["']([^"']+)["']/gi;
    while ((m = reFrameSrc.exec(html)) !== null) {
      var fsrc = m[1].trim();
      if (!fsrc || fsrc.indexOf("javascript:") === 0) continue;
      try {
        set.add(new URL(fsrc, base).href);
      } catch (e) {}
    }
  }

  function addUrlFromScript(raw, base, set) {
    var re = /https?:\/\/[^\s'"`<>)\]\};,]+/g;
    var match;
    while ((match = re.exec(raw)) !== null) {
      var u = match[0].replace(/[)\]\};,]+$/, "");
      if (!u || u.indexOf("javascript:") === 0) continue;
      try {
        set.add(new URL(u, base).href);
      } catch (e) {}
    }
  }

  function fromScripts(doc, base, set) {
    var scripts = doc.querySelectorAll("script");
    for (var i = 0; i < scripts.length; i++) {
      var text = scripts[i].textContent || "";
      if (text.length > 0) addUrlFromScript(text, base, set);
    }
    var html = doc.documentElement.outerHTML;
    var scriptBlockRe = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    var blockMatch;
    while ((blockMatch = scriptBlockRe.exec(html)) !== null) {
      if (blockMatch[1]) addUrlFromScript(blockMatch[1], base, set);
    }
  }

  function waitForFrameOrIframeLoad(el) {
    return new Promise(function(resolve) {
      try {
        var doc = el.contentDocument;
        if (doc && doc.readyState === "complete") {
          resolve(doc);
          return;
        }
        var done = function() {
          try {
            resolve(el.contentDocument || null);
          } catch (e) {
            resolve(null);
          }
        };
        el.addEventListener("load", done, { once: true });
        setTimeout(done, 6000);
      } catch (e) {
        resolve(null);
      }
    });
  }

  function waitForObjectLoad(obj) {
    return new Promise(function(resolve) {
      try {
        var doc = obj.contentDocument;
        if (doc && doc.readyState === "complete") {
          resolve(doc);
          return;
        }
        var done = function() {
          try {
            resolve(obj.contentDocument || null);
          } catch (e) {
            resolve(null);
          }
        };
        obj.addEventListener("load", done, { once: true });
        setTimeout(done, 4000);
      } catch (e) {
        resolve(null);
      }
    });
  }

  function collectFromShadowRoot(root, base, set) {
    if (!root) return;
    try {
      var selectors = ["a[href]", "area[href]", "link[href]", "iframe[src]"];
      for (var i = 0; i < selectors.length; i++) {
        var els = root.querySelectorAll(selectors[i]);
        for (var j = 0; j < els.length; j++) {
          var attr = els[j].getAttribute("href") || els[j].getAttribute("src") || "";
          var val = (attr || "").trim();
          if (val && val.indexOf("javascript:") !== 0 && val !== "#") {
            try { set.add(new URL(val, base).href); } catch (e) {}
          }
        }
      }
      var objs = root.querySelectorAll("object[data], embed[src]");
      for (var k = 0; k < objs.length; k++) {
        var u = (objs[k].getAttribute("data") || objs[k].getAttribute("src") || "").trim();
        if (u && u.indexOf("javascript:") !== 0) {
          try { set.add(new URL(u, base).href); } catch (e) {}
        }
      }
      var scripts = root.querySelectorAll("script");
      for (var s = 0; s < scripts.length; s++) {
        var text = scripts[s].textContent || "";
        if (text.length > 0) addUrlFromScript(text, base, set);
      }
      var html = root.innerHTML || "";
      var scriptBlockRe = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
      var blockMatch;
      while ((blockMatch = scriptBlockRe.exec(html)) !== null) {
        if (blockMatch[1]) addUrlFromScript(blockMatch[1], base, set);
      }
      var all = root.querySelectorAll("*");
      for (var n = 0; n < all.length; n++) {
        if (all[n].shadowRoot) {
          collectFromShadowRoot(all[n].shadowRoot, base, set);
        }
      }
    } catch (e) {}
  }

  function walkShadowRoots(el, base, set) {
    if (!el) return;
    if (el.shadowRoot) collectFromShadowRoot(el.shadowRoot, base, set);
    var ch = el.children || [];
    for (var c = 0; c < ch.length; c++) walkShadowRoots(ch[c], base, set);
  }

  function collectFromDocumentSync(doc, base, set) {
    if (!doc || !doc.documentElement) return;
    fromDOM(doc, base, set);
    fromSource(doc, base, set);
    fromScripts(doc, base, set);
    walkShadowRoots(doc.documentElement, base, set);
  }

  function collectFromDocument(doc, base, set) {
    if (!doc || !doc.documentElement) return Promise.resolve();
    var docId = doc.baseURI || doc.URL || "";
    if (visitedDocs.has(docId)) return Promise.resolve();
    visitedDocs.add(docId);
    try {
      collectFromDocumentSync(doc, base, set);
      var iframes = doc.querySelectorAll("iframe");
      var frames = doc.querySelectorAll("frame");
      var objects = doc.querySelectorAll("object[data]");
      var promises = [];
      for (var i = 0; i < iframes.length; i++) {
        (function(el) {
          promises.push(
            waitForFrameOrIframeLoad(el).then(function(frameDoc) {
              if (frameDoc && frameDoc !== doc) {
                return collectFromDocument(frameDoc, frameDoc.baseURI || frameDoc.URL, set);
              }
            })
          );
        })(iframes[i]);
      }
      for (var f = 0; f < frames.length; f++) {
        (function(el) {
          promises.push(
            waitForFrameOrIframeLoad(el).then(function(frameDoc) {
              if (frameDoc && frameDoc !== doc) {
                return collectFromDocument(frameDoc, frameDoc.baseURI || frameDoc.URL, set);
              }
            })
          );
        })(frames[f]);
      }
      for (var j = 0; j < objects.length; j++) {
        (function(obj) {
          promises.push(
            waitForObjectLoad(obj).then(function(objDoc) {
              if (objDoc && objDoc !== doc && objDoc.documentElement) {
                return collectFromDocument(objDoc, objDoc.baseURI || objDoc.URL, set);
              }
            })
          );
        })(objects[j]);
      }
      var win = doc.defaultView;
      if (win && win.frames && win.frames.length > 0) {
        for (var fi = 0; fi < win.frames.length; fi++) {
          (function(idx) {
            promises.push(
              new Promise(function(resolve) {
                try {
                  var frameWin = win.frames[idx];
                  var frameDoc = frameWin.document || (frameWin.contentDocument || null);
                  if (frameDoc && frameDoc.documentElement && frameDoc !== doc) {
                    resolve(collectFromDocument(frameDoc, frameDoc.baseURI || frameDoc.URL, set));
                  } else {
                    resolve();
                  }
                } catch (e) {
                  resolve();
                }
              })
            );
          })(fi);
        }
      }
      return Promise.all(promises);
    } catch (e) {
      return Promise.resolve();
    }
  }

  var pageOrigin = new URL(pageUrl).origin;
  var pageOriginPath = pageOrigin + new URL(pageUrl).pathname;

  function samePage(url) {
    try {
      var u = new URL(url);
      return u.origin === pageOrigin && (u.origin + u.pathname) === pageOriginPath;
    } catch (e) {
      return false;
    }
  }

  collectFromDocument(document, baseUrl, links).then(function() {
    var arr = [];
    links.forEach(function(h) { arr.push(h); });
    var samePageArr = arr.filter(samePage);
    window.__linksScannerResult = {
      pageUrl: pageUrl,
      pageOrigin: pageOrigin,
      linksAll: arr,
      linksSamePage: samePageArr
    };
  });

  return new Promise(function(resolve) {
    function check() {
      if (window.__linksScannerResult) {
        resolve(window.__linksScannerResult);
        return;
      }
      setTimeout(check, 50);
    }
    setTimeout(check, 100);
  });
})();
