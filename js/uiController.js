/**
 * UI Controller - Handles UI interactions and rendering
 */
window.uiController = (function() {
    let searchTimeout = null;
    let lastSearchTerm = '';
    let lastCategory = 'all';

    function handleSearch() {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (!searchInput || !categoryFilter) return;

        const searchTerm = searchInput.value.trim();
        const category = categoryFilter.value;
        
        // Skip if search criteria haven't changed
        if (searchTerm === lastSearchTerm && category === lastCategory) {
            return;
        }
        
        lastSearchTerm = searchTerm;
        lastCategory = category;

        try {
            const filtered = window.regulationService.filterRegulations(
                window.app.state.regulations,
                searchTerm,
                category
            );
            
            displayRegulations(filtered);
        } catch (error) {
            console.error('Search error:', error);
            showError('Gagal melakukan pencarian. Silakan coba lagi.');
        }
    }

    function debounceSearch() {
        // Clear any existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Set a new timeout
        searchTimeout = setTimeout(() => {
            handleSearch();
            searchTimeout = null;
        }, 300); // 300ms delay
    }

    function displayRegulations(regulations) {
        const container = document.getElementById('regulationContainer');
        if (!container) return;

        // Check if regulations is valid
        if (!Array.isArray(regulations)) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    Data regulasi tidak valid
                </div>
            `;
            return;
        }

        if (regulations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-exclamation-circle"></i>
                    <p>Tidak ada regulasi yang ditemukan</p>
                </div>
            `;
            return;
        }

        container.innerHTML = regulations.map(regulation => {
            // Ensure regulation exists and has required properties
            if (!regulation || !regulation.judul || !regulation.jenis || !regulation.nomor || !regulation.tahun) {
                console.warn('Invalid regulation data:', regulation);
                return '';
            }

            // Ensure array properties exist
            const kewajiban = regulation.kewajiban_perusahaan || [];
            const implementasi = regulation.implementasi || [];
            const regulasiTerkait = regulation.regulasi_terkait || [];
            
            return `
                <article class="regulation-list-item" tabindex="0" data-id="${regulation.id}">
                    <div class="regulation-list-content">
                        <h4 class="regulation-list-title">${regulation.judul}</h4>
                        <p class="regulation-list-meta">${regulation.jenis} No. ${regulation.nomor}/${regulation.tahun}</p>
                    </div>
                    <button class="btn btn-sm btn-detail" data-id="${regulation.id}" 
                            aria-label="Lihat detail ${regulation.judul}">
                        <i class="bi bi-chevron-right" aria-hidden="true"></i>
                    </button>
                </article>
            `;
        }).join('');

        // Add event listeners using event delegation
        container.addEventListener('click', handleContainerClick);
        container.addEventListener('keydown', handleContainerKeydown);
    }

    function handleContainerClick(e) {
        const btn = e.target.closest('.btn-detail');
        if (btn) {
            const regulation = window.app.state.regulations.find(r => r.id === btn.dataset.id);
            if (regulation) {
                window.regulationDetailController.showDetail(regulation);
            }
            return;
        }
        
        const article = e.target.closest('.regulation-list-item');
        if (article && !e.target.closest('.btn-detail')) {
            const btn = article.querySelector('.btn-detail');
            if (btn) {
                btn.click();
            }
        }
    }

    function handleContainerKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            const article = e.target.closest('.regulation-list-item');
            if (article) {
                e.preventDefault();
                const btn = article.querySelector('.btn-detail');
                if (btn) {
                    btn.click();
                }
            }
        }
    }

    function showError(message) {
        const container = document.getElementById('regulationContainer');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    ${message}
                </div>
            `;
        }
    }

    function hideLoading() {
        const container = document.getElementById('regulationContainer');
        if (container) {
            const loading = container.querySelector('.loading-state');
            if (loading) {
                loading.remove();
            }
        }
    }

    function cleanupEventListeners() {
        const container = document.getElementById('regulationContainer');
        if (container) {
            container.removeEventListener('click', handleContainerClick);
            container.removeEventListener('keydown', handleContainerKeydown);
        }

        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (searchInput) {
            searchInput.removeEventListener('input', debounceSearch);
            searchInput.removeEventListener('search', handleSearch);
        }
        
        if (categoryFilter) {
            categoryFilter.removeEventListener('change', handleSearch);
        }
    }

    function init() {
        // Cleanup any existing listeners first
        cleanupEventListeners();

        // Search event listeners
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (searchInput) {
            searchInput.addEventListener('input', debounceSearch);
            searchInput.addEventListener('search', handleSearch);
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', handleSearch);
        }

        // Focus management
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                const activeElement = document.activeElement;
                if (!activeElement || activeElement === document.body) {
                    const currentTab = window.tabController.getCurrentTab();
                    const tabPanel = document.querySelector(`#${currentTab}Tab`);
                    if (tabPanel) {
                        const focusable = tabPanel.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                        if (focusable) {
                            focusable.focus();
                        }
                    }
                }
            }
        });
    }

    return {
        init,
        displayRegulations,
        showError,
        hideLoading,
        handleSearch,
        cleanupEventListeners
    };
})();