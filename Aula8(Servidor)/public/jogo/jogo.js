const CFG = {
  doisJogadores: true,
  gravidade: 0.55,
  forcaPulo: -13,
  velocidade: 4,
  metaAltura: 5000,
  distMinPlataformas: 75,
  distMaxPlataformas: 110,
  chanceObstaculo: 0.3,
  velPerigoBase: 0.35
};

const JOGADORES_CFG = [
  { nome: "J1", cor: "#ffd700",
    teclas: { esq: ["KeyA"], dir: ["KeyD"], pulo: ["KeyW", "Space"] } },
  { nome: "J2", cor: "#ff5fa2",
    teclas: { esq: ["ArrowLeft"], dir: ["ArrowRight"], pulo: ["ArrowUp"] } }
];

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

const canvas = document.getElementById("jogo");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

const teclas = {};

function aoApertarTecla(e) {
  teclas[e.code] = true;

  if (e.code === "Space" || e.code === "ArrowUp" || e.code === "ArrowDown" ||
      e.code === "ArrowLeft" || e.code === "ArrowRight") {
    e.preventDefault();
  }

  if (e.code === "KeyR") {
    iniciar();
  }
}

function aoSoltarTecla(e) {
  teclas[e.code] = false;
}

addEventListener("keydown", aoApertarTecla);
addEventListener("keyup", aoSoltarTecla);

let jogadores;
let plataformas;
let obstaculos;
let estrelas;
let camY;
let perigoY;
let ultimoY;
let frames;
let estado;
let vencedor;

function aleat(a, b) {
  return a + Math.random() * (b - a);
}

function apertada(lista) {
  for (let i = 0; i < lista.length; i++) {
    if (teclas[lista[i]] === true) {
      return true;
    }
  }
  return false;
}

function altDe(j) {
  return Math.max(0, Math.floor(-j.y));
}

function indiceZona(alt) {
  for (let i = 0; i < ZONAS.length; i++) {
    if (alt < ZONAS[i].ate) {
      return i;
    }
  }
  return ZONAS.length - 1;
}

function zonaDe(alt) {
  return ZONAS[indiceZona(alt)];
}

function lider() {
  let melhor = null;

  for (let i = 0; i < jogadores.length; i++) {
    const j = jogadores[i];
    if (j.vivo && (melhor === null || j.y < melhor.y)) {
      melhor = j;
    }
  }
  if (melhor !== null) {
    return melhor;
  }

  melhor = jogadores[0];
  for (let i = 1; i < jogadores.length; i++) {
    if (jogadores[i].y < melhor.y) {
      melhor = jogadores[i];
    }
  }
  return melhor;
}

function colide(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

function iniciar() {
  const quantos = CFG.doisJogadores ? 2 : 1;

  jogadores = [];
  for (let i = 0; i < quantos; i++) {
    jogadores.push({
      cfg: JOGADORES_CFG[i],
      x: (W / (quantos + 1)) * (i + 1) - 14,
      y: -50, w: 28, h: 28,
      vx: 0, vy: 0, noChao: false,
      vivo: true
    });
  }

  plataformas = [{ x: 0, y: 0, w: W, h: 20 }];
  obstaculos = [];

  estrelas = [];
  for (let i = 0; i < 60; i++) {
    estrelas.push({
      x: Math.random() * W,
      y: Math.random() * H,
      t: Math.random() * 2 + 1
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

function gerarMundo() {

  while (ultimoY > camY - 800) {
    ultimoY -= aleat(CFG.distMinPlataformas, CFG.distMaxPlataformas);

    const larg = aleat(70, 110);
    plataformas.push({ x: aleat(0, W - larg), y: ultimoY, w: larg, h: 14 });

    if (Math.random() < CFG.chanceObstaculo && -ultimoY > 200) {
      obstaculos.push({
        x: aleat(0, W - 32),
        y: ultimoY - aleat(30, 55),
        w: 32, h: 24,
        vx: (Math.random() < 0.5 ? -1 : 1) * aleat(1.2, 2.5)
      });
    }
  }

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

function desenharJogador(j) {
  ctx.fillStyle = j.cfg.cor;
  ctx.fillRect(j.x, j.y, j.w, j.h);
  ctx.fillStyle = "#000";
  ctx.fillRect(j.x + 7, j.y + 8, 5, 5);
  ctx.fillRect(j.x + 17, j.y + 8, 5, 5);

  ctx.fillStyle = j.cfg.cor;
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(j.cfg.nome, j.x + j.w / 2, j.y - 4);
}

function desenharRocha(p) {
  ctx.fillStyle = "#8d6e4c";
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.fillStyle = "#a98a64";
  ctx.fillRect(p.x, p.y, p.w, 4);
  ctx.fillStyle = "#6b5238";
  for (let i = 10; i < p.w - 6; i += 22) {
    ctx.fillRect(p.x + i, p.y + 8, 6, 3);
  }
}

function desenharCaveira(o) {
  const cx = o.x + o.w / 2;
  const cy = o.y + o.h / 2;
  ctx.fillStyle = "#f2f2f2";
  ctx.beginPath();
  ctx.arc(cx, cy - 2, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cx - 6, cy + 5, 12, 6);
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(cx - 4, cy - 3, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 4, cy - 3, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cx - 1, cy + 1, 2, 3);
  ctx.fillStyle = "#999";
  for (let i = -4; i <= 2; i += 3) {
    ctx.fillRect(cx + i, cy + 7, 1, 4);
  }
}

function desenharNuvem(p) {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(p.x + p.w / 2, p.y + 9, p.w / 2, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(p.x + p.w * 0.30, p.y + 8, 6, 0, Math.PI * 2);
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
  ctx.translate(o.x + o.w / 2, o.y + o.h / 2);
  if (o.vx < 0) {
    ctx.scale(-1, 1);
  }

  ctx.fillStyle = "#d9d9d9";
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#c0392b";
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.lineTo(-8, -11);
  ctx.lineTo(3, 0);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.lineTo(-8, 11);
  ctx.lineTo(3, 0);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-15, 0);
  ctx.lineTo(-15, -7);
  ctx.lineTo(-10, -1);
  ctx.fill();

  ctx.fillStyle = "#3498db";
  ctx.fillRect(5, -3, 5, 3);
  ctx.restore();
}

function desenharSatelite(p) {
  const corpoW = p.w * 0.36;
  const corpoX = p.x + (p.w - corpoW) / 2;

  ctx.fillStyle = "#2b6cb0";
  ctx.fillRect(p.x, p.y + 2, p.w * 0.30, p.h - 4);
  ctx.fillRect(p.x + p.w * 0.70, p.y + 2, p.w * 0.30, p.h - 4);

  ctx.fillStyle = "#7fb3e8";
  for (let i = 1; i < 3; i++) {
    ctx.fillRect(p.x + (p.w * 0.30 / 3) * i, p.y + 2, 1, p.h - 4);
    ctx.fillRect(p.x + p.w * 0.70 + (p.w * 0.30 / 3) * i, p.y + 2, 1, p.h - 4);
  }

  ctx.fillStyle = "#b8bccc";
  ctx.fillRect(corpoX, p.y, corpoW, p.h);
  ctx.fillStyle = "#555";
  ctx.fillRect(corpoX + corpoW / 2 - 1, p.y - 3, 2, 4);
}

function desenharMeteoro(o) {
  const cx = o.x + o.w / 2;
  const cy = o.y + o.h / 2;
  const r = Math.min(o.w, o.h) / 2;
  const lado = o.vx > 0 ? -1 : 1;

  ctx.fillStyle = "#ff8a00";
  ctx.beginPath();
  ctx.moveTo(cx + lado * r * 0.5, cy - r * 0.7);
  ctx.lineTo(cx + lado * (r + 8), cy);
  ctx.lineTo(cx + lado * r * 0.5, cy + r * 0.7);
  ctx.fill();

  ctx.fillStyle = "#8a6d5a";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#5e4838";
  ctx.beginPath();
  ctx.arc(cx - 4, cy - 3, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 4, cy + 4, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function atualizar() {
  if (estado !== "jogando") {
    return;
  }
  frames++;

  for (let i = 0; i < jogadores.length; i++) {
    const j = jogadores[i];
    if (!j.vivo) {
      continue;
    }
    const t = j.cfg.teclas;

    j.vx = 0;
    if (apertada(t.esq)) {
      j.vx = -CFG.velocidade;
    }
    if (apertada(t.dir)) {
      j.vx = CFG.velocidade;
    }
    j.x += j.vx;

    if (j.x + j.w < 0) {
      j.x = W;
    }
    if (j.x > W) {
      j.x = -j.w;
    }

    if (apertada(t.pulo) && j.noChao) {
      j.vy = CFG.forcaPulo;
      j.noChao = false;
    }

    const yAntes = j.y + j.h;
    j.vy += CFG.gravidade;
    j.y += j.vy;
    j.noChao = false;

    if (j.vy >= 0) {
      for (let k = 0; k < plataformas.length; k++) {
        const p = plataformas[k];
        const sobrepoeX = j.x + j.w > p.x && j.x < p.x + p.w;
        if (sobrepoeX && yAntes <= p.y && j.y + j.h >= p.y) {
          j.y = p.y - j.h;
          j.vy = 0;
          j.noChao = true;
        }
      }
    }

    for (let k = 0; k < obstaculos.length; k++) {
      if (colide(j, obstaculos[k])) {
        j.vivo = false;
      }
    }

    if (j.y + j.h > perigoY) {
      j.vivo = false;
    }
  }

  for (let i = 0; i < obstaculos.length; i++) {
    const o = obstaculos[i];
    o.x += o.vx;
    if (o.x < 0 || o.x + o.w > W) {
      o.vx = -o.vx;
    }
  }

  const lid = lider();
  camY = Math.min(camY, lid.y - H * 0.45);

  for (let i = 0; i < jogadores.length; i++) {
    if (jogadores[i].vivo && jogadores[i].y > camY + H) {
      jogadores[i].vivo = false;
    }
  }

  if (frames > 180) {
    const zonaIdx = indiceZona(altDe(lid));
    perigoY -= CFG.velPerigoBase + zonaIdx * 0.1;
  }
  perigoY = Math.min(perigoY, camY + H + 150);

  for (let i = 0; i < jogadores.length; i++) {
    const j = jogadores[i];
    if (j.vivo && altDe(j) >= CFG.metaAltura && estado === "jogando") {
      estado = "ganhou";
      vencedor = j;
    }
  }

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

function desenhar() {
  const lid = lider();
  const z = zonaDe(altDe(lid));

  ctx.fillStyle = z.fundo;
  ctx.fillRect(0, 0, W, H);

  if (z.nome === "Espaço") {
    ctx.fillStyle = "#fff";
    for (let i = 0; i < estrelas.length; i++) {
      ctx.fillRect(estrelas[i].x, estrelas[i].y, estrelas[i].t, estrelas[i].t);
    }
  }

  ctx.save();
  ctx.translate(0, -camY);

  for (let i = 0; i < plataformas.length; i++) {
    z.desenhaPlat(plataformas[i]);
  }
  for (let i = 0; i < obstaculos.length; i++) {
    z.desenhaObst(obstaculos[i]);
  }
  for (let i = 0; i < jogadores.length; i++) {
    if (jogadores[i].vivo) {
      desenharJogador(jogadores[i]);
    }
  }

  ctx.fillStyle = z.perigo;
  ctx.fillRect(0, perigoY, W, H + 400);
  ctx.restore();

  const corTexto = z.nome === "Céu" ? "#000" : "#fff";

  ctx.fillStyle = corTexto;
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Altitude: " + altDe(lid) + " m", 10, 24);
  ctx.fillText("Zona: " + z.nome, 10, 46);

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

  if (estado !== "jogando") {
    ctx.fillStyle = "rgba(0,0,0,0.65)";
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

function loop() {
  atualizar();
  desenhar();
  requestAnimationFrame(loop);
}

iniciar();
loop();