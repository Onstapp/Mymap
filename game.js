let peer = null;
let conn = null;
let isHost = false;
let myId = 'player_' + Date.now();

// Позиции
let myX = 0, myY = 0;
let otherX = 0, otherY = 0;
let blocks = []; // {x, y, owner}

let ctx = document.getElementById('canvas').getContext('2d');

// Создать игру
function createGame() {
    let name = document.getElementById('name').value;
    if (name.length < 3) {
        alert('Имя должно быть от 3 символов');
        return;
    }
    
    isHost = true;
    let roomId = Math.floor(1000 + Math.random() * 9000).toString();
    
    peer = new Peer(roomId);
    
    peer.on('open', () => {
        document.getElementById('code').innerHTML = 'КОД: ' + roomId;
        document.getElementById('game').style.display = 'block';
        
        peer.on('connection', (c) => {
            conn = c;
            conn.on('data', (data) => {
                if (data.type === 'move') {
                    otherX = data.x;
                    otherY = data.y;
                }
                if (data.type === 'block') {
                    blocks.push({x: data.x, y: data.y, owner: 'other'});
                }
            });
        });
        
        gameLoop();
    });
}

// Присоединиться
function joinGame() {
    let name = document.getElementById('name').value;
    if (name.length < 3) {
        alert('Имя должно быть от 3 символов');
        return;
    }
    
    let roomId = prompt('Введи код комнаты:');
    if (!roomId) return;
    
    peer = new Peer();
    
    peer.on('open', () => {
        conn = peer.connect(roomId);
        
        conn.on('open', () => {
            document.getElementById('game').style.display = 'block';
            
            conn.on('data', (data) => {
                if (data.type === 'move') {
                    otherX = data.x;
                    otherY = data.y;
                }
                if (data.type === 'block') {
                    blocks.push({x: data.x, y: data.y, owner: 'other'});
                }
            });
            
            gameLoop();
        });
    });
}

// Отправка позиции
function sendMove() {
    if (conn) {
        conn.send({type: 'move', x: myX, y: myY});
    }
}

// Поставить блок
function placeBlock() {
    if (conn) {
        blocks.push({x: myX, y: myY, owner: 'me'});
        conn.send({type: 'block', x: myX, y: myY});
    }
}

// Выход
function exit() {
    location.reload();
}

// Управление пальцем
let touchStart = null;

document.addEventListener('touchstart', (e) => {
    e.preventDefault();
    let touch = e.touches[0];
    touchStart = {x: touch.clientX, y: touch.clientY};
});

document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (touchStart) {
        let touch = e.touches[0];
        let dx = (touch.clientX - touchStart.x) / 3;
        let dy = (touch.clientY - touchStart.y) / 3;
        
        myX += dx;
        myY += dy;
        
        sendMove();
        
        touchStart = {x: touch.clientX, y: touch.clientY};
    }
});

document.addEventListener('touchend', () => {
    touchStart = null;
});

// Игровой цикл
function gameLoop() {
    ctx.clearRect(0, 0, 600, 600);
    
    // Фон
    ctx.fillStyle = '#7cb57c';
    ctx.fillRect(0, 0, 600, 600);
    
    // Блоки
    blocks.forEach(b => {
        ctx.fillStyle = b.owner === 'me' ? '#7fd4ff' : '#ff7f7f';
        ctx.beginPath();
        ctx.arc(300 + (b.x - myX), 300 + (b.y - myY), 15, 0, Math.PI*2);
        ctx.fill();
    });
    
    // Другой игрок
    ctx.fillStyle = '#ff7f7f';
    ctx.beginPath();
    ctx.arc(300 + (otherX - myX), 300 + (otherY - myY), 20, 0, Math.PI*2);
    ctx.fill();
    
    // Я
    ctx.fillStyle = '#7fd4ff';
    ctx.beginPath();
    ctx.arc(300, 300, 20, 0, Math.PI*2);
    ctx.fill();
    
    requestAnimationFrame(gameLoop);
}