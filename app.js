// DOM Elements and Firebase initialization
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase modules to be available
    const checkFirebaseAndInit = () => {
        if (window.firestoreDB && window.firestoreModules) {
            initApp();
        } else {
            // If Firebase isn't loaded yet, wait and try again
            console.log("Waiting for Firebase to load...");
            setTimeout(checkFirebaseAndInit, 100);
        }
    };
    
    checkFirebaseAndInit();
});

// Initialize the application after DOM and Firebase are ready
function initApp() {
    console.log("App initializing...");
    
    // DOM Elements
    const createBtn = document.getElementById('create-btn');
    const floatingCreateBtn = document.getElementById('floating-create-btn');
    const modal = document.getElementById('thank-you-modal');
    const closeBtn = document.querySelector('.close-btn');
    const thankyouForm = document.getElementById('thank-you-form');
    const notification = document.getElementById('notification');
    const thankyouCards = document.getElementById('thank-you-cards');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const heroSection = document.querySelector('.hero');
    
    // Log whether buttons are found
    console.log('Main button found:', !!createBtn);
    console.log('Floating button found:', !!floatingCreateBtn);
    
    // Access Firebase and Firestore from window object (set by the module script)
    const db = window.firestoreDB;
    const { 
        collection, 
        addDoc, 
        getDocs, 
        updateDoc, 
        doc, 
        increment, 
        serverTimestamp, 
        orderBy, 
        limit, 
        where, 
        query, 
        startAfter 
    } = window.firestoreModules;
    
    // Current filter
    let currentFilter = 'all';
    // Device detection for adaptive features
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    // Track screen resizes to adapt UI 
    let resizeTimeout;
    
    // Handle window resize events for responsive adjustments
    window.addEventListener('resize', () => {
        // Debounce resize events to avoid excessive function calls
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            adjustUIForScreenSize();
        }, 250);
    });
    
    // Handle scroll events to show/hide the floating button and enhance header
    window.addEventListener('scroll', () => {
        // When user scrolls past the hero section, show the floating button
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        const header = document.querySelector('.main-header');
        const scrollPosition = window.scrollY;
        
        // Update active navigation link based on scroll position
        const sections = ['top', 'wall', 'about'];
        let currentSection = null;
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const sectionTop = section.getBoundingClientRect().top;
                if (sectionTop <= 100) { // Adjust threshold as needed
                    currentSection = sectionId;
                }
            }
        });
        
        // Update active class
        if (currentSection) {
            document.querySelectorAll('nav ul li a').forEach(navLink => {
                navLink.classList.remove('active');
                if (navLink.getAttribute('href') === `#${currentSection}`) {
                    navLink.classList.add('active');
                }
            });
        }
        
        // Show/hide floating button
        if (heroBottom < 0) {
            floatingCreateBtn.classList.add('visible');
        } else {
            floatingCreateBtn.classList.remove('visible');
        }
        
        // Add deeper shadow to header when scrolled
        if (scrollPosition > 10) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
        }
        
        // Make sure notification doesn't appear on scroll
        if (!notification.classList.contains('intentionally-shown')) {
            notification.classList.remove('show');
        }
    });
    
    // Handle smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            
            // Update active class for navigation items
            document.querySelectorAll('nav ul li a').forEach(navLink => {
                navLink.classList.remove('active');
            });
            this.classList.add('active');
            
            // For home link, scroll to top
            if (targetId === '#top') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Get header height to offset scroll position
                const headerHeight = document.querySelector('.main-header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Adjust UI elements based on screen size
    function adjustUIForScreenSize() {
        const isMobileNow = window.matchMedia('(max-width: 768px)').matches;
        const cards = document.querySelectorAll('.thank-you-card');
        
        // Adjust card layout and animations for smaller screens
        cards.forEach(card => {
            if (isMobileNow) {
                card.style.animationDuration = '0.3s'; // Faster animations on mobile for better performance
            } else {
                card.style.animationDuration = '0.5s';
            }
        });
        
        // Adjust modal size and position
        if (modal.style.display === 'flex') {
            positionModalForDevice();
        }
    }
    
    // Position modal appropriately for different devices
    function positionModalForDevice() {
        const modalContent = modal.querySelector('.modal-content');
        const isMobileNow = window.matchMedia('(max-width: 768px)').matches;
        
        if (isMobileNow) {
            modalContent.style.maxHeight = '80vh';
            modalContent.style.width = '95%';
        } else {
            modalContent.style.maxHeight = '90vh';
            modalContent.style.width = '90%';
        }
    }
    
    // Open modal function - this is the main function for opening the modal
    function openModal() {
        console.log("Opening modal...");
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        positionModalForDevice();
        setTimeout(() => {
            modal.querySelector('.modal-content').classList.add('animate__fadeInUp');
        }, 10);
    }
    
    // Add click event listeners to both buttons
    if (createBtn) {
        createBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Main button clicked");
            openModal();
        });
    }
    
    if (floatingCreateBtn) {
        floatingCreateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Floating button clicked");
            openModal();
        });
    }
    
    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeModal();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Handle escape key to close modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
    
    // Close modal function
    function closeModal() {
        modal.querySelector('.modal-content').classList.remove('animate__fadeInUp');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        }, 300);
    }
    
    // Add event listener for location select
    const locationSelect = document.getElementById('location');
    const customLocationInput = document.getElementById('custom-location');
    
    if (locationSelect && customLocationInput) {
        locationSelect.addEventListener('change', function() {
            if (this.value === 'Other') {
                customLocationInput.style.display = 'block';
                customLocationInput.required = true;
            } else {
                customLocationInput.style.display = 'none';
                customLocationInput.required = false;
                customLocationInput.value = '';
            }
        });
    }
    
    // Update form submission logic
    if (thankyouForm) {
        thankyouForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const message = document.getElementById('message').value;
            const name = document.getElementById('name').value || 'Anonymous';
            const location = document.getElementById('location').value === 'Other' 
                ? document.getElementById('custom-location').value 
                : document.getElementById('location').value;
            
            // Determine category based on keywords
            const category = categorizeMessage(message);
            
            // Show loading state
            const submitBtn = document.getElementById('submit-btn');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            try {
                console.log("Attempting to add document to Firestore...");
                console.log("Collection path:", 'thankyous');
                console.log("Document data:", { message, name, location, category });
                
                // Try to verify Firebase is properly initialized
                if (!db) {
                    console.error("Firestore database is not initialized");
                    throw new Error("Database connection error");
                }
                
                if (!collection || !addDoc) {
                    console.error("Firestore modules are not properly loaded");
                    throw new Error("Firebase modules not loaded");
                }
                
                // For testing/development or when Firebase permissions are an issue
                // Check current hostname to determine if we're in development mode
                const hostname = window.location.hostname;
                console.log("Current hostname:", hostname);
                
                // Check if user has overridden development mode
                const useFirebaseOverride = localStorage.getItem('useFirebase') === 'true';
                
                // Only simulate success for known development environments, unless overridden
                if ((hostname === 'localhost' || hostname === '127.0.0.1') && !useFirebaseOverride) {
                    console.log("Development mode: Simulating successful submission");
                    console.log("To use real Firebase data, run: localStorage.setItem('useFirebase', 'true') in the console");
                    
                    // Simulate delay
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Reset form
                    thankyouForm.reset();
                    
                    // Close modal
                    closeModal();
                    
                    // Show notification
                    showNotification();
                    
                    // No need to refresh cards in development mode
                    return;
                }
                
                // Add to Firestore using modular API
                await addDoc(collection(db, 'thankyous'), {
                    message,
                    name,
                    location,
                    category,
                    likes: 0,
                    featured: false,
                    timestamp: serverTimestamp()
                });
                
                // Reset form
                thankyouForm.reset();
                
                // Close modal
                closeModal();
                
                // Show notification
                showNotification();
                
                // Refresh cards
                loadThankYouCards();
            } catch (error) {
                console.error("Error adding thank you note: ", error);
                
                // More detailed error handling
                let errorMessage = "There was an error submitting your thank you. Please try again.";
                
                if (error.code) {
                    // Firebase specific errors
                    switch (error.code) {
                        case 'permission-denied':
                            errorMessage = "You don't have permission to add entries. Firebase rules may need to be updated.";
                            break;
                        case 'unavailable':
                            errorMessage = "The service is currently unavailable. Please check your internet connection.";
                            break;
                        case 'not-found':
                            errorMessage = "The database collection could not be found.";
                            break;
                        default:
                            // Keep default message for other Firebase errors
                            break;
                    }
                }
                
                alert(errorMessage);
                
                // Create a test message locally to show in UI for testing
                // This allows the app to work even with Firebase permission issues
                const testData = {
                    id: 'local-' + Date.now(),
                    message,
                    name,
                    location,
                    category,
                    likes: 0,
                    featured: false,
                    timestamp: new Date()
                };
                
                // Add the test message to the UI
                const testCard = createTestThankYouCard(testData);
                if (thankyouCards && testCard) {
                    thankyouCards.prepend(testCard);
                }
                
                // Close modal anyway to show the user their message
                closeModal();
            } finally {
                // Reset button
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Create thank you card with accessibility features
    function createThankYouCard(id, data) {
        const card = document.createElement('div');
        card.className = 'thank-you-card animate__animated';
        card.dataset.id = id;
        card.setAttribute('role', 'article');
        
        // Format timestamp
        let timeString = 'Just now';
        if (data.timestamp) {
            const seconds = Math.floor((new Date() - data.timestamp.toDate()) / 1000);
            
            if (seconds < 60) {
                timeString = 'Just now';
            } else if (seconds < 3600) {
                const minutes = Math.floor(seconds / 60);
                timeString = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
            } else if (seconds < 86400) {
                const hours = Math.floor(seconds / 3600);
                timeString = `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
            } else {
                const days = Math.floor(seconds / 86400);
                timeString = `${days} ${days === 1 ? 'day' : 'days'} ago`;
            }
        }
        
        // Badge for featured notes
        const badgeHTML = data.featured ? `<div class="card-badge" aria-label="Featured thank you note">Featured</div>` : '';
        
        card.innerHTML = `
            ${badgeHTML}
            <div class="card-content">
                <p>${data.message}</p>
                <div class="card-meta">
                    <div>
                        <span class="name">${data.name}</span>
                        ${data.location ? `<span class="location">${data.location}</span>` : ''}
                        <span class="time">${timeString}</span>
                    </div>
                    <div class="heart" data-id="${id}" role="button" tabindex="0" aria-label="Like this thank you note. ${data.likes} likes">❤️ <span class="likes">${data.likes}</span></div>
                </div>
            </div>
        `;
        
        // Add heart click event
        const heartElement = card.querySelector('.heart');
        
        // Check if this card was already liked by the current user
        const likedItems = JSON.parse(localStorage.getItem('likedItems') || '[]');
        if (likedItems.includes(id)) {
            // Apply liked styling
            heartElement.classList.add('liked');
            heartElement.style.opacity = '0.7';
            heartElement.style.cursor = 'default';
        } else {
            // Add heart click event only if not previously liked
            heartElement.addEventListener('click', handleHeartClick);
            
            // Add keyboard support for heart button
            heartElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleHeartClick(e);
                }
            });
        }
        
        return card;
    }
    
    // Create a sample thank you card for displaying when Firebase has permission issues
    function createSampleThankYouCard(data) {
        const card = document.createElement('div');
        card.className = 'thank-you-card animate__animated';
        card.dataset.id = data.id;
        card.setAttribute('role', 'article');
        
        // Format timestamp
        let timeString = 'Just now';
        if (data.timestamp) {
            const seconds = Math.floor((new Date() - data.timestamp) / 1000);
            
            if (seconds < 60) {
                timeString = 'Just now';
            } else if (seconds < 3600) {
                const minutes = Math.floor(seconds / 60);
                timeString = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
            } else if (seconds < 86400) {
                const hours = Math.floor(seconds / 3600);
                timeString = `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
            } else {
                const days = Math.floor(seconds / 86400);
                timeString = `${days} ${days === 1 ? 'day' : 'days'} ago`;
            }
        }
        
        // Badge for featured notes
        const badgeHTML = data.featured ? `<div class="card-badge" aria-label="Featured thank you note">Featured</div>` : '';
        
        card.innerHTML = `
            ${badgeHTML}
            <div class="card-content">
                <p>${data.message}</p>
                <div class="card-meta">
                    <div>
                        <span class="name">${data.name}</span>
                        ${data.location ? `<span class="location">${data.location}</span>` : ''}
                        <span class="time">${timeString}</span>
                    </div>
                    <div class="heart" data-id="${data.id}" role="button" tabindex="0" aria-label="Like this thank you note. ${data.likes} likes">❤️ <span class="likes">${data.likes}</span></div>
                </div>
            </div>
        `;
        
        // Get heart element
        const heartElement = card.querySelector('.heart');
        
        // Check if this card was already liked by the current user
        const likedItems = JSON.parse(localStorage.getItem('likedItems') || '[]');
        if (likedItems.includes(data.id)) {
            // Apply liked styling
            heartElement.classList.add('liked');
            heartElement.style.opacity = '0.7';
            heartElement.style.cursor = 'default';
        } else {
            // Add heart click event for sample cards
            heartElement.addEventListener('click', (e) => {
                const likesElement = e.currentTarget.querySelector('.likes');
                const currentLikes = parseInt(likesElement.textContent);
                likesElement.textContent = currentLikes + 1;
                
                // Animation
                heartElement.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    heartElement.style.transform = 'scale(1)';
                }, 300);
                
                // Store this item as liked in localStorage
                const likedItems = JSON.parse(localStorage.getItem('likedItems') || '[]');
                likedItems.push(data.id);
                localStorage.setItem('likedItems', JSON.stringify(likedItems));
                
                // Visual indication that it's been liked
                heartElement.classList.add('liked');
                heartElement.style.opacity = '0.7';
                heartElement.style.cursor = 'default';
                
                // Remove event listener
                heartElement.removeEventListener('click', arguments.callee);
            });
            
            // Add keyboard support for heart button
            heartElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    
                    const likesElement = e.currentTarget.querySelector('.likes');
                    const currentLikes = parseInt(likesElement.textContent);
                    likesElement.textContent = currentLikes + 1;
                    
                    // Animation
                    heartElement.style.transform = 'scale(1.3)';
                    setTimeout(() => {
                        heartElement.style.transform = 'scale(1)';
                    }, 300);
                    
                    // Store this item as liked in localStorage
                    const likedItems = JSON.parse(localStorage.getItem('likedItems') || '[]');
                    likedItems.push(data.id);
                    localStorage.setItem('likedItems', JSON.stringify(likedItems));
                    
                    // Visual indication that it's been liked
                    heartElement.classList.add('liked');
                    heartElement.style.opacity = '0.7';
                    heartElement.style.cursor = 'default';
                    
                    // Remove event listener
                    heartElement.removeEventListener('keydown', arguments.callee);
                }
            });
        }
        
        return card;
    }
    
    // Create a test thank you card for local use when Firebase has issues
    function createTestThankYouCard(data) {
        const card = document.createElement('div');
        card.className = 'thank-you-card animate__animated animate__fadeInUp';
        card.dataset.id = data.id;
        card.setAttribute('role', 'article');
        
        card.innerHTML = `
            <div class="card-content">
                <p>${data.message}</p>
                <div class="card-meta">
                    <div>
                        <span class="name">${data.name}</span>
                        ${data.location ? `<span class="location">${data.location}</span>` : ''}
                        <span class="time">Just now (Preview)</span>
                    </div>
                    <div class="heart" data-id="${data.id}" role="button" tabindex="0" aria-label="Like this thank you note. 0 likes">❤️ <span class="likes">0</span></div>
                </div>
            </div>
        `;
        
        // Get heart element
        const heartElement = card.querySelector('.heart');
        
        // Check if this test card was already liked by the current user
        const likedItems = JSON.parse(localStorage.getItem('likedItems') || '[]');
        if (likedItems.includes(data.id)) {
            // Apply liked styling
            heartElement.classList.add('liked');
            heartElement.style.opacity = '0.7';
            heartElement.style.cursor = 'default';
        } else {
            // Add heart click event (just visual for test cards)
            heartElement.addEventListener('click', (e) => {
                const likesElement = e.currentTarget.querySelector('.likes');
                const currentLikes = parseInt(likesElement.textContent);
                likesElement.textContent = currentLikes + 1;
                
                // Animation
                heartElement.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    heartElement.style.transform = 'scale(1)';
                }, 300);
                
                // Store this item as liked in localStorage
                const likedItems = JSON.parse(localStorage.getItem('likedItems') || '[]');
                likedItems.push(data.id);
                localStorage.setItem('likedItems', JSON.stringify(likedItems));
                
                // Visual indication that it's been liked
                heartElement.classList.add('liked');
                heartElement.style.opacity = '0.7';
                heartElement.style.cursor = 'default';
                
                // Remove event listener
                heartElement.removeEventListener('click', arguments.callee);
            });
        }
        
        return card;
    }
    
    // Show notification
    function showNotification() {
        // Clear any existing notification timeout
        if (window.notificationTimeout) {
            clearTimeout(window.notificationTimeout);
        }
        
        // Show notification
        notification.classList.add('show');
        notification.classList.add('intentionally-shown');
        
        // Remove notification after delay
        window.notificationTimeout = setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.remove('intentionally-shown');
        }, 3000);
    }
    
    // Categorize message based on keywords
    function categorizeMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('help') || lowerMessage.includes('assist') || lowerMessage.includes('support')) {
            return 'Help';
        } else if (lowerMessage.includes('found') || lowerMessage.includes('lost') || lowerMessage.includes('missing')) {
            return 'Lost and Found';
        } else {
            return 'Kindness';
        }
    }
    
    // Load thank you cards
    async function loadThankYouCards() {
        // Show loader
        thankyouCards.innerHTML = '<div class="loader"></div>';
        
        // Create query based on filter
        let thankyouQuery;
        
        try {
            // Check if Firebase is properly initialized
            if (!db || !collection || !getDocs) {
                console.error("Firebase is not properly initialized for reading data");
                throw new Error("Firebase not initialized");
            }
            
            // For testing/development or when Firebase permissions are an issue
            // Check current hostname to determine if we're in development mode
            const hostname = window.location.hostname;
            console.log("Current hostname:", hostname);
            
            // Check if user has overridden development mode
            const useFirebaseOverride = localStorage.getItem('useFirebase') === 'true';
            
            // Only use sample data for known development environments, unless overridden
            if ((hostname === 'localhost' || hostname === '127.0.0.1') && !useFirebaseOverride) {
                console.log("Development mode: Using sample data instead of Firestore");
                console.log("To use real Firebase data, run: localStorage.setItem('useFirebase', 'true') in the console");
                loadSampleThankYouCards();
                return;
            }
            
            if (currentFilter === 'all') {
                thankyouQuery = query(
                    collection(db, 'thankyous'),
                    orderBy('timestamp', 'desc'),
                    limit(window.matchMedia('(max-width: 768px)').matches ? 10 : 20)
                );
            } else {
                thankyouQuery = query(
                    collection(db, 'thankyous'),
                    where('category', '==', currentFilter),
                    orderBy('timestamp', 'desc'),
                    limit(window.matchMedia('(max-width: 768px)').matches ? 10 : 20)
                );
            }
            
            const snapshot = await getDocs(thankyouQuery);
            
            // Hide loader
            thankyouCards.innerHTML = '';
            
            if (snapshot.empty) {
                thankyouCards.innerHTML = '<p class="no-results">No thank you notes found. Be the first to share!</p>';
                return;
            }
            
            // Create a fragment for better performance
            const fragment = document.createDocumentFragment();
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const card = createThankYouCard(doc.id, data);
                fragment.appendChild(card);
            });
            
            // Append all cards at once
            thankyouCards.appendChild(fragment);
            
            // Add animation to cards
            animateCards();
            
            // Implement lazy loading for more cards on scroll for larger screens
            if (!window.matchMedia('(max-width: 768px)').matches && snapshot.docs.length >= 20) {
                setupInfiniteScroll(snapshot.docs[snapshot.docs.length - 1]);
            }
        } catch (error) {
            console.error("Error getting thank you notes: ", error);
            
            // If permission error, use sample data instead
            if (error.code === 'permission-denied' || error.message.includes('permissions')) {
                console.log("Permission error: Using sample data instead");
                loadSampleThankYouCards();
            } else {
                thankyouCards.innerHTML = '<p class="error">Error loading thank you notes. Please try again later.</p>';
            }
        }
    }
    
    // Load sample thank you cards as fallback when Firebase has permission issues
    function loadSampleThankYouCards() {
        // Hide loader
        thankyouCards.innerHTML = '';
        
        // Sample data
        const sampleData = [
            {
                id: 'sample1',
                message: "Thank you to the person who helped me find my way when I was lost downtown yesterday. You took the time to walk me to my destination!",
                name: "Sarah Johnson",
                location: "Main Street",
                category: "Kindness",
                likes: 15,
                featured: true,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
            },
            {
                id: 'sample2',
                message: "Grateful to the café barista who remembered my order and had it ready before I even reached the counter. Small gestures mean a lot!",
                name: "Michael Chen",
                location: "City Center",
                category: "Kindness",
                likes: 8,
                featured: false,
                timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
            },
            {
                id: 'sample3',
                message: "Someone found my wallet and turned it in with everything intact. Thank you for your honesty and integrity!",
                name: "David Wilson",
                location: "Park Avenue",
                category: "Lost and Found",
                likes: 24,
                featured: false,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
            },
            {
                id: 'sample4',
                message: "Thanks to the kind stranger who helped me change my tire in the rain. You saved my day!",
                name: "Emma Rodriguez",
                location: "Highway 101",
                category: "Help",
                likes: 19,
                featured: true,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
            },
            {
                id: 'sample5',
                message: "Thank you to the library staff who helped me find resources for my research project. Your expertise made all the difference!",
                name: "Anonymous",
                location: "Public Library",
                category: "Help",
                likes: 7,
                featured: false,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10) // 10 hours ago
            }
        ];
        
        // Filter sample data if needed
        let filteredData = sampleData;
        if (currentFilter !== 'all') {
            filteredData = sampleData.filter(item => item.category === currentFilter);
        }
        
        // Create a fragment for better performance
        const fragment = document.createDocumentFragment();
        
        // Display note about sample data
        const infoMessage = document.createElement('div');
        infoMessage.className = 'info-message';
        infoMessage.innerHTML = '<p><strong>Note:</strong> Showing sample data. Firebase permissions need to be configured.</p>';
        fragment.appendChild(infoMessage);
        
        // Add sample cards
        filteredData.forEach(data => {
            const card = createSampleThankYouCard(data);
            fragment.appendChild(card);
        });
        
        // Append all cards at once
        thankyouCards.appendChild(fragment);
        
        // Add animation to cards
        animateCards();
    }
    
    // Setup infinite scrolling for larger screens
    function setupInfiniteScroll(lastVisible) {
        // Remove existing scroll event listener if any
        window.removeEventListener('scroll', handleInfiniteScroll);
        
        let isLoading = false;
        let lastDoc = lastVisible;
        
        // Scroll event handler for infinite scrolling
        async function handleInfiniteScroll() {
            const cardContainer = document.getElementById('thank-you-cards');
            const scrollPos = window.scrollY + window.innerHeight;
            const containerBottom = cardContainer.offsetTop + cardContainer.offsetHeight;
            
            // Load more when scrolled near the bottom
            if (scrollPos > containerBottom - 200 && !isLoading) {
                isLoading = true;
                
                // Show loading indicator
                const loadingIndicator = document.createElement('div');
                loadingIndicator.className = 'loader';
                loadingIndicator.style.position = 'relative';
                loadingIndicator.style.margin = '20px auto';
                cardContainer.appendChild(loadingIndicator);
                
                try {
                    let nextQuery;
                    
                    if (currentFilter === 'all') {
                        nextQuery = query(
                            collection(db, 'thankyous'),
                            orderBy('timestamp', 'desc'),
                            startAfter(lastDoc),
                            limit(10)
                        );
                    } else {
                        nextQuery = query(
                            collection(db, 'thankyous'),
                            where('category', '==', currentFilter),
                            orderBy('timestamp', 'desc'),
                            startAfter(lastDoc),
                            limit(10)
                        );
                    }
                    
                    const snapshot = await getDocs(nextQuery);
                    
                    // Remove loading indicator
                    cardContainer.removeChild(loadingIndicator);
                    
                    if (!snapshot.empty) {
                        const fragment = document.createDocumentFragment();
                        
                        snapshot.forEach(doc => {
                            const data = doc.data();
                            const card = createThankYouCard(doc.id, data);
                            fragment.appendChild(card);
                        });
                        
                        cardContainer.appendChild(fragment);
                        
                        // Animate new cards
                        animateCards();
                        
                        // Update last document
                        lastDoc = snapshot.docs[snapshot.docs.length - 1];
                    }
                } catch (error) {
                    console.error("Error getting more thank you notes: ", error);
                } finally {
                    isLoading = false;
                }
            }
        }
        
        // Add scroll event listener
        window.addEventListener('scroll', handleInfiniteScroll);
    }
    
    // Handle heart click event
    async function handleHeartClick(e) {
        const heartElement = e.currentTarget;
        const id = heartElement.dataset.id;
        
        // Check if this item was already liked by the current user
        const likedItems = JSON.parse(localStorage.getItem('likedItems') || '[]');
        if (likedItems.includes(id)) {
            console.log('Already liked this item');
            return; // Exit if already liked
        }
        
        const likesElement = heartElement.querySelector('.likes');
        
        // Optimistic UI update
        const currentLikes = parseInt(likesElement.textContent);
        likesElement.textContent = currentLikes + 1;
        
        // Animation
        heartElement.style.transform = 'scale(1.3)';
        setTimeout(() => {
            heartElement.style.transform = 'scale(1)';
        }, 300);
        
        try {
            // Update in Firestore
            await updateDoc(doc(db, 'thankyous', id), {
                likes: increment(1)
            });
            
            // Store this item as liked in localStorage
            likedItems.push(id);
            localStorage.setItem('likedItems', JSON.stringify(likedItems));
            
            // Visual indication that it's been liked
            heartElement.classList.add('liked');
            heartElement.style.opacity = '0.7';
            heartElement.style.cursor = 'default';
            
            // Remove event listener permanently
            heartElement.removeEventListener('click', handleHeartClick);
            
        } catch (error) {
            console.error("Error updating likes: ", error);
            // Revert on error
            likesElement.textContent = currentLikes;
        }
    }
    
    // Animate cards on load
    function animateCards() {
        const cards = document.querySelectorAll('.thank-you-card:not(.animate__fadeInUp)');
        
        // Use a smaller delay on mobile for better performance
        const delayIncrement = window.matchMedia('(max-width: 768px)').matches ? 0.05 : 0.1;
        
        cards.forEach((card, index) => {
            card.classList.add('animate__fadeInUp');
            card.style.animationDelay = `${index * delayIncrement}s`;
        });
    }
    
    // Update filter button handler for accessibility
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update UI
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-pressed', 'true');
            
            // Update filter
            currentFilter = button.dataset.filter;
            
            // Reload cards
            loadThankYouCards();
        });
    });
    
    // Listen for orientation changes on mobile
    window.addEventListener('orientationchange', () => {
        // Give the browser time to update dimensions
        setTimeout(() => {
            adjustUIForScreenSize();
        }, 300);
    });
    
    // Initialize UI
    loadThankYouCards();
    adjustUIForScreenSize();

    // Add debugging help - this makes it easier to see if buttons were found
    console.log("App initialization complete!");
} 