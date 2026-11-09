/* =====================================================================
   RUMO AO ESPAÇO - jogo de plataforma vertical em canvas

   IDEIA GERAL:
   - O personagem começa embaixo (no subterrâneo) e sobe pulando de
     plataforma em plataforma até chegar ao espaço.
   - O mundo é "infinito para cima": as plataformas são criadas
     conforme o jogador sobe.
   - IMPORTANTE sobre coordenadas: no canvas, o Y cresce para BAIXO.
     Aqui o chão fica em y = 0, e quanto mais alto o jogador vai,
     mais NEGATIVO fica o y. Por isso: altitude = -y.
   ===================================================================== */


/* ================== 1. CONFIGURAÇÕES (mexa aqui) ==================
   Tudo que você pode querer ajustar fica concentrado neste objeto. */
const CFG = {
  gravidade: 0.55,            // quanto a velocidade vertical aumenta a cada frame
  forcaPulo: -13,             // velocidade inicial do pulo (negativo = para cima)
  velocidade: 4,              // velocidade andando para os lados (pixels por frame)
  metaAltura: 5000,           // altitude que o jogador precisa alcançar para vencer
  distPlataformas: [75, 110], // distância vertical mínima e máxima entre plataformas
                              // (se aumentar muito, o pulo não alcança!)
  chanceObstaculo: 0.3,       // 0.3 = 30% de chance de nascer um obstáculo por plataforma
  velPerigoBase: 0.35         // velocidade com que o perigo sobe (pixels por frame)
};

/* Cada zona do jogo é um objeto dentro deste array.
   - ate: até que altitude a zona vai
   - fundo / plat / obst / perigo: cores (fundo, plataformas, obstáculos, perigo)
   Para criar uma zona nova, basta copiar uma linha e mudar os valores.
   A ÚLTIMA zona deve ter um "ate" bem grande (é a que nunca acaba). */
const ZONAS = [
  { nome: "Subterrâneo", ate: 1500,  fundo: "#3b2a1e", plat: "#8d6e4c", obst: "#c0392b", perigo: "#ff6a00", perigoNome: "Lava" },
  { nome: "Céu",         ate: 3500,  fundo: "#6ec6ff", plat: "#ffffff", obst: "#444444", perigo: "#555a6e", perigoNome: "Tempestade" },
  { nome: "Espaço",      ate: 99999, fundo: "#05051a", plat: "#9aa0b5", obst: "#b44cff", perigo: "#7a00cc", perigoNome: "Buraco negro" }
];


/* ================== 2. PREPARAÇÃO (canvas e teclado) ================== */

// Pega o canvas do HTML pelo id e o "contexto 2D",
// que é o objeto que tem as funções de desenhar (fillRect, drawImage...)
const canvas = document.getElementById("jogo");
const ctx = canvas.getContext("2d");
const W = canvas.width;   // largura do canvas (400)
const H = canvas.height;  // altura do canvas (600)

// Objeto que guarda quais teclas estão pressionadas agora.
// Exemplo: teclas["ArrowLeft"] vale true enquanto a seta esquerda está apertada.
const teclas = {};

// Quando uma tecla é apertada, marca como true
addEventListener("keydown", e => {
  teclas[e.code] = true;
  // Impede que espaço e setas rolem a página do navegador
  if (["Space", "ArrowUp", "ArrowDown"].includes(e.code)) e.preventDefault();
  // Tecla R reinicia o jogo a qualquer momento
  if (e.code === "KeyR") iniciar();
});

// Quando a tecla é solta, marca como false
addEventListener("keyup", e => teclas[e.code] = false);

// Variáveis do estado do jogo (são preenchidas na função iniciar)
let jogador;       // objeto do personagem
let plataformas;   // lista de plataformas
let obstaculos;    // lista de obstáculos
let estrelas;      // pontinhos de fundo (aparecem só no espaço)
let camY;          // posição da câmera (qual parte do mundo está visível)
let perigoY;       // altura (y) do perigo que sobe de baixo
let ultimoY;       // y da última plataforma criada (para saber onde criar a próxima)
let estado;        // "jogando", "perdeu" ou "ganhou"
let frames;        // contador de quadros desde o início (usado para o atraso do perigo)


/* ================== 3. FUNÇÕES AUXILIARES ================== */

// Sorteia um número decimal entre a e b
const aleat = (a, b) => a + Math.random() * (b - a);

// Calcula a altitude atual do jogador (nunca negativa)
const altitude = () => Math.max(0, Math.floor(-jogador.y));

// Descobre em qual zona o jogador está, dada a altitude.
// find() devolve a primeira zona cujo "ate" ainda é maior que a altitude.
const zonaDe = alt => ZONAS.find(z => alt < z.ate);

// Teste de colisão entre dois retângulos (a e b).
// Eles colidem quando se sobrepõem tanto na horizontal quanto na vertical.
function colide(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}


/* ================== 4. INICIAR / REINICIAR O JOGO ================== */
function iniciar() {
  // Jogador: x,y = posição; w,h = tamanho; vx,vy = velocidade;
  // noChao = true quando está apoiado em uma plataforma (só assim pode pular)
  jogador = { x: W / 2 - 14, y: -50, w: 28, h: 28, vx: 0, vy: 0, noChao: false };

  // A primeira plataforma é o chão, largo como a tela inteira
  plataformas = [{ x: 0, y: 0, w: W, h: 20 }];

  obstaculos = [];

  // Cria 60 estrelas em posições aleatórias (fixas na tela, não no mundo)
  estrelas = Array.from({ length: 60 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    t: Math.random() * 2 + 1   // tamanho da estrela
  }));

  ultimoY = 0;             // a próxima plataforma nasce acima do chão
  camY = -H + 120;         // câmera começa mostrando o chão na parte de baixo
  perigoY = 250;           // o perigo começa abaixo do chão (y positivo = mais embaixo)
  estado = "jogando";
  frames = 0;
}


/* ================== 5. GERAÇÃO DO MUNDO ==================
   Chamada a cada frame. Cria plataformas e obstáculos acima da tela
   até ter 800 pixels de mundo "pré-criado" para cima. Também apaga
   o que ficou muito para trás (embaixo), para o jogo não ficar pesado. */
function gerarMundo() {
  while (ultimoY > camY - 800) {
    // Sobe uma distância aleatória dentro do limite configurado
    ultimoY -= aleat(...CFG.distPlataformas);

    // Plataforma com largura aleatória e posição x aleatória
    const larg = aleat(70, 110);
    plataformas.push({ x: aleat(0, W - larg), y: ultimoY, w: larg, h: 14 });

    // Às vezes cria um obstáculo logo acima da plataforma.
    // (-ultimoY > 200 evita obstáculos logo no começo)
    if (Math.random() < CFG.chanceObstaculo && -ultimoY > 200) {
      obstaculos.push({
        x: aleat(0, W - 24),
        y: ultimoY - aleat(30, 55),
        w: 24,
        h: 24,
        // vx = velocidade horizontal; o sinal sorteia a direção (esquerda/direita)
        vx: (Math.random() < 0.5 ? -1 : 1) * aleat(1.2, 2.5)
      });
    }
  }

  // Remove plataformas e obstáculos que já ficaram bem abaixo da tela
  plataformas = plataformas.filter(p => p.y < camY + H + 300);
  obstaculos = obstaculos.filter(o => o.y < camY + H + 300);
}


/* ================== 6. ATUALIZAÇÃO (lógica do jogo) ==================
   Roda a cada frame (~60 vezes por segundo). Aqui ficam o movimento,
   as colisões, a câmera e as condições de vitória/derrota. */
function atualizar() {
  if (estado !== "jogando") return;   // se acabou, congela tudo
  frames++;
  const j = jogador;

  // ---- Movimento horizontal ----
  j.vx = 0;
  if (teclas.ArrowLeft  || teclas.KeyA) j.vx = -CFG.velocidade;
  if (teclas.ArrowRight || teclas.KeyD) j.vx =  CFG.velocidade;
  j.x += j.vx;

  // Atravessar as bordas: saiu pela esquerda, aparece na direita (e vice-versa)
  if (j.x + j.w < 0) j.x = W;
  if (j.x > W) j.x = -j.w;

  // ---- Pulo (só se estiver apoiado em algo) ----
  if ((teclas.Space || teclas.ArrowUp || teclas.KeyW) && j.noChao) {
    j.vy = CFG.forcaPulo;   // velocidade negativa = sobe
    j.noChao = false;
  }

  // ---- Gravidade e colisão com plataformas ----
  const yAntes = j.y + j.h;   // posição dos "pés" ANTES de mover
  j.vy += CFG.gravidade;      // gravidade puxa para baixo a cada frame
  j.y += j.vy;                // aplica a velocidade vertical
  j.noChao = false;

  // Só verifica pouso quando está CAINDO (vy >= 0).
  // Assim o jogador atravessa a plataforma por baixo ao subir (plataforma "one-way").
  if (j.vy >= 0) {
    for (const p of plataformas) {
      // Está alinhado horizontalmente com a plataforma?
      const sobrepoeX = j.x + j.w > p.x && j.x < p.x + p.w;
      // Os pés estavam acima do topo e agora passaram dele? Então pousou.
      if (sobrepoeX && yAntes <= p.y && j.y + j.h >= p.y) {
        j.y = p.y - j.h;    // coloca o jogador exatamente em cima
        j.vy = 0;
        j.noChao = true;
      }
    }
  }

  // ---- Obstáculos: movem de um lado a outro e matam ao encostar ----
  for (const o of obstaculos) {
    o.x += o.vx;
    if (o.x < 0 || o.x + o.w > W) o.vx *= -1;   // bate na parede e volta
    if (colide(j, o)) estado = "perdeu";
  }

  // ---- Câmera: só sobe, nunca desce ----
  // Min() porque subir = y mais negativo. Assim a câmera nunca volta.
  camY = Math.min(camY, j.y - H * 0.45);

  // ---- Perigo que sobe de baixo ----
  // Só começa depois de 180 frames (~3 segundos) para dar tempo de começar.
  if (frames > 180) {
    const zonaIdx = ZONAS.indexOf(zonaDe(altitude()));
    // Quanto mais avançada a zona, mais rápido ele sobe
    perigoY -= CFG.velPerigoBase + zonaIdx * 0.1;
  }
  // Se o jogador sobe rápido, o perigo não fica longe demais da tela
  perigoY = Math.min(perigoY, camY + H + 150);

  // Tocou no perigo?
  if (j.y + j.h > perigoY) estado = "perdeu";

  // Caiu para fora da parte de baixo da tela?
  if (j.y > camY + H) estado = "perdeu";

  // ---- Vitória ----
  if (altitude() >= CFG.metaAltura) estado = "ganhou";

  // Cria mais mundo se necessário
  gerarMundo();
}


/* ================== 7. DESENHO ==================
   Cada elemento tem sua própria função de desenho. Para colocar
   imagens (sprites) no futuro, basta alterar estas funções:

     const img = new Image();
     img.src = "personagem.png";          // (fora das funções, uma vez só)
     ctx.drawImage(img, j.x, j.y, j.w, j.h);  // (dentro da função, no lugar do fillRect)
*/

function desenharJogador(j) {
  ctx.fillStyle = "#ffd700";             // cor do corpo (amarelo)
  ctx.fillRect(j.x, j.y, j.w, j.h);      // fillRect(x, y, largura, altura)
  ctx.fillStyle = "#000";                // olhos pretos
  ctx.fillRect(j.x + 7,  j.y + 8, 5, 5);
  ctx.fillRect(j.x + 17, j.y + 8, 5, 5);
}

function desenharPlataforma(p, z) {
  ctx.fillStyle = z.plat;                // cor depende da zona atual
  ctx.fillRect(p.x, p.y, p.w, p.h);
}

function desenharObstaculo(o, z) {
  ctx.fillStyle = z.obst;
  ctx.fillRect(o.x, o.y, o.w, o.h);
}

function desenhar() {
  const alt = altitude();
  const z = zonaDe(alt);   // zona atual (define as cores)

  // ---- Fundo ----
  ctx.fillStyle = z.fundo;
  ctx.fillRect(0, 0, W, H);

  // Estrelas só no espaço (desenhadas ANTES do translate: ficam fixas na tela)
  if (z.nome === "Espaço") {
    ctx.fillStyle = "#fff";
    for (const e of estrelas) ctx.fillRect(e.x, e.y, e.t, e.t);
  }

  // ---- Mundo (com câmera) ----
  // save/restore isolam o translate para ele não afetar o HUD.
  // translate(0, -camY) "desliza" o mundo para mostrar a parte certa.
  ctx.save();
  ctx.translate(0, -camY);

  plataformas.forEach(p => desenharPlataforma(p, z));
  obstaculos.forEach(o => desenharObstaculo(o, z));
  desenharJogador(jogador);

  // Perigo: um retângulo grande que vai do perigoY para baixo
  ctx.fillStyle = z.perigo;
  ctx.fillRect(0, perigoY, W, H + 400);

  ctx.restore();

  // ---- HUD (textos na tela, fora da câmera) ----
  ctx.fillStyle = z.nome === "Céu" ? "#000" : "#fff";  // texto preto no céu claro
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Altitude: " + alt + " m", 10, 24);
  ctx.fillText("Zona: " + z.nome, 10, 46);
  ctx.textAlign = "right";
  ctx.fillText("Perigo: " + z.perigoNome, W - 10, 24);

  // ---- Tela de fim de jogo ----
  if (estado !== "jogando") {
    ctx.fillStyle = "rgba(0,0,0,0.65)";   // película escura semitransparente
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText(estado === "ganhou" ? "Você chegou ao espaço!" : "Game Over", W / 2, H / 2 - 10);
    ctx.font = "16px sans-serif";
    ctx.fillText("Altitude: " + alt + " m — aperte R para jogar de novo", W / 2, H / 2 + 25);
  }
}


/* ================== 8. LOOP PRINCIPAL ==================
   requestAnimationFrame chama a função loop de novo a cada quadro
   (normalmente 60x por segundo). Cada volta: atualiza a lógica e redesenha. */
function loop() {
  atualizar();
  desenhar();
  requestAnimationFrame(loop);
}

// ---- Início ----
iniciar();       // prepara o estado inicial
gerarMundo();    // cria as primeiras plataformas
loop();          // começa o jogo