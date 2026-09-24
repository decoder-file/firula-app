const { withAppBuildGradle, withGradleProperties } = require("@expo/config-plugins");

const JVM_ARGS = "-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError";

// Secrets stay in credentials.json (EAS local-credentials format) and are read at Gradle time.
const RELEASE_SIGNING = `
        release {
            def credsFile = rootProject.file("../credentials.json")
            if (credsFile.exists()) {
                def ks = new groovy.json.JsonSlurper().parse(credsFile).android.keystore
                storeFile rootProject.file("../" + ks.keystorePath)
                storePassword ks.keystorePassword
                keyAlias ks.keyAlias
                keyPassword ks.keyPassword
            }
        }`;

function withReleaseSigning(config) {
  return withAppBuildGradle(config, (c) => {
    let gradle = c.modResults.contents;
    if (gradle.includes("credentials.json")) return c;

    const debugSigning = /(signingConfigs \{\s*\n\s*debug \{[^}]*\})/;
    const releaseUsesDebug =
      /(buildTypes \{[\s\S]*?release \{(?:\s*\/\/[^\n]*)*\s*)signingConfig signingConfigs\.debug/;
    if (!debugSigning.test(gradle) || !releaseUsesDebug.test(gradle)) {
      throw new Error("withAndroidReleaseSigning: build.gradle template changed, update the plugin");
    }

    gradle = gradle
      .replace(debugSigning, `$1${RELEASE_SIGNING}`)
      .replace(
        releaseUsesDebug,
        '$1signingConfig rootProject.file("../credentials.json").exists() ? signingConfigs.release : null',
      );
    c.modResults.contents = gradle;
    return c;
  });
}

function withJvmArgs(config) {
  return withGradleProperties(config, (c) => {
    const item = c.modResults.find((i) => i.type === "property" && i.key === "org.gradle.jvmargs");
    if (item) item.value = JVM_ARGS;
    else c.modResults.push({ type: "property", key: "org.gradle.jvmargs", value: JVM_ARGS });
    return c;
  });
}

module.exports = function withAndroidReleaseSigning(config) {
  return withJvmArgs(withReleaseSigning(config));
};
