export type RemoteStreamEntry = {
    stream: MediaStream;
    name: string;
    peerId: string;
    kind: "audio" | "video" | "board" | "screen";
    mediaTag: string;
};