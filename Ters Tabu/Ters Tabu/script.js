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
        this.currentExampleIndex = null;
        this.failedAfterHints = false;
        this.initGame();
        this.initElements();
        this.bindEvents();
    }

    getRandomExampleIndex() {
        let idx;
        do {
            idx = Math.floor(Math.random() * this.examples.length);
        } while (this.examples.length > 1 && idx === this.currentExampleIndex);
        return idx;
    }

    initGame() {
        this.currentExampleIndex = this.getRandomExampleIndex();
        const example = this.examples[this.currentExampleIndex];
        this.targetWord = example.targetWord;
        this.forbiddenWords = example.forbiddenWords;
        this.hints = example.hints;
        this.currentHint = 0;
        this.hintsRemaining = this.hints.length;
        this.attemptCount = 0;
        this.gameEnded = false;
        this.failedAfterHints = false;
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
        this.updateForbiddenWords();
        this.updateHintCounter();
        this.updateStats();
        this.hintDisplay.textContent = "İpucu almak için butona tıklayın";
        this.hintBtn.disabled = false;
        this.hintBtn.textContent = "💡 İpucu Al";
        this.guessBtn.textContent = "🎯 Tahmin Et";
        this.guessBtn.disabled = false;
        this.guessInput.value = "";
        this.nextBtn.style.display = "none";
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
        this.hintBtn.onclick = () => this.showHint();
        this.guessBtn.onclick = () => this.makeGuess();
        this.guessInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                this.makeGuess();
            }
        };
        this.nextBtn.onclick = () => this.nextQuestion();
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
            return;
        }
        if (guess === this.targetWord) {
            this.showMessage("🎉 Tebrikler! Doğru tahmin ettiniz!", "success");
            this.gameEnded = true;
            this.guessBtn.textContent = "Oyun Bitti";
            this.guessBtn.disabled = true;
            this.hintBtn.disabled = true;
            this.nextBtn.style.display = "inline-block";
        } else {
            if (this.hintsRemaining === 0) {
                this.failedAfterHints = true;
                this.showMessage("Bilemediniz! Doğru cevap: " + this.targetWord, "error");
                this.gameEnded = true;
                this.guessBtn.textContent = "Oyun Bitti";
                this.guessBtn.disabled = true;
                this.hintBtn.disabled = true;
                this.nextBtn.style.display = "inline-block";
            } else {
                this.showMessage(`"${guess}" yanlış tahmin. Tekrar deneyin!`, "error");
            }
        }
        this.guessInput.value = "";
    }

    nextQuestion() {
        this.initGame();
        this.initElements();
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
}

document.addEventListener('DOMContentLoaded', () => {
    new TersTabuGame();
});