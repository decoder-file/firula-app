const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Adds `use_modular_headers!` globally in the generated Podfile.
 * Required by @react-native-google-signin/google-signin v16+ which pulls in
 * AppCheckCore (a Swift pod) that needs GoogleUtilities and RecaptchaInterop
 * to expose modular headers.
 */
module.exports = function withGoogleSignInPodfile(config) {
  return withDangerousMod(config, [
    "ios",
    async (c) => {
      const podfilePath = path.join(c.modRequest.platformProjectRoot, "Podfile");
      let podfile = fs.readFileSync(podfilePath, "utf-8");

      if (!podfile.includes("use_modular_headers!")) {
        // Insert on the line right after `platform :ios, ...`
        podfile = podfile.replace(
          /(platform :ios[^\n]*\n)/,
          "$1\nuse_modular_headers!\n",
        );
        fs.writeFileSync(podfilePath, podfile);
      }

      return c;
    },
  ]);
};
