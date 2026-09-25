const { withAppDelegate, withInfoPlist } = require("@expo/config-plugins");

/**
 * Ciclo de vida por cenas (UIScene) no iOS.
 *
 * O iPadOS/iOS 27 derruba na abertura o app compilado com o SDK atual que ainda cria a janela
 * no AppDelegate (foi o motivo da rejeição da 1.0.9 pela Apple). O Expo 57 já traz o delegate
 * de cenas (`ExpoAppSceneDelegate`), mas o modelo do `expo prebuild` ainda gera o AppDelegate
 * antigo. Este plugin:
 *  1. declara a cena no Info.plist, apontando para o delegate de cenas do app;
 *  2. faz o AppDelegate só criar a fábrica do React Native (a janela passa a nascer na cena);
 *  3. declara o delegate de cenas no próprio AppDelegate.swift, para ficar no target do app.
 *
 * Quando o modelo oficial do Expo passar a gerar isso, este plugin vira no-op (ver checagens).
 */

const SCENE_DELEGATE_CLASS = "FirulaSceneDelegate";

function withSceneManifest(config) {
  return withInfoPlist(config, (c) => {
    c.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: "Default Configuration",
            UISceneDelegateClassName: SCENE_DELEGATE_CLASS,
          },
        ],
      },
    };
    return c;
  });
}

function patchAppDelegate(contents) {
  if (contents.includes("ExpoReactNativeFactoryProvider")) return contents; // já adaptado

  if (!/class AppDelegate: ExpoAppDelegate \{/.test(contents)) {
    throw new Error("[withSceneLifecycle] AppDelegate.swift com formato inesperado: revise o plugin.");
  }
  let next = contents.replace(
    "class AppDelegate: ExpoAppDelegate {",
    "class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {",
  );

  // A janela e o startReactNative saem daqui: quem cria a janela é a cena.
  const windowBlock = /\n#if os\(iOS\) \|\| os\(tvOS\)\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\n\s*factory\.startReactNative\([\s\S]*?\)\n#endif\n/;
  if (!windowBlock.test(next)) {
    throw new Error("[withSceneLifecycle] Bloco de criação da janela não encontrado no AppDelegate.swift.");
  }
  next = next.replace(
    windowBlock,
    "\n    // Ciclo de vida por cenas: a janela e o React Native começam em " +
      SCENE_DELEGATE_CLASS +
      " (withSceneLifecycle).\n",
  );

  next +=
    `
/// Delegate de cenas do app (declarado no Info.plist). Toda a lógica é do Expo:
/// cria a janela da cena, inicia o React Native e repassa links e eventos ao AppDelegate.
@objc(${SCENE_DELEGATE_CLASS})
class ${SCENE_DELEGATE_CLASS}: ExpoAppSceneDelegate {}
`;
  return next;
}

function withSceneAppDelegate(config) {
  return withAppDelegate(config, (c) => {
    if (c.modResults.language !== "swift") {
      throw new Error("[withSceneLifecycle] Esperado AppDelegate em Swift.");
    }
    c.modResults.contents = patchAppDelegate(c.modResults.contents);
    return c;
  });
}

module.exports = function withSceneLifecycle(config) {
  return withSceneAppDelegate(withSceneManifest(config));
};
module.exports.patchAppDelegate = patchAppDelegate;
