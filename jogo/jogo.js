/* =====================================================================
   RUMO AO ESPAÇO

   - Dois jogadores: J1 (W A D / Espaço) e J2 (setas). Corrida até o espaço.
   - Todos os elementos são desenhados com formas do canvas.
   - Só usa "function" e "for" simples. Nada de setas (=>), map, filter etc.

   COMO LER UM FOR SIMPLES:
     for (let i = 0; i < lista.length; i++) {
       const item = lista[i];   // pega o item de posição i
       ...                      // faz algo com ele
     }
   Começa em i = 0 e repete até passar por todos os itens da lista.

   COORDENADAS: o Y cresce para BAIXO. O chão fica em y = 0 e, quanto
   mais alto o jogador vai, mais NEGATIVO fica o y. Altitude = -y.
   ===================================================================== */


/* ================== 1. CONFIGURAÇÕES ================== */
const CFG = {
  doisJogadores: true,        // false = só o jogador 1
  gravidade: 0.55,
  forcaPulo: -13,
  velocidade: 4,
  metaAltura: 5000,           // altitude para vencer
  distMinPlataformas: 75,     // distância vertical mínima entre plataformas
  distMaxPlataformas: 110,    // distância vertical máxima (se aumentar muito, o pulo não alcança!)
  chanceObstaculo: 0.3,       // 0.3 = 30% de chance por plataforma
  velPerigoBase: 0.35         // velocidade do perigo que sobe de baixo
};

/* ---------- JOGADORES ----------
   Cada jogador tem nome, cor e as teclas (listas de códigos de tecla). */
const JOGADORES_CFG = [
  { nome: "J1", cor: "#ffd700",
    teclas: { esq: ["KeyA"], dir: ["KeyD"], pulo: ["KeyW", "Space"] } },
  { nome: "J2", cor: "#ff5fa2",
    teclas: { esq: ["ArrowLeft"], dir: ["ArrowRight"], pulo: ["ArrowUp"] } }
];

/* ---------- ZONAS ----------
   - ate: até qual altitude a zona vai
   - fundo: cor do fundo
   - perigo: cor do perigo que sobe e perigoNome: o nome dele
   - desenhaPlat / desenhaObst: funções que desenham a plataforma e o
     obstáculo da zona (estão na seção 6)
   A ÚLTIMA zona deve ter um "ate" bem grande (nunca acaba). */
const ZONAS = [
  { nome: "Subterrâneo", ate: 1500, fundo: "#3b2a1e",
    perigo: "#ff6a00", perigoNome: "Lava",
    desenhaPlat: desenharRocha, desenhaObst: desenharCaveira },

  { nome: "Céu", ate: 3500, fundo: "#6ec6ff",
    perigo: "#555a6e", perigoNome: "Tempestade",
    desenhaPlat: desenharNuvem, desenhaObst: desenharAviao },

  { nome: "Espaço", ate: 99999, fundo: "#05051a",
    perigo: "#7a00cc", perigoNome: "Buraco negro",
    desenhaPlat: desenharSatelite, desenhaObst: desenharMeteoro }
];


/* ================== 2. PREPARAÇÃO (canvas e teclado) ================== */
const canvas = document.getElementById("jogo");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

const teclas = {};   // teclas["KeyA"] = true enquanto A estiver apertada

// Roda quando uma tecla é apertada
function aoApertarTecla(e) {
  teclas[e.code] = true;

  // Impede que espaço e setas rolem a página do navegador
  if (e.code === "Space" || e.code === "ArrowUp" || e.code === "ArrowDown" ||
      e.code === "ArrowLeft" || e.code === "ArrowRight") {
    e.preventDefault();
  }

  // R reinicia o jogo
  if (e.code === "KeyR") {
    iniciar();
  }
}

// Roda quando uma tecla é solta
function aoSoltarTecla(e) {
  teclas[e.code] = false;
}

// "Avisa" o navegador para chamar as funções acima quando houver teclado
addEventListener("keydown", aoApertarTecla);
addEventListener("keyup", aoSoltarTecla);

// Estado do jogo (preenchido na função iniciar)
let jogadores;     // lista de jogadores
let plataformas;   // lista de plataformas
let obstaculos;    // lista de obstáculos
let estrelas;      // estrelinhas do fundo (só aparecem no espaço)
let camY;          // posição da câmera
let perigoY;       // altura do perigo que sobe
let ultimoY;       // y da última plataforma criada
let frames;        // contador de quadros
let estado;        // "jogando", "perdeu" ou "ganhou"
let vencedor;      // jogador que chegou à meta


/* ================== 3. FUNÇÕES AUXILIARES ================== */

// Sorteia um número decimal entre a e b
function aleat(a, b) {
  return a + Math.random() * (b - a);
}

// Devolve true se ALGUMA tecla da lista estiver apertada.
// Ex: apertada(["KeyW", "Space"]) -> true se W ou Espaço estiver apertado.
function apertada(lista) {
  for (let i = 0; i < lista.length; i++) {
    if (teclas[lista[i]] === true) {
      return true;     // achou uma apertada, já pode responder
    }
  }
  return false;        // passou por todas e nenhuma estava apertada
}

// Altitude de UM jogador (nunca negativa)
function altDe(j) {
  return Math.max(0, Math.floor(-j.y));
}

// Descobre a POSIÇÃO da zona (0, 1 ou 2) para uma altitude:
// a primeira zona cujo "ate" ainda é maior que a altitude.
function indiceZona(alt) {
  for (let i = 0; i < ZONAS.length; i++) {
    if (alt < ZONAS[i].ate) {
      return i;
    }
  }
  return ZONAS.length - 1;   // por segurança, devolve a última
}

// Devolve a zona (o objeto inteiro) para uma altitude
function zonaDe(alt) {
  return ZONAS[indiceZona(alt)];
}

// O "líder" é o jogador mais alto que ainda está vivo.
// Se todos morreram, é o mais alto entre todos.
// A câmera, a zona e a velocidade do perigo seguem o líder.
function lider() {
  let melhor = null;

  // Primeiro: procura o mais alto entre os VIVOS (mais alto = menor y)
  for (let i = 0; i < jogadores.length; i++) {
    const j = jogadores[i];
    if (j.vivo && (melhor === null || j.y < melhor.y)) {
      melhor = j;
    }
  }
  if (melhor !== null) {
    return melhor;
  }

  // Ninguém vivo: procura o mais alto entre todos
  melhor = jogadores[0];
  for (let i = 1; i < jogadores.length; i++) {
    if (jogadores[i].y < melhor.y) {
      melhor = jogadores[i];
    }
  }
  return melhor;
}

// Colisão entre dois retângulos (a e b): se sobrepõem na horizontal E na vertical
function colide(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}


/* ================== 4. INICIAR / REINICIAR ================== */
function iniciar() {
  const quantos = CFG.doisJogadores ? 2 : 1;

  // Cria os jogadores a partir de JOGADORES_CFG
  jogadores = [];
  for (let i = 0; i < quantos; i++) {
    jogadores.push({
      cfg: JOGADORES_CFG[i],                    // nome, cor e teclas
      x: (W / (quantos + 1)) * (i + 1) - 14,    // espalha os jogadores no chão
      y: -50, w: 28, h: 28,
      vx: 0, vy: 0, noChao: false,
      vivo: true
    });
  }

  plataformas = [{ x: 0, y: 0, w: W, h: 20 }];  // chão
  obstaculos = [];

  // Cria 60 estrelas em posições aleatórias
  estrelas = [];
  for (let i = 0; i < 60; i++) {
    estrelas.push({
      x: Math.random() * W,
      y: Math.random() * H,
      t: Math.random() * 2 + 1                  // tamanho da estrela
    });
  }

  ultimoY = 0;
  camY = -H + 120;
  perigoY = 250;
  estado = "jogando";
  vencedor = null;
  frames = 0;
  gerarMundo();
}


/* ================== 5. GERAÇÃO DO MUNDO ================== */
function gerarMundo() {
  // Cria plataformas até ter 800 pixels de mundo acima da tela
  while (ultimoY > camY - 800) {
    ultimoY -= aleat(CFG.distMinPlataformas, CFG.distMaxPlataformas);

    const larg = aleat(70, 110);
    plataformas.push({ x: aleat(0, W - larg), y: ultimoY, w: larg, h: 14 });

    // Às vezes cria um obstáculo logo acima da plataforma
    if (Math.random() < CFG.chanceObstaculo && -ultimoY > 200) {
      obstaculos.push({
        x: aleat(0, W - 32),
        y: ultimoY - aleat(30, 55),
        w: 32, h: 24,
        vx: (Math.random() < 0.5 ? -1 : 1) * aleat(1.2, 2.5)  // direção sorteada
      });
    }
  }

  // Apaga o que ficou muito abaixo da tela.
  // Cria uma lista nova só com o que deve ficar.
  const limite = camY + H + 300;

  const platNovas = [];
  for (let i = 0; i < plataformas.length; i++) {
    if (plataformas[i].y < limite) {
      platNovas.push(plataformas[i]);
    }
  }
  plataformas = platNovas;

  const obstNovos = [];
  for (let i = 0; i < obstaculos.length; i++) {
    if (obstaculos[i].y < limite) {
      obstNovos.push(obstaculos[i]);
    }
  }
  obstaculos = obstNovos;
}


/* ================== 6. DESENHOS DOS ELEMENTOS ==================
   Cada função recebe a plataforma (p) ou o obstáculo (o) e desenha
   usando formas do canvas. */

// ---- Jogador ----
function desenharJogador(j) {
  ctx.fillStyle = j.cfg.cor;                    // corpo colorido
  ctx.fillRect(j.x, j.y, j.w, j.h);
  ctx.fillStyle = "#000";                       // olhos
  ctx.fillRect(j.x + 7, j.y + 8, 5, 5);
  ctx.fillRect(j.x + 17, j.y + 8, 5, 5);

  // Nome acima do jogador (para saber quem é quem)
  ctx.fillStyle = j.cfg.cor;
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(j.cfg.nome, j.x + j.w / 2, j.y - 4);
}

// ---- Subterrâneo ----
function desenharRocha(p) {
  ctx.fillStyle = "#8d6e4c";
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.fillStyle = "#a98a64";                    // faixa clara em cima
  ctx.fillRect(p.x, p.y, p.w, 4);
  ctx.fillStyle = "#6b5238";                    // pedrinhas escuras
  for (let i = 10; i < p.w - 6; i += 22) {
    ctx.fillRect(p.x + i, p.y + 8, 6, 3);
  }
}

function desenharCaveira(o) {
  const cx = o.x + o.w / 2;
  const cy = o.y + o.h / 2;
  ctx.fillStyle = "#f2f2f2";
  ctx.beginPath();
  ctx.arc(cx, cy - 2, 10, 0, Math.PI * 2);      // crânio
  ctx.fill();
  ctx.fillRect(cx - 6, cy + 5, 12, 6);          // mandíbula
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(cx - 4, cy - 3, 2.5, 0, Math.PI * 2); // olho esquerdo
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 4, cy - 3, 2.5, 0, Math.PI * 2); // olho direito
  ctx.fill();
  ctx.fillRect(cx - 1, cy + 1, 2, 3);           // nariz
  ctx.fillStyle = "#999";                       // dentes
  for (let i = -4; i <= 2; i += 3) {
    ctx.fillRect(cx + i, cy + 7, 1, 4);
  }
}

// ---- Céu ----
function desenharNuvem(p) {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(p.x + p.w / 2, p.y + 9, p.w / 2, 6, 0, 0, Math.PI * 2);  // base
  ctx.fill();
  ctx.beginPath();
  ctx.arc(p.x + p.w * 0.30, p.y + 8, 6, 0, Math.PI * 2);               // bolinhas
  ctx.fill();
  ctx.beginPath();
  ctx.arc(p.x + p.w * 0.55, p.y + 7, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(p.x + p.w * 0.78, p.y + 9, 5, 0, Math.PI * 2);
  ctx.fill();
}

function desenharAviao(o) {
  ctx.save();
  ctx.translate(o.x + o.w / 2, o.y + o.h / 2);  // origem no centro do avião
  if (o.vx < 0) {
    ctx.scale(-1, 1);                           // espelha quando vai para a esquerda
  }

  ctx.fillStyle = "#d9d9d9";                    // fuselagem
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#c0392b";                    // asa de cima
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.lineTo(-8, -11);
  ctx.lineTo(3, 0);
  ctx.fill();

  ctx.beginPath();                              // asa de baixo
  ctx.moveTo(-2, 0);
  ctx.lineTo(-8, 11);
  ctx.lineTo(3, 0);
  ctx.fill();

  ctx.beginPath();                              // cauda
  ctx.moveTo(-15, 0);
  ctx.lineTo(-15, -7);
  ctx.lineTo(-10, -1);
  ctx.fill();

  ctx.fillStyle = "#3498db";                    // janela
  ctx.fillRect(5, -3, 5, 3);
  ctx.restore();
}

// ---- Espaço ----
function desenharSatelite(p) {
  const corpoW = p.w * 0.36;
  const corpoX = p.x + (p.w - corpoW) / 2;

  ctx.fillStyle = "#2b6cb0";                    // painéis solares
  ctx.fillRect(p.x, p.y + 2, p.w * 0.30, p.h - 4);
  ctx.fillRect(p.x + p.w * 0.70, p.y + 2, p.w * 0.30, p.h - 4);

  ctx.fillStyle = "#7fb3e8";                    // divisões dos painéis
  for (let i = 1; i < 3; i++) {
    ctx.fillRect(p.x + (p.w * 0.30 / 3) * i, p.y + 2, 1, p.h - 4);
    ctx.fillRect(p.x + p.w * 0.70 + (p.w * 0.30 / 3) * i, p.y + 2, 1, p.h - 4);
  }

  ctx.fillStyle = "#b8bccc";                    // corpo
  ctx.fillRect(corpoX, p.y, corpoW, p.h);
  ctx.fillStyle = "#555";                       // antena
  ctx.fillRect(corpoX + corpoW / 2 - 1, p.y - 3, 2, 4);
}

function desenharMeteoro(o) {
  const cx = o.x + o.w / 2;
  const cy = o.y + o.h / 2;
  const r = Math.min(o.w, o.h) / 2;
  const lado = o.vx > 0 ? -1 : 1;               // chama fica atrás do meteoro

  ctx.fillStyle = "#ff8a00";                    // chama
  ctx.beginPath();
  ctx.moveTo(cx + lado * r * 0.5, cy - r * 0.7);
  ctx.lineTo(cx + lado * (r + 8), cy);
  ctx.lineTo(cx + lado * r * 0.5, cy + r * 0.7);
  ctx.fill();

  ctx.fillStyle = "#8a6d5a";                    // rocha
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#5e4838";                    // crateras
  ctx.beginPath();
  ctx.arc(cx - 4, cy - 3, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 4, cy + 4, 2.5, 0, Math.PI * 2);
  ctx.fill();
}


/* ================== 7. ATUALIZAÇÃO (lógica) ================== */
function atualizar() {
  if (estado !== "jogando") {
    return;                                     // se acabou, congela tudo
  }
  frames++;

  // ---- Cada jogador vivo é atualizado separadamente ----
  for (let i = 0; i < jogadores.length; i++) {
    const j = jogadores[i];
    if (!j.vivo) {
      continue;                                 // pula jogadores que já caíram
    }
    const t = j.cfg.teclas;

    // Movimento horizontal (teclas DESTE jogador)
    j.vx = 0;
    if (apertada(t.esq)) {
      j.vx = -CFG.velocidade;
    }
    if (apertada(t.dir)) {
      j.vx = CFG.velocidade;
    }
    j.x += j.vx;

    // Atravessar as bordas da tela
    if (j.x + j.w < 0) {
      j.x = W;
    }
    if (j.x > W) {
      j.x = -j.w;
    }

    // Pulo (só se estiver apoiado em algo)
    if (apertada(t.pulo) && j.noChao) {
      j.vy = CFG.forcaPulo;
      j.noChao = false;
    }

    // Gravidade
    const yAntes = j.y + j.h;                   // posição dos pés antes de mover
    j.vy += CFG.gravidade;
    j.y += j.vy;
    j.noChao = false;

    // Pouso em plataformas (só quando está caindo)
    if (j.vy >= 0) {
      for (let k = 0; k < plataformas.length; k++) {
        const p = plataformas[k];
        const sobrepoeX = j.x + j.w > p.x && j.x < p.x + p.w;
        if (sobrepoeX && yAntes <= p.y && j.y + j.h >= p.y) {
          j.y = p.y - j.h;                      // coloca em cima da plataforma
          j.vy = 0;
          j.noChao = true;
        }
      }
    }

    // Colisão com obstáculos
    for (let k = 0; k < obstaculos.length; k++) {
      if (colide(j, obstaculos[k])) {
        j.vivo = false;
      }
    }

    // Tocou no perigo que sobe
    if (j.y + j.h > perigoY) {
      j.vivo = false;
    }
  }

  // ---- Obstáculos se movem (uma vez por frame) ----
  for (let i = 0; i < obstaculos.length; i++) {
    const o = obstaculos[i];
    o.x += o.vx;
    if (o.x < 0 || o.x + o.w > W) {
      o.vx = -o.vx;                             // bate na parede e volta
    }
  }

  // ---- Câmera segue o líder (só sobe) ----
  const lid = lider();
  camY = Math.min(camY, lid.y - H * 0.45);

  // Quem ficou abaixo da tela cai e morre
  for (let i = 0; i < jogadores.length; i++) {
    if (jogadores[i].vivo && jogadores[i].y > camY + H) {
      jogadores[i].vivo = false;
    }
  }

  // ---- Perigo que sobe (começa depois de ~3 segundos) ----
  if (frames > 180) {
    const zonaIdx = indiceZona(altDe(lid));
    perigoY -= CFG.velPerigoBase + zonaIdx * 0.1;   // mais rápido a cada zona
  }
  perigoY = Math.min(perigoY, camY + H + 150);

  // ---- Vitória: o primeiro vivo a chegar na meta ganha ----
  for (let i = 0; i < jogadores.length; i++) {
    const j = jogadores[i];
    if (j.vivo && altDe(j) >= CFG.metaAltura && estado === "jogando") {
      estado = "ganhou";
      vencedor = j;
    }
  }

  // ---- Derrota: todos mortos ----
  let todosMortos = true;
  for (let i = 0; i < jogadores.length; i++) {
    if (jogadores[i].vivo) {
      todosMortos = false;
    }
  }
  if (estado === "jogando" && todosMortos) {
    estado = "perdeu";
  }

  gerarMundo();
}


/* ================== 8. DESENHO DA TELA ================== */
function desenhar() {
  const lid = lider();
  const z = zonaDe(altDe(lid));

  // Fundo
  ctx.fillStyle = z.fundo;
  ctx.fillRect(0, 0, W, H);

  // Estrelas só no espaço (desenhadas antes da câmera: ficam fixas na tela)
  if (z.nome === "Espaço") {
    ctx.fillStyle = "#fff";
    for (let i = 0; i < estrelas.length; i++) {
      ctx.fillRect(estrelas[i].x, estrelas[i].y, estrelas[i].t, estrelas[i].t);
    }
  }

  // Mundo (com câmera)
  ctx.save();
  ctx.translate(0, -camY);

  for (let i = 0; i < plataformas.length; i++) {
    z.desenhaPlat(plataformas[i]);
  }
  for (let i = 0; i < obstaculos.length; i++) {
    z.desenhaObst(obstaculos[i]);
  }
  for (let i = 0; i < jogadores.length; i++) {
    if (jogadores[i].vivo) {                    // só desenha os vivos
      desenharJogador(jogadores[i]);
    }
  }

  ctx.fillStyle = z.perigo;                     // perigo que sobe
  ctx.fillRect(0, perigoY, W, H + 400);
  ctx.restore();

  // ---- HUD (textos fixos na tela) ----
  const corTexto = z.nome === "Céu" ? "#000" : "#fff";   // preto no céu claro

  ctx.fillStyle = corTexto;
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Altitude: " + altDe(lid) + " m", 10, 24);
  ctx.fillText("Zona: " + z.nome, 10, 46);

  // Uma linha por jogador, na cor dele
  ctx.font = "bold 13px sans-serif";
  for (let i = 0; i < jogadores.length; i++) {
    const j = jogadores[i];
    let texto = j.cfg.nome + ": ";
    if (j.vivo) {
      texto += altDe(j) + " m";
    } else {
      texto += "caiu";
    }
    ctx.fillStyle = j.cfg.cor;
    ctx.fillText(texto, 10, 68 + i * 18);
  }

  ctx.fillStyle = corTexto;
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("Perigo: " + z.perigoNome, W - 10, 24);

  // ---- Tela final ----
  if (estado !== "jogando") {
    ctx.fillStyle = "rgba(0,0,0,0.65)";         // película escura
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "bold 26px sans-serif";

    let titulo = "Game Over";
    if (estado === "ganhou") {
      if (CFG.doisJogadores) {
        titulo = vencedor.cfg.nome + " chegou ao espaço!";
      } else {
        titulo = "Você chegou ao espaço!";
      }
    }
    ctx.fillText(titulo, W / 2, H / 2 - 10);

    ctx.font = "16px sans-serif";
    ctx.fillText("Aperte R para jogar de novo", W / 2, H / 2 + 25);
  }
}


/* ================== 9. LOOP PRINCIPAL ==================
   requestAnimationFrame chama a função loop de novo a cada quadro
   (normalmente 60 vezes por segundo). */
function loop() {
  atualizar();
  desenhar();
  requestAnimationFrame(loop);
}

iniciar();
loop();