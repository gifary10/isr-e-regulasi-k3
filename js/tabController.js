/**
 * Tab Controller - Handles tab navigation
 */
window.tabController = (function() {
    let currentTab = 'daftar';

    function switchTab(tabId) {
        if (tabId === currentTab) return;
        
        // Update UI
        document.querySelectorAll('[role="tab"]').forEach(tab => {
            const isActive = tab.getAttribute('data-tab') === tabId;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive);
            tab.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        document.querySelectorAll('[role="tabpanel"]').forEach(content => {
            const isActive = content.id === `${tabId}Tab`;
            content.classList.toggle('active', isActive);
            content.setAttribute('aria-hidden', !isActive);
        });

        currentTab = tabId;

        // Load regulation document if needed
        if (tabId === 'regulasi' && window.app.state.currentRegulation) {
            window.regulationDetailController.showDocument(window.app.state.currentRegulation);
        }

        // Focus on the first focusable element in the new tab
        setTimeout(() => {
            const activeTabPanel = document.querySelector(`#${tabId}Tab`);
            const focusableElements = activeTabPanel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        }, 50);
    }

    function handleTabClick(e) {
        e.preventDefault();
        const tabId = this.getAttribute('data-tab');
        switchTab(tabId);
    }

    function init() {
        // Set up tab event listeners using event delegation
        document.querySelector('[role="tablist"]')?.addEventListener('click', (e) => {
            const tab = e.target.closest('[role="tab"]');
            if (tab) {
                handleTabClick.call(tab, e);
            }
        });

        // Add keyboard navigation for tabs
        document.querySelector('[role="tablist"]')?.addEventListener('keydown', (e) => {
            const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
            const currentIndex = tabs.findIndex(tab => tab.getAttribute('data-tab') === currentTab);
            
            let newIndex = currentIndex;
            
            switch (e.key) {
                case 'ArrowLeft':
                    newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                    break;
                case 'ArrowRight':
                    newIndex = (currentIndex + 1) % tabs.length;
                    break;
                case 'Home':
                    newIndex = 0;
                    break;
                case 'End':
                    newIndex = tabs.length - 1;
                    break;
                default:
                    return;
            }
            
            e.preventDefault();
            tabs[newIndex].click();
            tabs[newIndex].focus();
        });

        // Initialize with daftar tab
        switchTab('daftar');
    }

    return {
        init,
        switchTab,
        getCurrentTab: () => currentTab
    };
})();