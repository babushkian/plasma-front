import React, { useState } from 'react';
import axios from 'axios';
    
const Login = () => {
// "user@omzit.ru"
// "StrongPass1!"
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [autorized, setAutorized] = useState<boolean>(false)

  type loginResponse = {ok: true, message: string}
  type userLoginType = {        email: "user@omzit.ru",
    password: "StrongPass1!",}

  const handleLogin = async () => {
    try {
      // Отправка POST-запроса на сервер с использованием axios
      const response = await axios.post('http://192.168.8.163:8000/auth/login/', {
        email: "user@omzit.ru",
        password: "StrongPass1!",
      });

      // Проверка успешности логина
      if (response.data.ok) {
          setAutorized(true)
      } else {
        alert('Login failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred during login. Please try again.');
    }
  };


  const handleLogout = async () => {
    try {
      // Отправка POST-запроса на сервер с использованием axios
      const response = await axios.post('http://192.168.8.163:8000/auth/login/', {
        email: "user@omzit.ru",
        password: "StrongPass1!",
      });

      // Проверка успешности логина
      if (response.data.ok) {
          setAutorized(true)
      } else {
        alert('Login failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred during login. Please try again.');
    }
  };


  const label = autorized? <div>Авторизован</div>: <div>Не авторизован</div>

  return (
    <>
    <div>
      <h2>Login</h2>
      <input 
        type="text" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button onClick={handleLogin}>Login</button>
    </div>
    <div>
    <button onClick={handleLogin}>Залогиниться дефолтным юзером</button>
    </div>
    <div>
    <button onClick={handleLogout}>Разлогиниться</button>
    </div>


      {label}
    </>
  );
};

export default Login;