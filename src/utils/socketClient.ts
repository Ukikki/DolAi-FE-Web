import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

type SubscriptionCallback = (data: any) => void;

export class SocketClient {
  private client: Client;
  private connected = false;
  private subscriptions: Record<string, () => void> = {};
  private pendingSubscriptions: Record<string, SubscriptionCallback> = {};

  constructor(private baseUrl: string) {
    this.client = new Client({
      webSocketFactory: () => {
        try {
          return new SockJS(this.baseUrl);
        } catch (err) {
          console.error("🚨 SockJS 연결 실패:", err);
          throw err;
        }
      },
      reconnectDelay: 5000,
      debug: (msg) => console.debug(`[STOMP] ${msg}`),
    });

    this.client.onConnect = () => {
      this.connected = true;
      console.log(`🔌 연결됨: ${this.baseUrl}`);

      // 예약된 구독 처리
      Object.entries(this.pendingSubscriptions).forEach(([topic, cb]) => {
        this.subscribe(topic, cb);
      });
      this.pendingSubscriptions = {};
    };

    this.client.onStompError = (frame) => {
      console.error("❌ STOMP 오류:", frame.headers["message"]);
    };

    this.client.onDisconnect = () => {
      this.connected = false;
      console.log("🛑 연결 끊김");
    };

    this.client.activate(); // 연결 시작
  }

  public connect(): void {
    if (!this.connected && this.client) {
      this.client.activate();
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public subscribe(topic: string, callback: SubscriptionCallback): void {
    if (this.connected && this.client.connected) {
      if (this.subscriptions[topic]) return; // 이미 구독 중이면 패스

      const subscription = this.client.subscribe(topic, (message: IMessage) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (err) {
          console.warn("❗ 메시지 파싱 오류", err);
        }
      });

      this.subscriptions[topic] = () => subscription.unsubscribe();
      console.log(`📌 구독됨: ${topic}`);
    } else {
      this.pendingSubscriptions[topic] = callback;
      console.log(`🕓 구독 예약됨: ${topic}`);
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
    if (this.client && this.connected) {
      this.client.deactivate();
      this.connected = false;
      this.subscriptions = {};
      this.pendingSubscriptions = {};
      console.log("🛑 소켓 완전 종료");
    }
  }
}