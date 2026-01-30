zz// Actualiza el año en el pie de página
document.getElementById('year').textContent = new Date().getFullYear();
// Configuración del carrusel
const carousel = document.getElementById('carousel');
const slides = carousel.children;
const totalSlides = slides.length;
const slideWidth = slides[0].offsetWidth + 16;
let index = 0;
let isResetting = false;
function nextSlide() {
    if (isResetting) return;
    index++;
    if (index >= totalSlides - 1) {
        carousel.scrollTo({ left: index * slideWidth, behavior: 'smooth' });
        isResetting = true;
        setTimeout(() => {
            carousel.scrollTo({ left: 0, behavior: 'smooth' }); // salto invisible(no funciona)
            index = 0;
            isResetting = false;
        }, 600);
    } else {
        carousel.scrollTo({ left: index * slideWidth, behavior: 'smooth' });
    }
}
setInterval(nextSlide, 2000);