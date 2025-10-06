# 🎬 Akıllı Film Öneri Sistemi

Bu proje, hem kriter bazlı filtreleme hem de doğal dil işleme (NLP) destekli anlamsal arama yeteneklerini birleştiren gelişmiş bir film öneri sistemidir.

Kullanıcılar, sevdikleri **film türlerini**, **yönetmenleri** ve **oyuncuları** seçerek veya yalnızca akıllarındaki **film konusunu yazarak** kişiselleştirilmiş film önerileri alabilirler.

🧪 **Uygulamayı Canlı Deneyin:**  
[👉 Hugging Face Spaces Linki](https://huggingface.co/spaces/ssenaay/imdb)  

---

## 📖 Proje Açıklaması

Günümüzde binlerce film arasından kendimize uygun bir film seçmek zor olabilir. Bu sistem, bu sorunu çözmek için iki güçlü yaklaşımı bir araya getirir:

### 🔎 Detaylı Filtreleme
- Tür, yönetmen, oyuncu ve minimum IMDb puanına göre arama yapmanızı sağlar.

### 🤖 Anlamsal Arama (NLP)
- **Sentence-Transformers** modeli ile yazdığınız metni anlayarak benzer içerikte filmler önerir.
- Örneğin: "uzayda geçen bir hayatta kalma mücadelesi" gibi doğal dilde bir sorguyu işler.

---

## ✨ Temel Özellikler

- 🎯 **Çoklu Filtreleme:** Tür, yönetmen ve oyunculara göre filtreleme
- 🧠 **NLP Destekli Arama:** Serbest metinle film arama
- 📊 **Akıllı Sıralama:** Benzerlik skoru, IMDb puanı ve oy sayısına göre sıralama
- 🖥️ **Modern Arayüz:** Gradio tabanlı kullanıcı dostu arayüz

---

## 🛠️ Kullanılan Teknolojiler

- **Programlama Dili:** Python 3
- **Web Arayüzü:** Gradio
- **Veri İşleme:** Pandas, NumPy
- **Anlamsal Arama:** Sentence-Transformers (all-MiniLM-L6-v2), PyTorch
- **Deployment:** Hugging Face Spaces

---

## 🚀 Kurulum Adımları

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/senaayy/imdb
cd imdb
```
### 2. Sanal Ortam Oluşturun ve Gerekli Kütüphaneleri Kurun  
```bash
python -m venv venv
source venv/bin/activate  # Windows için: venv\Scripts\activate
pip install -r requirements.txt
```
##### requirements.txt içeriği:  
```bash
pandas
numpy
gradio
sentence-transformers
torch
```
### 3. Gerekli Dosyaları Edinin  
Projede çalışabilmesi için aşağıdaki iki dosya gereklidir:

*imdb-top-rated-movies-user-rated.csv: Film verilerini içeren CSV dosyası

*film_embeddings.npy: Filmlerin embedding vektörlerini içeren NumPy dosyası  
### 4. Uygulamayı Başlatın  
```bash
python app.py
```
Tarayıcınızda şu adresi açarak uygulamayı kullanmaya başlayabilirsiniz:
http://127.0.0.1:7860  
## 👩‍💻 Geliştiriciler
- Ayşe Mutluay – (https://github.com/AyseMutluay)
- Sena Ay – (https://github.com/senaayy)

