// ═══════════════════════════════════════════════
// NAMIFY — Ultra High-Performance Virtual Scroller
// Handles 50,000+ rows effortlessly at 60 FPS
// ═══════════════════════════════════════════════

export class VirtualScroller {
  constructor(options) {
    this.container = options.container;
    this.rowHeight = options.rowHeight || 38;
    this.overscan = options.overscan || 10;
    this.renderRow = options.renderRow;
    this.items = [];
    this.rafPending = false;
    this.lastStartIndex = -1;
    this.lastEndIndex = -1;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.container.innerHTML = '';
    this.container.style.position = 'relative';
    this.container.style.overflowY = 'auto';

    // Total height spacer
    this.spacer = document.createElement('div');
    this.spacer.className = 'virtual-spacer';
    this.spacer.style.width = '100%';
    this.spacer.style.position = 'relative';

    // Content container holding only visible rows
    this.content = document.createElement('div');
    this.content.className = 'virtual-content';
    this.content.style.position = 'absolute';
    this.content.style.top = '0';
    this.content.style.left = '0';
    this.content.style.width = '100%';
    this.content.style.willChange = 'transform';

    this.spacer.appendChild(this.content);
    this.container.appendChild(this.spacer);
  }

  bindEvents() {
    this.onScroll = () => {
      if (!this.rafPending) {
        this.rafPending = true;
        requestAnimationFrame(() => {
          this.rafPending = false;
          this.render();
        });
      }
    };
    this.container.addEventListener('scroll', this.onScroll, { passive: true });
  }

  setItems(items, preserveScroll = false) {
    this.items = items || [];
    this.spacer.style.height = `${this.items.length * this.rowHeight}px`;

    if (!preserveScroll) {
      this.container.scrollTop = 0;
      this.lastStartIndex = -1;
      this.lastEndIndex = -1;
    }
    this.render(true);
  }

  render(force = false) {
    const total = this.items.length;
    if (total === 0) {
      this.content.innerHTML = '';
      this.content.style.transform = 'translateY(0)';
      this.lastStartIndex = -1;
      this.lastEndIndex = -1;
      return;
    }

    const scrollTop = this.container.scrollTop;
    const viewHeight = this.container.clientHeight || 400;

    let startIndex = Math.floor(scrollTop / this.rowHeight) - this.overscan;
    if (startIndex < 0) startIndex = 0;

    let endIndex = Math.ceil((scrollTop + viewHeight) / this.rowHeight) + this.overscan;
    if (endIndex > total) endIndex = total;

    if (!force && startIndex === this.lastStartIndex && endIndex === this.lastEndIndex) {
      return;
    }

    this.lastStartIndex = startIndex;
    this.lastEndIndex = endIndex;

    const offsetY = startIndex * this.rowHeight;
    this.content.style.transform = `translate3d(0, ${offsetY}px, 0)`;

    // Render batch fragment for zero layout thrashing
    const fragment = document.createDocumentFragment();
    for (let i = startIndex; i < endIndex; i++) {
      const rowNode = this.renderRow(this.items[i], i);
      if (rowNode) fragment.appendChild(rowNode);
    }

    this.content.replaceChildren(fragment);
  }

  refresh() {
    this.render(true);
  }

  scrollToIndex(index) {
    const targetScroll = Math.max(0, index * this.rowHeight);
    this.container.scrollTop = targetScroll;
  }
}
