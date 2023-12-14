CREATE TABLE user (
    id CHAR(36) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL
);

CREATE TABLE car (
    id CHAR(36) PRIMARY KEY,
    make VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    mileage INT,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    image_url VARCHAR(255)
);

CREATE TABLE car_time_slot_lock (
    car_id CHAR(36) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    PRIMARY KEY (car_id, start_time, end_time),
    FOREIGN KEY (car_id) REFERENCES car(id)
);

CREATE TABLE booking (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    car_id CHAR(36) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    cancelled_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (car_id) REFERENCES car(id)
);

CREATE INDEX idx_make ON car(make);
CREATE INDEX idx_model ON car(model);
CREATE INDEX idx_year ON car(year);
CREATE INDEX idx_mileage ON car(mileage);
CREATE INDEX idx_price ON car(price);

CREATE INDEX idx_car_id ON booking(car_id);
