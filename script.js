document.addEventListener('DOMContentLoaded', () => {
    
    // --- Configuration ---
    const gradeMap = {
        "O": 10,
        "A+": 9,
        "A": 8,
        "B+": 7,
        "B": 6,
        "C": 5,
        "D": 4, // Added for completeness, though table stops at C
        "F": 0
    };

    // --- DOM Elements ---
    const numSubjectsInput = document.getElementById('num-subjects');
    const subjectsContainer = document.getElementById('subjects-container');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultContainer = document.getElementById('result-container');
    const finalCgpaDisplay = document.getElementById('final-cgpa');
    
    // --- Functions ---

    // Function to generate subject rows based on count
    function renderSubjectRows(count) {
        subjectsContainer.innerHTML = ''; // Clear existing
        
        for (let i = 1; i <= count; i++) {
            const row = document.createElement('div');
            row.classList.add('subject-row');
            
            row.innerHTML = `
                <span class="subject-label">Subject #${i}</span>
                <div class="row-inputs">
                    <div class="input-group">
                        <label>Grade</label>
                        <select class="grade-select">
                            <option value="O">O</option>
                            <option value="A+">A+</option>
                            <option value="A">A</option>
                            <option value="B+">B+</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Credit</label>
                        <input type="number" class="credit-input" value="4" min="0" step="1">
                    </div>
                </div>
            `;
            subjectsContainer.appendChild(row);
        }
    }

    // Function to calculate CGPA
    function calculateCGPA() {
        const prevCGPA = parseFloat(document.getElementById('prev-cgpa').value) || 0;
        const prevCredit = parseFloat(document.getElementById('prev-credit').value) || 0;

        let totalPoints = prevCGPA * prevCredit;
        let totalCredits = prevCredit;

        const subjectRows = document.querySelectorAll('.subject-row');

        subjectRows.forEach(row => {
            const grade = row.querySelector('.grade-select').value;
            const credit = parseFloat(row.querySelector('.credit-input').value) || 0;
            
            const gradePoint = gradeMap[grade] || 0;
            
            totalPoints += (gradePoint * credit);
            totalCredits += credit;
        });

        // Avoid division by zero
        let cgpa = 0;
        if (totalCredits > 0) {
            cgpa = totalPoints / totalCredits;
        }

        // Display Result
        finalCgpaDisplay.textContent = cgpa.toFixed(2);
        resultContainer.classList.remove('hidden');
    }

    // --- Event Listeners ---
    
    // Update rows when number of subjects changes
    numSubjectsInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        if (val > 0 && val <= 50) { // Safety limit
            renderSubjectRows(val);
        }
    });

    // Calculate on click
    calculateBtn.addEventListener('click', calculateCGPA);

    // --- Initialization ---
    renderSubjectRows(5); // Default to 5 subjects on load
});
