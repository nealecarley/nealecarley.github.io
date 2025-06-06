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

.lightbox-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.lightbox-content {
    position: relative;
}

.lightbox-content img {
    max-width: 90%;
    max-height: 90%;
}

.close {
    position: absolute;
    top: 10px;
    right: 20px;
    color: white;
    font-size: 30px;
    cursor: pointer;
    transition: color 0.3s;
}

.close:hover {
    color: #ff0000; /* Change color on hover */
}
