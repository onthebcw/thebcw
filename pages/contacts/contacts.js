// Ensure the event listeners do not interfere with each other
document.addEventListener('DOMContentLoaded', () => {
    let cartItems = []; // Array to store cart items

    // Scroll functionality
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    const logo = document.querySelector('.logo');
    const links = document.querySelectorAll('.header nav ul li a');
    const firstLink = document.querySelector('.first-link');

    console.log("Scroll detected:", window.scrollY); // For debug
    if (window.scrollY > 0) {
        header.classList.add('scrolled'); // Add class to header
        logo.classList.add('scrolled'); // Change logo color to black

        // Add class to each link for new styles
        links.forEach(link => {
            link.classList.add('scrolled'); // Add 'scrolled' class to each link
        });

        firstLink.classList.add('scrolled'); // Change first link color to white
    } else {
        header.classList.remove('scrolled'); // Remove class from header
        logo.classList.remove('scrolled'); // Revert logo color back to original

        // Remove class from each link
        links.forEach(link => {
            link.classList.remove('scrolled'); // Remove 'scrolled' class from each link
        });

        firstLink.classList.remove('scrolled'); // Revert first link color back to the original
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