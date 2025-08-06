/**
 * Main application entry point
 */
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Initialize application state
        const app = {
            state: {
                regulations: [],
                currentRegulation: null,
                isLoading: true,
                error: null
            }
        };

        // Store app in window
        window.app = app;

        // Initialize modules
        if (!window.tabController || !window.uiController || !window.regulationService) {
            throw new Error('Required modules not found');
        }

        window.tabController.init();
        window.uiController.init();
        
        // Load data
        app.state.regulations = await window.regulationService.loadRegulations();
        
        // Display initial data
        window.uiController.displayRegulations(app.state.regulations);
    } catch (error) {
        console.error('Application initialization failed:', error);
        window.uiController.showError('Gagal memuat data regulasi. Silakan muat ulang halaman.');
        window.app.state.error = error;
    } finally {
        window.app.state.isLoading = false;
        window.uiController.hideLoading();
    }
});