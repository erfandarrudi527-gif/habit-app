/* ═══════ عادت‌یار — منطق اپ ═══════ */

const $ = (s) => document.querySelector(s);
const fa = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
const todayKey = () => new Date().toISOString().slice(0, 10);
const pad2 = (n) => String(n).padStart(2, "0");
const faTime = (t) => t ? fa(t).replace(":", "‌:") : ""; // ساعت فارسی با ارقام فارسی

/* ─── ریست با #reset (برای نمایش دوباره‌ی حالت اولیه) ─── */
if (location.hash === "#reset" || location.search.includes("reset")) {
  localStorage.removeItem("rulesSeen");
  localStorage.removeItem("habits");
  localStorage.removeItem("notified");
}

/* ─── وضعیت ─── */
const SEED = [
  { id: 1, title: "کتاب خواندن", streak: 13, time: "22:30", anchor: "", doneOn: null },
];
if (localStorage.getItem("habitsVer") !== "2") {
  localStorage.setItem("habits", JSON.stringify(SEED));
  localStorage.setItem("habitsVer", "2");
}
const state = {
  rulesSeen: localStorage.getItem("rulesSeen") === "1",
  habits: JSON.parse(localStorage.getItem("habits") || "null") || SEED,
};
const save = () => {
  localStorage.setItem("habits", JSON.stringify(state.habits));
  Notifier && Notifier.syncAlarms && Notifier.syncAlarms();
};

/* ═══════ سیستم نوتیفیکشن ═══════ */
const Native = (window.AndroidBridge && typeof AndroidBridge.schedule === "function") ? AndroidBridge : null;

const Notifier = {
  supported: !!Native || "Notification" in window,

  requestPermission() {
    if (Native) { Native.askPermission(); toast("🔔 نوتیفیکشن فعال شد!"); $("#btn-bell").classList.add("on"); return; }
    if (!("Notification" in window)) { toast("مرورگر تو از نوتیفیکشن پشتیبانی نمی‌کنه — یادآور داخل اپ نشان داده می‌شه"); return; }
    Notification.requestPermission().then((p) => {
      if (p === "granted") { $("#btn-bell").classList.add("on"); toast("🔔 نوتیفیکشن فعال شد!"); }
      else toast("اجازه نوتیفیکشن داده نشد — یادآور فقط داخل اپ می‌آید");
    });
  },

  push(habit) {
    const body = `وقت «${habit.title}» شد ⏰ — یادت نره تیکش رو بزنی!`;
    if (Native) { Native.notify("عادت‌یار 🔔", body); return; }
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const n = new Notification("عادت‌یار 🔔", { body, tag: "habit-" + habit.id });
        n.onclick = () => { window.focus(); showScreen("#screen-home"); n.close(); };
      } catch { toast(body); }
    } else {
      toast(body); // fallback داخل اپ
    }
  },

  /* ثبت آلارم واقعی اندروید (روزانه، حتی وقتی اپ بسته است) */
  syncAlarms() {
    if (!Native) return;
    const active = new Set();
    state.habits.forEach((h) => {
      if (!h.time) return;
      const [hh, mm] = h.time.split(":").map(Number);
      Native.schedule(h.id % 100000, h.title, hh, mm);
      active.add(h.id);
    });
    // لغو آلارم عادت‌های حذف‌شده
    (JSON.parse(localStorage.getItem("alarmed") || "[]")).forEach((id) => {
      if (!active.has(id)) Native.unschedule(id % 100000);
    });
    localStorage.setItem("alarmed", JSON.stringify([...active]));
  },

  /* هر ۲۰ ثانیه ساعت را با یادآورهای عادت‌ها مقایسه می‌کند (فقط وب — در اندروید آلارم بومی است) */
  start() {
    if (Native) return;
    setInterval(() => {
      const now = new Date();
      const hm = pad2(now.getHours()) + ":" + pad2(now.getMinutes());
      const firedKey = localStorage.getItem("notified") || "";
      const fired = new Set(firedKey.split(",").filter(Boolean));
      const stamp = todayKey() + "T" + hm;
      let changed = false;
      state.habits.forEach((h) => {
        if (h.time === hm && !fired.has(h.id + "@" + stamp) && h.doneOn !== todayKey()) {
          fired.add(h.id + "@" + stamp);
          changed = true;
          this.push(h);
        }
      });
      if (changed) localStorage.setItem("notified", [...fired].join(","));
    }, 20000);
  },
};

/* ─── توست داخل اپ ─── */
function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.querySelector(".phone").appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), 4200);
}

/* ─── تاریخ امروز (شمسی) ─── */
function persianToday() {
  try {
    const parts = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { day: "numeric", month: "long" }).formatToParts(new Date());
    const d = parts.find((p) => p.type === "day")?.value || "";
    const m = parts.find((p) => p.type === "month")?.value || "";
    return `${d} ${m}`;
  } catch {
    return "۲۳ شهریور";
  }
}

/* ─── ناوبری بین صفحه‌ها ─── */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  // setTimeout به‌جای rAF — در تب‌های مخفی هم اجرا می‌شود
  setTimeout(() => $(id).classList.add("active"), 60);
}

/* ─── رندر لیست عادت‌ها ─── */
const TOTAL_DOTS = 44;

function habitCard(h) {
  const done = h.doneOn === todayKey();
  const card = document.createElement("div");
  card.className = "habit-card" + (done ? " done" : "");

  const litDots = Math.min(h.streak, TOTAL_DOTS);
  const dots = Array.from({ length: TOTAL_DOTS }, (_, i) =>
    `<span class="dot${i < litDots ? " on" : ""}"></span>`
  ).join("");

  card.innerHTML = `
    <div class="habit-row1">
      <button class="habit-check" aria-label="تیک انجام">
        <svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <span class="habit-title"></span>
      <button class="habit-close" aria-label="حذف">✕</button>
    </div>
    <div class="habit-row2">
      <span class="streak"><b>${fa(h.streak)}</b> روز پیاپی</span>
      <span class="dots">${dots}</span>
    </div>
    <div class="habit-row3">
      <span class="habit-reminder"></span>
      <button class="habit-settings">تنظیمات</button>
    </div>`;

  card.querySelector(".habit-title").textContent = h.title;
  card.querySelector(".habit-reminder").innerHTML = h.time
    ? `⏰ <span dir="ltr">${faTime(h.time)}</span>`
    : (h.anchor ? "🔗 " + h.anchor : "بدون یادآور");

  card.querySelector(".habit-check").addEventListener("click", () => {
    if (h.doneOn === todayKey()) {
      h.doneOn = null;
      h.streak = Math.max(0, h.streak - 1);
    } else {
      h.doneOn = todayKey();
      h.streak += 1;
    }
    save();
    renderHabits();
  });

  card.querySelector(".habit-close").addEventListener("click", () => {
    card.classList.add("removing");
    setTimeout(() => {
      state.habits = state.habits.filter((x) => x.id !== h.id);
      save();
      renderHabits();
    }, 320);
  });

  card.querySelector(".habit-settings").addEventListener("click", () => {
    const t = prompt("عنوان جدید عادت:", h.title);
    if (t && t.trim()) { h.title = t.trim(); save(); renderHabits(); }
  });

  return card;
}

function renderHabits() {
  const list = $("#habit-list");
  list.innerHTML = "";
  if (state.habits.length === 0) {
    list.innerHTML = `<div class="empty-hint">هنوز عادتی نداری 🌱<br>اولین روتینت رو بساز!</div>`;
  } else {
    state.habits.forEach((h, i) => {
      const c = habitCard(h);
      c.style.animationDelay = `${i * 0.08}s`;
      list.appendChild(c);
    });
  }
  const n = state.habits.length;
  $("#add-habit-label").textContent = n >= 3 ? "سقف ۳ عادت پر شده (۳/۳)" : `افزودن عادت جدید (${fa(n)}/۳)`;
  $("#btn-add-habit").disabled = n >= 3;
}

/* ─── پیکر ساعت چرخشی ─── */
let pickedTime = "";

function buildWheel(el, count, sel) {
  el.innerHTML = "";
  const pad = document.createElement("li");
  pad.className = "wheel-pad";
  el.appendChild(pad);
  for (let i = 0; i < count; i++) {
    const li = document.createElement("li");
    li.textContent = fa(pad2(i));
    li.dataset.val = pad2(i);
    li.addEventListener("click", () => {
      el.scrollTo({ top: (i) * 44, behavior: "smooth" });
    });
    el.appendChild(li);
  }
  const pad2el = pad.cloneNode();
  el.appendChild(pad2el);
  el._count = count;
  if (sel !== null) el.scrollTo({ top: sel * 44 });
}

function wheelValue(el) {
  const idx = Math.round(el.scrollTop / 44);
  return Math.max(0, Math.min(el._count - 1, idx));
}

function syncPicker() {
  const hEl = $("#wheel-hour"), mEl = $("#wheel-minute");
  const hv = wheelValue(hEl), mv = wheelValue(mEl);
  hEl.querySelectorAll("li:not(.wheel-pad)").forEach((li, i) => li.classList.toggle("sel", i === hv));
  mEl.querySelectorAll("li:not(.wheel-pad)").forEach((li, i) => li.classList.toggle("sel", i === mv));
  $("#picker-preview").textContent = fa(pad2(hv) + ":" + pad2(mv));
}

function openPicker() {
  const [h, m] = pickedTime ? pickedTime.split(":") : ["08", "00"];
  buildWheel($("#wheel-hour"), 24, +h);
  buildWheel($("#wheel-minute"), 60, +m);
  syncPicker();
  $("#time-picker").classList.add("open");
}

function setTimeText() {
  const t = $("#f-time-text");
  if (pickedTime) {
    t.textContent = fa(pickedTime);
    t.className = "time-value";
    t.setAttribute("dir", "ltr");
  } else {
    t.textContent = "انتخاب کن…";
    t.className = "time-placeholder";
  }
}

$("#f-time-btn").addEventListener("click", openPicker);
$("#wheel-hour").addEventListener("scroll", () => { clearTimeout(window._pt); window._pt = setTimeout(syncPicker, 90); });
$("#wheel-minute").addEventListener("scroll", () => { clearTimeout(window._pt); window._pt = setTimeout(syncPicker, 90); });
$("#picker-close").addEventListener("click", () => $("#time-picker").classList.remove("open"));
$("#picker-ok").addEventListener("click", () => {
  const hv = wheelValue($("#wheel-hour")), mv = wheelValue($("#wheel-minute"));
  pickedTime = pad2(hv) + ":" + pad2(mv);
  setTimeText();
  $("#time-picker").classList.remove("open");
});

/* ─── اتصال دکمه‌ها ─── */
$("#btn-got-it").addEventListener("click", () => {
  state.rulesSeen = true;
  localStorage.setItem("rulesSeen", "1");
  showScreen("#screen-home");
});

$("#btn-add-habit").addEventListener("click", () => showScreen("#screen-create"));
$("#btn-cancel").addEventListener("click", () => showScreen("#screen-home"));
$("#btn-bell").addEventListener("click", () => Notifier.requestPermission());

$("#create-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const titleEl = $("#f-title");
  const title = titleEl.value.trim();
  if (!title) {
    titleEl.classList.remove("error");
    void titleEl.offsetWidth; // ری‌استارت انیمیشن
    titleEl.classList.add("error");
    titleEl.focus();
    return;
  }
  if (state.habits.length >= 3) { showScreen("#screen-home"); return; }

  const time = pickedTime; // ممکن است خالی باشد (اختیاری)

  state.habits.push({
    id: Date.now(),
    title,
    streak: 0,
    time,
    anchor: $("#f-anchor").value.trim(),
    doneOn: null,
  });
  save();
  e.target.reset();
  pickedTime = "";
  setTimeText();
  renderHabits();
  showScreen("#screen-home");
  if (time) toast(`⏰ یادآور «${title}» روی ساعت ${faTime(time)} تنظیم شد`);
});

/* ─── شروع ─── */
/* تست سریع نوتیفیکشن: #test-notify */
if (location.hash === "#test-notify") {
  setTimeout(() => Notifier.push({ id: "test", title: "تست یادآور" }), 500);
}
if (Native) {
  $("#btn-bell").classList.add("on");
} else if ("Notification" in window && Notification.permission === "granted") {
  $("#btn-bell").classList.add("on");
}
$("#today-date").textContent = persianToday();
renderHabits();
Notifier.start();
Notifier.syncAlarms(); // ثبت دوباره آلارم‌ها بعد از هر باز شدن اپ (ریستارت گوشی)
/* قوانین هر بار که صفحه باز/رفرش می‌شود نشان داده می‌شود */
showScreen("#screen-rules");
