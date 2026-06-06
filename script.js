// Future JavaScript for interactivity will go here.

document.addEventListener('DOMContentLoaded', () => {
    // Temperature Slider Logic
    const slider = document.getElementById('temp-slider');
    const k_display = document.getElementById('temp-k');
    const c_display = document.getElementById('temp-c');
    const f_display = document.getElementById('temp-f');

    function updateTemperatures() {
        const kelvin = parseFloat(slider.value);
        const celsius = kelvin - 273.15;
        const fahrenheit = celsius * (9/5) + 32;

        k_display.textContent = `${kelvin.toFixed(0)} K`;
        c_display.textContent = `${celsius.toFixed(0)} °C`;
        f_display.textContent = `${fahrenheit.toFixed(0)} °F`;
    }

    // Initialize display on page load
    updateTemperatures();

    // Add event listener for slider changes
    slider.addEventListener('input', updateTemperatures);


    // Element Click Logic
    const elements = document.querySelectorAll('.element');
    elements.forEach(element => {
        element.addEventListener('click', () => {
            // Example: Log the element's symbol to the console on click.
            const symbol = element.querySelector('.symbol').textContent;
            console.log(`Element clicked: ${symbol}`);

            // TODO: Add logic to display detailed information
            // in the left placeholder box.
        });
    });
});
