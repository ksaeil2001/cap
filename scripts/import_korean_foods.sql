-- 기존 food_nutrients 테이블의 참조를 삭제
TRUNCATE food_nutrients CASCADE;

-- 기존 meal_items 테이블의 참조를 삭제
TRUNCATE meal_items CASCADE;

-- foods 테이블 데이터 초기화
DELETE FROM foods;

-- 테이블 시퀀스 초기화
ALTER SEQUENCE foods_id_seq RESTART WITH 1;

-- 한국어 음식 데이터 삽입 (일부 샘플)
INSERT INTO foods (name, category, calories, price, image, main_nutrient_id)
VALUES
  ('버거 에그불고기 버거', 'Burger', 236.0, 8500, 'https://source.unsplash.com/random/500x300/?korean,burger', 1),
  ('버거 오리지널더블 버거', 'Burger', 260.0, 7900, 'https://source.unsplash.com/random/500x300/?korean,double,burger', 2),
  ('버거 오리지널싱글 버거', 'Burger', 221.0, 6500, 'https://source.unsplash.com/random/500x300/?korean,single,burger', 1),
  ('버거 와규에디션', 'Burger', 269.0, 9200, 'https://source.unsplash.com/random/500x300/?korean,wagyu,burger', 3),
  ('버거 와퍼 버거', 'Burger', 223.0, 7200, 'https://source.unsplash.com/random/500x300/?korean,whopper,burger', 2),
  ('버거 와퍼주니어 버거', 'Burger', 253.0, 6300, 'https://source.unsplash.com/random/500x300/?korean,junior,burger', 1),
  ('버거 인크레더블 버거', 'Burger', 240.0, 8800, 'https://source.unsplash.com/random/500x300/?korean,incredible,burger', 3),
  ('버거 직화버섯소불고기 버거', 'Burger', 239.0, 7800, 'https://source.unsplash.com/random/500x300/?korean,bulgogi,burger', 2),
  ('버거 직화소불고기버거', 'Burger', 257.0, 7600, 'https://source.unsplash.com/random/500x300/?korean,bulgogi,burger', 1),
  ('버거 징거 더블다운맥스 버거', 'Burger', 216.0, 9400, 'https://source.unsplash.com/random/500x300/?korean,zinger,burger', 3),
  ('김치찌개', 'Soup', 180.0, 6000, 'https://source.unsplash.com/random/500x300/?kimchi,stew', 1),
  ('된장찌개', 'Soup', 165.0, 5500, 'https://source.unsplash.com/random/500x300/?soybean,paste,soup', 2),
  ('비빔밥', 'Rice', 510.0, 7500, 'https://source.unsplash.com/random/500x300/?bibimbap', 3),
  ('떡볶이', 'Rice', 380.0, 4500, 'https://source.unsplash.com/random/500x300/?tteokbokki', 2),
  ('불고기', 'Meat', 350.0, 10000, 'https://source.unsplash.com/random/500x300/?bulgogi', 1),
  ('갈비찜', 'Meat', 450.0, 12000, 'https://source.unsplash.com/random/500x300/?galbi', 1),
  ('삼겹살', 'Meat', 550.0, 15000, 'https://source.unsplash.com/random/500x300/?samgyeopsal', 1),
  ('냉면', 'Noodle', 420.0, 8000, 'https://source.unsplash.com/random/500x300/?naengmyeon', 2),
  ('잡채', 'Noodle', 340.0, 7000, 'https://source.unsplash.com/random/500x300/?japchae', 3),
  ('김밥', 'Rice', 320.0, 3500, 'https://source.unsplash.com/random/500x300/?kimbap', 2);