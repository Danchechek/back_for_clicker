const express = require('express');
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// список заявок
const applications = [];

// класс заявки
class Application {
  constructor(email, phone, name, dateOfBirth, city) {
    this.email = email;
    this.phone = phone;
    this.name = name;
    this.dateOfBirth = dateOfBirth;
    this.city = city;
  }
}

// метод добавления заявки
app.post('/addApplication', (req, res) => {
  const { email, phone, name, dateOfBirth, city } = req.body;
  const application = new Application(email, phone, name, dateOfBirth, city);
  applications.push(application);
  res.status(200).json({ message: 'Заявка добавлена успешно' });
});

// метод получения всех заявок
app.get('/getApplications', (req, res) => {
  res.status(200).json(applications);
});

// слушаем порт
const port = 8080;
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
