/**
 * Regulation Service - Handles data loading and filtering
 */
window.regulationService = (function() {
    const API_BASE = 'data/';
    const REGULATION_FILES = [
        'permenaker_no1_1976.json',
        'permenaker_no1_1979.json',
        'permenaker_no1_1981.json',
        'permenaker_no2_1980.json',
        'permenaker_no2_1983.json',
        'permenaker_no2_1992.json',
        'permenaker_no2_2023.json',
        'permenaker_no4_1980.json',
        'permenaker_no4_1985.json',
        'permenaker_no4_1987.json',
        'permenaker_no5_1985.json',
        'permenaker_no5_1996.json',
        'permenaker_no5_2018.json',
        'permenaker_no8_2010.json',
        'permenaker_no8_2018.json',
        'permenaker_no8_2020.json',
        'permenaker_no13_2011.json',
        'permenaker_no25_2015.json',
        'permenaker_no26_2014.json',
        'permenaker_no38_2016.json',
        'permenaker_no7_1964.json',
        'pp_no50_2012.json',
        'uu_no1_1970.json',
        'uu_no2_2017.json',
        'uu_no4_2009.json',
        'uu_no6_2023.json',
        'uu_no11_2020.json',
        'uu_no13_2003.json',
        'uu_no22_2001.json',
        'uu_no24_2011.json',
        'uu_no32_2009.json',
        'uu_no36_2009.json'
    ];

    // Cache for loaded regulations
    let regulationsCache = null;

    async function fetchRegulation(file) {
        try {
            const response = await fetch(`${API_BASE}${file}`);
            if (!response.ok) throw new Error(`Failed to load ${file} (${response.status})`);
            
            const data = await response.json();
            
            // Validate basic structure
            if (!data.id || !data.judul || !data.jenis) {
                console.warn(`Invalid structure in ${file}`);
                return null;
            }
            
            // Ensure array properties exist
            data.kewajiban_perusahaan = data.kewajiban_perusahaan || [];
            data.implementasi = data.implementasi || [];
            data.regulasi_terkait = data.regulasi_terkait || [];
            
            return data;
        } catch (error) {
            console.error(`Error loading ${file}:`, error);
            return null;
        }
    }

    async function loadRegulations() {
        // Return cached data if available
        if (regulationsCache) {
            return [...regulationsCache]; // Return copy to prevent mutation
        }

        try {
            showLoading();
            
            const regulations = await Promise.all(
                REGULATION_FILES.map(fetchRegulation)
            );
            
            // Filter out null values and cache the result
            regulationsCache = regulations.filter(reg => reg !== null);
            
            if (regulationsCache.length === 0) {
                throw new Error('No valid regulations loaded');
            }
            
            return [...regulationsCache];
        } catch (error) {
            console.error('Error loading regulations:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    function filterRegulations(regulations, searchTerm = '', category = 'all') {
        if (!regulations || !Array.isArray(regulations)) return [];
        
        const term = searchTerm.toLowerCase().trim();
        
        return regulations.filter(reg => {
            // Validate regulation structure
            if (!reg || typeof reg !== 'object') return false;
            
            // Category filter
            if (category !== 'all') {
                const typeMap = {
                    'uu': 'Undang-Undang',
                    'pp': 'Peraturan Pemerintah',
                    'permen': 'Peraturan Menteri Ketenagakerjaan'
                };
                
                if (!reg.jenis || !reg.jenis.includes(typeMap[category])) {
                    return false;
                }
            }
            
            // Search term filter
            if (term) {
                const searchFields = [
                    reg.judul,
                    reg.nomor,
                    reg.tahun,
                    reg.deskripsi,
                    reg.latar_belakang
                ].filter(Boolean).map(f => f.toLowerCase());
                
                return searchFields.some(field => field.includes(term));
            }
            
            return true;
        });
    }

    function showLoading() {
        const container = document.getElementById('regulationContainer');
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Memuat...</span>
                    </div>
                    <p>Memuat regulasi...</p>
                </div>
            `;
        }
    }

    function hideLoading() {
        const container = document.getElementById('regulationContainer');
        if (container) {
            const loading = container.querySelector('.loading-state');
            if (loading) loading.remove();
        }
    }

    return {
        loadRegulations,
        filterRegulations,
        getCachedRegulations: () => regulationsCache ? [...regulationsCache] : null
    };
})();