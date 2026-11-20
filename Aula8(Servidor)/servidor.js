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

/////////////////////////////////Aula11/////////////////////////////////////////////

let mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient;
const uri ='mongodb+srv://ramosthaynara08_db_user:rP4de2Br1gb8m5mZ@thay.v144fez.mongodb.net/';
//segunda opção
//const uri = '//mongodb://localhost:27017'
const client = new MongoClient(uri, { useNewUrlParser: true });

var dbo = client.db("exemplo_bd");
var usuarios = dbo.collection("usuarios");

///////////////////////////////////

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

///////////////AULA11//////////////////////////// como cadastrar o usuario no bamco e dados e dar uma resposta
//query é do get
//body é do post

app.post('/bd_cadstrar', function(req,res){
    let nome = req.body.nome;
    let login = req.body.login;
    let senha = req.body.senha;

    let data = {db_nome: nome, db_login: login, db_senha: senha}
    usuarios.insertOne(data, function(err){
        if(err){
            res.render("respostabd.ejs", {resposta: "Erro ao cadastrar usuário!"})

        }else{
            res.render("respostabd.ejs", {resposta: "Usuário cadastrado com sucesso!"})


        }


    });

})

//logar

app.post("/bd_logar", function(req,res){
     let login = req.body.login;
     let senha = req.body.senha;

     //define o q sera buscado no banco de dados
    let data = {db_login: login, db_senha: senha}
    //find para buscar e toArray para 
    usuarios.find(data).toArray(function(err, itens){

        if (err){
            res.render("respostabd.ejs", {resposta: "Erro ao buscar usuario!"})
        
            //lenght para saber o tamanho
        }else if(itens.length == 0){
            res.render("respostabd.ejs", {resposta: "Usuário/Senha não encontado!"})

        }else{
             res.render("respostabd.ejs", {resposta: "Usuário logado com sucesso!"})
        }
    })
})

//UPDATE

app.post("/bd_editar", async function(req,res){
    let login = req.body.login;
    let senha = req.body.senha;
    let novasenha = req.body.novasenha;

        //1 data para buscar
    let data = {db_login: login, db_senha: senha}
    //2 data para atualizar

    let newdata = {$set : {db_senha: novasenha}}
    
    try{

    const result = await usuarios.updateOne(data, newdata);
    console.log(result)

    if (result.matchedCount == 0){
        res.render("respostabd.ejs", {resposta: "Usuário/Senha não encontrado!" });

    }else{
        res.render("respostabd.ejs", {resposta: "Usuário atualizado com sucesso!" });
    }

    } catch (err) {
        console.error(err);
        res.render('respostabd.ejs', { resposta: "Erro ao atualizar usuário!" });



    }
    

})

//REMOVER

app.post("/bd_remover", async function (req,res){
    let login = req.body.login;
    let senha = req.body.senha;

    let data = {db_login: login, db_senha: senha}

    //verificar erro
    try{
    //para armazenar o dado na variavel
    const result = await usuarios.deleteOne(data);
    console.log(result);

    
    if (result.deletedCount == 0){
        res.render("respostabd.ejs", {resposta: "Usuário/Senha não encontrado!" });
    
    }else{
        res.render("respostabd.ejs", {resposta: "Usuário removido com sucesso!" });
    }
 } catch (err) {
        console.error(err);
        res.render('respostabd.ejs', { resposta: "Erro ao remover usuário!" });



    }

})

app.get("/listar", function(req,res){

    const data = {}
    usuarios.find(data).toArray(function(err, itens){

        if(err){
            console.log(err);
            res.render("respostabd.ejs", {resposta: "Erro ao listar usuários"})
        } else{
            res.render("resposta_bd_lista.ejs", {itens});
        }
    })
})


