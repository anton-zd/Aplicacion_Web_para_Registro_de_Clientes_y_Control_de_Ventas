# Aplicación Web para Registro de Clientes y Control de Ventas

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000&style=for-the-badge)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=fff&style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=fff&style=for-the-badge)
![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853?logo=googlesheets&logoColor=fff&style=for-the-badge)

[![Vista previa](https://github.com/anton-zd/Aplicacion_Web_para_Registro_de_Clientes_y_Control_de_Ventas/blob/main/assets/readme_files/image_1.png)](https://sales-manegement-antony.netlify.app/)

> Una aplicación web intuitiva para el registro de clientes y la gestión de ventas, desarrollada con **HTML, CSS y JavaScript**.
> A través de un servidor alojado en **Railway**, la aplicación se conecta a una base de datos en **Google Sheets**, lo que permite **capturar y almacenar los datos de los clientes directamente desde la interfaz web**.
> Puedes acceder a la aplicación en el siguiente enlace: 👇👇👇

<p align="center">
  <a href="https://sales-manegement-antony.netlify.app/" target="_blank" 
     style="border:2px solid #2196F3; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:bold;">
     🌐 sales-manegement-antony
  </a>
</p>

## ⚠️ Importante

El funcionamiento de la aplicación web depende de la **activación del servidor (API)** alojado en **Railway**.  
Esto significa que, para acceder y probar todas las funcionalidades de la aplicación, es necesario que el servidor esté encendido.  

Si deseas probar su funcionamiento completo, no dudes en escribirme: 👇👇👇

<p align="center">
  <a href="https://www.linkedin.com/in/antonyzarate/" target="_blank" 
     style="border:2px solid #2196F3; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:bold;">
    Antony Zarate Davila
  </a>
</p>

![Aviso](https://github.com/anton-zd/Aplicacion_Web_para_Registro_de_Clientes_y_Control_de_Ventas/blob/main/assets/readme_files/image_2.png)

## ✨ Características

- 👤 Registro de clientes con datos básicos
- 📊 Control y seguimiento 
- 🔎 Búsqueda y filtrado de clientes
- 🎨 Interfaz amigable y responsiva

## 📱 Interfaz

La aplicación cuenta con una interfaz diseñada especialmente para **dispositivos móviles**, lo que garantiza una mejor experiencia de uso en celulares, de esta manera, cualquier vendedor puede **registrar clientes desde cualquier lugar**, necesitando únicamente una conexión a internet.  

Ademas el sistema cuenta con credenciales predefinidas para acceder como diferentes vendedores.  

```javascript
const CREDENTIALS = {
    'admin': 'admin',
    'carlos01': 'carlos123',
    'cielo01': 'cielo123',
    'raul01': 'raul123',
    'tia_rosa01': 'tia_rosa123'
};

const SELLER_NAMES = {
    'admin': 'Admin',
    'carlos01': 'Carlos',
    'cielo01': 'Cielo',
    'raul01': 'Raul',
    'tia_rosa01': 'Tia Rosa'
};
```

Por ello opté por desarrollarla con **HTML, CSS y JavaScript** en lugar de lenguajes como **Java o Kotlin** (enfocados en aplicaciones móviles nativas), ya que tenía experiencia previa con estas tecnologías y, al ser un proyecto pequeño con necesidad de entrega rápida, resultaba más práctico y eficiente.

![Interfaz](https://github.com/anton-zd/Aplicacion_Web_para_Registro_de_Clientes_y_Control_de_Ventas/blob/main/assets/readme_files/image_3.png)

## 🗄️ Base de Datos

Al evaluar distintas opciones de bases de datos como **MySQL**, **SQL Server**, **PostgreSQL** o incluso **Microsoft Excel**, opté por **Google Sheets** debido a su **simplicidad** y a la facilidad de uso de su propia **API gratuita**. 

Que por ejemplo de la hoja llamada **"Sellers"** tiene la siguiente estructura:
```
{
  "range": "sellers!B1:B1000",
  "majorDimension": "ROWS",
  "values": [
    [
      "name"
    ],
    [
      "admin"
    ],
    [
      "Carlos"
    ],
    [
      "Cielo"
    ],
    [
      "Raul"
    ],
    [
      "Tia Rosa"
    ]
  ]
}
```
La decisión también se tomó porque la persona encargada de gestionar la base de datos (un familiar 😅) no tiene experiencia con sistemas más avanzados como SQL, y con Google Sheets el proceso resulta mucho más accesible.  

Otra ventaja clave de usar Google Sheets es su capacidad de **trabajo colaborativo**, lo que permite compartir y editar la base de datos fácilmente a través de un enlace.  
De hecho, tú mismo puedes revisarla en el siguiente link. 👇👇👇

<p align="center">
  <a href="https://docs.google.com/spreadsheets/d/1r4CeqEpV315mvCQMy7M77fppCwdX2mW4sC_5ZvUJQNo/edit?usp=sharing" target="_blank" 
     style="border:2px solid #2196F3; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:bold;">
    📊 Base de Datos Google Sheets
  </a>
</p>

![BD](https://github.com/anton-zd/Aplicacion_Web_para_Registro_de_Clientes_y_Control_de_Ventas/blob/main/assets/readme_files/image_4.png)

## 🍗 Imágenes de la Actividad

El desarrollo de esta aplicación web surgió como apoyo a la actividad de un familiar, ya que decidí voluntariamente crear una herramienta que le permitiera **gestionar de forma más organizada la venta de parrilladas y polladas**.  
Gracias a esta aplicación, pudo dejar atrás los registros manuales en papel y comenzar a llevar sus cuentas de una manera **más práctica, moderna y automatizada**, reduciendo tiempos de trabajo y mejorando el control de ingresos.

![Actividad](https://github.com/anton-zd/Aplicacion_Web_para_Registro_de_Clientes_y_Control_de_Ventas/blob/main/assets/readme_files/image_5.jpg)

