// DOM Elements
const navToggle = document.getElementById('nav-toggle');
const navList = document.getElementById('nav-list');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const topicCards = document.querySelectorAll('.topic-card');
const fullscreenToggle = document.getElementById('fullscreen-toggle');
const fullscreenIcon = document.querySelector('.fullscreen-icon');
const exitFullscreenIcon = document.querySelector('.exit-fullscreen-icon');

// Fullscreen functionality
if (fullscreenToggle) {
    fullscreenToggle.addEventListener('click', toggleFullscreen);
    
    // Update fullscreen button state when fullscreen changes
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    document.addEventListener('mozfullscreenchange', updateFullscreenButton);
    document.addEventListener('MSFullscreenChange', updateFullscreenButton);
}

function toggleFullscreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && !document.msFullscreenElement) {
        // Enter fullscreen
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

function updateFullscreenButton() {
    const isFullscreen = document.fullscreenElement || 
                        document.webkitFullscreenElement || 
                        document.mozFullScreenElement || 
                        document.msFullscreenElement;
    
    if (fullscreenIcon && exitFullscreenIcon) {
        if (isFullscreen) {
            fullscreenIcon.style.display = 'none';
            exitFullscreenIcon.style.display = 'inline';
        } else {
            fullscreenIcon.style.display = 'inline';
            exitFullscreenIcon.style.display = 'none';
        }
    }
}

// Game Elements
const gameStart = document.getElementById('game-start');
const gameQuestion = document.getElementById('game-question');
const gameOver = document.getElementById('game-over');
const startGameBtn = document.getElementById('start-game');
const restartGameBtn = document.getElementById('restart-game');

// Gym Simulator Elements
const gymGameArea = document.getElementById('gameArea');
const gymGainsDisplay = document.getElementById('gainsDisplay');
const gymMultiplierDisplay = document.getElementById('multiplierDisplay');
const gymGainsPerSecDisplay = document.getElementById('gainsPerSecDisplay');
const gymSpawnRateLevel = document.getElementById('spawnRateLevel');
const gymRarityBoostLevel = document.getElementById('rarityBoostLevel');
const gymAutoClickerLevel = document.getElementById('autoClickerLevel');
const gymSpawnRateCost = document.getElementById('spawnRateCost');
const gymRarityBoostCost = document.getElementById('rarityBoostCost');
const gymAutoClickerCost = document.getElementById('autoClickerCost');
const gymPrestigeButton = document.getElementById('prestigeButton');
const gymPrestigeCount = document.getElementById('prestigeCount');
const gymPrestigeMultiplier = document.getElementById('prestigeMultiplier');
const gymBestRun = document.getElementById('bestRun');
const gymMutationCount = document.getElementById('mutationCount');
const gymAchievementList = document.getElementById('achievementList');
const gymInitialAchievementText = document.getElementById('initialAchievementText');
const gymGameInstructions = document.getElementById('gameInstructions');
const gymToast = document.getElementById('toast');
const gymEventBanner = document.getElementById('gym-event-banner');
const gymEventBannerText = document.getElementById('event-text');

// Sound System for Gym Simulator
let gymSoundEnabled = true;
const gymBackgroundMusic = document.getElementById('gym-background-music');

// Toggle sound on/off
function toggleGymSound() {
    gymSoundEnabled = !gymSoundEnabled;
    
    if (!gymSoundEnabled) {
        if (gymBackgroundMusic) {
            gymBackgroundMusic.pause();
        }
    } else if (document.getElementById('gym-simulator-page').classList.contains('active')) {
        // Resume background music if on the gym simulator page
        playGymBackgroundMusic();
    }
    
    // Update UI to show sound status
    updateSoundButton();
}

// Update sound button appearance
function updateSoundButton() {
    const soundButton = document.getElementById('gym-sound-toggle');
    if (soundButton) {
        soundButton.innerHTML = gymSoundEnabled ? '🔊' : '🔇';
        soundButton.title = gymSoundEnabled ? 'Mute Sounds' : 'Enable Sounds';
    }
}

function playGymBackgroundMusic() {
    if (!gymBackgroundMusic || !gymSoundEnabled) return;

    try {
        // Only start if not already playing
        if (gymBackgroundMusic.paused) {
            gymBackgroundMusic.volume = 0.3; // Lower volume for background music
            var playPromise = gymBackgroundMusic.play();

            if (playPromise !== undefined) {
                playPromise.catch(function(error) {
                    console.warn("Background music play was prevented:", error);
                    
                    // Set up to play on next user interaction
                    var playOnInteraction = function() {
                        gymBackgroundMusic.play().finally(function() {
                            document.removeEventListener('click', playOnInteraction);
                            document.removeEventListener('keydown', playOnInteraction);
                        });
                    };

                    document.addEventListener('click', playOnInteraction, { once: true });
                    document.addEventListener('keydown', playOnInteraction, { once: true });
                });
            }
        }
    } catch (error) {
        console.error("Error playing background music:", error);
    }
}

// Stop background music
function stopGymBackgroundMusic() {
    if (gymBackgroundMusic) {
        gymBackgroundMusic.pause();
        gymBackgroundMusic.currentTime = 0;
    }
}

// Game State
let gameState = {
    score: 0,
    level: 1,
    lives: 3,
    currentQuestion: 0,
    timeLeft: 30,
    timer: null,
    isGameActive: false
};

// Gym Simulator State
let gymState = {
    gains: 0,
    currentRunGains: 0,
    multiplier: 1,
    prestigeCount: 0,
    totalClicks: 0,
    bestRun: 0,
    mutationCount: 0,
    achievements: new Set(),

    // Upgrade levels
    spawnRateLevel: 0,
    rarityBoostLevel: 0,
    autoClickerLevel: 0,

    // Costs
    spawnRateCost: 50,
    rarityBoostCost: 100,
    autoClickerCost: 200,

    // Game mechanics
    spawnInterval: null,
    spawnRate: 2000, // ms between spawns
    fallingSpeed: 3, // seconds to fall
    baseRarityChances: {
        common: 0.7,
        rare: 0.2,
        epic: 0.08,
        legendary: 0.02
    },
    rarityChances: {
        common: 0.7,
        rare: 0.2,
        epic: 0.08,
        legendary: 0.02
    },
    gainsPerSecond: 0,

    // Event properties
    activeEvent: null,
    eventEndTime: null,
    luckRarityBoost: 1,
    forceMutation: false
};

// Gain configurations
const gainConfigs = {
    common: { minValue: 1, maxValue: 5, emoji: '💪', colors: ['#8e8e93', '#636366'] },
    rare: { minValue: 10, maxValue: 25, emoji: '💎', colors: ['#007AFF', '#5AC8FA'] },
    epic: { minValue: 50, maxValue: 100, emoji: '🔥', colors: ['#FF2D55', '#FF9500'] },
    legendary: { minValue: 200, maxValue: 500, emoji: '⚡', colors: ['#FFFF00', '#FFD700'] }
};

// Mutation configurations
const mutationConfigs = {
    gold: { multiplier: 2, emoji: '🏆' },
    rainbow: { multiplier: 3, emoji: '🌈' },
    cosmic: { multiplier: 5, emoji: '🌌' },
    plasma: { multiplier: 10, emoji: '⚡' }
};

// Junk food configuration
const junkFoodConfig = {
    chance: 0.15, // 15% chance to spawn junk food instead of a gain
    types: [
        { emoji: '🍔', name: 'Hamburger', multiplier: 0.1 }, // Takes 10% of current gains
        { emoji: '🍟', name: 'Fries', multiplier: 0.05 },    // Takes 5% of current gains
        { emoji: '🍕', name: 'Pizza', multiplier: 0.15 },    // Takes 15% of current gains
        { emoji: '🍩', name: 'Donut', multiplier: 0.08 }     // Takes 8% of current gains
    ],
    getRandomType: function() {
        return this.types[Math.floor(Math.random() * this.types.length)];
    }
};

// Gym Simulator Achievements
var gymAchievements = [{
	id: 'first-click',
	name: 'First Steps',
	desc: 'Click your first gain',
	requirement: function() { return gymState.totalClicks >= 1; }
}, {
	id: 'click-100',
	name: 'Dedicated',
	desc: 'Click 100 gains',
	requirement: function() { return gymState.totalClicks >= 100; }
}, {
	id: 'gains-1000',
	name: 'Gym Enthusiast',
	desc: 'Reach 1,000 total gains',
	requirement: function() { return gymState.gains >= 1000; }
}, {
	id: 'gains-10000',
	name: 'Gym Addict',
	desc: 'Reach 10,000 total gains',
	requirement: function() { return gymState.gains >= 10000; }
}, {
	id: 'gains-100000',
	name: 'Gym Legend',
	desc: 'Reach 100,000 total gains',
	requirement: function() { return gymState.gains >= 100000; }
}, {
	id: 'prestige-1',
	name: 'New Beginning',
	desc: 'Prestige for the first time',
	requirement: function() { return gymState.prestigeCount >= 1; }
}, {
	id: 'prestige-5',
	name: 'Reborn',
	desc: 'Prestige 5 times',
	requirement: function() { return gymState.prestigeCount >= 5; }
}, {
	id: 'mutation-1',
	name: 'Mutated',
	desc: 'Discover your first mutation',
	requirement: function() { return gymState.mutationCount >= 1; }
}, {
	id: 'mutation-all',
	name: 'Evolution Complete',
	desc: 'Discover all mutations',
	requirement: function() { return gymState.mutationCount >= 4; }
}, {
	id: 'legendary',
	name: 'Legendary Find',
	desc: 'Click a legendary gain',
	requirement: function() { return false; } 
}];

// Fitness Quiz Questions
const quizQuestions = [
    {
        question: "What is the recommended protein intake for muscle building?",
        options: ["0.8g per kg body weight", "1.6-2.2g per kg body weight", "3.0g per kg body weight", "0.5g per kg body weight"],
        correct: 1,
        explanation: "Research shows 1.6-2.2g per kg body weight is optimal for muscle protein synthesis."
    },
    {
        question: "How long should you wait after eating before intense exercise?",
        options: ["30 minutes", "1-2 hours", "3-4 hours", "No waiting needed"],
        correct: 2,
        explanation: "3-4 hours allows for proper digestion and prevents gastrointestinal distress during exercise."
    },
    {
        question: "What is the primary cause of muscle fatigue during exercise?",
        options: ["Lactic acid buildup", "Dehydration", "ATP depletion", "Oxygen debt"],
        correct: 2,
        explanation: "ATP (adenosine triphosphate) is the primary energy currency of cells, and its depletion leads to fatigue."
    },
    {
        question: "How much water should you drink per day for optimal hydration?",
        options: ["1 liter", "2-3 liters", "4-5 liters", "500ml"],
        correct: 1,
        explanation: "2-3 liters per day is recommended for most adults, adjusted for activity level and climate."
    },
    {
        question: "What is the ideal caloric surplus for clean bulking?",
        options: ["100-200 calories", "300-500 calories", "700-1000 calories", "50-100 calories"],
        correct: 1,
        explanation: "A moderate surplus of 300-500 calories promotes muscle growth while minimizing fat gain."
    },
    {
        question: "How long does it typically take to see noticeable muscle growth?",
        options: ["1-2 weeks", "3-4 weeks", "6-8 weeks", "3-6 months"],
        correct: 2,
        explanation: "Visible muscle growth typically becomes noticeable after 6-8 weeks of consistent training."
    },
    {
        question: "What is the best post-workout meal timing?",
        options: ["Within 30 minutes", "Within 2 hours", "Within 4 hours", "Timing doesn't matter"],
        correct: 1,
        explanation: "The 2-hour post-workout window is optimal for muscle recovery and protein synthesis."
    },
    {
        question: "Which macronutrient is most important for muscle recovery?",
        options: ["Carbohydrates", "Protein", "Fats", "All equally important"],
        correct: 1,
        explanation: "Protein provides amino acids essential for muscle repair and growth after exercise."
    }
];

// Water intake tracker
let waterIntake = 0;
const maxWaterIntake = 2000; // 2 liters in ml

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupScrollListener();
    setupNavigationProgress();
});

function initializeApp() {
    // Set up navigation
    setupNavigation();
    
    // Set up page management
    setupPageManagement();
    
    // Set up calculators
    setupCalculators();
    
    // Set up interactive elements
    setupInteractiveElements();
    
    // Set up game
    setupGame();
    
    // Handle initial page load
    handlePageLoad();
    
    // Initialize the 'How to Play' toggle
    setupHowToPlayToggle();
}

function handlePageLoad() {
    const hash = window.location.hash.substring(1);
    const validPages = ['home', 'bulking', 'fatigue', 'muscle-gain', 'meal-timing', 'game', 'gym-simulator'];
    
    if (hash && validPages.includes(hash)) {
        showPage(hash);
    } else {
        showPage('home');
    }
}

// Navigation Setup
function setupNavigation() {
    // Mobile navigation toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navList.classList.toggle('active');
            this.setAttribute(
                'aria-expanded',
                this.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
            );
        });
    }
    
    // Close mobile nav when clicking outside
    document.addEventListener('click', function(e) {
        if (
            navToggle && navList &&
            !navToggle.contains(e.target) &&
            !navList.contains(e.target)
        ) {
            navList.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Navigation link click handling with event delegation
    if (navList) {
        navList.addEventListener('click', function(e) {
            const link = e.target.closest('.nav-link');
            if (!link) return; 
            
            handleNavigationClick(e, link);
        });
    }
    
    // Topic card click handling with event delegation
    const topicsGrid = document.querySelector('.topics-grid');
    if (topicsGrid) {
        topicsGrid.addEventListener('click', function(e) {
            const button = e.target.closest('.topic-button');
            if (!button) return;
            
            const card = button.closest('.topic-card');
            if (!card) return;
            
            e.preventDefault();
            const targetPage = card.getAttribute('data-page');
            if (!targetPage) return;
            
            // Update active state in navigation
            document.querySelectorAll('.nav-link').forEach(function(link) {
                link.classList.toggle('active', link.getAttribute('data-page') === targetPage);
            });
            
            // Show the target page
            showPage(targetPage);
            history.pushState({}, '', '#' + targetPage);
            window.scrollTo(0, 0);
        });
    }
}

function handleNavigationClick(e, link) {
    e.preventDefault();
    const targetPage = link.getAttribute('data-page');
    if (!targetPage) return; 
    
    showPage(targetPage);
    history.pushState({}, '', '#' + targetPage);
    
    if (navList.classList.contains('active')) {
        navList.classList.remove('active');
        if (navToggle) {
            navToggle.setAttribute('aria-expanded', 'false');
        }
    }
    
    document.querySelectorAll('.nav-link').forEach(function(navLink) {
        navLink.classList.toggle('active', navLink === link);
    });
    
    window.scrollTo(0, 0);
}

function setupScrollListener() {
    let lastScroll = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Hide/show header on scroll
        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // Scroll down
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            // Scroll up
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        
        lastScroll = currentScroll;
    });
}

// Setup navigation progress indicator
function setupNavigationProgress() {
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'page-progress';
    document.body.appendChild(progressBar);
    
    // Update progress on scroll
    window.addEventListener('scroll', function() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Page Management
function handleTopicCardClick() {
	var targetPage = this.getAttribute('data-page');
	showPage(targetPage);
	history.pushState({}, '', '#' + targetPage);
	window.scrollTo(0, 0);
}

function handleTopicButtonClick(e) {
	e.stopPropagation();
	var targetPage = this.closest('.topic-card').getAttribute('data-page');
	showPage(targetPage);
	history.pushState({}, '', '#' + targetPage);
	window.scrollTo(0, 0);
}

function setupPageManagement() {
	// Topic cards navigation
	for (var i = 0; i < topicCards.length; i++) {
		topicCards[i].addEventListener('click', handleTopicCardClick);
	}

	// Topic buttons
	var topicButtons = document.querySelectorAll('.topic-button');
	for (var j = 0; j < topicButtons.length; j++) {
		topicButtons[j].addEventListener('click', handleTopicButtonClick);
	}
}

function addSoundToggleButton() {
    // Check if button already exists
    if (document.getElementById('gym-sound-toggle')) return;
    
    const soundButton = document.createElement('button');
    soundButton.id = 'gym-sound-toggle';
    soundButton.className = 'sound-toggle-btn';
    soundButton.innerHTML = gymSoundEnabled ? '🔊' : '🔇';
    soundButton.title = gymSoundEnabled ? 'Mute Sounds' : 'Enable Sounds';
    
    soundButton.addEventListener('click', toggleGymSound);
    
    // Add to the game container
    const gameContainer = document.getElementById('gameArea');
    if (gameContainer) {
        gameContainer.appendChild(soundButton);
    } else {
        // Fallback to adding to the page if game container not found
        const gymPage = document.getElementById('gym-simulator-page');
        if (gymPage) {
            soundButton.style.position = 'fixed';
            gymPage.appendChild(soundButton);
        }
    }
}

// Loading Bar Functions
function showLoadingBar(show) {
	if (show === undefined) show = true;
	var loadingBar = document.getElementById('loading-bar');
	if (!loadingBar) return;

	if (show) {
		loadingBar.classList.remove('active');
		loadingBar.classList.remove('complete');
		loadingBar.style.width = '0';

		// Force reflow
		void loadingBar.offsetWidth;

		loadingBar.classList.add('active');

		// Delay width update to trigger CSS animation
		setTimeout(function() {
			loadingBar.style.width = '100%';
		}, 0);
	} else {
		loadingBar.classList.add('complete');
		setTimeout(function() {
			loadingBar.classList.remove('active');
			loadingBar.classList.remove('complete');
			loadingBar.style.width = '0';
		}, 500);
	}
}

function showPage(pageId) {

	if (gameState.isGameActive && pageId !== 'game') {
        resetQuiz();
    }

    var activePage = document.querySelector('.page.active');
    if (activePage && activePage.id === 'gym-simulator-page' && pageId !== 'gym-simulator') {
        cleanupGymSimulator();
    }

    showLoadingBar(true);

	setTimeout(function() {
		// Hide all pages
		for (var i = 0; i < pages.length; i++) {
			pages[i].classList.remove('active');
		}

		var targetPage = document.getElementById(pageId + '-page');
		if (targetPage) {
			targetPage.classList.add('active');

			var heading = targetPage.querySelector('h2');
			var pageTitle = 'FitNutrition Hub';
			if (heading && heading.textContent) {
				pageTitle = heading.textContent;
			}
			document.title = pageTitle + ' | FitNutrition Hub';

			if (pageId === 'gym-simulator') {
				if (!gymState.initialized) {
					gymState.initialized = true;
					setupGymSimulator();
				}

				try {
					if (!document.getElementById('gym-sound-toggle')) {
						addSoundToggleButton();
					}
					setTimeout(playGymBackgroundMusic, 300);
				} catch (error) {
					console.log('Error initializing gym sound:', error);
				}
			} else {
				try {
					stopGymBackgroundMusic();
				} catch (error) {
					console.log('Error stopping gym sound:', error);
				}
			}

			setTimeout(function() {
				triggerPageAnimations(pageId);
				showLoadingBar(false);
			}, 300);
		}

		// Update nav links
		for (var j = 0; j < navLinks.length; j++) {
			if (navLinks[j].getAttribute('data-page') === pageId) {
				navLinks[j].classList.add('active');
			} else {
				navLinks[j].classList.remove('active');
			}
		}

		console.log('Page viewed: ' + pageId);
	}, 100);
}

function triggerPageAnimations(pageId) {
	switch (pageId) {
		case 'bulking':
			setTimeout(function() { animateMacroBars(); }, 300);
			break;
		case 'muscle-gain':
			setTimeout(function() { animateChart(); }, 300);
			break;
		case 'meal-timing':
			setTimeout(function() { updateWaterTracker(); }, 300);
			break;
		case 'fatigue':
			setTimeout(function() { setupFatigueSlider(); }, 300);
			break;
		case 'game':
			initializeGameView();
			break;
		case 'gym-simulator':
			setupGymSimulator();
			break;
	}
}

// Calculator Setup
function setupCalculators() {
	// Bulking Calculator
	var calcBulkButton = document.getElementById('calc-bulk');
	var bulkWeightInput = document.getElementById('bulk-weight');
	var bulkResultDiv = document.getElementById('bulk-result');

	if (calcBulkButton) {
		calcBulkButton.addEventListener('click', function() {
			var weight = parseFloat(bulkWeightInput.value);

			if (isNaN(weight) || weight <= 0) {
				bulkResultDiv.innerHTML = '<p class="error">Please enter a valid weight.</p>';
				bulkResultDiv.classList.add('active');
				return;
			}

			// Calculate macros based on weight
			var calories = Math.round(weight * 35); // ~35 calories per kg for bulking
			var protein = Math.round(weight * 2.2); // ~2.2g protein per kg
			var fat = Math.round((calories * 0.25) / 9); // 25% of calories from fat
			var carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4); // Remaining calories from carbs

			// Display results with string concatenation
			bulkResultDiv.innerHTML =
				'<div class="macro-result">' +
					'<div class="result-heading">Daily Caloric Target</div>' +
					'<div class="result-value">' + calories + ' calories</div>' +
					'<div class="result-detail">' +
						'<span class="detail-label">Caloric Surplus</span>' +
						'<span class="detail-value">+500 calories</span>' +
					'</div>' +
				'</div>' +

				'<div class="macro-result">' +
					'<div class="result-heading">Protein</div>' +
					'<div class="result-value">' + protein + 'g</div>' +
					'<div class="result-detail">' +
						'<span class="detail-label">Calories from Protein</span>' +
						'<span class="detail-value">' + (protein * 4) + ' cal (' + Math.round((protein * 4 / calories) * 100) + '%)</span>' +
					'</div>' +
				'</div>' +

				'<div class="macro-result">' +
					'<div class="result-heading">Carbohydrates</div>' +
					'<div class="result-value">' + carbs + 'g</div>' +
					'<div class="result-detail">' +
						'<span class="detail-label">Calories from Carbs</span>' +
						'<span class="detail-value">' + (carbs * 4) + ' cal (' + Math.round((carbs * 4 / calories) * 100) + '%)</span>' +
					'</div>' +
				'</div>' +

				'<div class="macro-result">' +
					'<div class="result-heading">Fats</div>' +
					'<div class="result-value">' + fat + 'g</div>' +
					'<div class="result-detail">' +
						'<span class="detail-label">Calories from Fat</span>' +
						'<span class="detail-value">' + (fat * 9) + ' cal (' + Math.round((fat * 9 / calories) * 100) + '%)</span>' +
					'</div>' +
				'</div>' +

				'<div class="result-note">' +
					'These macros are calculated for a moderate bulking phase. Adjust based on your activity level and results.' +
				'</div>';

			bulkResultDiv.classList.add('active');
		});
	}

	// Goal Setting Tool
	var setGoalsBtn = document.getElementById('set-goals');
	if (setGoalsBtn) {
		setGoalsBtn.addEventListener('click', function() {
			setRealisticGoals();
		});
	}
}

function setRealisticGoals() {
	var experienceLevel = document.getElementById('experience-level').value;
	var currentWeight = parseFloat(document.getElementById('current-weight').value);
	var resultDiv = document.getElementById('goal-results');

	if (experienceLevel && currentWeight && resultDiv) {
		var monthlyGain, yearlyGain, timeframe;

		switch (experienceLevel) {
			case 'beginner':
				monthlyGain = 1.0; // kg per month
				yearlyGain = '8 - 12';
				timeframe = "First year gains are the most dramatic";
				break;
			case 'intermediate':
				monthlyGain = 0.5; // kg per month
				yearlyGain = '4 - 6';
				timeframe = "Steady progress with consistent effort";
				break;
			case 'advanced':
				monthlyGain = 0.25; // kg per month
				yearlyGain = '2 - 3';
				timeframe = "Slow but quality muscle gains";
				break;
		}

		var sixMonthGoal = currentWeight + (monthlyGain * 6);
		var oneYearGoal = currentWeight + (monthlyGain * 12);

		resultDiv.innerHTML =
			'<h4>Realistic Goals for ' + experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1) + ':</h4>' +
			'<div class="goal-timeline">' +
				'<div class="goal-item">' +
					'<strong>6 Months:</strong> ' + sixMonthGoal.toFixed(1) + ' kg (~' + (monthlyGain * 6).toFixed(1) + ' kg muscle gain)' +
				'</div>' +
				'<div class="goal-item">' +
					'<strong>1 Year:</strong> ' + oneYearGoal.toFixed(1) + ' kg (~' + (monthlyGain * 12).toFixed(1) + ' kg muscle gain)' +
				'</div>' +
				'<div class="goal-note">' +
					'<em>' + timeframe + '</em>' +
				'</div>' +
			'</div>';

		showAchievement("Realistic goals set! 🎯");
	}
}

// Interactive Elements Setup
function setupInteractiveElements() {
	// Water tracker
	var addWaterBtn = document.getElementById('add-water');
	var resetWaterBtn = document.getElementById('reset-water');

	if (addWaterBtn) {
		addWaterBtn.addEventListener('click', function() {
			addWater(250); // 250ml per glass
		});
	}

	if (resetWaterBtn) {
		resetWaterBtn.addEventListener('click', function() {
			resetWaterIntake();
		});
	}

	// Initialize water tracker
	updateWaterTracker();
}

function setupFatigueSlider() {
	var fatigueSlider = document.getElementById('fatigue-slider');
	var fatigueAdvice = document.getElementById('fatigue-advice');

	if (fatigueSlider && fatigueAdvice) {
		fatigueSlider.addEventListener('input', function() {
			var level = parseInt(this.value, 10);
			updateFatigueAdvice(level, fatigueAdvice);
		});

		// Initialize with current value
		updateFatigueAdvice(parseInt(fatigueSlider.value, 10), fatigueAdvice);
	}
}

function updateFatigueAdvice(level, adviceElement) {
	var advice, color;

	if (level <= 3) {
		advice = "Great! You're well-rested. Perfect time for intense training.";
		color = "#4CAF50";
	} else if (level <= 5) {
		advice = "Moderate fatigue. Consider a moderate intensity workout or active recovery.";
		color = "#FF9800";
	} else if (level <= 7) {
		advice = "High fatigue. Light exercise or complete rest is recommended.";
		color = "#f44336";
	} else {
		advice = "Very high fatigue. Take a rest day and focus on recovery.";
		color = "#d32f2f";
	}

	adviceElement.innerHTML = '<p style="color: ' + color + '; font-weight: 500;">' + advice + '</p>';
}

function addWater(amount) {
    if (waterIntake < maxWaterIntake) {
        waterIntake += amount;
        if (waterIntake > maxWaterIntake) {
            waterIntake = maxWaterIntake;
        }
        updateWaterTracker();
        
        // Show achievement if goal reached
        if (waterIntake >= maxWaterIntake) {
            showAchievement("Hydration Goal Reached! 💧");
        }
    }
}

function resetWaterIntake() {
	waterIntake = 0;
	updateWaterTracker();
}

function updateWaterTracker() {
	var waterLevel = document.getElementById('water-level');
	var waterStatus = document.getElementById('water-status');

	if (waterLevel && waterStatus) {
		var percentage = (waterIntake / maxWaterIntake) * 100;
		waterLevel.style.height = percentage + '%';
		waterStatus.textContent = 'Daily intake: ' + waterIntake + 'ml / ' + maxWaterIntake + 'ml';

		// Update color based on progress
		if (percentage >= 100) {
			waterLevel.style.backgroundColor = '#4CAF50';
		} else if (percentage >= 75) {
			waterLevel.style.backgroundColor = '#2196F3';
		} else if (percentage >= 50) {
			waterLevel.style.backgroundColor = '#FF9800';
		} else {
			waterLevel.style.backgroundColor = '#f44336';
		}
	}
}

// Game Setup
function setupGame() {
    if (startGameBtn) {
        startGameBtn.addEventListener('click', startGame);
    }
    
    if (restartGameBtn) {
        restartGameBtn.addEventListener('click', restartGame);
    }
}

function initializeGameView() {
    if (gameStart) {
        gameStart.style.display = 'block';
    }
    if (gameQuestion) {
        gameQuestion.style.display = 'none';
    }
    if (gameOver) {
        gameOver.style.display = 'none';
    }
    
    // Reset game stats display
    updateGameStats();
    
    // Clear any previous feedback
    const feedbackElement = document.getElementById('question-feedback');
    if (feedbackElement) {
        feedbackElement.innerHTML = '';
    }
}

function updateGameStats() {
    const scoreElement = document.getElementById('game-score');
    const levelElement = document.getElementById('game-level');
    const livesElement = document.getElementById('game-lives');
    const timeElement = document.getElementById('game-time');
    
    if (scoreElement) scoreElement.textContent = gameState.score;
    if (levelElement) levelElement.textContent = gameState.level;
    if (livesElement) livesElement.textContent = gameState.lives;
    if (timeElement) timeElement.textContent = gameState.timeLeft;
}

function startGame() {
    gameState = {
        score: 0,
        level: 1,
        lives: 3,
        currentQuestion: 0,
        timeLeft: 30,
        timer: null,
        isGameActive: true
    };
    
    if (gameStart) gameStart.style.display = 'none';
    if (gameQuestion) gameQuestion.style.display = 'block';
    if (gameOver) gameOver.style.display = 'none';
    
    showNextQuestion();
}

function showNextQuestion() {
	if (gameState.currentQuestion >= quizQuestions.length) {
		endGame(true);
		return;
	}

	var question = quizQuestions[gameState.currentQuestion];

	// Clear feedback
	var feedbackElement = document.getElementById('question-feedback');
	if (feedbackElement) feedbackElement.innerHTML = '';

	var questionText = document.getElementById('question-text');
	var questionOptions = document.getElementById('question-options');
	var submitBtn = document.getElementById('submit-answer-btn');

	if (questionText) questionText.textContent = question.question;
	if (submitBtn) {
		submitBtn.disabled = true;
		submitBtn.onclick = handleSubmitAnswer;
	}

	if (questionOptions) {
		questionOptions.innerHTML = '';

		question.options.forEach(function(option, index) {
			var label = document.createElement('label');
			label.style.display = 'block';
			label.style.marginBottom = '8px';

			var radio = document.createElement('input');
			radio.type = 'radio';
			radio.name = 'answer';
			radio.value = index;

			// Enable submit button when an option is selected
			radio.addEventListener('change', function() {
				if (submitBtn) submitBtn.disabled = false;
			});

			label.appendChild(radio);
			label.appendChild(document.createTextNode(' ' + option));
			questionOptions.appendChild(label);
		});
	}

	updateGameStats();
	startTimer();
}

function handleSubmitAnswer(e) {
	if (e.preventDefault) e.preventDefault();
	var selected = document.querySelector('input[name="answer"]:checked');
	if (!selected) return; // no option selected

	var selectedIndex = parseInt(selected.value, 10);
	selectAnswer(selectedIndex);

	// Disable submit button after submit to prevent double submits
	var submitBtn = document.getElementById('submit-answer-btn');
	if (submitBtn) submitBtn.disabled = true;

	// Disable all radios
	var inputs = document.querySelectorAll('input[name="answer"]');
	for (var i = 0; i < inputs.length; i++) {
		inputs[i].disabled = true;
	}
}

function selectAnswer(selectedIndex) {
	var question = quizQuestions[gameState.currentQuestion];
	var isCorrect = selectedIndex === question.correct;

	// Stop timer
	clearInterval(gameState.timer);

	// Disable all option buttons
	var optionButtons = document.querySelectorAll('.option-btn');
	for (var i = 0; i < optionButtons.length; i++) {
		optionButtons[i].disabled = true;
	}

	// Show feedback
	showAnswerFeedback(isCorrect, question.explanation);

	if (isCorrect) {
		gameState.score += 10;
		showAchievement("Correct! +10 points");
		playGymSound('success-sound', 0.4);
	} else {
		gameState.lives--;
		playGymSound('error-sound', 0.4);
		if (gameState.lives <= 0) {
			setTimeout(function() { endGame(false); }, 2000);
			return;
		}
	}

	// Move to next question after delay
	setTimeout(function() {
		gameState.currentQuestion++;
		showNextQuestion();
	}, 3000);
}

function resetQuiz() {
    // Clear any running timer
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    // Reset game state
    gameState = {
        score: 0,
        level: 1,
        lives: 3,
        timeLeft: 30,
        timer: null,
        isGameActive: false,
        currentQuestion: 0
    };
    
    // Reset UI elements
    if (gameStart) gameStart.style.display = 'block';
    if (gameOver) gameOver.style.display = 'none';
    if (gameQuestion) gameQuestion.style.display = 'none';
    
    // Update stats display
    updateGameStats();
}

function startTimer() {
	gameState.timeLeft = 30;
	updateGameStats();

	gameState.timer = setInterval(function() {
		gameState.timeLeft--;
		updateGameStats();

		if (gameState.timeLeft <= 0) {
			// Time's up - treat as wrong answer
			clearInterval(gameState.timer);
			gameState.lives--;

			if (gameState.lives <= 0) {
				endGame(false);
			} else {
				showAnswerFeedback(false, "Time's up!");
				setTimeout(function() {
					gameState.currentQuestion++;
					showNextQuestion();
				}, 2000);
			}
		}
	}, 1000);
}

function showAnswerFeedback(isCorrect, explanation) {
	var feedbackElement = document.getElementById('question-feedback');
	if (feedbackElement) {
		feedbackElement.innerHTML = 
			'<div class="feedback ' + (isCorrect ? 'correct' : 'incorrect') + '">' +
				'<h4>' + (isCorrect ? '✅ Correct!' : '❌ Incorrect') + '</h4>' +
				'<p>' + explanation + '</p>' +
			'</div>';
	}
}

function endGame(/*completed*/) {
	gameState.isGameActive = false;
	clearInterval(gameState.timer);

	if (gameQuestion) gameQuestion.style.display = 'none';
	if (gameOver) gameOver.style.display = 'block';

	var finalScoreElement = document.getElementById('final-score');
	var performanceRating = document.getElementById('performance-rating');

	if (finalScoreElement) {
		finalScoreElement.textContent = gameState.score;
	}

	if (performanceRating) {
		var rating = "";
		var percentage = (gameState.score / (quizQuestions.length * 10)) * 100;

		if (percentage >= 90) {
			rating = "🏆 Fitness Expert! Outstanding knowledge!";
		} else if (percentage >= 70) {
			rating = "💪 Great job! You know your fitness facts!";
		} else if (percentage >= 50) {
			rating = "👍 Good effort! Keep learning!";
		} else {
			rating = "📚 Keep studying! Practice makes perfect!";
		}

		performanceRating.textContent = rating;
	}
}

function restartGame() {
	gameState.currentQuestion = 0;

	// Clear any previous feedback
	var feedbackElement = document.getElementById('question-feedback');
	if (feedbackElement) {
		feedbackElement.innerHTML = '';
	}

	startGame();
}

// Animation Functions
function animateMacroBars() {
	var macroBars = document.querySelectorAll('.macro-bar .bar');
	for (var i = 0; i < macroBars.length; i++) {
		(function(bar, index){
			setTimeout(function() {
				bar.style.transition = 'width 1s ease-out';
				bar.style.opacity = '1';
			}, index * 200);
		})(macroBars[i], i);
	}
}

function animateChart() {
	var chartItems = document.querySelectorAll('.chart-item');
	for (var i = 0; i < chartItems.length; i++) {
		(function(item, index){
			setTimeout(function() {
				item.style.animation = 'slideInUp 0.8s ease-out forwards';
			}, index * 150);
		})(chartItems[i], i);
	}
}

function showAchievement(message) {
	// Create achievement notification
	var achievement = document.createElement('div');
	achievement.className = 'achievement-notification';
	achievement.innerHTML = 
		'<div class="achievement-content">' +
			'<span class="achievement-icon">🎉</span>' +
			'<span class="achievement-text">' + message + '</span>' +
		'</div>';

	// Add styles
	achievement.style.cssText = 
		'position: fixed;' +
		'top: 20px;' +
		'right: 20px;' +
		'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);' +
		'color: white;' +
		'padding: 15px 20px;' +
		'border-radius: 10px;' +
		'box-shadow: 0 4px 15px rgba(0,0,0,0.2);' +
		'z-index: 1000;' +
		'transform: translateX(100%);' +
		'transition: transform 0.3s ease-out;' +
		'max-width: 300px;' +
		'font-weight: 500;';

	document.body.appendChild(achievement);

	// Animate in
	setTimeout(function() {
		achievement.style.transform = 'translateX(0)';
	}, 100);

	// Remove after delay
	setTimeout(function() {
		achievement.style.transform = 'translateX(100%)';
		setTimeout(function() {
			if (document.body.contains(achievement)) {
				document.body.removeChild(achievement);
			}
		}, 300);
	}, 3000);
}

// Gym Simulator Setup
function setupGymSimulator() {
	// Initialize upgrade buttons
	document.querySelectorAll('.upgrade-button').forEach(function(button) {
		// Check if the button already has our click handler
		if (!button.hasAttribute('data-upgrade-initialized')) {
			button.addEventListener('click', function handleUpgradeClick() {
				var upgradeType = this.dataset.upgrade;
				buyUpgrade(upgradeType);
			});
			// Mark as initialized to prevent duplicate handlers
			button.setAttribute('data-upgrade-initialized', 'true');
		}
	});

	// Initialize prestige button
	if (gymPrestigeButton && !gymPrestigeButton.hasAttribute('data-initialized')) {
		gymPrestigeButton.addEventListener('click', prestige);
		gymPrestigeButton.setAttribute('data-initialized', 'true');
	}

	// Load saved game
	loadGymGame();

	// Start spawning gains
	startSpawning();

	// Start auto-clicker if level > 0
	if (gymState.autoClickerLevel > 0) {
		startAutoClicker();
	}

	// Start checking for achievements
	if (!window.achievementInterval) {
		window.achievementInterval = setInterval(checkAchievements, 5000);
	}
	updateEventBanner();
	// Start random events
	setupGymEvents();

	// Save game periodically
	if (!window.saveInterval) {
		window.saveInterval = setInterval(saveGymGame, 30000);
	}

	// Update UI
	updateGymUI();

}

function setupGymEvents() {
	if (window.eventInterval) {
		clearInterval(window.eventInterval);
	}

	if (gymState.activeEvent) {
		gymState.activeEvent = null;
	}

	window.eventInterval = setInterval(function() {
		tryStartEvent();
	}, 30000);

	setTimeout(function() {
		tryStartEvent();
	}, 10000);

	updateEventBanner();
}


var MAX_ACTIVE_GAINS = 50; // Maximum number of gains allowed on screen
var activeGains = []; // Track number of active gains

function startSpawning(isRushEvent) {
	if (isRushEvent === undefined) isRushEvent = false;
	
	// Clear existing interval if any
	if (gymState.spawnInterval) {
		clearInterval(gymState.spawnInterval);
	}

	// Calculate spawn rate based on upgrade level and event
	var spawnRate = gymState.spawnRate;
	if (gymState.spawnRateLevel > 0) {
		spawnRate = Math.max(200, spawnRate - (gymState.spawnRateLevel * 150));
	}

	// Rush event spawns much faster
	if (isRushEvent) {
		spawnRate = Math.max(100, spawnRate / 4);
	}

	// Start new interval
	gymState.spawnInterval = setInterval(function() {
		spawnGain();
	}, spawnRate);
}

// Create a single tooltip element for reuse
var gymTooltip = null;

// Create and show tooltip
function createGymTooltip(text) {
	// Create tooltip if it doesn't exist
	if (!gymTooltip) {
		gymTooltip = document.createElement('div');
		gymTooltip.className = 'gain-tooltip';
		document.body.appendChild(gymTooltip);
	}

	// Set content
	gymTooltip.textContent = text;

	// Show tooltip
	gymTooltip.style.opacity = '1';
	gymTooltip.style.visibility = 'visible';

	return gymTooltip;
}

// Position tooltip at mouse coordinates
function positionGymTooltip(e) {
	if (!gymTooltip) return;

	var mouseX = e.clientX;
	var mouseY = e.clientY;

	// Position slightly above and to the right of cursor
	gymTooltip.style.left = (mouseX + 12) + 'px';
	gymTooltip.style.top = (mouseY - 40) + 'px';
}

// Hide tooltip
function hideGymTooltip() {
	if (gymTooltip) {
		gymTooltip.style.opacity = '0';
		gymTooltip.style.visibility = 'hidden';
	}
}

function spawnGain() {
	if (!gymGameArea || activeGains.length >= MAX_ACTIVE_GAINS) return;

	try {
		// Create gain element
		var gain = document.createElement('div');
		gain.className = 'falling-gain';

		var gainSize = 60; // Size of gain element
		var maxX = gymGameArea.offsetWidth - gainSize;
		var x = Math.max(0, Math.min(maxX, Math.floor(Math.random() * maxX)));
		var startY = -gainSize; // Start above the visible area

		// Set initial styles
		gain.style.left = x + 'px';
		gain.style.top = startY + 'px';
		gain.style.opacity = '0'; // Start fully transparent
		gain.style.transform = 'translateY(0) scale(0.8)';
		gain.style.transition = 'none';

		// Determine if this is junk food or regular gain
		var isJunkFood = Math.random() < junkFoodConfig.chance;
		var gainValue = 0;
		var rarity = 'common';
		var isMutated = false;
		var mutationType = null;
		var mutationMultiplier = 1;
		var junkFoodType = null;

		if (isJunkFood) {
			// This is junk food
			junkFoodType = junkFoodConfig.getRandomType();
			gainValue = -1;
			gain.dataset.isJunkFood = 'true';
			gain.dataset.junkFoodType = junkFoodType.name;
			gain.dataset.multiplier = junkFoodType.multiplier;
			gain.innerHTML = junkFoodType.emoji + '<span>' + junkFoodType.name + '</span>';
		} else {
			// This is regular gain
			rarity = determineRarity();
			var config = gainConfigs[rarity];

			// Check for mutations 
			isMutated = gymState.forceMutation || Math.random() < 0.05;

			if (isMutated) {
				// Select mutation type
				var mutationTypes = Object.keys(mutationConfigs);
				mutationType = mutationTypes[Math.floor(Math.random() * mutationTypes.length)];
				mutationMultiplier = mutationConfigs[mutationType].multiplier;
			}

			// Calculate value for regular gain
			gainValue = Math.floor((Math.random() * (config.maxValue - config.minValue + 1)) + config.minValue) * mutationMultiplier;
			gain.dataset.value = gainValue;
			gain.dataset.rarity = rarity;

			if (mutationType && mutationConfigs[mutationType]) {
				gain.dataset.mutation = mutationType;
				gain.innerHTML = mutationConfigs[mutationType].emoji + '<span>' + formatNumber(gainValue) + '</span>';
				// Increment mutation count and check for achievements
				if (!gymState.achievements.has('mutation-' + mutationType)) {
					gymState.mutationCount++;
					unlockAchievement('mutation-' + mutationType);
					// Check for mutation-related achievements
					checkAchievements();
				}
			} else {
				gain.innerHTML = config.emoji + '<span>' + formatNumber(gainValue) + '</span>';
			}
		}

		gain.addEventListener('mouseover', handleGainHover);
		gain.addEventListener('mouseout', handleGainMouseOut);
		gain.addEventListener('click', handleGainClick);

		// Add to game area immediately but keep it hidden
		gymGameArea.appendChild(gain);

		void gain.offsetHeight;

		setupGainAppearance(gain);

		// Add to active gains array
		activeGains.push(gain);

		setTimeout(function() {
			if (!gain.parentNode) return;

			var gameAreaRect = gymGameArea.getBoundingClientRect();
			var finalY = gameAreaRect.height + gainSize;

			gain.style.transition = 'transform ' + gymState.fallingSpeed + 's linear, opacity 0.5s ease-out';
			gain.style.opacity = '1'; // Fade in

			requestAnimationFrame(function() {
				gain.style.transform = 'translateY(' + finalY + 'px) scale(1)';
			});

			var onAnimationEnd = function() {
				// Only remove if the gain has reached near the bottom
				var gainRect = gain.getBoundingClientRect();
				var gameAreaBottom = gameAreaRect.bottom;

				if (gainRect.top >= gameAreaBottom - 10) {
					if (gain.parentNode) {
						gain.parentNode.removeChild(gain);
						// Remove from active gains array
						var index = activeGains.indexOf(gain);
						if (index > -1) {
							activeGains.splice(index, 1);
						}
					}
				} else {
					setTimeout(onAnimationEnd, 100);
				}
			};

			var checkDelay = (gymState.fallingSpeed * 1000) * 0.9;
			setTimeout(onAnimationEnd, checkDelay);

			setTimeout(function() {
				if (gain.parentNode) {
					gain.parentNode.removeChild(gain);
					var index = activeGains.indexOf(gain);
					if (index > -1) {
						activeGains.splice(index, 1);
					}
				}
			}, (gymState.fallingSpeed * 1000) + 2000); // Extra time to be safe

		}, 50); // Small delay before starting animation

		if (gymGameInstructions && gymGameInstructions.style.opacity !== '0') {
			gymGameInstructions.style.opacity = '0';
			setTimeout(function() {
				if (gymGameInstructions.parentNode) {
					gymGameInstructions.parentNode.removeChild(gymGameInstructions);
				}
			}, 500);
		}
	} catch (error) {
		console.error('Error in spawnGain:', error);
	}
}

// Helper functions for gain events
function handleGainHover(e) {
	try {
		var gain = e.target;
		var rarity = gain.dataset.rarity;
		var value = gain.dataset.value;
		var mutationType = gain.dataset.mutation;
		
		if (!rarity || !value) return;
		
		var tooltipText = capitalizeFirst(rarity) + ' Gain: ' + formatNumber(value);
		if (mutationType && mutationConfigs[mutationType]) {
			tooltipText += ' (' + capitalizeFirst(mutationType) + ' Mutation x' + mutationConfigs[mutationType].multiplier + ')';
		}
		
		createGymTooltip(tooltipText);
		positionGymTooltip(e);

		// Add mousemove event to update tooltip position
		document.addEventListener('mousemove', positionGymTooltip);
	} catch (error) {
		console.error('Error in handleGainHover:', error);
	}
}

function handleGainMouseOut() {
	hideGymTooltip();
	document.removeEventListener('mousemove', positionGymTooltip);
}

function handleGainClick(e) {
	e.stopPropagation();
	hideGymTooltip();
	document.removeEventListener('mousemove', positionGymTooltip);
	collectGain(this);
}

function setupGainAppearance(gain) {
	// Default styles for gains
	gain.style.position = 'absolute';
	gain.style.width = '60px';
	gain.style.height = '60px';
	gain.style.borderRadius = '50%';
	gain.style.display = 'flex';
	gain.style.flexDirection = 'column';
	gain.style.alignItems = 'center';
	gain.style.justifyContent = 'center';
	gain.style.cursor = 'pointer';
	gain.style.fontSize = '24px';
	gain.style.fontWeight = 'bold';
	gain.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';
	gain.style.zIndex = '10';
	gain.style.userSelect = 'none';

	// Check if this is junk food
	if (gain.dataset.isJunkFood === 'true') {
		// Style for junk food
		gain.style.background = 'linear-gradient(135deg, #ff6b6b, #ff8e8e)';
		gain.style.boxShadow = '0 4px 8px rgba(255, 0, 0, 0.3)';
		gain.style.border = '2px solid #ff3e3e';
		gain.style.color = '#fff';

		// Add hover effect
		gain.addEventListener('mouseover', function() {
			gain.style.transform = 'scale(1.1)';
			gain.style.boxShadow = '0 6px 12px rgba(255, 0, 0, 0.4)';
		});

		gain.addEventListener('mouseout', function() {
			gain.style.transform = 'scale(1)';
			gain.style.boxShadow = '0 4px 8px rgba(255, 0, 0, 0.3)';
		});
	}
}

function collectGain(gainElement) {
	try {
		playGymSound('gym-collect-sound', 0.5);

		var isJunkFood = gainElement.dataset.isJunkFood === 'true';

		if (isJunkFood) {
			playGymSound('gym-error-sound', 0.7);

			var junkFoodType = gainElement.dataset.junkFoodType;
			var multiplier = parseFloat(gainElement.dataset.multiplier);
			var amountLost = Math.max(1, Math.floor(gymState.gains * multiplier));

			gymState.gains = Math.max(0, gymState.gains - amountLost);

			showFloatingText(gainElement, '-' + amountLost);

			showGymToast('Ate ' + junkFoodType + '! Lost ' + amountLost + ' gains!');
			
		} else {
			var value = parseInt(gainElement.dataset.value) * gymState.multiplier;
			gymState.gains += value;
			gymState.currentRunGains += value;

			// Show floating text with value
			showFloatingText(gainElement, '+' + Math.floor(value));
		}

		// Remove the gain element
		if (gainElement.parentNode) {
			gainElement.parentNode.removeChild(gainElement);
		}

		// Remove from active gains array
		var index = activeGains.indexOf(gainElement);
		if (index > -1) {
			activeGains.splice(index, 1);
		}

		// Update UI
		updateGymUI();

		// Save game
		saveGymGame();

		// Check for achievements
		checkAchievements();
	} catch (error) {
		console.error('Error collecting gain:', error);
	}
}

function showFloatingText(element, text) {
	var rect = element.getBoundingClientRect();
	var floatingText = document.createElement('div');

	floatingText.textContent = text;
	floatingText.style.position = 'absolute';
	floatingText.style.left = (rect.left + rect.width / 2) + 'px';
	floatingText.style.top = rect.top + 'px';
	floatingText.style.transform = 'translate(-50%, -50%)';
	floatingText.style.color = 'white';
	floatingText.style.fontSize = '1.2em';
	floatingText.style.fontWeight = 'bold';
	floatingText.style.textShadow = '0 0 3px black';
	floatingText.style.pointerEvents = 'none';
	floatingText.style.zIndex = '1000';
	floatingText.style.transition = 'all 1s ease-out';

	document.body.appendChild(floatingText);

	// Animate
	setTimeout(function() {
		floatingText.style.top = (rect.top - 50) + 'px';
		floatingText.style.opacity = '0';
	}, 10);

	// Remove after animation
	setTimeout(function() {
		if (floatingText.parentNode) {
			floatingText.parentNode.removeChild(floatingText);
		}
	}, 1000);
}

function determineRarity() {
	// Apply rarity boost from upgrades
	var rarityBoost = 1 + (gymState.rarityBoostLevel * 0.1);

	// Apply event boost if active
	if (gymState.activeEvent === 'luck') {
		rarityBoost *= gymState.luckRarityBoost;
	}

	// Calculate adjusted chances
	var baseChances = gymState.baseRarityChances;
	var adjustedChances = {};

	adjustedChances.common = Math.max(0.4, baseChances.common - (rarityBoost - 1) * 0.3);

	var remainingProbability = 1 - adjustedChances.common;
	var raritySum = baseChances.rare + baseChances.epic + baseChances.legendary;

	adjustedChances.rare = (baseChances.rare / raritySum) * remainingProbability;
	adjustedChances.epic = (baseChances.epic / raritySum) * remainingProbability;
	adjustedChances.legendary = (baseChances.legendary / raritySum) * remainingProbability;

	// Store current chances
	gymState.rarityChances = adjustedChances;

	// Roll for rarity
	var roll = Math.random();
	var cumulativeProbability = 0;

	for (var rarity in adjustedChances) {
		if (adjustedChances.hasOwnProperty(rarity)) {
			var chance = adjustedChances[rarity];
			cumulativeProbability += chance;
			if (roll <= cumulativeProbability) {
				return rarity;
			}
		}
	}

	// Fallback
	return 'common';
}

function buyUpgrade(upgradeType) {
	// Get current level and cost
	var level = gymState[upgradeType + 'Level'];
	var costKey = upgradeType + 'Cost';
	var cost = gymState[costKey];

	// Check if player has enough gains
	if (gymState.gains < cost) {
		showGymToast("Not enough gains for this upgrade!");
		return;
	}

	// Apply upgrade
	gymState.gains -= cost;
	gymState[upgradeType + 'Level']++;

	// Calculate new cost (exponential growth)
	var newCost = Math.floor(cost * 1.8);
	gymState[costKey] = newCost;

	// Apply upgrade effects
	switch (upgradeType) {
		case 'spawnRate':
			startSpawning(); // Restart spawning with new rate
			break;
		case 'autoClicker':
			if (level === 0) { // First level of auto-clicker
				startAutoClicker();
			}
			// Update gains per second
			gymState.gainsPerSecond = Math.round(1 * Math.pow(2.0, gymState.autoClickerLevel - 1));
			break;
	}

	// Play upgrade sound
	playGymSound('gym-upgrade-sound', 0.5);

	// Update UI
	updateGymUI();
	showGymToast('Upgrade purchased! ' + upgradeType + ' is now level ' + formatNumber(gymState[upgradeType + 'Level']));

	// Save game
	saveGymGame();

	// Check for prestige achievements
	checkAchievements();
}

function startAutoClicker() {
	setInterval(function() {
		if (gymState.autoClickerLevel > 0) {
			// Auto generate gains based on level
			var baseGain = 1;
			var levelMultiplier = Math.pow(2.0, gymState.autoClickerLevel - 1);
			var autoGains = Math.round(baseGain * levelMultiplier * gymState.multiplier);

			gymState.gains += autoGains;
			gymState.currentRunGains += autoGains;

			// Update UI
			updateGymUI();

			// Update prestige button state
			updatePrestigeButton();
		}
	}, 1000);
}

function prestige() {
	// Check minimum gains requirement
	if (gymState.currentRunGains < 1000) {
		showGymToast("You need at least 1000 gains in this run to prestige!");
		return;
	}

	// Clear all existing gains from the game area
	var existingGains = document.querySelectorAll('.falling-gain');
	existingGains.forEach(function(gain) {
		if (gain.parentNode) {
			gain.parentNode.removeChild(gain);
		}
	});
	activeGains = []; // Clear the active gains array

	// Track best run
	if (gymState.currentRunGains > gymState.bestRun) {
		gymState.bestRun = gymState.currentRunGains;
	}

	// Increment prestige count
	gymState.prestigeCount++;

	// Calculate new multiplier 
	gymState.multiplier = 1 + (gymState.prestigeCount * 0.2);

	// Reset all game state
	gymState.gains = 0;
	gymState.currentRunGains = 0;
	gymState.spawnRateLevel = 0;
	gymState.rarityBoostLevel = 0;
	gymState.autoClickerLevel = 0;
	gymState.gainsPerSecond = 0;

	// Reset upgrade costs to initial values
	gymState.spawnRateCost = 50;
	gymState.rarityBoostCost = 100;
	gymState.autoClickerCost = 200;

	// Reset discovered mutations in UI
	document.querySelectorAll('.mutation-item').forEach(function(item) {
		item.classList.remove('discovered');
	});

	// Stop any running auto-clickers
	if (gymState.autoClickerInterval) {
		clearInterval(gymState.autoClickerInterval);
		gymState.autoClickerInterval = null;
	}

	// Stop any running events
	if (gymState.currentEvent) {
		endEvent();
	}

	// Reset spawn rate and start spawning again
	gymState.fallingSpeed = 5; // Reset to default falling speed
	startSpawning();

	// Update UI
	updateGymUI();
	showGymToast('🌟 Prestige complete! Your multiplier is now x' + formatNumber(gymState.multiplier));

	// Save the game state
	saveGymGame();

	// Check for prestige achievements
	checkAchievements();
}

function updatePrestigeButton() {
	if (!gymPrestigeButton) return;

	if (gymState.currentRunGains >= 1000) {
		gymPrestigeButton.disabled = false;
		gymPrestigeButton.textContent = 'Prestige Now (' + formatNumber(gymState.currentRunGains) + ' gains)';
	} else {
		gymPrestigeButton.disabled = true;
		gymPrestigeButton.textContent = 'Prestige (Requires 1,000+ gains)';
	}
}

function updateGymUI() {
	// Update stats
	if (gymGainsDisplay) {
		gymGainsDisplay.textContent = formatNumber(Math.floor(gymState.gains));
	}

	// Update multiplier display
	if (gymMultiplierDisplay) {
		gymMultiplierDisplay.textContent = 'x' + formatNumber(gymState.multiplier);
	}

	// Update gains per second
	if (gymGainsPerSecDisplay) {
		gymGainsPerSecDisplay.textContent = formatNumber(gymState.gainsPerSecond);
	}

	// Update upgrade levels and costs
	if (gymSpawnRateLevel) gymSpawnRateLevel.textContent = formatNumber(gymState.spawnRateLevel);
	if (gymRarityBoostLevel) gymRarityBoostLevel.textContent = formatNumber(gymState.rarityBoostLevel);
	if (gymAutoClickerLevel) gymAutoClickerLevel.textContent = formatNumber(gymState.autoClickerLevel);

	if (gymSpawnRateCost) gymSpawnRateCost.textContent = formatNumber(gymState.spawnRateCost);
	if (gymRarityBoostCost) gymRarityBoostCost.textContent = formatNumber(gymState.rarityBoostCost);
	if (gymAutoClickerCost) gymAutoClickerCost.textContent = formatNumber(gymState.autoClickerCost);

	// Update prestige info
	if (gymPrestigeCount) gymPrestigeCount.textContent = formatNumber(gymState.prestigeCount);
	if (gymPrestigeMultiplier) gymPrestigeMultiplier.textContent = 'x' + formatNumber(gymState.multiplier);
	if (gymBestRun) gymBestRun.textContent = formatNumber(Math.floor(gymState.bestRun));

	// Update mutation counter display
	if (gymMutationCount) {
		gymMutationCount.textContent = formatNumber(gymState.mutationCount);
	}

	// Disable upgrade buttons if can't afford
	document.querySelectorAll('.upgrade-button').forEach(function(button) {
		var upgradeType = button.dataset.upgrade;
		var cost = gymState[upgradeType + 'Cost'];
		button.disabled = gymState.gains < cost;
	});

	// Update prestige button
	updatePrestigeButton();

	// Update mutation display
	Object.keys(mutationConfigs).forEach(function(type) {
		var element = document.getElementById('mutation-' + type);
		if (element) {
			if (gymState.achievements instanceof Set) {
				if (gymState.achievements.has('mutation-' + type)) {
					element.classList.add('discovered');
				}
			} else if (Array.isArray(gymState.achievements)) {
				if (gymState.achievements.includes('mutation-' + type)) {
					element.classList.add('discovered');
				}
			}
		}
	});
}

function checkAchievements() {
	gymAchievements.forEach(function(achievement) {
		if (!gymState.achievements.has(achievement.id) && achievement.requirement()) {
			unlockAchievement(achievement.id);
		}
	});
}

function unlockAchievement(achId) {
	// Ensure achievements is a Set
	if (!(gymState.achievements instanceof Set)) {
		gymState.achievements = new Set(gymState.achievements || []);
	}

	// Check if already unlocked
	if (gymState.achievements.has(achId)) return;

	// Add to achievements
	gymState.achievements.add(achId);

	// Find achievement data
	var achData = gymAchievements.find(function(a) {
		return a.id === achId;
	});
	if (!achData) return;

	// Play achievement sound
	playGymSound('gym-achievement-sound', 0.6);

	// Show toast
	showGymToast('🏆 Achievement Unlocked: ' + achData.name);

	// Add to UI
	if (gymAchievementList) {
		// Remove initial text if this is first achievement
		if (gymInitialAchievementText && gymState.achievements.size === 1) {
			gymInitialAchievementText.remove();
		}

		// Create achievement element if not exists
		if (!document.querySelector('.achievement-item[data-id="' + achId + '"]')) {
			var achElement = document.createElement('div');
			achElement.className = 'achievement-item';
			achElement.dataset.id = achId;
			achElement.innerHTML = '<strong>' + achData.name + '</strong><span>' + achData.desc + '</span>';
			gymAchievementList.appendChild(achElement);

			// Animate in
			setTimeout(function() {
				achElement.style.opacity = '1';
			}, 10);
		}
	}

	// Save game
	saveGymGame();
}

function tryStartEvent() {
	// Don't start a new event if one is active
	if (gymState.activeEvent !== null) return;

	// Choose random event
	var events = ['luck', 'rush', 'mutation'];
	var event = events[Math.floor(Math.random() * events.length)];

	// Start event
	startEvent(event);
}

function startEvent(eventType) {
	gymState.activeEvent = eventType;
	gymState.eventEndTime = Date.now() + 10000; // 10 seconds

	switch (eventType) {
		case 'luck':
			gymState.luckRarityBoost = 2.0;
			showGymToast('🍀 Luck Event! Rarity chance boosted x' + formatNumber(gymState.luckRarityBoost) + ' for 10s!');
			break;
		case 'rush':
			showGymToast('⚡ Rush Event! Gain rain for 10s!');
			startSpawning(true); // pass 'rush' mode
			break;
		case 'mutation':
			gymState.forceMutation = true;
			showGymToast('🧬 Mutation Event! Every gain is mutated for 10s!');
			break;
	}

	updateEventBanner();

	setTimeout(endEvent, 10000);
}

function endEvent() {
	var endedEvent = gymState.activeEvent; // store before clearing

	switch (endedEvent) {
		case 'luck':
			gymState.luckRarityBoost = 1;
			break;
		case 'rush':
			startSpawning(); // return to normal spawn rate
			break;
		case 'mutation':
			gymState.forceMutation = false;
			break;
	}

	gymState.activeEvent = null;
	gymState.eventEndTime = null;
	updateEventBanner();
	showGymToast('🔔 ' + capitalizeFirst(endedEvent) + ' Event ended.');
}

function updateEventBanner() {
	if (!gymEventBanner) return;

	if (!gymState.activeEvent) {
		gymEventBanner.style.display = 'none';
		return;
	}

	gymEventBanner.style.display = 'block';

	switch (gymState.activeEvent) {
		case 'luck':
			gymEventBannerText.textContent = '🍀 LUCK EVENT: Increased chance for rare gains!';
			gymEventBanner.style.background = 'rgba(40, 167, 69, 0.1)';
			gymEventBanner.style.borderColor = 'rgba(40, 167, 69, 0.3)';
			break;
		case 'rush':
			gymEventBannerText.textContent = '⚡ RUSH EVENT: Gains are falling fast!';
			gymEventBanner.style.background = 'rgba(255, 193, 7, 0.1)';
			gymEventBanner.style.borderColor = 'rgba(255, 193, 7, 0.3)';
			break;
		case 'mutation':
			gymEventBannerText.textContent = '🧬 MUTATION EVENT: All gains are mutated!';
			gymEventBanner.style.background = 'rgba(111, 66, 193, 0.1)';
			gymEventBanner.style.borderColor = 'rgba(111, 66, 193, 0.3)';
			break;
	}
}

function saveGymGame() {
	try {
		// Convert Set to Array for JSON serialization
		var saveState = {};
		for (var key in gymState) {
			if (gymState.hasOwnProperty(key)) {
				saveState[key] = gymState[key];
			}
		}
		
		if (saveState.achievements instanceof Set) {
			saveState.achievements = Array.from(saveState.achievements);
		}

		localStorage.setItem('eliteGymSimulatorSave', JSON.stringify(saveState));
	} catch (e) {
		console.error("Could not save game", e);
	}
}

function loadGymGame() {
	try {
		var savedState = localStorage.getItem('eliteGymSimulatorSave');
		if (savedState) {
			var loadedState = JSON.parse(savedState);

			// Copy loaded state to gymState
			Object.keys(loadedState).forEach(function(key) {
				if (key !== 'achievements') {
					gymState[key] = loadedState[key];
				}
			});

			// Convert achievements array back to a Set
			if (Array.isArray(loadedState.achievements)) {
				gymState.achievements = new Set(loadedState.achievements);
			}

			// Refresh achievement list UI
			if (gymState.achievements.size > 0 && gymInitialAchievementText) {
				gymInitialAchievementText.remove();
			}

			// Convert Set to Array for forEach
			Array.from(gymState.achievements).forEach(function(achId) {
				var achData = gymAchievements.find(function(a) {
					return a.id === achId;
				});
				if (achData && gymAchievementList && !document.querySelector('.achievement-item[data-id="' + achId + '"]')) {
					var achElement = document.createElement('div');
					achElement.className = 'achievement-item';
					achElement.dataset.id = achId;
					achElement.innerHTML = '<strong>' + achData.name + '</strong><span>' + achData.desc + '</span>';
					gymAchievementList.appendChild(achElement);
				}
			});

			// Recalculate gainsPerSecond based on loaded level
			if (gymState.autoClickerLevel > 0) {
				gymState.gainsPerSecond = Math.round(1 * Math.pow(2.0, gymState.autoClickerLevel - 1));
			}

			// Update UI with loaded data
			updateGymUI();
		}
	} catch (e) {
		console.error("Could not load game", e);
		localStorage.removeItem('eliteGymSimulatorSave');
	}
}

// Helper functions
function formatNumber(num) {
	if (num >= 1000000) {
		return Math.round(num / 1000000) + 'M';
	} else if (num >= 1000) {
		return Math.round(num / 1000) + 'K';
	} else {
		return Math.round(num);
	}
}

function capitalizeFirst(str) {
	if (!str || typeof str !== 'string') return '';
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function showGymToast(message) {
	if (!gymToast) return;

	gymToast.textContent = message;
	gymToast.classList.add('show');

	setTimeout(function() {
		gymToast.classList.remove('show');
	}, 3000);
}

// Error handling
window.addEventListener('error', function(e) {
	console.error('JavaScript error:', e.error);
	var errorMessage = document.createElement('div');
	errorMessage.className = 'error-message';
	errorMessage.innerHTML = 
		'<div class="error-content">' +
			'<h3>Something went wrong</h3>' +
			'<p>There was an error loading this content. Please try refreshing the page.</p>' +
			'<button onclick="window.location.reload()" class="btn">Refresh Page</button>' +
		'</div>';
	document.body.appendChild(errorMessage);
	
	if (typeof window.gtag === 'function') {
		window.gtag('event', 'exception', {
			'description': e.message,
			'fatal': true
		});
	}
});

// Add loading state
window.addEventListener('load', function() {
	document.body.classList.add('loaded');
	setTimeout(function() {
		document.body.classList.remove('loading');
	}, 500);
});

var resizeTimer;
window.addEventListener('resize', function() {
	document.body.classList.add('resize-animation-stopper');
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(function() {
		document.body.classList.remove('resize-animation-stopper');
	}, 400);
});

var isTabActive = true;
document.addEventListener('visibilitychange', handleVisibilityChange);

function handleVisibilityChange() {
	isTabActive = !document.hidden;

	if (isTabActive) {
		if (gymState.spawnInterval) {
			clearInterval(gymState.spawnInterval);
			startSpawning();
		}
	} else {
		cleanupAllGains();
	}
}

function cleanupAllGains() {
	// Remove all gain elements from the DOM
	var gains = document.querySelectorAll('.falling-gain');
	gains.forEach(function(gain) {
		if (gain.parentNode) {
			gain.parentNode.removeChild(gain);
		}
	});
	// Clear the active gains array
	activeGains = [];
}

function cleanupGymSimulator() {
    // Clear all intervals
    clearInterval(window.gainSpawnInterval);
    clearInterval(window.autoClickerInterval);
    clearInterval(window.achievementInterval);
    clearInterval(window.saveInterval);
    clearInterval(window.eventInterval);
    
    // Clear any spawn interval in gymState
    if (gymState.spawnInterval) {
        clearInterval(gymState.spawnInterval);
        gymState.spawnInterval = null;
    }
    
    // Clear any active timeouts 
    const maxTimeoutId = setTimeout(function() {}, 0);
    for (let i = 1; i < maxTimeoutId; i++) {
        clearTimeout(i);
    }
    
    // Clean up any active gains
    cleanupAllGains();
    
    // Reset interval variables
    window.gainSpawnInterval = null;
    window.autoClickerInterval = null;
    window.achievementInterval = null;
    window.saveInterval = null;
    window.eventInterval = null;
    
    // Stop background music and sounds
    stopGymBackgroundMusic();
    
    // Reset any active events
    if (gymState.activeEvent) {
        gymState.activeEvent = null;
        gymState.eventEndTime = null;
        gymState.luckRarityBoost = 1;
        gymState.forceMutation = false;
        updateEventBanner();
    }
    
    updateGymUI();
}

function playGymSound(soundId, volume) {
	if (volume === undefined) volume = 1.0;
	
	try {
		var sound = document.createElement('audio');
		var source = document.createElement('source');
		source.src = document.getElementById(soundId).querySelector('source').src;
		sound.appendChild(source);
		sound.volume = volume;
		
		// Play the sound
		var playPromise = sound.play();
		if (playPromise !== undefined) {
			playPromise.catch(function(error) {
				console.warn('Could not play sound ' + soundId + ':', error);
			});
		}
		
		sound.onended = function() {
			sound.remove();
		};
	} catch (error) {
		console.error('Error in playGymSound:', error);
	}
}

function handleGainHover(e) {
	try {
		var gain = e.target;
		var rarity = gain.dataset.rarity;
		var value = gain.dataset.value;
		var mutationType = gain.dataset.mutation;
		
		if (!rarity || !value) return;
		
		var tooltipText = capitalizeFirst(rarity) + ' Gain: ' + formatNumber(value);
		if (mutationType && mutationConfigs[mutationType]) {
			tooltipText += ' (' + capitalizeFirst(mutationType) + ' Mutation x' + mutationConfigs[mutationType].multiplier + ')';
		}
		
		createGymTooltip(tooltipText);
		positionGymTooltip(e);
		document.addEventListener('mousemove', positionGymTooltip);
	} catch (error) {
		console.error('Error in handleGainHover:', error);
	}
}

function setupHowToPlayToggle() {
	var toggleButton = document.getElementById('howToPlayToggle');
	var toggleContent = document.getElementById('howToPlayContent');
	
	if (toggleButton && toggleContent) {
		toggleButton.addEventListener('click', function() {
			toggleButton.classList.toggle('active');
			toggleContent.classList.toggle('visible');
		});
		toggleContent.classList.remove('visible');
	}
}
