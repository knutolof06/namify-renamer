# Electron Uygulamasını EXE Yapma ve Otomatik Güncelleme Sistemi Kurulumu

Bu rehber, bir Electron uygulamasını nasıl profesyonel bir şekilde `.exe` formatına dönüştüreceğinizi ve GitHub üzerinden otomatik güncelleme (auto-update) sistemini nasıl entegre edeceğinizi adım adım açıklar.

## 1. Gerekli Paketlerin Kurulumu

Projenize `electron-builder` (paketleme için) ve `electron-updater` (güncelleme için) kütüphanelerini ekleyerek başlayın:

```bash
npm install electron-builder --save-dev
npm install electron-updater --save
```

---

## 2. `package.json` Yapılandırması

`package.json` dosyanızda uygulamanızın kimlik bilgilerini ve paketleme kurallarını tanımlamanız gerekir.

### Önemli Alanlar:
- **`version`**: Her yeni güncellemede bu numarayı artırmalısınız (Örn: `1.0.1` -> `1.0.2`).
- **`build`**: Paketleme ayarlarının bulunduğu ana bölümdür.

```json
{
  "name": "proje-isminiz",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "build:app": "vite build && electron-builder --win"
  },
  "build": {
    "appId": "com.sirketiniz.uygulamaniz",
    "productName": "Uygulama Adı",
    "directories": {
      "output": "release"
    },
    "win": {
      "target": ["nsis", "portable"],
      "icon": "icon.ico"
    },
    "publish": [
      {
        "provider": "github",
        "owner": "github-kullanici-adiniz",
        "repo": "depo-isminiz"
      }
    ],
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "artifactName": "${productName}-Setup-${version}.${ext}"
    }
  }
}
```

---

## 3. Ana İşlem (`main.js`) İçinde Güncelleme Mantığı

Uygulamanızın ana dosyasında (Electron'un çalıştığı dosya) `electron-updater`'ı başlatmanız ve olayları (events) yakalamanız gerekir.

```javascript
const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');

function createWindow() {
  // Pencere oluşturma kodlarınız...
}

app.whenReady().then(() => {
  createWindow();

  // Geliştirme aşamasında değilsek güncellemeleri kontrol et
  if (process.env.NODE_ENV !== 'development') {
    autoUpdater.checkForUpdatesAndNotify();

    // Yeni bir güncelleme bulunduğunda
    autoUpdater.on('update-available', () => {
      // Kullanıcıya bilgi gönder (IPC üzerinden frontend'e iletebilirsiniz)
      console.log("Yeni güncelleme indiriliyor...");
    });

    // Güncelleme indirildiğinde
    autoUpdater.on('update-downloaded', () => {
      dialog.showMessageBox({
        type: 'info',
        title: 'Güncelleme Hazır',
        message: 'Uygulamanın yeni sürümü indirildi. Şimdi yeniden başlatılsın mı?',
        buttons: ['Hemen Yükle', 'Sonra']
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    });
  }
});
```

---

## 4. Yayınlama ve Güncelleme Akışı (Workflow)

Sistem şu şekilde çalışır:

1.  **Kodunuzu Hazırlayın:** Değişiklikleri yapın ve `package.json` içindeki `version` numarasını artırın.
2.  **Derleyin:** `npm run build:app` komutunu çalıştırın.
3.  **GitHub'a Yükleyin:**
    - GitHub deponuzda "Releases" kısmına gidin.
    - `package.json` içindeki versiyon ile aynı tag'de (Örn: `v1.0.1`) yeni bir release oluşturun.
    - `release` klasörü altında oluşan `.exe`, `.blockmap` ve `latest.yml` dosyalarını buraya sürükleyip bırakın.
4.  **Otomatik Güncelleme:** Mevcut kullanıcılar uygulamayı açtığında, uygulama GitHub'daki `latest.yml` dosyasını kontrol eder. Versiyon yüksekse güncellemeyi otomatik indirir.

## İpuçları
- **Admin Yetkisi:** Güncellemelerin sorunsuz yüklenmesi için uygulamanın hedef klasöre yazma yetkisi olmalıdır (NSIS ayarları bunu genellikle halleder).
- **Simge (Icon):** `icon.ico` dosyanızın en az 256x256 piksel olduğundan emin olun.
- **Portatif (Portable):** Kurulum gerektirmeyen bir sürüm istiyorsanız `target` listesine `"portable"` eklemeyi unutmayın.
