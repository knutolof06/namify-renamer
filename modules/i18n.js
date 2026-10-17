// ═══════════════════════════════════════════════
// NAMIFY — i18n Localization Engine
// ═══════════════════════════════════════════════

export const translations = {
  tr: {
    app_title: "Namify — Profesyonel Dosya İsmi Düzenleyici",
    brand_sub: "Dosya İsmi Düzenleyici",
    nav_home: "Dosyalar",
    nav_rename: "İsim Düzenle",
    nav_history: "Geçmiş",
    nav_settings: "Ayarlar",

    stat_total: "Toplam Dosya",
    stat_renamed: "Düzenlenen",
    stat_selected: "Seçili Dosya",

    drop_title: "Dosyaları veya Klasörleri Sürükleyip Bırakın",
    drop_subtitle: "veya bilgisayarınızdan seçmek için tıklayın",
    drop_badge: "Ultra Hızlı • Sınırsız Dosya Desteği",
    drop_browse_files: "Dosya Seç",
    drop_browse_folder: "Klasör Seç",
    drop_preset_title: "Hızlı Başlangıç:",
    drop_preset_photos: "Fotoğraflar",
    drop_preset_music: "Müzik / Ses",
    drop_preset_docs: "Belgeler",

    modal_options_title: "Dosya Tarama & Ekleme Seçenekleri",
    opt_files_title: "Dosyaları Filtreleyerek Ekle",
    opt_files_desc: "Belirli uzantı veya desenlerdeki dosyaları tara",
    opt_subfolders: "Alt klasörleri dahil et (Derin tarama)",
    opt_mask_label: "Dosya uzantı maskesi",
    opt_mask_ph: "Örn: *.jpg, *.png, *.mp4",
    opt_regex_label: "Düzenli ifade (Regex) filtresi",
    opt_regex_ph: "Örn: ^IMG_[0-9]+",
    opt_folders_title: "Klasörleri Ekle",
    opt_folders_desc: "Klasörlerin kendilerini yeniden adlandırmak için ekle",
    opt_add_subfolders: "Alt klasörleri ekle",
    opt_add_root: "Kök klasörü ekle",
    btn_cancel: "İptal",
    btn_add_to_list: "Listeye Aktar",

    list_title: "Dosya Listesi",
    list_search_ph: "Dosyalarda ara (İsim, uzantı, konum)...",
    list_col_idx: "#",
    list_col_icon: "Tür",
    list_col_name: "Dosya Adı",
    list_col_ext: "Uzantı",
    list_col_size: "Boyut",
    list_col_path: "Konum",
    list_btn_select_all: "Tümünü Seç",
    list_btn_invert: "Tersine Çevir",
    list_btn_remove_sel: "Seçilenleri Çıkar",
    list_btn_clear: "Tümünü Temizle",
    list_btn_add_files: "+ Dosya",
    list_btn_add_folder: "+ Klasör",
    list_btn_add_more: "+ Dosya Ekle",
    list_btn_proceed: "İsimleri Düzenlemeye Başla",
    list_empty: "Henüz dosya eklenmedi",

    rename_title: "İsim Düzenleme Stüdyosu",
    rename_toggle_layout: "Görünümü Değiştir (Bölünmüş / Yığın)",
    rename_layout_mode_split: "Yan Yana",
    rename_layout_mode_stack: "Alt Alta",
    rename_add_rule: "+ Kural Ekle",
    rename_export_rules: "Kuralları Dışa Aktar",
    rename_import_rules: "Kuralları İçe Aktar",
    rename_back_to_list: "← Dosya Listesi",
    preview_title: "Canlı Önizleme",
    preview_subtitle: "Eski İsim → Yeni İsim",
    preview_search_ph: "Önizlemede filtrele...",
    preview_summary_changed: "değişecek",
    preview_summary_same: "aynı kalacak",
    preview_summary_collision: "çakışma",

    action_rename: "Bulunduğu Yerde Yeniden Adlandır",
    action_move: "Yeni Klasöre Taşı",
    action_copy: "Yeni Klasöre Kopyala",
    btn_apply_rename: "İşlemi Uygula",
    btn_close: "Kapat",
    btn_undo_selected: "Seçili Olanları Geri Al",
    btn_confirm_ok: "Devam Et",
    btn_confirm_proceed_anyway: "Yine de Devam Et",
    btn_save: "Kaydet",

    rule_selector_title: "Eklenecek Kuralı Seçin",
    rule_type_findReplace: "Bul ve Değiştir",
    rule_desc_findReplace: "Metin veya deseni bulup yenisiyle değiştirir",
    rule_type_prefixSuffix: "Önek & Sonek Ekle",
    rule_desc_prefixSuffix: "İsmin başına veya sonuna metin ekler",
    rule_type_numbering: "Numaralandırma",
    rule_desc_numbering: "Sıralı artan numaralandırma ve sıfır tamamlama",
    rule_type_caseChange: "Büyük / Küçük Harf",
    rule_desc_caseChange: "Büyük harf, küçük harf, baş harfler veya camelCase",
    rule_type_removeChars: "Karakter Temizleme & Normalizasyon",
    rule_desc_removeChars: "Boşlukları sil, Türkçe harfleri dönüştür (ç->c vb.)",
    rule_type_regexReplace: "Regex ile Değiştirme",
    rule_desc_regexReplace: "Gelişmiş düzenli ifadeler ve grup yakalama",
    rule_type_extChange: "Uzantı Değiştirme",
    rule_desc_extChange: "Dosya uzantısını güvenle değiştirir",
    rule_type_dateInsert: "Tarih Ekleme",
    rule_desc_dateInsert: "Güncel tarih veya dosya oluşturma tarihini ekler",
    rule_type_listRename: "Manuel Liste İsimlendirme",
    rule_desc_listRename: "Satır satır özel isim listesinden adlandırır",

    history_title: "İşlem Geçmişi",
    history_subtitle: "Son yapılan işlemler ve geri alma kayıtları",
    history_clear_btn: "Geçmişi Temizle",
    history_empty: "Henüz hiçbir işlem geçmişi bulunmuyor.",
    history_col_date: "Tarih & Saat",
    history_col_summary: "İşlem Detayı",
    history_col_count: "Adet",
    history_col_actions: "İşlem",
    history_btn_preview: "Önizle & Seç",
    history_btn_undo: "Tümünü Geri Al",

    settings_title: "Uygulama Ayarları",
    settings_theme_title: "Renk Teması",
    settings_theme_desc: "Arayüz için göz yormayan modern renk temaları",
    settings_lang_title: "Uygulama Dili",
    settings_lang_desc: "Uygulamanın görüntüleneceği dili seçin",
    settings_columns_title: "Dosya Listesi Sütunları",
    settings_columns_desc: "Dosya tablosunda görünmesini istediğiniz sütunları açıp kapatın",
    settings_about_title: "Hakkında & Sürüm",
    settings_btn_updates: "Güncellemeleri Kontrol Et",
    settings_btn_github: "GitHub Deposu",

    progress_title: "İşlem Yapılıyor...",
    progress_processing: "Dosyalar işleniyor, lütfen bekleyin...",
    progress_cancel: "İptal Et",

    toast_scanning: "Dosyalar taranıyor...",
    toast_files_added: "dosya listeye eklendi.",
    toast_no_files: "Kriterlere uyan dosya bulunamadı.",
    toast_already_exists: "Eklenen dosyalar zaten listede mevcut.",
    toast_cleared: "Liste temizlendi.",
    toast_success_rename: "dosya başarıyla işlendi!",
    toast_undo_success: "dosya eski haline döndürüldü!",
    toast_copy_link: "Bağlantı kopyalandı."
  },

  en: {
    app_title: "Namify — Professional Batch File Renamer",
    brand_sub: "Batch File Renamer",
    nav_home: "Files",
    nav_rename: "Rename Studio",
    nav_history: "History",
    nav_settings: "Settings",

    stat_total: "Total Files",
    stat_renamed: "Renamed",
    stat_selected: "Selected Files",

    drop_title: "Drag & Drop Files or Folders Here",
    drop_subtitle: "or click anywhere to browse from your computer",
    drop_badge: "Ultra Fast • Unlimited Files Support",
    drop_browse_files: "Select Files",
    drop_browse_folder: "Select Folder",
    drop_preset_title: "Quick Start:",
    drop_preset_photos: "Photos",
    drop_preset_music: "Audio / Video",
    drop_preset_docs: "Documents",

    modal_options_title: "File Scan & Import Options",
    opt_files_title: "Filter & Import Files",
    opt_files_desc: "Scan files matching specified extensions or patterns",
    opt_subfolders: "Include subfolders (Recursive scan)",
    opt_mask_label: "File extension mask",
    opt_mask_ph: "e.g.: *.jpg, *.png, *.mp4",
    opt_regex_label: "Regular expression (Regex) filter",
    opt_regex_ph: "e.g.: ^IMG_[0-9]+",
    opt_folders_title: "Import Folders",
    opt_folders_desc: "Import directory structures for batch folder renaming",
    opt_add_subfolders: "Include subfolders",
    opt_add_root: "Include root folder",
    btn_cancel: "Cancel",
    btn_add_to_list: "Import to List",

    list_title: "File List",
    list_search_ph: "Search files (Name, extension, path)...",
    list_col_idx: "#",
    list_col_icon: "Type",
    list_col_name: "File Name",
    list_col_ext: "Ext",
    list_col_size: "Size",
    list_col_path: "Path",
    list_btn_select_all: "Select All",
    list_btn_invert: "Invert Selection",
    list_btn_remove_sel: "Remove Selected",
    list_btn_clear: "Clear All",
    list_btn_add_files: "+ Files",
    list_btn_add_folder: "+ Folder",
    list_btn_add_more: "+ Add Files",
    list_btn_proceed: "Start Renaming Files",
    list_empty: "No files added yet",

    rename_title: "Rename Studio",
    rename_toggle_layout: "Toggle Layout (Split / Stack)",
    rename_layout_mode_split: "Split",
    rename_layout_mode_stack: "Stack",
    rename_add_rule: "+ Add Rule",
    rename_export_rules: "Export Rules",
    rename_import_rules: "Import Rules",
    rename_back_to_list: "← File List",
    preview_title: "Live Preview",
    preview_subtitle: "Original Name → New Name",
    preview_search_ph: "Filter preview...",
    preview_summary_changed: "will change",
    preview_summary_same: "unchanged",
    preview_summary_collision: "collision",

    action_rename: "Rename in Place",
    action_move: "Move to New Folder",
    action_copy: "Copy to New Folder",
    btn_apply_rename: "Apply Operations",
    btn_close: "Close",
    btn_undo_selected: "Undo Selected",
    btn_confirm_ok: "Continue",
    btn_confirm_proceed_anyway: "Proceed Anyway",
    btn_save: "Save",

    rule_selector_title: "Select a Rule to Add",
    rule_type_findReplace: "Find & Replace",
    rule_desc_findReplace: "Find specific text or pattern and replace with new text",
    rule_type_prefixSuffix: "Prefix & Suffix",
    rule_desc_prefixSuffix: "Add text to the start or end of filenames",
    rule_type_numbering: "Sequential Numbering",
    rule_desc_numbering: "Add sequential numbers with zero padding",
    rule_type_caseChange: "Change Letter Case",
    rule_desc_caseChange: "Convert to lowercase, UPPERCASE, Title Case, or camelCase",
    rule_type_removeChars: "Clean & Normalize Characters",
    rule_desc_removeChars: "Remove spaces, special characters, convert accents",
    rule_type_regexReplace: "Regex Substitution",
    rule_desc_regexReplace: "Advanced regex patterns and capturing group replacement",
    rule_type_extChange: "Change Extension",
    rule_desc_extChange: "Safely update file extensions",
    rule_type_dateInsert: "Insert Date / Time",
    rule_desc_dateInsert: "Insert current date or file modification date",
    rule_type_listRename: "Manual List Renaming",
    rule_desc_listRename: "Rename files sequentially using a multiline text list",

    history_title: "Operation History",
    history_subtitle: "Recent renaming operations and undo records",
    history_clear_btn: "Clear History",
    history_empty: "No operation history yet.",
    history_col_date: "Date & Time",
    history_col_summary: "Operation Summary",
    history_col_count: "Items",
    history_col_actions: "Action",
    history_btn_preview: "Preview & Select",
    history_btn_undo: "Undo All",

    settings_title: "Preferences",
    settings_theme_title: "Color Theme",
    settings_theme_desc: "Modern and comfortable color themes for every environment",
    settings_lang_title: "Language",
    settings_lang_desc: "Choose your preferred display language",
    settings_columns_title: "File Table Columns",
    settings_columns_desc: "Toggle columns displayed in the file list table",
    settings_about_title: "About & Updates",
    settings_btn_updates: "Check for Updates",
    settings_btn_github: "GitHub Repository",

    progress_title: "Processing Files...",
    progress_processing: "Please wait while files are being renamed...",
    progress_cancel: "Cancel",

    toast_scanning: "Scanning files...",
    toast_files_added: "files added to list.",
    toast_no_files: "No files matching criteria found.",
    toast_already_exists: "Selected files are already in the list.",
    toast_cleared: "List cleared.",
    toast_success_rename: "files renamed successfully!",
    toast_undo_success: "files restored to original names!",
    toast_copy_link: "Link copied to clipboard."
  }
};

let currentLang = (typeof localStorage !== 'undefined' ? localStorage.getItem('namifyLang') : 'tr') || 'tr';

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (translations[lang]) {
    currentLang = lang;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('namifyLang', lang);
    }
    applyTranslations();
  }
}

export function t(key, fallback = '') {
  const dict = translations[currentLang] || translations.tr;
  return dict[key] || fallback || key;
}

export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (!text) return;

    // Safety for buttons: never wipe icons, badges, or child elements
    if (el.tagName === 'BUTTON') {
      const innerSpan = el.querySelector('span:not(.kbd-badge):not(.nav-pill)');
      if (innerSpan) {
        innerSpan.textContent = text;
        return;
      }
      if (el.children.length === 0) {
        el.textContent = text;
        return;
      }
    }

    // Leaf elements: safe to replace directly
    if (el.children.length === 0) {
      el.textContent = text;
      return;
    }

    // Target child span if present
    const targetSpan = el.querySelector('span:not(.kbd-badge):not(.nav-pill)');
    if (targetSpan && targetSpan.children.length === 0) {
      targetSpan.textContent = text;
      return;
    }

    // Text node fallback without blowing away children
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim().length > 0) {
        node.nodeValue = text;
        return;
      }
    }
  });

  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    const key = el.getAttribute('data-i18n-ph');
    const ph = t(key);
    if (ph) el.setAttribute('placeholder', ph);
  });

  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    const title = t(key);
    if (title) el.setAttribute('title', title);
  });
}
