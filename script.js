// Dark Mode Toggle

const themeToggle = document.getElementById("theme-toggle");


// Check saved theme
let savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.innerHTML = "☀️";
}


// Toggle theme when button is clicked

themeToggle.addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");

    // Check if dark mode is enabled
    if (document.body.classList.contains("dark-mode")) {

        themeToggle.innerHTML = "☀️";

        localStorage.setItem("theme", "dark");

    } else {

        themeToggle.innerHTML = "🌙";

        localStorage.setItem("theme", "light");

    }

});

// Community Statistics Counter Animation

const counters = document.querySelectorAll(".counter");

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            const counter = entry.target;
            const target = Number(counter.dataset.target);

            let count = 0;

            const increment = Math.ceil(target / 100);

            const updateCounter = () => {

                count += increment;

                if (count >= target) {
                    counter.innerText = target + "+";
                } else {
                    counter.innerText = count;
                    requestAnimationFrame(updateCounter);
                }

            };

            updateCounter();

            observer.unobserve(counter);

        }

    });

}, {
    threshold: 0.5
});


counters.forEach(counter => {
    observer.observe(counter);
});

const quotes = [
    {
        text: "It always seems impossible until it's done.",
        author: "Nelson Mandela"
    },
    {
        text: "Believe you can and you're halfway there.",
        author: "Theodore Roosevelt"
    },
    {
        text: "Great things are done by a series of small things brought together.",
        author: "Vincent van Gogh"
    },
    {
        text: "Your limitation—it's only your imagination.",
        author: "Unknown"
    },
    {
        text: "The secret of getting ahead is getting started.",
        author: "Mark Twain"
    },
    {
        text: "Don't watch the clock; do what it does. Keep going.",
        author: "Sam Levenson"
    },
    {
        text: "Success is the sum of small efforts, repeated day in and day out.",
        author: "Robert Collier"
    },
    {
        text: "You don't have to be perfect to be amazing.",
        author: "Unknown"
    },
    {
        text: "Dream big. Start small. Act now.",
        author: "Robin Sharma"
    },
    {
        text: "The beautiful thing about learning is that nobody can take it away from you.",
        author: "B. B. King"
    }
];

const quoteElement = document.getElementById("daily-quote");
const authorElement = document.getElementById("quote-author");
const quoteButton = document.getElementById("new-quote-btn");

let currentQuote = -1;

function showQuote(index) {
    quoteElement.textContent = `"${quotes[index].text}"`;
    authorElement.textContent = `— ${quotes[index].author}`;
}

// Display a random quote
function generateQuote() {
    let randomIndex;

    do {
        randomIndex = Math.floor(Math.random() * quotes.length);
    } while (randomIndex === currentQuote && quotes.length > 1);

    currentQuote = randomIndex;
    showQuote(currentQuote);
}

quoteButton.addEventListener("click", generateQuote);

// Show a quote when the page loads
generateQuote();