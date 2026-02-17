export class SidebarVersionManager {
  private sidebar: HTMLElement;
  private urlVersion: string; // Version from the URL (content version)
  private menuVersion: string; // Version selected in the menu switcher
  private activeSubmenuPath: string[];

  constructor(sidebar: HTMLElement, currentVersion: string, activeSubmenuPath: string[]) {
    this.sidebar = sidebar;
    this.urlVersion = currentVersion;
    this.menuVersion = currentVersion;
    this.activeSubmenuPath = activeSubmenuPath;
  }

  setup(): void {
    const versionSwitchers = this.sidebar.querySelectorAll(
      '[data-version-switcher] select, [data-version-select]'
    );

    versionSwitchers.forEach((switcher) => {
      switcher.addEventListener('change', (e) => {
        const select = e.target as HTMLSelectElement;
        this.handleVersionChange(select.value);
      });
    });

    // Listen for in-page link clicks to revert menu to URL version
    this.setupInPageLinkListener();

    // Initialize menu visibility for current URL version
    this.updateMenuForVersion(this.urlVersion);
  }

  private setupInPageLinkListener(): void {
    // Listen for clicks on any links in the main content area
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      // Check if it's a link and not in the sidebar
      if (link && !this.sidebar.contains(link)) {
        const href = link.getAttribute('href');

        // If it's an internal link (not external, not hash-only)
        if (href && !href.startsWith('http') && !href.startsWith('#')) {
          // Revert menu to URL version when clicking internal links
          this.revertToUrlVersion();
        }
      }
    });
  }

  handleVersionChange(newVersion: string): void {
    const previousVersion = this.menuVersion;
    this.menuVersion = newVersion;

    // Sync all version switchers to the same value
    const versionSelects =
      this.sidebar.querySelectorAll<HTMLSelectElement>('[data-version-select]');
    versionSelects.forEach((select) => {
      if (select.value !== newVersion) {
        select.value = newVersion;
      }
    });

    document.dispatchEvent(
      new CustomEvent('sidebar:versionChange', {
        detail: { previousVersion, newVersion },
      })
    );

    // Update menu visibility based on the new version
    this.updateMenuForVersion(newVersion);

    // Update link hrefs to point to the new version
    this.updateLinkVersions(previousVersion, newVersion);

    // Update active states - remove them if menu version doesn't match URL version
    this.updateActiveStates();
  }

  private updateMenuForVersion(version: string): void {
    // Show/hide menu items based on omitFrom attribute
    const allMenuItems = this.sidebar.querySelectorAll('[data-omit-from]');

    allMenuItems.forEach((item) => {
      const omitFrom = (item as HTMLElement).dataset.omitFrom?.split(',') || [];
      const shouldHide = omitFrom.includes(version);

      if (shouldHide) {
        item.classList.add('sidebar-nav-item--hidden');
        item.setAttribute('aria-hidden', 'true');
      } else {
        item.classList.remove('sidebar-nav-item--hidden');
        item.setAttribute('aria-hidden', 'false');
      }
    });

    // Show/hide sections based on omitFrom attribute
    const allSections = this.sidebar.querySelectorAll('.sidebar-section[data-omit-from]');

    allSections.forEach((section) => {
      const omitFrom = (section as HTMLElement).dataset.omitFrom?.split(',') || [];
      const shouldHide = omitFrom.includes(version);

      if (shouldHide) {
        section.classList.add('sidebar-section--hidden');
        section.setAttribute('aria-hidden', 'true');
      } else {
        section.classList.remove('sidebar-section--hidden');
        section.setAttribute('aria-hidden', 'false');
      }
    });
  }

  private updateLinkVersions(previousVersion: string, newVersion: string): void {
    // Update all versioned links to point to the new version
    const allLinks = this.sidebar.querySelectorAll<HTMLAnchorElement>('a.sidebar-nav-item[href]');

    allLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href && href.includes(`/${previousVersion}/`)) {
        const newHref = href.replace(`/${previousVersion}/`, `/${newVersion}/`);
        link.setAttribute('href', newHref);
      }
    });
  }

  private updateActiveStates(): void {
    // If menu version doesn't match URL version, remove all active states
    const allActiveItems = this.sidebar.querySelectorAll('.sidebar-nav-item--active');

    if (this.menuVersion !== this.urlVersion) {
      allActiveItems.forEach((item) => {
        item.classList.add('sidebar-nav-item--inactive');
        item.classList.remove('sidebar-nav-item--active');
      });
    } else {
      allActiveItems.forEach((item) => {
        item.classList.remove('sidebar-nav-item--inactive');
      });
    }
  }

  public revertToUrlVersion(): void {
    // Revert menu back to URL version
    if (this.menuVersion !== this.urlVersion) {
      const versionSelects =
        this.sidebar.querySelectorAll<HTMLSelectElement>('[data-version-select]');
      versionSelects.forEach((select) => {
        select.value = this.urlVersion;
      });
      this.handleVersionChange(this.urlVersion);
    }
  }

  updateVisibility(activeLevel: number): void {
    const versionSwitchers = this.sidebar.querySelectorAll('[data-version-switcher]');

    versionSwitchers.forEach((switcher) => {
      const column = switcher.closest('[data-parent-id]') as HTMLElement;
      const parentId = column?.dataset.parentId || '';
      const isActiveColumn = parentId === this.activeSubmenuPath[this.activeSubmenuPath.length - 1];

      if (activeLevel > 0 && isActiveColumn) {
        switcher.classList.remove('sidebar-version-switcher--hidden');
      } else {
        switcher.classList.add('sidebar-version-switcher--hidden');
      }
    });
  }

  updatePath(path: string[]): void {
    this.activeSubmenuPath = path;
  }

  getVersion(): string {
    return this.menuVersion;
  }

  getUrlVersion(): string {
    return this.urlVersion;
  }

  setVersion(version: string): void {
    const versionSelects =
      this.sidebar.querySelectorAll<HTMLSelectElement>('[data-version-select]');
    versionSelects.forEach((select) => {
      select.value = version;
    });
    this.handleVersionChange(version);
  }
}
