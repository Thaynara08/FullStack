let colors = require("colors");
let http = require ('http');
let express = require ('express');

let app = express ();
app.use(express.static('./public'));

let server = http.createServer(app);
server.listen(80);

let bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({extended: false }))
app.use(bodyParser.json())

app.set('view engine', 'ejs') 	 
app.set('views', './views')


console.log("Servidor rodando...". rainbow);

////////////

app.get('/', function(req,res){
  res.redirect("pagina.html")  
})

app.get('/cadastrar', function(req,res){
    let nome = req.query.nome;
    let login = req.query.login;
    let senha = req.query.senha;

    console.log(nome,login,senha);

    res.render("resposta.ejs", {
        resposta: "Usúario cadastrado!",
        metodo: "Enviado pelo método Get"
    
    })

})

app.post('/cadastrar', function(req,res){
    let nome = req.body.nome;
    let login = req.body.login;
    let senha = req.body.senha;

        console.log(nome,login,senha);

        res.render("resposta.ejs", {
            resposta: "Usúario cadastrado!",
            metodo: "Enviado pelo método Post"
        })
})

app.get("/for", function(req,res){
    let qtde = req.query.qtde;
    console.log(qtde);
    res.render("for.ejs", {qtde})
})




//laboratorio8

let log_salvo=''
let cad_salvo= ''

app.get('/', function(req,res){
  res.redirect("cadastro.html")  
})

app.get('/cad', function(req,res){
    let nome = req.query.nome;
    let cpf = req.query.cpf;
    let senha = req.query.senha;

    console.log(nome,cpf,senha);

     log_salvo= nome
     cad_salvo= senha

    res.render("resposta2.ejs", {
        resposta: "Usúario cadastrado!"
    
    })

})


app.get('/log', function(req,res){
    let nome = req.body.nome;
    let senha = req.body.senha;

        console.log(nome,senha);

        res.render("resposta2.ejs", {
            resposta: "Login realizado!"
        })

        if (log_salvo == nome && cad_salvo == senha){
            res.render("resposta2.ejs", {
            resposta: "Login realizado!"
        })

        }
})


