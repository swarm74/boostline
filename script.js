document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. VISUAL EFFECTS
    // ==========================================
    const handleOnMouseMove = (e) => {
        const { currentTarget: target } = e;
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        target.style.setProperty("--mouse-x", `${x}px`);
        target.style.setProperty("--mouse-y", `${y}px`);
    };
    
    for(const card of document.querySelectorAll(".card")) {
        card.onmousemove = (e) => handleOnMouseMove(e);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));


    // ==========================================
    // 2. PRODUCT LOGIC
    // ==========================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.card');

    if (cards.length > 0) {
        cards.forEach(card => {
            if (card.getAttribute('data-category') === 'boosts') {
                card.style.display = 'block';
                setTimeout(() => card.classList.add('visible'), 50);
            } else {
                card.style.display = 'none';
            }
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            cards.forEach(card => {
                if (card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                    card.classList.remove('visible');
                    setTimeout(() => card.classList.add('visible'), 50);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    const modal = document.getElementById('selectionModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const optDuration = document.getElementById('opt-duration');
    const optMembers = document.getElementById('opt-members');

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-select')) {
            if (e.target.classList.contains('disabled')) return;

            const card = e.target.closest('.card');
            if (card) {
                const category = card.getAttribute('data-category');

                if (category === 'boosts') {
                    if(modalTitle) modalTitle.innerText = "Select Boost Duration";
                    if(modalDesc) modalDesc.innerText = "Choose your warranty period.";
                    if(optDuration) optDuration.style.display = 'grid';
                    if(optMembers) optMembers.style.display = 'none';
                    if(modal) modal.style.display = 'flex';
                    e.preventDefault();
                } 
                else if (category === 'members') {
                    if(modalTitle) modalTitle.innerText = "Select Member Amount";
                    if(modalDesc) modalDesc.innerText = "Real Members VIA Vaultcord";
                    if(optDuration) optDuration.style.display = 'none';
                    if(optMembers) optMembers.style.display = 'grid';
                    if(modal) modal.style.display = 'flex';
                    e.preventDefault();
                }
            }
        }
        
        if (e.target.classList.contains('close-modal') || e.target.classList.contains('modal-overlay')) {
            if (modal) modal.style.display = 'none';
        }

        if (e.target.closest('.option-btn')) {
            const btn = e.target.closest('.option-btn');
            const tag = btn.getAttribute('data-tag');
            console.log("Selected option:", tag);
            if(modal) modal.style.display = 'none';
        }
    });


    // ==========================================
    // 3. VOUCH LOADER (Fixed Usernames/Avatars)
    // ==========================================
    
    const vouchContainer = document.getElementById('vouch-container');
    
    if (vouchContainer) {
        const API_URL = 'https://myvouch.es/api/jail/vouches';
        const PROXY_URL = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(API_URL);

        fetch(PROXY_URL)
            .then(response => response.json())
            .then(data => {
                vouchContainer.innerHTML = '';
                
                const vouches = data.data || [];

                if (vouches.length === 0) {
                    vouchContainer.innerHTML = '<p style="color:#888; grid-column:1/-1; text-align:center;">No vouches found.</p>';
                    return;
                }

                // DEBUG: Print the first vouch to Console so we can see the real property names
                console.log("First Vouch Structure:", vouches[0]);

                vouches.forEach(vouch => {
                    const card = document.createElement('div');
                    card.className = 'review-card fade-in visible';
                    
                    const rating = vouch.rating || 5;
                    const stars = '★'.repeat(rating).padEnd(5, '☆');
                    const comment = vouch.message || vouch.comment || vouch.content || "No comment provided.";
                    
                    // --- ROBUST USERNAME CHECK ---
                    // Tries every common API pattern to find the name
                    let username = "Verified Client";
                    if (vouch.username) username = vouch.username;
                    else if (vouch.reviewer && vouch.reviewer.username) username = vouch.reviewer.username;
                    else if (vouch.buyer && vouch.buyer.username) username = vouch.buyer.username;
                    else if (vouch.user && vouch.user.username) username = vouch.user.username;
                    else if (vouch.author) username = vouch.author;

                    // --- ROBUST AVATAR CHECK ---
                    // Tries every common API pattern to find the avatar
                    let avatarUrl = 'https://cdn.discordapp.com/embed/avatars/0.png';
                    if (vouch.avatar) avatarUrl = vouch.avatar;
                    else if (vouch.reviewer && vouch.reviewer.avatar) avatarUrl = vouch.reviewer.avatar;
                    else if (vouch.buyer && vouch.buyer.avatar) avatarUrl = vouch.buyer.avatar;
                    else if (vouch.user && vouch.user.avatar) avatarUrl = vouch.user.avatar;

                    card.innerHTML = `
                        <div class="stars">${stars}</div>
                        <p>"${comment}"</p>
                        <div class="author">
                            <div class="avatar" style="background-image: url('${avatarUrl}'); background-size: cover;"></div>
                            <span>${username}</span>
                        </div>
                    `;
                    vouchContainer.appendChild(card);
                });
            })
            .catch(error => {
                console.error("Loader Error:", error);
                vouchContainer.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; color: #ff5555; padding: 50px; background: rgba(255,0,0,0.05); border-radius: 12px; border: 1px solid rgba(255,0,0,0.2);">
                        <p>Could not load vouches.</p>
                        <a href="https://myvouch.es/jail" target="_blank" class="btn-primary">View on MyVouch.es</a>
                    </div>
                `;
            });
    }

});