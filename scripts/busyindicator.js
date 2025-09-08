let countdownInterval;
    const startCountdown = (duration) => {
        let seconds = duration;
        const countdownElement = document.getElementById('countdown-number');
        const progressElement = document.getElementById('progress');
        countdownElement.textContent = seconds;
        progressElement.style.width = '0%';
        
        // Показываем элементы отсчёта
        document.getElementById('countdown-container').classList.remove('hidden');
        document.getElementById('progress-bar-container').classList.remove('hidden');
        
        countdownInterval = setInterval(() => {
            seconds--;
            countdownElement.textContent = seconds;
            
            const progress = ((duration - seconds) / duration) * 100;
            progressElement.style.width = `${progress}%`;
            
            if (seconds <= 0) {
                clearInterval(countdownInterval);
                progressElement.style.width = '100%';
            }
        }, 1000);
    };

    const showOverlay = (duration = 34) => {
        // Сброс предыдущего отсчёта
        if (countdownInterval) clearInterval(countdownInterval);
        
        // Показать overlay
        document.getElementById('overlay').classList.remove('hidden');
        
        if (duration > 0) {
            // Запуск отсчёта, если duration > 0
            document.getElementById('countdown-number').textContent = duration;
            document.getElementById('progress').style.width = '0%';
            startCountdown(duration);
        } else {
            // Скрываем элементы отсчёта, если duration = 0
            document.getElementById('countdown-container').classList.add('hidden');
            document.getElementById('progress-bar-container').classList.add('hidden');
        }
    };

    const hideOverlay = () => {
        document.getElementById('overlay').classList.add('hidden');
        clearInterval(countdownInterval);
    };