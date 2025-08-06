/**
 * Regulation Detail Controller - Handles regulation detail display
 */
window.regulationDetailController = (function() {
    // Cache for accordion state
    const accordionState = {};
    let accordionEventListeners = [];

    function createAccordionItem(header, content, icon, id, show = false) {
        // Store initial state
        if (accordionState[id] === undefined) {
            accordionState[id] = show;
        }

        return `
            <div class="accordion-item">
                <h2 class="accordion-header" id="${id}-header">
                    <button class="accordion-button ${accordionState[id] ? '' : 'collapsed'}" 
                            type="button" 
                            data-bs-toggle="collapse" 
                            data-bs-target="#${id}"
                            aria-expanded="${accordionState[id] ? 'true' : 'false'}"
                            aria-controls="${id}">
                        <i class="bi ${icon} me-2"></i>${header}
                    </button>
                </h2>
                <div id="${id}" class="accordion-collapse collapse ${accordionState[id] ? 'show' : ''}" 
                     data-bs-parent="#regulationAccordion"
                     aria-labelledby="${id}-header">
                    <div class="accordion-body">${content}</div>
                </div>
            </div>
        `;
    }

    function showDetail(regulation) {
        if (!regulation || typeof regulation !== 'object') {
            console.error('Invalid regulation data:', regulation);
            window.uiController.showError('Data regulasi tidak valid');
            return;
        }

        window.app.state.currentRegulation = regulation;
        
        const content = document.getElementById('contentDetail');
        if (!content) return;

        // Cleanup previous event listeners
        cleanupAccordionListeners();

        // Ensure array properties exist
        regulation.kewajiban_perusahaan = regulation.kewajiban_perusahaan || [];
        regulation.implementasi = regulation.implementasi || [];
        regulation.regulasi_terkait = regulation.regulasi_terkait || [];

        // Create accordion items
        const accordionItems = [
            createInfoDasarAccordion(regulation),
            createLatarBelakangAccordion(regulation),
            createDeskripsiAccordion(regulation),
            createKewajibanAccordion(regulation),
            createImplementasiAccordion(regulation),
            createRegulasiTerkaitAccordion(regulation)
        ].filter(Boolean).join('');

        content.innerHTML = `
            <div class="regulation-header">
                <h1 class="regulation-title">${regulation.judul || 'Judul tidak tersedia'}</h1>
                <div class="regulation-meta">
                    ${regulation.jenis ? `<span class="badge bg-primary">${regulation.jenis}</span>` : ''}
                    ${regulation.nomor && regulation.tahun ? `<span>No. ${regulation.nomor}/${regulation.tahun}</span>` : ''}
                    ${regulation.tanggal_diundangkan ? `<span><i class="bi bi-calendar me-1"></i>${regulation.tanggal_diundangkan}</span>` : ''}
                </div>
            </div>
            <div class="accordion" id="regulationAccordion">
                ${accordionItems}
            </div>
        `;

        // Setup accordion event listeners
        setupAccordionListeners();

        // Switch to detail tab
        window.tabController.switchTab('konten');

        // Focus on the header for screen readers
        setTimeout(() => {
            const title = content.querySelector('.regulation-title');
            if (title) {
                title.setAttribute('tabindex', '-1');
                title.focus();
            }
        }, 100);
    }

    function createInfoDasarAccordion(regulation) {
        if (!regulation.tanggal_diundangkan && !regulation.tanggal_berlaku && 
            !regulation.instansi_penerbit && !regulation.status) {
            return null;
        }

        return createAccordionItem(
            'Informasi Dasar',
            `
            <div class="row">
                <div class="col-md-6">
                    ${regulation.tanggal_diundangkan ? `<p><strong>Tanggal Diundangkan:</strong> ${regulation.tanggal_diundangkan}</p>` : ''}
                    ${regulation.tanggal_berlaku ? `<p><strong>Tanggal Berlaku:</strong> ${regulation.tanggal_berlaku}</p>` : ''}
                    ${regulation.tanggal_rilis ? `<p><strong>Tanggal Rilis:</strong> ${regulation.tanggal_rilis}</p>` : ''}
                </div>
                <div class="col-md-6">
                    ${regulation.instansi_penerbit ? `<p><strong>Instansi Penerbit:</strong> ${regulation.instansi_penerbit}</p>` : ''}
                    ${regulation.jumlah_bab || regulation.jumlah_pasal ? 
                      `<p><strong>Struktur Dokumen:</strong> ${regulation.jumlah_bab || ''}${regulation.jumlah_bab && regulation.jumlah_pasal ? ', ' : ''}${regulation.jumlah_pasal || ''}</p>` : ''}
                    ${regulation.status ? `<p><strong>Status:</strong> <span class="badge ${regulation.status === 'Masih berlaku' ? 'bg-success' : 'bg-secondary'}">${regulation.status}</span></p>` : ''}
                </div>
            </div>
            `,
            'bi-info-circle',
            'infoDasar',
            true
        );
    }

    function createLatarBelakangAccordion(regulation) {
        if (!regulation.latar_belakang) return null;

        return createAccordionItem(
            'Latar Belakang',
            `<p>${regulation.latar_belakang}</p>`,
            'bi-book',
            'latarBelakang'
        );
    }

    function createDeskripsiAccordion(regulation) {
        if (!regulation.deskripsi) return null;

        return createAccordionItem(
            'Deskripsi',
            `<p>${regulation.deskripsi}</p>`,
            'bi-file-text',
            'deskripsi'
        );
    }

    function createKewajibanAccordion(regulation) {
        if (!regulation.kewajiban_perusahaan?.length) return null;

        return createAccordionItem(
            'Kewajiban Perusahaan',
            `
            <ul class="list-group list-group-flush">
                ${regulation.kewajiban_perusahaan.map(item => `
                    <li class="list-group-item d-flex">
                        <i class="bi bi-check-circle-fill text-primary me-2"></i>
                        <span>${item}</span>
                    </li>
                `).join('')}
            </ul>
            `,
            'bi-building',
            'kewajiban'
        );
    }

    function createImplementasiAccordion(regulation) {
        if (!regulation.implementasi?.length) return null;

        return createAccordionItem(
            'Implementasi',
            `
            <ul class="list-group list-group-flush">
                ${regulation.implementasi.map(item => `
                    <li class="list-group-item d-flex">
                        <i class="bi bi-gear-fill text-primary me-2"></i>
                        <span>${item}</span>
                    </li>
                `).join('')}
            </ul>
            `,
            'bi-gear',
            'implementasi'
        );
    }

    function createRegulasiTerkaitAccordion(regulation) {
        if (!regulation.regulasi_terkait?.length) return null;

        return createAccordionItem(
            'Regulasi Terkait',
            `
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Judul</th>
                            <th>Hubungan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${regulation.regulasi_terkait.map(item => `
                            <tr>
                                <td>${item.judul || '-'}</td>
                                <td><span class="badge bg-info">${item.hubungan || '-'}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            `,
            'bi-link-45deg',
            'regulasiTerkait'
        );
    }

    function setupAccordionListeners() {
        const buttons = document.querySelectorAll('.accordion-button');
        buttons.forEach(button => {
            const handler = function() {
                const targetId = this.getAttribute('data-bs-target').replace('#', '');
                accordionState[targetId] = !accordionState[targetId];
            };
            button.addEventListener('click', handler);
            accordionEventListeners.push({ element: button, handler });
        });
    }

    function cleanupAccordionListeners() {
        accordionEventListeners.forEach(({ element, handler }) => {
            element.removeEventListener('click', handler);
        });
        accordionEventListeners = [];
    }

    function showDocument(regulation) {
        const viewer = document.getElementById('regulationViewer');
        if (!viewer) return;

        if (!regulation?.link_dokumen) {
            viewer.innerHTML = `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <p>Dokumen tidak tersedia.</p>
                </div>
            `;
            return;
        }

        viewer.innerHTML = `
            <div class="mb-2">
                ${regulation.jenis && regulation.nomor && regulation.tahun ? 
                  `<small class="text-muted">${regulation.jenis} No. ${regulation.nomor}/${regulation.tahun}</small>` : ''}
            </div>
            <div class="iframe-container">
                <iframe src="${regulation.link_dokumen}" 
                        title="Dokumen ${regulation.judul || 'Regulasi'}"
                        aria-label="Dokumen ${regulation.judul || 'Regulasi'}"
                        onerror="window.regulationDetailController.handleIframeError(this, '${regulation.link_dokumen}')">
                </iframe>
            </div>
        `;
    }

    function handleIframeError(iframe, url) {
        if (!iframe?.parentElement) return;
        
        iframe.parentElement.innerHTML = `
            <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <p>Dokumen tidak dapat ditampilkan secara langsung. <a href="${url}" target="_blank">Buka di tab baru</a></p>
            </div>
        `;
    }

    return {
        showDetail,
        showDocument,
        handleIframeError,
        cleanupAccordionListeners
    };
})();