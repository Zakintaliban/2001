import * as THREE from 'three';

/**
 * Physically based materials whose colors are bound to scene tokens.
 * `retheme(tokens)` re-applies every binding, so a theme switch never needs
 * to rebuild geometry.
 */
export function createMaterialKit(initialTokens) {
  const bindings = [];
  let tokens = initialTokens;

  const bind = (material, property, key) => {
    bindings.push({ material, property, key });
    material[property].set(tokens[key]);
    return material;
  };

  return {
    bind,

    /** Liquid chrome: full metal, near-mirror. Reflects the environment map. */
    chrome(options = {}) {
      return bind(
        new THREE.MeshPhysicalMaterial({ metalness: 1, roughness: 0.08, envMapIntensity: 1.15, ...options }),
        'color',
        'chrome',
      );
    },

    /** Glossy plastic with a clear coat, for plates, cases and cards. */
    plastic(key = 'plastic', options = {}) {
      return bind(
        new THREE.MeshPhysicalMaterial({
          metalness: 0,
          roughness: 0.38,
          clearcoat: 1,
          clearcoatRoughness: 0.06,
          ...options,
        }),
        'color',
        key,
      );
    },

    /** Thin-film iridescence for highlights: packets, gates, checker orbs. */
    iridescent(key = 'chrome', options = {}) {
      return bind(
        new THREE.MeshPhysicalMaterial({
          metalness: 0.35,
          roughness: 0.12,
          iridescence: 1,
          iridescenceIOR: 1.35,
          iridescenceThicknessRange: [140, 520],
          clearcoat: 1,
          clearcoatRoughness: 0.04,
          ...options,
        }),
        'color',
        key,
      );
    },

    /** Emissive light: status LEDs, alarms, packets. Bright enough to bloom. */
    glow(key, intensity = 1.6, options = {}) {
      const material = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.4,
        emissiveIntensity: intensity,
        ...options,
      });
      material.userData.bloom = true;
      return bind(material, 'emissive', key);
    },

    retheme(next) {
      tokens = next;
      for (const { material, property, key } of bindings) material[property].set(tokens[key]);
    },

    dispose() {
      for (const { material } of bindings) material.dispose();
      bindings.length = 0;
    },
  };
}
