let database = [];

window.onload = async () => {
    try {
        const response = await fetch('data.csv?v=' + Math.random());
        const text = await response.text();
        const delimiter = text.includes(';') ? ';' : ',';
        const rows = text.split('\n').map(r => r.trim()).filter(r => r !== '');
        
        database = rows.slice(1).map(row => {
            const cols = row.split(delimiter);
            return {
                id: cols[0], name: cols[1], birth: cols[2], death: cols[3],
                origin: cols[4], category: cols[5], era: cols[6], school: cols[7],
                rank: cols[8], bio: cols[9], contribution: cols[10], works: cols[11],
                relType: cols[12], personB: cols[13], quote: cols[14]
            };
        }).filter(item => item.name);

        database.sort((a, b) => parseYear(b.birth) - parseYear(a.birth));
        renderTimeline();
    } catch (err) {
        console.error("CSV Load Error:", err);
    }
};

function parseYear(yearStr) {
    if (!yearStr) return -99999;
    let year = yearStr.toString().toLowerCase().trim();
    if (year.includes('π')) {
        let num = parseInt(year.replace(/[^0-9]/g, ''));
        return num ? -num : 0;
    }
    return parseInt(year.replace(/[^0-9]/g, '')) || 0;
}

function renderTimeline() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;
    timeline.innerHTML = '';
    database.forEach(person => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.onclick = () => selectPerson(item, person);
        item.innerHTML = `<div class="year">${person.birth || ''}</div><div class="name">${person.name}</div>`;
        timeline.appendChild(item);
    });
}

async function selectPerson(element, person) {
    // 1. Διαχείριση του "Active" στοιχείου στο Timeline
    document.querySelectorAll('.timeline-item').forEach(i => i.classList.remove('active'));
    element.classList.add('active');

    // 2. Ενημέρωση του Τίτλου
    document.getElementById('currentNameTitle').innerText = person.name;

    // 3. Γέμισμα των υπόλοιπων πεδίων (εκτός του data12)
    // Αντιστοιχούμε τα κλειδιά του αντικειμένου person στα IDs data1...data13
    const keys = ['birth', 'death', 'origin', 'category', 'era', 'school', 'rank', 'bio', 'contribution', 'works', 'relType', 'personB', 'quote'];
    
    keys.forEach((key, index) => {
        const fieldId = `data${index + 1}`;
        const element = document.getElementById(fieldId);
        
        if (fieldId === 'data12') {
            // --- ΕΔΩ ΜΠΑΙΝΕΙ ΤΟ BONUS ΓΙΑ ΤΟ ΚΛΙΚΑΡΙΣΜΑ ---
            const relatedName = getPersonNameById(person.personB);
            
            if (relatedName !== "-" && relatedName !== person.personB) {
                element.innerHTML = `<span class="link-to-person" style="color: #4facfe; cursor: pointer; text-decoration: underline; font-weight: bold;">${relatedName}</span>`;
                element.onclick = () => {
                    // Βρίσκουμε το αντικείμενο του σχετιζόμενου από τη database
                    const relatedPerson = database.find(p => p.id.trim() === person.personB.trim());
                    
                    // Βρίσκουμε το αντίστοιχο στοιχείο στο Timeline για να το κάνουμε κλικ προγραμματιστικά
                    const timelineItems = document.querySelectorAll('.timeline-item');
                    let targetElement = null;
                    timelineItems.forEach(item => {
                        if (item.querySelector('.name').innerText === relatedName) {
                            targetElement = item;
                        }
                    });

                    if (relatedPerson && targetElement) {
                        selectPerson(targetElement, relatedPerson);
                        // Scroll για να φανεί το στοιχείο στο sidebar αν είναι μακριά
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                };
            } else {
                element.innerText = relatedName;
                element.onclick = null;
                element.style.cursor = "default";
            }
            // ----------------------------------------------
        } else {
            // Για όλα τα άλλα πεδία (data1-11 και 13)
            element.innerText = person[key] || '-';
            element.onclick = null; // Καθαρισμός αν υπήρχε προηγούμενο click event
        }
    });

    // 4. Ενημέρωση AI και Wikipedia
    askAI(person.name);
    fetchWikipedia(person.name);
}

async function askAI(name) {
    const aiBox = document.getElementById('aiResult');
    // ΕΦΕ LOADING
    aiBox.innerHTML = `<div class="loading-ai">Η AI αναζητά πληροφορίες για τον ${name}...</div>`;

    try {
        const response = await fetch('https://person-lookup-api.gtetsi.workers.dev/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name })
        });
        
        const data = await response.json();
        // Μετατρέπει τα **κείμενο** σε <b>κείμενο</b> για να φαίνονται έντονα
        let formattedText = data.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        aiBox.innerHTML = formattedText;

    } catch (err) {
        // ΚΡΥΦΟ ΣΦΑΛΜΑ ΓΙΑ ΤΟΝ ΧΡΗΣΤΗ - ΦΑΝΕΡΟ ΣΤΟ F12
        console.error("AI DEBUG ERROR:", err);
        aiBox.innerText = "Η υπηρεσία AI δεν είναι διαθέσιμη. Παρακαλώ δοκιμάστε ξανά σε λίγο.";
    }
}

function showTab(tabName) {
    // Απόκρυψη όλων των περιεχομένων
    document.getElementById('ai-content').style.display = 'none';
    document.getElementById('wiki-content').style.display = 'none';
    
    // Αφαίρεση active class από τα κουμπιά
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Εμφάνιση του επιλεγμένου
    document.getElementById(tabName + '-content').style.display = 'block';
    event.currentTarget.classList.add('active');
}


function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-mode');
    
    // Αποθήκευση της επιλογής
    const currentTheme = body.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
}

// ΑΥΤΟ ΕΙΝΑΙ ΤΟ ΣΗΜΑΝΤΙΚΟ: Εκτελείται μόλις φορτώσει η σελίδα
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
});


async function fetchWikipedia(name) {
    const wikiBody = document.getElementById('wiki-body');
    wikiBody.innerHTML = "Αναζήτηση στην Wikipedia...";

    try {
        const url = `https://el.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(name)}&format=json&origin=*&prop=text&section=0`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.parse && data.parse.text) {
            let cleanHtml = data.parse.text["*"];
            
            // Διόρθωση των links
            cleanHtml = cleanHtml.replace(/href="\/wiki\//g, 'target="_blank" href="https://el.wikipedia.org/wiki/');
            
            // Προσθήκη συνδέσμου για πλήρες άρθρο στο τέλος
            const fullArticleLink = `
                <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #444;">
                    <a href="https://el.wikipedia.org/wiki/${encodeURIComponent(name)}" target="_blank" style="color: #4facfe; font-weight: bold; text-decoration: none;">
                        Διαβάστε ολόκληρο το άρθρο στη Wikipedia →
                    </a>
                </div>`;
            
            wikiBody.innerHTML = cleanHtml + fullArticleLink;
        } else {
            wikiBody.innerHTML = `<p>Δεν βρέθηκε ακριβές λήμμα για τον <b>${name}</b>.</p>
                                  <a href="https://el.wikipedia.org/wiki/Special:Search/${encodeURIComponent(name)}" target="_blank" style="color: #4facfe;">
                                  Αναζήτηση στη Wikipedia →</a>`;
        }
    } catch (err) {
        wikiBody.innerHTML = "Σφάλμα κατά τη σύνδεση με την Wikipedia.";
    }
}

function filterTimeline() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const items = document.querySelectorAll('.timeline-item');
    
    items.forEach(item => {
        const name = item.querySelector('.name').innerText.toLowerCase();
        item.style.display = name.includes(query) ? 'block' : 'none';
    });
}
function getPersonNameById(id) {
    if (!id || id === "-") return "-"; // Αν δεν υπάρχει ID, επέστρεψε παύλα
    
    // Ψάχνουμε στη database για το αντικείμενο που έχει το ίδιο PersonID
    const found = database.find(p => p.id.trim() === id.trim());
    
    // Αν το βρει, επέστρεψε το όνομα, αλλιώς επέστρεψε τον αριθμό
    return found ? found.name : id;
}
