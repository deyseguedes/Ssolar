const canvas = document.getElementById("universe");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

/* ================= CAMERA ================= */

let camera={x:0,y:0,zoom:0.18};

let dragging=false;
let lastMouse={x:0,y:0};

canvas.onmousedown=e=>{
    dragging=true;
    lastMouse.x=e.clientX;
    lastMouse.y=e.clientY;
};

onmouseup=()=>dragging=false;

onmousemove=e=>{
    if(!dragging) return;
    camera.x-=(e.clientX-lastMouse.x)/camera.zoom;
    camera.y-=(e.clientY-lastMouse.y)/camera.zoom;
    lastMouse.x=e.clientX;
    lastMouse.y=e.clientY;
};

onwheel=e=>{
    camera.zoom*= e.deltaY>0?0.9:1.1;
};

/* ================= TEMPO REAL ================= */

function getEarthRotation(){
    const now=new Date();
    const s=now.getUTCHours()*3600+now.getUTCMinutes()*60+now.getUTCSeconds();
    return (s/86400)*Math.PI*2;
}

/* ================= VIA LACTEA ================= */

class Star{
    constructor(){
        const armCount=4;
        const arm=Math.floor(Math.random()*armCount);

        let theta=Math.random()*6*Math.PI;
        let radius=40*Math.exp(0.28*theta);
        radius*=Math.random()*0.6+0.4;

        theta+=arm*(Math.PI*2/armCount);

        this.x=Math.cos(theta)*radius;
        this.y=Math.sin(theta)*radius;
        this.y+=(Math.random()-0.5)*120;

        this.size=Math.random()*1.2+0.2;

        const colors=["#9bbcff","#c8d9ff","#ffffff","#fff2cc","#ffd2a1"];
        this.color=colors[Math.floor(Math.random()*colors.length)];
    }

    draw(){
        let sx=(this.x-camera.x)*camera.zoom+canvas.width/2;
        let sy=(this.y-camera.y)*camera.zoom+canvas.height/2;

        let g=ctx.createRadialGradient(sx,sy,0,sx,sy,this.size*6*camera.zoom);
        g.addColorStop(0,this.color);
        g.addColorStop(1,"transparent");

        ctx.fillStyle=g;
        ctx.beginPath();
        ctx.arc(sx,sy,this.size*6*camera.zoom,0,Math.PI*2);
        ctx.fill();

        ctx.fillStyle="white";
        ctx.fillRect(sx,sy,1*camera.zoom,1*camera.zoom);
    }
}

let stars=[];
for(let i=0;i<9000;i++) stars.push(new Star());

function drawCore(){
    let sx=(0-camera.x)*camera.zoom+canvas.width/2;
    let sy=(0-camera.y)*camera.zoom+canvas.height/2;

    let g=ctx.createRadialGradient(sx,sy,10,sx,sy,400*camera.zoom);
    g.addColorStop(0,"#fff6d5");
    g.addColorStop(.3,"#ffd27a");
    g.addColorStop(1,"transparent");

    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.arc(sx,sy,400*camera.zoom,0,Math.PI*2);
    ctx.fill();
}

/* ================= SISTEMA SOLAR ================= */

const SOLAR_POS={x:2600,y:300};

const planets=[
{name:"Mercúrio",dist:80,size:3,color:"#b5b5b5",speed:0.04},
{name:"Vênus",dist:120,size:5,color:"#e6c27a",speed:0.015},
{name:"Terra",dist:170,size:5.5,color:"#4aa3ff",speed:0.01},
{name:"Marte",dist:230,size:4,color:"#c1440e",speed:0.008},
{name:"Júpiter",dist:340,size:12,color:"#d2b48c",speed:0.002},
{name:"Saturno",dist:470,size:10,color:"#e8d39e",speed:0.0015,ring:true},
{name:"Urano",dist:600,size:8,color:"#b7e3ff",speed:0.001},
{name:"Netuno",dist:720,size:8,color:"#4062ff",speed:0.0008}
];

function drawSolar(){

    let sx=(SOLAR_POS.x-camera.x)*camera.zoom+canvas.width/2;
    let sy=(SOLAR_POS.y-camera.y)*camera.zoom+canvas.height/2;

    let g=ctx.createRadialGradient(sx,sy,10,sx,sy,150*camera.zoom);
    g.addColorStop(0,"#fff9c4");
    g.addColorStop(.4,"#ffcc33");
    g.addColorStop(1,"transparent");

    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.arc(sx,sy,150*camera.zoom,0,Math.PI*2);
    ctx.fill();

    let time=Date.now()*0.00005;

    planets.forEach(p=>{
        let orbit=p.dist*camera.zoom;

        if(camera.zoom>0.35){
            ctx.strokeStyle="rgba(255,255,255,0.15)";
            ctx.beginPath();
            ctx.arc(sx,sy,orbit,0,Math.PI*2);
            ctx.stroke();
        }

        let angle=time/p.speed;
        let px=sx+Math.cos(angle)*orbit;
        let py=sy+Math.sin(angle)*orbit;

        drawPlanet(p,px,py,angle,sx,sy);
    });
}

function drawLabel(text,x,y,size){

    const zoom=camera.zoom;

    if(zoom<0.25) return; // longe demais

    ctx.font=`${12*zoom+6}px Arial`;
    ctx.textAlign="center";

    // fundo
    ctx.fillStyle="rgba(0,0,20,0.6)";
    let width=ctx.measureText(text).width+10;
    ctx.fillRect(x-width/2,y-size-20*zoom,width,18*zoom);

    // texto
    ctx.fillStyle="white";
    ctx.fillText(text,x,y-size-6*zoom);
}


function drawPlanet(p,x,y,angle,sx,sy){

    let size=p.size*camera.zoom;

    let lightAngle=Math.atan2(y-sy,x-sx);

    let g=ctx.createRadialGradient(
        x-size*Math.cos(lightAngle),
        y-size*Math.sin(lightAngle),
        size*0.2,
        x,y,size
    );

    g.addColorStop(0,"white");
    g.addColorStop(.3,p.color);
    g.addColorStop(1,"black");

    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.arc(x,y,size,0,Math.PI*2);
    ctx.fill();

    // Saturno anel
    if(p.ring){
        ctx.strokeStyle="rgba(220,200,150,0.7)";
        ctx.lineWidth=2*camera.zoom;
        ctx.beginPath();
        ctx.ellipse(x,y,size*2,size*0.8,0,0,Math.PI*2);
        ctx.stroke();
    }

    // Lua
    if(p.name==="Terra"){
        let mx=x+Math.cos(angle*12)*14*camera.zoom;
        let my=y+Math.sin(angle*12)*14*camera.zoom;

        ctx.fillStyle="#ccc";
        ctx.beginPath();
        ctx.arc(mx,my,2*camera.zoom,0,Math.PI*2);
        ctx.fill();

        drawLabel("Lua",mx,my,2*camera.zoom);
        drawEarthClock();
    }

    // nome do planeta
    drawLabel(p.name,x,y,size);
}


/* ================= RELÓGIO ================= */

function drawEarthClock(){
    const rot=getEarthRotation();
    const cx=canvas.width-120;
    const cy=120;
    const r=70;

    ctx.fillStyle="rgba(0,0,20,0.7)";
    ctx.beginPath();
    ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.fill();

    ctx.strokeStyle="white";
    ctx.stroke();

    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(rot);

    ctx.strokeStyle="cyan";
    ctx.lineWidth=4;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(0,-50);
    ctx.stroke();

    ctx.restore();
}

/* ================= LOOP ================= */

function animate(){
    ctx.fillStyle="black";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    stars.forEach(s=>s.draw());
    drawCore();
    drawSolar();

    requestAnimationFrame(animate);
}

animate();
