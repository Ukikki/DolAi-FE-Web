import { useEffect, useRef } from "react";

interface Props {
  stream: MediaStream;
}

export default function RemoteVideo({ stream }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return <video ref={ref} autoPlay playsInline />;
}
