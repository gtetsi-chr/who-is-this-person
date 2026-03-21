// 1. ΛΕΙΤΟΥΡΓΙΑ ΓΙΑ ΤΗΝ ΕΝΑΛΛΑΓΗ ΘΕΜΑΤΟΣ
function toggleTheme() {
    document.body.classList.toggle('light-mode');
}

// 2. Η ΚΥΡΙΑ ΛΕΙΤΟΥΡΓΙΑ ΟΤΑΝ ΠΑΤΑΣ ΟΝΟΜΑ
async function loadPerson(element, name) {
    // Highlight στο Timeline
    const allItems = document.querySelectorAll('.timeline-item');
    allItems.forEach(item => item.classList.remove('active'));
    element.classList.add('active');

    // Ενημέρωση Τίτλου
    document.getElementById('currentNameTitle').innerText = name;
    
    // Μήνυμα Αναμονής
    const aiBox = document.getElementById('aiResult');
    aiBox.innerHTML = `<div class="loading">Περιμένετε, η AI επεξεργάζεται το αίτημα για τον <strong>${name}</strong>...</div>`;

    try {
        const workerUrl = 'https://person-lookup-api.gtetsi.workers.dev/'; 
        
        const response = await fetch(workerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name })
        });

        if (!response.ok) {
            throw new Error("Ο Worker επέστρεψε σφάλμα: " + response.status);
        }

        const data = await response.json();
        console.log("Data received:", data); // Για να βλέπουμε τι έρχεται στην κονσόλα

        // ΕΛΕΓΧΟΣ: Αν το data.text υπάρχει (όπως το στέλνει ο Worker μας)
        if (data && data.text) {
            aiBox.innerText = data.text;
        } else {
            aiBox.innerText = "Η AI επέστρεψε κενή απάντηση. Δοκιμάστε ξανά.";
        }

    } catch (error) {
        console.error("Detailed Error:", error);
        aiBox.innerText = "Σφάλμα: " + error.message;
    }
}
