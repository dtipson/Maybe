const {Maybe, Nothing, Just} = require('../../src/Maybe.js');

const createVideo = videoURL => {

  console.log('creating video w/',videoURL);

  var video = document.createElement('video');

  video.addEventListener('error', e => {
    console.log('video play error', e, video.error);
    Maybe.fromNullable(video.parentNode).map(x => x.removeChild(video));
  }, true);

  video.controls = false;
  video.className = 'grid-video';
  video.autoplay = false;
  video.muted = true;
  video.loop = true;
  video.width = 320;
  video.height = 240;

  video.src = videoURL;

  video.onloadedmetadata = function(e) {
    video.play();
  }

  return video;
};

const appendToBody = el => {
  document.body.appendChild(el);
  return el;
}

const appendToBodyThenPrepend = limit => el => {
  const videos = Array.from(document.querySelectorAll('video'));
  if(!videos.length){
    document.body.appendChild(el);
  }
  else if(videos.length<limit){;
    document.body.insertBefore(el, videos[0]);
  }else{
    const lastVideo = videos.slice(-1)[0];
    const src = lastVideo.src;
    
    document.body.removeChild(lastVideo);
    window.URL.revokeObjectURL(src);
    document.body.insertBefore(el, videos[0]);
  }
  return el;
}

const createMediaRecorder = stream => {
  let mediaRecorder;
  var options = {mimeType: 'video/webm;codecs=vp9'};
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.log(options.mimeType + ' is not Supported');
    options.mimeType= 'video/webm;codecs=vp8';
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.log(options.mimeType + ' is not Supported');
      options.mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + ' is not Supported');
        options.mimeType= '';
      }
    }
  }
  try {
    mediaRecorder = new MediaRecorder(stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder: ' + e);
    console.error('Exception while creating MediaRecorder: '
      + e + '. mimeType: ' + options.mimeType);
    return;
  }

  mediaRecorder.onwarning = e => console.log('mr warning', e);

  return mediaRecorder;
};


const mrDataToBlobUrl = event => {
    return window.URL.createObjectURL(event.data);
};


const recordFromMRForMs = stream => recordForMS => {

  const mediaRecorder = createMediaRecorder(stream);

  let time = performance.now();

  console.log('preparing to record for', recordForMS);

  return new Promise((resolve, reject)=>{

    mediaRecorder.ondataavailable = event => {
      console.log('got data',mediaRecorder.state, event.data.size);
      if(event && event.data && event.data.size > 1){
        console.log('record time', performance.now()-time, 'now stopping');
        if(mediaRecorder.state === "recording"){
          mediaRecorder.stop();
        }
        resolve(event);
      }
    };

    mediaRecorder.onerror = e => !console.log('mr error', e) && reject(e);

    console.log(mediaRecorder.state,'mediaRecorder.state prerecord');

    mediaRecorder.start(recordForMS);

  });

};

const handleError = e => console.error('fatal error in chain',e);

const delay = milliseconds => x => new Promise(resolve => setTimeout(resolve, milliseconds, x));

const recordClips = number => stream => {
  const recordFor = time => recordFromMRForMs(stream)(time)
    .then(url=> !console.log(url) && url)
    .then(mrDataToBlobUrl)
    .then(createVideo)
    .then(delay(50))
    .then(appendToBodyThenPrepend(20));
  
  return Array.from({length:number}).reduce(
    P => P.then(_=>console.log('rec')).then(_ => recordFor(500)).then(delay(1000)), 
    Promise.resolve()
  ).catch(handleError);

};



const recordInfinite = duration => stream => {
  console.log('START INFINITE');
  return recordFromMRForMs(stream)(duration)
    .then(mrDataToBlobUrl)
    .then(createVideo)
    .then(delay(100))
    .then(appendToBodyThenPrepend(20))
    .then(_ => {
      console.log(_,'complete, starting next')
      return recordInfinite(duration)(stream);
    });
};



//closeStream :: Stream -> undefined
const closeStream = stream => {
  console.log('closing stream',stream);
  stream.getAudioTracks().forEach(track => track.stop());
  stream.getVideoTracks().forEach(track => track.stop());
}

//requestRecord :: Object (optional) -> Promise Stream
const requestRecord = (config={video:true, audio:true}) => {
  return navigator.mediaDevices && navigator.mediaDevices.getUserMedia ? 
    navigator.mediaDevices.getUserMedia(config).then(delay(1400)) ://extra delay at the start is to avoid the webcam flash
    Promise.reject('no support for getUserMedia');
};


// var muted = true;

// $('button').on('click',function(e){
//   $('video').get().forEach(function(v){
//     v.muted = !v.muted;
//   });
//   $(this).toggleClass('unmuted',muted);
//   muted = !muted;
// });


module.exports = {
  appendToBody,
  createVideo,
  mrDataToBlobUrl,
  createMediaRecorder,
  requestRecord,
  recordFromMRForMs,
  recordInfinite,
  closeStream,
  recordClips
};

//single cycle
//requestRecord().then(stream => recordFromMRForMs(createMediaRecorder(stream))(6900).then(mrDataToBlobUrl).then(createVideo).then(appendToBody).then(_=>closeStream(stream)))

// document.body.innerHTML = '';
// requestRecord().then(stream => {
//   recordClips(3000)(stream)
//     .then(_=>closeStream(stream))
// });

// document.querySelectorAll('video').forEach(function(v){
//   v.muted = !v.muted;
// });

document.querySelectorAll('button')[1].addEventListener('click',function(){
  document.body.innerHTML = '';
  requestRecord().then(stream => {
    recordInfinite(3000)(stream);
  });
});
