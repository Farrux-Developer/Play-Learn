# Oʻyna va oʻrgan — Algoritm Ustaxonasi

Statik taʼlimiy oʻyin platformasi (server va bundler talab qilmaydi).

## Ishga tushirish

1. `index.html` faylini brauzerda ikki marta bosish orqali oching (`file://` rejimida toʻliq ishlaydi).
2. Yoki istalgan statik server / preview orqali oching.
3. Progress brauzerning `localStorage` xotirasida saqlanadi; tozalash uchun yuqori chapdagi logotipni 3 soniya bosib turing.

## Oflayn demo uchun `/vendor/` kutubxonalari (aniq versiyalar)

Internet boʻlmagan taqdimot uchun quyidagi fayllarni yuklab olib, `/vendor/` papkasiga saqlashingiz mumkin:

- GSAP `3.13.0`:
  - `https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js`
  - `https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js`
  - `https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js`
  - `https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/Flip.min.js`
  - `https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/Draggable.min.js`
  - `https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/MotionPathPlugin.min.js`
  - `https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/DrawSVGPlugin.min.js`
- Motion `12.23.24`:
  - `https://cdn.jsdelivr.net/npm/motion@12.23.24/dist/motion.js`
- Lucide `0.553.0`:
  - `https://cdn.jsdelivr.net/npm/lucide@0.553.0/dist/umd/lucide.min.js`
- Google Fonts (`Onest` + `JetBrains Mono`, `latin-ext,cyrillic-ext`):
  - `https://fonts.googleapis.com/css2?family=Onest:wght@500;600;700;800&family=JetBrains+Mono:wght@500;600;700&subset=latin-ext,cyrillic-ext&display=swap`
