import React, { useCallback, useEffect, useState, useRef } from 'react';
import Hls from 'hls.js';
import './Video.css';

const VIDEO_SRC = "https://10380e91fda5e303.mediapackage.us-west-2.amazonaws.com/out/v1/3f767e030a234db8a9d7ef715d41a809/index.m3u8";

function Video () {
  const [hlsInstance, setHls] = useState(null);
  const [logs, setLogs] = useState(['Loading...']);
  const [loading, setLoading] = useState(false);

  const onLevelEffective = useCallback((event, data) => {
    const { level } = data;
    setLogs([...logs,
      `Effective Quality Level: ${level}`]);
    setLoading(false);
  }, [logs])

  const videoRef = useRef(null);

  useEffect(() => {
    if(hlsInstance) {
      return;
    }
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
        console.log("Manifest Parsed", data);
      });

      hls.on(Hls.Events.LEVEL_SWITCHING, (event, data) => {
        const { level, attrs: { RESOLUTION } } = data;
        setLogs([...logs,
          `Switching to Quality Level ${level} [${RESOLUTION}]...`
        ]);
        setLoading(true);
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, onLevelEffective);

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // try to recover network error
              setLogs([...logs,
                'Fatal network error encountered, trying to recover...'
              ]);
              console.log(data);
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setLogs([...logs,
              'Fatal media error encountered, trying to recover...'
              ]);
              console.log(data);
              hls.recoverMediaError();
              break;
            default:
              // cannot recover
              setLogs([...logs,
                'Fatal error encountered, cannot recover, self-destructing.']);
              console.log(data);
              hls.destroy();
              break;
          }
        } else {
          setLogs([...logs,
            `Non-fatal error encountered [${data.type}:${data.event}].`
          ]);
          console.log(data);
        }
      })
    } 
  }, [videoRef, hlsInstance, onLevelEffective, logs])

  const containerClass = loading ? "loading" : "";
  return(
    <section id="videoContainer"
      className={containerClass}>
      <video controls id="video" ref={videoRef}></video>
      <footer>
        <ul id="logs" className="lcd-text">
          {logs.map((message, key) => (
              <li key={key}>
                {message}<span className="cursor">&nbsp;</span>
              </li>
            )
          )}
        </ul>
      </footer>
      <article id="grid-container">
        <section id="grid"/>
      </article>
    </section>
  );
}

export default Video;
