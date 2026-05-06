import { Purchases, LOG_LEVEL } from "@revenuecat/purchases-capacitor";
import { RevenueCatUI } from "@revenuecat/purchases-capacitor-ui";
import { isIOS } from "@/utils/platform";
import { REVENUECAT_API_KEY, REVENUECAT_ENTITLEMENT_ID, REVENUECAT_OFFERING_ID } from "@/config/revenuecat";

export class RevenueCatService {
  private static initialized = false;

  static async initialize(userId?: string) {
    if (!isIOS()) return;
    if (this.initialized) return;

    try {
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
      await Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
        appUserID: userId,
      });
      this.initialized = true;
      console.log("RevenueCat initialized");
    } catch (e) {
      console.error("RevenueCat initialization failed", e);
    }
  }

  static async checkSubscription(): Promise<boolean> {
    if (!isIOS()) return false;
    
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return !!customerInfo.customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_ID];
    } catch (e) {
      console.error("Error checking RevenueCat subscription", e);
      return false;
    }
  }

  static async presentPaywall(): Promise<boolean> {
    if (!isIOS()) return false;

    try {
      const offerings = await Purchases.getOfferings();
      const offering = offerings.all[REVENUECAT_OFFERING_ID] || offerings.current;
      
      if (!offering) {
        throw new Error("No offerings found. Please check your RevenueCat configuration.");
      }

      await RevenueCatUI.presentPaywall({
        offering: offering
      });
      
      return await this.checkSubscription();
    } catch (e: any) {
      console.error("Error presenting RevenueCat paywall", e);
      throw new Error(e.message || "Could not show the subscription paywall. Please try again.");
    }
  }

  static async restorePurchases(): Promise<boolean> {
    if (!isIOS()) return false;

    try {
      const customerInfo = await Purchases.restorePurchases();
      return !!customerInfo.customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_ID];
    } catch (e) {
      console.error("Error restoring purchases", e);
      return false;
    }
  }
}
