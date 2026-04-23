[README.md](https://github.com/user-attachments/files/26990258/README.md)
# 🚀 Namify Renamer

**Namify Renamer**, dosyalarınızı profesyonel, hızlı ve tamamen özelleştirilebilir bir şekilde yeniden adlandırmanız için tasarlanmış modern bir masaüstü uygulamasıdır. Karmaşık dosya yığınlarını düzenlemek artık saniyeler sürüyor! ✨

![Namify Logo](/icon2.png)

---

## 🌟 Öne Çıkan Özellikler

### 📂 Çok Yönlü Yeniden Adlandırma Kuralları
- **Bul ve Değiştir:** Belirli metinleri bulun ve istediğinizle değiştirin.
- **Önek & Sonek:** Dosya isimlerinin başına veya sonuna hızlıca eklemeler yapın.
- **Akıllı Numaralandırma:** İstediğiniz sayıdan başlayın, artış miktarını belirleyin ve basamak sayısını (001, 01 vb.) ayarlayın.
- **Harf Dönüşümü:** Tümü büyük, tümü küçük, sadece ilk harf büyük gibi seçeneklerle metin formatını düzeltin.
- **Gelişmiş Karakter Temizliği:** Boşlukları kaldırın, özel karakterleri temizleyin veya kendi belirttiğiniz karakterleri ayıklayın.
- **Regex Desteği:** Düzenli ifadeler (Regular Expressions) kullanarak profesyonel arama ve değiştirme yapın.
- **Uzantı Yönetimi:** Dosya uzantılarını toplu halde güvenle değiştirin.
- **Tarih Ekleme:** Dosyalara otomatik olarak işlem tarihini farklı formatlarda ekleyin.

### 📋 Dinamik Liste Yönetimi
- **Kendi Listeni Oluştur:** Sadece bir liste değil, istediğin kadar "Liste İsimlendirme" kuralı ekleyebilirsin.
- **İsimlendirme ve Düzenleme:** Her bir listenin adını sen belirle (Örn: "Proje_Dosyalari", "Musteri_ID_Listesi").
- **Hızlı Silme:** İhtiyacın olmayan listeleri tek tıkla kaldır.
- **Otomatik Kayıt:** Yazdığın her şey anında kaydedilir, programı kapatıp açtığında kaldığın yerden devam edersin.

### 🎨 Modern ve Esnek Arayüz (UX/UI)
- **Esnek Panel (Split/Stack View):** İstersen kuralları ve önizlemeyi alt alta, istersen yan yana gör!
- **Klasör Mantığı Genişletme:** Orta sütunu fareyle tutup sürükleyerek önizleme alanını istediğin kadar büyütüp küçültebilirsin.
- **Koyu & Açık Tema:** Göz yormayan "Midnight" modu veya klasik "Light" modu arasında geçiş yap. (İlk açılışta sistem temanı otomatik algılar!)
- **Canlı Önizleme:** Her değişikliği dosyaları gerçekten adlandırmadan önce "Eski Ad ➔ Yeni Ad" şeklinde anında gör.

### 🛠 Teknik Üstünlükler
- **Geri Al (Undo) Sistemi:** Yanlış mı yaptın? Hiç sorun değil! İşlem geçmişinden son 50 işlemini tek tıkla geri alarak dosyaları eski haline döndürebilirsin.
- **Hızlı ve Hafif:** Electron ve Vite teknolojisi sayesinde düşük RAM kullanımı ve yüksek hız.
- **Otomatik Güncelleme:** Yeni bir özellik geldiğinde program seni otomatik olarak uyarır ve tek tıkla güncel kalmanı sağlar.

---

## 🚀 Kurulum

1. En güncel sürümü [Sürümler (Releases)](https://github.com/knutolof06/namify-renamer/releases) sayfasından indirin.
2. `Namify-Renamer-Setup-x.x.x.exe` dosyasını çalıştırın.
3. Kurulum tamamlandığında uygulama otomatik olarak açılacaktır.

---

## 📖 Kullanım Kılavuzu

1. **Dosya Ekle:** Dosyaları sürükleyip uygulama alanına bırakın veya klasör seçin.
2. **Kural Seç:** Sol panelden (veya üstten) aktif etmek istediğin kuralları seç.
3. **Değer Gir:** İlgili alanları (Bul, Değiştir, Liste vb.) doldur.
4. **Önizle:** Sağ/Alt paneldeki canlı önizlemeyi kontrol et.
5. **Uygula:** "Yeniden Adlandır" butonuna bas ve işlemin tadını çıkar!

> **İpucu:** Eğer çok fazla dosya ile çalışıyorsan, sağ üstteki "Görünümü Değiştir" butonuna basarak yan yana (Split View) moduna geçebilirsin. Bu modda orta çizgiyi sürükleyerek alanı genişletebilirsin.

---

## 💻 Geliştiriciler İçin

Proje üzerinde geliştirme yapmak isterseniz:

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme modunda çalıştırın
npm run electron:dev

# Uygulamayı paketleyin
npm run build:app
```

---

## 🛡 Lisans & İletişim

Bu proje **MIT Lisansı** altında korunmaktadır. Her türlü geri bildirim ve öneri için GitHub üzerinden Issue açabilir veya iletişime geçebilirsiniz.

Geliştiren: **Antigravity** (ve işbirliğiyle!)
GitHub: [knutolof06/namify-renamer](https://github.com/knutolof06/namify-renamer)

---
*Namify ile dosyalarınızı isimlendirirken özgürlüğün tadını çıkarın!* 🚀
