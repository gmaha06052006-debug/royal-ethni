import {useEffect,useRef} from "react";

interface Props{

 userImage:string;

 sareeImage:string;

 body:any;

 onComplete:(img:string)=>void;

}


export default function TryOnCanvas({
userImage,
sareeImage,
body,
onComplete
}:Props){


const canvasRef =
useRef<HTMLCanvasElement>(null);


useEffect(()=>{


const canvas = canvasRef.current;

if(!canvas)return;


const ctx = canvas.getContext("2d");

if(!ctx)return;



const person = new Image();

const saree = new Image();


person.src=userImage;



person.onload=()=>{


canvas.width=person.width;

canvas.height=person.height;


ctx.drawImage(person,0,0);



saree.src=sareeImage;



saree.onload=()=>{


const x =
body.shoulderCenter.x *
person.width;


const y =
body.shoulderCenter.y *
person.height;


const width =
body.bodyWidth *
person.width *
3;



ctx.drawImage(
saree,

x-width/2,

y,

width,

width*1.6

);


const final =
canvas.toDataURL();


onComplete(final);

};


};



},[]);


return <canvas ref={canvasRef}/>

}