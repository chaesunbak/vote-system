# 온라인 투표시스템 백엔드 프로젝트

프로그래머스 데브코스 풀스택 스플린트1 사이드프로젝트 
작업기간 : 2024년 10월 3일(목) ~ 2024년 10월 18월(금)

## 기능
- 구글 폼처럼 설문을 생성할 수 있습니다.
- 응답자의 MBTI를 통계를 포함한 결과를 확인 할 수 있습니다.

## 기술

Javascript
Express
MySQL2
JWT

## DB 구조

<img width="669" alt="스크린샷 2024-12-02 오후 5 09 07" src="https://github.com/user-attachments/assets/eec2ccfe-7d49-4e38-8ad8-aee54e949676">

```SQL
CREATE TABLE `surveys` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  `expires_at` TIMESTAMP
);

CREATE TABLE `questions` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `survey_id` INT,
  `question_text` VARCHAR(255) NOT NULL,
  `question_type` ENUM("MULTIPLE_CHOICE","SHORT_ANSWER","CHECKBOX","LONG_ANSWER") NOT NULL,
  `order_num` INT NOT NULL,
  `required` BOOLEAN DEFAULT false
);

CREATE TABLE `question_options` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `question_id` INT,
  `option_text` VARCHAR(255) NOT NULL,
  `order_num` INT NOT NULL
);

CREATE TABLE `responses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `survey_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `answer_choices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `response_id` INT NOT NULL,
  `question_id` INT NOT NULL,
  `option_id` INT NULL,
  `answer_text` TEXT NULL
);

CREATE TABLE `users` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(50) UNIQUE NOT NULL,
  `email` varchar(255) UNIQUE NOT NULL,
  `password_hash` char(60) NOT NULL COMMENT 'BCrypt hash',
  `password_salt` varchar(32) NOT NULL,
  `choseong` varchar(100) COMMENT 'For Korean initial consonant search',
  `email_verified` boolean DEFAULT false,
  `promotion_email_consent` boolean DEFAULT false,
  `verification_token` varchar(100),
  `created_at` datetime DEFAULT (CURRENT_TIMESTAMP),
  `mbti` varchar(4)
);

CREATE INDEX `users_index_0` ON `users` (`username`);

CREATE INDEX `users_index_1` ON `users` (`email`);

CREATE INDEX `users_index_2` ON `users` (`choseong`);

CREATE INDEX `users_index_3` ON `users` (`mbti`);


ALTER TABLE `questions` ADD FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE;

ALTER TABLE `question_options` ADD FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE;

ALTER TABLE `responses` ADD FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE;

ALTER TABLE `responses` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `answer_choices`
ADD FOREIGN KEY (`question_id`)
REFERENCES `questions` (`id`)
ON DELETE CASCADE;

ALTER TABLE `answer_choices`
ADD FOREIGN KEY (`option_id`)
REFERENCES `question_options` (`id`)
ON DELETE CASCADE;

ALTER TABLE `answer_choices`
ADD FOREIGN KEY (`response_id`)
REFERENCES `responses` (`id`)
ON DELETE CASCADE;
```


[포스트맨](https://documenter.getpostman.com/view/34263719/2sAYBYfqK3)


[팀 프로젝트 노션](https://www.notion.so/5c5349c9fd0e4d6788a40850ba6d6c4c?pvs=4)
