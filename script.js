// 1. ΛΕΙΤΟΥΡΓΙΑ ΓΙΑ ΤΗΝ ΕΝΑΛΛΑΓΗ ΘΕΜΑΤΟΣ (Dark/Light)
function toggleTheme() {
    // Εναλλάσσει την κλάση 'light-mode' στο body
    document.body.classList.toggle('light-mode');
    console.log("Θέμα άλλαξε!");
}

// 2. Η ΚΥΡΙΑ ΛΕΙΤΟΥΡΓΙΑ: ΟΤΑΝ ΠΑΤΑΣ ΕΝΑ ΟΝΟΜΑ
async function loadPerson(element, name) {
    // Α) Διαχείριση Εμφάνισης (Highlight στο Timeline)
    const allItems = document.querySelectorAll('.timeline-item');
    allItems.forEach(item => item.classList.remove('active'));
    element.classList.add('active');

    // Β) Ενημέρωση Τίτλου στο κέντρο
    document.getElementById('currentNameTitle').innerText = name;
    
    // Γ) Καθαρισμός και εμφάνιση μηνύματος αναμονής στην AI
    const aiBox = document.getElementById('aiResult');
    aiBox.innerHTML = "<em>Περιμένετε, η AI επεξεργάζεται το αίτημα για τον " + name + "...</em>";

    // Δ) Κλήση του Worker
    try {
        const workerUrl = 'https://person-lookup-api.gtetsi.workers.dev/'; 
        
        const response = await fetch(workerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name })
        });

        const data = await response.json();
        
        // Εμφάνιση της απάντησης
        aiBox.innerText = data.text;

    } catch (error) {
        console.error("Error:", error);
        aiBox.innerText = "Σφάλμα κατά τη σύνδεση με την AI.";
    }
}
