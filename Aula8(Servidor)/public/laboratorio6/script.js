let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d');

const personagem = new Image();
personagem.src = "OIP.webp";

let x = 0;
let y = 0;

personagem.onload = function() {
    ctx.drawImage(personagem, x, y, 50, 50);
}


let aux = 2;
function animacao(){

     //apagar o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //desenhar novamente
    ctx.drawImage(personagem, x, y, 50, 50);
    
    requestAnimationFrame(animacao);
}



animacao();

document.addEventListener("mousemove", function(evento){
    console.log(evento);
    let rect = canvas.getBoundingClientRect();
    let x_mouse = evento.clientX - rect.left;
    let y_mouse = evento.clientY - rect.top;
    console.log (x_mouse, y_mouse);

   x = Math.max(0, Math.min(x_mouse, canvas.width - 50));
   y = Math.max(0, Math.min(y_mouse, canvas.height - 50));

});