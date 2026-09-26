import ExpoModulesCore
import PassKit

public class WalletPassModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WalletPass")

    Function("canAddPasses") {
      return PKAddPassesViewController.canAddPasses()
    }

    // Resolves "presented" when the add sheet is shown, or "alreadyAdded" when the pass
    // is already in Wallet (in which case Wallet is opened on that pass).
    AsyncFunction("addPassFromUrl") { (url: URL) async throws -> String in
      NSLog("[WalletPass] downloading %@", url.absoluteString)
      // Sem cache: o backend grava o passe sempre no mesmo endereço.
      var request = URLRequest(url: url)
      request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData
      let data: Data
      let response: URLResponse
      do {
        (data, response) = try await URLSession.shared.data(for: request)
      } catch {
        NSLog("[WalletPass] download error: %@", String(describing: error))
        throw Exception(name: "ERR_PASS_DOWNLOAD", description: "Pass download failed: \(error.localizedDescription)")
      }
      let http = response as? HTTPURLResponse
      NSLog("[WalletPass] downloaded %d bytes, HTTP %d, content-type %@", data.count, http?.statusCode ?? -1, http?.value(forHTTPHeaderField: "Content-Type") ?? "?")
      if let http = http, http.statusCode != 200 {
        throw Exception(name: "ERR_PASS_DOWNLOAD", description: "Pass download failed with HTTP \(http.statusCode)")
      }

      let pass: PKPass
      do {
        pass = try PKPass(data: data)
      } catch {
        let nsError = error as NSError
        NSLog("[WalletPass] invalid pass: domain=%@ code=%d %@ userInfo=%@", nsError.domain, nsError.code, nsError.localizedDescription, String(describing: nsError.userInfo))
        throw Exception(name: "ERR_PASS_INVALID", description: "Invalid pass (\(nsError.domain) \(nsError.code)): \(nsError.localizedDescription)")
      }

      let appContext = self.appContext
      return try await MainActor.run {
        if PKPassLibrary().containsPass(pass) {
          if let passURL = pass.passURL {
            UIApplication.shared.open(passURL)
          }
          return "alreadyAdded"
        }
        guard let addController = PKAddPassesViewController(pass: pass),
              let presenter = appContext?.utilities?.currentViewController() else {
          NSLog("[WalletPass] unable to present add sheet")
          throw Exception(name: "ERR_PASS_PRESENT", description: "Unable to present the Wallet add sheet")
        }
        presenter.present(addController, animated: true)
        return "presented"
      }
    }
  }
}
