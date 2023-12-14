INSERT INTO user (username, email, password_hash, role_id) VALUES ('super-admin', 'superadmin@example.com', SHA2('password3', 256),  1);
INSERT INTO user (username, email, password_hash, role_id) VALUES ('admin1', 'admin1@example.com', SHA2('password4', 256), 2);
INSERT INTO user (username, email, password_hash, role_id) VALUES ('admin2', 'admin2@example.com', SHA2('password5', 256), 2);
INSERT INTO user (username, email, password_hash, role_id) VALUES ('user1', 'user1@example.com', SHA2('password6', 256), 3);
INSERT INTO user (username, email, password_hash, role_id) VALUES ('user2', 'user2@example.com', SHA2('password7', 256), 3);
INSERT INTO user (username, email, password_hash, role_id) VALUES ('user3', 'user3@example.com', SHA2('password8', 256), 3);
INSERT INTO user (username, email, password_hash, role_id) VALUES ('user4', 'user4@example.com', SHA2('password9', 256), 3);
INSERT INTO user (username, email, password_hash, role_id) VALUES ('user5', 'user5@example.com', SHA2('password10', 256), 3);

INSERT INTO car (make, model, year, mileage, price, description, image_url) VALUES ('Toyota', 'Corolla', 2023, 10000, 25000, 'Brand new Toyota Corolla with all the latest features.', 'https://example.com/corolla.png');
INSERT INTO car (make, model, year, mileage, price, description, image_url) VALUES ('Honda', 'Civic', 2022, 20000, 22000, 'Sleek and sporty Honda Civic in excellent condition.', 'https://example.com/civic.png');
INSERT INTO car (make, model, year, mileage, price, description, image_url) VALUES ('Ford', 'Mustang', 2021, 30000, 35000, 'Powerful and iconic Ford Mustang for the thrill seeker.', 'https://example.com/mustang.png');
INSERT INTO car (make, model, year, mileage, price, description, image_url) VALUES ('Hyundai', 'Elantra', 2020, 40000, 18000, 'Reliable and fuel-efficient Hyundai Elantra for everyday commutes.', 'https://example.com/elantra.png');
INSERT INTO car (make, model, year, mileage, price, description, image_url) VALUES ('Kia', 'Forte', 2019, 50000, 15000, 'Affordable and stylish Kia Forte for city driving.', 'https://example.com/forte.png');

INSERT INTO booking (user_id, car_id, start_time, end_time, created_at)
VALUES ((SELECT id FROM user WHERE username = 'user1'), (SELECT id FROM car WHERE model = 'Corolla'), '2023-12-11 10:00:00', '2023-12-11 13:00:00', NOW());

INSERT INTO booking (user_id, car_id, start_time, end_time, created_at)
VALUES ((SELECT id FROM user WHERE username = 'user2'), (SELECT id FROM car WHERE model = 'Mustang'), '2023-12-12 09:00:00', '2023-12-12 12:00:00', NOW());

INSERT INTO booking (user_id, car_id, start_time, end_time, created_at)
VALUES ((SELECT id FROM user WHERE username = 'user5'), (SELECT id FROM car WHERE model = 'Forte'), '2023-12-13 10:00:00', '2023-12-13 14:00:00', NOW());

-- fill cat_time_slot_lock with two blocks of time in hour period for each car
INSERT INTO car_time_slot_lock (car_id, start_time, end_time) VALUES (1, '2023-12-11 10:00:00', '2023-12-11 11:00:00');
INSERT INTO car_time_slot_lock (car_id, start_time, end_time) VALUES (2, '2023-12-11 11:00:00', '2023-12-11 12:00:00');
INSERT INTO car_time_slot_lock (car_id, start_time, end_time) VALUES (3, '2023-12-12 09:00:00', '2023-12-12 10:00:00');
INSERT INTO car_time_slot_lock (car_id, start_time, end_time) VALUES (4, '2023-12-12 10:00:00', '2023-12-12 11:00:00');
INSERT INTO car_time_slot_lock (car_id, start_time, end_time) VALUES (5, '2023-12-13 10:00:00', '2023-12-13 11:00:00');
