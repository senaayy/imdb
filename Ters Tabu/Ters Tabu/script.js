class TersTabuGame {
    constructor() {
        this.targetWord = "armut"; // Doğru cevap
        this.forbiddenWords = ["elma", "kırmızı", "meyve"];
        this.hints = [
            "Bu bir yenilecek şeydir",
            "Ağaçta yetişir ve yeşil renkte olabilir",
            "Başharfi 'a' ile başlar ve 5 harflidir"
        ];
        this.currentHint = 0;
        this.hintsRemaining = 3;
        this.attemptCount = 0;
        this.gameEnded = false;
        
        this.initElements();
        this.bindEvents();
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
    }

    bindEvents() {
        this.hintBtn.addEventListener('click', () => this.showHint());
        this.guessBtn.addEventListener('click', () => this.makeGuess());
        this.guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.makeGuess();
            }
        });
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

        // Yasaklı kelime kontrolü
        if (this.forbiddenWords.includes(guess)) {
            this.showMessage(`"${guess}" yasaklı bir kelime! Başka bir kelime deneyin.`, "error");
            this.guessInput.value = "";
            return;
        }

        // Doğru cevap kontrolü
        if (guess === this.targetWord) {
            this.showMessage("🎉 Tebrikler! Doğru tahmin ettiniz!", "success");
            this.gameEnded = true;
            this.guessBtn.textContent = "Oyun Bitti";
            this.guessBtn.disabled = true;
            this.hintBtn.disabled = true;
        } else {
            this.showMessage(`"${guess}" yanlış tahmin. Tekrar deneyin!`, "error");
        }

        this.guessInput.value = "";
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
        this.hintUsedEl.textContent = 3 - this.hintsRemaining;
    }
}

// Oyunu başlat
document.addEventListener('DOMContentLoaded', () => {
    new TersTabuGame();
});