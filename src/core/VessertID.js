/**
 * VessertID Core Namespace and Configuration
 */

class VessertID {
  static version = '1.0.0';
  static mode = 'zero-external';

  static info() {
    return {
      name: 'vessertid',
      version: VessertID.version,
      mode: VessertID.mode,
      fonts: 25,
      icons: 48
    };
  }
}

export { VessertID };
