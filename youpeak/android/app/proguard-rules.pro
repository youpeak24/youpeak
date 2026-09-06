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

# Video Player & ExoPlayer / Media3
-keep class com.google.android.exoplayer2.** { *; }
-keep interface com.google.android.exoplayer2.** { *; }
-dontwarn com.google.android.exoplayer2.**

-keep class androidx.media3.** { *; }
-keep interface androidx.media3.** { *; }
-dontwarn androidx.media3.**

-keep class io.flutter.plugins.videoplayer.** { *; }
-dontwarn io.flutter.plugins.videoplayer.**

# Audio Players
-keep class xyz.luan.audioplayers.** { *; }
-dontwarn xyz.luan.audioplayers.**
-keep class com.ryanheise.audioservice.** { *; }
-dontwarn com.ryanheise.audioservice.**

# Network & OkHttp / HttpURLConnection
-keep class okhttp3.** { *; }
-dontwarn okhttp3.**
-keep class com.google.gson.** { *; }
-dontwarn com.google.gson.**


