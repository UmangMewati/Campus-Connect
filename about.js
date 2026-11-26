// ==========================================
// CAMPUSCONNECT - ABOUT PAGE ANIMATIONS
// ==========================================


// SELECT ELEMENTS TO ANIMATE

const revealElements = document.querySelectorAll(
    ".about-section, .mission-card, .vision-card, " +
    ".team-heading, .team-card, .contact-heading, " +
    ".contact-info, .contact-form"
);


// ADD REVEAL CLASS

revealElements.forEach((element, index) => {

    element.classList.add("reveal");

    // Stagger team cards
    if (element.classList.contains("team-card")) {
        element.style.transitionDelay = `${index * 0.1}s`;
    }

});


// INTERSECTION OBSERVER

const observer = new IntersectionObserver(
    (entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

                // Stop observing after animation
                observer.unobserve(entry.target);

            }

        });

    },

    {
        threshold: 0.15
    }
);


// OBSERVE ELEMENTS

revealElements.forEach((element) => {

    observer.observe(element);

});