package com.YouPeak.Live1


//import io.flutter.embedding.android.FlutterActivity
import android.content.Context
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.embedding.android.FlutterFragmentActivity
import io.flutter.plugins.googlemobileads.GoogleMobileAdsPlugin


class MainActivity: FlutterFragmentActivity() {

    //class MainActivity : FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        // Explicitly register all plugins
        io.flutter.plugins.GeneratedPluginRegistrant.registerWith(flutterEngine)

        // Manual registration if missing (Fix for IllegalStateException in release mode)
        if (flutterEngine.plugins.get(GoogleMobileAdsPlugin::class.java) == null) {
            flutterEngine.plugins.add(GoogleMobileAdsPlugin())
        }

        if (flutterEngine.plugins.get(io.flutter.plugins.pathprovider.PathProviderPlugin::class.java) == null) {
            flutterEngine.plugins.add(io.flutter.plugins.pathprovider.PathProviderPlugin())
        }

        val context: Context = applicationContext

        GoogleMobileAdsPlugin.registerNativeAdFactory(flutterEngine, "medium", MediumNativeAdFactory(context))
        GoogleMobileAdsPlugin.registerNativeAdFactory(flutterEngine, "large", LargeNativeAdFactory(context))
        GoogleMobileAdsPlugin.registerNativeAdFactory(flutterEngine, "full", FullNativeAdFactory(context))
    }

    override fun cleanUpFlutterEngine(flutterEngine: FlutterEngine) {
        super.cleanUpFlutterEngine(flutterEngine)

        val context: Context = applicationContext

        GoogleMobileAdsPlugin.unregisterNativeAdFactory(flutterEngine, "medium")
        GoogleMobileAdsPlugin.unregisterNativeAdFactory(flutterEngine, "large")
        GoogleMobileAdsPlugin.unregisterNativeAdFactory(flutterEngine, "full")
    }
}

