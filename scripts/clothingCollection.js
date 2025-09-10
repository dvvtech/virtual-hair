//Коллекия одежды

async function openCollection(event, previewId) {

    event.stopPropagation();
    const collectionModal = document.getElementById('collectionModal');
    const collectionGridMan = document.getElementById('collectionGridMan');
    const collectionGridWoman = document.getElementById('collectionGridWoman');

    showOverlay(0);
    //document.getElementById('overlay').classList.remove('hidden');

    // Clear previous content
    collectionGridMan.innerHTML = '';
    collectionGridWoman.innerHTML = '';

    try {

        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/hair`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }                              
        });

        if (!response.ok) {                                            
            throw new Error(err.description || 'Failed to delete item');                                          
        }

        const data = await response.json();        
        data.man.forEach(item => {
            const img = document.createElement('img');
            img.src = item.link;
            img.alt = item.category;
            img.className = 'w-full h-40 object-contain rounded cursor-pointer hover:opacity-75';
            img.onclick = () => selectFromCollection(item.link, previewId);
            collectionGridMan.appendChild(img);
        });

        data.woman.forEach(item => {
            const img = document.createElement('img');
            img.src = item.link;
            img.alt = item.category;
            img.className = 'w-full h-40 object-contain rounded cursor-pointer hover:opacity-75';
            img.onclick = () => selectFromCollection(item.link, previewId);
            collectionGridWoman.appendChild(img);
        });

        collectionModal.classList.remove('hidden');
        showTab('man');
        hideOverlay();
        //document.getElementById('overlay').classList.add('hidden');
    }
    catch(error)
    {
        console.error('Error fetching collection:', error);
        hideOverlay();
        //document.getElementById('overlay').classList.add('hidden');
        showError(error.message);
    }    
}

function showTab(tab) {

    const manGrid = document.getElementById('collectionGridMan');
    const womanGrid = document.getElementById('collectionGridWoman');
    const tabMan = document.getElementById('tabMan');
    const tabWoman = document.getElementById('tabWoman');

    if (tab === 'man') {

        manGrid.classList.remove('hidden');
        womanGrid.classList.add('hidden');
        tabMan.classList.add('active');
        tabWoman.classList.remove('active');
    } else {

        womanGrid.classList.remove('hidden');
        manGrid.classList.add('hidden');
        tabWoman.classList.add('active');
        tabMan.classList.remove('active');
    }
}

function selectFromCollection(imageLink, previewId) {
    const preview = document.getElementById(previewId);
    //const cleanImageLink = removeThumbnailSuffix(imageLink);
    preview.src = imageLink;
    preview.classList.remove('hidden');

    if (previewId === 'humanPreview') {
        window.humanPhotoUrl = imageLink;
    }
    else {
        window.garmPhotoUrl = imageLink;
    }

    closeCollection();
}

function closeCollection() {
    const collectionModal = document.getElementById('collectionModal');
    collectionModal.classList.add('hidden');
}


function removeThumbnailSuffix(link) {
    return link.replace(/_t(\.[a-z]+)$/, '$1');
}