const canvas = document.getElementById("universe");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let center = {x:canvas.width/2, y:canvas.height/2};
let mouse = {x:center.x, y:center.y};

let hoveredPlanet = null;
let zoomLevel = 0;

/* ---------------- MOUSE ---------------- */

document.addEventListener("mousemove", e=>{
    mouse.x=e.clientX;
    mouse.y=e.clientY;
});

/* ---------------- SOL ---------------- */

function drawSun(){
    let gradient = ctx.createRadialGradient(center.x,center.y,20,center.x,center.y,140);
    gradient.addColorStop(0,"#fff7a6");
    gradient.addColorStop(.4,"#ffb300");
    gradient.addColorStop(1,"rgba(255,120,0,0)");

    ctx.beginPath();
    ctx.fillStyle=gradient;
    ctx.arc(center.x,center.y,140,0,Math.PI*2);
    ctx.fill();
}

/* ---------------- PLANETA ---------------- */

class Planet{
    constructor(name,color,distance,size,speed){
        this.name=name;
        this.color=color;
        this.distance=distance;
        this.baseSize=size;
        this.speed=speed; // velocidade da órbita
        this.angle=Math.random()*Math.PI*2;
    }

    update(){
        // VELOCIDADE REDUZIDA (mais devagar)
        this.angle+=this.speed;

        let dx=mouse.x-center.x;
        let dy=mouse.y-center.y;
        let influence=Math.sqrt(dx*dx+dy*dy)*0.00003;

        this.x=center.x+Math.cos(this.angle)*(this.distance+dx*0.01*influence);
        this.y=center.y+Math.sin(this.angle)*(this.distance+dy*0.01*influence);

        let distMouse = Math.hypot(mouse.x-this.x, mouse.y-this.y);
        if(distMouse < this.baseSize+10){
            hoveredPlanet = this;
        }
    }

    drawOrbit(){
        ctx.beginPath();
        ctx.strokeStyle="rgba(255,255,255,0.1)";
        ctx.arc(center.x,center.y,this.distance,0,Math.PI*2);
        ctx.stroke();
    }

    draw(){

        let drawSize = this.baseSize;

        if(hoveredPlanet === this){

            drawSize = this.baseSize + 300*zoomLevel;

            let glow = ctx.createRadialGradient(
                this.x,this.y,drawSize*0.2,
                this.x,this.y,drawSize
            );

            glow.addColorStop(0,this.color);
            glow.addColorStop(1,"transparent");

            ctx.fillStyle=glow;
            ctx.beginPath();
            ctx.arc(this.x,this.y,drawSize,0,Math.PI*2);
            ctx.fill();

            // textura leve
            ctx.strokeStyle="rgba(255,255,255,0.1)";
            for(let i=0;i<10;i++){
                ctx.beginPath();
                ctx.arc(
                    this.x,
                    this.y,
                    drawSize*(0.3+Math.random()*0.6),
                    0,
                    Math.PI*2
                );
                ctx.stroke();
            }

            ctx.fillStyle="white";
            ctx.font="20px Arial";
            ctx.textAlign="center";
            ctx.fillText(this.name,this.x,this.y-drawSize-20);

        }else{
            ctx.fillStyle=this.color;
            ctx.beginPath();
            ctx.arc(this.x,this.y,drawSize,0,Math.PI*2);
            ctx.fill();
        }
    }
}

/* ---------------- PLANETAS (VELOCIDADE BEM MAIS LENTA) ---------------- */

let planets=[
    new Planet("Mercúrio","#aaa",100,4,0.01),
    new Planet("Vênus","#e0c16c",150,6,0.008),
    new Planet("Terra","#4aa3ff",210,7,0.006),
    new Planet("Marte","#ff5a3c",260,6,0.005),
    new Planet("Júpiter","#d9a066",340,16,0.003),
    new Planet("Saturno","#e8d39e",430,14,0.0025),
    new Planet("Urano","#7de3ff",500,11,0.002),
    new Planet("Netuno","#4062ff",580,11,0.0018)
];

/* ---------------- ESTRELAS ---------------- */

let stars=[];
for(let i=0;i<500;i++){
    stars.push({
        x:Math.random()*canvas.width,
        y:Math.random()*canvas.height,
        size:Math.random()*1.5
    });
}

function drawStars(){
    ctx.fillStyle="white";
    stars.forEach(s=>{
        ctx.fillRect(s.x,s.y,s.size,s.size);
    });
}

/* ---------------- LOOP ---------------- */

function animate(){

    hoveredPlanet=null;

    ctx.fillStyle="rgba(0,0,0,0.25)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    drawStars();
    drawSun();

    planets.forEach(p=>{
        p.update();
        p.drawOrbit();
    });

    // zoom suave
    if(hoveredPlanet){
        zoomLevel += 0.05;
        if(zoomLevel>1) zoomLevel=1;
    }else{
        zoomLevel -= 0.05;
        if(zoomLevel<0) zoomLevel=0;
    }

    planets.forEach(p=>p.draw());

    requestAnimationFrame(animate);
}

animate();
