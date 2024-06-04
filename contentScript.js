function sendVideoData() {
    const videos = document.querySelectorAll('ytd-rich-grid-media:not([data-predicted]), ytd-video-renderer:not([data-predicted]), ytd-compact-video-renderer:not([data-predicted])');

    videos.forEach(video => {
        const videoId = video.querySelector('a').href.split('watch?v=')[1]; 
        const titleElement = video.querySelector('#video-title');
        const thumbnailElement = video.querySelector('img');

        if (!titleElement || !titleElement.textContent.trim() || !thumbnailElement || !thumbnailElement.src) {
            console.log('Skipping video due to missing title or thumbnail');
            return;
        }

        const requestData = {
            title: titleElement.textContent.trim(),
            thumbnail: thumbnailElement.src
        };

        video.setAttribute('data-predicted', 'true');

        fetch('http://127.0.0.1:8000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        })
        .then(response => response.json())
        .then(data => {
            if (!video.hasAttribute('data-prediction-done')) {
                const predictionElement = document.createElement('div');
                predictionElement.className = 'elsagate-prediction-result';
                
                console.log(typeof data.prediction, data.prediction);

                // Mengakses nilai prediksi yang sebenarnya
                const predictionValue = data.prediction[0];
                console.log(predictionValue);
                console.log(typeof predictionValue, predictionValue);

                // Mengecek nilai prediksi dan menetapkan konten serta styling yang sesuai
                if (predictionValue === 1) {
                    predictionElement.textContent = "Warning, Detected as Elsagate";
                    predictionElement.style.cssText += 'color: black; background-color: #ff3860; padding: 3px; font-family: Arial; border-radius: 3px;';
                } else {
                    predictionElement.textContent = "Enjoy, This Video is Safe";
                    predictionElement.style.cssText += 'color: black; background-color: #23d160; padding: 3px; font-family: Arial; border-radius: 3px;';
                }

                // predictionElement.style.cssText += 'color:white; background-color:#ff9800 ;padding:2px; font-family:Arial; border-radius: 3px;';
                // predictionElement.textContent = `${data.prediction}`; 
                // predictionElement.textContent = `Prediction of ${requestData['title']}: ${data.prediction}`;

                titleElement.insertAdjacentElement('afterend', predictionElement);
                video.setAttribute('data-prediction-done', 'true'); // Ensure predictions are not added twice
            }
        })
        .catch(error => console.error('Error:', error));
    });
}


function resetPredictions() {
    // Menghapus semua hasil prediksi yang ada
    document.querySelectorAll('.elsagate-prediction-result').forEach(el => el.remove());
    // Menghapus atribut yang sudah tidak relevan
    document.querySelectorAll('[data-predicted], [data-prediction-done]').forEach(el => {
        el.removeAttribute('data-predicted');
        el.removeAttribute('data-prediction-done');
        console.log('All predictions have been reset.');
    });
}

// const observeUrlChange = () => {
//     let oldHref = document.location.href;

//     // Fungsi untuk memeriksa perubahan URL
//     const checkForUrlChange = () => {
//         const currentHref = document.location.href;
//         if (oldHref !== currentHref) {
//             console.log("URL changed from", oldHref, "to", currentHref);
//             resetPredictions();
//             sendVideoData();
//             oldHref = currentHref; // Update oldHref to the new URL
//         }
//     };
//     // Memeriksa URL setiap 500 ms
//     setInterval(checkForUrlChange, 4000);
// };
// window.onload = observeUrlChange;

let isUrlObserving = false; // Tambahkan variabel untuk menandai apakah pengamatan URL sudah dimulai
const observeUrlChange = () => {
    let oldHref = document.location.href;

    // Fungsi untuk memeriksa perubahan URL
    const checkForUrlChange = () => {
        const currentHref = document.location.href;
        if (oldHref !== currentHref) {
            console.log("URL changed from", oldHref, "to", currentHref);
            resetPredictions();
            sendVideoData();
            oldHref = currentHref; // Update oldHref to the new URL
        }
    };

    // Memeriksa URL setiap 4000 ms
    setInterval(checkForUrlChange, 3000);
};


// Fungsi untuk menangani event scroll
let lastScrollTop = 0;
const SCROLL_THRESHOLD = 350;

function handleScroll() {
    const st = window.scrollY || document.documentElement.scrollTop;
    if (Math.abs(lastScrollTop - st) >= SCROLL_THRESHOLD) {
        sendVideoData();
        lastScrollTop = st <= 0 ? 0 : st; // Update posisi scroll terakhir
    }
}

let isScrollListening = false;
function startScrollListening() {
    if (!isScrollListening) {
        window.addEventListener('scroll', handleScroll);
        isScrollListening = true; // Menandai bahwa listener sudah aktif
        console.log("Started listening to scroll.");
    }
}

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action === "startPrediction") {
//         setTimeout(() => {
//             sendVideoData(); // Jalankan prediksi setelah delay
//             startScrollListening(); // Mulai mendengarkan event scroll setelah memulai prediksi
//         }, 500);
//     } 
// });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startPrediction") {
        if (!isUrlObserving) {
            observeUrlChange(); // Mulai mengamati perubahan URL
            isUrlObserving = true; // Menandai bahwa pengamatan URL sudah dimulai
        }
        setTimeout(() => {
            sendVideoData(); // Jalankan prediksi setelah delay
            startScrollListening(); // Mulai mendengarkan event scroll setelah memulai prediksi
        }, 500);
    }
});








