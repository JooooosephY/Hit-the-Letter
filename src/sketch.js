// setup initializes this to a p5.js Video instance.
let video;
let letters = [];
let hits = [];
let alphabet = ["A", "B", "C", "D", "E", "F", 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
let tf;
let count = 0;
let ca = 0;
let timer;
let rwx = 0; // rightWrist x positon
let rwy = 0; // rightWrist y position
let lwx = 0; // leftWrist x position
let lwy = 0; // leftWrist y position

let goin_b1 = true;
let goin_b2 = true;
let remaining = 0;
let frm = 0;

let score = 0; 


function preload() {
  tf = loadFont('ZaoZiGongFangQiaoPinTi-2.ttf');
}

// p5js calls this code once when the page is loaded (and, during development,
// when the code is modified.)
export function setup() {
  createCanvas(1024, 720);
  preload();
  video = select("video") || createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with single-pose detection. The second argument
  // is a function that is called when the model is loaded. It hides the HTML
  // element that displays the "Loading model…" text.
  const poseNet = ml5.poseNet(video, () => select("#status").hide());

  // Every time we get a new pose, apply the function `drawPoses` to it (call
  // `drawPoses(poses)`) to draw it.
  poseNet.on("pose", drawPoses);

  // Hide the video element, and just show the canvas
  video.hide();
}

// p5js calls this function once per animation frame. In this program, it does
// nothing---instead, the call to `poseNet.on` in `setup` (above) specifies a
// function that is applied to the list of poses whenever PoseNet processes a
// video frame.
export function draw() {}

function drawPoses(poses) {
  // console.log(poses);
  // Modify the graphics context to flip all remaining drawing horizontally.
  // This makes the image act like a mirror (reversing left and right); this is
  // easier to work with.
  push();
  translate(width, 0); // move the left side of the image to the right
  
  scale(-1.0, 1.0);
  // background("rgba(0, 0, 0, 0.05)");
  image(video, 0, 0, video.width, video.height);
  
  drawKeypoints(poses);
  drawSkeleton(poses);
  pop();

  // When the confidence score is more than 0.5, use rightWrist as the parameter
  if (poses[0].pose.rightWrist.confidence > 0.5){
    rwy = poses[0].pose.rightWrist.y;
    rwx = width - poses[0].pose.rightWrist.x;
  }else{
    rwx = mouseX;
    rwy = mouseY;
  }

  if (poses[0].pose.leftWrist.confidence > 0.5){
    lwy = poses[0].pose.leftWrist.y;
    lwx = width - poses[0].pose.leftWrist.x;
  } else{
    lwx = 0;
    lwy = 0;
  }

  let sizey0 = (height/3)+height/5;
  let sizey1 = (height/3)+1.8*height/5;
  let sizey2 = (height/3)+2.5*height/5;
  

  switch(ca){
    // Start page
    case 0:
      // Display the Start and Exit
      fill(255);
      textSize(int(width/10));
      textAlign(CENTER, CENTER);
      textFont(tf);
      text("Hit the Letter!", width/2, height/3);      
      textSize(width/25);
      text("-Start-", width/2, sizey0);
      text("-Exit-", width/2, sizey1);

      // The effect of putting your hand on the Start bar
      if (sizey0-width/20 <rwy && rwy< sizey0 + width/20 && rwx > width*1/16 && rwx < width * 15/16) {
        if (goin_b1) {
          timer = frameCount;
        }
        goin_b1 = false;
        noStroke();
        fill(0, 50);
        rectMode(CENTER);
        rect(width/2, sizey0, width*7/8, width/10);
        remaining = frameCount - timer;
        
        if (remaining < 160) { // less than 4 seconds, display progress bar
          fill(255);
          arc(rwx, rwy, 80, 80, 0, radians(map(remaining, 0, 159, 0, 360)), PIE);
        } else { // enter the game
          rwy = 100;
          ca = 1;
          frm = frameCount;
          goin_b1 = true;
        }
      } else {
        goin_b1 = true;
      }
      
      // The effect of putting your hand on the Exit bar
      if ( rwy > sizey1-width/20 && rwy< sizey1 + width/20 && rwx > width*1/16 && rwx < width * 15/16) {
        if (goin_b2) {
          timer = frameCount;
        }
        goin_b2 = false;
        noStroke();
        fill(255, 0, 0, 50);
        rectMode(CENTER);
        rect(width/2, sizey1, width*7/8, width/10);
        remaining = frameCount - timer;

        if (remaining < 160) { // less than 4 seconds, display progress bar
          fill(255);
          arc(rwx, rwy, 80, 80, 0, radians(map(remaining, 0, 159, 0, 360)), PIE);
        } else { // close the window
          window.close();
        }
      } else {
        goin_b2 = true;
      }

      break;
    
    // Game page
    case 1:
      // generate 1 letter per 10 frames
      if (count == 0){
        letters.push( new Letter(random(width), random(0, -100), alphabet[int(random(0,25))]) );
        count ++;
      }else if (count < 10){
        count ++;
      }else if(count == 10){
        count = 0;
      }

      // update and display the letters
      for (let i=0; i<letters.length; i++) {
        let l = letters[i];
        l.move();
        l.updateLifespan();
        l.display();
      }

      // detect whether you hit the letter
      for (let i = letters.length-1; i >= 0; i--) {
        if (rwx < letters[i].x + letters[i].size / 2 && rwx > letters[i].x - letters[i].size && rwy < letters[i].y + letters[i].size && rwx > letters[i].x - letters[i].size){
          letters[i].hit();
          letters.splice(i, 1);
          score ++;
        } else if (lwx < letters[i].x + letters[i].size / 2 && lwx > letters[i].x - letters[i].size && lwy < letters[i].y + letters[i].size && lwx > letters[i].x - letters[i].size){
          letters[i].hit();
          letters.splice(i, 1);
          score ++;
        }
      }

      // remove letters which are done!
      for (let i = letters.length-1; i >= 0; i--) {
        if (letters[i].isDone) {
          letters.splice(i, 1);
        }
      }

      // update and display the hits
      for (let i=0; i<hits.length; i++) {
        let e = hits[i];
        e.move();
        e.updateLifespan();
        e.display();
      }

      // remove hits which are done!
      for (let i = hits.length-1; i >= 0; i--) {
        if (hits[i].isDone) {
          hits.splice(i, 1);
        }
      }
      
      if (frameCount - frm > 1000){
        ca = 2;
      }

      break;

    // Ending page
    case 2:
      textSize(int(width/10));
      textAlign(CENTER, CENTER);
      fill(200, 100, 100);
      textFont(tf);
      text("The End", width/2, height/3);
      textSize(width/25);
      fill(255);
      textFont('Georgia')
      text("Score: " + score, width/2, sizey0);
      textFont(tf);
      text("-Restart-", width/2, sizey1);
      text("-Exit-", width/2, sizey2);

      if ( rwy > sizey1-width/30 && rwy < sizey1 + width/30 && rwx > width*1/16 && rwx < width * 15/16) {
        if (goin_b1) {
          timer = frameCount;
        }
        goin_b1 = false;
        noStroke();
        fill(0, 50);
        rectMode(CENTER);
        rect(width/2, sizey1, width*7/8, width/15);
        remaining = frameCount - timer;

        if (remaining < 160) { // less than 4 seconds, display progress bar
          fill(255);
          arc(rwx, rwy, 80, 80, 0, radians(map(remaining, 0, 159, 0, 360)), PIE);
        } else { // Restart the game
          rwy = 100;
          ca = 1;
          initialize();
          goin_b1 = true;
        }
      } else {
        goin_b1 = true;
      }
  
      if ( rwy > sizey2-width/30 && rwy < sizey2 + width/30 && rwx > width*1/16 && rwx < width * 15/16) {
        if (goin_b2) {
          timer = frameCount;
        }
        goin_b2 = false;
        noStroke();
        fill(255, 0, 0, 50);
        rectMode(CENTER);
        rect(width/2, sizey2, width*7/8, width/15);
        remaining = frameCount - timer;

        if (remaining < 160) { // less than 4 seconds, display progress bar
          fill(255);
          arc(rwx, rwy, 80, 80, 0, radians(map(remaining, 0, 159, 0, 360)), PIE);
        } else { // close the window
          window.close();
        }
      } else {
        goin_b2 = true;
      }

      break;
  }
  


  // display the frameRate
  fill(255);
  textSize(13);
  text( frameRate(), 80, 20 );
}

// Draw ellipses over the detected keypoints
function drawKeypoints(poses) {
  poses.forEach(pose =>
    pose.pose.keypoints.forEach(keypoint => {
      if (keypoint.score > 0.2) {
        fill(0, 255, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    })
  );
}

// Draw connections between the skeleton joints.
function drawSkeleton(poses) {
  poses.forEach(pose => {
    pose.skeleton.forEach(skeleton => {
      // skeleton is an array of two keypoints. Extract the keypoints.
      const [p1, p2] = skeleton;
      stroke(255, 255, 0);
      strokeWeight(5);
      line(p1.position.x, p1.position.y, p2.position.x, p2.position.y);
    });
  });
}

// Initialize the game
function initialize(){
  score = 0;
  hits = [];
  letters = [];
  frm = frameCount;
}



// Letter class
class Letter {
  constructor(x, y, txt) {
    // properties
    this.x = x;
    this.y = y;
    this.size = 45;
    this.xSpd = 0;
    this.ySpd = random(7, 13);
    this.r = 255;
    this.g = 255;
    this.b = 255;

    this.txt = txt; 
    // Lifespan of the firework
    this.lifespan = 1.0; // 100%
    this.lifeReduction = random(0.008, 0.015);
    this.isDone = false;
  }
  // methods

  updateLifespan() {
    this.lifespan -= this.lifeReduction;
    if (this.lifespan <= 0.0) {
      this.isDone = true;
    }
  }

  // move the letter
  move() {
    this.x += this.xSpd;
    this.y += this.ySpd;
  }
  
  // display the letter
  display() {
    noStroke();
    fill(255, 255, 255, 0);
    ellipse(this.x, this.y, this.size, this.size);

    fill(this.r, this.g, this.b);
    textSize(50);
    textFont('Georgia');
    text( this.txt, this.x - 4, this.y + 6);
  }

  // hit the letter
  hit(){
    for (let i = 0; i < 20; i++){
      hits.push( new Hit(this.x, this.y) );
    }
  }
}

// Explosion class
class Hit {
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.size = random(10, 25);
    this.xSpd = random(-2, 2);
    this.ySpd = random(-2, 2);
    this.r = random(0,255);
    this.g = random(0,255);
    this.b = random(0,255);
    this.lifespan = 0.3; // 50%
    this.lifeReduction = random(0.002, 0.008);
    this.isDone = false;
  }


  move() {
    this.x -= this.xSpd;
    this.y -= this.ySpd;
  }

  display(){
    noStroke();
    fill(this.r, this.g, this.b, 500 * this.lifespan);
    ellipse(this.x, this.y, this.size * this.lifespan, this.size * this.lifespan);
  }

  updateLifespan() {
    this.lifespan -= this.lifeReduction;
    if (this.lifespan <= 0.0) {
      this.isDone = true;
    }
  }
}