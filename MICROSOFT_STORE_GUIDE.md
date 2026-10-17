# Namify Renamer — Microsoft Store Yayın Rehberi

Microsoft Store geliştiri hesabı açtığın için tebrikler! Electron tabanlı bir uygulamayı (.exe) doğrudan Microsoft Store'a yükleyemezsin; uygulamanın Windows 10/11 Evrensel Uygulama Paketi olan **`.appx`** formatına çevrilmesi gerekir. İşleri senin için çoktan kolaylaştırdım. 

## Adım 1: Microsoft Partner Center'dan Gerekli Kimlikleri Alma

Microsoft Store'a uygulama yüklemek için paket kodunun (Package) senin hesabınla dijital olarak **damgalanmış** olması gerekir.
Bunu yapabilmek için:

1. [Microsoft Partner Center (Geliştirici Merkezi)](https://partner.microsoft.com/dashboard/windows/overview) paneline giriş yap.
2. **"Create a new app"** (Yeni bir uygulama oluştur) butonuna tıkla ve uygulaman için Store'da gözükecek ismi rezerve et (örn: `Namify Renamer`).
3. İsim doğrulandıktan sonra, sol paneldeki **App Management > App Identity** (Uygulama Yönetimi > Uygulama Kimliği) sekmesine git.
4. Bu sayfada göreceğin **3 kritik bilgiyi** bir yere kopyala:
   - **Package/Identity Name** (Örn: `12314BurhanOmer.NamifyRenamer`)
   - **Publisher ID** (Örn: `CN=8F3A22-ABCD-1234-XYZ-555555`)
   - **Publisher Display Name** (Örn: `Burhan Omer Studios`)

---

## Adım 2: package.json Dosyasını Düzenleme

Önceki adımda kopyaladığın verileri projedeki `package.json` dosyasına yerleştirmen gerekiyor. `package.json` dosyasını açıp **"appx"** blokunu bul ve bilgileri birebir yerleştir:

\`\`\`json
"appx": {
  "applicationId": "NamifyRenamer",
  "identityName": "BURAYA_PACKAGE_NAME_GELECEK",
  "publisher": "CN=BURAYA_PUBLISHER_ID_GELECEK",
  "publisherDisplayName": "BURAYA_GELISTIRICI_ADINIZ_GELECEK",
  "backgroundColor": "#0a0a0f",
  "languages": ["tr-TR", "en-US"]
}
\`\`\`

> ⚠️ **UYARI:** `publisher` bölümündeki değer genellikle `CN=` ile başlar. Eğer web sitesindeki kimlikte `CN=` yazmıyorsa bile sen yazmalısın. Tam olarak Partner Center ekranında ne görüyorsan (örn `CN=0DBXXXXX-XXXX-XXXX...`) o olmalı. Aksi takdirde Microsoft derlemeyi reddeder.

---

## Adım 3: Microsoft SDK Yükleme (Gerekiyorsa)

Windows sisteminin AppX paketleyebilmesi için bilgisayarında küçük bir SDK derleyici aracın olması gerekir:
Eğer bilgisayarında Visual Studio yüklüyse (kod editörü olan VSCode değil, büyük mor olan Visual Studio), %90 bu araçlar mevcuttur. Eğer hata alırsan:
1. Windows 10/11 SDK indir: https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/
2. Sadece "Windows SDK Signing Tools for Desktop Apps" özelliğini kursan yeterlidir.

---

## Adım 4: .appx Paketini Derleme

Kurulumlarını ve `.json` ayarlarını tamamladıktan sonra terminale gel ve standart derleme kodumuzu çalıştır:

\`\`\`powershell
npm run build:app
\`\`\`

`electron-builder` arka planda çalışacak. Eskiye kıyasla ekstra olarak `Building AppX` sekmesini de göreceksin. Hata vermeden bitirdiğinde şu yola git:
**`c:\Users\burha\OneDrive\Masaüstü\dosya_ismi_düzenleme\release\`**

Klasörün içerisinde:
- `Namify-Renamer-1.1.22.appx` isimli bir dosya göreceksin! (Setup.exe değil, .appx uzantılı dosya).

---

## Adım 5: Store'a Gönderim İşlemi (Submission)

1. Microsoft Partner Center'a dön ve uygulamanın sayfasına git.
2. **Start your submission** (Gönderimi başlat) butonuna tıkla.
3. Listeden **Packages** adımına gir.
4. Çıkan panele derlediğin `Namify-Renamer-1.1.22.appx` dosyasını sürükleyip bırak. 
   - (Eğer her şeyi doğru girdiysen sistem saniyeler içinde "Yeşil Tık" verip paketi kabul edecektir. Hata verirse `package.json` içindeki kodları yanlış/eksik yazmışsındır.)
5. Diğer sekmeleri doldur:
   - **Properties:** Uygulamanın kategorisini seç (Utilities / File Management).
   - **Store Listings:** Programın açıklamasını (Türkçe/İngilizce), uygulamanın resimlerini (Ekran görüntüleri) ve logolarını yükle.
   - **Age Ratings:** Yaş kısıtlaması sormacalarını cevapla (Genellikle 3+ Yaş / Herkes İçin işareti alacaktır).

Her şey yeşil olduktan sonra **Submit to the Store** (Market'e Gönder) butonuna basıyorsun. Microsoft inceleme ekibi 24-48 saat içerisinde uygulamanı inceleyecek ve her zamanki "Uygulamanız Yayında!" e-postasını alacaksın. 🎉
