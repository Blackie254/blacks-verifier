
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const checkForkBtn = document.getElementById('checkForkBtn');
    const forkNowBtn = document.getElementById('forkNowBtn');
    const syncRepoBtn = document.getElementById('syncRepoBtn');
    const deployNowBtn = document.getElementById('deployNowBtn');
    const githubUsernameInput = document.getElementById('githubUsername');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const forkStatus = document.getElementById('forkStatus');
    const message = document.getElementById('message');
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    const body = document.querySelector('body');
    const bgVideo = document.getElementById('bgVideo');
    
    // Ensure video plays properly
    bgVideo.play().catch(e => console.log('Video autoplay prevented:', e));
    
    // Menu toggle functionality
    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when clicking anywhere on the page
    body.addEventListener('click', function() {
        if (menu.classList.contains('active')) {
            closeMenu();
        }
    });
    // script.js

    function callApi() {
      fetch('/api/hello')
        .then(response => response.json())
        .then(data => {
          console.log(data);
          alert(data.message);
        })
        .catch(error => console.error('Error fetching API:', error));
    }


    function sendData() {
        fetch('/api/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: 'Blackie254', action: 'test' })
        })
          .then(response => response.json())
          .then(data => {
            console.log(data);
            alert(data.message);
          })
          .catch(error => console.error('Error sending POST request:', error));
    }

    // Prevent menu from closing when clicking inside it
    menu.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    function toggleMenu() {
        menu.classList.toggle('active');
        updateMenuToggleState();
    }
    
    function closeMenu() {
        menu.classList.remove('active');
        updateMenuToggleState();
    }
    
    function updateMenuToggleState() {
        const isActive = menu.classList.contains('active');
        menuToggle.querySelector('span:nth-child(1)').style.transform = isActive ? 'rotate(45deg) translate(5px, 5px)' : '';
        menuToggle.querySelector('span:nth-child(2)').style.opacity = isActive ? '0' : '1';
        menuToggle.querySelector('span:nth-child(3)').style.transform = isActive ? 'rotate(-45deg) translate(7px, -6px)' : '';
    }
    
    // Menu item click handlers
    document.getElementById('homeLink').addEventListener('click', function(e) {
        e.preventDefault();
        closeMenu();
        resetUI();
    });
    
    document.getElementById('instructionsLink').addEventListener('click', function(e) {
        e.preventDefault();
        showMessage('Instructions: 1. Fork the repo 2. Sync if needed 3. Deploy to Heroku', 'info');
        closeMenu();
    });
    
    function resetUI() {
        step1.style.display = 'block';
        step2.style.display = 'none';
        githubUsernameInput.value = '';
        githubUsernameInput.focus();
    }
    
    // Check if we have a username in localStorage (from previous visit)
    const storedUsername = localStorage.getItem('githubUsername');
    if (storedUsername) {
        githubUsernameInput.value = storedUsername;
    }
    
    // Event listeners
    checkForkBtn.addEventListener('click', checkForkStatus);
    forkNowBtn.addEventListener('click', forkRepository);
    syncRepoBtn.addEventListener('click', syncRepository);
    deployNowBtn.addEventListener('click', deployToHeroku);
    
    // Main function to check fork status with auto-redirect
    async function checkForkStatus() {
        const username = githubUsernameInput.value.trim();
        if (!username) {
            showMessage('Please enter your GitHub username', 'error');
            return;
        }
        
        localStorage.setItem('githubUsername', username);
        setButtonLoading(checkForkBtn, true);
        
        try {
            const forkResponse = await fetch(https://api.github.com/repos/${username}/black-super-bot);
            
            if (forkResponse.status === 200) {
                const forkData = await forkResponse.json();
                const compareResponse = await fetch(https://api.github.com/repos/${username}/black-super-bot/compare/main...Blackie254:main);
                
                if (compareResponse.status === 200) {
                    const compareData = await compareResponse.json();
                    
                    if (compareData.status === 'identical') {
                        // Fork is up to date - show countdown and redirect
                        showForkStatus('success', Your fork is up to date. You will be automatically redirected to Herku in 3 seconds...);
                        showButtons(false, false, true);
                        step1.style.display = 'none';
                        step2.style.display = 'block';
                        
                        // Start countdown
                        let seconds = 3;
                        const countdown = setInterval(() => {
                            seconds--;
                            
                            if (seconds > 0) {
                                showForkStatus('success', Your fork is up to date. You will be automatically redirected to Heroku in ${seconds} seconds...);
                            } else {
                                clearInterval(countdown);
                                window.location.href = https://dashboard.heroku.com/new?template=https://github.com/Blackie254/black-super-bot.git;
                            }
                        }, 1000);
                        
                        return;
                    } else if (compareData.status === 'behind') {
                        const commitsBehind = compareData.behind_by;
                        showForkStatus('warning', Your fork is ${commitsBehind} commit${commitsBehind !== 1 ? 's' : ''} behind the upstream repository. Please sync your fork before deploying.);
                        showButtons(false, true, false);
                    } else {
                        showForkStatus('warning', Your fork has diverged from the upstream repository. Consider syncing to get the latest updates.);
                        showButtons(false, true, true);
                    }
                } else {
                    showForkStatus('success', We found the black-super-bot repository in your account.);
                    showButtons(false, false, true);
                }
            } else if (forkResponse.status === 404) {
                showForkStatus('error', We couldn't find the black-super-bot repository in your GitHub account (@${username}). Please fork the repository to continue.);
                showButtons(true, false, false);
            } else {
                throw new Error('Error checking fork status');
            }
        } catch (error) {
            console.error('Error:', error);
            showForkStatus('error', 'Error checking repository status. Please try again later.');
        } finally {
            setButtonLoading(checkForkBtn, false);
            step1.style.display = 'none';
            step2.style.display = 'block';
        }
    }
    
    // Show appropriate buttons based on status
    function showButtons(showFork, showSync, showDeploy) {
        forkNowBtn.style.display = showFork ? 'block' : 'none';
        syncRepoBtn.style.display = showSync ? 'block' : 'none';
        deployNowBtn.style.display = showDeploy ? 'block' : 'none';
    }
    
    // Show fork status message
    function showForkStatus(type, text) {
        forkStatus.className = '';
        forkStatus.classList.add(type);
        forkStatus.innerHTML = text;
    }
    
    // Show general message
    function showMessage(text, type) {
        message.textContent = text;
        message.className = type || '';
        setTimeout(() => {
            message.textContent = '';
            message.className = '';
        }, 5000);
    }
    
    // Set button loading state
    function setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<span class="spinner"></span> Processing...';
        } else {
            button.disabled = false;
            button.innerHTML = button === checkForkBtn ? 
                'Check Repository Status' : 
                button === forkNowBtn ? 
                'Fork Repository Now' : 
                button === syncRepoBtn ? 
                'Sync Fork with Upstream' : 
                'Deploy to Heroku Now';
        }
    }
    
    // Fork repository function
    function forkRepository() {
        const username = githubUsernameInput.value.trim();
        setButtonLoading(forkNowBtn, true);
        
        showForkStatus('info', You'll be redirected to GitHub to fork the repository. After forking, return here and check your repository status again.);
        
        window.open('https://github.com/Blackie254/black-super-bot/fork', '_blank');
        
        setButtonLoading(forkNowBtn, false);
        forkNowBtn.style.display = 'none';
    }
    
    // Sync repository function
    function syncRepository() {
        const username = githubUsernameInput.value.trim();
        setButtonLoading(syncRepoBtn, true);
        
        showForkStatus('info', `<strong>To sync your fork:</strong><br><br>
        1. Go to your forked repository on GitHub<br>
        2. Click on "Fetch upstream"<br>
        3. Then click "Fetch and merge"<br>
        4. Return here and check your repository status again`);
        
        window.open(https://github.com/${username}/black-super-bot, '_blank');
        
        setButtonLoading(syncRepoBtn, false);
        syncRepoBtn.style.display = 'none';
    }
    
    // Deploy to Heroku function
    function deployToHeroku() {
        const username = githubUsernameInput.value.trim();
        setButtonLoading(deployNowBtn, true);
        
        window.location.href = https://dashboard.heroku.com/new?template=https://github.com/Blackie254/black-super-bot.git
    }
    
    // Focus on input when page loads
    githubUsernameInput.focus();
});