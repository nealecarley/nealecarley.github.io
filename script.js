/**
 * Lightbox functionality for image gallery
 */
document.querySelectorAll('.lightbox').forEach(item => {
    item.addEventListener('click', event => {
        event.preventDefault();
        const imgSrc = item.getAttribute('href');
        const lightbox = document.createElement('div');
        lightbox.classList.add('lightbox-overlay');
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <img src="${imgSrc}" alt="">
                <span class="close">&times;</span>
            </div>
        `;
        document.body.appendChild(lightbox);

        lightbox.querySelector('.close').addEventListener('click', () => {
            document.body.removeChild(lightbox);
        });
    });
});