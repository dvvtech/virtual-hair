async function getTryOnLimit() {
    try {
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/try-on-limit`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const limitData = await response.json();
        return limitData; // { remainingTries: number }
    } catch (error) {
        console.error('Failed to fetch try-on limit:', error);
        // Можно добавить обработку ошибки (например, показать уведомление пользователю)
        throw error; // Пробрасываем ошибку дальше, если нужно
    }
}

//for upload image
async function previewImage(event, previewId) {

    const file = event.target.files[0];
    const preview = document.getElementById(previewId);
    showOverlay(0);
    //document.getElementById('overlay').classList.remove('hidden');

    if (file) {

        // Валидация типа файла (только изображения)
        if (!file.type.startsWith('image/')) {
            alert('Please upload a valid image file.');
            hideOverlay();            
            return;
        }

        if(!isUserAuthenticated()){
            alert('Please log in');
            hideOverlay();            
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);

        // Upload file to server
        const formData = new FormData();
        formData.append('file', file);

        try {

            const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/uploads`, {
                method: 'POST',                        
                body: formData
            });

            if (!response.ok) {
                throw new Error(err.description || 'Error uploading file');
            }

            const data = await response.json();
            const imageUrl = data.url;
                if (previewId === 'humanPreview') {
                    window.humanPhotoUrl = imageUrl;
                } else {
                    window.garmPhotoUrl = imageUrl;
                }
        }
        catch (error) {
            showError(error.message);
        }
        finally
        {
            hideOverlay();
            //document.getElementById('overlay').classList.add('hidden');
        }                
    }
}

async function tryOn() {

    const mainContent = document.getElementById('mainContent');
    showOverlay();
    //document.getElementById('overlay').classList.remove('hidden');

    // Remove existing error messages
    const existingErrors = mainContent.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());

    const payload = {
        faceImg: window.humanPhotoUrl,
        hairImg: window.garmPhotoUrl        
    };

    try {

        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/virtual-hair/try-on`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            await handleErrorResponse(response);
            return;
        }

        const data = await response.json();
        handleSuccessTryOn(data);

    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    } finally {
        hideOverlay();
        //overlay.classList.add('hidden');
    }
}

function handleSuccessTryOn(data) {

    window.resultUrl = data.url;    
    showResult(window.humanPhotoUrl, window.garmPhotoUrl, data.url);

    //const remainingUsageEl = document.getElementById('remainingUsage');
    //remainingUsageEl.textContent = data.remainingUsage;
    //localStorage.setItem('remainingUsage', data.remainingUsage);

    //document.getElementById('remainingUsageContainer').style.display = 'block';
}

async function handleErrorResponse(response) {

    let errorMessage;
    try {
        if(response.status == 429){
             
            errorMessage = await response.text();
            //const remainingUsageEl = document.getElementById('remainingUsage');
            //remainingUsageEl.textContent = 0;
            //localStorage.setItem('remainingUsage', 0);
        }
        else{
            const err = await response.json();
            errorMessage = err.description || `Server error: ${response.status}`;
        }
    } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
    }

    if (response.status === 401) {
        errorMessage = 'Session expired. Please login again.';
    }

    throw new Error(errorMessage);
}

function showError(message) {
    clearErrorMessages();
    const errorMessage = document.createElement('div');
    errorMessage.textContent = message;
    errorMessage.className = 'text-red-600 text-center mt-4 error-message';
    document.getElementById('mainContent').appendChild(errorMessage);
}

function clearErrorMessages() {
    // Очищаем предыдущие сообщения об ошибках
    document.querySelectorAll('.error-message').forEach(el => el.remove());
}

function closeResult() {

    const resultViewer = document.getElementById('resultViewer');
    resultViewer.classList.add('hidden');

    const historyContent = document.getElementById('historyContent');
    const mainContent = document.getElementById('mainContent');

    if (!historyContent.classList.contains('hidden')) {
        historyContent.classList.remove('hidden');
    } else {
        mainContent.classList.remove('hidden');
    }
}

function showResult(humanImgUrl, garmentImgUrl, resultImgUrl) {

    showImageFullScreen(resultImgUrl,  humanImgUrl, garmentImgUrl, resultImgUrl);    
}

function replaceEndingToV(input) {
    // Регулярное выражение для замены _t на _v перед расширением файла
    const regex = /_t(\.[^.]+)$/;
    return input.replace(regex, '_v$1');
}

// Реализуйте функции навигации
function prevImg() {
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    loadImageWithSpinner(currentImages[currentIndex]);
    updateActiveButton(currentIndex);
}

function nextImg() {
    currentIndex = (currentIndex + 1) % currentImages.length;
    loadImageWithSpinner(currentImages[currentIndex]);
    updateActiveButton(currentIndex);
}

function updateActiveButton(index) {
    const buttons = document.querySelectorAll('.bottom-buttons button');
    buttons.forEach((btn, i) => {
        if (i === index) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}