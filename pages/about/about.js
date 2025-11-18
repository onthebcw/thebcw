const StoreApp = {
    cartItems: [],
    qty: 1,
    slideIndex: 1,

    init: function() {
        // Attach the modal close function to the close elements
        document.querySelectorAll('.close').forEach(element => {
            element.addEventListener('click', this.closeModal.bind(this));
        });

        // Attach the scroll event handler
        window.addEventListener('scroll', this.updateHeaderOnScroll.bind(this));
    },

    changeMainImage: function(thumbnail) {
        const mainImage = document.getElementById("currentImage");
        mainImage.src = thumbnail.src; // Change the main image to the clicked thumbnail

        // Set the image for the modal to match the thumbnail
        const modalImage = document.getElementById("modal-image");
        modalImage.src = thumbnail.src; // Update modal image
    },

    openModal: function() {
        const modal = document.getElementById("productModal");
        modal.style.display = "block"; // Show the modal
        this.showSlides(this.slideIndex); // Show the first image in the slideshow
    },

    closeModal: function() {
        document.getElementById("productModal").style.display = "none"; // Hide the modal
    },

    showSlides: function(n) {
        const allSlides = document.querySelectorAll(".thumbnail");
        const modalImage = document.getElementById("modal-image");

        this.slideIndex = n > allSlides.length ? 1 : n < 1 ? allSlides.length : n;
        modalImage.src = allSlides[this.slideIndex - 1].src; // Set the modal image source
    },

    plusSlides: function(n) {
        this.showSlides(this.slideIndex += n); // Increment slide index
    },

    updateHeaderOnScroll: function() {
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
    }
};

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    StoreApp.init();
});
