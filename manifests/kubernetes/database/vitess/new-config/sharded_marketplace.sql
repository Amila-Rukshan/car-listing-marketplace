ALTER TABLE user CHANGE id id INT NOT NULL;
ALTER TABLE car CHANGE id id INT NOT NULL;
ALTER TABLE booking CHANGE id id INT NOT NULL;

-- CREATE TABLE user_seq(
--     id INT PRIMARY KEY,
--     next_id INT,
--     cache INT
-- ) comment 'vitess_sequence';

-- CREATE TABLE car_seq(
--     id INT PRIMARY KEY,
--     next_id INT,
--     cache INT
-- ) comment 'vitess_sequence';

-- CREATE TABLE book_seq(
--     id INT PRIMARY KEY,
--     next_id INT,
--     cache INT
-- ) comment 'vitess_sequence';
