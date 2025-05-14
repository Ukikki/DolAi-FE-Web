import SockJS from "sockjs-client";
import { Client, Message, over } from "stompjs";

type SubscriptionCallback = (data: any) => void;

export class SocketClient {
  private stompClient: Client | null = null;
  private connected = false;
  private subscriptions: Record<string, () => void> = {};
  private pendingSubscriptions: Record<string, SubscriptionCallback> = {};

  constructor(private baseUrl: string) {
    this.init(); // 생성 시 바로 연결 시도
  }

  private init(): void {
    const socket = new SockJS(this.baseUrl);
    this.stompClient = over(socket);

    this.stompClient.connect({}, () => {
      this.connected = true;
      console.log(`🔌 연결됨: ${this.baseUrl}`);

      Object.entries(this.pendingSubscriptions).forEach(([topic, cb]) => {
        this.subscribe(topic, cb);
      });
      this.pendingSubscriptions = {};
    }, (err) => {
      console.error("❌ 소켓 연결 실패:", err);
    });
  }

  public connect(): void {
    if (!this.connected) {
      this.init();
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }

    public subscribe(topic: string, callback: SubscriptionCallback): void {
    try {
        if (this.connected && this.stompClient) {
        if (this.subscriptions[topic]) return;

        const subscription = this.stompClient.subscribe(topic, (message: Message) => {
            const data = JSON.parse(message.body);
            callback(data);
        });

        this.subscriptions[topic] = () => subscription.unsubscribe();
        console.log(`📌 구독됨: ${topic}`);
        } else {
        this.pendingSubscriptions[topic] = callback;
        console.log(`🕓 구독 예약됨: ${topic}`);
        }
    } catch (e) {
        console.warn("❗구독 실패, 재시도 예약:", topic, e);
        this.pendingSubscriptions[topic] = callback;
        }
    }

  public unsubscribe(topic: string): void {
    if (this.subscriptions[topic]) {
      this.subscriptions[topic]!();
      delete this.subscriptions[topic];
      console.log(`🚫 구독 해제: ${topic}`);
    }
    if (this.pendingSubscriptions[topic]) {
      delete this.pendingSubscriptions[topic];
    }
  }

  public disconnect(): void {
    if (this.stompClient && this.connected) {
      this.stompClient.disconnect(() => {
        console.log("🛑 소켓 연결 종료");
        this.connected = false;
        this.subscriptions = {};
        this.pendingSubscriptions = {};
      });
    }
  }
}