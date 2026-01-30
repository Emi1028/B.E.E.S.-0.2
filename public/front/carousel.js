// Actualiza el año en el pie de página
document.addEventListener('DOMContentLoaded', function() {
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Configuración del carrusel
    const carousel = document.getElementById('carousel');
    if (!carousel || carousel.children.length === 0) return;

    const slides = carousel.children;
    const totalSlides = slides.length;
    let index = 0;
    let isResetting = false;

    function getSlideWidth() {
        return slides[0].offsetWidth + 16;
    }

    function nextSlide() {
        if (isResetting) return;
        
        const slideWidth = getSlideWidth();
        index++;
        
        if (index >= totalSlides - 1) {
            carousel.scrollTo({ left: index * slideWidth, behavior: 'smooth' });
            isResetting = true;
            setTimeout(() => {
                carousel.scrollTo({ left: 0, behavior: 'smooth' });
                index = 0;
                isResetting = false;
            }, 600);
        } else {
            carousel.scrollTo({ left: index * slideWidth, behavior: 'smooth' });
        }
    }

    setInterval(nextSlide, 2000);
});