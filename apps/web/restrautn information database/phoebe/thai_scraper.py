import requests
from bs4 import BeautifulSoup
import json
import datetime
from urllib.parse import urljoin

def scrape_thai_canteen():
    url = "https://www.thaicanteendavis.com/menu"
    print(f"Scraping Thai Canteen...")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        soup = BeautifulSoup(response.text, 'html.parser')
        menu_data = []

        # Thai Canteen typically uses specific menu-item containers
        # We search for divs that look like food items
        items = soup.find_all(['div', 'li'], class_=lambda x: x and 'item' in x.lower())

        for item in items:
            # 1. Get the name
            name_tag = item.find(['h3', 'h4', 'strong', 'span'], class_=lambda x: x and 'title' in x.lower())
            if not name_tag:
                name_tag = item.find(['h3', 'h4', 'strong'])

            # 2. Get the price
            price_tag = item.find(class_=lambda x: x and 'price' in x.lower())
            
            # 3. Get the description
            desc_tag = item.find(['p', 'div'], class_=lambda x: x and 'description' in x.lower())

            # 4. Get the image
            img_tag = item.find('img')

            if name_tag:
                name = name_tag.get_text(strip=True)
                # Filter out empty or non-food headers
                if len(name) > 2 and len(name) < 60:
                    menu_data.append({
                        "name": name,
                        "price": price_tag.get_text(strip=True) if price_tag else "Check Site",
                        "description": desc_tag.get_text(strip=True) if desc_tag else "No description available.",
                        "image_url": urljoin(url, img_tag['src']) if img_tag and 'src' in img_tag.attrs else None
                    })

        # Remove duplicates
        unique_menu = [i for n, i in enumerate(menu_data) if i not in menu_data[n + 1:]]
        return unique_menu

    except Exception as e:
        print(f"Error: {e}")
        return []

def save_to_json(data):
    output = {
        "restaurant": "Thai Canteen",
        "location": "Davis, CA",
        "last_updated": str(datetime.datetime.now()),
        "menu": data
    }
    with open('thai_canteen_menu.json', 'w') as f:
        json.dump(output, f, indent=4)
    print(f"\nSuccess! Captured {len(data)} items in 'thai_canteen_menu.json'")

if __name__ == "__main__":
    items = scrape_thai_canteen()
    save_to_json(items)