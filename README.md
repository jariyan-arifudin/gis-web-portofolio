# Portofolio GIS — Jariyan Arifudin

Website statis modular (HTML, CSS, dan JS terpisah, tanpa build step). Mendukung switch bahasa (**ID / EN**), mode **Gelap / Terang**, serta peta interaktif MapTiler dengan pilihan basemap **Minimal**, **Topografi**, dan **Satelit**.

## Struktur Folder

```text
portfolio-gis-jariyan/
├── index.html             Halaman beranda (hero, proyek + peta, tentang & kontak)
├── project.html           Halaman studi kasus proyek (?p=slug)
├── README.md              Panduan penggunaan & deploy
└── assets/
    ├── cv.pdf             File CV siap unduh
    ├── img/
    │   └── profile.jpg    Foto profil (taruh layout peta & foto lapangan di folder ini)
    ├── css/
    │   └── style.css      Seluruh styling (termasuk mode gelap/terang & kartu profile.exe)
    └── js/
        ├── data.js        Data bilingual (ID/EN) profil, pengalaman, & 10 proyek
        ├── common.js      Helper peta MapTiler, switch bahasa, tema, & koordinat
        ├── main.js        Logika halaman beranda
        └── project.js     Logika halaman detail studi kasus
```

## Menjalankan Preview Lokal

Buka terminal di dalam folder ini lalu jalankan:

```bash
python3 -m http.server 8000
```

Buka `http://localhost:8000` di browser.

## Menambah Layout Peta & Foto Lapangan

1. Simpan gambar di `assets/img/` (disarankan lebar ±1600 px, ukuran <500 KB).
2. Buka `assets/js/data.js`, lalu isi field `cover` dan `photos` pada proyek terkait:
   ```js
   cover: "assets/img/tirta-pulejajar-layout.jpg",
   photos: [
     { src: "assets/img/tirta-1.jpg", caption: "Pengambilan data UAV di Jepitu" }
   ],
   ```

## Keamanan Kunci API MapTiler

Kunci API MapTiler berada di `assets/js/common.js`. Sebelum publikasi (misalnya di GitHub Pages), batasi kunci API pada dashboard MapTiler (*Account → API keys → Allowed HTTP origins*) agar hanya dapat digunakan oleh domain situsmu dan `localhost`.
