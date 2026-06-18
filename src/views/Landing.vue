<template>
  <div class="rgd">
    <!-- Üst menü -->
    <header class="nav" :class="{ scrolled }">
      <a href="#top" class="logo">
        <img src="/logo-mark.svg" alt="RGD" />
        <span>RGD</span>
      </a>
      <nav class="links">
        <a href="#hakkimizda">Hakkımızda</a>
        <a href="#uretim">Üretim</a>
        <a href="#projeler">Projeler</a>
        <a href="#referanslar">Referanslar</a>
        <a href="#iletisim" class="cta">İletişim</a>
      </nav>
    </header>

    <!-- Hero -->
    <section id="top" class="hero">
      <div class="hero-in">
        <span class="kicker">PRESİZYON METAL ÜRETİMİ</span>
        <h1>Hassas talaşlı imalatta<br /><b>güvenilir üretim ortağınız</b></h1>
        <p>
          CNC talaşlı imalattan yüzey işlemine, kaynaklı imalattan kalite kontrole kadar
          uçtan uca üretim süreçlerini tek çatı altında yönetiyoruz.
        </p>
        <div class="hero-btns">
          <a href="#iletisim" class="btn primary">Teklif Alın</a>
          <a href="#uretim" class="btn ghost">Üretim Yeteneklerimiz</a>
        </div>
      </div>
      <div class="hero-glow" />
    </section>

    <!-- Biz kimiz -->
    <section id="hakkimizda" class="about">
      <div class="about-text">
        <span class="sec-kicker">BİZ KİMİZ</span>
        <h2>Üretimde deneyim, teslimatta istikrar</h2>
        <p>
          RGD, metal işleme ve talaşlı imalat alanında faaliyet gösteren bir üretim
          firmasıdır. Otomotivden enerjiye, makine imalatından savunmaya kadar farklı
          sektörlere; sıfır hata hedefiyle, zamanında ve izlenebilir üretim sunarız.
        </p>
        <p>
          Her siparişi ham malzemeden sevkiyata kadar dijital olarak takip eder,
          müşterilerimize üretimin her aşamasında şeffaflık sağlarız.
        </p>
      </div>
      <div class="stats">
        <div class="stat"><b>15+</b><span>yıl deneyim</span></div>
        <div class="stat"><b>250K+</b><span>yıllık parça üretimi</span></div>
        <div class="stat"><b>40+</b><span>aktif müşteri</span></div>
        <div class="stat"><b>%99</b><span>zamanında teslimat</span></div>
      </div>
    </section>

    <!-- Üretim yetenekleri -->
    <section id="uretim" class="cap">
      <div class="sec-head">
        <span class="sec-kicker">NE YAPIYORUZ</span>
        <h2>Üretim Yeteneklerimiz</h2>
      </div>
      <div class="cards">
        <article v-for="c in caps" :key="c.title" class="card lift">
          <i :class="['pi', c.icon]" />
          <h3>{{ c.title }}</h3>
          <p>{{ c.desc }}</p>
        </article>
      </div>
    </section>

    <!-- Projeler / ürünler -->
    <section id="projeler" class="proj">
      <div class="sec-head">
        <span class="sec-kicker">ÜRÜNLER & PROJELER</span>
        <h2>Öne Çıkan İşlerimiz</h2>
      </div>
      <div class="proj-grid">
        <article v-for="p in projects" :key="p.name" class="proj-card lift">
          <div class="proj-img"><i class="pi pi-cog" /></div>
          <div class="proj-body">
            <span class="proj-tag">{{ p.tag }}</span>
            <h3>{{ p.name }}</h3>
            <p>{{ p.desc }}</p>
          </div>
        </article>
      </div>
    </section>

    <!-- Referanslar -->
    <section id="referanslar" class="refs">
      <div class="sec-head">
        <span class="sec-kicker">REFERANSLAR</span>
        <h2>Birlikte Çalıştığımız Markalar</h2>
      </div>
      <div class="ref-row">
        <span v-for="r in refs" :key="r" class="ref">{{ r }}</span>
      </div>
    </section>

    <!-- İletişim -->
    <section id="iletisim" class="contact">
      <div class="contact-in">
        <div class="contact-text">
          <span class="sec-kicker light">İLETİŞİM</span>
          <h2>Projenizi konuşalım</h2>
          <p>Teklif talepleriniz ve üretim sorularınız için bize ulaşın.</p>
          <ul class="contact-list">
            <li><i class="pi pi-map-marker" /> Organize Sanayi Bölgesi, Türkiye</li>
            <li><i class="pi pi-phone" /> +90 (212) 555 10 00</li>
            <li><i class="pi pi-envelope" /> info@rgd.com.tr</li>
          </ul>
        </div>
        <form class="contact-form" @submit.prevent="submitted = true">
          <input type="text" placeholder="Ad Soyad / Firma" required />
          <input type="email" placeholder="E-posta" required />
          <textarea rows="4" placeholder="Mesajınız" required />
          <button type="submit" class="btn primary">Gönder</button>
          <p v-if="submitted" class="form-ok">Teşekkürler! En kısa sürede dönüş yapacağız. (örnek form)</p>
        </form>
      </div>
    </section>

    <footer class="foot">
      <div class="foot-in">
        <a href="#top" class="logo"><img src="/logo-mark.svg" alt="RGD" /><span>RGD</span></a>
        <span class="copy">© {{ year }} RGD · Tüm hakları saklıdır.</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const year = new Date().getFullYear();
const scrolled = ref(false);
const submitted = ref(false);

const caps = [
  { icon: "pi-cog", title: "CNC Talaşlı İmalat", desc: "CNC torna ve işleme merkezlerinde yüksek toleranslı, seri ve prototip parça üretimi." },
  { icon: "pi-bolt", title: "Kaynaklı İmalat", desc: "Boru ve sac parçalarda hassas kaynak, montaj ve birleştirme operasyonları." },
  { icon: "pi-shield", title: "Yüzey İşlem & Kaplama", desc: "Galvaniz, polisaj ve koruyucu yüzey işlemleriyle dayanıklı son ürün." },
  { icon: "pi-check-circle", title: "Kalite Kontrol", desc: "Ölçüm ve ara kontrollerle her aşamada izlenebilir, raporlanabilir kalite." },
];

const projects = [
  { tag: "Otomotiv", name: "Ring", desc: "Yüksek hassasiyetli CNC torna ringleri; galvaniz kaplamalı, seri üretim." },
  { tag: "Enerji", name: "Ring Separatör (Boru)", desc: "Kaynaklı boru separatörleri; çok aşamalı üretim rotası ve kalite kontrol." },
  { tag: "Makine", name: "Özel Talaşlı Parçalar", desc: "Müşteriye özel teknik resme göre prototipten seri üretime parça imalatı." },
];

const refs = ["Akın Makina", "Boran Otomotiv", "Ceylan Enerji", "Demir CNC", "Anadolu Galvaniz", "Usta Kaynak"];

function onScroll() {
  scrolled.value = window.scrollY > 20;
}
onMounted(() => window.addEventListener("scroll", onScroll, { passive: true }));
onUnmounted(() => window.removeEventListener("scroll", onScroll));
</script>

<style scoped>
.rgd {
  --blue: #1488c8;
  --deep: #0c2840;
  --deep2: #115c88;
  scroll-behavior: smooth;
  color: #0f172a;
  background: #fff;
}
:global(html) { scroll-behavior: smooth; }

/* Nav */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 6vw; transition: all 0.25s ease;
}
.nav.scrolled {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  box-shadow: 0 1px 14px rgba(15, 23, 42, 0.08);
  padding: 10px 6vw;
}
.logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 20px; }
.logo img { width: 30px; height: 30px; background: #fff; border-radius: 8px; padding: 3px; }
.nav .logo span { color: #fff; }
.nav.scrolled .logo span { color: var(--deep); }
.links { display: flex; align-items: center; gap: 26px; }
.links a { color: rgba(255, 255, 255, 0.9); font-weight: 600; font-size: 15px; transition: color 0.15s; }
.links a:hover { color: #fff; }
.nav.scrolled .links a { color: #334155; }
.nav.scrolled .links a:hover { color: var(--blue); }
.links .cta {
  background: var(--blue); color: #fff !important; padding: 9px 18px; border-radius: 9px;
}
.links .cta:hover { background: #0f6fa6; }

/* Hero */
.hero {
  position: relative; overflow: hidden;
  background: linear-gradient(150deg, var(--deep2) 0%, var(--deep) 70%);
  color: #fff; padding: 180px 6vw 120px;
}
.hero-in { max-width: 820px; position: relative; z-index: 2; }
.kicker { color: #66b8e6; font-weight: 700; letter-spacing: 2px; font-size: 13px; }
.hero h1 { font-size: clamp(32px, 5vw, 56px); line-height: 1.1; margin: 16px 0 18px; font-weight: 800; }
.hero h1 b { color: #66b8e6; }
.hero p { font-size: 18px; color: #cfe8f8; max-width: 620px; line-height: 1.6; }
.hero-btns { display: flex; gap: 14px; margin-top: 34px; flex-wrap: wrap; }
.hero-glow {
  position: absolute; right: -120px; top: -80px; width: 540px; height: 540px;
  background: radial-gradient(circle, rgba(47, 157, 219, 0.35), transparent 60%);
  z-index: 1;
}

.btn {
  display: inline-block; padding: 13px 26px; border-radius: 11px; font-weight: 700; font-size: 15px;
  transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s;
}
.btn:hover { transform: translateY(-2px); }
.btn.primary { background: var(--blue); color: #fff; box-shadow: 0 8px 20px rgba(20, 136, 200, 0.35); }
.btn.primary:hover { background: #0f6fa6; }
.btn.ghost { background: rgba(255, 255, 255, 0.1); color: #fff; border: 1px solid rgba(255, 255, 255, 0.25); }

/* Section helpers */
section { padding: 90px 6vw; }
.sec-head { text-align: center; max-width: 700px; margin: 0 auto 50px; }
.sec-kicker { color: var(--blue); font-weight: 700; letter-spacing: 2px; font-size: 13px; }
.sec-kicker.light { color: #66b8e6; }
h2 { font-size: clamp(26px, 3.4vw, 38px); font-weight: 800; margin: 10px 0 0; }

/* About */
.about {
  display: grid; grid-template-columns: 1.3fr 1fr; gap: 60px; align-items: center;
  max-width: 1180px; margin: 0 auto;
}
.about p { color: #475569; line-height: 1.7; font-size: 16px; margin: 16px 0 0; }
.about-text h2 { margin-top: 10px; }
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.stat {
  background: #f8fafc; border: 1px solid #eef2f7; border-radius: 16px; padding: 22px;
}
.stat b { display: block; font-size: 30px; color: var(--blue); font-weight: 800; }
.stat span { color: #64748b; font-size: 14px; }

/* Capabilities */
.cap { background: #f8fafc; }
.cards { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; }
.card {
  background: #fff; border: 1px solid #eef2f7; border-radius: 18px; padding: 28px 22px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}
.card i {
  font-size: 24px; color: var(--blue); background: #e8f4fb;
  width: 52px; height: 52px; border-radius: 13px; display: grid; place-items: center; margin-bottom: 16px;
}
.card h3 { margin: 0 0 8px; font-size: 18px; }
.card p { color: #64748b; font-size: 14.5px; line-height: 1.6; margin: 0; }

/* Projects */
.proj-grid { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; }
.proj-card { background: #fff; border: 1px solid #eef2f7; border-radius: 18px; overflow: hidden; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05); }
.proj-img {
  height: 160px; background: linear-gradient(135deg, #1488c8, #0c2840);
  display: grid; place-items: center;
}
.proj-img i { font-size: 52px; color: rgba(255, 255, 255, 0.85); }
.proj-body { padding: 22px; }
.proj-tag { font-size: 12px; font-weight: 700; color: var(--blue); background: #e8f4fb; padding: 4px 10px; border-radius: 20px; }
.proj-body h3 { margin: 12px 0 8px; font-size: 19px; }
.proj-body p { color: #64748b; font-size: 14.5px; line-height: 1.6; margin: 0; }

/* References */
.refs { background: #f8fafc; }
.ref-row { max-width: 1000px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; }
.ref {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 28px;
  font-weight: 700; color: #475569; font-size: 16px;
}

/* Contact */
.contact { background: linear-gradient(150deg, var(--deep2) 0%, var(--deep) 80%); color: #fff; }
.contact-in { max-width: 1080px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
.contact h2 { margin-top: 10px; }
.contact-text p { color: #cfe8f8; margin: 14px 0 22px; }
.contact-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px; }
.contact-list li { display: flex; align-items: center; gap: 12px; color: #e2eef7; }
.contact-list i { color: #66b8e6; width: 20px; }
.contact-form { display: flex; flex-direction: column; gap: 12px; background: rgba(255, 255, 255, 0.06); padding: 26px; border-radius: 18px; border: 1px solid rgba(255, 255, 255, 0.1); }
.contact-form input, .contact-form textarea {
  background: rgba(255, 255, 255, 0.95); border: none; border-radius: 10px; padding: 13px 15px;
  font-size: 15px; font-family: inherit; color: #0f172a; resize: vertical;
}
.contact-form input:focus, .contact-form textarea:focus { outline: 2px solid var(--blue); }
.form-ok { color: #86efac; font-size: 14px; margin: 4px 0 0; }

/* Footer */
.foot { background: #08202f; color: #cfe8f8; padding: 28px 6vw; }
.foot-in { max-width: 1180px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.foot .logo span { color: #fff; }
.copy { font-size: 13.5px; color: #7fb4d6; }

@media (max-width: 860px) {
  .links { display: none; }
  .about, .contact-in { grid-template-columns: 1fr; gap: 32px; }
  .cards { grid-template-columns: 1fr 1fr; }
  .proj-grid { grid-template-columns: 1fr; }
  .hero { padding: 130px 6vw 80px; }
}
@media (max-width: 520px) {
  .cards, .stats { grid-template-columns: 1fr; }
}
</style>
