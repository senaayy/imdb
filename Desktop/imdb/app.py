import pandas as pd
import numpy as np
import gradio as gr
import os
from sentence_transformers import SentenceTransformer, util 
import torch 
import re

print("--- Film Öneri Sistemi Başlatılıyor (Popülerlik Sıralaması ve Yeniden Tasarlanmış Arayüz ile) ---")

# --- ADIM 1: Veri Seti Yükleniyor ve Keşfediliyor ---
print("ADIM 1: Veri Seti Yükleniyor ve Keşfediliyor...")

csv_file_name = "imdb-top-rated-movies-user-rated.csv" 
file_path = os.path.join(".", csv_file_name) 

if not os.path.exists(file_path):
    print(f"HATA: '{csv_file_name}' dosyası '{file_path}' yolunda bulunamadı. Lütfen CSV dosyasını Space'e yüklediğinizden emin olun.")
    exit(1)

try:
    df = pd.read_csv(file_path)
    print(f"'{csv_file_name}' başarıyla yüklendi. Toplam {len(df)} film bulundu.")
except Exception as e:
    print(f"HATA: CSV dosyası yüklenirken hata oluştu: {e}")
    exit(1)
print("ADIM 1: Veri Seti Keşfi Tamamlandı.")


# --- ADIM 2: Veri Temizliği ve Ön İşleme ---
print("\nADIM 2: Veri Temizliği ve Ön İşleme Başlıyor...")

df_filtered = df[['Title', 'IMDb Rating', 'Tags', 'Director', 'Stars', 'Votes', 'Description', 'Poster URL']].copy() 

df_filtered['Stars'].fillna('', inplace=True) 
df_filtered['Description'].fillna('', inplace=True) 
df_filtered['Poster URL'].fillna('', inplace=True) 

genre_mapping = {
    'action': ['action', 'action epic', 'gun fu', 'one-person army action', 'car action', 'kung fu', 'martial arts', 'martial-arts'],
    'adventure': ['adventure', 'adventure epic', 'desert adventure', 'animal adventure', 'space adventure', 'swashbuckler'],
    'comedy': ['comedy', 'romantic comedy', 'buddy comedy', 'sitcom', 'black comedy', 'satire', 'spoof', 'parody', 'slapstick', 'screwball comedy', 'dark comedy', 'body swap comedy'],
    'drama': ['drama', 'period drama', 'cop drama', 'legal drama', 'medical drama', 'teen drama', 'psychological drama', 'melodrama', 'historical drama', 'biography', 'romantic drama', 'showbiz drama', 'tragedy'],
    'thriller': ['thriller', 'crime thriller', 'spy thriller', 'psychological thriller', 'mystery thriller', 'political thriller', 'conspiracy thriller', 'erotic thriller', 'cyber thriller', 'suspense'],
    'sci-fi': ['sci-fi', 'space sci-fi', 'dystopian sci-fi', 'cyberpunk', 'alien invasion', 'mutant', 'robot', 'post-apocalyptic', 'time travel'],
    'fantasy': ['fantasy', 'dark fantasy', 'sword & sorcery', 'fairy tale', 'epic fantasy'],
    'horror': ['horror', 'slasher', 'supernatural horror', 'body horror', 'zombie', 'monster', 'vampire', 'werewolf', 'ghost'],
    'mystery': ['mystery', 'suspense mystery', 'cozy mystery', 'whodunnit', 'detective', 'police procedural'],
    'crime': ['crime', 'gangster', 'heist', 'mob', 'true crime'],
    'romance': ['romance', 'romantic comedy', 'romantic drama'],
    'animation': ['animation', 'adult animation', 'anime', 'computer animation', 'drawn animation', 'stop-motion animation'],
    'family': ['family', 'kids'],
    'western': ['western', 'classic western', 'neo-western'],
    'war': ['war', 'war drama'],
    'history': ['history', 'historical drama', 'biography'],
    'music': ['music', 'musical', 'classic musical', 'concert'],
    'documentary': ['documentary', 'docudrama', 'mockumentary']
}

reverse_genre_map = {}
for main_genre, sub_genres in genre_mapping.items():
    for sub_genre in sub_genres:
        reverse_genre_map[sub_genre] = main_genre

def map_to_main_genres(tag_list):
    main_genres = set()
    for tag in tag_list:
        if tag in reverse_genre_map:
            main_genres.add(reverse_genre_map[tag]) 
    return list(main_genres)

def clean_and_split(text_series):
    if pd.isna(text_series):
        return []
    
    item = str(text_series)
    item = item.replace('"', '').replace("'", '').strip()
    item = item.replace('sci, fi', 'sci-fi') 
    
    split_items = [s.strip().lower() for s in item.split(',') if s.strip()]
    return split_items


df_filtered['Tags_cleaned_raw'] = df_filtered['Tags'].apply(clean_and_split)
df_filtered['Director_cleaned'] = df_filtered['Director'].apply(clean_and_split)
df_filtered['Stars_cleaned'] = df_filtered['Stars'].apply(clean_and_split)

df_filtered['Tags_cleaned'] = df_filtered['Tags_cleaned_raw'].apply(map_to_main_genres)


def convert_votes_to_numeric(votes_str):
    if isinstance(votes_str, str):
        votes_str = votes_str.replace(",", "") 
        if 'K' in votes_str:
            return float(votes_str.replace('K', '')) * 1000
        elif 'M' in votes_str:
            return float(votes_str.replace('M', '')) * 1_000_000
    try: 
        return float(votes_str)
    except ValueError:
        return np.nan 

df_filtered['Votes_numeric'] = df_filtered['Votes'].apply(convert_votes_to_numeric)
df_filtered.drop('Votes', axis=1, inplace=True)
df_filtered.dropna(subset=['Votes_numeric'], inplace=True) 

df_filtered['Combined_Text'] = df_filtered['Title'] + ". " + \
                               df_filtered['Description'] + ". " + \
                               df_filtered['Tags_cleaned'].apply(lambda x: ", ".join(x)) + ". " + \
                               df_filtered['Director_cleaned'].apply(lambda x: ", ".join(x)) + ". " + \
                               df_filtered['Stars_cleaned'].apply(lambda x: ", ".join(x))

print("\nADIM 2: Veri Temizliği ve Ön İşleme Tamamlandı.")


# --- ADIM 3: NLP Modelini Yükleme ve ÖNCEDEN OLUŞTURULMUŞ Embedding'leri Yükleme ---
print("\nADIM 3: NLP Modelini Yükleniyor ve Önceden Oluşturulmuş Embedding'ler Yükleniyor...")

model_name = 'sentence-transformers/all-MiniLM-L6-v2'
try:
    sentence_model = SentenceTransformer(model_name)
    print(f"'{model_name}' modeli başarıyla yüklendi.")
except Exception as e:
    print(f"HATA: Sentence Transformer modeli yüklenirken hata oluştu: {e}")
    exit(1)

embeddings_file_path = os.path.join(".", "film_embeddings.npy")
if not os.path.exists(embeddings_file_path):
    print(f"HATA: '{embeddings_file_path}' dosyası bulunamadı. Lütfen Space'e yüklediğinizden emin olun.")
    exit(1)

try:
    film_embeddings = torch.from_numpy(np.load(embeddings_file_path))
    print("Film embedding'leri başarıyla 'film_embeddings.npy' dosyasından yüklendi.")
except Exception as e:
    print(f"HATA: film_embeddings.npy yüklenirken hata oluştu: {e}")
    exit(1)

print("ADIM 3: NLP Modelini Yükleme ve Film Embedding'lerini Oluşturma Tamamlandı.")


# --- ADIM 4: Film Öneri Sistemi Mantığını Oluşturma (Popüler Yönetmen/Oyuncu Sıralaması Eklendi) ---
print("\nADIM 4: Film Öneri Sistemi Mantığı Oluşturuluyor...")

# --- YENİ EKLENTİ: Popüler Yönetmen/Oyuncu Listelerini Oluşturma ---
director_popularity = {}
for index, row in df_filtered.iterrows():
    for director in row['Director_cleaned']:
        director_popularity[director] = director_popularity.get(director, 0) + row['Votes_numeric']

star_popularity = {}
for index, row in df_filtered.iterrows():
    for star in row['Stars_cleaned']:
        star_popularity[star] = star_popularity.get(star, 0) + row['Votes_numeric']

# all_tags listesini, sadece eşlenmiş ana türlerden oluşturalım
all_tags = sorted(list(set([tag for sublist in df_filtered['Tags_cleaned'] for tag in sublist if tag in genre_mapping])))

# Popülerliğe göre sıralanmış yönetmen ve oyuncu listeleri
# Popülerlik skoruna (Votes_numeric toplamı) göre azalan sırada sırala
all_directors = sorted(list(director_popularity.keys()), key=lambda d: director_popularity[d], reverse=True)
all_stars = sorted(list(star_popularity.keys()), key=lambda s: star_popularity[s], reverse=True)
# --- YENİ EKLENTİ SONU ---


def get_movie_recommendations(selected_tags, selected_directors, selected_stars, min_imdb_rating_slider, num_recommendations_slider, search_text=""):
    
    print(f"\n--- Öneri İsteği ---")
    print(f"Seçilen Türler: {selected_tags}")
    print(f"Seçilen Yönetmenler: {selected_directors}")
    print(f"Seçilen Oyuncular: {selected_stars}")
    print(f"Minimum IMDb Puanı: {min_imdb_rating_slider}")
    print(f"Öneri Sayısı: {num_recommendations_slider}")
    print(f"Arama Metni: '{search_text}'")
    print(f"Başlangıç DataFrame boyutu: {len(df_filtered)} (Poster URL'si dahil)")

    selected_tags_list = list(selected_tags) if selected_tags else []
    selected_directors_list = list(selected_directors) if selected_directors else []
    selected_stars_list = list(selected_stars) if selected_stars else []

    recommendations_df = df_filtered.copy()
    
    recommendations_df = recommendations_df[recommendations_df['IMDb Rating'] >= min_imdb_rating_slider]
    print(f"IMDb Puanı filtrelemesi sonrası: {len(recommendations_df)} film")
    
    if selected_tags_list:
        recommendations_df = recommendations_df[
            recommendations_df['Tags_cleaned'].apply(lambda x: any(tag in x for tag in selected_tags_list))
        ]
        print(f"Tür filtrelemesi sonrası: {len(recommendations_df)} film")
    
    if selected_directors_list:
        recommendations_df = recommendations_df[
            recommendations_df['Director_cleaned'].apply(lambda x: any(director in x for director in selected_directors_list))
        ]
        print(f"Yönetmen filtrelemesi sonrası: {len(recommendations_df)} film")
        
    if selected_stars_list:
        recommendations_df = recommendations_df[
            recommendations_df['Stars_cleaned'].apply(lambda x: any(star in x for star in selected_stars_list))
        ]
        print(f"Oyuncu filtrelemesi sonrası: {len(recommendations_df)} film")
            
    if search_text and len(recommendations_df) > 0:
        print(f"'{search_text}' için NLP benzerlik araması yapılıyor...")
        
        try:
            query_embedding = sentence_model.encode(search_text, convert_to_tensor=True)
        except Exception as e:
            print(f"HATA: Arama metni embedding'i oluşturulurken hata oluştu: {e}")
            return "Arama metni işlenirken bir hata oluştu. Lütfen tekrar deneyin."
        
        filtered_indices = recommendations_df.index.tolist()
        if not filtered_indices or len(film_embeddings) == 0:
            print("HATA: Filtrelenmiş film indeksi bulunamadı veya embedding'ler boş.")
            return "Filtreleme sonrası film bulunamadı."


        try:
            current_film_embeddings = film_embeddings[filtered_indices]
            cosine_scores = util.cos_sim(query_embedding, current_film_embeddings)[0]
            recommendations_df['Similarity_Score'] = cosine_scores.cpu().numpy() 
            recommendations_df = recommendations_df.sort_values(
                by=['Similarity_Score', 'IMDb Rating', 'Votes_numeric'], 
                ascending=[False, False, False] 
            ).reset_index(drop=True)
            print(f"NLP benzerlik filtrelemesi sonrası: {len(recommendations_df)} film")
        except Exception as e:
            print(f"HATA: NLP benzerlik hesaplanırken hata oluştu: {e}")
            return "Benzerlik hesaplanırken bir hata oluştu. Lütfen tekrar deneyin."

    if not search_text: 
        recommendations_df = recommendations_df.sort_values(
            by=['IMDb Rating', 'Votes_numeric'], 
            ascending=[False, False]
        ).reset_index(drop=True)
    
    top_recommendations = recommendations_df.head(num_recommendations_slider)
    
    if top_recommendations.empty:
        print("Kriterlere uygun film bulunamadı.")
        return "Üzgünüz, seçtiğiniz kriterlere uygun film bulunamadı."
    else:
        print(f"Toplam {len(top_recommendations)} öneri bulundu.")
        html_output = ""
        for idx, row in top_recommendations.iterrows():
            directors_str = ", ".join([d.title() for d in row['Director_cleaned']])
            stars_str = ", ".join([s.title() for s in row['Stars_cleaned']])
            tags_str = ", ".join([t.title() for t in row['Tags_cleaned']])

            similarity_info = ""
            if 'Similarity_Score' in row and search_text:
                similarity_info = f", Benzerlik: {row['Similarity_Score']:.2f}"
            
            poster_html = f"""
            <div style="width: 120px; height: 180px; background-color: #2a2a2a; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #888; font-size: 0.8em; line-height: 1.2; padding: 5px;">
                <span style="font-weight: bold; margin-bottom: 5px;">{row['Title']}</span>
                <span>Poster Yok</span>
            </div>
            """

            html_output += f"""
            <div style="display: flex; margin-bottom: 20px; border: 1px solid #333; padding: 10px; border-radius: 8px; background-color: #1a1a1a;">
                <div style="flex-shrink: 0; margin-right: 15px;">
                    {poster_html}
                </div>
                <div style="flex-grow: 1;">
                    <h3 style="margin-top: 0px; margin-bottom: 5px; color: #f39c12;">{row['Title']}</h3>
                    <p style="margin-bottom: 5px; color: #eee;">IMDb: <b>{row['IMDb Rating']:.1f}</b> ⭐, Oylar: <b>{int(row['Votes_numeric']):,}</b> 🗳️{similarity_info}</p>
                    <p style="margin-bottom: 5px; color: #bbb;">Yönetmen: {directors_str if directors_str else 'Bilinmiyor'}</p>
                    <p style="margin-bottom: 5px; color: #bbb;">Oyuncular: {stars_str if stars_str else 'Bilinmiyor'}</p>
                    <p style="margin-bottom: 0px; color: #bbb;">Türler: {tags_str if tags_str else 'Bilinmiyor'}</p>
                </div>
            </div>
            """
        return html_output

print("\nADIM 4: Film Öneri Sistemi Mantığı Oluşturuldu.")


# --- ADIM 5: Gradio Web Arayüzü Oluşturma ---
print("\nADIM 5: Gradio Web Arayüzü Oluşturuluyor (Yeniden Tasarlanmış Arayüz ve Popülerlik Sıralaması)...")

with gr.Blocks(theme=gr.themes.Soft(), css="""
    /* Custom CSS */
    .gradio-container { max-width: 1200px !important; font-family: 'Segoe UI', sans-serif; }
    h1 { color: #f39c12; text-align: center; }
    h3 { color: #eee; }
    .gr-button.gr-button-primary { background-color: #f39c12 !important; border-color: #f39c12 !important; }
    .gr-button.gr-button-primary:hover { background-color: #e67e22 !important; border-color: #e67e22 !important; }
    .gr-checkbox-group label { color: #ccc; }
    .gr-dropdown, .gr-slider, .gr-textbox { background-color: #2c2c2c; color: #eee; border-color: #555; }
    .gr-dropdown-item { color: #eee; }
    /* CheckboxGroup/Dropdown için sarı vurgu rengi */
    .gr-checkbox-group input[type='checkbox']:checked + label {
        background-color: #f39c12 !important;
        border-color: #f39c12 !important;
        color: #1a1a1a !important; /* Koyu metin rengi */
    }
    .gr-checkbox-group input[type='checkbox'] + label {
        background-color: #333;
        color: #eee;
        border: 1px solid #555;
    }
    .gr-checkbox-group input[type='checkbox'] + label:hover {
        background-color: #444;
    }
    .gr-dropdown-item.selected {
        background-color: #f39c12 !important;
        color: #1a1a1a !important;
    }
    .gr-dropdown-item:hover {
        background-color: #e67e22 !important;
        color: #1a1a1a !important;
    }
""") as demo:
    gr.Markdown(
        """
        # 🎬 Film Öneri Sistemi
        Favori film özelliklerinizi seçin, yüksek IMDb puanına sahip filmleri keşfedin!
        İstediğiniz bir film veya konu hakkında yazın, benzerlerini de bulalım.
        """
    )
    
    # Yeni yerleşim düzeni: Öneriler üstte, girişler altta
    with gr.Row():
        with gr.Column(scale=2): # Öneriler sütununu daha geniş yaptık
            gr.Markdown("### Önerilen Filmler:")
            output_html = gr.HTML(label="Önerileriniz burada listelenecektir.", value="<p style='text-align: center; color: #bbb;'>Henüz bir öneri yapılmadı. Özellikleri seçip butona tıklayın!</p>")
    
    with gr.Row():
        with gr.Column(scale=1):
            gr.Markdown("### Film Özelliklerini Seçin:")
            
            tags_input = gr.CheckboxGroup(
                label="Film Türleri", 
                choices=all_tags, 
                value=['action', 'drama'], # Varsayılan değerler
                interactive=True
            )
            
            directors_input = gr.Dropdown(
                label="Yönetmenler", 
                choices=all_directors, # Popülerliğe göre sıralanmış liste
                multiselect=True,
                allow_custom_value=False,
                interactive=True
            )

            stars_input = gr.Dropdown(
                label="Oyuncular", 
                choices=all_stars, # Popülerliğe göre sıralanmış liste
                multiselect=True,
                allow_custom_value=False,
                interactive=True
            )
            
            min_imdb_rating_slider = gr.Slider(
                minimum=df_filtered['IMDb Rating'].min(), 
                maximum=df_filtered['IMDb Rating'].max(), 
                step=0.1, 
                value=7.6, 
                label="Minimum IMDb Puanı"
            )

            num_recommendations_slider = gr.Slider(
                minimum=1, 
                maximum=20, 
                step=1, 
                value=10, 
                label="Öneri Sayısı"
            )

            search_text_input = gr.Textbox(
                label="Film Adı veya Konu Hakkında Ara (NLP Tabanlı Benzerlik)",
                placeholder="Örneğin: Batman, uzay filmi, zamanda yolculuk..."
            )
            
            recommend_btn = gr.Button("🚀 Film Önerilerini Getir", variant="primary", size="lg")
        
    recommend_btn.click(
        fn=get_movie_recommendations,
        inputs=[tags_input, directors_input, stars_input, min_imdb_rating_slider, num_recommendations_slider, search_text_input],
        outputs=output_html
    )

    gr.Examples(
        examples=[
            [['action'], [], [], 7.6, 5, ""], 
            [['comedy', 'drama'], [], [], 7.8, 3, ""], 
            [[], ['christopher nolan'], [], 8.0, 5, ""], 
            [[], [], ['leonardo dicaprio'], 7.8, 3, ""], 
            [[], [], [], 8.0, 5, "kahramanlık ve bilim kurgu"], 
            [['action', 'sci-fi'], [], [], 7.8, 5, "uzaylı istilası ve kaçış"], 
        ],
        inputs=[tags_input, directors_input, stars_input, min_imdb_rating_slider, num_recommendations_slider, search_text_input],
        outputs=output_html, 
        fn=get_movie_recommendations,
        label="Örnek Önerileri Deneyin"
    )
    
    gr.Markdown(
        """
        ---
        ### ℹ️ Nasıl Kullanılır?
        1.  **Film Türleri, Yönetmenler ve Oyuncular** bölümlerinden istediğiniz filtreleri seçin (birden fazla seçim yapabilirsiniz).
        2.  **Minimum IMDb Puanı** ve **Öneri Sayısı** çubuklarını ayarlayın.
        3.  İsterseniz **"Film Adı veya Konu Hakkında Ara"** kutucuğuna bir film adı, konu veya anahtar kelime yazın.
        4.  **"🚀 Film Önerilerini Getir"** butonuna tıklayın.
        5.  Öneriler üst panelde görünecektir!
        """
    )

demo.launch(share=True)
print("\nADIM 5: Gradio Web Arayüzü Başlatıldı.")     