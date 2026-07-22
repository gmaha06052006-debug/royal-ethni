import {
  FilesetResolver,
  PoseLandmarker
} from "@mediapipe/tasks-vision";


let detector: PoseLandmarker | null = null;


export async function loadPoseDetector(){

 if(detector) return detector;


 const vision = await FilesetResolver.forVisionTasks(
 "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
 );


 detector =
 await PoseLandmarker.createFromOptions(
 vision,
 {
 baseOptions:{
 modelAssetPath:
 "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task"
 },
 runningMode:"IMAGE"
 }
 );

 return detector;
}



export async function detectBody(image:HTMLImageElement){

 const poseDetector = await loadPoseDetector();

 const result =
 poseDetector.detect(image);


 return result.landmarks[0];

}
export function getBodyPosition(landmarks:any){

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  const leftHip = landmarks[23];
  const rightHip = landmarks[24];


  return {

    shoulderCenter:{
      x:(leftShoulder.x + rightShoulder.x)/2,
      y:(leftShoulder.y + rightShoulder.y)/2
    },


    hipCenter:{
      x:(leftHip.x + rightHip.x)/2,
      y:(leftHip.y + rightHip.y)/2
    },


    bodyWidth:
    Math.abs(
      rightShoulder.x-leftShoulder.x
    )

  };

}
