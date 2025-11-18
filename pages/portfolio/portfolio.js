// Ensure the event listeners do not interfere with each other
document.addEventListener('DOMContentLoaded', () => {
    let cartItems = []; // Array to store cart items

    // Scroll functionality
    window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    const links = document.querySelectorAll('.header nav ul li a');

    console.log("Scroll detected:", window.scrollY); // For debug
    if (window.scrollY > 0) {
        header.classList.add('scrolled'); // Add class to header
        links.forEach(link => {
            link.classList.add('scrolled'); // Add class to each link for new styles
        });
    } else {
        header.classList.remove('scrolled'); // Remove class when at the top
        links.forEach(link => {
            link.classList.remove('scrolled'); // Remove class from each link
        });
    }
});

    // Function to open cart
    window.openCart = function() {
        const shoppingSidebar = document.getElementById('shoppingSidebar');
        shoppingSidebar.classList.add('open'); // Show the sidebar
        // Populate sidebar content (items or empty message)
    };

    // Function to close cart
    window.closeCart = function() {
        const shoppingSidebar = document.getElementById('shoppingSidebar');
        shoppingSidebar.classList.remove('open'); // Hide the sidebar
    };

    // Function to close the sidebar
    window.closeCart = function() {
    console.log("Close Cart function triggered"); // Debugging log
    const shoppingSidebar = document.getElementById('shoppingSidebar');
    shoppingSidebar.classList.remove('open'); // Hide sidebar
    };

    // Close the sidebar when clicking anywhere on the document
    document.addEventListener('click', function(event) {
        const shoppingSidebar = document.getElementById('shoppingSidebar');
        const cartIcon = document.querySelector('.cart-icon');

        // If the sidebar is open and the click is outside of it and the cart icon
        if (shoppingSidebar.classList.contains('open') && 
            !shoppingSidebar.contains(event.target) && 
            !cartIcon.contains(event.target)) {
            closeCart(); // Close the sidebar
        }
    });
});

// Lightbox functionality
let slideIndex = 1;

// Open the lightbox
function openLightbox() {
    document.getElementById("lightbox").style.display = "block";
    showSlides(slideIndex); // Show the first slide
}

// Close the lightbox
function closeLightbox() {
    document.getElementById("lightbox").style.display = "none";
}

// Show the current slide
function currentSlide(n) {
    showSlides(slideIndex = n);
}

// Navigation through slides
function plusSlides(n) {
    showSlides(slideIndex += n);
}

// Display the slides based on the index
function showSlides(n) {
    let i;
    const allImages = document.querySelectorAll(".gallery img"); // All gallery images
    const lightboxImage = document.getElementById("lightbox-image");

    if (n > allImages.length) { slideIndex = 1 } // Wrap around to first
    if (n < 1) { slideIndex = allImages.length } // Wrap around to last

    // Update the lightbox image source
    lightboxImage.src = allImages[slideIndex - 1].src; // Set the lightbox image src to the current image
}

// Add event listeners to close the lightbox when clicking off the image
document.getElementById("lightbox").onclick = function () {
    closeLightbox();
};

// Navigation with keyboard arrows
document.addEventListener('keydown', function (event) {
    if (event.key === "ArrowRight") {
        plusSlides(1);
    } else if (event.key === "ArrowLeft") {
        plusSlides(-1);
    } else if (event.key === "Escape") {
        closeLightbox();
    }
});

// Prevent click on arrows from closing the lightbox
document.querySelectorAll('.prev, .next').forEach(button => {
    button.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent click event from propagating to the lightbox
    });
});
