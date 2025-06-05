import json
import sqlite3
import os

DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', '정제 데이터.json')
DB_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'foods.db')

def create_table(cur):
    cur.execute('''
    CREATE TABLE IF NOT EXISTS foods (
        id TEXT PRIMARY KEY,
        name TEXT,
        type TEXT,
        category TEXT,
        cuisine TEXT,
        calories REAL,
        protein REAL,
        fat REAL,
        carbs REAL,
        sodium REAL,
        sugar REAL,
        fiber REAL,
        saturatedFat REAL,
        cholesterol REAL,
        transFat REAL,
        calcium REAL,
        iron REAL,
        vitaminC REAL,
        ingredients TEXT,
        tags TEXT,
        allergies TEXT,
        price REAL,
        score REAL,
        popularity INTEGER,
        rating REAL,
        brand TEXT
    )
    ''')

def load_data():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def main():
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    create_table(cur)

    foods = load_data()
    for item in foods:
        cur.execute(
            '''INSERT OR REPLACE INTO foods VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
            (
                item.get('id'),
                item.get('name'),
                item.get('type'),
                item.get('category'),
                item.get('cuisine'),
                item.get('calories'),
                item.get('protein'),
                item.get('fat'),
                item.get('carbs'),
                item.get('sodium'),
                item.get('sugar'),
                item.get('fiber'),
                item.get('saturatedFat'),
                item.get('cholesterol'),
                item.get('transFat'),
                item.get('calcium'),
                item.get('iron'),
                item.get('vitaminC'),
                ','.join(item.get('ingredients', [])),
                ','.join(item.get('tags', [])),
                ','.join(item.get('allergies', [])),
                item.get('price'),
                item.get('score'),
                item.get('popularity'),
                item.get('rating'),
                item.get('brand')
            )
        )
    conn.commit()
    conn.close()
    print(f"Saved {len(foods)} foods to {DB_FILE}")

if __name__ == '__main__':
    main()
