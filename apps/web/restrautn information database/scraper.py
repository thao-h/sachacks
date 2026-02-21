import requests
from bs4 import BeautifulSoup
import json
import datetime

# Targets: Woodstock's Pizza and Sophia's Thai Kitchen
RESTAURANTS = {
    "Woodstock's Pizza": "https://woodstocksdavis.com/menu/",
    "Sophia's Thai Kitchen": "https://sophiasthaikitchen.com/menu/"
}

def scrape_menus():
    results = []
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    for name, url in RESTAURANTS.items():
        print(f"Scraping {name}...")
        try:
            response = requests.get(url, headers=headers, timeout=15)
            soup = BeautifulSoup(response.text, 'html.parser')
            menu_items = []

            # WOODSTOCK'S PIZZA Logic
            if "woodstocks" in url:
                # They often use <h4> for item names and a specific class for prices
                for item in soup.find_all(['div', 'li'], class_=['menu-item', 'product']):
                    title = item.find(['h3', 'h4'])
                    price = item.find(class_=['price', 'amount'])
                    if title:
                        menu_items.append({
                            "name": title.get_text(strip=True),
                            "price": price.get_text(strip=True) if price else "Varies"
                        })

            # SOPHIA'S THAI KITCHEN Logic
            elif "sophias" in url:
                # Sophias uses clear <strong> tags for dish names
                for row in soup.find_all(['p', 'div']):
                    strong_tag = row.find('strong')
                    if strong_tag:
                        item_text = row.get_text(separator=" ", strip=True)
                        # Look for a price pattern (e.g. 14.50)
                        if any(char.isdigit() for char in item_text):
                            menu_items.append({
                                "name": strong_tag.get_text(strip=True),
                                "price": item_text.split()[-1] # Usually the last word is the price
                            })

            # Clean up the list
            unique_menu = [i for n, i in enumerate(menu_items) if i not in menu_items[n + 1:]]

            results.append({
                "restaurant": name,
                "menu": unique_menu if unique_menu else "No items found - Site layout may have changed."
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
    print("\nFile 'davis_menus.json' updated!")

if __name__ == "__main__":
    data = scrape_menus()
    save_to_json(data)