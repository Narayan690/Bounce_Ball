// Waits until the entire HTML document is loaded
document.addEventListener("DOMContentLoaded", () => {
    
    const ballIcon = document.getElementById("ballIcon");
    
    // Use a short delay before starting the animation.
    setTimeout(() => {
        // Add the 'show' class to the ball icon to trigger the fall animation
        ballIcon.classList.add("show");
    }, 300);

});