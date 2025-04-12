export interface KafkaMessage {
  key: string;
  value: any;
  offset: string;
  partition: number;
}