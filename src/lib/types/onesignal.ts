export interface SubscriptionStatus {
    isSubscribed: boolean;
    isPushSupported: boolean;
    token: string | null;
  }
  
  export interface PushSubscriptionData {
    token?: string;
    optedIn?: boolean;
  }
  
  export interface UserData {
    [key: string]: string;
  }