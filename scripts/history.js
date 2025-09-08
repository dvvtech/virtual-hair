async function showExample() {

    showHistoryWithUrl(`${API_BASE_URL}/api/virtual-hair/examples`, { authenticated: false });
    document.getElementById('fittingResultTitle').textContent = 'Examples';
}

async function showHistory() {

    showHistoryWithUrl(`${API_BASE_URL}/api/virtual-fit/history`);
    document.getElementById('fittingResultTitle').textContent = 'Fitting History';
}

async function showHistoryWithUrl(url, { authenticated = true } = {}) {

    showOverlay(0);
    //document.getElementById('overlay').classList.remove('hidden');

    const historyContent = document.getElementById('historyContent');
    const mainContent = document.getElementById('mainContent');

    try {

        const response = authenticated
            ? await makeAuthenticatedRequest(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
            : await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
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
        const historyTableBody = document.getElementById('historyTableBody');
        historyTableBody.innerHTML = '';

        data.forEach(item => {
            const row = document.createElement('tr');

            [item.hairImgUrl, item.faceImgUrl, item.resultImgUrl].forEach(imgUrl => {
                const cell = document.createElement('td');
                cell.className = 'border border-gray-200 p-0.5';

                const img = document.createElement('img');
                img.src = imgUrl;
                img.className = 'w-full h-40 object-contain cursor-pointer';
                img.onclick = () => showImageFullScreen(imgUrl, item.faceImgUrl, item.hairImgUrl, item.resultImgUrl);

                cell.appendChild(img);
                row.appendChild(cell);
            });

            if (authenticated) {
                // Добавляем кнопку "Удалить"
                const deleteCell = document.createElement('td');
                deleteCell.className = 'border border-gray-200 p-2 text-center';

                const deleteButton = document.createElement('button');
                deleteButton.className = 'p-1';
                deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 456 511.82" width="24" height="24" class="inline-block"><path fill="#FD3B3B" d="M48.42 140.13h361.99c17.36 0 29.82 9.78 28.08 28.17l-30.73 317.1c-1.23 13.36-8.99 26.42-25.3 26.42H76.34c-13.63-.73-23.74-9.75-25.09-24.14L20.79 168.99c-1.74-18.38 9.75-28.86 27.63-28.86zM24.49 38.15h136.47V28.1c0-15.94 10.2-28.1 27.02-28.1h81.28c17.3 0 27.65 11.77 27.65 28.01v10.14h138.66c.57 0 1.11.07 1.68.13 10.23.93 18.15 9.02 18.69 19.22.03.79.06 1.39.06 2.17v42.76c0 5.99-4.73 10.89-10.62 11.19-.54 0-1.09.03-1.63.03H11.22c-5.92 0-10.77-4.6-11.19-10.38 0-.72-.03-1.47-.03-2.23v-39.5c0-10.93 4.21-20.71 16.82-23.02 2.53-.45 5.09-.37 7.67-.37zm83.78 208.38c-.51-10.17 8.21-18.83 19.53-19.31 11.31-.49 20.94 7.4 21.45 17.57l8.7 160.62c.51 10.18-8.22 18.84-19.53 19.32-11.32.48-20.94-7.4-21.46-17.57l-8.69-160.63zm201.7-1.74c.51-10.17 10.14-18.06 21.45-17.57 11.32.48 20.04 9.14 19.53 19.31l-8.66 160.63c-.52 10.17-10.14 18.05-21.46 17.57-11.31-.48-20.04-9.14-19.53-19.32l8.67-160.62zm-102.94.87c0-10.23 9.23-18.53 20.58-18.53 11.34 0 20.58 8.3 20.58 18.53v160.63c0 10.23-9.24 18.53-20.58 18.53-11.35 0-20.58-8.3-20.58-18.53V245.66z"/></svg>`;

                deleteButton.onclick = () => deleteRow(row, item.id); // Удаление строки

                deleteCell.appendChild(deleteButton);
            
                row.appendChild(deleteCell);
            }

            historyTableBody.appendChild(row);
        });

        mainContent.classList.add('hidden');
        historyContent.classList.remove('hidden');

    } catch (error) {
        //console.error('Error:', error);
        showError(error.message);
        /*document.getElementById('overlay').classList.add('hidden');
            console.error('Error:', error);
            alert(error.message);*/
    } finally {
        hideOverlay();
        //document.getElementById('overlay').classList.add('hidden');
    }
}

async function deleteRow(row, itemId) {

    const isConfirmed = window.confirm('Are you sure you want to delete this entry?');
    if (!isConfirmed) {
        console.log('Deletion canceled by user');
        return;
    }

    // Удаляем строку из DOM
    row.remove();

    const payload = {
        fittingResultId: itemId
    };

    try {

        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/virtual-fit/history`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(err.description || 'Failed to delete item');
        }
    }
    catch (error) {
        showError(error.message);
    }
}

function hideHistory() {

    const historyContent = document.getElementById('historyContent');
    const mainContent = document.getElementById('mainContent');

    historyContent.classList.add('hidden');
    mainContent.classList.remove('hidden');
}

// Добавьте эти переменные в начало вашего скрипта
let currentImages = [];
let currentIndex = 0;

function showImageFullScreen(imgUrl, humanImgUrl, garmentImgUrl, resultImgUrl) {

    const resultViewer = document.getElementById('resultViewer');
    const resultImage = document.getElementById('resultImage');

    // Сохраняем все изображения для навигации
    currentImages = [
        replaceEndingToV(humanImgUrl, "_t"),
        replaceEndingToV(garmentImgUrl, "_t"),
        replaceEndingToV(resultImgUrl, "_t")
    ];

    // Находим индекс текущего изображения
    const cleanImageLink = replaceEndingToV(imgUrl);
    currentIndex = currentImages.indexOf(cleanImageLink);
    if (currentIndex === -1) currentIndex = 0;

    // Загружаем текущее изображение
    loadImageWithSpinner(cleanImageLink);
    updateActiveButton(currentIndex);
    resultViewer.classList.remove('hidden');

    // Обновляем кнопки для переключения изображений
    const buttons = resultViewer.querySelectorAll('.bottom-buttons button');
    buttons[0].onclick = () => {
        currentIndex = 0;
        updateActiveButton(currentIndex);
        loadImageWithSpinner(currentImages[0]);
    };
    buttons[1].onclick = () => {
        currentIndex = 1;
        updateActiveButton(currentIndex);
        loadImageWithSpinner(currentImages[1]);
    };
    buttons[2].onclick = () => {
        currentIndex = 2;
        updateActiveButton(currentIndex);
        loadImageWithSpinner(currentImages[2]);
    };
}

function loadImageWithSpinner(url) {

    showOverlay(0);
    //document.getElementById('overlay').classList.remove('hidden');

    // Создаем новый объект Image для предзагрузки
    const img = new Image();
    // Обработчик успешной загрузки
    img.onload = () => {
        resultImage.src = url; // Устанавливаем src
        hideOverlay();
        //document.getElementById('overlay').classList.add('hidden');
    };

    // Обработчик ошибки загрузки
    img.onerror = () => {
        console.error('Error loading image');
        alert('Failed to load image');
        hideOverlay();
        //document.getElementById('overlay').classList.add('hidden');
    };

    // Начинаем загрузку изображения
    img.src = url;
}