
document.getElementById('toggle').addEventListener('click', function() {
    // Periksa tab aktif untuk memastikan itu adalah YouTube
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const url = tabs[0].url;
        if (!url.includes("youtube.com")) {
            // Jika URL tidak mengandung "youtube.com", tampilkan alert
            alert('This extension is only functional on YouTube.');
        } else {
            // Jika di YouTube, tambahkan 'is-loading' pada tombol untuk menunjukkan proses loading
            var button = document.getElementById('toggle');
            button.classList.add('is-loading');

            // Kirim pesan ke content script untuk memulai prediksi
            chrome.tabs.sendMessage(tabs[0].id, {action: "startPrediction"});
        }
    });
});

