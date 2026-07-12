// Default prompts for first-time users
const defaultPrompts = [
    {
        id: "1",
        title: "Code Review Assistant",
        category: "Coding",
        text: "Act as a Senior Software Engineer. I will provide you with a piece of code. You will review it for performance optimizations, security vulnerabilities, and adherence to clean code principles. Suggest specific, actionable improvements."
    },
    {
        id: "2",
        title: "Cinematic Portrait",
        category: "Midjourney",
        text: "A cinematic portrait of a cyberpunk hacker in a neon-lit alleyway, rain, high detail, volumetric lighting, 8k resolution, shot on 35mm lens, photorealistic --ar 16:9"
    }
];

// Load from Local Storage (or use defaults if empty)
let prompts = JSON.parse(localStorage.getItem('prompts')) || defaultPrompts;
let currentFilter = 'All';

document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    renderPrompts();
    setupEventListeners();
});

// Save to Local Storage
function saveToStorage() {
    localStorage.setItem('prompts', JSON.stringify(prompts));
}

// Render the grid
function renderPrompts(searchQuery = "") {
    const grid = document.getElementById('prompt-grid');
    grid.innerHTML = '';

    // Filter logic
    const filteredPrompts = prompts.filter(p => {
        const matchesCategory = currentFilter === 'All' || p.category === currentFilter;
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.text.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filteredPrompts.length === 0) {
        grid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 3rem;">No prompts found.</p>`;
        return;
    }

    filteredPrompts.forEach(prompt => {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        card.innerHTML = `
            <div class="card-header">
                <div>
                    <h3>${prompt.title}</h3>
                    <span class="badge">${prompt.category}</span>
                </div>
                <button class="icon-btn delete-btn" onclick="deletePrompt('${prompt.id}')" title="Delete">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
            <div class="card-body">${prompt.text}</div>
            <div class="card-footer">
                <button class="secondary-btn copy-btn" onclick="copyPrompt(this, \`${prompt.text.replace(/`/g, '\\`')}\`)">
                    <i data-lucide="copy"></i> Copy
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    lucide.createIcons(); // Refresh icons for new cards
}

// 1-Click Copy Function
window.copyPrompt = function(btnElement, text) {
    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = btnElement.innerHTML;
        btnElement.innerHTML = `<i data-lucide="check"></i> Copied!`;
        btnElement.style.color = "#27c93f";
        lucide.createIcons();
        
        setTimeout(() => {
            btnElement.innerHTML = originalHTML;
            btnElement.style.color = "";
            lucide.createIcons();
        }, 2000);
    });
};

// Delete Function
window.deletePrompt = function(id) {
    if (confirm("Delete this prompt?")) {
        prompts = prompts.filter(p => p.id !== id);
        saveToStorage();
        renderPrompts();
    }
};

// Event Listeners Setup
function setupEventListeners() {
    const modal = document.getElementById('add-modal');
    const form = document.getElementById('prompt-form');

    // Modal Controls
    document.getElementById('open-modal-btn').addEventListener('click', () => modal.classList.add('active'));
    document.getElementById('close-modal-btn').addEventListener('click', () => modal.classList.remove('active'));
    document.getElementById('cancel-btn').addEventListener('click', () => modal.classList.remove('active'));

    // Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPrompt = {
            id: Date.now().toString(),
            title: document.getElementById('prompt-title').value,
            category: document.getElementById('prompt-category').value,
            text: document.getElementById('prompt-text').value
        };
        
        prompts.push(newPrompt);
        saveToStorage();
        
        form.reset();
        modal.classList.remove('active');
        
        // Reset filter to 'All' so they can see their new prompt
        document.querySelector('.categories li.active').classList.remove('active');
        document.querySelector('.categories li[data-filter="All"]').classList.add('active');
        currentFilter = 'All';
        
        renderPrompts();
    });

    // Category Filtering
    document.querySelectorAll('.categories li').forEach(li => {
        li.addEventListener('click', (e) => {
            document.querySelector('.categories li.active').classList.remove('active');
            e.currentTarget.classList.add('active');
            currentFilter = e.currentTarget.getAttribute('data-filter');
            
            // Clear search when clicking categories
            document.getElementById('search-input').value = "";
            renderPrompts();
        });
    });

    // Search Bar
    document.getElementById('search-input').addEventListener('input', (e) => {
        renderPrompts(e.target.value);
    });
}