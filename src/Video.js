import React, { useCallback, useEffect, useState, useRef } from 'react';
import Hls from 'hls.js';
import './Video.css';

const VIDEO_SRC = "https://10380e91fda5e303.mediapackage.us-west-2.amazonaws.com/out/v1/3f767e030a234db8a9d7ef715d41a809/index.m3u8";

function Video () {
  const [qualityLevels, setQualityLevels] = useState([]);
  const [hlsInstance, setHls] = useState(null);
  const onQualitySelect = useCallback((e) => {
    console.log("ON SELECT", e.target.value);
    const newLevel = parseInt(e.target.value, 10) || -1;
    console.log("HLS INSTANCE", hlsInstance);
    hlsInstance?.levelController?.loadLevel(newLevel);
  }, [hlsInstance]);
  const videoRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = VIDEO_SRC;
      //
      // If no native HLS support, check if hls.js is supported
      //
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      setHls(hls);
      hls.loadSource(VIDEO_SRC);
      hls.attachMedia(video);
			hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        console.log("Levels", data.levels);
        setQualityLevels(data.levels);
      });

      hls.on(Hls.Events.LEVEL_SWITCHING, (event, data) => {
        console.log("Level Switch Requested", data);
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        console.log("Level Switch is Effective", data);
      });
    } 
  }, [videoRef])
  const currentLevelIndex = hlsInstance?.levelController?.currentLevelIndex || -1;
  console.log("CURRENT LEVEL INDEX", currentLevelIndex);
  return(
    <section id="videoContainer">
      <video controls id="video" ref={videoRef}></video>
      <aside id="videoControls">
        <div>
          <label id="levelsLabel" htmlFor="levels">Quality</label>
          <select label="levels"
            onChange={onQualitySelect}
            value={currentLevelIndex}>
            <option value="-1">Auto</option>
            {qualityLevels.map((level, index) => 
              (<option key={index} value={index}>{level.attrs.RESOLUTION}</option>)
            )}
          </select>
        </div>
      </aside>
    </section>
  );
}

export default Video;
