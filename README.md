# Сервис для записи к врачу
API для просмотра, создания, редактирования и удаления записей на приём к врачу, а также информации о самих врачах и пользователях. Имеется механизм напоминания о записи на приём за сутки и за 2 часа.

Ссылка на ТЗ: https://gist.github.com/babysharny/3778b6b64180d87ac7138f9c8aeabf43

 Запуск через Docker: 
```
docker-compose up
```

Обычный запуск: 
```
npm run build
npm run prefill 
npm run start
```
Swagger-документация доступна по адрессу http://<host>:<port>/api-docs/


## Технологии

* node.js
* express
* typescript
* mongoDB
* docker
* swagger
