(function() {

// global variables used by blocks' functions 
var _puzzleVars = {};
_puzzleVars.objClickCallbacks = [];
_puzzleVars.loopTrap = 1000;
_puzzleVars.frameRate = 24;

var i;

// playAnimation, playAnimationExt and stopAnimation blocks
function operateAnimation(operation, animations, from, to, timeScale, callback) {
   if (!animations) return;
   // input can be either single obj or array of objects
   if (typeof animations == "string") animations = [animations];
   for (var i = 0; i < animations.length; i++) {
       var animName = animations[i];
       if (!animName) continue;
       var action = v3d.SceneUtils.getAnimationActionByName(v3dApp, animName);
       if (!action) continue;
       switch (operation) {
       case "PLAY":
           if (!action.isRunning()) {
               if (timeScale == 1) {
                   action.timeScale = Math.abs(action.timeScale);
                   action.time = from ? from/_puzzleVars.frameRate : 0;
                   if (to)
                       action.getClip().duration = to/_puzzleVars.frameRate;
               } else {
                   action.timeScale = -Math.abs(action.timeScale);
                   action.time = to ? to/_puzzleVars.frameRate : action.getClip().duration;
               }
               action.paused = false;
               action.play();
               var mixer = action.getMixer();
               var listener = function(e) {
                   mixer.removeEventListener("finished", listener);
                   callback();
               };
               mixer.addEventListener("finished", listener);
           }
           break;
       case "STOP":
           action.stop();
           break;
       }
   }
}

// whenClicked block
function initObjectPicking(callback) {
   var elem = v3dApp.renderer.domElement;
   elem.addEventListener("mousedown", onMouseDown, false);
   elem.addEventListener("touchstart", onTouchStart, false);
   var raycaster = new v3d.Raycaster();
   var mouse = new v3d.Vector2();
   function onTouchStart(event) {
       event.preventDefault();
       event.clientX = event.touches[0].clientX;
       event.clientY = event.touches[0].clientY;
       onMouseDown(event);
   }
   function onMouseDown(event) {
       event.preventDefault();
       mouse.x = (event.clientX / elem.clientWidth) * 2 - 1;
       mouse.y = -(event.clientY / elem.clientHeight) * 2 + 1;
       raycaster.setFromCamera(mouse, v3dApp.camera);
       var objList = [];
       v3dApp.scene.traverse(function(obj){objList.push(obj);});
       var intersects = raycaster.intersectObjects(objList);
       if (intersects.length > 0) {
           var obj = intersects[0].object;
           callback(obj);
       } else {
           callback(null);
       }
   }
}

// whenClicked block
initObjectPicking(function(obj) {
   if (!obj)
       return;
   for (var i = 0; i < _puzzleVars.objClickCallbacks.length; i++) {
       var cb = _puzzleVars.objClickCallbacks[i];
       var targetObjName = cb[0];
       var fun = cb[1];
       if (obj.name == targetObjName) {
           fun();
       } else { // also check children
           var targetObj = v3dApp.scene.getObjectByName(targetObjName);
           for (var j = 0; j < targetObj.children.length; j++) {
               var child = targetObj.children[j];
               if (obj.name == child.name)
                   fun();
           }
       }
   }
});

// whenClicked block
function registerOnClick(objNames, callback) {
   if (!objNames) return;
   // input can be either single obj or array of objects
   if (typeof objNames == "string") objNames = [objNames];
   for (var i = 0; i < objNames.length; i++) {
       var objName = objNames[i];
       if (!objName) continue;
       _puzzleVars.objClickCallbacks.push([objName, callback]);
   }
}

// assignMaterial block
function assignMat(objNames, matName) {
   if (!objNames || !matName)
       return;
   var mat = v3d.SceneUtils.getMaterialByName(v3dApp, matName);
   if (!mat)
       return;
   // input can be either single obj or array of objects
   if (typeof objNames == "string")
       objNames = [objNames];
   for (var i = 0; i < objNames.length; i++) {
       var objName = objNames[i];
       if (!objName)
           continue;
       var obj = v3dApp.scene.getObjectByName(objName);
       if (obj)
           obj.material = mat;
   }
}

// updateTextObject block
function updateTextObj(objNames, text) {
   if (!objNames) return;
   // input can be either single obj or array of objects
   if (typeof objNames == "string") objNames = [objNames];
   for (var i = 0; i < objNames.length; i++) {
       var objName = objNames[i];
       if (!objName) continue;
       var obj = v3dApp.scene.getObjectByName(objName);
       if (!obj || !obj.geometry || !obj.geometry.cloneWithText)
           continue;
       obj.geometry = obj.geometry.cloneWithText(text)
   }
}

// tweenCamera block
function tweenCamera(posObjName, targetObjName, duration) {
   if (!targetObjName || v3dApp.controls.inTween)
       return;
   if (posObjName)
       var posObj = v3dApp.scene.getObjectByName(posObjName);
   else
       var posObj = v3dApp.camera;
   var targetObj = v3dApp.scene.getObjectByName(targetObjName);
   if (!posObj || !targetObj)
       return;
   v3dApp.controls.tween(posObj.position, targetObj.position, duration);
}


registerOnClick("arrow", function() {
  operateAnimation("PLAY", "Empty", null, null, 1, function() {});
});

registerOnClick("STOP", function() {
  operateAnimation("STOP", "Empty", null, null, 1, function() {});
});

registerOnClick("ulna", function() {
  var i_list = ["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"];
  for (var i_index in i_list) {
    i = i_list[i_index];
  if (--_puzzleVars.loopTrap == 0) throw "Puzzles: infinite loop.";
    assignMat(["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"], "White___Vray");
  }
  assignMat("ulna", "highlight");
  updateTextObj("Text", 'ulna');
  updateTextObj("datails", 'together with the radius, the ulna enables the wrist joint to rotate');
});

registerOnClick("tibia", function() {
  var i_list2 = ["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"];
  for (var i_index2 in i_list2) {
    i = i_list2[i_index2];
  if (--_puzzleVars.loopTrap == 0) throw "Puzzles: infinite loop.";
    assignMat(["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"], "White___Vray");
  }
  assignMat("tibia", "highlight");
  updateTextObj("Text", 'tibia');
  updateTextObj("datails", 'Many powerful muscles that move the foot and lower leg are anchored to the tibia');
});

registerOnClick("sternum", function() {
  var i_list3 = ["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"];
  for (var i_index3 in i_list3) {
    i = i_list3[i_index3];
  if (--_puzzleVars.loopTrap == 0) throw "Puzzles: infinite loop.";
    assignMat(["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"], "White___Vray");
  }
  assignMat("sternum", "highlight");
  updateTextObj("Text", 'sternum');
  updateTextObj("datails", 'protects the heart, lungs, and blood vessels from physical damage');
});

registerOnClick("spine", function() {
  var i_list4 = ["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"];
  for (var i_index4 in i_list4) {
    i = i_list4[i_index4];
  if (--_puzzleVars.loopTrap == 0) throw "Puzzles: infinite loop.";
    assignMat(["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"], "White___Vray");
  }
  assignMat("spine", "highlight");
  updateTextObj("Text", 'spine');
  updateTextObj("datails", 'designed to protect your spinal cord');
});

registerOnClick("scapula", function() {
  var i_list5 = ["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"];
  for (var i_index5 in i_list5) {
    i = i_list5[i_index5];
  if (--_puzzleVars.loopTrap == 0) throw "Puzzles: infinite loop.";
    assignMat(["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"], "White___Vray");
  }
  assignMat("scapula", "highlight");
  updateTextObj("Text", 'scapula');
  updateTextObj("datails", 'attach the upper arm to the thorax, or trunk of the body');
});

registerOnClick("ribs", function() {
  var i_list6 = ["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"];
  for (var i_index6 in i_list6) {
    i = i_list6[i_index6];
  if (--_puzzleVars.loopTrap == 0) throw "Puzzles: infinite loop.";
    assignMat(["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"], "White___Vray");
  }
  assignMat("ribs", "highlight");
  updateTextObj("Text", 'ribs');
  updateTextObj("datails", 'protects the organs in the chest cavity');
});

registerOnClick("radius", function() {
  var i_list7 = ["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"];
  for (var i_index7 in i_list7) {
    i = i_list7[i_index7];
  if (--_puzzleVars.loopTrap == 0) throw "Puzzles: infinite loop.";
    assignMat(["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"], "White___Vray");
  }
  assignMat("radius", "highlight");
  updateTextObj("Text", 'radius');
  updateTextObj("datails", 'plays a vital role in how the forearm rotates');
});

registerOnClick("patela", function() {
  var i_list8 = ["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"];
  for (var i_index8 in i_list8) {
    i = i_list8[i_index8];
  if (--_puzzleVars.loopTrap == 0) throw "Puzzles: infinite loop.";
    assignMat(["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"], "White___Vray");
  }
  assignMat("patela", "highlight");
  updateTextObj("Text", 'patela');
  updateTextObj("datails", 'increases the leverage that the tendon can exert on the femur by increasing the angle at which it acts.');
});

registerOnClick("mandible", function() {
  var i_list9 = ["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"];
  for (var i_index9 in i_list9) {
    i = i_list9[i_index9];
  if (--_puzzleVars.loopTrap == 0) throw "Puzzles: infinite loop.";
    assignMat(["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"], "White___Vray");
  }
  assignMat("mandible", "highlight");
  updateTextObj("Text", 'mandible');
  updateTextObj("datails", 'Movement of the lower jaw opens and closes the mouth and also allows for the chewing of food');
});

registerOnClick("humerus", function() {
  var i_list10 = ["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"];
  for (var i_index10 in i_list10) {
    i = i_list10[i_index10];
  if (--_puzzleVars.loopTrap == 0) throw "Puzzles: infinite loop.";
    assignMat(["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"], "White___Vray");
  }
  assignMat("humerus", "highlight");
  updateTextObj("Text", 'humerus');
  updateTextObj("datails", 'the humerus is indeed very important in the proper functioning and movement of the entire arm');
});

registerOnClick("fibula", function() {
  var i_list11 = ["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"];
  for (var i_index11 in i_list11) {
    i = i_list11[i_index11];
  if (--_puzzleVars.loopTrap == 0) throw "Puzzles: infinite loop.";
    assignMat(["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"], "White___Vray");
  }
  assignMat("fibula", "highlight");
  updateTextObj("Text", 'fibula');
  updateTextObj("datails", 'plays a significant role in stabilizing the ankle and supporting the muscles of the lower leg');
});

registerOnClick("femur", function() {
  var i_list12 = ["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"];
  for (var i_index12 in i_list12) {
    i = i_list12[i_index12];
  if (--_puzzleVars.loopTrap == 0) throw "Puzzles: infinite loop.";
    assignMat(["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"], "White___Vray");
  }
  assignMat("femur", "highlight");
  updateTextObj("Text", 'femur');
  updateTextObj("datails", 'the strongest bone in the body');
});

registerOnClick("cranium", function() {
  var i_list13 = ["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"];
  for (var i_index13 in i_list13) {
    i = i_list13[i_index13];
  if (--_puzzleVars.loopTrap == 0) throw "Puzzles: infinite loop.";
    assignMat(["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"], "White___Vray");
  }
  assignMat("cranium", "highlight");
  updateTextObj("Text", 'cranium');
  updateTextObj("datails", 'supports facial structures and protects the brain');
});

registerOnClick("clavicle", function() {
  var i_list14 = ["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"];
  for (var i_index14 in i_list14) {
    i = i_list14[i_index14];
  if (--_puzzleVars.loopTrap == 0) throw "Puzzles: infinite loop.";
    assignMat(["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"], "White___Vray");
  }
  assignMat("clavicle", "highlight");
  updateTextObj("Text", 'clavicle');
  updateTextObj("datails", 'serves as a strut between the shoulder blade and the sternum');
});

registerOnClick("sub02001", function() {
  var i_list15 = ["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"];
  for (var i_index15 in i_list15) {
    i = i_list15[i_index15];
  if (--_puzzleVars.loopTrap == 0) throw "Puzzles: infinite loop.";
    assignMat(["clavicle", "cranium", "femur", "fibula", "humerus", "mandible", "patela", "radius", "ribs", "scapula", "spine", "sternum", "tibia", "ulna", "sub02001"], "White___Vray");
  }
  assignMat("sub02001", "highlight");
  updateTextObj("Text", 'pelvis');
  tweenCamera('', "sub02001", 1);
  updateTextObj("datails", 'protects the delicate organs of the abdominopelvic cavity');
});

})();