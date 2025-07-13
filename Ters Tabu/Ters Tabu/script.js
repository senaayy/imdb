class TersTabuGame {
    constructor() {
        this.examples = [
            // Nostalji & Kültür Kartları
            {
                targetWord: "plak",
                forbiddenWords: ["müzik", "çalar", "eski"],
                hints: [
                    "Gramofonda dönen siyah disk",
                    "Vintage müzik dinleme formatı",
                    "İğne ile okunabilen ses kaydı"
                ]
            },
            {
                targetWord: "daktilo",
                forbiddenWords: ["yazı", "makine", "tuş"],
                hints: [
                    "Kağıda harfleri basan mekanik alet",
                    "Bilgisayar öncesi yazım aracı",
                    "'Ding' sesi çıkaran ofis eşyası"
                ]
            },
            {
                targetWord: "anahtar",
                forbiddenWords: ["kapı", "açmak", "kilit"],
                hints: [
                    "Cebinizde taşıdığınız metal parça",
                    "Güvenlik sistemi açıcısı",
                    "Kaybolunca eve giremezsiniz"
                ]
            },
            {
                targetWord: "çamaşır makinesi",
                forbiddenWords: ["temizlik", "deterjan", "çamaşır"],
                hints: [
                    "Banyoda ya da balkonda durur",
                    "Su ve elektrik kullanır",
                    "Kirlileri döndürerek arındırır"
                ]
            },
            {
                targetWord: "ipotek",
                forbiddenWords: ["kredi", "banka", "ev"],
                hints: [
                    "Gayrimenkul için uzun vadeli borç",
                    "Aylık ödeme planı gerektirir",
                    "Emlak satın alma finansmanı"
                ]
            },
            // Teknoloji & Modern Yaşam
            {
                targetWord: "resume",
                forbiddenWords: ["iş", "deneyim", "belge"],
                hints: [
                    "Kendinizi tanıtan resmi doküman",
                    "Mülakatlar için hazırlanan dosya",
                    "Kariyerinizi özetleyen kağıt"
                ]
            },
            {
                targetWord: "podcast",
                forbiddenWords: ["dinlemek", "ses", "program"],
                hints: [
                    "Dijital radyo alternatifi",
                    "Konuşma tabanlı içerik serisi",
                    "Spotify'da bulabileceğiniz format"
                ]
            },
            {
                targetWord: "influencer",
                forbiddenWords: ["sosyal", "medya", "takipçi"],
                hints: [
                    "İnternet fenomeni meslek sahibi",
                    "Marka işbirlikleri yapan kişi",
                    "Yaşam tarzıyla para kazanan"
                ]
            },
            {
                targetWord: "netflix",
                forbiddenWords: ["dizi", "film", "izlemek"],
                hints: [
                    "Kırmızı logosu olan platform",
                    "Aylık abonelik sistemi",
                    "'Binge-watching' yaptığınız yer"
                ]
            },
            {
                targetWord: "uber",
                forbiddenWords: ["taksi", "ulaşım", "şoför"],
                hints: [
                    "Aplikasyon tabanlı hizmet",
                    "Sarı taksinin dijital rakibi",
                    "Telefondan çağırdığınız araç"
                ]
            },
            // Psikoloji & Sosyal
            {
                targetWord: "terapist",
                forbiddenWords: ["doktor", "konuşmak", "ruh"],
                hints: [
                    "Duygusal sorunlara yardımcı olan uzman",
                    "Seanslarda karşı karşıya oturursunuz",
                    "Gizliliği olan mesleki görüşme"
                ]
            },
            {
                targetWord: "tükenmişlik",
                forbiddenWords: ["yorgunluk", "iş", "stres"],
                hints: [
                    "Modern yaşamın hastalığı",
                    "Motivasyon kaybı durumu",
                    "Fazla çalışmanın sonucu"
                ]
            },
            // Felsefi & Derin Konular
            {
                targetWord: "nükleer santral",
                forbiddenWords: ["enerji", "elektrik", "atom"],
                hints: [
                    "Çok tartışmalı güç kaynağı",
                    "Çernobil vakasının merkezi",
                    "Fisyon reaksiyonu kullanan tesis"
                ]
            },
            {
                targetWord: "kültürel yozlaşma",
                forbiddenWords: ["değer", "geleneksel", "bozulma"],
                hints: [
                    "Toplumsal değişimin negatif yönü",
                    "Kimlik kaybolması süreci",
                    "Modernleşmenin yan etkisi"
                ]
            }
        ];
        this.totalScore = 0;
        this.timer = null;
        this.timeLeft = 30;
        this.isStarted = false;
        this.initElements();
        this.bindEvents();
        this.setInitialState();
    }

    setInitialState() {
        this.isStarted = false;
        this.totalScore = 0;
        this.cardQueue = this.shuffle([...this.examples]);
        this.currentCardIndex = 0;
        this.hintBtn.disabled = true;
        this.guessBtn.disabled = true;
        this.guessInput.disabled = true;
        this.hintBtn.style.opacity = 0.5;
        this.guessBtn.style.opacity = 0.5;
        this.guessInput.style.opacity = 0.5;
        this.nextBtn.style.display = "none";
        this.passBtn.style.display = "none";
        this.hintDisplay.textContent = "İpucu almak için butona tıklayın";
        this.hintCounter.textContent = "Kalan ipucu hakkı: 3";
        this.timerEl.textContent = "30";
        this.message.textContent = "";
        this.startBtn.style.display = "inline-block";
        this.updateScore();
        this.updateCardCounter();
        this.hideGameOverScreen();
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    updateCardCounter() {
        const total = this.cardQueue.length;
        const current = Math.min(this.currentCardIndex + 1, total);
        this.cardCounterEl.textContent = `Kart: ${current}/${total}`;
    }

    startGame() {
        this.isStarted = true;
        this.totalScore = 0;
        this.cardQueue = this.shuffle([...this.examples]);
        this.currentCardIndex = 0;
        this.initGame();
        this.initUIForGame();
        this.updateCardCounter();
        this.hideGameOverScreen();
    }

    initGame() {
        if (this.currentCardIndex >= this.cardQueue.length) {
            this.showGameOverScreen();
            return;
        }
        const example = this.cardQueue[this.currentCardIndex];
        this.targetWord = example.targetWord;
        this.forbiddenWords = example.forbiddenWords;
        this.hints = example.hints;
        this.currentHint = 0;
        this.hintsRemaining = this.hints.length;
        this.attemptCount = 0;
        this.gameEnded = false;
        this.failedAfterHints = false;
        this.timeLeft = 30;
        this.clearTimer();
        this.startTimer();
        this.updateCardCounter();
    }

    initUIForGame() {
        this.updateForbiddenWords();
        this.updateHintCounter();
        this.updateStats();
        this.hintDisplay.textContent = "İpucu almak için butona tıklayın";
        this.hintBtn.disabled = false;
        this.hintBtn.style.opacity = 1;
        this.hintBtn.textContent = "💡 İpucu Al";
        this.guessBtn.textContent = "🎯 Tahmin Et";
        this.guessBtn.disabled = false;
        this.guessBtn.style.opacity = 1;
        this.guessInput.disabled = false;
        this.guessInput.style.opacity = 1;
        this.guessInput.value = "";
        this.nextBtn.style.display = "none";
        this.passBtn.style.display = "inline-block";
        this.startBtn.style.display = "none";
        this.updateScore();
        this.updateTimer();
        this.message.textContent = "";
        this.updateCardCounter();
    }

    initElements() {
        this.hintBtn = document.getElementById('hintBtn');
        this.hintCounter = document.getElementById('hintCounter');
        this.hintDisplay = document.getElementById('hintDisplay');
        this.guessInput = document.getElementById('guessInput');
        this.guessBtn = document.getElementById('guessBtn');
        this.message = document.getElementById('message');
        this.attemptCountEl = document.getElementById('attemptCount');
        this.hintUsedEl = document.getElementById('hintUsed');
        this.wordsList = document.getElementById('wordsList');
        this.nextBtn = document.getElementById('nextBtn');
        this.passBtn = document.getElementById('passBtn');
        this.totalScoreEl = document.getElementById('totalScore');
        this.timerEl = document.getElementById('timer');
        this.startBtn = document.getElementById('startBtn');
        this.cardCounterEl = document.getElementById('cardCounter');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.finalScoreEl = document.getElementById('finalScore');
        this.restartBtn = document.getElementById('restartBtn');
    }

    updateForbiddenWords() {
        this.wordsList.innerHTML = '';
        this.forbiddenWords.forEach(word => {
            const span = document.createElement('span');
            span.className = 'word-tag';
            span.textContent = word;
            this.wordsList.appendChild(span);
        });
    }

    bindEvents() {
        this.hintBtn.onclick = () => this.isStarted && this.showHint();
        this.guessBtn.onclick = () => this.isStarted && this.makeGuess();
        this.guessInput.onkeypress = (e) => {
            if (e.key === 'Enter' && this.isStarted) {
                this.makeGuess();
            }
        };
        this.nextBtn.onclick = () => this.isStarted && this.nextQuestion();
        this.passBtn.onclick = () => this.isStarted && !this.gameEnded && this.passQuestion();
        this.startBtn.onclick = () => this.startGame();
        this.restartBtn.onclick = () => this.setInitialState();
    }

    showHint() {
        if (this.hintsRemaining > 0 && this.currentHint < this.hints.length) {
            this.hintDisplay.textContent = this.hints[this.currentHint];
            this.currentHint++;
            this.hintsRemaining--;
            this.updateHintCounter();
            this.updateStats();
            if (this.hintsRemaining === 0) {
                this.hintBtn.disabled = true;
                this.hintBtn.textContent = "İpucu Hakkı Bitti";
            }
        }
    }

    makeGuess() {
        if (this.gameEnded) return;
        const guess = this.guessInput.value.trim().toLowerCase();
        if (!guess) {
            this.showMessage("Lütfen bir tahmin girin!", "warning");
            return;
        }
        this.attemptCount++;
        this.updateStats();
        if (this.forbiddenWords.includes(guess)) {
            this.showMessage(`"${guess}" yasaklı bir kelime! Başka bir kelime deneyin.`, "error");
            this.guessInput.value = "";
            return;
        }
        if (this.failedAfterHints) {
            this.showMessage(`Bilemediniz! Doğru cevap: ${this.targetWord}`, "error");
            this.gameEnded = true;
            this.guessBtn.textContent = "Oyun Bitti";
            this.guessBtn.disabled = true;
            this.hintBtn.disabled = true;
            this.nextBtn.style.display = "inline-block";
            this.passBtn.style.display = "none";
            this.clearTimer();
            return;
        }
        if (guess === this.targetWord) {
            let puan = 0;
            if (this.currentHint === 0) puan = 30;
            else if (this.currentHint === 1) puan = 20;
            else if (this.currentHint === 2) puan = 10;
            else puan = 10;
            this.totalScore += puan;
            this.updateScore();
            this.showMessage(`🎉 Tebrikler! Doğru tahmin ettiniz! (+${puan} puan)`, "success");
            this.gameEnded = true;
            this.guessBtn.textContent = "Oyun Bitti";
            this.guessBtn.disabled = true;
            this.hintBtn.disabled = true;
            this.nextBtn.style.display = "inline-block";
            this.passBtn.style.display = "none";
            this.clearTimer();
        } else {
            if (this.hintsRemaining === 0) {
                this.failedAfterHints = true;
                this.showMessage("Bilemediniz! Doğru cevap: " + this.targetWord, "error");
                this.gameEnded = true;
                this.guessBtn.textContent = "Oyun Bitti";
                this.guessBtn.disabled = true;
                this.hintBtn.disabled = true;
                this.nextBtn.style.display = "inline-block";
                this.passBtn.style.display = "none";
                this.clearTimer();
            } else {
                this.showMessage(`"${guess}" yanlış tahmin. Tekrar deneyin!`, "error");
            }
        }
        this.guessInput.value = "";
    }

    nextQuestion() {
        this.currentCardIndex++;
        this.initGame();
        this.initUIForGame();
    }

    passQuestion() {
        // Kartı sona ekle, index bir artır
        this.cardQueue.push(this.cardQueue[this.currentCardIndex]);
        this.currentCardIndex++;
        this.initGame();
        this.initUIForGame();
    }

    showMessage(text, type) {
        this.message.textContent = text;
        this.message.className = `message ${type}`;
        this.message.classList.add('show');
        setTimeout(() => {
            this.message.classList.remove('show');
        }, 3000);
    }

    updateHintCounter() {
        this.hintCounter.textContent = `Kalan ipucu hakkı: ${this.hintsRemaining}`;
    }

    updateStats() {
        this.attemptCountEl.textContent = this.attemptCount;
        this.hintUsedEl.textContent = this.hints.length - this.hintsRemaining;
    }

    updateScore() {
        this.totalScoreEl.textContent = this.totalScore;
    }

    startTimer() {
        this.updateTimer();
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            if (this.timeLeft <= 0) {
                this.clearTimer();
                this.showMessage(`Süre doldu! Doğru cevap: ${this.targetWord}`, "error");
                this.gameEnded = true;
                this.guessBtn.textContent = "Oyun Bitti";
                this.guessBtn.disabled = true;
                this.hintBtn.disabled = true;
                this.nextBtn.style.display = "inline-block";
                this.passBtn.style.display = "none";
            }
        }, 1000);
    }

    updateTimer() {
        this.timerEl.textContent = this.timeLeft;
    }

    clearTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    showGameOverScreen() {
        this.isStarted = false;
        this.gameOverScreen.style.display = "flex";
        this.finalScoreEl.textContent = this.totalScore;
    }

    hideGameOverScreen() {
        this.gameOverScreen.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TersTabuGame();
});