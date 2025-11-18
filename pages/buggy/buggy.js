let cartItems = [];

// Open cart modal
document.getElementById("cartButton").addEventListener("click", function() {
    document.getElementById("cartModal").style.display = "block";
    displayCartItems(cartItems); // Display current items in the cart
});

// Close modal when clicking on the close button
document.querySelector(".close-button").addEventListener("click", function() {
    document.getElementById("cartModal").style.display = "none";
});

// Close modal when clicking outside of it
window.onclick = function(event) {
    if (event.target == document.getElementById("cartModal")) {
        document.getElementById("cartModal").style.display = "none";
    }
};

// Function to display items in the cart
function displayCartItems(items) {
    const cartItemsDiv = document.getElementById("cartItems");

    // Clear previous items
    cartItemsDiv.innerHTML = '';

    // Add each item to the cart view
    items.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.textContent = ${item.name} - $${item.price};
        cartItemsDiv.appendChild(itemDiv);
    });
}

// Function to add item to cart
function addToCart(name, price) {
    const item = { name, price };
    cartItems.push(item);
    alert(${name} has been added to your cart!);
}
