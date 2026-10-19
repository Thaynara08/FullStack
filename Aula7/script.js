let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d');

let canvas6 = document.getElementById('canvas6')
let ctx6 = canvas6.getContext('2d');

// retângulos
ctx.beginPath();
ctx.lineWidth = 2;
ctx.fillStyle = 'blue';
ctx.strokeStyle = 'red';
ctx.fillRect(10,10,50,50);
ctx.strokeRect(10,10,50,50);
ctx.closePath();

// linhas
ctx.beginPath();
ctx.lineWidth = 2;
ctx.fillStyle = 'blue';
ctx.strokeStyle = 'red';
ctx.moveTo(200,150);
ctx.lineTo(60,10);
ctx.lineTo(60,250);
ctx.lineTo(200,250);
ctx.lineTo(200,150);
ctx.fill();
ctx.stroke();
ctx.closePath();

// arcos
ctx.beginPath();
ctx.lineWidth = 2;
ctx.fillStyle = 'blue';
ctx.strokeStyle = 'red';
ctx.arc(200,200,50,1.5*Math.PI,2.5*Math.PI);
ctx.fill();
ctx.stroke();
ctx.closePath();

// texto
ctx.beginPath();
ctx.lineWidth = 2;
ctx.fillStyle = 'blue';
ctx.strokeStyle = 'red';
ctx.font = "90px Arial"
ctx.textAlign = "center";
ctx.fillText("Olá",200,350);
ctx.strokeText("Olá",200,350)
ctx.closePath();

let canvas2 = document.getElementById('canvas2')
let ctx2 = canvas2.getContext('2d');

// retângulos
ctx2.beginPath();
ctx2.lineWidth = 2;
ctx2.fillStyle = 'red';
ctx2.strokeStyle = 'red';
ctx2.fillRect(0,0,50,50);
ctx2.strokeRect(0,0,50,50);
ctx2.closePath();

// retângulos
ctx2.beginPath();
ctx2.lineWidth = 2;
ctx2.fillStyle = 'blue';
ctx2.strokeStyle = 'blue';
ctx2.fillRect(450,0,50,50);
ctx2.strokeRect(450,0,50,50);
ctx2.closePath();

// retângulos
ctx2.beginPath();
ctx2.lineWidth = 2;
ctx2.fillStyle = 'yellow';
ctx2.strokeStyle = 'yellow';
ctx2.fillRect(0,450,50,50);
ctx2.strokeRect(0,450,50,50);
ctx2.closePath();

// retângulos
ctx2.beginPath();
ctx2.lineWidth = 2;
ctx2.fillStyle = 'green';
ctx2.strokeStyle = 'green';
ctx2.fillRect(450,450,50,50);
ctx2.strokeRect(450,450,50,50);
ctx2.closePath();

// linhas
ctx2.beginPath();
ctx2.lineWidth = 2;
ctx2.strokeStyle = 'red';
ctx2.moveTo(0,0);
ctx2.lineTo(500,500);
ctx2.stroke();
ctx2.closePath();

// linhas
ctx2.beginPath();
ctx2.lineWidth = 2;
ctx2.strokeStyle = 'blue';
ctx2.moveTo(500, 0);
ctx2.lineTo(0,500);
ctx2.stroke();
ctx2.closePath();

// linhas
ctx2.beginPath();
ctx2.lineWidth = 2;
ctx2.strokeStyle = 'green';
ctx2.moveTo(0, 250);
ctx2.lineTo(500,250);
ctx2.stroke();
ctx2.closePath();

// arcos
ctx2.beginPath();
ctx2.lineWidth = 2;
ctx2.strokeStyle = 'green';
ctx2.arc(250,250,50,0*Math.PI,1*Math.PI);
ctx2.stroke();
ctx2.closePath();

let idades = [22,98]
console.log(idades);
console.log(idades.length);

idades.push(25)
console.log(idades)

idades.pop
console.log(idades)

//aula2

let canvas4 = document.getElementById('canvas4')
let ctx4 = canvas4.getContext('2d');

let retangulo4 = {
    x: 10,
    y: 10,
    l: 50,
    a: 50,
    cor_fill: "red",
    cor_stroke: "green",
    desenha: function(ctx4, cor_fill, cor_stroke){
ctx4.beginPath();
ctx4.lineWidth = 2;
ctx4.fillStyle = this.cor_fill;
ctx4.strokeStyle = this.cor_stroke;
ctx4.fillRect(this.x, this.y, this.l, this.a);
ctx4.strokeRect(this.x, this.y,this.l, this.a);
ctx4.closePath();
    }
    
}


let canvas5 = document.getElementById('canvas5')
let ctx5 = canvas5.getContext('2d');

let retangulo5 = {
    x: 10,
    y: 10,
    l: 50,
    a: 50,
    cor_fill: "blue",
    cor_stroke: "yellow",
    desenha: function(ctx5, cor_fill, cor_stroke){
ctx5.beginPath();
ctx5.lineWidth = 2;
ctx5.fillStyle = this.cor_fill;
ctx5.strokeStyle = this.cor_stroke;
ctx5.fillRect(this.x, this.y, this.l, this.a);
ctx5.strokeRect(this.x, this.y,this.l, this.a);
ctx5.closePath();
    }
    
}

let retangulo6 = {
    x: 10,
    y: 10,
    l: 50,
    a: 50,
    cor_fill: "yellow",
    cor_stroke: "yellow",
    desenha: function(ctx6, cor_fill, cor_stroke){
ctx6.beginPath();
ctx6.lineWidth = 2;
ctx6.fillStyle = this.cor_fill;
ctx6.strokeStyle = this.cor_stroke;
ctx6.fillRect(this.x, this.y, this.l, this.a);
ctx6.strokeRect(this.x, this.y,this.l, this.a);
ctx6.closePath();
    }
    
}

retangulo4.desenha(ctx4);
retangulo5.desenha(ctx5);
retangulo6.desenha(ctx6);

//animação

let aux = 2;
function animacao(){
    //apagar o canvas
    ctx4.clearRect(0,0, 400, 400);
    ctx5.clearRect(0,0, 400, 400);
    ctx6.clearRect(0,0, 400, 400);
    //atualizar o obejto

    
if(retangulo4.x >= 360){
    aux = -2;
}else if(retangulo4.x <= 0){
    aux = 2;

}

    retangulo4.x +=aux;


    //desenhar novamente
    retangulo4.desenha(ctx4);
    retangulo5.desenha(ctx5);
    retangulo6.desenha(ctx6);
    requestAnimationFrame(animacao);
}

animacao();

document.addEventListener("keydown", function(evento){
    console.log(evento);
    let tecla = evento.key;

    if (tecla == "ArrowUp"){retangulo5.y -= 2}
    if (tecla == "ArrowDown"){retangulo5.y += 2}
    if (tecla == "ArrowLeft"){retangulo5.x -= 2}
    if (tecla == "ArrowRight"){retangulo5.x += 2}


})

document.addEventListener("mousemove", function(evento){
    console.log(evento);
    let rect = canvas6.getBoundingClientRect();
    let x_mouse = evento.clientX - rect.left;
    let y_mouse = evento.clientY - rect.top;
    console.log (x_mouse, y_mouse);

    retangulo6.x = x_mouse;
    retangulo6.y = y_mouse;
})