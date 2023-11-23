const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors"); // Importa el paquete cors
const morgan = require("morgan");
const app = express();


app.use(morgan());

const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",
  user: "agus",
  password: "",
  database: "micoleccion",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Conectado a la base de datos");
});

app.use(
  cors({
    origin: "http://localhost:8100", // Solo permite solicitudes desde 'http://localhost:8100'
  })
); // Usa cors como middleware en tu aplicación

app.use(express.json()); // para poder parsear el cuerpo de las solicitudes POST


// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const userEmail = "agussx17x@gmail.com";
  const userPassword = "sofi1408";

  if(email === userEmail && password === userPassword){
    const token = jwt.sign({ email }, "secreto");
    res.json({auth: true, token});
  }else{
    res.json({auth: false, message:"El correo electrónico o la contraseña son incorrectos"});
  }
});

//Agregar Producto
app.post("/micoleccion", (req, res) => {
  const { titulo, descripcion, url_imagen, precio, url_compra } = req.body;
  var post = {
    titulo: titulo,
    descripcion: descripcion,
    url_imagen: url_imagen,
    precio: precio,
    url_compra: url_compra,
  };
  var query = connection.query(
    "INSERT INTO MiColeccion SET ?",
    post,
    function (error, results, fields) {
      if (error) {
        console.log(error);
        res.status(500).json({ message: "Error al agregar el producto" });
      } else {
        res.json({ message: "Producto agregado exitosamente" });
      }
    }
  );
});

// Actualizar Producto
app.put("/micoleccion/:id", (req, res) => {
  const { titulo, descripcion, url_imagen, precio, url_compra } = req.body;
  var post = {
    titulo: titulo,
    descripcion: descripcion,
    url_imagen: url_imagen,
    precio: precio,
    url_compra: url_compra,
  };
  var query = connection.query(
    "UPDATE MiColeccion SET ? WHERE id = ?",
    [post, req.params.id],
    function (error, results, fields) {
      if (error) {
        console.log(error);
        res.status(500).json({ message: "Error al actualizar el producto" });
      } else {
        res.json({ message: "Producto actualizado exitosamente" });
      }
    }
  );
});


app.get("/micoleccion", (req, res) => {
  connection.query("SELECT * FROM MiColeccion", (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).json({ message: "Error al obtener los productos" });
    } else {
      res.json(results);
    }
  });
});

//Buscar productos
app.get('/micoleccion', (req, res) => {
  const titulo = req.query.titulo;
  const sql = 'SELECT * FROM MiColeccion WHERE titulo LIKE ?';
  
  // Usa '%' para buscar cualquier producto que contenga el texto de búsqueda en su nombre
  connection.query(sql, ['%' + titulo + '%'], (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});


//Borrar producto
app.delete("/micoleccion/:id", (req, res) => {
  const { id } = req.params;
  connection.query(
    "DELETE FROM MiColeccion WHERE id = ?",
    [id],
    function (error, results, fields) {
      if (error) {
        console.log(error);
        res.status(500).json({ message: "Error al eliminar el producto" });
      } else if (results.affectedRows == 0) {
        res
          .status(404)
          .json({ message: "No se encontró ningún producto con ese ID" });
      } else {
        res.json({ message: "Producto eliminado exitosamente" });
      }
    }
  );
});

//Activar token
function isTokenActive(token) {
  try {
    const decodedToken = jwt.decode(token);
    const expirationDate = new Date(decodedToken.exp * 1000); // La fecha de expiración está en segundos
    if (expirationDate > new Date()) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}

//Por defecto inicia inactivo
const token = "token";
const isActive = isTokenActive(token);
console.log("¿Está activo el token? ", isActive);

app.listen(3000, () => console.log("Servidor escuchando en el puerto 3000"));
