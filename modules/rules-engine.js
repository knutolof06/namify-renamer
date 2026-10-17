// ═══════════════════════════════════════════════
// NAMIFY — Ultra Fast Rule Compilation Engine
// ═══════════════════════════════════════════════

export const TURKISH_CHAR_MAP = {
  'ç': 'c', 'Ç': 'C',
  'ğ': 'g', 'Ğ': 'G',
  'ı': 'i', 'İ': 'I',
  'ö': 'o', 'Ö': 'O',
  'ş': 's', 'Ş': 'S',
  'ü': 'u', 'Ü': 'U'
};

export function normalizeTurkish(text) {
  return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, (ch) => TURKISH_CHAR_MAP[ch] || ch);
}

export function toCase(text, caseType) {
  if (!text) return '';
  switch (caseType) {
    case 'lower':
      return text.toLowerCase();
    case 'upper':
      return text.toUpperCase();
    case 'title':
      return text.replace(/(^|\s|-|_)([a-zA-ZçÇğĞıİöÖşŞüÜ])/g, (_m, p1, p2) => p1 + p2.toUpperCase());
    case 'sentence':
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    case 'camel': {
      const words = text.split(/[\s\-_]+/);
      return words
        .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join('');
    }
    case 'kebab':
      return text
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w\-\.]+/g, '');
    case 'snake':
      return text
        .trim()
        .toLowerCase()
        .replace(/[\s\-]+/g, '_')
        .replace(/[^\w\._]+/g, '');
    default:
      return text;
  }
}

export const RULE_TEMPLATES = {
  findReplace: {
    id: 'findReplace',
    titleKey: 'rule_type_findReplace',
    defaultTitle: 'Bul ve Değiştir',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    html: `
      <div class="field-row">
        <div class="field-group">
          <label class="field-label">Aranacak Metin:</label>
          <input type="text" class="field-input r-find" placeholder="Örn: eski_isim veya deseni girin">
        </div>
        <div class="field-group">
          <label class="field-label">Yeni Metin (Değiştir):</label>
          <input type="text" class="field-input r-replace" placeholder="Yeni metin (boş bırakılırsa silinir)">
        </div>
      </div>
      <div class="field-row" style="margin-top:10px;">
        <div class="field-group">
          <label class="field-label">Oluşum:</label>
          <select class="field-input r-occurrence">
            <option value="all">Tüm Eşleşmeler</option>
            <option value="first">Yalnızca İlk Eşleşme</option>
            <option value="last">Yalnızca Son Eşleşme</option>
          </select>
        </div>
        <div class="field-group">
          <label class="field-label">Uygulama Alanı:</label>
          <select class="field-input r-apply-to">
            <option value="name">Yalnızca Dosya Adı</option>
            <option value="ext">Yalnızca Uzantı</option>
            <option value="both">Dosya Adı ve Uzantı</option>
          </select>
        </div>
      </div>
      <div class="field-checks" style="margin-top:12px; display:flex; gap:16px;">
        <label class="check-label">
          <input type="checkbox" class="r-case-sensitive"> Büyük/küçük harf duyarlı
        </label>
        <label class="check-label">
          <input type="checkbox" class="r-regex"> Düzenli İfade (Regex)
        </label>
      </div>
      <div class="field-hint" style="margin-top:8px;">
        💡 Birden fazla deseni değiştirmek için aralarına <code>\\</code> veya <code>/</code> koyabilirsiniz.
      </div>
    `
  },

  prefixSuffix: {
    id: 'prefixSuffix',
    titleKey: 'rule_type_prefixSuffix',
    defaultTitle: 'Önek & Sonek Ekle',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`,
    html: `
      <div class="field-row">
        <div class="field-group">
          <label class="field-label">Başına Ekle (Önek):</label>
          <input type="text" class="field-input r-prefix" placeholder="Örn: Proje_2026_">
        </div>
        <div class="field-group">
          <label class="field-label">Sonuna Ekle (Sonek):</label>
          <input type="text" class="field-input r-suffix" placeholder="Örn: _final">
        </div>
      </div>
    `
  },

  numbering: {
    id: 'numbering',
    titleKey: 'rule_type_numbering',
    defaultTitle: 'Numaralandırma',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`,
    html: `
      <div class="field-row">
        <div class="field-group">
          <label class="field-label">Başlangıç:</label>
          <input type="number" class="field-input r-num-start" value="1" min="0">
        </div>
        <div class="field-group">
          <label class="field-label">Artış Miktarı:</label>
          <input type="number" class="field-input r-num-step" value="1" min="1">
        </div>
        <div class="field-group">
          <label class="field-label">Konum:</label>
          <select class="field-input r-num-position">
            <option value="prefix">İsmin Başına</option>
            <option value="suffix">İsmin Sonuna</option>
            <option value="only">Yalnızca Numara (İsmi Sil)</option>
          </select>
        </div>
      </div>
      <div class="field-row" style="margin-top:10px;">
        <div class="field-group">
          <label class="field-label">Ayraç Sembolü:</label>
          <input type="text" class="field-input r-num-separator" value="_" placeholder="_ , - veya boşluk">
        </div>
        <div class="field-group">
          <label class="field-label">Sıfır Doldurma (Basamak):</label>
          <select class="field-input r-num-padding">
            <option value="0">Yok (1, 2, 10, 100)</option>
            <option value="2">2 Basamak (01, 02, 10)</option>
            <option value="3">3 Basamak (001, 002, 010)</option>
            <option value="4">4 Basamak (0001, 0002, 0010)</option>
            <option value="5">5 Basamak (00001, 00002)</option>
          </select>
        </div>
      </div>
    `
  },

  caseChange: {
    id: 'caseChange',
    titleKey: 'rule_type_caseChange',
    defaultTitle: 'Büyük / Küçük Harf',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19V5h4l3 9 3-9h4v14"/><path d="M2 19h4"/></svg>`,
    html: `
      <div class="field-group">
        <label class="field-label">Dönüştürme Formatı:</label>
        <select class="field-input r-case">
          <option value="lower">tümü küçük harf (lowercase)</option>
          <option value="upper">TÜMÜ BÜYÜK HARF (UPPERCASE)</option>
          <option value="title">Baş Harfleri Büyük (Title Case)</option>
          <option value="sentence">Cümle başı büyük (Sentence case)</option>
          <option value="kebab">kebab-case (web-dostu-isim)</option>
          <option value="snake">snake_case (alt_cizgili_isim)</option>
          <option value="camel">camelCase (ornekDosyaAdi)</option>
        </select>
      </div>
    `
  },

  removeChars: {
    id: 'removeChars',
    titleKey: 'rule_type_removeChars',
    defaultTitle: 'Karakter Temizleme & Normalizasyon',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>`,
    html: `
      <div class="field-checks-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <label class="check-label">
          <input type="checkbox" class="r-rm-turkish"> Türkçe Harfleri Düzelt (ç->c, ğ->g vb.)
        </label>
        <label class="check-label">
          <input type="checkbox" class="r-rm-spaces"> Tüm Boşlukları Kaldır
        </label>
        <label class="check-label">
          <input type="checkbox" class="r-rm-multi-spaces"> Çift Boşlukları Teke İndir
        </label>
        <label class="check-label">
          <input type="checkbox" class="r-rm-special"> Özel Karakterleri Kaldır
        </label>
      </div>
      <div class="field-row" style="margin-top:10px;">
        <div class="field-group">
          <label class="field-label">Boşlukları Dönüştür:</label>
          <select class="field-input r-space-replacement">
            <option value="none">Değiştirme (Olduğu Gibi Bırak)</option>
            <option value="_">Alt Çizgi (_) Yap</option>
            <option value="-">Tire (-) Yap</option>
            <option value=".">Nokta (.) Yap</option>
          </select>
        </div>
        <div class="field-group">
          <label class="field-label">Belirtilen Karakterleri Sil:</label>
          <input type="text" class="field-input r-rm-custom" placeholder="Örn: ()[]{}#!?$%">
        </div>
      </div>
    `
  },

  regexReplace: {
    id: 'regexReplace',
    titleKey: 'rule_type_regexReplace',
    defaultTitle: 'Regex ile Değiştirme',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 17l6-6-6-6"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
    html: `
      <div class="field-row">
        <div class="field-group">
          <label class="field-label">Düzenli İfade (Regex Deseni):</label>
          <input type="text" class="field-input r-regex-find" placeholder="Örn: ^IMG_([0-9]+)">
        </div>
        <div class="field-group">
          <label class="field-label">Grup Değiştirici:</label>
          <input type="text" class="field-input r-regex-replace" placeholder="Örn: Foto_$1">
        </div>
      </div>
    `
  },

  extChange: {
    id: 'extChange',
    titleKey: 'rule_type_extChange',
    defaultTitle: 'Uzantı Değiştirme',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    html: `
      <div class="field-row">
        <div class="field-group">
          <label class="field-label">Mevcut Uzantı:</label>
          <input type="text" class="field-input r-ext-old" placeholder="Örn: jpeg veya boşsa hepsi">
        </div>
        <div class="field-group">
          <label class="field-label">Hedef Yeni Uzantı:</label>
          <input type="text" class="field-input r-ext-new" placeholder="Örn: jpg">
        </div>
      </div>
      <div style="margin-top:10px;">
        <label class="check-label">
          <input type="checkbox" class="r-ext-lower" checked> Uzantıyı her zaman küçük harf yap
        </label>
      </div>
    `
  },

  dateInsert: {
    id: 'dateInsert',
    titleKey: 'rule_type_dateInsert',
    defaultTitle: 'Tarih Ekleme',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    html: `
      <div class="field-row">
        <div class="field-group">
          <label class="field-label">Tarih Formatı:</label>
          <select class="field-input r-date-format">
            <option value="YYYY-MM-DD">2026-10-17</option>
            <option value="DD-MM-YYYY">17-10-2026</option>
            <option value="YYYYMMDD">20261017</option>
            <option value="DD.MM.YYYY">17.10.2026</option>
            <option value="YYYY-MM-DD_HH-mm">2026-10-17_19-45</option>
          </select>
        </div>
        <div class="field-group">
          <label class="field-label">Tarih Kaynağı:</label>
          <select class="field-input r-date-source">
            <option value="current">Şimdiki Tarih / Saat</option>
            <option value="mtime">Dosya Değiştirilme Tarihi</option>
          </select>
        </div>
      </div>
      <div class="field-row" style="margin-top:10px;">
        <div class="field-group">
          <label class="field-label">Konum:</label>
          <select class="field-input r-date-position">
            <option value="prefix">İsmin Başına</option>
            <option value="suffix">İsmin Sonuna</option>
          </select>
        </div>
        <div class="field-group">
          <label class="field-label">Ayraç:</label>
          <input type="text" class="field-input r-date-sep" value="_">
        </div>
      </div>
    `
  },

  listRename: {
    id: 'listRename',
    titleKey: 'rule_type_listRename',
    defaultTitle: 'Manuel Liste İsimlendirme',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
    html: `
      <div class="field-group">
        <label class="field-label">Yeni İsim Listesi (Her satıra bir isim, sırayla):</label>
        <textarea class="field-input r-list-names" rows="4" placeholder="Yeni_Isim_1&#10;Yeni_Isim_2&#10;Yeni_Isim_3" style="resize:vertical; font-family:monospace; font-size:12px;"></textarea>
      </div>
    `
  }
};

/**
 * Pre-compiles DOM rule cards into an ultra-fast array of execution functions.
 * Run once per rule-change, NOT per file!
 */
export function compileActiveRules(cards) {
  const fns = [];

  cards.forEach((card) => {
    const type = card.getAttribute('data-rule-type');

    if (type === 'findReplace') {
      const find = card.querySelector('.r-find')?.value || '';
      const replace = card.querySelector('.r-replace')?.value || '';
      const occurrence = card.querySelector('.r-occurrence')?.value || 'all';
      const caseSensitive = card.querySelector('.r-case-sensitive')?.checked || false;
      const isRegex = card.querySelector('.r-regex')?.checked || false;
      const applyTo = card.querySelector('.r-apply-to')?.value || 'name';

      if (find) {
        let patterns = isRegex ? [find] : find.split(/[\\/]/).filter(p => p !== '');

        fns.push((state) => {
          let target = applyTo === 'name' ? state.baseName : (applyTo === 'ext' ? state.ext : state.originalName);

          for (const pattern of patterns) {
            try {
              if (isRegex) {
                let flags = occurrence === 'all' ? 'g' : '';
                if (!caseSensitive) flags += 'i';
                const rx = new RegExp(pattern, flags);
                if (occurrence === 'last') {
                  const matches = [...target.matchAll(new RegExp(pattern, 'g' + (!caseSensitive ? 'i' : '')))];
                  if (matches.length > 0) {
                    const lastMatch = matches[matches.length - 1];
                    target = target.substring(0, lastMatch.index) + replace + target.substring(lastMatch.index + lastMatch[0].length);
                  }
                } else {
                  target = target.replace(rx, replace);
                }
              } else {
                const flags = caseSensitive ? '' : 'i';
                const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                if (occurrence === 'all') {
                  target = target.replace(new RegExp(escaped, 'g' + flags), replace);
                } else if (occurrence === 'first') {
                  target = target.replace(new RegExp(escaped, flags), replace);
                } else if (occurrence === 'last') {
                  if (caseSensitive) {
                    const idx = target.lastIndexOf(pattern);
                    if (idx !== -1) target = target.substring(0, idx) + replace + target.substring(idx + pattern.length);
                  } else {
                    const matches = [...target.matchAll(new RegExp(escaped, 'gi'))];
                    if (matches.length > 0) {
                      const lastMatch = matches[matches.length - 1];
                      target = target.substring(0, lastMatch.index) + replace + target.substring(lastMatch.index + lastMatch[0].length);
                    }
                  }
                }
              }
            } catch (e) {}
          }

          if (applyTo === 'name') {
            state.baseName = target;
          } else if (applyTo === 'ext') {
            state.ext = target.replace(/^\./, '');
          } else {
            const isDir = state.file.isFile === false;
            state.ext = isDir ? '' : (target.includes('.') ? target.split('.').pop() : '');
            state.baseName = isDir ? target : (state.ext ? target.slice(0, -(state.ext.length + 1)) : target);
          }
        });
      }
    } else if (type === 'prefixSuffix') {
      const prefix = card.querySelector('.r-prefix')?.value || '';
      const suffix = card.querySelector('.r-suffix')?.value || '';
      if (prefix || suffix) {
        fns.push((state) => {
          state.baseName = prefix + state.baseName + suffix;
        });
      }
    } else if (type === 'numbering') {
      const start = parseInt(card.querySelector('.r-num-start')?.value, 10) || 0;
      const step = parseInt(card.querySelector('.r-num-step')?.value, 10) || 1;
      const pos = card.querySelector('.r-num-position')?.value || 'prefix';
      const sep = card.querySelector('.r-num-separator')?.value || '';
      const pad = parseInt(card.querySelector('.r-num-padding')?.value, 10) || 0;

      fns.push((state, index) => {
        const num = start + index * step;
        let numStr = num.toString();
        if (pad > 0) numStr = numStr.padStart(pad, '0');

        if (pos === 'prefix') state.baseName = numStr + sep + state.baseName;
        else if (pos === 'suffix') state.baseName = state.baseName + sep + numStr;
        else if (pos === 'only') state.baseName = numStr;
      });
    } else if (type === 'caseChange') {
      const caseType = card.querySelector('.r-case')?.value || 'lower';
      fns.push((state) => {
        state.baseName = toCase(state.baseName, caseType);
      });
    } else if (type === 'removeChars') {
      const rmTurkish = card.querySelector('.r-rm-turkish')?.checked || false;
      const rmSpaces = card.querySelector('.r-rm-spaces')?.checked || false;
      const rmMultiSpaces = card.querySelector('.r-rm-multi-spaces')?.checked || false;
      const rmSpecial = card.querySelector('.r-rm-special')?.checked || false;
      const spaceRep = card.querySelector('.r-space-replacement')?.value || 'none';
      const customRm = card.querySelector('.r-rm-custom')?.value || '';
      const customEscaped = customRm ? customRm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : null;

      fns.push((state) => {
        let name = state.baseName;
        if (rmTurkish) name = normalizeTurkish(name);
        if (rmSpaces) name = name.replace(/\s+/g, '');
        else if (rmMultiSpaces) name = name.replace(/\s{2,}/g, ' ');

        if (spaceRep !== 'none' && !rmSpaces) {
          name = name.replace(/\s+/g, spaceRep);
        }

        if (rmSpecial) {
          name = name.replace(/[^a-zA-Z0-9_\-\u00C0-\u017F\s]/g, '');
        }

        if (customEscaped) {
          name = name.replace(new RegExp(`[${customEscaped}]`, 'g'), '');
        }
        state.baseName = name;
      });
    } else if (type === 'regexReplace') {
      const find = card.querySelector('.r-regex-find')?.value;
      const replace = card.querySelector('.r-regex-replace')?.value || '';
      if (find) {
        try {
          const rx = new RegExp(find, 'g');
          fns.push((state) => {
            state.baseName = state.baseName.replace(rx, replace);
          });
        } catch (e) {}
      }
    } else if (type === 'extChange') {
      const oldExt = (card.querySelector('.r-ext-old')?.value || '').replace(/^\./, '').toLowerCase();
      const newExt = (card.querySelector('.r-ext-new')?.value || '').replace(/^\./, '');
      const forceLower = card.querySelector('.r-ext-lower')?.checked ?? true;

      fns.push((state) => {
        if (state.file.isFile !== false) {
          if (!oldExt || state.ext.toLowerCase() === oldExt) {
            if (newExt) state.ext = newExt;
          }
          if (forceLower && state.ext) {
            state.ext = state.ext.toLowerCase();
          }
        }
      });
    } else if (type === 'dateInsert') {
      const format = card.querySelector('.r-date-format')?.value || 'YYYY-MM-DD';
      const source = card.querySelector('.r-date-source')?.value || 'current';
      const pos = card.querySelector('.r-date-position')?.value || 'prefix';
      const sep = card.querySelector('.r-date-sep')?.value || '_';

      function formatDate(d) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');

        switch (format) {
          case 'YYYY-MM-DD': return `${yyyy}-${mm}-${dd}`;
          case 'DD-MM-YYYY': return `${dd}-${mm}-${yyyy}`;
          case 'YYYYMMDD': return `${yyyy}${mm}${dd}`;
          case 'DD.MM.YYYY': return `${dd}.${mm}.${yyyy}`;
          case 'YYYY-MM-DD_HH-mm': return `${yyyy}-${mm}-${dd}_${hh}-${min}`;
          default: return `${yyyy}-${mm}-${dd}`;
        }
      }

      const cachedCurrentDate = formatDate(new Date());

      fns.push((state) => {
        let dateStr = cachedCurrentDate;
        if (source === 'mtime' && state.file.mtime) {
          dateStr = formatDate(new Date(state.file.mtime));
        }

        if (pos === 'prefix') {
          state.baseName = dateStr + sep + state.baseName;
        } else {
          state.baseName = state.baseName + sep + dateStr;
        }
      });
    } else if (type === 'listRename') {
      const textarea = card.querySelector('.r-list-names');
      if (textarea) {
        const lines = textarea.value.split('\n').map(l => l.trim()).filter(l => l !== '');
        fns.push((state, index) => {
          if (lines[index]) {
            state.baseName = lines[index];
          }
        });
      }
    }
  });

  return fns;
}
