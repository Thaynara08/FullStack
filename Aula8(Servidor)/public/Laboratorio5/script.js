// canvas
let canvas1 = document.getElementById("c1");
let ctx1 = canvas1.getContext("2d");

let canvas2 = document.getElementById("c2");
let ctx2 = canvas2.getContext("2d");

// cores
const AZUL = "blue";
const VERMELHO = "#e83525";
const CIANO = "#73fdfd";
const AMARELO = "#ffff54";
const VERDE = "green";
const PRETO = "black";
const CEU = "#aaf8d8";
const CINZA = "#808080";
const AGUA = "#5b8def";
const MARROM = "#7b4a24";
const MARROM_ESCURO = "#5a4325";
const FOLHAGEM = "#4a8a38";
const TELHADO = "#e07058";
const VIDRO = "#6db8ff";

const PI = Math.PI;

// funções de desenho
function desenhar_quadrado(ctx, x, y, largura, altura, cor) {
  ctx.fillStyle = cor;
  ctx.fillRect(x, y, largura, altura);
}

function desenhar_triangulo(ctx, x1, y1, x2, y2, x3, y3, cor) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fillStyle = cor;
  ctx.fill();
}

function desenhar_linha(ctx, x1, y1, x2, y2, cor) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = cor;
  ctx.stroke();
}


function desenhar_arco(ctx, x, y, raio, inicio, fim, cor_linha, cor_preenchimento) {
  ctx.beginPath();
  ctx.arc(x, y, raio, inicio, fim);
  if (cor_preenchimento) {
    ctx.fillStyle = cor_preenchimento;
    ctx.fill();
  }
  if (cor_linha) {
    ctx.strokeStyle = cor_linha;
    ctx.stroke();
  }
}

function escrever(ctx, texto, x, y, cor, fonte) {
  ctx.font = fonte;
  ctx.fillStyle = cor;
  ctx.textAlign = "center";
  ctx.fillText(texto, x, y);
}

desenhar_quadrado(ctx1, 0, 0, 50, 50, AZUL);
desenhar_quadrado(ctx1, 250, 0, 50, 50, VERMELHO);
desenhar_quadrado(ctx1, 0, 120, 30, 60, CIANO);
desenhar_quadrado(ctx1, 270, 135, 30, 30, CIANO);
desenhar_quadrado(ctx1, 110, 150, 40, 40, VERMELHO);
desenhar_quadrado(ctx1, 0, 240, 30, 60, AMARELO);
desenhar_quadrado(ctx1, 30, 270, 30, 30, AMARELO);
desenhar_quadrado(ctx1, 270, 240, 30, 60, PRETO);
desenhar_quadrado(ctx1, 240, 270, 30, 30, PRETO);

// linhas
desenhar_linha(ctx1, 50, 50, 150, 150, AZUL);
desenhar_linha(ctx1, 250, 50, 150, 150, VERMELHO);
desenhar_linha(ctx1, 0, 150, 300, 150, VERDE);
desenhar_linha(ctx1, 150, 150, 150, 300, "#333");

// arcos de cima
desenhar_arco(ctx1, 150, 150, 80, PI, 2 * PI, VERDE, null);
desenhar_arco(ctx1, 150, 150, 50, PI, 2 * PI, VERDE, null);
desenhar_arco(ctx1, 150, 115, 15, 0, 2 * PI, AZUL, CIANO);

// arcos de baixo
desenhar_arco(ctx1, 150, 300, 80, PI, 2 * PI, VERDE, null);
desenhar_arco(ctx1, 150, 300, 60, PI, 2 * PI, VERDE, null);
desenhar_arco(ctx1, 150, 300, 40, PI, 2 * PI, VERDE, CIANO);

// círculos amarelos
desenhar_arco(ctx1, 70, 221, 15, 0, 2 * PI, VERDE, AMARELO);
desenhar_arco(ctx1, 220, 221, 15, 0, 2 * PI, VERDE, AMARELO);

escrever(ctx1, "Canvas", 150, 50, "#333", "20px Arial");

//segundo canvas

// céu e sol
desenhar_quadrado(ctx2, 0, 0, 300, 300, CEU);
desenhar_arco(ctx2, 225, 75, 37.5, 0, 2 * PI, null, AMARELO);

// rua
desenhar_quadrado(ctx2, 37.5, 225, 262.5, 75, CINZA);

// água
desenhar_arco(ctx2, 0, 225, 37.5, 0, 2 * PI, null, AGUA);
desenhar_quadrado(ctx2, 0, 225, 37.5, 75, AGUA);
desenhar_quadrado(ctx2, 0, 262.5, 112.5, 37.5, AGUA);
desenhar_arco(ctx2, 112.5, 300, 37.5, 0, 2 * PI, null, AGUA);

// árvore da esquerda
desenhar_quadrado(ctx2, 37.5, 187.5, 15, 37.5, MARROM);
desenhar_arco(ctx2, 45, 172.5, 22.5, 0, 2 * PI, null, FOLHAGEM);

// árvore da direita
desenhar_quadrado(ctx2, 262.5, 225, 15, 37.5, MARROM);
desenhar_arco(ctx2, 270, 210, 22.5, 0, 2 * PI, null, FOLHAGEM);

// casa
desenhar_quadrado(ctx2, 112.5, 150, 75, 75, MARROM);
desenhar_triangulo(ctx2, 112.5, 150, 187.5, 150, 150, 112.5, TELHADO);
desenhar_quadrado(ctx2, 120, 165, 22.5, 22.5, VIDRO);
desenhar_quadrado(ctx2, 157.5, 165, 22.5, 22.5, VIDRO);
desenhar_quadrado(ctx2, 142.5, 187.5, 15, 37.5, MARROM_ESCURO)