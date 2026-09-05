-keep class .zego.{*;}
-keep class **.zego.**  { *; }
-keep class **.**.zego_zpns.** { *; }

-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**
-dontwarn io.flutter.embedding.**

-keep class com.pichillilorenzo.flutter_inappwebview.** { *; }
-dontwarn com.pichillilorenzo.flutter_inappwebview.**

# Stripe
-keep class com.stripe.android.** { *; }
-dontwarn com.stripe.android.**
-keep class com.reactnativestripesdk.** { *; }
-dontwarn com.reactnativestripesdk.**

# Google Mobile Ads
-keep class com.google.android.gms.ads.** { *; }
-keep interface com.google.android.gms.ads.** { *; }
-keep class com.google.android.gms.internal.ads.** { *; }
-keep interface com.google.android.gms.internal.ads.** { *; }
-keep class com.google.ads.** { *; }
-keep class io.flutter.plugins.googlemobileads.** { *; }

# Path Provider and Pigeon
-keep class dev.flutter.pigeon.** { *; }
-keep class io.flutter.plugins.pathprovider.** { *; }
-keep public class io.flutter.plugins.pathprovider.PathProviderPlugin
-keep public class io.flutter.plugins.pathprovider.Messages
-keep class io.flutter.plugins.pathprovider.PathProviderPlugin { *; }

# FFmpegKit
-keep class com.arthenica.ffmpegkit.** { *; }
-keep class com.antonkarpenko.ffmpegkit.** { *; }

