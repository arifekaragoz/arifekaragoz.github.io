/**
 * Digital Empathy - Lightbox Photo Gallery
 * Provides full-screen image preview with navigation (next/previous buttons, arrow keys, touch swipe).
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Create and inject lightbox modal elements into body
    const modal = document.createElement('div');
    modal.className = 'lightbox-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Image Gallery Preview');

    modal.innerHTML = `
        <button class="lightbox-btn close" aria-label="Close gallery (Esc)">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        <button class="lightbox-btn prev" aria-label="Previous photo (Left Arrow)">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
        </button>
        <button class="lightbox-btn next" aria-label="Next photo (Right Arrow)">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        </button>
        <div class="lightbox-content">
            <img class="lightbox-image" src="" alt="">
            <div class="lightbox-info">
                <div class="lightbox-caption"></div>
                <div class="lightbox-counter"></div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const imgElem = modal.querySelector('.lightbox-image');
    const captionElem = modal.querySelector('.lightbox-caption');
    const counterElem = modal.querySelector('.lightbox-counter');
    const prevBtn = modal.querySelector('.lightbox-btn.prev');
    const nextBtn = modal.querySelector('.lightbox-btn.next');
    const closeBtn = modal.querySelector('.lightbox-btn.close');

    let currentGallery = [];
    let currentIndex = 0;
    let isOpen = false;

    // Helper: extract caption from card or alt
    function getCaption(img) {
        const card = img.closest('.media-card');
        if (card) {
            const cap = card.querySelector('.caption');
            if (cap && cap.textContent.trim()) {
                return cap.textContent.trim();
            }
        }
        return img.alt ? img.alt.trim() : '';
    }

    // Update displayed image
    function updateModal(index) {
        if (!currentGallery.length) return;
        currentIndex = (index + currentGallery.length) % currentGallery.length;
        const item = currentGallery[currentIndex];

        imgElem.style.opacity = '0';
        imgElem.style.transform = 'scale(0.96)';

        setTimeout(() => {
            imgElem.src = item.src;
            imgElem.alt = item.alt || item.caption;
            captionElem.textContent = item.caption;

            if (currentGallery.length > 1) {
                counterElem.textContent = `${currentIndex + 1} / ${currentGallery.length}`;
                counterElem.style.display = 'inline-block';
                prevBtn.style.display = 'flex';
                nextBtn.style.display = 'flex';
            } else {
                counterElem.style.display = 'none';
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
            }

            imgElem.style.opacity = '1';
            imgElem.style.transform = 'scale(1)';

            // Preload adjacent images
            if (currentGallery.length > 1) {
                const nextImg = new Image();
                nextImg.src = currentGallery[(currentIndex + 1) % currentGallery.length].src;
                const prevImg = new Image();
                prevImg.src = currentGallery[(currentIndex - 1 + currentGallery.length) % currentGallery.length].src;
            }
        }, 120);
    }

    // Open lightbox
    function openLightbox(galleryList, startIndex) {
        currentGallery = galleryList;
        isOpen = true;
        document.body.style.overflow = 'hidden';
        modal.classList.add('active');
        updateModal(startIndex);
    }

    // Close lightbox
    function closeLightbox() {
        isOpen = false;
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            imgElem.src = '';
        }, 300);
    }

    // Button click handlers
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        updateModal(currentIndex - 1);
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        updateModal(currentIndex + 1);
    });

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
    });

    // Close when clicking backdrop
    modal.addEventListener('click', (e) => {
        if (!e.target.closest('.lightbox-content') && !e.target.closest('.lightbox-btn')) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!isOpen) return;

        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            updateModal(currentIndex - 1);
        } else if (e.key === 'ArrowRight') {
            updateModal(currentIndex + 1);
        }
    });

    // Touch swipe navigation for mobile
    let touchStartX = 0;
    let touchStartY = 0;

    modal.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    modal.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        // Ensure horizontal swipe
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
            if (diffX > 0) {
                // Swipe right -> previous
                updateModal(currentIndex - 1);
            } else {
                // Swipe left -> next
                updateModal(currentIndex + 1);
            }
        }
    }, { passive: true });

    // Attach click listener to all media cards containing images and content images
    const targetCards = document.querySelectorAll('.media-card, img.image');

    targetCards.forEach((elem) => {
        const img = elem.tagName === 'IMG' ? elem : elem.querySelector('img');
        if (!img) return; // skip video cards

        elem.style.cursor = 'pointer';
        elem.addEventListener('click', (e) => {
            // Prevent if clicked on an interactive link/button inside
            if (e.target.closest('a, button, video')) return;

            const grid = img.closest('.media-grid');
            let groupImages = [];

            if (grid) {
                groupImages = Array.from(grid.querySelectorAll('.media-card img'));
            } else {
                const section = img.closest('.media-section, .activities-section') || document;
                groupImages = Array.from(section.querySelectorAll('.media-card img, img.image'));
            }

            if (!groupImages.length) {
                groupImages = [img];
            }

            const galleryData = groupImages.map((el) => ({
                src: el.getAttribute('src'),
                alt: el.getAttribute('alt') || '',
                caption: getCaption(el)
            }));

            const clickedIndex = groupImages.indexOf(img);
            openLightbox(galleryData, clickedIndex >= 0 ? clickedIndex : 0);
        });
    });
});
