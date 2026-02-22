import requests
from bs4 import BeautifulSoup
import json
import datetime
import re

# New Targets: Tres Hermanas and Burgers and Brew
RESTAURANTS = {
    "Preethi Indian Cuisine": "https://www.preethiindian.com/menu-1",
    "Jusco": "https://juscodavis.com/order/"
}

def scrape_menus():
    results = []
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    for name, url in RESTAURANTS.items():
        print(f"Scraping {name}...")
        try:
            response = requests.get(url, headers=headers, timeout=15)
            soup = BeautifulSoup(response.text, 'html.parser')
            menu_items = []

            # General strategy: Look for blocks of text that contain a "$"
            # This works for both sites because they list prices clearly.
            for element in soup.find_all(['li', 'p', 'div', 'h4']):
                text = element.get_text(separator=" ", strip=True)
                
                # Check if the line has a price (e.g., $15.95)
                price_match = re.search(r'\$\d+\.?\d*', text)
                
                if price_match:
                    price = price_match.group()
                    # The name is usually the text before the price
                    item_name = text.split(price)[0].strip("- ").strip()
                    
                    if item_name and len(item_name) < 60: # Avoid grabbing huge paragraphs
                        menu_items.append({
                            "name": item_name,
                            "price": price
                        })

            # Remove duplicates
            unique_menu = [i for n, i in enumerate(menu_items) if i not in menu_items[n + 1:]]

            results.append({
                "restaurant": name,
                "menu": unique_menu[:25] # Top 25 items
            })
            
        except Exception as e:
            print(f"Error scraping {name}: {e}")

    return results

def save_to_json(data):
    output = {
        "metadata": {"last_updated": str(datetime.datetime.now())},
        "restaurants": data
    }
    with open('davis_menus.json', 'w') as f:
        json.dump(output, f, indent=4)
    print("\nSuccess! 'davis_menus.json' updated with prices.")

if __name__ == "__main__":
    save_to_json(scrape_menus())