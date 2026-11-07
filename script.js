/* ===== KONFIGURASI (mudah diedit) ===== */
const CONFIG = {
  weddingDate: "2026-11-22T08:00:00+07:00", // tanggal & jam akad (WIB = +07:00)
  shareText: "Assalamu'alaikum. Kami mengundang Anda ke pernikahan Nisa & Ilman 💍",
  storageKey: "guestbook-nisa-ilman-fix"
};
const $ = (id) => document.getElementById(id);

/* Pencari ekstensi otomatis: jika assets/galeri1.jpg tidak ada, coba .jpeg .png .webp dst. */
const EXTS = ["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG"];
function fixImg(img) {
  const base = img.getAttribute("src").replace(/\.[^./]+$/, "");
  let i = 0;
  const next = () => { if (i < EXTS.length) img.src = base + "." + EXTS[i++]; };
  img.addEventListener("error", next);
  if (img.complete && img.naturalWidth === 0) next();
}
document.querySelectorAll("img[src^='assets/']").forEach(fixImg);
(function () { /* foto cover (latar CSS) */
  const t = new Image(); let i = 0;
  t.onload = () => {
    document.documentElement.style.setProperty("--cover-photo", 'url("' + t.src + '")');
    document.body.classList.add("has-photo");
  };
  t.onerror = () => { if (i < EXTS.length) t.src = "assets/foto-cover." + EXTS[i++]; };
  t.onerror();
})();

/* 1. Nama tamu dari link: index.html?to=Budi */
try {
  const n = new URLSearchParams(location.search).get("to");
  if (n) { $("guestName").textContent = n; $("fName").value = n; }
} catch (e) {}

/* 2. Buka undangan + musik */
const music = $("bgMusic"), musicBtn = $("musicBtn");
const syncMusic = () => musicBtn.classList.toggle("playing", !music.paused);
$("openBtn").addEventListener("click", () => {
  $("cover").classList.add("open");
  document.body.classList.remove("locked");
  $("bottomNav").classList.add("show");
  musicBtn.classList.add("visible");
  $("topBtn").classList.add("visible");
  window.scrollTo(0, 0);
  music.play().then(syncMusic).catch(syncMusic);
  setTimeout(() => { $("cover").style.display = "none"; }, 2400);
});
musicBtn.addEventListener("click", () => {
  if (music.paused) music.play().then(syncMusic).catch(() => {});
  else { music.pause(); syncMusic(); }
});

/* 3. Countdown */
const target = new Date(CONFIG.weddingDate).getTime();
const pad = (n) => String(n).padStart(2, "0");
function tick() {
  const d = target - Date.now();
  if (isNaN(target)) { $("cdNote").textContent = "Format tanggal belum benar."; return; }
  if (d <= 0) {
    ["cdDays","cdHours","cdMinutes","cdSeconds"].forEach((i) => $(i).textContent = "00");
    $("cdNote").textContent = "Alhamdulillah, acara telah berlangsung. Terima kasih atas doanya 🤍";
    return;
  }
  $("cdDays").textContent = pad(Math.floor(d / 864e5));
  $("cdHours").textContent = pad(Math.floor(d / 36e5 % 24));
  $("cdMinutes").textContent = pad(Math.floor(d / 6e4 % 60));
  $("cdSeconds").textContent = pad(Math.floor(d / 1e3 % 60));
}
tick(); setInterval(tick, 1000);

/* 4. Animasi scroll + menu aktif */
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("show"); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  reveals.forEach((el) => io.observe(el));
  const links = document.querySelectorAll(".bottom-nav a");
  const nio = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.dataset.sec === e.target.id));
  }), { threshold: 0.4 });
  ["beranda","mempelai","acara","galeri","rsvp"].forEach((id) => nio.observe($(id)));
} else reveals.forEach((el) => el.classList.add("show"));

/* 5. Kembali ke atas */
window.addEventListener("scroll", () => $("topBtn").classList.toggle("show", scrollY > 400));
$("topBtn").addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

/* 6. Galeri: slider + lightbox (otomatis dari foto di grid) */
const gridImgs = Array.from(document.querySelectorAll("#galleryGrid img"));
const photos = gridImgs.map((i) => i.getAttribute("src"));
const track = $("sliderTrack"), dotsBox = $("sDots");
let si = 0, timer;
photos.forEach((src, i) => {
  const im = document.createElement("img"); im.src = src; im.alt = "Foto " + (i + 1); fixImg(im);
  track.appendChild(im);
  const d = document.createElement("i"); d.addEventListener("click", () => go(i));
  dotsBox.appendChild(d);
});
function go(i) {
  si = (i + photos.length) % photos.length;
  track.style.transform = "translateX(-" + si * 100 + "%)";
  Array.from(dotsBox.children).forEach((d, k) => d.classList.toggle("active", k === si));
  clearInterval(timer); timer = setInterval(() => go(si + 1), 4500);
}
$("sPrev").addEventListener("click", () => go(si - 1));
$("sNext").addEventListener("click", () => go(si + 1));
let tx = 0;
$("slider").addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
$("slider").addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - tx;
  if (Math.abs(dx) > 40) go(si + (dx < 0 ? 1 : -1));
}, { passive: true });
go(0);

const lb = $("lightbox"), lbImg = $("lbImg");
let li = 0;
function openLb(i) {
  li = (i + photos.length) % photos.length;
  lbImg.src = gridImgs[li].currentSrc || photos[li]; lbImg.classList.remove("zoomed"); lb.classList.add("show");
}
gridImgs.forEach((img, i) => img.parentElement.addEventListener("click", () => openLb(i)));
$("lbClose").addEventListener("click", () => lb.classList.remove("show"));
$("lbPrev").addEventListener("click", () => openLb(li - 1));
$("lbNext").addEventListener("click", () => openLb(li + 1));
lbImg.addEventListener("click", () => lbImg.classList.toggle("zoomed"));
lb.addEventListener("click", (e) => { if (e.target === lb) lb.classList.remove("show"); });

/* 7. RSVP + buku tamu (localStorage: hanya di perangkat/browser yang sama) */
const load = () => { try { return JSON.parse(localStorage.getItem(CONFIG.storageKey)) || []; } catch (e) { return []; } };
const save = (l) => { try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(l)); return true; } catch (e) { return false; } };
function render() {
  const box = $("guestbook"); box.innerHTML = "";
  const list = load();
  if (!list.length) {
    const p = document.createElement("p"); p.className = "tiny center";
    p.textContent = "Belum ada ucapan. Jadilah yang pertama! 🤍"; box.appendChild(p); return;
  }
  list.forEach((m) => {
    const w = document.createElement("div"); w.className = "g-msg";
    const n = document.createElement("b"); n.textContent = m.name;          // textContent = aman
    const b = document.createElement("span"); b.className = "badge"; b.textContent = m.status + " · " + m.count + " org";
    const t = document.createElement("p"); t.textContent = m.message;
    const d = document.createElement("small"); d.textContent = m.date;
    w.append(n, b, t, d); box.appendChild(w);
  });
}
$("rsvpForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("fName").value.trim(), message = $("fMsg").value.trim(), info = $("formInfo");
  if (!name || !message) { info.textContent = "Mohon lengkapi nama dan ucapan."; return; }
  const list = load();
  list.unshift({ name, message, count: $("fCount").value, status: $("fStatus").value,
    date: new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) });
  info.textContent = save(list) ? "Terima kasih! Ucapan Anda tersimpan 🤍" : "Gagal menyimpan (penyimpanan browser nonaktif).";
  $("fMsg").value = ""; render();
  setTimeout(() => { info.textContent = ""; }, 4000);
});
render();

/* 8. Salin rekening */
function fallbackCopy(text) {
  const t = document.createElement("textarea");
  t.value = text; t.style.cssText = "position:fixed;opacity:0";
  document.body.appendChild(t); t.select();
  let ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
  document.body.removeChild(t); return ok;
}
document.querySelectorAll(".copy-btn").forEach((btn) => btn.addEventListener("click", () => {
  const text = $(btn.dataset.target).textContent.trim();
  const done = (ok) => {
    const old = btn.textContent;
    btn.textContent = ok ? "✓ Berhasil Disalin" : "Gagal, salin manual";
    setTimeout(() => { btn.textContent = old; }, 2000);
  };
  if (navigator.clipboard && window.isSecureContext)
    navigator.clipboard.writeText(text).then(() => done(true)).catch(() => done(fallbackCopy(text)));
  else done(fallbackCopy(text));
}));

/* 9. Bagikan via WhatsApp */
$("shareBtn").addEventListener("click", () => {
  const url = location.href.split("?")[0];
  window.open("https://wa.me/?text=" + encodeURIComponent(CONFIG.shareText + "\n" + url), "_blank");
});

/* 10. Kelopak bunga berjatuhan (ubah angka 16 untuk jumlah kelopak) */
(function () {
  const box = $("petals"), colors = ["#f3b5c0", "#f8d0d6", "#e59aa9", "#fff"];
  for (let i = 0; i < 16; i++) {
    const p = document.createElement("span"); p.className = "petal";
    const size = 8 + Math.random() * 8;
    p.style.cssText = "left:" + Math.random() * 100 + "%;width:" + size + "px;height:" + size * 1.4 +
      "px;background:" + colors[i % colors.length] + ";animation-duration:" + (9 + Math.random() * 9) +
      "s;animation-delay:-" + Math.random() * 15 + "s";
    box.appendChild(p);
  }
})();
