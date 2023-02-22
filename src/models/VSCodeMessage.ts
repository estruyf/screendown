export interface VSCodeMessage { 
  command: string;
  payload: any;
  requestId?: string;
}