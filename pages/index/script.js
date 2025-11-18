// Ensure the event listeners do not interfere with each other
document.addEventListener('DOMContentLoaded', () => {
    let cartItems = []; // Array to store cart items

// Scroll functionality
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    const logo = document.querySelector('.logo');
    const firstLink = document.querySelector('.first-link'); // Select the first link

    if (window.scrollY > 0) {
        header.classList.add('scrolled'); // Adds the class to make the header translucent
        logo.classList.add('scrolled'); // Changes logo color to black
    } else {
        header.classList.remove('scrolled'); // Removes the class to revert the header to transparent
        logo.classList.remove('scrolled'); // Reverts logo color back to white
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