async function showProfile() {

    //showOverlay(0);

    const profileContent = document.getElementById('profileContent');
    const mainContent = document.getElementById('mainContent');


    mainContent.classList.add('hidden');
    profileContent.classList.remove('hidden');
    try {

        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return response.json().then(err => {
                hideOverlay();
                //document.getElementById('overlay').classList.add('hidden');
                throw new Error(err.description || 'Failed to fetch history');
            });
            //await handleErrorResponse(response);
            //return;
        }

        const data = await response.json();
        //handleSuccess(data);
        setTextContentIfExists('userName', data.name);
        setTextContentIfExists('userEmail', data.email);
        setTextContentIfExists('fittingsToday', data.countFittingToday);
        setTextContentIfExists('totalFittings', data.totalAttemptsUsed);
        setTextContentIfExists('lastFittingDate', data.lastFittingDate);


        mainContent.classList.add('hidden');
        profileContent.classList.remove('hidden');

    } catch (error) {
        //console.error('Error:', error);
        showError(error.message);
        document.getElementById('overlay').classList.add('hidden');
        console.error('Error:', error);
        alert(error.message);
    } finally {
        hideOverlay();
        //document.getElementById('overlay').classList.add('hidden');
    }
}

// Функция для безопасного установки текста
function setTextContentIfExists(elementId, value) {
    if (value != null && value !== undefined && value !== '') {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }
}

function hideProfile() {

    const historyContent = document.getElementById('profileContent');
    const mainContent = document.getElementById('mainContent');

    historyContent.classList.add('hidden');
    mainContent.classList.remove('hidden');
}