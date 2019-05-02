    var config = {   
    type: Phaser.AUTO,   
    width: 1200,   
    height: 600,    
    pixelArt: false,
    physics: {      
        default: 'arcade',       
        arcade: {           
            gravity: { y: 200},                
        }   

    },   
    scene: {       
        preload: preload,       
        create: create,         
        update: update   
    }
};

var game=new Phaser.Game(config);

var enemy;
var enemydown;
var plat;
var right;
var left;
var explosion;
var scoreP1=0;
var scoreP2=0;
var scoreTextP1;
var scoreTextP2;
var shieldP1=0;
var shieldP2=0;
var P1BulletUpgrade=1;
var P1lives=5;
var P1Life=true;
var P1Death=false;
var P1Stop=0;
var P2lives=5;
var P2Life=true;
var P2Death=false;
var P2BulletUpgrade=1;
var P2Stop=0;
var lastFired = 0;
var lastFired2 = 0;
var lastFiredPvp=0;
var lastFiredPvp2=0;
var gameend=0;
var SHIELDP1DELAY=false;
var SHIELDP2DELAY=false;

function preload()
{
   loadImagSounds(this.load);
}

function create()
{
    createMusic(this.music,this.sound);
     
	this.cameras.main.setBackgroundColor("#697e96");  

    this.mountainsBack = this.add.tileSprite(400,530,800,600,"mountains-back");
    this.mountainsMid1 = this.add.tileSprite(400,530,800,450,"mountains-mid1");
    this.mountainsMid2 = this.add.tileSprite(400,530,800,150,"mountains-mid2"); 

	this.bush2 = this.add.tileSprite(400,577,800,280, "bush2");
    this.bush2.tint = 0x697e96;

    this.nuvens = this.add.tileSprite(400,150,800,280, "nuvens");

    this.space = this.add.tileSprite(1440,530,0,450,"space");  
    
    this.ret = this.add.tileSprite(1085,0,0,0,"ret"); 
    
	this.div = this.physics.add.image(810,300,"div"); 
	this.div.body.setAllowGravity(false);
	this.div.body.immovable = true;

	this.ground = this.add.tileSprite(400,577,800,50, 'ground');	
	this.ground.tint = 0x697e96;
    this.physics.add.existing(this.ground, true);
    
    //Player 1
    this.bird = this.physics.add.sprite(60,200, 'bird');
	this.bird.setBounce(0.1);
	this.bird.setScale(0.5);
	this.bird.tint = 0x800000;
    this.bird.setCollideWorldBounds(true);
    
	//Player 2
	this.bird2 = this.physics.add.sprite(20,200, 'bird2');
	this.bird2.setBounce(0.1);
	this.bird2.setScale(0.5);
	this.bird2.tint = 0x4B0082;
	this.bird2.setCollideWorldBounds(true);
	
    
    //Animações dos jogadores    
	// player 1 walk animation
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('bird', {prefix: 'p1_walk', start: 1, end: 11, zeroPad: 2}),
        frameRate: 10,
        repeat: -1
    });
	
    // idle with only one frame, so repeat is not neaded
    this.anims.create({
        key: 'idle',
        frames: [{key: 'bird', frame: 'p1_stand'}],
        frameRate: 10,
    });
	
	// player 2 walk animation
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('bird2', {prefix: 'p1_walk', start: 1, end: 11, zeroPad: 2}),
        frameRate: 10,
        repeat: -1
    });
	
    // idle with only one frame, so repeat is not neaded
    this.anims.create({
        key: 'idle',
        frames: [{key: 'bird2', frame: 'p1_stand'}],
        frameRate: 10,
    });
	
    createGroups(this.physics);

    //Colisões 
    this.physics.add.collider(this.ground, this.bird);
	this.physics.add.collider(this.ground, this.bird2);
	this.physics.add.collider(this.bird, this.bird2);
	this.physics.add.collider(this.div, this.bird);
    this.physics.add.collider(this.div, this.bird2);
    this.physics.add.collider(this.ground, boxes);
    this.physics.add.collider(this.bird, plats);
    this.physics.add.collider(this.bird2, plats);
        
    //Timer para adicionar bomba lado direito
	timer=this.time.addEvent({ 
		delay: 800, 
		callback: addEnemy, 
		callbackScope: this,
		repeat:-1
	});
    
    //Timer para adicionar bomba de cima
	timer2=this.time.addEvent({ 
		delay: 3000, 
		callback: addEnemyDown, 
		callbackScope: this,
		repeat:-1
	});
    
    //Timer para adicionar ovnis
	timer3=this.time.addEvent({ 
		delay: 700, 
		callback: addPlat, 
		callbackScope: this,
		repeat:-1
	});
    
    //Timer para adicionar caixas
    timer6=this.time.addEvent({
        delay: 10000,
        callback: spawnBox,
        callbackScope: this,
        repeat:-1
    });

	cursors = this.input.keyboard.addKeys(
		{up:Phaser.Input.Keyboard.KeyCodes.UP,
		down:Phaser.Input.Keyboard.KeyCodes.DOWN,
		left:Phaser.Input.Keyboard.KeyCodes.LEFT,
        right:Phaser.Input.Keyboard.KeyCodes.RIGHT,
        shoot:Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO,
        shield:Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO,
        shootPvP:Phaser.Input.Keyboard.KeyCodes.NUMPAD_THREE,
		});
	
	teclas = this.input.keyboard.addKeys(
		{up:Phaser.Input.Keyboard.KeyCodes.W,
		down:Phaser.Input.Keyboard.KeyCodes.S,
		left:Phaser.Input.Keyboard.KeyCodes.A,
		right:Phaser.Input.Keyboard.KeyCodes.D,
		shoot:Phaser.Input.Keyboard.KeyCodes.SPACE,
        shield:Phaser.Input.Keyboard.KeyCodes.B, 
        shootPvP:Phaser.Input.Keyboard.KeyCodes.N,
        restart:Phaser.Input.Keyboard.KeyCodes.R, 
		});
    
    //Scores dos Players
	scoreTextP1 = this.add.text(1000, 16, 'Score P1: 0', { fontSize: '25px', fill: '#000' });
	scoreTextP2 = this.add.text(1000, 36, 'Score P2: 0', { fontSize: '25px', fill: '#000' });
    
    //Vidas dos Players
	livesP1 = this.add.text(825, 16, 'Vidas P1: 5', { fontSize: '25px', fill: '#000' });
	livesP2 = this.add.text(825, 36, 'Vidas P2: 5', { fontSize: '25px', fill: '#000' });
    
    //Objetivo do Jogo
	objetivo = this.add.text (900, 106, 'OBJETIVO DO JOGO', {font: '30px Cambria' });
	objetivo1 = this.add.text (850, 140, 'Conquistar o planeta Terra, aniquilando', {font: '20px Cambria' });
	objetivo2 = this.add.text (840, 160, 'todos os mísseis enviados pelos humanos', {font: '20px Cambria' });
	objetivo3 = this.add.text (850, 180, 'antes que a outra civilização o consiga!', {font: '20px Cambria' });
    
    //End Game
	end = this.add.text (900, 210, 'O JOGO ACABA SE:', {font: '30px Cambria' });
	end1 = this.add.text (835, 250, 'Um dos jogadores perder as suas 5 vidas!', {font: '20px Cambria' });
    
    //Controladores Player1
	controls = this.add.text (930, 290, 'CONTROLOS', {font: '30px Cambria' });
	controls1 = this.add.text (850, 330, 'Jogador RED:', {font: '20px Cambria' });
	controls2 = this.add.text (930, 350, 'UP ARROW : saltar', {font: '15px Cambria' });
	controls3 = this.add.text (930, 365, 'RIGHT ARROW: mover para a direita', {font: '15px Cambria' });
	controls4 = this.add.text (930, 380, 'LEFT ARROW: mover para a esquerda', {font: '15px Cambria' });
	controls5 = this.add.text (930, 395, 'DOWN ARROW: forçar aterragem', {font: '15px Cambria' });
	controls6 = this.add.text (930, 410, 'NUMPAD 0 : disparar', {font: '15px Cambria' });
	controls7 = this.add.text (930, 425, 'NUMPAD 2 : shield', {font: '15px Cambria' });

    //Controladores Player2
	controls1 = this.add.text (850, 450, 'Jogador PURPLE:', {font: '20px Cambria' });
	controls2 = this.add.text (930, 470, 'W : saltar', {font: '15px Cambria' });
	controls3 = this.add.text (930, 485, 'D: mover para a direita', {font: '15px Cambria' });
	controls4 = this.add.text (930, 500, 'A: mover para a esquerda', {font: '15px Cambria' });
	controls5 = this.add.text (930, 515, 'S: forçar aterragem', {font: '15px Cambria' });
    controls6 = this.add.text (930, 530, 'SPACEBAR: disparar', {font: '15px Cambria' });
    controls7 = this.add.text (930, 545, 'B: shield', {font: '15px Cambria' });
	
    //Overlaps dos Sprites
    this.physics.add.overlap(boxes, this.bird, boxesP1, null, this);
    this.physics.add.overlap(boxes, this.bird2, boxesP2, null, this);
	this.physics.add.overlap(plats, enemies, hitPlatEnemy, null, this);
    this.physics.add.overlap(explosions, this.bird, hitPlayerExplosion1, null, this);
    this.physics.add.overlap(explosions, this.bird2, hitPlayerExplosion2, null, this);
    this.physics.add.overlap(bulletsP1, enemies, hitBulletP1, null, this);
    this.physics.add.overlap(bulletsP2, enemies, hitBulletP2, null, this);
	this.physics.add.overlap(bulletsP1, this.div, destroyVsDiv, null, this);
    this.physics.add.overlap(bulletsP2, this.div, destroyVsDiv, null, this);
    this.physics.add.overlap(bulletsPVPP1, this.div, destroyVsDiv, null, this);
    this.physics.add.overlap(bulletsPVPP2, this.div, destroyVsDiv, null, this);
    this.physics.add.overlap(bulletsPVPP1, this.bird2, hitPlayerBulletPvp1, null, this);
    this.physics.add.overlap(bulletsPVPP2, this.bird, hitPlayerBulletPvp2, null, this);
    this.physics.add.overlap(plats, this.div, destroyVsDiv, null, this);
    this.physics.add.overlap(enemies, this.ground, hitGroundEnemy, null, this);
    this.physics.add.overlap(enemies, this.bird, hitPlayerExplosion1, null, this);
    this.physics.add.overlap(enemies, this.bird2, hitPlayerExplosion2, null, this);
    //this.physics.add.overlap(explosions, plats, hitPlatsExplosion, null, this);
    
}
	
function update(time)
{
    //Background a mover
    this.mountainsBack.tilePositionX += 0.05;
    this.mountainsMid1.tilePositionX += 0.2;
    this.mountainsMid2.tilePositionX += 0.4; 
	this.ground.tilePositionX += 0.5;
    this.bush2.tilePositionX+= 0.5;
    this.nuvens.tilePositionX+=0.05;

    //GameOver caso os 2 Players morram
    if(P1Death==true && P2Death==true && gameend==0){
        this.add.text(250, 200, 'GAME OVER', { fontSize: '50px', fill: '#000' });
        this.add.text(150, 300, 'PRESS R TO RESTART', { fontSize: '50px', fill: '#000' });
        plats.kill();
        explosions.kill();
        enemies.kill();
        gameend=1;
    }    

    //Restart game 
    if(teclas.restart.isDown){
        P1lives=5;
        P1Life=true;
        P1Death=false;
        P2lives=5;
        P2Death=false;
        gameend=0;
        this.bird = this.physics.add.sprite(60,200, 'bird');
	
        this.bird.setBounce(0.1);
        this.bird.setScale(0.5);
        this.bird.tint = 0x800000;
        this.bird.setCollideWorldBounds(true);

        this.bird2 = this.physics.add.sprite(20,200, 'bird2');
        this.bird2.setBounce(0.1);
        this.bird2.setScale(0.5);
        this.bird2.tint = 0x4B0082;
        this.bird2.setCollideWorldBounds(true);

        this.scene.restart();
    }
    
    //JOGADOR 1
    if(P1Death==false)
    {        
        //Usar Shield Player1
        if(cursors.shield.isDown && shieldP1==0 && SHIELDP1DELAY==false && P1Stop==0)
        {
            this.shieldCP1 = this.physics.add.sprite(this.bird.body.x+15,this.bird.body.y, 'shield');
            this.shieldCP1.body.setAllowGravity(false);
            this.shieldCP1.body.immovable = true;
            shieldP1=1;
            this.physics.add.overlap(this.shieldCP1, enemies, hitShieldEnemy, null, this);
            timer6=this.time.addEvent({ 
                delay: 1000, 
                callback: shieldP1Lose, 
                callbackScope: this,
                repeat:0
            });
        }
        //Shield a seguir o Player1
        if(shieldP1==1)
        {
            this.shieldCP1.body.setVelocityX(this.bird.body.velocity.x);
            this.shieldCP1.body.setVelocityY(this.bird.body.velocity.y);
        }
        //Animação que segue o jogador quando é atacado pelo Player2
        if(P1Stop==1)
        {
            this.P1Stuck.body.setVelocityX(this.bird.body.velocity.x);
            this.P1Stuck.body.setVelocityY(this.bird.body.velocity.y);   
        }
        //Player1 Andar para a esquerda
        if (cursors.left.isDown && P1Stop==0){  
            this.bird.body.setVelocityX(-200);
            this.bird.anims.play('walk', true); 
            this.bird.flipX = true; 
        }
        //Player1 Andar para a direita
        else if (cursors.right.isDown && P1Stop==0)
        {
            this.bird.body.setVelocityX(200);
            this.bird.anims.play('walk', true);
            this.bird.flipX = false; 
        }
        //Player1 afk
        else {
            this.bird.body.setVelocityX(0);
            this.bird.anims.play('walk', true);
            this.bird.flipX = false;
        }
        //Player1 salto
        if (cursors.up.isDown && this.bird.body.touching.down && P1Stop==0)
        {
            this.bird.body.setVelocityY(-300);  
        }
        //Player1 andar para baixo
        if(cursors.down.isDown)
        {
            this.bird.body.setVelocityY(300);
        }
        //Disparar
        if(cursors.shoot.isDown && time > lastFired && P1Stop==0)
        {
            addBulletPlayer1(this.bird.body.x, this.bird.body.y, this.bird.body.velocity.x);
            this.sound.play('jump');
            lastFired = time + 300;
        }
        //Disparar PVP
        if(cursors.shootPvP.isDown && time > lastFiredPvp && P1Stop==0)
        {
            addBulletPvP1(this.bird.body.x, this.bird.body.y, this.bird.body.velocity.x);
            this.sound.play('jump');
            lastFiredPvp = time + 3500;
        }    
    }	
//JOGADOR 2
    if(P2Death==false)
    {     
        //Usar Shield Player2
        if(teclas.shield.isDown && shieldP2==0 && SHIELDP2DELAY==false && P2Stop==0)
        {
            this.shieldCP2 = this.physics.add.sprite(this.bird2.body.x+15,this.bird2.body.y, 'shield');
            this.shieldCP2.body.setAllowGravity(false);
            this.shieldCP2.body.immovable = true;
            shieldP2=1;
            this.physics.add.overlap(this.shieldCP2, enemies, hitShieldEnemy, null, this);
            timer6=this.time.addEvent({ 
                delay: 1000, 
                callback: shieldP2Lose, 
                callbackScope: this,
                repeat:0
            });
        }
        //Shield a seguir o Player2
        if(shieldP2==1)
        {
            this.shieldCP2.body.setVelocityX(this.bird2.body.velocity.x);
            this.shieldCP2.body.setVelocityY(this.bird2.body.velocity.y);
        }
        //Animação que segue o jogador quando é atacado pelo Player1
        if(P2Stop==1)
        {
            this.P2Stuck.body.setVelocityX(this.bird2.body.velocity.x);
            this.P2Stuck.body.setVelocityY(this.bird2.body.velocity.y);   
        }
        //Player2 Andar para a esquerda
        if (teclas.left.isDown && P2Stop==0){
            this.bird2.body.setVelocityX(-200);
            this.bird2.anims.play('walk', true); 
            this.bird2.flipX = true; 
        }
        //Player2 Andar para a direita
        else if (teclas.right.isDown && P2Stop==0)
        {
            this.bird2.body.setVelocityX(200);
            this.bird2.anims.play('walk', true);
            this.bird2.flipX = false;
        } 
        //Player2 afk
        else {
            this.bird2.body.setVelocityX(0);
            this.bird2.anims.play('walk', true);
            this.bird2.flipX = false;
        }
        //Player2 salto
        if (teclas.up.isDown && this.bird2.body.touching.down && P2Stop==0)
        {
            this.bird2.body.setVelocityY(-300);        
        }
        //Player2 andar para baixo
        if(teclas.down.isDown && P2Stop==0)
        {
            this.bird2.setVelocityY(300);
        }
        //Disparar
        if(teclas.shoot.isDown && time > lastFired2 && P2Stop==0)
        {
            addBulletPlayer2(this.bird2.body.x, this.bird2.body.y, this.bird2.body.velocity.x);
            this.sound.play('jump');
            lastFired2 = time + 300;
        }
        //Disparar PVP
        if(teclas.shootPvP.isDown && time > lastFiredPvp2 && P2Stop==0)
        {
            addBulletPvP2(this.bird2.body.x, this.bird2.body.y, this.bird2.body.velocity.x);
            this.sound.play('jump');
            lastFiredPvp2 = time + 3500;
        } 
    }  
}

function createMusic(music,sound)
{
    music=sound.add('music');
    music.setVolume(0.1); 
    music.setLoop(true);
    music.play();
    this.jump = sound.add('jump');
	sound.add('jump');
	sound.setVolume(0.1); 
}

function createGroups(physics)
{
boxes = physics.add.group(); //Caixas upgrade Balas/+vidas
enemies = physics.add.group(); //Bombas 
plats = physics.add.group(); //Ovnis
explosions = physics.add.group();  //explosões
bulletsP1 = physics.add.group();   //Balas P1
bulletsP2 = physics.add.group();   //Balas P2
bulletsPVPP1 = physics.add.group(); //Balas PVP P1
bulletsPVPP2 = physics.add.group(); //Balas PVP P2
}

function loadImagSounds(load)
{     
    //Imagens
    load.image('mountains-back', 'assets/mountains-back.png');
    load.image('mountains-mid1', 'assets/mountains-mid1.png');
    load.image('mountains-mid2', 'assets/mountains-mid2.png');
    load.image('ground', 'assets/ground.png');
	load.image("enemy", "assets/enemy.png");
	load.image("enemydown", "assets/nuke.png");
	load.image("plat", "assets/plat.png");
	load.image('bomb', 'assets/bomb.png');
	load.image('kaboom', 'assets/Explosion.png');
	load.image('space', 'assets/space.jpg');
	load.image('ret', 'assets/ret.png');
	load.image("laserRed", "assets/laser2.png");
    load.image("laserGreen", "assets/laser.png");
	load.image('shield', 'assets/shield.png');
	load.image('bush2', 'assets/bush2.png');
    load.image('div', 'assets/div.png');
    load.image('nuvens','assets/nuvens.png');
    //Animações
    load.atlas('bird', 'assets/player.png', 'assets/player.json');
	load.atlas('bird2', 'assets/player.png', 'assets/player.json');
    //Sons
    load.audio("jump", "assets/slime.wav");
    load.audio("music", "assets/music.wav");
}

function boxesP1(NULL,box)
{
    if(P1BulletUpgrade<6)
    {
        P1BulletUpgrade++;
    }
    if(P1BulletUpgrade>=5)
    {
        P1lives++;
        livesP1.setText("Vidas P1: "+P1lives);
    }
    box.destroy();
}

function boxesP2(player2,box)
{
    if(P2BulletUpgrade<6)
    {
        P2BulletUpgrade++;
    }
    if(P2BulletUpgrade>=5)
    {
        P2lives++;
        livesP2.setText("Vidas P2: "+P2lives);
    }
    box.destroy();
}

function hitShieldEnemy(shield,enemy)
{
    enemy.destroy();
}

function shieldP2Lose()
{
    shieldP2=0;
    this.shieldCP2.destroy();
    SHIELDP2DELAY=true;
    this.time.addEvent({ 
        delay: 1000, 
        callback: shieldP2Delay, 
        callbackScope: this,
        repeat:0
    });
}

function shieldP2Delay()
{
    SHIELDP2DELAY=false;
}

function spawnBox()
{

    var tamanhoBoxes=boxes.getLength();
    if(tamanhoBoxes<5)
    {
    var space = Math.floor(Math.random() * 800);
    if(space==0){
        space=1;
    }
    box = boxes.create(space, -20,'bird');  
    box.body.velocity.y=0;
    box.checkWorldBounds = true; 
    box.body.setAllowGravity(true);
    box.outOfBoundsKill = true;
    box.setScale(0.5);
    }
 
}

function shieldP1Lose()
{
    shieldP1=0;
    this.shieldCP1.destroy();
    SHIELDP1DELAY=true;
    this.time.addEvent({ 
        delay: 1000, 
        callback: shieldP1Delay, 
        callbackScope: this,
        repeat:0
    });
}

function shieldP1Delay()
{
    SHIELDP1DELAY=false;
}

function addOneEnemy(x,y)
{
    enemy = enemies.create(x, y,'enemy'); 
    enemy.body.velocity.x=-250;   
    enemy.checkWorldBounds = true; 
    enemy.body.setAllowGravity(false);
    enemy.outOfBoundsKill = true;
}

function addOneEnemyDown(x,y)
{
    enemydown = enemies.create(x, y,'enemydown');  
    enemydown.body.velocity.y=0;
    enemydown.checkWorldBounds = true; 
    enemydown.body.setAllowGravity(true);
    enemydown.outOfBoundsKill = true;
	enemydown.setScale(0.05);
}

function addEnemy()
{
    var space = Phaser.Math.Between(50, 510);      
    addOneEnemy(750, space);  
}

function addEnemyDown()
{
	var space = Math.floor(Math.random() * 4) ;	
	if(space==0){
		space=1;
	}	
	addOneEnemyDown(space*200,-20);
}

function addOnePlat(x,y)
{
   	plat = plats.create(x, y,'plat'); 
    plat.body.velocity.x=100;   
    plat.checkWorldBounds = true; 
    plat.body.setAllowGravity(false);
    plat.outOfBoundsKill = true;
	plat.body.immovable = true;
}

function addPlat()
{   
    var space =Phaser.Math.Between(50, 510);        
    addOnePlat(0, space);               
}

function playerDeathImune()
{
    if(P1Life==false && P1lives>0)
    {
        this.bird.alpha = 1;
        P1Life=true;
    }
}

function playerDeathImune2()
{
    if(P2Life==false && P2lives>0)
    {
        this.bird2.alpha = 1;
        P2Life=true;
    }
}

function hitPlayerExplosion1(bird)
{
    if(P1Life==true)
     {
        P1lives--;
        bird.alpha = 0.4;
        livesP1.setText("Vidas P1: "+P1lives);
        P1Life=false; 
        this.time.addEvent({ 
            delay: 3000, 
            callback: playerDeathImune, 
            callbackScope: this,
            repeat:0
        });
     }
    if(P1lives<=0 && P1Life==false)
    {
        P1Death = this.physics.add.sprite(bird.x+30,bird.y, 'bird');
        P1Death.setScale(0.5);
        P1Death.body.velocity.y=-200;
        P1Death.body.setAllowGravity(false);
        P1Death.body.immovable = true;
        P1Death=true;   
        bird.destroy();
    }
}

function hitPlayerExplosion2(bird)
{
    if(P2Life==true)
    {
       P2lives--;
       bird.alpha = 0.4;
       livesP2.setText("Vidas P2: "+P2lives);
       P2Life=false; 
       this.time.addEvent({ 
        delay: 3000, 
        callback: playerDeathImune2, 
        callbackScope: this,
        repeat:-1
    });
    }
   if(P2lives<=0 && P2Life==false)
   {
       P2Death = this.physics.add.sprite(bird.x+30,bird.y, 'bird');
       P2Death.setScale(0.5);
       P2Death.body.velocity.y=-200;
       P2Death.body.setAllowGravity(false);
       P2Death.body.immovable = true;
       P2Death=true;   
       bird.destroy();
   }
}

function hitPlayerBulletPvp1(player2,bullet)
{
    this.P2Stuck = this.physics.add.sprite(player2.x,player2.y, 'bird');
    this.P2Stuck.setScale(0.5);
    this.P2Stuck.body.setAllowGravity(false);
    this.P2Stuck.body.immovable = true;
    P2Stop=1;
    this.time.addEvent({ 
        delay: 3000, 
        callback: P2Run, 
        callbackScope: this,
        repeat:0
    });
    bullet.destroy();
}

function P2Run()
{
    P2Stop=0;
    this.P2Stuck.destroy();
}

function addBulletPvP1(x,y,vx)
{
    if(vx<0)
    {
        bullet= bulletsPVPP1.create(x,y+25,'bird');
        bullet.body.velocity.x=-450;
        bulletsphyics(bullet);
    }
    if(vx>=0)
    {
        bullet= bulletsPVPP1.create(x+30,y+25,'bird');
        bullet.body.velocity.x=450;
        bulletsphyics(bullet);
    }
}

function addBulletPvP2(x,y,vx)
{
    if(vx<0)
    {
        bullet= bulletsPVPP2.create(x,y+25,'bird');
        bullet.body.velocity.x=-450;
        bulletsphyics(bullet);
        bullet.tint = 0xFF00FF;
    }
    if(vx>=0)
    {
        bullet= bulletsPVPP2.create(x+30,y+25,'bird');
        bullet.body.velocity.x=450;
        bulletsphyics(bullet);
        bullet.tint = 0xFF00FF;
    }
}

function hitPlayerBulletPvp2(player1,bullet)
{
    this.P1Stuck = this.physics.add.sprite(player1.x,player1.y, 'bird');
    this.P1Stuck.setScale(0.5);
    this.P1Stuck.body.setAllowGravity(false);
    this.P1Stuck.body.immovable = true;
    P1Stop=1;
    this.time.addEvent({ 
        delay: 3000, 
        callback: P1Run, 
        callbackScope: this,
        repeat:0
    });
    bullet.destroy();
}

function P1Run()
{
    P1Stop=0;
    this.P1Stuck.destroy();
}

function addBulletPlayer1(x,y,vx)
{
    if(vx<0)
    {
        createBulletPlayer1(x,y+25,-450)
    }
    if(vx>=0)
    {
        createBulletPlayer1(x+30,y+25,450)	
    }
}

function bulletsphyics(bullet)
{
    bullet.checkWorldBounds = true; 
    bullet.body.setAllowGravity(false);
    bullet.outOfBoundsKill = true;
}

function createBulletPlayer1(x,y,vx)
{
    if(P1BulletUpgrade==1)
    {
        bullet= bulletsP1.create(x,y,'laserRed');
        bullet.body.velocity.x=vx;
        bulletsphyics(bullet);
    }
    if(P1BulletUpgrade==2)
    {
        bullet= bulletsP1.create(x,y,'laserRed');
        bullet.body.velocity.x=vx;
        bulletsphyics(bullet);
        bullet= bulletsP1.create(x,y+10,'laserRed');
        bullet.body.velocity.x=vx;
        bulletsphyics(bullet);
    } 
    if(P1BulletUpgrade==3)
    {
        bullet= bulletsP1.create(x,y,'laserRed');
        bullet.body.velocity.x=vx;
        bulletsphyics(bullet);
        bullet= bulletsP1.create(x,y,'laserRed');
        bullet.body.velocity.x=vx; 
        bullet.body.velocity.y=20;
        bulletsphyics(bullet);
        bullet= bulletsP1.create(x,y,'laserRed');
        bullet.body.velocity.x=vx; 
        bullet.body.velocity.y=-20;
        bulletsphyics(bullet);
    } 
    if(P1BulletUpgrade==4)
    {
        bullet= bulletsP1.create(x,y,'laserRed');
        bullet.body.velocity.x=vx;
        bullet.body.velocity.y=-40;
        bulletsphyics(bullet);
        bullet= bulletsP1.create(x,y,'laserRed');
        bullet.body.velocity.x=vx;
        bullet.body.velocity.y=40;
        bulletsphyics(bullet);
        bullet= bulletsP1.create(x,y,'laserRed');
        bullet.body.velocity.x=vx; 
        bullet.body.velocity.y=20;
        bulletsphyics(bullet);
        bullet= bulletsP1.create(x,y,'laserRed');
        bullet.body.velocity.x=vx; 
        bullet.body.velocity.y=-20;
        bulletsphyics(bullet);
        
    } 
    if(P1BulletUpgrade>=5)
    {
        bullet= bulletsP1.create(x,y,'laserRed');
        bullet.body.velocity.x=vx;
        bulletsphyics(bullet);
        bullet= bulletsP1.create(x,y,'laserRed');
        bullet.body.velocity.x=vx; 
        bullet.body.velocity.y=20;
        bulletsphyics(bullet);
        bullet= bulletsP1.create(x,y,'laserRed');
        bullet.body.velocity.x=vx; 
        bullet.body.velocity.y=-20;
        bulletsphyics(bullet);
        bullet= bulletsP1.create(x,y,'laserRed');
        bullet.body.velocity.x=vx;
        bullet.body.velocity.y=-40;
        bulletsphyics(bullet);
        bullet= bulletsP1.create(x,y,'laserRed');
        bullet.body.velocity.x=vx;
        bullet.body.velocity.y=40;
        bulletsphyics(bullet);
   
    } 
}

function addBulletPlayer2(x,y,vx)
{
    if(vx<0)
	{
        createBulletPlayer2(x,y+25,-450);
    }
    if(vx>=0)
    {
        createBulletPlayer2(x+30,y+25,450)	
    }
}

function createBulletPlayer2(x,y,vx)
{
    if(P2BulletUpgrade==1)
    {
        bullet= bulletsP1.create(x,y,'laserGreen');
        bullet.body.velocity.x=vx;
        bulletsphyics(bullet);
        bullet.tint = 0xFF00FF;
    }
    if(P2BulletUpgrade==2)
    {
        bullet= bulletsP1.create(x,y,'laserGreen');
        bullet.body.velocity.x=vx;
        bulletsphyics(bullet);
        bullet.tint = 0xFF00FF;
        bullet= bulletsP1.create(x,y+10,'laserGreen');
        bullet.body.velocity.x=vx;
        bulletsphyics(bullet);
        bullet.tint = 0xFF00FF;
    } 
    if(P2BulletUpgrade==3)
    {
        bullet= bulletsP1.create(x,y,'laserGreen');
        bullet.body.velocity.x=vx;
        bulletsphyics(bullet);
        bullet.tint = 0xFF00FF;
        bullet= bulletsP1.create(x,y,'laserGreen');
        bullet.body.velocity.x=vx; 
        bullet.body.velocity.y=20;
        bulletsphyics(bullet);
        bullet.tint = 0xFF00FF;
        bullet= bulletsP1.create(x,y,'laserGreen');
        bullet.body.velocity.x=vx; 
        bullet.body.velocity.y=-20;
        bulletsphyics(bullet);
        bullet.tint = 0xFF00FF;
    } 
    if(P2BulletUpgrade==4)
    {
        bullet= bulletsP1.create(x,y,'laserGreen');
        bullet.body.velocity.x=vx;
        bullet.body.velocity.y=-40;
        bulletsphyics(bullet);
        bullet.tint = 0xFF00FF;
        bullet= bulletsP1.create(x,y,'laserGreen');
        bullet.body.velocity.x=vx;
        bullet.body.velocity.y=40;
        bulletsphyics(bullet);
        bullet.tint = 0xFF00FF;
        bullet= bulletsP1.create(x,y,'laserGreen');
        bullet.body.velocity.x=vx; 
        bullet.body.velocity.y=20;
        bulletsphyics(bullet);
        bullet.tint = 0xFF00FF;
        bullet= bulletsP1.create(x,y,'laserGreen');
        bullet.body.velocity.x=vx; 
        bullet.body.velocity.y=-20;
        bulletsphyics(bullet);
        bullet.tint = 0xFF00FF;
    } 
    if(P2BulletUpgrade>=5)
    {
        bullet= bulletsP1.create(x,y,'laserGreen');
        bullet.body.velocity.x=vx;
        bulletsphyics(bullet);
        bullet.tint = 0xFF00FF;
        bullet= bulletsP1.create(x,y,'laserGreen');
        bullet.body.velocity.x=vx; 
        bullet.body.velocity.y=20;
        bulletsphyics(bullet);
        bullet.tint = 0xFF00FF;
        bullet= bulletsP1.create(x,y,'laserGreen');
        bullet.body.velocity.x=vx; 
        bullet.body.velocity.y=-20;
        bulletsphyics(bullet);
        bullet.tint = 0xFF00FF;
        bullet= bulletsP1.create(x,y,'laserGreen');
        bullet.body.velocity.x=vx;
        bullet.body.velocity.y=-40;
        bulletsphyics(bullet);
        bullet.tint = 0xFF00FF;
        bullet= bulletsP1.create(x,y,'laserGreen');
        bullet.body.velocity.x=vx;
        bullet.body.velocity.y=40;
        bulletsphyics(bullet);
        bullet.tint = 0xFF00FF;
    } 
}

function hitBulletP1(bullet,enemy)
{
    scoreP1++;
    scoreTextP1.setText("Score P1: "+scoreP1);
    createExplosion(enemy,this.time);
    bullet.destroy();
	enemy.destroy();
}

function hitBulletP2(bullet2,enemy)
{
    scoreP2++;
    scoreTextP2.setText("Score P2: "+scoreP2);
    createExplosion(enemy,this.time);
    bullet2.destroy();
	enemy.destroy();
}

function hitPlatEnemy(plat,enemy)
{
    createExplosion(enemy,this.time);
    plat.destroy();
	enemy.destroy();
}

function hitPlatEnemy(plat,enemy)
{
    createExplosion(enemy,this.time);
    plat.destroy();
	enemy.destroy();
}

function hitGroundEnemy(NULL,enemy)
{   
    createExplosion(enemy,this.time);
	enemy.destroy();
}

function createExplosion(object,time)
{
    explosion = explosions.create(object.x-15,object.y,'kaboom');
    explosion.body.setAllowGravity(false);
    explosion.body.immovable = true;
    explosion.body.velocity.x=-50;
    time.addEvent({ 
        delay: 1400, 
        callback: explosionsHandler, 
        args: [explosion],
        callbackScope: this,
        repeat:0,
    });
}

function explosionsHandler(boom)
{
    boom.destroy();
}

function destroyVsDiv(NULL,object){
	object.destroy();
}



