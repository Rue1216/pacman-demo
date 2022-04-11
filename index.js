const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

//adding score with pellets
const scoreEl = document.querySelector('#scoreElement');

//set the canvas width && height equal to window size
canvas.width = innerWidth;
canvas.height = innerHeight;

//create boundaries object
class Boundary{
    static width = 40;
    static height = 40;
    constructor({ position, image }){
        this.position = position;
        this.width = 40;
        this.height = 40;
        this.image = image;
    }

    //draw the boundaries
    draw(){
        // c.fillStyle = 'blue';
        // c.fillRect(this.position.x, this.position.y, this.width, this.height);
        c.drawImage(this.image, this.position.x, this.position.y);
    }
}

//create player object
class Player{
    constructor({ position, velocity }){
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        this.radians =  0.7;
        this.openRate = 0.12;
        this.rotation = 0;
    }
    draw(){
        //adding rotating effect
        c.save();
        c.translate(this.position.x, this.position.y);
        c.rotate(this.rotation);
        c.translate(-this.position.x, -this.position.y);
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians, false);
        c.lineTo(this.position.x, this.position.y);
        c.fillStyle = 'yellow';
        c.fill();
        c.closePath();
        c.restore();
    }
    update(){
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        //make the mouse open and close
        if(this.radians < 0 || this.radians > 0.7){
            this.openRate = -this.openRate;
        }
        this.radians += this.openRate;
        
    }
}

//create pellets
class Pellet{
    constructor({ position }){
        this.position = position;
        this.radius = 2;
    }
    draw(){
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = 'white';
        c.fill();
        c.closePath();
    }
}

//create power-up
class PowerUp{
    constructor({ position }){
        this.position = position;
        this.radius = 5;
    }
    draw(){
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = 'white';
        c.fill();
        c.closePath();
    }
}

//create ghost object
class Ghost{
    static speed = 2;
    constructor({ position, velocity, color = 'red' }){
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        this.color = color;
        this.previousCollisions = [];
        this.speed = 2;
        this.scared = false;
    }
    draw(){
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.scared ? 'blue': this.color;
        c.fill();
        c.closePath();
    }
    update(){
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

const pellets = [];
const powerups = [];
const boundaries = [];
const player = new Player({
    position:{
        x: Boundary.width + Boundary.width/2,
        y: Boundary.height + Boundary.height/2,
    },
    velocity:{
        x:0,
        y:0
    }
});
const ghosts = [
    new Ghost({
        position:{
            x: Boundary.width * 5 + Boundary.width/2,
            y: Boundary.height + Boundary.height/2,
        },
        velocity:{
            x: Ghost.speed,
            y: 0
        }
    }),
    new Ghost({
        position:{
            x: Boundary.width + Boundary.width/2,
            y: Boundary.height * 11 + Boundary.height/2,
        },
        velocity:{
            x: Ghost.speed,
            y: 0
        },
        color: 'pink'
    }),
];


//default state of keys
const keys = {
    w:{
        pressed: false,
    },
    a:{
        pressed: false,
    },
    s:{
        pressed: false,
    },
    d:{
        pressed: false,
    },
}

let lastKey;
let score = 0;

//get keyboard action
addEventListener('keydown',({ key })=>{
    switch (key){
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            break
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break    
    }
})
addEventListener('keyup',({ key })=>{
    switch (key){
        case 'w':
            keys.w.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break    
    }
    
})

//generate map using symbols and actual images
const map = [
    ['1','-','-','-','-','-','-','-','-','-','2'],
    ['|',' ','p','.','.','.','.','.','.','.','|'],
    ['|','.','b','.','[','~',']','.','b','.','|'],
    ['|','.','.','.','.','=','p','.','.','.','|'],
    ['|','.','[',']','.','.','.','[',']','.','|'],
    ['|','.','.','.','.','^','.','.','.','.','|'],
    ['|','.','b','.','[','#',']','.','b','.','|'],
    ['|','.','.','.','.','=','.','.','.','.','|'],
    ['|','p','[',']','.','.','.','[',']','.','|'],
    ['|','.','.','.','.','^','.','.','.','.','|'],
    ['|','.','b','.','[','_',']','.','b','.','|'],
    ['|','.','.','.','.','.','.','.','.','p','|'],
    ['4','-','-','-','-','-','-','-','-','-','3'],
];

function createImage(src){
    const image = new Image();
    image.src = src;
    return image;
}


map.forEach((row, i) => {
    row.forEach((symbol, j) => {
        switch (symbol){
            case '-':
                boundaries.push(new Boundary({
                    position:{
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeHorizontal.png')
                }))
                break
            case '|':
                boundaries.push(new Boundary({
                    position:{
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeVertical.png')
                }))
                break
            case '1':
                boundaries.push(new Boundary({
                    position:{
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeCorner1.png')
                }))
                break
            case '2':
                boundaries.push(new Boundary({
                    position:{
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeCorner2.png')
                }))
                break
            case '3':
                boundaries.push(new Boundary({
                    position:{
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeCorner3.png')
                }))
                break
            case '4':
                boundaries.push(new Boundary({
                    position:{
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeCorner4.png')
                }))
                break
            case 'b':
                boundaries.push(new Boundary({
                    position:{
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/block.png')
                }))
                break
            case '[':
                boundaries.push(new Boundary({
                    position:{
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/capLeft.png')
                }))
                break
            case ']':
                boundaries.push(new Boundary({
                    position:{
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/capRight.png')
                }))
                break
            case '^':
                boundaries.push(new Boundary({
                    position:{
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/capTop.png')
                }))
                break
            case '=':
                boundaries.push(new Boundary({
                    position:{
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/capBottom.png')
                }))
                break
            case '~':
                boundaries.push(new Boundary({
                    position:{
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeConnectorBottom.png')
                }))
                break
            case '_':
                boundaries.push(new Boundary({
                    position:{
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeConnectorTop.png')
                }))
                break
            case '#':
                boundaries.push(new Boundary({
                    position:{
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeCross.png')
                }))
                break
            case '.':
                pellets.push(new Pellet({
                    position:{
                        x: Boundary.width * j + Boundary.width/2,
                        y: Boundary.height * i + Boundary.height/2
                    },
                
                }))
                break
            case 'p':
                powerups.push(new PowerUp({
                    position:{
                        x: Boundary.width * j + Boundary.width/2,
                        y: Boundary.height * i + Boundary.height/2
                    },
                
                }))
                break
        }
    })
})

//detect collision
function detectCollision({ circle, rectangle }){
    //default padding for correctness of collision detection
    const padding = Boundary.width/2 - circle.radius -1;
    return (
        circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding
        && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding
        && circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding
        && circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding
        )
}

//animation loop
let animationId;
function animate() {
    animationId = requestAnimationFrame(animate);
    // console.log(animationId)
    c.clearRect(0, 0, canvas.width, canvas.height);

    //collision detection & pressed key action
    if(keys.w.pressed && lastKey === 'w'){
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i];
            if(
                detectCollision({
                    circle: {
                        ...player,
                        velocity:{
                            x: 0,
                            y: -5
                        }
                    },
                    rectangle: boundary
                })
            ){
                player.velocity.y = 0;
                break
            }else{
                player.velocity.y = -5;
            }
        }
    }else if(keys.a.pressed && lastKey === 'a'){
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i];
            if(
                detectCollision({
                    circle: {
                        ...player,
                        velocity:{
                            x: -5,
                            y: 0
                        }
                    },
                    rectangle: boundary
                })
            ){
                player.velocity.x = 0;
                break
            }else{
                player.velocity.x = -5;
            }
        }
    }else if(keys.s.pressed && lastKey === 's'){
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i];
            if(
                detectCollision({
                    circle: {
                        ...player,
                        velocity:{
                            x: 0,
                            y: 5
                        }
                    },
                    rectangle: boundary
                })
            ){
                player.velocity.y = 0;
                break
            }else{
                player.velocity.y = 5;
            }
        }
    }else if(keys.d.pressed && lastKey === 'd'){
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i];
            if(
                detectCollision({
                    circle: {
                        ...player,
                        velocity:{
                            x: 5,
                            y: 0
                        }
                    },
                    rectangle: boundary
                })
            ){
                player.velocity.x = 0;
                break
            }else{
                player.velocity.x = 5;
            }
        }
    }

    //touch pellets here
    for (let i = pellets.length -1; i >= 0 ; i--) {
        const pellet = pellets[i];
        
        //remove the collided pellets
        if(Math.hypot(pellet.position.x - player.position.x, pellet.position.y - player.position.y) < pellet.radius + player.radius){
            pellets.splice( i, 1);
            score += 10;
            scoreEl.innerHTML = score;
        }
        pellet.draw();
        
    };
    
    //touch power-ups here
    for (let i = powerups.length -1; i >= 0 ; i--) {
        const powerup = powerups[i];
        powerup.draw();

        //remove the collided powerups
        if(Math.hypot(powerup.position.x - player.position.x, powerup.position.y - player.position.y) < powerup.radius + player.radius){
            powerups.splice( i, 1);

            //changing the score
            score += 50;
            scoreEl.innerHTML = score;

            //ghost scares
            ghosts.forEach((ghost)=>{
                ghost.scared = true;
                ghost.radius = 10;
                setTimeout(()=>{
                    ghost.radius = 15;
                    ghost.scared = false;
                },5000)
            });
        }
    };

    //detect collisions between player and ghost
    for (let i = ghosts.length -1; i >= 0 ; i--){
        const ghost = ghosts[i];
        if(
            Math.hypot(
                ghost.position.x - player.position.x,
                ghost.position.y - player.position.y
            ) <
            ghost.radius + player.radius
        ){
            if(ghost.scared){
                ghosts.splice(i,1);
                //changing the score
                score += 100;
                scoreEl.innerHTML = score;
            }
        }
    };
    

    //player's collision detection
    boundaries.forEach((boundary)=>{
        boundary.draw();
            //detect collision && define the player's action
            if (
                detectCollision({
                    circle: player,
                    rectangle: boundary
                })
            )
                {
                    player.velocity.x = 0;
                    player.velocity.y = 0;
                };
            });
    player.update();

    //win condition goes here
    if(pellets.length === 0){
        console.log('you win');
        cancelAnimationFrame(animationId);
    }

    //moving algorithms for ghosts
    ghosts.forEach((ghost)=>{
        ghost.update();

        //collision detection between player and ghost
        if(
            Math.hypot(
                ghost.position.x - player.position.x,
                ghost.position.y - player.position.y
            ) <
            ghost.radius + player.radius
            && !ghost.scared
        ){
            cancelAnimationFrame(animationId);
            console.log('you lose')
        }


        //ghost can detect which road to go
        const collisions = [];
        //loop over the boundaries to push collisions into array
        boundaries.forEach((boundary)=>{
            //right
            if(
                //previously IS going to right side && collision with right side is detected
                !collisions.includes('right')&&
                detectCollision({
                    circle: {
                        ...ghost,
                        velocity:{
                            x: ghost.speed,
                            y: 0
                        }
                    },
                    rectangle: boundary
                })
            ){
                collisions.push('right');
            }
            //left
            if(
                !collisions.includes('left')&&
                detectCollision({
                    circle: {
                        ...ghost,
                        velocity:{
                            x: -ghost.speed,
                            y: 0
                        }
                    },
                    rectangle: boundary
                })
            ){
                collisions.push('left');
            }
            //up
            if(
                !collisions.includes('up')&&
                detectCollision({
                    circle: {
                        ...ghost,
                        velocity:{
                            x: 0,
                            y: -ghost.speed
                        }
                    },
                    rectangle: boundary
                })
            ){
                collisions.push('up');
            }
            //down
            if(
                !collisions.includes('down')&&
                detectCollision({
                    circle: {
                        ...ghost,
                        velocity:{
                            x: 0,
                            y: ghost.speed
                        }
                    },
                    rectangle: boundary
                })
            ){
                collisions.push('down');
            }
        
        });
        //let ghost's collision information updated
        if( collisions.length > ghost.previousCollisions.length){
            ghost.previousCollisions = collisions;
        }
        
        if( JSON.stringify(collisions) !== JSON.stringify(ghost.previousCollisions)){
            if(ghost.velocity.x > 0){
                ghost.previousCollisions.push('right')
            }else if(ghost.velocity.x < 0){
                ghost.previousCollisions.push('left')
            }else if(ghost.velocity.y > 0){
                ghost.previousCollisions.push('down')
            }else if(ghost.velocity.y < 0){
                ghost.previousCollisions.push('up')
            }
            //the roads can take
            const pathways = ghost.previousCollisions.filter((collision) =>{
                return !collisions.includes(collision)
            })

            
            //randomize the ghost's behavior
            const direction = pathways[Math.floor(Math.random() * pathways.length)]
            switch(direction){
                case 'down':
                    ghost.velocity.x = 0;
                    ghost.velocity.y = ghost.speed;
                    break
                case 'up':
                    ghost.velocity.x = 0;
                    ghost.velocity.y = -ghost.speed;
                    break
                case 'right':
                    ghost.velocity.x = ghost.speed;
                    ghost.velocity.y = 0;
                    break
                case 'left':
                    ghost.velocity.x = -ghost.speed;
                    ghost.velocity.y = 0;
                    break
            }
            ghost.previousCollisions = [];
        }
    })

    //adding player rotation
    if(player.velocity.x > 0) player.rotation = 0
    else if (player.velocity.y > 0) player.rotation = Math.PI / 2
    else if (player.velocity.y < 0) player.rotation = Math.PI / 2 * 3
    else if (player.velocity.x < 0) player.rotation = Math.PI
    
}


player.draw();

animate();