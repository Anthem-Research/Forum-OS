/* Forum Workbench: all records remain in this browser's IndexedDB. */
(() => {
  "use strict";
  const DB_NAME = "forum-workbench-v1";
  const STORE = "builds";
  const byId = (id) => document.getElementById(id);
  const canvas = byId("drawing");
  const pen = canvas.getContext("2d");
  pen.lineCap = "round";
  pen.lineJoin = "round";
  pen.lineWidth = 3;
  let db;
  let builds = [];
  let current = null;
  let saveTimer = null;
  let drawing = false;

  function status(message) { byId("storage-state").textContent = message; }
  function date(value) { return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); }
  function label(build) { return build.title.trim() || "Untitled build"; }
  function makeId() { return crypto.randomUUID(); }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "id" });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error("Close other Workbench tabs and try again."));
    });
  }
  function getAll() {
    return new Promise((resolve, reject) => {
      const request = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  function write(build) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(build);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }
  function remove(id) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }
  function clearCanvas() { pen.clearRect(0, 0, canvas.width, canvas.height); }
  function showDrawing(data) {
    clearCanvas();
    if (!data) return;
    const image = new Image();
    image.onload = () => { if (current && current.drawing === data) pen.drawImage(image, 0, 0, canvas.width, canvas.height); };
    image.src = data;
  }
  function sortedBuilds() { return [...builds].sort((a, b) => b.updatedAt - a.updatedAt); }
  function renderList() {
    const list = byId("build-list");
    list.replaceChildren();
    sortedBuilds().forEach((build) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label(build);
      button.setAttribute("aria-current", build.id === current?.id ? "true" : "false");
      button.addEventListener("click", () => run(async () => { await flush(); current = build; render(); }));
      const meta = document.createElement("small");
      meta.textContent = build.originId ? "Version of another build" : date(build.updatedAt);
      item.append(button, meta);
      list.append(item);
    });
  }
  function renderReferences() {
    const select = byId("reference");
    select.replaceChildren();
    const first = document.createElement("option");
    first.value = "";
    first.textContent = "Choose a build";
    select.append(first);
    builds.filter((item) => item.id !== current.id && !current.referenceIds.includes(item.id)).forEach((build) => {
      const option = document.createElement("option");
      option.value = build.id;
      option.textContent = label(build);
      select.append(option);
    });
    const list = byId("references");
    list.replaceChildren();
    if (current.originId) {
      const origin = builds.find((item) => item.id === current.originId);
      const originItem = document.createElement("li");
      originItem.textContent = "Derived from / " + (origin ? label(origin) : "source no longer on this device");
      list.append(originItem);
    }
    current.referenceIds.forEach((id) => {
      const target = builds.find((item) => item.id === id);
      if (!target) return;
      const item = document.createElement("li");
      const name = document.createElement("span");
      name.textContent = label(target);
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", () => run(async () => {
        current.referenceIds = current.referenceIds.filter((ref) => ref !== id);
        await saveNow();
        renderReferences();
      }));
      item.append(name, removeButton);
      list.append(item);
    });
  }
  function renderVersions() {
    const list = byId("versions");
    list.replaceChildren();
    [...current.versions].reverse().forEach((version, index) => {
      const item = document.createElement("li");
      const name = document.createElement("span");
      name.textContent = "Version " + (current.versions.length - index) + " / " + date(version.savedAt);
      const restore = document.createElement("button");
      restore.type = "button";
      restore.textContent = "Restore";
      restore.addEventListener("click", () => run(async () => {
        await flush();
        Object.assign(current, {
          title: version.title, question: version.question, notes: version.notes,
          drawing: version.drawing, referenceIds: [...version.referenceIds],
        });
        await saveNow();
        render();
      }));
      item.append(name, restore);
      list.append(item);
    });
  }
  function render() {
    byId("empty").hidden = Boolean(current);
    byId("active").hidden = !current;
    renderList();
    if (!current) return;
    byId("build-code").textContent = current.originId ? "BUILD / BRANCHED" : "BUILD / PRIVATE";
    byId("build-updated").textContent = "Edited " + date(current.updatedAt);
    byId("title").value = current.title;
    byId("question").value = current.question;
    byId("notes").value = current.notes;
    showDrawing(current.drawing);
    renderReferences();
    renderVersions();
  }
  async function saveNow() {
    if (!current) return;
    clearTimeout(saveTimer);
    saveTimer = null;
    current.title = byId("title").value;
    current.question = byId("question").value;
    current.notes = byId("notes").value;
    current.updatedAt = Date.now();
    await write(current);
    builds = await getAll();
    current = builds.find((build) => build.id === current.id);
    status("Saved on this device");
    renderList();
    byId("build-updated").textContent = "Edited " + date(current.updatedAt);
  }
  async function flush() { if (saveTimer) await saveNow(); }
  function queueSave() { status("Saving locally…"); clearTimeout(saveTimer); saveTimer = setTimeout(() => run(saveNow), 500); }
  function run(action) { Promise.resolve().then(action).catch((error) => { status("Local save failed"); window.alert("Workbench could not save: " + error.message); }); }
  async function create(base) {
    await flush();
    const now = Date.now();
    const next = {
      id: makeId(), title: base ? label(base) + " / another version" : "",
      question: base?.question ?? "", notes: base?.notes ?? "", drawing: base?.drawing ?? "",
      referenceIds: [], originId: base?.id ?? null, versions: [], createdAt: now, updatedAt: now,
    };
    await write(next);
    builds = await getAll();
    current = next;
    render();
    byId("title").focus();
    status("Saved on this device");
  }
  function pointer(event) {
    const bounds = canvas.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) * canvas.width / bounds.width,
      y: (event.clientY - bounds.top) * canvas.height / bounds.height };
  }
  canvas.addEventListener("pointerdown", (event) => {
    if (!current) return;
    drawing = true;
    canvas.setPointerCapture(event.pointerId);
    const point = pointer(event);
    pen.beginPath();
    pen.moveTo(point.x, point.y);
    pen.lineTo(point.x + 0.01, point.y + 0.01);
    pen.stroke();
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!drawing) return;
    const point = pointer(event);
    pen.lineTo(point.x, point.y);
    pen.stroke();
  });
  function finishDrawing() {
    if (!drawing) return;
    drawing = false;
    current.drawing = canvas.toDataURL("image/png");
    run(saveNow);
  }
  canvas.addEventListener("pointerup", finishDrawing);
  canvas.addEventListener("pointercancel", finishDrawing);
  [byId("title"), byId("question"), byId("notes")].forEach((field) => field.addEventListener("input", queueSave));
  byId("create").addEventListener("click", () => run(() => create()));
  byId("create-empty").addEventListener("click", () => run(() => create()));
  byId("fork").addEventListener("click", () => run(() => create(current)));
  byId("clear-drawing").addEventListener("click", () => run(async () => {
    clearCanvas(); current.drawing = ""; await saveNow();
  }));
  byId("add-reference").addEventListener("click", () => run(async () => {
    const id = byId("reference").value;
    if (!id || id === current.id || !builds.some((build) => build.id === id) || current.referenceIds.includes(id)) return;
    current.referenceIds.push(id);
    await saveNow();
    renderReferences();
  }));
  byId("save-version").addEventListener("click", () => run(async () => {
    await flush();
    current.versions.push({
      savedAt: Date.now(), title: current.title, question: current.question,
      notes: current.notes, drawing: current.drawing, referenceIds: [...current.referenceIds],
    });
    await write(current);
    renderVersions();
    status("Version saved locally");
  }));
  byId("delete").addEventListener("click", () => run(async () => {
    if (!current || !window.confirm("Delete this local build and its versions?")) return;
    await remove(current.id);
    builds = await getAll();
    current = sortedBuilds()[0] ?? null;
    render();
    status("Build deleted on this device");
  }));
  byId("import").addEventListener("change", () => run(async () => {
    const input = byId("import");
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    await flush();
    if (builds.length) throw new Error("Restore is available only into an empty Workbench.");
    if (file.size > 30_000_000) throw new Error("Archive is too large for this first Workbench version.");
    const archive = JSON.parse(await file.text());
    if (archive?.format !== "forum-workbench-v1" || !Array.isArray(archive.builds) || archive.builds.length > 200) {
      throw new Error("This is not a supported Forum Workbench backup.");
    }
    const ids = new Set();
    for (const build of archive.builds) {
      if (!build || typeof build !== "object" || typeof build.id !== "string" || ids.has(build.id) ||
          !["title", "question", "notes", "drawing"].every((key) => typeof build[key] === "string") ||
          !Array.isArray(build.referenceIds) || !build.referenceIds.every((id) => typeof id === "string") ||
          !Array.isArray(build.versions) || build.versions.length > 1000 ||
          !build.versions.every((version) => version && Number.isFinite(version.savedAt) &&
            ["title", "question", "notes", "drawing"].every((key) => typeof version[key] === "string") &&
            (!version.drawing || version.drawing.startsWith("data:image/png;base64,")) &&
            Array.isArray(version.referenceIds) && version.referenceIds.every((id) => typeof id === "string")) ||
          !Number.isFinite(build.createdAt) || !Number.isFinite(build.updatedAt) ||
          (build.drawing && !build.drawing.startsWith("data:image/png;base64,"))) {
        throw new Error("Archive contains an invalid build.");
      }
      ids.add(build.id);
    }
    if (!window.confirm("Restore " + archive.builds.length + " private builds on this device?")) return;
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      archive.builds.forEach((build) => tx.objectStore(STORE).put(build));
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    builds = await getAll();
    current = sortedBuilds()[0] ?? null;
    render();
    status("Private backup restored locally");
  }));
  byId("export").addEventListener("click", () => run(async () => {
    await flush();
    const snapshot = await getAll();
    if (!snapshot.length) { status("No builds to back up"); return; }
    if (!window.confirm("Download every private build and drawing to this device? Keep this file private.")) return;
    const archive = { format: "forum-workbench-v1", exportedAt: new Date().toISOString(), builds: snapshot };
    const url = URL.createObjectURL(new Blob([JSON.stringify(archive, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "forum-private-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }));
  run(async () => {
    db = await openDatabase();
    builds = await getAll();
    current = sortedBuilds()[0] ?? null;
    render();
    status("Stored on this device");
    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
      navigator.serviceWorker.register("./sw.js").catch(() => status("Stored locally; offline shell unavailable"));
    }
  });
})();