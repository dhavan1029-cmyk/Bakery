const loadingOverlay = document.getElementById('loading-overlay');
let loadTimer;

function showLoading(message = 'Processing your request.') {

    loadTimer = setTimeout(() => {

        loadingOverlay.classList.remove('hidden');

        loadingOverlay.querySelector('p').textContent = message;

    }, 250)

}

function hideLoading() {
    clearTimeout(loadTimer)
    
    loadingOverlay.classList.add('hidden');

}